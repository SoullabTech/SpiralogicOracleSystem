export const getTarotCardForPhase = (phase: string) => {
  const cards = {
    'Fire': {
      name: 'The Magician',
      image: '/tarot/the-magician.png',
      meaning: 'You have the power to manifest your vision.'
    },
    'Water': {
      name: 'The Moon',
      image: '/tarot/the-moon.png',
      meaning: 'Trust the mystery and flow with emotion.'
    },
    // Add Earth, Air, Aether...
  };

  const element = phase.split(' ')[0]; // e.g., "Fire"
  return cards[element] || null;
};
