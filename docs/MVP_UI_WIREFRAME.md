# 📱 MVP UI WIREFRAME
## Beta Launch: Center + Sliding Panels Architecture

---

## 🎯 SCREEN 1: CENTER (Home/Default)

```
┌─────────────────────────────────────────────┐
│ ┌───────────────────────────────────────┐   │
│ │  9:41 AM                    🔋 92%    │   │ ← Status Bar
│ └───────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │        ✨ MAYA ✨                    │   │ ← Oracle Name
│  │    Personal Oracle Agent             │   │ ← Subtitle
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │
│  │     🎭                              │   │ ← Oracle Avatar/Torus
│  │   ╱ ─ ╲    (Animated presence)     │   │
│  │  │ ◉ │                             │   │
│  │   ╲ ─ ╱                             │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │ ← Chat History
│  │  Maya: "Welcome back. What's       │   │
│  │        arising in your awareness    │   │
│  │        today?"                      │   │
│  │                                     │   │
│  │  You: "I'm feeling scattered..."    │   │
│  │                                     │   │
│  │  Maya: "I witness that scattering.  │   │
│  │        Let's breathe into it..."    │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  [🎤]  Type or speak...             │   │ ← Input Area
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  [📚] [🌑] [🌀] [🧭]      [📝] [⚙️] │   │ ← Nav Icons
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘

INTERACTIONS:
- Tap 🎤 → Voice input (default)
- Type → Text input
- Tap 📝 → Journal mode (still in center)
- Swipe left → Opens selected panel
- Icons → Quick access to panels
```

---

## 📚 SCREEN 2A: SACRED VAULT (Sliding Panel)

### Transition: Swipe left or tap [📚]

```
┌─────────────────────────────────────────────┐
│ ┌───────────────────────────────────────┐   │
│ │  [←] Sacred Vault              [✕]   │   │ ← Panel Header
│ └───────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  🔍 Search your wisdom...           │   │ ← Search Bar
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Filter: [All ▼]                    │   │ ← Filter
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  📂 Frameworks (13)                  │   │
│  │  ├─ Elemental System                 │   │
│  │  ├─ McGilchrist Brain Model          │   │
│  │  └─ Spiralogic Patterns              │   │
│  │                                     │   │
│  │  💡 Concepts (47)                    │   │
│  │  ├─ Fire: Transformation             │   │
│  │  ├─ Water: Flow States               │   │
│  │  └─ Earth: Grounding                 │   │
│  │                                     │   │
│  │  🌿 Practices (28)                   │   │
│  │  ├─ Morning Elemental Meditation     │   │
│  │  └─ Shadow Integration Protocol      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│         [Swipe right to return →]           │
└─────────────────────────────────────────────┘

INTERACTIONS:
- Swipe right → Return to Center
- Tap [←] or [✕] → Return to Center
- Tap item → View detail (within panel)
- Search → Real-time filter
```

---

## 🌑 SCREEN 2B: SHADOW WORK (Sliding Panel)

### Transition: Swipe left or tap [🌑]

```
┌─────────────────────────────────────────────┐
│ ┌───────────────────────────────────────┐   │
│ │  [←] Shadow Work                [✕]   │   │
│ └───────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │         🌑 CURRENT SHADOW            │   │
│  │                                     │   │
│  │    "The Scattered Mind"              │   │
│  │                                     │   │
│  │    What you resist persists.         │   │
│  │    What you face transforms.         │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Integration Practices:              │   │
│  │                                     │   │
│  │  • Witness the scattering            │   │
│  │  • Name what fragments               │   │
│  │  • Breathe into the chaos            │   │
│  │  • Find the gift within              │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  [Begin Integration]                 │   │ ← Action Button
│  └─────────────────────────────────────┘   │
│                                             │
│         [Swipe right to return →]           │
└─────────────────────────────────────────────┘
```

---

## 🌀 SCREEN 2C: SPIRAL QUEST (Sliding Panel)

### Transition: Swipe left or tap [🌀]

