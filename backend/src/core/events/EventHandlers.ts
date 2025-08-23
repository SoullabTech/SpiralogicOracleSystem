// 🎛️ EVENT HANDLERS - Common event handling patterns for Oracle system
// Provides base classes and utilities for implementing event handlers

import { EventHandler, OracleEvent } from './EventBus';
import { logger } from '../../utils/logger';
import { createHash } from 'crypto';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Base event handler with common functionality and idempotency support
export abstract class BaseEventHandler implements EventHandler {
  protected handlerName: string;
  protected enableIdempotency: boolean;

  constructor(handlerName: string, enableIdempotency = true) {
    this.handlerName = handlerName;
    this.enableIdempotency = enableIdempotency;
  }

  private generateIdempotencyKey(event: OracleEvent): string {
    // Use event metadata idempotency key if provided (e.g., from replay)
    if (event.metadata?.idempotencyKey) {
      return event.metadata.idempotencyKey;
    }
    
    // Generate deterministic key based on event properties
    const keyData = `${event.type}:${event.userId}:${event.timestamp}:${event.id}`;
    return createHash('sha256').update(keyData).digest('hex');
  }

  private async checkIdempotency(idempotencyKey: string): Promise<boolean> {
    if (!this.enableIdempotency) return false;
    
    const key = `idem:${idempotencyKey}`;
    const exists = await redis.exists(key);
    return exists === 1;
  }

  private async markProcessed(idempotencyKey: string): Promise<void> {
    if (!this.enableIdempotency) return;
    
    const key = `idem:${idempotencyKey}`;
    const ttl = parseInt(process.env.IDEMPOTENCY_TTL || '86400'); // 24 hours default
    await redis.setex(key, ttl, JSON.stringify({
      processedAt: new Date().toISOString(),
      handler: this.handlerName
    }));
  }

  public async handle(event: OracleEvent): Promise<void> {
    const startTime = Date.now();
    const idempotencyKey = this.generateIdempotencyKey(event);
    
    try {
      // Check idempotency
      if (await this.checkIdempotency(idempotencyKey)) {
        logger.info(`[${this.handlerName}] Event already processed, skipping`, {
          eventId: event.id,
          eventType: event.type,
          idempotencyKey
        });
        return;
      }

      logger.debug(`[${this.handlerName}] Processing event: ${event.type} (${event.id})`);
      
      await this.process(event);
      
      // Mark as processed
      await this.markProcessed(idempotencyKey);
      
      const duration = Date.now() - startTime;
      logger.debug(`[${this.handlerName}] Event processed in ${duration}ms`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`[${this.handlerName}] Event processing failed after ${duration}ms:`, error);
      
      // Store in DLQ on failure
      await this.storeInDLQ(event, error);
      
      throw error;
    }
  }

  private async storeInDLQ(event: OracleEvent, error: any): Promise<void> {
    try {
      // In production, this would store to your actual DLQ
      // For now, we'll log it
      logger.error('Storing event in DLQ', {
        event,
        error: error.message,
        stack: error.stack,
        handler: this.handlerName
      });
      
      // You could implement actual DLQ storage here:
      // await supabase.from('dlq_events').insert({
      //   event_id: event.id,
      //   type: event.type,
      //   payload: event,
      //   error: error.message,
      //   handler: this.handlerName,
      //   retry_count: 0
      // });
    } catch (dlqError) {
      logger.error('Failed to store event in DLQ', { dlqError, originalError: error });
    }
  }

  protected abstract process(event: OracleEvent): Promise<void>;
}

// Handler for memory-related events
export class MemoryEventHandler extends BaseEventHandler {
  constructor(private memoryService: any) {
    super('MemoryEventHandler');
  }

  protected async process(event: OracleEvent): Promise<void> {
    switch (event.type) {
      case 'memory.pattern_detected':
        await this.handlePatternDetected(event);
        break;
      case 'memory.insight_generated':
        await this.handleInsightGenerated(event);
        break;
      default:
        logger.warn(`[${this.handlerName}] Unhandled event type: ${event.type}`);
    }
  }

  private async handlePatternDetected(event: OracleEvent): Promise<void> {
    const { patterns, userId } = event.payload;
    logger.info(`Patterns detected for user ${userId}:`, patterns);
    
    // Store pattern insights
    await this.memoryService.storePatternInsight(userId, {
      patterns,
      detectedAt: event.timestamp,
      eventId: event.id
    });
  }

  private async handleInsightGenerated(event: OracleEvent): Promise<void> {
    const { insight, userId } = event.payload;
    logger.info(`Insight generated for user ${userId}`);
    
    // Store insight
    await this.memoryService.storeInsight(userId, insight);
  }
}

