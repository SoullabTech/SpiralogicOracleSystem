import { logger } from "../../../utils/logger.js";
import { OracleModeType } from "../../../types/oracleMode.js";

export type WisdomApproach = 
  | "jung" 
  | "buddha" 
  | "hybrid" 
  | "gentle_inquiry" 
  | "shadow_integration" 
  | "relational_wisdom" 
  | "mystical_guidance" 
  | "transformational";

export interface UserContext {
  userId: string;
  emotionalState: string;
  currentChallenges: string[];
  preferredApproach: string;
  spiritualContext: {
    crystalState: string;
    elementalResonance: string;
    developmentStage: string;
  };
  conversationHistory: any[];
  sessionContext: any;
}

export interface Pattern {
  type: string;
  content: string;
  intensity: number;
  frequency: number;
  timestamp: Date;
  context?: string;
}

export interface WisdomRouting {
  selectedApproach: WisdomApproach;
  confidence: number;
  reasoning: string;
  backupApproaches: WisdomApproach[];
}

export class WisdomRouter {
  private approachHistory: Map<string, WisdomApproach[]> = new Map();
  private effectivenessScores: Map<WisdomApproach, number> = new Map();

  constructor() {
    // Initialize effectiveness scores with neutral values
    const approaches: WisdomApproach[] = [
      "jung", "buddha", "hybrid", "gentle_inquiry", 
      "shadow_integration", "relational_wisdom", 
      "mystical_guidance", "transformational"
    ];
    approaches.forEach(approach => {
      this.effectivenessScores.set(approach, 0.5);
    });
  }

  routeWisdomApproach(
    userContext: UserContext, 
    patterns: Pattern[], 
    currentMode?: OracleModeType
  ): WisdomRouting {
    try {
      // Analyze context factors
      const contextFactors = this.analyzeContext(userContext, patterns);
      
      // Determine primary approach
      const selectedApproach = this.selectPrimaryApproach(contextFactors, currentMode);
      
      // Calculate confidence
      const confidence = this.calculateConfidence(contextFactors, selectedApproach);
      
      // Determine backup approaches
      const backupApproaches = this.selectBackupApproaches(selectedApproach, contextFactors);
      
      // Generate reasoning
      const reasoning = this.generateReasoning(selectedApproach, contextFactors);
      
      // Store in history
      this.updateHistory(userContext.userId, selectedApproach);
      
      logger.info("Wisdom routing completed", {
        userId: userContext.userId,
        selectedApproach,
        confidence,
        contextFactors: contextFactors.primaryFactors
      });
      
      return {
        selectedApproach,
        confidence,
        reasoning,
        backupApproaches
      };
    } catch (error) {
      logger.error("Wisdom routing failed", { error, userId: userContext.userId });
      return {
        selectedApproach: "gentle_inquiry",
        confidence: 0.3,
        reasoning: "Defaulting to gentle inquiry due to routing error",
        backupApproaches: ["hybrid", "transformational"]
      };
    }
  }

  private analyzeContext(userContext: UserContext, patterns: Pattern[]) {
    const factors = {
      shadowPresent: false,
      attachmentLevel: 0.5,
      vulnerabilityLevel: 0.5,
      spiritualReadiness: 0.5,
      relationshipFocus: false,
      transformationPhase: "stable",
      primaryFactors: [] as string[]
    };

    // Analyze patterns
    patterns.forEach(pattern => {
      if (pattern.type.includes("shadow")) {
        factors.shadowPresent = true;
        factors.primaryFactors.push("shadow_work_needed");
      }
      if (pattern.type.includes("attachment")) {
        factors.attachmentLevel = Math.min(1.0, factors.attachmentLevel + 0.3);
        factors.primaryFactors.push("attachment_patterns");
      }
    });

    // Analyze emotional state
    const emotionalState = userContext.emotionalState.toLowerCase();
    if (["vulnerable", "open", "seeking"].some(state => emotionalState.includes(state))) {
      factors.vulnerabilityLevel += 0.3;
      factors.primaryFactors.push("high_vulnerability");
    }

    // Analyze challenges
    if (userContext.currentChallenges.includes("relationships")) {
      factors.relationshipFocus = true;
      factors.primaryFactors.push("relationship_focus");
    }
    
    if (userContext.currentChallenges.includes("spirituality")) {
      factors.spiritualReadiness += 0.3;
      factors.primaryFactors.push("spiritual_seeking");
    }

    // Analyze development stage
    const stage = userContext.spiritualContext.developmentStage;
    if (["transformation", "crisis", "breakthrough"].includes(stage)) {
      factors.transformationPhase = "active";
      factors.primaryFactors.push("active_transformation");
    }

    return factors;
  }

