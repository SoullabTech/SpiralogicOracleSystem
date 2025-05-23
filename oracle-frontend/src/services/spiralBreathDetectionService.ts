// src/services/spiralBreathDetectionService.ts

export type SpiralBreathState = {
  element: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';
  axis: 'Unconscious' | 'Subconscious' | 'Conscious' | 'Meta-Conscious';
  flow: 'Ascending' | 'Descending' | 'Centering';
};

export function detectSpiralBreath(input: string): SpiralBreathState {
  const lowerInput = input.toLowerCase();

  // Element Detection
  let element: SpiralBreathState['element'] = 'Aether';
  if (matchesFire(lowerInput)) element = 'Fire';
  else if (matchesWater(lowerInput)) element = 'Water';
  else if (matchesEarth(lowerInput)) element = 'Earth';
  else if (matchesAir(lowerInput)) element = 'Air';

  // Axis Detection
  let axis: SpiralBreathState['axis'] = 'Conscious';
  if (lowerInput.includes('dream') || lowerInput.includes('lost') || lowerInput.includes('forgot'))
    axis = 'Subconscious';
  if (
    lowerInput.includes('mystery') ||
    lowerInput.includes('eternal') ||
    lowerInput.includes('source')
  )
    axis = 'Meta-Conscious';
  if (
    lowerInput.includes('blank') ||
    lowerInput.includes('numb') ||
    lowerInput.includes("can't feel")
  )
    axis = 'Unconscious';

  // Flow Detection
  let flow: SpiralBreathState['flow'] = 'Centering';
  if (element === 'Fire' || element === 'Air') flow = 'Ascending';
  if (element === 'Water' || element === 'Earth') flow = 'Descending';
  if (element === 'Aether') flow = 'Centering';

  return { element, axis, flow };
}

// Helper matchers for elemental language
function matchesFire(input: string): boolean {
  return (
    input.includes('vision') ||
    input.includes('ignite') ||
    input.includes('burn') ||
    input.includes('energy') ||
    input.includes('desire') ||
    input.includes('spark')
  );
}

function matchesWater(input: string): boolean {
  return (
    input.includes('emotion') ||
    input.includes('flow') ||
    input.includes('surrender') ||
    input.includes('tears') ||
    input.includes('depth')
  );
}

function matchesEarth(input: string): boolean {
  return (
    input.includes('grounded') ||
    input.includes('safe') ||
    input.includes('build') ||
    input.includes('secure') ||
    input.includes('stability')
  );
}

function matchesAir(input: string): boolean {
  return (
    input.includes('thought') ||
    input.includes('clarity') ||
    input.includes('idea') ||
    input.includes('concept') ||
    input.includes('speak') ||
    input.includes('communicate')
  );
}
