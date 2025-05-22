import { PlanetPosition } from './astroUtils';

const SPIRALOGIC_HOUSE_MAP: Record<number, string> = {
  1: 'Fire 1 – Identity & Initiation',
  2: 'Earth 2 – Value & Grounding',
  3: 'Air 3 – Curiosity & Integration',
  4: 'Water 1 – Roots & Emotional Safety',
  5: 'Fire 2 – Creative Self & Expression',
  6: 'Earth 3 – Devotion & Sacred Work',
  7: 'Air 1 – Relating & Mirroring',
  8: 'Water 2 – Shadow & Rebirth',
  9: 'Fire 3 – Vision & Expansion',
  10: 'Earth 1 – Calling & Responsibility',
  11: 'Air 2 – Collaboration & Vision',
  12: 'Water 3 – Transcendence & Surrender',
};

export function mapToSpiralogicFacets(positions: PlanetPosition[]) {
  return positions.map(pos => ({
    ...pos,
    facet: SPIRALOGIC_HOUSE_MAP[pos.house] || 'Unknown',
  }));
}
