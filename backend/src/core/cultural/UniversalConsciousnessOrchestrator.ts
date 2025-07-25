/**
 * Universal Consciousness Orchestrator
 * 
 * Integrates the Universal Consciousness Platform with existing Oracle agents,
 * providing seamless cultural enhancement while maintaining all existing functionality.
 * 
 * This orchestrator acts as a middleware layer that:
 * - Preserves existing agent behavior
 * - Adds cultural consciousness capabilities
 * - Ensures indigenous sovereignty compliance
 * - Provides culturally-adapted responses
 */

import { logger } from '../../utils/logger';
import { 
  universalConsciousnessIntegration,
  UniversalConsciousnessQuery,
  UniversalConsciousnessResponse
} from './UniversalConsciousnessIntegration';

// Types for existing system integration
export interface OracleQueryEnhancementRequest {
  originalQuery: string;
  originalResponse: string;
  userId: string;
  element: string;
  shadowType?: string;
  userProfile?: any;
  previousInteractions?: any[];
  agentMetadata?: any;
}

export interface EnhancedOracleResponse {
  originalResponse: string;
  culturallyEnhancedResponse: string;
  culturalEnhancements: CulturalEnhancementSummary;
  preservedOriginalContext: boolean;
  universalConsciousnessActive: boolean;
}

export interface CulturalEnhancementSummary {
  culturalContextDetected: string;
  indigenousProtocolsApplied: boolean;
  archetypalCulturalMapping: boolean;
  shadowWorkCulturalAdaptation: boolean;
  crossCulturalWisdomSynthesis: boolean;
  respectfulAttributions: string[];
  culturalRecommendations: number;
}

/**
 * Universal Consciousness Orchestrator
 * Bridges existing Oracle system with Universal Consciousness Platform
 */
export class UniversalConsciousnessOrchestrator {
  private enhancementEnabled: boolean = true;
  private preserveOriginalBehavior: boolean = true;
  private culturalEnhancementMetrics: Map<string, number> = new Map();

  constructor() {
    this.initializeOrchestrator();
  }

  /**
   * Main enhancement method - integrates Universal Consciousness with Oracle responses
   */
  async enhanceOracleResponse(
    request: OracleQueryEnhancementRequest
  ): Promise<EnhancedOracleResponse> {
    
    try {
      // Always preserve original functionality first
      if (!this.enhancementEnabled) {
        return this.createPreservedResponse(request);
      }

      logger.info('Enhancing Oracle response with Universal Consciousness', {
        userId: request.userId,
        element: request.element,
        hasUserProfile: !!request.userProfile
      });

      // Create Universal Consciousness query from Oracle request
      const ucQuery: UniversalConsciousnessQuery = {
        userInput: request.originalQuery,
        userId: request.userId,
        element: request.element,
        originalResponse: request.originalResponse,
        userProfile: request.userProfile,
        previousInteractions: request.previousInteractions,
        culturalPreferences: this.extractCulturalPreferences(request.userProfile)
      };

      // Process through Universal Consciousness system
      const ucResponse = await universalConsciousnessIntegration.processUniversalConsciousnessQuery(ucQuery);

      // Create enhanced response that preserves original while adding cultural wisdom
      const enhancedResponse = await this.createEnhancedResponse(request, ucResponse);

      // Track enhancement metrics
      this.updateEnhancementMetrics(request.userId, ucResponse);

      logger.info('Oracle response enhanced successfully', {
        userId: request.userId,
        originalLength: request.originalResponse.length,
        enhancedLength: enhancedResponse.culturallyEnhancedResponse.length,
        culturalContext: ucResponse.culturalWisdom.primaryCulturalContext
      });

      return enhancedResponse;

    } catch (error) {
      logger.error('Error enhancing Oracle response:', error);
      
      // Always fall back to preserving original functionality
      return this.createPreservedResponse(request);
    }
  }

  /**
   * Enhance Shadow Agent responses with cultural context
   */
  async enhanceShadowResponse(
    originalShadowResponse: string,
    userInput: string,
    shadowType: string,
    userId: string,
    userProfile?: any
  ): Promise<{enhancedResponse: string; culturalGuidance: string}> {
    
    try {
      const ucQuery: UniversalConsciousnessQuery = {
        userInput,
        userId,
        element: 'shadow', // Special element for shadow work
        originalResponse: originalShadowResponse,
        userProfile,
        culturalPreferences: this.extractCulturalPreferences(userProfile)
      };

      const ucResponse = await universalConsciousnessIntegration.processUniversalConsciousnessQuery(ucQuery);

      // Extract shadow-specific cultural enhancements
      const culturalGuidance = ucResponse.shadowIntegration.ancestralWisdomIntegration;
      
      let enhancedResponse = originalShadowResponse;
      
      // Add cultural shadow work guidance if available
      if (culturalGuidance) {
        enhancedResponse += `\n\n🌍 **Cultural Shadow Wisdom**: ${culturalGuidance}`;
      }

      // Add community recommendations if appropriate
      if (ucResponse.shadowIntegration.communityRecommendations.length > 0) {
        enhancedResponse += `\n\n**Community Healing Support**: ${ucResponse.shadowIntegration.communityRecommendations.slice(0, 2).join(', ')}`;
      }

      return {
        enhancedResponse,
        culturalGuidance: culturalGuidance || 'Universal shadow work approach maintained'
      };

    } catch (error) {
      logger.error('Error enhancing shadow response:', error);
      return {
        enhancedResponse: originalShadowResponse,
        culturalGuidance: 'Cultural enhancement temporarily unavailable'
      };
    }
  }

