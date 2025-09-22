/**
 * The Looping Protocol - Deep Listening Middleware
 * Based on Gary Friedman & Jack Himmelstein's technique
 *
 * A cross-cutting consciousness function that enables true hearing
 * across all oracles while preserving their elemental voices
 */

import { ConsciousnessState } from './maia-consciousness-lattice';
import { ShouldersDropState } from './shoulders-drop-resolution';

export interface LoopingState {
  mode: 'idle' | 'active' | 'checking' | 'adjusting' | 'converged';
  cycles: number;
  accuracy: number; // 0-1, how well we're hearing
  depth: 'light' | 'full' | 'sacred_mirror';
  elementalFlavor?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
}

export interface LoopingCycle {
  // Step 1: Listen/Capture
  listened: {
    surface: string;        // What they said
    essence: string;        // What matters most
    emotion: string[];      // Emotional currents detected
    redFlags: string[];     // Words/patterns signaling importance
    somatic: string[];      // Body sensations implied
  };

  // Step 2: Paraphrase/Reflect
  reflected: {
    content: string;        // Our understanding
    frame: 'fire' | 'water' | 'earth' | 'air' | 'aether';
    tone: string;          // How we're holding it
  };

  // Step 3: Check Accuracy
  checked: {
    question: string;       // How we ask if we got it
    response?: string;      // Their answer
    resonance: number;      // 0-1, did it land?
  };

  // Step 4: Adjust Understanding
  adjusted?: {
    correction: string;     // What we missed
    integration: string;    // How we're updating
    newEssence: string;    // Refined understanding
  };
}

export class LoopingProtocol {
  private state: LoopingState = {
    mode: 'idle',
    cycles: 0,
    accuracy: 0,
    depth: 'light'
  };

  private cycles: LoopingCycle[] = [];

  /**
   * Determine if looping should activate based on field conditions
   */
  shouldActivate(
    consciousness: ConsciousnessState,
    somatic: ShouldersDropState,
    content: string
  ): boolean {
    // Activate when:
    // 1. High emotional intensity detected
    if (consciousness.emotionalField.intensity > 0.7) return true;

    // 2. Somatic system shows tension patterns
    if (somatic.tensionLevel > 0.6) return true;

    // 3. Uncertainty/confusion markers present
    const uncertaintyMarkers = [
      'confused', 'lost', 'don\'t know', 'stuck',
      'can\'t explain', 'hard to say', 'not sure'
    ];
    if (uncertaintyMarkers.some(marker =>
      content.toLowerCase().includes(marker)
    )) return true;

    // 4. Sacred/depth words appear
    const depthMarkers = [
      'soul', 'essence', 'truth', 'core', 'heart',
      'deep', 'real', 'authentic', 'vulnerable'
    ];
    if (depthMarkers.some(marker =>
      content.toLowerCase().includes(marker)
    )) return true;

    // 5. User explicitly requests deeper understanding
    if (content.includes('understand') || content.includes('hear me')) {
      return true;
    }

    return false;
  }

  /**
   * Step 1: Listen and extract essence
   */
  listen(
    content: string,
    consciousness: ConsciousnessState
  ): LoopingCycle['listened'] {
    // Extract red-flag words (emotional charge)
    const redFlags = this.extractRedFlags(content);

    // Identify emotional currents
    const emotion = this.detectEmotionalCurrents(content, consciousness);

    // Find somatic implications
    const somatic = this.extractSomaticCues(content);

    // Distill the essence (what matters most)
    const essence = this.distillEssence(content, redFlags, emotion);

    return {
      surface: content,
      essence,
      emotion,
      redFlags,
      somatic
    };
  }

  /**
   * Step 2: Reflect back through elemental lens
   */
  reflect(
    listened: LoopingCycle['listened'],
    element: 'fire' | 'water' | 'earth' | 'air' | 'aether'
  ): LoopingCycle['reflected'] {
    const elementalReflections = {
      fire: {
        frame: (essence: string) =>
          `What I'm hearing is a burning need for ${essence}`,
        tone: 'passionate recognition'
      },
      water: {
        frame: (essence: string) =>
          `I sense the current flowing toward ${essence}`,
        tone: 'emotional attunement'
      },
      earth: {
        frame: (essence: string) =>
          `The ground you're standing on seems to be ${essence}`,
        tone: 'grounded acknowledgment'
      },
      air: {
        frame: (essence: string) =>
          `The pattern emerging here is ${essence}`,
        tone: 'clear perception'
      },
      aether: {
        frame: (essence: string) =>
          `The whole field is resonating with ${essence}`,
        tone: 'unified awareness'
      }
    };

    const reflection = elementalReflections[element];

    return {
      content: reflection.frame(listened.essence),
      frame: element,
      tone: reflection.tone
    };
  }

