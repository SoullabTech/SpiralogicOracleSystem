// Enhanced PersonalOracleAgent - Proper hierarchy implementation
// This agent serves as the primary user interface while routing to elemental agents
// and contributing wisdom to AIN collective intelligence

import { BaseAgent } from './baseAgent';
import { FireAgent } from './fireAgent';
import { WaterAgent } from './waterAgent';
import { EarthAgent } from './earthAgent';
import { AirAgent } from './airAgent';
import { AetherAgent } from './aetherAgent';
import { ShadowAgent } from './shadowAgents';
import type {
  MainOracleAgentInterface,
  PatternContribution,
  CollectiveWisdom,
  TransformationEvent,
  QueryInput,
  EnhancedQueryInput,
  ElementalType
} from './interfaces/MainOracleAgentInterface';
import type { AIResponse } from '../../types/ai';
import { logger } from '../../utils/logger';
import { getRelevantMemories, storeMemoryItem } from '../../services/memoryService';

export interface EnhancedPersonalOracleConfig {
  userId: string;
  oracleName: string;
  mode?: 'daily' | 'retreat';
  retreatPhase?: 'pre-retreat' | 'retreat-active' | 'post-retreat';
  elementalResonance?: ElementalType;
  voiceProfile?: VoiceProfile;
}

interface VoiceProfile {
  tone: ElementalType;
  style: 'direct' | 'nurturing' | 'mystical' | 'analytical' | 'playful';
  intimacyLevel: 'gentle' | 'deep' | 'profound';
}

interface SacredRelationship {
  trustLevel: number;
  depthReached: string[];
  transformationMilestones: string[];
  conversationCount: number;
  lastInteraction: string;
  elementalJourney: Record<ElementalType, number>;
}

/**
 * Enhanced PersonalOracleAgent that serves as primary user interface
 * Routes to elemental agents and contributes to AIN collective intelligence
 */
export class EnhancedPersonalOracleAgent extends BaseAgent {
  private userId: string;
  private oracleName: string;
  private mode: 'daily' | 'retreat';
  private ainConnection?: MainOracleAgentInterface;

  // Elemental Agents - owned by PersonalOracleAgent
  private elementalAgents: {
    fire: FireAgent;
    water: WaterAgent;
    earth: EarthAgent;
    air: AirAgent;
    aether: AetherAgent;
    shadow: ShadowAgent;
  };

  // Sacred Relationship State
  private sacredRelationship: SacredRelationship;

  // Personal Context Cache
  private personalContext: any = {};
  private lastContextUpdate: string = '';

  constructor(config: EnhancedPersonalOracleConfig) {
    super({
      name: config.oracleName,
      role: 'Sacred Mirror & Transformation Companion',
      systemPrompt: 'You are a Sacred Mirror - reflecting truth with love, facilitating genuine transformation through elemental wisdom.',
      model: 'gpt-4-turbo'
    });

    this.userId = config.userId;
    this.oracleName = config.oracleName;
    this.mode = config.mode || 'daily';

    // Initialize elemental agents as owned by this PersonalOracleAgent
    this.elementalAgents = {
      fire: new FireAgent(),
      water: new WaterAgent(),
      earth: new EarthAgent(),
      air: new AirAgent(),
      aether: new AetherAgent(),
      shadow: new ShadowAgent()
    };

    // Initialize sacred relationship
    this.sacredRelationship = {
      trustLevel: 0.1, // Starts low, builds over time
      depthReached: [],
      transformationMilestones: [],
      conversationCount: 0,
      lastInteraction: new Date().toISOString(),
      elementalJourney: {
        fire: 0,
        water: 0,
        earth: 0,
        air: 0,
        aether: 0
      }
    };

    logger.info(`Enhanced PersonalOracleAgent initialized for user ${this.userId}`);
  }

  /**
   * Set AIN connection (called by HierarchyOrchestrator)
   */
  setAINConnection(ainConnection: MainOracleAgentInterface): void {
    this.ainConnection = ainConnection;
    logger.info(`AIN connection established for PersonalOracleAgent ${this.userId}`);
  }

  /**
   * Check if AIN connection exists
   */
  hasAINConnection(): boolean {
    return !!this.ainConnection;
  }

