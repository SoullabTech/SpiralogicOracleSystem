# Duplicate Agent Implementations - Cleanup Plan

## Current State Analysis

### PersonalOracleAgent Implementations

✅ **Canonical Implementation**: `/backend/src/core/agents/PersonalOracleAgent.ts`
- Main implementation with full functionality
- All tests and services should import from here

🔄 **Re-export Compatibility Files**: 
- `/backend/src/agents/PersonalOracleAgent.ts` - Re-exports canonical version
- `/backend/src/agents/personal_oracle/PersonalOracleAgent.ts` - Re-exports canonical version

🗑️ **Deprecated Files**:
- `/backend/deprecated/1754856208111/PersonalOracleAgent.ts` - Already in deprecated folder

## Cleanup Strategy

### Phase 1: Update Import Paths (Safe Migration)
Update all imports to use the canonical path:

```typescript
// ❌ Old imports
import { PersonalOracleAgent } from '../agents/PersonalOracleAgent';
import { PersonalOracleAgent } from '../agents/personal_oracle/PersonalOracleAgent';

// ✅ New canonical import
import { PersonalOracleAgent } from '../core/agents/PersonalOracleAgent';
```

### Phase 2: Remove Re-export Files
After all imports are updated, remove:
- `/backend/src/agents/PersonalOracleAgent.ts`
- `/backend/src/agents/personal_oracle/PersonalOracleAgent.ts`

## Files to Update (27 total)

### Backend API Files
- `backend/api/oracle/personal/insight.ts`

### Backend Service Files  
- `backend/src/services/retreatOnboardingService.ts`
- `backend/src/services/postRetreatService.ts`
- `backend/src/services/soulMemoryService.ts`

### Core Orchestration Files
- `backend/src/core/orchestration/wiring.ts`
- `backend/src/core/orchestration/HierarchyOrchestrator.ts`

### Test Files (15 files)
- `backend/tests/performance.test.ts`
- `backend/tests/integration.test.ts`
- `backend/tests/sacred-mirror.test.ts`
- `backend/src/tests/test-retreat-mode.ts`
- `backend/src/tests/test-jung-buddha-mirror.ts`
- `backend/src/tests/test-transformation-journey.ts`
- `backend/src/tests/test-archetypal-patterns.ts`
- `backend/src/tests/test-memory-continuity.ts`
- `backend/src/tests/test-breakthrough-detection.ts`
- `backend/src/tests/test-oracle-modes.ts`
- `backend/src/tests/quick-memory-test.ts`
- `backend/src/tests/soul-memory-integration.test.ts`

### Example Files (3 files)
- `backend/src/core/agents/examples/StreamlinedOracleDemo.ts`
- `backend/src/core/agents/examples/DualWisdomExample.ts`
- `backend/src/core/agents/examples/JungBuddhaExamples.ts`

## Automated Migration Script

```bash
#!/bin/bash
# migrate-personal-oracle-imports.sh

# Update all imports to canonical path
find backend/src -name "*.ts" -type f -exec sed -i '' \
  -e 's|from "../agents/PersonalOracleAgent"|from "../core/agents/PersonalOracleAgent"|g' \
  -e 's|from "../../agents/PersonalOracleAgent"|from "../../core/agents/PersonalOracleAgent"|g' \
  -e 's|from "../agents/personal_oracle/PersonalOracleAgent"|from "../core/agents/PersonalOracleAgent"|g' \
  -e 's|from "../../agents/personal_oracle/PersonalOracleAgent"|from "../../core/agents/PersonalOracleAgent"|g' \
  {} \;

# Update test imports
find backend/tests -name "*.ts" -type f -exec sed -i '' \
  -e 's|from "../src/core/agents/PersonalOracleAgent.js"|from "../src/core/agents/PersonalOracleAgent"|g' \
  {} \;

echo "✅ Import paths updated to canonical location"
```

## Benefits of Cleanup

1. **Single Source of Truth**: One canonical implementation
2. **Reduced Confusion**: Clear import paths
3. **Easier Maintenance**: No need to sync multiple files
4. **Better Architecture**: Follows hexagonal architecture principles

## Validation Steps

After migration:
1. Run `npm run typecheck` - Ensure no import errors
2. Run `npm run test` - Ensure all tests pass
3. Run `npm run doctor` - Verify dependency graph is clean
4. Search for remaining duplicate patterns: `grep -r "PersonalOracleAgent" backend/src`

## Status

- ✅ **Analysis Complete**: Identified all duplicate implementations
- ✅ **Migration Plan**: Created safe migration strategy  
- 🚧 **In Progress**: Ready for automated migration
- ⏳ **Pending**: Import path updates and cleanup