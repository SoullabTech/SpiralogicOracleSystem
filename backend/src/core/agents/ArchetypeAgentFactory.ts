/**
 * 🏭 Archetype Agent Factory - Personal Oracle Agent Creation
 *
 * Creates and manages persistent Personal Oracle Agents for each user,
 * providing intelligent caching and evolution capabilities.
 */

import { ArchetypeAgent, UserPersonalization, OracleIdentity } from './ArchetypeAgent';
import { logger } from '../../utils/logger';
import type { AIResponse } from '../../types/ai';

// Import concrete archetype implementations
import { FireAgent } from './fireAgent';
import { WaterAgent } from './waterAgent';
import { EarthAgent } from './earthAgent';
import { AirAgent } from './airAgent';
import { AetherAgent } from './aetherAgent';

export interface OracleCreationInput {
  archetype: string;
  oracleName: string;
  voiceProfile: OracleIdentity['voiceProfile'];
  phase: string;
  userId: string;
  userContext: any;
}

export class ArchetypeAgentFactory {
  private static personalOracles: Map<string, ArchetypeAgent> = new Map();
  private static initializationPromises: Map<string, Promise<ArchetypeAgent>> = new Map();

  /**
   * 🎭 Create Personal Oracle Agent (Primary Method)
   */
  static async createPersonalOracle(input: OracleCreationInput): Promise<ArchetypeAgent> {
    const { archetype, oracleName, voiceProfile, phase, userId, userContext } = input;
    const oracleKey = `${userId}_${archetype}_${oracleName}`;

    // Return cached Oracle if available
    if (this.personalOracles.has(oracleKey)) {
      const oracle = this.personalOracles.get(oracleKey)!;

      // Update last interaction
      oracle.lastInteraction = new Date();

      return oracle;
    }

    // Return initialization promise if already in progress
    if (this.initializationPromises.has(oracleKey)) {
      return await this.initializationPromises.get(oracleKey)!;
    }

    // Create new Personal Oracle
    const initPromise = this.createPersonalOracleAgent(archetype, oracleName, voiceProfile, phase);
    this.initializationPromises.set(oracleKey, initPromise);

    try {
      const oracle = await initPromise;
      this.personalOracles.set(oracleKey, oracle);
      this.initializationPromises.delete(oracleKey);

      logger.info('Personal Oracle Created:', {
        userId,
        archetype,
        oracleName,
        voiceId: voiceProfile.voiceId,
        phase,
        oracleKey
      });

      return oracle;
    } catch (error) {
      this.initializationPromises.delete(oracleKey);
      throw error;
    }
  }

  /**
   * 🎭 Get User's Personal Oracle (By User ID)
   */
  static async getUserPersonalOracle(userId: string): Promise<ArchetypeAgent | null> {
    // Find Oracle by user ID
    for (const [key, oracle] of this.personalOracles.entries()) {
      if (key.startsWith(userId)) {
        oracle.lastInteraction = new Date();
        return oracle;
      }
    }
    return null;
  }

  /**
   * 🎭 Get Generic Agent Instance (Fallback for non-personal use)
   */
  static async getAgent(archetype: string): Promise<ArchetypeAgent> {
    const normalizedArchetype = archetype.toLowerCase();
    const genericKey = `generic_${normalizedArchetype}`;

    // Return cached agent if available
    if (this.personalOracles.has(genericKey)) {
      return this.personalOracles.get(genericKey)!;
    }

    // Create generic agent
    const agent = await this.createPersonalOracleAgent(normalizedArchetype);
    this.personalOracles.set(genericKey, agent);

    logger.info('Generic Agent Created:', {
      archetype: normalizedArchetype,
      element: agent.element,
      energySignature: agent.energySignature
    });

    return agent;
  }

