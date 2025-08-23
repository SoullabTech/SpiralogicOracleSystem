/**
 * Maya-MicroPsi Integration for Voice Interface
 * Connects MicroPsi consciousness modeling with Maya's voice synthesis
 * and Spiralogic's archetypal wisdom protocols
 */

import { micropsi } from '@/lib/psi/micropsiBach';
import { 
  detectArchetypesRefined,
  applyElementalRouting,
  extractIntentHint,
  ArchetypeMatch 
} from '@/lib/spiralogic/refined-heuristics';
import { logger } from '@/lib/shared/observability/logger';

export interface VoiceConsciousnessState {
  micropsiState: {
    driveVector: Record<string, number>;
    affect: { valence: number; arousal: number; confidence: number };
    modulation: { temperature: number; depthBias: number; inviteCount: 1 | 2 };
  };
  archetypeMatches: ArchetypeMatch[];
  elementalWeights: Record<string, number>;
  spiralogicPhase: string;
  voiceModulation: VoiceModulationParams;
  intentHint?: string;
}

export interface VoiceModulationParams {
  stability: number;      // 0-1, voice consistency
  similarity: number;     // 0-1, similarity to base voice
  style: number;         // 0-1, style intensity
  speakerBoost: boolean;  // enhance clarity
  emotionalTone: {
    warmth: number;       // 0-1, warmth/coldness
    energy: number;       // 0-1, energy level
    pace: number;         // 0-1, speaking pace
    depth: number;        // 0-1, vocal depth
  };
}

export class MayaMicropsiIntegration {
  private conversationHistory: Array<{ text: string; ts: number; role: 'user' | 'assistant' }> = [];
  private currentConsciousnessState: VoiceConsciousnessState | null = null;

  /**
   * Process user voice input through integrated consciousness modeling
   */
  async processVoiceConsciousness(
    userInput: string,
    audioMetadata?: {
      emotionalTone?: string;
      energyLevel?: number;
      confidence?: number;
      duration?: number;
    },
    sessionContext?: {
      spiralogicPhase?: string;
      previousArchetype?: string;
      elementalResonance?: string;
    }
  ): Promise<VoiceConsciousnessState> {
    try {
      logger.info('Processing voice consciousness', {
        inputLength: userInput.length,
        audioMetadata,
        sessionContext
      });

      // 1. MicroPsi consciousness appraisal
      const micropsiInput = {
        text: userInput,
        nlu: {
          sentiment: {
            valence: this.inferValenceFromAudio(audioMetadata),
            arousal: audioMetadata?.energyLevel || 0.5
          },
          entities: this.extractEntities(userInput)
        },
        psi: {
          mood: this.getCurrentMood(),
          socialNeed: this.assessSocialNeed(userInput)
        },
        facetHints: this.generateFacetHints(userInput, sessionContext),
        history: this.conversationHistory
      };

      const micropsiState = await micropsi.appraise(micropsiInput);

      // 2. Spiralogic archetype detection
      const archetypeMatches = detectArchetypesRefined(userInput);

      // 3. Elemental routing based on archetypes and session context
      const baseElementalWeights = this.computeBaseElementalWeights(archetypeMatches);
      const { adjusted: elementalWeights } = applyElementalRouting(
        baseElementalWeights,
        sessionContext?.spiralogicPhase,
        extractIntentHint(userInput)
      );

      // 4. Voice modulation synthesis
      const voiceModulation = this.synthesizeVoiceModulation(
        micropsiState,
        archetypeMatches,
        elementalWeights,
        audioMetadata
      );

      // 5. Update consciousness state
      this.currentConsciousnessState = {
        micropsiState,
        archetypeMatches,
        elementalWeights,
        spiralogicPhase: sessionContext?.spiralogicPhase || 'seeking',
        voiceModulation,
        intentHint: extractIntentHint(userInput)
      };

      // 6. Update conversation history
      this.conversationHistory.push({
        text: userInput,
        ts: Date.now(),
        role: 'user'
      });

      // Keep history manageable
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-8);
      }

      logger.info('Voice consciousness processed', {
        archetypeCount: archetypeMatches.length,
        primaryArchetype: archetypeMatches[0]?.name,
        micropsiConfidence: micropsiState.affect.confidence,
        elementalDominant: this.getDominantElement(elementalWeights)
      });

