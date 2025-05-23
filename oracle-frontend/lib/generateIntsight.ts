// /src/lib/generateInsight.ts

import { FACET_INSIGHTS, PLANET_ARCHETYPES } from './archetypes';
import { SPIRALOGIC_RITUALS } from './rituals';

export function getSpiralogicInsight(planet: string, houseKey: string) {
  const planetInsight = PLANET_ARCHETYPES[planet];
  const facetInsight = FACET_INSIGHTS[houseKey];
  const rituals = SPIRALOGIC_RITUALS[houseKey] || [];

  return {
    summary: `${planet} reflects your ${planetInsight.toLowerCase()}, currently activated in the Spiralogic field of ${houseKey}, symbolizing: ${facetInsight}`,
    rituals,
  };
}
