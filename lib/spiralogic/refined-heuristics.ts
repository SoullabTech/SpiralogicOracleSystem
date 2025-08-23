// Refined Spiralogic Heuristics - Enhanced archetype detection and elemental routing
// Uses the new archetypal_recognition.json and elemental_routing.json seeds

import { archetypeRecognition, elementalRouting } from "./knowledge";

export interface ArchetypeMatch {
  id: string;
  name: string;
  confidence: number;
  elemental_bias: Record<string, number>;
  micro_reflections: string[];
  invites: string[];
}

export interface ElementalAdjustment {
  elements: Record<string, number>;
  source: 'archetype' | 'soul_phase' | 'intent_hint';
  confidence: number;
}

// Enhanced archetype detection using phenomenological patterns
export function detectArchetypesRefined(text: string): ArchetypeMatch[] {
  try {
    const { archetypes, soft_bias_scalar } = archetypeRecognition();
    const lowercaseText = text.toLowerCase();
    const results: ArchetypeMatch[] = [];

    for (const archetype of archetypes) {
      let score = 0;
      let matchCount = 0;

      // Primary signal matching
      for (const signal of archetype.signals) {
        if (lowercaseText.includes(signal.toLowerCase())) {
          score += 0.4;
          matchCount++;
        }
      }

      // Phenomenological pattern matching (more nuanced)
      for (const phenomenon of archetype.phenomenology) {
        const phenomenonWords = phenomenon.toLowerCase().split(' ');
        const matchingWords = phenomenonWords.filter(word => 
          lowercaseText.includes(word) && word.length > 3
        );
        if (matchingWords.length >= Math.ceil(phenomenonWords.length * 0.6)) {
          score += 0.3;
          matchCount++;
        }
      }

      // Calculate confidence based on signal density and text length
      const confidence = Math.min(score / Math.max(1, archetype.signals.length * 0.2), 1.0);
      
      if (confidence >= 0.6 && matchCount > 0) {
        results.push({
          id: archetype.id,
          name: archetype.name,
          confidence,
          elemental_bias: archetype.elemental_bias,
          micro_reflections: archetype.micro_reflections,
          invites: archetype.invites
        });
      }
    }

    // Sort by confidence and limit to top 2
    return results
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 2);

  } catch (error) {
    console.warn('Refined archetype detection failed:', error);
    return [];
  }
}

// Apply elemental routing based on soul phase and intent hints
export function applyElementalRouting(
  currentWeights: Record<string, number>,
  soulPhase?: string,
  intentHint?: string
): { adjusted: Record<string, number>; adjustments: ElementalAdjustment[] } {
  try {
    const { rules, soft_cap } = elementalRouting();
    const adjustments: ElementalAdjustment[] = [];
    let adjusted = { ...currentWeights };

    // Apply soul phase routing
    if (soulPhase && rules.by_soul_phase[soulPhase]) {
      const phaseAdjustments = rules.by_soul_phase[soulPhase];
      for (const [element, boost] of Object.entries(phaseAdjustments)) {
        adjusted[element] = Math.min(soft_cap, (adjusted[element] || 0) + boost);
      }
      adjustments.push({
        elements: phaseAdjustments,
        source: 'soul_phase',
        confidence: 0.8
      });
    }

    // Apply intent hint routing
    if (intentHint && rules.by_intent_hint[intentHint]) {
      const intentAdjustments = rules.by_intent_hint[intentHint];
      for (const [element, boost] of Object.entries(intentAdjustments)) {
        adjusted[element] = Math.min(soft_cap, (adjusted[element] || 0) + boost);
      }
      adjustments.push({
        elements: intentAdjustments,
        source: 'intent_hint',
        confidence: 0.7
      });
    }

    // Gentle normalization (preserve relative weights while ensuring sum ≈ 1)
    const sum = Object.values(adjusted).reduce((a, b) => a + b, 0) || 1;
    if (sum > 1.2) { // Only normalize if significantly over 1
      for (const element of Object.keys(adjusted)) {
        adjusted[element] = Number((adjusted[element] / sum).toFixed(3));
      }
    }

    return { adjusted, adjustments };

  } catch (error) {
    console.warn('Elemental routing failed:', error);
    return { 
      adjusted: currentWeights, 
      adjustments: [] 
    };
  }
}

// Extract intent hints from text using common patterns
export function extractIntentHint(text: string): string | null {
  const patterns = {
    'go_deeper': /\b(deeper|underneath|beneath|explore|dive)\b/i,
    'clarify': /\b(clarify|clear|understand|explain|make sense)\b/i,
    'ground': /\b(ground|practical|concrete|tangible|action)\b/i,
    'imagine': /\b(imagine|envision|dream|possibility|what if)\b/i,
    'integrate': /\b(integrate|together|whole|synthesize|combine)\b/i,
    'weave': /\b(connect|weave|relate|thread|pattern)\b/i
  };

  for (const [hint, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) {
      return hint;
    }
  }

  return null;
}

// Generate micro-reflection using refined archetype patterns
export function generateMicroReflection(
  archetypes: ArchetypeMatch[],
  turnIndex: number,
  minTurnsBetween: number = 3
): string | null {
  // Rate limiting
  if (turnIndex < 1 || turnIndex % minTurnsBetween !== 0) return null;
  
  if (archetypes.length === 0) return null;

  // Use highest confidence archetype
  const primaryArchetype = archetypes[0];
  if (primaryArchetype.confidence < 0.7) return null;

  // Select random micro-reflection from the archetype
  const reflections = primaryArchetype.micro_reflections;
  if (reflections.length === 0) return null;

  return reflections[Math.floor(Math.random() * reflections.length)];
}

// Generate contextual invite question
export function generateInvite(archetypes: ArchetypeMatch[]): string | null {
  if (archetypes.length === 0) return null;

  const primaryArchetype = archetypes[0];
  if (primaryArchetype.confidence < 0.6) return null;

  const invites = primaryArchetype.invites;
  if (invites.length === 0) return null;

  return invites[Math.floor(Math.random() * invites.length)];
}