// Handler for orchestration events
export class OrchestrationEventHandler extends BaseEventHandler {
  constructor() {
    super('OrchestrationEventHandler');
  }

  protected async process(event: OracleEvent): Promise<void> {
    switch (event.type) {
      case 'orchestration.routing_decision':
        await this.handleRoutingDecision(event);
        break;
      case 'orchestration.completed':
        await this.handleOrchestrationCompleted(event);
        break;
      default:
        logger.warn(`[${this.handlerName}] Unhandled event type: ${event.type}`);
    }
  }

  private async handleRoutingDecision(event: OracleEvent): Promise<void> {
    const { routingDecision, userId } = event.payload;
    logger.info(`Routing decision for ${userId}: ${routingDecision.primaryAgent} (confidence: ${routingDecision.confidence})`);
  }

  private async handleOrchestrationCompleted(event: OracleEvent): Promise<void> {
    const { userId, requestId } = event.payload;
    logger.info(`Orchestration completed for user ${userId}, request ${requestId}`);
  }
}

// Handler for wisdom synthesis events
export class WisdomEventHandler extends BaseEventHandler {
  constructor(private wisdomService: any) {
    super('WisdomEventHandler');
  }

  protected async process(event: OracleEvent): Promise<void> {
    switch (event.type) {
      case 'wisdom.synthesis_requested':
        await this.handleSynthesisRequested(event);
        break;
      case 'wisdom.collective_activated':
        await this.handleCollectiveWisdomActivated(event);
        break;
      default:
        logger.warn(`[${this.handlerName}] Unhandled event type: ${event.type}`);
    }
  }

  private async handleSynthesisRequested(event: OracleEvent): Promise<void> {
    const { userId, sources, synthesisType } = event.payload;
    logger.info(`Wisdom synthesis requested for ${userId}, type: ${synthesisType}`);
    
    // Trigger wisdom synthesis process
    await this.wisdomService.synthesizeWisdom(userId, sources, synthesisType);
  }

  private async handleCollectiveWisdomActivated(event: OracleEvent): Promise<void> {
    const { userId } = event.payload;
    logger.info(`Collective wisdom activated for ${userId}`);
    
    // Activate collective wisdom flows
    await this.wisdomService.activateCollectiveWisdom(userId);
  }
}

// Handler for voice synthesis events
export class VoiceEventHandler extends BaseEventHandler {
  constructor(private voiceService: any) {
    super('VoiceEventHandler');
  }

  protected async process(event: OracleEvent): Promise<void> {
    switch (event.type) {
      case 'voice.synthesis_requested':
        await this.handleSynthesisRequested(event);
        break;
      case 'voice.ceremonial_speech_triggered':
        await this.handleCeremonialSpeech(event);
        break;
      default:
        logger.warn(`[${this.handlerName}] Unhandled event type: ${event.type}`);
    }
  }

  private async handleSynthesisRequested(event: OracleEvent): Promise<void> {
    const { userId, text, voiceProfile } = event.payload;
    logger.info(`Voice synthesis requested for ${userId}, profile: ${voiceProfile}`);
    
    // Trigger voice synthesis
    await this.voiceService.synthesizeVoice(text, voiceProfile, userId);
  }

  private async handleCeremonialSpeech(event: OracleEvent): Promise<void> {
    const { userId, ceremony } = event.payload;
    logger.info(`Ceremonial speech triggered for ${userId}: ${ceremony}`);
    
    // Generate ceremonial speech
    await this.voiceService.generateCeremonialSpeech(userId, ceremony);
  }
}

// Composite handler that can route to multiple sub-handlers
export class CompositeEventHandler extends BaseEventHandler {
  private handlers: Map<string, EventHandler> = new Map();

  constructor() {
    super('CompositeEventHandler');
  }

  public addHandler(eventType: string, handler: EventHandler): void {
    this.handlers.set(eventType, handler);
  }

  protected async process(event: OracleEvent): Promise<void> {
    const handler = this.handlers.get(event.type);
    if (handler) {
      await handler.handle(event);
    } else {
      logger.warn(`[${this.handlerName}] No handler found for event type: ${event.type}`);
    }
  }
}

// Async retry handler for resilient event processing
export class RetryEventHandler extends BaseEventHandler {
  constructor(
    private wrappedHandler: EventHandler,
    private maxRetries: number = 3,
    private retryDelay: number = 1000
  ) {
    super('RetryEventHandler');
  }

  protected async process(event: OracleEvent): Promise<void> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        await this.wrappedHandler.handle(event);
        return; // Success
      } catch (error) {
        lastError = error as Error;
        logger.warn(`[${this.handlerName}] Attempt ${attempt} failed for event ${event.id}:`, error);
        
        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }
    
    logger.error(`[${this.handlerName}] All retry attempts failed for event ${event.id}`);
    throw lastError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}