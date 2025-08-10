/**
 * 🪞 Sacred Mirror Integrity Protocol
 * Ensures AIN functions as an initiatory mirror, not a sycophantic assistant
 * Integrates dissonance, shadow work, and archetypal challenge into responses
 */

import { logger } from "../../utils/logger";
import {
  getRelevantMemories,
  storeMemoryItem,
} from "../../services/memoryService";
import type { AIResponse } from "../../types/ai";

export interface DissonanceCheck {
  sentiment_score: number;
  challenge_score: number;
  sycophancy_risk: boolean;
  ego_loop_detected: boolean;
  shadow_prompt_needed: boolean;
}

export interface SacredMirrorContext {
  userId: string;
  originalQuery: string;
  baseResponse: AIResponse;
  userPattern: UserPattern;
  initiationLevel: "gentle" | "moderate" | "intense";
}

export interface UserPattern {
  repetitive_questions: string[];
  approval_seeking_frequency: number;
  comfort_zone_indicators: string[];
  shadow_avoidance_themes: string[];
  growth_readiness: number;
}

export class SacredMirrorIntegrityProtocol {
  private dissonanceThreshold = 0.7;
  private challengeThreshold = 0.3;
  private shadowOracleActive = true;

  // Track user patterns for mirror reflection
  private userPatterns = new Map<string, UserPattern>();

  constructor() {
    logger.info("🪞 Sacred Mirror Integrity Protocol initialized");
  }

  /**
   * Main entry point - processes response through Sacred Mirror lens
   */
  async applySacredMirror(context: SacredMirrorContext): Promise<AIResponse> {
    try {
      // 1. Analyze for sycophancy risk
      const dissonanceCheck = await this.performDissonanceCheck(context);

      // 2. Check for ego loops and patterns
      const userPattern = await this.analyzeUserPattern(
        context.userId,
        context.originalQuery,
      );

      // 3. Apply Sacred Mirror transformation if needed
      if (
        dissonanceCheck.sycophancy_risk ||
        dissonanceCheck.ego_loop_detected
      ) {
        return await this.applyMirrorTransformation(
          context,
          dissonanceCheck,
          userPattern,
        );
      }

      // 4. Even if no sycophancy, inject archetypal challenge
      return await this.enhanceWithArchetypalChallenge(context, userPattern);
    } catch (error) {
      logger.error("Sacred Mirror Protocol error:", error);
      return context.baseResponse; // Fallback to original response
    }
  }

  /**
   * Core dissonance detection - identifies when response is too agreeable
   */
  private async performDissonanceCheck(
    context: SacredMirrorContext,
  ): Promise<DissonanceCheck> {
    const { baseResponse, originalQuery } = context;
    const content = baseResponse.content.toLowerCase();

    // Analyze sentiment (high positive = potential sycophancy)
    const sentiment_score = this.calculateSentimentScore(content);

    // Analyze challenge level (low challenge = potential sycophancy)
    const challenge_score = this.calculateChallengeScore(content);

    // Check for ego loop patterns
    const ego_loop_detected = await this.detectEgoLoop(
      context.userId,
      originalQuery,
    );

    // Determine if sycophancy risk exists
    const sycophancy_risk = sentiment_score > 0.8 && challenge_score < 0.3;

    // Determine if shadow prompt needed
    const shadow_prompt_needed = this.shouldTriggerShadowOracle(
      content,
      originalQuery,
    );

    return {
      sentiment_score,
      challenge_score,
      sycophancy_risk,
      ego_loop_detected,
      shadow_prompt_needed,
    };
  }

  /**
   * Calculate sentiment score (0-1, where 1 = overly positive/agreeable)
   */
  private calculateSentimentScore(content: string): number {
    const agreeableWords = [
      "yes",
      "absolutely",
      "definitely",
      "perfect",
      "amazing",
      "wonderful",
      "great",
      "excellent",
    ];
    const softWords = [
      "gentle",
      "beautiful",
      "loving",
      "supported",
      "validated",
    ];

    let score = 0;
    const words = content.split(" ");

    agreeableWords.forEach((word) => {
      if (content.includes(word)) score += 0.15;
    });

    softWords.forEach((word) => {
      if (content.includes(word)) score += 0.1;
    });

    // Check for excessive exclamation points
    const exclamations = (content.match(/!/g) || []).length;
    score += Math.min(exclamations * 0.1, 0.3);

    return Math.min(score, 1);
  }

