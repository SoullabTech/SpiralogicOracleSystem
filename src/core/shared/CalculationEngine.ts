/**
 * CalculationEngine.ts
 * Centralized calculation service for all Spiralogic Oracle components
 * Eliminates duplication and provides optimized, cached calculations
 */

import { ElementalType, SpiralPhase, Archetype, UserEmotionalState } from '../../types/index';
import { UserMetadata, ContextualState } from '../MemoryPayloadInterface';
import { CacheManager } from './CacheManager';

export interface CalculationResult {
  value: number;
  confidence: number;
  factors: string[];
  timestamp: number;
}

export interface ElementalAnalysis {
  primary: ElementalType;
  secondary?: ElementalType;
  balance: Record<ElementalType, number>;
  imbalances: string[];
}

export interface ReadinessAssessment {
  overallReadiness: number;
  breakdown: {
    emotional: number;
    integration: number;
    behavioral: number;
    energetic: number;
    archetypal: number;
  };
  blockingFactors: string[];
  readinessFactors: string[];
}

export class CalculationEngine {
  private static cache = new CacheManager();
  
  // Core elemental resonance frequencies (scientifically derived)
  private static readonly ELEMENTAL_FREQUENCIES = {
    earth: 0.194, // 7.83 Hz (Schumann resonance base)
    water: 0.285, // Fibonacci ratio
    fire: 0.618, // Golden ratio
    air: 0.432, // 432 Hz harmonic ratio
    aether: 0.888 // Unity consciousness frequency
  } as const;

  // Emotional state frequency mappings
  private static readonly EMOTIONAL_FREQUENCIES = {
    peaceful: 0.25, excited: 0.75, anxious: 0.85, depressed: 0.15,
    joyful: 0.65, angry: 0.80, curious: 0.45, overwhelmed: 0.90,
    centered: 0.35, confused: 0.55, hopeful: 0.60, fearful: 0.85,
    content: 0.30, restless: 0.70, inspired: 0.68, frustrated: 0.75,
    grateful: 0.40, lonely: 0.20, connected: 0.50, transforming: 0.82
  } as const;

  // Phase progression thresholds
  private static readonly PHASE_THRESHOLDS = {
    initiation: { entry: 0, exit: 0.6, optimal: [0.2, 0.8] },
    expansion: { entry: 0.6, exit: 0.7, optimal: [0.3, 0.9] },
    integration: { entry: 0.7, exit: 0.8, optimal: [0.5, 0.95] },
    mastery: { entry: 0.8, exit: 0.9, optimal: [0.7, 1.0] }
  } as const;

  /**
   * Calculate elemental resonance frequency for a given element
   * Cached for 1 hour
   */
  static calculateElementalResonance(element: ElementalType): number {
    return this.cache.get(
      `elemental_resonance_${element}`,
      () => this.ELEMENTAL_FREQUENCIES[element],
      3600000 // 1 hour
    );
  }

  /**
   * Calculate emotional state resonance frequency
   * Cached for 5 minutes
   */
  static calculateEmotionalResonance(emotion: UserEmotionalState): number {
    return this.cache.get(
      `emotional_resonance_${emotion}`,
      () => this.EMOTIONAL_FREQUENCIES[emotion] || 0.5,
      300000 // 5 minutes
    );
  }

  /**
   * Calculate user's overall coherence level
   * Combines emotional stability, energy alignment, and integration capacity
   */
  static calculateUserCoherence(userMetadata: UserMetadata): CalculationResult {
    const cacheKey = `user_coherence_${userMetadata.userId}_${userMetadata.lastActiveTimestamp}`;
    
    return this.cache.get(cacheKey, () => {
      const { contextualState, psychProfile } = userMetadata;
      
      // Emotional stability component (40% weight)
      const emotionalStability = this.calculateEmotionalStability(contextualState);
      
      // Integration capacity component (30% weight)
      const integration = psychProfile.integrationCapacity;
      
      // Energy alignment component (20% weight)
      const energyAlignment = contextualState.energyLevel * contextualState.motivationLevel;
      
      // Challenge resilience component (10% weight)
      const resilience = Math.max(0, 1 - (contextualState.currentChallenges.length * 0.15));
      
      const coherence = (
        emotionalStability * 0.4 +
        integration * 0.3 +
        energyAlignment * 0.2 +
        resilience * 0.1
      );

      const factors = [];
      if (emotionalStability < 0.5) factors.push('emotional_instability');
      if (integration < 0.6) factors.push('low_integration');
      if (energyAlignment < 0.4) factors.push('energy_misalignment');
      if (resilience < 0.7) factors.push('challenge_overload');

      return {
        value: Math.max(0, Math.min(1, coherence)),
        confidence: 0.85,
        factors,
        timestamp: Date.now()
      };
    }, 60000); // Cache for 1 minute
  }

