# Quick Start Guide

## Local Development (No Docker)

### 1. Environment Setup
```bash
# Create .env.local at repo root
cat > .env.local <<'ENV'
# Frontend (Next.js)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev-anon-key
OPENAI_API_KEY=sk-xxx

# Backend (used in backend/)
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=dev-service-role
ENV
```

### 2. Install & Build
```bash
# Root (Next.js app)
npm ci
npm run build
npm run start  # serves on http://localhost:3000
```

### 3. Backend (separate terminal)
```bash
cd backend
npm ci
npm run build
npm run start  # serves on http://localhost:4000
```

### 4. Health Checks
```bash
# Frontend
curl -s http://localhost:3000/api/health

# Backend  
curl -s http://localhost:4000/health
```

## Docker Production Build

### 1. Sync Lockfiles
```bash
chmod +x fix-lockfiles.sh && ./fix-lockfiles.sh
```

### 2. Clean Docker State (optional but recommended)
```bash
docker system prune -af --volumes
npm cache clean --force
```

### 3. Build & Start
```bash
# Option A: Use helper script
chmod +x rebuild-production.sh && ./rebuild-production.sh

# Option B: Manual
# If BuildKit causes overlayfs errors on external SSD:
COMPOSE_DOCKER_CLI_BUILD=0 DOCKER_BUILDKIT=0 docker compose build --no-cache --progress=plain
docker compose up -d
```

### 4. Verify Containers
```bash
docker compose ps
docker logs -f backend
docker logs -f frontend
```

### 5. Health Checks
```bash
curl -s http://localhost:3000/api/health
curl -s http://localhost:4000/health
```

## External SSD Optimization (macOS)

### Docker Desktop Settings
- **CPU**: 6–8 cores (8 is optimal)
- **Memory**: 4–8 GB (6–8 GB recommended)
- **Swap**: 2–4 GB
- **Disk Location**: Internal SSD for stability (external works but may have I/O issues)

### External SSD Tips
```bash
# Disable Spotlight indexing
sudo mdutil -i off "/Volumes/T7 Shield"

# Clean Apple metadata
find . -name '._*' -type f -delete
find . -name '.DS_Store' -type f -delete
```

## Common Issues & Fixes

### ENOSPC / I/O Errors
```bash
docker system prune -af --volumes
# If persistent: Docker Desktop → Troubleshoot → Clean/Reset VM
```

### Type Errors
- Ensure API routes only export HTTP methods (GET, POST, etc.)
- Move helpers to sibling files, not in route files

### Module Import Errors
- Check path mappings in `tsconfig.json`
- Verify imports use consistent `@/` aliases

## Development Scripts

Use these for concurrent local development:

```bash
# Start both frontend and backend
npm run dev:all

# Frontend only
npm run dev

# Backend only  
npm run dev:backend
```