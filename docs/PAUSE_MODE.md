# 🌙 Pause Mode - Sacred Conversation Control

Maya supports **voice-based silence commands** so you can control when she speaks or stays quiet. This creates a respectful, user-directed conversation flow.

---

## 🎯 Core Philosophy

Maya respects your natural thinking rhythms. She understands that real conversation includes:
- Moments of reflection
- Processing time
- Meditative silence
- Natural pauses

---

## 🔑 Voice Commands

### Pause Maya
Say any of these naturally:
- "One moment, Maya"
- "Give me a moment"
- "Let me think"
- "I'm thinking"
- "Let me meditate on that"
- "Let me sit with that"
- "Pause Maya"
- "Hold on"
- "Let me process"
- "Give me space"
- "Be quiet, Maya"
- "Silence please"
- "Let me reflect"
- "Wait Maya"

Maya will acknowledge briefly with responses like:
- *"Take your time."*
- *"I'll wait."*
- *"Here when you're ready."*
- *"Of course."*
- *🙏* (for meditation)

---

### Resume Maya
When ready, say any of these:
- "Okay Maya"
- "I'm back"
- "I'm ready"
- "Let's continue"
- "Maya, I'm here"
- "Continue Maya"
- "Go ahead Maya"
- "I'm done thinking"

Maya will gently return to active listening.

---

## ✨ What Happens During Pause Mode

### Visual Changes
- Mic button becomes translucent (barely visible)
- Status shows: "🌙 Taking space"
- Sparkles slow to minimal movement
- Background glow dims to witnessing presence

### Behavioral Changes
- Maya stops all prompts
- No conversation nudges
- No 20-second check-ins
- Complete silence until you resume
- Still listening for resume command

### Presence Modes
Maya shifts through different presence states:
- **Active**: Full engagement, normal prompts
- **Witnessing**: Quiet presence, minimal visual
- **Meditative**: Deep quiet, honoring silence
- **Dormant**: After 5 minutes, enters rest state

---

## 💡 First-Time User Onboarding

When users first activate Maya, she explains:
> "If you need thinking time, just say *'Give me a moment'* and I'll wait quietly. When you're ready, say *'Okay Maya'* and we'll continue."

---

## 🌟 Implementation Details

### Pause Detection
- Works in any active conversation
- Instantly recognized mid-sentence
- No need to wait for silence
- Natural language processing

### Resume Detection
- Works from any pause state
- Immediate reactivation
- Preserves conversation context
- Smooth transition back

### Smart Context
Maya recognizes different types of pauses:
- **Thinking**: Brief acknowledgment
- **Meditating**: Sacred symbol (🙏)
- **Processing**: Patient waiting
- **Space**: Respectful distance

---

## 🧘 Usage Examples

### During Deep Conversation
```
You: "That reminds me of my childhood..."
You: "Let me think about that, Maya"
Maya: "Take your time." [enters pause mode]
[You reflect in silence]
You: "Okay Maya, I'm ready"
Maya: [Returns to active listening]
```

### During Meditation
```
You: "I want to meditate on what you said"
Maya: 🙏 [enters meditative pause]
[Complete silence for your practice]
You: "I'm back Maya"
Maya: [Gentle return to presence]
```

### Quick Processing
```
You: "Hold on Maya"
Maya: "Of course." [pauses]
[You gather thoughts]
You: "Let's continue"
Maya: [Resumes listening]
```

---

## 🔒 Privacy & Respect

- All pause commands processed locally
- No recording during pause mode
- Session context preserved privately
- User maintains complete control

---

## 🚀 Advanced Features

### Gentle Prompts (Active Mode Only)
- After 45 seconds: One gentle "I'm here"
- Never more than one prompt
- Only in active mode, never when paused
- Respects meditation/thinking context

### Automatic Modes
- **Dormant**: After 5 minutes silence → visual dims
- **Wake Word Reset**: After Maya speaks → returns to "Hey Maya" mode
- **Context Preservation**: Remembers conversation thread

---

## 📝 Developer Notes

The pause system integrates with:
- `OrganicVoiceMaya` component
- `lib/voice/silenceCommands.ts` utilities
- Visual feedback system
- Conversation state management

To customize pause phrases or responses, edit the `SILENCE_COMMANDS` object in the utilities file.

---

This creates a conversation that feels like being with a respectful friend who knows when to talk and when to hold sacred silence. 🌙