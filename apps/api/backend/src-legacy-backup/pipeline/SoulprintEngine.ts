/**
 * 👁️ Soulprint Engine - Spiritual Evolution Tracking & Archetypal Growth
 *
 * Tracks user's spiritual development through archetypal resonance,
 * phase transitions, and evolution patterns within the Spiralogic framework.
 */

import { logger } from "../../utils/logger";
import { supabase } from "../../lib/supabase";

export interface Soulprint {
  dominantArchetypes: string[];
  currentSpiralogicPhase: string;
  archetypeResonance: ArchetypeResonance;
  evolutionTrends: EvolutionEntry[];
  lastUpdated: Date;
  totalInteractions: number;
  phaseTransitions: PhaseTransition[];
  resonanceHistory: ResonanceSnapshot[];
}

export interface ArchetypeResonance {
  fire: number;
  water: number;
  earth: number;
  air: number;
  aether: number;
}

export interface EvolutionEntry {
  timestamp: Date;
  archetype: string;
  insight: string;
  phase: string;
  resonanceShift?: number;
  userReaction?: "resonant" | "neutral" | "resistant";
  contextualFactors?: string[];
}

export interface PhaseTransition {
  timestamp: Date;
  fromPhase: string;
  toPhase: string;
  triggerInsight: string;
  resonanceAtTransition: ArchetypeResonance;
  readinessScore: number;
}

export interface ResonanceSnapshot {
  timestamp: Date;
  resonance: ArchetypeResonance;
  dominantArchetype: string;
  balance: number;
  growth: number;
}

export interface SoulprintAnalysis {
  currentPhase: string;
  readinessForTransition: number;
  dominantArchetypes: string[];
  growthAreas: string[];
  integrationSuggestions: string[];
  archetypalBalance: number;
  evolutionVelocity: number;
}

export class SoulprintEngine {
  private readonly PHASE_TRANSITION_THRESHOLD = 0.75;
  private readonly RESONANCE_BALANCE_THRESHOLD = 0.6;
  private readonly EVOLUTION_HISTORY_LIMIT = 100;

  /**
   * 🌟 Main Analysis Method
   */
  async analyzeSoulprint(userId: string): Promise<SoulprintAnalysis> {
    const soulprint = await this.getSoulprint(userId);

    const analysis = {
      currentPhase: soulprint.currentSpiralogicPhase,
      readinessForTransition: this.calculateTransitionReadiness(soulprint),
      dominantArchetypes: this.identifyDominantArchetypes(
        soulprint.archetypeResonance,
      ),
      growthAreas: this.identifyGrowthAreas(soulprint.archetypeResonance),
      integrationSuggestions:
        await this.generateIntegrationSuggestions(soulprint),
      archetypalBalance: this.calculateArchetypalBalance(
        soulprint.archetypeResonance,
      ),
      evolutionVelocity: this.calculateEvolutionVelocity(
        soulprint.evolutionTrends,
      ),
    };

    logger.info("Soulprint Analysis:", {
      userId,
      currentPhase: analysis.currentPhase,
      readinessForTransition: analysis.readinessForTransition,
      dominantArchetypes: analysis.dominantArchetypes,
      balance: analysis.archetypalBalance,
    });

    return analysis;
  }

