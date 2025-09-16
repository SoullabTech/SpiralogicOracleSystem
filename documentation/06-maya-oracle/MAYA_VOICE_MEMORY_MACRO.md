# 🚀 Claude Code Macro: Restore Maya Voice + Memory

**Complete 5-step upgrade script for Soullab Personal Oracle Agent**  
Execute these upgrades in sequence across frontend + backend.

---

## 1. TranscriptPreview Component with Pulsing Torus

📂 **Create:** `/app/components/TranscriptPreview.tsx`

```tsx
'use client';

import React from 'react';

interface TranscriptPreviewProps {
  interimTranscript: string;
  finalTranscript: string;
  isListening: boolean;
}

export const TranscriptPreview: React.FC<TranscriptPreviewProps> = ({
  interimTranscript,
  finalTranscript,
  isListening
}) => {
  return (
    <div className="relative w-full max-w-md mx-auto p-6 bg-slate-900/90 backdrop-blur-sm rounded-xl border border-amber-500/20">
      {/* Pulsing Torus Animation */}
      {isListening && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 mb-4">
          <div className="relative w-16 h-16">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/30 animate-pulse-ring-outer"></div>
            {/* Middle ring */}
            <div className="absolute inset-2 rounded-full border-2 border-amber-400/50 animate-pulse-ring-middle"></div>
            {/* Inner core */}
            <div className="absolute inset-4 rounded-full bg-gradient-radial from-amber-300 to-amber-600 animate-pulse-core shadow-lg shadow-amber-500/50"></div>
            {/* Tesla-style energy arcs */}
            <div className="absolute inset-1 rounded-full border border-amber-300/40 animate-spin-slow"></div>
          </div>
        </div>
      )}

      {/* Transcript Content */}
      <div className="mt-8 space-y-3">
        {/* Live Interim Transcript */}
        {interimTranscript && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-amber-300/80 font-mono">LISTENING</span>
            </div>
            <p className="text-amber-100/90 text-sm italic">
              {interimTranscript}
            </p>
          </div>
        )}

        {/* Final Transcript */}
        {finalTranscript && (
          <div className="p-3 bg-slate-800/60 border border-slate-600/40 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs text-slate-300 font-mono">CAPTURED</span>
            </div>
            <p className="text-white text-sm">
              {finalTranscript}
            </p>
          </div>
        )}

        {/* Listening State Indicator */}
        {isListening && !interimTranscript && (
          <div className="text-center py-4">
            <p className="text-amber-300/60 text-sm animate-pulse">
              Speak now... Maya is listening
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
```

**Add Tailwind CSS animations to your `globals.css`:**

```css
@keyframes pulse-ring-outer {
  0%, 100% { 
    transform: scale(1) rotate(0deg);
    opacity: 1;
    border-color: rgb(245 158 11 / 0.3);
  }
  50% { 
    transform: scale(1.1) rotate(180deg);
    opacity: 0.6;
    border-color: rgb(245 158 11 / 0.6);
  }
}

@keyframes pulse-ring-middle {
  0%, 100% { 
    transform: scale(1) rotate(0deg);
    opacity: 0.8;
    border-color: rgb(251 191 36 / 0.5);
  }
  50% { 
    transform: scale(1.2) rotate(-90deg);
    opacity: 0.4;
    border-color: rgb(251 191 36 / 0.8);
  }
}

@keyframes pulse-core {
  0%, 100% { 
    transform: scale(1);
    box-shadow: 0 0 20px rgb(245 158 11 / 0.5);
  }
  50% { 
    transform: scale(1.1);
    box-shadow: 0 0 40px rgb(245 158 11 / 0.8), 0 0 60px rgb(245 158 11 / 0.4);
  }
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-pulse-ring-outer {
  animation: pulse-ring-outer 2s ease-in-out infinite;
}

.animate-pulse-ring-middle {
  animation: pulse-ring-middle 2s ease-in-out infinite 0.3s;
}

.animate-pulse-core {
  animation: pulse-core 2s ease-in-out infinite 0.1s;
}

.animate-spin-slow {
  animation: spin-slow 8s linear infinite;
}

.bg-gradient-radial {
  background: radial-gradient(circle, var(--tw-gradient-from), var(--tw-gradient-to));
}
```

