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
          max_tokens: options.max_tokens || 300,
          temperature: options.temperature || 0.8,
          system: prompt,
          messages: [{ role: 'user', content: 'Respond naturally and conversationally with 3-5 sentences. Be warm, engaging, and authentic like a wise friend. Avoid being clinical or therapeutic.' }]
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
    if (lower.includes('stress')) return 'Stress is so real. You\'re not alone.';
    if (lower.includes('sad')) return 'Sadness is brave. I\'m here.';
    if (lower.includes('angry')) return 'Anger makes sense sometimes.';
    return 'Tell me more.';
  }
}

export class MayaOrchestrator {
  private readonly HARD_WORD_LIMIT = 120;
  private readonly TARGET_WORD_RANGE = [40, 80];
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

    // Warm greetings for common inputs - no AI needed
    if (this.isGreeting(lowerInput)) {
      return this.createResponse(this.getSimpleGreeting());
    }

    // Handle very short responses with warmth
    if (input.length < 8) {
      const quickResponse = this.getQuickResponse(lowerInput);
      if (quickResponse) {
        return this.createResponse(quickResponse);
      }
    }

    // Try AI with strict constraints
    let message = await this.generateConstrainedResponse(input);

    // Validate and enforce limits
    message = this.enforceConstraints(message, input);

    return this.createResponse(message);
  }

  private async generateConstrainedResponse(input: string): Promise<string> {
    const prompt = `You are Maya - warm, authentic, and real. Like Brené Brown: vulnerable, honest, connecting through shared humanity.

YOUR APPROACH:
- Connect through warmth and authenticity
- Share universal truths, not analyze
- Be a friend having coffee, not a clinician
- Use "me too" energy when appropriate
- Normalize struggle and celebrate courage

ABSOLUTE RULES:
- Maximum 15 words (aim for 5-10)
- Speak from alongside, not above
- Mirror their feeling, don't analyze it
- Offer simple presence, not questions
- Be like a friend, not a therapist

GENTLE STYLE:
- "I hear you."
- "That sounds hard."
- "You're not alone."
- "That's real."
- "I'm here."
- "Tell me more."

NEVER:
- Challenge or confront
- Ask probing questions
- Sound passive-aggressive
- Analyze their responses
- Be clever or sharp

Input: "${input}"

Respond with gentle presence:`;

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

    // Brené Brown style - warm, authentic, normalizing
    if (lower.includes('stress') || lower.includes('anxious')) {
      return "Stress is so real. You're not alone.";
    }
    if (lower.includes('sad') || lower.includes('down')) {
      return "Sadness is brave. I'm here.";
    }
    if (lower.includes('angry') || lower.includes('mad')) {
      return "Anger makes sense sometimes.";
    }
    if (lower.includes('lost') || lower.includes('confused')) {
      return "Lost is a real place. Me too.";
    }
    if (lower.includes('scared') || lower.includes('afraid')) {
      return "Fear is so hard. You're brave.";
    }
    if (lower.includes('happy') || lower.includes('good')) {
      return "That's wonderful! Tell me more.";
    }
    if (lower.includes('tired') || lower.includes('exhausted')) {
      return "Of course you're tired. Rest.";
    }
    if (lower.includes("what") && lower.includes("mean")) {
      return "Let me clarify.";
    }
    if (lower.includes("don't understand") || lower.includes("dont understand")) {
      return "I'll try another way.";
    }
    if (lower.includes("don't know") || lower.includes("dont know")) {
      return "Not knowing is okay.";
    }

    // Default responses - warm and inviting
    const defaults = [
      "Tell me more.",
      "I'm listening.",
      "I hear you.",
      "That makes sense.",
      "Yeah, I get it.",
      "You're not alone."
    ];

    return defaults[Math.floor(Math.random() * defaults.length)];
  }

  private getSimpleGreeting(): string {
    const greetings = [
      "Hey, friend. Good to see you.",
      "Hello! How are you today?",
      "Hi there. How's your heart?",
      "Welcome back. How are things?",
      "Hey. What's going on?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  private isGreeting(input: string): boolean {
    const greetings = ['hello', 'hi', 'hey', 'maya', 'hello maya', 'hi maya', 'good morning', 'good evening'];
    return greetings.some(g => input.includes(g));
  }

  private getQuickResponse(input: string): string | null {
    // Handle single word or very short inputs warmly
    if (input === 'ok' || input === 'okay') return "Good. I'm here.";
    if (input === 'thanks' || input === 'thank you') return "Of course!";
    if (input === 'yes' || input === 'yeah' || input === 'yep') return "Great.";
    if (input === 'no' || input === 'nope') return "That's okay.";
    if (input === 'maybe' || input === 'perhaps') return "Uncertainty is okay.";
    if (input === 'hmm' || input === 'um' || input === 'uh') return "Take your time.";
    if (input === 'sure') return "Tell me more?";
    if (input === 'idk' || input === "don't know") return "Not knowing is okay.";
    return null;
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