  private selectPrimaryApproach(
    factors: any, 
    currentMode?: OracleModeType
  ): WisdomApproach {
    // Shadow work priority
    if (factors.shadowPresent && factors.vulnerabilityLevel > 0.6) {
      return "shadow_integration";
    }

    // Attachment patterns - Buddha approach
    if (factors.attachmentLevel > 0.7) {
      return "buddha";
    }

    // Relationship focus
    if (factors.relationshipFocus) {
      return "relational_wisdom";
    }

    // High spiritual readiness
    if (factors.spiritualReadiness > 0.7) {
      return "mystical_guidance";
    }

    // Active transformation phase
    if (factors.transformationPhase === "active") {
      return "transformational";
    }

    // Integration needs - Jung approach
    if (factors.primaryFactors.includes("integration_needed")) {
      return "jung";
    }

    // Mode-based routing
    if (currentMode === "shadow_work") return "shadow_integration";
    if (currentMode === "deep_inquiry") return "jung";
    if (currentMode === "compassionate_witness") return "buddha";

    // Default to gentle inquiry
    return "gentle_inquiry";
  }

  private calculateConfidence(factors: any, approach: WisdomApproach): number {
    let confidence = 0.5;
    
    // High confidence indicators
    if (factors.primaryFactors.length > 2) confidence += 0.2;
    if (factors.shadowPresent && approach === "shadow_integration") confidence += 0.3;
    if (factors.attachmentLevel > 0.7 && approach === "buddha") confidence += 0.3;
    if (factors.spiritualReadiness > 0.7 && approach === "mystical_guidance") confidence += 0.2;
    
    // Historical effectiveness
    const historicalScore = this.effectivenessScores.get(approach) || 0.5;
    confidence = (confidence + historicalScore) / 2;
    
    return Math.min(confidence, 1.0);
  }

  private selectBackupApproaches(
    primary: WisdomApproach, 
    factors: any
  ): WisdomApproach[] {
    const backups: WisdomApproach[] = [];
    
    // Always include gentle inquiry as safe fallback
    if (primary !== "gentle_inquiry") {
      backups.push("gentle_inquiry");
    }
    
    // Add complementary approaches
    switch (primary) {
      case "jung":
        backups.unshift("hybrid", "transformational");
        break;
      case "buddha":
        backups.unshift("hybrid", "mystical_guidance");
        break;
      case "shadow_integration":
        backups.unshift("jung", "transformational");
        break;
      case "relational_wisdom":
        backups.unshift("gentle_inquiry", "transformational");
        break;
      default:
        backups.unshift("hybrid", "transformational");
    }
    
    return backups.slice(0, 3); // Return top 3 backups
  }

  private generateReasoning(approach: WisdomApproach, factors: any): string {
    const reasonParts: string[] = [];
    
    switch (approach) {
      case "shadow_integration":
        reasonParts.push("Shadow elements detected, integration approach selected");
        break;
      case "buddha":
        reasonParts.push("High attachment patterns, liberation focus chosen");
        break;
      case "relational_wisdom":
        reasonParts.push("Relationship themes present, relational approach selected");
        break;
      case "mystical_guidance":
        reasonParts.push("High spiritual readiness, mystical approach chosen");
        break;
      case "transformational":
        reasonParts.push("Active transformation phase, transformational approach selected");
        break;
      default:
        reasonParts.push("Gentle inquiry selected for safe exploration");
    }
    
    if (factors.primaryFactors.length > 0) {
      reasonParts.push(`Key factors: ${factors.primaryFactors.join(", ")}`);
    }
    
    return reasonParts.join(". ");
  }

  private updateHistory(userId: string, approach: WisdomApproach): void {
    const history = this.approachHistory.get(userId) || [];
    history.push(approach);
    
    // Keep last 20 approaches
    if (history.length > 20) {
      history.shift();
    }
    
    this.approachHistory.set(userId, history);
  }

  updateEffectiveness(approach: WisdomApproach, effectiveness: number): void {
    const currentScore = this.effectivenessScores.get(approach) || 0.5;
    const newScore = (currentScore * 0.8) + (effectiveness * 0.2); // Weighted average
    this.effectivenessScores.set(approach, newScore);
  }

  getUserApproachHistory(userId: string): WisdomApproach[] {
    return this.approachHistory.get(userId) || [];
  }

  getEffectivenessStats(): Record<WisdomApproach, number> {
    const stats: Partial<Record<WisdomApproach, number>> = {};
    this.effectivenessScores.forEach((score, approach) => {
      stats[approach] = Math.round(score * 100) / 100;
    });
    return stats as Record<WisdomApproach, number>;
  }
}
