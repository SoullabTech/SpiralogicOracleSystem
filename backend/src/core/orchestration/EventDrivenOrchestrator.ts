// 🎼 EVENT-DRIVEN ORCHESTRATOR - Pure orchestration logic without service dependencies
// Handles routing, coordination, and synthesis through events only

import { eventBus, EventHandler, OracleEvent } from '../events/EventBus';
import { 
  QUERY_EVENTS, 
  ORCHESTRATION_EVENTS, 
  AGENT_EVENTS,
  QueryReceivedPayload,
  OrchestrationRoutingPayload,
  AgentProcessingPayload
} from '../events/EventTypes';
import { BaseEventHandler } from '../events/EventHandlers';
import { logger } from '../../utils/logger';

export interface OrchestrationConfig {
  enableMultiAgentSynthesis: boolean;
  enableAdaptiveRouting: boolean;
  enableCollectiveWisdom: boolean;
  defaultConfidenceThreshold: number;
}

export interface RoutingDecision {
  primaryAgent: string;
  secondaryAgent?: string;
  reasoning: string;
  confidence: number;
  element?: string;
  archetype?: string;
  synthesisStrategy?: string;
}

export interface OrchestrationContext {
  userId: string;
  requestId: string;
  sessionHistory?: any[];
  userPattern?: any;
  elementalPreferences?: Record<string, number>;
  archetypalContext?: any;
}

export class EventDrivenOrchestrator extends BaseEventHandler {
  private config: OrchestrationConfig;
  private activeRequests: Map<string, OrchestrationContext> = new Map();
  private routingHistory: Map<string, RoutingDecision[]> = new Map();

  constructor(config: Partial<OrchestrationConfig> = {}) {
    super('EventDrivenOrchestrator');
    
    this.config = {
      enableMultiAgentSynthesis: true,
      enableAdaptiveRouting: true,
      enableCollectiveWisdom: false,
      defaultConfidenceThreshold: 0.7,
      ...config
    };

    this.setupEventSubscriptions();
  }

  private setupEventSubscriptions(): void {
    // Subscribe to query events
    eventBus.subscribe({
      eventType: QUERY_EVENTS.QUERY_RECEIVED,
      handler: this
    });

    // Subscribe to agent completion events for synthesis
    eventBus.subscribe({
      eventType: AGENT_EVENTS.AGENT_PROCESSING_COMPLETED,
      handler: this
    });

    // Subscribe to elemental analysis requests
    eventBus.subscribe({
      eventType: QUERY_EVENTS.ELEMENTAL_ANALYSIS_REQUESTED,
      handler: this
    });

    // Subscribe to archetypal analysis requests
    eventBus.subscribe({
      eventType: QUERY_EVENTS.ARCHETYPAL_ANALYSIS_REQUESTED,
      handler: this
    });
  }

  protected async process(event: OracleEvent): Promise<void> {
    switch (event.type) {
      case QUERY_EVENTS.QUERY_RECEIVED:
        await this.handleQueryReceived(event);
        break;
      
      case AGENT_EVENTS.AGENT_PROCESSING_COMPLETED:
        await this.handleAgentCompleted(event);
        break;
        
      case QUERY_EVENTS.ELEMENTAL_ANALYSIS_REQUESTED:
        await this.handleElementalAnalysisRequest(event);
        break;
        
      case QUERY_EVENTS.ARCHETYPAL_ANALYSIS_REQUESTED:
        await this.handleArchetypalAnalysisRequest(event);
        break;
        
      default:
        logger.warn(`[${this.handlerName}] Unhandled event type: ${event.type}`);
    }
  }

