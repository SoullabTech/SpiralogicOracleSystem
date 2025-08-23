# 🎼 Event-Driven Architecture Migration Guide

## Overview
This guide shows how to migrate from direct service/agent calls to the new event-driven architecture. The system now uses asynchronous events for all agent communication and orchestration logic has been moved out of services.

## Architecture Changes

### Before (Direct Calls)
```typescript
// ❌ OLD: Direct agent calls in services
const agent = new FireAgent();
const response = await agent.process(query);
```

### After (Event-Driven)
```typescript
// ✅ NEW: Event-driven communication
await eventBus.publish({
  type: QUERY_EVENTS.QUERY_RECEIVED,
  source: 'APIRoute',
  payload: { userId, input, requestId }
});
```

## Migration Steps

### 1. Update API Routes to Use Events

#### Oracle Route Migration
**File**: `app/api/oracle/route.ts`

```typescript
// BEFORE
import { MainOracleAgent } from '@/backend/src/core/agents/MainOracleAgent';

export async function POST(request: Request) {
  const agent = new MainOracleAgent();
  const response = await agent.processQuery(body);
  return NextResponse.json(response);
}

// AFTER  
import { eventBus } from '@/backend/src/core/events/EventBus';
import { QUERY_EVENTS } from '@/backend/src/core/events/EventTypes';

export async function POST(request: Request) {
  const requestId = `oracle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Publish query event
  await eventBus.publish({
    type: QUERY_EVENTS.QUERY_RECEIVED,
    source: 'OracleAPI',
    payload: {
      userId: body.userId,
      input: body.input,
      context: body.context,
      requestId
    },
    userId: body.userId
  });

  // Subscribe to completion event
  return new Promise((resolve) => {
    const unsubscribe = eventBus.subscribe({
      eventType: QUERY_EVENTS.QUERY_PROCESSED,
      handler: {
        handle: async (event) => {
          if (event.payload.requestId === requestId) {
            unsubscribe();
            resolve(NextResponse.json(event.payload.response));
          }
        }
      }
    });
  });
}
```

### 2. Update Services to Use Event Publishing

#### OracleService Migration
**File**: `backend/src/services/OracleService.ts`

```typescript
// BEFORE
class OracleService {
  async processQuery(userId: string, query: string) {
    const agent = await this.getAgent(userId);
    return await agent.process(query);
  }
}

