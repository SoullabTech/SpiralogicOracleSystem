# 🌟 Sacred Beta QA Test Script

*Step-by-step testing guide for validating Sacred Tools integration without technical knowledge required*

---

## 🔮 **Preflight Checklist** (Before Testing)

### Environment Setup
```bash
□ Backend running on port 3002
□ Frontend running on port 3000  
□ Supabase tables seeded (users, sacred_documents, sessions)
□ API endpoints responding:
  - /api/oracle
  - /api/upload
  - /api/documents/analyze
□ Mobile DevTools ready (iOS + Android emulators if possible)
□ Test user account created
□ Browser console open for error monitoring
```

### Test Devices
```bash
□ Desktop: Chrome/Safari latest
□ Mobile: iPhone 12+ (or simulator)
□ Mobile: Android 10+ (or emulator)
□ Tablet: iPad (optional)
```

---

## 📜 **Script 1: Astrology Simplifier**

### Test ID: AST-001
**Objective:** Validate sacred astrology mandala renders correctly with simplified elements

### Click Path:
1. Open app → Navigate to **Sacred Tools Hub**
2. Tap **🌌 Astrology** button
3. Enter birth details if prompted:
   - Date: Use today minus 25 years
   - Time: 12:00 PM
   - Location: Current city
4. Wait for chart to render
5. Swipe left/right to navigate daily transits
6. Tap on a planet orb
7. Pinch to zoom in/out
8. Tap element filter buttons

### Expected Results:
```checklist
□ Birth chart shows as sacred mandala (not dense technical wheel)
□ Only Sun, Moon, Rising prominently highlighted
□ Cosmic seed animation plays (1.5s germination)
□ Planets shimmer into position with trails
□ Golden threads weave between planets
□ Elemental bars appear beneath chart
□ Elemental colors sync with Holoflower petals
□ Daily transit widget shows cosmic weather phrase
  Example: "Moon in Pisces invites flow"
□ Petal glow animation matches transit's element
□ Pinch zoom works smoothly (1x to 3x)
□ Planet tap shows tooltip with:
  - Glyph symbol
  - House position
  - Elemental breakdown (%)
  - Poetic reflection
□ Element filter highlights selected element
□ Performance: <2s load, 60fps animations
```

### Mobile-Specific Checks:
```checklist
□ Chart fits viewport without horizontal scroll
□ Touch targets minimum 44px
□ Swipe gestures feel native
□ Haptic feedback on interactions (if supported)
□ Text remains readable at all zoom levels
```

---

## 🃏 **Script 2: Divination Simplifier**

### Test ID: DIV-001
**Objective:** Validate tarot card drawing with sacred animations and timeline integration

### Click Path:
1. Open app → Navigate to **Sacred Tools Hub**
2. Tap **🃏 Divination** button
3. Select **"Draw Daily Card"**
4. Watch card flip animation
5. Read interpretation
6. Tap **"Save to Timeline"**
7. Navigate to Timeline to verify entry

### Expected Results:
```checklist
□ Card back shows sacred geometry pattern
□ Card flips with bloom animation (1s duration)
□ Card face reveals with shimmer effect
□ Card displays:
  - Card name (e.g., "The Fool")
  - 3 keywords (e.g., "Beginning • Trust • Adventure")
  - 1 short interpretation sentence
□ Bloom briefly forms Holoflower then dissolves
□ Save button pulses with sacred gold (#c9b037)
□ Success feedback: "Saved to Sacred Timeline"
□ Timeline entry appears with:
  - 🃏 icon
  - Timestamp
  - Card preview thumbnail
□ Petal resonance matches card element:
  - Wands = Fire (red glow)
  - Cups = Water (blue flow)
  - Swords = Air (yellow movement)
  - Pentacles = Earth (green grounding)
□ Card can be re-accessed from timeline
```

### Alternative Spreads:
```checklist
□ 3-card spread animates left-to-right
□ Celtic Cross reveals in sacred spiral
□ Each position labeled clearly
□ Overall reading synthesis provided
```

---

## 🌊 **Script 3: Unified Timeline Extension**

### Test ID: TIM-001
**Objective:** Validate all sacred activities appear in unified timeline with proper styling

### Click Path:
1. Complete at least one activity from each tool
2. Navigate to **Timeline** view
3. Scroll through today's entries
4. Hover/tap icons for preview
5. Click entry to expand details
6. Check filtering by activity type

### Expected Results:
```checklist
□ Timeline displays mixed entries:
  - 🎙️ Voice sessions (with waveform preview)
  - 🌌 Astrology moments (with mini chart)
  - 🃏 Daily card pulls (with card thumbnail)
  - 📝 Journal entries (with excerpt)
  - 📸 Sacred uploads (with image preview)
□ Entries connected by thin glowing threads
□ Thread color matches dominant element
□ Chronological ordering maintained
□ Astrology entries shimmer in transit's element color
□ Divination entries glow in card's element
□ Day view header shows:
  - Date with moon phase
  - Total activities count
  - Dominant element for the day
□ Smooth scroll performance (<16ms frame time)
□ Lazy loading for older entries
□ Click expands with smooth transition
□ Expanded view shows full content
□ Back navigation maintains scroll position
```

