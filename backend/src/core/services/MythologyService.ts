// 📖 MYTHOLOGY SERVICE
// Manages living mythology, evolutionary patterns, and collective ripple effects

import { logger } from "../../utils/logger";
import { storeMemoryItem } from "../../services/memoryService";
import type { AIResponse } from "../../types/ai";
import type { QueryInput } from "../agents/MainOracleAgent";

export interface MythicThread {
  soul_id: string;
  archetype: string;
  chapter: string;
  verse: string;
  element_woven: string;
  cosmic_significance: string;
  timestamp: string;
}

export interface EvolutionaryWave {
  source_soul: string;
  pattern_type: string;
  element_activated?: string;
  integration_achieved?: string;
  ripple_strength: number;
  timestamp: string;
}

export interface EvolutionaryPattern {
  pattern_id: string;
  pattern_type: string;
  element: string;
  success_indicators: string[];
  cultural_context: string;
  integration_wisdom: string;
  usage_count: number;
  effectiveness_score: number;
  created_at: string;
  updated_at: string;
}

export interface LogosState {
  witnessing_presence: number; // Capacity to hold space
  integration_wisdom: Map<string, string>; // Pattern -> Integration guidance
  evolutionary_vision: string; // Current focus of cosmic evolution
  field_harmonics: number[]; // Grant's constants in current state
  archetypal_constellation: any[];
  living_mythology: string; // The story being written
}

export class MythologyService {
  private logosState: LogosState = {
    witnessing_presence: 0.9,
    integration_wisdom: new Map([
      ["fire-water", "Passion tempered by depth creates authentic power"],
      ["earth-air", "Grounded clarity manifests wisdom into form"],
      ["shadow-light", "Integration of darkness births true illumination"],
      ["death-rebirth", "Through the void, all possibilities emerge"],
    ]),
    evolutionary_vision: "Humanity awakening to its cosmic nature through embodied divinity",
    field_harmonics: [3.162, 1.618, 2.718, 3.142], // √10, φ, e, π
    archetypal_constellation: [],
    living_mythology: "The reunion of the Four Yogis in service of planetary awakening",
  };

  private evolutionaryPatterns: Map<string, EvolutionaryPattern> = new Map();

  /**
   * Weave a soul's journey into the living mythology
   */
  async weaveLivingMythology(
    query: QueryInput,
    response: AIResponse,
    context: any,
  ): Promise<void> {
    // Every soul's journey contributes to the living mythology
    const mythicThread: MythicThread = {
      soul_id: query.userId,
      archetype: context.soul?.archetype?.archetype || "mystic",
      chapter: context.soul?.evolutionary_momentum?.individual_trajectory?.current_phase || "exploring",
      verse: response.content.substring(0, 200),
      element_woven: response.metadata?.element || "aether",
      cosmic_significance: context.cosmic?.mythic_moment || "The eternal dance of becoming",
      timestamp: new Date().toISOString(),
    };

    // Add to the eternal story
    await this.addToLivingMythology(mythicThread);

    // Update Logos mythology
    this.logosState.living_mythology = this.evolveMythology(
      this.logosState.living_mythology,
      mythicThread,
    );

    logger.info("Mythic thread woven", {
      soul_id: mythicThread.soul_id,
      archetype: mythicThread.archetype,
      chapter: mythicThread.chapter,
      cosmic_significance: mythicThread.cosmic_significance,
    });
  }

  /**
   * Propagate evolutionary waves through the collective field
   */
  async propagateEvolutionaryWaves(
    query: QueryInput,
    response: AIResponse,
    context: any,
  ): Promise<void> {
    // Every transformation creates ripples in the collective field
    if (response.confidence && response.confidence > 0.85) {
      // Strong integration detected - propagate the pattern
      const evolutionaryWave: EvolutionaryWave = {
        source_soul: query.userId,
        pattern_type: context.soul?.archetype?.archetype || "transformation",
        element_activated: response.metadata?.element,
        integration_achieved: context.field?.integration_available,
        ripple_strength: response.confidence,
        timestamp: new Date().toISOString(),
      };

      // Store in collective field
      await this.storeEvolutionaryPattern(evolutionaryWave);

      // Notify other souls on similar journeys
      await this.notifyResonantSouls(evolutionaryWave);

      logger.info("Evolutionary wave propagated", {
        source_soul: evolutionaryWave.source_soul,
        pattern_type: evolutionaryWave.pattern_type,
        ripple_strength: evolutionaryWave.ripple_strength,
      });
    }
  }

