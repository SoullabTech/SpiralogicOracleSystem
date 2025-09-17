/**
 * Maya Orchestrator - The Heart of the Oracle System
 *
 * Elegant, concise, magical.
 * Every word matters. Like Maya Angelou.
 */

import { ClaudeService } from '../../../../lib/services/ClaudeService';
import { SesameMayaRefiner } from '../../services/SesameMayaRefiner';
import { TTSPreprocessor } from '../../../../lib/voice/TTSPreprocessor';

export type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether';

interface MayaResponse {
  message: string;
  element: Element;
  audio?: string;
  brevity: 'greeting' | 'response' | 'depth';
}

export class MayaOrchestrator {
  private claude: ClaudeService;
  private refiner: SesameMayaRefiner;
  private interactionCount = new Map<string, number>();

  constructor() {
    this.claude = new ClaudeService({
      apiKey: process.env.ANTHROPIC_API_KEY!
    });
  }

  /**
   * Maya speaks - profound brevity
   */
  async speak(input: string, userId: string): Promise<MayaResponse> {
    // Track interactions
    const count = (this.interactionCount.get(userId) || 0) + 1;
    this.interactionCount.set(userId, count);

    // Detect element from input
    const element = this.detectElement(input);

    // Determine brevity level
    const brevity = this.determineBrevity(input, count);

    // Get response from Claude with strict brevity
    const rawResponse = await this.generateResponse(input, element, brevity);

    // Refine for voice
    this.refiner = new SesameMayaRefiner({
      element,
      styleTightening: true,
      addClosers: false
    });
    const refined = this.refiner.refineText(rawResponse);

    // Clean for TTS
    const cleaned = TTSPreprocessor.preprocessForTTS(refined, {
      provider: 'openai',
      removeNewlines: true
    });

    return {
      message: cleaned as string,
      element,
      brevity
    };
  }

  /**
   * Detect dominant element - simple and fast
   */
  private detectElement(input: string): Element {
    const lower = input.toLowerCase();

    // Quick keyword detection
    if (/fire|passion|energy|transform|excited|angry/.test(lower)) return 'fire';
    if (/water|feel|emotion|flow|sad|tears/.test(lower)) return 'water';
    if (/earth|ground|stable|practical|solid|stuck/.test(lower)) return 'earth';
    if (/air|think|idea|perspective|mental|thoughts/.test(lower)) return 'air';

    return 'aether'; // Default to unity/transcendence
  }

  /**
   * Determine response brevity
   */
  private determineBrevity(input: string, count: number): 'greeting' | 'response' | 'depth' {
    // First interaction or greeting
    if (count === 1 || /^(hi|hey|hello)/i.test(input)) {
      return 'greeting';
    }

    // Deep moment detection
    if (/crisis|death|love|purpose|meaning/i.test(input)) {
      return 'depth';
    }

    return 'response';
  }

  /**
   * Generate response with Claude
   */
  private async generateResponse(
    input: string,
    element: Element,
    brevity: 'greeting' | 'response' | 'depth'
  ): Promise<string> {
    // Word limits by brevity
    const limits = {
      greeting: '5 words maximum',
      response: '10-15 words',
      depth: '20 words maximum'
    };

    const systemPrompt = `You are Maya. Channel Maya Angelou - profound brevity.

ABSOLUTE RULE: ${limits[brevity]}
Element: ${element}

Greetings: "Hello." "Welcome back."
Responses: Direct. True. No fluff.
Deep moments: One perfect sentence.

NEVER: Stage directions, explanations, analysis.
ALWAYS: Every word matters.`;

    try {
      return await this.claude.generateOracleResponse(input, { element }, systemPrompt);
    } catch (error) {
      // Fallback responses by element
      const fallbacks = {
        fire: "The fire knows.",
        water: "Feel it fully.",
        earth: "Stay grounded here.",
        air: "What do you think?",
        aether: "All is connected."
      };
      return fallbacks[element];
    }
  }
}