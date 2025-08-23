import { archetypeMap } from "./knowledge";
import { detectArchetypesRefined, applyElementalRouting, extractIntentHint } from "./refined-heuristics";

export function inferArchetypeHints(text: string): { name: string; bias: string[] }[] {
  try {
    // Use refined detection first
    const refinedArchetypes = detectArchetypesRefined(text);
    if (refinedArchetypes.length > 0) {
      return refinedArchetypes.map(a => ({
        name: a.name,
        bias: Object.keys(a.elemental_bias).filter(element => a.elemental_bias[element] > 0)
      }));
    }

    // Fallback to original detection
    const t = text.toLowerCase();
    const { archetypes } = archetypeMap();
    const picks: { name: string; bias: string[] }[] = [];
    for (const a of archetypes) {
      const hit = a.signals.some(s => t.includes(s.toLowerCase()));
      if (hit) picks.push({ name: a.name, bias: a.element_bias });
    }
    return picks.slice(0, 2);
  } catch (error) {
    console.warn('Archetype inference failed:', error);
    return [];
  }
}

export function applySoftElementBias(current: Record<string, number>, bias: string[], bump = 0.1) {
  try {
    // Try refined elemental routing if available
    const intentHint = extractIntentHint(bias.join(' '));
    if (intentHint) {
      const { adjusted } = applyElementalRouting(current, undefined, intentHint);
      return adjusted;
    }
  } catch (error) {
    console.warn('Refined elemental routing failed, using fallback:', error);
  }

  // Fallback to original logic
  const next = { ...current };
  bias.forEach(el => next[el] = Math.min(1, (next[el] ?? 0) + bump));
  // normalize gently
  const sum = Object.values(next).reduce((a,b)=>a+b,0) || 1;
  for (const k of Object.keys(next)) next[k] = Number((next[k] / sum).toFixed(3));
  return next;
}

// Enhanced function using refined routing
export function applyElementalBiasRefined(
  current: Record<string, number>,
  soulPhase?: string,
  intentHint?: string
): Record<string, number> {
  try {
    const { adjusted } = applyElementalRouting(current, soulPhase, intentHint);
    return adjusted;
  } catch (error) {
    console.warn('Refined elemental bias failed:', error);
    return current;
  }
}