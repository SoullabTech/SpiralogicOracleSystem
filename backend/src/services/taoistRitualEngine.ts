import { Element, FourPillarsProfile } from './fourPillarsService';

export interface RitualSuggestion {
  id: string;
  title: string;
  durationMin: number;
  description?: string;
  instruction?: string;
  element: Element;
  type: 'qigong' | 'meditation' | 'sound' | 'breath' | 'movement';
}

// Taoist ritual practices mapped to Five Elements
const ELEMENT_RITUAL_MAP: Record<Element, RitualSuggestion[]> = {
  Wood: [
    {
      id: 'inner-smile-liver',
      title: 'Inner Smile – Liver Qi',
      durationMin: 10,
      description: 'Cultivate growth energy and flexibility',
      instruction: 'Smile to your liver, visualize green healing light, stretch gently',
      element: 'Wood',
      type: 'meditation'
    },
    {
      id: 'tree-qigong',
      title: 'Standing Tree Qi Gong',
      durationMin: 15,
      description: 'Root and expand like an ancient tree',
      instruction: 'Stand with arms embracing invisible tree, breathe into liver meridian',
      element: 'Wood',
      type: 'qigong'
    }
  ],
  Fire: [
    {
      id: 'heart-fire-qigong',
      title: 'Heart Fire Qi Gong',
      durationMin: 12,
      description: 'Ignite joy and circulation',
      instruction: 'Open heart center, circulate warm red energy, smile from heart',
      element: 'Fire',
      type: 'qigong'
    },
    {
      id: 'laughing-buddha',
      title: 'Laughing Buddha Practice',
      durationMin: 8,
      description: 'Cultivate pure joy and heart opening',
      instruction: 'Belly laugh for 2 minutes, then sit in silent joy',
      element: 'Fire',
      type: 'movement'
    }
  ],
  Earth: [
    {
      id: 'micro-orbit',
      title: 'Microcosmic Orbit Grounding',
      durationMin: 15,
      description: 'Center and stabilize your energy',
      instruction: 'Circulate energy from tailbone up spine to crown, down front to navel',
      element: 'Earth',
      type: 'meditation'
    },
    {
      id: 'spleen-stomach-harmony',
      title: 'Spleen-Stomach Harmony',
      durationMin: 10,
      description: 'Balance digestive and worry energies',
      instruction: 'Gentle abdominal massage while humming low tones',
      element: 'Earth',
      type: 'sound'
    }
  ],
  Metal: [
    {
      id: 'lung-healing-sound',
      title: 'Lung Healing Sound (Tsu)',
      durationMin: 8,
      description: 'Release grief and cultivate clarity',
      instruction: 'Exhale "Tsuuuu" sound while visualizing white light in lungs',
      element: 'Metal',
      type: 'sound'
    },
    {
      id: 'autumn-letting-go',
      title: 'Autumn Letting Go',
      durationMin: 12,
      description: 'Release what no longer serves',
      instruction: 'Breathe in clarity, exhale old patterns with "Ha" sound',
      element: 'Metal',
      type: 'breath'
    }
  ],
  Water: [
    {
      id: 'kidney-water-breath',
      title: 'Kidney Water Breath',
      durationMin: 10,
      description: 'Restore vitality and inner wisdom',
      instruction: 'Deep belly breathing while warming kidney area with palms',
      element: 'Water',
      type: 'breath'
    },
    {
      id: 'flowing-water-meditation',
      title: 'Flowing Water Meditation',
      durationMin: 15,
      description: 'Cultivate fluidity and deep knowing',
      instruction: 'Visualize being a gentle stream, flowing around obstacles',
      element: 'Water',
      type: 'meditation'
    }
  ]
};

/**
 * Suggest Taoist rituals based on Four Pillars deficiencies
 */
