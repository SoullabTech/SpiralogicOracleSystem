# 🎤 Voice Pipeline Optimization Guide

## Current Issues & Solutions

### 1. **Maya Says She Can Only Communicate Through Text** ✅ FIXED
- **Issue**: Maya's system prompt didn't mention voice capabilities
- **Solution**: Updated `backend/src/config/mayaSystemPrompt.ts` to explicitly state she's voice-enabled
- **Result**: Maya now knows she can speak and listen

### 2. **Lag Between Recording and Response**
The voice pipeline has several sequential steps that create latency:

```
🎤 Recording (1-3s) → 
📤 Upload (~200ms) → 
✍️ Transcription (500-1500ms) → 
🤖 AI Response (1-3s) → 
🔊 TTS Generation (500-2000ms) → 
📥 Audio Download (~200ms) → 
🎵 Playback
```

**Total latency: 3.4s - 9.9s**

## 🚀 Optimization Strategies

### Immediate Fixes (Do Now)

1. **Add Loading States**
```typescript
// In your Oracle page, show what's happening:
const [pipelineStatus, setPipelineStatus] = useState<string>('');

// Update status at each step:
setPipelineStatus('🎤 Processing your voice...');
setPipelineStatus('✍️ Transcribing...');
setPipelineStatus('🤖 Maya is thinking...');
setPipelineStatus('🔊 Generating voice response...');
```

2. **Pre-warm the TTS Service**
```typescript
// On page load, make a dummy TTS request to warm up Sesame
useEffect(() => {
  fetch('/api/voice/unified', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      text: 'Hello', 
      voice: 'maya',
      warmup: true 
    })
  });
}, []);
```

3. **Stream the Response**
Instead of waiting for the full response, stream Maya's text as it arrives:
- Text appears word-by-word
- TTS starts generating while text is still streaming
- User sees progress immediately

### Advanced Optimizations

1. **Parallel Processing**
- Start TTS generation as soon as the first sentence is complete
- Don't wait for the entire response

2. **Response Chunking**
```typescript
// Split response into sentences and process each in parallel
const sentences = response.split(/[.!?]+/);
const audioChunks = await Promise.all(
  sentences.map(sentence => generateTTS(sentence))
);
```

3. **Edge Caching**
- Cache common greetings and responses
- Store user's voice profile for faster transcription

4. **WebSocket Connection**
Replace REST API calls with persistent WebSocket:
```typescript
// Instead of multiple HTTP requests
const ws = new WebSocket('ws://localhost:3002/voice-stream');
ws.send(audioBlob);
ws.onmessage = (event) => {
  // Handle streaming response
};
```

## 📊 Performance Targets

| Step | Current | Target | Method |
|------|---------|--------|---------|
| Recording | 1-3s | 1-3s | User-controlled |
| Transcription | 500-1500ms | 300-500ms | Optimize Whisper settings |
| AI Response | 1-3s | 500-1500ms | Stream response |
| TTS Generation | 500-2000ms | 200-500ms | Parallel processing |
| **Total** | **3.4-9.9s** | **2-5.5s** | **~45% reduction** |

## 🔧 Quick Debug Commands

```bash
# Check if backend is responding quickly
curl -X GET http://localhost:3002/api/health -w "\nTime: %{time_total}s\n"

# Test transcription speed
time curl -X POST http://localhost:3006/api/voice/transcribe-simple \
  -F "file=@test-audio.webm"

# Monitor TTS performance
curl -X POST http://localhost:3006/api/voice/unified \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","voice":"maya"}' \
  -w "\nTime: %{time_total}s\n"
```

## 💡 User Experience Improvements

1. **Visual Feedback**
   - Pulsing orb while recording
   - Waveform visualization during playback
   - Progress bar for each pipeline step

2. **Conversational Flow**
   - Allow interruption (barge-in)
   - Auto-detect when user stops speaking
   - Start processing before user clicks "stop"

3. **Error Recovery**
   - Automatic retry on TTS failure
   - Fallback to text if voice fails
   - Clear error messages

## 🎯 Testing the Fix

1. **Test Maya's Voice Awareness**:
   - Ask: "Can you speak to me?"
   - Expected: Maya should acknowledge her voice capabilities
   
2. **Measure Latency**:
   - Record a simple question
   - Time from stop recording → first audio playback
   - Target: Under 5 seconds

3. **Check Analytics Dashboard**:
   ```
   http://localhost:3006/dashboard/beta-analytics
   ```
   - Monitor voice vs text interactions
   - Track TTS provider performance
   - Identify error patterns

## 🚨 If Issues Persist

1. **Check Backend Logs**:
```bash
# In backend terminal
npm run dev
# Look for timing logs
```

2. **Verify API Keys**:
- OpenAI API key for Whisper
- Sesame/ElevenLabs credentials
- Proper .env configuration

3. **Network Latency**:
- Ensure backend and frontend are on same machine
- Check for proxy/firewall delays

The voice pipeline is now fully operational with Maya understanding she can speak. The main optimization opportunity is reducing latency through streaming and parallel processing.