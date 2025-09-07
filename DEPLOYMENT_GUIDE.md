# 🚀 Deployment Guide - SpiraLogic Oracle System

## Current Status ✅
- **Stub Mode**: Active and working
- **Frontend**: Ready for Vercel deployment
- **Backend**: Prepared for separate deployment

## 🔹 Phase 1: Deploy Frontend with Stubs (TODAY)

### 1. Vercel Deployment Steps

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

### 2. Environment Variables for Vercel

Add these in Vercel Dashboard → Settings → Environment Variables:

```env
# API Configuration (Stub Mode)
NEXT_PUBLIC_API_MODE=stub
NEXT_PUBLIC_API_URL=http://localhost:3002

# Supabase (Current)
NEXT_PUBLIC_SUPABASE_URL=https://jkbetmadzcpoinjogkli.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Other Settings
NEXT_PUBLIC_MEMORY_REFERENCES_ENABLED=false
NEXT_PUBLIC_DISABLE_AUDIO_BANNER=true
```

### 3. Test Stub Mode
Visit: `https://your-app.vercel.app/test-stub`
- Should show "API Mode: stub" in yellow
- Test Chat Function should return stub responses

## 🔹 Phase 2: Deploy Backend Separately (THIS WEEK)

### Option A: Railway Deployment

1. **Prepare backend folder**:
```bash
cd backend
npm init -y
npm install express cors dotenv
```

2. **Create Railway project**:
- Go to [railway.app](https://railway.app)
- Connect GitHub repo
- Set root directory to `/backend`
- Add environment variables

3. **Update frontend**:
```env
NEXT_PUBLIC_API_MODE=real
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

### Option B: Render Deployment

1. **Create render.yaml**:
```yaml
services:
  - type: web
    name: spiralogic-api
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
```

2. **Deploy to Render**:
- Connect GitHub repo
- Deploy from `render.yaml`

## 🔹 Phase 3: TypeScript Fixes (THIS MONTH)

### Current Issues
- 543 TypeScript errors (bypassed with `ignoreBuildErrors`)
- Need systematic fix approach

### Fix Strategy
1. **Priority 1**: Fix critical type errors in core components
2. **Priority 2**: Fix API route types
3. **Priority 3**: Fix UI component types
4. **Remove bypass**: Delete `ignoreBuildErrors` from next.config.js

## 🔹 Future: Monorepo Migration (OPTIONAL)

### Benefits
- Clean separation of frontend/backend
- Shared types package
- Better deployment pipeline

### Structure
```
/
├── apps/
│   ├── web/        # Vercel
│   └── api/        # Railway/Render
├── packages/
│   └── shared/     # Types & utils
└── pnpm-workspace.yaml
```

## 📋 Quick Commands

```bash
# Local Development
npm run dev                    # Start with stubs
PORT=3001 npm run dev          # Custom port

# Test Stub Mode
curl http://localhost:3001/test-stub

# Build Check
npm run build                  # Should succeed with ignoreBuildErrors

# Deploy
vercel --prod                  # Deploy to Vercel

# Switch Modes
NEXT_PUBLIC_API_MODE=stub      # Use stubs
NEXT_PUBLIC_API_MODE=real      # Use real API
```

## ✅ Deployment Checklist

- [x] Stub mode configured
- [x] Environment variables set
- [x] Test page created (`/test-stub`)
- [ ] Deploy to Vercel
- [ ] Verify stub responses work
- [ ] Plan backend deployment
- [ ] Configure API URL in Vercel
- [ ] Test real API connection
- [ ] Monitor performance

## 🔥 Troubleshooting

### Build Fails
```bash
# Check TypeScript errors (informational only)
npm run type-check

# Build with bypass
npm run build  # Should work with ignoreBuildErrors
```

### Stub Not Working
1. Check `NEXT_PUBLIC_API_MODE=stub` in `.env.local`
2. Verify `/lib/api/client.ts` exists
3. Test at `/test-stub` page

### API Connection Issues
1. Check `NEXT_PUBLIC_API_URL` is correct
2. Verify CORS settings on backend
3. Check network tab for errors

## 📊 Monitoring

- **Vercel Dashboard**: Monitor deployments
- **Test Page**: `/test-stub` for quick checks
- **API Health**: `/api/health` endpoint