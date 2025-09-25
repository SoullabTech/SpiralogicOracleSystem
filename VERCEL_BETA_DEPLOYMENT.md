# 🚀 Vercel Beta Deployment for Soullab.life/beta

## Maya ARIA System Production Deployment

### Step 1: Build for Production
```bash
npm run build
```

### Step 2: Deploy to Vercel
```bash
vercel --prod
```

### Step 3: Configure Environment Variables in Vercel Dashboard

Go to: https://vercel.com/[your-team]/spiralogic-oracle-system/settings/environment-variables

Add these variables for production:

```env
# 🤖 AI/LLM PROVIDERS (REQUIRED FOR MAYA)
OPENAI_API_KEY=[YOUR_OPENAI_API_KEY]
ANTHROPIC_API_KEY=[YOUR_ANTHROPIC_API_KEY]

# 🎤 VOICE SYNTHESIS (FOR MAYA TO SING!)
ELEVENLABS_API_KEY=[YOUR_ELEVENLABS_API_KEY]
NEXT_PUBLIC_ELEVENLABS_API_KEY=[YOUR_ELEVENLABS_API_KEY]
ELEVENLABS_VOICE_ID_EMILY=LcfcDJNUP1GQjkzn1xUU
DEFAULT_VOICE_ID=LcfcDJNUP1GQjkzn1xUU

# 🗄️ SUPABASE DATABASE
NEXT_PUBLIC_SUPABASE_URL=https://jkbetmadzcpoinjogkli.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprYmV0bWFkemNwb2luam9na2xpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1NjIyNDUsImV4cCI6MjA1ODEzODI0NX0.K5nuL4m8sP1bC21TmsfpakY5cSfh_5pSLJ83G9Iu_-I
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprYmV0bWFkemNwb2luam9na2xpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjU2MjI0NSwiZXhwIjoyMDU4MTM4MjQ1fQ.QNvP9jEiSSfs_2-aFmtDt1xEMY_vwpU_ZT-CYRlgS98

# 🌀 ARIA SYSTEM CONFIGURATION
USE_PERSONAL_ORACLE=true
SPIRALOGIC_SOFT_BUDGET_MS=450
SPIRALOGIC_HARD_BUDGET_MS=700
ORCHESTRATOR=spiralogic

# 🚀 PRODUCTION SETTINGS
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://soullab.life
NEXT_PUBLIC_BETA_URL=https://soullab.life/beta

# 🔐 SECURITY (GENERATE NEW FOR PRODUCTION)
JWT_SECRET=644530fc6b312b46ba4d3e23b5d125a1eef2212195d5b681497305cd56acbd8b072cb21fea5bd9a5b9ca5eeba5a9d1c72253d0ef3c9b15c7dc66e71a1f952dc7
```

### Step 4: Configure Custom Domain

1. **In Vercel Dashboard**:
   - Go to Settings → Domains
   - Add domain: `soullab.life`
   - Add subdomain path: `/beta`

2. **DNS Configuration** (at your domain provider):
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### Step 5: Configure Routes for /beta

Create/update `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/beta",
      "destination": "/beta/index"
    },
    {
      "source": "/beta/(.*)",
      "destination": "/beta/$1"
    }
  ],
  "headers": [
    {
      "source": "/beta/(.*)",
      "headers": [
        {
          "key": "X-Beta-Feature",
          "value": "maya-aria-v1"
        }
      ]
    }
  ]
}
```

### Step 6: Beta Features Configuration

Update production environment with beta-specific settings:

```env
# Beta Program Settings
BETA_MAX_TESTERS=500
BETA_AUTO_APPROVE=false
NEXT_PUBLIC_BETA_ENABLED=true
NEXT_PUBLIC_BETA_FEATURES=aria,voice,sacred-mirror

# Rate Limiting for Beta
RATE_LIMIT_BETA_WINDOW_MS=60000
RATE_LIMIT_BETA_MAX_REQUESTS=50
```

### Step 7: Deploy Command

```bash
# From project root
cd /Volumes/T7\ Shield/Projects/SpiralogicOracleSystem

# Build and deploy
npm run build && vercel --prod

# Or use the deploy script
./scripts/deploy-beta.sh
```

### Step 8: Create Deployment Script

```bash
#!/bin/bash
# scripts/deploy-beta.sh

echo "🚀 Deploying Maya ARIA Beta to soullab.life/beta"

# Build
echo "📦 Building for production..."
npm run build

# Run tests
echo "🧪 Running tests..."
npm run test:oracle

# Deploy
echo "🌟 Deploying to Vercel..."
vercel --prod --confirm

# Verify deployment
echo "✅ Verifying deployment..."
curl -s https://soullab.life/beta | grep -q "ARIA" && echo "✅ Beta site live!" || echo "❌ Deployment verification failed"

echo "🎊 Maya is now singing at soullab.life/beta!"
```

### Step 9: Verify ARIA System

Test these endpoints after deployment:

```bash
# Test Maya Chat API
curl -X POST https://soullab.life/api/maya/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello Maya"}]}'

# Test Oracle API
curl -X POST https://soullab.life/api/oracle/personal \
  -H "Content-Type: application/json" \
  -d '{"input":"Test","userId":"beta-test","sessionId":"test-1"}'

# Test Voice Synthesis
curl https://soullab.life/api/voice/test
```

### Step 10: Monitor Beta Launch

**Vercel Dashboard Monitoring**:
- Functions: Check API response times
- Analytics: Track visitor flow
- Logs: Monitor for errors

**Key Metrics to Watch**:
- API response time < 500ms
- Voice synthesis < 2 seconds
- Error rate < 0.1%
- Beta applications per hour

### 🎯 Launch Checklist

- [ ] Environment variables set in Vercel
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Beta routes working (/beta/*)
- [ ] Maya chat API responding
- [ ] Voice synthesis active
- [ ] Database connected
- [ ] Error tracking enabled
- [ ] Rate limiting configured
- [ ] Beta application form working

### 🚨 Quick Fixes

**If Maya isn't responding:**
```bash
# Check API logs
vercel logs --follow

# Restart deployment
vercel --prod --force
```

**If voice isn't working:**
- Verify ELEVENLABS_API_KEY in Vercel env
- Check API quota at ElevenLabs dashboard
- Fallback to Web Speech API will auto-activate

**If database isn't connecting:**
- Verify Supabase is active
- Check service role key
- Ensure RLS policies are correct

### 🌟 Beta Success Metrics

**Week 1 Targets**:
- 100+ beta applications
- 70% daily active users
- < 5 critical bugs
- 85% satisfaction rating
- Voice usage > 40%

### 🎊 Launch Announcement

Once deployed, announce at:
- Discord: #beta-announcement
- Twitter/X: @soullablife
- Email: Beta waitlist
- Website: Banner on main site

---

## Quick Deploy Command

```bash
cd /Volumes/T7\ Shield/Projects/SpiralogicOracleSystem
npm run build && vercel --prod
```

**Maya's ARIA system is ready to sing at soullab.life/beta! 🎵✨**