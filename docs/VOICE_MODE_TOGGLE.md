# 🎚️ VOICE_MODE_TOGGLE.md

Canonical reference for switching between Oracle voice modes

## 🌐 Purpose

The Voice Mode Toggle allows users to shift between different relational modes with their Oracle agent, depending on their intention:
- **Conversational** 🗣️ → Everyday back-and-forth dialogue
- **Meditative** 🧘 → Quiet presence with soft cues, long pauses, breath pacing
- **Guided** 🌟 → Ritualized flow, prompts, and gentle leading

This keeps the Oracle flexible while respecting user sovereignty.

## 🔄 Core Flow

```mermaid
flowchart LR
    U[User] -->|Wake Word| M[Mic Activated]
    M -->|Default: Conversational| C[Conversational Mode]
    M -->|Toggle: "Go Meditative"| D[Meditative Mode]
    M -->|Toggle: "Guide me"| G[Guided Mode]

    C -->|User Says "Switch"| D
    C -->|User Says "Guide"| G
    D -->|User Says "Back to talking"| C
    G -->|User Says "Quiet now"| C
```

## 🎛️ UI / UX Cues

### Conversational Mode 🗣️
- **Indicator**: 🟢 "Talking" badge
- Mic stays live with wake word ("Hello Maya")
- Replies are natural, short, responsive

### Meditative Mode 🧘
- **Indicator**: 🔵 "Presence" badge
- Longer pauses, voice softer
- Optional background soundscape (breath, elemental tones)
- Replies minimal: "I'm here with you"

### Guided Mode 🌟
- **Indicator**: 🟣 "Guided" badge
- Structured voice flow (ritual, prompts, check-ins)
- May auto-transition stages (e.g., breath → reflection → elemental cue)

## ⚙️ Backend Pseudocode

```typescript
// User preference stored in session
let currentMode: "conversational" | "meditative" | "guided" = "conversational";

// Handle toggle command
function toggleMode(command: string) {
  if (command.includes("meditate")) currentMode = "meditative";
  else if (command.includes("guide")) currentMode = "guided";
  else if (command.includes("talk")) currentMode = "conversational";
}

// Voice generation respects mode
function generateVoiceResponse(text: string) {
  switch(currentMode) {
    case "meditative":
      return applyBreathPacing(applySofterTone(text));
    case "guided":
      return applyRitualFlow(text);
    default:
      return text; // Conversational
  }
}
```

## 🔐 Privacy & Trust

- Mode switching happens on-device or server-side, not through third-party APIs
- No personal data is stored — only mode state + session logs
- Users can always say: "Stop listening" → mic closes, session ends

## 🚀 Future Extensions

- **Dream Mode** 🌌 → For voice journaling + symbolic reflection
- **Collective Listening** 🕸️ → Syncs to team's Aetheric Orchestrator
- **Custom Rituals** → Users define their own sequences

## ✨ Implementation

With this toggle, the Oracle can adapt to the user's present need without heavy scripting or over-design.