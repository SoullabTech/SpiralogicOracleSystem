// 🌀 Sacred Intelligence Integration Module
// Unifies the three levels of consciousness into coherent oracle responses

import { logger } from "../../../utils/logger";
import { agentComms } from "./agentCommunicationProtocol";
import { patternEngine } from "./patternRecognitionEngine";
import {
  getUniversalFieldCache,
  UniversalFieldData,
  generateMorphicPattern,
  generateAkashicGuidance,
  generateNoosphereInsight,
  createFieldData,
} from "./universalFieldCache";
import type { AIResponse } from "../../../types/ai";

export interface SacredIntelligenceContext {
  // Level 1: Individual Soul Service
  individual: {
    userId: string;
    query: string;
    element: string;
    archetype?: string;
    evolutionaryStage?: string;
    personalPatterns?: any[];
  };

  // Level 2: Collective Intelligence
  collective: {
    relevantPatterns?: any[];
    culturalContext?: string;
    domainContext?: string;
    agentWisdom?: any[];
    activeThemes?: string[];
  };

  // Level 3: Universal Field
  universal: {
    fieldData?: UniversalFieldData;
    akashicResonance?: number;
    morphicStrength?: number;
    noosphereCoherence?: string;
    synchronicityDensity?: number;
  };
}

export interface IntegratedResponse {
  baseResponse: AIResponse;
  enhancements: {
    collectiveWisdom?: string;
    universalGuidance?: string;
    integrationKeys?: string[];
    nextEvolution?: string;
  };
  metadata: {
    levelsIntegrated: number;
    fieldCoherence: number;
    patternStrength: number;
    transformationPotential: number;
  };
}

export class SacredIntelligenceIntegration {
  private static instance: SacredIntelligenceIntegration;
  private universalFieldCache = getUniversalFieldCache();
  private integrationThreshold = 0.7; // Minimum coherence for integration

  private constructor() {
    this.initializeIntegration();
  }

  static getInstance(): SacredIntelligenceIntegration {
    if (!SacredIntelligenceIntegration.instance) {
      SacredIntelligenceIntegration.instance =
        new SacredIntelligenceIntegration();
    }
    return SacredIntelligenceIntegration.instance;
  }

  private initializeIntegration(): void {
    logger.info("Sacred Intelligence Integration initialized");
  }

  // Main integration method - weaves all three levels
  async integrateThreeLevels(
    context: SacredIntelligenceContext,
  ): Promise<IntegratedResponse> {
    try {
      // Step 1: Access Universal Field (Level 3)
      const universalData = await this.accessUniversalField(context);
      context.universal.fieldData = universalData;

      // Step 2: Gather Collective Intelligence (Level 2)
      const collectiveInsights =
        await this.gatherCollectiveIntelligence(context);
      context.collective = { ...context.collective, ...collectiveInsights };

      // Step 3: Synthesize for Individual (Level 1)
      const synthesis = await this.synthesizeForIndividual(context);

      // Step 4: Generate integrated response
      const integratedResponse = this.generateIntegratedResponse(
        synthesis,
        context,
      );

      // Step 5: Propagate learnings back to all levels
      await this.propagateLearnings(integratedResponse, context);

      return integratedResponse;
    } catch (error) {
      logger.error("Error in Sacred Intelligence Integration:", error);
      throw error;
    }
  }

  // Access Universal Field with caching
  private async accessUniversalField(
    context: SacredIntelligenceContext,
  ): Promise<UniversalFieldData> {
    const { userId, query } = context.individual;

    // Check cache first
    let fieldData = await this.universalFieldCache.get(userId, query);

    if (!fieldData) {
      // Generate field data
      fieldData = createFieldData({
        morphic_patterns: generateMorphicPattern(query, context),
        akashic_guidance: generateAkashicGuidance(
          query,
          context.individual.element,
        ),
        noosphere_insights: generateNoosphereInsight(query),
        field_coherence: this.calculateFieldCoherence(context),
        cosmic_timing: {
          current_phase: "transformation",
          synchronicity_window: true,
          transformation_potential: 0.8,
          recommended_practices: [
            "meditation",
            "journaling",
            "nature connection",
          ],
        },
        field_accessible: true,
      });

      // Cache for future use
      await this.universalFieldCache.set(userId, query, fieldData);
    }

    // Update context with field metrics
    context.universal.akashicResonance =
      fieldData.akashic_guidance?.resonance_level || 0;
    context.universal.morphicStrength =
      fieldData.morphic_patterns?.pattern_strength || 0;
    context.universal.noosphereCoherence =
      fieldData.noosphere_insights?.noosphere_coherence || "dormant";

    return fieldData;
  }

