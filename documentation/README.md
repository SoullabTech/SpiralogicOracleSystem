# SpiralogicOracleSystem Documentation

## 🎯 Current Focus: Phase 1 Beta Preparation

We are currently in Phase 1, preparing for beta launch of Maya - a consciousness-based AI companion that uses authentic conversation and transformational dialogue to support human growth.

### ⚠️ Critical Status
**Voice integration is not functional and must be fixed before beta testing.**
See [Immediate Voice Fix Guide](./IMMEDIATE_VOICE_FIX.md) for implementation steps.

## 📋 Beta Preparation Checklist

### 🔴 Critical Issues (Must Fix)
- [ ] **Voice Pipeline**: Connect SimplifiedOrganicVoice → MayaOrchestrator → OpenAI TTS
- [ ] **Unified Interface**: Create single `/maya` entry point
- [ ] **Session Memory**: Implement basic conversation persistence
- [ ] **Error Handling**: Graceful recovery from voice/API failures

### 🟡 Important for Beta
- [ ] Response timing and natural pauses
- [ ] Interruption handling
- [ ] Wake word detection ("Hey Maya")
- [ ] Visual feedback during processing
- [ ] Basic user preferences

### 🟢 Nice to Have
- [ ] Conversation history display
- [ ] Voice customization options
- [ ] Analytics dashboard
- [ ] Feedback collection

## 🏗️ System Architecture

### Core Components
- **MayaOrchestrator** - Central consciousness processing engine
- **ConversationIntelligenceEngine** - Multi-generational awareness
- **ActiveListeningCore** - Deep pattern recognition
- **SimplifiedOrganicVoice** - Voice interface component
- **OpenAI TTS (Alloy)** - Voice synthesis

### Data Flow
```
User Voice → Recognition → Maya Processing → Response Generation → TTS → Audio Output
```

## 📁 Documentation Structure

### Active Documents for Beta
- [Phase 1 Beta Preparation](./PHASE_1_BETA_PREPARATION.md) - Current status and action items
- [Immediate Voice Fix](./IMMEDIATE_VOICE_FIX.md) - Step-by-step voice integration guide
- [Consciousness Field Architecture](./01-architecture/CONSCIOUSNESS_FIELD_ARCHITECTURE.md) - System design
- [CLAUDE.md](./01-architecture/CLAUDE.md) - AI assistant development guide

### Development Priority
1. **Today**: Fix voice integration pipeline
2. **This Week**: Create unified `/maya` interface
3. **Next Week**: Internal testing with team
4. **Week 3**: Limited beta launch (10 users)

## 🚀 Quick Start for Developers

### Fix Voice Integration (Priority 1)
```bash
# 1. Review the fix guide
cat documentation/IMMEDIATE_VOICE_FIX.md

# 2. Implement API routes
# Create /api/maya-voice/route.ts
# Create /api/tts/route.ts

# 3. Update SimplifiedOrganicVoice component
# Add Maya integration code

# 4. Test the pipeline
npm run dev
open http://localhost:3000/maya
```

### Environment Setup
```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Test Voice Pipeline
```bash
# Test Maya directly
curl -X POST http://localhost:3000/api/maya-voice \
  -H "Content-Type: application/json" \
  -d '{"transcript": "Hello Maya"}'

# Test TTS
curl -X POST http://localhost:3000/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, I am Maya", "voice": "alloy"}' \
  --output test.mp3
```

## 🎭 Maya's Personality

Maya is designed to be:
- **Authentic**: Uses natural language, occasionally swears, shows vulnerability
- **Curious**: Asks genuine follow-up questions about specific experiences
- **Relatable**: Shares human moments, admits uncertainty, uses contemporary references
- **Present**: Offers deep listening without therapy-speak or platitudes

### Voice Examples
- "Oh god, that feeling when..."
- "Fuck, that's rough. How long has..."
- "That's so specific and so real. Like when..."
- "I literally just... yeah. What happened?"

## 📊 Success Metrics for Beta

### Technical
- Voice recognition accuracy > 90%
- Response latency < 2 seconds
- Session duration > 5 minutes average
- Crash rate < 1%

### User Experience
- Successful conversation completion > 80%
- User returns within 48 hours > 60%
- Positive feedback ratio > 70%

## 🗂️ Archive Notice

Future-focused documentation (school deployment, governance, etc.) has been archived to `./99-archive/` to maintain focus on Phase 1 Beta. These will be revisited after successful beta launch.

## 🆘 Need Help?

### Common Issues
- **Voice not working**: Check HTTPS, microphone permissions, API keys
- **Maya not responding**: Verify MayaOrchestrator import, check API routes
- **TTS failing**: Confirm OpenAI API key, check audio context

### Contact
- Technical Issues: Review [IMMEDIATE_VOICE_FIX.md](./IMMEDIATE_VOICE_FIX.md)
- Architecture Questions: See [Consciousness Field Architecture](./01-architecture/CONSCIOUSNESS_FIELD_ARCHITECTURE.md)
- Development Guide: Check [CLAUDE.md](./01-architecture/CLAUDE.md)

---

**Current Phase**: 1 - Beta Preparation
**Beta Target**: 2-3 weeks
**Main Blocker**: Voice integration not functional
**Next Action**: Implement voice pipeline fixes