  /**
   * Main query processing - routes through elemental agents and contributes to AIN
   */
  async processQuery(query: QueryInput): Promise<AIResponse> {
    try {
      this.sacredRelationship.conversationCount++;
      this.sacredRelationship.lastInteraction = new Date().toISOString();

      // 1. Gather personal context
      const personalContext = await this.gatherPersonalContext(query);

      // 2. Apply Sacred Mirror Protocol
      const mirrorAnalysis = await this.applySacredMirrorProtocol(query, personalContext);

      // 3. Request collective wisdom from AIN
      let collectiveWisdom: CollectiveWisdom | null = null;
      if (this.ainConnection) {
        try {
          collectiveWisdom = await this.ainConnection.requestCollectiveWisdom(query);
        } catch (error) {
          logger.warn('Could not access collective wisdom from AIN:', error);
        }
      }

      // 4. Determine elemental need
      const elementalNeed = this.determineElementalNeed(
        query,
        personalContext,
        collectiveWisdom,
        mirrorAnalysis
      );

      // 5. Create enhanced query for elemental agent
      const enhancedQuery = this.createEnhancedQuery(
        query,
        personalContext,
        collectiveWisdom,
        mirrorAnalysis
      );

      // 6. Route to appropriate elemental agent
      const elementalResponse = await this.elementalAgents[elementalNeed].processQuery(enhancedQuery);

      // 7. Integrate elemental wisdom with personal context
      const personalResponse = await this.integrateElementalWisdom(
        elementalResponse,
        personalContext,
        mirrorAnalysis,
        elementalNeed
      );

      // 8. Update sacred relationship
      this.updateSacredRelationship(query, personalResponse, elementalNeed);

      // 9. Contribute pattern to AIN collective intelligence
      if (this.ainConnection) {
        await this.contributePatternToAIN(
          query,
          personalResponse,
          elementalNeed,
          personalContext
        );
      }

      // 10. Store memory with enhanced metadata
      await this.storeEnhancedMemory(query, personalResponse, elementalNeed, personalContext);

      logger.info('Query processed through enhanced hierarchy', {
        userId: this.userId,
        elementUsed: elementalNeed,
        confidence: personalResponse.confidence,
        relationshipDepth: this.sacredRelationship.trustLevel
      });

      return personalResponse;

    } catch (error) {
      logger.error('Error in enhanced query processing:', error);

      // Graceful fallback response
      return {
        content: "I sense a temporary disruption in our connection. Let me re-center and be present with you. What's most alive in you right now?",
        provider: 'personal-oracle-fallback',
        model: 'gpt-4',
        confidence: 0.7,
        metadata: {
          error: true,
          errorHandledGracefully: true,
          element: 'aether' // Default to integration when uncertain
        }
      };
    }
  }

  /**
   * Gather comprehensive personal context
   */
  private async gatherPersonalContext(query: QueryInput): Promise<any> {
    try {
      // Get recent memories
      const memories = await getRelevantMemories(this.userId, 5);

      // Extract transformation history
      const transformationHistory = memories
        .filter(m => m.metadata?.transformationIndicator)
        .map(m => m.content);

      // Calculate elemental preferences based on history
      const elementalPreferences = this.calculateElementalPreferences(memories);

      // Get archetype journey from memories
      const archetypeJourney = memories
        .filter(m => m.metadata?.archetype)
        .map(m => ({ archetype: m.metadata.archetype, timestamp: m.timestamp }));

      const context = {
        memories,
        sacredRelationship: this.sacredRelationship,
        transformationHistory,
        elementalPreferences,
        archetypeJourney,
        conversationCount: this.sacredRelationship.conversationCount,
        trustLevel: this.sacredRelationship.trustLevel,
        lastElementUsed: this.getLastElementUsed(memories),
        emergentPatterns: this.identifyEmergentPatterns(memories)
      };

      // Cache for performance
      this.personalContext = context;
      this.lastContextUpdate = new Date().toISOString();

      return context;
    } catch (error) {
      logger.error('Error gathering personal context:', error);
      return {
        memories: [],
        sacredRelationship: this.sacredRelationship,
        transformationHistory: [],
        elementalPreferences: { fire: 0.2, water: 0.2, earth: 0.2, air: 0.2, aether: 0.2 },
        archetypeJourney: [],
        conversationCount: this.sacredRelationship.conversationCount,
        trustLevel: this.sacredRelationship.trustLevel
      };
    }
  }