  /**
   * 🔄 Update Soulprint from Oracle Interaction
   */
  async updateFromInteraction(
    userId: string,
    interaction: {
      archetype: string;
      userInput: string;
      oracleResponse: string;
      userReaction?: "resonant" | "neutral" | "resistant";
      contextualFactors?: string[];
    },
  ): Promise<Soulprint> {
    const currentSoulprint = await this.getSoulprint(userId);

    // Calculate resonance changes
    const resonanceChange = this.calculateResonanceChange(
      interaction.archetype,
      interaction.userReaction,
      currentSoulprint,
    );

    // Update archetypal resonance
    const updatedResonance = this.updateArchetypeResonance(
      currentSoulprint.archetypeResonance,
      interaction.archetype,
      resonanceChange,
    );

    // Create evolution entry
    const evolutionEntry: EvolutionEntry = {
      timestamp: new Date(),
      archetype: interaction.archetype,
      insight: this.extractInsight(
        interaction.userInput,
        interaction.oracleResponse,
      ),
      phase: currentSoulprint.currentSpiralogicPhase,
      resonanceShift: resonanceChange,
      userReaction: interaction.userReaction,
      contextualFactors: interaction.contextualFactors,
    };

    // Check for phase transition
    const newPhase = await this.assessPhaseTransition(
      currentSoulprint,
      updatedResonance,
      evolutionEntry,
    );

    // Create phase transition record if needed
    let phaseTransitions = currentSoulprint.phaseTransitions;
    if (newPhase !== currentSoulprint.currentSpiralogicPhase) {
      const transition: PhaseTransition = {
        timestamp: new Date(),
        fromPhase: currentSoulprint.currentSpiralogicPhase,
        toPhase: newPhase,
        triggerInsight: evolutionEntry.insight,
        resonanceAtTransition: updatedResonance,
        readinessScore: this.calculateTransitionReadiness({
          ...currentSoulprint,
          archetypeResonance: updatedResonance,
        }),
      };
      phaseTransitions = [...phaseTransitions, transition];
    }

    // Create resonance snapshot
    const resonanceSnapshot: ResonanceSnapshot = {
      timestamp: new Date(),
      resonance: updatedResonance,
      dominantArchetype: this.identifyDominantArchetypes(updatedResonance)[0],
      balance: this.calculateArchetypalBalance(updatedResonance),
      growth: this.calculateGrowthScore(
        currentSoulprint.archetypeResonance,
        updatedResonance,
      ),
    };

    // Update soulprint
    const updatedSoulprint: Soulprint = {
      ...currentSoulprint,
      currentSpiralogicPhase: newPhase,
      archetypeResonance: updatedResonance,
      evolutionTrends: [
        ...currentSoulprint.evolutionTrends,
        evolutionEntry,
      ].slice(-this.EVOLUTION_HISTORY_LIMIT),
      totalInteractions: currentSoulprint.totalInteractions + 1,
      phaseTransitions,
      resonanceHistory: [
        ...currentSoulprint.resonanceHistory,
        resonanceSnapshot,
      ].slice(-50), // Keep last 50 snapshots
      lastUpdated: new Date(),
    };

    // Update dominant archetypes
    updatedSoulprint.dominantArchetypes =
      this.identifyDominantArchetypes(updatedResonance);

    // Save to database
    await this.saveSoulprint(userId, updatedSoulprint);

    return updatedSoulprint;
  }

  /**
   * 📊 Resonance Calculations
   */
  private calculateResonanceChange(
    archetype: string,
    userReaction: string = "neutral",
    currentSoulprint: Soulprint,
  ): number {
    const baseChanges = {
      resonant: 0.15,
      neutral: 0.05,
      resistant: -0.03,
      undefined: 0.08,
    };

    let change = baseChanges[userReaction] || baseChanges.neutral;

    // Diminishing returns for high resonance
    const currentResonance =
      currentSoulprint.archetypeResonance[archetype] || 0.5;
    if (currentResonance > 0.8) {
      change *= 0.5;
    } else if (currentResonance > 0.9) {
      change *= 0.2;
    }

    // Bonus for consistent archetype engagement
    const recentArchetypeInteractions = currentSoulprint.evolutionTrends
      .slice(-5)
      .filter((entry) => entry.archetype === archetype).length;

    if (recentArchetypeInteractions >= 3) {
      change *= 1.2; // Consistency bonus
    }

    return change;
  }

  private updateArchetypeResonance(
    currentResonance: ArchetypeResonance,
    archetype: string,
    change: number,
  ): ArchetypeResonance {
    const updated = { ...currentResonance };

    // Update target archetype
    updated[archetype] = Math.max(
      0,
      Math.min(1, (updated[archetype] || 0.5) + change),
    );

    // Subtle influence on other archetypes (interconnection)
    const influence = change * 0.1;
    Object.keys(updated).forEach((key) => {
      if (key !== archetype) {
        updated[key] = Math.max(0, Math.min(1, updated[key] + influence));
      }
    });

    return updated;
  }