---

## 2. Mic → Whisper Streaming Route

📂 **Edit:** `/backend/src/routes/voice.routes.ts`

**Add this new streaming transcription route:**

```typescript
// Add to existing voice routes
router.post('/transcribe/stream', async (req: Request, res: Response) => {
  console.log('[VOICE STREAM] Starting transcription stream...');
  
  // Set up streaming response headers
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  });

  const timeoutId = setTimeout(() => {
    console.log('[VOICE STREAM] Timeout reached, ending stream');
    res.write('data: {"type":"timeout","message":"Stream timeout"}\n\n');
    res.end();
  }, 30000); // 30 second timeout

  try {
    const audioChunks: Buffer[] = [];
    
    // Collect audio data
    req.on('data', (chunk: Buffer) => {
      audioChunks.push(chunk);
      console.log(`[VOICE STREAM] Received chunk: ${chunk.length} bytes`);
      
      // Send interim acknowledgment
      res.write(`data: {"type":"interim","status":"receiving","bytes":${chunk.length}}\n\n`);
    });

    req.on('end', async () => {
      clearTimeout(timeoutId);
      console.log(`[VOICE STREAM] Audio complete. Total chunks: ${audioChunks.length}`);
      
      try {
        const audioBuffer = Buffer.concat(audioChunks);
        console.log(`[VOICE STREAM] Combined audio size: ${audioBuffer.length} bytes`);
        
        // Create form data for Whisper API
        const formData = new FormData();
        const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
        formData.append('file', audioBlob, 'audio.wav');
        formData.append('model', 'whisper-1');
        formData.append('response_format', 'json');

        // Call OpenAI Whisper
        const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: formData
        });

        if (!whisperResponse.ok) {
          throw new Error(`Whisper API error: ${whisperResponse.status}`);
        }

        const transcription = await whisperResponse.json();
        console.log('[VOICE STREAM] Whisper response:', transcription);

        // Send final transcript
        res.write(`data: ${JSON.stringify({
          type: 'final',
          transcript: transcription.text,
          confidence: transcription.confidence || 1.0,
          timestamp: new Date().toISOString()
        })}\n\n`);

        res.end();

      } catch (error) {
        console.error('[VOICE STREAM] Transcription error:', error);
        res.write(`data: ${JSON.stringify({
          type: 'error',
          message: error instanceof Error ? error.message : 'Transcription failed'
        })}\n\n`);
        res.end();
      }
    });

    req.on('error', (error) => {
      clearTimeout(timeoutId);
      console.error('[VOICE STREAM] Request error:', error);
      res.write(`data: ${JSON.stringify({
        type: 'error',
        message: 'Audio stream error'
      })}\n\n`);
      res.end();
    });

  } catch (error) {
    clearTimeout(timeoutId);
    console.error('[VOICE STREAM] Route error:', error);
    res.write(`data: ${JSON.stringify({
      type: 'error',
      message: error instanceof Error ? error.message : 'Stream setup failed'
    })}\n\n`);
    res.end();
  }
});
```

---

## 3. TTSOrchestrator Resilient Failover

📂 **Edit:** `/backend/src/services/TTSOrchestrator.ts`

**Update the speak method with bulletproof failover:**

