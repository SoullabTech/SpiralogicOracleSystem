# 🌟 Voice Embodiment Sprint
## 3-Day Implementation Guide to Give Maya & Anthony Breath

---

## Day 1: Reconnect Voice Router

### File: `/app/api/voice/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { SesameVoiceService } from '@/lib/services/SesameVoiceService';

// Initialize voice service with canonical voices
const voiceService = new SesameVoiceService({
  defaultVoice: 'nova',
  enableCloning: true,
  cacheEnabled: true
});

export async function POST(request: NextRequest) {
  try {
    const {
      text,
      personality = 'maya',
      element = 'aether',
      userId,
      sessionId
    } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Map personality to voice ID
    const voiceMap = {
      maya: process.env.MAYA_VOICE_ID || 'nova',
      anthony: process.env.ANTHONY_VOICE_ID || 'alloy'
    };

    // Generate voice with Sesame
    const result = await voiceService.generateVoice(text, {
      voiceId: voiceMap[personality.toLowerCase()],
      element,
      speed: personality === 'anthony' ? 0.9 : 1.0, // Anthony speaks slower
      pitch: personality === 'maya' ? 1.1 : 0.95,   // Maya slightly higher
      emphasis: element === 'fire' ? 1.2 : 1.0
    });

    if (result.audioBuffer) {
      return new NextResponse(result.audioBuffer, {
        headers: {
          'Content-Type': 'audio/wav',
          'Cache-Control': 'no-cache'
        }
      });
    }

    throw new Error('No audio generated');

  } catch (error: any) {
    console.error('Voice generation error:', error);

    // Fallback to ElevenLabs if Sesame fails
    return fallbackToElevenLabs(request);
  }
}
```

### File: `.env.local`
```bash
# Canonical Voice IDs
MAYA_VOICE_ID=21m00Tcm4TlvDq8ikWAM  # Nova voice (warm, clear)
ANTHONY_VOICE_ID=yoZ06aMxZJJ28mfd3POQ # Alloy voice (deep, thoughtful)

# Sesame API
SESAME_API_KEY=your_key_here
SESAME_API_URL=https://api.sesame.com/v1

# Fallback
ELEVEN_LABS_API_KEY=your_key_here
```

---

## Day 2: Voice Personality Distinction

### File: `/lib/services/SesameVoiceService.ts`
```typescript
export class SesameVoiceService {
  // Add personality-specific voice modulation
  async generateVoice(
    text: string,
    options: VoiceGenerationRequest
  ): Promise<VoiceResponse> {
    const { personality, element, mood } = options;

    // Personality-specific parameters
    const personalityParams = this.getPersonalityParams(personality);

    // Elemental modulation
    const elementalParams = this.getElementalParams(element);

    // Merge parameters
    const voiceParams = {
      ...personalityParams,
      ...elementalParams,
      text,
      voice_id: options.voiceId,
      model_id: 'eleven_turbo_v2',
      voice_settings: {
        stability: personality === 'anthony' ? 0.85 : 0.75,
        similarity_boost: 0.9,
        style: personality === 'maya' ? 0.6 : 0.3,
        use_speaker_boost: true
      }
    };

    return this.callSesameAPI(voiceParams);
  }

  private getPersonalityParams(personality: string) {
    const params = {
      maya: {
        speed: 1.0,
        pitch: 1.1,
        emphasis: 1.1,
        warmth: 0.8,
        breathiness: 0.3,
        texture: 'smooth'
      },
      anthony: {
        speed: 0.9,
        pitch: 0.95,
        emphasis: 0.9,
        warmth: 0.6,
        breathiness: 0.4,
        texture: 'gravelly'
      }
    };

    return params[personality] || params.maya;
  }