  /**
   * Enhance Elemental Agent responses (Fire, Water, Earth, Air)
   */
  async enhanceElementalResponse(
    originalResponse: string,
    element: string,
    userInput: string,
    userId: string,
    userProfile?: any
  ): Promise<{enhancedResponse: string; culturalArchetype: string}> {
    
    try {
      const ucQuery: UniversalConsciousnessQuery = {
        userInput,
        userId,
        element,
        originalResponse,
        userProfile,
        culturalPreferences: this.extractCulturalPreferences(userProfile)
      };

      const ucResponse = await universalConsciousnessIntegration.processUniversalConsciousnessQuery(ucQuery);

      let enhancedResponse = originalResponse;
      let culturalArchetype = element;

      // Add cultural archetype adaptation if available
      if (ucResponse.archetypalAdaptation.recommendedExpression) {
        const culturalExpression = ucResponse.archetypalAdaptation.recommendedExpression;
        culturalArchetype = culturalExpression.culturalName;
        
        enhancedResponse += `\n\n🌍 **Cultural Expression**: In your tradition, this ${element} energy is known as ${culturalExpression.culturalName} - ${culturalExpression.traditionalRole}. ${culturalExpression.modernIntegration}`;
      }

      // Add cross-cultural wisdom if appropriate
      if (ucResponse.culturalWisdom.universalWisdomThreads.length > 0) {
        enhancedResponse += `\n\n**Universal Wisdom**: This energy is recognized across cultures through: ${ucResponse.culturalWisdom.universalWisdomThreads.slice(0, 2).join(', ')}.`;
      }

      return {
        enhancedResponse,
        culturalArchetype
      };

    } catch (error) {
      logger.error('Error enhancing elemental response:', error);
      return {
        enhancedResponse: originalResponse,
        culturalArchetype: element
      };
    }
  }

  /**
   * Check if enhancement should be applied based on user preferences
   */
  async shouldEnhanceForUser(userId: string, userProfile?: any): Promise<boolean> {
    // Check user preferences for cultural enhancement
    if (userProfile?.preferences?.culturalEnhancement === false) {
      return false;
    }

    // Check if user has cultural context that would benefit from enhancement
    if (userProfile?.culturalBackground || userProfile?.culturalIdentities?.length > 0) {
      return true;
    }

    // Default to enhancement enabled
    return this.enhancementEnabled;
  }

  /**
   * Get cultural enhancement metrics for a user
   */
  async getUserCulturalMetrics(userId: string): Promise<{
    enhancementsApplied: number;
    culturalContextsDetected: string[];
    indigenousProtocolsUsed: number;
    crossCulturalInsightsShared: number;
  }> {
    
    return {
      enhancementsApplied: this.culturalEnhancementMetrics.get(`${userId}_total`) || 0,
      culturalContextsDetected: [], // Would be tracked in practice
      indigenousProtocolsUsed: this.culturalEnhancementMetrics.get(`${userId}_indigenous`) || 0,
      crossCulturalInsightsShared: this.culturalEnhancementMetrics.get(`${userId}_crosscultural`) || 0
    };
  }

