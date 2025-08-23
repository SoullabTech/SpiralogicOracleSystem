# Architectural Guardrails

This document describes the automated architectural checks that protect our codebase from regressions and maintain clean module boundaries.

## 🛡️ What These Guardrails Prevent

### Cross-Layer Violations
- ❌ Frontend importing backend modules directly
- ❌ Backend importing frontend code  
- ❌ App routes importing from separate frontend folder
- ❌ Routes bypassing composition root to access agents directly

### Import Anti-Patterns
- ❌ Deep relative imports (`../../../lib/something`)
- ❌ Circular dependencies between modules
- ❌ Importing from test files in production code
- ❌ Direct service ↔ agent imports (must use interfaces)

### Dependency Issues
- ❌ Production code importing dev dependencies
- ❌ Unused or missing dependencies

## 🔧 How to Run Checks

### Locally (Full Health Check)
```bash
npm run doctor
```

### Individual Checks
```bash
npm run doctor:deps      # Dependency analysis
npm run doctor:arch      # Architecture violations  
npm run doctor:imports   # Import path enforcement
npm run doctor:typecheck # TypeScript validation
npm run doctor:lint      # Code quality
npm run doctor:dead      # Dead code detection
```

### Pre-commit (Automatic)
Checks run automatically on `git commit` via husky + lint-staged.

### CI/CD (Merge Protection)
All checks must pass before merging to main branch.

## 📋 Dependency-Cruiser Rules

Our `.dependency-cruiser.cjs` enforces:

### Layer Separation
- **fe-to-be**: Frontend cannot import backend
- **be-to-fe**: Backend cannot import frontend  
- **app-to-frontend**: Next.js app cannot import legacy frontend

### Import Standards
- **no-deep-relatives**: Use `@/` alias instead of `../../../`
- **enforce-shared-interfaces**: Cross-layer communication via shared types

### Backend Architecture
- **services-to-agents**: Services use agent interfaces only
- **agents-to-services**: Agents use dependency injection
- **core-to-routes**: Core business logic independent of routes
- **routes-to-agents**: Routes use composition root (`wiring.ts`)

### General Quality
- **no-cycles**: Prevent circular dependencies
- **not-to-dev-dep**: No dev deps in production
- **no-test-imports**: No test code in production

## 🎯 Import Path Standards

### ✅ Correct Import Patterns

```typescript
// Use @/ alias for internal modules
import { buildContextPack } from '@/lib/context/buildContext';
import { SoulMemoryClient } from '@/lib/shared/memory/soulMemoryClient';

// Relative imports only for siblings/children
import { VoiceState } from './types';
import { helpers } from '../utils';

// External libraries normally
import { NextRequest } from 'next/server';
```

### ❌ Blocked Import Patterns

```typescript
// Deep relative imports - use @/ alias instead
import { buildContextPack } from '../../../../lib/context/buildContext';

// Cross-layer violations - use API endpoints instead  
import { PersonalOracleAgent } from '../../backend/src/core/agents/PersonalOracleAgent';

// Legacy frontend imports - use shared libs
import { apiClient } from '../../../frontend/lib/config';
```

## 🚀 ESLint Import Rules

Our `.eslintrc.imports.cjs` enforces:

- **import/no-relative-parent-imports**: Prevents `../../../` patterns
- **no-restricted-imports**: Blocks specific problematic paths
- **import/order**: Consistent import ordering with `@/` first

## 🔄 CI/CD Integration

### GitHub Actions Workflow
```yaml
- name: Architectural Health Check
  run: |
    npm run doctor:deps
    npm run doctor:arch  
    npm run doctor:imports
```

### Pre-commit Hooks (lint-staged)
```json
{
  "*.{ts,tsx}": [
    "eslint --fix --config .eslintrc.imports.cjs",
    "tsc --noEmit"
  ],
  "*": [
    "depcruise --config .dependency-cruiser.cjs --output-type err"
  ]
}
```

## 🛠️ Fixing Violations

### Deep Relative Imports
```bash
# Find violations
grep -r "\.\./\.\./\.\." app/ lib/ components/

# Fix by using @/ alias
# Change: ../../../../lib/providers/air
# To:     @/lib/providers/air
```

### Cross-Layer Violations
```bash
# Find frontend→backend imports
npm run doctor:arch

# Fix by:
# 1. Moving shared code to lib/shared/
# 2. Using API endpoints instead of direct imports
# 3. Creating proper service interfaces
```

### Circular Dependencies
```bash
# Visualize dependency graph
npm run audit:graph

# Fix by:
# 1. Using dependency injection
# 2. Moving shared code to separate modules
# 3. Creating proper abstraction layers
```

## 📊 Reporting

### Generate Visual Dependency Graph
```bash
npm run audit:graph
# Creates dependency-graph.svg
```

### Full Audit Report
```bash
npm run audit:all
# Creates reports/ directory with detailed analysis
```

## 🎯 Benefits

- **No Regressions**: Prevents architectural decay over time
- **Consistent Imports**: Maintainable import patterns across codebase  
- **Clean Separation**: Enforced boundaries between layers
- **Fast Builds**: Eliminates circular dependencies that slow compilation
- **Team Alignment**: Shared standards prevent inconsistencies

## 🚨 Bypassing (Emergency Only)

If you need to temporarily bypass checks (emergency hotfix):

```bash
# Skip pre-commit hooks
git commit --no-verify

# Skip CI checks (admin only)
# Add [skip ci] to commit message
```

**⚠️ Warning**: Always fix violations after emergency bypasses.

## 📚 References

- [Dependency-cruiser Documentation](https://github.com/sverweij/dependency-cruiser)
- [ESLint Import Plugin](https://github.com/import-js/eslint-plugin-import)
- [TypeScript Path Mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping)