/**
 * 🌟 Oracle Response Pipeline - Optimized for Real-Time Spiritual Intelligence
 * 
 * This pipeline orchestrates the flow from user input to spoken oracle voice
 * with minimal latency through parallel processing and intelligent caching.
 */

import { EventEmitter } from 'events';
import { logger } from '../../utils/logger';
import { PersonalizationEngine } from './PersonalizationEngine';
import { SymbolicIntegrationEngine } from './SymbolicIntegrationEngine';
import { OracleFailsafeManager } from './OracleFailsafeManager';
import { StreamingOracleService } from './StreamingOracleService';
import { SoulprintEngine } from './SoulprintEngine';
import { RitualTimingSystem } from './RitualTimingSystem';
import { ArchetypeAgent, ArchetypeAgentFactory } from '../agents/ArchetypeAgent';
import { ARCHETYPE_VOICES } from '../../config/archetypalVoices';

export interface OracleQuery {
  input: string;
  userId: string;
  context?: Record<string, any>;
  streamingEnabled?: boolean;
  preferredElement?: string;
  ritualPacing?: boolean;
  symbolicDepth?: 'light' | 'medium' | 'deep';
}

export interface OracleResponse {
  textResponse: string;
  audioStream?: ReadableStream;
  audioUrl?: string;
  archetype: string;
  confidence: number;
  symbolicInsights?: {
    ritualPrompts: string[];
    journalQuestions: string[];
    dreamReflections: string[];
    mythicReferences: string[];
  };
  soulprintUpdate?: {
    dominantArchetype: string;
    elementalBalance: Record<string, number>;
    evolutionPhase: string;
  };
  metadata: {
    responseTime: number;
    voiceProfile: string;
    ritualTiming?: any;
    failsafeUsed?: boolean;
  };
}

export class OracleResponsePipeline extends EventEmitter {
  private personalizationEngine: PersonalizationEngine;
  private symbolicEngine: SymbolicIntegrationEngine;
  private failsafeManager: OracleFailsafeManager;
  private streamingService: StreamingOracleService;
  private soulprintEngine: SoulprintEngine;
  private ritualTimingSystem: RitualTimingSystem;
  private archetypeFactory: ArchetypeAgentFactory;

  // Performance optimization caches
  private responseCache = new Map<string, OracleResponse>();
  private voiceCache = new Map<string, Buffer>();
  private preloadedVoices = new Set<string>();

  constructor() {
    super();
    this.initializeEngines();
    this.preloadCommonVoices();
  }

  private initializeEngines() {
    this.personalizationEngine = new PersonalizationEngine();
    this.symbolicEngine = new SymbolicIntegrationEngine();
    this.failsafeManager = new OracleFailsafeManager();
    this.streamingService = new StreamingOracleService();
    this.soulprintEngine = new SoulprintEngine();
    this.ritualTimingSystem = new RitualTimingSystem();
    this.archetypeFactory = new ArchetypeAgentFactory();
  }

  /**
   * 🎯 Main Oracle Processing Pipeline
   * Optimized for parallel execution and real-time streaming
   */
  async processQuery(query: OracleQuery): Promise<OracleResponse> {
    const startTime = Date.now();
    
    try {
      // Phase 1: Parallel Analysis (300-500ms)
      const [
        personalizedContext,
        soulprintAnalysis,
        ritualContext,
        cachedResponse
      ] = await Promise.all([
        this.personalizationEngine.analyzeUser(query.userId, query.input),
        this.soulprintEngine.analyzeQuery(query),
        this.ritualTimingSystem.analyzeContext(query),
        this.checkResponseCache(query)
      ]);

      // Return cached response if available and fresh
      if (cachedResponse) {
        this.emit('cacheHit', { userId: query.userId, query: query.input });
        return cachedResponse;
      }

      // Phase 2: Archetypal Intelligence Selection (100-200ms)
      const selectedArchetype = await this.selectOptimalArchetype(
        query, 
        personalizedContext, 
        soulprintAnalysis
      );

      // Phase 3: Parallel Processing (800-1200ms)
      const [
        archetypalResponse,
        voicePreparation,
        symbolicInsights
      ] = await Promise.all([
        this.generateArchetypalResponse(selectedArchetype, query, personalizedContext),
        this.prepareVoiceSynthesis(selectedArchetype, personalizedContext),
        this.symbolicEngine.generateInsights(query, selectedArchetype, soulprintAnalysis)
      ]);

      // Phase 4: Voice Synthesis & Streaming (500-800ms)
      const audioResult = await this.synthesizeVoiceWithStreaming(
        archetypalResponse.text,
        voicePreparation,
        query.streamingEnabled
      );

      // Phase 5: Response Assembly & Soulprint Update (50-100ms)
      const response = await this.assembleResponse(
        archetypalResponse,
        audioResult,
        symbolicInsights,
        selectedArchetype,
        startTime,
        soulprintAnalysis
      );

      // Async: Update user's soulprint and cache response
      this.updateUserSoulprint(query.userId, response);
      this.cacheResponse(query, response);

      return response;

    } catch (error) {
      logger.error('Oracle Pipeline Error:', error);
      return await this.failsafeManager.handleFailure(query, error);
    }
  }

