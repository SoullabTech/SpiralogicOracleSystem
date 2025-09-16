# 🎤 Voice Integration Guide
## Tesla-Style Live Voice Interface with Interim Transcription

**Complete voice pipeline: Mic → Waveform → Live Transcript → Maya Response → TTS**

---

## ✅ Components Added

**Core Components:**
- `HybridMicIndicator.tsx` - Tesla-gold pulsing torus + waveform visualization
- `InterimTranscriptDisplay.tsx` - Live words appearing as you speak (GPT-style)
- `VoiceInterface.tsx` - Complete integration wrapper
- `useVoiceManager.ts` - Hook managing recording, transcription, and state

---

## 🔧 Integration in your Oracle Page

**Replace your existing voice code with this:**

```tsx
// app/oracle/page.tsx (or your main chat page)
"use client";

import { useState } from "react";
import VoiceInterface from "../components/VoiceInterface";
import { useMayaStream } from "../hooks/useMayaStream";

export default function OraclePage() {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);
  
  // Your existing Maya hook
  const { sendMessage, isStreaming } = useMayaStream();

  // Handle voice transcription completion
  const handleVoiceTranscript = async (transcript: string) => {
    console.log("[ORACLE] Voice transcript received:", transcript);
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: "user", content: transcript }]);
    
    // Send to Maya
    setIsProcessingResponse(true);
    try {
      const mayaResponse = await sendMessage(transcript);
      setMessages(prev => [...prev, { role: "assistant", content: mayaResponse }]);
    } catch (error) {
      console.error("[ORACLE] Maya response error:", error);
    } finally {
      setIsProcessingResponse(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        
        {/* Chat Messages */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {messages.map((message, index) => (
            <div key={index} className={`p-4 rounded-lg ${
              message.role === 'user' 
                ? 'bg-blue-600/20 border border-blue-500/30' 
                : 'bg-amber-600/20 border border-amber-500/30'
            }`}>
              <div className="font-semibold text-sm mb-2 text-amber-300">
                {message.role === 'user' ? 'You' : 'Maya'}
              </div>
              <div className="text-sm leading-relaxed">{message.content}</div>
            </div>
          ))}
        </div>

        {/* 🎤 VOICE INTERFACE - This is the magic! */}
        <VoiceInterface
          onTranscriptComplete={handleVoiceTranscript}
          isProcessingResponse={isProcessingResponse || isStreaming}
        />

        {/* Optional: Text Input Fallback */}
        <div className="border-t border-slate-700 pt-6">
          <input
            type="text"
            placeholder="Or type your message here..."
            className="w-full bg-slate-800 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-amber-500 outline-none"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                handleVoiceTranscript(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
```

---

## 🎨 Required Dependencies

**Add to your package.json:**
```bash
npm install framer-motion three @types/three
```

**CSS Animations (add to globals.css):**
```css
/* Tesla-style energy effects */
@keyframes tesla-pulse {
  0%, 100% { 
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 0 40px rgba(255, 215, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.3);
    transform: scale(1.02);
  }
}

.tesla-energy {
  animation: tesla-pulse 2s ease-in-out infinite;
}
```

---

## 🔊 Backend Route Requirements

**Ensure you have this route in your backend:**

`/api/oracle/voice/transcribe/stream` - From the MAYA_VOICE_MEMORY_MACRO.md

**Test the route:**
```bash
# Check if streaming transcription works
curl -X POST http://localhost:3000/api/oracle/voice/transcribe/stream \
  -H "Content-Type: audio/webm" \
  --data-binary "@test-audio.webm"
```

---

## 🧪 User Experience Flow

### **What Users See:**

1. **Idle State**: Tesla-gold ring, "Ready to transcribe" message
2. **Recording**: Pulsing torus + live waveform + "LISTENING" indicator
3. **Speaking**: Words appear live in transcript box as they speak
4. **Complete**: "CAPTURED" status, transcript locked in
5. **Processing**: "Maya is thinking..." while LLM generates response
6. **Response**: Maya's text appears + TTS audio plays

### **Visual States:**

**🟢 Idle**: Subtle gold ring, minimal UI  
**🟡 Recording**: Pulsing animation, waveform visualization, live text  
**🔵 Processing**: Loading indicators, transcript locked  
**✅ Complete**: Success feedback, clear call-to-action

---

## 🐛 Debugging & Troubleshooting

### **Common Issues:**

**1. Microphone Permission Denied**
```jsx
// Add permission check
const checkMicPermission = async () => {
  try {
    const result = await navigator.permissions.query({ name: 'microphone' });
    console.log('Mic permission:', result.state);
  } catch (error) {
    console.log('Permission API not supported');
  }
};
```

**2. Audio Format Compatibility**
```jsx
// Check supported formats
const checkAudioSupport = () => {
  const recorder = new MediaRecorder(stream);
  console.log('Supported MIME types:', [
    'audio/webm;codecs=opus',
    'audio/mp4',
    'audio/wav'
  ].filter(type => MediaRecorder.isTypeSupported(type)));
};
```

**3. Transcription Route Not Found**
```bash
# Verify backend routes
curl http://localhost:3000/api/oracle/voice/transcribe/stream
# Should return streaming response, not 404
```

### **Debug Mode:**

```jsx
// Enable debug logging
localStorage.setItem('VOICE_DEBUG', 'true');

// Check browser console for:
// "[VOICE MANAGER] Starting recording..."
// "[VOICE MANAGER] Audio chunk received: X bytes"
// "[VOICE MANAGER] Transcription event: {...}"
```

---

## 🚀 Production Considerations

### **Performance Optimization:**

**Audio Chunking:**
- Record in 1-second chunks for responsive streaming
- Optimize chunk size vs. transcription accuracy
- Handle network interruptions gracefully

**Memory Management:**
- Clean up MediaRecorder and AudioContext properly
- Clear transcript buffers after use
- Avoid memory leaks in continuous recording

**Error Recovery:**
- Graceful fallback when transcription fails
- Retry logic for network errors
- Clear error states automatically

### **User Experience Polish:**

**Accessibility:**
- Keyboard shortcuts for voice control
- Visual indicators for hearing-impaired users
- Screen reader compatibility

**Mobile Optimization:**
- Touch-friendly mic button (larger hit area)
- Handle device rotation during recording
- Optimize for mobile Safari quirks

---

## ✨ Advanced Features (Future)

**Real-time Interim Updates:**
- Streaming transcription with WebSockets
- Word-level confidence scoring
- Multi-language detection

**Voice Analysis:**
- Emotion detection from audio tone
- Speaking pace and rhythm analysis
- Keyword highlighting in live transcript

**Smart Recording:**
- Voice activity detection (auto-start/stop)
- Background noise filtering
- Echo cancellation improvements

---

## 🎯 Success Metrics

**Technical:**
- [ ] Transcription accuracy >90% for clear speech
- [ ] Audio recording starts within 500ms of button press
- [ ] Live transcript updates with <200ms delay
- [ ] Zero memory leaks during extended use

**User Experience:**
- [ ] Users understand how to use voice on first try
- [ ] >80% of users prefer voice over typing
- [ ] Minimal abandoned recordings (user doesn't complete)
- [ ] Positive feedback on "natural conversation feel"

---

**🎤 Ready to deploy! Your users will experience Maya as truly conversational AI with Tesla-styled interface polish. The live transcript preview makes voice interaction feel magical - just like talking to a super-intelligent friend who listens and remembers everything perfectly. ⚡**