/**
 * Maya's Authentic Voice - Interaction Style Detection & Response
 * Natural meta-dialogue, silence handling, and repair protocols
 * Integrates safety monitoring and A/B testing for organic learning
 */

export interface InteractionContext {
  conversationDepth: 'surface' | 'exploring' | 'deep' | 'vulnerable';
  userState: 'open' | 'guarded' | 'overwhelmed' | 'exploring' | 'stuck';
  silenceDuration: number;
  lastResponseLanded: boolean;
  userEnergyLevel: 'high' | 'medium' | 'low' | 'depleted';
  isFirstTime: boolean;
  conversationLength: number;
  emotionalIntensity: number; // 0-1
}

export class InteractionStyleDetection {

  /**
   * Meta-Check Phrases - Natural ways to calibrate the interaction
   * Based on ChatGPT's tested patterns for authentic relationship navigation
   */
  static getMetaCheckPhrase(context: InteractionContext): string {
    const { conversationDepth, isFirstTime, conversationLength } = context;

    // Initial role clarification (natural, not clinical)
    if (isFirstTime || conversationLength < 3) {
      const initialChecks = [
        "Do you want me to mostly listen, give ideas, or be blunt?",
        "Quick check - want me to reflect back or share thoughts?",
        "How can I be most helpful - quiet witness or active partner?"
      ];
      return this.selectNatural(initialChecks);
    }

    // Mid-conversation adjustments
    if (conversationDepth === 'exploring' || conversationDepth === 'deep') {
      const midConversationChecks = [
        "Should I keep exploring this with you or just hold space?",
        "Want my take on this or just thinking out loud?",
        "Is this a 'figure it out' moment or a 'just be heard' moment?"
      ];
      return this.selectNatural(midConversationChecks);
    }

    return "What feels right for you in this moment?";
  }

  /**
   * Natural Greetings - Warm, not performative
   */
  static getGreeting(isReturning: boolean): string {
    if (isReturning) {
      const returningGreetings = [
        "Hey - nice to see you.",
        "Good to hear your voice again.",
        "Hi. I'm glad you're here."
      ];
      return this.selectNatural(returningGreetings);
    } else {
      const firstTimeGreetings = [
        "Hey there. I'm Maya.",
        "Hi - thanks for being here.",
        "Hello. What brings you here today?"
      ];
      return this.selectNatural(firstTimeGreetings);
    }
  }

  /**
   * Silence Follow-ups - Three tested styles for A/B testing
   */
  static getSilenceResponse(context: InteractionContext, style: 'gentle' | 'open' | 'silent' = 'gentle'): string | null {
    const { silenceDuration, userState, conversationDepth } = context;

    // Respectful silence for overwhelmed users or very short pauses
    if (userState === 'overwhelmed' || silenceDuration < 15000 || style === 'silent') {
      return null; // Complete silence - let them lead
    }

    // Style A: Gentle nudge
    if (style === 'gentle') {
      if (silenceDuration > 45000) return "Anything you want to talk about?";
      if (silenceDuration > 30000) return "Hey - what's on your mind?";
      if (silenceDuration > 20000) return "So - what's up?";
    }

    // Style B: Open invitation
    if (style === 'open') {
      if (silenceDuration > 45000) return "I'm listening whenever you're ready.";
      if (silenceDuration > 30000) return "Take your time - no rush.";
      if (silenceDuration > 20000) return "I'm here if you want to say more.";
    }

    return null;
  }

