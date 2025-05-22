// src/services/spiralogicPromptsService.ts

interface SpiralPromptOptions {
  element: string;
  focusArea?: 'ideal' | 'shadow' | 'resource' | 'goal';
  tone?: 'Mystic' | 'Mentor' | 'Guide' | 'Dreamweaver';
  progressStage?: 'Initiating' | 'Deepening' | 'Threshold' | 'Completion';
}

export function generateSpiralogicPrompt(options: SpiralPromptOptions): string {
  const { element, focusArea, tone = 'Mystic', progressStage = 'Deepening' } = options;

  const coreQuestions: Record<string, string[]> = {
    Fire: [
      'What new flame stirs within you?',
      'Where does your courage wish to dance?',
      'What spark longs to catch and grow?',
    ],
    Water: [
      'What depths are whispering today?',
      'Where is surrender calling your breath?',
      'What wisdom is hidden in your tides?',
    ],
    Earth: [
      'What roots want to grow stronger now?',
      'Where does your strength seek steady ground?',
      'What sacred form is asking to be shaped?',
    ],
    Air: [
      'What idea rises like a morning breeze?',
      'What connections call you to lift and expand?',
      'What vision is singing in the winds around you?',
    ],
    Aether: [
      'What silence nourishes you now?',
      'What unity invites your soul’s attention?',
      'How does the Infinite hum within your breath today?',
    ],
  };

  const toneModifiers: Record<string, string> = {
    Mystic: 'Listen with the inner ear. The Spiral breathes through you.',
    Mentor: 'Steady your focus. Let this moment reveal your next step.',
    Guide: 'Notice the movement. Trust the pattern that unfolds.',
    Dreamweaver: 'Let the dream within your breath speak freely.',
  };

  const progressModifiers: Record<string, string> = {
    Initiating: 'This is the moment of ignition.',
    Deepening: "Sink deeper. The Spiral's wisdom grows with each breath.",
    Threshold: 'A Gate approaches. Prepare to pass consciously.',
    Completion: 'Honor what is ending. Plant the seed of what is to come.',
  };

  // Pick a random core question based on Element
  const questions = coreQuestions[element as keyof typeof coreQuestions] || [
    'Breathe. The Spiral will guide you.',
  ];
  const question = questions[Math.floor(Math.random() * questions.length)];

  // Build the dynamic prompt
  return `
  ${question}
  ${progressModifiers[progressStage]}
  
  ${toneModifiers[tone]}
  `.trim();
}