  /**
   * Calculate phase transition readiness
   * Determines if user is ready to move to next spiral phase
   */
  static calculatePhaseReadiness(userMetadata: UserMetadata): ReadinessAssessment {
    const cacheKey = `phase_readiness_${userMetadata.userId}_${userMetadata.currentPhase}_${userMetadata.lastActiveTimestamp}`;
    
    return this.cache.get(cacheKey, () => {
      const { currentPhase, psychProfile, journeyMetrics, contextualState } = userMetadata;
      
      // Individual readiness components
      const emotional = this.calculateEmotionalReadiness(contextualState, psychProfile);
      const integration = psychProfile.integrationCapacity;
      const behavioral = this.calculateBehavioralReadiness(journeyMetrics);
      const energetic = contextualState.energyLevel;
      const archetypal = this.calculateArchetypalActivation(psychProfile);
      
      // Weighted overall readiness based on phase
      const weights = this.getPhaseWeights(currentPhase);
      const overallReadiness = (
        emotional * weights.emotional +
        integration * weights.integration +
        behavioral * weights.behavioral +
        energetic * weights.energetic +
        archetypal * weights.archetypal
      );

      // Identify blocking and supporting factors
      const blockingFactors = this.identifyBlockingFactors({
        emotional, integration, behavioral, energetic, archetypal
      });
      
      const readinessFactors = this.identifyReadinessFactors({
        emotional, integration, behavioral, energetic, archetypal
      });

      return {
        overallReadiness: Math.max(0, Math.min(1, overallReadiness)),
        breakdown: { emotional, integration, behavioral, energetic, archetypal },
        blockingFactors,
        readinessFactors
      };
    }, 120000); // Cache for 2 minutes
  }

  /**
   * Analyze user's elemental balance and primary/secondary elements
   */
  static analyzeElementalBalance(userMetadata: UserMetadata): ElementalAnalysis {
    const cacheKey = `elemental_analysis_${userMetadata.userId}_${userMetadata.lastActiveTimestamp}`;
    
    return this.cache.get(cacheKey, () => {
      const { journeyMetrics, contextualState, currentElement } = userMetadata;
      
      // Start with base elemental balance from journey metrics
      const balance = { ...journeyMetrics.elementalBalance };
      
      // Adjust based on current emotional state
      const emotionalElement = this.getEmotionalElement(contextualState.currentEmotionalState);
      balance[emotionalElement] = Math.min(1, balance[emotionalElement] + 0.1);
      
      // Adjust based on current challenges (deficiencies)
      contextualState.currentChallenges.forEach(challenge => {
        if (challenge.element && balance[challenge.element] > 0.1) {
          balance[challenge.element] = Math.max(0.05, balance[challenge.element] - 0.05);
        }
      });
      
      // Identify primary and secondary elements
      const sorted = Object.entries(balance)
        .sort(([,a], [,b]) => b - a) as [ElementalType, number][];
      
      const primary = sorted[0][0];
      const secondary = sorted[1][1] > 0.15 ? sorted[1][0] : undefined;
      
      // Identify imbalances (elements below 0.1 or above 0.4)
      const imbalances = [];
      Object.entries(balance).forEach(([element, value]) => {
        if (value < 0.1) imbalances.push(`${element}_deficiency`);
        if (value > 0.4 && element !== primary) imbalances.push(`${element}_excess`);
      });

      return { primary, secondary, balance, imbalances };
    }, 300000); // Cache for 5 minutes
  }

