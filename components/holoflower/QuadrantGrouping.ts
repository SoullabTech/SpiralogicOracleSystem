// QuadrantGrouping.ts - Maps 12 authentic facets into 4 visual quadrants for beta
import { SPIRALOGIC_FACETS_COMPLETE, SpiralogicFacet } from '@/data/spiralogic-facets-complete';

export interface QuadrantGroup {
  element: 'fire' | 'water' | 'earth' | 'air';
  archetype: string;
  facets: SpiralogicFacet[];
  position: {
    angle: number; // degrees from 12 o'clock
    quadrant: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
  };
  visualPetal: {
    primaryColor: string;
    glowColor: string;
    shadowColor: string;
  };
  microGuide: string;
  averageIntensity: number; // calculated from constituent facets
}

// Group the 12 authentic facets into 4 visual quadrants
export const QUADRANT_GROUPS: QuadrantGroup[] = [
  // FIRE QUADRANT (12-3 o'clock) - Vision/Leadership
  {
    element: 'fire',
    archetype: 'The Visionary',
    facets: [
      SPIRALOGIC_FACETS_COMPLETE.find(f => f.id === 'fire-1')!, // Self-Awareness
      SPIRALOGIC_FACETS_COMPLETE.find(f => f.id === 'fire-2')!, // Expression  
      SPIRALOGIC_FACETS_COMPLETE.find(f => f.id === 'fire-3')!  // Transcendence
    ],
    position: {
      angle: 45, // 1:30 position
      quadrant: 'top-right'
    },
    visualPetal: {
      primaryColor: '#C85450', // Sacred Sienna
      glowColor: '#E06B67',    // Ember Glow
      shadowColor: '#A84440'   // Deep Fire
    },
    microGuide: 'Your spark of self-awareness, the light of who you are',
    averageIntensity: 50 // Will be calculated dynamically
  },

  // WATER QUADRANT (3-6 o'clock) - Emotion/Flow
  {
    element: 'water',
    archetype: 'The Healer',
    facets: [
      SPIRALOGIC_FACETS_COMPLETE.find(f => f.id === 'water-1')!, // Emotional Intelligence
      SPIRALOGIC_FACETS_COMPLETE.find(f => f.id === 'water-2')!, // Transformation
      SPIRALOGIC_FACETS_COMPLETE.find(f => f.id === 'water-3')!  // Deep Self-Awareness
    ],
    position: {
      angle: 135, // 4:30 position  
      quadrant: 'bottom-right'
    },
    visualPetal: {
      primaryColor: '#6B9BD1', // Sacred Blue
      glowColor: '#83B3E9',    // Flow Light
      shadowColor: '#5383B9'   // Deep Ocean
    },
    microGuide: 'Your heart\'s care, how you hold and are held by others',
    averageIntensity: 50
  },

  // EARTH QUADRANT (6-9 o'clock) - Grounding/Manifestation
  {
    element: 'earth',
    archetype: 'The Builder',
    facets: [
      SPIRALOGIC_FACETS_COMPLETE.find(f => f.id === 'earth-1')!, // Purpose/Service
      SPIRALOGIC_FACETS_COMPLETE.find(f => f.id === 'earth-2')!, // Resources/Planning
      SPIRALOGIC_FACETS_COMPLETE.find(f => f.id === 'earth-3')!  // Mastery/Action
    ],
    position: {
      angle: 225, // 7:30 position
      quadrant: 'bottom-left'
    },
    visualPetal: {
      primaryColor: '#7A9A65', // Sacred Sage
      glowColor: '#92B27D',    // Living Green
      shadowColor: '#628253'   // Deep Root
    },
    microGuide: 'Your grounding and service, how you build and tend the world',
    averageIntensity: 50
  },

  // AIR QUADRANT (9-12 o'clock) - Mind/Connection
  {
    element: 'air',
    archetype: 'The Sage',
    facets: [
      SPIRALOGIC_FACETS_COMPLETE.find(f => f.id === 'air-1')!, // Relationships
      SPIRALOGIC_FACETS_COMPLETE.find(f => f.id === 'air-2')!, // Collaboration
      SPIRALOGIC_FACETS_COMPLETE.find(f => f.id === 'air-3')!  // Systems/Communication
    ],
    position: {
      angle: 315, // 10:30 position
      quadrant: 'top-left'
    },
    visualPetal: {
      primaryColor: '#D4B896', // Sacred Tan
      glowColor: '#F0D4B2',    // Light Breath
      shadowColor: '#B89A7A'   // Deep Air
    },
    microGuide: 'Your mind and connections, how you relate and communicate',
    averageIntensity: 50
  }
];

