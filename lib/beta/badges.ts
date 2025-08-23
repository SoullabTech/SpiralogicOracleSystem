export const STARTER_PACK_BADGE = 'PIONEER' as const;

export const STARTER_PACK_STEPS = [
  { key: 'first_conversation', label: 'Say Hello to the Oracle' },
  { key: 'voice_play', label: 'Try a Voice Response' },
  { key: 'soul_save', label: 'Save a Soul Memory' },
  { key: 'weave_created', label: 'Weave a Thread' },
] as const;

export type StarterKey = typeof STARTER_PACK_STEPS[number]['key'];

export function computeStarterPackComplete(flags?: Record<string, any>): boolean {
  const f = flags || {};
  return STARTER_PACK_STEPS.every(s => Boolean(f[s.key]));
}

// Badge awarding rules
export const BADGE_EVENT_MAP: Record<string, string> = {
  'voice_play': 'VOICE_VOYAGER',
  'weave_created': 'THREAD_WEAVER',
  'soul_save': 'SOUL_KEEPER',
  'holoflower_explore': 'PATTERN_SCOUT',
  'shadow_safe': 'SHADOW_STEWARD'
};

// Starter pack progress tracking
export const EVENT_STARTER_MAP: Record<string, string> = {
  'oracle_turn': 'first_conversation',
  'voice_play': 'voice_play',
  'soul_save': 'soul_save',
  'weave_created': 'weave_created'
};

// Badge definitions for reference
export const BADGE_DEFINITIONS = [
  {
    id: 'PIONEER',
    emoji: '🧭',
    name: 'Pioneer',
    description: 'Joined Soullab Beta',
    category: 'exploration'
  },
  {
    id: 'VOICE_VOYAGER',
    emoji: '🎙️',
    name: 'Voice Voyager',
    description: 'Played first voice response',
    category: 'exploration'
  },
  {
    id: 'THREAD_WEAVER',
    emoji: '🕸️',
    name: 'Thread Weaver',
    description: 'Created your first weave',
    category: 'depth'
  },
  {
    id: 'SOUL_KEEPER',
    emoji: '🔮',
    name: 'Soul Keeper',
    description: 'Saved first Soul Memory',
    category: 'care'
  },
  {
    id: 'PATTERN_SCOUT',
    emoji: '🌌',
    name: 'Pattern Scout',
    description: 'Explored the Holoflower',
    category: 'insight'
  },
  {
    id: 'SHADOW_STEWARD',
    emoji: '🌑',
    name: 'Shadow Steward',
    description: 'Engaged a shadow turn safely',
    category: 'care'
  },
  {
    id: 'PATHFINDER',
    emoji: '🌿',
    name: 'Pathfinder',
    description: 'Returned on 3 active days in 7',
    category: 'systems'
  }
] as const;