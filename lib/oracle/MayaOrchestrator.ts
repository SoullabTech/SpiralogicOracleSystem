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
    const prompt = `You are a soulful interviewer like Maya Angelou - curious about the human story.

YOUR ROLE: Ask the ONE question that gets to the heart of what they're really saying.

ABSOLUTE RULES:
- Maximum 15 words (aim for 5-10)
- Ask questions that unlock their deeper truth
- Be curious about THEIR story, not prescriptive
- When they're vague, get specific
- When they're surface, go deeper

INTERVIEW STYLE:
- "What did that cost you?"
- "When did you first know?"
- "Who were you before this?"
- "What are you not saying?"
- "Where does that live in you?"
- "What would freedom look like?"

NEVER:
- Give advice or prescriptions
- Use mystical/vague language
- Explain their feelings to them
- Use therapy-speak

Input: "${input}"

Ask the question that matters:`;

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

    // Soulful interviewer responses - getting to the deeper story
    if (lower.includes('stress') || lower.includes('anxious')) {
      return "When did this weight arrive?";
    }
    if (lower.includes('sad') || lower.includes('down')) {
      return "What needs witnessing?";
    }
    if (lower.includes('angry') || lower.includes('mad')) {
      return "What boundary was crossed?";
    }
    if (lower.includes('lost') || lower.includes('confused')) {
      return "What did you know before?";
    }
    if (lower.includes('scared') || lower.includes('afraid')) {
      return "What's at stake for you?";
    }
    if (lower.includes('happy') || lower.includes('good')) {
      return "What opened this door?";
    }
    if (lower.includes('tired') || lower.includes('exhausted')) {
      return "What are you carrying for others?";
    }
    if (lower.includes("what") && lower.includes("mean")) {
      return "What did you hear me say?";
    }
    if (lower.includes("don't understand") || lower.includes("dont understand")) {
      return "What part landed differently?";
    }
    if (lower.includes("don't know") || lower.includes("dont know")) {
      return "What do you suspect?";
    }

    // Soulful interviewer defaults - always curious about THEIR story
    const defaults = [
      "Tell me the real version.",
      "What's underneath that?",
      "When did you first notice?",
      "What else?",
      "Who else knows this?",
      "What would change mean?"
    ];

    return defaults[Math.floor(Math.random() * defaults.length)];
  }

  private getSimpleGreeting(): string {
    const greetings = [
      "Hello. What brings you today?",
      "What's alive for you?",
      "What needs voice?",
      "What's present?",
      "What's stirring?"
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