# Pre-Beta Testing Checklist

## Overview
Run these tests before every beta session to ensure MAIA is at her best. This document provides a systematic approach to validation and quality assurance.

---

## Daily Health Check (5 minutes)

### Quick Production Health
```bash
# Check production health endpoint
curl https://soullab.life/api/health/maia

# Or for local testing
curl http://localhost:3000/api/health/maia
```

**Expected**: All components should show `"status": "healthy"`

### System Health Check
```bash
npm run health
```

**Expected**: Health score ≥ 80%, all critical tests passing

---

## Pre-Beta Full Test Suite (15 minutes)

Run these tests in order before launching beta sessions:

### 1. Core Functionality Tests

#### Test Voice-to-Text Recognition
```bash
# Manual test: Open voice interface
# Say: "Good morning, Maya"
# Expected: MAIA hears and transcribes correctly
```

#### Test MAIA Response Quality
```bash
npm run test:convo:interactive

# Try these test phrases:
# 1. "I'm feeling stuck in my life"
# 2. "Tell me about yourself"
# 3. "What should I do about my relationship?"
```

**Expected**:
- Responses feel natural and human
- No obvious hallucinations or errors
- Appropriate emotional attunement
- No repetitive phrases

### 2. Voice System Tests

#### Test Text-to-Speech
```bash
# Manual: Send message in voice mode
# Expected: MAIA speaks response clearly
```

#### Test Voice Loop Prevention
```bash
# Manual: Speak → Wait for response → Speak again
# Expected: No feedback loops, no stuck microphone
```

### 3. Memory & Context Tests

#### Test Conversation Memory
```bash
npm run test:memory

# Or manual test:
# 1. Tell MAIA your name
# 2. Have a short conversation
# 3. Ask "What's my name?"
```

**Expected**: MAIA remembers context from earlier in conversation

### 4. Production Deployment Tests

#### Test Production API
```bash
npm run test:smoke:prod

# Manual alternative:
# Visit https://soullab.life/maya
# Complete one full conversation
```

#### Check Production Logs
```bash
# In Vercel dashboard:
# 1. Check for errors in last hour
# 2. Look for mycelialNetwork errors
# 3. Verify no infinite loops
```

### 5. Beta Flow Tests

#### Test Onboarding Flow
```bash
# Manual: Go through beta signup
# 1. Visit /beta-entry
# 2. Review FAQ page
# 3. Complete onboarding
# 4. Reach Maya interface
```

**Expected**: Smooth flow, no broken links, FAQ displays correctly

---

## Critical Issues Checklist

Before beta, verify these common issues are **NOT** present:

- [ ] MAIA repeating same response in loop
- [ ] Voice recognition stuck/not resuming after response
- [ ] Missing `accessCollectiveWisdom` error
- [ ] 3500+ console log messages
- [ ] Microphone feedback during MAIA speech
- [ ] Voice not restarting after MAIA finishes
- [ ] Hallucinations or nonsensical responses
- [ ] Missing conversation context
- [ ] FAQ page shows errors
- [ ] Broken voice/chat toggle

---

## Weekly Deep Tests (30 minutes)

Run these once per week:

### Conversational Intelligence
```bash
npm run test:convo:batch
```

### Neurodivergence Support
```bash
npm run test:neuro
```

### Memory Flow
```bash
npm run test:memory:debug
```

### Active Listening Quality
```bash
npm run dev:listening
```

---

## Monitoring Production

### Real-Time Health Monitoring

Add this to your monitoring system:
```bash
*/5 * * * * curl https://soullab.life/api/health/maia
```

### Key Metrics to Watch

1. **Response Time**: Should be < 3000ms
2. **Error Rate**: Should be < 1%
3. **Voice Loop Rate**: Should be 0%
4. **Successful Conversations**: Track completion rate

### Error Patterns to Watch For

Check Vercel logs for:
- `this.mycelialNetwork.accessCollectiveWisdom is not a function`
- `Recognition already stopped`
- `Could not start recognition`
- `TypeError: Cannot read properties of undefined`

---

## Pre-Beta Launch Checklist

Complete this checklist the day before beta launches:

### Environment
- [ ] All API keys configured (Anthropic, OpenAI, ElevenLabs)
- [ ] Supabase connection working
- [ ] Environment variables set in production

### Core Functionality
- [ ] Health endpoint returns all "healthy" status
- [ ] Voice recognition starts automatically
- [ ] MAIA responses are contextual and appropriate
- [ ] No infinite loops or repeated responses
- [ ] Voice resumes after MAIA finishes speaking

### User Experience
- [ ] FAQ page loads and displays correctly
- [ ] Onboarding flow completes smoothly
- [ ] Voice/Chat toggle works
- [ ] Mobile experience is functional
- [ ] Microphone permissions work

### Performance
- [ ] Page load < 3 seconds
- [ ] Response time < 3 seconds
- [ ] No console errors
- [ ] Memory usage stable

### Content
- [ ] FAQ answers all common concerns
- [ ] Onboarding sets proper expectations
- [ ] MAIA's voice/personality feels right
- [ ] Language matches brand guidelines

---

## Emergency Rollback Procedure

If critical issues are found during beta:

1. **Pause New Beta Signups**
   - Disable `/beta-entry` temporarily
   - Show maintenance message

2. **Identify the Issue**
   ```bash
   # Check health endpoint
   curl https://soullab.life/api/health/maia

   # Check Vercel logs
   # Look for error patterns
   ```

3. **Quick Fixes**
   - For voice issues: Check SimplifiedOrganicVoice.tsx
   - For response loops: Check MycelialNetwork.ts
   - For memory issues: Check MayaOrchestrator.ts

4. **Rollback if Needed**
   ```bash
   # Revert to last known good commit
   git revert HEAD
   git push origin main
   ```

5. **Notify Beta Testers**
   - Send email explaining brief pause
   - Set expectations for resolution time

---

## Automated Testing Setup

### GitHub Actions (Recommended)

Create `.github/workflows/pre-beta-health.yml`:
```yaml
name: Pre-Beta Health Check
on:
  schedule:
    - cron: '0 8 * * *'  # Daily at 8am
  workflow_dispatch:

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run health
      - run: npm run test:smoke:prod
```

### Local Automation

Add to `package.json`:
```json
{
  "scripts": {
    "pre-beta:check": "npm run health && npm run test:smoke:prod && echo '✅ Pre-beta checks passed!'"
  }
}
```

Run before each beta session:
```bash
npm run pre-beta:check
```

---

## Success Criteria

MAIA is ready for beta when:

✅ Health score ≥ 90%
✅ No critical errors in last 24 hours
✅ Voice system works end-to-end
✅ No feedback loops or stuck states
✅ Responses feel natural and contextual
✅ Memory persists through conversation
✅ FAQ page displays correctly
✅ Onboarding completes smoothly

---

## Support Resources

- **Health Endpoint**: `/api/health/maia`
- **System Health**: `npm run health`
- **Interactive Testing**: `npm run test:convo:interactive`
- **Smoke Tests**: `npm run test:smoke:prod`
- **Logs**: Vercel Dashboard → Functions → Logs
- **Rollback**: `git revert HEAD && git push`

---

## Notes

- Run `npm run health` every morning before beta work
- Check `/api/health/maia` before launching new beta sessions
- Keep this checklist updated as new issues are discovered
- Document any new failure patterns in "Error Patterns to Watch For"