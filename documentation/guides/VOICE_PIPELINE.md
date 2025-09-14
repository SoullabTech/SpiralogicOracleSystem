# Voice Pipeline Technical Specification

## Overview
Complete the Maya voice loop: Microphone → STT → Maya → TTS → Audio Output

The dual-channel architecture is already in place:
- **UI Channel**: Displays clean text (prosody stripped)
- **Voice Channel**: Preserves prosody markup for TTS rendering

## Current State ✅
- Maya generates prosody-marked responses (`<pace-slow>`, `<emphasis>`, etc.)
- `cleanMessage()` strips prosody for UI display
- `OracleVoicePlayer` component ready to play audio
- Backend routes return both text and potential audioUrl
- Sesame integration partially configured

## Required Implementation 🔧

### 1. Microphone Input Layer
```typescript
// components/voice/MicrophoneCapture.tsx
interface MicCaptureProps {
  onTranscript: (text: string) => void;
  isListening: boolean;
}

// Features needed:
- MediaRecorder API for browser mic access
- Audio chunking (e.g., 100ms chunks)
- WebSocket or streaming to backend
- Visual feedback (waveform/level meter)
```

### 2. Speech-to-Text Pipeline
```typescript
// app/api/oracle/voice/transcribe/route.ts
POST /api/oracle/voice/transcribe
Body: audio blob or base64
Returns: { transcript: string, confidence: number }

// Backend flow:
1. Receive audio chunk
2. Pass to Whisper API (OpenAI) or alternative
3. Return transcript
4. Optional: streaming transcription for real-time feedback
```

### 3. Text-to-Speech Pipeline
```typescript
// backend/src/services/SesameTTS.ts
class SesameTTS {
  async synthesize(text: string, voice: string = 'maya'): Promise<AudioStream> {
    // 1. Parse prosody markup from text
    // 2. Send to Sesame TTS endpoint
    // 3. Return audio stream or URL
  }
}

// Integration point in ConversationalPipeline:
const response = await maya.process(userText);
const audioUrl = await sesameTTS.synthesize(response.raw);
return {
  displayText: cleanMessage(response.raw),
  voiceText: response.raw,
  audioUrl: audioUrl
};
```

### 4. Audio Playback Layer
```typescript
// Enhance existing OracleVoicePlayer
- Queue management for continuous conversation
- Playback state (playing/paused/ended)
- Volume controls
- Interrupt handling (stop current when new input)
```

## API Routes Structure

```
/api/oracle/voice/
  ├── transcribe/     # POST: audio → text
  ├── synthesize/     # POST: text → audio URL
  ├── stream/         # WebSocket: bidirectional audio
  └── session/        # GET/POST: manage voice sessions
```

## Implementation Sequence

### Phase 1: Basic Voice Loop (MVP)
1. **Mic Capture Component**
   - Simple record/stop button
   - Send complete audio to backend
   - Display transcript confirmation

2. **STT Integration**
   - Wire Whisper API in backend
   - Return transcript to frontend
   - Feed into existing chat flow

3. **TTS Integration**
   - Connect Sesame TTS service
   - Generate audio from Maya's response
   - Return audio URL with response

4. **Audio Playback**
   - Auto-play Maya's response
   - Show playback controls

### Phase 2: Enhanced Experience
- Streaming STT for real-time feedback
- Voice activity detection (VAD)
- Interrupt handling
- Background noise suppression
- Voice command triggers ("Hey Maya")

## Configuration Requirements

### Environment Variables
```bash
# Already have:
OPENAI_API_KEY=xxx          # For Whisper STT
USE_SESAME=true             # Sesame enabled
SESAME_CSM_URL=xxx          # Sesame endpoint

# Need to add:
WHISPER_MODEL=whisper-1     # STT model selection
SESAME_VOICE_ID=maya        # TTS voice selection
AUDIO_SAMPLE_RATE=16000     # Audio processing params
```

### Frontend State Management
```typescript
interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  isPlaying: boolean;
  currentTranscript: string;
  audioQueue: AudioURL[];
  volume: number;
}
```

## Testing Checklist

### Functionality Tests
- [ ] Mic permission request works
- [ ] Audio captures correctly
- [ ] STT returns accurate transcript
- [ ] Transcript feeds into Maya pipeline
- [ ] Maya response includes prosody
- [ ] TTS generates audio from prosody text
- [ ] Audio plays automatically
- [ ] UI shows clean text while audio has prosody

### Edge Cases
- [ ] Handle mic permission denied
- [ ] Handle network interruption during streaming
- [ ] Handle STT failure gracefully
- [ ] Handle TTS failure with fallback
- [ ] Manage audio queue for rapid inputs
- [ ] Prevent audio overlap/collision

## Success Criteria

The voice loop is complete when:
1. User clicks mic → speaks → sees transcript
2. Maya processes input → returns dual response
3. UI displays clean text
4. Audio plays with prosody intact
5. Full conversation flows naturally

## Code Examples

### Mic Capture (Frontend)
```typescript
const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);
  const chunks: Blob[] = [];
  
  mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(chunks, { type: 'audio/webm' });
    const transcript = await sendToSTT(audioBlob);
    onTranscript(transcript);
  };
  
  mediaRecorder.start();
};
```

### STT Route (Backend)
```typescript
export async function POST(request: Request) {
  const formData = await request.formData();
  const audioFile = formData.get('audio') as File;
  
  const response = await openai.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1',
    language: 'en'
  });
  
  return Response.json({ 
    transcript: response.text,
    confidence: 0.95 
  });
}
```

### Dual Response (Backend)
```typescript
// In ConversationalPipeline
const mayaResponse = await this.generateResponse(userText);
const audioUrl = await this.sesameTTS.synthesize(mayaResponse);

return {
  displayText: cleanMessage(mayaResponse),  // For UI
  voiceText: mayaResponse,                  // For debugging
  audioUrl: audioUrl,                       // For playback
  prosodyMarkers: extractProsody(mayaResponse) // Optional metadata
};
```

## Notes

- Keep prosody markup simple initially (`<pace-slow>`, `<emphasis>`)
- Sesame should handle prosody → SSML conversion
- Consider audio format (mp3 vs wav) for bandwidth
- Cache frequently used phrases for instant playback
- Monitor latency at each step (target < 2s total)

---

*This pipeline completes Maya's sensory loop, making her a truly conversational companion.*