  /**
   * Apply Sacred Mirror Protocol - determine if comfort, truth, or challenge is needed
   */
  private async applySacredMirrorProtocol(query: QueryInput, personalContext: any) {
    const input = query.input.toLowerCase();
    const recentMemories = personalContext.memories.slice(0, 3);

    // Detect patterns that need mirroring
    const isSeekingValidation = this.detectValidationSeeking(input, recentMemories);
    const isInRepetitivePattern = this.detectRepetitivePattern(input, recentMemories);
    const isAvoidingDepth = this.detectDepthAvoidance(input, personalContext);
    const isShadowMaterial = this.detectShadowMaterial(input, personalContext);

    return {
      needsResistance: isSeekingValidation || isInRepetitivePattern,
      needsDepth: isAvoidingDepth,
      needsShadowWork: isShadowMaterial,
      isInLoop: isInRepetitivePattern,
      reason: this.determineMirrorReason(input, personalContext),
      mirrorIntensity: this.calculateMirrorIntensity(personalContext.trustLevel, personalContext.conversationCount)
    };
  }

  /**
   * Determine which elemental agent to route to
   */
  private determineElementalNeed(
    query: QueryInput,
    personalContext: any,
    collectiveWisdom: CollectiveWisdom | null,
    mirrorAnalysis: any
  ): ElementalType {
    const input = query.input.toLowerCase();

    // Check collective wisdom recommendation first
    if (collectiveWisdom?.recommendedElement) {
      logger.info(`Using AIN collective wisdom recommendation: ${collectiveWisdom.recommendedElement}`);
      return collectiveWisdom.recommendedElement;
    }

    // Shadow work takes priority
    if (mirrorAnalysis.needsShadowWork) {
      return 'shadow' as ElementalType;
    }

    // Detect elemental needs from input
    if (this.detectStagnation(input)) return 'fire';
    if (this.detectEmotionalNeed(input)) return 'water';
    if (this.detectOverwhelm(input)) return 'earth';
    if (this.detectConfusion(input)) return 'air';
    if (this.detectIntegrationNeed(input, personalContext)) return 'aether';

    // Use elemental preferences from personal journey
    return this.selectBasedOnElementalJourney(personalContext.elementalPreferences);
  }

  /**
   * Create enhanced query for elemental agent with full context
   */
  private createEnhancedQuery(
    query: QueryInput,
    personalContext: any,
    collectiveWisdom: CollectiveWisdom | null,
    mirrorAnalysis: any
  ): EnhancedQueryInput {
    return {
      ...query,
      personalContext,
      collectiveWisdom: collectiveWisdom || this.createDefaultCollectiveWisdom(),
      mirrorAnalysis,
      ainGuidance: collectiveWisdom ? {
        recommendedApproach: collectiveWisdom.collectiveInsights[0] || 'Trust the process',
        universalPrinciples: collectiveWisdom.collectiveInsights,
        cosmicContext: `Phase: ${collectiveWisdom.cosmicTiming.phase}, Synchronicity: ${collectiveWisdom.cosmicTiming.synchronicityDensity}`
      } : {
        recommendedApproach: 'Trust the process',
        universalPrinciples: [],
        cosmicContext: 'Individual journey focus'
      }
    };
  }

  /**
   * Integrate elemental wisdom with personal context and sacred mirror
   */
  private async integrateElementalWisdom(
    elementalResponse: AIResponse,
    personalContext: any,
    mirrorAnalysis: any,
    elementUsed: ElementalType
  ): Promise<AIResponse> {
    let content = elementalResponse.content;

    // Add sacred mirror enhancement if needed
    if (mirrorAnalysis.needsResistance && mirrorAnalysis.mirrorIntensity > 0.5) {
      const resistancePrefix = this.getSacredResistancePrefix(mirrorAnalysis.reason);
      content = `${resistancePrefix}\n\n${content}`;
    }

    // Add relationship context
    if (this.sacredRelationship.conversationCount > 5) {
      const relationshipNote = this.getRelationshipNote(personalContext, elementUsed);
      if (relationshipNote) {
        content = `${content}\n\n${relationshipNote}`;
      }
    }

    // Add integration invitation
    const integrationInvitation = this.getIntegrationInvitation(elementUsed, personalContext);
    content = `${content}\n\n${integrationInvitation}`;

    return {
      ...elementalResponse,
      content,
      provider: 'personal-oracle-enhanced',
      metadata: {
        ...elementalResponse.metadata,
        personalOracleEnhanced: true,
        relationshipDepth: this.sacredRelationship.trustLevel,
        mirrorAnalysisApplied: mirrorAnalysis,
        elementUsed,
        contributesToCollective: true
      }
    };
  }