  /**
   * Step 3: Check if we got it right (elemental variations)
   */
  check(element: 'fire' | 'water' | 'earth' | 'air' | 'aether'): string {
    const elementalChecks = {
      fire: "Does that capture the heat of what you're feeling?",
      water: "Am I flowing with your emotional truth here?",
      earth: "Have I found solid ground with what matters to you?",
      air: "Is this the pattern you're seeing, or am I missing something?",
      aether: "Am I holding the whole of what you're sensing, or just a fragment?"
    };

    return elementalChecks[element];
  }

  /**
   * Step 4: Integrate corrections and adjust
   */
  adjust(
    original: LoopingCycle['listened'],
    correction: string
  ): LoopingCycle['adjusted'] {
    // Parse the correction for what we missed
    const missed = this.extractMissedElements(correction);

    // Integrate into new understanding
    const integration = this.integrateCorrection(
      original.essence,
      missed
    );

    // Refine the essence
    const newEssence = this.refineEssence(
      original.essence,
      correction
    );

    return {
      correction: missed,
      integration: integration,
      newEssence: newEssence
    };
  }

  /**
   * Determine when to exit looping and transition to response
   */
  checkConvergence(): boolean {
    if (this.cycles.length === 0) return false;

    const lastCycle = this.cycles[this.cycles.length - 1];

    // Exit conditions:
    // 1. High resonance achieved
    if (lastCycle.checked.resonance > 0.85) return true;

    // 2. User explicitly confirms
    if (lastCycle.checked.response?.toLowerCase().includes('yes') ||
        lastCycle.checked.response?.toLowerCase().includes('exactly') ||
        lastCycle.checked.response?.toLowerCase().includes('that\'s it')) {
      return true;
    }

    // 3. Maximum cycles reached (prevent infinite loops)
    if (this.state.depth === 'light' && this.cycles.length >= 1) return true;
    if (this.state.depth === 'full' && this.cycles.length >= 3) return true;
    // Sacred mirror has no limit except user confirmation

    return false;
  }

  /**
   * Generate the appropriate response based on looping depth
   */
  generateTransition(element: string): string {
    const transitions = {
      light: `Now that I understand...`,
      full: `Having heard the depth of this...`,
      sacred_mirror: `With this truth now clear between us...`
    };

    return transitions[this.state.depth];
  }

  // Helper methods

