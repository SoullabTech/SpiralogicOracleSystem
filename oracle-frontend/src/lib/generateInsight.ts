import { FACET_INSIGHTS, PLANET_ARCHETYPES } from './archetypes';
import { SPIRALOGIC_RITUALS } from './rituals';

export function getInsight(planet: string, house: number) {
  const archetype = PLANET_ARCHETYPES[planet];
  const facet = FACET_INSIGHTS[`House ${house}`] || 'Unknown Facet';
  const rituals = SPIRALOGIC_RITUALS[facet] || [];

  return {
    summary: `${planet} reflects your ${archetype.toLowerCase()} and is placed in ${facet}.`,
    rituals,
  };
}