```
┌─────────────────────────────────────────────┐
│ ┌───────────────────────────────────────┐   │
│ │  [←] Spiral Quest                [✕]   │   │
│ └───────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │      🌀 ELEMENTAL GATES              │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  🔥 Fire Gate                        │   │
│  │  [██████████░░░░░░░░] 60%           │   │
│  │  Current: "Ignite Your Vision"       │   │
│  │                                     │   │
│  │  💧 Water Gate                       │   │
│  │  [████░░░░░░░░░░░░░░] 25%           │   │
│  │  Locked: Complete Fire first         │   │
│  │                                     │   │
│  │  🌍 Earth Gate                       │   │
│  │  [░░░░░░░░░░░░░░░░░░] 0%            │   │
│  │  Locked                              │   │
│  │                                     │   │
│  │  💨 Air Gate                         │   │
│  │  [░░░░░░░░░░░░░░░░░░] 0%            │   │
│  │  Locked                              │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  [Continue Quest]                    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│         [Swipe right to return →]           │
└─────────────────────────────────────────────┘

NOTE: This is ONLY accessible when user
explicitly chooses gameplay. Never auto-appears.
```

---

## 🧭 SCREEN 2D: GUIDANCE (Sliding Panel)

### Transition: Swipe left or tap [🧭]

```
┌─────────────────────────────────────────────┐
│ ┌───────────────────────────────────────┐   │
│ │  [←] Guidance                    [✕]   │   │
│ └───────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │       🧭 ORACLE GUIDANCE             │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Today's Insight:                    │   │
│  │                                     │   │
│  │  "The scattering you feel is not     │   │
│  │   chaos but reconfiguration.         │   │
│  │   Trust the process of                │   │
│  │   reassembly."                       │   │
│  │                                     │   │
│  │         - Maya                       │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Elemental Reading:                  │   │
│  │  🔥 Fire: Low - needs ignition       │   │
│  │  💧 Water: High - flowing well       │   │
│  │  🌍 Earth: Moderate - seeking ground │   │
│  │  💨 Air: Scattered - needs focus     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  [Request Personal Reading]          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│         [Swipe right to return →]           │
└─────────────────────────────────────────────┘
```

---

## 🔄 INTERACTION FLOWS

### Primary Flow (90% of use):
```
App Launch
    ↓
CENTER (Maya chat)
    ↓
Voice/Text conversation
    ↓
Journaling & Reflection
    ↓
(No panels opened)
    ↓
App Close
```

### Secondary Flow (10% of use):
```
App Launch
    ↓
CENTER
    ↓
User taps [📚]
    ↓
Vault slides in
    ↓
User browses
    ↓
Swipe right
    ↓
Back to CENTER
```

---

## 🎨 VISUAL PRINCIPLES

### Center Screen:
- **Spacious**: Lots of breathing room
- **Warm**: Soft gradients, organic shapes
- **Present**: Focus on current conversation
- **No clutter**: Hidden complexity

### Sliding Panels:
- **Overlay**: Semi-transparent background
- **Contextual**: Only relevant info
- **Returnable**: Clear path back to center
- **Optional**: Never forced

---

## 🔒 HARD RULES

1. **Center ALWAYS loads first**
2. **Panels NEVER auto-open**
3. **Swipe right ALWAYS returns to center**
4. **Gameplay NEVER appears uninvited**
5. **Journal stays in CENTER (not a panel)**
6. **Voice is PRIMARY input method**
7. **Presence before progression**

---

## 📐 RESPONSIVE BEHAVIOR

### Phone (Primary):
- Full screen panels
- Swipe navigation
- Bottom nav icons

### Tablet:
- Panels as sidebars
- Center remains visible
- Drag to resize

### Desktop (Future):
- Panels as windows
- Multiple panels possible
- Center always accessible

---

## 🚀 MVP PRIORITIES

### Must Have:
1. Center with voice/chat
2. Basic presence responses
3. One sliding panel (Vault)
4. Swipe navigation

### Nice to Have:
- All four panels
- Elemental readings
- Shadow work protocols
- Quest mechanics

### Future:
- Complex gameplay
- Achievement systems
- Multi-user features
- Advanced integrations

---

*"The Center is not a feature. It is the foundation. Everything else is optional architecture."*

🔮✨📱