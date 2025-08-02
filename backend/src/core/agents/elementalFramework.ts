export type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether';

const elementKeywords: Record<Element, string[]> = {
  fire: ['fire', 'ignite', 'flame', 'burn', 'spark'],
  water: ['water', 'flow', 'ocean', 'river', 'tide'],
  earth: ['earth', 'ground', 'soil', 'rock', 'stability'],
  air: ['air', 'breeze', 'wind', 'sky', 'clarity'],
  aether: ['aether', 'spirit', 'soul', 'mystic', 'cosmos']
};

export function detectElement(query: string): Element {
  const lowerQuery = query.toLowerCase();
  let bestElement: Element = 'aether';
  let bestCount = 0;

  for (const [element, keywords] of Object.entries(elementKeywords)) {
    const count = keywords.reduce((acc, keyword) => {
      return acc + (lowerQuery.includes(keyword) ? 1 : 0);
    }, 0);

    if (count > bestCount) {
      bestCount = count;
      bestElement = element as Element;
    }
  }

  return bestElement;
}

export function adjustGuidance(query: string, baseGuidance: string): string {
  const element = detectElement(query);
  let adjustment = '';

  switch (element) {
    case 'fire':
      adjustment = "Let the flames of passion light your path.";
      break;
    case 'water':
      adjustment = "Allow the flow of emotions to guide your healing.";
      break;
    case 'earth':
      adjustment = "Ground yourself in stability and take practical steps.";
      break;
    case 'air':
      adjustment = "Seek clarity and let your thoughts soar.";
      break;
    case 'aether':
      adjustment = "Embrace your inner spirit and connect with the cosmos.";
      break;
  }

  return `${baseGuidance} ${adjustment} (Element: ${element})`;
}