// AFTER
class OracleService {
  async processQuery(userId: string, query: string) {
    const requestId = `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Publish query event instead of calling agent directly
    await eventBus.publish({
      type: QUERY_EVENTS.QUERY_RECEIVED,
      source: 'OracleService',
      payload: { userId, input: query, requestId },
      userId
    });

    // Return request ID for tracking
    return { requestId, status: 'processing' };
  }
}
```

### 3. Wire Up Event-Driven Components

#### CompositionRoot Updates
**File**: `backend/src/core/composition/CompositionRoot.ts`

```typescript
export class CompositionRoot {
  private static eventDrivenComponents: {
    orchestrator?: EventDrivenOrchestrator;
    agents?: Map<string, EventDrivenAgent>;
  } = {};

  public static initializeEventDrivenSystem(): void {
    // Initialize orchestrator
    this.eventDrivenComponents.orchestrator = new EventDrivenOrchestrator({
      enableMultiAgentSynthesis: true,
      enableAdaptiveRouting: true,
      enableCollectiveWisdom: false
    });

    // Initialize event-driven agents
    this.eventDrivenComponents.agents = new Map();
    this.eventDrivenComponents.agents.set('fire', new EventDrivenFireAgent());
    this.eventDrivenComponents.agents.set('water', new EventDrivenWaterAgent());
    this.eventDrivenComponents.agents.set('earth', new EventDrivenEarthAgent());
    this.eventDrivenComponents.agents.set('air', new EventDrivenAirAgent());
    this.eventDrivenComponents.agents.set('aether', new EventDrivenAetherAgent());

    // Initialize event handlers for services
    this.initializeServiceEventHandlers();
  }

  private static initializeServiceEventHandlers(): void {
    // Memory service events
    const memoryHandler = new MemoryEventHandler(this.memoryService);
    eventBus.subscribe({ eventType: MEMORY_EVENTS.MEMORY_STORED, handler: memoryHandler });
    
    // Wisdom service events
    const wisdomHandler = new WisdomEventHandler(this.wisdomService);
    eventBus.subscribe({ eventType: WISDOM_EVENTS.WISDOM_SYNTHESIS_REQUESTED, handler: wisdomHandler });
    
    // Voice service events
    const voiceHandler = new VoiceEventHandler(this.voiceService);
    eventBus.subscribe({ eventType: VOICE_EVENTS.VOICE_SYNTHESIS_REQUESTED, handler: voiceHandler });
  }
}
```

### 4. Convert Remaining Services

#### Memory Service
```typescript
// BEFORE
class SoulMemoryService {
  async storeMemory(userId: string, content: string): Promise<void> {
    // Direct database operations
  }
}

// AFTER  
class SoulMemoryService extends BaseEventHandler {
  constructor() {
    super('SoulMemoryService');
    this.setupEventSubscriptions();
  }

  private setupEventSubscriptions(): void {
    eventBus.subscribe({
      eventType: MEMORY_EVENTS.MEMORY_STORED,
      handler: this
    });
  }

  protected async process(event: OracleEvent): Promise<void> {
    switch (event.type) {
      case MEMORY_EVENTS.MEMORY_STORED:
        await this.handleMemoryStored(event);
        break;
    }
  }

  private async handleMemoryStored(event: OracleEvent): Promise<void> {
    const { userId, content, memoryId } = event.payload;
    // Store memory and publish completion event
    await this.storeInDatabase(userId, content, memoryId);
    
    await eventBus.publish({
      type: MEMORY_EVENTS.MEMORY_RETRIEVAL_COMPLETED,
      source: 'SoulMemoryService',
      payload: { userId, memoryId, status: 'stored' },
      userId
    });
  }
}
```

## Implementation Checklist

### Phase 1: Core Event System ✅
- [x] EventBus implementation
- [x] EventTypes definitions  
- [x] BaseEventHandler classes
- [x] EventDrivenAgent base class
- [x] EventDrivenOrchestrator

### Phase 2: Elemental Agents ✅
- [x] EventDrivenFireAgent
- [x] EventDrivenWaterAgent  
- [x] EventDrivenEarthAgent
- [x] EventDrivenAirAgent
- [x] EventDrivenAetherAgent

### Phase 3: Service Migration (TODO)
- [ ] Update OracleService to use events
- [ ] Update founderKnowledgeService
- [ ] Update postRetreatService  
- [ ] Update retreatOnboardingService
- [ ] Update retreatSupportService
- [ ] Update soulMemoryService
- [ ] Update ypoEventService

### Phase 4: API Route Migration (TODO)
- [ ] Oracle route (`app/api/oracle/route.ts`)
- [ ] Oracle weave route (`app/api/oracle/weave/route.ts`)
- [ ] Personal Oracle routes
- [ ] Memory-related routes
- [ ] All other API routes with agent calls

### Phase 5: Component Integration (TODO)
- [ ] Update CompositionRoot wiring
- [ ] Remove old agent imports
- [ ] Update interface implementations
- [ ] Test event flow end-to-end

## Event Flow Examples

### Query Processing Flow
```
1. API Route receives request
   ↓ publishes QUERY_RECEIVED
2. EventDrivenOrchestrator receives event
   ↓ analyzes and publishes AGENT_PROCESSING_STARTED  
3. EventDrivenAgent receives event
   ↓ processes and publishes AGENT_PROCESSING_COMPLETED
4. EventDrivenOrchestrator receives completion
   ↓ publishes ORCHESTRATION_COMPLETED
5. API Route receives completion event
   ↓ returns response to client
```

### Memory Storage Flow
```  
1. Agent processing completes
   ↓ publishes MEMORY_STORED
2. SoulMemoryService receives event
   ↓ stores in database
   ↓ publishes MEMORY_STORAGE_COMPLETED
3. Other services can react to memory events
```

### Voice Synthesis Flow
```
1. Agent determines voice needed
   ↓ publishes VOICE_SYNTHESIS_REQUESTED
2. VoiceService receives event  
   ↓ generates audio
   ↓ publishes VOICE_SYNTHESIS_COMPLETED
3. Client components receive voice event
```

## Testing Event-Driven Changes

### Unit Testing Events
```typescript
describe('EventDrivenFireAgent', () => {
  it('should process fire-oriented queries', async () => {
    const agent = new EventDrivenFireAgent();
    
    // Simulate event
    const event = {
      type: AGENT_EVENTS.AGENT_PROCESSING_STARTED,
      payload: {
        agentType: 'fire_agent',
        input: 'I need motivation to take action',
        userId: 'test-user',
        requestId: 'test-123'
      }
    };

    // Process should publish completion event
    const publishSpy = jest.spyOn(eventBus, 'publish');
    await agent.handle(event);
    
    expect(publishSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: AGENT_EVENTS.AGENT_PROCESSING_COMPLETED
      })
    );
  });
});
```

### Integration Testing
```typescript
describe('Event Flow Integration', () => {
  it('should process query end-to-end via events', async () => {
    // Initialize system
    CompositionRoot.initializeEventDrivenSystem();
    
    // Publish query
    await eventBus.publish({
      type: QUERY_EVENTS.QUERY_RECEIVED,
      source: 'Test',
      payload: {
        userId: 'test-user',
        input: 'I need fire energy',
        requestId: 'test-123'
      }
    });

    // Wait for processing  
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verify completion event was published
    // (Implementation depends on event store/testing setup)
  });
});
```

## Benefits of Event-Driven Architecture

### Decoupling
- Services no longer import agents directly
- Agents don't know about services  
- Easy to add/remove components without changing others

### Scalability  
- Async processing by default
- Can add multiple agent instances
- Easy horizontal scaling

### Observability
- All interactions flow through event bus
- Easy to add monitoring/logging
- Event replay for debugging

### Flexibility
- Can add new event types without changing existing code
- Multiple handlers per event type
- Easy A/B testing of different agents

### Testing
- Mock event bus for isolated testing
- Event recording/replay for integration tests
- Clear separation of concerns

## Next Steps

1. **Complete Service Migration**: Update all services to use event publishing instead of direct calls
2. **Update API Routes**: Migrate all route handlers to use events  
3. **Remove Direct Dependencies**: Clean up old imports and direct agent instantiations
4. **Add Monitoring**: Implement event tracking and performance monitoring
5. **Documentation**: Update API documentation to reflect event-driven patterns

The event-driven architecture provides a solid foundation for the Oracle system's continued growth and evolution while maintaining clean separation of concerns and excellent testability.