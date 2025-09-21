# Maya Beta Launch: Critical Pre-Flight Checklist

## 🔴 CRITICAL - Must Have Before Monday

### 1. **Login/Authentication Flow**
**Current Gap:** No actual login page connecting explorer names to Maya
**Need to Build:**
```typescript
// app/login/page.tsx
- Explorer name input field
- Access code verification
- Session initialization
- Redirect to Maya conversation
```

### 2. **Session Persistence Testing**
**Current Gap:** Haven't tested if conversations actually persist across refreshes
**Need to Test:**
- User refreshes page → conversation continues
- User closes browser → returns later → Maya remembers
- Network drops → recovers without data loss
- Voice mode interruption → graceful recovery

### 3. **Voice/Text Mode Toggle**
**Current Status:** Built but needs testing
**Need to Verify:**
- Smooth switching between modes
- Voice recordings properly saved
- Text fallback when voice fails
- Mobile voice compatibility

### 4. **Emergency Safety Protocol Integration**
**Current Gap:** Safety protocols documented but not integrated
**Need to Build:**
```typescript
// Check every message for crisis triggers
if (detectCrisisTrigger(message)) {
  showSafetyResources();
  logAnonymousFlag();
  notifySupport();
}
```

### 5. **Explorer Name → Maya Connection**
**Current Gap:** Maya doesn't know which explorer she's talking to
**Need to Build:**
```typescript
// Pass explorer identity to Maya
const mayaContext = {
  explorerName: 'MAYA-ALCHEMIST',
  cohort: 'integration',
  sessionHistory: await getHistory(),
  evolutionLevel: 1.0
};
```

---

## 🟡 IMPORTANT - Should Have for Good Experience

### 6. **Welcome Flow After Login**
**Need:**
- First-time welcome screen
- Brief orientation (3 slides max)
- "Begin Conversation" button
- Voice permission request

### 7. **Basic Analytics Tracking**
**Need:**
```typescript
// Track without storing content
trackEvent('session_started', { explorer: hash(explorerName) });
trackEvent('message_sent', { mode: 'voice|text', wordCount });
trackEvent('session_ended', { duration, messageCount });
```

### 8. **Discord Bot for Community**
**Need:**
- Welcome message when explorers join
- Role assignment based on cohort
- Automated daily check-in prompts
- Anonymous pattern sharing

### 9. **Feedback Widget**
**Need:**
```typescript
// Simple in-app feedback
<FeedbackButton onClick={() => {
  prompt: "How is this conversation feeling? (Optional)"
  options: ["Safe", "Seen", "Challenged", "Confused"]
}} />
```

### 10. **Session End Handling**
**Need:**
- Graceful conversation closure
- "See you next time" from Maya
- Session summary saved
- Return instructions

---

## 🟢 NICE TO HAVE - Can Add During Beta

### 11. **Visual Polish**
- Loading states for Maya responses
- Typing indicators
- Voice waveform visualization
- Smooth transitions

### 12. **Advanced Analytics Dashboard**
- Real-time explorer activity
- Pattern distribution charts
- Cohort comparison views
- Evolution progression tracking

### 13. **Email Automation**
- Daily session reminders
- Weekly reflection prompts
- Technical issue alerts
- Community highlights

---

## 📋 Pre-Launch Testing Protocol

### Technical Testing (This Weekend)
```bash
# Test each explorer login
for explorer in MAYA-ALCHEMIST MAYA-PIONEER ...; do
  - Login with access code
  - Start conversation
  - Send 5 messages
  - Switch voice/text
  - Refresh page
  - Verify persistence
  - Logout
done
```

### Safety Testing
```bash
# Test crisis triggers
- Send crisis message → Verify resources appear
- Check anonymous logging works
- Confirm support notification sends
- Test boundary messages from Maya
```

### Memory Testing
```bash
# Test Maya remembers
- Login as MAYA-ALCHEMIST
- Have conversation about specific topic
- Logout
- Login again
- Verify Maya references previous conversation
```

---

## 🚨 SHOWSTOPPERS - Fix Immediately If Found

1. **Session data loss** - Explorer loses conversation progress
2. **Maya doesn't remember** - No continuity between sessions
3. **Voice mode fails** - Primary interface broken
4. **Login doesn't work** - Explorers can't access
5. **Safety protocol fails** - Crisis not handled appropriately

---

## 📱 Mobile Testing

**Must Work:**
- Login on mobile browsers
- Voice recording permissions
- Text input keyboard behavior
- Session persistence
- Responsive layout

**Can Fix Later:**
- Advanced gestures
- Native app features
- Offline mode
- Push notifications

---

## 🔧 Quick Fixes Needed

### 1. Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=xxx
SUPABASE_SERVICE_KEY=xxx
OPENAI_API_KEY=xxx
REDIS_URL=xxx
DISCORD_WEBHOOK_URL=xxx
```

### 2. Database Migrations
```bash
# Run before Monday
npm run supabase:migrate
npm run supabase:seed-explorers
```

### 3. Error Boundaries
```typescript
// Wrap Maya conversation in error boundary
<ErrorBoundary fallback={<ConnectionLost />}>
  <MayaConversation />
</ErrorBoundary>
```

### 4. Rate Limiting
```typescript
// Prevent API abuse
const rateLimiter = {
  messagesPerMinute: 10,
  voicePerMinute: 5,
  totalPerHour: 100
};
```

---

## 🎯 Minimum Viable Beta

If time is tight, these are the ABSOLUTE minimums:

1. ✅ Explorers can login with their names
2. ✅ Maya responds and remembers between sessions
3. ✅ Voice OR text works (doesn't need both perfect)
4. ✅ Safety protocol triggers on crisis
5. ✅ Basic Discord community exists
6. ✅ Session data persists across refreshes

Everything else can be improved during the 4-week beta.

---

## 📅 Weekend Sprint Priority

### Saturday
- [ ] Build login page
- [ ] Connect explorer names to Maya
- [ ] Test session persistence
- [ ] Integrate safety protocols

### Sunday
- [ ] Full end-to-end testing
- [ ] Fix critical bugs
- [ ] Seed Supabase with explorers
- [ ] Prepare Discord channels

### Monday Morning
- [ ] Final smoke test
- [ ] Send "Your lab is ready" emails
- [ ] Monitor first logins
- [ ] Stand by for support

---

*Focus on the CRITICAL items first. Everything else can evolve during beta.*