// Hierarchy Orchestrator - Manages proper agent relationships
// Ensures PersonalOracleAgent -> Elemental Agents -> AIN Collective Intelligence flow

import { MainOracleAgent } from './mainOracleAgent';
import { PersonalOracleAgent } from './PersonalOracleAgent';
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
  UniversalGuidance,
  QueryInput,
  ElementalType 
} from './interfaces/MainOracleAgentInterface';
import { logger } from '../../utils/logger';

/**
 * HierarchyOrchestrator ensures proper agent relationships:
 * 
 * User → PersonalOracleAgent → ElementalAgent → PersonalOracleAgent → User
 *                ↓
 *     AIN (MainOracleAgent) Collective Intelligence
 * 
 * This maintains the sacred relationship through PersonalOracleAgent while
 * feeding all wisdom back into AIN's collective intelligence
 */
export class HierarchyOrchestrator {
  private ainCollectiveIntelligence: MainOracleAgent;
  private personalOracleAgents: Map<string, PersonalOracleAgent> = new Map();
  
  constructor() {
    // Initialize AIN as the collective intelligence backend
    this.ainCollectiveIntelligence = new MainOracleAgent();
    
    logger.info('HierarchyOrchestrator initialized with AIN collective intelligence');
  }

  /**
   * Get or create PersonalOracleAgent for a specific user
   * This ensures each user has their own sacred relationship guide
   */
  async getPersonalOracle(userId: string, config?: any): Promise<PersonalOracleAgent> {
    if (!this.personalOracleAgents.has(userId)) {
      const personalOracle = new PersonalOracleAgent({
        userId,
        oracleName: config?.oracleName || `Sacred Mirror for ${userId.substring(0, 8)}`,
        ...config
      });

      // Connect PersonalOracleAgent to AIN collective intelligence
      const ainInterface = this.createAINInterface(userId);
      personalOracle.setAINConnection(ainInterface);

      this.personalOracleAgents.set(userId, personalOracle);
      
      logger.info(`PersonalOracleAgent created for user ${userId} with AIN connection`);
    }

    return this.personalOracleAgents.get(userId)!;
  }