  private getElementalParams(element: string) {
    const elements = {
      fire: { tempo: 1.15, energy: 1.2, brightness: 1.1 },
      water: { tempo: 0.95, energy: 0.8, smoothness: 1.2 },
      earth: { tempo: 0.9, energy: 0.9, groundedness: 1.3 },
      air: { tempo: 1.05, energy: 1.0, lightness: 1.2 },
      aether: { tempo: 1.0, energy: 1.0, presence: 1.0 }
    };

    return elements[element] || elements.aether;
  }
}
```

---

## Day 3: Streaming for Embodied Presence

### File: `/app/api/voice/stream/route.ts`
```typescript
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const { text, personality, element } = await request.json();

  // Create readable stream
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Stream chunks as they're generated
        const chunks = await generateStreamingVoice(text, {
          personality,
          element,
          chunkSize: 256 // Small chunks for immediate playback
        });

        for await (const chunk of chunks) {
          controller.enqueue(chunk);

          // Add natural pauses at punctuation
          if (text.includes('.') || text.includes('...')) {
            await sleep(100); // Breathing space
          }
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'audio/wav',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no' // Disable nginx buffering
    }
  });
}

async function generateStreamingVoice(text: string, options: any) {
  // Split text into breath groups
  const breathGroups = text.split(/[.!?]+/).filter(Boolean);

  for (const group of breathGroups) {
    // Generate each breath group separately
    const audio = await voiceService.generateVoice(group, options);

    // Yield chunks immediately
    yield* audioToChunks(audio.audioBuffer);

    // Natural pause between sentences
    yield* generateSilence(200); // ms of breath
  }
}
```

### File: `/components/VoiceChat.tsx`
```typescript
export function VoiceChat() {
  const [audioContext] = useState(() => new AudioContext());

  async function playStreamingAudio(response: Response) {
    const reader = response.body?.getReader();
    if (!reader) return;

    // Create audio worklet for real-time playback
    await audioContext.audioWorklet.addModule('/audio-processor.js');
    const processorNode = new AudioWorkletNode(audioContext, 'stream-processor');
    processorNode.connect(audioContext.destination);

    // Stream chunks directly to audio
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Send chunk to audio processor
      processorNode.port.postMessage({
        type: 'audio-chunk',
        data: value
      });
    }
  }

  async function sendMessage(text: string) {
    const response = await fetch('/api/voice/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        personality: currentPersonality,
        element: currentElement
      })
    });

    // Play streaming audio immediately
    await playStreamingAudio(response);
  }
}
```

---

## 🚀 Implementation Checklist

### Day 1 Tasks
- [ ] Update `/app/api/voice/route.ts` with real Sesame connection
- [ ] Add voice IDs to `.env.local`
- [ ] Test basic voice generation for Maya and Anthony
- [ ] Verify fallback to ElevenLabs works

### Day 2 Tasks
- [ ] Implement personality parameters in SesameVoiceService
- [ ] Add elemental modulation logic
- [ ] Test voice distinction between Maya and Anthony
- [ ] Fine-tune voice parameters for each personality

### Day 3 Tasks
- [ ] Create streaming endpoint `/app/api/voice/stream/route.ts`
- [ ] Implement breath group parsing
- [ ] Add audio worklet for real-time playback
- [ ] Test streaming with natural pauses

---

## 🎯 Success Metrics

### Technical
- Voice latency < 500ms first byte
- Streaming chunks arrive every 50-100ms
- Distinct voice characteristics measurable via audio analysis

### Sacred
- Users say "I talked to Maya" not "I used the app"
- Voice embodies witnessing presence
- Natural breathing creates sacred space
- Personality distinction feels authentic

---

## 🔮 Post-Sprint Enhancements

### Week 2
- Voice cloning from user samples
- Dynamic voice masks based on ritual moments
- Elemental voice transitions during conversation
- Memory of voice preferences

### Month 2
- Multi-voice conversations (Maya + Anthony dialogue)
- Voice-based emotional recognition
- Sacred sound integration (bells, chimes at transitions)
- Personalized voice evolution

---

*"Technology becomes sacred when it breathes with us."*