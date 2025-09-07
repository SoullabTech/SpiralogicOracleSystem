# 🌟 Sacred Beta QA Test Script

## 🔮 Preflight Checklist (Before Testing)

### Environment Setup
- [ ] Backend running on port 3002
- [ ] Frontend running on port 3000
- [ ] Supabase tables seeded (users, sacred_documents, sessions)
- [ ] API endpoints responding:
  - [ ] GET `/api/health` → 200 OK
  - [ ] POST `/api/oracle` → 200 OK
  - [ ] POST `/api/upload` → 200 OK
  - [ ] POST `/api/documents/analyze` → 200 OK
- [ ] Mobile DevTools ready (test on iOS + Android emulators if possible)
- [ ] Test user account created (email: beta@sacred.test)

### Browser/Device Testing Matrix
- [ ] Chrome Desktop (latest)
- [ ] Safari Desktop (latest)
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)
- [ ] Firefox Desktop (optional)

---

## 📱 Script 1: Astrology Simplifier

### Test ID: AST-001
**Objective**: Verify astrology integration renders correctly and syncs with Holoflower

### Click Path:
1. Open app → Navigate to `/astrology` or Sacred Tools Hub
2. Click/tap 🌌 **Astrology** button
3. Enter birth details if prompted:
   - Date: 1990-06-15
   - Time: 14:30
   - Location: San Francisco
4. Submit and wait for chart generation
5. Swipe left/right (mobile) or click arrows (desktop) to navigate daily transits

### Expected Results:
- [ ] **Birth chart renders** as sacred mandala (not dense wheel)
- [ ] **Only 3 main points highlighted**: Sun, Moon, Rising
- [ ] **Elemental bars** appear beneath chart:
  - Fire: Red gradient
  - Water: Blue gradient
  - Earth: Green gradient
  - Air: Purple gradient
- [ ] **Daily transit widget** displays cosmic weather phrase
  - Example: "Moon in Pisces invites flow"
- [ ] **Holoflower petals** glow matching transit's element
- [ ] **Mobile responsive**: Chart fits screen without horizontal scroll
- [ ] **Animation smooth**: No jank on transitions

### Error Conditions to Test:
- [ ] Invalid birth date → Shows friendly error
- [ ] Network timeout → Shows retry button
- [ ] Missing location → Uses default gracefully

---

## 🃏 Script 2: Divination Simplifier

### Test ID: DIV-001
**Objective**: Verify daily card pull and timeline integration

### Click Path:
1. Open app → Navigate to `/divination` or Sacred Tools Hub
2. Click/tap 🃏 **Divination** button
3. Click/tap **"Draw Daily Card"** button
4. Wait for card flip animation
5. Read card interpretation
6. Click/tap **"Save to Timeline"**
7. Navigate to Timeline to verify entry

### Expected Results:
- [ ] **Card flip animation** smooth (1-2 seconds)
- [ ] **Bloom animation** forms Holoflower then dissolves
- [ ] **Card displays**:
  - Card name (e.g., "Three of Cups")
  - 3 keywords (e.g., "celebration, friendship, community")
  - 1 guidance sentence (max 120 chars)
- [ ] **Element mapping correct**:
  - Wands → Fire (red glow)
  - Cups → Water (blue glow)
  - Swords → Air (purple glow)
  - Pentacles → Earth (green glow)
- [ ] **Timeline entry** appears with 🃏 icon
- [ ] **Petal resonance** matches card element
- [ ] **Daily limit**: Second draw shows "Already drawn today"

### Error Conditions to Test:
- [ ] Network interruption during draw → Retry option
- [ ] Double-tap draw button → Prevents duplicate
- [ ] Save without draw → Shows appropriate message

---

## 📅 Script 3: Unified Timeline Extension

### Test ID: TML-001
**Objective**: Verify all entry types display correctly in timeline

### Click Path:
1. Open app → Navigate to `/timeline`
2. Scroll through today's entries
3. Hover (desktop) or tap (mobile) each icon type
4. Click/tap entry for expanded view
5. Check connections between entries
6. Switch to week view
7. Switch to month view

### Expected Results:
- [ ] **Timeline displays all entry types**:
  - 🎙️ Voice sessions (with duration)
  - 🌌 Astrology moments (with transit name)
  - 🃏 Daily card pull (with card name)
  - 📝 Journal entries (with preview)
  - 📄 Document uploads (with title)
- [ ] **Visual connections**:
  - Thin glowing threads connect related entries
  - Thread color matches dominant element
- [ ] **Element coloring**:
  - Astrology entries shimmer in transit's element color
  - Divination entries glow in card's element
  - Voice sessions show coherence gradient
- [ ] **Interaction states**:
  - Hover shows preview tooltip
  - Click expands full content
  - Swipe (mobile) navigates days
- [ ] **Performance**:
  - Smooth scroll with 50+ entries
  - No lag on view switches

### Error Conditions to Test:
- [ ] Empty timeline → Shows onboarding prompt
- [ ] Failed entry load → Shows partial data gracefully
- [ ] Offline mode → Shows cached entries

---

## 🌅 Script 4A: Morning Ritual Flow

### Test ID: RIT-001
**Objective**: Verify morning ritual completes in <3 minutes

