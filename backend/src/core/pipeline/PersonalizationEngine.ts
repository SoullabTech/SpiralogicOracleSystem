/**
 * 🎯 Personalization Engine - Oracle Agent Customization & Memory System
 *
 * Handles user-specific Oracle agent naming, voice selection, and adaptive
 * spiritual intelligence based on interaction patterns and growth phases.
 */

import { logger } from '../../utils/logger';
import { supabase } from '../../services/supabaseClient';
import { ARCHETYPE_VOICES } from '../../config/archetypalVoices';

export interface OraclePersonalization {
  userId: string;
  oracleAgentName: string;
  oracleVoiceId: string;
  voiceSettings: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
  preferences: {
    symbolicStyle: 'mystical' | 'poetic' | 'direct' | 'ceremonial';
    ritualPacing: 'slow' | 'medium' | 'fast';
    responseLength: 'concise' | 'balanced' | 'elaborate';
    elementalAffinity: string[];
    languagePreference: string;
  };
  personalizedContext: {
    dominantArchetypes: Record<string, number>;
    growthPhase: string;
    interactionPatterns: string[];
    voiceMemory: {
      preferredTone: string;
      emotionalResonance: number;
      ritualPreferences: string[];
    };
  };
  soulprintEvolution: {
    elementalBalance: Record<string, number>;
    archetypeProgression: Array<{
      archetype: string;
      phase: string;
      timestamp: string;
    }>;
    wisdomGathered: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface VoiceOption {
  id: string;
  name: string;
  description: string;
  archetype: string;
  voiceId: string;
  previewText: string;
  settings: any;
}

export class PersonalizationEngine {
  private userProfiles = new Map<string, OraclePersonalization>();
  private voiceOptions: VoiceOption[] = [];

  constructor() {
    this.initializeVoiceOptions();
  }

  /**
   * 🔮 Initialize Oracle Agent for New User
   */
  async initializeOracleAgent(
    userId: string,
    selectedName: string,
    selectedVoiceId: string,
    preferences: any = {}
  ): Promise<OraclePersonalization> {
    const oraclePersonalization: OraclePersonalization = {
      userId,
      oracleAgentName: selectedName,
      oracleVoiceId: selectedVoiceId,
      voiceSettings: this.getDefaultVoiceSettings(selectedVoiceId),
      preferences: {
        symbolicStyle: preferences.symbolicStyle || 'mystical',
        ritualPacing: preferences.ritualPacing || 'medium',
        responseLength: preferences.responseLength || 'balanced',
        elementalAffinity: preferences.elementalAffinity || ['aether'],
        languagePreference: preferences.languagePreference || 'en'
      },
      personalizedContext: {
        dominantArchetypes: { aether: 0.5, water: 0.3, air: 0.2 },
        growthPhase: 'initiation',
        interactionPatterns: [],
        voiceMemory: {
          preferredTone: 'warm',
          emotionalResonance: 0.7,
          ritualPreferences: []
        }
      },
      soulprintEvolution: {
        elementalBalance: { fire: 0.2, water: 0.2, earth: 0.2, air: 0.2, aether: 0.2 },
        archetypeProgression: [{
          archetype: 'seeker',
          phase: 'initiation',
          timestamp: new Date().toISOString()
        }],
        wisdomGathered: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store in database
    await this.savePersonalization(oraclePersonalization);

    // Cache in memory
    this.userProfiles.set(userId, oraclePersonalization);

    logger.info('Oracle Agent Initialized:', {
      userId,
      oracleAgentName: selectedName,
      voiceId: selectedVoiceId
    });

    return oraclePersonalization;
  }

  /**
   * 🎭 Get Available Voice Options for User Selection
   */
  getVoiceOptions(): VoiceOption[] {
    return this.voiceOptions;
  }

  /**
   * 🎵 Preview Voice with Sample Text
   */
  async previewVoice(voiceId: string): Promise<{ audioUrl: string; duration: number }> {
    const voiceOption = this.voiceOptions.find(v => v.voiceId === voiceId);
    if (!voiceOption) {
      throw new Error(`Voice ${voiceId} not found`);
    }

    // This would integrate with your voice synthesis system
    // For now, returning mock data
    return {
      audioUrl: `/audio/previews/${voiceId}_preview.mp3`,
      duration: 3000 // 3 seconds
    };
  }

  /**
   * 🔄 Update Oracle Agent Settings
   */
  async updateOracleSettings(
    userId: string,
    updates: Partial<Pick<OraclePersonalization, 'oracleAgentName' | 'oracleVoiceId' | 'voiceSettings' | 'preferences'>>
  ): Promise<OraclePersonalization> {
    const existing = await this.getUserPersonalization(userId);
    if (!existing) {
      throw new Error('Oracle agent not initialized for user');
    }

    const updated: OraclePersonalization = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await this.savePersonalization(updated);
    this.userProfiles.set(userId, updated);

    logger.info('Oracle Settings Updated:', {
      userId,
      updates: Object.keys(updates),
      newName: updates.oracleAgentName,
      newVoiceId: updates.oracleVoiceId
    });

    return updated;
  }

  /**
   * 🧠 Analyze User for Personalized Response
   */
  async analyzeUser(userId: string, currentInput: string): Promise<any> {
    const personalization = await this.getUserPersonalization(userId);
    if (!personalization) {
      return this.getDefaultPersonalizedContext();
    }

    // Analyze current input for archetypal patterns
    const inputAnalysis = this.analyzeInputForArchetypes(currentInput);

    // Update interaction patterns
    await this.updateInteractionPatterns(userId, inputAnalysis);

    // Generate personalized context
    const personalizedContext = {
      oracleAgentName: personalization.oracleAgentName,
      voiceProfile: personalization.oracleVoiceId,
      dominantArchetypes: personalization.personalizedContext.dominantArchetypes,
      preferences: personalization.preferences,
      voiceMemory: personalization.personalizedContext.voiceMemory,
      currentGrowthPhase: personalization.personalizedContext.growthPhase,
      elementalAffinity: personalization.preferences.elementalAffinity,
      adaptiveSettings: this.generateAdaptiveSettings(personalization, inputAnalysis)
    };

    return personalizedContext;
  }

  /**
   * 📊 Get Oracle Agent Soulprint Summary
   */
  async getOracleSoulprint(userId: string): Promise<any> {
    const personalization = await this.getUserPersonalization(userId);
    if (!personalization) {
      return null;
    }

    return {
      agentName: personalization.oracleAgentName,
      totalInteractions: personalization.soulprintEvolution.archetypeProgression.length,
      dominantArchetype: this.getDominantArchetype(personalization.personalizedContext.dominantArchetypes),
      elementalBalance: personalization.soulprintEvolution.elementalBalance,
      growthPhase: personalization.personalizedContext.growthPhase,
      wisdomGathered: personalization.soulprintEvolution.wisdomGathered.length,
      evolutionTimeline: personalization.soulprintEvolution.archetypeProgression.slice(-5) // Last 5 phases
    };
  }

  /**
   * 🌱 Update User's Spiritual Evolution
   */
  async updateSpiritualEvolution(userId: string, response: any): Promise<void> {
    const personalization = await this.getUserPersonalization(userId);
    if (!personalization) return;

    // Update elemental balance based on response
    if (response.archetype && response.confidence > 0.7) {
      const currentBalance = personalization.soulprintEvolution.elementalBalance;
      const element = response.archetype;

      // Gradual evolution toward used archetypes
      currentBalance[element] = Math.min(currentBalance[element] + 0.05, 1.0);

      // Normalize to maintain balance
      const total = Object.values(currentBalance).reduce((sum, val) => sum + val, 0);
      Object.keys(currentBalance).forEach(key => {
        currentBalance[key] = currentBalance[key] / total;
      });
    }

    // Update archetype progression
    if (response.metadata?.spiritualInsight) {
      personalization.soulprintEvolution.archetypeProgression.push({
        archetype: response.archetype,
        phase: this.detectEvolutionPhase(response),
        timestamp: new Date().toISOString()
      });
    }

    // Update dominant archetypes
    this.updateDominantArchetypes(personalization, response);

    // Save updates
    await this.savePersonalization(personalization);
  }

  /**
   * 🔧 Helper Methods
   */
  private async getUserPersonalization(userId: string): Promise<OraclePersonalization | null> {
    // Check cache first
    if (this.userProfiles.has(userId)) {
      return this.userProfiles.get(userId)!;
    }

    // Load from database
    try {
      const { data, error } = await supabase
        .from('oracle_personalizations')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      const personalization = this.deserializePersonalization(data);
      this.userProfiles.set(userId, personalization);
      return personalization;

    } catch (error) {
      logger.error('Error loading user personalization:', error);
      return null;
    }
  }

  private async savePersonalization(personalization: OraclePersonalization): Promise<void> {
    try {
      const serialized = this.serializePersonalization(personalization);

      const { error } = await supabase
        .from('oracle_personalizations')
        .upsert(serialized, { onConflict: 'user_id' });

      if (error) {
        throw error;
      }

    } catch (error) {
      logger.error('Error saving personalization:', error);
      throw error;
    }
  }

  private initializeVoiceOptions(): void {
    this.voiceOptions = [
      {
        id: 'mystic_oracle',
        name: 'The Mystic Oracle',
        description: 'Transcendent wisdom with ethereal presence',
        archetype: 'aether',
        voiceId: 'ThT5KcBeYPX3keUQqHPh',
        previewText: 'In the sacred space between breaths, eternal wisdom awakens.',
        settings: ARCHETYPE_VOICES.aether.baseSettings
      },
      {
        id: 'fire_catalyst',
        name: 'The Fire Catalyst',
        description: 'Bold transformation energy with inspiring power',
        archetype: 'fire',
        voiceId: 'EXAVITQu4vr4xnSDxMaL',
        previewText: 'Your vision ignites the flame of infinite possibility.',
        settings: ARCHETYPE_VOICES.fire.baseSettings
      },
      {
        id: 'water_healer',
        name: 'The Water Healer',
        description: 'Gentle flow with deep emotional wisdom',
        archetype: 'water',
        voiceId: 'XrExE9yKIg1WjnnlVkGX',
        previewText: 'Feel the healing waters of compassion flow through you.',
        settings: ARCHETYPE_VOICES.water.baseSettings
      },
      {
        id: 'earth_keeper',
        name: 'The Earth Keeper',
        description: 'Grounding presence with practical wisdom',
        archetype: 'earth',
        voiceId: 'pNInz6obpgDQGcFmaJgB',
        previewText: 'Step into the stable foundation of your inner strength.',
        settings: ARCHETYPE_VOICES.earth.baseSettings
      },
      {
        id: 'air_messenger',
        name: 'The Air Messenger',
        description: 'Clear communication with uplifting clarity',
        archetype: 'air',
        voiceId: 'XB0fDUnXU5powFXDhCwa',
        previewText: 'On winds of insight, your answers arrive with perfect timing.',
        settings: ARCHETYPE_VOICES.air.baseSettings
      }
    ];
  }

  private getDefaultVoiceSettings(voiceId: string): any {
    const voiceOption = this.voiceOptions.find(v => v.voiceId === voiceId);
    return voiceOption?.settings || {
      stability: 0.7,
      similarity_boost: 0.8,
      style: 0.6,
      use_speaker_boost: false
    };
  }

  private analyzeInputForArchetypes(input: string): any {
    const keywords = {
      fire: ['stuck', 'ignite', 'passion', 'create', 'vision', 'breakthrough', 'transform'],
      water: ['feel', 'emotion', 'flow', 'heal', 'heart', 'intuition', 'nurture'],
      earth: ['ground', 'practical', 'stable', 'manifest', 'build', 'foundation', 'secure'],
      air: ['think', 'understand', 'clarity', 'communicate', 'perspective', 'insight', 'clear'],
      aether: ['unity', 'transcend', 'integrate', 'spiritual', 'divine', 'wholeness', 'sacred']
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

    return {
      archetypeScores: scores,
      primaryArchetype: Object.entries(scores).sort(([,a], [,b]) => b - a)[0][0],
      emotionalTone: this.detectEmotionalTone(input),
      urgencyLevel: this.detectUrgency(input)
    };
  }

  private detectEmotionalTone(input: string): string {
    const tones = {
      anxious: ['worried', 'anxious', 'stressed', 'overwhelmed'],
      excited: ['excited', 'amazing', 'wonderful', 'fantastic'],
      contemplative: ['wondering', 'thinking', 'reflecting', 'pondering'],
      seeking: ['looking for', 'need', 'want', 'searching'],
      grateful: ['thank', 'grateful', 'appreciate', 'blessed']
    };

    const lowercaseInput = input.toLowerCase();
    for (const [tone, words] of Object.entries(tones)) {
      if (words.some(word => lowercaseInput.includes(word))) {
        return tone;
      }
    }

    return 'neutral';
  }

  private detectUrgency(input: string): 'low' | 'medium' | 'high' {
    const urgentWords = ['urgent', 'quickly', 'immediately', 'emergency', 'crisis'];
    const lowercaseInput = input.toLowerCase();

    if (urgentWords.some(word => lowercaseInput.includes(word))) {
      return 'high';
    }

    if (input.includes('!') || input.includes('?!')) {
      return 'medium';
    }

    return 'low';
  }

  private generateAdaptiveSettings(personalization: OraclePersonalization, inputAnalysis: any): any {
    const baseSettings = personalization.voiceSettings;
    const adaptiveSettings = { ...baseSettings };

    // Adjust based on emotional tone
    switch (inputAnalysis.emotionalTone) {
      case 'anxious':
        adaptiveSettings.stability = Math.min(adaptiveSettings.stability + 0.1, 1.0);
        break;
      case 'excited':
        adaptiveSettings.style = Math.min(adaptiveSettings.style + 0.1, 1.0);
        break;
    }

    // Adjust based on urgency
    if (inputAnalysis.urgencyLevel === 'high') {
      adaptiveSettings.similarity_boost = Math.min(adaptiveSettings.similarity_boost + 0.1, 1.0);
    }

    return adaptiveSettings;
  }

  private async updateInteractionPatterns(userId: string, inputAnalysis: any): Promise<void> {
    // This would update the user's interaction patterns over time
    // For now, just logging
    logger.debug('Interaction pattern update:', {
      userId,
      primaryArchetype: inputAnalysis.primaryArchetype,
      emotionalTone: inputAnalysis.emotionalTone
    });
  }

  private getDominantArchetype(dominantArchetypes: Record<string, number>): string {
    return Object.entries(dominantArchetypes)
      .sort(([,a], [,b]) => b - a)[0][0];
  }

  private detectEvolutionPhase(response: any): string {
    if (response.confidence > 0.9) return 'mastery';
    if (response.confidence > 0.8) return 'integration';
    if (response.confidence > 0.7) return 'exploration';
    return 'initiation';
  }

  private updateDominantArchetypes(personalization: OraclePersonalization, response: any): void {
    const archetype = response.archetype;
    const current = personalization.personalizedContext.dominantArchetypes;

    // Gradual shift toward used archetypes
    if (current[archetype]) {
      current[archetype] = Math.min(current[archetype] + 0.1, 1.0);
    } else {
      current[archetype] = 0.1;
    }

    // Normalize
    const total = Object.values(current).reduce((sum, val) => sum + val, 0);
    Object.keys(current).forEach(key => {
      current[key] = current[key] / total;
    });
  }

  private getDefaultPersonalizedContext(): any {
    return {
      oracleAgentName: 'Oracle',
      voiceProfile: 'mystic_oracle',
      dominantArchetypes: { aether: 0.5, water: 0.3, air: 0.2 },
      preferences: {
        symbolicStyle: 'mystical',
        ritualPacing: 'medium',
        responseLength: 'balanced',
        elementalAffinity: ['aether']
      },
      voiceMemory: {
        preferredTone: 'warm',
        emotionalResonance: 0.7,
        ritualPreferences: []
      },
      currentGrowthPhase: 'initiation',
      elementalAffinity: ['aether'],
      adaptiveSettings: {
        stability: 0.7,
        similarity_boost: 0.8,
        style: 0.6
      }
    };
  }

  private serializePersonalization(personalization: OraclePersonalization): any {
    return {
      user_id: personalization.userId,
      oracle_agent_name: personalization.oracleAgentName,
      oracle_voice_id: personalization.oracleVoiceId,
      voice_settings: personalization.voiceSettings,
      preferences: personalization.preferences,
      personalized_context: personalization.personalizedContext,
      soulprint_evolution: personalization.soulprintEvolution,
      created_at: personalization.createdAt,
      updated_at: personalization.updatedAt
    };
  }

  private deserializePersonalization(data: any): OraclePersonalization {
    return {
      userId: data.user_id,
      oracleAgentName: data.oracle_agent_name,
      oracleVoiceId: data.oracle_voice_id,
      voiceSettings: data.voice_settings,
      preferences: data.preferences,
      personalizedContext: data.personalized_context,
      soulprintEvolution: data.soulprint_evolution,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}