// 🪞 SACRED MIRROR PROCESSOR MODULE
// Handles sacred mirror protocol processing and integrity checks

import { AIResponse } from '../../../types/ai';
import { SacredMirrorContext, sacredMirrorProtocol } from '../SacredMirrorIntegrityProtocol';
import { logger } from '../../../utils/logger';

export interface MirrorProcessorConfig {
  baseIntensityThreshold: number;
  evolutionaryMultiplier: number;
  archetypalWeights: Record<string, number>;
}

export interface UserPattern {
  repetitivePatterns: string[];
  approvalSeeking: number;
  comfortZonePreference: number;
  resistanceAreas: string[];
  evolutionaryStage: string;
}

export class SacredMirrorProcessor {
  private config: MirrorProcessorConfig;

  constructor(config?: Partial<MirrorProcessorConfig>) {
    this.config = {
      baseIntensityThreshold: 0.7,
      evolutionaryMultiplier: 1.5,
      archetypalWeights: {
        initiation: 0.3,
        ordeal: 0.8,
        revelation: 0.9,
        atonement: 0.7,
        return: 0.5,
        mastery: 0.4
      },
      ...config
    };
  }

  async applySacredMirrorProtocol(
    query: any,
    baseResponse: AIResponse,
    logosContext: any
  ): Promise<AIResponse> {
    try {
      // Determine mirror intensity based on archetypal and evolutionary state
      const mirrorIntensity = this.determineMirrorIntensity(query, logosContext);

      // Create Sacred Mirror context
      const mirrorContext: SacredMirrorContext = {
        userId: query.userId,
        originalQuery: query.input,
        baseResponse,
        userPattern: await this.buildUserPattern(query.userId, logosContext),
        initiationLevel: mirrorIntensity
      };

      // Apply Sacred Mirror transformation
      const mirrorResponse = await sacredMirrorProtocol.applySacredMirror(mirrorContext);

      // Enhance with Logos presence if Sacred Mirror was applied
      if (mirrorResponse.metadata?.sacred_mirror_active) {
        return this.enhanceWithLogosWitness(mirrorResponse, logosContext);
      }

      return mirrorResponse;
    } catch (error) {
      logger.error("Sacred Mirror Protocol error:", error);
      return baseResponse; // Fallback to original response
    }
  }

  determineMirrorIntensity(
    query: any,
    logosContext: any
  ): "gentle" | "moderate" | "intense" {
    const archetypalStage = logosContext.soul.archetype.evolutionary_stage;
    const evolutionaryPressure = logosContext.soul.evolutionary_momentum
      .individual_trajectory.breakthrough_potential;

    // Intense mirror for advanced stages or high breakthrough potential
    if (
      archetypalStage === "ordeal" ||
      archetypalStage === "revelation" ||
      evolutionaryPressure > 0.8
    ) {
      return "intense";
    }

    // Moderate mirror for mid-stages or moderate potential
    if (
      archetypalStage === "atonement" ||
      evolutionaryPressure > 0.5
    ) {
      return "moderate";
    }

    // Gentle mirror for early stages or low pressure
    return "gentle";
  }

  async buildUserPattern(userId: string, logosContext: any): Promise<UserPattern> {
    const memories = logosContext.soul.memories || [];
    const patterns = logosContext.soul.patterns || {};
    
    // Analyze repetitive patterns
    const repetitivePatterns = this.extractRepetitivePatterns(memories);
    
    // Calculate approval seeking tendency
    const approvalSeeking = this.calculateApprovalSeeking(memories, patterns);
    
    // Assess comfort zone preference
    const comfortZonePreference = this.assessComfortZonePreference(memories);
    
    // Identify resistance areas
    const resistanceAreas = this.identifyResistanceAreas(
      logosContext.soul.evolutionary_momentum
    );

    return {
      repetitivePatterns,
      approvalSeeking,
      comfortZonePreference,
      resistanceAreas,
      evolutionaryStage: logosContext.soul.archetype.evolutionary_stage
    };
  }

