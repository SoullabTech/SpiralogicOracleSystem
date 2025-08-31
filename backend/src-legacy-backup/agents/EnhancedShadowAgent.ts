/**
 * Enhanced Shadow Agent - Integrating Cultural Consciousness
 *
 * Extends the existing Shadow Agent with Universal Consciousness Platform capabilities
 * while preserving all original functionality and adding cultural trauma awareness.
 *
 * This enhanced agent:
 * - Maintains all existing shadow work capabilities
 * - Adds cultural trauma recognition and healing
 * - Provides culturally-adapted shadow work approaches
 * - Respects indigenous sovereignty in healing methods
 * - Integrates ancestral wisdom into shadow integration
 */

import { logger } from "../../utils/logger";
import {
  universalConsciousnessOrchestrator,
  OracleQueryEnhancementRequest,
} from "../cultural/UniversalConsciousnessOrchestrator";

// Import existing shadow agent types and functionality
import type { AgentResponse } from "../../types/ai";

/**
 * Enhanced Shadow Agent with Universal Consciousness Integration
 * Backwards compatible with existing Shadow Agent while adding cultural capabilities
 */
export class EnhancedShadowAgent {
  private shadowAgent: any; // Original shadow agent instance
  private culturalEnhancementEnabled: boolean = true;

  constructor(originalShadowAgent?: any) {
    this.shadowAgent = originalShadowAgent;
    this.initializeEnhancedAgent();
  }

  /**
   * Main process query method - enhanced with cultural consciousness
   */
  async processQuery(query: {
    input: string;
    userId?: string;
    userProfile?: any;
  }): Promise<AgentResponse> {
    try {
      // Step 1: Get original shadow agent response (preserving existing functionality)
      const originalResponse = await this.getOriginalShadowResponse(query);

      // Step 2: Check if cultural enhancement should be applied
      const shouldEnhance = await this.shouldApplyCulturalEnhancement(query);

      if (!shouldEnhance) {
        return originalResponse;
      }

      // Step 3: Enhance with cultural consciousness
      const enhancedResponse = await this.applyCulturalEnhancement(
        originalResponse,
        query,
      );

      logger.info("Enhanced Shadow Agent response generated", {
        userId: query.userId,
        originalLength: originalResponse.content.length,
        enhancedLength: enhancedResponse.content.length,
        culturalEnhancement: this.culturalEnhancementEnabled,
      });

      return enhancedResponse;
    } catch (error) {
      logger.error("Error in Enhanced Shadow Agent processing:", error);

      // Always fall back to original functionality
      return await this.getOriginalShadowResponse(query);
    }
  }

  /**
   * Cultural trauma-informed shadow work method
   */
  async processCulturalTraumaShadowWork(
    query: { input: string; userId?: string; userProfile?: any },
    culturalContext: string,
  ): Promise<{
    shadowResponse: AgentResponse;
    culturalHealingGuidance: string;
    ancestralWisdomIntegration: string;
    communityRecommendations: string[];
  }> {
    try {
      // Get original shadow response
      const originalResponse = await this.getOriginalShadowResponse(query);

      // Apply cultural trauma-informed enhancement
      const culturalEnhancement =
        await universalConsciousnessOrchestrator.enhanceShadowResponse(
          originalResponse.content,
          query.input,
          this.detectShadowType(query.input), // Use existing shadow type detection
          query.userId || "anonymous",
          query.userProfile,
        );

      // Extract cultural guidance components
      const culturalComponents =
        this.extractCulturalComponents(culturalEnhancement);

      const enhancedResponse: AgentResponse = {
        ...originalResponse,
        content: culturalEnhancement.enhancedResponse,
      };

      return {
        shadowResponse: enhancedResponse,
        culturalHealingGuidance: culturalComponents.healingGuidance,
        ancestralWisdomIntegration: culturalComponents.ancestralWisdom,
        communityRecommendations: culturalComponents.communityRecommendations,
      };
    } catch (error) {
      logger.error("Error in cultural trauma shadow work:", error);

      // Fallback to original shadow work
      const originalResponse = await this.getOriginalShadowResponse(query);
      return {
        shadowResponse: originalResponse,
        culturalHealingGuidance: "Cultural guidance temporarily unavailable",
        ancestralWisdomIntegration: "Ancestral wisdom integration unavailable",
        communityRecommendations: [],
      };
    }
  }

