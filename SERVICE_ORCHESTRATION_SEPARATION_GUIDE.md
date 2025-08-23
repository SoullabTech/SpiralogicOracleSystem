# 🎭 Service Orchestration & Business Logic Separation Guide

## Problem: Coupled Orchestration + Business Logic

Several services were mixing orchestration concerns with business logic, violating separation of concerns and making the codebase harder to test and maintain.

## Issues Identified

### 1. **OracleService** (Original: 415 lines)
**Problems:**
- Mixed agent creation with query processing
- Evolution logic mixed with database operations  
- Voice settings management coupled with orchestration
- Health checking mixed with business rules

### 2. **AgentOrchestrator** (Original: 590 lines)
**Problems:**
- Intent analysis mixed with agent routing
- Response synthesis coupled with orchestration flow
- Memory management integrated with business logic
- Event handling mixed with domain rules

## Solution: Clean Separation Architecture

### Oracle Service Refactoring

#### **OracleBusinessLogic.ts** (~250 lines)
**Pure Business Logic:**
- Oracle settings validation
- Health status calculation  
- Evolution opportunity analysis
- Ceremonial greeting generation
- Statistics calculation

```typescript
export class OracleBusinessLogic {
  validateOracleSettings(settings: Partial<UserOracleSettings>): string[]
  calculateOracleHealth(settings, lastInteraction, isCached): OracleHealth
  analyzeEvolutionOpportunity(input, response, currentPhase, currentArchetype): OracleEvolutionSuggestion | null
  generateCeremonialGreeting(settings): string
  calculateOracleStats(settings, interactionCount, avgTime, elementFreq)
}
```

#### **OracleOrchestrationService.ts** (~300 lines)  
**Pure Orchestration:**
- Query processing flow
- Event publishing/subscription
- Agent coordination
- Repository interaction
- Cache management

```typescript
export class OracleOrchestrationService {
  async processOracleQuery(userId, input, context): Promise<AIResponse>
  async getUserOracle(userId): Promise<IArchetypeAgent>
  async suggestEvolution(userId, detectedPhase, detectedArchetype)
  async acceptEvolution(userId, newPhase, newArchetype)
}
```

### Agent Orchestrator Refactoring

#### **ElementalBusinessLogic.ts** (~400 lines)
**Pure Business Logic:**
- Archetypal intent analysis
- Response synthesis algorithms
- Balance calculations
- Wisdom generation
- Pattern recognition

```typescript
export class ElementalBusinessLogic {
  analyzeArchetypalIntent(input): ArchetypalIntent
  determineOrchestrationStrategy(intent, userContext, history): string
  synthesizeAgentResponses(responses, intent, strategy): OrchestrationResult
  calculateArchetypalInsights(patterns, interactions): any
}
```

#### **ElementalOrchestratorService.ts** (~350 lines)
**Pure Orchestration:**
- Event-driven coordination
- Agent routing via events
- Memory management
- Request tracking
- Flow control

```typescript
export class ElementalOrchestratorService extends BaseEventHandler {
  async processQuery(input, userContext): Promise<OrchestrationResult>
  private async orchestrateElementalResponse(request): Promise<OrchestrationResult>
  private async routeToAgents(request, intent, strategy): Promise<Record<string, any>>
}
```

## Architecture Benefits

### 1. **Separation of Concerns**
```
BEFORE (Coupled):
┌─────────────────────────┐
│     OracleService       │
│  • Query Processing     │
│  • Business Rules       │
│  • Database Access      │
│  • Agent Creation       │
│  • Event Handling       │
│  • Validation Logic     │
└─────────────────────────┘

AFTER (Separated):
┌─────────────────┐    ┌─────────────────────┐
│ Orchestration   │    │   Business Logic    │
│ Service         │    │                     │
│ • Flow Control  │───▶│ • Domain Rules      │
│ • Event Pub/Sub │    │ • Calculations      │
│ • Agent Routing │    │ • Validations       │
│ • Cache Mgmt    │    │ • Algorithms        │
└─────────────────┘    └─────────────────────┘
```

