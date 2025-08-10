// frontend/src/lib/voice.ts

export interface VoiceOption {
  id: string;
  name: string;
  description: string;
  previewUrl?: string;
}

export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: "AuntAnnie",
    name: "Aunt Annie",
    description: "Warm & Wise - Nurturing guidance with deep knowing",
  },
  {
    id: "Mahela",
    name: "Mahela",
    description:
      "Deep & Contemplative - Thoughtful presence with ancient wisdom",
  },
  {
    id: "Jasper",
    name: "Jasper",
    description: "Clear & Grounded - Practical wisdom with steady presence",
  },
  {
    id: "Orion",
    name: "Orion",
    description:
      "Cosmic & Transcendent - Ethereal guidance from stellar depths",
  },
];

// Audio preview functionality
let currentAudio: HTMLAudioElement | null = null;

export const playVoiceSample = async (voiceId: string): Promise<void> => {
  try {
    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    // Create new audio instance
    const sampleUrl = `/api/voice/preview?voiceId=${voiceId}`;
    currentAudio = new Audio(sampleUrl);

    // Set up event handlers
    currentAudio.addEventListener("error", (e) => {
      console.error("Audio playback error:", e);
      throw new Error("Failed to play voice sample");
    });

    // Play the sample
    await currentAudio.play();
  } catch (error) {
    console.error("Voice sample playback failed:", error);
    throw error;
  }
};

export const stopVoiceSample = (): void => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
};

export const isVoicePlaying = (): boolean => {
  return currentAudio && !currentAudio.paused;
};

// Get voice option by ID
export const getVoiceOption = (voiceId: string): VoiceOption | undefined => {
  return VOICE_OPTIONS.find((voice) => voice.id === voiceId);
};

// Format voice name for display
export const formatVoiceName = (voiceId: string): string => {
  const voice = getVoiceOption(voiceId);
  return voice
    ? `${voice.name} - ${voice.description.split(" - ")[1]}`
    : voiceId;
};