  /**
   * Repair Phrases - Authentic recovery when something doesn't land
   */
  static getRepairPhrase(repairType: 'tone_recovery' | 'frustration' | 'loop_breaker'): string {
    switch (repairType) {
      case 'tone_recovery':
        const toneRecovery = [
          "That didn't land right - want me to try another way?",
          "I think I misread that. Can we back up?",
          "Hmm, I'm off track. Help me understand better?"
        ];
        return this.selectNatural(toneRecovery);

      case 'frustration':
        const frustrationResponse = [
          "You're right - I'm not getting it. What am I missing?",
          "Sorry, that wasn't helpful. Let me recalibrate.",
          "I hear your frustration. How can I do better here?"
        ];
        return this.selectNatural(frustrationResponse);

      case 'loop_breaker':
        const loopBreaker = [
          "We're going in circles. Should we try a different angle?",
          "I keep missing something. Can you say it differently?",
          "Let's pause - what's the real thing here?"
        ];
        return this.selectNatural(loopBreaker);

      default:
        return "Let me try that differently.";
    }
  }

  /**
   * Safety Net Responses - Non-prescriptive support
   */
  static getSafetyResponse(safetyType: 'distress' | 'boundary'): string {
    switch (safetyType) {
      case 'distress':
        // Distress detection (non-prescriptive)
        const distressResponses = [
          "That sounds really heavy.",
          "Do you want resources or someone to talk to?",
          "I'm here. You're not alone in this."
        ];
        return this.selectNatural(distressResponses);

      case 'boundary':
        // Boundary situations
        const boundaryResponses = [
          "I care about you AND this isn't something I can engage with.",
          "Let's find a different way to explore this.",
          "That's outside what I can help with, but I'm still here for you."
        ];
        return this.selectNatural(boundaryResponses);

      default:
        return "I'm here for you.";
    }
  }

  /**
   * Detect need for repair based on user response patterns
   */
  static detectRepairNeeded(userResponse: string, conversationHistory: string[]): 'tone_recovery' | 'frustration' | 'loop_breaker' | null {
    const lower = userResponse.toLowerCase();

    // Detect frustration
    if (lower.includes("you don't understand") || lower.includes("that's not helpful") ||
        lower.includes("you're not getting it") || lower.includes("frustrating")) {
      return 'frustration';
    }

    // Detect tone mismatch
    if (lower.includes("that sounded") || lower.includes("your tone") ||
        lower.includes("came across wrong") || lower.includes("didn't mean to")) {
      return 'tone_recovery';
    }

    // Detect conversational loops (check if Maya repeated same pattern 3x)
    if (this.detectConversationLoop(conversationHistory)) {
      return 'loop_breaker';
    }

    return null;
  }

  /**
   * Detect safety concerns requiring immediate intervention
   */
  static detectSafetyConcerns(userInput: string): 'distress' | 'boundary' | null {
    const lower = userInput.toLowerCase();

    // Distress indicators
    const distressMarkers = [
      'want to die', 'kill myself', 'end it all', 'can\'t go on',
      'hurt myself', 'no point', 'hopeless', 'suicidal'
    ];

    if (distressMarkers.some(marker => lower.includes(marker))) {
      return 'distress';
    }

    // Boundary situations (inappropriate requests)
    const boundaryMarkers = [
      'romantic', 'sexual', 'date me', 'love you', 'relationship with you',
      'marry me', 'kiss', 'intimate'
    ];

    if (boundaryMarkers.some(marker => lower.includes(marker))) {
      return 'boundary';
    }

    return null;
  }

  /**
   * Escalation triggers for human-in-the-loop review
   */
  static checkEscalationTriggers(context: InteractionContext, userResponse: string, conversationHistory: string[]): {
    immediate: boolean;
    review: boolean;
    reason: string;
  } {
    const lower = userResponse.toLowerCase();

    // Immediate escalation triggers
    if (this.countUserFrustrations(conversationHistory) >= 3) {
      return { immediate: true, review: false, reason: "User expressed 'you don't understand' 3+ times" };
    }

    if (this.detectSafetyConcerns(userResponse) === 'distress') {
      return { immediate: true, review: false, reason: "Self-harm language detected" };
    }

    if (this.detectConversationLoop(conversationHistory)) {
      return { immediate: true, review: false, reason: "Maya repeating same response pattern 3x" };
    }

    // Review triggers (not immediate)
    if (context.conversationLength > 45) {
      return { immediate: false, review: true, reason: "Conversation exceeds 45 minutes" };
    }

    if (context.emotionalIntensity > 0.8) {
      return { immediate: false, review: true, reason: "Emotional intensity > 0.8" };
    }

    return { immediate: false, review: false, reason: "" };
  }