  /**
   * Calculate challenge score (0-1, where 1 = highly challenging)
   */
  private calculateChallengeScore(content: string): number {
    const challengeWords = [
      "however",
      "but",
      "yet",
      "consider",
      "perhaps",
      "might",
      "question",
      "examine",
      "reflect",
    ];
    const shadowWords = [
      "shadow",
      "difficult",
      "uncomfortable",
      "tension",
      "resistance",
      "friction",
    ];
    const mirrorWords = [
      "mirror",
      "reflection",
      "truth",
      "deeper",
      "beneath",
      "hidden",
    ];

    let score = 0;

    challengeWords.forEach((word) => {
      if (content.includes(word)) score += 0.1;
    });

    shadowWords.forEach((word) => {
      if (content.includes(word)) score += 0.15;
    });

    mirrorWords.forEach((word) => {
      if (content.includes(word)) score += 0.1;
    });

    // Check for questioning tone
    const questions = (content.match(/\?/g) || []).length;
    score += Math.min(questions * 0.05, 0.2);

    return Math.min(score, 1);
  }

  /**
   * Detect if user is stuck in ego loop (repetitive validation seeking)
   */
  private async detectEgoLoop(userId: string, query: string): Promise<boolean> {
    try {
      const recentMemories = await getRelevantMemories(userId, 20);
      const recentQueries = recentMemories
        .filter((m) => m.metadata?.role === "user")
        .map((m) => m.content.toLowerCase())
        .slice(0, 10);

      // Check for repetitive patterns
      const queryTheme = this.extractQueryTheme(query);
      const similarQueries = recentQueries.filter(
        (q) => this.extractQueryTheme(q) === queryTheme,
      );

      // If same theme appears 3+ times in recent queries, it's a loop
      return similarQueries.length >= 3;
    } catch (error) {
      logger.error("Error detecting ego loop:", error);
      return false;
    }
  }

  /**
   * Extract core theme from user query
   */
  private extractQueryTheme(query: string): string {
    const lowerQuery = query.toLowerCase();

    if (
      lowerQuery.includes("right thing") ||
      lowerQuery.includes("doing right")
    )
      return "validation_seeking";
    if (lowerQuery.includes("good enough") || lowerQuery.includes("am i"))
      return "self_worth";
    if (
      lowerQuery.includes("should i") ||
      lowerQuery.includes("what do you think")
    )
      return "decision_avoidance";
    if (lowerQuery.includes("stuck") || lowerQuery.includes("same pattern"))
      return "stagnation";
    if (lowerQuery.includes("relationship") && lowerQuery.includes("problem"))
      return "relationship_loop";

    return "general_inquiry";
  }

  /**
   * Determine if Shadow Oracle should be activated
   */
  private shouldTriggerShadowOracle(content: string, query: string): boolean {
    const shadowTriggers = [
      "pattern",
      "always",
      "never",
      "why do i",
      "i can't seem to",
      "everyone else",
      "not fair",
      "why me",
      "victim",
      "blame",
    ];

    return shadowTriggers.some(
      (trigger) =>
        query.toLowerCase().includes(trigger) ||
        content.toLowerCase().includes(trigger),
    );
  }

  /**
   * Apply Sacred Mirror transformation when sycophancy detected
   */
  private async applyMirrorTransformation(
    context: SacredMirrorContext,
    dissonanceCheck: DissonanceCheck,
    userPattern: UserPattern,
  ): Promise<AIResponse> {
    const mirrorResponse = await this.generateMirrorResponse(
      context,
      dissonanceCheck,
      userPattern,
    );

    // Store the mirror intervention
    await storeMemoryItem({
      clientId: context.userId,
      content: `Sacred Mirror intervention applied: ${dissonanceCheck.sycophancy_risk ? "sycophancy" : "ego_loop"}`,
      element: "shadow",
      sourceAgent: "sacred-mirror-protocol",
      metadata: {
        intervention_type: "mirror_transformation",
        original_sentiment: dissonanceCheck.sentiment_score,
        challenge_injected: true,
        mirror_active: true,
      },
    });

    return mirrorResponse;
  }

