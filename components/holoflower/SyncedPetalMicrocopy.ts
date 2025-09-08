// SyncedPetalMicrocopy.ts - Synced with spiralogic-facets-complete.ts
import { SPIRALOGIC_FACETS_COMPLETE, SpiralogicFacet } from '@/data/spiralogic-facets-complete';

// Extract authentic microcopy from the existing facet data
export interface PetalMicrocopy {
  id: string;
  element: 'fire' | 'water' | 'earth' | 'air';
  stage: 1 | 2 | 3;
  
  // From spiralogic-facets-complete.ts
  facetName: string;      // The formal facet name
  essence: string;        // Core meaning
  archetype: string;      // Mythic figure
  practice: string;       // Daily micro-practice
  focusState: string;     // "I Experience", "I Transform", etc.
  
  // Simplified for beta quadrant mode
  quadrantGuide: string;  // Grouped guidance for 4-petal mode
  
  // Progressive revelation levels
  beginner: string;       // Session 1-3: Simple, felt
  intermediate: string;   // Session 4-8: Pattern recognition
  advanced: string;       // Session 9+: Full archetypal depth
  
  // Context-sensitive variations
  variations: {
    morning: string;      // Dawn check-in
    evening: string;      // Reflection time
    shadow: string;       // When this facet is withdrawn/blocked
    radiant: string;      // When this facet is highly activated
  };
}

// Generate microcopy from existing authentic facet data
export const SYNCED_PETAL_MICROCOPY: PetalMicrocopy[] = SPIRALOGIC_FACETS_COMPLETE.map(facet => ({
  id: facet.id,
  element: facet.element as 'fire' | 'water' | 'earth' | 'air',
  stage: facet.stage,
  
  // Use authentic data from spiralogic-facets-complete.ts
  facetName: facet.facet,
  essence: facet.essence,
  archetype: facet.archetype,
  practice: facet.practice,
  focusState: facet.focusState || `I ${facet.archetype}`,
  
  // Generate quadrant guidance (for beta 4-petal mode)
  quadrantGuide: generateQuadrantGuide(facet),
  
  // Progressive revelation levels
  beginner: generateBeginnerCopy(facet),
  intermediate: generateIntermediateCopy(facet), 
  advanced: generateAdvancedCopy(facet),
  
  // Context variations
  variations: {
    morning: generateMorningCopy(facet),
    evening: generateEveningCopy(facet),
    shadow: generateShadowCopy(facet),
    radiant: generateRadiantCopy(facet)
  }
}));

// Helper functions to generate contextual microcopy
function generateQuadrantGuide(facet: SpiralogicFacet): string {
  const quadrantMappings = {
    fire: 'Your spark of self-awareness, the light of who you are',
    water: 'Your heart\'s care, how you hold and are held by others', 
    earth: 'Your grounding and service, how you build and tend the world',
    air: 'Your mind and connections, how you relate and communicate'
  };
  return quadrantMappings[facet.element as keyof typeof quadrantMappings];
}

function generateBeginnerCopy(facet: SpiralogicFacet): string {
  // Simple, felt-based guidance
  const beginnerTemplates = {
    fire: `Your inner fire feels ${facet.keywords[0]} today`,
    water: `Your emotional flow is ${facet.keywords[0]} right now`, 
    earth: `Your grounding energy feels ${facet.keywords[0]}`,
    air: `Your mental clarity is ${facet.keywords[0]} today`
  };
  return beginnerTemplates[facet.element as keyof typeof beginnerTemplates];
}

function generateIntermediateCopy(facet: SpiralogicFacet): string {
  // Pattern recognition level
  return `${facet.archetype} energy: ${facet.essence.split('.')[0]}`;
}

function generateAdvancedCopy(facet: SpiralogicFacet): string {
  // Full archetypal depth - use authentic facet name
  return `${facet.facet}: ${facet.essence}`;
}

function generateMorningCopy(facet: SpiralogicFacet): string {
  return `How does your ${facet.archetype.toLowerCase()} energy feel as the day begins?`;
}

function generateEveningCopy(facet: SpiralogicFacet): string {
  return `Reflecting on your ${facet.archetype.toLowerCase()} journey today...`;
}

function generateShadowCopy(facet: SpiralogicFacet): string {
  // When this facet is withdrawn or blocked
  const shadowTemplates = {
    fire: 'Your inner flame feels dimmed',
    water: 'Your emotional waters feel stagnant',
    earth: 'Your grounding feels unstable', 
    air: 'Your mental clarity feels clouded'
  };
  return shadowTemplates[facet.element as keyof typeof shadowTemplates];
}

