// Spiralogic Facets - 12 Petal Definitions
// Preserving exact color values and sacred geometry

export interface SpiralogicFacet {
  id: string;
  element: 'fire' | 'water' | 'earth' | 'air';
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
  essence: string;
  keywords: string[];
  archetype: string;
  practice: string;
}

export const SPIRALOGIC_FACETS: SpiralogicFacet[] = [
  // AIR QUADRANT (9-12 o'clock) - Yellow/Gold tones
  {
    id: 'air-3',
    element: 'air',
    stage: 3,
    position: 0,
    angle: { start: -Math.PI, end: -5*Math.PI/6 },
    color: {
      base: '#B69A78',  // Deep gold
      glow: '#D4B896',  // Light gold
      shadow: '#9A8062'
    },
    essence: 'Integration of Vision',
    keywords: ['synthesis', 'perspective', 'wisdom', 'overview'],
    archetype: 'The Sage overlooking the valley',
    practice: 'Step back and see the whole pattern'
  },
  {
    id: 'air-2',
    element: 'air',
    stage: 2,
    position: 1,
    angle: { start: -5*Math.PI/6, end: -2*Math.PI/3 },
    color: {
      base: '#C5A987',  // Medium gold
      glow: '#E0C4A2',
      shadow: '#A89070'
    },
    essence: 'Deepening Understanding',
    keywords: ['analysis', 'connection', 'pattern', 'clarity'],
    archetype: 'The Scholar connecting threads',
    practice: 'Map the relationships between ideas'
  },
  {
    id: 'air-1',
    element: 'air',
    stage: 1,
    position: 2,
    angle: { start: -2*Math.PI/3, end: -Math.PI/2 },
    color: {
      base: '#D4B896',  // Light gold
      glow: '#F0D4B2',
      shadow: '#B89A7A'
    },
    essence: 'Recognition of Pattern',
    keywords: ['awareness', 'observation', 'curiosity', 'questioning'],
    archetype: 'The Student noticing',
    practice: 'Ask: What am I seeing here?'
  },

  // FIRE QUADRANT (12-3 o'clock) - Red/Orange tones
  {
    id: 'fire-1',
    element: 'fire',
    stage: 1,
    position: 3,
    angle: { start: -Math.PI/2, end: -Math.PI/3 },
    color: {
      base: '#C85450',  // Light coral red
      glow: '#E06B67',
      shadow: '#A84440'
    },
    essence: 'Spark of Purpose',
    keywords: ['ignition', 'calling', 'desire', 'initial impulse'],
    archetype: 'The Seeker finding direction',
    practice: 'Name what calls to you'
  },
  {
    id: 'fire-2',
    element: 'fire',
    stage: 2,
    position: 4,
    angle: { start: -Math.PI/3, end: -Math.PI/6 },
    color: {
      base: '#B8524E',  // Medium red
      glow: '#D06966',
      shadow: '#984240'
    },
    essence: 'Building Momentum',
    keywords: ['action', 'courage', 'commitment', 'energy'],
    archetype: 'The Warrior in motion',
    practice: 'Take one bold step forward'
  },
  {
    id: 'fire-3',
    element: 'fire',
    stage: 3,
    position: 5,
    angle: { start: -Math.PI/6, end: 0 },
    color: {
      base: '#A84E4A',  // Deep red
      glow: '#C06562',
      shadow: '#883E3A'
    },
    essence: 'Mastery of Will',
    keywords: ['leadership', 'transformation', 'achievement', 'impact'],
    archetype: 'The Creator manifesting',
    practice: 'Complete what you started'
  },

  // WATER QUADRANT (3-6 o'clock) - Blue tones
  {
    id: 'water-1',
    element: 'water',
    stage: 1,
    position: 6,
    angle: { start: 0, end: Math.PI/6 },
    color: {
      base: '#6B9BD1',  // Light blue
      glow: '#83B3E9',
      shadow: '#5383B9'
    },
    essence: 'Opening to Feeling',
    keywords: ['receptivity', 'emotion', 'sensitivity', 'flow'],
    archetype: 'The Listener at the shore',
    practice: 'Let yourself feel without judgment'
  },
  {
    id: 'water-2',
    element: 'water',
    stage: 2,
    position: 7,
    angle: { start: Math.PI/6, end: Math.PI/3 },
    color: {
      base: '#5A89C0',  // Medium blue
      glow: '#72A1D8',
      shadow: '#4271A8'
    },
    essence: 'Navigating Depths',
    keywords: ['intuition', 'dreams', 'unconscious', 'mystery'],
    archetype: 'The Diver in deep waters',
    practice: 'Follow your intuitive thread'
  },
  {
    id: 'water-3',
    element: 'water',
    stage: 3,
    position: 8,
    angle: { start: Math.PI/3, end: Math.PI/2 },
    color: {
      base: '#4A77AE',  // Deep blue
      glow: '#628FC6',
      shadow: '#325F96'
    },
    essence: 'Emotional Wisdom',
    keywords: ['compassion', 'empathy', 'healing', 'connection'],
    archetype: 'The Healer holding space',
    practice: 'Offer your presence fully'
  },

  // EARTH QUADRANT (6-9 o'clock) - Green tones
  {
    id: 'earth-3',
    element: 'earth',
    stage: 3,
    position: 9,
    angle: { start: Math.PI/2, end: 2*Math.PI/3 },
    color: {
      base: '#5C7C47',  // Deep green
      glow: '#74945F',
      shadow: '#446435'
    },
    essence: 'Rooted Mastery',
    keywords: ['stability', 'abundance', 'harvest', 'legacy'],
    archetype: 'The Elder Tree bearing fruit',
    practice: 'Share your harvest generously'
  },
  {
    id: 'earth-2',
    element: 'earth',
    stage: 2,
    position: 10,
    angle: { start: 2*Math.PI/3, end: 5*Math.PI/6 },
    color: {
      base: '#6B8B56',  // Medium green
      glow: '#83A36E',
      shadow: '#537344'
    },
    essence: 'Cultivating Ground',
    keywords: ['patience', 'nurture', 'growth', 'consistency'],
    archetype: 'The Gardener tending',
    practice: 'Tend one thing with daily care'
  },
  {
    id: 'earth-1',
    element: 'earth',
    stage: 1,
    position: 11,
    angle: { start: 5*Math.PI/6, end: Math.PI },
    color: {
      base: '#7A9A65',  // Light green
      glow: '#92B27D',
      shadow: '#628253'
    },
    essence: 'Finding Foundation',
    keywords: ['grounding', 'presence', 'body', 'reality'],
    archetype: 'The Builder laying stones',
    practice: 'Feel your feet on the earth'
  }
];

