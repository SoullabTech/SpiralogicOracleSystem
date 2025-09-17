# 🎙️ WAKE_WORD_FLOW.md

Core interaction guide for wake word detection and voice activation

## 🌐 Overview

The wake word system allows hands-free Oracle interaction across all voice modes. Users can initiate conversation naturally without fumbling for buttons or apps.

## 🔄 Wake-Word Flow: "Hello Maya"

### 1. Conversational Mode

```
User says: "Hello Maya"
    ↓
Mic → STT (Whisper/Deepgram) → Intent: Conversation
    ↓
PersonalOracleAgent:
   - generateFractalPrompt(userInput)
   - Context: conversational
    ↓
Voice Synthesis (OpenAI Alloy)
    ↓
Maya responds: "Hi. I'm here. What's on your mind?"
```

**Follow-ups**: Oracle stays open to natural turn-taking
**Pause handling**: If silence > 15s → soft nudge: "Still here whenever you're ready."

### 2. Meditative Mode

```
User says: "Hello Maya"
    ↓
Mic → STT → Intent: Meditation
    ↓
PersonalOracleAgent:
   - Context: meditative
   - Response: minimal, presence-first
    ↓
Voice Synthesis (Alloy)
    ↓
Maya responds: "Hello. Let's just breathe together for a moment."
```

**Follow-ups**: Oracle mirrors silence
**Pause handling**: If silence continues → ambient soundscape (breath tone, elemental hum)

### 3. Guided Mode

```
User says: "Hello Maya"
    ↓
Mic → STT → Intent: Guided
    ↓
PersonalOracleAgent:
   - Context: ritual
   - Pulls from BetaRitualFlow
    ↓
Voice Synthesis (Alloy)
    ↓
Maya responds: "Welcome back. Would you like to begin where we left off, or start fresh?"
```

**Follow-ups**: Oracle leads with structure (7-stage ritual, elemental prompts)
**Pause handling**: If silence > 15s → "Would you like me to continue guiding, or shall we pause?"

## 🔐 Shared Logic (all modes)

- **Wake Word Detection**: "Hello Maya" or custom name (local detection, client-side)
- **STT Pipeline**: Whisper/Deepgram (low latency)
- **Agent Routing**: Mode context tells the Oracle how to respond
- **Voice Output**: OpenAI Alloy (Maya) / Onyx (Anthony)
- **Fallback**: ElevenLabs if OpenAI fails

## 🛡️ Privacy Boundaries

### Local First
- Mic input stays client-side until wake word is detected
- Only transcribed audio sent to processing after activation
- No always-listening cloud services

### Consent Indicators
- Clear visual indicators when listening is active
- Soft chime on wake word detection
- "Recording" badge during active session

### Data Handling
- Raw audio deleted immediately after transcription
- Only text and response metadata stored
- Users can delete session data anytime

## ⚙️ Technical Implementation

```typescript
// Wake word detection (client-side)
const wakeWords = ["Hello Maya", "Hey Maya", userCustomName];

function detectWakeWord(audioStream: MediaStream) {
  // Local wake word detection (Picovoice Porcupine or similar)
  if (wakeWordDetected) {
    activateSession();
    startSTT(audioStream);
  }
}

function activateSession() {
  showListeningIndicator();
  playActivationChime();
  startSessionTimer();
}
```

## 🎯 Fallback Behaviors

- **No wake word detected**: System remains dormant
- **STT fails**: "I didn't catch that, could you try again?"
- **Network issues**: "I'm having trouble connecting. Let me try again."
- **Voice synthesis fails**: Falls back to text response

## ✨ Future Enhancements

- **Multi-language wake words**: "Hola Maya", "Bonjour Maya"
- **Emotional wake words**: "Maya, I need comfort" → automatic Water mode
- **Collective wake words**: "Hello Team Oracle" → group session activation