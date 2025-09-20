/**
 * Elemental Timing Modes for Voice Chat
 * Each element represents a different conversational rhythm and energy
 */

export type ElementalMode = 'fire' | 'water' | 'earth' | 'air' | 'aether';

export interface ElementalTiming {
  mode: ElementalMode;
  silenceThreshold: number;      // milliseconds before triggering response
  contemplationThreshold: number; // when to switch to deep reflection
  pulseRate: number;             // visual feedback speed
  color: string;                 // holoflower glow color
  description: string;           // mode description for users
  ritualCue: string;            // what this mode invites
}

export const ELEMENTAL_TIMINGS: Record<ElementalMode, ElementalTiming> = {
  fire: {
    mode: 'fire',
    silenceThreshold: 1000,        // 1 second - rapid exchange
    contemplationThreshold: 3000,   // 3 seconds to cool down
    pulseRate: 0.5,                // fast pulse
    color: '#ef4444',              // red-orange
    description: 'Quick, passionate exchange',
    ritualCue: 'Speak your spark immediately'
  },

  water: {
    mode: 'water',
    silenceThreshold: 3000,        // 3 seconds - flowing conversation
    contemplationThreshold: 8000,   // 8 seconds to go deep
    pulseRate: 2,                  // gentle wave
    color: '#6B9BD1',              // blue
    description: 'Flowing, emotional depth',
    ritualCue: 'Let feelings flow naturally'
  },

  earth: {
    mode: 'earth',
    silenceThreshold: 5000,        // 5 seconds - grounded pace
    contemplationThreshold: 15000,  // 15 seconds for rooting
    pulseRate: 3,                  // slow, steady
    color: '#a16207',              // brown-amber
    description: 'Grounded, thoughtful presence',
    ritualCue: 'Take time to ground your truth'
  },

  air: {
    mode: 'air',
    silenceThreshold: 2000,        // 2 seconds - light & breezy
    contemplationThreshold: 6000,   // 6 seconds to drift
    pulseRate: 1.5,                // moderate flutter
    color: '#D4B896',              // golden
    description: 'Light, inspired dialogue',
    ritualCue: 'Let ideas dance and play'
  },

  aether: {
    mode: 'aether',
    silenceThreshold: 8000,        // 8 seconds - spacious silence
    contemplationThreshold: 30000,  // 30 seconds - infinite space
    pulseRate: 4,                  // very slow, cosmic
    color: '#9333ea',              // purple
    description: 'Spacious, mystical communion',
    ritualCue: 'Rest in the silence between words'
  }
};

/**
 * Group agreement presets for different conversation types
 */
export interface GroupAgreement {
  name: string;
  defaultMode: ElementalMode;
  allowedModes: ElementalMode[];
  autoTransition: boolean;
  description: string;
}

export const GROUP_AGREEMENTS: Record<string, GroupAgreement> = {
  rapidFire: {
    name: 'Rapid Fire Brainstorm',
    defaultMode: 'fire',
    allowedModes: ['fire', 'air'],
    autoTransition: false,
    description: 'Quick ideas, no long pauses'
  },

  deepDive: {
    name: 'Deep Emotional Processing',
    defaultMode: 'water',
    allowedModes: ['water', 'earth', 'aether'],
    autoTransition: true,
    description: 'Space for feelings and depth'
  },

  sacredCircle: {
    name: 'Sacred Circle',
    defaultMode: 'earth',
    allowedModes: ['earth', 'water', 'aether'],
    autoTransition: true,
    description: 'Grounded sharing with spaciousness'
  },

  philosophicalInquiry: {
    name: 'Philosophical Inquiry',
    defaultMode: 'air',
    allowedModes: ['air', 'aether', 'water'],
    autoTransition: true,
    description: 'Ideas flowing into contemplation'
  },

  meditation: {
    name: 'Meditative Dialogue',
    defaultMode: 'aether',
    allowedModes: ['aether', 'earth'],
    autoTransition: false,
    description: 'Mostly silence, occasional sharing'
  },

  adaptive: {
    name: 'Adaptive Flow',
    defaultMode: 'water',
    allowedModes: ['fire', 'water', 'earth', 'air', 'aether'],
    autoTransition: true,
    description: 'Follows the natural rhythm of conversation'
  }
};

/**
 * Detect which elemental mode based on conversation patterns
 */
export function detectElementalMode(
  recentSilences: number[],
  wordCount: number,
  emotionalIntensity: number
): ElementalMode {
  const avgSilence = recentSilences.reduce((a, b) => a + b, 0) / recentSilences.length;

  // Fire: Quick exchanges, high intensity
  if (avgSilence < 1500 && emotionalIntensity > 0.7) {
    return 'fire';
  }

  // Aether: Long silences, contemplative
  if (avgSilence > 6000) {
    return 'aether';
  }

  // Earth: Steady, grounded pace
  if (avgSilence > 4000 && avgSilence < 6000) {
    return 'earth';
  }

  // Air: Light, quick but not intense
  if (avgSilence < 2500 && emotionalIntensity < 0.5) {
    return 'air';
  }

  // Water: Default flowing state
  return 'water';
}

/**
 * Ritual cues for mode transitions
 */
export interface RitualTransition {
  from: ElementalMode;
  to: ElementalMode;
  visualCue: string;
  audioCue: string;
  duration: number;
  message?: string;
}

export function getRitualTransition(from: ElementalMode, to: ElementalMode): RitualTransition {
  // Special transitions for dramatic shifts
  if (from === 'fire' && to === 'aether') {
    return {
      from, to,
      visualCue: 'flame-to-stars',
      audioCue: 'chime-descending',
      duration: 3000,
      message: '🔥→✨ Shifting from spark to space...'
    };
  }

  if (from === 'aether' && to === 'fire') {
    return {
      from, to,
      visualCue: 'stars-to-flame',
      audioCue: 'chime-ascending',
      duration: 2000,
      message: '✨→🔥 Igniting from the void...'
    };
  }

  // Default smooth transition
  return {
    from, to,
    visualCue: 'gentle-morph',
    audioCue: 'soft-transition',
    duration: 1500,
    message: undefined
  };
}

/**
 * AI Active Listening prompts based on mode
 */
export function getActiveListeningPrompt(
  mode: ElementalMode,
  silenceDuration: number
): string | null {
  const timing = ELEMENTAL_TIMINGS[mode];

  // Don't prompt if within normal silence threshold
  if (silenceDuration < timing.contemplationThreshold) {
    return null;
  }

  // Mode-specific prompts
  switch (mode) {
    case 'fire':
      return "The flame has cooled... Ready to reignite?";

    case 'water':
      return "Feeling into the depths... What's emerging?";

    case 'earth':
      return "Grounded in presence... What wants to be shared?";

    case 'air':
      return "Ideas settling like leaves... Any insights landing?";

    case 'aether':
      // Aether mode respects the silence
      return silenceDuration > 60000
        ? "The field is holding space... Still here with you."
        : null;

    default:
      return null;
  }
}