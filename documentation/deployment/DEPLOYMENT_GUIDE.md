# 🚀 Soullab Beta Launch - Deployment Guide

## Current Status ✅
- **Build**: Successful and deployment-ready
- **Frontend**: Complete Soullab experience ready
- **Memory System**: Gracefully disabled for smooth launch
- **Core Features**: Onboarding, Holoflower, Voice, Journaling functional

## 🔹 Phase 1: Beta Launch Deployment (TODAY)

### 1. Vercel Deployment Steps

**Option A: Via GitHub (Recommended)**
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Framework auto-detects as Next.js ✅
5. Click "Deploy"

**Option B: Via CLI**
```bash
# Install Vercel CLI if needed
npm i -g vercel
vercel login

# Deploy to production
vercel --prod
```

### 2. Environment Variables for Production

Add these in Vercel Dashboard → Settings → Environment Variables:

**Required (Minimum Viable):**
```env
OPENAI_API_KEY=sk-your-openai-key-here
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your-secure-random-string-32-chars
NODE_ENV=production
```

**Optional (Enhanced Features):**
```env
# Supabase (for advanced memory features)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key

# Voice Features
ELEVENLABS_API_KEY=your-elevenlabs-api-key
NEXT_PUBLIC_ELEVENLABS_VOICE_ID=your-voice-id

# Additional AI
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
```

### 3. Post-Deployment Testing

Visit your deployed URL and verify:
- ✅ Landing page loads (`/`)
- ✅ Onboarding flow works (`/welcome`)
- ✅ Holoflower experience loads (`/holoflower`)
- ✅ Voice conversation functional (if ElevenLabs configured)
- ✅ Basic journaling saves data

### 4. Custom Domain (Optional)
- In Vercel → Settings → Domains
- Add your custom domain (e.g., `soullab.io`)
- Configure DNS records as instructed

## 🔹 Phase 2: Beta Launch Ready 🎯

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