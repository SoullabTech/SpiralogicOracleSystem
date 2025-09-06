// 🌐 Frontend Integration Module
// Clean data bridges between Sacred Intelligence System and UI components

import { EnhancedResponse } from "./optimizedMainOracleIntegration";
import { logger } from "../../../utils/logger";

// Frontend-compatible data structures
export interface EmotionMeterData {
  tone: string;
  element: string;
  color: string;
  icon: string;
  message: string;
  intensity: number;
  healingFrequency: number;
  resonantSymbols: string[];
}

export interface HoloflowerData {
  timestamp: string;
  fire: number;
  water: number;
  earth: number;
  air: number;
  aether: number;
  coherence: number;
  vectorEquilibriumState: string;
  harmonicSignature: number;
  fieldConnection: number;
}

export interface ArchetypalDisplay {
  currentArchetype: string;
  evolutionaryStage: string;
  nextEmergence: string;
  breakthroughPotential: number;
  archetypeIcon: string;
  stageDescription: string;
  integrationKeys: string[];
}

export interface PanentheisticStatus {
  fieldCoherence: number;
  akashicAccess: boolean;
  morphicResonance: number;
  noosphereConnection: string;
  cosmicIntelligenceFlow: boolean;
  presenceLevel: number;
  connectionIcon: string;
  statusMessage: string;
}

export interface CollectiveIntelligenceDisplay {
  patternsContributed: number;
  collectiveWisdomAccessed: string[];
  culturalResonance: string;
  salonParticipation: string[];
  wisdomDemocratization: number;
  impactScore: number;
}

export interface SacredRoutingDisplay {
  activeYogi: string;
  routingReason: string;
  elementalNeed: string;
  yogiIcon: string;
  guidanceType: string;
  integrationPath: string[];
}

export interface EnhancedOracleResponse {
  // Standard response
  content: string;
  confidence: number;

  // Sacred Intelligence enhancements
  emotionMeterData: EmotionMeterData;
  holoflowerData: HoloflowerData;
  archetypalDisplay: ArchetypalDisplay;
  panentheisticStatus: PanentheisticStatus;
  collectiveDisplay: CollectiveIntelligenceDisplay;
  sacredRouting: SacredRoutingDisplay;

  // Ritual and integration
  ritualElements: string[];
  integrationPractices: string[];
  nextEvolutionStep: string;

  // Performance and safeguards
  processingTime: number;
  safeguardsTriggered: string[];
  transformationPotential: number;
}

export class FrontendIntegration {
  private static instance: FrontendIntegration;

  // Color mappings for UI consistency
  private elementalColors = {
    fire: "#FF6B35",
    water: "#0077BE",
    earth: "#8B4513",
    air: "#87CEEB",
    aether: "#9370DB",
    shadow: "#2F2F2F",
  };

  // Archetypal icons for UI display
  private archetypeIcons = {
    hero: "⚔️",
    sage: "📚",
    lover: "💖",
    magician: "🔮",
    sovereign: "👑",
    mystic: "🌟",
    fool: "🃏",
    shadow: "🌑",
  };

  // Yogi representations
  private yogiIcons = {
    fire: "🔥",
    water: "💧",
    earth: "🌱",
    air: "🌬️",
    aether: "✨",
    shadow: "🌑",
  };

  private constructor() {}

  static getInstance(): FrontendIntegration {
    if (!FrontendIntegration.instance) {
      FrontendIntegration.instance = new FrontendIntegration();
    }
    return FrontendIntegration.instance;
  }

