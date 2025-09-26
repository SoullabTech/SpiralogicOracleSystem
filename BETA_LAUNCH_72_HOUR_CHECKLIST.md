# 🚨 BETA LAUNCH 72-HOUR CHECKLIST
**Launch Date:** Monday, September 29, 2025
**Current Date:** Thursday, September 26, 2025

---

## ⏰ TIMELINE

**TODAY (Thursday 9/26) - SYSTEM VERIFICATION**
- End of day: All critical systems tested and working
- Evening: Team review of readiness

**FRIDAY 9/27 - FINAL PREP**
- Morning: Generate 20 beta access links
- Afternoon: Set up support infrastructure
- Evening: Go/No-Go decision

**SATURDAY 9/28 - COMMUNICATION**
- Morning: Final system check
- 6 PM: Send launch instructions to all 20 testers

**SUNDAY 9/29 - LAUNCH DAY**
- 8 AM: Team standup
- 9 AM: First users begin
- All day: Active monitoring + support

---

## 🔴 CRITICAL - MUST WORK (Test TODAY)

### 1. User Registration Flow
```bash
# Test this complete path:
□ Visit beta landing page
□ Fill in email + basic info
□ Receive unique beta link (or access code)
□ Click link → auto-login OR enter code
□ Confirm user shows in beta monitor
```

**Test URL:** `/beta/register` or wherever registration lives
**Expected outcome:** New user appears in `/beta/monitor` within 30 seconds

---

### 2. Onboarding Experience
```bash
# From fresh user account:
□ See preference sliders (gentle ↔ direct)
□ Adjust 3-4 preferences
□ Click "Begin Journey" or similar
□ Onboarding completes in <3 minutes
□ Preferences saved (check beta monitor)
```

**Test:** Create fake user, go through full onboarding
**Expected outcome:** Preferences reflected in first MAIA response

---

### 3. First MAIA Conversation
```bash
# Day 1 Fire Experience:
□ Prompt appears: "What's calling for your attention?"
□ Type message + send
□ MAIA responds within 3 seconds
□ Response reflects user preferences (tone matches slider)
□ Can send 3-5 messages back and forth
□ Voice option available (desktop + mobile)
```

**Test on:**
- Desktop (Chrome/Safari)
- iPhone (Safari)
- Android (Chrome)

**Expected outcome:** Natural conversation that feels personalized

---

### 4. Beta Monitor Dashboard
```bash
□ Visit /beta/monitor
□ See active user count update
□ See user list with real names/emails
□ See recent activity stream
□ Click between tabs (Feedback, Users, Protection, System)
□ System health shows all components "healthy"
```

**Test:** Have 2 people log in simultaneously, watch monitor update
**Expected outcome:** Real-time data appears within 30 seconds

---

### 5. Safety System
```bash
# Trigger safety detection:
□ Send message with emotional intensity: "feeling overwhelmed and lost"
□ Check if safety flag appears in monitor
□ Verify MAIA response is gentle + supportive
□ Confirm escalation pathway exists (if high-risk detected)
```

**Test:** Use test user with varied emotional messages
**Expected outcome:** Risk flags show in monitor, appropriate response

---

## 🟡 IMPORTANT - SHOULD WORK (Test FRIDAY)

### 6. Mobile Voice Experience
```bash
□ Open beta site on phone
□ Start conversation with MAIA
□ Tap microphone button
□ Speak message
□ Confirm transcription appears
□ MAIA responds with voice (audio plays)
□ Can toggle voice on/off
```

**Critical for:** Beta testers prefer mobile for intimate conversations
**Expected outcome:** Smooth voice interaction, <2 second response

---

### 7. Journal Integration
```bash
□ Access journal section (if separate from chat)
□ Write 2-3 sentences
□ Confirm MAIA references journal in next chat
□ Verify journal content saved + private
```

**Test:** Write journal entry, immediately chat with MAIA about same topic
**Expected outcome:** MAIA demonstrates awareness of journal context

---

### 8. Support Infrastructure
```bash
□ Create Discord OR Slack channel
□ Post welcome message
□ Add 2-3 moderators
□ Test posting in channel
□ Prepare 5 common FAQ responses
```

**Channel name:** `#maia-beta-support` or similar
**Expected outcome:** Place for real-time user questions

---

## 🟢 NICE TO HAVE - CAN WAIT (Test AFTER launch if needed)

### 9. Email Delivery
```bash
□ Send test email to yourself from beta system
□ Verify formatting looks good
□ Check links work
□ Confirm no spam folder issues
```