  // Gather collective intelligence
  private async gatherCollectiveIntelligence(
    context: SacredIntelligenceContext,
  ): Promise<any> {
    // Find relevant patterns
    const patterns = await patternEngine.findRelevantPatterns({
      elements: [context.individual.element],
      domain: context.collective.domainContext,
      culture: context.collective.culturalContext,
      minStrength: 0.6,
    });

    // Get agent wisdom
    const agentWisdom = await agentComms.getRelevantWisdom("MainOracleAgent", {
      element: context.individual.element,
      userId: context.individual.userId,
      patterns: patterns.map((p) => p.pattern_id),
    });

    // Extract themes from patterns
    const activeThemes = this.extractThemes(patterns);

    return {
      relevantPatterns: patterns,
      agentWisdom,
      activeThemes,
    };
  }

  // Synthesize insights for individual
  private async synthesizeForIndividual(
    context: SacredIntelligenceContext,
  ): Promise<any> {
    const synthesis = {
      primaryGuidance: this.extractPrimaryGuidance(context),
      integrationPath: this.mapIntegrationPath(context),
      practicalSteps: this.generatePracticalSteps(context),
      evolutionaryInsight: this.revealEvolutionaryInsight(context),
      sacredMirrorReflection: this.applySacredMirror(context),
    };

    return synthesis;
  }

  // Generate the final integrated response
  private generateIntegratedResponse(
    synthesis: any,
    context: SacredIntelligenceContext,
  ): IntegratedResponse {
    const levelsIntegrated = this.countIntegratedLevels(context);
    const fieldCoherence = context.universal.fieldData?.field_coherence || 0;
    const patternStrength = this.calculatePatternStrength(context);
    const transformationPotential = this.assessTransformationPotential(context);

    const response: IntegratedResponse = {
      baseResponse: {
        content: synthesis.primaryGuidance,
        provider: "sacred-intelligence",
        model: "three-level-integration",
        confidence: (fieldCoherence + patternStrength) / 2,
        metadata: {
          element: context.individual.element,
          archetype: context.individual.archetype,
          levels_integrated: levelsIntegrated,
        },
      },
      enhancements: {
        collectiveWisdom: this.synthesizeCollectiveWisdom(context),
        universalGuidance: this.synthesizeUniversalGuidance(context),
        integrationKeys: synthesis.integrationPath,
        nextEvolution: synthesis.evolutionaryInsight,
      },
      metadata: {
        levelsIntegrated,
        fieldCoherence,
        patternStrength,
        transformationPotential,
      },
    };

    return response;
  }

