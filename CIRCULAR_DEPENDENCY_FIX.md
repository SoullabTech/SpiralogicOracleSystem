# Circular Dependency Fix Guide

## ✅ **Progress Summary**

### **Completed Steps:**
1. ✅ **Identified 16+ circular dependency cycles** between services and agents
2. ✅ **Created interface abstractions** for major agent types
3. ✅ **Updated key services** to use dependency injection
4. ✅ **Created CompositionRoot** for proper dependency wiring

### **Key Interfaces Created:**
- `IArchetypeAgent.ts` - Archetype agent abstraction
- `IElementalAgent.ts` - Fire, Water, Earth, Air, Aether agent interfaces  
- `IFounderAgent.ts` - Founder knowledge agent interface
- `IOracleService.ts` - Enhanced oracle service interface
- `IAgentOrchestrator.ts` - Agent routing interface

### **Updated Services:**
- `OracleService.ts` - Now uses `IArchetypeAgentFactory` injection
- `agentOrchestrator.ts` - Now uses `IFireAgent` and `IWaterAgent` injection

## 🔧 **Remaining Tasks**

### **1. Update Remaining Services** 
Services that still import agents directly:

```typescript
// ❌ These still have direct agent imports:
backend/src/services/founderKnowledgeService.ts  
backend/src/services/postRetreatService.ts
backend/src/services/retreatOnboardingService.ts  
backend/src/services/retreatSupportService.ts
backend/src/services/soulMemoryService.ts
backend/src/services/ypoEventService.ts
```

**Fix Pattern:**
```typescript
// ❌ Before
import { SoullabFounderAgent } from "../core/agents/soullabFounderAgent";

export class MyService {
  private founderAgent = new SoullabFounderAgent();
}

// ✅ After  
import { IFounderAgent } from "@/lib/shared/interfaces/IFounderAgent";

export class MyService {
  constructor(private founderAgent: IFounderAgent) {}
}
```

### **2. Update Agent Implementations**
Make agents implement their interfaces:

```typescript
// ❌ Current
export class FireAgent {
  async processQuery(input: string): Promise<any> { ... }
}

// ✅ Fixed
export class FireAgent implements IFireAgent {
  element = "fire" as const;
  
  async process(query: any): Promise<any> { ... }
  async processActionQuery(input: string, context?: any): Promise<any> { ... }
  async getMotivationalGuidance(context: any): Promise<string> { ... }
  async getGuidance(input: string, context?: any): Promise<string> { ... }
}
```

### **3. Update MainOracleAgent**
Replace direct service imports with interface dependencies:

```typescript
// ❌ Current in MainOracleAgent.ts
import { elementalOracle } from "../../services/elementalOracleService";
import { OracleService } from "../../services/OracleService";

// ✅ Replace with
constructor(
  private oracleService: IOracleService,
  private elementalOrchestrator: IElementalOrchestrator,
  private founderAgent: IFounderAgent
) {}
```

### **4. Update Route Handlers**
Routes should get dependencies from CompositionRoot:

```typescript
// ❌ Current
import { PersonalOracleAgent } from "../core/agents/PersonalOracleAgent";

// ✅ Fixed  
import { getPersonalOracleAgent } from "../core/composition/CompositionRoot";

app.post('/api/oracle', async (req, res) => {
  const agent = await getPersonalOracleAgent(config);
  // ...
});
```

## 🛠️ **Implementation Steps**

### **Step 1: Update Service Files**
```bash
# Update each service to use dependency injection
# Pattern: Constructor injection with interfaces

# Files to update:
- founderKnowledgeService.ts
- postRetreatService.ts  
- retreatOnboardingService.ts
- retreatSupportService.ts
- soulMemoryService.ts
- ypoEventService.ts
```

### **Step 2: Implement Interfaces**
```bash
# Make agents implement their interfaces
# Pattern: export class XAgent implements IXAgent

# Files to update:
- FireAgent.ts → implements IFireAgent
- WaterAgent.ts → implements IWaterAgent  
- EarthAgent.ts → implements IEarthAgent
- AirAgent.ts → implements IAirAgent
- AetherAgent.ts → implements IAetherAgent
- SoullabFounderAgent.ts → implements IFounderAgent
- ArchetypeAgentFactory.ts → implements IArchetypeAgentFactory
```

### **Step 3: Update Composition Root Instantiation**
```bash
# Update files that currently use singleton pattern
# Replace static instantiation with CompositionRoot

# Files likely needing updates:
- All route handlers that import agents directly
- Services that export singleton instances
- MainOracleAgent.ts constructor
```

### **Step 4: Update Dependency Cruiser Rules**
The `.dependency-cruiser.cjs` already has rules to prevent these cycles:
```javascript
{ name: "services-to-agents", severity: "error" },
{ name: "agents-to-services", severity: "error" },
```

After fixes, run: `npm run doctor:arch` to verify cycles are broken.

## 🎯 **Expected Results**

After implementing these changes:

1. **Zero Circular Dependencies**: `npm run doctor:arch` should pass
2. **Proper Separation**: Services depend on interfaces, not concrete agents
3. **Testability**: Easy to mock dependencies in unit tests
4. **Maintainability**: Clear dependency flow through composition root

## 📋 **Validation Checklist**

- [ ] All services use constructor injection with interfaces
- [ ] All agents implement their respective interfaces  
- [ ] CompositionRoot properly wires all dependencies
- [ ] Routes use CompositionRoot instead of direct imports
- [ ] `npm run doctor:arch` passes without circular dependency errors
- [ ] All tests still pass with new dependency structure

## 🚀 **Benefits Achieved**

- **Dependency Inversion Principle**: High-level modules don't depend on low-level modules
- **Single Responsibility**: Each service has one clear concern
- **Open/Closed Principle**: Easy to extend with new implementations
- **Testability**: Dependencies can be easily mocked
- **Maintainability**: Clear dependency graph with no cycles