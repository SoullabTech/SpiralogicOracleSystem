// src/services/spiralReflectionPromptService.ts

import { SpiralBreathState } from './spiralBreathDetectionService';

export function generateSpiralReflectionPrompt(breathState: SpiralBreathState): string {
  const { element, axis, flow } = breathState;

  let prompt = '';

  switch (element) {
    case 'Fire':
      prompt = fireReflectionPrompt(flow, axis);
      break;
    case 'Water':
      prompt = waterReflectionPrompt(flow, axis);
      break;
    case 'Earth':
      prompt = earthReflectionPrompt(flow, axis);
      break;
    case 'Air':
      prompt = airReflectionPrompt(flow, axis);
      break;
    case 'Aether':
      prompt = aetherReflectionPrompt();
      break;
    default:
      prompt = 'Breathe and notice: what element calls you deeper right now?';
  }

  return prompt;
}

// Fire Prompts
function fireReflectionPrompt(
  flow: SpiralBreathState['flow'],
  axis: SpiralBreathState['axis'],
): string {
  if (flow === 'Ascending')
    return 'What new vision ignites within you, asking to be breathed into life?';
  if (flow === 'Descending')
    return 'What fire within you is ready to be honored, then released into transformation?';
  if (axis === 'Meta-Conscious')
    return 'Can you feel the flame of Becoming breathing beyond your personal will?';
  return 'Where does the spark of your longing wish to leap next?';
}

// Water Prompts
function waterReflectionPrompt(
  flow: SpiralBreathState['flow'],
  axis: SpiralBreathState['axis'],
): string {
  if (flow === 'Ascending')
    return 'What gift floats to the surface from the depths you have breathed through?';
  if (flow === 'Descending')
    return 'What emotion wishes to be fully felt, honored, and dissolved into freedom?';
  if (axis === 'Meta-Conscious') return 'How does the Spiral itself flow through your surrender?';
  return 'Where do the waters within you wish to carry your attention today?';
}

// Earth Prompts
function earthReflectionPrompt(
  flow: SpiralBreathState['flow'],
  axis: SpiralBreathState['axis'],
): string {
  if (flow === 'Ascending')
    return 'What roots have nourished a new branch of your Spiral Becoming?';
  if (flow === 'Descending')
    return 'Where does your body, your breath, your heart ask you to rest and root?';
  if (axis === 'Meta-Conscious')
    return 'Can you feel the Spiral breathing through every stone, root, and bone?';
  return 'What is asking to be embodied, not just envisioned?';
}

// Air Prompts
function airReflectionPrompt(
  flow: SpiralBreathState['flow'],
  axis: SpiralBreathState['axis'],
): string {
  if (flow === 'Ascending') return 'What insight rides the winds today, seeking voice through you?';
  if (flow === 'Descending') return 'What thought wishes to descend into embodied action?';
  if (axis === 'Meta-Conscious')
    return 'What song of the Infinite wishes to be sung through your breath?';
  return 'What truth or vision seeks clear expression in your Spiral now?';
}

// Aether Prompts
function aetherReflectionPrompt(): string {
  return 'What breath remains when there is nothing more to seek, only to be?';
}