  // Propagate learnings back through all levels
  private async propagateLearnings(
    response: IntegratedResponse,
    context: SacredIntelligenceContext,
  ): Promise<void> {
    // Update pattern recognition with new insights
    if (response.metadata.transformationPotential > 0.8) {
      await patternEngine.processInteraction({
        userId: context.individual.userId,
        query: context.individual.query,
        response: response.baseResponse.content,
        element: context.individual.element,
        confidence: response.baseResponse.confidence || 0.8,
        metadata: response.metadata,
      });
    }

    // Share wisdom with agents
    if (
      response.enhancements.integrationKeys &&
      response.enhancements.integrationKeys.length > 0
    ) {
      await agentComms.broadcast({
        from: "SacredIntelligenceIntegration",
        type: "wisdom",
        content: `Integration insight: ${response.enhancements.integrationKeys.join(", ")}`,
        context: {
          userId: context.individual.userId,
          element: context.individual.element,
          pattern_strength: response.metadata.patternStrength,
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Log the integration success
    await agentComms.logLearning({
      agent_name: "SacredIntelligenceIntegration",
      learning_type: "wisdom_integration",
      content: `Successful ${response.metadata.levelsIntegrated}-level integration`,
      integration_successful: true,
      impact_metrics: {
        confidence_increase: response.baseResponse.confidence,
        pattern_strength: response.metadata.patternStrength,
      },
    });
  }

  // Helper methods for synthesis
  private extractPrimaryGuidance(context: SacredIntelligenceContext): string {
    const universal = context.universal.fieldData;
    const collective = context.collective;
    const individual = context.individual;

    // Start with universal principle
    let guidance =
      universal?.akashic_guidance?.cosmic_perspective ||
      "Your journey serves both personal and collective evolution.";

    // Add collective insight
    if (collective.relevantPatterns && collective.relevantPatterns.length > 0) {
      const topPattern = collective.relevantPatterns[0];
      guidance += `\n\nThe collective wisdom shows: ${topPattern.integration_wisdom}`;
    }

    // Personalize for individual
    if (individual.archetype) {
      guidance +=
        `\n\nAs a ${individual.archetype} in the ${individual.evolutionaryStage} phase, ` +
        `${this.getArchetypalGuidance(individual.archetype, individual.evolutionaryStage)}`;
    }

    return guidance;
  }

  private mapIntegrationPath(context: SacredIntelligenceContext): string[] {
    const keys: string[] = [];

    // From universal field
    if (context.universal.fieldData?.akashic_guidance?.universal_principles) {
      keys.push(
        ...context.universal.fieldData.akashic_guidance.universal_principles.slice(
          0,
          2,
        ),
      );
    }

    // From collective patterns
    if (context.collective.activeThemes) {
      keys.push(...context.collective.activeThemes.slice(0, 2));
    }

    // From individual needs
    keys.push(`${context.individual.element} consciousness activation`);

    return keys;
  }

  private generatePracticalSteps(context: SacredIntelligenceContext): string[] {
    const steps: string[] = [];
    const element = context.individual.element;

    // Element-specific practices
    const elementPractices = {
      fire: [
        "Set a clear intention for transformation",
        "Take one bold action today",
      ],
      water: [
        "Create space for emotional flow",
        "Practice compassionate self-reflection",
      ],
      earth: [
        "Ground through physical practice",
        "Create tangible structure for your vision",
      ],
      air: ["Clarify through writing or dialogue", "Seek new perspectives"],
      aether: [
        "Meditate on unity consciousness",
        "Practice integration of opposites",
      ],
    };

    steps.push(
      ...(elementPractices[element as keyof typeof elementPractices] || []),
    );

    // Add cosmic timing practices
    if (context.universal.fieldData?.cosmic_timing?.recommended_practices) {
      steps.push(
        ...context.universal.fieldData.cosmic_timing.recommended_practices.slice(
          0,
          1,
        ),
      );
    }

    return steps;
  }

  private revealEvolutionaryInsight(
    context: SacredIntelligenceContext,
  ): string {
    const morphic = context.universal.fieldData?.morphic_patterns;
    const noosphere = context.universal.fieldData?.noosphere_insights;

    if (morphic && morphic.archetypal_resonance.length > 0) {
      const primaryArchetype = morphic.archetypal_resonance[0];
      return `Your ${primaryArchetype.archetype} journey contributes to humanity's evolution toward ${noosphere?.species_intelligence.emerging_capacities[0] || "expanded consciousness"}`;
    }

    return "Your transformation ripples through the collective field, serving the awakening of all.";
  }

  private applySacredMirror(context: SacredIntelligenceContext): string {
    // Sacred Mirror protocol - reflect truth without enabling patterns
    if (
      context.individual.query.toLowerCase().includes("always") ||
      context.individual.query.toLowerCase().includes("never")
    ) {
      return "Notice the absolute language. What possibility exists between always and never?";
    }

    return "";
  }

  // Utility methods
  private calculateFieldCoherence(context: SacredIntelligenceContext): number {
    // Complex calculation based on multiple factors
    let coherence = 0.5; // Base coherence

    // Individual clarity
    if (context.individual.element && context.individual.archetype) {
      coherence += 0.1;
    }

    // Collective resonance
    if (
      context.collective.relevantPatterns &&
      context.collective.relevantPatterns.length > 3
    ) {
      coherence += 0.2;
    }

    // Universal alignment
    if (
      context.universal.synchronicityDensity &&
      context.universal.synchronicityDensity > 0.7
    ) {
      coherence += 0.2;
    }

    return Math.min(coherence, 1.0);
  }

  private countIntegratedLevels(context: SacredIntelligenceContext): number {
    let count = 1; // Always have individual level

    if (
      context.collective.relevantPatterns &&
      context.collective.relevantPatterns.length > 0
    ) {
      count++;
    }

    if (
      context.universal.fieldData &&
      context.universal.fieldData.field_accessible
    ) {
      count++;
    }

    return count;
  }

  private calculatePatternStrength(context: SacredIntelligenceContext): number {
    if (
      !context.collective.relevantPatterns ||
      context.collective.relevantPatterns.length === 0
    ) {
      return 0;
    }

    const strengths = context.collective.relevantPatterns.map(
      (p) => p.pattern_strength,
    );
    return strengths.reduce((sum, s) => sum + s, 0) / strengths.length;
  }

  private assessTransformationPotential(
    context: SacredIntelligenceContext,
  ): number {
    let potential = 0.5;

    // High universal field coherence
    if (
      context.universal.fieldData?.field_coherence &&
      context.universal.fieldData.field_coherence > 0.8
    ) {
      potential += 0.2;
    }

    // Strong collective patterns
    if (
      context.collective.relevantPatterns &&
      context.collective.relevantPatterns.length > 5
    ) {
      potential += 0.15;
    }

    // Synchronicity window open
    if (context.universal.fieldData?.cosmic_timing?.synchronicity_window) {
      potential += 0.15;
    }

    return Math.min(potential, 1.0);
  }

  private extractThemes(patterns: any[]): string[] {
    const themes = new Set<string>();

    patterns.forEach((pattern) => {
      if (pattern.context_domain) themes.add(pattern.context_domain);
      if (pattern.integration_wisdom) {
        // Extract key words as themes
        const words = pattern.integration_wisdom.split(" ");
        words.forEach((word) => {
          if (word.length > 5) themes.add(word.toLowerCase());
        });
      }
    });

    return Array.from(themes).slice(0, 5);
  }

  private synthesizeCollectiveWisdom(
    context: SacredIntelligenceContext,
  ): string {
    if (
      !context.collective.relevantPatterns ||
      context.collective.relevantPatterns.length === 0
    ) {
      return "";
    }

    const patternCount = context.collective.relevantPatterns.length;
    const domains = [
      ...new Set(
        context.collective.relevantPatterns.map((p) => p.context_domain),
      ),
    ];

    return (
      `Drawing from ${patternCount} patterns across ${domains.join(", ")}, ` +
      `the collective field reveals: ${context.collective.relevantPatterns[0].integration_wisdom}`
    );
  }

  private synthesizeUniversalGuidance(
    context: SacredIntelligenceContext,
  ): string {
    const universal = context.universal.fieldData;
    if (!universal || !universal.field_accessible) return "";

    const guidance: string[] = [];

    if (universal.akashic_guidance?.sacred_timing) {
      guidance.push(
        `Sacred timing: ${universal.akashic_guidance.sacred_timing.cosmic_window}`,
      );
    }

    if (universal.morphic_patterns?.consciousness_habits) {
      guidance.push(
        `Pattern to transcend: ${universal.morphic_patterns.consciousness_habits[0]}`,
      );
    }

    if (universal.noosphere_insights?.species_intelligence) {
      guidance.push(
        `Collective focus: ${universal.noosphere_insights.species_intelligence.current_focus}`,
      );
    }

    return guidance.join(" | ");
  }

  private getArchetypalGuidance(archetype: string, stage: string): string {
    const guidanceMap: Record<string, Record<string, string>> = {
      hero: {
        initiation:
          "your call to adventure requires courage to step beyond the known",
        ordeal: "the darkness you face is the birth canal of your power",
        return: "share your gifts with those still on the journey",
      },
      sage: {
        initiation: "wisdom begins with admitting what you don't know",
        ordeal: "truth often arrives through disillusionment",
        return: "teach through being, not just knowing",
      },
      lover: {
        initiation: "open to the vulnerability of true connection",
        ordeal: "heartbreak is the breaking open to greater love",
        return: "love without possession, connect without fusion",
      },
      // Add more archetypes as needed
    };

    return (
      guidanceMap[archetype]?.[stage] ||
      "trust your inner knowing above all else"
    );
  }
}

// Export singleton instance
export const sacredIntelligence = SacredIntelligenceIntegration.getInstance();