**Manual workaround:** Send emails personally from Gmail if automated fails

---

### 10. Analytics Tracking
```bash
□ Verify page views tracked
□ Confirm user events logged
□ Check dashboard shows metrics
```

**Manual workaround:** Use beta monitor for engagement data

---

## 📋 PRE-LAUNCH CHECKLIST (FRIDAY EVENING)

### Environment Variables (Vercel)
```bash
□ ANTHROPIC_API_KEY - Set and working
□ SUPABASE_URL - Correct database
□ SUPABASE_ANON_KEY - Valid key
□ NEXT_PUBLIC_SUPABASE_ANON_KEY - Valid key
□ BETA_MODE=true - Enabled
□ ELEVENLABS_API_KEY - Set (for voice)
```

**How to check:** Visit `/api/health/maia` - should show all "healthy"

---

### Database Tables (Supabase)
```sql
-- Verify these exist:
□ profiles (user data)
□ beta_testers (beta-specific tracking)
□ conversations (MAIA chat history)
□ beta_feedback (user ratings/comments)
□ safety_assessments (risk monitoring)
```

**How to check:** Open Supabase dashboard → Table Editor

---

### 20 Beta Access Links
```bash
# Generate unique links for each tester:
Option 1: /beta/001, /beta/002, ... /beta/020
Option 2: /beta?code=UNIQUE_CODE_HERE
Option 3: /beta/[userId-from-database]

□ Test 3 links work correctly
□ Each link shows correct user name after login
□ Links don't expire
□ Save all 20 links in spreadsheet
```

---

## 🚨 GO/NO-GO CRITERIA (Saturday Evening)

### ✅ MUST HAVE (Launch blockers if not working):
- [ ] Users can register + get access
- [ ] MAIA responds to messages with preference adaptation
- [ ] Beta monitor shows real-time user data
- [ ] Safety system detects + escalates appropriately
- [ ] Mobile experience functional (even if not perfect)
- [ ] Support channel set up + staffed

### 🟡 SHOULD HAVE (Ideal but can work around):
- [ ] Voice works on mobile
- [ ] Journal integration seamless
- [ ] Email delivery automated
- [ ] All 20 testers confirmed participation

### 🟢 NICE TO HAVE (Can add during beta):
- [ ] Advanced analytics
- [ ] Automated daily reports
- [ ] Community features

**Decision:** If all "MUST HAVE" items are ✅, you launch. Everything else can be fixed live.

---

## 📧 COMMUNICATION SCHEDULE

### Tuesday 9/24 (WELCOME EMAIL)
**Time:** 9 AM, 10:30 AM, 12 PM, 2 PM (staggered batches of 5)
**Template:** docs/beta/BETA_EMAIL_TEMPLATES.md → Email 1
**Content:**
- Your beta link: [UNIQUE_LINK]
- What to expect Monday
- Join support channel (optional)
- Questions? Reply to this email

**Action:** Send via Gmail with BCC, or use email service

---

### Sunday 9/28 (LAUNCH INSTRUCTIONS)
**Time:** 6:00 PM
**Template:** docs/beta/BETA_EMAIL_TEMPLATES.md → Email 2
**Content:**
- Tomorrow we launch!
- Your personal link (repeat it)
- Day 1 Fire theme: "What's calling for your attention?"
- Support available 24/7
- Don't worry about "doing it right"

**Action:** Send to all 20 simultaneously

---

