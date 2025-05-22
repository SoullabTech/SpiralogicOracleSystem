// 📁 Frontend: src/lib/voiceProfiles.ts

export type VoiceProfile = {
  voiceId: string;           // ← The ElevenLabs voice identifier
  uiLabels: {
    chatHeader: string;
    chatPlaceholder: string;
    sendButton: string;
    guideIntro: (name: string) => string;
    journalPrompt: string;
  };
};

export const voiceProfiles: Record<string, VoiceProfile> = {
  default: {
    voiceId: 'ELEVEN_LABS_VOICE_ID_FOR_AUNT_ANNIE',
    uiLabels: {
      chatHeader: '🌀 Oracle Summoning Portal',
      chatPlaceholder: 'Speak your truth...',
      sendButton: 'Send',
      guideIntro: (name: string) => `Oracle: ${name}`,
      journalPrompt: 'What insight would you like to record today?',
    },
  },

  soulfulAcademy: {
    voiceId: 'ELEVEN_LABS_VOICE_ID_FOR_SOULFUL_ACADEMY',
    uiLabels: {
      chatHeader: '🌟 Speak with Your Guide',
      chatPlaceholder: 'Begin by sharing what’s on your heart...',
      sendButton: 'Share Message',
      guideIntro: (name: string) => `${name}, your dedicated guide`,
      journalPrompt: 'Reflect with clarity. What is moving within you today?',
    },
  },

  zenMinimalist: {
    voiceId: 'ELEVEN_LABS_VOICE_ID_FOR_ZEN_MINIMALIST',
    uiLabels: {
      chatHeader: 'Quiet Questions, Clear Guidance',
      chatPlaceholder: 'Begin in stillness...',
      sendButton: 'Send Thought',
      guideIntro: (name: string) => `Companion: ${name}`,
      journalPrompt: 'What is arising in the quiet?',
    },
  },
};
