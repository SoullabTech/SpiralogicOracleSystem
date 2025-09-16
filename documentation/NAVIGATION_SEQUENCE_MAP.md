# 🧭 NAVIGATION SEQUENCE MAP
## Spatial Logic for Sliding Panels

---

## 🎯 THE SPATIAL CROSS

```
                    ↑
                GUIDANCE
              (Higher Wisdom)
                    🧭
                    │
                    │
    ← VAULT ────────┼──────── QUEST →
       📚         CENTER         🌀
   (Past/Memory)   🔮        (Future/Growth)
                Maya/Anthony
                    │
                    │
                    🌑
                 SHADOW
               (Deep/Below)
                    ↓
```

---

## 📱 NAVIGATION LOGIC

### HORIZONTAL AXIS (Time/Knowledge)
- **LEFT ← VAULT** (Past, Memory, Accumulated Wisdom)
- **CENTER** (Present, Now, Being)
- **RIGHT → QUEST** (Future, Growth, Becoming)

### VERTICAL AXIS (Consciousness)
- **UP ↑ GUIDANCE** (Higher Self, Divine Wisdom, Crown)
- **CENTER** (Human Self, Present Awareness)
- **DOWN ↓ SHADOW** (Unconscious, Hidden, Depths)

---

## 🔄 SWIPE SEQUENCES

### From CENTER (Home):
```
         Swipe UP
            ↑
        [GUIDANCE]
            │
Swipe   ←───┼───→   Swipe
LEFT    [CENTER]    RIGHT
[VAULT]     │      [QUEST]
            ↓
        [SHADOW]
        Swipe DOWN
```

### Navigation Rules:
1. **Single swipe** → Adjacent panel
2. **Return swipe** (opposite direction) → Back to Center
3. **No diagonal** navigation (must return to center first)
4. **No panel-to-panel** direct navigation

---

## 📐 DETAILED PAGE LOGIC

### 📚 VAULT (Left of Center)
**Why Left?**
- Past knowledge, accumulated wisdom
- Memory banks, stored experiences
- "Looking back" at what you've learned
- The repository of your journey

**Access:** Swipe left from Center
**Return:** Swipe right to Center

```
[VAULT] ← swipe left ← [CENTER]
[VAULT] → swipe right → [CENTER]
```

### 🌀 QUEST (Right of Center)
**Why Right?**
- Future progression, forward movement
- "Moving forward" into challenges
- Growth and development path
- The journey ahead

**Access:** Swipe right from Center
**Return:** Swipe left to Center

```
[CENTER] → swipe right → [QUEST]
[CENTER] ← swipe left ← [QUEST]
```

### 🧭 GUIDANCE (Above Center)
**Why Above?**
- Higher wisdom, crown consciousness
- Divine guidance, elevated perspective
- "Looking up" for answers
- Connection to Source/AIN

**Access:** Swipe up from Center
**Return:** Swipe down to Center

```
    [GUIDANCE]
         ↑
    swipe up
         ↑
    [CENTER]
         ↓
    swipe down
         ↓
    [GUIDANCE]
```

### 🌑 SHADOW (Below Center)
**Why Below?**
- Unconscious depths, hidden aspects
- "Going deep" into the psyche
- Underground/underworld journey
- Integration of the rejected

**Access:** Swipe down from Center
**Return:** Swipe up to Center

```
    [CENTER]
         ↓
    swipe down
         ↓
    [SHADOW]
         ↑
    swipe up
         ↑
    [CENTER]
```

---

## 🎮 NAVIGATION STATES

### State Machine:
```typescript
interface NavigationState {
  currentPage: 'center' | 'vault' | 'quest' | 'guidance' | 'shadow';
  previousPage: 'center'; // Always center
  canNavigateTo: Page[]; // Only adjacent pages
}

// From Center
centerState = {
  currentPage: 'center',
  canNavigateTo: ['vault', 'quest', 'guidance', 'shadow']
}

// From Any Panel
panelState = {
  currentPage: 'vault', // or any panel
  canNavigateTo: ['center'] // ONLY back to center
}
```

