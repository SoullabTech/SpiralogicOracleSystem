// 🤖 EVENT-DRIVEN AGENT BASE CLASS
// Base class for agents that communicate via events instead of direct calls

import { eventBus, EventHandler, OracleEvent } from '../events/EventBus';
import { 
  AGENT_EVENTS, 
  MEMORY_EVENTS, 
  WISDOM_EVENTS,
  VOICE_EVENTS,
  AgentProcessingPayload,
  MemoryStoredPayload,
  WisdomSynthesisPayload
} from '../events/EventTypes';
import { BaseEventHandler } from '../events/EventHandlers';
import { logger } from '../../utils/logger';

export interface AgentIdentity {
  id: string;
  name: string;
  element?: string;
  archetype?: string;
  version: string;
  capabilities: string[];
}

export interface AgentRequest {
  requestId: string;
  input: string;
  context?: any;
  userId: string;
  sessionId?: string;
  correlationId?: string;
}

export interface AgentResponse {
  requestId: string;
  response: string;
  confidence: number;
  element?: string;
  voice?: string;
  metadata?: Record<string, unknown>;
  wisdom?: string;
  insights?: string[];
}

export abstract class EventDrivenAgent extends BaseEventHandler {
  protected identity: AgentIdentity;
  protected isProcessing: boolean = false;
  protected activeRequests: Map<string, AgentRequest> = new Map();

  constructor(identity: AgentIdentity) {
    super(`Agent_${identity.name}`);
    this.identity = identity;
    this.setupEventSubscriptions();
  }

  private setupEventSubscriptions(): void {
    // Subscribe to agent processing events targeting this agent
    eventBus.subscribe({
      eventType: AGENT_EVENTS.AGENT_PROCESSING_STARTED,
      handler: this,
      filter: (event: OracleEvent) => {
        const payload = event.payload as AgentProcessingPayload;
        return this.shouldHandleRequest(payload);
      }
    });
  }

  protected async process(event: OracleEvent): Promise<void> {
    switch (event.type) {
      case AGENT_EVENTS.AGENT_PROCESSING_STARTED:
        await this.handleProcessingRequest(event);
        break;
      default:
        logger.warn(`[${this.handlerName}] Unhandled event type: ${event.type}`);
    }
  }

  private shouldHandleRequest(payload: AgentProcessingPayload): boolean {
    // Check if this agent should handle the request based on agent type
    const targetAgentType = payload.agentType;
    return this.matchesAgentType(targetAgentType);
  }

  protected abstract matchesAgentType(agentType: string): boolean;

  private async handleProcessingRequest(event: OracleEvent): Promise<void> {
    const payload = event.payload as AgentProcessingPayload & { input: string, context: any };
    const { requestId, userId, input, context } = payload;

    logger.info(`[${this.handlerName}] Processing request ${requestId} for user ${userId}`);

    const request: AgentRequest = {
      requestId,
      input,
      context,
      userId,
      sessionId: event.sessionId,
      correlationId: event.correlationId
    };

    this.activeRequests.set(requestId, request);
    this.isProcessing = true;

    try {
      // Process the request
      const response = await this.processRequest(request);
      
      // Store the response as memory
      await this.storeResponseMemory(request, response);
      
      // Synthesize wisdom if applicable
      await this.synthesizeWisdom(request, response);
      
      // Generate voice if applicable
      await this.generateVoice(request, response);
      
      // Publish completion event
      await eventBus.publish({
        type: AGENT_EVENTS.AGENT_PROCESSING_COMPLETED,
        source: this.identity.name,
        payload: {
          agentType: this.identity.name,
          agentId: this.identity.id,
          userId,
          requestId,
          response,
          element: this.identity.element,
          archetype: this.identity.archetype
        } as AgentProcessingPayload & { response: AgentResponse },
        correlationId: event.correlationId,
        userId,
        sessionId: event.sessionId
      });

      logger.info(`[${this.handlerName}] Successfully completed request ${requestId}`);

    } catch (error) {
      logger.error(`[${this.handlerName}] Failed to process request ${requestId}:`, error);
      
      // Publish failure event
      await eventBus.publish({
        type: AGENT_EVENTS.AGENT_PROCESSING_FAILED,
        source: this.identity.name,
        payload: {
          agentType: this.identity.name,
          agentId: this.identity.id,
          userId,
          requestId,
          error: error.message,
          element: this.identity.element,
          archetype: this.identity.archetype
        } as AgentProcessingPayload & { error: string },
        correlationId: event.correlationId,
        userId,
        sessionId: event.sessionId
      });
    } finally {
      this.activeRequests.delete(requestId);
      this.isProcessing = false;
    }
  }

