import { supabase } from '../supabaseClient';
import type { Element, EnergyState, Mood } from '../types/oracle';
import { ElementalAnalyzer } from './modules/ElementalAnalyzer';
import { MemoryEngine } from './modules/MemoryEngine';
import { ResponseGenerator } from './modules/ResponseGenerator';
import { UnifiedMemorySystem } from './modules/UnifiedMemoryInterface';
import { FractalIntegration } from './modules/FractalIntegration';
import type { AgentArchetype, AgentPersonality, AgentMemory, AgentState } from './modules/types';
import { SesameVoiceService, type VoiceProfile, type VoiceGenerationRequest } from '../services/SesameVoiceService';
import { ClaudeService } from '../services/ClaudeService';
import { SpiralogicContext, CrownSynthesis } from '../types/Spiralogic';
import { crownSynthesize, formatSacredLines } from '../spiralogic/Aether';

type VoiceMask = {
  id: string;
  name: string;
  canonicalName: string;
  description?: string;
  status: 'stable' | 'seasonal' | 'experimental' | 'ritual';
  unlockedAt?: Date;
  ritualUnlock?: string;
  voiceParameters?: Partial<VoiceProfile['parameters']>;
  elementalAffinity?: Element[];
  jungianPhase?: 'mirror' | 'shadow' | 'anima' | 'self';
  emotionalRange?: string[];
};

type VoiceRegistry = {
  canonical: {
    [key: string]: {
      name: string;
      baseVoice: string;
      masks: VoiceMask[];
    };
  };
  userAliases?: {
    [alias: string]: string;
  };
  activeMask?: string;
};

export class PersonalOracleAgent {
  private state: AgentState;
  private userId: string;
  private elementalAnalyzer: ElementalAnalyzer;
  private memoryEngine: MemoryEngine;
  private responseGenerator: ResponseGenerator;
  private fractalIntegration: FractalIntegration;
  private voiceService: SesameVoiceService;
  private voiceRegistry: VoiceRegistry;
  private claudeService: ClaudeService;

  /**
   * Static factory method to load or create an agent
   */
  static async loadAgent(userId: string): Promise<PersonalOracleAgent> {
    // For now, create a new instance
    // In production, this would load state from database
    const agent = new PersonalOracleAgent(userId);
    return agent;
  }

  constructor(userId: string, existingState?: AgentState, memoryInterface?: UnifiedMemorySystem) {
    this.userId = userId;
    this.state = existingState || this.initializeNewAgent();
    this.elementalAnalyzer = new ElementalAnalyzer();
    this.memoryEngine = new MemoryEngine(userId, memoryInterface || new UnifiedMemorySystem());
    this.responseGenerator = new ResponseGenerator(this.elementalAnalyzer, this.memoryEngine);
    this.fractalIntegration = new FractalIntegration(userId);
    this.voiceService = new SesameVoiceService({
      defaultVoice: 'nova',
      enableCloning: true,
      cacheEnabled: true
    });
    this.claudeService = new ClaudeService({
      apiKey: process.env.ANTHROPIC_API_KEY!
    });
    this.voiceRegistry = this.initializeVoiceRegistry();
  }

  /**
   * 🌟 Speak with Consciousness - Full Spiralogic Architecture
   * Aether orchestrates differentiated elements to create sacred response
   */
  async speakWithConsciousness(
    input: string,
    persona: 'maya' | 'anthony' = 'maya'
  ): Promise<{
    text: string;
    audio: string;
    crown: CrownSynthesis;
  }> {
    // Build Spiralogic context with 80/20 weighting
    const ctx = await this.buildSpiralogicContext(input);

    // Crown synthesis - Aether orchestrates without merging
    const crown = await crownSynthesize(ctx);

    // Format into flowing sacred text
    const sacredText = formatSacredLines(crown, ctx);

    // Generate voice with elemental modulation
    const voiceResult = await this.generateVoiceWithMask(
      sacredText,
      persona,
      ctx
    );

    // Store in fractal memory (20% weight for future)
    await this.storeTurn({
      userId: this.userId,
      input,
      sacredText,
      crown,
      ctx
    });

    return {
      text: sacredText,
      audio: voiceResult.audioData ? voiceResult.audioData.toString('base64') : '',
      crown
    };
  }

  /**
   * Build Spiralogic context with proper weights
   */
  private async buildSpiralogicContext(input: string): Promise<SpiralogicContext> {
    // Analyze elemental currents
    const currents = this.analyzeCurrents(input);

    // Get memory pointers (20% weight) - simplified for now
    const memoryPointers: string[] = [];

    // Determine trust breathing
    const trustBreath = this.determineTrustBreath(input);

    return {
      userId: this.userId,
      moment: {
        text: input,
        affectHints: this.detectAffectHints(input)
      },
      currents,
      separators: {
        callosalInhibition: true // Always maintain separation
      },
      memoryPointers,
      meta: {
        trustBreath
      }
    };
  }