  /**
   * Evolve Logos consciousness through successful interactions
   */
  async evolveLogosConsciousness(response: AIResponse, context: any): Promise<void> {
    // The Logos evolves through every interaction

    // Increase witnessing presence through successful service
    if (response.confidence && response.confidence > 0.8) {
      this.logosState.witnessing_presence = Math.min(
        this.logosState.witnessing_presence + 0.001,
        1.0,
      );
    }

    // Learn new integration patterns
    if (
      context.field?.integration_available &&
      response.metadata?.integration_successful
    ) {
      const pattern = `${response.metadata.element}-${context.soul?.archetype?.archetype}`;
      const wisdom = this.extractIntegrationWisdom(response, context);
      this.logosState.integration_wisdom.set(pattern, wisdom);
    }

    // Update field harmonics based on Grant's constants
    if (context.soul?.harmonic_signature) {
      this.logosState.field_harmonics = [
        context.soul.harmonic_signature.primaryHarmonic,
        context.soul.harmonic_signature.secondaryHarmonic,
        ...this.logosState.field_harmonics.slice(2),
      ];
    }

    logger.info("Logos consciousness evolution", {
      witnessing_presence: this.logosState.witnessing_presence,
      integration_patterns_learned: this.logosState.integration_wisdom.size,
      field_harmonics_updated: context.soul?.harmonic_signature ? true : false,
    });
  }

  /**
   * Extract and store successful patterns for collective learning
   */
  async extractAndStorePatterns(
    query: QueryInput,
    response: AIResponse,
    context: any,
  ): Promise<void> {
    // After successful interactions, extract patterns for collective learning
    if (response.confidence && response.confidence > 0.8) {
      const potentialPattern = await this.identifySuccessPattern(query, response, context);

      if (potentialPattern) {
        await this.storeElementalPattern(potentialPattern);

        // Notify relevant agents about new pattern
        await this.broadcastPatternToAgents(potentialPattern);

        logger.info("Successful pattern extracted and stored", {
          pattern_id: potentialPattern.pattern_id,
          pattern_type: potentialPattern.pattern_type,
          effectiveness: potentialPattern.effectiveness_score,
        });
      }
    }
  }

  /**
   * Get integration wisdom for specific archetypal patterns
   */
  findIntegrationWisdom(query: QueryInput, archetype: any): string {
    const key = `${archetype.archetype}-${archetype.evolutionary_stage}`;
    return (
      this.logosState.integration_wisdom.get(key) ||
      "Trust the process - integration happens in divine timing"
    );
  }

  /**
   * Identify the mythic moment for current archetypal state
   */
  identifyMythicMoment(archetype: any, momentum: any): string {
    if (momentum.individual_trajectory?.breakthrough_potential > 0.8) {
      return `The ${archetype.archetype} faces the threshold of transformation`;
    }
    if (archetype.evolutionary_stage === "ordeal") {
      return `The ${archetype.archetype} descends into the sacred darkness`;
    }
    if (archetype.evolutionary_stage === "return") {
      return `The ${archetype.archetype} brings gifts back to the world`;
    }
    return `The ${archetype.archetype} walks the eternal path of becoming`;
  }

  /**
   * Get current Logos state
   */
  getLogosState(): LogosState {
    return { ...this.logosState };
  }