### 2. **Improved Testability**

#### Business Logic Testing (Isolated)
```typescript
describe('OracleBusinessLogic', () => {
  it('should validate Oracle settings correctly', () => {
    const logic = new OracleBusinessLogic();
    const errors = logic.validateOracleSettings({ userId: null });
    expect(errors).toContain('User ID is required');
  });

  it('should calculate health status correctly', () => {
    const logic = new OracleBusinessLogic();
    const health = logic.calculateOracleHealth(mockSettings, pastDate, false);
    expect(health.status).toBe('warning');
  });
});
```

#### Orchestration Testing (With Mocks)
```typescript
describe('OracleOrchestrationService', () => {
  it('should process query through correct flow', async () => {
    const mockRepo = { getOracleSettings: jest.fn() };
    const mockFactory = { createAgent: jest.fn() };
    
    const service = new OracleOrchestrationService(mockRepo, mockFactory);
    await service.processOracleQuery('user-123', 'test query');
    
    expect(mockRepo.getOracleSettings).toHaveBeenCalledWith('user-123');
    expect(mockFactory.createAgent).toHaveBeenCalled();
  });
});
```

### 3. **Event-Driven Integration**

#### Oracle Service Events
```typescript
// Query processing publishes events
await eventBus.publish({
  type: QUERY_EVENTS.QUERY_RECEIVED,
  source: 'OracleOrchestrationService',
  payload: { userId, input, context, requestId }
});

// Evolution suggestions trigger events  
await eventBus.publish({
  type: AGENT_EVENTS.ARCHETYPAL_AGENT_ACTIVATED,
  source: 'OracleOrchestrationService',
  payload: { userId, agentType: 'oracle', archetype: detectedArchetype }
});
```

#### Elemental Orchestrator Events
```typescript
// Agent routing via events
await eventBus.publish({
  type: AGENT_EVENTS.AGENT_PROCESSING_STARTED,
  source: 'ElementalOrchestratorService', 
  payload: { agentType: `${agentType}_agent`, input, context }
});

// Orchestration completion events
await eventBus.publish({
  type: ORCHESTRATION_EVENTS.ORCHESTRATION_COMPLETED,
  payload: { requestId, result, completedAt }
});
```

## Migration Guide

### 1. Update Service Dependencies

#### Before
```typescript
// Tightly coupled
import { OracleService } from './services/OracleService';
const oracleService = new OracleService();
```

#### After
```typescript
// Dependency injection
import { OracleOrchestrationService } from './services/oracle/OracleOrchestrationService';
import { OracleRepository } from './repositories/OracleRepository';
import { ArchetypeAgentFactory } from './factories/ArchetypeAgentFactory';

const repository = new OracleRepository();
const agentFactory = new ArchetypeAgentFactory(); 
const oracleService = new OracleOrchestrationService(repository, agentFactory);
```

### 2. Repository Pattern Implementation

```typescript
export interface IOracleRepository {
  getOracleSettings(userId: string): Promise<UserOracleSettings | null>;
  updateOracleSettings(userId: string, settings: Partial<UserOracleSettings>): Promise<void>;
  storeEvolutionSuggestion(userId: string, suggestion: any): Promise<void>;
  getInteractionStats(userId: string): Promise<InteractionStats>;
}

export class SupabaseOracleRepository implements IOracleRepository {
  async getOracleSettings(userId: string): Promise<UserOracleSettings | null> {
    const { data } = await supabase
      .from('oracle_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    return data;
  }
  // ... other methods
}
```

### 3. Event-Driven Flow Integration

#### Route Handler Updates
```typescript
// app/api/oracle/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  
  // Use orchestration service instead of direct agent calls
  const response = await oracleOrchestrationService.processOracleQuery(
    body.userId,
    body.input,
    body.context
  );
  
  return NextResponse.json(response);
}
```

