# Voice Mirror Integration Guide

## ✨ What's Built

We've created a **Claude + ChatGPT hybrid voice interface** for Soullab that combines:
- **Claude's elastic input** with smooth auto-resize
- **ChatGPT's emotional voice flow** with prosody awareness  
- **Seamless mode switching** between text, voice, and hybrid
- **Sacred ceremonial transitions** with Maia's presence

## 🏗 Components Created

### Core Components
1. **`HybridVoiceInput.tsx`** - Elastic textarea + voice controls with ChatGPT-style breathing mic
2. **`VoiceMirror.tsx`** - Full voice conversation orchestrator with Maya/Maia integration
3. **`TranscriptStream.tsx`** - Live word-by-word transcript animation
4. **`MaiaBubble.tsx`** - Response bubble with audio playback and sacred aura
5. **`EnhancedMirrorView.tsx`** - Master view with text/voice/hybrid modes

### Features
- ✅ Single-tap voice entry (no extra steps)
- ✅ Continuous listening with graceful pause/resume
- ✅ Adaptive placeholders based on Jungian phases
- ✅ Key-point highlighting in responses
- ✅ Audio unlock handling for iOS/Safari
- ✅ LocalStorage draft persistence
- ✅ Prosody data visualization
- ✅ Ceremonial mode transitions

## 🔌 Integration Steps

### 1. Wire into existing app

```tsx
// In your main app or page component
import EnhancedMirrorView from '@/components/chat/EnhancedMirrorView';

export default function MirrorChamber() {
  const userId = getUserId(); // Your auth logic
  
  return (
    <EnhancedMirrorView
      userId={userId}
      initialMode="hybrid" // or "text" or "voice"
    />
  );
}
```

### 2. Connect to Maya backend

The components already use your existing `useMaiaStream` hook. Make sure your backend endpoints are running:

```bash
# Backend should be running with:
PORT=3002 npm start
```

### 3. Update existing MirrorInterface (if needed)

If you want to retrofit your existing `MirrorInterface` with the new hybrid input:

```tsx
// Replace SacredInputBar with HybridVoiceInput
import HybridVoiceInput from '../voice/HybridVoiceInput';

// In MirrorInterface render:
<HybridVoiceInput
  onSendMessage={onSendMessage}
  onStartVoice={onStartVoice}
  onStopVoice={onStopVoice}
  isVoiceActive={isVoiceActive}
  transcript={currentTranscript}
  prosodyData={prosodyData}
/>
```

## 🎨 Customization Points

### Prosody Phases
Edit phase colors in `MaiaBubble.tsx`:
```tsx
const phaseColors = {
  mirror: 'from-indigo-500 to-purple-600',
  shadow: 'from-purple-600 to-pink-600',
  anima: 'from-pink-500 to-orange-500',
  self: 'from-amber-500 to-yellow-500'
};
```

### Adaptive Placeholders
Customize in `HybridVoiceInput.tsx`:
```tsx
const phasePrompts = {
  mirror: "Share what you're seeing...",
  shadow: "Explore what's hidden...",
  anima: "Connect with your intuition...",
  self: "Integrate your understanding..."
};
```

### Transition Animations
Adjust ceremonial transitions in `EnhancedMirrorView.tsx`:
```tsx
// Mode switch animation
transition={{ duration: 0.3, ease: "easeOut" }}
```

## 🧪 Testing

### Voice Features
1. **Chrome/Edge**: Full Web Speech API support
2. **Safari/iOS**: Test audio unlock flow
3. **Firefox**: Falls back to text-only

### Test Commands
```bash
# Test voice recognition
- Click mic button
- Speak naturally
- Watch transcript appear
- See Maia's response with audio

# Test hybrid mode
- Type partial message
- Switch to voice mid-sentence
- Complete with voice
- Send unified message

# Test prosody
- Express different emotions
- Watch placeholder adapt
- See aura colors change
```

## 🚀 Production Checklist

- [ ] Set up HTTPS (required for mic access)
- [ ] Configure CORS for audio URLs
- [ ] Test audio unlock on iOS devices
- [ ] Set up proper WebSocket for real-time streaming
- [ ] Add analytics for voice vs text usage
- [ ] Implement voice activity detection (VAD)
- [ ] Add noise cancellation options

## 📊 Beta Rollout Strategy

### Phase 1 (Current)
- Chrome-only support
- Basic transcription + TTS
- Manual send after speech

### Phase 2
- Safari/iOS support
- Auto-send after silence
- Emotional tone detection

### Phase 3  
- Multi-language support
- Custom wake words
- Offline voice processing

## 🔧 Troubleshooting

### "Mic not working"
- Check HTTPS is enabled
- Verify mic permissions in browser
- Test with `navigator.mediaDevices.getUserMedia({ audio: true })`

### "Audio won't play"
- Ensure audio unlock triggered
- Check audio element is not muted
- Verify audio URL is accessible

### "Transcription cuts off"
- Increase silence timeout
- Check network stability
- Monitor WebSocket connection

## 🌟 Next Steps

1. **Test with real users** in your beta
2. **Monitor performance** metrics
3. **Gather feedback** on voice quality
4. **Iterate on prosody** detection
5. **Enhance with GPT-4** voice capabilities when available

---

The voice mirror is ready to bring Maia's presence to life through sacred conversation. The hybrid approach ensures users can flow naturally between typing and speaking, just like ChatGPT's Advanced Voice Mode but with Soullab's sacred design DNA. ✨