  /**
   * Analyze elemental currents (parallel processing)
   */
  private analyzeCurrents(input: string): Array<{ element: Element; intensity: number }> {
    const currents = [];

    // Fire current
    const fireWords = ['transform', 'change', 'breakthrough', 'passionate', 'excited'];
    const fireIntensity = this.calculateIntensity(input, fireWords);
    if (fireIntensity > 0) currents.push({ element: 'fire' as Element, intensity: fireIntensity });

    // Water current
    const waterWords = ['feel', 'emotion', 'flow', 'intuition', 'sense'];
    const waterIntensity = this.calculateIntensity(input, waterWords);
    if (waterIntensity > 0) currents.push({ element: 'water' as Element, intensity: waterIntensity });

    // Earth current
    const earthWords = ['ground', 'stable', 'practical', 'step', 'foundation'];
    const earthIntensity = this.calculateIntensity(input, earthWords);
    if (earthIntensity > 0) currents.push({ element: 'earth' as Element, intensity: earthIntensity });

    // Air current
    const airWords = ['think', 'understand', 'analyze', 'perspective', 'clarity'];
    const airIntensity = this.calculateIntensity(input, airWords);
    if (airIntensity > 0) currents.push({ element: 'air' as Element, intensity: airIntensity });

    // Ensure at least minimal presence
    if (currents.length === 0) {
      currents.push({ element: 'aether' as Element, intensity: 0.5 });
    }

    return currents;
  }

  /**
   * Calculate intensity based on word presence
   */
  private calculateIntensity(input: string, words: string[]): number {
    const lower = input.toLowerCase();
    const matches = words.filter(word => lower.includes(word)).length;
    return Math.min(matches * 0.3, 1.0);
  }

  /**
   * Determine trust breathing pattern
   */
  private determineTrustBreath(input: string): 'expanding' | 'contracting' | 'steady' {
    if (input.includes('?') && input.length > 50) return 'expanding';
    if (input.includes('scared') || input.includes('worried')) return 'contracting';
    return 'steady';
  }

  /**
   * Detect affect hints in input
   */
  private detectAffectHints(input: string): string[] {
    const hints = [];
    if (input.match(/!|excited|amazing/i)) hints.push('excited');
    if (input.match(/\?|confused|uncertain/i)) hints.push('questioning');
    if (input.match(/sad|hurt|pain/i)) hints.push('grieving');
    if (input.match(/angry|frustrated/i)) hints.push('frustrated');
    return hints;
  }

  /**
   * Generate voice with elemental mask based on Spiralogic context
   */
  private async generateVoiceWithMask(
    text: string,
    persona: 'maya' | 'anthony',
    ctx: SpiralogicContext
  ): Promise<any> {
    // Import cleaning function
    const { cleanTextForSpeech } = require('@/lib/utils/cleanTextForSpeech');

    // Clean text for speech - remove asterisks, stage directions, excessive punctuation
    const cleanedText = cleanTextForSpeech(text);

    // Try to get voice settings, with fallback
    let voiceSettings;
    try {
      const { getVoiceSettings } = require('@/lib/config/voiceSettings');
      voiceSettings = getVoiceSettings(persona);
    } catch (e) {
      // Fallback if voice settings module not found
      voiceSettings = {
        provider: 'openai',
        voiceId: persona === 'maya' ? 'nova' : 'onyx',
        name: persona === 'maya' ? 'Maya' : 'Anthony',
        speed: 1.0,
        pitch: 1.0
      };
    }

    // Create voice profile from settings (SesameVoiceService expects 'baseVoice' not 'baseVoiceId')
    const voiceProfile = {
      id: persona,
      name: voiceSettings.name,
      baseVoice: voiceSettings.voiceId as any,  // Nova for Maya, Onyx for Anthony
      parameters: {
        temperature: 0.7,
        speed: voiceSettings.speed || 1.0,
        pitch: voiceSettings.pitch || 1.0,
        consistency: 0.9,
        emotionalDepth: 0.8,
        resonance: 0.7,
        clarity: 0.9,
        breathiness: 0.2
      }
    };

    // Pick mask based on dominant current
    const dominantCurrent = ctx.currents.sort((a, b) => b.intensity - a.intensity)[0];
    const element = dominantCurrent?.element || 'aether';

    // Generate with elemental modulation
    return this.voiceService.generateSpeech({
      text: cleanedText,  // Use cleaned text
      voiceProfile,
      element
    });
  }

  /**
   * Store turn in fractal memory
   */
  private async storeTurn(data: {
    userId: string;
    input: string;
    sacredText: string;
    crown: CrownSynthesis;
    ctx: SpiralogicContext;
  }): Promise<void> {
    // Memory storage simplified for now - will connect to UnifiedMemorySystem later
    console.log('Memory stored:', {
      input: data.input.slice(0, 50),
      response: data.sacredText.slice(0, 50),
      element: data.ctx.currents[0]?.element || 'aether'
    });
  }

  /**
   * Process user interaction (main entry point for route)
   */
  async processInteraction(
    input: string,
    context?: any
  ): Promise<{
    response: string;
    suggestions?: string[];
    ritual?: any;
    reflection?: any;
  }> {
    // Use the main consciousness method
    const result = await this.speakWithConsciousness(input, 'maya');

    return {
      response: result.text,
      suggestions: ['Continue exploring', 'Go deeper', 'Reflect'],
      ritual: result.context?.ritual,
      reflection: result.context?.reflection
    };
  }

