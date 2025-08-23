// 🎭 ORACLE ORCHESTRATION SERVICE
// Handles orchestration flow, delegates to business logic and repositories

import { IArchetypeAgentFactory, IArchetypeAgent } from "@/lib/shared/interfaces/IArchetypeAgent";
import { OracleBusinessLogic, UserOracleSettings } from "./OracleBusinessLogic";
import { logger } from "../../utils/logger";
import type { AIResponse } from "../../types/ai";
import { eventBus } from "../../core/events/EventBus";
import { QUERY_EVENTS, AGENT_EVENTS } from "../../core/events/EventTypes";

export interface IOracleRepository {
  getOracleSettings(userId: string): Promise<UserOracleSettings | null>;
  updateOracleSettings(userId: string, settings: Partial<UserOracleSettings>): Promise<void>;
  storeEvolutionSuggestion(userId: string, suggestion: any): Promise<void>;
  getInteractionStats(userId: string): Promise<{
    count: number;
    averageResponseTime: number;
    elementFrequency: Record<string, number>;
  }>;
}

export class OracleOrchestrationService {
  private businessLogic: OracleBusinessLogic;
  private repository: IOracleRepository;
  private agentFactory: IArchetypeAgentFactory;
  private settingsCache: Map<string, UserOracleSettings> = new Map();

  constructor(
    repository: IOracleRepository,
    agentFactory: IArchetypeAgentFactory
  ) {
    this.businessLogic = new OracleBusinessLogic();
    this.repository = repository;
    this.agentFactory = agentFactory;
  }

