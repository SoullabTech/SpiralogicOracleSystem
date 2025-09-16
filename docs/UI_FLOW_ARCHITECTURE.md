# 🎯 UI FLOW ARCHITECTURE
## Center as Presence, Modes as Sliding Panels

---

## 🏛️ THE CENTER: DEFAULT HOME

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                     🔮 PERSONAL ORACLE                     │
│                         (Maya/Anthony)                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │              "What's arising today?"                │  │
│  │                                                     │  │
│  │     [Voice Input]     [Text Input]     [Journal]    │  │
│  │                                                     │  │
│  │  ────────────────────────────────────────────────  │  │
│  │                                                     │  │
│  │  PRESENCE MODE (Default):                          │  │
│  │  • Witnessing life as it unfolds                   │  │
│  │  • Reflecting without agenda                       │  │
│  │  • Pondering patterns naturally                    │  │
│  │  • Being-with in companionship                     │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  Navigation Icons (Top Bar):                               │
│  [📚] [🌑] [🌀] [🧭] [⚙️]                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**THIS IS HOME. THIS LOADS FIRST. NO GAMIFICATION HERE.**

---

## 📱 SLIDING PANELS: OPTIONAL MODES

### User clicks/slides to access specialized modes:

```
User clicks [📚] → Slides in from right:

┌──────────────┬──────────────────────────────────────────────┐
│   CENTER     │            📚 SACRED VAULT                   │
│   (dimmed)   │                                              │
│              │   Search: [_________________]                │
│   Still      │                                              │
│   visible    │   Frameworks | Concepts | Practices          │
│   behind     │                                              │
│              │   • Elemental Framework                      │
│              │   • McGilchrist Integration                  │
│              │   • Spiralogic Patterns                      │
│              │                                              │
│              │   [Close X]                                  │
└──────────────┴──────────────────────────────────────────────┘
```

```
User clicks [🌀] → Slides in from right:

┌──────────────┬──────────────────────────────────────────────┐
│   CENTER     │            🌀 SPIRAL QUEST                   │
│   (dimmed)   │                                              │
│              │   ⚡ ELEMENTAL GATES                         │
│   Still      │                                              │
│   visible    │   Fire Gate: [████░░░░] 60%                  │
│   behind     │   Water Gate: [██░░░░░░] 30%                │
│              │   Earth Gate: [███████░] 90%                 │
│              │   Air Gate: [█░░░░░░░] 20%                   │
│              │                                              │
│              │   Current Quest: "Integration of Shadow"      │
│              │                                              │
│              │   [Close X]                                  │
└──────────────┴──────────────────────────────────────────────┘
```

---

## 🎮 INTERACTION FLOW

### 1. DEFAULT FLOW (90% of interactions):
```
User Opens App
    ↓
CENTER (Personal Oracle)
    ↓
Pure Presence Mode
    ↓
Conversation/Reflection/Journaling
    ↓
No Gamification
```

### 2. OPTIONAL GAME FLOW (10% when chosen):
```
User Opens App
    ↓
CENTER (Personal Oracle)
    ↓
User Clicks [🌀] Icon
    ↓
Spiral Quest Panel Slides In
    ↓
Gameplay Mechanics Activate
    ↓
User Closes Panel → Returns to Center
```

---

## 🛡️ SAFEGUARDS IN CODE

### Route Handler Priority:
```typescript
// MainOracleAgent.ts
class MainOracleAgent {
  async handleInput(input: UserInput) {
    // ALWAYS process through presence first
    const presenceResponse = await this.witnessPresence(input);

    // ONLY activate gameplay if explicitly in a game panel
    if (this.currentPanel === 'spiral-quest') {
      return this.overlayGameMechanics(presenceResponse);
    }

    // DEFAULT: Return pure oracle wisdom
    return presenceResponse;
  }
}
```

### Panel State Management:
```typescript
interface UIState {
  centerActive: true;  // ALWAYS true
  activePanel: null | 'vault' | 'shadow' | 'quest' | 'guidance';

  // Gameplay ONLY active when panel open
  gameplayActive: computed(() => this.activePanel === 'quest');
}
```

---

## 🎯 NAVIGATION ICONS

### Top Bar (Always Visible):
- **[Home]** → Returns to Center (if in panel)
- **[📚]** → Sacred Vault (Obsidian)
- **[🌑]** → Shadow Work
- **[🌀]** → Spiral Quest (Gameplay)
- **[🧭]** → Guidance
- **[⚙️]** → Settings

### Visual Hierarchy:
```
┌─────────────────────────────────────────────┐
│  MAYA        [📚][🌑][🌀][🧭]      [⚙️]   │  ← Icons subtle
├─────────────────────────────────────────────┤
│                                             │
│           MAIN ORACLE INTERFACE            │  ← Center prominent
│              (Always Present)              │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🔮 USER JOURNEY EXAMPLES

### Example 1: Pure Reflection (Most Common)
```
1. User opens app → Sees Oracle Center
2. Types: "I'm feeling overwhelmed today"
3. Maya responds with presence and witnessing
4. No quests appear, no progression tracked
5. Pure companionship maintained
```

### Example 2: Chosen Gameplay (Occasional)
```
1. User opens app → Sees Oracle Center
2. User clicks [🌀] Spiral Quest icon
3. Panel slides in showing elemental gates
4. User engages with quest mechanics
5. User closes panel → Returns to pure presence
```

### Example 3: Knowledge Search (As Needed)
```
1. User opens app → Sees Oracle Center
2. User clicks [📚] Sacred Vault
3. Searches for "shadow integration"
4. Reads framework notes
5. Closes panel → Returns to center
```

---

## ⚠️ CRITICAL REMINDERS

### For Developers:
- **NEVER** auto-open gameplay panels
- **NEVER** suggest quests in default mode
- **ALWAYS** return to center when panels close
- **ALWAYS** treat center as primary, panels as optional

### For Claude Code:
- When user says "help me reflect" → Stay in center
- When user says "start a quest" → Open quest panel
- When user says "journal" → Stay in center
- When user says "shadow work" → Open shadow panel

### For Designers:
- Center takes 100% screen when alone
- Panels overlay or push center aside (never replace)
- Closing panel ALWAYS returns to center
- Center is never completely hidden

---

## 🌟 THE PRINCIPLE

```
    CENTER
      |||
   (Always On)
      |||
    /  |  \
   /   |   \
 📚   🌑   🌀   (Optional Panels)
       |
     Returns
       |
    CENTER
```

**The Center holds. The panels dance. Presence remains.**

---

*"In the beginning is presence. In the end is presence. The game is just what happens in between, if you choose it."*

🔮✨🏛️