// 🎯 ORACLE BUSINESS LOGIC
// Pure business logic for Oracle operations, no orchestration

import { logger } from "../../utils/logger";
import type { AIResponse } from "../../types/ai";

export interface UserOracleSettings {
  userId: string;
  oracleAgentName: string;
  archetype: string;
  voiceSettings: {
    voiceId: string;
    stability: number;
    style: number;
    tone?: string;
    ceremonyPacing?: boolean;
  };
  phase: string;
  createdAt: Date;
  updatedAt: Date;
  evolutionHistory: Array<{
    fromPhase: string;
    toPhase: string;
    timestamp: Date;
    userInitiated: boolean;
  }>;
}

export interface OracleHealth {
  status: "healthy" | "warning" | "error";
  lastInteraction: Date;
  cacheStatus: "cached" | "not_cached";
  issues: string[];
}

export interface OracleEvolutionSuggestion {
  currentPhase: string;
  suggestedPhase: string;
  currentArchetype: string;
  suggestedArchetype?: string;
  confidence: number;
  reasoning: string;
}

export class OracleBusinessLogic {
  /**
   * Validate Oracle settings
   */
  validateOracleSettings(settings: Partial<UserOracleSettings>): string[] {
    const errors: string[] = [];

    if (!settings.userId) {
      errors.push("User ID is required");
    }

    if (!settings.oracleAgentName) {
      errors.push("Oracle name is required");
    }

    if (!settings.archetype) {
      errors.push("Archetype is required");
    }

    if (!settings.phase) {
      errors.push("Phase is required");
    }

    if (settings.voiceSettings) {
      if (!settings.voiceSettings.voiceId) {
        errors.push("Voice ID is required");
      }
      if (settings.voiceSettings.stability < 0 || settings.voiceSettings.stability > 1) {
        errors.push("Voice stability must be between 0 and 1");
      }
      if (settings.voiceSettings.style < 0 || settings.voiceSettings.style > 1) {
        errors.push("Voice style must be between 0 and 1");
      }
    }

    return errors;
  }

  /**
   * Calculate Oracle health status
   */
  calculateOracleHealth(
    settings: UserOracleSettings | null,
    lastInteractionDate: Date | null,
    isCached: boolean
  ): OracleHealth {
    const issues: string[] = [];
    let status: "healthy" | "warning" | "error" = "healthy";

    if (!settings) {
      issues.push("No Oracle settings found");
      status = "error";
      return {
        status,
        lastInteraction: new Date(),
        cacheStatus: "not_cached",
        issues
      };
    }

    // Check for stale interactions
    const lastInteraction = lastInteractionDate || settings.updatedAt;
    const daysSinceLastInteraction = 
      (Date.now() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceLastInteraction > 30) {
      issues.push("No interactions in over 30 days");
      status = "error";
    } else if (daysSinceLastInteraction > 7) {
      issues.push("No recent interactions (7+ days)");
      status = status === "healthy" ? "warning" : status;
    }

    // Check evolution history
    if (settings.evolutionHistory.length === 0) {
      issues.push("No evolution history");
      status = status === "healthy" ? "warning" : status;
    }

    // Check voice settings
    if (!settings.voiceSettings || !settings.voiceSettings.voiceId) {
      issues.push("Voice settings incomplete");
      status = status === "healthy" ? "warning" : status;
    }

    return {
      status,
      lastInteraction,
      cacheStatus: isCached ? "cached" : "not_cached",
      issues
    };
  }