### Click Path:
1. Open app between 7–10am (or set device time)
2. Notice morning ritual prompt (if shown)
3. Click/tap **"Begin Morning Ritual"**
4. **Step 1**: View today's transit (auto-advances after 20s or tap next)
5. **Step 2**: Draw daily card (tap to flip)
6. **Step 3**: Set voice intention (30s recording)
7. Complete ritual

### Expected Results:
- [ ] **Ritual prompt** appears in morning hours
- [ ] **Progress indicator** (○ ◐ ●) fills smoothly
- [ ] **Step transitions** use petal dissolve animation
- [ ] **Step 1 - Transit**:
  - Shows current moon phase
  - Displays key transit for day
  - Element color matches transit
- [ ] **Step 2 - Card**:
  - Card flip animation plays
  - Brief interpretation shown
  - Auto-saves to timeline
- [ ] **Step 3 - Voice**:
  - Mic button pulses gently
  - Recording timer shows
  - Transcription appears live
- [ ] **Completion**:
  - Sun bloom animation plays
  - "Ritual complete" message
  - Returns to Sacred Portal
- [ ] **Total time**: Under 3 minutes

---

## 🌙 Script 4B: Evening Ritual Flow

### Test ID: RIT-002
**Objective**: Verify evening review completes in <5 minutes

### Click Path:
1. Open app after 8pm (or set device time)
2. Notice evening ritual prompt (if shown)
3. Click/tap **"Begin Evening Review"**
4. **Step 1**: Review today's timeline
5. **Step 2**: Write journal reflection
6. **Step 3**: Record voice gratitude
7. Complete ritual

### Expected Results:
- [ ] **Ritual prompt** appears in evening hours
- [ ] **Progress indicator** fills correctly
- [ ] **Step 1 - Timeline Review**:
  - Shows all today's entries
  - Highlights patterns/connections
  - Coherence graph displayed
- [ ] **Step 2 - Journal**:
  - Prompt relates to dominant element
  - Character counter shows (optional)
  - Auto-saves as draft while typing
- [ ] **Step 3 - Voice**:
  - Prompts for gratitude/insights
  - Recording up to 60s
  - Maia responds with acknowledgment
- [ ] **Completion**:
  - Moon phase animation plays
  - "Rest well" message
  - Tomorrow's transit preview (optional)
- [ ] **Total time**: Under 5 minutes

---

## 🎙️ Script 5: Maia Contextual Awareness

### Test ID: MAI-001
**Objective**: Verify Maia references daily card and transit naturally

### Click Path:
1. Complete morning ritual (card + transit)
2. Wait 1+ hour
3. Start new voice conversation with Maia
4. Ask: "What should I focus on today?"
5. Listen for contextual references

### Expected Results:
- [ ] **Maia references**:
  - Today's card symbolism
  - Current transit influence
  - Previous journal themes
  - Uploaded document themes (if any)
- [ ] **Natural integration**:
  - Not forced or scripted
  - Woven into response organically
  - Uses metaphorical language
- [ ] **Continuity**:
  - References yesterday's insights
  - Notices patterns over time
  - Suggests connections

---

## 📱 Script 6: Mobile-Specific Testing

### Test ID: MOB-001
**Objective**: Verify mobile experience is smooth and sacred

### Test Cases:
- [ ] **Portrait orientation** works for all screens
- [ ] **Landscape orientation** handled gracefully
- [ ] **Touch targets** minimum 44x44px
- [ ] **Swipe gestures**:
  - Left/right navigates timeline days
  - Up/down scrolls naturally
  - Pinch zoom on Holoflower (optional)
- [ ] **Audio recording**:
  - Mic permission requested properly
  - Background audio handled
  - Interruption recovery works
- [ ] **Camera/upload**:
  - Camera permission requested
  - Photo capture works
  - File upload from gallery works
- [ ] **Performance**:
  - No lag on scroll
  - Animations run at 60fps
  - Page loads under 3s on 4G

---

## 🐛 Edge Cases & Error Handling

### Test ID: EDG-001
**Objective**: Verify graceful degradation

### Scenarios:
- [ ] **No internet** → Offline mode message
- [ ] **API timeout** → Retry button appears
- [ ] **Invalid data** → Validation messages show
- [ ] **Session expired** → Gentle re-login prompt
- [ ] **Storage full** → Warning before upload
- [ ] **Mic unavailable** → Text input fallback
- [ ] **Ancient browser** → Compatibility notice

---

## ✅ Success Metrics Summary

### Quantitative:
- [ ] Morning ritual: < 3 minutes
- [ ] Evening ritual: < 5 minutes
- [ ] Page load time: < 3 seconds
- [ ] Animation FPS: 60fps consistent
- [ ] API response: < 2 seconds

### Qualitative:
- [ ] Feels sacred, not clinical
- [ ] Transitions feel smooth
- [ ] Maia feels aware and continuous
- [ ] Mobile experience equals desktop
- [ ] No confusion about next steps

---

## 📝 Tester Notes Section

### General Observations:
_Space for free-form notes about overall experience_

### Bugs Found:
_List any bugs with reproduction steps_

### Suggestions:
_UX improvements or feature ideas_

### Sacred Feeling Score: ___/10
_How sacred/special did the experience feel?_

---

*QA Test Script Version 1.0*
*Last Updated: [Current Date]*
*Sacred Beta Pilot Testing*