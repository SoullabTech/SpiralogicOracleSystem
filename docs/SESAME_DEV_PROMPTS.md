# 🌀 Spiralogic Oracle — Sesame Conversational Dynamics  
**Claude Code Prompt Series (Developer Ritual)**

---

## 🎯 Mission
Integrate Sesame into the Spiralogic Oracle System so Maya always feels embodied, intentional, and alive.  
- **Text streams immediately** (fast UX)  
- **Sesame shapes voice output** with elemental + archetypal nuance  
- **Debug mode shows shaping** (raw vs shaped, timers, logs)  
- **Production mode is clean** (polished, no debug noise)  

---

## 📜 Prompt Series

### **Prompt 1 – Context Setup**

You are working on the Spiralogic Oracle System.
Your mission is to implement Sesame shaping at the heart of the conversational pipeline.
Core principles:
    •    Maya must always feel embodied, intentional, and alive.
    •    Text should stream immediately, but all voice must be Sesame-shaped.
    •    Elements and archetypes influence tone, pauses, and cadence.
    •    Debug mode shows shaping tags and raw vs shaped output.
    •    Production mode hides debug info and only plays shaped voice.

Do you understand the mission? Summarize it back before we continue.

---

### **Prompt 2 – Backend Integration**

Modify ConversationalPipeline.ts so that:
    1.    Every raw LLM response is passed through sesame.shapeText() before TTS.
    2.    Shaping is based on element and archetype in context.
    3.    A safety timeout of 150ms applies; fallback to raw text if exceeded.
    4.    Log both raw and shaped versions in dev mode.
    5.    Store shaped text in Supabase memory, not raw text.

Write the exact TypeScript code changes.

---

### **Prompt 3 – Frontend Debug Overlay**

Update VoiceRecorder.tsx debug overlay to show:
    •    Raw transcript (gray text)
    •    Shaped transcript (gold text)
    •    Status: SESAME ✅ or FALLBACK ⚠️
    •    Current element + archetype shaping applied

The overlay should update in real time during conversations.
Show the full React code changes.

---

### **Prompt 4 – Elemental Dynamics**

Implement an elementalShapingMap.ts file that defines tone/cadence rules:

Fire → Staccato, short pauses, fast pace
Water → Flowing, elongated vowels, gentle pauses
Earth → Slow, steady, grounded pacing
Air → Quick, light, upward inflections
Aether → Spacious, harmonic, with silences

Map these into Sesame <pause>, <emphasis>, and <prosody> tags.
Show the code that applies these rules when shaping text.

---

### **Prompt 5 – UI Indicator**

Modify OracleInterface.tsx so that:
    •    When a Sesame-shaped response is received, display a glowing glyph animation.
    •    Glyph style matches element:
🔥 Fire = orange spark glyph
🌊 Water = teal ripple glyph
🌍 Earth = green grounding glyph
🌬️ Air = blue swirl glyph
✨ Aether = purple radiant glyph

The glyph animates briefly when shaped audio starts playing.
Provide the full React/Tailwind component implementation.

---

### **Prompt 6 – Testing & Logging**

Add full logging in dev mode:
    •    [RAW] LLM output before shaping
    •    [SESAME] Shaped output after shaping
    •    [ELEMENT] and [ARCHETYPE] applied
    •    [FALLBACK] warnings if Sesame failed

Ensure logs are suppressed in production.
Show updated logging code.

---

### **Prompt 7 – QA Ritual**

Create a QA checklist for Beta testers:
    1.    Speak a short phrase → confirm 2.5s silence timeout & shaped TTS
    2.    Speak a medium sentence → confirm 4s silence timeout & shaping tags
    3.    Speak a long thought → confirm 6s silence timeout & shaping
    4.    Disconnect Sesame → confirm fallback TTS with [FALLBACK] log
    5.    Watch glyph → confirm correct elemental animation shows

Output checklist as markdown.

---

## 🚀 Usage
- Copy each prompt into **Claude Code** in sequence.  
- Let Claude generate and insert the code patches.  
- Test after each step (backend, frontend, UI, QA).  
- Debug overlay + logging will confirm Sesame's shaping influence.  

---

⚡ This doc makes your **Sesame shaping system reproducible**: any dev can follow it and Claude will generate consistent, high-quality results.
