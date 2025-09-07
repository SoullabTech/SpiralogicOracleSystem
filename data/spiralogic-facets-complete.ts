// Complete Spiralogic Facets - All 12 + Aether Dynamics
// Integrating all quadrants with precise ontological mapping

export interface SpiralogicFacet {
  id: string;
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  stage: 1 | 2 | 3;
  position: number; // 0-11 clockwise from 12 o'clock
  angle: {
    start: number; // in radians
    end: number;
  };
  color: {
    base: string;     // Exact color from the Holoflower
    glow: string;     // For activation effects
    shadow: string;   // For depth
  };
  // Core ontology
  facet: string;        // Formal name
  essence: string;      // Core meaning
  keywords: string[];   // Associated concepts
  archetype: string;    // Mythic figure
  practice: string;     // Daily micro-practice
  // Extended attributes
  focusState?: string;  // "I Experience", "I Transform", etc.
  learningStyle?: string;
  keyQuestions?: string[];
}

export const SPIRALOGIC_FACETS_COMPLETE: SpiralogicFacet[] = [
  // ========== AIR QUADRANT (9-12 o'clock) - Mental/Relational ==========
  {
    id: 'air-1',
    element: 'air',
    stage: 1,
    position: 2,
    angle: { start: -2*Math.PI/3, end: -Math.PI/2 },
    color: {
      base: '#D4B896',
      glow: '#F0D4B2',
      shadow: '#B89A7A'
    },
    facet: 'Interpersonal Relationship Patterns',
    essence: 'Perfecting ways of relating to others one-to-one',
    keywords: ['relationships', 'dialogue', 'adaptability', 'connection', 'intimacy'],
    archetype: 'The Companion',
    practice: 'Notice one relationship today — offer presence without agenda',
    focusState: 'I Connect',
    learningStyle: 'Relational',
    keyQuestions: [
      'How do I show up in one-to-one connections?',
      'What patterns repeat in my intimate relationships?'
    ]
  },
  {
    id: 'air-2',
    element: 'air',
    stage: 2,
    position: 1,
    angle: { start: -5*Math.PI/6, end: -2*Math.PI/3 },
    color: {
      base: '#C5A987',
      glow: '#E0C4A2',
      shadow: '#A89070'
    },
    facet: 'Collective Dynamics',
    essence: 'Relating to groups, family, and collective paradigms',
    keywords: ['community', 'collaboration', 'tribe', 'paradigm', 'belonging'],
    archetype: 'The Collaborator',
    practice: 'Strengthen one group tie — contribute a supportive act in your circle',
    focusState: 'I Collaborate',
    learningStyle: 'Social',
    keyQuestions: [
      'How do I contribute to collective spaces?',
      'What role do I play in group dynamics?'
    ]
  },
  {
    id: 'air-3',
    element: 'air',
    stage: 3,
    position: 0,
    angle: { start: -Math.PI, end: -5*Math.PI/6 },
    color: {
      base: '#B69A78',
      glow: '#D4B896',
      shadow: '#9A8062'
    },
    facet: 'Codified Systems and Elevated Communications',
    essence: 'Proficiency in structured, formal, and generative communication',
    keywords: ['systems', 'clarity', 'expression', 'teaching', 'synthesis'],
    archetype: 'The Sage',
    practice: 'Choose one idea and express it with clarity — write, teach, or share it simply',
    focusState: 'I Synthesize',
    learningStyle: 'Systematic',
    keyQuestions: [
      'How can I codify my understanding?',
      'What wisdom am I ready to teach?'
    ]
  },

  // ========== FIRE QUADRANT (12-3 o'clock) - Vision/Expression ==========
  {
    id: 'fire-1',
    element: 'fire',
    stage: 1,
    position: 3,
    angle: { start: -Math.PI/2, end: -Math.PI/3 },
    color: {
      base: '#C85450',
      glow: '#E06B67',
      shadow: '#A84440'
    },
    facet: 'Self-Awareness',
    essence: 'Ego, Persona, Vision',
    keywords: ['intuition', 'future', 'identity', 'vision', 'calling'],
    archetype: 'The Visionary',
    practice: 'Daily journaling of inner impulses',
    focusState: 'I Experience',
    learningStyle: 'Ego-centric',
    keyQuestions: [
      'What does your intuition frequently tell you?',
      'How would you describe your relationship with your personal vision for the future?'
    ]
  },
  {
    id: 'fire-2',
    element: 'fire',
    stage: 2,
    position: 4,
    angle: { start: -Math.PI/3, end: -Math.PI/6 },
    color: {
      base: '#B8524E',
      glow: '#D06966',
      shadow: '#984240'
    },
    facet: 'Self-in-World Awareness',
    essence: 'Expression, Play, Performance',
    keywords: ['creativity', 'performance', 'resonance', 'expression', 'play'],
    archetype: 'The Performer',
    practice: 'Share a truth in visible form',
    focusState: 'I Express',
    learningStyle: 'Expressive',
    keyQuestions: [
      'How do I express my authentic self?',
      'What wants to be created through me?'
    ]
  },
  {
    id: 'fire-3',
    element: 'fire',
    stage: 3,
    position: 5,
    angle: { start: -Math.PI/6, end: 0 },
    color: {
      base: '#A84E4A',
      glow: '#C06562',
      shadow: '#883E3A'
    },
    facet: 'Transcendent Self-Awareness',
    essence: 'Spiritual Essence, Expansion',
    keywords: ['education', 'higher vision', 'path', 'expansion', 'transcendence'],
    archetype: 'The Pilgrim',
    practice: 'Seek or design a ritual of expansion',
    focusState: 'I Transcend',
    learningStyle: 'Visionary',
    keyQuestions: [
      'What is my higher calling?',
      'How can I expand beyond current limitations?'
    ]
  },

  // ========== WATER QUADRANT (3-6 o'clock) - Emotional/Psychic ==========
  {
    id: 'water-1',
    element: 'water',
    stage: 1,
    position: 6,
    angle: { start: 0, end: Math.PI/6 },
    color: {
      base: '#6B9BD1',
      glow: '#83B3E9',
      shadow: '#5383B9'
    },
    facet: 'Emotional Intelligence',
    essence: 'Capacity to feel seen, nurtured, and at home in the world',
    keywords: ['nurturance', 'belonging', 'empathy', 'safety', 'comfort'],
    archetype: 'The Nurturer',
    practice: 'Recall or create one moment today where you feel truly at home',
    focusState: 'I Feel',
    learningStyle: 'Empathic',
    keyQuestions: [
      'Where do I feel most at home?',
      'How do I nurture myself and others?'
    ]
  },
  {
    id: 'water-2',
    element: 'water',
    stage: 2,
    position: 7,
    angle: { start: Math.PI/6, end: Math.PI/3 },
    color: {
      base: '#5A89C0',
      glow: '#72A1D8',
      shadow: '#4271A8'
    },
    facet: 'Personal Inner Transformation',
    essence: 'Transforming outmoded subconscious patterns into redeemed, resonant patterns',
    keywords: ['healing', 'transformation', 'release', 'renewal', 'alchemy'],
    archetype: 'The Alchemist',
    practice: 'Name one outdated pattern today and choose a small action to transform it',
    focusState: 'I Transform',
    learningStyle: 'Transformative',
    keyQuestions: [
      'What patterns are ready for transformation?',
      'How can I alchemize pain into wisdom?'
    ]
  },
  {
    id: 'water-3',
    element: 'water',
    stage: 3,
    position: 8,
    angle: { start: Math.PI/3, end: Math.PI/2 },
    color: {
      base: '#4A77AE',
      glow: '#628FC6',
      shadow: '#325F96'
    },
    facet: 'Deep Internal Self-Awareness',
    essence: 'Connection with inner gold or soul, touching the deepest truth of being',
    keywords: ['soul', 'depth', 'alignment', 'inner gold', 'essence'],
    archetype: 'The Mystic',
    practice: 'Spend 5 minutes in still reflection on your inner essence — what feels most true beneath all roles?',
    focusState: 'I Am',
    learningStyle: 'Intuitive',
    keyQuestions: [
      'What is my soul\'s deepest truth?',
      'How do I connect with my inner gold?'
    ]
  },

  // ========== EARTH QUADRANT (6-9 o'clock) - Somatic/Embodied ==========
  {
    id: 'earth-1',
    element: 'earth',
    stage: 1,
    position: 11,
    angle: { start: 5*Math.PI/6, end: Math.PI },
    color: {
      base: '#7A9A65',
      glow: '#92B27D',
      shadow: '#628253'
    },
    facet: 'Purpose, Mission, and Service',
    essence: 'Awareness of one\'s place in the world and contribution to humanity and the planet',
    keywords: ['purpose', 'service', 'contribution', 'direction', 'calling'],
    archetype: 'The Steward',
    practice: 'Name one way you feel called to give back — however small — and act on it today',
    focusState: 'I Serve',
    learningStyle: 'Service-oriented',
    keyQuestions: [
      'What is my purpose in the larger whole?',
      'How can I serve life today?'
    ]
  },
  {
    id: 'earth-2',
    element: 'earth',
    stage: 2,
    position: 10,
    angle: { start: 2*Math.PI/3, end: 5*Math.PI/6 },
    color: {
      base: '#6B8B56',
      glow: '#83A36E',
      shadow: '#537344'
    },
    facet: 'Resources, Plans, and Outer Development',
    essence: 'Gathering resources, teams, and structures to support worldly success',
    keywords: ['resources', 'planning', 'structure', 'development', 'building'],
    archetype: 'The Builder',
    practice: 'List three resources or allies that could support your current path — and reach out to one',
    focusState: 'I Build',
    learningStyle: 'Pragmatic',
    keyQuestions: [
      'What resources do I need to gather?',
      'How can I build sustainable structures?'
    ]
  },
  {
    id: 'earth-3',
    element: 'earth',
    stage: 3,
    position: 9,
    angle: { start: Math.PI/2, end: 2*Math.PI/3 },
    color: {
      base: '#5C7C47',
      glow: '#74945F',
      shadow: '#446435'
    },
    facet: 'Well-Formed Plan of Action',
    essence: 'Refining a roadmap, code of conduct, and ethical medicine to offer the world',
    keywords: ['ethics', 'discipline', 'roadmap', 'medicine', 'mastery'],
    archetype: 'The Gardener',
    practice: 'Review one plan or commitment — add a refinement that makes it more ethical, clear, or aligned',
    focusState: 'I Master',
    learningStyle: 'Disciplined',
    keyQuestions: [
      'What is my ethical code?',
      'How can I refine my offering to the world?'
    ]
  }
];

