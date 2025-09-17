# Maya Voice-Activated Conversation Setup

## 🎤 Natural Conversation Mode - No Push-to-Talk Required!

### Access the Voice Interface

1. **Navigate to:** `https://your-domain.vercel.app/maya-voice`
2. **Allow microphone access** when prompted (first time only)

### How It Works

The voice interface provides **continuous, natural conversation**:

- **No push-to-talk** - Maya listens continuously
- **Automatic speech detection** - Knows when you start/stop speaking
- **Natural flow** - Maya responds automatically after you finish
- **Voice responses** - Maya speaks her answers out loud

### Features

#### 🎯 Voice Activity Detection (VAD)
- Detects when you start speaking (no button press needed)
- Waits for natural pauses (1.5 seconds of silence)
- Processes your complete thought before responding
- Visual feedback shows when Maya is listening vs processing

#### 🔊 Audio Feedback
- **Pulsing rings** - Maya is actively listening
- **Audio level indicator** - Shows your voice is being picked up
- **Status messages**:
  - "Ready" - Waiting for you to speak
  - "Listening..." - Detecting your speech
  - "Maya is thinking..." - Processing your input
  - "Maya is speaking..." - Playing response

#### 💬 Conversation Flow
1. Click microphone once to start session
2. Speak naturally whenever you want
3. Maya automatically responds after you finish
4. Continue conversing naturally
5. Click microphone again to end session

### Browser Requirements

Works best in:
- **Chrome** (recommended) - Best speech recognition
- **Safari** - Good performance on Mac
- **Edge** - Chrome-based, works well
- **Firefox** - Limited support (may require push-to-talk)

### Technical Details

The system uses:
- **Web Speech API** for recognition
- **Voice Activity Detection** for speech boundaries
- **Speech Synthesis** for Maya's voice
- **Real-time transcription** display

### Troubleshooting

**No microphone access?**
- Check browser permissions (icon in address bar)
- Ensure no other apps are using the mic
- Try refreshing the page

**Not detecting speech?**
- Speak clearly and at normal volume
- Check the audio level indicator is responding
- Ensure you're in a quiet environment

**Maya not responding?**
- Wait for full 1.5 seconds of silence
- Check internet connection
- Verify API is deployed (check Vercel logs)

### Configuration Options

In the code, you can adjust:
```javascript
// Voice Activity Detection parameters
const VAD_THRESHOLD = 30;        // Min audio level for speech
const SILENCE_DURATION = 1500;   // Ms of silence before processing
const MIN_SPEECH_DURATION = 300; // Min ms to consider valid speech
```

### Maya's New Personality

Maya now responds as a **soulful interviewer** inspired by Maya Angelou:
- Asks deep, meaningful questions
- Gets to the heart of your story
- Maximum 15 words per response
- No mystical vagueness or therapy-speak

Example responses:
- "What did that cost you?"
- "When did you first know?"
- "What are you not saying?"
- "Where does that live in you?"

### API Endpoint

The voice interface calls:
```
POST /api/oracle/personal
{
  input: "user's spoken text",
  userId: "voice-user",
  sessionId: "voice-session"
}
```

Returns:
```json
{
  "message": "Maya's response",
  "element": "earth",
  "metadata": {
    "wordCount": 8,
    "zenMode": true
  }
}
```

## 🚀 Deployment Status

After pushing to main branch:
1. Vercel auto-deploys (1-2 minutes)
2. Access at `/maya-voice` route
3. Test voice conversation flow
4. Monitor responses for brevity and depth

## Testing Checklist

- [ ] Microphone permission granted
- [ ] Voice detection working (visual feedback)
- [ ] Auto-processing after silence
- [ ] Maya responds with <15 words
- [ ] Responses are soulful questions, not advice
- [ ] Voice synthesis speaks responses
- [ ] Conversation flows naturally

---

**Note:** This creates a truly conversational experience where users can speak naturally without any buttons, just like talking to a real person. Maya listens, understands pauses, and responds appropriately - all automatically.