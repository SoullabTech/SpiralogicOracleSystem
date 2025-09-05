# Maya Voice Pipeline Fix - Claude Code Prompt Series

> **Goal**: Restore complete voice loop with live transcription, TTS failover, and memory injection

---

## **Prompt 1: Live Transcription Component**

```
I need to create a live voice transcription component that shows real-time speech-to-text as the user speaks, similar to ChatGPT's voice interface.

Current issue: Users click the mic button but can't see what's being transcribed until they stop speaking. I want live subtitles/captions while they talk.

Requirements:
1. Show partial transcription results as user speaks
2. Update UI continuously with interim text
3. Pass final transcript to Maya when recording stops
4. Visual feedback for recording state (pulsing, waveform, etc.)

Please:
1. Create a TranscriptPreview.tsx component that displays live transcription
2. Update MicrophoneCapture.tsx to stream audio chunks for real-time processing
3. Create /api/oracle/voice/transcribe/stream endpoint for incremental STT
4. Integrate with the existing Oracle page chat flow

Files to modify:
- components/voice/MicrophoneCapture.tsx (add streaming)
- components/voice/TranscriptPreview.tsx (new component)
- app/api/oracle/voice/transcribe/stream/route.ts (new streaming endpoint)
- app/oracle/page.tsx (integrate preview component)

The live transcription should be visually distinct from the final message - maybe in a subtle preview box that appears during recording and disappears when the transcript is submitted to Maya.
```

---

## **Prompt 2: TTS Orchestrator Resilience**

```
My Maya voice synthesis is failing because the TTS services aren't properly configured with fallbacks. Users should ALWAYS get audio responses, even if individual TTS services are down.

Current problem: Maya responds with text but no voice output, likely because:
1. Sesame TTS service isn't running 
2. ElevenLabs fallback isn't configured properly
3. No mock mode for development

I need a bulletproof TTS system that never fails to provide audio.

Please:
1. Create TTSOrchestrator.ts that handles primary + fallback + mock TTS
2. Add TTS health monitoring and automatic failover
3. Create /api/tts/health endpoint to check service status
4. Update ConversationalPipeline to use the orchestrator
5. Add mock TTS mode for development (text-to-speech using browser APIs)

TTS Priority Order:
1. Primary: Sesame TTS (self-hosted at SESAME_TTS_URL)
2. Fallback: ElevenLabs (cloud service with ELEVENLABS_API_KEY)
3. Mock: Browser speechSynthesis API for development

Environment variables needed:
- SESAME_TTS_URL=http://localhost:8000 
- ELEVENLABS_API_KEY=your_key_here
- TTS_MOCK_MODE=false (true for dev without external services)

The system should:
- Try Sesame first, fall back to ElevenLabs if failed, use mock if both fail
- Cache successful audio responses
- Log which TTS service was used for debugging
- Never show 401/500 errors to users - always provide some audio response
```

---

## **Prompt 3: Memory Orchestrator Auto-Injection**

```
Maya's responses are generic because the MemoryOrchestrator isn't being injected into the ConversationalPipeline. She should always have access to user's journals, session history, and profile data.

Current issue: Maya responds with fallback phrases like "What would be different?" instead of personalized responses that reference the user's journal entries and conversation history.

Root cause: The buildContext() method in MemoryOrchestrator isn't being called before response generation.

Please:
1. Fix the ConversationalPipeline to ALWAYS call MemoryOrchestrator.buildContext()
2. Add debugging to show which memory layers are loaded (session, journal, profile, symbolic, external)
3. Ensure memory context is passed to Maya's prompt generation
4. Add fallback behavior if memory loading fails (but still try to use available context)

Debug output needed (when MAYA_DEBUG_MEMORY=true):
- Which memory layers were fetched
- How many journal entries found
- Session continuity status  
- Total context size and token budget
- Processing time for memory orchestration

Files to check/fix:
- backend/src/services/ConversationalPipeline.ts
- backend/src/services/MemoryOrchestrator.ts
- backend/src/routes/conversational.routes.ts

Maya should NEVER respond generically if the user has journal entries or previous conversations. Her responses should demonstrate awareness of the user's specific situation and history.
```

---

## **Prompt 4: Voice Pipeline Integration & Testing**

