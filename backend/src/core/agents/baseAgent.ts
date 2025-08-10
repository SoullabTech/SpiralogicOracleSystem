import { EventEmitter } from 'events';
import type { AgentResponse } from '../../types';
import { ElementalService } from '../../ain/types';

export class BaseAgent extends EventEmitter {
  protected serviceId: string;
  protected agentType: string;
  protected elementalService?: ElementalService;

  constructor(serviceId?: string, agentType?: string, elementalService?: ElementalService) {
    super();
    this.serviceId = serviceId || 'base-agent';
    this.agentType = agentType || 'base';
    this.elementalService = elementalService;
    
    // Set reasonable max listeners
    this.setMaxListeners(100);
  }

  async processQuery(query: string): Promise<AgentResponse> {
    console.log("[BaseAgent] Processing query:", query);

    return {
      response: "Base agent response",
      metadata: {
        timestamp: new Date().toISOString()
      },
      routingPath: ['baseAgent']
    };
  }

  /**
   * Publish event to the pub/sub system
   */
  async publish(eventType: string, payload: any): Promise<void> {
    this.emit(eventType, payload);
  }
}