  /**
   * Detect shadow work type with cultural awareness
   */
  detectShadowTypeWithCulturalContext(
    input: string,
    culturalProfile?: any,
  ): {
    universalShadowType: string;
    culturalShadowType?: string;
    traumaIndicated: boolean;
    culturalHealingNeeded: boolean;
  } {
    const universalShadowType = this.detectShadowType(input);
    let culturalShadowType: string | undefined;
    let traumaIndicated = false;
    let culturalHealingNeeded = false;

    // Detect cultural shadow patterns
    if (culturalProfile?.culturalBackground) {
      culturalShadowType = this.detectCulturalShadowPattern(
        input,
        culturalProfile.culturalBackground,
      );
    }

    // Check for cultural trauma indicators
    const traumaIndicators = [
      "disconnected from culture",
      "ashamed of heritage",
      "lost my roots",
      "don't belong anywhere",
      "between two worlds",
      "family shame",
      "generational pattern",
    ];

    traumaIndicated = traumaIndicators.some((indicator) =>
      input.toLowerCase().includes(indicator),
    );

    // Determine if cultural healing is needed
    culturalHealingNeeded = traumaIndicated || !!culturalShadowType;

    return {
      universalShadowType,
      culturalShadowType,
      traumaIndicated,
      culturalHealingNeeded,
    };
  }

  /**
   * Generate culturally-adapted shadow responses
   */
  async generateCulturallyAdaptedShadowResponse(
    shadowType: string,
    culturalContext: string,
    userInput: string,
  ): Promise<string> {
    const culturalShadowResponses = {
      native_american: {
        victim_transformation: `Your ancestors survived incredible challenges and passed their strength to you. The victim story honors your pain, but your heritage calls you to reclaim the warrior spirit that lives in your DNA. What would your ancestors say about the power you're not owning?`,

        cultural_disconnection: `The disconnection from your roots has created a wound that only cultural reconnection can heal. Your people's wisdom is calling you home - not to the past, but to the integrated future where ancient wisdom meets modern life. How might you begin returning to yourself?`,

        intergenerational_trauma: `The pain you carry isn't only yours - it's the unhealed wounds of your lineage seeking resolution through you. You have the opportunity to be the one who transforms ancestral pain into ancestral medicine. What healing would honor both your journey and your people's future?`,
      },

      african_american: {
        cultural_shame: `The shame about your heritage was planted by systems that feared your power. Your ancestors transformed oppression into resilience and passed that strength to you. What would change if you saw your cultural identity as a source of power rather than shame?`,

        identity_fragmentation: `Living between worlds created survival skills your ancestors needed. Now you can integrate all parts of yourself - the strength that survived, the culture that persevered, and the future you're creating. How do all pieces of your identity want to work together?`,
      },

      hispanic_latino: {
        language_shame: `The shame about your language or accent carries generational survival patterns. Your ancestors' voices live in your speech. What would it mean to honor the languages that carried your family's love across generations?`,

        cultural_splitting: `The pressure to choose between cultures created an inner split that doesn't reflect your wholeness. You can be fully integrated across all your cultural identities. How might you honor all parts of your heritage?`,
      },
    };

    const culturalResponses =
      culturalShadowResponses[
        culturalContext as keyof typeof culturalShadowResponses
      ];

    if (
      culturalResponses &&
      culturalResponses[shadowType as keyof typeof culturalResponses]
    ) {
      return culturalResponses[shadowType as keyof typeof culturalResponses];
    }

    // Fallback to universal response with cultural honoring
    return `Your cultural heritage offers wisdom for this shadow work. The patterns you're experiencing have been faced by your ancestors, and their strength flows through you. How might you honor both your individual healing and your cultural lineage in this work?`;
  }