  // Abstract method that subclasses must implement
  protected abstract processRequest(request: AgentRequest): Promise<AgentResponse>;

  // Event-driven helper methods
  protected async storeResponseMemory(request: AgentRequest, response: AgentResponse): Promise<void> {
    if (response.response && response.response.length > 0) {
      await eventBus.publish({
        type: MEMORY_EVENTS.MEMORY_STORED,
        source: this.identity.name,
        payload: {
          userId: request.userId,
          memoryId: `${request.requestId}_response`,
          content: response.response,
          element: this.identity.element,
          tags: [this.identity.name, 'agent_response'],
          context: {
            requestId: request.requestId,
            confidence: response.confidence,
            agentType: this.identity.name
          }
        } as MemoryStoredPayload,
        correlationId: request.correlationId,
        userId: request.userId,
        sessionId: request.sessionId
      });
    }
  }

  protected async synthesizeWisdom(request: AgentRequest, response: AgentResponse): Promise<void> {
    if (response.wisdom || response.insights?.length > 0) {
      await eventBus.publish({
        type: WISDOM_EVENTS.WISDOM_SYNTHESIS_REQUESTED,
        source: this.identity.name,
        payload: {
          userId: request.userId,
          requestId: request.requestId,
          sources: [this.identity.name],
          synthesisType: 'individual',
          wisdom: response.wisdom || response.insights?.join('; ') || '',
          confidence: response.confidence
        } as WisdomSynthesisPayload,
        correlationId: request.correlationId,
        userId: request.userId,
        sessionId: request.sessionId
      });
    }
  }

  protected async generateVoice(request: AgentRequest, response: AgentResponse): Promise<void> {
    if (response.voice && response.response) {
      await eventBus.publish({
        type: VOICE_EVENTS.VOICE_SYNTHESIS_REQUESTED,
        source: this.identity.name,
        payload: {
          userId: request.userId,
          text: response.response,
          voiceProfile: response.voice
        },
        correlationId: request.correlationId,
        userId: request.userId,
        sessionId: request.sessionId
      });
    }
  }

  // Request other agent capabilities via events
  protected async requestMemoryRetrieval(userId: string, query: string, limit: number = 10): Promise<void> {
    await eventBus.publish({
      type: MEMORY_EVENTS.MEMORY_RETRIEVED,
      source: this.identity.name,
      payload: {
        userId,
        query,
        limit,
        requestedBy: this.identity.name
      },
      userId
    });
  }

  protected async requestPatternDetection(userId: string, content: string): Promise<void> {
    await eventBus.publish({
      type: MEMORY_EVENTS.PATTERN_DETECTED,
      source: this.identity.name,
      payload: {
        userId,
        content,
        analysisType: 'agent_driven',
        requestedBy: this.identity.name
      },
      userId
    });
  }

  protected async requestCollectiveWisdom(userId: string, topic: string): Promise<void> {
    await eventBus.publish({
      type: WISDOM_EVENTS.COLLECTIVE_WISDOM_ACTIVATED,
      source: this.identity.name,
      payload: {
        userId,
        topic,
        requestedBy: this.identity.name
      },
      userId
    });
  }

  // Utility methods for response construction
  protected createResponse(
    requestId: string,
    response: string,
    confidence: number = 0.8,
    options: Partial<AgentResponse> = {}
  ): AgentResponse {
    return {
      requestId,
      response,
      confidence,
      element: this.identity.element,
      metadata: {
        agentName: this.identity.name,
        agentVersion: this.identity.version,
        processedAt: new Date().toISOString(),
        capabilities: this.identity.capabilities
      },
      ...options
    };
  }

  protected extractInsights(input: string, response: string): string[] {
    const insights: string[] = [];
    
    // Simple insight extraction patterns
    if (input.includes('stuck') && response.includes('breakthrough')) {
      insights.push('Breakthrough potential identified');
    }
    
    if (input.includes('pattern') || input.includes('repeated')) {
      insights.push('Pattern recognition opportunity');
    }
    
    if (input.includes('shadow') || input.includes('avoid')) {
      insights.push('Shadow work potential');
    }

    return insights;
  }

  // Public interface for monitoring
  public getIdentity(): AgentIdentity {
    return { ...this.identity };
  }

  public isCurrentlyProcessing(): boolean {
    return this.isProcessing;
  }

  public getActiveRequestCount(): number {
    return this.activeRequests.size;
  }

  public getStats(): any {
    return {
      identity: this.identity,
      isProcessing: this.isProcessing,
      activeRequests: this.activeRequests.size,
      capabilities: this.identity.capabilities
    };
  }
}