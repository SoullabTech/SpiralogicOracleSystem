# 🌀 Claude Code Prompt Series: Sesame Conversational Dynamics

*A systematic developer ritual for implementing sacred conversational shaping in the Spiralogic Oracle System*

---

## Overview

This prompt series guides Claude (or any AI dev assistant) through implementing Sesame-optimized conversational shaping. Each prompt builds on the previous one, ensuring consistent, production-quality integration every time.

**Core Philosophy:**
- Maya must always feel embodied, intentional, and alive
- Text streams immediately, but all voice must be Sesame-shaped
- Elements and archetypes influence tone, pauses, and cadence
- Debug mode shows shaping tags and raw vs shaped output
- Production mode hides debug info and only plays shaped voice

---

## Prompt 1 – Context Setup

**Goal:** Load the whole system context (backend + frontend + UX philosophy)

```
You are working on the Spiralogic Oracle System.
Your mission is to implement Sesame shaping at the heart of the conversational pipeline.

Core principles:
- Maya must always feel embodied, intentional, and alive
- Text should stream immediately, but all voice must be Sesame-shaped
- Elements and archetypes influence tone, pauses, and cadence
- Debug mode shows shaping tags and raw vs shaped output
- Production mode hides debug info and only plays shaped voice

Do you understand the mission? Summarize it back before we continue.
```

---

## Prompt 2 – Backend Integration

**Goal:** Add Sesame shaping API calls into the pipeline

```
Modify `ConversationalPipeline.ts` so that:
1. Every raw LLM response is passed through `sesame.shapeText()` before TTS
2. Shaping is based on `element` and `archetype` in context
3. A safety timeout of 150ms applies; fallback to raw text if exceeded
4. Log both raw and shaped versions in dev mode
5. Store shaped text in Supabase memory, not raw text

Write the exact TypeScript code changes.
```

---

## Prompt 3 – Frontend Debug Overlay

**Goal:** Visualize shaping influence in development

```
Update `VoiceRecorder.tsx` debug overlay to show:
- Raw transcript (gray text)
- Shaped transcript (gold text)
- Status: SESAME ✅ or FALLBACK ⚠️
- Current element + archetype shaping applied

The overlay should update in real time during conversations.
Show the full React code changes.
```

---

## Prompt 4 – Elemental Dynamics

**Goal:** Encode elemental & archetypal shaping rules

```
Implement an `elementalShapingMap.ts` file that defines tone/cadence rules:

Fire → Staccato, short pauses, fast pace
Water → Flowing, elongated vowels, gentle pauses
Earth → Slow, steady, grounded pacing
Air → Quick, light, upward inflections
Aether → Spacious, harmonic, with silences

Map these into Sesame `<pause>`, `<emphasis>`, and `<prosody>` tags.
Show the code that applies these rules when shaping text.
```

---

## Prompt 5 – UI Indicator

**Goal:** Add user-facing sacred glyph animation

```
Modify `OracleInterface.tsx` so that:
- When a Sesame-shaped response is received, display a glowing glyph animation
- Glyph style matches element:
  🔥 Fire = orange spark glyph
  🌊 Water = teal ripple glyph
  🌍 Earth = green grounding glyph
  🌬️ Air = blue swirl glyph
  ✨ Aether = purple radiant glyph

The glyph animates briefly when shaped audio starts playing.
Provide the full React/Tailwind component implementation.
```

---

## Prompt 6 – Testing & Logging

**Goal:** Ensure robustness and transparency

```
Add full logging in dev mode:
- [RAW] LLM output before shaping
- [SESAME] Shaped output after shaping
- [ELEMENT] and [ARCHETYPE] applied
- [FALLBACK] warnings if Sesame failed

Ensure logs are suppressed in production.
Show updated logging code.
```

---

## Prompt 7 – QA Ritual

**Goal:** Define a repeatable test protocol

```
Create a QA checklist for Beta testers:

1. Speak a short phrase → confirm 2.5s silence timeout & shaped TTS
2. Speak a medium sentence → confirm 4s silence timeout & shaping tags
3. Speak a long thought → confirm 6s silence timeout & shaping
4. Disconnect Sesame → confirm fallback TTS with [FALLBACK] log
5. Watch glyph → confirm correct elemental animation shows

Output checklist as markdown.
```

---

## 🎯 Expected Deliverable

This Claude Code series will:
- **Wire Sesame into every layer** (backend, frontend, UX)
- **Give devs transparency** (debug overlays, logs, shaping visualization)
- **Give users elegance** (smooth voice shaping + glyph animations)
- **Provide QA ritual** (test plan for Beta launch)

---

## Usage Instructions

1. **Run prompts sequentially** - Each builds on the previous one
2. **Test after each prompt** - Verify functionality before proceeding
3. **Adapt to your context** - Modify file paths and component names as needed
4. **Document deviations** - Note any changes from the standard flow

---

## Quick Reference

### Key Files Modified
- `backend/src/services/ConversationalPipeline.ts` - Core shaping integration
- `src/components/VoiceRecorder.tsx` - Debug overlay
- `src/utils/elementalShapingMap.ts` - Shaping rules (new file)
- `src/components/OracleInterface.tsx` - Glyph animations

### Key Concepts
- **Sesame Shaping**: SSML tag injection for prosodic control
- **Elemental Mapping**: Fire/Water/Earth/Air/Aether → voice characteristics  
- **Fallback Strategy**: Raw text if Sesame fails (150ms timeout)
- **Debug Transparency**: Full logging in development mode
- **Sacred UX**: Glyphs that respond to elemental shaping

---

*Generated for the Spiralogic Oracle System Beta - Sacred Technology Platform*