// src/services/spiralThresholdTrackerService.ts

import { SpiralBreathMemoryEntry } from '../types/spiralBreathMemory';

export type ThresholdCrossing = {
  fromElement: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';
  toElement: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';
  timestamp: string;
};

export function detectThresholdCrossing(
  memories: SpiralBreathMemoryEntry[],
): ThresholdCrossing | null {
  if (memories.length < 2) return null;

  const last = memories[memories.length - 1];
  const secondLast = memories[memories.length - 2];

  if (last.element !== secondLast.element) {
    return {
      fromElement: secondLast.element,
      toElement: last.element,
      timestamp: new Date().toISOString(),
    };
  }

  return null;
}