// ========== AETHER DYNAMICS (Center/Transcendent) ==========
export const AETHER_DYNAMICS = {
  synthesis: {
    id: 'aether-synthesis',
    element: 'aether' as const,
    name: 'Synthesis',
    essence: 'Integration of all elements into unified wisdom',
    keywords: ['unity', 'wholeness', 'integration', 'emergence'],
    practice: 'Hold all four elements in awareness simultaneously',
    color: {
      base: '#9B59B6',
      glow: '#B77FC8',
      shadow: '#7F47A0'
    }
  },
  void: {
    id: 'aether-void',
    element: 'aether' as const,
    name: 'The Void',
    essence: 'Pure potential before manifestation',
    keywords: ['emptiness', 'potential', 'silence', 'source'],
    practice: 'Rest in the space between thoughts',
    color: {
      base: '#2C3E50',
      glow: '#34495E',
      shadow: '#1A252F'
    }
  },
  transcendence: {
    id: 'aether-transcendence',
    element: 'aether' as const,
    name: 'Transcendence',
    essence: 'Rising above duality into non-dual awareness',
    keywords: ['liberation', 'freedom', 'awakening', 'presence'],
    practice: 'Witness all experience without attachment',
    color: {
      base: '#ECF0F1',
      glow: '#FFFFFF',
      shadow: '#BDC3C7'
    }
  }
};

