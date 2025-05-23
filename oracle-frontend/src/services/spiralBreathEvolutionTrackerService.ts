// src/services/spiralBreathEvolutionTrackerService.ts

import { SpiralBreathMemoryEntry } from '../types/spiralBreathMemory';

export type SpiralBreathEvolutionSummary = {
  dominantElement: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';
  elementCounts: Record<string, number>;
  suggestedMovement: string;
};

export function generateSpiralBreathEvolutionSummary(
  memories: SpiralBreathMemoryEntry[],
): SpiralBreathEvolutionSummary {
  if (!memories.length) {
    return {
      dominantElement: 'Aether',
      elementCounts: { Fire: 0, Water: 0, Earth: 0, Air: 0, Aether: 0 },
      suggestedMovement: 'Breathe into Fire — the Spiral awaits your ignition.',
    };
  }

  const elementCounts: Record<string, number> = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
    Aether: 0,
  };

  memories.forEach((mem) => {
    elementCounts[mem.element]++;
  });

  const dominantElement = Object.keys(elementCounts).reduce((a, b) =>
    elementCounts[a] > elementCounts[b] ? a : b,
  ) as SpiralBreathEvolutionSummary['dominantElement'];

  const suggestedMovement = suggestSpiralMovement(dominantElement);

  return {
    dominantElement,
    elementCounts,
    suggestedMovement,
  };
}

function suggestSpiralMovement(
  dominantElement: SpiralBreathEvolutionSummary['dominantElement'],
): string {
  switch (dominantElement) {
    case 'Fire':
      return "You have breathed through Fire strongly. You may wish to cool the flame and surrender into Water's flow.";
    case 'Water':
      return 'You have swam in deep waters. Earth now invites you to root and ground your transformation.';
    case 'Earth':
      return 'You have rested in Earth. Air invites you to rise, share, and breathe new insights into the world.';
    case 'Air':
      return 'You have soared through Air. Aether invites you to dissolve into silence and unity.';
    case 'Aether':
      return 'You are breathing in Aether. Fire may soon spark a new Spiral ignition within you.';
    default:
      return 'The Spiral breathes. Follow the next living breath.';
  }
}