      return this.currentConsciousnessState;

    } catch (error) {
      logger.error('Voice consciousness processing failed', { error, userInput });
      
      // Return safe fallback state
      return this.createFallbackConsciousnessState(userInput);
    }
  }

  /**
   * Generate Maya response modulated by consciousness state
   */
  async generateConsciousResponse(
    oracleResponse: string,
    consciousnessState: VoiceConsciousnessState
  ): Promise<{
    modulatedResponse: string;
    voiceParams: VoiceModulationParams;
    consciousnessInsights: string[];
  }> {
    try {
      const insights: string[] = [];
      let modulatedResponse = oracleResponse;

      // Apply MicroPsi modulation to response content
      if (consciousnessState.micropsiState.modulation.depthBias > 0.7) {
        modulatedResponse = this.deepenResponse(modulatedResponse);
        insights.push('Deepened response based on high meaning drive');
      }

      if (consciousnessState.micropsiState.affect.arousal > 0.7) {
        modulatedResponse = this.energizeResponse(modulatedResponse);
        insights.push('Energized response for high arousal state');
      }

      // Apply archetypal wisdom
      if (consciousnessState.archetypeMatches.length > 0) {
        const primaryArchetype = consciousnessState.archetypeMatches[0];
        modulatedResponse = this.applyArchetypalWisdom(modulatedResponse, primaryArchetype);
        insights.push(`Applied ${primaryArchetype.name} archetypal wisdom`);
      }

      // Apply elemental coloring
      const dominantElement = this.getDominantElement(consciousnessState.elementalWeights);
      modulatedResponse = this.applyElementalColoring(modulatedResponse, dominantElement);
      insights.push(`Elemental coloring: ${dominantElement}`);

      // Add conversation to history
      this.conversationHistory.push({
        text: modulatedResponse,
        ts: Date.now(),
        role: 'assistant'
      });

      return {
        modulatedResponse,
        voiceParams: consciousnessState.voiceModulation,
        consciousnessInsights: insights
      };

    } catch (error) {
      logger.error('Conscious response generation failed', { error });
      return {
        modulatedResponse: oracleResponse,
        voiceParams: this.createFallbackVoiceParams(),
        consciousnessInsights: ['Fallback response - consciousness integration failed']
      };
    }
  }

  /**
   * Get current consciousness state
   */
  getCurrentConsciousnessState(): VoiceConsciousnessState | null {
    return this.currentConsciousnessState;
  }

  /**
   * Reset consciousness state for new session
   */
  resetConsciousness(): void {
    this.conversationHistory = [];
    this.currentConsciousnessState = null;
  }

  // Private implementation methods

  private inferValenceFromAudio(audioMetadata?: any): number {
    if (!audioMetadata?.emotionalTone) return 0.5;
    
    const toneValenceMap: Record<string, number> = {
      'happy': 0.8,
      'excited': 0.9,
      'calm': 0.6,
      'neutral': 0.5,
      'sad': 0.2,
      'angry': 0.1,
      'anxious': 0.3,
      'content': 0.7,
      'curious': 0.6
    };

    return toneValenceMap[audioMetadata.emotionalTone] || 0.5;
  }

  private extractEntities(text: string): any[] {
    // Simple entity extraction for MicroPsi
    const entities = [];
    const patterns = {
      emotion: /\b(feel|feeling|felt|emotion|mood|sad|happy|angry|excited|calm)\w*\b/gi,
      relationship: /\b(friend|family|partner|colleague|relationship|connection)\w*\b/gi,
      spiritual: /\b(soul|spirit|sacred|divine|meditation|prayer|purpose|meaning)\w*\b/gi,
      growth: /\b(grow|growth|learn|change|transform|evolve|develop)\w*\b/gi
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      const matches = text.match(pattern);
      if (matches) {
        entities.push({ type, count: matches.length });
      }
    }

    return entities;
  }

  private getCurrentMood(): number {
    // Analyze recent conversation history for mood
    if (this.conversationHistory.length === 0) return 0.5;

    const recentMessages = this.conversationHistory.slice(-3);
    let moodScore = 0.5;

    for (const msg of recentMessages) {
      const text = msg.text.toLowerCase();
      if (/\b(good|great|wonderful|amazing|excited|happy|love)\b/.test(text)) {
        moodScore += 0.1;
      }
      if (/\b(bad|awful|terrible|sad|depressed|angry|hate)\b/.test(text)) {
        moodScore -= 0.1;
      }
    }

    return Math.max(0, Math.min(1, moodScore));
  }

  private assessSocialNeed(text: string): number {
    const socialIndicators = [
      /\b(lonely|alone|isolated|need|want|someone|people|together)\b/gi,
      /\b(understand|listen|hear|connect|share|tell|talk)\b/gi,
      /\b(help|support|guidance|advice|wisdom)\b/gi
    ];

    let socialScore = 0;
    for (const pattern of socialIndicators) {
      const matches = text.match(pattern);
      if (matches) socialScore += matches.length * 0.1;
    }

    return Math.min(1, socialScore);
  }

  private generateFacetHints(text: string, sessionContext?: any): Record<string, number> {
    const hints: Record<string, number> = {};

    // Elemental facet hints
    const elementalPatterns = {
      fire: /\b(passion|energy|transform|change|action|drive|create)\b/gi,
      water: /\b(flow|feel|emotion|intuition|depth|healing|cleanse)\b/gi,
      earth: /\b(ground|practical|stable|structure|build|foundation)\b/gi,
      air: /\b(think|idea|communicate|clarity|mental|understand)\b/gi,
      aether: /\b(spirit|sacred|divine|transcend|unity|whole|purpose)\b/gi
    };

    for (const [element, pattern] of Object.entries(elementalPatterns)) {
      const matches = text.match(pattern);
      hints[element] = matches ? Math.min(1, matches.length * 0.2) : 0;
    }

    // Session context hints
    if (sessionContext?.elementalResonance) {
      hints[sessionContext.elementalResonance] = 
        (hints[sessionContext.elementalResonance] || 0) + 0.3;
    }

    return hints;
  }

  private computeBaseElementalWeights(archetypes: ArchetypeMatch[]): Record<string, number> {
    const baseWeights = { fire: 0.2, water: 0.2, earth: 0.2, air: 0.2, aether: 0.2 };

    // Apply archetypal biases
    for (const archetype of archetypes) {
      const weight = archetype.confidence * 0.5;
      for (const [element, bias] of Object.entries(archetype.elemental_bias)) {
        baseWeights[element] = (baseWeights[element] || 0) + (bias * weight);
      }
    }

    return baseWeights;
  }

  private synthesizeVoiceModulation(
    micropsiState: any,
    archetypes: ArchetypeMatch[],
    elementalWeights: Record<string, number>,
    audioMetadata?: any
  ): VoiceModulationParams {
    const baseParams: VoiceModulationParams = {
      stability: 0.8,
      similarity: 0.8,
      style: 0.2,
      speakerBoost: true,
      emotionalTone: {
        warmth: 0.6,
        energy: 0.5,
        pace: 0.5,
        depth: 0.5
      }
    };

    // MicroPsi modulation
    const affect = micropsiState.affect;
    const modulation = micropsiState.modulation;

    baseParams.style = Math.max(0.1, Math.min(0.8, modulation.temperature * 0.5));
    baseParams.emotionalTone.energy = affect.arousal;
    baseParams.emotionalTone.warmth = affect.valence;
    baseParams.emotionalTone.depth = modulation.depthBias;
    baseParams.emotionalTone.pace = 0.4 + (affect.arousal * 0.3);

    // Archetypal modulation
    if (archetypes.length > 0) {
      const primaryArchetype = archetypes[0];
      switch (primaryArchetype.name.toLowerCase()) {
        case 'wise_elder':
          baseParams.emotionalTone.depth += 0.2;
          baseParams.emotionalTone.pace -= 0.1;
          break;
        case 'compassionate_friend':
          baseParams.emotionalTone.warmth += 0.2;
          baseParams.stability += 0.1;
          break;
        case 'creative_catalyst':
          baseParams.style += 0.2;
          baseParams.emotionalTone.energy += 0.1;
          break;
        case 'grounded_guide':
          baseParams.stability += 0.2;
          baseParams.emotionalTone.depth += 0.1;
          break;
      }
    }

    // Elemental modulation
    const dominantElement = this.getDominantElement(elementalWeights);
    switch (dominantElement) {
      case 'fire':
        baseParams.emotionalTone.energy += 0.15;
        baseParams.emotionalTone.pace += 0.1;
        break;
      case 'water':
        baseParams.emotionalTone.warmth += 0.15;
        baseParams.stability += 0.1;
        break;
      case 'earth':
        baseParams.stability += 0.2;
        baseParams.emotionalTone.depth += 0.1;
        break;
      case 'air':
        baseParams.emotionalTone.pace += 0.05;
        baseParams.style += 0.1;
        break;
      case 'aether':
        baseParams.emotionalTone.depth += 0.15;
        baseParams.emotionalTone.warmth += 0.1;
        break;
    }

    // Normalize values
    baseParams.stability = Math.max(0.3, Math.min(1.0, baseParams.stability));
    baseParams.similarity = Math.max(0.3, Math.min(1.0, baseParams.similarity));
    baseParams.style = Math.max(0.0, Math.min(1.0, baseParams.style));
    baseParams.emotionalTone.warmth = Math.max(0.0, Math.min(1.0, baseParams.emotionalTone.warmth));
    baseParams.emotionalTone.energy = Math.max(0.0, Math.min(1.0, baseParams.emotionalTone.energy));
    baseParams.emotionalTone.pace = Math.max(0.2, Math.min(0.8, baseParams.emotionalTone.pace));
    baseParams.emotionalTone.depth = Math.max(0.0, Math.min(1.0, baseParams.emotionalTone.depth));

    return baseParams;
  }

  private getDominantElement(weights: Record<string, number>): string {
    return Object.entries(weights)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'aether';
  }

  private deepenResponse(response: string): string {
    // Add depth markers and contemplative pauses
    return response
      .replace(/\. /g, '... ')
      .replace(/\? /g, '? *pause* ')
      .replace(/^/, '*taking a deeper breath* ');
  }

  private energizeResponse(response: string): string {
    // Add energy and enthusiasm markers
    return response
      .replace(/\!/g, '! ')
      .replace(/good/gi, 'wonderful')
      .replace(/nice/gi, 'amazing');
  }

  private applyArchetypalWisdom(response: string, archetype: ArchetypeMatch): string {
    // Subtle archetypal coloring based on primary archetype
    const archetypalPhrases = {
      wise_elder: ['In my experience...', 'As I've come to understand...', 'Through years of witnessing...'],
      compassionate_friend: ['I hear you...', 'What I sense is...', 'With gentle curiosity...'],
      creative_catalyst: ['What if we explored...', 'I wonder what might emerge if...', 'Let\'s experiment with...'],
      grounded_guide: ['Let\'s take this step by step...', 'What feels most solid here is...', 'Building from where you are...']
    };

    const phrases = archetypalPhrases[archetype.name.toLowerCase().replace(' ', '_')] || [];
    if (phrases.length === 0) return response;

    const selectedPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    return `${selectedPhrase} ${response}`;
  }

  private applyElementalColoring(response: string, dominantElement: string): string {
    const elementalColorings = {
      fire: () => response.replace(/\b(can|could|might|may)\b/gi, 'will'),
      water: () => response.replace(/think/gi, 'sense').replace(/understand/gi, 'feel into'),
      earth: () => response.replace(/\b(maybe|perhaps)\b/gi, 'clearly'),
      air: () => response.replace(/feel/gi, 'perceive').replace(/\b(and)\b/gi, ', and also,'),
      aether: () => response.replace(/\b(problem|issue)\b/gi, 'sacred invitation')
    };

    const coloring = elementalColorings[dominantElement];
    return coloring ? coloring() : response;
  }

  private createFallbackConsciousnessState(userInput: string): VoiceConsciousnessState {
    return {
      micropsiState: {
        driveVector: { clarity: 0.6, safety: 0.6, agency: 0.5, connection: 0.5, meaning: 0.5 },
        affect: { valence: 0.5, arousal: 0.5, confidence: 0.3 },
        modulation: { temperature: 0.6, depthBias: 0.5, inviteCount: 1 }
      },
      archetypeMatches: [],
      elementalWeights: { fire: 0.2, water: 0.2, earth: 0.2, air: 0.2, aether: 0.2 },
      spiralogicPhase: 'seeking',
      voiceModulation: this.createFallbackVoiceParams()
    };
  }

  private createFallbackVoiceParams(): VoiceModulationParams {
    return {
      stability: 0.8,
      similarity: 0.8,
      style: 0.2,
      speakerBoost: true,
      emotionalTone: {
        warmth: 0.6,
        energy: 0.5,
        pace: 0.5,
        depth: 0.5
      }
    };
  }
}

// Export convenience function for integration
export async function processVoiceWithConsciousness(
  userInput: string,
  audioMetadata?: any,
  sessionContext?: any
): Promise<{
  consciousnessState: VoiceConsciousnessState;
  processor: MayaMicropsiIntegration;
}> {
  const processor = new MayaMicropsiIntegration();
  const consciousnessState = await processor.processVoiceConsciousness(
    userInput,
    audioMetadata,
    sessionContext
  );

  return { consciousnessState, processor };
}