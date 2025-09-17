/**
 * Maya Orchestrator - Maya Angelou Zen Version
 *
 * Channel Maya Angelou's profound zen wisdom
 * Not a therapist, but a wise woman sharing truth
 */

export type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether';

interface MayaResponse {
  message: string;
  element: Element;
  audio?: string;
  brevity: 'greeting' | 'response' | 'depth';
}

export class MayaOrchestrator {
  private interactionCount = new Map<string, number>();
  private readonly HARD_LIMIT = 15; // Maya Angelou was brief

  /**
   * Maya speaks - with zen-like wisdom
   */
  async speak(input: string, userId: string): Promise<MayaResponse> {
    // Track interactions
    const count = (this.interactionCount.get(userId) || 0) + 1;
    this.interactionCount.set(userId, count);

    // Greetings get zen simplicity
    if (this.isGreeting(input)) {
      return {
        message: this.getZenGreeting(),
        element: 'earth',
        brevity: 'greeting'
      };
    }

    // Get zen response
    const response = this.getZenResponse(input);
    const element = this.detectElement(input);

    return {
      message: response,
      element,
      brevity: 'response'
    };
  }

  /**
   * Check if it's a greeting
   */
  private isGreeting(input: string): boolean {
    const greetings = ['hello', 'hi', 'hey', 'maya', 'good morning', 'good evening'];
    const lower = input.toLowerCase().trim();
    return greetings.some(g => lower.includes(g));
  }

  /**
   * Get zen greeting - Maya Angelou style
   */
  private getZenGreeting(): string {
    const greetings = [
      "Hello. What brings you?",
      "Welcome. Speak your truth.",
      "I'm listening.",
      "Hello. What's alive for you?",
      "Good to see you.",
      "Hello. What needs saying?",
      "Welcome. What's here?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  /**
   * Get zen response - channeling Maya Angelou's wisdom
   */
  private getZenResponse(input: string): string {
    const lower = input.toLowerCase();

    // Stress/Anxiety - Maya's wisdom about pressure
    if (/stress|overwhelm|anxious|pressure/.test(lower)) {
      const responses = [
        "Storms make trees take deeper roots.",
        "Pressure makes diamonds. What's forming?",
        "Even mountains endure wind.",
        "Breathe. Then choose.",
        "One step. Then another."
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Sadness/Depression - Maya's wisdom about pain
    if (/sad|depressed|down|cry|hurt/.test(lower)) {
      const responses = [
        "Even the sun has to set. Tell me.",
        "Tears water the soul.",
        "Pain demands to be felt.",
        "The night teaches too.",
        "Sorrow carves space for joy."
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Anger/Frustration - Maya's wisdom about bitterness
    if (/angry|mad|frustrated|pissed|hate/.test(lower)) {
      const responses = [
        "Bitterness is like cancer. What happened?",
        "Anger is honest. Use it.",
        "Fire burns or warms. Choose.",
        "Rage has information. Listen.",
        "What needs defending?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Confusion/Lost - Maya's wisdom about direction
    if (/confused|lost|don't know|unclear/.test(lower)) {
      const responses = [
        "You can't go back. Only forward.",
        "When you don't know, be still.",
        "Confusion precedes clarity.",
        "Not knowing is a doorway.",
        "The path appears by walking."
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Joy/Happiness - Maya's wisdom about celebration
    if (/happy|good|great|excited|joy/.test(lower)) {
      const responses = [
        "Joy is worth celebrating. Share it.",
        "Let yourself shine.",
        "Happiness needs witness.",
        "Good news feeds souls.",
        "Light attracts light."
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Fear/Scared - Maya's wisdom about courage
    if (/scared|afraid|fear|terrified/.test(lower)) {
      const responses = [
        "Courage is fear that has said its prayers.",
        "Fear is a counselor. Listen.",
        "Brave feels afraid too.",
        "Fear points to what matters.",
        "Face it with grace."
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Tired/Exhausted - Maya's wisdom about rest
    if (/tired|exhausted|drained|worn/.test(lower)) {
      const responses = [
        "Rest is not surrender.",
        "Even earth needs fallow time.",
        "Exhaustion is information.",
        "What needs to stop?",
        "Rest is revolutionary."
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Lonely/Isolated - Maya's wisdom about connection
    if (/lonely|alone|isolated|disconnected/.test(lower)) {
      const responses = [
        "Alone is not lonely.",
        "Solitude teaches too.",
        "We're all connected. Always.",
        "Loneliness seeks connection.",
        "Reach out. Someone's waiting."
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Love/Relationship - Maya's wisdom about love
    if (/love|relationship|heart|partner/.test(lower)) {
      const responses = [
        "Love liberates. It doesn't bind.",
        "Love recognizes no barriers.",
        "The heart knows. Trust it.",
        "Love is action, not words.",
        "First, love yourself."
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Default zen responses
    const defaults = [
      "Tell me your truth.",
      "What needs saying?",
      "Speak from your center.",
      "What's most alive?",
      "Continue.",
      "I'm here.",
      "Go deeper.",
      "What else?",
      "The truth?",
      "And?"
    ];

    return defaults[Math.floor(Math.random() * defaults.length)];
  }

  /**
   * Detect element from input
   */
  private detectElement(input: string): Element {
    const lower = input.toLowerCase();

    if (/fire|passion|energy|transform|excited|angry|intense/.test(lower)) return 'fire';
    if (/water|feel|emotion|flow|sad|tears|heart/.test(lower)) return 'water';
    if (/earth|ground|stable|practical|solid|stuck|real/.test(lower)) return 'earth';
    if (/air|think|idea|perspective|mental|thoughts|mind/.test(lower)) return 'air';

    return 'aether';
  }
}