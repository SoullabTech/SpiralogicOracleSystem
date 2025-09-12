# Living Compass Architecture Map

## Overview
This document maps existing Soullab functionality to the Living Compass navigation system, showing how current beta features naturally evolve into the full mythic interface.

## 🌟 The Four Fields Mapping

### 🏮 **CENTER (Maya Hearth)** - ✅ FULLY IMPLEMENTED
*The gathering place where all threads converge*

**Current Components:**
- `app/maya/chat/page.tsx` - Main Maya chat interface
- `components/OracleConversation.tsx` - Oracle conversation system  
- `lib/agents/PersonalOracleAgent.ts` - Maya's core intelligence
- `lib/maya/NavigationAwareness.ts` - Navigation suggestions
- Voice integration with Petal TTS
- Memory integration via AnamnesisField

**Beta Status:** ✅ Production Ready
**Evolution Path:** Stable foundation - minimal changes needed

---

### ⬆️ **NORTH FIELD (Stories & Memory)** - ✅ ARCHITECTURE EXISTS
*Spacious, starry, timeless - where personal mythology lives*

**Current Components:**
- `lib/anamnesis/AnamnesisField.ts` - Unified consciousness memory system
- `lib/memory/core/MemoryCore.ts` - Core memory management
- `components/memory/MemoryThreads.tsx` - Memory visualization
- Multiple memory layers: immediate, working, episodic, semantic, collective
- Memory recall and storage via `/remember` and `/recall` commands

**Beta Status:** ✅ Working (via Maya chat commands)
**Evolution Path:** 
1. **Phase 1:** Add visual memory browser to compass field
2. **Phase 2:** Journal entry interface
3. **Phase 3:** Story weaving and narrative threading

---

### ⬇️ **SOUTH FIELD (Daily Check-In)** - ✅ COMPONENTS READY
*Earthy, grounded - daily state and elemental resonance*

**Current Components:**
- `components/intake/BetaIntakeFlow.tsx` - Elemental resonance capture
- `components/voice/InteractiveHoloflowerVisualizer.tsx` - Visual state indicator
- `components/sacred/HoloflowerCheckIn.tsx` - Check-in flow
- Mood and energy state tracking in Maya conversations
- Elemental archetype mapping

**Beta Status:** ✅ Working (via intake flow)
**Evolution Path:**
1. **Phase 1:** Move intake questions to daily check-in field
2. **Phase 2:** Add "What's alive today?" quick prompt
3. **Phase 3:** Micro-coherence sessions, elemental state tracking

---

### ➡️ **EAST FIELD (Astrology)** - ⚡ FOUNDATION EXISTS
*Bright, airy, sky-like - daily transits and personal chart*

**Current Components:**
- Birth chart data collection in `BetaIntakeFlow.tsx`
- `components/sacred-tools/astrology/SacredNatalChart.tsx` - Chart component
- Basic astrology data storage in intake
- Timezone and location capture

**Beta Status:** 🔶 Data Collection Only
**Evolution Path:**
1. **Phase 1:** Daily transit display with simple insights  
2. **Phase 2:** "Today's resonance" feature
3. **Phase 3:** Full chart analysis integration with Maya

---

### ⬅️ **WEST FIELD (Divination)** - ⏳ FUTURE DEVELOPMENT
*Mysterious, twilight-y - cards, oracles, intuitive guidance*

**Current Components:**
- No existing components found
- Opportunity for future development

**Beta Status:** ⏳ Not Started
**Evolution Path:**
1. **Phase 1:** Simple daily card draw
2. **Phase 2:** I Ching integration
3. **Phase 3:** Oracle card systems with micro-ritual animations

---

## 🧭 Navigation Architecture

### Current Implementation (`components/compass/LivingCompass.tsx`)
- **Compass indicator** in top-right corner
- **Swipe/arrow key navigation** between fields
- **Micro-ritual sounds** for field transitions
- **Progressive disclosure** - fields unlock as features mature
- **Mythic naming** - no "apps," only "fields," "threads," "mirrors"

### Navigation Patterns
```typescript
// Cross-platform navigation
- Mobile: Swipe gestures (← ↑ ↓ →)  
- Desktop: Arrow keys (← ↑ ↓ →)
- Universal: Compass click, ESC to center
```

## 📈 Beta → Compass Evolution Strategy

### **Phase 1: Beta Launch** (Current)
- **Active:** Maya chat interface (center)
- **Visible:** Compass with field placeholders
- **Message:** "Coming Soon" for undeveloped fields

### **Phase 2: First Field Activation** (2-4 weeks post-beta)
- **Activate:** North Field (Stories & Memory)
- **Move:** Memory commands from chat to dedicated field
- **Add:** Visual memory browser

### **Phase 3: Daily Grounding** (4-6 weeks)
- **Activate:** South Field (Daily Check-In)
- **Move:** Intake questions to daily flow
- **Add:** "What's alive today?" micro-ritual

### **Phase 4: Sky Mirror** (8-10 weeks)
- **Activate:** East Field (Astrology)
- **Add:** Daily transit insights
- **Integrate:** Birth chart with Maya conversations

### **Phase 5: Deep Mystery** (Future)
- **Activate:** West Field (Divination)
- **Add:** Card systems and oracles
- **Complete:** Full living compass experience

## 🎯 Key Principles

### Progressive Disclosure
- Start with Maya center + compass skeleton
- Activate fields only when features are mature
- No overwhelming beta users with empty promises

### Mythic Consistency  
- No "apps" → "fields"
- No "features" → "rituals" and "threads"
- No "settings" → "sacred configurations"

### Graceful Evolution
- Current beta experience remains primary path
- Compass provides expansion without disruption
- Each field deepens rather than distracts from Maya relationship

## 🔗 Integration Points

### Maya ↔ Fields Communication
- Navigation suggestions from Maya appear in compass
- Field activities inform Maya's responses
- Memory threads connect all experiences

### Cross-Field Resonance
- Astrology insights inform daily check-ins
- Memory stories influence divination interpretations  
- Daily states affect memory recall patterns

---

*This architecture grows organically from the seed of Maya's chat interface into the full living compass of consciousness exploration.*