  /**
   * Create enhanced response preserving original while adding cultural wisdom
   */
  private async createEnhancedResponse(
    request: OracleQueryEnhancementRequest,
    ucResponse: UniversalConsciousnessResponse
  ): Promise<EnhancedOracleResponse> {
    
    // Start with original response to preserve existing functionality
    let enhancedResponse = request.originalResponse;

    // Add respectful framing first
    if (ucResponse.respectfulFraming) {
      enhancedResponse = ucResponse.respectfulFraming + '\n\n' + enhancedResponse;
    }

    // Add the cultural enhancements from Universal Consciousness
    if (ucResponse.enhancedResponse !== request.originalResponse) {
      // Extract only the additional content
      const additionalContent = ucResponse.enhancedResponse.replace(request.originalResponse, '').trim();
      if (additionalContent) {
        enhancedResponse += '\n\n' + additionalContent;
      }
    }

    // Add cultural recommendations if valuable
    if (ucResponse.recommendations.immediateActions.length > 0) {
      enhancedResponse += `\n\n🎯 **Cultural Integration Suggestions**: ${ucResponse.recommendations.immediateActions.slice(0, 2).join('; ')}.`;
    }

    // Create enhancement summary
    const culturalEnhancements: CulturalEnhancementSummary = {
      culturalContextDetected: ucResponse.culturalWisdom.primaryCulturalContext,
      indigenousProtocolsApplied: ucResponse.indigenousCompliance.protocolsRespected,
      archetypalCulturalMapping: !!ucResponse.archetypalAdaptation.recommendedExpression,
      shadowWorkCulturalAdaptation: ucResponse.shadowIntegration.culturalTraumaAssessed,
      crossCulturalWisdomSynthesis: ucResponse.culturalWisdom.crossCulturalInsights.size > 0,
      respectfulAttributions: ucResponse.culturalWisdom.respectfulAttributions,
      culturalRecommendations: ucResponse.recommendations.immediateActions.length
    };

    return {
      originalResponse: request.originalResponse,
      culturallyEnhancedResponse: enhancedResponse,
      culturalEnhancements,
      preservedOriginalContext: true,
      universalConsciousnessActive: true
    };
  }

  /**
   * Create preserved response when enhancement is disabled or fails
   */
  private createPreservedResponse(request: OracleQueryEnhancementRequest): EnhancedOracleResponse {
    return {
      originalResponse: request.originalResponse,
      culturallyEnhancedResponse: request.originalResponse,
      culturalEnhancements: {
        culturalContextDetected: 'universal',
        indigenousProtocolsApplied: false,
        archetypalCulturalMapping: false,
        shadowWorkCulturalAdaptation: false,
        crossCulturalWisdomSynthesis: false,
        respectfulAttributions: [],
        culturalRecommendations: 0
      },
      preservedOriginalContext: true,
      universalConsciousnessActive: false
    };
  }

  /**
   * Extract cultural preferences from user profile
   */
  private extractCulturalPreferences(userProfile?: any): string[] {
    if (!userProfile) return [];
    
    const preferences = [];
    
    if (userProfile.culturalBackground) {
      preferences.push(userProfile.culturalBackground);
    }
    
    if (userProfile.culturalIdentities) {
      preferences.push(...userProfile.culturalIdentities);
    }
    
    if (userProfile.preferredWisdomTraditions) {
      preferences.push(...userProfile.preferredWisdomTraditions);
    }
    
    return preferences;
  }

  /**
   * Update enhancement metrics for tracking
   */
  private updateEnhancementMetrics(userId: string, ucResponse: UniversalConsciousnessResponse): void {
    // Track total enhancements
    const totalKey = `${userId}_total`;
    const currentTotal = this.culturalEnhancementMetrics.get(totalKey) || 0;
    this.culturalEnhancementMetrics.set(totalKey, currentTotal + 1);

    // Track indigenous protocol usage
    if (ucResponse.indigenousCompliance.protocolsRespected) {
      const indigenousKey = `${userId}_indigenous`;
      const currentIndigenous = this.culturalEnhancementMetrics.get(indigenousKey) || 0;
      this.culturalEnhancementMetrics.set(indigenousKey, currentIndigenous + 1);
    }

    // Track cross-cultural insights
    if (ucResponse.culturalWisdom.crossCulturalInsights.size > 0) {
      const crossCulturalKey = `${userId}_crosscultural`;
      const currentCrossCultural = this.culturalEnhancementMetrics.get(crossCulturalKey) || 0;
      this.culturalEnhancementMetrics.set(crossCulturalKey, currentCrossCultural + 1);
    }
  }

  /**
   * Initialize orchestrator
   */
  private initializeOrchestrator(): void {
    logger.info('Universal Consciousness Orchestrator initialized', {
      enhancementEnabled: this.enhancementEnabled,
      preserveOriginalBehavior: this.preserveOriginalBehavior
    });
  }

  /**
   * Configuration methods
   */
  setEnhancementEnabled(enabled: boolean): void {
    this.enhancementEnabled = enabled;
    logger.info('Universal Consciousness enhancement toggled', { enabled });
  }

  isEnhancementEnabled(): boolean {
    return this.enhancementEnabled;
  }

  /**
   * Get system status
   */
  getOrchestratorStatus(): {
    enhancementEnabled: boolean;
    preserveOriginalBehavior: boolean;
    totalEnhancements: number;
    universalConsciousnessStatus: any;
  } {
    const totalEnhancements = Array.from(this.culturalEnhancementMetrics.values())
      .reduce((sum, count) => sum + count, 0);

    return {
      enhancementEnabled: this.enhancementEnabled,
      preserveOriginalBehavior: this.preserveOriginalBehavior,
      totalEnhancements,
      universalConsciousnessStatus: universalConsciousnessIntegration.getSystemStatus()
    };
  }
}

export const universalConsciousnessOrchestrator = new UniversalConsciousnessOrchestrator();