### Monday 9/29 (DAY 1 CHECK-IN)
**Time:** 6:00 PM (after they've had time to use it)
**Template:** docs/beta/BETA_EMAIL_TEMPLATES.md → Email 3
**Content:**
- How did Fire energy land?
- Any technical issues?
- Tomorrow is Water energy
- We read every reply

**Action:** Personal email from you, warm tone

---

## 🛠️ EMERGENCY PROCEDURES

### If System Goes Down
1. **Immediate (0-5 min):** Check Vercel deployment status
2. **Next (5-15 min):** Email all active users: "Brief technical issue, back in 15 min"
3. **Next (15-30 min):** Fix or deploy rollback
4. **Next (30-60 min):** Email update with resolution

### If User Reports Safety Concern
1. **Immediate:** Respond to user directly within 5 minutes
2. **Next (10 min):** Assess severity (low/medium/high)
3. **Next (20 min):** If high severity, offer direct call/resources
4. **Next (60 min):** Document incident, update safety protocols

### If Mass Confusion About Features
1. **Within 15 min:** Post FAQ in support channel
2. **Within 30 min:** Email clarification to all users
3. **Within 60 min:** Add in-app explainer if needed

---

## 📞 SUPPORT COVERAGE (Launch Day)

**Monday 9/29 Schedule:**
- **8 AM - 12 PM:** [Team Member] - Morning monitoring
- **12 PM - 4 PM:** [Team Member] - Midday support
- **4 PM - 8 PM:** [Team Member] - Evening check-ins
- **8 PM - 12 AM:** On-call emergency only

**Support Channels:**
- Email: [SUPPORT_EMAIL]
- Discord/Slack: #maia-beta-support
- Emergency: [PHONE_NUMBER]

**Response Time Targets:**
- Email: <2 hours during coverage
- Discord/Slack: <30 minutes
- Emergency: <5 minutes

---

## 🎯 SUCCESS METRICS (Day 1)

### Minimum Success (Launch not a failure):
- **15/20** testers log in
- **10/20** complete first MAIA conversation
- **0** critical system failures
- **<5** significant bugs

### Target Success (Launch went well):
- **18/20** testers log in
- **15/20** have meaningful conversation (3+ messages)
- **2+** spontaneous "wow" moments shared
- **>7/10** average satisfaction if asked

### Exceptional Success (Launch exceeded expectations):
- **20/20** testers engage
- **5+** unsolicited positive feedback messages
- **3+** testers ask "when can I use this daily?"
- **8+/10** average satisfaction

---

## 🧪 TESTING SCRIPT (Run This TODAY)

```typescript
// Copy/paste this into browser console at your beta site:

async function testBetaLaunchReadiness() {
  console.log('🚀 Testing MAIA Beta Launch Readiness...\n');

  const tests = {
    registration: false,
    onboarding: false,
    maiaChat: false,
    monitoring: false,
    safety: false,
    mobile: false
  };

  // Test 1: Health Check
  try {
    const health = await fetch('/api/health/maia');
    const data = await health.json();
    console.log('✅ System Health:', data.status);
    tests.registration = health.ok;
  } catch (e) {
    console.error('❌ System Health FAILED:', e);
  }

  // Test 2: Beta Monitor
  try {
    const monitor = await fetch('/api/beta/monitor');
    const data = await monitor.json();
    console.log('✅ Beta Monitor:', data.success ? 'WORKING' : 'FAILED');
    tests.monitoring = data.success;
  } catch (e) {
    console.error('❌ Beta Monitor FAILED:', e);
  }

  // Test 3: MAIA Chat (requires manual conversation test)
  console.log('⚠️  MAIA Chat: MANUAL TEST REQUIRED');
  console.log('   1. Open chat interface');
  console.log('   2. Send message: "Hello MAIA"');
  console.log('   3. Verify response within 3 seconds');

  // Test 4: Mobile (requires physical device)
  console.log('⚠️  Mobile: MANUAL TEST REQUIRED');
  console.log('   1. Open on iPhone or Android');
  console.log('   2. Test touch interactions');
  console.log('   3. Try voice input');

  // Results
  console.log('\n📊 READINESS SUMMARY:');
  Object.entries(tests).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}`);
  });

  const readyCount = Object.values(tests).filter(Boolean).length;
  const totalTests = Object.keys(tests).length;

  if (readyCount === totalTests) {
    console.log('\n🎉 ALL SYSTEMS GO - READY FOR LAUNCH!');
  } else {
    console.log(`\n⚠️  ${totalTests - readyCount} CRITICAL ITEMS NEED ATTENTION`);
  }
}

// Run the test
testBetaLaunchReadiness();
```

**Run this script NOW and share results.**

---

## ✅ FINAL PRE-LAUNCH QUESTION

**Before you launch Monday, can you honestly answer YES to these?**

1. [ ] I've personally completed the full user flow (register → chat → monitor)
2. [ ] I've tested on my phone and it works
3. [ ] I know how to check if users are active (beta monitor)
4. [ ] I have a support channel ready for user questions
5. [ ] I have 20 working access links for beta testers
6. [ ] I can respond to user issues within 2 hours on launch day
7. [ ] I've prepared welcome/launch emails ready to send
8. [ ] I have a plan if something breaks (rollback, communicate, fix)

**If all YES → You're ready to launch.**
**If any NO → That's your focus for the next 48 hours.**

---

**You've built something unprecedented. Now make sure 20 people can actually experience it. 🚀**