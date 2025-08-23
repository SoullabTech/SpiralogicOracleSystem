// 🎼 ELEMENTAL ORCHESTRATOR SERVICE
// Pure orchestration service using event-driven patterns, no business logic

import { BaseEventHandler } from "../../core/events/EventHandlers";
import { eventBus, OracleEvent } from "../../core/events/EventBus";
import { 
  ORCHESTRATION_EVENTS, 
  AGENT_EVENTS,
  OrchestrationRoutingPayload,
  AgentProcessingPayload
} from "../../core/events/EventTypes";
import { ElementalBusinessLogic } from "./ElementalBusinessLogic";
import { logger } from "../../utils/logger";

interface OrchestrationRequest {
  requestId: string;
  input: string;
  userId: string;
  context?: any;
  userHistory?: any[];
}

interface OrchestrationResult {
  primaryAgent: string;
  secondaryAgent?: string;
  synthesis: string;
  archetypalBalance: {
    fire: number;
    water: number;
  };
  metadata: {
    orchestrationStrategy: string;
    wisdomVector: string;
    transformationGoal: string;
  };
}

export class ElementalOrchestratorService extends BaseEventHandler {
  private businessLogic: ElementalBusinessLogic;
  private activeRequests: Map<string, OrchestrationRequest> = new Map();
  private collectiveMemory: Map<string, any> = new Map();

  constructor() {
    super('ElementalOrchestratorService');
    this.businessLogic = new ElementalBusinessLogic();
    this.setupEventSubscriptions();
  }

  private setupEventSubscriptions(): void {
    // Listen for orchestration requests
    eventBus.subscribe({
      eventType: ORCHESTRATION_EVENTS.ELEMENT_ROUTING_REQUESTED,
      handler: this
    });

    // Listen for multi-agent synthesis requests
    eventBus.subscribe({
      eventType: ORCHESTRATION_EVENTS.MULTI_AGENT_SYNTHESIS_REQUESTED,
      handler: this
    });

    // Listen for agent completions to trigger synthesis
    eventBus.subscribe({
      eventType: AGENT_EVENTS.AGENT_PROCESSING_COMPLETED,
      handler: this
    });
  }

  protected async process(event: OracleEvent): Promise<void> {
    switch (event.type) {
      case ORCHESTRATION_EVENTS.ELEMENT_ROUTING_REQUESTED:
        await this.handleElementRouting(event);
        break;
        
      case ORCHESTRATION_EVENTS.MULTI_AGENT_SYNTHESIS_REQUESTED:
        await this.handleMultiAgentSynthesis(event);
        break;
        
      case AGENT_EVENTS.AGENT_PROCESSING_COMPLETED:
        await this.handleAgentCompletion(event);
        break;
        
      default:
        logger.warn(`Unhandled event type: ${event.type}`);
    }
  }