  /**
   * 🧠 Intelligent Archetype Selection
   * Uses ML-like scoring with spiritual intelligence
   */
  private async selectOptimalArchetype(
    query: OracleQuery,
    personalizedContext: any,
    soulprintAnalysis: any
  ): Promise<string> {
    // Score each archetype based on multiple factors
    const scores = {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0,
      aether: 0
    };

    // Factor 1: Query content analysis (40% weight)
    const contentScores = this.analyzeQueryContent(query.input);
    Object.keys(scores).forEach(archetype => {
      scores[archetype] += contentScores[archetype] * 0.4;
    });

    // Factor 2: User's dominant patterns (30% weight)
    const userPatterns = personalizedContext.dominantArchetypes || {};
    Object.keys(scores).forEach(archetype => {
      scores[archetype] += (userPatterns[archetype] || 0) * 0.3;
    });

    // Factor 3: Elemental balance needs (20% weight)
    const balanceNeeds = soulprintAnalysis.elementalImbalances || {};
    Object.keys(scores).forEach(archetype => {
      scores[archetype] += (balanceNeeds[archetype] || 0) * 0.2;
    });

    // Factor 4: Preferred element override (10% weight)
    if (query.preferredElement && scores[query.preferredElement]) {
      scores[query.preferredElement] += 0.1;
    }

    // Return highest scoring archetype
    const selectedArchetype = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)[0][0];

    logger.info('Archetype Selection:', {
      userId: query.userId,
      selected: selectedArchetype,
      scores,
      factors: { contentScores, userPatterns, balanceNeeds }
    });

    return selectedArchetype;
  }

  /**
   * 🎭 Generate Archetypal Response
   */
  private async generateArchetypalResponse(
    archetype: string,
    query: OracleQuery,
    personalizedContext: any
  ): Promise<{ text: string; confidence: number }> {
    const agent = this.archetypeFactory.createAgent(archetype);
    
    const enhancedQuery = {
      ...query,
      context: {
        ...query.context,
        personalizedContext,
        archetypalGuidance: await this.getArchetypalGuidance(archetype),
        ritualContext: personalizedContext.ritualPreferences
      }
    };

    const response = await agent.processQuery(enhancedQuery);
    
    return {
      text: response.content,
      confidence: response.confidence || 0.8
    };
  }

  /**
   * 🎵 Voice Synthesis with Streaming Support
   */
  private async synthesizeVoiceWithStreaming(
    text: string,
    voicePreparation: any,
    streamingEnabled: boolean = false
  ): Promise<{ audioUrl?: string; audioStream?: ReadableStream }> {
    if (streamingEnabled) {
      // Stream audio as it's generated
      const audioStream = await this.streamingService.synthesizeStreaming(
        text,
        voicePreparation.voiceConfig,
        voicePreparation.ritualTiming
      );
      
      return { audioStream };
    } else {
      // Traditional synthesis
      const audioUrl = await this.streamingService.synthesizeComplete(
        text,
        voicePreparation.voiceConfig
      );
      
      return { audioUrl };
    }
  }

  /**
   * 🔄 Response Assembly
   */
  private async assembleResponse(
    archetypalResponse: any,
    audioResult: any,
    symbolicInsights: any,
    selectedArchetype: string,
    startTime: number,
    soulprintAnalysis: any
  ): Promise<OracleResponse> {
    const responseTime = Date.now() - startTime;
    
    return {
      textResponse: archetypalResponse.text,
      audioUrl: audioResult.audioUrl,
      audioStream: audioResult.audioStream,
      archetype: selectedArchetype,
      confidence: archetypalResponse.confidence,
      symbolicInsights,
      soulprintUpdate: {
        dominantArchetype: selectedArchetype,
        elementalBalance: soulprintAnalysis.elementalBalance,
        evolutionPhase: soulprintAnalysis.currentPhase
      },
      metadata: {
        responseTime,
        voiceProfile: `${selectedArchetype}_oracle`,
        ritualTiming: audioResult.ritualTiming
      }
    };
  }

  /**
   * 💾 Performance Optimization Methods
   */
  private async checkResponseCache(query: OracleQuery): Promise<OracleResponse | null> {
    const cacheKey = this.generateCacheKey(query);
    const cached = this.responseCache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached)) {
      return cached;
    }
    
    return null;
  }

  private generateCacheKey(query: OracleQuery): string {
    return `${query.userId}_${query.input.substring(0, 50)}_${query.preferredElement || 'auto'}`;
  }

  private isCacheValid(response: OracleResponse): boolean {
    const cacheAge = Date.now() - (response.metadata.responseTime || 0);
    return cacheAge < 300000; // 5 minutes
  }

  private async preloadCommonVoices(): Promise<void> {
    const commonArchetypes = ['fire', 'water', 'earth', 'air', 'aether'];
    
    for (const archetype of commonArchetypes) {
      try {
        const voiceConfig = ARCHETYPE_VOICES[archetype];
        if (voiceConfig) {
          await this.streamingService.preloadVoice(voiceConfig);
          this.preloadedVoices.add(archetype);
        }
      } catch (error) {
        logger.warn(`Failed to preload voice for ${archetype}:`, error);
      }
    }
    
    logger.info('Voice preloading completed:', {
      preloadedCount: this.preloadedVoices.size,
      archetypes: Array.from(this.preloadedVoices)
    });
  }

  // Utility methods
  private analyzeQueryContent(input: string): Record<string, number> {
    const keywords = {
      fire: ['stuck', 'ignite', 'passion', 'create', 'vision', 'breakthrough'],
      water: ['feel', 'emotion', 'flow', 'heal', 'heart', 'intuition'],
      earth: ['ground', 'practical', 'stable', 'manifest', 'build', 'foundation'],
      air: ['think', 'understand', 'clarity', 'communicate', 'perspective', 'insight'],
      aether: ['unity', 'transcend', 'integrate', 'spiritual', 'divine', 'wholeness']
    };

    const scores = { fire: 0, water: 0, earth: 0, air: 0, aether: 0 };
    const lowercaseInput = input.toLowerCase();

    Object.entries(keywords).forEach(([archetype, words]) => {
      words.forEach(word => {
        if (lowercaseInput.includes(word)) {
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

  private async getArchetypalGuidance(archetype: string): Promise<string> {
    const guidance = {
      fire: 'Channel transformative energy and catalytic wisdom',
      water: 'Flow with emotional depth and healing presence',
      earth: 'Provide grounding wisdom and practical guidance',
      air: 'Offer clear perspective and mental clarity',
      aether: 'Integrate all elements with transcendent awareness'
    };

    return guidance[archetype] || guidance.aether;
  }

  private async prepareVoiceSynthesis(archetype: string, context: any): Promise<any> {
    const voiceConfig = ARCHETYPE_VOICES[archetype];
    const ritualTiming = context.ritualPreferences?.pacing || 'normal';
    
    return {
      voiceConfig,
      ritualTiming,
      personalizedSettings: context.voicePreferences || {}
    };
  }

  private async updateUserSoulprint(userId: string, response: OracleResponse): Promise<void> {
    // Async update to not block response
    try {
      await this.soulprintEngine.updateUserProfile(userId, response);
    } catch (error) {
      logger.error('Soulprint update failed:', error);
    }
  }

  private cacheResponse(query: OracleQuery, response: OracleResponse): void {
    const cacheKey = this.generateCacheKey(query);
    this.responseCache.set(cacheKey, response);
    
    // Limit cache size
    if (this.responseCache.size > 1000) {
      const firstKey = this.responseCache.keys().next().value;
      this.responseCache.delete(firstKey);
    }
  }
}