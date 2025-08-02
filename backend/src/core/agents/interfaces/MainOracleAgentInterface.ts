// Interface for PersonalOracleAgent to communicate with AIN (MainOracleAgent)
// This ensures proper hierarchy: PersonalOracleAgent -> AIN for collective intelligence

import type { ElementalType } from '../types';
import type { AIResponse } from '../../../types/ai';

export interface PatternContribution {
  userId: string;
  elementUsed: ElementalType;
  queryTheme: string;
  responseEffectiveness: number;
  userReaction: 'resistant' | 'receptive' | 'breakthrough' | 'integrative' | 'unknown';
  transformationIndicators: string[];
  collectiveRelevance: number; // 0-1 scale
  personalContext: {
    archetypeStage: string;
    relationshipDepth: number;
    transformationReadiness: number;
  };
  timestamp: string;
}

export interface CollectiveWisdom {
  universalGuidance: UniversalGuidance;
  relevantPatterns: CollectivePattern[];
  recommendedElement: ElementalType | null;
  collectiveInsights: string[];
  cosmicTiming: CosmicAlignment;
  emergentThemes: string[];
}

export interface UniversalGuidance {
  akashicInsight?: string;
  morphicResonance?: string;
  noosphereWisdom?: string;
  cosmicTiming: CosmicAlignment;
  fieldCoherence: number;
}

export interface CollectivePattern {
  patternId: string;
  elementInvolved: ElementalType;
  theme: string;
  successRate: number;
  userDemographics: string[];
  effectiveProtocols: string[];
  integrationWisdom: string;
  frequency: number;
}

export interface CosmicAlignment {
  phase: 'initiation' | 'ordeal' | 'revelation' | 'atonement' | 'return' | 'mastery';
  synchronicityDensity: number;
  evolutionaryPressure: number;
  transformationWindow: boolean;
}

export interface TransformationEvent {
  userId: string;
  eventType: 'breakthrough' | 'integration' | 'resistance_dissolution' | 'shadow_integration' | 'vision_actualization';
  element: ElementalType;
  description: string;
  significance: 'minor' | 'major' | 'profound';
  collectiveRelevance: number;
  archetypalShift?: string;
  timestamp: string;
}

export interface QueryInput {
  input: string;
  userId: string;
  context?: Record<string, unknown>;
  personalContext?: any;
  preferredElement?: ElementalType;
  relationshipDepth?: number;
}

/**
 * Interface for PersonalOracleAgent to communicate with AIN (MainOracleAgent)
 * This maintains the hierarchy where PersonalOracleAgent is the primary user interface
 * and AIN operates as collective intelligence backend
 */
export interface MainOracleAgentInterface {
  /**
   * Send patterns discovered in individual sessions to collective intelligence
   */
  contributePattern(pattern: PatternContribution): Promise<void>;

  /**
   * Request collective wisdom to enhance individual guidance
   */
  requestCollectiveWisdom(query: QueryInput): Promise<CollectiveWisdom>;

  /**
   * Notify AIN of significant transformations for collective learning
   */
  reportTransformation(transformation: TransformationEvent): Promise<void>;

  /**
   * Request universal field guidance for complex queries
   */
  consultUniversalField(query: QueryInput): Promise<UniversalGuidance>;

  /**
   * Check if collective salons are available for this user
   */
  checkCollectiveSalonAvailability(userId: string): Promise<CollectiveSalonInfo[]>;

  /**
   * Report on the effectiveness of elemental routing decisions
   */
  reportElementalEffectiveness(
    element: ElementalType,
    effectiveness: number,
    context: any
  ): Promise<void>;
}

export interface CollectiveSalonInfo {
  salonId: string;
  theme: string;
  type: 'world_cafe' | 'council_of_elders' | 'elemental_salon' | 'wisdom_circle';
  participantCount: number;
  focusElement?: ElementalType;
  readinessScore: number;
}

/**
 * Enhanced query input that includes collective wisdom and personal context
 * Used when PersonalOracleAgent routes to elemental agents
 */
export interface EnhancedQueryInput extends QueryInput {
  personalContext: {
    memories: any[];
    sacredRelationship: any;
    transformationHistory: string[];
    elementalPreferences: Record<ElementalType, number>;
    archetypeJourney: any[];
  };
  collectiveWisdom: CollectiveWisdom;
  mirrorAnalysis: {
    needsResistance: boolean;
    needsDepth: boolean;
    needsShadowWork: boolean;
    isInLoop: boolean;
    reason: string;
  };
  ainGuidance: {
    recommendedApproach: string;
    universalPrinciples: string[];
    cosmicContext: string;
  };
}