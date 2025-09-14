# 🚀 Vercel + Render Deployment Guide

## 📁 Monorepo Structure (Preserved)
```
SpiralogicOracleSystem/
├── app/                    # Next.js frontend (deployed to Vercel)
├── components/             # React components
├── lib/                    # Frontend utilities
├── public/                 # Static assets
├── apps/api/backend/       # Express backend (deployed to Render)
├── .vercelignore          # Tells Vercel what to ignore
├── render.yaml            # Render configuration
├── vercel.json            # Vercel configuration
└── package.json           # Root package.json for frontend
```

## ✅ Configuration Files Created

### 1. `.vercelignore` - Excludes backend from Vercel
```
apps/api/backend/
backend/
server/
Dockerfile
docker-compose.yml
render.yaml
```

### 2. `render.yaml` - Backend deployment config
```yaml
services:
  - type: web
    name: spiralogic-oracle-backend
    runtime: node
    rootDir: apps/api/backend
    buildCommand: "npm install && npm run build"
    startCommand: "npm run start"
    envVars:
      - key: PORT
        value: 3002
      - key: NODE_ENV
        value: production
```

### 3. `.env.template` - Environment variable reference
- Vercel variables (NEXT_PUBLIC_*)
- Render variables (private keys)

## 🚀 Deployment Steps

### Step 1: Deploy Backend to Render

1. **Connect GitHub Repository**
   ```
   - Go to render.com
   - New → Web Service
   - Connect your GitHub repo
   - Render will auto-detect render.yaml
   ```

2. **Add Environment Variables in Render**
   ```env
   SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_KEY=your-service-key
   OPENAI_API_KEY=your-openai-key
   ANTHROPIC_API_KEY=your-anthropic-key
   ELEVENLABS_API_KEY=your-elevenlabs-key
   HUGGINGFACE_API_KEY=your-huggingface-key
   PORT=3002
   NODE_ENV=production
   CORS_ORIGIN=https://your-app.vercel.app
   ```

3. **Deploy**
   - Click "Create Web Service"
   - Wait for build and deployment
   - Note your backend URL: `https://your-backend.onrender.com`

### Step 2: Deploy Frontend to Vercel

1. **Import Project**
   ```
   - Go to vercel.com
   - Import Git Repository
   - Select your GitHub repo
   ```

2. **Configure Build Settings**
   ```
   Framework Preset: Next.js
   Root Directory: ./ (leave default)
   Build Command: npm run build
   Output Directory: .next
   ```

3. **Add Environment Variables in Vercel**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build completion
   - Your frontend is live at: `https://your-app.vercel.app`

## 🧪 Testing Deployment

### Test Backend (Render)
```bash
# Health check
curl https://your-backend.onrender.com/health

# Test API endpoint
curl https://your-backend.onrender.com/api/oracle/status
```

### Test Frontend (Vercel)
```bash
# Visit in browser
https://your-app.vercel.app

# Check API connection in browser console
# Should see successful API calls to backend
```

## 🔧 Local Development (Unchanged)

```bash
# Frontend (root directory)
npm run dev
# Runs on http://localhost:3000

# Backend (in separate terminal)
cd apps/api/backend
npm run dev
# Runs on http://localhost:3002

# Both run together for full-stack development
```

## 🎯 Verification Checklist

### Backend (Render)
- [ ] Service is deployed and running
- [ ] `/health` endpoint responds with 200
- [ ] Environment variables are set
- [ ] CORS allows Vercel frontend URL
- [ ] API endpoints respond correctly

### Frontend (Vercel)
- [ ] Site loads without errors
- [ ] Environment variables are set
- [ ] API calls reach backend successfully
- [ ] No CORS errors in browser console
- [ ] Sacred tools (Astrology/Divination) work

## 🚨 Common Issues & Solutions

### Issue: CORS Errors
```javascript
// Fix: Update CORS_ORIGIN in Render to exact Vercel URL
CORS_ORIGIN=https://spiralogic-oracle-system.vercel.app
```

### Issue: API Connection Failed
```javascript
// Fix: Ensure NEXT_PUBLIC_API_URL in Vercel is correct
NEXT_PUBLIC_API_URL=https://spiralogic-oracle-backend.onrender.com
```

### Issue: Build Fails on Vercel
```bash
# Check .vercelignore is excluding backend files
# Ensure all frontend deps are in root package.json
```

### Issue: Build Fails on Render
```bash
# Verify render.yaml rootDir is correct
# Check backend package.json has all dependencies
```

## 📊 Monitoring & Logs

### Vercel
- Analytics: Automatic with deployment
- Logs: Vercel Dashboard → Functions → Logs
- Errors: Vercel Dashboard → Functions → Errors

### Render
- Logs: Render Dashboard → Services → Logs
- Metrics: Render Dashboard → Services → Metrics
- Health: Configure health checks in Render

## 🔄 Continuous Deployment

Both platforms auto-deploy on push to main:
- **Vercel**: Instant preview deployments for PRs
- **Render**: Auto-deploy can be disabled in render.yaml

## 💡 Pro Tips

1. **Environment Variables**
   - Use Vercel's environment variable groups for staging/production
   - Render supports environment groups too

2. **Performance**
   - Vercel: Use ISR for dynamic content
   - Render: May have cold starts on free tier

3. **Scaling**
   - Vercel: Automatic scaling for frontend
   - Render: Configure auto-scaling in dashboard

4. **Costs**
   - Vercel: Free tier generous for frontend
   - Render: Free tier includes 750 hours/month

## ✨ Success Indicators

When everything works:
1. ✅ Frontend loads at Vercel URL
2. ✅ Backend responds at Render URL
3. ✅ No CORS errors
4. ✅ API calls successful
5. ✅ Sacred tools functional
6. ✅ Data persists in Supabase

## 📝 Next Steps

After successful deployment:
1. Set up domain names
2. Configure SSL certificates (automatic on both)
3. Set up monitoring/alerting
4. Configure backup strategies
5. Implement CI/CD pipelines

---

**Ready for Production!** 🎉

Your monorepo now deploys seamlessly to:
- **Frontend**: Vercel (optimal for Next.js)
- **Backend**: Render (great for Node.js APIs)
- **Structure**: Monorepo preserved for easy development