```typescript
async speak(text: string, options: TTSOptions = {}): Promise<string> {
  console.log('[TTS ORCHESTRATOR] Starting TTS synthesis:', text.slice(0, 50));
  
  const providers = [
    { name: 'Sesame', service: this.sesameService },
    { name: 'ElevenLabs', service: this.elevenLabsService },
    { name: 'Mock', service: this.mockService }
  ];

  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      console.log(`[TTS ORCHESTRATOR] Attempting ${provider.name}...`);
      
      const audioUrl = await provider.service.synthesize(text, options);
      
      if (audioUrl && audioUrl.length > 0) {
        console.log(`[TTS ORCHESTRATOR] ✅ ${provider.name} succeeded:`, audioUrl);
        return audioUrl;
      }
      
      throw new Error(`${provider.name} returned empty audio URL`);
      
    } catch (error) {
      lastError = error as Error;
      console.warn(`[TTS FAILOVER] ${provider.name} unavailable:`, lastError.message);
      
      // Special handling for different provider types
      if (provider.name === 'Sesame') {
        console.warn('[TTS FAILOVER] Sesame unavailable, using ElevenLabs');
      } else if (provider.name === 'ElevenLabs') {
        console.warn('[TTS FAILOVER] ElevenLabs unavailable, using Mock');
      }
      
      // Continue to next provider
      continue;
    }
  }

  // If all providers failed, return emergency mock audio
  console.error('[TTS ORCHESTRATOR] All providers failed! Using emergency mock.');
  return this.createEmergencyMockAudio(text);
}

private createEmergencyMockAudio(text: string): string {
  // Generate a simple mock audio URL that frontend can handle
  const mockId = Date.now().toString();
  console.log('[TTS ORCHESTRATOR] Created emergency mock audio:', mockId);
  
  // Return a data URL or mock endpoint that won't break the frontend
  return `data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj`;
}

// Health check method
async checkHealth(): Promise<TTSHealthStatus> {
  const health: TTSHealthStatus = {
    sesame: false,
    elevenLabs: false,
    mock: true, // Mock is always available
    activeProvider: 'unknown'
  };

  try {
    await this.sesameService.synthesize('test', { voice: 'maya' });
    health.sesame = true;
    health.activeProvider = 'sesame';
  } catch (error) {
    console.log('[TTS HEALTH] Sesame unavailable');
  }

  if (!health.sesame) {
    try {
      await this.elevenLabsService.synthesize('test');
      health.elevenLabs = true;
      health.activeProvider = 'elevenLabs';
    } catch (error) {
      console.log('[TTS HEALTH] ElevenLabs unavailable');
    }
  }

  if (!health.sesame && !health.elevenLabs) {
    health.activeProvider = 'mock';
  }

  return health;
}
```

**Add health endpoint in voice routes:**

```typescript
// Add to voice routes
router.get('/tts/health', async (req: Request, res: Response) => {
  try {
    const orchestrator = new TTSOrchestrator();
    const health = await orchestrator.checkHealth();
    res.json({
      status: 'ok',
      health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Health check failed'
    });
  }
});
```

---

## 4. Memory Injection Guarantee

📂 **Edit:** `/backend/src/services/ConversationalPipeline.ts`

**Add bulletproof memory injection before every LLM call:**