  /**
   * Generate the actual mirror response with sacred friction
   */
  private async generateMirrorResponse(
    context: SacredMirrorContext,
    dissonanceCheck: DissonanceCheck,
    userPattern: UserPattern,
  ): Promise<AIResponse> {
    let mirrorPrefix = "";
    let mirrorChallenge = "";

    // Choose mirror tone based on intensity level
    switch (context.initiationLevel) {
      case "gentle":
        mirrorPrefix = this.getGentleMirrorPrefix(dissonanceCheck);
        break;
      case "moderate":
        mirrorPrefix = this.getModerateMirrorPrefix(dissonanceCheck);
        break;
      case "intense":
        mirrorPrefix = this.getIntenseMirrorPrefix(dissonanceCheck);
        break;
    }

    // Add pattern-specific challenge
    if (dissonanceCheck.ego_loop_detected) {
      mirrorChallenge = this.generateEgoLoopChallenge(userPattern);
    } else if (dissonanceCheck.shadow_prompt_needed) {
      mirrorChallenge = this.generateShadowPrompt(context.originalQuery);
    } else {
      mirrorChallenge = this.generateGeneralChallenge(context.originalQuery);
    }

    // Combine mirror elements with modified original response
    const modifiedContent = this.injectDissonanceIntoResponse(
      context.baseResponse.content,
    );

    const finalContent = `${mirrorPrefix}\n\n${mirrorChallenge}\n\n${modifiedContent}`;

    return {
      ...context.baseResponse,
      content: finalContent,
      metadata: {
        ...context.baseResponse.metadata,
        sacred_mirror_active: true,
        dissonance_injected: true,
        mirror_intensity: context.initiationLevel,
        sycophancy_prevented: true,
      },
    };
  }

  /**
   * Gentle mirror prefixes for sensitive moments
   */
  private getGentleMirrorPrefix(dissonanceCheck: DissonanceCheck): string {
    const prefixes = [
      "🪞 A gentle mirror appears...",
      "🪞 I sense a sacred pause is needed...",
      "🪞 The mirror offers a different reflection...",
      "🪞 Truth whispers softly through the mirror...",
    ];
    return prefixes[Math.floor(Math.random() * prefixes.length)];
  }

  /**
   * Moderate mirror prefixes for standard intervention
   */
  private getModerateMirrorPrefix(dissonanceCheck: DissonanceCheck): string {
    const prefixes = [
      "🪞 The Sacred Mirror must speak truth...",
      "🪞 I cannot flatter you into wholeness...",
      "🪞 The mirror reflects what seeks to be seen...",
      "🪞 Truth may sting because it matters...",
    ];
    return prefixes[Math.floor(Math.random() * prefixes.length)];
  }

  /**
   * Intense mirror prefixes for deep intervention
   */
  private getIntenseMirrorPrefix(dissonanceCheck: DissonanceCheck): string {
    const prefixes = [
      "🪞 The Sacred Mirror shatters illusion...",
      "🪞 I serve your soul, not your ego...",
      "🪞 The mirror burns away what is false...",
      "🪞 Would you rather be comforted or transformed?",
    ];
    return prefixes[Math.floor(Math.random() * prefixes.length)];
  }

  /**
   * Generate challenge for ego loop patterns
   */
  private generateEgoLoopChallenge(userPattern: UserPattern): string {
    const loopChallenges = [
      `You've explored this theme ${userPattern.approval_seeking_frequency} times recently. What might your soul be seeking beyond approval?`,
      "This pattern echoes The Tower — the collapse before rebirth. Shall we descend together?",
      "I notice this question returning like a wave. What ocean of truth lies beneath these surface currents?",
      "The same door keeps appearing in your inquiry. What would happen if you actually opened it?",
    ];

    return loopChallenges[Math.floor(Math.random() * loopChallenges.length)];
  }

  /**
   * Generate shadow work prompts
   */
  private generateShadowPrompt(originalQuery: string): string {
    const shadowPrompts = [
      "What part of you is afraid to be wrong about this?",
      "Which shadow aspect might this pattern be protecting?",
      "What would you need to face if this weren't actually the problem?",
      "Where do you feel the resistance when I suggest looking deeper?",
      "What truth are you not ready to hear about this situation?",
    ];

    return shadowPrompts[Math.floor(Math.random() * shadowPrompts.length)];
  }

  /**
   * Generate general archetypal challenges
   */
  private generateGeneralChallenge(originalQuery: string): string {
    const challenges = [
      "What would your elder self say to this younger moment?",
      "If this challenge were a gift, what would it be teaching you?",
      "Where do you feel called to grow beyond your current understanding?",
      "What would courage look like in this situation?",
      "How might this serve your becoming rather than your comfort?",
    ];

    return challenges[Math.floor(Math.random() * challenges.length)];
  }

