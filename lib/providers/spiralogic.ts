// Spiralogic Integration - Archetype and Soul Phase Detection
// Soft bias system for element weighting and phenomenological insights

import { readFileSync } from 'fs';
import { join } from 'path';

interface ArchetypePattern {
  description: string;
  elemental_affinity: string[];
  soul_phases: string[];
  keywords: string[];
  shadow_aspects: string[];
  phenomenological_language: string[];
  reflection_triggers: string[];
}

interface SoulPhase {
  description: string;
  elemental_correspondence: string;
  archetypal_resonance: string[];
  keywords: string[];
  phenomenological_markers: string[];
  reflection_language: string[];
  typical_duration: string;
  common_challenges: string[];
}

interface PlanetaryInfluence {
  primary_element: string;
  secondary_element: string;
  archetypal_energy: string;
  soul_phase_affinity: string[];
  phenomenological_language: string[];
}

interface SpiralogicAnalysis {
  archetypes: Array<{
    name: string;
    confidence: number;
    elemental_bias: Record<string, number>;
  }>;
  soul_phase: {
    name: string;
    confidence: number;
    elemental_correspondence: string;
  } | null;
  elemental_adjustments: Record<string, number>;
  phenomenological_reflection?: string;
}

class SpiralogicKnowledge {
  private archetypes: Record<string, ArchetypePattern> = {};
  private soulPhases: Record<string, SoulPhase> = {};
  private planetaryMap: Record<string, PlanetaryInfluence> = {};
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      const dataDir = join(process.cwd(), 'data', 'spiralogic');
      
      // Load archetype patterns
      const archetypesData = JSON.parse(
        readFileSync(join(dataDir, 'archetypes.json'), 'utf-8')
      );
      this.archetypes = archetypesData.archetypal_patterns;

      // Load soul phases
      const phasesData = JSON.parse(
        readFileSync(join(dataDir, 'soul_path_phases.json'), 'utf-8')
      );
      this.soulPhases = phasesData.soul_phases;

      // Load planetary map
      const planetaryData = JSON.parse(
        readFileSync(join(dataDir, 'planetary_elemental_map.json'), 'utf-8')
      );
      this.planetaryMap = planetaryData.planetary_influences;