  /**
   * Public method for direct orchestration (backward compatibility)
   */
  async processQuery(input: string, userContext?: any): Promise<OrchestrationResult> {
    const requestId = `orchestration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const request: OrchestrationRequest = {
      requestId,
      input,
      userId: userContext?.userId || 'anonymous',
      context: userContext,
      userHistory: userContext?.previousInteractions || []
    };

    return await this.orchestrateElementalResponse(request);
  }

  // Event handlers

  private async handleElementRouting(event: OracleEvent): Promise<void> {
    const { input, userId, requestId, context } = event.payload;
    
    const request: OrchestrationRequest = {
      requestId,
      input,
      userId,
      context,
      userHistory: context?.userHistory || []
    };

    this.activeRequests.set(requestId, request);

    try {
      const result = await this.orchestrateElementalResponse(request);
      
      // Publish orchestration completed
      await eventBus.publish({
        type: ORCHESTRATION_EVENTS.ORCHESTRATION_COMPLETED,
        source: this.handlerName,
        payload: {
          requestId,
          userId,
          result,
          completedAt: new Date().toISOString()
        },
        correlationId: event.correlationId,
        userId,
        sessionId: event.sessionId
      });

    } catch (error) {
      logger.error(`Orchestration failed for request ${requestId}:`, error);
    } finally {
      this.activeRequests.delete(requestId);
    }
  }

  private async handleMultiAgentSynthesis(event: OracleEvent): Promise<void> {
    const { requestId, agentResponses, intent, strategy } = event.payload;
    
    try {
      // Use business logic to synthesize responses
      const synthesis = await this.businessLogic.synthesizeAgentResponses(
        agentResponses,
        intent,
        strategy
      );

      // Publish synthesis result
      await eventBus.publish({
        type: ORCHESTRATION_EVENTS.ORCHESTRATION_COMPLETED,
        source: this.handlerName,
        payload: {
          requestId,
          userId: event.userId,
          synthesis,
          completedAt: new Date().toISOString()
        },
        correlationId: event.correlationId,
        userId: event.userId,
        sessionId: event.sessionId
      });

    } catch (error) {
      logger.error(`Synthesis failed for request ${requestId}:`, error);
    }
  }

  private async handleAgentCompletion(event: OracleEvent): Promise<void> {
    const payload = event.payload as AgentProcessingPayload;
    const { requestId, userId } = payload;

    // Check if this is part of an active orchestration
    const request = this.activeRequests.get(requestId);
    if (!request) return;

    // For now, single agent completion ends the orchestration
    // In the future, this could handle multi-agent coordination
    
    logger.info(`Agent completion received for orchestrated request ${requestId}`);
  }

  // Core orchestration logic

  private async orchestrateElementalResponse(
    request: OrchestrationRequest
  ): Promise<OrchestrationResult> {
    // 1. Analyze archetypal intent using business logic
    const intent = this.businessLogic.analyzeArchetypalIntent(request.input);
    
    // 2. Get user context from collective memory
    const userContext = this.getOrCreateUserContext(request.userId);
    
    // 3. Determine orchestration strategy
    const strategy = this.businessLogic.determineOrchestrationStrategy(
      intent,
      userContext,
      request.userHistory || []
    );

    // 4. Route to appropriate agent(s) via events
    const agentResponses = await this.routeToAgents(request, intent, strategy);

    // 5. Synthesize responses using business logic
    const result = await this.businessLogic.synthesizeAgentResponses(
      agentResponses,
      intent,
      strategy
    );

    // 6. Update collective memory
    this.updateCollectiveMemory(request, agentResponses, result);

    // 7. Log orchestration result
    logger.info('Elemental orchestration completed', {
      requestId: request.requestId,
      userId: request.userId,
      strategy,
      primaryAgent: result.primaryAgent,
      secondaryAgent: result.secondaryAgent
    });

    return result;
  }

  private async routeToAgents(
    request: OrchestrationRequest,
    intent: any,
    strategy: string
  ): Promise<Record<string, any>> {
    const responses: Record<string, any> = {};

    // Determine which agents to involve
    const agentsToInvolve = this.businessLogic.determineRequiredAgents(
      intent,
      strategy
    );

    // Route to each agent via events
    for (const agentType of agentsToInvolve) {
      try {
        const agentRequestId = `${request.requestId}_${agentType}`;
        
        // Publish agent processing event
        await eventBus.publish({
          type: AGENT_EVENTS.AGENT_PROCESSING_STARTED,
          source: this.handlerName,
          payload: {
            agentType: `${agentType}_agent`,
            agentId: agentRequestId,
            userId: request.userId,
            requestId: agentRequestId,
            element: agentType,
            input: request.input,
            context: {
              ...request.context,
              orchestrationStrategy: strategy,
              archetypalIntent: intent
            }
          } as AgentProcessingPayload & { input: string, context: any },
          userId: request.userId
        });

        // For backward compatibility, also call agents directly
        // This would be removed once full event-driven flow is implemented
        if (agentType === 'fire') {
          responses.fire = await this.callFireAgentDirect(request.input);
        } else if (agentType === 'water') {
          responses.water = await this.callWaterAgentDirect(request.input);
        }

      } catch (error) {
        logger.error(`Failed to route to ${agentType} agent:`, error);
      }
    }

    return responses;
  }

  private getOrCreateUserContext(userId: string): any {
    if (!this.collectiveMemory.has(userId)) {
      this.collectiveMemory.set(userId, {
        interactions: [],
        archetypalPatterns: [],
        emergentWisdom: []
      });
    }
    return this.collectiveMemory.get(userId);
  }

  private updateCollectiveMemory(
    request: OrchestrationRequest,
    responses: Record<string, any>,
    result: OrchestrationResult
  ): void {
    const userContext = this.getOrCreateUserContext(request.userId);
    
    userContext.interactions.push({
      input: request.input,
      responses,
      synthesis: result.synthesis,
      strategy: result.metadata.orchestrationStrategy,
      timestamp: new Date().toISOString()
    });

    userContext.archetypalPatterns.push({
      primary: result.primaryAgent,
      secondary: result.secondaryAgent,
      balance: result.archetypalBalance
    });

    // Limit memory size
    if (userContext.interactions.length > 20) {
      userContext.interactions = userContext.interactions.slice(-15);
    }

    if (userContext.archetypalPatterns.length > 50) {
      userContext.archetypalPatterns = userContext.archetypalPatterns.slice(-30);
    }
  }

  // Interface methods for backward compatibility

  async routeToElement(element: string, query: any): Promise<any> {
    const requestId = `direct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await eventBus.publish({
      type: AGENT_EVENTS.AGENT_PROCESSING_STARTED,
      source: this.handlerName,
      payload: {
        agentType: `${element}_agent`,
        agentId: requestId,
        userId: query.userId || 'anonymous',
        requestId,
        element,
        input: query.input || query,
        context: query.context || {}
      } as AgentProcessingPayload & { input: string, context: any },
      userId: query.userId || 'anonymous'
    });

    // Return immediate response for backward compatibility
    return { routed: true, element, requestId };
  }

  async detectElementalNeed(input: string, context?: any): Promise<string> {
    const intent = this.businessLogic.analyzeArchetypalIntent(input);
    return intent.primary;
  }

  getAvailableElements(): string[] {
    return this.businessLogic.getAvailableElements();
  }

  async getArchetypalInsights(userContext?: any) {
    const userId = userContext?.userId || 'anonymous';
    const sessionMemory = this.collectiveMemory.get(userId);
    
    if (!sessionMemory) {
      return this.businessLogic.getDefaultArchetypalInsights();
    }

    return this.businessLogic.calculateArchetypalInsights(
      sessionMemory.archetypalPatterns,
      sessionMemory.interactions
    );
  }

  // Temporary direct agent calls for backward compatibility
  // These would be removed once full event-driven flow is implemented
  private async callFireAgentDirect(input: string): Promise<any> {
    // This would be replaced by waiting for agent completion event
    return {
      message: "Fire energy activated through direct call",
      element: "fire",
      confidence: 0.8
    };
  }

  private async callWaterAgentDirect(input: string): Promise<any> {
    // This would be replaced by waiting for agent completion event
    return {
      message: "Water wisdom flows through direct call",
      element: "water",
      confidence: 0.8
    };
  }

  // Public methods for monitoring

  getActiveRequestCount(): number {
    return this.activeRequests.size;
  }

  getCollectiveMemoryStats(): any {
    return {
      totalUsers: this.collectiveMemory.size,
      totalInteractions: Array.from(this.collectiveMemory.values())
        .reduce((sum, context) => sum + context.interactions.length, 0)
    };
  }
}