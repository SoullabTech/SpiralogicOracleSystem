# 🏗️ Monorepo Migration Plan

## Current Status
✅ **Part 1 Complete**: Minimal build deployed with stub mode
- Removed problematic pages to app-backup/
- Build succeeds with warnings
- Stub mode working locally

## Part 2: Monorepo Structure

### New Directory Structure
```
SpiralogicOracleSystem/
├── apps/
│   ├── web/           # Next.js frontend (Vercel)
│   │   ├── app/       # App router pages
│   │   ├── components/
│   │   ├── lib/
│   │   └── package.json
│   └── api/           # Backend service (Railway/Render)
│       ├── src/
│       ├── tests/
│       └── package.json
├── packages/
│   └── shared/        # Shared code
│       ├── types/
│       ├── utils/
│       └── package.json
├── pnpm-workspace.yaml
├── package.json       # Root package.json
└── turbo.json        # Turborepo config (optional)
```

### Migration Steps

#### Phase 1: Setup Structure
```bash
# Create directories
mkdir -p apps/web apps/api packages/shared

# Create workspace config
cat > pnpm-workspace.yaml << EOF
packages:
  - "apps/*"
  - "packages/*"
EOF
```

#### Phase 2: Move Frontend
```bash
# Move current app to web
mv app apps/web/
mv components apps/web/
mv lib apps/web/
mv public apps/web/
cp package.json apps/web/
cp next.config.js apps/web/
cp tsconfig.json apps/web/
```

#### Phase 3: Create Backend
```bash
# Setup backend structure
mkdir -p apps/api/src
# Move backend files from app-backup/api
mv app-backup/api/* apps/api/src/
```

#### Phase 4: Shared Package
```bash
# Create shared types
mkdir -p packages/shared/types
echo "export * from './types';" > packages/shared/index.ts
```

### Package.json Updates

#### Root package.json
```json
{
  "name": "spiralogic-oracle-system",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "dev:web": "pnpm --filter @spiralogic/web dev",
    "dev:api": "pnpm --filter @spiralogic/api dev",
    "build:web": "pnpm --filter @spiralogic/web build",
    "build:api": "pnpm --filter @spiralogic/api build"
  },
  "devDependencies": {
    "turbo": "latest"
  }
}
```

#### apps/web/package.json
```json
{
  "name": "@spiralogic/web",
  "version": "0.1.0",
  "dependencies": {
    "@spiralogic/shared": "workspace:*",
    // ... existing deps
  }
}
```

#### apps/api/package.json
```json
{
  "name": "@spiralogic/api",
  "version": "0.1.0",
  "dependencies": {
    "@spiralogic/shared": "workspace:*",
    "express": "^4.18.0",
    "cors": "^2.8.5"
  }
}
```

### Deployment Updates

#### Vercel (Frontend)
- Root directory: `apps/web`
- Build command: `cd ../.. && pnpm build:web`
- Output directory: `apps/web/.next`

#### Railway/Render (Backend)
- Root directory: `apps/api`
- Build command: `pnpm install && pnpm build`
- Start command: `pnpm start`

### Benefits
1. ✅ **Clean separation** of frontend and backend
2. ✅ **Independent deployments**
3. ✅ **Shared types** prevent drift
4. ✅ **Better scalability**
5. ✅ **TypeScript fixes** can be gradual

### Next Actions
1. Run migration script
2. Test monorepo locally
3. Update CI/CD pipelines
4. Deploy frontend to Vercel
5. Deploy backend to Railway/Render