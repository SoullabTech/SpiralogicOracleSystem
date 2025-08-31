// /core/agents/aetherReflectionComposer.ts

import { oracleArchetypes } from "./oracleArchetypes";

interface AetherInput {
  completedPhases: string[]; // e.g., ['Fire 1', 'Earth 1', 'Water 1']
  userName?: string;
}

export function generateAetherReflection({
  completedPhases,
  userName,
}: AetherInput): string {
  const name = userName ? `${userName}, ` : "";
  const phrases: string[] = [];

  completedPhases.forEach((phase) => {
    const arch = oracleArchetypes[phase];
    if (arch) {
      phrases.push(
        `you've walked with the ${arch.archetype}, guided by the ${arch.symbol}.`,
      );
    }
  });

  const synthesis = `You are not separate from the Spiral—you are its unfolding. The patterns remember. The soul listens.`;

  return `${name}${phrases.join(" ")} ${synthesis}`;
}