  /**
   * Process Oracle query - main orchestration flow
   */
  async processOracleQuery(
    userId: string,
    input: string,
    context: any = {}
  ): Promise<AIResponse> {
    try {
      // 1. Get Oracle settings
      const settings = await this.getOrCreateOracleSettings(userId);

      // 2. Create Oracle agent
      const oracle = await this.createOracleAgent(settings);

      // 3. Publish query event for event-driven processing
      const requestId = `oracle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await eventBus.publish({
        type: QUERY_EVENTS.QUERY_RECEIVED,
        source: 'OracleOrchestrationService',
        payload: {
          userId,
          input,
          context: {
            ...context,
            oracleSettings: settings,
            archetype: settings.archetype,
            phase: settings.phase
          },
          requestId
        },
        userId
      });

      // 4. Process through Oracle agent (for backward compatibility)
      const response = await oracle.processPersonalizedQuery(
        { input, userId },
        { userId, archetype: oracle.element, phase: oracle.phase }
      );

      // 5. Post-processing tasks (async, non-blocking)
      this.performPostProcessing(userId, input, response, settings);

      return response;
    } catch (error) {
      logger.error("Oracle query processing failed", { userId, error });
      throw error;
    }
  }

  /**
   * Get user's Oracle with all settings
   */
  async getUserOracle(userId: string): Promise<IArchetypeAgent> {
    const settings = await this.getOrCreateOracleSettings(userId);
    return await this.createOracleAgent(settings);
  }

  /**
   * Get Oracle profile with stats
   */
  async getOracleProfile(userId: string) {
    // Get settings
    const settings = await this.getOrCreateOracleSettings(userId);
    
    // Get agent
    const agent = await this.createOracleAgent(settings);
    
    // Get stats from repository
    const stats = await this.repository.getInteractionStats(userId);
    
    // Calculate full stats using business logic
    const fullStats = this.businessLogic.calculateOracleStats(
      settings,
      stats.count,
      stats.averageResponseTime,
      stats.elementFrequency
    );

    return {
      oracle: settings,
      agent,
      stats: fullStats
    };
  }

  /**
   * Suggest Oracle evolution
   */
  async suggestEvolution(
    userId: string,
    detectedPhase: string,
    detectedArchetype?: string
  ) {
    const settings = await this.getOrCreateOracleSettings(userId);
    
    // Only suggest if different from current
    if (settings.phase === detectedPhase && 
        (!detectedArchetype || settings.archetype === detectedArchetype)) {
      return null;
    }

    const suggestion = {
      currentPhase: settings.phase,
      suggestedPhase: detectedPhase,
      currentArchetype: settings.archetype,
      suggestedArchetype: detectedArchetype,
      timestamp: new Date()
    };

    // Store suggestion for user review
    await this.repository.storeEvolutionSuggestion(userId, suggestion);

    // Publish evolution opportunity event
    await eventBus.publish({
      type: AGENT_EVENTS.ARCHETYPAL_AGENT_ACTIVATED,
      source: 'OracleOrchestrationService',
      payload: {
        userId,
        agentType: 'oracle',
        agentId: settings.oracleAgentName,
        requestId: `evolution_${Date.now()}`,
        archetype: detectedArchetype,
        element: detectedArchetype
      },
      userId
    });

    return suggestion;
  }

  /**
   * Accept Oracle evolution
   */
  async acceptEvolution(
    userId: string,
    newPhase: string,
    newArchetype?: string
  ) {
    const settings = await this.getOrCreateOracleSettings(userId);
    
    // Create evolution history entry
    const evolutionEntry = this.businessLogic.createEvolutionEntry(
      settings.phase,
      newPhase,
      true // user initiated
    );

    // Update settings
    const updates: Partial<UserOracleSettings> = {
      phase: newPhase,
      evolutionHistory: [...settings.evolutionHistory, evolutionEntry]
    };

    if (newArchetype) {
      updates.archetype = newArchetype;
    }

    // Persist updates
    await this.repository.updateOracleSettings(userId, updates);
    
    // Clear cache
    this.clearUserCache(userId);

    logger.info("Oracle evolution accepted", {
      userId,
      fromPhase: settings.phase,
      toPhase: newPhase,
      archetype: newArchetype || settings.archetype
    });
  }

  /**
   * Update Oracle voice settings
   */
  async updateVoiceSettings(
    userId: string,
    voiceSettings: Partial<UserOracleSettings["voiceSettings"]>
  ) {
    const settings = await this.getOrCreateOracleSettings(userId);
    
    const updates = {
      voiceSettings: {
        ...settings.voiceSettings,
        ...voiceSettings
      }
    };

    await this.repository.updateOracleSettings(userId, updates);
    this.clearUserCache(userId);

    logger.info("Oracle voice settings updated", { userId, voiceSettings });
  }

  /**
   * Get Oracle health status
   */
  async getOracleHealth(userId: string) {
    const settings = await this.repository.getOracleSettings(userId);
    const isCached = this.settingsCache.has(userId);
    
    return this.businessLogic.calculateOracleHealth(
      settings,
      settings?.updatedAt || null,
      isCached
    );
  }

  // Private orchestration methods

  private async getOrCreateOracleSettings(userId: string): Promise<UserOracleSettings> {
    // Check cache
    if (this.settingsCache.has(userId)) {
      return this.settingsCache.get(userId)!;
    }

    // Get from repository
    let settings = await this.repository.getOracleSettings(userId);
    
    if (!settings) {
      // Create default Oracle for new user
      settings = await this.createDefaultOracle(userId);
    }

    // Cache settings
    this.settingsCache.set(userId, settings);
    
    return settings;
  }

  private async createDefaultOracle(userId: string): Promise<UserOracleSettings> {
    const defaultSettings: UserOracleSettings = {
      userId,
      oracleAgentName: "Aura",
      archetype: "seeker",
      voiceSettings: {
        voiceId: "oracle_default",
        stability: 0.7,
        style: 0.8,
        tone: "mystical",
        ceremonyPacing: true
      },
      phase: "exploration",
      createdAt: new Date(),
      updatedAt: new Date(),
      evolutionHistory: []
    };

    await this.repository.updateOracleSettings(userId, defaultSettings);
    return defaultSettings;
  }

  private async createOracleAgent(settings: UserOracleSettings): Promise<IArchetypeAgent> {
    return await this.agentFactory.createAgent("personal", {
      archetype: settings.archetype,
      oracleName: settings.oracleAgentName,
      voiceProfile: settings.voiceSettings,
      phase: settings.phase,
      userId: settings.userId,
      userContext: { settings }
    });
  }

  private async performPostProcessing(
    userId: string,
    input: string,
    response: AIResponse,
    settings: UserOracleSettings
  ) {
    // Update last interaction (fire and forget)
    this.repository.updateOracleSettings(userId, {
      updatedAt: new Date()
    }).catch(error => {
      logger.error("Failed to update last interaction", { userId, error });
    });

    // Check for evolution opportunities (fire and forget)
    const evolutionSuggestion = this.businessLogic.analyzeEvolutionOpportunity(
      input,
      response,
      settings.phase,
      settings.archetype
    );

    if (evolutionSuggestion) {
      this.suggestEvolution(
        userId,
        evolutionSuggestion.suggestedPhase,
        evolutionSuggestion.suggestedArchetype
      ).catch(error => {
        logger.error("Failed to process evolution suggestion", { userId, error });
      });
    }

    // Log interaction (fire and forget)
    logger.info("Oracle query processed", {
      userId,
      oracleName: settings.oracleAgentName,
      archetype: settings.archetype,
      phase: settings.phase,
      inputLength: input.length,
      responseLength: response.content.length
    });
  }

  private clearUserCache(userId: string) {
    this.settingsCache.delete(userId);
    // Also clear agent factory cache if it has one
    if (this.agentFactory.clearUserCache) {
      this.agentFactory.clearUserCache(userId);
    }
  }
}