  private async handleQueryReceived(event: OracleEvent): Promise<void> {
    const payload = event.payload as QueryReceivedPayload;
    const { userId, input, requestId } = payload;

    logger.info(`[Orchestrator] Processing query for user ${userId}: ${input.substring(0, 50)}...`);

    // Start orchestration
    await eventBus.publish({
      type: ORCHESTRATION_EVENTS.ORCHESTRATION_STARTED,
      source: 'EventDrivenOrchestrator',
      payload: { userId, requestId, input },
      correlationId: event.correlationId,
      userId,
      sessionId: event.sessionId
    });

    // Create orchestration context
    const context: OrchestrationContext = {
      userId,
      requestId,
      sessionHistory: await this.getSessionHistory(userId),
      userPattern: await this.getUserPattern(userId),
      elementalPreferences: await this.getElementalPreferences(userId)
    };

    this.activeRequests.set(requestId, context);

    // Analyze and route
    const routingDecision = await this.analyzeAndRoute(input, context);
    
    // Store routing decision
    if (!this.routingHistory.has(userId)) {
      this.routingHistory.set(userId, []);
    }
    this.routingHistory.get(userId)!.push(routingDecision);

    // Publish routing decision
    await eventBus.publish({
      type: ORCHESTRATION_EVENTS.ORCHESTRATION_ROUTING_DECISION,
      source: 'EventDrivenOrchestrator',
      payload: {
        userId,
        requestId,
        routingDecision
      } as OrchestrationRoutingPayload,
      correlationId: event.correlationId,
      userId,
      sessionId: event.sessionId
    });

    // Trigger agent processing
    await this.triggerAgentProcessing(routingDecision, input, context, event);
  }

  private async analyzeAndRoute(input: string, context: OrchestrationContext): Promise<RoutingDecision> {
    // Elemental analysis
    const elementalNeed = this.detectElementalNeed(input, context);
    
    // Archetypal analysis
    const archetypalContext = this.detectArchetypalContext(input, context);
    
    // Adaptive routing based on history
    const adaptiveFactors = this.config.enableAdaptiveRouting 
      ? this.analyzeAdaptiveFactors(context)
      : null;

    // Determine primary agent
    const primaryAgent = this.selectPrimaryAgent(elementalNeed, archetypalContext, adaptiveFactors);
    
    // Determine if secondary agent needed
    const secondaryAgent = this.config.enableMultiAgentSynthesis 
      ? this.selectSecondaryAgent(primaryAgent, elementalNeed, archetypalContext)
      : undefined;

    // Calculate confidence
    const confidence = this.calculateRoutingConfidence(
      elementalNeed, 
      archetypalContext, 
      adaptiveFactors
    );

    // Generate reasoning
    const reasoning = this.generateRoutingReasoning(
      primaryAgent,
      secondaryAgent,
      elementalNeed,
      archetypalContext,
      confidence
    );

    return {
      primaryAgent,
      secondaryAgent,
      reasoning,
      confidence,
      element: elementalNeed.element,
      archetype: archetypalContext.archetype,
      synthesisStrategy: secondaryAgent ? this.determineSynthesisStrategy(primaryAgent, secondaryAgent) : undefined
    };
  }

  private detectElementalNeed(input: string, context: OrchestrationContext): any {
    const lowerInput = input.toLowerCase();
    
    // Fire indicators
    const fireScore = this.calculateKeywordScore(lowerInput, [
      'action', 'energy', 'passion', 'create', 'transform', 'power', 'courage'
    ]);
    
    // Water indicators  
    const waterScore = this.calculateKeywordScore(lowerInput, [
      'emotion', 'feeling', 'heart', 'flow', 'intuition', 'heal', 'connect'
    ]);
    
    // Earth indicators
    const earthScore = this.calculateKeywordScore(lowerInput, [
      'practical', 'ground', 'stability', 'work', 'money', 'health', 'routine'
    ]);
    
    // Air indicators
    const airScore = this.calculateKeywordScore(lowerInput, [
      'think', 'mind', 'clarity', 'communicate', 'understand', 'analyze'
    ]);

    const scores = { fire: fireScore, water: waterScore, earth: earthScore, air: airScore };
    const dominant = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)[0];
    