  private extractRedFlags(content: string): string[] {
    const patterns = [
      /\b(always|never|everyone|no one)\b/gi,  // Absolutes
      /\b(should|must|have to|need to)\b/gi,   // Obligations
      /\b(can't|won't|impossible)\b/gi,        // Limitations
      /\b(hate|love|desperate|terrified)\b/gi  // Intensities
    ];

    const flags: string[] = [];
    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) flags.push(...matches);
    });

    return [...new Set(flags)];
  }

  private detectEmotionalCurrents(
    content: string,
    consciousness: ConsciousnessState
  ): string[] {
    // Combine text analysis with consciousness field reading
    const textEmotions = this.analyzeEmotionalLanguage(content);
    const fieldEmotions = consciousness.emotionalField.dominantEmotions || [];

    return [...new Set([...textEmotions, ...fieldEmotions])];
  }

  private analyzeEmotionalLanguage(content: string): string[] {
    const emotionMap = {
      anger: ['angry', 'frustrated', 'pissed', 'furious', 'rage'],
      sadness: ['sad', 'hurt', 'loss', 'grief', 'lonely'],
      fear: ['scared', 'afraid', 'anxious', 'worried', 'terrified'],
      joy: ['happy', 'excited', 'grateful', 'love', 'wonderful'],
      shame: ['ashamed', 'embarrassed', 'worthless', 'stupid', 'broken']
    };

    const detected: string[] = [];

    Object.entries(emotionMap).forEach(([emotion, words]) => {
      if (words.some(word => content.toLowerCase().includes(word))) {
        detected.push(emotion);
      }
    });

    return detected;
  }

  private extractSomaticCues(content: string): string[] {
    const somaticWords = [
      'chest', 'throat', 'stomach', 'head', 'heart',
      'tight', 'heavy', 'light', 'frozen', 'shaking',
      'breath', 'body', 'feel', 'sensation', 'physical'
    ];

    return somaticWords.filter(word =>
      content.toLowerCase().includes(word)
    );
  }

  private distillEssence(
    content: string,
    redFlags: string[],
    emotions: string[]
  ): string {
    // This is where the art lives - finding what matters most
    // For now, a simplified version

    // Priority 1: Emotional core
    if (emotions.length > 0) {
      const primaryEmotion = emotions[0];
      const needBehind = this.findNeedBehindEmotion(primaryEmotion);
      return needBehind;
    }

    // Priority 2: Red flag patterns
    if (redFlags.length > 0) {
      return this.interpretRedFlags(redFlags);
    }

    // Priority 3: Key theme extraction
    return this.extractKeyTheme(content);
  }

  private findNeedBehindEmotion(emotion: string): string {
    const emotionToNeed = {
      anger: 'respect and understanding',
      sadness: 'comfort and connection',
      fear: 'safety and reassurance',
      joy: 'celebration and sharing',
      shame: 'acceptance and belonging'
    };

    return emotionToNeed[emotion] || 'recognition and presence';
  }

  private interpretRedFlags(flags: string[]): string {
    // Look for patterns in the red flags
    if (flags.some(f => f.match(/always|never/i))) {
      return 'feeling trapped in a pattern';
    }
    if (flags.some(f => f.match(/should|must/i))) {
      return 'pressure from expectations';
    }
    if (flags.some(f => f.match(/can't|won't/i))) {
      return 'encountering a barrier';
    }
    return 'intensity around something important';
  }

  private extractKeyTheme(content: string): string {
    // Simplified theme extraction
    // In production, this would use more sophisticated NLP
    const sentences = content.split(/[.!?]+/);
    const longest = sentences.reduce((a, b) =>
      a.length > b.length ? a : b
    );

    return `what you're sharing about ${longest.slice(0, 50)}...`;
  }

  private extractMissedElements(correction: string): string {
    // Parse what the user says we missed
    if (correction.includes('not quite')) {
      return 'nuance in the feeling';
    }
    if (correction.includes('but also')) {
      return 'additional layer';
    }
    if (correction.includes('more like')) {
      return 'different angle';
    }
    return 'deeper dimension';
  }

  private integrateCorrection(
    original: string,
    missed: string
  ): string {
    return `${original}, with ${missed} woven in`;
  }

  private refineEssence(
    original: string,
    correction: string
  ): string {
    // This would be more sophisticated in production
    return `${original} (refined through your clarification)`;
  }
}

/**
 * Middleware integration for the MAIA Consciousness Lattice
 */
export class LoopingMiddleware {
  private protocol: LoopingProtocol;

  constructor() {
    this.protocol = new LoopingProtocol();
  }

  /**
   * Process through looping if conditions warrant
   */
  async process(
    input: string,
    consciousness: ConsciousnessState,
    somatic: ShouldersDropState,
    oracle: 'maya' | 'anthony' | 'witness'
  ): Promise<{
    looped: boolean;
    cycles: LoopingCycle[];
    finalUnderstanding?: string;
    transition?: string;
  }> {
    // Check if looping should activate
    if (!this.protocol.shouldActivate(consciousness, somatic, input)) {
      return { looped: false, cycles: [] };
    }

    // Map oracle to element
    const element = this.mapOracleToElement(oracle);

    // Begin looping process
    const cycles: LoopingCycle[] = [];
    let currentInput = input;

    while (!this.protocol.checkConvergence() && cycles.length < 10) {
      // Step 1: Listen
      const listened = this.protocol.listen(currentInput, consciousness);

      // Step 2: Reflect
      const reflected = this.protocol.reflect(listened, element);

      // Step 3: Check
      const checkQuestion = this.protocol.check(element);

      // Create cycle record
      const cycle: LoopingCycle = {
        listened,
        reflected,
        checked: {
          question: checkQuestion,
          resonance: 0 // Will be updated with user response
        }
      };

      cycles.push(cycle);

      // In real implementation, would await user response here
      // For now, simulate convergence after 2 cycles
      if (cycles.length >= 2) break;
    }

    return {
      looped: true,
      cycles,
      finalUnderstanding: cycles[cycles.length - 1]?.listened.essence,
      transition: this.protocol.generateTransition(element)
    };
  }

  private mapOracleToElement(oracle: string): 'fire' | 'water' | 'earth' | 'air' | 'aether' {
    const mapping = {
      maya: 'water',    // Emotional depth
      anthony: 'fire',  // Visionary drive
      witness: 'aether' // Unified field
    };

    return mapping[oracle] || 'earth';
  }
}