  /**
   * 🌀 Phase Transition Logic
   */
  private async assessPhaseTransition(
    currentSoulprint: Soulprint,
    updatedResonance: ArchetypeResonance,
    evolutionEntry: EvolutionEntry,
  ): Promise<string> {
    const currentPhase = currentSoulprint.currentSpiralogicPhase;
    const phases = [
      "initiation",
      "exploration",
      "integration",
      "transcendence",
      "unity",
    ];
    const currentIndex = phases.indexOf(currentPhase);

    // Can't transition beyond final phase
    if (currentIndex >= phases.length - 1) return currentPhase;

    // Calculate readiness for next phase
    const readinessScore = this.calculateTransitionReadiness({
      ...currentSoulprint,
      archetypeResonance: updatedResonance,
    });

    // Check specific phase requirements
    const phaseRequirements = this.getPhaseRequirements(
      phases[currentIndex + 1],
    );
    const meetsRequirements = this.evaluatePhaseRequirements(
      phaseRequirements,
      updatedResonance,
      currentSoulprint,
    );

    if (
      readinessScore >= this.PHASE_TRANSITION_THRESHOLD &&
      meetsRequirements
    ) {
      logger.info("Phase Transition Detected:", {
        fromPhase: currentPhase,
        toPhase: phases[currentIndex + 1],
        readinessScore,
        resonance: updatedResonance,
      });

      return phases[currentIndex + 1];
    }

    return currentPhase;
  }

  private calculateTransitionReadiness(soulprint: Soulprint): number {
    const resonanceValues = Object.values(soulprint.archetypeResonance);
    const averageResonance =
      resonanceValues.reduce((a, b) => a + b, 0) / resonanceValues.length;
    const resonanceBalance = this.calculateArchetypalBalance(
      soulprint.archetypeResonance,
    );
    const interactionFrequency = this.calculateInteractionFrequency(soulprint);
    const evolutionVelocity = this.calculateEvolutionVelocity(
      soulprint.evolutionTrends,
    );

    // Weighted combination of factors
    return (
      averageResonance * 0.4 +
      resonanceBalance * 0.3 +
      interactionFrequency * 0.2 +
      evolutionVelocity * 0.1
    );
  }

  private getPhaseRequirements(phase: string): any {
    const requirements = {
      exploration: {
        minResonance: 0.6,
        minBalance: 0.4,
        minInteractions: 10,
      },
      integration: {
        minResonance: 0.7,
        minBalance: 0.6,
        minInteractions: 25,
        requiredArchetypes: 3,
      },
      transcendence: {
        minResonance: 0.8,
        minBalance: 0.7,
        minInteractions: 50,
        requiredArchetypes: 4,
      },
      unity: {
        minResonance: 0.9,
        minBalance: 0.8,
        minInteractions: 100,
        requiredArchetypes: 5,
      },
    };

    return requirements[phase] || requirements.exploration;
  }

  private evaluatePhaseRequirements(
    requirements: any,
    resonance: ArchetypeResonance,
    soulprint: Soulprint,
  ): boolean {
    const averageResonance =
      Object.values(resonance).reduce((a, b) => a + b, 0) / 5;
    const balance = this.calculateArchetypalBalance(resonance);
    const activeArchetypes = Object.values(resonance).filter(
      (r) => r > 0.5,
    ).length;

    return (
      averageResonance >= requirements.minResonance &&
      balance >= requirements.minBalance &&
      soulprint.totalInteractions >= requirements.minInteractions &&
      (requirements.requiredArchetypes
        ? activeArchetypes >= requirements.requiredArchetypes
        : true)
    );
  }