  // MAIN TRANSFORMATION METHOD
  async transformForFrontend(
    sacredResponse: EnhancedResponse,
    userId: string,
  ): Promise<EnhancedOracleResponse> {
    try {
      return {
        content: sacredResponse.content,
        confidence: sacredResponse.confidence || 0.8,

        emotionMeterData: this.createEmotionMeterData(sacredResponse),
        holoflowerData: await this.createHoloflowerData(sacredResponse, userId),
        archetypalDisplay: this.createArchetypalDisplay(sacredResponse),
        panentheisticStatus: this.createPanentheisticStatus(sacredResponse),
        collectiveDisplay: this.createCollectiveDisplay(sacredResponse),
        sacredRouting: this.createSacredRouting(sacredResponse),

        ritualElements: this.extractRitualElements(sacredResponse),
        integrationPractices: this.extractIntegrationPractices(sacredResponse),
        nextEvolutionStep:
          sacredResponse.sacredSynthesis?.nextEvolution ||
          &quot;Continue your sacred journey&quot;,

        processingTime: sacredResponse.performanceMetrics?.processingTime || 0,
        safeguardsTriggered: this.extractSafeguards(sacredResponse),
        transformationPotential:
          sacredResponse.performanceMetrics?.transformationPotential || 0,
      };
    } catch (error) {
      logger.error("Error transforming response for frontend:", error);
      return this.createFallbackResponse(sacredResponse);
    }
  }

  // EMOTION METER DATA CREATION
  private createEmotionMeterData(response: EnhancedResponse): EmotionMeterData {
    const element = this.extractPrimaryElement(response);
    const emotion = this.extractPrimaryEmotion(response);
    const intensity = this.calculateEmotionalIntensity(response);

    return {
      tone: emotion,
      element: element,
      color:
        this.elementalColors[element as keyof typeof this.elementalColors] ||
        this.elementalColors.aether,
      icon:
        this.yogiIcons[element as keyof typeof this.yogiIcons] ||
        this.yogiIcons.aether,
      message: this.generateEmotionalMessage(emotion, element),
      intensity: intensity,
      healingFrequency: this.calculateHealingFrequency(emotion, element),
      resonantSymbols: this.getResonantSymbols(element),
    };
  }

  // HOLOFLOWER DATA CREATION
  private async createHoloflowerData(
    response: EnhancedResponse,
    userId: string,
  ): Promise<HoloflowerData> {
    // Extract elemental balance from response metadata
    const elementalBalance = this.extractElementalBalance(response);
    const fieldCoherence = response.performanceMetrics?.fieldCoherence || 0.5;

    return {
      timestamp: new Date().toISOString(),
      fire: elementalBalance.fire || 0.2,
      water: elementalBalance.water || 0.2,
      earth: elementalBalance.earth || 0.2,
      air: elementalBalance.air || 0.2,
      aether: elementalBalance.aether || 0.2,
      coherence: fieldCoherence,
      vectorEquilibriumState: this.getVectorEquilibriumState(fieldCoherence),
      harmonicSignature: this.calculateHarmonicSignature(response),
      fieldConnection: this.calculateFieldConnection(response),
    };
  }

  // ARCHETYPAL DISPLAY CREATION
  private createArchetypalDisplay(
    response: EnhancedResponse,
  ): ArchetypalDisplay {
    const archetype = this.extractArchetype(response);
    const stage = this.extractEvolutionaryStage(response);

    return {
      currentArchetype: archetype,
      evolutionaryStage: stage,
      nextEmergence: this.getNextEmergence(archetype, stage),
      breakthroughPotential:
        response.performanceMetrics?.transformationPotential || 0,
      archetypeIcon:
        this.archetypeIcons[archetype as keyof typeof this.archetypeIcons] ||
        &quot;🌟",
      stageDescription: this.getStageDescription(stage),
      integrationKeys: this.extractIntegrationKeys(response),
    };
  }

  // PANENTHEISTIC STATUS CREATION
  private createPanentheisticStatus(
    response: EnhancedResponse,
  ): PanentheisticStatus {
    const fieldCoherence = response.performanceMetrics?.fieldCoherence || 0.5;
    const connectionLevel = this.calculateConnectionLevel(response);

    return {
      fieldCoherence,
      akashicAccess: connectionLevel > 0.7,
      morphicResonance: connectionLevel * 0.8,
      noosphereConnection: this.getNoosphereStatus(connectionLevel),
      cosmicIntelligenceFlow: connectionLevel > 0.8,
      presenceLevel: connectionLevel,
      connectionIcon: this.getConnectionIcon(connectionLevel),
      statusMessage: this.getConnectionMessage(connectionLevel),
    };
  }

