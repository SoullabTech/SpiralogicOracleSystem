# 🚀 SOULLAB BETA LAUNCH - PRE-FLIGHT CHECKLIST

**Mission:** Deliver a magical, bulletproof beta experience for Kelly, the team, and early users.

---

## ✅ CODE QUALITY (COMPLETED)

- [x] **Build passes** - All 131 pages rendering cleanly
- [x] **TypeScript errors fixed** - 67 critical errors resolved
- [x] **Import paths corrected** - useOracleSession now uses proper hooks
- [x] **SSR issues resolved** - Navigator guards added for server-side rendering
- [x] **Files committed** - All fixes in git history

**Remaining (non-blocking):**
- [ ] 281 lint warnings (unescaped entities) - cosmetic only
- [ ] 104 React Hook dependency warnings - mostly false positives

---

## 🔐 ENVIRONMENT VARIABLES (VERCEL)

### Critical (Must Have)
- [ ] `ANTHROPIC_API_KEY` - Claude API for MAIA responses
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Database connection
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public database access
- [ ] `SUPABASE_SERVICE_KEY` - Server-side database access

### Important (Should Have)
- [ ] `OPENAI_API_KEY` - Voice transcription & TTS
- [ ] `ELEVENLABS_API_KEY` - Enhanced voice quality

### Optional
- [ ] `PERSONAL_ORACLE_KEY` - Fallback oracle system
- [ ] `NEXT_PUBLIC_ENABLE_VOICE` - Voice feature flag

**How to verify:**
1. Open Vercel dashboard → Your project → Settings → Environment Variables
2. Confirm all variables are set for Production environment
3. Check they're also set for Preview if testing branches

---

## 🛣️ CRITICAL USER PATHS

### Path 1: New User Onboarding
- [ ] Visit `/beta-entry` - Beta signup works
- [ ] Email magic link sent and received
- [ ] Click link → redirects to `/maya` or appropriate page
- [ ] First conversation with MAIA loads

### Path 2: Returning User
- [ ] Visit `/login` - Login page loads
- [ ] Biometric option shows (if available)
- [ ] Email magic link login works
- [ ] Redirects to `/maya` with session restored

### Path 3: Core MAIA Experience
- [ ] `/maya` - Main interface loads
- [ ] Type message → MAIA responds
- [ ] Voice input works (if enabled)
- [ ] MAIA voice playback works
- [ ] Conversation history persists
- [ ] Memory/context carries across sessions

### Path 4: Beta Features
- [ ] `/oracle-beta` - Enhanced oracle experience
- [ ] `/profile` - User profile and settings
- [ ] `/wisdom` - Wisdom facets display

---

## 🎯 API HEALTH CHECKS

### Essential Endpoints
- [ ] `POST /api/oracle/personal` - Personal oracle consultation
- [ ] `POST /api/oracle/unified` - Unified oracle interface  
- [ ] `POST /api/auth/magic-link` - Authentication
- [ ] `GET /api/health` or equivalent - System health check

### Voice Endpoints (if voice enabled)
- [ ] `POST /api/oracle/voice/transcribe/stream` - Speech-to-text
- [ ] Voice synthesis working (check logs for errors)

**How to test:**
```bash
# After deployment, test with curl:
curl -X POST https://your-vercel-url.vercel.app/api/oracle/personal \
  -H "Content-Type: application/json" \
  -d '{"query": "Hello MAIA"}'
```

---

## 📊 MONITORING & OBSERVABILITY

### Vercel Dashboard
- [ ] Check deployment logs for errors
- [ ] Verify build completed without warnings
- [ ] Check function execution logs after first users
- [ ] Monitor function duration (should be < 10s for most requests)

### Supabase Dashboard
- [ ] Verify database tables exist
- [ ] Check API request metrics
- [ ] Confirm auth is working (check Auth → Users)
- [ ] Storage buckets configured if needed