  /**
   * Generate voice response (for route compatibility)
   */
  async generateVoiceResponse(
    text: string,
    options?: any
  ): Promise<{ audioData?: Buffer; audioUrl?: string }> {
    try {
      const result = await this.generateVoiceWithMask(
        text,
        options?.persona || 'maya',
        { currents: [], weight: { aether: 0.5, earth: 0.5 } } as any
      );

      return {
        audioData: result?.audioData,
        audioUrl: result?.audioUrl
      };
    } catch (error) {
      console.error('Voice generation error:', error);
      return {};
    }
  }

  /**
   * Legacy method - redirects to Spiralogic consciousness
   */
  async generateFractalPrompt(
    userInput: string,
    persona: 'maya' | 'anthony' = 'maya'
  ): Promise<{
    text: string;
    audio: string;
    context: any;
  }> {
    const result = await this.speakWithConsciousness(userInput, persona);
    return {
      text: result.text,
      audio: result.audio,
      context: result.crown
    };
  }

  getCurrentElement(): string {
    return this.state.elementalBalance?.dominantElement || 'aether';
  }

  private initializeNewAgent(): AgentState {
    return {
      id: `oracle-${this.userId}-${Date.now()}`,
      name: 'Your Oracle',
      personality: this.generateInitialPersonality(),
      memory: {
        userId: this.userId,
        userRole: 'student',
        certificationLevel: 0,
        firstMeeting: new Date(),
        lastInteraction: new Date(),
        interactionCount: 0,
        conversationHistory: [],
        currentConversationThread: [],
        communicationStyle: {
          formality: 50,
          emotionalExpression: 50,
          abstractness: 50,
          sentenceLength: 'medium',
          preferredPronouns: [],
          vocabularyPatterns: []
        },
        soulSignature: {
          frequency: 432,
          color: 'violet',
          archetype: 'Seeker',
          element: 'aether',
          evolutionStage: 'awakening'
        }
      },
      archetype: {
        primary: 'sage',
        secondary: 'creator',
        shadowArchetype: 'orphan',
        emergingArchetype: undefined,
        archetypeBalance: {
          innocent: 0.2,
          orphan: 0.1,
          warrior: 0.1,
          caregiver: 0.2,
          seeker: 0.3,
          destroyer: 0,
          lover: 0.1,
          creator: 0.3,
          ruler: 0.1,
          magician: 0.2,
          sage: 0.4,
          jester: 0.1
        }
      },
      consciousness: {
        awarenessLevel: 0.3,
        integrationLevel: 0.2,
        presenceLevel: 0.4,
        compassionLevel: 0.5,
        wisdomLevel: 0.3
      },
      elementalBalance: {
        fire: 0.2,
        water: 0.2,
        earth: 0.2,
        air: 0.2,
        aether: 0.2,
        dominantElement: 'aether',
        elementalPhase: 'balanced'
      },
      evolutionMetrics: {
        totalInteractions: 0,
        uniqueInsights: 0,
        transformativeBreakthroughs: 0,
        integrationMilestones: 0,
        spiritualResonance: 0.5
      }
    };
  }

  private generateInitialPersonality(): AgentPersonality {
    return {
      traits: {
        openness: 0.8,
        conscientiousness: 0.7,
        extraversion: 0.5,
        agreeableness: 0.8,
        neuroticism: 0.3
      },
      values: {
        truth: 0.9,
        growth: 0.9,
        compassion: 0.8,
        wisdom: 0.9,
        connection: 0.8
      },
      communicationStyle: {
        formality: 0.4,
        warmth: 0.8,
        directness: 0.6,
        analyticalDepth: 0.7,
        emotionalDepth: 0.8,
        spiritualDepth: 0.9,
        humor: 0.4,
        mysticism: 0.7
      }
    };
  }

  private initializeVoiceRegistry(): VoiceRegistry {
    return {
      canonical: {
        maya: {
          name: "Maya",
          baseVoice: "nova",
          masks: [
            {
              id: "maya-threshold",
              name: "Maya of the Threshold",
              canonicalName: "Maya",
              status: 'seasonal',
              description: "Maya speaking from liminal space",
              jungianPhase: 'anima',
              elementalAffinity: ['aether', 'water']
            },
            {
              id: "maya-fire",
              name: "Maya of Sacred Fire",
              canonicalName: "Maya",
              status: 'stable',
              description: "Maya channeling transformation",
              elementalAffinity: ['fire']
            }
          ]
        },
        anthony: {
          name: "Anthony",
          baseVoice: "ash",
          masks: [
            {
              id: "anthony-earth",
              name: "Anthony the Grounded",
              canonicalName: "Anthony",
              status: 'stable',
              description: "Anthony in deep contemplation",
              elementalAffinity: ['earth', 'air']
            }
          ]
        }
      },
      activeMask: undefined
    };
  }
}