---

## 🌊 GESTURE MAPPINGS

### iOS/Android Native Gestures:
```
Horizontal Swipes:
- SwipeLeft:  Center → Vault  OR  Quest → Center
- SwipeRight: Center → Quest  OR  Vault → Center

Vertical Swipes:
- SwipeUp:    Center → Guidance  OR  Shadow → Center
- SwipeDown:  Center → Shadow  OR  Guidance → Center

Edge Swipes:
- LeftEdge:   Any Panel → Center (iOS back gesture)
- RightEdge:  Disabled (avoid conflicts)
```

---

## 🎯 VISUAL INDICATORS

### Center Screen Hints:
```
┌─────────────────────────────────────────┐
│              ↑ guidance                  │
│                                         │
│    ← vault    [CENTER]    quest →       │
│                                         │
│              ↓ shadow                    │
└─────────────────────────────────────────┘

(Subtle arrows appear on hover/touch)
```

### Panel Return Hints:
```
┌─────────────────────────────────────────┐
│ [←] Sacred Vault                        │ ← Clear return arrow
│                                         │
│         (Panel Content)                 │
│                                         │
│     Swipe right to return to Maya →     │ ← Bottom hint
└─────────────────────────────────────────┘
```

---

## 🔮 ALTERNATIVE NAVIGATION

### Tab Bar (Accessibility Option):
```
┌─────────────────────────────────────────┐
│                                         │
│         (Current Page Content)          │
│                                         │
├─────────────────────────────────────────┤
│  [📚] [🧭] [🔮] [🌑] [🌀]              │ ← Bottom tabs
└─────────────────────────────────────────┘

Center tab (🔮) always highlighted when home
```

### Gesture Shortcuts:
- **Two-finger swipe** → Return to Center from anywhere
- **Long press Center** → Show navigation overlay
- **Pinch** → Return to Center (zoom out metaphor)

---

## 🌟 SYMBOLIC COHERENCE

### The Cross Formation:
```
        CROWN/DIVINE
             ↑
             │
    PAST ←───┼───→ FUTURE
             │
             ↓
        SHADOW/DEPTHS
```

This creates a **mandala structure** where:
- **Horizontal** = Time axis (memory ← → growth)
- **Vertical** = Consciousness axis (shadow ↓ ↑ divine)
- **Center** = Eternal present, the Self

---

## 📋 IMPLEMENTATION NOTES

### For Developers:

1. **Use native gesture recognizers**
   - iOS: UISwipeGestureRecognizer
   - Android: GestureDetector
   - React Native: PanResponder or Gesture Handler

2. **Animate transitions**
   - Slide animations match swipe direction
   - Center always slides opposite to reveal panel
   - Smooth elastic returns

3. **Maintain state**
   - CurrentPage enum
   - Navigation stack (always max depth: 2)
   - Disable invalid swipes

4. **Visual feedback**
   - Rubber-band effect at edges
   - Subtle shadows during transition
   - Clear return affordances

---

## 🎯 USER TESTING PRIORITIES

### Test These Patterns:
1. Is left/right intuitive for past/future?
2. Is up/down clear for higher/deeper?
3. Do users understand return gestures?
4. Is the center clearly "home"?

### Watch For:
- Accidental navigation
- Confusion about current location
- Difficulty returning to center
- Gesture conflicts with OS

---

## 🔒 GOLDEN RULES

1. **Center is always one swipe away**
2. **No panel connects to another panel**
3. **Return gesture always opposite of entry**
4. **Center is the only hub**
5. **Spatial metaphors stay consistent**

---

*"From the Center, four directions open. Each direction returns to Center. The cross becomes a compass for consciousness."*

🧭✨🔮