import { logger } from "../../../utils/logger.js";
import { WisdomRouter, type WisdomApproach, type UserContext, type Pattern, type WisdomRouting } from "./WisdomRouter.js";
import { PatternDetector, type PatternAnalysis } from "./PatternDetector.js";
import { ApproachHandlers, type ApproachResponse } from "./ApproachHandlers.js";

export { WisdomApproach, UserContext, Pattern, WisdomRouting } from "./WisdomRouter.js";
export { PatternAnalysis } from "./PatternDetector.js";
export { ApproachResponse } from "./ApproachHandlers.js";

export interface WisdomEngineResponse {
  response: string;
  approach: WisdomApproach;
  confidence: number;
  patternAnalysis: PatternAnalysis;
  routing: WisdomRouting;
  therapeuticFraming: string;
  followUpSuggestions: string[];
  integrationPrompt?: string;
}

/**
 * AdaptiveWisdomEngine - Modularized wisdom processing system
 * Coordinates pattern detection, wisdom routing, and response generation
 */
export class AdaptiveWisdomEngine {
  private wisdomRouter: WisdomRouter;
  private patternDetector: PatternDetector;
  private approachHandlers: ApproachHandlers;
  private responseHistory: Map<string, WisdomEngineResponse[]> = new Map();

  constructor() {
    this.wisdomRouter = new WisdomRouter();
    this.patternDetector = new PatternDetector();
    this.approachHandlers = new ApproachHandlers();
  }

  async generateResponse(
    input: string,
    userContext: UserContext,
    preferredApproach?: WisdomApproach
  ): Promise<string> {
    try {
      const fullResponse = await this.generateFullResponse(input, userContext, preferredApproach);
      return fullResponse.response;
    } catch (error) {
      logger.error("AdaptiveWisdomEngine response generation failed", {
        error,
        userId: userContext.userId
      });
      return "I'm experiencing some difficulty right now. Let me take a moment to reconnect with you...";
    }
  }

  async generateFullResponse(
    input: string,
    userContext: UserContext,
    preferredApproach?: WisdomApproach
  ): Promise<WisdomEngineResponse> {
    try {
      logger.info("Generating wisdom response", {
        userId: userContext.userId,
        inputLength: input.length,
        preferredApproach
      });

      // 1. Detect patterns in input
      const conversationHistory = this.getConversationHistory(userContext.userId);
      const patternAnalysis = this.patternDetector.detectPatterns(
        input, 
        userContext, 
        conversationHistory
      );

      // 2. Route to appropriate wisdom approach
      const patterns = patternAnalysis.detectedPatterns;
      const routing = this.wisdomRouter.routeWisdomApproach(
        userContext, 
        patterns, 
        userContext.currentChallenges[0] as any // This would need proper typing
      );

      // 3. Use preferred approach if provided and reasonable
      const selectedApproach = this.selectFinalApproach(
        preferredApproach, 
        routing.selectedApproach, 
        patternAnalysis
      );

      // 4. Generate response using selected approach
      const approachResponse = await this.approachHandlers.generateResponse(
        input,
        userContext,
        selectedApproach,
        patternAnalysis
      );

      // 5. Create final response
      const wisdomResponse: WisdomEngineResponse = {
        response: approachResponse.response,
        approach: selectedApproach,
        confidence: this.calculateOverallConfidence(routing.confidence, approachResponse.confidence),
        patternAnalysis,
        routing,
        therapeuticFraming: approachResponse.therapeuticFraming,
        followUpSuggestions: approachResponse.followUpSuggestions,
        integrationPrompt: approachResponse.integrationPrompt
      };

      // 6. Store in history for future reference
      this.storeResponseHistory(userContext.userId, wisdomResponse);

      // 7. Update effectiveness metrics
      this.updateEffectivenessMetrics(selectedApproach, wisdomResponse.confidence);

      logger.info("Wisdom response generated successfully", {
        userId: userContext.userId,
        approach: selectedApproach,
        confidence: wisdomResponse.confidence,
        patternsDetected: patterns.length
      });

      return wisdomResponse;
    } catch (error) {
      logger.error("AdaptiveWisdomEngine full response generation failed", {
        error,
        userId: userContext.userId
      });
      
      return this.getErrorResponse(error);
    }
  }