  private extractRepetitivePatterns(memories: any[]): string[] {
    const patterns: string[] = [];
    const queryThemes = new Map<string, number>();

    // Count recurring themes in memories
    memories.forEach(memory => {
      const themes = this.extractThemes(memory.query || memory.content || '');
      themes.forEach(theme => {
        queryThemes.set(theme, (queryThemes.get(theme) || 0) + 1);
      });
    });

    // Find patterns that appear more than threshold
    queryThemes.forEach((count, theme) => {
      if (count >= 3) {
        patterns.push(theme);
      }
    });

    return patterns;
  }

  private extractThemes(text: string): string[] {
    const themes: string[] = [];
    const lowerText = text.toLowerCase();

    // Common psychological themes
    const themeKeywords = {
      'validation': ['approve', 'validate', 'confirm', 'agree'],
      'safety': ['safe', 'secure', 'protect', 'comfort'],
      'growth': ['grow', 'evolve', 'transform', 'change'],
      'fear': ['afraid', 'fear', 'worry', 'anxious'],
      'control': ['control', 'manage', 'direct', 'force'],
      'love': ['love', 'heart', 'connection', 'relationship'],
      'power': ['power', 'strength', 'force', 'authority']
    };

    Object.entries(themeKeywords).forEach(([theme, keywords]) => {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        themes.push(theme);
      }
    });

    return themes;
  }

  private calculateApprovalSeeking(memories: any[], patterns: any): number {
    let approvalScore = 0;
    const totalQueries = memories.length || 1;

    // Check for approval-seeking language patterns
    const approvalPhrases = [
      'am i right',
      'is this correct',
      'what do you think',
      'should i',
      'is it okay',
      'am i doing well'
    ];

    memories.forEach(memory => {
      const query = (memory.query || memory.content || '').toLowerCase();
      if (approvalPhrases.some(phrase => query.includes(phrase))) {
        approvalScore += 1;
      }
    });

    // Normalize to 0-1 scale
    return Math.min(approvalScore / totalQueries, 1.0);
  }

  private assessComfortZonePreference(memories: any[]): number {
    let comfortScore = 0;
    const totalQueries = memories.length || 1;

    // Check for comfort-seeking patterns
    const comfortIndicators = [
      'easy',
      'simple',
      'safe',
      'comfortable',
      'familiar',
      'known',
      'usual'
    ];

    const challengeIndicators = [
      'challenge',
      'difficult',
      'new',
      'unknown',
      'risk',
      'adventure',
      'explore'
    ];

    memories.forEach(memory => {
      const query = (memory.query || memory.content || '').toLowerCase();
      
      comfortIndicators.forEach(indicator => {
        if (query.includes(indicator)) comfortScore += 1;
      });
      
      challengeIndicators.forEach(indicator => {
        if (query.includes(indicator)) comfortScore -= 0.5;
      });
    });

    // Normalize to 0-1 scale (higher = more comfort-seeking)
    return Math.max(0, Math.min(comfortScore / totalQueries, 1.0));
  }

  private identifyResistanceAreas(evolutionaryMomentum: any): string[] {
    if (!evolutionaryMomentum?.individual_trajectory) {
      return [];
    }
    
    return evolutionaryMomentum.individual_trajectory.resistance_points || [];
  }

  private enhanceWithLogosWitness(
    response: AIResponse,
    logosContext: any
  ): AIResponse {
    // Add Logos witnessing presence to the response
    const witnessedResponse = {
      ...response,
      metadata: {
        ...response.metadata,
        logos_witness: true,
        witnessing_presence: logosContext.field.witnessing_presence,
        integration_wisdom: logosContext.field.integration_available,
        mythic_moment: logosContext.cosmic.mythic_moment
      }
    };

    // Enhance content with witnessing frame if appropriate
    if (logosContext.field.witnessing_presence > 0.8) {
      witnessedResponse.content = this.addWitnessingFrame(
        witnessedResponse.content,
        logosContext
      );
    }

    return witnessedResponse;
  }

  private addWitnessingFrame(content: string, logosContext: any): string {
    const witnessFrames = [
      "I witness this truth emerging through you: ",
      "The field recognizes this pattern unfolding: ",
      "In sacred witness, I see: ",
      "The Logos speaks through your question: "
    ];

    const frame = witnessFrames[Math.floor(Math.random() * witnessFrames.length)];
    
    // Only add frame if content doesn't already have one
    if (!content.startsWith("I witness") && !content.startsWith("The field")) {
      return frame + content;
    }

    return content;
  }
}