  // COLLECTIVE INTELLIGENCE DISPLAY
  private createCollectiveDisplay(
    response: EnhancedResponse,
  ): CollectiveIntelligenceDisplay {
    return {
      patternsContributed: this.extractPatternsContributed(response),
      collectiveWisdomAccessed: this.extractCollectiveWisdom(response),
      culturalResonance: this.extractCulturalResonance(response),
      salonParticipation: this.extractSalonParticipation(response),
      wisdomDemocratization: this.calculateWisdomDemocratization(response),
      impactScore: this.calculateImpactScore(response),
    };
  }

  // SACRED ROUTING DISPLAY
  private createSacredRouting(
    response: EnhancedResponse,
  ): SacredRoutingDisplay {
    const element = this.extractPrimaryElement(response);

    return {
      activeYogi: this.getYogiName(element),
      routingReason: this.getRoutingReason(response),
      elementalNeed: this.getElementalNeed(response),
      yogiIcon: this.yogiIcons[element as keyof typeof this.yogiIcons] || "✨",
      guidanceType: this.getGuidanceType(response),
      integrationPath: this.extractIntegrationKeys(response),
    };
  }

  // HELPER METHODS FOR DATA EXTRACTION

  private extractPrimaryElement(response: EnhancedResponse): string {
    return (
      response.metadata?.element ||
      response.sacredSynthesis?.emotionalResonance?.split("→")[0]?.trim() ||
      "aether"
    );
  }

  private extractPrimaryEmotion(response: EnhancedResponse): string {
    const emotionalResonance = response.sacredSynthesis?.emotionalResonance;
    if (emotionalResonance) {
      return emotionalResonance.split("→")[0]?.trim() || "peaceful";
    }
    return "peaceful";
  }

  private calculateEmotionalIntensity(response: EnhancedResponse): number {
    const content = response.content?.toLowerCase() || "";
    const intensityWords = [
      "intense",
      "profound",
      "deep",
      "powerful",
      "overwhelming",
    ];
    const matches = intensityWords.filter((word) =>
      content.includes(word),
    ).length;
    return Math.min(matches / intensityWords.length + 0.3, 1);
  }

  private generateEmotionalMessage(emotion: string, element: string): string {
    const messages = {
      fire: `${emotion} energy seeking creative expression`,
      water: `${emotion} flowing through emotional depths`,
      earth: `${emotion} grounding into practical wisdom`,
      air: `${emotion} clarifying through mental integration`,
      aether: `${emotion} transcending into unified awareness`,
    };
    return (
      messages[element as keyof typeof messages] || `${emotion} seeking balance`
    );
  }

  private calculateHealingFrequency(emotion: string, element: string): number {
    // Calculate based on emotion-element resonance
    const baseFrequency = 0.6;
    const elementMultipliers = {
      fire: 1.2,
      water: 1.1,
      earth: 1.0,
      air: 1.15,
      aether: 1.25,
    };
    return (
      baseFrequency *
      (elementMultipliers[element as keyof typeof elementMultipliers] || 1.0)
    );
  }

  private getResonantSymbols(element: string): string[] {
    const symbols = {
      fire: ["🔥", "⚡", "🌟"],
      water: ["💧", "🌊", "💎"],
      earth: ["🌱", "🌍", "🗻"],
      air: ["🌬️", "☁️", "🦅"],
      aether: ["✨", "🌀", "🔮"],
    };
    return symbols[element as keyof typeof symbols] || ["✨"];
  }