  /**
   * 🔧 Create Personal Oracle Agent Implementation
   */
  private static async createPersonalOracleAgent(
    archetype: string,
    oracleName: string = 'Oracle',
    voiceProfile?: OracleIdentity['voiceProfile'],
    phase: string = 'initiation'
  ): Promise<ArchetypeAgent> {
    const normalizedArchetype = archetype.toLowerCase();

    let oracle: ArchetypeAgent;

    switch (normalizedArchetype) {
      case 'fire':
        oracle = new FireAgent(oracleName, voiceProfile, phase);
        break;
      case 'water':
        oracle = new WaterAgent(oracleName, voiceProfile, phase);
        break;
      case 'earth':
        oracle = new EarthAgent(oracleName, voiceProfile, phase);
        break;
      case 'air':
        oracle = new AirAgent(oracleName, voiceProfile, phase);
        break;
      case 'aether':
        oracle = new AetherAgent(oracleName, voiceProfile, phase);
        break;
      default:
        logger.warn('Unknown archetype requested, defaulting to Aether:', { archetype });
        oracle = new AetherAgent(oracleName, voiceProfile, phase);
    }

    return oracle;
  }

  /**
   * 🌟 Batch Agent Creation for Performance
   */
  static async preloadAllAgents(): Promise<void> {
    const archetypes = this.getAllArchetypes();

    const preloadPromises = archetypes.map(async (archetype) => {
      try {
        await this.getAgent(archetype);
      } catch (error) {
        logger.error(`Failed to preload ${archetype} agent:`, error);
      }
    });

    await Promise.all(preloadPromises);

    logger.info('All archetype agents preloaded:', {
      totalAgents: this.agents.size,
      archetypes: Array.from(this.agents.keys())
    });
  }

  /**
   * 🎯 Intelligent Agent Selection
   */
  static async selectOptimalAgent(
    userInput: string,
    userProfile: any,
    context: any
  ): Promise<ArchetypeAgent> {
    const scores = await this.calculateArchetypeScores(userInput, userProfile, context);

    // Get highest scoring archetype
    const selectedArchetype = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)[0][0];

    logger.info('Optimal Agent Selection:', {
      userId: userProfile.userId,
      selectedArchetype,
      scores,
      inputLength: userInput.length
    });

