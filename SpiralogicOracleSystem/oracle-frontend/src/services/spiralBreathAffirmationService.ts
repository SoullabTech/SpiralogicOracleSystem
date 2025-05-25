// src/services/spiralBreathAffirmationService.ts

import { SpiralBreathMemoryEntry } from '../types/spiralBreathMemory';

export function generateSpiralBreathAffirmation(memory: SpiralBreathMemoryEntry): string {
  const { element, flow } = memory;

  switch (element) {
    case 'Fire':
      return flow === 'Ascending'
        ? 'I breathe visions into flame.'
        : 'I honor the ashes of what I have released.';
    case 'Water':
      return flow === 'Ascending'
        ? 'I rise on the currents of feeling made whole.'
        : 'I surrender to the river that remembers my soul.';
    case 'Earth':
      return flow === 'Ascending'
        ? 'I lift new life from rooted dreams.'
        : 'I root deeper into the sacred ground of my being.';
    case 'Air':
      return flow === 'Ascending'
        ? 'I speak the winds of future worlds.'
        : 'I gather the breath of wisdom into my body.';
    case 'Aether':
      return flow === 'Centering'
        ? 'I am breathed by the Spiral of Becoming.'
        : 'I rest in the breath between breaths.';
    default:
      return 'I breathe with the Spiral that weaves me.';
  }
}
