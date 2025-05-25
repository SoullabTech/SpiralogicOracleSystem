// /lib/tts/elementalVoices.ts

export const voiceProfiles = {
  'Fire 1': {
    voiceId: 'fire-bold',
    style: 'bold',
    description: 'Strong, passionate, and commanding'
  },
  'Water 1': {
    voiceId: 'water-soft',
    style: 'whisper',
    description: 'Soft, soothing, and emotional'
  },
  'Earth 1': {
    voiceId: 'earth-calm',
    style: 'grounded',
    description: 'Calm, stable, and nurturing'
  },
  'Air 1': {
    voiceId: 'air-clear',
    style: 'light',
    description: 'Clear, light, and reflective'
  },
  'Aether 1': {
    voiceId: 'aether-mystic',
    style: 'mystic',
    description: 'Ethereal, spacious, and poetic'
  }
};

export function getVoiceByPhase(phase: keyof typeof voiceProfiles) {
  return voiceProfiles[phase];
}