    return await this.getAgent(selectedArchetype);
  }

  /**
   * 🧠 Archetype Scoring Algorithm
   */
  private static async calculateArchetypeScores(
    userInput: string,
    userProfile: any,
    context: any
  ): Promise<Record<string, number>> {
    const scores = {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0,
      aether: 0
    };

    // Factor 1: Content Analysis (40% weight)
    const contentScores = this.analyzeInputContent(userInput);
    Object.keys(scores).forEach(archetype => {
      scores[archetype] += contentScores[archetype] * 0.4;
    });

    // Factor 2: User Preferences (30% weight)
    if (userProfile.soulprint?.archetypeResonance) {
      Object.keys(scores).forEach(archetype => {
        scores[archetype] += (userProfile.soulprint.archetypeResonance[archetype] || 0) * 0.3;
      });
    }

    // Factor 3: Current Phase Alignment (20% weight)
    const phaseBonus = this.getPhaseArchetypeBonus(userProfile.currentPhase);
    Object.keys(scores).forEach(archetype => {
      scores[archetype] += (phaseBonus[archetype] || 0) * 0.2;
    });

    // Factor 4: Contextual Factors (10% weight)
    const contextBonus = this.getContextualBonus(context);
    Object.keys(scores).forEach(archetype => {
      scores[archetype] += (contextBonus[archetype] || 0) * 0.1;
    });

    return scores;
  }

  /**
   * 📝 Content Analysis for Archetype Matching
   */
  private static analyzeInputContent(input: string): Record<string, number> {
    const keywords = {
      fire: ['passion', 'create', 'ignite', 'transform', 'vision', 'breakthrough', 'stuck', 'energy', 'motivation', 'courage'],
      water: ['feel', 'emotion', 'heart', 'intuition', 'flow', 'heal', 'love', 'compassion', 'sadness', 'tears'],
      earth: ['ground', 'stable', 'practical', 'manifest', 'build', 'foundation', 'body', 'nature', 'security', 'home'],
      air: ['think', 'understand', 'clarity', 'communicate', 'idea', 'perspective', 'insight', 'mental', 'learn', 'explain'],
      aether: ['spiritual', 'divine', 'sacred', 'unity', 'transcend', 'consciousness', 'purpose', 'meaning', 'soul', 'connection']
    };

    const scores = { fire: 0, water: 0, earth: 0, air: 0, aether: 0 };
    const lowerInput = input.toLowerCase();

    // Count keyword matches
    Object.entries(keywords).forEach(([archetype, words]) => {
      words.forEach(word => {
        if (lowerInput.includes(word)) {
          scores[archetype] += 1;
        }
      });
    });

    // Normalize scores
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore > 0) {
      Object.keys(scores).forEach(archetype => {
        scores[archetype] = scores[archetype] / maxScore;
      });
    }

    return scores;
  }

  /**
   * 🌙 Phase-Based Archetype Bonus
   */
  private static getPhaseArchetypeBonus(phase: string): Record<string, number> {
    const phaseAlignments = {
      initiation: { fire: 0.3, water: 0.1, earth: 0.0, air: 0.2, aether: 0.0 },
      exploration: { fire: 0.2, water: 0.2, earth: 0.1, air: 0.3, aether: 0.1 },
      integration: { fire: 0.1, water: 0.3, earth: 0.3, air: 0.2, aether: 0.2 },
      transcendence: { fire: 0.1, water: 0.2, earth: 0.1, air: 0.3, aether: 0.3 },
      unity: { fire: 0.2, water: 0.3, earth: 0.2, air: 0.2, aether: 0.4 }
    };

    return phaseAlignments[phase] || { fire: 0.2, water: 0.2, earth: 0.2, air: 0.2, aether: 0.2 };
  }

  /**
   * 🌍 Contextual Archetype Bonus
   */
  private static getContextualBonus(context: any): Record<string, number> {
    const bonus = { fire: 0, water: 0, earth: 0, air: 0, aether: 0 };

    // Time-based bonuses
    const hour = new Date().getHours();
    if (hour >= 6 && hour <= 10) bonus.fire += 0.1; // Morning fire energy
    if (hour >= 18 && hour <= 22) bonus.water += 0.1; // Evening water energy
    if (hour >= 16 && hour <= 19) bonus.earth += 0.1; // Afternoon earth energy
    if (hour >= 10 && hour <= 14) bonus.air += 0.1; // Midday air energy
    if (hour >= 22 || hour <= 6) bonus.aether += 0.1; // Night aether energy

    // Emotional state bonuses
    if (context.emotionalState === 'vulnerable') {
      bonus.water += 0.2;
      bonus.earth += 0.1;
    } else if (context.emotionalState === 'energetic') {
      bonus.fire += 0.2;
      bonus.air += 0.1;
    }

    // Ritual context bonuses
    if (context.ritualContext === 'ceremonial') {
      bonus.aether += 0.2;
      bonus.earth += 0.1;
    }

    return bonus;
  }

  /**
   * 📊 Factory Management Methods
   */
  static getAllArchetypes(): string[] {
    return ['fire', 'water', 'earth', 'air', 'aether'];
  }

  static getLoadedAgents(): string[] {
    return Array.from(this.agents.keys());
  }

  static getFactoryStatus(): any {
    return {
      totalAgents: this.agents.size,
      loadedAgents: this.getLoadedAgents(),
      pendingInitializations: this.initializationPromises.size,
      availableArchetypes: this.getAllArchetypes()
    };
  }

  static clearCache(): void {
    this.agents.clear();
    this.initializationPromises.clear();
    logger.info('Archetype Agent Factory cache cleared');
  }

  /**
   * 🎯 Personal Oracle Query Processing (Primary Entry Point)
   */
  static async processPersonalOracleQuery(
    userId: string,
    input: string,
    userProfile?: UserPersonalization,
    context: any = {}
  ): Promise<AIResponse> {
    // Get user's personal Oracle
    const oracle = await this.getUserPersonalOracle(userId);

    if (!oracle) {
      throw new Error(`No Personal Oracle found for user ${userId}. User may need onboarding.`);
    }

    // Process query with personalization
    const response = await oracle.processPersonalizedQuery(
      { input, userId },
      userProfile || { userId }
    );

    logger.info('Personal Oracle Query Processed:', {
      userId,
      oracleName: oracle.oracleName,
      archetype: oracle.element,
      phase: oracle.phase,
      inputLength: input.length
    });

    return response;
  }

  /**
   * 🎭 Direct Oracle Query with Specific Archetype
   */
  static async processDirectOracleQuery(
    userId: string,
    archetype: string,
    input: string,
    userProfile?: UserPersonalization,
    context: any = {}
  ): Promise<AIResponse> {
    const agent = await this.getAgent(archetype);

    const response = await agent.processPersonalizedQuery(
      { input, userId },
      userProfile || { userId }
    );

    logger.info('Direct Oracle Query Processed:', {
      userId,
      requestedArchetype: archetype,
      actualArchetype: agent.element,
      inputLength: input.length
    });

    return response;
  }

  /**
   * 🌟 Oracle Evolution Management
   */
  static async suggestOracleEvolution(userId: string, detectedPhase: string): Promise<any> {
    const oracle = await this.getUserPersonalOracle(userId);

    if (!oracle) {
      return null;
    }

    // Only suggest if phase is different
    if (oracle.phase !== detectedPhase) {
      const suggestion = oracle.suggestEvolution(detectedPhase);

      logger.info('Oracle Evolution Suggested:', {
        userId,
        oracleName: oracle.oracleName,
        currentPhase: oracle.phase,
        suggestedPhase: detectedPhase
      });

      return suggestion;
    }

    return null;
  }

  /**
   * 🔄 Accept Oracle Evolution
   */
  static async evolveOracle(
    userId: string,
    newPhase: string,
    newArchetype?: string,
    userInitiated: boolean = true
  ): Promise<void> {
    const oracle = await this.getUserPersonalOracle(userId);

    if (!oracle) {
      throw new Error(`No Personal Oracle found for user ${userId}`);
    }

    oracle.evolveToPhase(newPhase, newArchetype, userInitiated);

    logger.info('Oracle Evolution Completed:', {
      userId,
      oracleName: oracle.oracleName,
      newPhase,
      newArchetype,
      userInitiated
    });
  }

  /**
   * 🎨 Oracle Settings Management
   */
  static async updateOracleVoiceProfile(
    userId: string,
    newVoiceProfile: Partial<OracleIdentity['voiceProfile']>
  ): Promise<void> {
    const oracle = await this.getUserPersonalOracle(userId);

    if (!oracle) {
      throw new Error(`No Personal Oracle found for user ${userId}`);
    }

    oracle.updateVoiceProfile(newVoiceProfile);

    logger.info('Oracle Voice Profile Updated:', {
      userId,
      oracleName: oracle.oracleName,
      newVoiceProfile
    });
  }

  static async renameOracle(userId: string, newName: string): Promise<void> {
    const oracle = await this.getUserPersonalOracle(userId);

    if (!oracle) {
      throw new Error(`No Personal Oracle found for user ${userId}`);
    }

    const oldName = oracle.oracleName;
    oracle.updateOracleName(newName);

    logger.info('Oracle Renamed:', {
      userId,
      oldName,
      newName
    });
  }

  /**
   * 🔄 Cache Management
   */
  static clearUserCache(userId: string): void {
    const keysToRemove = [];

    for (const [key] of this.personalOracles.entries()) {
      if (key.startsWith(userId)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => this.personalOracles.delete(key));

    logger.info('User Oracle cache cleared:', { userId, removedKeys: keysToRemove.length });
  }

  static recycleAgent(archetype: string): void {
    const normalizedArchetype = archetype.toLowerCase();
    const genericKey = `generic_${normalizedArchetype}`;

    if (this.personalOracles.has(genericKey)) {
      this.personalOracles.delete(genericKey);
      logger.info('Generic agent recycled:', { archetype: normalizedArchetype });
    }
  }

  /**
   * 🌟 Health Check for All Agents
   */
  static async healthCheck(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};

    for (const archetype of this.getAllArchetypes()) {
      try {
        const agent = await this.getAgent(archetype);
        health[archetype] = !!agent;
      } catch (error) {
        health[archetype] = false;
        logger.error(`Health check failed for ${archetype}:`, error);
      }
    }

    return health;
  }
}