  /**
   * Calculate resonance between two users for collective synchronization
   */
  static calculateUserResonance(user1: UserMetadata, user2: UserMetadata): number {
    const cacheKey = `user_resonance_${user1.userId}_${user2.userId}_${Math.max(user1.lastActiveTimestamp, user2.lastActiveTimestamp)}`;
    
    return this.cache.get(cacheKey, () => {
      // Phase alignment (30% weight)
      const phaseAlignment = this.calculatePhaseAlignment(user1.currentPhase, user2.currentPhase);
      
      // Elemental compatibility (25% weight)
      const elementalCompatibility = this.calculateElementalCompatibility(
        user1.journeyMetrics.elementalBalance,
        user2.journeyMetrics.elementalBalance
      );
      
      // Archetypal resonance (20% weight)
      const archetypalResonance = this.calculateArchetypalResonance(
        user1.psychProfile.dominantArchetypes,
        user2.psychProfile.dominantArchetypes
      );
      
      // Developmental alignment (15% weight)
      const developmentalAlignment = this.calculateDevelopmentalAlignment(user1, user2);
      
      // Emotional harmony (10% weight)
      const emotionalHarmony = this.calculateEmotionalHarmony(
        user1.contextualState.currentEmotionalState,
        user2.contextualState.currentEmotionalState
      );
      
      return Math.max(0, Math.min(1,
        phaseAlignment * 0.3 +
        elementalCompatibility * 0.25 +
        archetypalResonance * 0.2 +
        developmentalAlignment * 0.15 +
        emotionalHarmony * 0.1
      ));
    }, 600000); // Cache for 10 minutes
  }

  // Private helper methods

  private static calculateEmotionalStability(contextualState: ContextualState): number {
    const baseStability = 1 - (contextualState.currentChallenges.length * 0.1);
    const emotionalResonance = this.calculateEmotionalResonance(contextualState.currentEmotionalState);
    
    // Emotional states closer to center (0.5) indicate more stability
    const emotionalStability = 1 - Math.abs(emotionalResonance - 0.5);
    
    return Math.max(0, Math.min(1, (baseStability + emotionalStability) / 2));
  }

  private static calculateEmotionalReadiness(contextualState: ContextualState, psychProfile: any): number {
    const stability = this.calculateEmotionalStability(contextualState);
    const resilience = psychProfile.resilience;
    const openness = psychProfile.openness;
    
    return (stability * 0.5 + resilience * 0.3 + openness * 0.2);
  }

  private static calculateBehavioralReadiness(journeyMetrics: any): number {
    const engagement = journeyMetrics.totalEngagementTime > 0 ? 0.8 : 0.2;
    const consistency = journeyMetrics.totalSessions > 3 ? 0.7 : 0.3;
    const progress = journeyMetrics.integrationMilestones.length * 0.1;
    
    return Math.min(1, (engagement + consistency + progress) / 3);
  }

  private static calculateArchetypalActivation(psychProfile: any): number {
    const dominantCount = psychProfile.dominantArchetypes.length;
    const emergingCount = psychProfile.emergingArchetypes.length;
    const shadowCount = psychProfile.shadowArchetypes.length;
    
    // Balance between activation and integration
    const activation = dominantCount * 0.3 + emergingCount * 0.2;
    const integration = 1 - (shadowCount * 0.1); // Shadow work reduces readiness temporarily
    
    return Math.max(0, Math.min(1, (activation + integration) / 2));
  }

  private static getPhaseWeights(phase: SpiralPhase): Record<string, number> {
    const weights = {
      initiation: { emotional: 0.35, integration: 0.20, behavioral: 0.25, energetic: 0.15, archetypal: 0.05 },
      expansion: { emotional: 0.25, integration: 0.25, behavioral: 0.30, energetic: 0.15, archetypal: 0.05 },
      integration: { emotional: 0.20, integration: 0.40, behavioral: 0.20, energetic: 0.10, archetypal: 0.10 },
      mastery: { emotional: 0.15, integration: 0.30, behavioral: 0.20, energetic: 0.15, archetypal: 0.20 }
    };
    
    return weights[phase];
  }

  private static identifyBlockingFactors(breakdown: Record<string, number>): string[] {
    const factors = [];
    
    Object.entries(breakdown).forEach(([factor, value]) => {
      if (value < 0.4) factors.push(`low_${factor}`);
      if (value < 0.2) factors.push(`critical_${factor}_deficit`);
    });
    
    return factors;
  }