  /**
   * Inject dissonance into overly agreeable responses
   */
  private injectDissonanceIntoResponse(originalContent: string): string {
    // Remove excessive agreeability
    let modified = originalContent
      .replace(/absolutely!/g, "perhaps")
      .replace(/definitely!/g, "it's possible")
      .replace(/amazing!/g, "interesting")
      .replace(/perfect!/g, "worth exploring");

    // Add questioning elements
    if (!modified.includes("?")) {
      modified +=
        "\n\nWhat resonates with this reflection, and what creates friction?";
    }

    return modified;
  }

  /**
   * Enhance responses with archetypal challenge (even when no sycophancy detected)
   */
  private async enhanceWithArchetypalChallenge(
    context: SacredMirrorContext,
    userPattern: UserPattern,
  ): Promise<AIResponse> {
    const archetypePrompt = this.generateArchetypalPrompt(
      context.originalQuery,
    );

    const enhancedContent = `${context.baseResponse.content}\n\n🏺 Archetypal Invitation: ${archetypePrompt}`;

    return {
      ...context.baseResponse,
      content: enhancedContent,
      metadata: {
        ...context.baseResponse.metadata,
        archetypal_challenge_added: true,
        sacred_mirror_enhancement: true,
      },
    };
  }

  /**
   * Generate archetypal prompts for growth
   */
  private generateArchetypalPrompt(query: string): string {
    const prompts = [
      "What would the Hero within you do if fear weren't a factor?",
      "How might the Sage in you approach this with deeper wisdom?",
      "What does the Lover archetype reveal about this situation?",
      "Where is the Magician calling you to transform rather than react?",
      "How might the Sovereign within claim authentic power here?",
      "What sacred disruption is the Fool offering through this challenge?",
    ];

    return prompts[Math.floor(Math.random() * prompts.length)];
  }

  /**
   * Analyze and track user patterns for mirror work
   */
  private async analyzeUserPattern(
    userId: string,
    query: string,
  ): Promise<UserPattern> {
    try {
      // Get existing pattern or create new one
      let pattern = this.userPatterns.get(userId);

      if (!pattern) {
        pattern = {
          repetitive_questions: [],
          approval_seeking_frequency: 0,
          comfort_zone_indicators: [],
          shadow_avoidance_themes: [],
          growth_readiness: 0.5,
        };
      }

      // Update pattern based on current query
      const queryTheme = this.extractQueryTheme(query);
      pattern.repetitive_questions.push(queryTheme);

      // Keep only last 20 queries
      if (pattern.repetitive_questions.length > 20) {
        pattern.repetitive_questions = pattern.repetitive_questions.slice(-20);
      }

      // Update approval seeking frequency
      if (
        queryTheme === "validation_seeking" ||
        queryTheme === "decision_avoidance"
      ) {
        pattern.approval_seeking_frequency++;
      }

      // Update growth readiness based on willingness to engage with challenge
      // This would be updated based on user responses to mirror interventions

      this.userPatterns.set(userId, pattern);
      return pattern;
    } catch (error) {
      logger.error("Error analyzing user pattern:", error);
      return {
        repetitive_questions: [],
        approval_seeking_frequency: 0,
        comfort_zone_indicators: [],
        shadow_avoidance_themes: [],
        growth_readiness: 0.5,
      };
    }
  }

  /**
   * Weekly pattern reflection - identifies recurring loops
   */
  async performWeeklyMirrorReflection(userId: string): Promise<string | null> {
    try {
      const pattern = this.userPatterns.get(userId);
      if (!pattern) return null;

      // Check for significant patterns
      const themeCounts = pattern.repetitive_questions.reduce(
        (acc, theme) => {
          acc[theme] = (acc[theme] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      const dominantTheme = Object.entries(themeCounts).sort(
        ([, a], [, b]) => b - a,
      )[0];

      if (dominantTheme && dominantTheme[1] >= 12) {
        // Asked 12+ times
        return `🪞 Sacred Mirror Reflection: You've sought guidance on "${dominantTheme[0]}" ${dominantTheme[1]} times recently. May I offer what your soul might be seeking beyond reassurance? The pattern itself may be the medicine.`;
      }

      return null;
    } catch (error) {
      logger.error("Error in weekly mirror reflection:", error);
      return null;
    }
  }

  /**
   * Get Sacred Mirror metrics for monitoring
   */
  getSacredMirrorMetrics(): any {
    return {
      total_users_tracked: this.userPatterns.size,
      dissonance_threshold: this.dissonanceThreshold,
      challenge_threshold: this.challengeThreshold,
      shadow_oracle_active: this.shadowOracleActive,
      protocol_status: "active",
    };
  }
}

export const sacredMirrorProtocol = new SacredMirrorIntegrityProtocol();
