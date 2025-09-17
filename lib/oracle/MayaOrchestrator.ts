// Oracle response type
type OracleResponse = {
  message: string;
  element: string;
  duration: number;
  voiceCharacteristics?: {
    pace: string;
    tone: string;
    energy: string;
  };
};
// ClaudeService for lib version
class ClaudeService {
  async generateResponse(prompt: string, options: any = {}): Promise<string> {
    if (!process.env.ANTHROPIC_API_KEY) {
      return this.getFallback(prompt);
    }
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          max_tokens: options.max_tokens || 50,
          temperature: options.temperature || 0.7,
          system: prompt,
          messages: [{ role: 'user', content: 'Respond with zen brevity.' }]
        })
      });
      if (response.ok) {
        const data = await response.json() as any;
        return data.content?.[0]?.text || this.getFallback(prompt);
      }
    } catch (error) {
      console.error('Claude error:', error);
    }
    return this.getFallback(prompt);
  }

  private getFallback(prompt: string): string {
    const lower = prompt.toLowerCase();
    if (lower.includes('stress')) return 'Storms make trees take deeper roots.';
    if (lower.includes('sad')) return 'Tears water the soul.';
    if (lower.includes('angry')) return 'Fire burns or warms. Choose.';
    return 'Tell me your truth.';
  }
}

export class MayaOrchestrator {
  private readonly HARD_WORD_LIMIT = 25;
  private readonly TARGET_WORD_RANGE = [5, 15];
  private claude: ClaudeService;

  // Forbidden therapy-speak patterns
  private readonly FORBIDDEN_PATTERNS = [
    /i\s+sense/gi,
    /i\s+witness/gi,
    /hold\s+space/gi,
    /attuning/gi,
    /present\s+moment/gi,
    /companion\s+you/gi,
    /support\s+you/gi,
    /i'm\s+here\s+to/gi,
    /let\s+me\s+hold/gi
  ];

  constructor() {
    this.claude = new ClaudeService();
  }

  async speak(input: string, userId: string): Promise<OracleResponse> {
    const lowerInput = input.toLowerCase().trim();

    // Direct responses for common inputs - no AI needed
    if (this.isGreeting(lowerInput)) {
      return this.createResponse(this.getSimpleGreeting());
    }

    // Try AI with strict constraints
    let message = await this.generateConstrainedResponse(input);

    // Validate and enforce limits
    message = this.enforceConstraints(message, input);

    return this.createResponse(message);
  }

  private async generateConstrainedResponse(input: string): Promise<string> {
    const prompt = `You are Maya. Respond with profound brevity.

ABSOLUTE RULES:
- Maximum 15 words (aim for 5-10)
- Be like a friend, not a therapist
- One simple thought
- No analyzing or explaining feelings

NEVER use: sense, witness, hold space, attune, companion, support you, I'm here to

Input: "${input}"

Respond with zen-like brevity:`;

    try {
      const response = await this.claude.generateResponse(prompt, {
        max_tokens: 50, // Force short responses
        temperature: 0.7
      });

      return this.cleanResponse(response);
    } catch (error) {
      console.log('AI generation failed, using fallback');
      return this.getFallbackResponse(input);
    }
  }

  private enforceConstraints(message: string, input: string): string {
    // Remove therapy-speak
    for (const pattern of this.FORBIDDEN_PATTERNS) {
      message = message.replace(pattern, '');
    }

    // Strip action descriptions (*takes a breath*, etc)
    message = message.replace(/\*[^*]+\*/g, '');

    // Count words
    const wordCount = message.split(/\s+/).filter(w => w.length > 0).length;

    // Too long? Use fallback
    if (wordCount > this.HARD_WORD_LIMIT) {
      console.log(`Response too long (${wordCount} words), using fallback`);
      return this.getFallbackResponse(input);
    }

    return message.trim();
  }

  private getFallbackResponse(input: string): string {
    const lower = input.toLowerCase();

    // Pattern-based responses (Maya Angelou style)
    if (lower.includes('stress') || lower.includes('anxious')) {
      return "Storms make trees take deeper roots.";
    }
    if (lower.includes('sad') || lower.includes('down')) {
      return "Even the sun has to set. Tell me.";
    }
    if (lower.includes('angry') || lower.includes('mad')) {
      return "Anger is pain in disguise. What hurts?";
    }
    if (lower.includes('lost') || lower.includes('confused')) {
      return "Lost is where finding begins.";
    }
    if (lower.includes('scared') || lower.includes('afraid')) {
      return "Courage is fear that has said its prayers.";
    }
    if (lower.includes('happy') || lower.includes('good')) {
      return "Joy deserves witness. Share it.";
    }
    if (lower.includes('tired') || lower.includes('exhausted')) {
      return "Rest is not defeat. It's wisdom.";
    }

    // Default responses
    const defaults = [
      "Tell me more.",
      "I'm listening.",
      "What's alive for you?",
      "Go on.",
      "What else?"
    ];

    return defaults[Math.floor(Math.random() * defaults.length)];
  }

  private getSimpleGreeting(): string {
    const greetings = [
      "Hello. What brings you?",
      "Hey there. What's on your mind?",
      "Welcome. Speak freely.",
      "I'm listening.",
      "Good to see you."
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  private isGreeting(input: string): boolean {
    const greetings = ['hello', 'hi', 'hey', 'maya', 'hello maya', 'hi maya'];
    return greetings.includes(input);
  }

  private cleanResponse(text: string): string {
    // Remove common AI prefixes
    text = text.replace(/^(I hear|I understand|I sense|It sounds like)/i, '');
    text = text.replace(/^(That must be|That sounds)/i, '');

    // Remove trailing "How can I help?" type endings
    text = text.replace(/(How can I|What can I|Is there anything).*$/i, '');

    return text.trim();
  }

  private createResponse(message: string): OracleResponse {
    return {
      message,
      element: 'earth', // Maya's grounded element
      duration: Math.max(1000, message.length * 50), // Short pauses for brevity
      voiceCharacteristics: {
        pace: 'deliberate',
        tone: 'warm_grounded',
        energy: 'calm'
      }
    };
  }

}