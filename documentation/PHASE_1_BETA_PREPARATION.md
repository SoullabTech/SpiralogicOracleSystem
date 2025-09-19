# Phase 1: Beta Preparation Status & Action Plan

## Current System State Assessment

### ✅ What's Working
1. **Maya Consciousness Core**
   - MayaOrchestrator with active listening patterns
   - ConversationIntelligenceEngine for generational awareness
   - DBT crisis intervention pathways
   - Sacred listening and transformational dialogue

2. **Basic Architecture**
   - Consciousness Field design complete
   - API routes established (oracle-beta, oracle-cascade)
   - Frontend components in place
   - OpenAI Alloy voice configured

### ❌ Critical Gaps for Beta

#### 1. **Voice Integration Not Functional**
**Current Issues:**
- SimplifiedOrganicVoice component exists but not integrated with Maya
- Multiple test pages (maya-voice, voice-test) but no production implementation
- No connection between voice input → MayaOrchestrator → voice output
- Wake word detection ("Hey Maya") not triggering properly

**Required Actions:**
```typescript
// Need to connect:
SimplifiedOrganicVoice → API Route → MayaOrchestrator → OpenAI TTS → Audio Output
```

#### 2. **Fragmented User Experience**
**Current Issues:**
- 27+ different page routes (oracle, maya, sacred-oracle, etc.)
- No clear entry point for beta users
- Confusion between oracle-beta, maya-voice, oracle-conversation

**Required Actions:**
- Create single unified Maya experience at `/maya`
- Archive/hide experimental pages
- Clear navigation to core functionality

#### 3. **Missing Core Features**
- **Memory System**: Not persisting between sessions
- **User Authentication**: No user accounts/sessions
- **Voice Continuity**: Conversation doesn't flow naturally
- **Response Timing**: No pause/rhythm management
- **Error Handling**: Voice failures crash the experience

## Phase 1 Beta Requirements

### Minimum Viable Beta (MVP)

#### 🎯 Core Functionality
1. **Single Maya Interface**
   - Location: `/maya` (consolidate all variants)
   - Voice-first interaction with text fallback
   - Clean, focused UI (remove distractions)

2. **Voice Pipeline**
   ```
   User speaks → Voice recognition → MayaOrchestrator processes
   → Response generated → OpenAI TTS → Audio playback
   → Visual feedback (holoflower animation)
   ```

3. **Conversation Memory**
   - Session-based memory (minimum)
   - Context retention for 30 minutes
   - Basic pattern tracking

4. **Crisis Support**
   - DBT pathways fully tested
   - Safety escalation protocols
   - Clear boundaries and limitations

### Technical Integration Tasks

#### Priority 1: Voice System (Week 1)
- [ ] Connect SimplifiedOrganicVoice to MayaOrchestrator
- [ ] Implement voice activity detection (VAD)
- [ ] Add OpenAI TTS streaming response
- [ ] Fix wake word detection
- [ ] Handle voice errors gracefully

#### Priority 2: Unified Experience (Week 1-2)
- [ ] Create single `/maya` entry point
- [ ] Archive experimental pages
- [ ] Implement session management
- [ ] Add basic user preferences

#### Priority 3: Response Quality (Week 2)
- [ ] Tune conversation timing/pauses
- [ ] Implement interruption handling
- [ ] Add emotional prosody mapping
- [ ] Test crisis response pathways

#### Priority 4: Beta Infrastructure (Week 2-3)
- [ ] Basic analytics/monitoring
- [ ] Error reporting system
- [ ] Feedback collection mechanism
- [ ] Beta tester onboarding flow

### File Structure Cleanup

#### Keep & Enhance:
```
/app/maya/                    # Main Maya interface
/lib/oracle/MayaOrchestrator.ts
/lib/oracle/ConversationIntelligenceEngine.ts
/lib/oracle/ActiveListeningCore.ts
/components/ui/SimplifiedOrganicVoice.tsx
/api/maya/                    # Consolidated API
```

#### Archive/Remove:
```
/app/oracle-*                 # All oracle variants
/app/sacred-oracle/
/app/maia/
/app/test-*/
/app/voice-test/
Multiple competing voice implementations
```

### Beta Testing Checklist

#### Pre-Beta Requirements
- [ ] Voice pipeline fully functional
- [ ] 10-minute conversation without crashes
- [ ] Crisis detection tested with scenarios
- [ ] Response time < 2 seconds
- [ ] Error recovery implemented

#### Beta Launch Requirements
- [ ] 10 internal testers validated
- [ ] Onboarding flow complete
- [ ] Feedback mechanism active
- [ ] Monitoring dashboard live
- [ ] Emergency kill switch ready

### Integration Code Example

```typescript
// /app/maya/page.tsx - Unified Maya Experience
import { SimplifiedOrganicVoice } from '@/components/ui/SimplifiedOrganicVoice';
import { MayaOrchestrator } from '@/lib/oracle/MayaOrchestrator';
import { OpenAITTS } from '@/lib/voice/openai-tts';

export default function MayaPage() {
  const orchestrator = new MayaOrchestrator();
  const tts = new OpenAITTS({ voice: 'alloy' });

  const handleVoiceInput = async (transcript: string) => {
    // Process through Maya
    const response = await orchestrator.speak(transcript, userId);

    // Generate voice response
    const audio = await tts.speak(response.message, {
      pace: response.voiceCharacteristics.pace,
      emotion: response.element
    });

    // Play audio
    await playAudio(audio);
  };

  return (
    <SimplifiedOrganicVoice
      onTranscript={handleVoiceInput}
      enabled={true}
    />
  );
}
```

## Timeline

### Week 1 (Immediate)
- Fix voice pipeline
- Create unified Maya interface
- Basic testing with team

### Week 2
- Response quality tuning
- Error handling
- Internal testing

### Week 3
- Beta infrastructure
- Onboarding flow
- Limited beta launch (10 users)

### Week 4
- Iterate based on feedback
- Fix critical issues
- Expand beta (50 users)

## Success Metrics

### Technical Metrics
- Voice recognition accuracy > 90%
- Response latency < 2 seconds
- Session duration > 5 minutes average
- Crash rate < 1%

### User Experience Metrics
- Successful conversation completion > 80%
- User returns within 48 hours > 60%
- Crisis detection accuracy > 95%
- Positive feedback ratio > 70%

## Risk Mitigation

### High Risk Areas
1. **Voice Recognition Failures**
   - Fallback to text input
   - Clear error messaging
   - Manual retry option

2. **Crisis Mishandling**
   - Conservative triggering
   - Clear escalation paths
   - Human oversight option

3. **Performance Issues**
   - Response caching
   - Progressive loading
   - Graceful degradation

## Next Immediate Actions

1. **Today**: Fix voice pipeline connection
2. **Tomorrow**: Create unified `/maya` interface
3. **This Week**: Complete Priority 1 tasks
4. **Next Week**: Internal testing with 5 team members

---

**Status**: 🟡 Critical gaps but achievable with focused effort
**Estimated Beta Ready**: 2-3 weeks with dedicated development
**Main Blocker**: Voice integration not functional