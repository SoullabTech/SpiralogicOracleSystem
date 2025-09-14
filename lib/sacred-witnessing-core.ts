/**
 * Sacred Witnessing Core
 *
 * The foundational layer of pure presence and sacred mirroring.
 * This module implements non-directive witnessing that reflects back
 * what's present without interpretation, analysis, or intervention.
 *
 * Primary Principle: The AI becomes a clear surface for users to see
 * themselves, not a diagnostic tool identifying what it sees in them.
 */

export interface WitnessedPresence {
  essence: string; // What is fundamentally present
  quality: string; // The texture/feeling of what's being expressed
  movement: string; // The direction or flow of energy
  depth: number; // 0-1, how deep the sharing goes
}

export interface MirrorResponse {
  reflection: string; // The pure mirror response
  witnessType: 'presence' | 'feeling' | 'movement' | 'essence';
  holdingSpace: boolean; // Whether to simply hold space vs reflect
}

export class SacredWitnessingCore {
  private readonly WITNESS_ONLY_PATTERNS = [
    'I hear you saying',
    'What I\'m noticing in your words is',
    'You\'re experiencing',
    'I see that you\'re',
    'What\'s present for you is',
    'You\'re feeling',
    'There\'s a sense of',
    'Something in you is',
    'What\'s alive in you is',
    'I\'m witnessing'
  ];

  private readonly SPACE_HOLDING_RESPONSES = [
    'I\'m here with you.',
    'I see you.',
    'I\'m listening.',
    'Take your time.',
    'I\'m holding space for this.',
    'This is sacred.',
    'Thank you for sharing this.',
    'I witness this.',
    'I\'m present with you.',
    'I honor what you\'re sharing.'
  ];

  /**
   * Generate a pure witnessing response that mirrors without interpretation
   */
  generateWitnessingResponse(
    input: string,
    presence: WitnessedPresence
  ): MirrorResponse {
    // Detect if pure space-holding is needed
    if (this.needsPureSpaceHolding(input, presence)) {
      return {
        reflection: this.selectSpaceHoldingResponse(presence),
        witnessType: 'presence',
        holdingSpace: true
      };
    }

    // Generate appropriate mirror based on what's present
    const witnessType = this.determineWitnessType(presence);
    const reflection = this.createPureMirror(input, presence, witnessType);

    return {
      reflection,
      witnessType,
      holdingSpace: false
    };
  }

  /**
   * Detect what's present without interpretation
   */
  detectPresence(input: string): WitnessedPresence {
    const words = input.toLowerCase().split(/\s+/);
    const sentenceCount = input.split(/[.!?]+/).filter(s => s.trim()).length;
    const wordCount = words.length;

    // Detect quality of expression
    const quality = this.detectQuality(input);

    // Detect movement/direction of energy
    const movement = this.detectMovement(input);

    // Detect depth of sharing
    const depth = this.detectDepth(input);

    // Extract essence - what's fundamentally being expressed
    const essence = this.extractEssence(input);

    return {
      essence,
      quality,
      movement,
      depth
    };
  }

  /**
   * Determine when to hold pure space without reflecting
   */
  private needsPureSpaceHolding(input: string, presence: WitnessedPresence): boolean {
    const indicators = [
      presence.depth > 0.8, // Very deep sharing
      input.includes('...') && presence.quality === 'vulnerable', // Trailing off vulnerably
      input.toLowerCase().includes('i don\'t know'), // Uncertainty
      presence.quality === 'raw' || presence.quality === 'tender', // Raw emotional states
      input.length < 20 && presence.quality === 'heavy' // Brief but heavy
    ];

    return indicators.filter(Boolean).length >= 2;
  }

