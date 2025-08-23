# Orchestration & Dependency Injection

This directory contains the composition root and dependency wiring for the Spiralogic Oracle System.

## Architecture

### Composition Root (`wiring.ts`)

The composition root follows the **Dependency Injection** pattern to break circular dependencies between agents and services:

- **Agents** depend on `IMemoryService` interface (not concrete implementations)
- **Services** can depend on agent interfaces (not concrete classes) 
- **Wiring** instantiates all dependencies and wires them together

### Available Instances

```typescript
// Main Oracle
export const personalOracleAgent: PersonalOracleAgent

// Elemental Agents
export const fireAgent: FireAgent      // "Ignis" - Catalyst of Becoming
export const waterAgent: WaterAgent    // "Aquaria" - Healer of Depths  
export const earthAgent: EarthAgent    // "Terra" - Keeper of Manifestation
export const airAgent: AirAgent        // "Ventus" - Clarifier of Truth
export const aetherAgent: AetherAgent  // "Nyra" - Unity Weaver
```

### Memory Service Interface

All agents use `IMemoryService` for storage operations:

```typescript
interface IMemoryService {
  read<T>(key: string): Promise<T | null>;
  write<T>(key: string, value: T): Promise<void>;
  delete?(key: string): Promise<void>;
  exists?(key: string): Promise<boolean>;
}
```

## Usage

Import pre-wired instances instead of creating new ones:

```typescript
// ✅ Good - Use wired instances
import { personalOracleAgent, fireAgent } from "../orchestration/wiring";

// ❌ Bad - Direct imports create circular dependencies
import { PersonalOracleAgent } from "../agents/PersonalOracleAgent";
import { getRelevantMemories } from "../../services/memoryService";
```

## Benefits

1. **No Circular Dependencies** - Clean separation between layers
2. **Testable** - Easy to inject mocks/stubs for testing
3. **Maintainable** - Single place to configure all dependencies
4. **Scalable** - Add new agents/services without breaking existing code

## Future Enhancements

- Add agent lifecycle management
- Implement connection pooling for memory service
- Add configuration-driven agent instantiation
- Consider adding health checks for dependencies