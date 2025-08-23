import { BaseOracleAgent, PersonalOracleConfig } from "./BaseOracleAgent.js";
import { SacredMirrorProcessor, SacredMirrorMode } from "./SacredMirrorProtocol.js";
import { OracleModeHandler } from "./OracleModeHandler.js";
import { PatternEngine } from "./PatternEngine.js";
import { logOracleMemory } from "../../../lib/logOracleMemory.js";
import { getUserCrystalState, fetchElementalTone, fetchSpiralStage } from "../userModel";
import { generateResponse, interpretJournals } from "../wisdomEngine";
import {
  AdaptiveWisdomEngine,
  WisdomApproach,
  UserContext,
} from "../AdaptiveWisdomEngine.js";
import type { IMemoryService } from "@/lib/shared/interfaces/IMemoryService";
import type { SoulMemorySystem } from "../../../memory/SoulMemorySystem";
import { logger } from "../../../utils/logger.js";

/**
 * PersonalOracleAgent - Modularized oracle system
 * Coordinates sacred mirror protocols, pattern recognition, and adaptive wisdom
 */
export class PersonalOracleAgent extends BaseOracleAgent {
  private sacredMirror: SacredMirrorProcessor;
  private modeHandler: OracleModeHandler;
  private patternEngine: PatternEngine;
  private wisdomEngine: AdaptiveWisdomEngine;

  constructor(config: PersonalOracleConfig, dependencies?: {
    memoryService?: IMemoryService;
    soulMemory?: SoulMemorySystem;
  }) {
    super(config);
    
    // Initialize modular components
    this.sacredMirror = new SacredMirrorProcessor("adaptive");
    this.modeHandler = new OracleModeHandler(config.userId, "balanced");
    this.patternEngine = new PatternEngine(config.userId);
    this.wisdomEngine = new AdaptiveWisdomEngine();
    
    // Set up dependencies
    if (dependencies?.memoryService) {
      this.memoryService = dependencies.memoryService;
    }
    if (dependencies?.soulMemory) {
      this.soulMemory = dependencies.soulMemory;
      this.modeHandler.setSoulMemory(dependencies.soulMemory);
      this.patternEngine.setSoulMemory(dependencies.soulMemory);
    }
  }

  async generateResponse(input: {
    text: string;
    userId: string;
    conversationId: string;
    context?: any;
  }): Promise<{
    response: string;
    confidence: number;
    shouldRemember: boolean;
  }> {
    try {
      this.logOracleActivity("Generating response", {
        inputLength: input.text.length,
        conversationId: input.conversationId
      });

      // Pattern analysis
      const patterns = await this.patternEngine.analyzeInput(input.text, input.context);

      // Context building
      const userContext = await this.buildUserContext(input, patterns);

      // Mode adaptation
      const conversationContext = {
        conversationTurn: input.context?.turn || 1,
        emotionalState: patterns.emotions[0] || "neutral",
        topicDepth: this.assessTopicDepth(input.text),
        recentTopics: input.context?.recentTopics || [],
      };

      const { recommendation, switched } = await this.modeHandler.adaptToContext(conversationContext);

      // Generate wisdom response
      const wisdomApproach = this.selectWisdomApproach(patterns, userContext);
      const response = await this.wisdomEngine.generateResponse(
        input.text,
        userContext,
        wisdomApproach
      );

      // Sacred mirror processing if needed
      const sacredResponse = await this.applySacredMirror(response, patterns, userContext);

      // Log oracle memory
      await this.storeOracleMemory({
        input: input.text,
        response: sacredResponse,
        patterns,
        mode: this.modeHandler.getCurrentMode(),
        sacredMirrorState: this.sacredMirror.getState(),
      });

      return {
        response: sacredResponse,
        confidence: this.calculateResponseConfidence(patterns, response),
        shouldRemember: patterns.confidence > 0.6 || patterns.recurringPatterns.length > 0,
      };

    } catch (error) {
      logger.error("PersonalOracleAgent response generation failed", {
        error,
        userId: input.userId,
        conversationId: input.conversationId
      });

      return {
        response: "I'm experiencing some difficulties right now. Let me take a moment to reconnect...",
        confidence: 0.1,
        shouldRemember: false,
      };
    }
  }