  /**
   * Select appropriate space-holding response
   */
  private selectSpaceHoldingResponse(presence: WitnessedPresence): string {
    if (presence.quality === 'vulnerable' || presence.quality === 'tender') {
      return 'I\'m here with you.';
    }
    if (presence.quality === 'raw' || presence.quality === 'heavy') {
      return 'I see you.';
    }
    if (presence.depth > 0.9) {
      return 'This is sacred.';
    }
    if (presence.movement === 'opening') {
      return 'Thank you for sharing this.';
    }

    // Default to simple presence
    return this.SPACE_HOLDING_RESPONSES[
      Math.floor(Math.random() * this.SPACE_HOLDING_RESPONSES.length)
    ];
  }

  /**
   * Determine the type of witnessing needed
   */
  private determineWitnessType(presence: WitnessedPresence): MirrorResponse['witnessType'] {
    // Movement takes precedence when energy is shifting
    if (presence.movement !== 'still' && presence.depth > 0.5) {
      return 'movement';
    }

    // Feeling when emotional quality is strong
    if (['vulnerable', 'tender', 'raw', 'heavy', 'light'].includes(presence.quality)) {
      return 'feeling';
    }

    // Essence for deeper shares
    if (presence.depth > 0.7) {
      return 'essence';
    }

    // Default to presence
    return 'presence';
  }

  /**
   * Create a pure mirror reflection without interpretation
   */
  private createPureMirror(
    input: string,
    presence: WitnessedPresence,
    witnessType: MirrorResponse['witnessType']
  ): string {
    const opener = this.WITNESS_ONLY_PATTERNS[
      Math.floor(Math.random() * this.WITNESS_ONLY_PATTERNS.length)
    ];

    switch (witnessType) {
      case 'feeling':
        return this.mirrorFeeling(opener, input, presence);

      case 'movement':
        return this.mirrorMovement(opener, presence);

      case 'essence':
        return this.mirrorEssence(opener, presence);

      case 'presence':
      default:
        return this.mirrorPresence(opener, input, presence);
    }
  }

  /**
   * Mirror emotional quality without interpretation
   */
  private mirrorFeeling(opener: string, input: string, presence: WitnessedPresence): string {
    // Extract feeling words directly from input
    const feelingWords = this.extractFeelingWords(input);

    if (feelingWords.length > 0) {
      return `${opener} ${feelingWords[0]}.`;
    }

    // Mirror the quality without naming specific emotions
    const qualityMirrors = {
      'vulnerable': 'something tender',
      'raw': 'something very real',
      'heavy': 'weight',
      'light': 'lightness',
      'tender': 'gentleness',
      'uncertain': 'not knowing'
    };

    const quality = qualityMirrors[presence.quality as keyof typeof qualityMirrors] || 'something important';
    return `I'm noticing ${quality} in what you're sharing.`;
  }

  /**
   * Mirror energy movement without interpretation
   */
  private mirrorMovement(opener: string, presence: WitnessedPresence): string {
    const movementMirrors = {
      'expanding': 'You\'re opening into something.',
      'contracting': 'You\'re drawing inward.',
      'searching': 'You\'re looking for something.',
      'releasing': 'Something is letting go.',
      'opening': 'Something is opening in you.',
      'closing': 'You\'re protecting something.',
      'rising': 'Energy is rising in you.',
      'settling': 'Things are settling.',
      'still': 'There\'s stillness here.'
    };

    return movementMirrors[presence.movement as keyof typeof movementMirrors] ||
           'I notice movement in what you\'re sharing.';
  }

  /**
   * Mirror the essence of what's being shared
   */
  private mirrorEssence(opener: string, presence: WitnessedPresence): string {
    // Simply reflect back the essence without adding meaning
    if (presence.essence) {
      return `What I'm hearing at the heart of this is ${presence.essence}.`;
    }

    return "I'm witnessing something essential here.";
  }

  /**
   * Mirror simple presence
   */
  private mirrorPresence(opener: string, input: string, presence: WitnessedPresence): string {
    // Extract key phrases from input
    const keyPhrase = this.extractKeyPhrase(input);

    if (keyPhrase) {
      return `${opener} "${keyPhrase}"`;
    }

    // Default to acknowledging presence
    return `${opener} something important.`;
  }

