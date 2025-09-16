# TypeScript Error Triage Roadmap

## Executive Summary
- **Total Errors**: 1109
- **Dev Server**: ✅ Running successfully with `ts-node --transpile-only`
- **Production Build**: ✅ Working with `esbuild` (npm run build:prod)
- **Strategy**: Progressive fixes during beta phase

## Error Distribution by Type

### 🚨 Critical Runtime Risks (Priority 1)
**534 instances - TS2339**: Property does not exist on type
- **Impact**: Can cause runtime crashes when accessing undefined properties
- **Common patterns**:
  - `Property 'response' does not exist on type 'ConversationalResult'`
  - `Property 'voiceUrl' does not exist on type 'ConversationalResult'`
  - `Property 'getOracleState' does not exist on type 'PersonalOracleAgent'`
- **Fix Strategy**: Add missing properties to interfaces or use optional chaining

### ⚠️ Module Resolution Issues (Priority 2)
**114 instances - TS2307**: Cannot find module
- **Impact**: Module imports failing, potential build failures
- **Common patterns**:
  - `Cannot find module '../core/di/container'`
  - `Cannot find module '@aws-sdk/client-s3'` (✅ Fixed)
- **Fix Strategy**: Check import paths, install missing dependencies

### 🔧 Type Mismatches (Priority 3)
**72 instances - TS2353**: Object literal may only specify known properties
**72 instances - TS2305**: Module has no exported member
- **Impact**: API contract violations, data structure inconsistencies
- **Common patterns**:
  - `'content' does not exist in type 'Partial<OracleInsight>'`
  - `Module has no exported member 'elementalRouter'`
- **Fix Strategy**: Update type definitions to match actual usage

### 📝 Function Signature Issues (Priority 4)
**35 instances - TS2554**: Expected X arguments, but got Y
- **Impact**: Function calls with wrong parameters
- **Fix Strategy**: Update function calls or signatures

## File-Based Priority List

### High-Risk Files (Fix First)
1. **ConversationalOrchestrator.ts** - Core orchestration logic
2. **PersonalOracleAgent.ts** - Main oracle functionality
3. **agentOrchestrator.ts** - Agent coordination
4. **ElementalAgents** (Air, Fire, Water, Earth, Aether) - Core agent logic

### Medium-Risk Files
1. **Services** - LayeredAgentService, MultiAgentChoreography
2. **Types** - ceremonyIntelligence, agentResponse
3. **Routes** - oracle.routes, soulMemory.routes

### Low-Risk Files (Cleanup)
1. **Test files** - standalone tests in tools/
2. **Utilities** - persistentMemory, index
3. **Deprecated modules** - Old DI container references

## Implementation Plan

### Week 1 (Beta Launch)
- [x] Setup esbuild for production builds
- [ ] Fix critical runtime risks in ConversationalOrchestrator
- [ ] Resolve PersonalOracleAgent property issues
- [ ] Monitor error logs for actual runtime failures

### Week 2 (Beta Stabilization)
- [ ] Fix module resolution issues
- [ ] Update type definitions for OracleInsight
- [ ] Clean up elemental agent interfaces
- [ ] Add missing exports to services

### Week 3 (Beta Polish)
- [ ] Fix function signature mismatches
- [ ] Remove deprecated DI container references
- [ ] Clean up test files
- [ ] Run full type check and address remaining issues

## Quick Fixes for Common Patterns

### Pattern 1: Missing Properties
```typescript
// Before
interface ConversationalResult {
  // missing properties
}

// After
interface ConversationalResult {
  response?: string;
  voiceUrl?: string;
  message?: string;
  tokens?: {
    prompt: number;
    completion: number;
  };
}
```

### Pattern 2: Module Exports
```typescript
// Before
import { elementalRouter } from '../services/ElementalIntelligenceRouter';

// After
// In ElementalIntelligenceRouter.ts
export const elementalRouter = /* ... */;
```

### Pattern 3: Type Index Signatures
```typescript
// Before (in ceremonyIntelligence.ts)
[key: string]: { presence: number; activation: number; };
facilitator: number; // Error: not assignable to index

// After
[key: string]: number | { presence: number; activation: number; };
```

## Monitoring During Beta

### Key Metrics to Track
1. **Error Logs**: Watch for TypeErrors in production
2. **API Failures**: Monitor 500 errors related to type issues
3. **User Reports**: Track bugs related to undefined properties
4. **Build Times**: Compare tsc vs esbuild performance

### Emergency Patches
If critical errors emerge during beta:
```bash
# Quick production build (bypasses TS checks)
npm run build:prod

# Deploy with PM2
pm2 start dist/server.js --name soullab-api
```

## Success Criteria
- [ ] Zero runtime TypeErrors in production logs
- [ ] All core user flows working without crashes
- [ ] Type safety for all API contracts
- [ ] Clean `npm run build` without errors (post-beta goal)

## Notes
- esbuild provides a viable production path while TS issues are resolved
- Many errors are interconnected - fixing interfaces will cascade
- Consider using `unknown` type temporarily for complex integrations
- The sacred attending principle applies to code: witness errors, don't force fixes

---
*Created during Beta Launch preparation*
*Last Updated: September 9, 2025*