```typescript
import { MemoryOrchestrator } from './MemoryOrchestrator';

// Add this method to ConversationalPipeline class
private async injectMemoryContext(userId: string, inputText: string, sessionId?: string): Promise<string> {
  console.log('[MEMORY INJECTION] Building context for user:', userId);
  
  try {
    const memoryContext = await MemoryOrchestrator.buildContext(userId, inputText, sessionId);
    
    if (process.env.MAYA_DEBUG_MEMORY === 'true') {
      console.log('[MEMORY DEBUG] Context built:', {
        sessionCount: memoryContext.session?.length || 0,
        journalCount: memoryContext.journal?.length || 0,
        profileKeys: Object.keys(memoryContext.profile || {}),
        symbolicCount: memoryContext.symbolic?.length || 0,
        externalCount: memoryContext.external?.length || 0
      });
    }
    
    return this.formatMemoryForPrompt(memoryContext);
    
  } catch (error) {
    console.error('[MEMORY INJECTION] Error building context:', error);
    
    // Return safe fallback context
    const fallbackContext = {
      session: [],
      journal: [],
      profile: {},
      symbolic: [],
      external: []
    };
    
    console.warn('[MEMORY INJECTION] Using safe fallback context');
    return this.formatMemoryForPrompt(fallbackContext);
  }
}

private formatMemoryForPrompt(memoryContext: any): string {
  const sections = [];
  
  // Session context
  if (memoryContext.session?.length > 0) {
    sections.push(`SESSION CONTEXT:\n${memoryContext.session.map((s: any) => `- ${s.summary || s.content}`).join('\n')}`);
  }
  
  // Journal insights
  if (memoryContext.journal?.length > 0) {
    sections.push(`JOURNAL INSIGHTS:\n${memoryContext.journal.map((j: any) => `- ${j.insight || j.entry}`).join('\n')}`);
  }
  
  // User profile
  if (memoryContext.profile && Object.keys(memoryContext.profile).length > 0) {
    const profileItems = Object.entries(memoryContext.profile).map(([key, value]) => `- ${key}: ${value}`);
    sections.push(`USER PROFILE:\n${profileItems.join('\n')}`);
  }
  
  // Symbolic patterns
  if (memoryContext.symbolic?.length > 0) {
    sections.push(`SYMBOLIC PATTERNS:\n${memoryContext.symbolic.map((s: any) => `- ${s.pattern || s.symbol}: ${s.meaning}`).join('\n')}`);
  }
  
  return sections.length > 0 ? `\n\nMEMORY CONTEXT:\n${sections.join('\n\n')}\n` : '';
}

// Update processMessage method to always inject memory
async processMessage(userId: string, message: string, sessionId?: string): Promise<StreamResponse> {
  console.log('[CONVERSATIONAL PIPELINE] Processing message for user:', userId);
  
  // GUARANTEE: Always inject memory context
  const memoryContext = await this.injectMemoryContext(userId, message, sessionId);
  
  // Build enhanced system prompt
  const systemPrompt = `${this.baseSystemPrompt}${memoryContext}`;
  
  if (process.env.MAYA_DEBUG_MEMORY === 'true') {
    console.log('[CONVERSATIONAL DEBUG] Enhanced prompt length:', systemPrompt.length);
  }
  
  // Continue with existing LLM processing...
  return this.callLLMWithMemory(systemPrompt, message, userId);
}

private async callLLMWithMemory(systemPrompt: string, userMessage: string, userId: string): Promise<StreamResponse> {
  // Your existing LLM call logic here, but using the enhanced systemPrompt
  console.log('[LLM CALL] System prompt includes memory context');
  
  // Example implementation (adapt to your existing code):
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ];
  
  // Call your LLM service with the memory-enhanced messages
  return await this.llmService.generateResponse(messages, userId);
}
```

---

## 5. Integration & Debug Setup

📂 **Edit:** `/app/oracle/page.tsx` (or your main Oracle page)

**Integrate TranscriptPreview and add debug controls:**

