// 🚌 EVENT BUS - Event-Driven Communication System
// Decouples agents and services through asynchronous event messaging

import { EventEmitter } from 'events';
import { logger } from '../../utils/logger';

export interface OracleEvent {
  id: string;
  type: string;
  source: string;
  timestamp: Date;
  payload: any;
  correlationId?: string;
  userId?: string;
  sessionId?: string;
}

export interface EventHandler {
  handle(event: OracleEvent): Promise<void>;
}

export interface EventSubscription {
  eventType: string;
  handler: EventHandler;
  filter?: (event: OracleEvent) => boolean;
}

export class EventBus {
  private static instance: EventBus;
  private eventEmitter: EventEmitter;
  private subscriptions: Map<string, EventSubscription[]> = new Map();
  private eventHistory: OracleEvent[] = [];
  private maxHistorySize = 1000;

  private constructor() {
    this.eventEmitter = new EventEmitter();
    this.eventEmitter.setMaxListeners(100); // Prevent memory leaks
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  // Subscribe to events
  public subscribe(subscription: EventSubscription): () => void {
    const { eventType, handler, filter } = subscription;
    
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }
    
    this.subscriptions.get(eventType)!.push(subscription);
    
    const eventHandler = async (event: OracleEvent) => {
      try {
        // Apply filter if provided
        if (filter && !filter(event)) {
          return;
        }
        
        await handler.handle(event);
      } catch (error) {
        logger.error(`Event handler error for ${eventType}:`, error);
      }
    };
    
    this.eventEmitter.on(eventType, eventHandler);
    
    // Return unsubscribe function
    return () => {
      this.eventEmitter.off(eventType, eventHandler);
      const subs = this.subscriptions.get(eventType);
      if (subs) {
        const index = subs.indexOf(subscription);
        if (index > -1) {
          subs.splice(index, 1);
        }
      }
    };
  }

  // Publish events
  public async publish(event: Omit<OracleEvent, 'id' | 'timestamp'>): Promise<void> {
    const fullEvent: OracleEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date()
    };

    // Add to history
    this.eventHistory.push(fullEvent);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    logger.debug(`Publishing event: ${fullEvent.type} from ${fullEvent.source}`);

    // Emit event
    this.eventEmitter.emit(fullEvent.type, fullEvent);
  }

  // Get event history for debugging/monitoring
  public getEventHistory(filter?: (event: OracleEvent) => boolean): OracleEvent[] {
    return filter ? this.eventHistory.filter(filter) : [...this.eventHistory];
  }

  // Clear event history
  public clearHistory(): void {
    this.eventHistory = [];
  }

  // Get subscription stats
  public getSubscriptionStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const [eventType, subs] of this.subscriptions) {
      stats[eventType] = subs.length;
    }
    return stats;
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const eventBus = EventBus.getInstance();