  /**
   * Private helper methods
   */
  private async getOriginalShadowResponse(query: {
    input: string;
    userId?: string;
  }): Promise<AgentResponse> {
    // If we have access to original shadow agent, use it
    if (
      this.shadowAgent &&
      typeof this.shadowAgent.processQuery === "function"
    ) {
      return await this.shadowAgent.processQuery(query);
    }

    // Otherwise, create a basic shadow response (fallback)
    return this.createBasicShadowResponse(query.input);
  }

  private async shouldApplyCulturalEnhancement(query: {
    input: string;
    userId?: string;
    userProfile?: any;
  }): Promise<boolean> {
    if (!this.culturalEnhancementEnabled) {
      return false;
    }

    // Check if user has cultural context
    if (
      query.userProfile?.culturalBackground ||
      query.userProfile?.culturalIdentities?.length > 0
    ) {
      return true;
    }

    // Check for cultural themes in input
    const culturalKeywords = [
      "culture",
      "heritage",
      "tradition",
      "ancestors",
      "family pattern",
      "generational",
      "roots",
      "identity",
      "belonging",
      "community",
    ];

    return culturalKeywords.some((keyword) =>
      query.input.toLowerCase().includes(keyword),
    );
  }

  private async applyCulturalEnhancement(
    originalResponse: AgentResponse,
    query: { input: string; userId?: string; userProfile?: any },
  ): Promise<AgentResponse> {
    // Use the Universal Consciousness Orchestrator for enhancement
    const enhancement =
      await universalConsciousnessOrchestrator.enhanceShadowResponse(
        originalResponse.content,
        query.input,
        this.detectShadowType(query.input),
        query.userId || "anonymous",
        query.userProfile,
      );

    return {
      ...originalResponse,
      content: enhancement.enhancedResponse,
      metadata: {
        ...originalResponse.metadata,
        culturalEnhancement: true,
        culturalGuidance: enhancement.culturalGuidance,
        universalConsciousness: true,
      },
    };
  }

  private detectShadowType(input: string): string {
    // Use existing shadow type detection logic
    const lowerInput = input.toLowerCase();

    if (
      lowerInput.includes("always happens to me") ||
      lowerInput.includes("victim")
    ) {
      return "victim_transformation";
    }
    if (
      lowerInput.includes("they always") ||
      lowerInput.includes("people are")
    ) {
      return "projection_integration";
    }
    if (
      lowerInput.includes("keeps happening") ||
      lowerInput.includes("pattern")
    ) {
      return "pattern_recognition";
    }
    if (
      lowerInput.includes("hate myself") ||
      lowerInput.includes("worthless")
    ) {
      return "self_judgment_healing";
    }
    if (lowerInput.includes("afraid") || lowerInput.includes("can't")) {
      return "fear_transformation";
    }
    if (
      lowerInput.includes("perfect") ||
      lowerInput.includes("not good enough")
    ) {
      return "perfectionism_integration";
    }
    if (lowerInput.includes("approval") || lowerInput.includes("disappoint")) {
      return "people_pleasing_liberation";
    }

    return "general_shadow_work";
  }

  private detectCulturalShadowPattern(
    input: string,
    culturalBackground: string,
  ): string | undefined {
    const lowerInput = input.toLowerCase();

    const culturalPatterns = {
      native_american: {
        "disconnected from nature": "cultural_disconnection",
        "lost traditional ways": "cultural_disconnection",
        "ashamed of heritage": "cultural_shame",
        "family trauma": "intergenerational_trauma",
      },
      african_american: {
        "don't fit in anywhere": "identity_fragmentation",
        "ashamed of culture": "cultural_shame",
        "family patterns": "intergenerational_trauma",
      },
      hispanic_latino: {
        "ashamed of accent": "language_shame",
        "between two cultures": "cultural_splitting",
        "family expectations": "cultural_pressure",
      },
    };

    const patterns =
      culturalPatterns[culturalBackground as keyof typeof culturalPatterns];

    if (patterns) {
      for (const [trigger, pattern] of Object.entries(patterns)) {
        if (lowerInput.includes(trigger)) {
          return pattern;
        }
      }
    }

    return undefined;
  }