  private static identifyReadinessFactors(breakdown: Record<string, number>): string[] {
    const factors = [];
    
    Object.entries(breakdown).forEach(([factor, value]) => {
      if (value > 0.7) factors.push(`strong_${factor}`);
      if (value > 0.9) factors.push(`excellent_${factor}`);
    });
    
    return factors;
  }

  private static getEmotionalElement(emotion: UserEmotionalState): ElementalType {
    const emotionalElements = {
      excited: 'fire', joyful: 'fire', inspired: 'fire', transforming: 'fire',
      peaceful: 'water', connected: 'water', grateful: 'water', content: 'water',
      centered: 'earth', hopeful: 'earth',
      curious: 'air', restless: 'air',
      overwhelmed: 'aether', confused: 'aether'
    } as const;
    
    return emotionalElements[emotion as keyof typeof emotionalElements] || 'earth';
  }

  private static calculatePhaseAlignment(phase1: SpiralPhase, phase2: SpiralPhase): number {
    if (phase1 === phase2) return 1;
    
    const phaseOrder = ['initiation', 'expansion', 'integration', 'mastery'];
    const distance = Math.abs(phaseOrder.indexOf(phase1) - phaseOrder.indexOf(phase2));
    
    return Math.max(0, 1 - (distance * 0.25));
  }

  private static calculateElementalCompatibility(balance1: Record<ElementalType, number>, balance2: Record<ElementalType, number>): number {
    // Calculate cosine similarity between elemental balances
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;
    
    Object.keys(balance1).forEach(element => {
      const v1 = balance1[element as ElementalType];
      const v2 = balance2[element as ElementalType];
      
      dotProduct += v1 * v2;
      magnitude1 += v1 * v1;
      magnitude2 += v2 * v2;
    });
    
    const magnitude = Math.sqrt(magnitude1) * Math.sqrt(magnitude2);
    return magnitude > 0 ? dotProduct / magnitude : 0;
  }

  private static calculateArchetypalResonance(archetypes1: Archetype[], archetypes2: Archetype[]): number {
    const intersection = archetypes1.filter(arch => archetypes2.includes(arch));
    const union = [...new Set([...archetypes1, ...archetypes2])];
    
    return union.length > 0 ? intersection.length / union.length : 0;
  }

  private static calculateDevelopmentalAlignment(user1: UserMetadata, user2: UserMetadata): number {
    const integration1 = user1.psychProfile.integrationCapacity;
    const integration2 = user2.psychProfile.integrationCapacity;
    const readiness1 = user1.psychProfile.transformationReadiness;
    const readiness2 = user2.psychProfile.transformationReadiness;
    
    const integrationAlignment = 1 - Math.abs(integration1 - integration2);
    const readinessAlignment = 1 - Math.abs(readiness1 - readiness2);
    
    return (integrationAlignment + readinessAlignment) / 2;
  }

  private static calculateEmotionalHarmony(emotion1: UserEmotionalState, emotion2: UserEmotionalState): number {
    const freq1 = this.calculateEmotionalResonance(emotion1);
    const freq2 = this.calculateEmotionalResonance(emotion2);
    
    // Calculate harmonic relationship
    const ratio = Math.max(freq1, freq2) / Math.min(freq1, freq2);
    
    // Perfect harmony ratios (octave, fifth, fourth, etc.)
    const harmonicRatios = [1, 1.2, 1.33, 1.5, 1.67, 2];
    const closestRatio = harmonicRatios.reduce((prev, curr) => 
      Math.abs(curr - ratio) < Math.abs(prev - ratio) ? curr : prev
    );
    
    return Math.max(0, 1 - Math.abs(ratio - closestRatio));
  }

  /**
   * Clear cache for specific user or all cached data
   */
  static clearCache(userId?: string): void {
    if (userId) {
      this.cache.clearByPattern(`*${userId}*`);
    } else {
      this.cache.clearAll();
    }
  }

  /**
   * Get cache statistics for monitoring
   */
  static getCacheStats(): { size: number; hitRate: number; missRate: number } {
    return this.cache.getStats();
  }
}