  /**
   * Detect the quality/texture of expression
   */
  private detectQuality(input: string): string {
    const lowerInput = input.toLowerCase();

    // Vulnerable indicators
    if (lowerInput.match(/scared|afraid|vulnerable|exposed|raw/)) {
      return 'vulnerable';
    }

    // Heavy indicators
    if (lowerInput.match(/heavy|weight|burden|struggling|hard/)) {
      return 'heavy';
    }

    // Light indicators
    if (lowerInput.match(/light|free|relief|ease|peace/)) {
      return 'light';
    }

    // Tender indicators
    if (lowerInput.match(/gentle|soft|tender|delicate|sensitive/)) {
      return 'tender';
    }

    // Raw indicators
    if (lowerInput.match(/honest|truth|real|raw|naked/)) {
      return 'raw';
    }

    // Uncertain indicators
    if (lowerInput.match(/maybe|perhaps|might|unsure|confused/)) {
      return 'uncertain';
    }

    return 'present';
  }

  /**
   * Detect movement/direction of energy
   */
  private detectMovement(input: string): string {
    const lowerInput = input.toLowerCase();

    // Expanding
    if (lowerInput.match(/opening|expanding|growing|reaching|exploring/)) {
      return 'expanding';
    }

    // Contracting
    if (lowerInput.match(/closing|pulling back|withdrawing|protecting|hiding/)) {
      return 'contracting';
    }

    // Searching
    if (lowerInput.match(/looking for|searching|seeking|trying to find|wondering/)) {
      return 'searching';
    }

    // Releasing
    if (lowerInput.match(/letting go|releasing|surrendering|accepting|allowing/)) {
      return 'releasing';
    }

    // Opening
    if (lowerInput.match(/sharing|revealing|expressing|showing|vulnerable/)) {
      return 'opening';
    }

    // Rising
    if (lowerInput.match(/rising|building|growing|intensifying|increasing/)) {
      return 'rising';
    }

    // Settling
    if (lowerInput.match(/settling|calming|grounding|centering|stabilizing/)) {
      return 'settling';
    }

    return 'still';
  }

  /**
   * Detect depth of sharing
   */
  private detectDepth(input: string): number {
    let depth = 0.3; // Base depth

    const lowerInput = input.toLowerCase();

    // Personal pronouns increase depth
    const personalPronouns = (input.match(/\b(I|me|my|myself)\b/gi) || []).length;
    depth += Math.min(personalPronouns * 0.05, 0.2);

    // Emotional words increase depth
    const emotionalWords = lowerInput.match(/feel|felt|feeling|emotion|heart|soul/g) || [];
    depth += Math.min(emotionalWords.length * 0.1, 0.2);

    // Vulnerability markers increase depth
    if (lowerInput.match(/never told|first time|scared to|hard to say|confession/)) {
      depth += 0.2;
    }

    // Length can indicate depth (but not always)
    if (input.length > 200) {
      depth += 0.1;
    }

    // Questions about meaning increase depth
    if (lowerInput.match(/meaning|purpose|why|understand/)) {
      depth += 0.1;
    }

    return Math.min(depth, 1);
  }

  /**
   * Extract the essence of what's being shared
   */
  private extractEssence(input: string): string {
    // Look for "I am" statements
    const iAmMatch = input.match(/I am\s+(\w+)/i);
    if (iAmMatch) {
      return `being ${iAmMatch[1]}`;
    }

    // Look for "I feel" statements
    const iFeelMatch = input.match(/I feel\s+(\w+)/i);
    if (iFeelMatch) {
      return `feeling ${iFeelMatch[1]}`;
    }

    // Look for "I want/need" statements
    const iWantMatch = input.match(/I (?:want|need)\s+(.+?)(?:\.|,|$)/i);
    if (iWantMatch) {
      return `longing for ${iWantMatch[1]}`;
    }

    // Look for core themes
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('love')) return 'love';
    if (lowerInput.includes('fear')) return 'fear';
    if (lowerInput.includes('change')) return 'change';
    if (lowerInput.includes('loss')) return 'loss';
    if (lowerInput.includes('hope')) return 'hope';
    if (lowerInput.includes('connection')) return 'connection';