// Utility functions for working with quadrants
export class QuadrantManager {
  
  static calculateQuadrantIntensity(quadrant: QuadrantGroup, facetIntensities: Record<string, number>): number {
    const intensities = quadrant.facets.map(facet => facetIntensities[facet.id] || 50);
    return Math.round(intensities.reduce((sum, intensity) => sum + intensity, 0) / intensities.length);
  }

  static updateQuadrantFromFacets(quadrant: QuadrantGroup, facetIntensities: Record<string, number>): QuadrantGroup {
    return {
      ...quadrant,
      averageIntensity: this.calculateQuadrantIntensity(quadrant, facetIntensities)
    };
  }

  static expandQuadrantToFacets(quadrant: QuadrantGroup): SpiralogicFacet[] {
    return quadrant.facets;
  }

  static getQuadrantByElement(element: 'fire' | 'water' | 'earth' | 'air'): QuadrantGroup {
    return QUADRANT_GROUPS.find(q => q.element === element)!;
  }

  static getDominantQuadrant(quadrants: QuadrantGroup[]): QuadrantGroup {
    return quadrants.reduce((prev, current) => 
      current.averageIntensity > prev.averageIntensity ? current : prev
    );
  }

  // Convert quadrant intensities back to individual facet data for Oracle insights
  static distributeQuadrantIntensity(quadrant: QuadrantGroup, quadrantIntensity: number): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    // For beta: distribute evenly across facets, with slight variation
    quadrant.facets.forEach((facet, index) => {
      const variation = (Math.random() - 0.5) * 20; // ±10 point variation
      distribution[facet.id] = Math.max(0, Math.min(100, quadrantIntensity + variation));
    });
    
    return distribution;
  }
}

// Beta launch interface data
export interface BetaSoulprint {
  userId: string;
  timestamp: Date;
  mode: 'quadrant'; // vs 'facet' for advanced users
  quadrants: {
    fire: number;
    water: number; 
    earth: number;
    air: number;
  };
  dominantElement: 'fire' | 'water' | 'earth' | 'air';
  balanceScore: number; // 0-100 based on quadrant harmony
  oracleInsight: string;
}

export const createBetaSoulprint = (
  userId: string, 
  quadrantIntensities: Record<string, number>
): BetaSoulprint => {
  const quadrants = {
    fire: quadrantIntensities.fire || 50,
    water: quadrantIntensities.water || 50,
    earth: quadrantIntensities.earth || 50,
    air: quadrantIntensities.air || 50
  };

  // Calculate balance (how evenly distributed the energies are)
  const values = Object.values(quadrants);
  const average = values.reduce((sum, val) => sum + val, 0) / 4;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / 4;
  const balanceScore = Math.max(0, 100 - Math.sqrt(variance));

  // Find dominant element
  const dominantElement = Object.entries(quadrants).reduce((prev, current) => 
    current[1] > prev[1] ? current : prev
  )[0] as 'fire' | 'water' | 'earth' | 'air';

  return {
    userId,
    timestamp: new Date(),
    mode: 'quadrant',
    quadrants,
    dominantElement,
    balanceScore,
    oracleInsight: '' // To be filled by Oracle agent
  };
};