  /**
   * Update sacred relationship based on interaction
   */
  private updateSacredRelationship(query: QueryInput, response: AIResponse, elementUsed: ElementalType): void {
    // Increase trust level gradually
    this.sacredRelationship.trustLevel = Math.min(
      this.sacredRelationship.trustLevel + 0.02,
      1.0
    );

    // Track elemental journey
    this.sacredRelationship.elementalJourney[elementUsed] += 1;

    // Detect transformation milestones
    if (response.confidence && response.confidence > 0.9) {
      const milestone = `${elementUsed} breakthrough - ${new Date().toISOString()}`;
      this.sacredRelationship.transformationMilestones.push(milestone);
    }

    // Track depth reached
    if (query.input.toLowerCase().includes('shadow') ||
        query.input.toLowerCase().includes('fear') ||
        query.input.toLowerCase().includes('vulnerable')) {
      this.sacredRelationship.depthReached.push(`${elementUsed} depth work`);
    }
  }

  /**
   * Contribute pattern to AIN collective intelligence
   */
  private async contributePatternToAIN(
    query: QueryInput,
    response: AIResponse,
    elementUsed: ElementalType,
    personalContext: any
  ): Promise<void> {
    if (!this.ainConnection) return;

    try {
      const pattern: PatternContribution = {
        userId: this.userId,
        elementUsed,
        queryTheme: this.categorizeQuery(query.input),
        responseEffectiveness: response.confidence || 0.8,
        userReaction: this.predictUserReaction(response, personalContext),
        transformationIndicators: this.extractTransformationIndicators(response),
        collectiveRelevance: this.calculateCollectiveRelevance(query, response),
        personalContext: {
          archetypeStage: personalContext.archetypeJourney[0]?.archetype || 'explorer',
          relationshipDepth: this.sacredRelationship.trustLevel,
          transformationReadiness: this.calculateTransformationReadiness(personalContext)
        },
        timestamp: new Date().toISOString()
      };

      await this.ainConnection.contributePattern(pattern);

      // Report transformation events if significant
      if (response.confidence && response.confidence > 0.9) {
        const transformation: TransformationEvent = {
          userId: this.userId,
          eventType: this.categorizeTransformationEvent(response),
          element: elementUsed,
          description: response.content.substring(0, 200),
          significance: this.assessTransformationSignificance(response, personalContext),
          collectiveRelevance: pattern.collectiveRelevance,
          timestamp: new Date().toISOString()
        };

        await this.ainConnection.reportTransformation(transformation);
      }

    } catch (error) {
      logger.error('Error contributing pattern to AIN:', error);
    }
  }

  /**
   * Store enhanced memory with full context
   */
  private async storeEnhancedMemory(
    query: QueryInput,
    response: AIResponse,
    elementUsed: ElementalType,
    personalContext: any
  ): Promise<void> {
    try {
      // Store user query
      await storeMemoryItem({
        clientId: this.userId,
        content: query.input,
        element: elementUsed,
        sourceAgent: 'user',
        confidence: 0.7,
        metadata: {
          role: 'user',
          personalOracleProcessed: true,
          relationshipDepth: this.sacredRelationship.trustLevel,
          conversationCount: this.sacredRelationship.conversationCount
        }
      });

      // Store oracle response
      await storeMemoryItem({
        clientId: this.userId,
        content: response.content,
        element: elementUsed,
        sourceAgent: 'personal-oracle-enhanced',
        confidence: response.confidence,
        metadata: {
          role: 'oracle',
          elementUsed,
          personalOracleEnhanced: true,
          relationshipDepth: this.sacredRelationship.trustLevel,
          contributesToCollective: true,
          ...response.metadata
        }
      });

    } catch (error) {
      logger.error('Error storing enhanced memory:', error);
    }
  }

  // Helper methods for pattern detection and analysis
  private detectStagnation(input: string): boolean {
    const stagnationWords = ['stuck', 'same', 'boring', 'unmotivated', 'repetitive'];
    return stagnationWords.some(word => input.includes(word));
  }

  private detectEmotionalNeed(input: string): boolean {
    const emotionalWords = ['feel', 'emotion', 'heart', 'hurt', 'pain', 'sad', 'angry'];
    return emotionalWords.some(word => input.includes(word));
  }

  private detectOverwhelm(input: string): boolean {
    const overwhelmWords = ['overwhelm', 'too much', 'scattered', 'chaos', 'stressed'];
    return overwhelmWords.some(word => input.includes(word));
  }

  private detectConfusion(input: string): boolean {
    const confusionWords = ['confused', 'unclear', 'don\'t know', 'not sure', 'lost'];
    return confusionWords.some(word => input.includes(word));
  }

  private detectIntegrationNeed(input: string, context: any): boolean {
    const integrationWords = ['integrate', 'bring together', 'make sense', 'understand'];
    const hasMultipleElements = context.elementalPreferences &&
      Object.values(context.elementalPreferences).filter((v: any) => v > 0.3).length > 2;

    return integrationWords.some(word => input.includes(word)) || hasMultipleElements;
  }

