# Hexagonal Architecture Refactoring Plan

## 🎯 Goal: Textbook Clean Hexagonal Structure

Transform the current structure into a canonical hexagonal architecture with clear separation of concerns.

## 📊 Current State Analysis

### Duplicate Agent Directories
- `/backend/src/agents/` - 6 elemental agents + PersonalOracleAgent
- `/backend/src/core/agents/` - 30+ agents, modules, interfaces

### Services Mixed Responsibilities  
- `/backend/src/services/` - Mix of business logic + orchestration + adapters

### Routes with Business Logic
- `/backend/src/routes/` - HTTP handling + business logic mixed

### Orchestration Scattered
- Some in `/backend/src/core/orchestration/`
- Some in `/backend/src/services/agentOrchestrator.ts`

## 🏗️ Target Hexagonal Structure

```
backend/src/
├── domain/                    # Core business logic (inner hexagon)
│   ├── agents/               # All agents consolidated here
│   │   ├── elemental/        # aether, air, earth, fire, water
│   │   ├── divination/       # tarot, iching, astrology
│   │   ├── personal/         # PersonalOracleAgent variants
│   │   ├── specialized/      # dream, shadow, guide, etc.
│   │   ├── interfaces/       # Agent contracts
│   │   └── base/            # BaseAgent, common functionality
│   ├── entities/            # Core domain objects
│   ├── valueObjects/        # Immutable domain values  
│   └── businessRules/       # Domain validation logic
│
├── application/             # Application/Use Case layer
│   ├── services/           # Pure business services (no infrastructure)
│   ├── orchestration/      # Cross-agent coordination
│   ├── workflows/          # Multi-step business processes
│   └── interfaces/         # Service contracts
│
├── infrastructure/         # Infrastructure layer (outer hexagon)
│   ├── adapters/          # External service adapters
│   ├── repositories/      # Data persistence
│   ├── external/         # Third-party integrations
│   └── config/           # Infrastructure configuration
│
├── interfaces/            # Interface adapters
│   ├── http/             # REST API routes (HTTP concerns only)
│   ├── events/           # Event handlers
│   └── cli/              # Command-line interfaces
│
└── shared/               # Cross-cutting concerns
    ├── types/            # Shared type definitions
    ├── utils/            # Pure utility functions
    └── constants/        # Application constants
```

## 🔄 Migration Steps

### Step 1: Consolidate Agents → `domain/agents/`
- Merge `/agents/` and `/core/agents/` into single location
- Organize by functional area (elemental, divination, personal, etc.)
- Preserve existing dependency injection patterns

### Step 2: Purify Services → `application/services/`
- Extract pure business logic from current services
- Move orchestration logic to `application/orchestration/`
- Move infrastructure concerns to `infrastructure/adapters/`

### Step 3: Clean Routes → `interfaces/http/`
- Strip business logic from route handlers
- Keep only HTTP request/response handling
- Delegate to application services

### Step 4: Establish Clear Boundaries
- Domain layer: No infrastructure dependencies
- Application layer: No HTTP/framework dependencies  
- Infrastructure layer: Implements domain interfaces

## 📋 Detailed Migration Actions

### 1. Agent Consolidation

**Current Duplicates to Resolve:**
```bash
# Elemental agents exist in both places
/agents/AetherAgent.ts          → /domain/agents/elemental/aetherAgent.ts
/core/agents/elemental/aetherAgent.ts → merge or remove

# PersonalOracleAgent variants
/agents/PersonalOracleAgent.ts
/agents/personal_oracle/PersonalOracleAgent.ts  
/core/agents/PersonalOracleAgent.ts
/core/agents/EnhancedPersonalOracleAgent.ts
→ Consolidate to /domain/agents/personal/
```

**Organization Structure:**
```bash
domain/agents/
├── elemental/
│   ├── aetherAgent.ts (canonical)
│   ├── airAgent.ts
│   ├── earthAgent.ts
│   ├── fireAgent.ts
│   └── waterAgent.ts
├── divination/
│   ├── divinationAgent.ts
│   ├── astroAgent.ts (from services)
│   └── dreamAgent.ts
├── personal/
│   ├── personalOracleAgent.ts (canonical)
│   └── facilitatorAgent.ts
├── specialized/
│   ├── shadowAgents.ts
│   ├── guideAgent.ts
│   └── mentorAgent.ts
├── interfaces/
│   ├── IAgent.ts
│   ├── IPersonalOracleAgent.ts
│   └── IElementalAgent.ts
└── base/
    ├── baseAgent.ts
    └── agentTypes.ts
```

### 2. Service Layer Separation

**Extract from services/ to application/services/:**
- Pure business logic services
- Domain orchestration
- Use case implementations

**Move to infrastructure/adapters/:**
- External API integrations (ElevenLabs, Supabase)
- Third-party service wrappers
- Infrastructure-specific implementations

**Move to application/orchestration/:**
- Multi-agent coordination
- Workflow orchestration
- Cross-domain operations

### 3. Route Handler Cleanup

**Before (routes contain business logic):**
```typescript
export async function POST(req: Request) {
  // Business logic mixed with HTTP handling
  const analysis = await analyzeUserInput(input);
  const response = await generateOracleResponse(analysis);
  return NextResponse.json(response);
}
```

**After (pure HTTP concerns):**
```typescript
export async function POST(req: Request) {
  // Only HTTP request/response handling
  const input = await parseRequest(req);
  const result = await oracleService.processInput(input);
  return formatResponse(result);
}
```

## 🎯 Benefits of This Structure

### 1. **Clear Separation of Concerns**
- Domain logic independent of infrastructure
- Easy to test business rules in isolation
- Technology-agnostic core

### 2. **Dependency Direction Enforced**
- Domain → No dependencies
- Application → Depends only on Domain
- Infrastructure → Implements Domain interfaces
- Interfaces → Orchestrates Application layer

### 3. **Maintainability**
- Single canonical location for each concern
- No circular dependencies
- Clear module boundaries

### 4. **Testability**
- Domain logic pure and testable
- Infrastructure can be mocked easily
- Clear contract boundaries

## 🚨 Migration Risks & Mitigations

### Risk: Breaking existing imports
**Mitigation:** Update dependency-cruiser rules to enforce new structure

### Risk: Lost functionality during consolidation  
**Mitigation:** Careful analysis of duplicate agents to preserve all features

### Risk: Performance impact from restructuring
**Mitigation:** Maintain existing dependency injection patterns

## 📊 Success Metrics

- [ ] All agents in single canonical location
- [ ] Services contain only pure business logic
- [ ] Routes handle only HTTP concerns
- [ ] No circular dependencies between layers
- [ ] All tests pass after refactoring
- [ ] Dependency-cruiser rules enforce architecture

## 🔧 Implementation Order

1. **Agent Consolidation** (Lowest risk, highest impact)
2. **Service Purification** (Medium risk, medium impact)  
3. **Route Cleanup** (Medium risk, high maintainability gain)
4. **Orchestration Organization** (Low risk, high clarity gain)
5. **Update Architectural Guardrails** (Critical for long-term success)

This refactoring will result in a textbook hexagonal architecture that's maintainable, testable, and follows clean architecture principles.