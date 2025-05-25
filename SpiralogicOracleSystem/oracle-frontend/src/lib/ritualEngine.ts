export function getTarotCardForPhase(phase: string) {
  const tarotMap: Record<string, { name: string; image: string; meaning: string }> = {
    "Fire 1": {
      name: "The Magician",
      image: "/tarot/the-magician.png",
      meaning: "You have the tools you need. Claim your power."
    },
    "Water 1": {
      name: "The Moon",
      image: "/tarot/the-moon.png",
      meaning: "Your dreams reveal hidden truths. Trust the unknown."
    },
    "Earth 1": {
      name: "The Empress",
      image: "/tarot/the-empress.png",
      meaning: "Fertility, form, and embodiment call you forward."
    },
    "Air 1": {
      name: "The Lovers",
      image: "/tarot/the-lovers.png",
      meaning: "Your choices reflect your alignment. Speak from the heart."
    },
    "Aether 1": {
      name: "The World",
      image: "/tarot/the-world.png",
      meaning: "You are the circle becoming whole. Integrate the journey."
    }
  };

  return tarotMap[phase] ?? null;
}