  private detectValidationSeeking(input: string, memories: any[]): boolean {
    const validationWords = ['right thing', 'doing good', 'am i', 'should i'];
    const recentValidation = memories.some(m =>
      validationWords.some(word => m.content.toLowerCase().includes(word))
    );

    return validationWords.some(word => input.includes(word)) && recentValidation;
  }

  private detectRepetitivePattern(input: string, memories: any[]): boolean {
    const currentTheme = this.extractTheme(input);
    const recentThemes = memories.map(m => this.extractTheme(m.content));

    return recentThemes.filter(theme => theme === currentTheme).length >= 2;
  }

  private detectDepthAvoidance(input: string, context: any): boolean {
    const surfaceWords = ['fine', 'okay', 'just wondering', 'simple question'];
    const hasDepthHistory = context.sacredRelationship.depthReached.length > 0;

    return surfaceWords.some(word => input.includes(word)) && hasDepthHistory;
  }

  private detectShadowMaterial(input: string, context: any): boolean {
    const shadowWords = ['pattern', 'why do i', 'i always', 'i never', 'i can\'t seem to'];
    return shadowWords.some(phrase => input.includes(phrase));
  }

  // Additional helper methods would be implemented here...
  private calculateElementalPreferences(memories: any[]): Record<ElementalType, number> {
    const preferences: Record<ElementalType, number> = { fire: 0, water: 0, earth: 0, air: 0, aether: 0 };

    memories.forEach(memory => {
      if (memory.element && memory.element in preferences) {
        preferences[memory.element as ElementalType] += 1;
      }
    });

    // Normalize to percentages
    const total = Object.values(preferences).reduce((sum, val) => sum + val, 0) || 1;
    Object.keys(preferences).forEach(key => {
      preferences[key as ElementalType] = preferences[key as ElementalType] / total;
    });

    return preferences;
  }

  private selectBasedOnElementalJourney(preferences: Record<ElementalType, number>): ElementalType {
    // Find element with highest preference, or default to aether for integration
    const maxElement = Object.entries(preferences).reduce((a, b) =>
      preferences[a[0] as ElementalType] > preferences[b[0] as ElementalType] ? a : b
    )[0] as ElementalType;

    return maxElement || 'aether';
  }

  private createDefaultCollectiveWisdom(): CollectiveWisdom {
    return {
      universalGuidance: {
        cosmicTiming: {
          phase: 'initiation',
          synchronicityDensity: 0.5,
          evolutionaryPressure: 0.5,
          transformationWindow: false
        },
        fieldCoherence: 0.7
      },
      relevantPatterns: [],
      recommendedElement: null,
      collectiveInsights: ['Trust the process', 'Your journey is unique', 'Integration takes time'],
      cosmicTiming: {
        phase: 'initiation',
        synchronicityDensity: 0.5,
        evolutionaryPressure: 0.5,
        transformationWindow: false
      },
      emergentThemes: []
    };
  }

  // Placeholder implementations for remaining helper methods
  private getLastElementUsed(memories: any[]): ElementalType { return 'aether'; }
  private identifyEmergentPatterns(memories: any[]): string[] { return []; }
  private determineMirrorReason(input: string, context: any): string { return 'growth opportunity'; }
  private calculateMirrorIntensity(trustLevel: number, conversationCount: number): number { return Math.min(trustLevel * 0.8, 1.0); }
  private getSacredResistancePrefix(reason: string): string { return `I notice ${reason}. `; }
  private getRelationshipNote(context: any, element: ElementalType): string | null { return null; }
  private getIntegrationInvitation(element: ElementalType, context: any): string { return 'How does this land with you?'; }
  private categorizeQuery(input: string): string { return 'general_exploration'; }
  private predictUserReaction(response: AIResponse, context: any): 'resistant' | 'receptive' | 'breakthrough' | 'integrative' | 'unknown' { return 'unknown'; }
  private extractTransformationIndicators(response: AIResponse): string[] { return []; }
  private calculateCollectiveRelevance(query: QueryInput, response: AIResponse): number { return 0.5; }
  private calculateTransformationReadiness(context: any): number { return 0.5; }
  private categorizeTransformationEvent(response: AIResponse): 'breakthrough' | 'integration' | 'resistance_dissolution' | 'shadow_integration' | 'vision_actualization' { return 'integration'; }
  private assessTransformationSignificance(response: AIResponse, context: any): 'minor' | 'major' | 'profound' { return 'minor'; }
  private extractTheme(text: string): string { return 'general'; }
}