    return {
      element: dominant,
      scores,
      confidence: scores[dominant] || 0.5
    };
  }

  private detectArchetypalContext(input: string, context: OrchestrationContext): any {
    // Simple archetype detection based on context and patterns
    const archetypes = ['seeker', 'warrior', 'sage', 'lover', 'creator', 'destroyer', 'ruler'];
    
    // Default to seeker for now - this would be enhanced with ML/pattern recognition
    return {
      archetype: 'seeker',
      confidence: 0.6,
      stage: 'exploration'
    };
  }

  private analyzeAdaptiveFactors(context: OrchestrationContext): any {
    const history = this.routingHistory.get(context.userId) || [];
    
    if (history.length === 0) {
      return null;
    }

    // Analyze recent routing patterns
    const recentDecisions = history.slice(-5);
    const elementCounts = recentDecisions.reduce((counts, decision) => {
      if (decision.element) {
        counts[decision.element] = (counts[decision.element] || 0) + 1;
      }
      return counts;
    }, {} as Record<string, number>);

    // Determine if user needs variety
    const mostUsedElement = Object.entries(elementCounts)
      .sort(([,a], [,b]) => b - a)[0];
    
    const needsVariety = mostUsedElement && mostUsedElement[1] > 2;

    return {
      elementCounts,
      mostUsedElement: mostUsedElement?.[0],
      needsVariety,
      recentPatterns: recentDecisions.map(d => d.primaryAgent)
    };
  }

  private selectPrimaryAgent(elementalNeed: any, archetypalContext: any, adaptiveFactors: any): string {
    // Apply adaptive routing
    if (adaptiveFactors?.needsVariety && adaptiveFactors.mostUsedElement) {
      // Route to a different element for variety
      const alternatives = ['fire', 'water', 'earth', 'air'].filter(e => e !== adaptiveFactors.mostUsedElement);
      return `${alternatives[0]}_agent`;
    }

    // Default elemental routing
    return `${elementalNeed.element}_agent`;
  }

  private selectSecondaryAgent(primaryAgent: string, elementalNeed: any, archetypalContext: any): string | undefined {
    const primary = primaryAgent.replace('_agent', '');
    
    // Complementary element pairing
    const complementaryPairs: Record<string, string> = {
      fire: 'water',
      water: 'fire', 
      earth: 'air',
      air: 'earth'
    };

    const complement = complementaryPairs[primary];
    return complement ? `${complement}_agent` : undefined;
  }

  private calculateRoutingConfidence(elementalNeed: any, archetypalContext: any, adaptiveFactors: any): number {
    let confidence = elementalNeed.confidence || 0.5;
    
    // Boost confidence if archetypal context is strong
    if (archetypalContext.confidence > 0.8) {
      confidence += 0.1;
    }
    
    // Reduce confidence if overriding for variety
    if (adaptiveFactors?.needsVariety) {
      confidence -= 0.2;
    }
    
    return Math.max(0.1, Math.min(1.0, confidence));
  }

  private generateRoutingReasoning(
    primaryAgent: string, 
    secondaryAgent: string | undefined, 
    elementalNeed: any, 
    archetypalContext: any, 
    confidence: number
  ): string {
    const reasons = [];
    
    reasons.push(`Primary ${elementalNeed.element} energy detected (confidence: ${confidence.toFixed(2)})`);
    
    if (secondaryAgent) {
      reasons.push(`Secondary ${secondaryAgent.replace('_agent', '')} agent for synthesis`);
    }
    
    if (archetypalContext.archetype !== 'seeker') {
      reasons.push(`${archetypalContext.archetype} archetype influences routing`);
    }

    return reasons.join('; ');
  }

  private determineSynthesisStrategy(primaryAgent: string, secondaryAgent: string): string {
    const primary = primaryAgent.replace('_agent', '');
    const secondary = secondaryAgent.replace('_agent', '');
    
    return `${primary}_${secondary}_synthesis`;
  }

  private async triggerAgentProcessing(
    routingDecision: RoutingDecision, 
    input: string, 
    context: OrchestrationContext,
    originalEvent: OracleEvent
  ): Promise<void> {
    // Trigger primary agent
    await eventBus.publish({
      type: AGENT_EVENTS.AGENT_PROCESSING_STARTED,
      source: 'EventDrivenOrchestrator',
      payload: {
        agentType: routingDecision.primaryAgent,
        agentId: `${routingDecision.primaryAgent}_${Date.now()}`,
        userId: context.userId,
        requestId: context.requestId,
        element: routingDecision.element,
        archetype: routingDecision.archetype,
        input,
        context
      } as AgentProcessingPayload & { input: string, context: any },
      correlationId: originalEvent.correlationId,
      userId: context.userId,
      sessionId: originalEvent.sessionId
    });

    // Trigger secondary agent if needed
    if (routingDecision.secondaryAgent) {
      await eventBus.publish({
        type: AGENT_EVENTS.AGENT_PROCESSING_STARTED,
        source: 'EventDrivenOrchestrator',
        payload: {
          agentType: routingDecision.secondaryAgent,
          agentId: `${routingDecision.secondaryAgent}_${Date.now()}`,
          userId: context.userId,
          requestId: context.requestId,
          element: routingDecision.element,
          archetype: routingDecision.archetype,
          input,
          context,
          role: 'secondary'
        } as AgentProcessingPayload & { input: string, context: any, role: string },
        correlationId: originalEvent.correlationId,
        userId: context.userId,
        sessionId: originalEvent.sessionId
      });
    }
  }

  private async handleAgentCompleted(event: OracleEvent): Promise<void> {
    const payload = event.payload as AgentProcessingPayload;
    const { requestId, userId } = payload;

    const context = this.activeRequests.get(requestId);
    if (!context) {
      logger.warn(`[Orchestrator] No context found for completed request: ${requestId}`);
      return;
    }

    logger.info(`[Orchestrator] Agent processing completed for request ${requestId}`);

    // Check if this completes the orchestration
    // For now, we'll assume single agent completion ends the orchestration
    await eventBus.publish({
      type: ORCHESTRATION_EVENTS.ORCHESTRATION_COMPLETED,
      source: 'EventDrivenOrchestrator',
      payload: {
        userId,
        requestId,
        completedAt: new Date().toISOString()
      },
      correlationId: event.correlationId,
      userId,
      sessionId: event.sessionId
    });

    // Clean up
    this.activeRequests.delete(requestId);
  }

  private async handleElementalAnalysisRequest(event: OracleEvent): Promise<void> {
    const { userId, input } = event.payload;
    logger.info(`[Orchestrator] Elemental analysis requested for user ${userId}`);
    
    // This would trigger specialized elemental analysis
    // For now, just acknowledge
  }

  private async handleArchetypalAnalysisRequest(event: OracleEvent): Promise<void> {
    const { userId, input } = event.payload;
    logger.info(`[Orchestrator] Archetypal analysis requested for user ${userId}`);
    
    // This would trigger specialized archetypal analysis
    // For now, just acknowledge  
  }

  // Helper methods (these would integrate with actual services via events)
  private async getSessionHistory(userId: string): Promise<any[]> {
    // This would emit an event to request session history
    return [];
  }

  private async getUserPattern(userId: string): Promise<any> {
    // This would emit an event to request user pattern
    return {};
  }

  private async getElementalPreferences(userId: string): Promise<Record<string, number>> {
    // This would emit an event to request elemental preferences
    return {};
  }

  private calculateKeywordScore(text: string, keywords: string[]): number {
    const words = text.split(/\s+/);
    const matches = words.filter(word => 
      keywords.some(keyword => word.includes(keyword) || keyword.includes(word))
    );
    return matches.length / words.length;
  }

  // Public methods for monitoring and management
  public getActiveRequests(): string[] {
    return Array.from(this.activeRequests.keys());
  }

  public getRoutingHistory(userId: string): RoutingDecision[] {
    return this.routingHistory.get(userId) || [];
  }

  public getOrchestrationStats(): any {
    return {
      activeRequests: this.activeRequests.size,
      totalUsers: this.routingHistory.size,
      config: this.config
    };
  }
}