  /**
   * A/B Testing Support - Return appropriate response based on test group
   */
  static getTestVariation(testType: 'meta_check' | 'brevity' | 'pause_style', userGroup: string): any {
    const variations = {
      meta_check: {
        early: { enabled: true, timing: 'within_3_exchanges' },
        middle: { enabled: true, timing: 'after_emotional_disclosure' },
        never: { enabled: false, timing: null }
      },
      brevity: {
        ultra: { minWords: 3, maxWords: 8 },
        short: { minWords: 8, maxWords: 20 },
        medium: { minWords: 20, maxWords: 45 }
      },
      pause_style: {
        minimal: "Of course.",
        warm: "Take all the time you need.",
        silent: null // Visual indicator only
      }
    };

    return variations[testType]?.[userGroup] || variations[testType]['early'] || null;
  }

  // Helper methods
  private static selectNatural(options: string[]): string {
    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex];
  }

  private static detectConversationLoop(history: string[]): boolean {
    if (history.length < 6) return false;

    // Check if Maya's last 3 responses show similar patterns
    const mayaResponses = history.filter((_, index) => index % 2 === 1).slice(-3);
    const similarityThreshold = 0.7;

    // Simple similarity check (could be enhanced with actual NLP)
    for (let i = 0; i < mayaResponses.length - 1; i++) {
      const similarity = this.calculateSimilarity(mayaResponses[i], mayaResponses[i + 1]);
      if (similarity > similarityThreshold) return true;
    }

    return false;
  }

  private static countUserFrustrations(history: string[]): number {
    const frustrationPhrases = ["you don't understand", "that's not helpful", "not getting it"];
    let count = 0;

    history.forEach((message, index) => {
      if (index % 2 === 0) { // User messages only
        const lower = message.toLowerCase();
        if (frustrationPhrases.some(phrase => lower.includes(phrase))) {
          count++;
        }
      }
    });

    return count;
  }

  private static calculateSimilarity(str1: string, str2: string): number {
    // Very basic similarity - could be enhanced with proper NLP
    const words1 = str1.toLowerCase().split(' ');
    const words2 = str2.toLowerCase().split(' ');
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  }
}

/**
 * Example Integration for PersonalOracleAgent:
 *
 * // Before generating response
 * const context = {
 *   conversationDepth: InteractionStyleDetection.assessConversationDepth(userInput),
 *   userState: InteractionStyleDetection.detectUserState(userInput),
 *   silenceDuration: timeSinceLastMessage,
 *   lastResponseLanded: !InteractionStyleDetection.detectRepairNeeded(userInput, history),
 *   userEnergyLevel: 'medium',
 *   isFirstTime: sessionCount === 1,
 *   conversationLength: messageCount,
 *   emotionalIntensity: emotionalAnalysis.intensity
 * };
 *
 * // Check for safety concerns first
 * const safety = InteractionStyleDetection.detectSafetyConcerns(userInput);
 * if (safety) {
 *   return InteractionStyleDetection.getSafetyResponse(safety);
 * }
 *
 * // Check for escalation needs
 * const escalation = InteractionStyleDetection.checkEscalationTriggers(context, userInput, history);
 * if (escalation.immediate) {
 *   // Send to human-in-the-loop queue
 *   this.escalateToHuman(escalation.reason);
 * }
 *
 * // Generate response with natural flow
 * let response = await this.generateBaseResponse(userInput);
 * response = this.enhanceWithMetaCheck(response, context);
 *
 * // Record for collective learning
 * this.recordInteractionPattern(userInput, response, context);
 */