export function suggestTaoistRituals(profile: FourPillarsProfile): RitualSuggestion[] {
  // Primary focus: balance deficient elements
  const deficientRituals = profile.deficient.flatMap(element =>
    ELEMENT_RITUAL_MAP[element] || []
  );

  // Secondary: support overall balance
  const allElements: Element[] = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
  const balancingRituals = allElements
    .filter(element => !profile.dominant.includes(element) && !profile.deficient.includes(element))
    .flatMap(element => ELEMENT_RITUAL_MAP[element]?.slice(0, 1) || []);

  return [...deficientRituals, ...balancingRituals];
}

/**
 * Get daily ritual recommendation based on current time and elements
 */
export function getDailyRitual(profile: FourPillarsProfile): RitualSuggestion {
  const hour = new Date().getHours();

  // Time-based element recommendations (Traditional Chinese Medicine organ clock)
  let timeElement: Element;
  if (hour >= 3 && hour < 7) timeElement = 'Wood';  // Liver/Gallbladder time
  else if (hour >= 11 && hour < 15) timeElement = 'Fire'; // Heart/Small Intestine
  else if (hour >= 7 && hour < 11) timeElement = 'Earth'; // Stomach/Spleen
  else if (hour >= 15 && hour < 19) timeElement = 'Metal'; // Lung/Large Intestine
  else timeElement = 'Water'; // Kidney/Bladder time

  // Prioritize deficient elements, otherwise use time element
  const targetElement = profile.deficient.length > 0 ? profile.deficient[0] : timeElement;
  const rituals = ELEMENT_RITUAL_MAP[targetElement];

  return rituals[0] || ELEMENT_RITUAL_MAP.Water[0];
}

/**
 * Get seasonal ritual recommendations
 */
export function getSeasonalRitual(): RitualSuggestion {
  const month = new Date().getMonth();
  let seasonElement: Element;

  if (month >= 2 && month <= 4) seasonElement = 'Wood';   // Spring
  else if (month >= 5 && month <= 7) seasonElement = 'Fire';  // Summer
  else if (month >= 8 && month <= 10) seasonElement = 'Metal'; // Autumn
  else seasonElement = 'Water'; // Winter

  return ELEMENT_RITUAL_MAP[seasonElement][0];
}

/**
 * Generate personalized ritual sequence
 */
export function generateRitualSequence(profile: FourPillarsProfile, duration: number): RitualSuggestion[] {
  const sequence: RitualSuggestion[] = [];
  let remainingTime = duration;

  // Start with most deficient element
  if (profile.deficient.length > 0) {
    const primary = ELEMENT_RITUAL_MAP[profile.deficient[0]][0];
    if (primary && remainingTime >= primary.durationMin) {
      sequence.push(primary);
      remainingTime -= primary.durationMin;
    }
  }

  // Add balancing elements
  const allElements: Element[] = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
  for (const element of allElements) {
    if (remainingTime <= 0) break;
    if (profile.dominant.includes(element)) continue;

    const ritual = ELEMENT_RITUAL_MAP[element][0];
    if (ritual && remainingTime >= ritual.durationMin) {
      sequence.push(ritual);
      remainingTime -= ritual.durationMin;
    }
  }

  return sequence;
}

/**
 * Get element-specific affirmations
 */
export function getElementalAffirmations(element: Element): string[] {
  const affirmations: Record<Element, string[]> = {
    Wood: [
      'I grow with flexibility and grace',
      'My vision expands like branches reaching for light',
      'I am rooted yet adaptable'
    ],
    Fire: [
      'Joy flows freely through my heart',
      'I shine my authentic light brightly',
      'Love and warmth radiate from my being'
    ],
    Earth: [
      'I am grounded and centered',
      'My presence nourishes others',
      'I trust in the stability of my foundation'
    ],
    Metal: [
      'I breathe in clarity and release what no longer serves',
      'My boundaries are clear and healthy',
      'I honor the preciousness of this moment'
    ],
    Water: [
      'I flow with wisdom and intuition',
      'My depths contain infinite wisdom',
      'I adapt gracefully to life\'s changes'
    ]
  };

  return affirmations[element] || affirmations.Water;
}