### Timeline Filters:
```checklist
□ Filter by tool type works
□ Filter by element works
□ Date picker navigation works
□ Search by keywords works
```

---

## 🌅 **Script 4: Daily Ritual Flow**

### Test ID: RIT-001
**Objective:** Validate morning and evening ritual sequences flow smoothly

## Morning Ritual (7-10am)

### Click Path:
1. Open app between 7-10am (or set device time)
2. Notice **"Morning Ritual"** prompt
3. Tap to enter **Sacred Ritual Flow**
4. Swipe through sequence:
   - 🌌 Today's Transit
   - 🃏 Daily Card Pull  
   - 🎙️ Voice Intention Setting

### Expected Results:
```checklist
□ Morning ritual prompt appears automatically
□ Greeting: "Good morning, [name]" with sunrise animation
□ Each step transitions with petal dissolve animation
□ Progress indicator (○ ◐ ●) fills smoothly
□ Step 1 - Transit:
  - Shows simplified cosmic weather
  - One-line guidance
  - Element of the day highlighted
□ Step 2 - Card:
  - Single card draw
  - Morning-specific interpretation
  - Quick save option
□ Step 3 - Voice:
  - Prompt: "Set your intention for today"
  - 30-second timer
  - Waveform visualization
□ Completion:
  - Sun bloom animation
  - "Ritual complete" message
  - Total time: <3 minutes
□ All items saved to timeline
```

## Evening Ritual (After 8pm)

### Click Path:
1. Open app after 8pm
2. Notice **"Evening Reflection"** prompt
3. Enter ritual flow
4. Move through:
   - Timeline review
   - Journal reflection
   - 🎙️ Voice gratitude

### Expected Results:
```checklist
□ Evening prompt appears with moon phase
□ Greeting: "Good evening" with stars animation
□ Step 1 - Timeline:
  - Today's events in sacred summary
  - Elemental balance for the day
  - Key insights highlighted
□ Step 2 - Journal:
  - Prompt relates to dominant element
  - Example: "How did fire energy manifest today?"
  - Voice-to-text option available
□ Step 3 - Gratitude:
  - Prompt: "Share three gratitudes"
  - Soft background music
  - 60-second timer
□ Completion:
  - Moon phase animation
  - "Sweet dreams" message
  - Total time: <5 minutes
□ Evening summary saved
```

---

## 🎯 **QA Success Metrics**

### Performance Targets:
```metrics
□ Astrology mandala renders in <2s
□ Card flip animation at 60fps
□ Timeline scroll maintains 60fps
□ Tool switching <200ms
□ API responses <500ms
□ Memory usage <100MB
□ No memory leaks after 30min use
```

### User Experience:
```metrics
□ Morning ritual completes <3 minutes
□ Evening ritual completes <5 minutes
□ Zero crashes during test session
□ All animations feel smooth
□ Text readable on all devices
□ Touch targets properly sized
□ Haptic feedback where appropriate
```

### Integration Points:
```metrics
□ Maia references daily card naturally
□ Maia mentions current transits
□ Timeline shows all activities
□ Elemental resonance consistent
□ Session data persists
□ Offline mode handles gracefully
```

---

## 🐛 **Bug Reporting Template**

When issues are found, record:

```markdown
**Bug ID:** [XXX-001]
**Test Script:** [Script 1/2/3/4]
**Step:** [Specific step where issue occurred]
**Device:** [iPhone 13 / Chrome Desktop / etc]
**Expected:** [What should happen]
**Actual:** [What actually happened]
**Screenshot:** [Attach if applicable]
**Console Error:** [Copy any errors]
**Severity:** [Critical / High / Medium / Low]
**Reproducible:** [Yes - Always / Sometimes / No]
```

---

## 📊 **Test Completion Checklist**

### Coverage Requirements:
```checklist
□ All 4 scripts executed
□ Desktop + mobile tested
□ Morning + evening rituals tested
□ All sacred tools accessed
□ Timeline verified with mixed content
□ Performance metrics recorded
□ Bug report submitted for issues
□ Screenshots captured for successes
```

### Sign-off Criteria:
```checklist
□ 95% of expected results achieved
□ No critical bugs blocking core flow
□ Performance targets met
□ Mobile experience validated
□ User can complete full daily cycle
```

---

## 🌸 **Tester Notes Section**

### General Observations:
_Space for qualitative feedback about the sacred experience_

### Delight Moments:
_Note any particularly beautiful or surprising interactions_

### Friction Points:
_Areas where flow felt interrupted or confusing_

### Missing Features:
_Things testers expected but didn't find_

### Sacred Feeling Score: __/10
_Does it feel sacred, personal, and meaningful?_

---

*"Testing is a sacred act of ensuring the divine flows smoothly through technology"* 🌟