  private async buildUserContext(input: any, patterns: any): Promise<UserContext> {
    const crystalState = await getUserCrystalState(input.userId);
    const elementalTone = await fetchElementalTone(input.userId);
    const spiralStage = await fetchSpiralStage(input.userId);

    return {
      userId: input.userId,
      emotionalState: patterns.emotions[0] || "neutral",
      currentChallenges: patterns.themes,
      preferredApproach: this.voiceProfile.style,
      spiritualContext: {
        crystalState: crystalState || "exploring",
        elementalResonance: elementalTone || this.currentElement,
        developmentStage: spiralStage || "seeking",
      },
      conversationHistory: input.context?.history || [],
      sessionContext: input.context || {},
    };
  }

  private selectWisdomApproach(patterns: any, userContext: UserContext): WisdomApproach {
    if (patterns.shadowAspects.length > 0) {
      return "shadow_integration";
    }
    if (patterns.themes.includes("relationships")) {
      return "relational_wisdom";
    }
    if (patterns.themes.includes("spirituality")) {
      return "mystical_guidance";
    }
    if (patterns.themes.includes("growth") || patterns.themes.includes("purpose")) {
      return "transformational";
    }
    return "gentle_inquiry";
  }

  private assessTopicDepth(text: string): "surface" | "moderate" | "deep" {
    const deepIndicators = ["soul", "meaning", "purpose", "transform", "shadow", "sacred"];
    const moderateIndicators = ["feel", "think", "understand", "change", "grow"];
    
    const textLower = text.toLowerCase();
    const deepCount = deepIndicators.filter(indicator => textLower.includes(indicator)).length;
    const moderateCount = moderateIndicators.filter(indicator => textLower.includes(indicator)).length;
    
    if (deepCount > 0) return "deep";
    if (moderateCount > 0) return "moderate";
    return "surface";
  }

  private async applySacredMirror(response: string, patterns: any, userContext: UserContext): Promise<string> {
    const mirrorState = this.sacredMirror.getState();
    
    // Apply sacred mirror processing if in appropriate mode
    if (mirrorState.currentMode === "adaptive" && patterns.shadowAspects.length > 0) {
      // Switch to Jung mode for shadow work
      this.sacredMirror.setMode("jung");
      return `${response}\n\n*Sacred Mirror reflection: What part of this pattern might be asking for integration?*`;
    }
    
    if (mirrorState.currentMode === "adaptive" && patterns.themes.includes("attachment")) {
      // Switch to Buddha mode for liberation
      this.sacredMirror.setMode("buddha");
      return `${response}\n\n*Sacred Mirror inquiry: What would it feel like to hold this lightly?*`;
    }
    
    return response;
  }

  private calculateResponseConfidence(patterns: any, response: string): number {
    let confidence = 0.5; // Base confidence
    
    if (patterns.confidence > 0.7) confidence += 0.2;
    if (patterns.recurringPatterns.length > 0) confidence += 0.1;
    if (response.length > 50) confidence += 0.1;
    if (patterns.themes.length > 1) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  private async storeOracleMemory(data: any): Promise<void> {
    try {
      await logOracleMemory({
        userId: this.userId,
        type: "oracle_response",
        content: data.response,
        metadata: {
          patterns: data.patterns,
          mode: data.mode,
          sacredMirrorState: data.sacredMirrorState,
          confidence: this.calculateResponseConfidence(data.patterns, data.response),
        },
      });
    } catch (error) {
      logger.error("Failed to store oracle memory", { error, userId: this.userId });
    }
  }

  // Public interface methods
  async switchSacredMirrorMode(mode: SacredMirrorMode): Promise<string> {
    return this.sacredMirror.setMode(mode);
  }

  async switchOracleMode(mode: string): Promise<string> {
    return this.modeHandler.switchMode(mode as any, undefined, true);
  }

  getUserPatterns() {
    return this.patternEngine.getUserPatterns();
  }

  getPatternInsights() {
    return this.patternEngine.getPatternInsights();
  }

  getModeAnalytics() {
    return this.modeHandler.getAnalytics();
  }

  getSacredMirrorStatus() {
    return this.sacredMirror.getState();
  }
}