// ========== HELPER FUNCTIONS ==========

export function getFacetById(id: string): SpiralogicFacet | typeof AETHER_DYNAMICS[keyof typeof AETHER_DYNAMICS] | null {
  // Check regular facets
  const facet = SPIRALOGIC_FACETS_COMPLETE.find(f => f.id === id);
  if (facet) return facet;
  
  // Check aether dynamics
  const aetherKeys = Object.keys(AETHER_DYNAMICS) as Array<keyof typeof AETHER_DYNAMICS>;
  for (const key of aetherKeys) {
    if (AETHER_DYNAMICS[key].id === id) {
      return AETHER_DYNAMICS[key];
    }
  }
  
  return null;
}

export function getFacetByElementStage(element: string, stage: number): SpiralogicFacet | null {
  return SPIRALOGIC_FACETS_COMPLETE.find(f => f.element === element && f.stage === stage) || null;
}

export function getElementFacets(element: 'fire' | 'water' | 'earth' | 'air'): SpiralogicFacet[] {
  return SPIRALOGIC_FACETS_COMPLETE.filter(f => f.element === element);
}

export function calculateElementalBalance(activeFacetIds: string[]): Record<string, number> {
  const balance = { fire: 0, water: 0, earth: 0, air: 0, aether: 0 };
  const counts = { fire: 0, water: 0, earth: 0, air: 0, aether: 0 };
  
  activeFacetIds.forEach(id => {
    const facet = getFacetById(id);
    if (facet && 'element' in facet) {
      counts[facet.element]++;
    }
  });
  
  const total = Object.values(counts).reduce((sum, c) => sum + c, 0);
  
  if (total > 0) {
    Object.keys(balance).forEach(element => {
      balance[element as keyof typeof balance] = counts[element as keyof typeof counts] / total;
    });
  } else {
    // Default equal distribution
    Object.keys(balance).forEach(element => {
      balance[element as keyof typeof balance] = 0.2;
    });
  }
  
  return balance;
}

export function getJourneyNarrative(facetSequence: string[]): string {
  if (facetSequence.length === 0) return 'Journey not yet begun';
  if (facetSequence.length === 1) return 'Beginning the spiral';
  
  const elements = facetSequence.map(id => {
    const facet = getFacetById(id);
    return facet && 'element' in facet ? facet.element : 'unknown';
  });
  
  const uniqueElements = [...new Set(elements)];
  
  if (uniqueElements.length === 1) {
    return `Deepening in ${uniqueElements[0]}`;
  } else if (uniqueElements.length === 4) {
    return 'Complete elemental cycle';
  } else {
    return `Journeying from ${elements[0]} to ${elements[elements.length - 1]}`;
  }
}

// Export for backward compatibility
export const SPIRALOGIC_FACETS = SPIRALOGIC_FACETS_COMPLETE;