```
Now that I have live transcription, TTS orchestration, and memory injection working separately, I need to integrate them into a seamless voice pipeline and add comprehensive debugging.

Requirements:
1. Complete voice loop: Mic → Live Transcription → Maya (with memory) → TTS → Audio Playback
2. Debug instrumentation to track each step of the pipeline
3. Error handling that maintains conversation flow even if individual components fail
4. Performance monitoring for the full voice interaction

Please:
1. Update the Oracle page to integrate all voice components seamlessly
2. Add comprehensive debugging for the voice pipeline
3. Create a VoicePipelineMonitor component for debugging (only shown in dev mode)
4. Add performance metrics for each step of the voice pipeline

Integration points:
- MicrophoneCapture → TranscriptPreview → Maya chat → TTS → OracleVoicePlayer
- All components should work together smoothly
- Error in one component shouldn't break the entire conversation
- Clear visual feedback for each stage of processing

Debug information to show (in dev mode):
- Microphone permission status
- Live transcription accuracy
- Memory layers loaded for response
- TTS service used (Sesame/ElevenLabs/Mock)
- Audio generation time
- End-to-end voice interaction time

The voice pipeline should feel natural and responsive - users should be able to have a fluid conversation with Maya through voice alone, with clear feedback about what's happening at each step.
```

---

## **Prompt 5: Voice Pipeline Health Monitoring**

```
I need comprehensive monitoring and debugging tools for the Maya voice pipeline to ensure it's working correctly in production and to help debug issues when they arise.

Please create:
1. A VoicePipelineHealth service that monitors all voice components
2. Real-time health dashboard (dev mode only)
3. Automated health checks and recovery procedures
4. Performance benchmarking for voice interactions

Components to monitor:
- Microphone access and audio capture quality
- Speech-to-text accuracy and response time
- Memory orchestration performance (how quickly context is loaded)
- TTS service availability and audio generation time
- Audio playback functionality

Health check endpoints needed:
- /api/voice/health/microphone
- /api/voice/health/stt
- /api/voice/health/memory
- /api/voice/health/tts
- /api/voice/health/complete-pipeline

Dashboard should show:
- Current status of each voice component (🟢 healthy, 🟡 degraded, 🔴 failed)
- Recent performance metrics
- Error logs for failed voice interactions
- Usage statistics (successful voice conversations vs failures)

Recovery procedures:
- Auto-retry failed TTS with fallback services
- Graceful degradation to text-only mode if voice completely fails
- Clear user communication about any temporary voice issues
- Automatic service restart attempts for recoverable failures

This monitoring system will help ensure the voice pipeline stays reliable and help quickly identify and fix any issues that arise.
```

---

## **Usage Instructions**

### **Run These Prompts in Sequence:**

1. **Prompt 1** → Gets live transcription working (immediate visual feedback)
2. **Prompt 2** → Fixes TTS reliability (Maya always speaks)  
3. **Prompt 3** → Restores Maya's intelligence (memory-aware responses)
4. **Prompt 4** → Integrates everything into seamless experience
5. **Prompt 5** → Adds monitoring for ongoing reliability

### **After Each Prompt:**
- Test the specific functionality added
- Verify it works with existing code
- Check debug output shows expected behavior

### **Environment Setup:**
```bash
# Enable full debugging
export MAYA_DEBUG_MEMORY=true
export MAYA_DEBUG_VOICE=true
export BACKEND_LOG_LEVEL=debug

# TTS Configuration (choose based on your setup)
export SESAME_TTS_URL=http://localhost:8000
export ELEVENLABS_API_KEY=your_key_here
export TTS_MOCK_MODE=true  # For development without external services

# Start services
npm run dev  # Frontend
cd backend && npm run dev  # Backend
```

### **Testing Checklist:**
- [ ] Microphone capture shows live transcription
- [ ] Maya responds with personalized content (not generic)
- [ ] Audio playback works with primary/fallback TTS
- [ ] Debug logs show memory layers loading
- [ ] Voice pipeline works end-to-end
- [ ] Error handling maintains conversation flow

---

**🎯 Expected Result**: Complete, reliable voice pipeline where users can have natural conversations with Maya, see live transcription feedback, and always receive audio responses that demonstrate Maya's understanding of their personal context.