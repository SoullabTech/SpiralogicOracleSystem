# Deployment Guide - Conversational Oracle

This guide covers deployment of the Conversational Oracle system from local development to production.

## 🔧 Local Development Build

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ and npm
- Git

### Initial Setup
```bash
# Clone and setup
git checkout main
git pull origin main
npm install
```

### Environment Configuration
Ensure `.env.local` contains the conversational settings:
```bash
# Conversational Oracle Configuration
USE_CLAUDE=true
DEMO_PIPELINE_DISABLED=true

# Conversational tuning
ATTENDING_ENFORCEMENT_MODE=relaxed
TURN_MIN_SENTENCES=4
TURN_MAX_SENTENCES=12
ALLOW_TWO_INVITES_WHEN_STUCK=true

# Maya voice + greeting
MAYA_MODE_DEFAULT=conversational
MAYA_GREETING_ENABLED=true
MAYA_GREETING_TONE=casual-wise
MAYA_DEFAULT_NAME_FALLBACK=friend
MAYA_FORCE_NAME=Kelly  # For testing only
```

### Local Build & Test
```bash
# Build the application
npm run build

# Start development stack
docker compose -f docker-compose.development.yml up --build

# Verify services
curl -s http://localhost:3000/api/oracle/turn
curl -s http://localhost:8080/api/soul-memory/health
```

### Quick Conversational Test
```bash
# Test greeting and conversational depth
curl -s -X POST "http://localhost:3000/api/oracle/turn" \
  -H "Content-Type: application/json" \
  -d '{"input":{"text":"I am not sure what is next for me."},"conversationId":"deploy-test"}' \
  | jq -r '.response.text'
```

**Expected**: Should start with "Hey Kelly..." and be 4-12 sentences.

---

## 📦 Commit & Push Process

### Pre-commit Checklist
- [ ] ✅ Local build successful (`npm run build`)
- [ ] ✅ Docker stack starts cleanly
- [ ] ✅ Conversational test passes (greeting + depth)
- [ ] ✅ All new files added to git
- [ ] ✅ No sensitive data in commits

### Commit the Conversational Baseline
```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: Conversational Oracle beta — Maya greetings, relaxed validator, Claude pipeline

- Add rotating greeting system with 7 tone buckets
- Implement 4-12 sentence conversational validation  
- Enable Claude as primary conversation generator
- Add Maya greeting integration with name personalization
- Create comprehensive beta testing suite
- Disable demo pipeline in favor of conversational depth

Transforms Oracle from terse demo bot to warm conversational guide."

# Push to main
git push origin main
```

---

## 🚀 Staging Deployment

### Vercel Deployment (Recommended for Frontend)

#### Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
vercel env add USE_CLAUDE
vercel env add DEMO_PIPELINE_DISABLED
vercel env add MAYA_GREETING_ENABLED
# ... (add all conversational env vars)
```

#### Environment Variables for Vercel
```
USE_CLAUDE=true
DEMO_PIPELINE_DISABLED=true
ATTENDING_ENFORCEMENT_MODE=relaxed
TURN_MIN_SENTENCES=4
TURN_MAX_SENTENCES=12
MAYA_GREETING_ENABLED=true
MAYA_GREETING_TONE=casual-wise
MAYA_DEFAULT_NAME_FALLBACK=friend
```

### Railway/Fly.io Deployment (Full Stack)

#### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway up

# Set environment variables
railway variables set USE_CLAUDE=true
railway variables set DEMO_PIPELINE_DISABLED=true
# ... (set all required vars)
```

#### Fly.io
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Initialize and deploy
fly launch
fly deploy

# Set secrets
fly secrets set USE_CLAUDE=true
fly secrets set DEMO_PIPELINE_DISABLED=true
# ... (set all required secrets)
```

---

## 🧪 Post-Deployment Verification

### Automated Test Suite
```bash
# Run full beta test suite against deployed URL
export BASE_URL="https://your-deployed-app.vercel.app"
./beta-test-script.sh
```

### Manual Verification Checklist
- [ ] Frontend loads at deployed URL
- [ ] Backend health check responds
- [ ] First turn includes greeting with name
- [ ] Responses are conversational (4-12 sentences)
- [ ] No greeting repetition on follow-up turns
- [ ] Admin dashboards accessible (if deployed)

### Smoke Test Commands
```bash
# Replace YOUR_DEPLOYED_URL with actual deployment URL
export DEPLOY_URL="https://your-app.vercel.app"