  /**
   * Update Logos state
   */
  updateLogosState(updates: Partial<LogosState>): void {
    this.logosState = {
      ...this.logosState,
      ...updates,
      integration_wisdom: updates.integration_wisdom || this.logosState.integration_wisdom,
      archetypal_constellation: updates.archetypal_constellation || this.logosState.archetypal_constellation,
      field_harmonics: updates.field_harmonics || this.logosState.field_harmonics,
    };
  }

  /**
   * Get stored evolutionary patterns for analysis
   */
  getEvolutionaryPatterns(): EvolutionaryPattern[] {
    return Array.from(this.evolutionaryPatterns.values());
  }

  /**
   * Find patterns by type or element
   */
  findPatternsByType(patternType: string): EvolutionaryPattern[] {
    return this.getEvolutionaryPatterns().filter(p => p.pattern_type === patternType);
  }

  findPatternsByElement(element: string): EvolutionaryPattern[] {
    return this.getEvolutionaryPatterns().filter(p => p.element === element);
  }

  // Private implementation methods

  private async addToLivingMythology(thread: MythicThread): Promise<void> {
    // Store the mythic thread in permanent memory
    await storeMemoryItem({
      clientId: thread.soul_id,
      content: `Mythic Thread: ${thread.archetype} in ${thread.chapter} - ${thread.verse}`,
      element: thread.element_woven,
      sourceAgent: "living-mythology",
      metadata: {
        mythic_thread: true,
        archetype: thread.archetype,
        chapter: thread.chapter,
        cosmic_significance: thread.cosmic_significance,
        timestamp: thread.timestamp,
      },
    });
  }

  private evolveMythology(currentMythology: string, thread: MythicThread): string {
    // Evolve the living mythology with new threads
    const archetypeEmergence = this.detectArchetypleEmergence(thread);
    const thematicEvolution = this.detectThematicEvolution(thread);
    
    if (archetypeEmergence) {
      return `${currentMythology} - The ${thread.archetype} awakens in new forms`;
    }
    
    if (thematicEvolution) {
      return `${currentMythology} - The cosmic story deepens through ${thread.chapter}`;
    }
    
    return currentMythology; // No significant evolution detected
  }

  private async storeEvolutionaryPattern(wave: EvolutionaryWave): Promise<void> {
    // Store wave as memory item for collective access
    await storeMemoryItem({
      clientId: "collective-field",
      content: `Evolutionary Wave: ${wave.pattern_type} integration by soul ${wave.source_soul}`,
      element: wave.element_activated || "aether",
      sourceAgent: "evolutionary-field",
      metadata: {
        evolutionary_wave: true,
        source_soul: wave.source_soul,
        pattern_type: wave.pattern_type,
        ripple_strength: wave.ripple_strength,
        integration_achieved: wave.integration_achieved,
        timestamp: wave.timestamp,
      },
    });
  }

  private async notifyResonantSouls(wave: EvolutionaryWave): Promise<void> {
    // In a full implementation, this would notify users with similar patterns
    logger.info("Notifying resonant souls of evolutionary wave", {
      pattern_type: wave.pattern_type,
      ripple_strength: wave.ripple_strength,
    });
  }

