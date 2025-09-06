# 🎤 Maya Voice QA Ritual

## Pre-Flight Checks

### Environment Variables
Ensure these are set in your `.env.local`:
```bash
# Sesame TTS Configuration
SESAME_URL=http://localhost:8000
SESAME_CI_ENABLED=true
SESAME_CI_REQUIRED=true

# UI Configuration  
NEXT_PUBLIC_MEMORY_REFERENCES_ENABLED=false  # Set to true to show citations

# Voice Configuration
ELEVENLABS_API_KEY=your_key_here  # Fallback TTS
```

### Start Services
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
npm run dev

# Terminal 3: Sesame (if using local)
cd sesame-csm
./start-sesame.sh
```

## QA Test Checklist

### 1. ✅ Silence Detection Auto-Stop

**Test Short Phrase (2.5s timeout)**
- [ ] Click mic button
- [ ] Say "Hi Maya" 
- [ ] Stop speaking
- [ ] Verify: Recording auto-stops after ~2.5 seconds
- [ ] Check: Golden toast shows "Stopped after silence"

**Test Medium Phrase (4s timeout)**  
- [ ] Click mic button
- [ ] Say "How can I find inner peace today?"
- [ ] Stop speaking
- [ ] Verify: Recording auto-stops after ~4 seconds

**Test Long Thought (6s timeout)**
- [ ] Click mic button  
- [ ] Speak for 15+ seconds about your day
- [ ] Stop speaking
- [ ] Verify: Recording auto-stops after ~6 seconds

**Debug Panel Verification** (Dev Mode)
- [ ] During recording, check debug panel shows:
  - Volume meter responding to speech
  - Timer status: "🔴 ARMED" when silent
  - Countdown animation when auto-stop is imminent
  - Adaptive timeout values (2.5s/4s/6s)

### 2. 🔊 Voice Reply (TTS)

**Test Sesame TTS**
- [ ] Send message to Maya
- [ ] Check backend logs for: `[TTS] Using Sesame`
- [ ] Verify: Audio URL returned in response
- [ ] Click play button on Maya's response
- [ ] Verify: Audio plays correctly

**Test Fallback (Stop Sesame)**
- [ ] Stop Sesame container
- [ ] Send message to Maya
- [ ] Check logs for: `[TTS] Using ElevenLabs (fallback)`
- [ ] Verify: Still get audio response

### 3. 📚 Memory References Toggle

**Test Disabled (Default)**
- [ ] Ensure `NEXT_PUBLIC_MEMORY_REFERENCES_ENABLED=false`
- [ ] Send message to Maya
- [ ] Verify: No "Referenced from your library" section

**Test Enabled**
- [ ] Set `NEXT_PUBLIC_MEMORY_REFERENCES_ENABLED=true`
- [ ] Restart frontend
- [ ] Send message to Maya
- [ ] Verify: Citations appear if available

### 4. ⌨️ Input Clearing

**Test Text Input**
- [ ] Type "Test message"
- [ ] Press Enter
- [ ] Verify: Input box clears immediately
- [ ] Verify: Message appears in chat

**Test Voice Input**
- [ ] Record voice message
- [ ] Let it auto-send
- [ ] Verify: Transcription sent to chat
- [ ] Verify: Voice recorder resets

### 5. 🔍 Debug Overlay

**Dev Mode Features**
- [ ] Start recording in dev mode
- [ ] Verify debug panel shows:
  - Volume meter with percentage
  - Speech/Silent status indicator
  - Recording duration counter
  - Silence timer armed status
  - Countdown when auto-stop approaches
  - Adaptive mode indicator
  - System status (TTS service, memory refs, etc.)

## Common Issues & Solutions

### Issue: Recording doesn't auto-stop
**Solution:** Check that `stopRecordingRef` is properly initialized in useEffect

### Issue: No audio playback  
**Solution:** 
1. Check Sesame is running: `curl http://localhost:8000/health`
2. Check browser console for autoplay errors
3. Verify SESAME_URL in backend .env

### Issue: Memory references always showing
**Solution:** Set `NEXT_PUBLIC_MEMORY_REFERENCES_ENABLED=false` and restart

### Issue: Input not clearing
**Solution:** Check ChatInput.tsx line 67 has `setMessage('')`

## Performance Benchmarks

- **Silence detection:** Should trigger within 100ms of timeout
- **TTS generation:** < 2 seconds via Sesame, < 3 seconds via fallback
- **Input clearing:** Instantaneous (< 50ms)
- **Debug overlay:** No impact on recording performance

## Sign-off Checklist

Before marking as production-ready:

- [ ] All silence timeouts working (2.5s, 4s, 6s)
- [ ] TTS plays audio successfully
- [ ] Memory references toggle works
- [ ] Input clears after send
- [ ] Debug overlay only in dev mode
- [ ] No console errors
- [ ] Performance benchmarks met

---

**Last Updated:** 2025-09-05
**Tested Version:** main branch
**Author:** SpiraLogic Team