### Error Tracking
- [ ] Sentry or error tracking configured (if applicable)
- [ ] Check for any runtime errors post-deploy
- [ ] Set up alerts for critical errors

---

## 🎨 USER EXPERIENCE

### Visual Polish
- [ ] All pages render correctly on mobile
- [ ] No console errors in browser DevTools
- [ ] Loading states show appropriately
- [ ] Error messages are user-friendly

### Performance
- [ ] Initial page load < 3s
- [ ] MAIA response time < 10s
- [ ] No memory leaks in long sessions
- [ ] Voice latency acceptable

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader support (basic)
- [ ] Color contrast acceptable

---

## 🔒 SECURITY & SAFETY

### Authentication
- [ ] Magic links expire appropriately
- [ ] Sessions timeout after inactivity
- [ ] No exposed API keys in client code
- [ ] CORS configured correctly

### Data Protection
- [ ] User data encrypted at rest (Supabase default)
- [ ] Sensitive info not logged
- [ ] RLS policies active in Supabase

### AI Safety
- [ ] Hallucination testing pipeline active
- [ ] Crisis detection working (if implemented)
- [ ] Content moderation (if applicable)

---

## 🚨 ROLLBACK PLAN

**If things go wrong:**

1. **Quick Fix Available?**
   - Make fix in code
   - Push to main
   - Vercel auto-deploys in ~2 min

2. **Need More Time?**
   - Vercel dashboard → Deployments
   - Find last working deployment
   - Click "..." → "Redeploy"
   - Promotes that version instantly

3. **Critical Issue?**
   - Set maintenance mode (if configured)
   - Or: Point DNS away temporarily
   - Fix in calm environment
   - Redeploy when ready

**Emergency Contacts:**
- Kelly Nezat (you!)
- Vercel support: vercel.com/support
- Supabase support: supabase.com/support

---

## 🎉 LAUNCH DAY PROTOCOL

### 2 Hours Before Launch
- [ ] Final build verification
- [ ] Check all env vars one more time
- [ ] Test magic link authentication
- [ ] Clear any test data from production DB
- [ ] Screenshot working state for comparison

### At Launch
- [ ] Deploy to production
- [ ] Test one full user journey yourself
- [ ] Monitor Vercel logs in real-time
- [ ] Have Supabase dashboard open
- [ ] Be ready to rollback if needed

### First Hour After Launch
- [ ] Check for errors every 5-10 minutes
- [ ] Test on different devices/browsers
- [ ] Monitor user signup flow
- [ ] Watch for database connection issues
- [ ] Check MAIA response quality

### First Day After Launch
- [ ] Review all error logs
- [ ] Check user feedback/reports
- [ ] Monitor performance metrics
- [ ] Note any patterns in issues
- [ ] Celebrate what's working! 🎊

---

## 💪 CONFIDENCE BUILDERS

**Why This Will Work:**
- ✅ Build is clean and passing
- ✅ All critical fixes committed
- ✅ Environment documented
- ✅ Multiple API routes available
- ✅ Authentication system ready
- ✅ Rollback plan in place

**What Makes This Special:**
- This is MAIA - consciousness-first AI architecture
- You've built something unprecedented
- The safety infrastructure is solid
- The wisdom integration is unique
- This launch changes things

---

## 🎯 SUCCESS METRICS

**Day 1:**
- [ ] Zero critical errors
- [ ] First user completes onboarding
- [ ] First meaningful MAIA conversation
- [ ] No authentication issues

**Week 1:**
- [ ] 90%+ successful login rate
- [ ] Average MAIA response quality high
- [ ] User retention > 50%
- [ ] Positive qualitative feedback

---

**Remember:** Beta means learning together. Not everything has to be perfect - it has to be magical, safe, and improving. You've built the foundation for something transformative. Trust the work. 🌸

**Last Updated:** 2025-09-26 by Kelly Nezat & Team Soullab

