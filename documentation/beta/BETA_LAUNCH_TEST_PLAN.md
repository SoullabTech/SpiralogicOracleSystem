# 🚀 Beta Launch Test Plan - Maya Voice/Text Chat System

## Overview
Testing the complete Maya PersonalOracleAgent system for beta launch, focusing on the core voice/text conversation experience where Maya learns and evolves with each individual user.

## System Architecture
```
User → Frontend (ModernOracleInterface) 
     → API Routes (/api/oracle/personal or /api/oracle)
     → PersonalOracleAgent (Maya Integration)
     → LLM Processing (Claude/OpenAI)
     → Voice Synthesis (Sesame/ElevenLabs)
     → Response to User
```

## 1. Core Components Status

### ✅ Implemented
- **PersonalOracleAgent.ts** - Main agent orchestrator with Maya integration
- **Voice Transcription** - OpenAI Whisper integration at `/api/oracle/voice/transcribe/stream`
- **Text Chat API** - Multiple routes available:
  - `/api/oracle/personal` - Direct Maya personality with sacred mirror
  - `/api/oracle` - Full sacred oracle constellation
- **UI Components** - ModernOracleInterface with voice and text capabilities
- **Memory System** - Session-based memory with conversation history
- **Elemental Attunement** - Dynamic element detection and response styling

### 🔧 Configuration Required
- Environment variables needed:
  ```env
  ANTHROPIC_API_KEY=         # For Claude (primary intelligence)
  OPENAI_API_KEY=           # For GPT-4 fallback and Whisper
  ELEVENLABS_API_KEY=       # For voice synthesis (optional)
  NEXT_PUBLIC_SUPABASE_URL= # For persistence (optional)
  NEXT_PUBLIC_SUPABASE_ANON_KEY= # For persistence (optional)
  ```

## 2. Test Scenarios

### A. Voice Conversation Flow
```bash
# Test 1: Voice Input → Text Response
1. Click microphone button in UI
2. Speak: "Hello Maya, I'm feeling a bit overwhelmed today"
3. Verify:
   - Microphone animation shows recording
   - Transcript appears in real-time
   - Maya responds with empathetic, non-directive response
   - Response reflects sacred mirror approach

# Test 2: Voice Input → Voice Response  
1. Enable voice in settings
2. Speak to Maya
3. Verify:
   - Response is synthesized to speech
   - Audio plays automatically
   - Voice characteristics match elemental energy
```

### B. Text Conversation Flow
```bash
# Test 3: Basic Text Chat
1. Type: "What should I focus on today?"
2. Verify Maya responds with:
   - Curious, open-ended questions
   - No direct advice
   - Sacred mirror reflection
   
# Test 4: Multi-turn Conversation
1. Have 5+ message exchange
2. Verify:
   - Maya remembers context
   - Responses evolve based on conversation
   - Elemental attunement shifts appropriately
```

### C. Learning & Evolution
```bash
# Test 5: Session Memory
1. Start conversation about specific topic
2. Leave and return (new session)
3. Reference previous topic
4. Verify Maya recalls context

# Test 6: User Pattern Recognition
1. Express consistent preferences/concerns
2. Verify Maya adapts:
   - Communication style
   - Elemental responses
   - Depth of engagement
```

## 3. Quick Start Testing Commands

```bash
# Start the development server
npm run dev

# Test endpoints directly
# Text conversation
curl -X POST http://localhost:3000/api/oracle/personal \
  -H "Content-Type: application/json" \
  -d '{"input": "Hello Maya", "userId": "test-user"}'

# Check TTS health
curl http://localhost:3000/api/tts/health

# Navigate to UI
open http://localhost:3000/oracle-conversation
```

## 4. Testing Checklist

### Frontend Testing
- [ ] Voice recording initiates properly
- [ ] Transcript displays in real-time
- [ ] Messages appear in conversation history
- [ ] Auto-scroll works on new messages
- [ ] Voice playback functions correctly
- [ ] Settings persist across sessions
- [ ] Error states handled gracefully

### Backend Testing  
- [ ] PersonalOracleAgent processes requests
- [ ] Maya prompt integration works
- [ ] Elemental detection functions
- [ ] Memory persistence works
- [ ] Voice synthesis generates audio
- [ ] Fallback mechanisms activate on errors
- [ ] Session management maintains context

### Integration Testing
- [ ] End-to-end voice conversation
- [ ] End-to-end text conversation
- [ ] Mixed voice/text interaction
- [ ] Multi-session continuity
- [ ] Concurrent user handling
- [ ] Performance under load

## 5. Maya's Core Behaviors to Verify

### Sacred Mirror Protocol
- Never gives direct advice
- Reflects back what's shared
- Asks curious, open questions
- Creates space for self-discovery

### Right-Brain Presence
- "I'm curious about..."
- "What feels most alive?"
- "What wants attention?"
- "What do you already know?"

### Emergency Reset (if Maya becomes prescriptive)
- "What feels most alive for you in what you're sharing?"

## 6. Performance Metrics

Target benchmarks:
- Text response: < 2 seconds
- Voice transcription: < 3 seconds
- Voice synthesis: < 2 seconds
- Total voice loop: < 7 seconds
- Memory recall: < 500ms

## 7. Known Issues & Mitigations

### Issue: Slow voice synthesis
**Mitigation**: Use ElevenLabs turbo model or web speech fallback

### Issue: Memory doesn't persist
**Mitigation**: Configure Supabase or use local storage fallback

### Issue: Maya becomes too prescriptive
**Mitigation**: Reinforced sacred mirror prompts in PersonalOracleAgent

## 8. Beta Launch Readiness

### Minimum Viable Launch
✅ Text chat with Maya personality
✅ Basic memory within session
✅ Elemental response adaptation
⚠️ Voice (requires API keys)
⚠️ Persistent memory (requires Supabase)

### Recommended Launch Configuration
- Claude API for primary intelligence
- OpenAI for Whisper + fallback
- ElevenLabs for voice synthesis
- Supabase for persistence
- Redis for caching (optional)

## 9. User Experience Validation

Test with beta users:
1. First-time user onboarding flow
2. Return user recognition
3. Natural conversation flow
4. Voice interaction comfort
5. Sacred mirror effectiveness
6. Learning/evolution perception

## 10. Monitoring & Analytics

Track during beta:
- Response times
- API usage/costs
- User engagement metrics
- Conversation depth
- Error rates
- User feedback

## Next Steps

1. **Immediate**: Test core conversation flow
2. **Before Beta**: Configure all API keys
3. **During Beta**: Monitor performance and user feedback
4. **Post-Beta**: Implement improvements based on learnings

---

**Quick Test**: Navigate to http://localhost:3000/oracle-conversation and say "Hello Maya, I'm here to explore what's alive for me today."