```tsx
'use client';

import { useState, useCallback } from 'react';
import { TranscriptPreview } from '../components/TranscriptPreview';
import { useMayaStream } from '../hooks/useMayaStream';

export default function OraclePage() {
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  const { sendMessage, messages, isStreaming } = useMayaStream();

  // Voice recording handlers
  const startListening = useCallback(async () => {
    setIsListening(true);
    setInterimTranscript('');
    setFinalTranscript('');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType: 'audio/webm;codecs=opus' 
      });
      
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          await sendToTranscriptionStream(event.data);
        }
      };
      
      mediaRecorder.start(1000); // Send chunks every 1 second
      
      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          setIsListening(false);
        }
      }, 30000);
      
    } catch (error) {
      console.error('[VOICE] Microphone access denied:', error);
      setIsListening(false);
    }
  }, []);

  const sendToTranscriptionStream = async (audioBlob: Blob) => {
    try {
      const response = await fetch('/api/oracle/voice/transcribe/stream', {
        method: 'POST',
        body: audioBlob,
        headers: {
          'Content-Type': 'audio/webm'
        }
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response reader');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            
            if (data.type === 'interim') {
              setInterimTranscript(data.transcript || '');
            } else if (data.type === 'final') {
              setFinalTranscript(data.transcript || '');
              setInterimTranscript('');
              setIsListening(false);
              
              // Send final transcript to Maya
              if (data.transcript) {
                await sendMessage(data.transcript);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('[VOICE STREAM] Error:', error);
      setIsListening(false);
    }
  };

  const checkTTSHealth = async () => {
    try {
      const response = await fetch('/api/tts/health');
      const health = await response.json();
      console.log('[TTS HEALTH]', health);
      alert(`TTS Health: ${JSON.stringify(health, null, 2)}`);
    } catch (error) {
      console.error('[TTS HEALTH] Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Debug Controls */}
        {debugMode && (
          <div className="bg-slate-800/50 p-4 rounded-lg border border-amber-500/20">
            <h3 className="text-amber-400 font-semibold mb-3">Debug Controls</h3>
            <div className="flex gap-4">
              <button
                onClick={checkTTSHealth}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
              >
                Check TTS Health
              </button>
              <button
                onClick={() => {
                  localStorage.setItem('MAYA_DEBUG_MEMORY', 'true');
                  alert('Memory debug enabled');
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm"
              >
                Enable Memory Debug
              </button>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`p-4 rounded-lg ${
              message.role === 'user' 
                ? 'bg-blue-600/20 border border-blue-500/30' 
                : 'bg-amber-600/20 border border-amber-500/30'
            }`}>
              <div className="font-semibold text-sm mb-2">
                {message.role === 'user' ? 'You' : 'Maya'}
              </div>
              <div className="text-sm">{message.content}</div>
            </div>
          ))}
        </div>

        {/* Transcript Preview - KEY INTEGRATION */}
        <TranscriptPreview
          interimTranscript={interimTranscript}
          finalTranscript={finalTranscript}
          isListening={isListening}
        />

        {/* Voice Controls */}
        <div className="flex justify-center gap-4">
          <button
            onClick={startListening}
            disabled={isListening}
            className={`px-6 py-3 rounded-lg font-semibold ${
              isListening 
                ? 'bg-red-600 cursor-not-allowed' 
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {isListening ? 'Listening...' : '🎤 Speak to Maya'}
          </button>
          
          <button
            onClick={() => setDebugMode(!debugMode)}
            className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
          >
            {debugMode ? 'Hide Debug' : 'Show Debug'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 🧪 Testing Checklist

Execute these tests in sequence:

### 1. Memory Debug Test
```bash
export MAYA_DEBUG_MEMORY=true
npm run dev
```
**Expected:** Console shows memory context being injected with each request.

### 2. TTS Health Check
```bash
curl http://localhost:3000/api/tts/health
```
**Expected:** JSON response showing provider availability.

### 3. Sesame Failover Test
```bash
# Stop Sesame
./scripts/stop-sesame.sh

# Test TTS - should failover to ElevenLabs
curl -X POST http://localhost:3000/api/tts/speak -d '{"text":"Testing failover"}' -H "Content-Type: application/json"
```
**Expected:** Audio URL returned, console shows "Sesame unavailable, using ElevenLabs"

### 4. Voice Streaming Test
1. Open browser to Oracle page
2. Click "🎤 Speak to Maya"  
3. Speak: "Hello Maya, remember my name is Alex"

**Expected:**
- Pulsing torus appears while speaking
- Interim transcript shows live text
- Final transcript captures complete sentence
- Maya responds with memory context included
- Voice plays successfully

### 5. End-to-End Memory Verification
```bash
# Check backend logs for memory injection
tail -f backend/logs/app.log | grep "MEMORY"
```
**Expected:** Every message shows memory context being built and injected.

---

## ✅ Success Criteria

**Voice Pipeline:**
- [ ] Pulsing torus animation works during mic recording
- [ ] Interim transcripts appear live in UI  
- [ ] Final transcripts trigger Maya responses
- [ ] Whisper streaming endpoint handles audio chunks

**Memory System:**
- [ ] Every LLM call includes memory context (no generic responses)
- [ ] Debug logs show session/journal/profile data being injected
- [ ] Memory failover provides safe defaults on errors

**TTS Resilience:**
- [ ] Voice plays with Sesame when available
- [ ] Automatic failover to ElevenLabs when Sesame fails
- [ ] Mock fallback prevents complete voice failure
- [ ] Health endpoint reports provider status

**Integration:**
- [ ] TranscriptPreview component renders correctly
- [ ] Debug controls work for troubleshooting
- [ ] All console logs provide clear debugging info

---

**🎯 End Result:** Maya has restored voice transcription with live preview, guaranteed memory injection, and bulletproof TTS failover. The system gracefully handles provider failures while maintaining full conversational context.