  private selectFinalApproach(
    preferredApproach: WisdomApproach | undefined,
    routedApproach: WisdomApproach,
    patternAnalysis: PatternAnalysis
  ): WisdomApproach {
    // If no preference, use routed approach
    if (!preferredApproach) {
      return routedApproach;
    }

    // If preferred approach is safe for the context, use it
    if (this.isApproachSafeForContext(preferredApproach, patternAnalysis)) {
      return preferredApproach;
    }

    // Otherwise, use routed approach for safety
    logger.info("Overriding preferred approach for safety", {
      preferred: preferredApproach,
      selected: routedApproach,
      reason: "Context safety"
    });
    
    return routedApproach;
  }

  private isApproachSafeForContext(
    approach: WisdomApproach, 
    analysis: PatternAnalysis
  ): boolean {
    // Don't use shadow integration if no shadow patterns detected
    if (approach === "shadow_integration" && analysis.shadowSignals.length === 0) {
      return false;
    }

    // Don't use Buddha approach if high attachment without readiness indicators
    if (approach === "buddha" && 
        analysis.attachmentMarkers.length > 3 && 
        analysis.spiritualIndicators.length === 0) {
      return false;
    }

    // Generally safe approaches
    if (["gentle_inquiry", "relational_wisdom", "transformational"].includes(approach)) {
      return true;
    }

    return true; // Default to allowing approach
  }

  private calculateOverallConfidence(
    routingConfidence: number, 
    approachConfidence: number
  ): number {
    // Weighted average with slight preference for routing confidence
    return (routingConfidence * 0.6) + (approachConfidence * 0.4);
  }

  private storeResponseHistory(userId: string, response: WisdomEngineResponse): void {
    const history = this.responseHistory.get(userId) || [];
    history.push(response);
    
    // Keep last 20 responses
    if (history.length > 20) {
      history.shift();
    }
    
    this.responseHistory.set(userId, history);
  }

  private updateEffectivenessMetrics(
    approach: WisdomApproach, 
    confidence: number
  ): void {
    // Update wisdom router effectiveness scores
    this.wisdomRouter.updateEffectiveness(approach, confidence);
  }

  private getConversationHistory(userId: string): any[] {
    const history = this.responseHistory.get(userId) || [];
    return history.slice(-5); // Return last 5 responses for context
  }

  private getErrorResponse(error: any): WisdomEngineResponse {
    return {
      response: "I'm experiencing some difficulty right now. Let me take a moment to reconnect with you...",
      approach: "gentle_inquiry",
      confidence: 0.1,
      patternAnalysis: {
        detectedPatterns: [],
        dominantThemes: [],
        emotionalUndercurrents: [],
        spiritualIndicators: [],
        attachmentMarkers: [],
        shadowSignals: [],
        integrationOpportunities: []
      },
      routing: {
        selectedApproach: "gentle_inquiry",
        confidence: 0.1,
        reasoning: "Error recovery mode",
        backupApproaches: ["hybrid"]
      },
      therapeuticFraming: "Supportive presence",
      followUpSuggestions: [
        "Take your time - there's no rush",
        "What support would be most helpful right now?"
      ]
    };
  }

  // Public interface methods
  getUserHistory(userId: string): WisdomEngineResponse[] {
    return this.responseHistory.get(userId) || [];
  }

  getApproachStats(): Record<WisdomApproach, number> {
    return this.wisdomRouter.getEffectivenessStats();
  }

  clearUserHistory(userId: string): void {
    this.responseHistory.delete(userId);
  }

  clearAllPatternCache(): void {
    this.patternDetector.clearCache();
  }

  getPatternCacheStats(): { size: number; keys: string[] } {
    return this.patternDetector.getCacheStats();
  }

  // For testing and debugging
  async testPatternDetection(
    input: string, 
    userContext: UserContext
  ): Promise<PatternAnalysis> {
    return this.patternDetector.detectPatterns(input, userContext);
  }

  async testWisdomRouting(
    userContext: UserContext, 
    patterns: Pattern[]
  ): Promise<WisdomRouting> {
    return this.wisdomRouter.routeWisdomApproach(userContext, patterns);
  }
}
