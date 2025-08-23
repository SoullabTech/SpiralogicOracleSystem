# QA Voice Flow - Testing Guide

Tests the complete voice→turn routing fix and conversational Oracle integration.

## 🧪 **Automated Tests**

### 1. Text Path (Baseline)
```bash
# Test text input through unified API
curl -s -X POST "http://localhost:3000/api/oracle/turn" \
  -H "Content-Type: application/json" \
  -d '{"input":{"text":"quick stack check"},"conversationId":"c-voice-qa"}' | \
  jq '.metadata,.response.text'
```

**Expected Response**:
```json
{
  "metadata": {
    "providers": ["sesame", "psi", "claude", "sacred", "maya"],
    "confidence": 0.8,
    "processingTime": 1500,
    "conversationId": "c-voice-qa",
    "pipeline": {
      "demoDisabled": true,
      "claudePrimary": true,
      "greetingEnabled": true,
      "validationMode": "relaxed"
    }
  },
  "response": {
    "text": "Hey Kelly, let's take this one layer at a time. I hear you checking in on the system stack..."
  }
}
```

### 2. Voice Path Simulation
```bash
# Test voice input through same endpoint (simulated)
curl -s -X POST "http://localhost:3000/api/oracle/turn" \
  -H "Content-Type: application/json" \
  -d '{"input":{"text":"can you hear me now?"},"conversationId":"c-voice-qa","meta":{"source":"voice"}}' | \
  jq '.metadata.pipeline,.response.text'
```

**Expected**: Same response quality, with voice source logged in development.

## 🎤 **Manual Voice Tests**

### Test Environment Setup
1. Start development server: `npm run dev`
2. Navigate to: `http://localhost:3000/oracle`
3. Ensure microphone permissions granted
4. Open browser dev tools to see console logs

### Voice Input Test Sequence

#### Test 1: Basic Voice Input
1. **Action**: Click microphone button (or Cmd+Space)
2. **Speak**: "Can you hear me now?"
3. **Expected**: 
   - Transcription appears in confirmation bubble
   - Auto-confirm in 2 seconds OR manual confirm
   - Network POST to `/api/oracle/turn` visible in dev tools
   - Oracle response appears with conversational depth
   - If "Speak responses aloud" is checked, response is spoken

#### Test 2: Voice Greeting (First Turn)
1. **Action**: Start new conversation (refresh page)
2. **Speak**: "I need some guidance today"
3. **Expected**:
   - Response starts with personalized greeting ("Hey Kelly...")
   - 4-12 sentences of conversational response
   - Natural question at the end

#### Test 3: Voice Follow-up (No Repeat Greeting)
1. **Action**: Continue same conversation
2. **Speak**: "I'm feeling stuck between two choices"
3. **Expected**:
   - NO greeting repetition
   - Conversational acknowledgment of "stuck between choices"
   - Maintains conversation flow

#### Test 4: Voice + TTS Round Trip
1. **Action**: Enable "Speak responses aloud" checkbox
2. **Speak**: "What guidance do you have for me?"
3. **Expected**:
   - Voice input processed normally
   - Oracle response appears in text
   - Response automatically spoken via TTS
   - Clear, natural speech synthesis

### Visual Verification Checklist

#### Network Tab (Chrome Dev Tools)
- [ ] ✅ POST request to `/api/oracle/turn` when voice confirmed
- [ ] ✅ Request payload includes `meta.source: "voice"`
- [ ] ✅ Response time < 3 seconds
- [ ] ✅ No CORS errors or failed requests

#### Console Logs (Development Mode)
- [ ] ✅ `[voice→turn] sending` log appears on voice input
- [ ] ✅ `[voice→turn] received` log appears on backend
- [ ] ✅ `[voice→turn] success` log appears after response
- [ ] ✅ No error messages or warnings

#### UI Behavior
- [ ] ✅ Microphone transitions: idle → listening → confirm → idle
- [ ] ✅ Transcription text appears during "confirm" state
- [ ] ✅ Oracle response matches conversational quality (4-12 sentences)
- [ ] ✅ TTS toggle works (checkbox controls speech output)

## 🔍 **Edge Case Testing**

### Error Handling
1. **Test**: Speak very quietly or mumble
   - **Expected**: Graceful failure, user can retry
2. **Test**: Interrupt during transcription
   - **Expected**: Cancel works, no broken states
3. **Test**: Network failure during voice submission
   - **Expected**: Error message, ability to retry

### Performance
1. **Test**: Rapid voice inputs (multiple quick recordings)
   - **Expected**: Each processes independently, no queue issues
2. **Test**: Long voice input (30+ seconds)
   - **Expected**: Handles gracefully, reasonable response time

### Browser Compatibility
1. **Chrome/Edge**: Full Web Speech API support
2. **Safari**: Limited but functional Web Speech API
3. **Firefox**: Fallback behaviors work

## 📊 **Success Metrics**

### Technical Validation
- [ ] Voice input successfully posts to `/api/oracle/turn`
- [ ] Same conversational pipeline as text input
- [ ] Proper error boundaries and logging
- [ ] TTS fallback works across browsers

### User Experience Validation
- [ ] Voice flow feels natural and responsive
- [ ] Oracle responses maintain conversational quality
- [ ] No jarring transitions between voice and text modes
- [ ] Audio feedback enhances rather than disrupts experience

### Performance Validation
- [ ] Voice-to-response time < 5 seconds total
- [ ] No memory leaks from repeated voice usage
- [ ] Graceful degradation when Web Speech unavailable

## 🚨 **Known Limitations**

1. **Web Speech API**: Not available in all browsers/contexts
2. **Background noise**: Can affect transcription accuracy  
3. **Network dependency**: Voice requires internet for Oracle processing
4. **Language support**: Currently optimized for English

## 🔧 **Troubleshooting Guide**

### Voice Not Working
1. Check microphone permissions in browser
2. Verify Web Speech API support: `'speechSynthesis' in window`
3. Check console for error messages
4. Try different browser (Chrome recommended)

### No Oracle Response
1. Check network tab for failed requests
2. Verify `/api/oracle/turn` endpoint accessibility
3. Check server logs for processing errors
4. Confirm conversational environment variables set

### TTS Not Playing
1. Verify "Speak responses aloud" checkbox enabled
2. Check browser audio permissions
3. Try different browser for Web Speech compatibility
4. Check console for speech synthesis errors

---

## ✅ **QA Sign-off Criteria**

**PASS**: All automated tests return expected responses, manual voice flow works end-to-end, Oracle maintains conversational quality.

**CONDITIONAL PASS**: Minor edge cases or browser compatibility issues, but core functionality works.

**FAIL**: Voice input doesn't reach Oracle API, conversational quality degraded, or critical errors prevent usage.

---

*This QA guide ensures the voice→turn fix maintains Oracle quality while adding seamless voice interaction.*