// Helper functions for facet navigation

export function getFacetByPosition(position: number): SpiralogicFacet {
  return SPIRALOGIC_FACETS.find(f => f.position === position) || SPIRALOGIC_FACETS[0];
}

export function getFacetById(id: string): SpiralogicFacet {
  return SPIRALOGIC_FACETS.find(f => f.id === id) || SPIRALOGIC_FACETS[0];
}

export function getFacetByElementStage(element: string, stage: number): SpiralogicFacet {
  return SPIRALOGIC_FACETS.find(f => f.element === element && f.stage === stage) || SPIRALOGIC_FACETS[0];
}

export function getNextFacet(currentId: string): SpiralogicFacet {
  const current = getFacetById(currentId);
  const nextPosition = (current.position + 1) % 12;
  return getFacetByPosition(nextPosition);
}

export function getPreviousFacet(currentId: string): SpiralogicFacet {
  const current = getFacetById(currentId);
  const prevPosition = current.position === 0 ? 11 : current.position - 1;
  return getFacetByPosition(prevPosition);
}

// Get all facets for an element
export function getFacetsByElement(element: string): SpiralogicFacet[] {
  return SPIRALOGIC_FACETS.filter(f => f.element === element);
}

// Calculate journey progression
export function calculateJourneyArc(facetIds: string[]): string {
  if (facetIds.length < 2) return 'Beginning';
  
  const facets = facetIds.map(id => getFacetById(id));
  const elements = facets.map(f => f.element);
  const uniqueElements = [...new Set(elements)];
  
  if (uniqueElements.length === 1) {
    return `Deepening in ${uniqueElements[0]}`;
  } else if (uniqueElements.length === 4) {
    return 'Full elemental cycle';
  } else {
    return `${elements[0]} → ${elements[elements.length - 1]}`;
  }
}