#### CompositionRoot Integration
```typescript
// backend/src/core/composition/CompositionRoot.ts
export class CompositionRoot {
  static initializeServices(): void {
    // Repository layer
    const oracleRepo = new SupabaseOracleRepository();
    
    // Business logic (no dependencies)
    const oracleBusinessLogic = new OracleBusinessLogic();
    
    // Agent factory
    const agentFactory = new ArchetypeAgentFactory();
    
    // Orchestration service (with dependencies)
    const oracleOrchestrationService = new OracleOrchestrationService(
      oracleRepo,
      agentFactory
    );
    
    // Register services
    this.services.set('oracleOrchestration', oracleOrchestrationService);
    
    // Initialize event-driven orchestrator
    const elementalOrchestrator = new ElementalOrchestratorService();
    this.services.set('elementalOrchestrator', elementalOrchestrator);
  }
}
```

## Testing Strategy

### Unit Tests (Business Logic)
```typescript
// Fast, isolated tests for domain rules
describe('ElementalBusinessLogic', () => {
  describe('analyzeArchetypalIntent', () => {
    it('should detect fire intent from action keywords', () => {
      const logic = new ElementalBusinessLogic();
      const intent = logic.analyzeArchetypalIntent("I want to create something amazing");
      expect(intent.primary).toBe('fire');
      expect(intent.confidence).toBeGreaterThan(0.5);
    });
  });
});
```

### Integration Tests (Orchestration)
```typescript
// Test service interactions
describe('OracleOrchestrationService Integration', () => {
  it('should create Oracle and process query', async () => {
    const mockRepo = new MockOracleRepository();
    const mockFactory = new MockAgentFactory();
    
    const service = new OracleOrchestrationService(mockRepo, mockFactory);
    const response = await service.processOracleQuery('user-123', 'test query');
    
    expect(response).toHaveProperty('content');
    expect(mockRepo.getOracleSettings).toHaveBeenCalled();
  });
});
```

### Event Integration Tests
```typescript
// Test event-driven flows
describe('Event-Driven Oracle Flow', () => {
  it('should publish events during query processing', async () => {
    const eventSpy = jest.spyOn(eventBus, 'publish');
    
    await oracleService.processOracleQuery('user-123', 'test query');
    
    expect(eventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: QUERY_EVENTS.QUERY_RECEIVED
      })
    );
  });
});
```

## Performance Benefits

### 1. **Faster Unit Tests**
- Business logic tests run in ~1ms (no I/O)
- Orchestration tests with mocks run in ~10ms
- Full integration tests only when needed

### 2. **Better Caching**
- Business logic is stateless (pure functions)
- Orchestration service manages state/cache separately
- Repository layer can implement optimized caching

### 3. **Parallel Processing**
- Business logic calculations can run in parallel
- Event-driven orchestration enables async processing
- Agent responses can be processed concurrently

## Monitoring & Observability

### Separated Logging
```typescript
// Business logic logging (domain events)
logger.info("Evolution opportunity detected", {
  userId,
  currentPhase,
  suggestedPhase,
  confidence
});

// Orchestration logging (flow events)
logger.info("Oracle query orchestrated", {
  requestId,
  userId,
  processingTime,
  agentsInvolved
});
```

### Metrics Collection
```typescript
// Business logic metrics
metrics.increment('oracle.evolution_suggestions', { phase: suggestedPhase });

// Orchestration metrics  
metrics.timing('oracle.query_processing_time', duration);
metrics.increment('oracle.queries_processed', { userId });
```

## Next Steps

1. **Complete Repository Implementation**
   - Implement actual database operations
   - Add proper error handling and retries
   - Implement caching strategies

2. **Full Event-Driven Conversion** 
   - Convert remaining direct agent calls to events
   - Implement event sourcing for audit trails
   - Add event replay capabilities for debugging

3. **Advanced Orchestration**
   - Add parallel agent processing
   - Implement circuit breakers for resilience
   - Add dynamic agent selection based on load

4. **Enhanced Testing**
   - Add property-based testing for business logic
   - Implement contract testing for service boundaries
   - Add performance testing for orchestration flows

This separation provides a solid foundation for scaling the Oracle system while maintaining clean, testable, and maintainable code.