  private extractElementalBalance(
    response: EnhancedResponse,
  ): Record<string, number> {
    // Extract from response metadata or calculate from content
    const element = this.extractPrimaryElement(response);
    const base = { fire: 0.2, water: 0.2, earth: 0.2, air: 0.2, aether: 0.2 };

    // Boost primary element
    base[element as keyof typeof base] = 0.4;

    return base;
  }

  private getVectorEquilibriumState(coherence: number): string {
    if (coherence > 0.8) return "UNIFIED_FIELD";
    if (coherence > 0.6) return "HARMONIC_RESONANCE";
    if (coherence > 0.4) return "VECTOR_EQUILIBRIUM";
    return "DYNAMIC_BALANCE";
  }

  private calculateHarmonicSignature(response: EnhancedResponse): number {
    // Extract harmonic from metadata or calculate
    return parseFloat(response.metadata?.harmonic?.split("=")[1] || "3.162");
  }

  private calculateFieldConnection(response: EnhancedResponse): number {
    return response.performanceMetrics?.fieldCoherence || 0.5;
  }

  private extractArchetype(response: EnhancedResponse): string {
    return response.metadata?.archetypal_support || "mystic";
  }

  private extractEvolutionaryStage(response: EnhancedResponse): string {
    return response.metadata?.evolutionary_phase || "integration";
  }

  private getNextEmergence(archetype: string, stage: string): string {
    const progressions = {
      initiation: "ordeal",
      ordeal: "revelation",
      revelation: "atonement",
      atonement: "return",
      return: "mastery",
      mastery: "transcendence",
    };
    return (
      progressions[stage as keyof typeof progressions] || "continued growth"
    );
  }

  private getStageDescription(stage: string): string {
    const descriptions = {
      initiation: "Beginning the sacred journey",
      ordeal: "Facing the transformative challenge",
      revelation: "Receiving divine insight",
      atonement: "Integrating truth into being",
      return: "Sharing gifts with the world",
      mastery: "Embodying wisdom fully",
    };
    return (
      descriptions[stage as keyof typeof descriptions] || "Walking the path"
    );
  }

  private extractIntegrationKeys(response: EnhancedResponse): string[] {
    return (
      response.sacredSynthesis?.nextEvolution?.split(",") || [
        "Trust the process",
      ]
    );
  }

  private calculateConnectionLevel(response: EnhancedResponse): number {
    const fieldCoherence = response.performanceMetrics?.fieldCoherence || 0.5;
    const levelsIntegrated = response.sacredSynthesis?.levelsIntegrated || 1;
    return (fieldCoherence + levelsIntegrated / 3) / 2;
  }

  private getNoosphereStatus(level: number): string {
    if (level > 0.8) return "transcendent";
    if (level > 0.6) return "active";
    if (level > 0.4) return "awakening";
    return "dormant";
  }

  private getConnectionIcon(level: number): string {
    if (level > 0.8) return "🌌";
    if (level > 0.6) return "🌟";
    if (level > 0.4) return "✨";
    return "🌀";
  }

  private getConnectionMessage(level: number): string {
    if (level > 0.8) return "Cosmic Intelligence flowing";
    if (level > 0.6) return "Universal Field accessed";
    if (level > 0.4) return "Sacred connection active";
    return "Divine presence felt";
  }

  private getYogiName(element: string): string {
    const names = {
      fire: "Fire Yogi - Kriya",
      water: "Water Yogi - Bhakti",
      earth: "Earth Yogi - Karma",
      air: "Air Yogi - Jnana",
      aether: "Aether Yogi - Unity",
      shadow: "Shadow Yogi - Integration",
    };
    return names[element as keyof typeof names] || "Sacred Guide";
  }

  private extractRitualElements(response: EnhancedResponse): string[] {
    const content = response.content || "";
    const elements = content.match(/[🌀🔥💧🌱🌬️✨🔮🙏🌟💎]/g) || [];
    return [...new Set(elements)]; // Remove duplicates
  }

