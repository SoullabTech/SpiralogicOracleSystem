// 📄 File: src/config/voiceProfile.ts
// 🔧 Base voice profile used across frontend and backend

export const voiceProfile = {
  brandName: 'Spiralogic',
  tone: 'mature',
  culturalFraming: 'secular-therapeutic',
  languageFormality: 'medium',
  pacing: 'calm',

  archetypeFlavor: {
    Fire: { label: 'The Visionary', tone: 'direct' },
    Water: { label: 'The Healer', tone: 'empathetic' },
    Earth: { label: 'The Organizer', tone: 'practical' },
    Air: { label: 'The Thinker', tone: 'analytical' },
    Aether: { label: 'The Integrator', tone: 'reflective' },
  },

  emoji: {
    Fire: '🔥',
    Water: '🌊',
    Earth: '🌿',
    Air: '🌬️',
    Aether: '✨',
  },

  uiLabels: {
    journalPrompt: 'What’s rising in your awareness today?',
    reflectionIntro: 'Consider this next step:',
    ritualStart: 'Let’s begin with a short check-in.',
    guideIntro: (name: string) => `Your guide, ${name}, is here to assist.`,
  },
};