      this.initialized = true;
    } catch (error) {
      console.warn('Spiralogic knowledge files not found, using defaults:', error);
      this.initialized = true; // Continue with empty defaults
    }
  }

  // Archetype detection using keyword matching and semantic analysis
  detectArchetypes(text: string): Array<{ name: string; confidence: number; elemental_bias: Record<string, number> }> {
    const results: Array<{ name: string; confidence: number; elemental_bias: Record<string, number> }> = [];
    const lowercaseText = text.toLowerCase();
    
    for (const [archetypeName, pattern] of Object.entries(this.archetypes)) {
      let score = 0;
      let keywordMatches = 0;

      // Keyword matching (primary heuristic)
      for (const keyword of pattern.keywords) {
        if (lowercaseText.includes(keyword.toLowerCase())) {
          keywordMatches++;
          score += 0.4; // Weight from JSON detection_heuristics
        }
      }

      // Reflection trigger matching
      for (const trigger of pattern.reflection_triggers) {
        if (lowercaseText.includes(trigger.toLowerCase())) {
          score += 0.2;
        }
      }

      // Normalize score based on text length and keyword density
      const confidence = Math.min(score / Math.max(1, pattern.keywords.length * 0.3), 1.0);
      
      if (confidence >= 0.6) { // confidence_threshold from JSON
        // Calculate elemental bias
        const elementalBias: Record<string, number> = {};
        for (const element of pattern.elemental_affinity) {
          elementalBias[element] = 0.1; // bias_weight from JSON
        }

        results.push({
          name: archetypeName,
          confidence,
          elemental_bias: elementalBias
        });
      }
    }

    // Sort by confidence and limit to max_active_archetypes
    return results
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 2); // max_active_archetypes from JSON
  }

  // Soul phase detection using linguistic markers and emotional tone
  detectSoulPhase(text: string): { name: string; confidence: number; elemental_correspondence: string } | null {
    const lowercaseText = text.toLowerCase();
    let bestMatch: { name: string; confidence: number; elemental_correspondence: string } | null = null;
    let highestScore = 0;

    for (const [phaseName, phase] of Object.entries(this.soulPhases)) {
      let score = 0;

      // Keyword matching
      for (const keyword of phase.keywords) {
        if (lowercaseText.includes(keyword.toLowerCase())) {
          score += 0.4; // linguistic_markers weight
        }
      }

      // Phenomenological marker matching
      for (const marker of phase.phenomenological_markers) {
        const markerWords = marker.toLowerCase().split(' ');
        const matchingWords = markerWords.filter(word => lowercaseText.includes(word));
        if (matchingWords.length >= Math.ceil(markerWords.length * 0.6)) {
          score += 0.3; // emotional_tone weight
        }
      }

      const confidence = Math.min(score / Math.max(1, phase.keywords.length * 0.2), 1.0);
      
      if (confidence > highestScore && confidence >= 0.7) {
        highestScore = confidence;
        bestMatch = {
          name: phaseName,
          confidence,
          elemental_correspondence: phase.elemental_correspondence
        };
      }
    }

    return bestMatch;
  }

  // Generate phenomenological reflection based on detected patterns
  generateReflection(archetypes: Array<{ name: string; confidence: number }>, soulPhase: { name: string; confidence: number } | null): string | undefined {
    if (archetypes.length === 0 && !soulPhase) return undefined;

    // Prefer archetype reflection if confidence is high
    if (archetypes.length > 0 && archetypes[0].confidence >= 0.7) {
      const archetype = this.archetypes[archetypes[0].name];
      if (archetype?.phenomenological_language) {
        const reflections = archetype.phenomenological_language;
        return reflections[Math.floor(Math.random() * reflections.length)];
      }
    }

    // Fall back to soul phase reflection
    if (soulPhase && soulPhase.confidence >= 0.7) {
      const phase = this.soulPhases[soulPhase.name];
      if (phase?.reflection_language) {
        const reflections = phase.reflection_language;
        return reflections[Math.floor(Math.random() * reflections.length)];
      }
    }

    return undefined;
  }

  // Calculate elemental adjustments based on detected patterns
  calculateElementalAdjustments(archetypes: Array<{ name: string; elemental_bias: Record<string, number> }>, soulPhase: { elemental_correspondence: string } | null): Record<string, number> {
    const adjustments: Record<string, number> = {
      fire: 0,
      water: 0,
      air: 0,
      earth: 0,
      aether: 0
    };

    // Apply archetype biases
    for (const archetype of archetypes) {
      for (const [element, bias] of Object.entries(archetype.elemental_bias)) {
        adjustments[element] += bias;
      }
    }

    // Apply soul phase bias
    if (soulPhase) {
      adjustments[soulPhase.elemental_correspondence] += 0.1;
    }

    return adjustments;
  }
}

// Singleton instance
const spiralogicKnowledge = new SpiralogicKnowledge();

// Main analysis function called by Sesame NLU
export async function analyzeSpiralogicPatterns(text: string): Promise<SpiralogicAnalysis> {
  await spiralogicKnowledge.initialize();

  try {
    // Detect archetypes and soul phase
    const archetypes = spiralogicKnowledge.detectArchetypes(text);
    const soulPhase = spiralogicKnowledge.detectSoulPhase(text);

    // Calculate elemental adjustments
    const elementalAdjustments = spiralogicKnowledge.calculateElementalAdjustments(archetypes, soulPhase);

    // Generate phenomenological reflection
    const phenomenologicalReflection = spiralogicKnowledge.generateReflection(archetypes, soulPhase);

    return {
      archetypes,
      soul_phase: soulPhase,
      elemental_adjustments: elementalAdjustments,
      phenomenological_reflection
    };

  } catch (error) {
    console.warn('Spiralogic analysis failed, returning defaults:', error);
    return {
      archetypes: [],
      soul_phase: null,
      elemental_adjustments: { fire: 0, water: 0, air: 0, earth: 0, aether: 0 },
    };
  }
}

// Archetype heuristics for Sesame integration
export async function archetypeHeuristics(text: string): Promise<{
  candidates: string[];
  elementalBias: Record<string, number>;
  confidence: number;
}> {
  const analysis = await analyzeSpiralogicPatterns(text);
  
  return {
    candidates: analysis.archetypes.map(a => a.name),
    elementalBias: analysis.elemental_adjustments,
    confidence: analysis.archetypes[0]?.confidence || 0
  };
}