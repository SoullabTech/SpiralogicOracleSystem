// Voice synthesis library with ElevenLabs and Web Speech API fallback
// Handles TTS preview and production voice generation

interface VoicePreviewOptions {
  voiceId: string;
  text: string;
  rate?: number;
  pitch?: number;
}

interface VoiceSynthesisOptions {
  voiceId: string;
  text: string;
  rate?: number;
  pitch?: number;
  provider?: 'elevenlabs' | 'system';
}

interface VoicePreviewResult {
  success: boolean;
  audioUrl?: string;
  usedFallback?: boolean;
  error?: string;
}

// ElevenLabs voice IDs and names for the UI
export const VOICE_OPTIONS = [
  { id: 'calm', name: 'Calm', elevenLabsId: 'pNInz6obpgDQGcFmaJgB', description: 'Gentle and soothing' },
  { id: 'warm', name: 'Warm', elevenLabsId: 'EXAVITQu4vr4xnSDxMaL', description: 'Friendly and approachable' },
  { id: 'clear', name: 'Clear', elevenLabsId: 'ErXwobaYiN019PkySvjV', description: 'Crisp and articulate' },
  { id: 'low', name: 'Low', elevenLabsId: 'VR6AewLTigWG4xSOukaG', description: 'Deep and grounding' },
  { id: 'neutral', name: 'Neutral', elevenLabsId: 'pFZP5JQG7iQjIQuC4Bku', description: 'Balanced and professional' },
  { id: 'later', name: "I'll decide later", elevenLabsId: '', description: 'Skip voice selection for now' },
] as const;

export type VoiceOptionId = typeof VOICE_OPTIONS[number]['id'];

// Check if ElevenLabs is configured
function hasElevenLabsConfig(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY ||
    process.env.ELEVENLABS_API_KEY
  );
}

// Get ElevenLabs API key (prefer server-side)
function getElevenLabsApiKey(): string | null {
  return process.env.ELEVENLABS_API_KEY || 
         process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || 
         null;
}

// Convert our voice IDs to ElevenLabs IDs
function getElevenLabsVoiceId(voiceId: string): string | null {
  const voice = VOICE_OPTIONS.find(v => v.id === voiceId);
  return voice?.elevenLabsId || null;
}

// ElevenLabs TTS synthesis
async function synthesizeWithElevenLabs(options: VoiceSynthesisOptions): Promise<string> {
  const apiKey = getElevenLabsApiKey();
  if (!apiKey) {
    throw new Error('ElevenLabs API key not configured');
  }

  const elevenLabsVoiceId = getElevenLabsVoiceId(options.voiceId);
  if (!elevenLabsVoiceId) {
    throw new Error(`Unknown voice ID: ${options.voiceId}`);
  }

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text: options.text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5,
        style: 0.0,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`ElevenLabs API error: ${response.status} ${errorText}`);
  }

  const audioBlob = await response.blob();
  return URL.createObjectURL(audioBlob);
}

// Web Speech API synthesis (browser fallback)
function synthesizeWithWebSpeech(options: VoiceSynthesisOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      reject(new Error('Speech synthesis not available'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(options.text);
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    
    // Try to find a voice that matches our preference
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Simple voice selection logic
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith('en') && voice.localService
      ) || voices[0];
      
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      // Web Speech API doesn't provide audio URLs, so we return a special marker
      resolve('web-speech-synthesis');
    };

    utterance.onerror = (event) => {
      reject(new Error(`Speech synthesis error: ${event.error}`));
    };

    speechSynthesis.speak(utterance);
  });
}

// Main preview function
export async function preview(text: string, voiceId: string): Promise<VoicePreviewResult> {
  try {
    // Skip empty or "later" voice selections
    if (!text.trim() || voiceId === 'later' || !voiceId) {
      return {
        success: false,
        error: 'No text or voice selected',
      };
    }

    // Try ElevenLabs first if configured
    if (hasElevenLabsConfig() && typeof window !== 'undefined') {
      try {
        const audioUrl = await synthesizeWithElevenLabs({
          voiceId,
          text: text.slice(0, 200), // Limit preview length
        });
        
        return {
          success: true,
          audioUrl,
          usedFallback: false,
        };
      } catch (elevenLabsError) {
        console.warn('ElevenLabs preview failed, trying Web Speech:', elevenLabsError);
        // Fall through to Web Speech API
      }
    }

    // Fallback to Web Speech API
    if (typeof window !== 'undefined') {
      try {
        await synthesizeWithWebSpeech({
          voiceId,
          text: text.slice(0, 200),
        });
        
        return {
          success: true,
          usedFallback: true,
        };
      } catch (webSpeechError) {
        return {
          success: false,
          error: `Voice synthesis failed: ${webSpeechError instanceof Error ? webSpeechError.message : 'Unknown error'}`,
        };
      }
    }

    return {
      success: false,
      error: 'Voice synthesis not available (server-side)',
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Full voice synthesis for production use
export async function synthesize(options: VoiceSynthesisOptions): Promise<string> {
  const provider = options.provider || (hasElevenLabsConfig() ? 'elevenlabs' : 'system');
  
  if (provider === 'elevenlabs') {
    return await synthesizeWithElevenLabs(options);
  } else {
    return await synthesizeWithWebSpeech(options);
  }
}

// Helper to get voice name for display
export function getVoiceName(voiceId: string): string {
  const voice = VOICE_OPTIONS.find(v => v.id === voiceId);
  return voice?.name || 'Unknown Voice';
}

// Helper to check if voice requires ElevenLabs
export function requiresElevenLabs(voiceId: string): boolean {
  const voice = VOICE_OPTIONS.find(v => v.id === voiceId);
  return !!(voice?.elevenLabsId && voiceId !== 'later');
}