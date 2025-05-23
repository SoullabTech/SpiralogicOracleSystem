// 📄 File: src/config/voiceProfiles/mindfulTech.ts
// 🔧 Voice profile for MindfulTech white-label deployment

export const mindfulTechProfile = {
  brandName: 'MindfulTech',
  tone: 'precise',
  culturalFraming: 'tech-humanist',
  languageFormality: 'high',
  pacing: 'minimalist',

  archetypeFlavor: {
    Fire: { label: 'The Catalyst', tone: 'strategic' },
    Water: { label: 'The Integrator', tone: 'calm' },
    Earth: { label: 'The Architect', tone: 'structured' },
    Air: { label: 'The Analyst', tone: 'clarifying' },
    Aether: { label: 'The Synthesist', tone: 'meta-logical' },
  },

  emoji: {
    Fire: '🔗',
    Water: '🧬',
    Earth: '📐',
    Air: '📊',
    Aether: '🧠',
  },

  uiLabels: {
    journalPrompt: 'What’s relevant for your focus today?',
    reflectionIntro: 'Here’s a possible next action:',
    ritualStart: 'Let’s calibrate for clarity.',
    guideIntro: (name: string) => `${name} is your current systems guide.`,
  },
};
