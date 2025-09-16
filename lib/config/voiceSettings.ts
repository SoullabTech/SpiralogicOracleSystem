// lib/config/voiceSettings.ts
// Voice configuration settings for Maya and Anthony

export interface VoiceSettings {
  provider: 'openai' | 'elevenlabs';
  voiceId: string;
  name: string;
  speed?: number;
  pitch?: number;
  description?: string;
}

export const VOICE_OPTIONS = {
  maya: {
    alloy: {
      provider: 'openai' as const,
      voiceId: 'alloy',
      name: 'Maya (Alloy)',
      speed: 1.0,
      description: 'Warm, expressive voice with natural pauses'
    },
    nova: {
      provider: 'openai' as const,
      voiceId: 'nova',
      name: 'Maya (Nova)',
      speed: 1.0,
      description: 'Clear, flowing voice with fewer pauses'
    },
    shimmer: {
      provider: 'openai' as const,
      voiceId: 'shimmer',
      name: 'Maya (Shimmer)',
      speed: 1.0,
      description: 'Soft, gentle voice'
    }
  },
  anthony: {
    onyx: {
      provider: 'openai' as const,
      voiceId: 'onyx',
      name: 'Anthony (Onyx)',
      speed: 0.95,
      description: 'Deep, grounding masculine voice'
    },
    echo: {
      provider: 'openai' as const,
      voiceId: 'echo',
      name: 'Anthony (Echo)',
      speed: 0.95,
      description: 'Steady, contemplative voice'
    }
  }
};

// Default selections
export const DEFAULT_VOICES = {
  maya: 'nova',  // Changed from 'alloy' to 'nova' for smoother flow
  anthony: 'onyx'
};

/**
 * Get voice settings for a persona
 */
export function getVoiceSettings(persona: 'maya' | 'anthony', variant?: string): VoiceSettings {
  const variantKey = variant || DEFAULT_VOICES[persona];
  const settings = VOICE_OPTIONS[persona][variantKey as keyof typeof VOICE_OPTIONS[typeof persona]];

  if (!settings) {
    // Fallback to default
    return VOICE_OPTIONS[persona][DEFAULT_VOICES[persona] as keyof typeof VOICE_OPTIONS[typeof persona]];
  }

  return settings;
}