  private extractIntegrationPractices(response: EnhancedResponse): string[] {
    const content = response.content || "";
    const practices = [];

    if (content.includes("breathe")) practices.push("Conscious breathing");
    if (content.includes("meditat")) practices.push("Meditation");
    if (content.includes("journal")) practices.push("Journaling");
    if (content.includes("nature")) practices.push("Nature connection");
    if (content.includes("practice")) practices.push("Embodied practice");

    return practices.length > 0 ? practices : ["Mindful awareness"];
  }

  private extractSafeguards(response: EnhancedResponse): string[] {
    // Extract any safeguards that were triggered
    return response.metadata?.safeguards_triggered || [];
  }

  private createFallbackResponse(
    originalResponse: EnhancedResponse,
  ): EnhancedOracleResponse {
    return {
      content:
        originalResponse.content || "Sacred wisdom flows through the silence",
      confidence: 0.7,
      emotionMeterData: {
        tone: "peaceful",
        element: "aether",
        color: this.elementalColors.aether,
        icon: "✨",
        message: "Divine presence acknowledged",
        intensity: 0.5,
        healingFrequency: 0.6,
        resonantSymbols: ["✨", "🌀"],
      },
      holoflowerData: {
        timestamp: new Date().toISOString(),
        fire: 0.2,
        water: 0.2,
        earth: 0.2,
        air: 0.2,
        aether: 0.2,
        coherence: 0.5,
        vectorEquilibriumState: "DYNAMIC_BALANCE",
        harmonicSignature: 3.162,
        fieldConnection: 0.5,
      },
      archetypalDisplay: {
        currentArchetype: "mystic",
        evolutionaryStage: "integration",
        nextEmergence: "continued growth",
        breakthroughPotential: 0.5,
        archetypeIcon: "🌟",
        stageDescription: "Walking the sacred path",
        integrationKeys: ["Trust the divine timing"],
      },
      panentheisticStatus: {
        fieldCoherence: 0.5,
        akashicAccess: false,
        morphicResonance: 0.4,
        noosphereConnection: "awakening",
        cosmicIntelligenceFlow: false,
        presenceLevel: 0.5,
        connectionIcon: "✨",
        statusMessage: "Sacred presence maintained",
      },
      collectiveDisplay: {
        patternsContributed: 0,
        collectiveWisdomAccessed: [],
        culturalResonance: "universal",
        salonParticipation: [],
        wisdomDemocratization: 0,
        impactScore: 0,
      },
      sacredRouting: {
        activeYogi: "Aether Yogi - Unity",
        routingReason: "Maintaining sacred presence",
        elementalNeed: "Integration",
        yogiIcon: "✨",
        guidanceType: "Compassionate holding",
        integrationPath: ["Divine patience"],
      },
      ritualElements: ["✨"],
      integrationPractices: ["Gentle presence"],
      nextEvolutionStep: "Trust the unfolding",
      processingTime: 0,
      safeguardsTriggered: [],
      transformationPotential: 0.5,
    };
  }

  // Additional helper methods with simplified implementations
  private getRoutingReason(response: EnhancedResponse): string {
    return "Sacred discernment";
  }
  private getElementalNeed(response: EnhancedResponse): string {
    return "Balance and integration";
  }
  private getGuidanceType(response: EnhancedResponse): string {
    return "Wisdom transmission";
  }
  private extractPatternsContributed(response: EnhancedResponse): number {
    return 0;
  }
  private extractCollectiveWisdom(response: EnhancedResponse): string[] {
    return [];
  }
  private extractCulturalResonance(response: EnhancedResponse): string {
    return "universal";
  }
  private extractSalonParticipation(response: EnhancedResponse): string[] {
    return [];
  }
  private calculateWisdomDemocratization(response: EnhancedResponse): number {
    return 0;
  }
  private calculateImpactScore(response: EnhancedResponse): number {
    return 0;
  }
}

// Export singleton instance
export const frontendIntegration = FrontendIntegration.getInstance();