# Test greeting
curl -s -X POST "$DEPLOY_URL/api/oracle/turn" \
  -H "Content-Type: application/json" \
  -d '{"input":{"text":"I need some guidance today."},"conversationId":"smoke-test"}' \
  | jq -r '.response.text'

# Test follow-up (no greeting)
curl -s -X POST "$DEPLOY_URL/api/oracle/turn" \
  -H "Content-Type: application/json" \
  -d '{"input":{"text":"I feel stuck between two choices."},"conversationId":"smoke-test"}' \
  | jq -r '.response.text'
```

---

## 🔄 Continuous Deployment Workflow

### Feature Branch Process
```bash
# Create feature branch
git checkout -b feature/conversation-enhancement
# ... make changes ...
git add .
git commit -m "enhance: improve question flow in casual-wise tone"
git push origin feature/conversation-enhancement

# Create PR via GitHub/GitLab
# After review and merge, auto-deploy to staging
```

### Hotfix Process
```bash
# For urgent fixes
git checkout main
git pull origin main
git checkout -b hotfix/greeting-duplication
# ... fix issue ...
git commit -m "fix: prevent greeting duplication in same conversation"
git push origin hotfix/greeting-duplication
# Fast-track PR and deploy
```

---

## 🚨 Rollback Procedures

### Quick Rollback (Environment Variables)
```bash
# Disable conversational mode temporarily
vercel env add DEMO_PIPELINE_DISABLED=false
vercel env add USE_CLAUDE=false

# Or via platform dashboard
```

### Full Rollback (Code)
```bash
# Revert to previous commit
git log --oneline -10  # Find stable commit hash
git revert <commit-hash>
git push origin main

# Redeploy
vercel --prod
```

---

## 📊 Monitoring & Health Checks

### Essential Monitors
- Frontend response time: < 2s
- Backend health: `GET /api/soul-memory/health`
- Bridge performance: < 350ms p95
- Conversation quality: Use `BETA_FEEDBACK.md` scoring

### Log Monitoring
```bash
# Production logs
vercel logs --follow
railway logs --follow
fly logs

# Key metrics to watch
# - Greeting application rate
# - Sentence count distribution
# - Validation failure rate
# - Maya processing time
```

---

## 🎯 Beta Tester Instructions

### For Beta Testers
1. Visit the deployed URL
2. Start with: "I'm not sure what's next for me"
3. Expect warm greeting with your name
4. Continue conversation to test depth and continuity
5. Report feedback using `BETA_FEEDBACK.md` template

### Tester Access Setup
```bash
# Add tester emails to admin access (if needed)
export ADMIN_ALLOWED_EMAILS="kelly@soullab.org,tester1@example.com,tester2@example.com"

# Update in deployment environment
vercel env add ADMIN_ALLOWED_EMAILS
```

---

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env` files with real API keys
- Use platform secret management (Vercel env, Railway variables)
- Rotate API keys regularly
- Monitor for credential leaks

### Production Hardening
```bash
# Set production environment
NODE_ENV=production

# Disable debug modes
MAYA_FORCE_NAME=  # Remove for production
DEBUG_MODE=false
```

---

## 📈 Performance Optimization

### Frontend Optimization
- Enable Vercel Edge Functions for Oracle API
- Use CDN for static assets
- Implement response caching where appropriate

### Backend Optimization
- Monitor Soul Memory database performance
- Optimize Bridge enrichment timing
- Scale backend instances based on usage

---

## ✅ Deployment Checklist

### Pre-Deploy
- [ ] Local build successful
- [ ] All tests pass
- [ ] Environment variables configured
- [ ] No sensitive data in code
- [ ] Branch up to date with main

### Deploy
- [ ] Deployment command executed
- [ ] Environment variables set on platform
- [ ] DNS/domain configured (if applicable)
- [ ] SSL certificate active

### Post-Deploy
- [ ] Smoke tests pass
- [ ] Health checks green
- [ ] Admin access working
- [ ] Beta test suite passes
- [ ] Monitoring configured

---

*This deployment guide ensures consistent, reliable deployments of the Conversational Oracle system across all environments.*