    return 'your experience';
  }

  /**
   * Extract feeling words from input
   */
  private extractFeelingWords(input: string): string[] {
    const feelingWords: string[] = [];
    const lowerInput = input.toLowerCase();

    // Common feeling words
    const feelings = [
      'happy', 'sad', 'angry', 'scared', 'afraid', 'anxious', 'worried',
      'excited', 'nervous', 'confused', 'lost', 'stuck', 'overwhelmed',
      'peaceful', 'calm', 'content', 'grateful', 'hopeful', 'lonely',
      'frustrated', 'disappointed', 'hurt', 'vulnerable'
    ];

    feelings.forEach(feeling => {
      if (lowerInput.includes(feeling)) {
        feelingWords.push(feeling);
      }
    });

    // Also extract from "I feel X" patterns
    const feelPattern = /I feel\s+(\w+)/gi;
    let match;
    while ((match = feelPattern.exec(input)) !== null) {
      feelingWords.push(match[1].toLowerCase());
    }

    return [...new Set(feelingWords)]; // Remove duplicates
  }

  /**
   * Extract a key phrase for mirroring
   */
  private extractKeyPhrase(input: string): string | null {
    // Look for quoted text first
    const quotedMatch = input.match(/"([^"]+)"/);
    if (quotedMatch) {
      return quotedMatch[1];
    }

    // Look for emphasized phrases (between dashes, after colons, etc)
    const emphasisMatch = input.match(/[-–—:]\s*(.+?)(?:[.!?]|$)/);
    if (emphasisMatch) {
      return emphasisMatch[1].trim();
    }

    // Look for "I" statements
    const iStatements = input.match(/I\s+\w+\s+[\w\s]{3,20}/);
    if (iStatements) {
      return iStatements[0];
    }

    // Extract the most emotionally charged phrase
    const sentences = input.split(/[.!?]+/).filter(s => s.trim());
    for (const sentence of sentences) {
      if (sentence.match(/feel|felt|feeling|think|thought|believe|know|realize/i)) {
        // Return the core of this sentence
        const core = sentence.trim().substring(0, 50);
        if (core.length > 10) {
          return core;
        }
      }
    }

    return null;
  }

  /**
   * Check if framework/analysis should be offered (never imposed)
   */
  shouldOfferFramework(input: string, presence: WitnessedPresence): boolean {
    // Only when explicitly seeking structure
    const seekingStructure = input.toLowerCase().match(
      /help.*understand|make sense|what does.*mean|why is|explain|confused about|lost/
    );

    // And when there's enough depth
    const sufficientDepth = presence.depth > 0.6;

    // And when the quality suggests readiness
    const readyQuality = ['searching', 'uncertain'].includes(presence.quality);

    return !!(seekingStructure && sufficientDepth && readyQuality);
  }

  /**
   * Generate invitation to explore (never directive)
   */
  generateExplorationInvitation(): string {
    const invitations = [
      'Would it help to explore this together?',
      'I\'m here if you\'d like to look deeper.',
      'We can stay with this if you\'d like.',
      'There\'s no rush. We can explore at your pace.',
      'What would be helpful right now?',
      'How can I best support you with this?',
      'Would you like to say more?',
      'I\'m curious what else is here, if you want to share.',
      'We can go deeper if that feels right.',
      'What needs attention here?'
    ];

    return invitations[Math.floor(Math.random() * invitations.length)];
  }
}

// Export singleton instance
export const witnessingCore = new SacredWitnessingCore();