function generateRadiantCopy(facet: SpiralogicFacet): string {
  // When this facet is highly activated
  const radiantTemplates = {
    fire: 'Your inner flame burns bright and clear',
    water: 'Your emotional waters flow with grace',
    earth: 'Your grounding feels solid and nourishing',
    air: 'Your mental clarity sparkles with insight'
  };
  return radiantTemplates[facet.element as keyof typeof radiantTemplates];
}

// Quadrant-level microcopy for beta 4-petal mode
export const QUADRANT_MICROCOPY = {
  fire: {
    archetype: 'The Visionary',
    essence: 'Vision, self-awareness, creative spark',
    facets: ['Self-Awareness', 'Self-in-World Expression', 'Transcendent Vision'],
    microguideLevels: {
      beginner: 'Your spark of self-awareness, the light of who you are',
      intermediate: 'The Visionary within you - how bright does your inner fire burn?',
      advanced: 'Fire Triad: Self-Awareness → Expression → Transcendence'
    },
    practice: SPIRALOGIC_FACETS_COMPLETE.find(f => f.id === 'fire-1')?.practice || 'Daily journaling of inner impulses'
  },
  
  water: {
    archetype: 'The Healer', 
    essence: 'Emotion, transformation, deep self-awareness',
    facets: ['Emotional Intelligence', 'Inner Transformation', 'Deep Self-Awareness'],
    microguideLevels: {
      beginner: 'Your heart\'s care, how you hold and are held by others',
      intermediate: 'The Healer within you - how do your waters flow today?', 
      advanced: 'Water Triad: Feeling → Transforming → Being'
    },
    practice: SPIRALOGIC_FACETS_COMPLETE.find(f => f.id === 'water-1')?.practice || 'Recall or create one moment where you feel truly at home'
  },
  
  earth: {
    archetype: 'The Builder',
    essence: 'Grounding, manifestation, service',
    facets: ['Purpose & Service', 'Resources & Planning', 'Mastery & Action'], 
    microguideLevels: {
      beginner: 'Your grounding and service, how you build and tend the world',
      intermediate: 'The Builder within you - how solid is your foundation today?',
      advanced: 'Earth Triad: Purpose → Resources → Mastery'
    },
    practice: SPIRALOGIC_FACETS_COMPLETE.find(f => f.id === 'earth-1')?.practice || 'Name one way you feel called to give back'
  },
  
  air: {
    archetype: 'The Sage',
    essence: 'Mind, communication, relationship',
    facets: ['Relationship Patterns', 'Collective Dynamics', 'Systems & Communication'],
    microguideLevels: {
      beginner: 'Your mind and connections, how you relate and communicate',
      intermediate: 'The Sage within you - how clear is your understanding today?', 
      advanced: 'Air Triad: Relating → Collaborating → Synthesizing'
    },
    practice: SPIRALOGIC_FACETS_COMPLETE.find(f => f.id === 'air-1')?.practice || 'Notice one relationship today — offer presence without agenda'
  }
};

// Utility functions for getting contextual microcopy
export class MicrocopyManager {
  
  static getContextualCopy(
    facetId: string, 
    userLevel: 'beginner' | 'intermediate' | 'advanced',
    context?: 'morning' | 'evening' | 'shadow' | 'radiant'
  ): string {
    const facetCopy = SYNCED_PETAL_MICROCOPY.find(f => f.id === facetId);
    if (!facetCopy) return 'Touch to feel this energy';
    
    if (context && context !== 'morning' && context !== 'evening') {
      return facetCopy.variations[context];
    }
    
    if (context === 'morning') return facetCopy.variations.morning;
    if (context === 'evening') return facetCopy.variations.evening;
    
    return facetCopy[userLevel];
  }
  
  static getQuadrantCopy(
    element: 'fire' | 'water' | 'earth' | 'air',
    userLevel: 'beginner' | 'intermediate' | 'advanced'
  ): string {
    return QUADRANT_MICROCOPY[element].microguideLevels[userLevel];
  }
  
  static getFacetPractice(facetId: string): string {
    const facet = SPIRALOGIC_FACETS_COMPLETE.find(f => f.id === facetId);
    return facet?.practice || 'Breathe into this energy';
  }
  
  static getArchetypeForElement(element: 'fire' | 'water' | 'earth' | 'air'): string {
    return QUADRANT_MICROCOPY[element].archetype;
  }
}