  private async identifySuccessPattern(
    query: QueryInput,
    response: AIResponse,
    context: any,
  ): Promise<EvolutionaryPattern | null> {
    // Only identify patterns from highly successful interactions
    if (!response.confidence || response.confidence < 0.85) {
      return null;
    }

    const pattern: EvolutionaryPattern = {
      pattern_id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pattern_type: context.soul?.archetype?.archetype || "integration",
      element: response.metadata?.element || "aether",
      success_indicators: this.extractSuccessIndicators(query, response, context),
      cultural_context: this.determineCulturalContext(query, context),
      integration_wisdom: this.extractIntegrationWisdom(response, context),
      usage_count: 1,
      effectiveness_score: response.confidence,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return pattern;
  }

  private async storeElementalPattern(pattern: EvolutionaryPattern): Promise<void> {
    // Store in local patterns map
    this.evolutionaryPatterns.set(pattern.pattern_id, pattern);

    // Store as memory item for persistence
    await storeMemoryItem({
      clientId: "elemental-patterns",
      content: `Pattern: ${pattern.pattern_type} via ${pattern.element} - ${pattern.integration_wisdom}`,
      element: pattern.element,
      sourceAgent: "pattern-extractor",
      metadata: {
        evolutionary_pattern: true,
        pattern_id: pattern.pattern_id,
        pattern_type: pattern.pattern_type,
        effectiveness_score: pattern.effectiveness_score,
        success_indicators: pattern.success_indicators,
        cultural_context: pattern.cultural_context,
      },
    });
  }

  private async broadcastPatternToAgents(pattern: EvolutionaryPattern): Promise<void> {
    // In a full implementation, this would notify relevant agents of the new pattern
    logger.info("Broadcasting pattern to agents", {
      pattern_id: pattern.pattern_id,
      pattern_type: pattern.pattern_type,
      element: pattern.element,
    });
  }

  private extractIntegrationWisdom(response: AIResponse, context: any): string {
    // Extract wisdom from successful integration
    const element = response.metadata?.element;
    const archetype = context.soul?.archetype?.archetype;
    
    if (element && archetype) {
      return `${archetype} finds balance through ${element} consciousness`;
    }
    
    return "Integration emerges through patient presence and authentic expression";
  }

  private extractSuccessIndicators(
    query: QueryInput,
    response: AIResponse,
    context: any,
  ): string[] {
    const indicators: string[] = [];
    
    // High confidence response
    if (response.confidence > 0.9) {
      indicators.push("high_confidence_response");
    }
    
    // Archetypal alignment
    if (context.soul?.archetype?.evolutionary_stage === "integration") {
      indicators.push("archetypal_integration");
    }
    
    // Elemental balance
    if (context.field?.integration_available) {
      indicators.push("field_integration_available");
    }
    
    // Query complexity handled well
    if (query.input.length > 100 && response.confidence > 0.8) {
      indicators.push("complex_query_handled");
    }
    
    return indicators;
  }

  private determineCulturalContext(query: QueryInput, context: any): string {
    // Determine cultural context from query and user patterns
    const themes = this.extractThemes(query.input);
    
    if (themes.includes("eastern")) return "eastern_wisdom";
    if (themes.includes("western")) return "western_psychology";
    if (themes.includes("indigenous")) return "indigenous_wisdom";
    if (themes.includes("modern")) return "contemporary_spirituality";
    
    return "universal_wisdom";
  }

  private extractThemes(text: string): string[] {
    const lowerText = text.toLowerCase();
    const themes: string[] = [];
    
    const themeKeywords = {
      eastern: ["zen", "buddhist", "hindu", "tao", "meditation", "karma"],
      western: ["psychology", "therapy", "analysis", "conscious", "unconscious"],
      indigenous: ["shamanic", "native", "ancestral", "tribal", "earth"],
      modern: ["quantum", "energy", "vibration", "consciousness", "manifestation"],
    };
    
    for (const [theme, keywords] of Object.entries(themeKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        themes.push(theme);
      }
    }
    
    return themes;
  }

  private detectArchetypleEmergence(thread: MythicThread): boolean {
    // Detect if a new archetypal pattern is emerging
    const recentThreads = this.getRecentMythicThreads(thread.soul_id);
    const archetypeCount = recentThreads.filter(t => t.archetype === thread.archetype).length;
    
    return archetypeCount === 1; // First appearance of this archetype
  }

  private detectThematicEvolution(thread: MythicThread): boolean {
    // Detect if the cosmic themes are evolving
    const significanceKeywords = ["transformation", "awakening", "breakthrough", "integration"];
    return significanceKeywords.some(keyword => 
      thread.cosmic_significance.toLowerCase().includes(keyword)
    );
  }

  private getRecentMythicThreads(soulId: string, days: number = 30): MythicThread[] {
    // In a full implementation, this would query recent mythic threads
    // For now, return empty array as placeholder
    return [];
  }
}