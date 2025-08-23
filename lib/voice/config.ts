// lib/voice/config.ts
import { features } from '@/lib/config/features';

export type VoiceChoice =
  | { provider: 'sesame'; id: string; label: string }
  | { provider: 'elevenlabs'; id: string; label: string };

export function resolveDefaultVoice(): VoiceChoice {
  if (features.voice.provider === 'elevenlabs') {
    return { 
      provider: 'elevenlabs', 
      id: process.env.ELEVENLABS_VOICE_ID ?? '', 
      label: 'ElevenLabs Default' 
    };
  }
  // Beta default -> Sesame/Maya
  return { provider: 'sesame', id: 'maya', label: 'Maya' };
}

/** Curated options (hidden in beta unless selection enabled) */
export function availableVoices(): VoiceChoice[] {
  const list: VoiceChoice[] = [{ provider: 'sesame', id: 'maya', label: 'Maya (Sesame)' }];
  
  if (features.voice.provider === 'elevenlabs' && process.env.ELEVENLABS_VOICE_ID) {
    list.push({ 
      provider: 'elevenlabs', 
      id: process.env.ELEVENLABS_VOICE_ID, 
      label: 'ElevenLabs Voice' 
    });
  }
  
  return list;
}