  /**
   * 🎯 Analysis Methods
   */
  private identifyDominantArchetypes(resonance: ArchetypeResonance): string[] {
    return Object.entries(resonance)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([archetype]) => archetype);
  }

  private identifyGrowthAreas(resonance: ArchetypeResonance): string[] {
    return Object.entries(resonance)
      .sort(([, a], [, b]) => a - b)
      .slice(0, 2)
      .map(([archetype]) => archetype);
  }

  private calculateArchetypalBalance(resonance: ArchetypeResonance): number {
    const values = Object.values(resonance);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return max > 0 ? min / max : 0;
  }

  private calculateEvolutionVelocity(trends: EvolutionEntry[]): number {
    if (trends.length < 2) return 0;

    const recentTrends = trends.slice(-10);
    const timeSpan =
      recentTrends[recentTrends.length - 1].timestamp.getTime() -
      recentTrends[0].timestamp.getTime();

    const totalShift = recentTrends.reduce(
      (sum, trend) => sum + Math.abs(trend.resonanceShift || 0),
      0,
    );

    return timeSpan > 0 ? (totalShift / timeSpan) * 1000 * 60 * 60 * 24 : 0; // Per day
  }

  private calculateInteractionFrequency(soulprint: Soulprint): number {
    const daysSinceFirst =
      soulprint.evolutionTrends.length > 0
        ? (Date.now() - soulprint.evolutionTrends[0].timestamp.getTime()) /
          (1000 * 60 * 60 * 24)
        : 1;

    return Math.min(
      1,
      soulprint.totalInteractions / Math.max(1, daysSinceFirst * 2),
    );
  }

  private calculateGrowthScore(
    oldResonance: ArchetypeResonance,
    newResonance: ArchetypeResonance,
  ): number {
    const oldBalance = this.calculateArchetypalBalance(oldResonance);
    const newBalance = this.calculateArchetypalBalance(newResonance);

    const oldAverage =
      Object.values(oldResonance).reduce((a, b) => a + b, 0) / 5;
    const newAverage =
      Object.values(newResonance).reduce((a, b) => a + b, 0) / 5;

    return (newBalance - oldBalance) * 0.6 + (newAverage - oldAverage) * 0.4;
  }

  /**
   * 🔮 Insight Generation
   */
  private extractInsight(userInput: string, oracleResponse: string): string {
    const input = userInput.toLowerCase();
    const response = oracleResponse.toLowerCase();

    // Pattern matching for insight extraction
    if (input.includes("fear") || input.includes("afraid")) {
      return "Exploring relationship with fear and courage";
    }
    if (input.includes("love") || input.includes("heart")) {
      return "Opening to deeper love and connection";
    }
    if (input.includes("change") || input.includes("transition")) {
      return "Navigating life transitions and growth";
    }
    if (input.includes("work") || input.includes("purpose")) {
      return "Seeking alignment with life purpose";
    }
    if (input.includes("relationship") || input.includes("connection")) {
      return "Deepening understanding of relationships";
    }
    if (response.includes("transform") || response.includes("change")) {
      return "Receiving guidance for transformation";
    }
    if (response.includes("trust") || response.includes("faith")) {
      return "Learning to trust inner wisdom";
    }

    return "Seeking spiritual wisdom and guidance";
  }

  private async generateIntegrationSuggestions(
    soulprint: Soulprint,
  ): Promise<string[]> {
    const suggestions = [];
    const balance = this.calculateArchetypalBalance(
      soulprint.archetypeResonance,
    );
    const growthAreas = this.identifyGrowthAreas(soulprint.archetypeResonance);

    if (balance < 0.6) {
      suggestions.push(
        `Focus on developing ${growthAreas[0]} qualities for better balance`,
      );
    }

    if (soulprint.totalInteractions > 20) {
      suggestions.push("Begin deeper shadow work and integration practices");
    }

    if (soulprint.currentSpiralogicPhase === "integration") {
      suggestions.push(
        "Practice daily ritual work with your dominant archetypes",
      );
    }

    return suggestions;
  }

  /**
   * 💾 Database Operations
   */
  private async getSoulprint(userId: string): Promise<Soulprint> {
    try {
      const { data, error } = await supabase
        .from("user_soulprints")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (!data) {
        // Create default soulprint for new user
        return this.createDefaultSoulprint();
      }

      return {
        dominantArchetypes: data.dominant_archetypes || ["earth", "water"],
        currentSpiralogicPhase: data.current_spiralogic_phase || "initiation",
        archetypeResonance: data.archetype_resonance || {
          fire: 0.5,
          water: 0.5,
          earth: 0.5,
          air: 0.5,
          aether: 0.5,
        },
        evolutionTrends: data.evolution_trends || [],
        totalInteractions: data.total_interactions || 0,
        phaseTransitions: data.phase_transitions || [],
        resonanceHistory: data.resonance_history || [],
        lastUpdated: new Date(data.last_updated || Date.now()),
      };
    } catch (error) {
      logger.error("Error fetching soulprint:", error);
      return this.createDefaultSoulprint();
    }
  }

  private async saveSoulprint(
    userId: string,
    soulprint: Soulprint,
  ): Promise<void> {
    try {
      const { error } = await supabase.from("user_soulprints").upsert({
        user_id: userId,
        dominant_archetypes: soulprint.dominantArchetypes,
        current_spiralogic_phase: soulprint.currentSpiralogicPhase,
        archetype_resonance: soulprint.archetypeResonance,
        evolution_trends: soulprint.evolutionTrends,
        total_interactions: soulprint.totalInteractions,
        phase_transitions: soulprint.phaseTransitions,
        resonance_history: soulprint.resonanceHistory,
        last_updated: soulprint.lastUpdated,
      });

      if (error) throw error;

      logger.info("Soulprint saved successfully:", { userId });
    } catch (error) {
      logger.error("Error saving soulprint:", error);
      throw error;
    }
  }

  private createDefaultSoulprint(): Soulprint {
    return {
      dominantArchetypes: ["earth", "water"],
      currentSpiralogicPhase: "initiation",
      archetypeResonance: {
        fire: 0.5,
        water: 0.5,
        earth: 0.5,
        air: 0.5,
        aether: 0.5,
      },
      evolutionTrends: [],
      totalInteractions: 0,
      phaseTransitions: [],
      resonanceHistory: [],
      lastUpdated: new Date(),
    };
  }

  /**
   * 📊 Analytics and Reporting
   */
  async generateSoulprintReport(userId: string): Promise<any> {
    const soulprint = await this.getSoulprint(userId);
    const analysis = await this.analyzeSoulprint(userId);

    return {
      userId,
      generatedAt: new Date(),
      soulprint,
      analysis,
      recommendations: await this.generateIntegrationSuggestions(soulprint),
      nextPhaseGuidance: this.getNextPhaseGuidance(
        soulprint.currentSpiralogicPhase,
      ),
      archetypeInsights: this.generateArchetypeInsights(
        soulprint.archetypeResonance,
      ),
    };
  }

  private getNextPhaseGuidance(currentPhase: string): string {
    const guidance = {
      initiation: "Focus on building foundation across all archetypes",
      exploration: "Deepen your understanding of each elemental wisdom",
      integration: "Practice daily integration of archetypal insights",
      transcendence: "Prepare for transcendent awareness and service",
      unity: "Embody unified consciousness in service to all",
    };

    return guidance[currentPhase] || guidance.initiation;
  }

  private generateArchetypeInsights(resonance: ArchetypeResonance): any {
    return Object.entries(resonance).map(([archetype, value]) => ({
      archetype,
      resonance: value,
      level: value > 0.8 ? "mastery" : value > 0.6 ? "development" : "emerging",
      suggestion: this.getArchetypeSuggestion(archetype, value),
    }));
  }

  private getArchetypeSuggestion(archetype: string, resonance: number): string {
    const suggestions = {
      fire:
        resonance < 0.6
          ? "Practice courage and creative expression"
          : "Channel your fire into service",
      water:
        resonance < 0.6
          ? "Develop emotional awareness and intuition"
          : "Become a healer and nurturer",
      earth:
        resonance < 0.6
          ? "Ground yourself in nature and practical wisdom"
          : "Manifest stability for others",
      air:
        resonance < 0.6
          ? "Cultivate clarity and communication skills"
          : "Share your insights and wisdom",
      aether:
        resonance < 0.6
          ? "Deepen spiritual practice and connection"
          : "Embody unity consciousness",
    };

    return suggestions[archetype] || "Continue your spiritual development";
  }
}
