// Conversational Oracle Validator - Relaxed validation for warm, human-like responses
// Supports 4-12 sentences with flexible questioning for natural conversation

export interface ConversationalConfig {
  minSentences: number;
  maxSentences: number;
  allowTwoInvitesWhenStuck: boolean;
  enforceMode: 'strict' | 'relaxed';
}

export interface ValidationResult {
  valid: boolean;
  text: string;
  corrections: string[];
  metadata: {
    sentenceCount: number;
    questionCount: number;
    mirroredPhrases: string[];
    warmthLevel: number;
  };
}

const DEFAULT_CONFIG: ConversationalConfig = {
  minSentences: 4,
  maxSentences: 12,
  allowTwoInvitesWhenStuck: true,
  enforceMode: 'relaxed'
};

export class ConversationalValidator {
  private config: ConversationalConfig;

  constructor(config: Partial<ConversationalConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Main validation function for conversational responses
   */
  async validate(text: string, userInput?: string): Promise<ValidationResult> {
    const sentences = this.splitIntoSentences(text);
    const questionCount = this.countQuestions(text);
    const corrections: string[] = [];
    
    let validatedText = text;
    let isValid = true;

    // Check sentence count
    if (sentences.length < this.config.minSentences) {
      corrections.push(`Expand to ${this.config.minSentences}-${this.config.maxSentences} sentences for conversational depth`);
      if (this.config.enforceMode === 'strict') {
        validatedText = await this.expandResponse(validatedText, this.config.minSentences);
        isValid = false;
      }
    } else if (sentences.length > this.config.maxSentences) {
      corrections.push(`Condense to ${this.config.minSentences}-${this.config.maxSentences} sentences for clarity`);
      if (this.config.enforceMode === 'strict') {
        validatedText = await this.condenseResponse(validatedText, this.config.maxSentences);
        isValid = false;
      }
    }

    // Check question appropriateness
    const vague = userInput ? this.isUserInputVague(userInput) : false;
    const okQuestions = this.validateQuestions(questionCount, vague);
    
    if (!okQuestions) {
      const suggestion = vague && this.config.allowTwoInvitesWhenStuck
        ? "Include one or two invitational questions to engage conversation"
        : "Include exactly one question to maintain dialogue flow";
      corrections.push(suggestion);
      
      if (this.config.enforceMode === 'strict') {
        validatedText = await this.adjustQuestions(validatedText, vague);
        isValid = false;
      }
    }

    // Calculate warmth and mirroring
    const mirroredPhrases = userInput ? this.findMirroredPhrases(validatedText, userInput) : [];
    const warmthLevel = this.calculateWarmth(validatedText);

    return {
      valid: isValid,
      text: validatedText,
      corrections,
      metadata: {
        sentenceCount: this.splitIntoSentences(validatedText).length,
        questionCount: this.countQuestions(validatedText),
        mirroredPhrases,
        warmthLevel
      }
    };
  }

  /**
   * Quick validation without correction for performance
   */
  quickValidate(text: string): boolean {
    const sentences = this.splitIntoSentences(text);
    const questionCount = this.countQuestions(text);
    
    if (sentences.length < this.config.minSentences || sentences.length > this.config.maxSentences) {
      return false;
    }

    // Basic question check
    return questionCount >= 1 && questionCount <= (this.config.allowTwoInvitesWhenStuck ? 2 : 1);
  }

  private splitIntoSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  private countQuestions(text: string): number {
    return (text.match(/\?/g) || []).length;
  }

  private isUserInputVague(input: string): boolean {
    const tokens = input.trim().split(/\s+/);
    if (tokens.length < 5) return true;
    
    // Check for strong sentiment words
    const strongWords = /feel|want|need|love|hate|excited|worried|confused|clear|stuck|breakthrough/i;
    return !strongWords.test(input);
  }

  private validateQuestions(questionCount: number, vague: boolean): boolean {
    if (vague && this.config.allowTwoInvitesWhenStuck) {
      return questionCount >= 1 && questionCount <= 2;
    }
    return questionCount === 1;
  }

  private findMirroredPhrases(response: string, userInput: string): string[] {
    const mirrors: string[] = [];
    const userWords = userInput.toLowerCase().split(/\s+/);
    const responseText = response.toLowerCase();
    
    // Look for 3-12 word phrases from user input that appear in response
    for (let start = 0; start < userWords.length - 2; start++) {
      for (let length = 3; length <= Math.min(12, userWords.length - start); length++) {
        const phrase = userWords.slice(start, start + length).join(' ');
        if (responseText.includes(phrase)) {
          mirrors.push(phrase);
        }
      }
    }
    
    return [...new Set(mirrors)]; // Remove duplicates
  }

  private calculateWarmth(text: string): number {
    const warmthIndicators = [
      /\bi notice\b/gi,
      /\bit sounds like\b/gi,
      /\byou said\b/gi,
      /\bthat resonates\b/gi,
      /\bi hear you\b/gi,
      /\byour\s+\w+\s+is\s+\w+/gi, // "your journey is unfolding"
      /\bwith you\b/gi,
      /\btogether\b/gi,
      /\bfeels?\s+like\b/gi
    ];

    let warmthScore = 0;
    warmthIndicators.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) warmthScore += matches.length;
    });

    return Math.min(warmthScore / 3, 1.0); // Normalize to 0-1
  }

  private async expandResponse(text: string, targetSentences: number): Promise<string> {
    // Add conversational depth while maintaining authenticity
    const sentences = this.splitIntoSentences(text);
    if (sentences.length >= targetSentences) return text;
    
    const expansions = [
      "I want to honor what you're sharing.",
      "There's something important in what you're expressing.",
      "This feels like a moment worth exploring.",
      "I sense there's more here."
    ];
    
    // Insert a random expansion between sentences
    const expandedSentences = [...sentences];
    if (expandedSentences.length > 1) {
      const insertPos = Math.floor(expandedSentences.length / 2);
      const expansion = expansions[Math.floor(Math.random() * expansions.length)];
      expandedSentences.splice(insertPos, 0, expansion);
    }
    
    return expandedSentences.join('. ') + '.';
  }

  private async condenseResponse(text: string, maxSentences: number): Promise<string> {
    const sentences = this.splitIntoSentences(text);
    if (sentences.length <= maxSentences) return text;
    
    // Keep the most important sentences (first, last, and questions)
    const important: number[] = [0]; // Always keep first
    
    // Find sentences with questions
    sentences.forEach((sentence, i) => {
      if (sentence.includes('?')) important.push(i);
    });
    
    // Always keep last sentence
    if (sentences.length > 1) {
      important.push(sentences.length - 1);
    }
    
    // Add remaining sentences until we hit max
    for (let i = 1; i < sentences.length - 1 && important.length < maxSentences; i++) {
      if (!important.includes(i)) important.push(i);
    }
    
    important.sort((a, b) => a - b);
    const condensed = important.slice(0, maxSentences).map(i => sentences[i]);
    
    return condensed.join('. ') + '.';
  }

  private async adjustQuestions(text: string, allowTwo: boolean): Promise<string> {
    const questionCount = this.countQuestions(text);
    
    if (questionCount === 0) {
      // Add a question with natural, modern phrasing
      const questions = allowTwo 
        ? [
            "How does this land for you? What part feels most alive right now?",
            "What's stirring as you sit with this? How are you noticing this in your body?",
            "How does this feel? What wants to emerge from here?"
          ]
        : [
            "How does this resonate with you?",
            "What's alive in this for you?",
            "How are you taking this in?"
          ];
      
      const selected = questions[Math.floor(Math.random() * questions.length)];
      return text + ' ' + selected;
    }
    
    if (questionCount > (allowTwo ? 2 : 1)) {
      // Convert excess questions to statements with natural flow
      const sentences = text.split(/[.!?]+/);
      let questionsSeen = 0;
      const maxQuestions = allowTwo ? 2 : 1;
      
      const adjusted = sentences.map(sentence => {
        if (sentence.includes('?')) {
          questionsSeen++;
          if (questionsSeen > maxQuestions) {
            // Convert to statement naturally
            return sentence.replace('?', '.').replace(/^(How|What|Where|When|Why|Who)/i, 'I wonder $1');
          }
        }
        return sentence;
      });
      
      return adjusted.join('').trim();
    }
    
    return text;
  }

  /**
   * Self-correct with relaxed, conversational guidance
   */
  private async selfCorrect(text: string, guidance: string): Promise<string> {
    // In relaxed mode, make minimal adjustments
    if (this.config.enforceMode === 'relaxed') {
      return text; // Trust the content in relaxed mode
    }
    
    // For strict mode, apply basic corrections
    const sentences = this.splitIntoSentences(text);
    
    if (sentences.length < this.config.minSentences) {
      return this.expandResponse(text, this.config.minSentences);
    }
    
    if (sentences.length > this.config.maxSentences) {
      return this.condenseResponse(text, this.config.maxSentences);
    }
    
    return text;
  }
}

/**
 * Convenience function for quick conversational validation
 */
export async function validateConversational(
  text: string, 
  userInput?: string,
  config?: Partial<ConversationalConfig>
): Promise<ValidationResult> {
  const validator = new ConversationalValidator(config);
  return validator.validate(text, userInput);
}

/**
 * Environment-aware validator factory
 */
export function createConversationalValidator(): ConversationalValidator {
  const config: Partial<ConversationalConfig> = {
    minSentences: Number(process.env.TURN_MIN_SENTENCES) || 4,
    maxSentences: Number(process.env.TURN_MAX_SENTENCES) || 12,
    allowTwoInvitesWhenStuck: process.env.ALLOW_TWO_INVITES_WHEN_STUCK === 'true',
    enforceMode: process.env.ATTENDING_ENFORCEMENT_MODE === 'relaxed' ? 'relaxed' : 'strict'
  };
  
  return new ConversationalValidator(config);
}