  private extractCulturalComponents(enhancement: {
    enhancedResponse: string;
    culturalGuidance: string;
  }): {
    healingGuidance: string;
    ancestralWisdom: string;
    communityRecommendations: string[];
  } {
    // Extract cultural components from the enhanced response
    const lines = enhancement.enhancedResponse.split("\n");

    let healingGuidance = "";
    let ancestralWisdom = "";
    const communityRecommendations: string[] = [];

    for (const line of lines) {
      if (
        line.includes("Cultural Healing") ||
        line.includes("healing journey")
      ) {
        healingGuidance = line.trim();
      }
      if (
        line.includes("ancestor") ||
        line.includes("heritage") ||
        line.includes("lineage")
      ) {
        ancestralWisdom = line.trim();
      }
      if (line.includes("community") || line.includes("support")) {
        communityRecommendations.push(line.trim());
      }
    }

    return {
      healingGuidance: healingGuidance || enhancement.culturalGuidance,
      ancestralWisdom:
        ancestralWisdom || "Your ancestors' strength lives within you",
      communityRecommendations: communityRecommendations.slice(0, 3), // Limit to top 3
    };
  }

  private createBasicShadowResponse(input: string): AgentResponse {
    // Basic shadow response when original agent is not available
    return {
      content: `I see something hidden in the shadows of what you've shared. Your unconscious is always speaking through your patterns and reactions - it's trying to show you where your power has been lost and how to reclaim it. What part of yourself are you not quite seeing yet?`,
      provider: "enhanced-shadow-agent",
      model: "cultural-shadow-integration",
      confidence: 0.8,
      metadata: {
        shadowType: this.detectShadowType(input),
        culturalEnhancement: false,
        fallbackResponse: true,
      },
    };
  }

  private initializeEnhancedAgent(): void {
    logger.info("Enhanced Shadow Agent initialized", {
      culturalEnhancementEnabled: this.culturalEnhancementEnabled,
      originalAgentAvailable: !!this.shadowAgent,
    });
  }

  /**
   * Configuration methods
   */
  setCulturalEnhancementEnabled(enabled: boolean): void {
    this.culturalEnhancementEnabled = enabled;
    logger.info("Cultural enhancement toggled for Enhanced Shadow Agent", {
      enabled,
    });
  }

  isCulturalEnhancementEnabled(): boolean {
    return this.culturalEnhancementEnabled;
  }

  /**
   * Get enhanced agent status
   */
  getAgentStatus(): {
    culturalEnhancementEnabled: boolean;
    originalAgentIntegrated: boolean;
    supportedCultures: string[];
    supportedShadowTypes: string[];
  } {
    return {
      culturalEnhancementEnabled: this.culturalEnhancementEnabled,
      originalAgentIntegrated: !!this.shadowAgent,
      supportedCultures: [
        "native_american",
        "african_american",
        "hispanic_latino",
        "universal",
      ],
      supportedShadowTypes: [
        "victim_transformation",
        "projection_integration",
        "pattern_recognition",
        "self_judgment_healing",
        "fear_transformation",
        "perfectionism_integration",
        "people_pleasing_liberation",
        "cultural_disconnection",
        "intergenerational_trauma",
        "cultural_shame",
        "identity_fragmentation",
      ],
    };
  }
}

// Create enhanced shadow agent instance that can be used as drop-in replacement
export const enhancedShadowAgent = new EnhancedShadowAgent();