  /**
   * Create AIN interface for PersonalOracleAgent
   * This allows PersonalOracleAgent to contribute to and access collective intelligence
   */
  private createAINInterface(userId: string): MainOracleAgentInterface {
    return {
      contributePattern: async (pattern: PatternContribution): Promise<void> => {
        try {
          // Store pattern in AIN's collective intelligence
          await this.ainCollectiveIntelligence.receivePatternContribution(pattern);
          
          logger.info('Pattern contributed to AIN collective intelligence', {
            userId: pattern.userId,
            element: pattern.elementUsed,
            theme: pattern.queryTheme,
            effectiveness: pattern.responseEffectiveness
          });
        } catch (error) {
          logger.error('Error contributing pattern to AIN:', error);
        }
      },

      requestCollectiveWisdom: async (query: QueryInput): Promise<CollectiveWisdom> => {
        try {
          // Request collective wisdom from AIN
          const collectiveWisdom = await this.ainCollectiveIntelligence.provideCollectiveWisdom(query);
          
          logger.info('Collective wisdom requested from AIN', {
            userId: query.userId,
            patternsFound: collectiveWisdom.relevantPatterns.length,
            recommendedElement: collectiveWisdom.recommendedElement
          });

          return collectiveWisdom;
        } catch (error) {
          logger.error('Error requesting collective wisdom from AIN:', error);
          
          // Return minimal wisdom if AIN is unavailable
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
            collectiveInsights: [],
            cosmicTiming: {
              phase: 'initiation',
              synchronicityDensity: 0.5,
              evolutionaryPressure: 0.5,
              transformationWindow: false
            },
            emergentThemes: []
          };
        }
      },

      reportTransformation: async (transformation: TransformationEvent): Promise<void> => {
        try {
          await this.ainCollectiveIntelligence.receiveTransformationEvent(transformation);
          
          logger.info('Transformation reported to AIN', {
            userId: transformation.userId,
            type: transformation.eventType,
            significance: transformation.significance
          });
        } catch (error) {
          logger.error('Error reporting transformation to AIN:', error);
        }
      },

      consultUniversalField: async (query: QueryInput): Promise<UniversalGuidance> => {
        try {
          return await this.ainCollectiveIntelligence.consultUniversalField(query);
        } catch (error) {
          logger.error('Error consulting universal field:', error);
          
          // Return basic universal guidance if field access fails
          return {
            cosmicTiming: {
              phase: 'initiation',
              synchronicityDensity: 0.5,
              evolutionaryPressure: 0.5,
              transformationWindow: false
            },
            fieldCoherence: 0.7
          };
        }
      },

      checkCollectiveSalonAvailability: async (userId: string) => {
        try {
          return await this.ainCollectiveIntelligence.checkSalonAvailability(userId);
        } catch (error) {
          logger.error('Error checking salon availability:', error);
          return [];
        }
      },

      reportElementalEffectiveness: async (
        element: ElementalType, 
        effectiveness: number, 
        context: any
      ): Promise<void> => {
        try {
          await this.ainCollectiveIntelligence.trackElementalEffectiveness(element, effectiveness, context);
        } catch (error) {
          logger.error('Error reporting elemental effectiveness:', error);
        }
      }
    };
  }

  /**
   * Process query through proper hierarchy
   * User → PersonalOracleAgent → ElementalAgent → PersonalOracleAgent → User
   * With collective intelligence contribution to AIN
   */
  async processUserQuery(userId: string, query: string, context?: any) {
    try {
      // Get user's PersonalOracleAgent (creates if doesn't exist)
      const personalOracle = await this.getPersonalOracle(userId, context?.oracleConfig);

      // Process through PersonalOracleAgent (which will route to appropriate elemental agents)
      const response = await personalOracle.respondToPrompt(query);

      logger.info('Query processed through hierarchy', {
        userId,
        queryLength: query.length,
        responseLength: response.length
      });

      return response;
    } catch (error) {
      logger.error('Error processing query through hierarchy:', error);
      throw error;
    }
  }

  /**
   * Get collective intelligence insights
   * Direct access to AIN for administrative/analytical purposes
   */
  async getCollectiveInsights(timeframe?: string) {
    try {
      return await this.ainCollectiveIntelligence.generateCollectiveInsights(timeframe);
    } catch (error) {
      logger.error('Error getting collective insights:', error);
      return null;
    }
  }

  /**
   * Get agent ecosystem health
   * Monitor the health and effectiveness of the agent hierarchy
   */
  async getEcosystemHealth() {
    try {
      const personalOracleCount = this.personalOracleAgents.size;
      const ainHealth = await this.ainCollectiveIntelligence.getSystemHealth();
      
      const ecosystemHealth = {
        personalOraclesActive: personalOracleCount,
        ainCollectiveIntelligence: ainHealth,
        hierarchyIntegrity: this.validateHierarchyIntegrity(),
        lastUpdated: new Date().toISOString()
      };

      logger.info('Ecosystem health check completed', ecosystemHealth);
      return ecosystemHealth;
    } catch (error) {
      logger.error('Error checking ecosystem health:', error);
      return null;
    }
  }

  /**
   * Validate that hierarchy relationships are properly maintained
   */
  private validateHierarchyIntegrity(): boolean {
    try {
      // Check that all PersonalOracleAgents have AIN connections
      for (const [userId, personalOracle] of this.personalOracleAgents) {
        if (!personalOracle.hasAINConnection()) {
          logger.warn(`PersonalOracleAgent for user ${userId} missing AIN connection`);
          return false;
        }
      }

      // Check that AIN is properly receiving patterns
      if (!this.ainCollectiveIntelligence.isReceivingPatterns()) {
        logger.warn('AIN not properly receiving pattern contributions');
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error validating hierarchy integrity:', error);
      return false;
    }
  }

  /**
   * Shutdown orchestrator gracefully
   */
  async shutdown() {
    try {
      // Save any pending patterns to AIN
      await this.ainCollectiveIntelligence.finalizePatterns();
      
      // Clear PersonalOracleAgent connections
      this.personalOracleAgents.clear();
      
      logger.info('HierarchyOrchestrator shutdown completed');
    } catch (error) {
      logger.error('Error during orchestrator shutdown:', error);
    }
  }
}

// Export singleton instance
export const hierarchyOrchestrator = new HierarchyOrchestrator();