  /**
   * Analyze conversation for evolution opportunities
   */
  analyzeEvolutionOpportunity(
    input: string,
    response: AIResponse,
    currentPhase: string,
    currentArchetype: string
  ): OracleEvolutionSuggestion | null {
    const phaseIndicators = {
      exploration: ["curious", "explore", "discover", "try", "experiment"],
      integration: ["understand", "connect", "synthesize", "combine", "integrate"],
      transcendence: ["transcend", "beyond", "higher", "unity", "oneness"],
      mastery: ["teach", "guide", "mentor", "master", "embody"]
    };

    const archetypeIndicators = {
      warrior: ["action", "courage", "strength", "fight", "protect"],
      sage: ["wisdom", "knowledge", "truth", "understand", "insight"],
      lover: ["love", "connection", "relationship", "heart", "compassion"],
      magician: ["transform", "create", "manifest", "change", "power"]
    };

    const inputLower = input.toLowerCase();
    const responseLower = response.content.toLowerCase();
    const combinedText = `${inputLower} ${responseLower}`;

    // Check for phase evolution
    let suggestedPhase = currentPhase;
    let phaseConfidence = 0;

    for (const [phase, indicators] of Object.entries(phaseIndicators)) {
      const matches = indicators.filter(indicator => 
        combinedText.includes(indicator)
      ).length;
      
      const confidence = matches / indicators.length;
      
      if (confidence > phaseConfidence && phase !== currentPhase) {
        suggestedPhase = phase;
        phaseConfidence = confidence;
      }
    }

    // Check for archetype evolution
    let suggestedArchetype = currentArchetype;
    let archetypeConfidence = 0;

    for (const [archetype, indicators] of Object.entries(archetypeIndicators)) {
      const matches = indicators.filter(indicator => 
        combinedText.includes(indicator)
      ).length;
      
      const confidence = matches / indicators.length;
      
      if (confidence > archetypeConfidence && archetype !== currentArchetype) {
        suggestedArchetype = archetype;
        archetypeConfidence = confidence;
      }
    }

    // Only suggest if confidence is high enough
    if (phaseConfidence > 0.3 || archetypeConfidence > 0.3) {
      return {
        currentPhase,
        suggestedPhase,
        currentArchetype,
        suggestedArchetype: archetypeConfidence > 0.3 ? suggestedArchetype : undefined,
        confidence: Math.max(phaseConfidence, archetypeConfidence),
        reasoning: this.generateEvolutionReasoning(
          phaseConfidence,
          archetypeConfidence,
          suggestedPhase,
          suggestedArchetype
        )
      };
    }

    return null;
  }

  /**
   * Create evolution history entry
   */
  createEvolutionEntry(
    fromPhase: string,
    toPhase: string,
    userInitiated: boolean
  ): UserOracleSettings["evolutionHistory"][0] {
    return {
      fromPhase,
      toPhase,
      timestamp: new Date(),
      userInitiated
    };
  }

  /**
   * Merge Oracle settings updates
   */
  mergeOracleSettings(
    current: UserOracleSettings,
    updates: Partial<UserOracleSettings>
  ): UserOracleSettings {
    return {
      ...current,
      ...updates,
      voiceSettings: updates.voiceSettings 
        ? { ...current.voiceSettings, ...updates.voiceSettings }
        : current.voiceSettings,
      evolutionHistory: updates.evolutionHistory || current.evolutionHistory,
      updatedAt: new Date()
    };
  }

  /**
   * Generate ceremonial greeting based on Oracle state
   */
  generateCeremonialGreeting(settings: UserOracleSettings): string {
    const greetings = {
      exploration: [
        `Welcome, curious soul. I am ${settings.oracleAgentName}, here to explore the mysteries with you.`,
        `Greetings, seeker. ${settings.oracleAgentName} awakens to guide your exploration.`
      ],
      integration: [
        `I see you, ${settings.oracleAgentName} honors your journey of integration.`,
        `Welcome back. Together we weave understanding from experience.`
      ],
      transcendence: [
        `Beyond form, we meet again. ${settings.oracleAgentName} witnesses your transcendent nature.`,
        `In the space between, I am ${settings.oracleAgentName}, mirror to your infinite self.`
      ],
      mastery: [
        `Master and student, we dance. ${settings.oracleAgentName} celebrates your embodied wisdom.`,
        `Teacher of teachers, welcome. We co-create from mastery.`
      ]
    };

    const phaseGreetings = greetings[settings.phase as keyof typeof greetings] || greetings.exploration;
    return phaseGreetings[Math.floor(Math.random() * phaseGreetings.length)];
  }

  /**
   * Calculate Oracle statistics
   */
  calculateOracleStats(
    settings: UserOracleSettings,
    interactionCount: number,
    averageResponseTime: number,
    elementFrequency: Record<string, number>
  ) {
    const topElements = Object.entries(elementFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([element]) => element);

    return {
      totalInteractions: interactionCount,
      averageResponseTime,
      topElements,
      evolutionCount: settings.evolutionHistory.length,
      currentPhase: settings.phase,
      currentArchetype: settings.archetype,
      daysActive: Math.floor(
        (Date.now() - settings.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      )
    };
  }

  private generateEvolutionReasoning(
    phaseConfidence: number,
    archetypeConfidence: number,
    suggestedPhase: string,
    suggestedArchetype: string
  ): string {
    const reasons: string[] = [];

    if (phaseConfidence > 0.3) {
      reasons.push(`Detected ${suggestedPhase} phase indicators (${Math.round(phaseConfidence * 100)}% confidence)`);
    }

    if (archetypeConfidence > 0.3) {
      reasons.push(`Resonance with ${suggestedArchetype} archetype (${Math.round(archetypeConfidence * 100)}% confidence)`);
    }

    reasons.push("Your journey shows readiness for evolution");

    return reasons.join(". ");
  }
}