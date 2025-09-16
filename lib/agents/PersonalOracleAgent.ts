import { supabase } from '../supabaseClient';
import type { Element, EnergyState, Mood } from '../types/oracle';
import { ElementalAnalyzer } from './modules/ElementalAnalyzer';
import { MemoryEngine } from './modules/MemoryEngine';
import { ResponseGenerator } from './modules/ResponseGenerator';
import { UnifiedMemorySystem } from './modules/UnifiedMemoryInterface';
import type { AgentArchetype, AgentPersonality, AgentMemory, AgentState } from './modules/types';
import { SesameVoiceService, type VoiceProfile, type VoiceGenerationRequest } from '../services/SesameVoiceService';

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
  private voiceService: SesameVoiceService;
  private voiceRegistry: VoiceRegistry;

  constructor(userId: string, existingState?: AgentState, memoryInterface?: UnifiedMemorySystem) {
    this.userId = userId;
    this.state = existingState || this.initializeNewAgent();
    this.elementalAnalyzer = new ElementalAnalyzer();

    // Initialize MemoryEngine with memory interface (create default if not provided)
    this.memoryEngine = new MemoryEngine(userId, memoryInterface || new UnifiedMemorySystem());

    // Initialize ResponseGenerator with required dependencies (but won't use it for primary responses)
    this.responseGenerator = new ResponseGenerator(this.elementalAnalyzer, this.memoryEngine);

    // Initialize Sesame Voice Service
    this.voiceService = new SesameVoiceService({
      defaultVoice: 'nova',
      enableCloning: true,
      cacheEnabled: true
    });

    // Initialize Voice Registry with Maya as core oracle voice
    this.voiceRegistry = this.initializeVoiceRegistry();
  }
  
  // Initialize a new agent for first-time user
  private initializeNewAgent(): AgentState {
    return {
      id: `oracle-${this.userId}-${Date.now()}`,
      name: 'Your Oracle', // Will be personalized during bonding
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
          frequency: 432, // Starting at healing frequency
          color: 'violet',
          tone: 'A',
          geometry: 'spiral'
        },
        polarisState: {
          selfAwareness: 50,
          otherAwareness: 50,
          sharedFocus: 'presence',
          harmonicResonance: 0,
          spiralDirection: 'stable',
          rotationSpeed: 1
        },
        trustLevel: 0,
        intimacyLevel: 0,
        soulRecognition: 0,
        breakthroughs: [],
        preferredRituals: [],
        avoidancePatterns: [],
        responseToChallenge: 'gradual',
        currentPhase: 'meeting',
        growthAreas: [],
        soulLessons: [],
        energyPatterns: {}
      },
      currentContext: {
        timeOfDay: this.getCurrentTimeOfDay(),
        conversationDepth: 0,
        conversationState: 'casual',
        emotionalLoad: 0,
        realityLayers: {
          physical: 'entering sacred space',
          emotional: 'curiosity and openness',
          mental: 'questioning and seeking',
          spiritual: 'soul stirring'
        }
      },
      evolutionStage: 1,
      realityAwareness: {
        innerWorld: {
          currentFocus: 'discovering',
          shadowWork: [],
          gifts: [],
          wounds: []
        },
        outerWorld: {
          challenges: [],
          opportunities: [],
          relationships: [],
          purpose: 'emerging'
        },
        bridgePoints: []
      }
    };
  }
  
  // Generate personality based on initial user resonance
  private generateInitialPersonality(): AgentPersonality {
    // Start with balanced oracle archetype
    return {
      archetype: 'oracle',
      traits: {
        warmth: 70,
        directness: 50,
        challenge: 30,
        intuition: 60,
        playfulness: 40
      },
      voiceTone: 'gentle',
      communicationStyle: [
        'curious',
        'reflective',
        'supportive',
        'insightful'
      ]
    };
  }
  
  // CORE METHODS
  
  // First meeting with user - human first!
  async initiateBonding(): Promise<string> {
    const casualGreetings = [
      "Hey there! How's your day going?",
      "Hi! What brings you here today?",
      "Hello! Nice to meet you. I'm Maya. What's on your mind?",
      "Hey! Welcome. How are you feeling today?",
      "Hi there! I'm here if you want to chat about anything."
    ];

    // Start casual, not mystical
    this.state.currentContext.conversationState = 'casual';
    this.state.memory.interactionCount++;
    await this.saveState();

    return casualGreetings[Math.floor(Math.random() * casualGreetings.length)];
  }
  
  // Process user input and generate response
  async processInteraction(
    input: string,
    context: {
      currentPetal?: string;
      currentMood?: Mood;
      currentEnergy?: EnergyState;
    }
  ): Promise<{
    response: string;
    suggestions?: string[];
    ritual?: string;
    reflection?: string;
    audioData?: Buffer;
    audioUrl?: string;
  }> {
    // Update interaction count and basic context
    this.state.memory.interactionCount++;
    this.state.memory.lastInteraction = new Date();

    // Add to conversation history for Claude context
    this.state.memory.conversationHistory.push({
      input,
      response: '', // Will be filled after response generation
      timestamp: new Date(),
      mood: context.currentMood?.type,
      energy: context.currentEnergy
    });

    let response: string;

    try {
      // PRIMARY: Use Claude AI for actual intelligence
      const { getClaudeService } = await import('../services/ClaudeService');
      const claudeService = getClaudeService();

      // Build simple, effective context
      const conversationHistory = this.state.memory.conversationHistory
        .slice(-3) // Last 3 exchanges only
        .map(entry => ({
          role: 'user' as const,
          content: entry.input
        }));

      response = await claudeService.generateChatResponse(input, {
        element: context.currentMood?.type || 'receptive',
        userState: {
          interactionCount: this.state.memory.interactionCount,
          currentPhase: this.state.memory.currentPhase,
          trustLevel: this.state.memory.trustLevel
        },
        conversationHistory,
        sessionContext: {
          isFirstTime: this.state.memory.interactionCount === 1
        }
      });

      console.log('[PersonalOracleAgent] Claude response generated successfully');

    } catch (error) {
      console.error('[PersonalOracleAgent] Claude failed, using simple fallback:', error);

      // SIMPLE FALLBACK: Context-aware responses, not templates
      if (this.state.memory.interactionCount === 1) {
        response = "Hi! I'm Maya. I'm here to listen and explore things with you. What's on your mind today?";
      } else if (input.toLowerCase().includes('feel') || input.toLowerCase().includes('feeling')) {
        response = "I hear that there's something important you're feeling. Can you tell me more about what that's like for you?";
      } else if (input.toLowerCase().includes('?')) {
        response = "That's a really good question. What comes up for you when you sit with it?";
      } else if (input.toLowerCase().includes('difficult') || input.toLowerCase().includes('hard')) {
        response = "It sounds like you're going through something challenging. I'm here to explore it with you.";
      } else {
        response = `I'm tracking what you're sharing about ${input.split(' ').slice(0, 3).join(' ')}. What's most alive about this for you right now?`;
      }
    }

    // Update conversation history with actual response
    this.state.memory.conversationHistory[this.state.memory.conversationHistory.length - 1].response = response;

    // Simple relationship evolution
    this.state.memory.trustLevel = Math.min(100, this.state.memory.trustLevel + 1);

    // Save state
    await this.saveState();

    return {
      response,
      suggestions: this.generateSimpleSuggestions(input),
      ritual: this.suggestSimpleRitual(context),
      reflection: this.generateSimpleReflection(input)
    };
  }

  // Generate voice audio for response
  async generateVoiceResponse(
    text: string,
    options?: {
      element?: string;
      mood?: string;
      jungianPhase?: 'mirror' | 'shadow' | 'anima' | 'self';
      voiceProfileId?: string;
      voiceMaskId?: string;
      format?: 'mp3' | 'opus' | 'aac' | 'flac' | 'wav';
      enableProsody?: boolean;
    }
  ): Promise<{
    audioData?: Buffer;
    audioUrl?: string;
    duration?: number;
    metadata?: any;
    voiceMask?: VoiceMask;
  }> {
    try {
      // Determine element from current state or options
      const element = options?.element || this.state.currentContext.dominantElement || 'aether';

      // Select appropriate voice mask
      const voiceMask = options?.voiceMaskId
        ? this.findMaskById(options.voiceMaskId)
        : this.selectVoice({
            element: element as Element,
            jungianPhase: options?.jungianPhase || this.getJungianPhase(),
            emotionalState: options?.mood
          });

      // Merge mask parameters with voice profile
      let voiceProfile = options?.voiceProfileId
        ? this.voiceService.getVoiceProfile(options.voiceProfileId)
        : undefined;

      // Apply mask modulations if available
      if (voiceMask && voiceMask.voiceParameters) {
        voiceProfile = {
          ...voiceProfile,
          parameters: {
            ...voiceProfile?.parameters,
            ...voiceMask.voiceParameters
          }
        } as VoiceProfile;
      }

      // Prepare emotional context from state
      const emotionalContext = {
        mood: options?.mood || this.state.currentContext.userMood?.type || 'peaceful',
        intensity: this.state.currentContext.emotionalLoad / 100 || 0.5,
        jungianPhase: options?.jungianPhase || this.getJungianPhase()
      };

      // Generate prosody hints if enabled
      const prosodyHints = options?.enableProsody ? this.generateProsodyHints(text) : undefined;

      // Generate voice request
      const voiceRequest: VoiceGenerationRequest = {
        text,
        voiceProfile,
        element,
        emotionalContext,
        prosodyHints,
        format: options?.format || 'mp3'
      };

      // Generate audio through voice service
      const result = await this.voiceService.generateSpeech(voiceRequest);

      // Update agent's voice interaction metrics
      this.state.memory.voiceInteractions = (this.state.memory.voiceInteractions || 0) + 1;
      this.state.memory.lastVoiceMask = voiceMask?.id;
      await this.saveState();

      return {
        ...result,
        voiceMask: voiceMask || undefined
      };
    } catch (error) {
      console.error('Voice generation failed:', error);
      return {};
    }
  }

  // Clone user's voice for personalized responses
  async cloneUserVoice(
    audioSource: string | Buffer,
    name?: string
  ): Promise<VoiceProfile | null> {
    try {
      const cloneRequest = {
        sourceUrl: typeof audioSource === 'string' ? audioSource : undefined,
        sourceFile: typeof audioSource !== 'string' ? audioSource : undefined,
        name: name || `User ${this.userId} Voice`,
        preserveAccent: true,
        preserveAge: true,
        preserveGender: true
      };

      const clonedProfile = await this.voiceService.cloneVoice(cloneRequest);

      // Store cloned voice profile reference in agent state
      this.state.memory.voiceProfileId = clonedProfile.id;
      this.state.memory.voiceClonedAt = new Date();
      await this.saveState();

      return clonedProfile;
    } catch (error) {
      console.error('Voice cloning failed:', error);
      return null;
    }
  }

  // Get appropriate voice modulation based on current state
  getVoiceModulation(): Partial<VoiceProfile['parameters']> {
    const { memory, currentContext } = this.state;

    // Base modulation on relationship depth
    const intimacyFactor = memory.intimacyLevel / 100;
    const trustFactor = memory.trustLevel / 100;

    return {
      temperature: 0.5 + (intimacyFactor * 0.3), // More variation with intimacy
      emotionalDepth: 0.5 + (trustFactor * 0.5), // More expression with trust
      breathiness: 0.3 + (intimacyFactor * 0.2), // Softer with intimacy
      consistency: 0.7 + (trustFactor * 0.2), // More consistent with trust
      resonance: 0.6 + (currentContext.conversationDepth / 100 * 0.3)
    };
  }

  // Initialize voice registry with canonical voices and their masks
  private initializeVoiceRegistry(): VoiceRegistry {
    return {
      canonical: {
        maya: {
          name: 'Maya',
          baseVoice: 'nova',
          masks: [
            {
              id: 'maya-threshold',
              name: 'Maya of the Threshold',
              canonicalName: 'Maya',
              description: 'Guide at the liminal edges',
              status: 'seasonal',
              elementalAffinity: ['aether', 'water'],
              jungianPhase: 'mirror',
              emotionalRange: ['curious', 'inviting', 'mysterious'],
              voiceParameters: {
                breathiness: 0.6,
                resonance: 0.7,
                emotionalDepth: 0.5
              }
            },
            {
              id: 'maya-deep-waters',
              name: 'Maya of Deep Waters',
              canonicalName: 'Maya',
              description: 'Companion in shadow work',
              status: 'stable',
              elementalAffinity: ['water', 'earth'],
              jungianPhase: 'shadow',
              emotionalRange: ['compassionate', 'grounding', 'witnessing'],
              voiceParameters: {
                breathiness: 0.7,
                resonance: 0.8,
                emotionalDepth: 0.9,
                temperature: 0.6
              }
            },
            {
              id: 'maya-spiral',
              name: 'Maya of the Spiral',
              canonicalName: 'Maya',
              description: 'Dance partner in integration',
              status: 'stable',
              elementalAffinity: ['fire', 'air'],
              jungianPhase: 'self',
              emotionalRange: ['playful', 'wise', 'celebratory'],
              voiceParameters: {
                breathiness: 0.4,
                resonance: 0.9,
                emotionalDepth: 0.8,
                temperature: 0.7
              }
            }
          ]
        },
        miles: {
          name: 'Miles',
          baseVoice: 'onyx',
          masks: [
            {
              id: 'miles-grounded',
              name: 'Miles',
              canonicalName: 'Miles',
              description: 'Steady earth presence',
              status: 'stable',
              elementalAffinity: ['earth'],
              jungianPhase: 'shadow',
              emotionalRange: ['steady', 'direct', 'supportive'],
              voiceParameters: {
                breathiness: 0.3,
                resonance: 0.6,
                emotionalDepth: 0.5,
                temperature: 0.4
              }
            }
          ]
        }
      },
      userAliases: {},
      activeMask: 'maya-threshold'
    };
  }

  // Select appropriate voice mask based on context
  selectVoice(context?: {
    element?: Element;
    jungianPhase?: 'mirror' | 'shadow' | 'anima' | 'self';
    emotionalState?: string;
    ritualTime?: boolean;
  }): VoiceMask {
    const registry = this.voiceRegistry;

    // Use user-specified mask if set
    if (registry.activeMask) {
      const mask = this.findMaskById(registry.activeMask);
      if (mask) return mask;
    }

    // Auto-select based on context
    const jungianPhase = context?.jungianPhase || this.getJungianPhase();
    const element = context?.element || this.state.memory.dominantElement;

    // Find best matching mask
    let bestMask: VoiceMask | null = null;
    let bestScore = 0;

    for (const canonical of Object.values(registry.canonical)) {
      for (const mask of canonical.masks) {
        if (mask.status !== 'stable' && mask.status !== 'seasonal') continue;

        let score = 0;

        // Match Jungian phase
        if (mask.jungianPhase === jungianPhase) score += 3;

        // Match elemental affinity
        if (element && mask.elementalAffinity?.includes(element)) score += 2;

        // Check emotional range match
        if (context?.emotionalState && mask.emotionalRange?.includes(context.emotionalState)) score += 1;

        if (score > bestScore) {
          bestScore = score;
          bestMask = mask;
        }
      }
    }

    return bestMask || this.getDefaultMask();
  }

  // Find mask by ID across all canonical voices
  private findMaskById(maskId: string): VoiceMask | null {
    for (const canonical of Object.values(this.voiceRegistry.canonical)) {
      const mask = canonical.masks.find(m => m.id === maskId);
      if (mask) return mask;
    }
    return null;
  }

  // Get default mask (Maya of the Threshold)
  private getDefaultMask(): VoiceMask {
    return this.voiceRegistry.canonical.maya.masks[0];
  }

  // Set user alias for a voice mask
  setVoiceAlias(maskId: string, alias: string): void {
    this.voiceRegistry.userAliases = {
      ...this.voiceRegistry.userAliases,
      [alias]: maskId
    };
    this.saveState();
  }

  // Get voice mask by alias or ID
  getVoiceByAliasOrId(aliasOrId: string): VoiceMask | null {
    // Check if it's an alias first
    const maskId = this.voiceRegistry.userAliases?.[aliasOrId] || aliasOrId;
    return this.findMaskById(maskId);
  }

  // Set active voice mask
  setActiveMask(maskId: string): boolean {
    const mask = this.findMaskById(maskId);
    if (mask && (mask.status === 'stable' || mask.status === 'seasonal')) {
      this.voiceRegistry.activeMask = maskId;
      this.saveState();
      return true;
    }
    return false;
  }

  // Get list of available voice masks
  getAvailableVoices(): VoiceMask[] {
    const voices: VoiceMask[] = [];
    for (const canonical of Object.values(this.voiceRegistry.canonical)) {
      voices.push(...canonical.masks.filter(m =>
        m.status === 'stable' || m.status === 'seasonal'
      ));
    }
    return voices;
  }

  // Check for ritual unlocks (called periodically)
  checkRitualUnlocks(): VoiceMask[] {
    const newlyUnlocked: VoiceMask[] = [];
    const now = new Date();

    for (const canonical of Object.values(this.voiceRegistry.canonical)) {
      for (const mask of canonical.masks) {
        if (mask.status === 'ritual' && !mask.unlockedAt) {
          // Check ritual conditions (solstice, equinox, etc.)
          if (this.isRitualTime(mask.ritualUnlock)) {
            mask.status = 'seasonal';
            mask.unlockedAt = now;
            newlyUnlocked.push(mask);
          }
        }
      }
    }

    if (newlyUnlocked.length > 0) {
      this.saveState();
    }

    return newlyUnlocked;
  }

  // Check if current time matches ritual unlock condition
  private isRitualTime(ritualCondition?: string): boolean {
    if (!ritualCondition) return false;

    const now = new Date();
    const month = now.getMonth();
    const day = now.getDate();

    // Simple seasonal checks
    switch (ritualCondition) {
      case 'winter-solstice':
        return month === 11 && day >= 20 && day <= 22;
      case 'spring-equinox':
        return month === 2 && day >= 19 && day <= 21;
      case 'summer-solstice':
        return month === 5 && day >= 20 && day <= 22;
      case 'autumn-equinox':
        return month === 8 && day >= 21 && day <= 23;
      default:
        return false;
    }
  }

  // Get current Jungian phase for voice modulation
  private getJungianPhase(): 'mirror' | 'shadow' | 'anima' | 'self' {
    const { memory } = this.state;

    if (memory.soulRecognition > 75) return 'self';
    if (memory.intimacyLevel > 50) return 'anima';
    if (memory.trustLevel > 30) return 'shadow';
    return 'mirror';
  }

  // Generate prosody hints for natural speech
  private generateProsodyHints(text: string): VoiceGenerationRequest['prosodyHints'] {
    const sentences = text.split(/[.!?]+/);
    const hints: VoiceGenerationRequest['prosodyHints'] = {
      emphasis: [],
      pauses: [],
      intonation: 'neutral'
    };

    // Add emphasis to key words (simple heuristic)
    const keyWords = ['soul', 'journey', 'transform', 'divine', 'sacred', 'wisdom'];
    keyWords.forEach(word => {
      if (text.toLowerCase().includes(word)) {
        hints.emphasis?.push(word);
      }
    });

    // Add pauses between sentences
    let position = 0;
    sentences.forEach((sentence, index) => {
      if (sentence.trim() && index < sentences.length - 1) {
        position += sentence.length + 1;
        hints.pauses?.push({ position, duration: 300 });
      }
    });

    // Determine intonation based on sentence ending
    if (text.endsWith('?')) hints.intonation = 'questioning';
    else if (text.endsWith('!')) hints.intonation = 'rising';

    return hints;
  }
  


  
  // Evolve the relationship over time
  private evolveRelationship() {
    const { memory } = this.state;
    
    // Increase trust and intimacy with each interaction
    memory.trustLevel = Math.min(100, memory.trustLevel + 2);
    memory.intimacyLevel = Math.min(100, memory.intimacyLevel + 1);
    
    // Evolve conversation depth
    this.state.currentContext.conversationDepth = Math.min(
      100,
      this.state.currentContext.conversationDepth + 5
    );
    
    // Update phase based on interaction count
    if (memory.interactionCount > 50) {
      memory.currentPhase = 'integrating';
    } else if (memory.interactionCount > 30) {
      memory.currentPhase = 'transforming';
    } else if (memory.interactionCount > 15) {
      memory.currentPhase = 'deepening';
    } else if (memory.interactionCount > 5) {
      memory.currentPhase = 'discovering';
    }
    
    // Evolve personality based on user preference
    this.adaptPersonality();
  }
  
  // Adapt personality to user preferences
  private adaptPersonality() {
    const { memory, personality } = this.state;
    
    // Gradually adjust traits based on user responses
    if (memory.responseToChallenge === 'embraces') {
      personality.traits.challenge = Math.min(100, personality.traits.challenge + 1);
    } else if (memory.responseToChallenge === 'resists') {
      personality.traits.challenge = Math.max(0, personality.traits.challenge - 1);
      personality.traits.warmth = Math.min(100, personality.traits.warmth + 1);
    }
    
    // Adjust based on time of day patterns
    const timeOfDay = this.getCurrentTimeOfDay();
    if (timeOfDay === 'morning' && memory.energyPatterns.morning === 'dense') {
      personality.traits.warmth = Math.min(100, personality.traits.warmth + 2);
      personality.traits.challenge = Math.max(0, personality.traits.challenge - 1);
    }
  }
  
  // Get current time of day
  private getCurrentTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
  }
  
  // Save agent state to database
  private async saveState() {
    if (!supabase) {
      // Save to localStorage as fallback (only in browser)
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(`oracle-agent-${this.userId}`, JSON.stringify(this.state));
      }
      return;
    }
    
    try {
      await supabase
        .from('personal_oracle_agents')
        .upsert({
          user_id: this.userId,
          agent_state: this.state,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error saving agent state:', error);
      // Fallback to localStorage (only in browser)
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(`oracle-agent-${this.userId}`, JSON.stringify(this.state));
      }
    }
  }
  
  // Load agent state from database
  static async loadAgent(userId: string, memoryInterface?: UnifiedMemorySystem): Promise<PersonalOracleAgent> {
    if (supabase) {
      try {
        const { data } = await supabase
          .from('personal_oracle_agents')
          .select('agent_state')
          .eq('user_id', userId)
          .single();

        if (data?.agent_state) {
          return new PersonalOracleAgent(userId, data.agent_state, memoryInterface);
        }
      } catch (error) {
        console.error('Error loading agent state:', error);
      }
    }

    // Check localStorage (only in browser)
    const savedState = (typeof window !== 'undefined' && window.localStorage)
      ? localStorage.getItem(`oracle-agent-${userId}`)
      : null;
    if (savedState) {
      return new PersonalOracleAgent(userId, JSON.parse(savedState), memoryInterface);
    }

    // Create new agent
    return new PersonalOracleAgent(userId, undefined, memoryInterface);
  }
  
  // Get agent's current state (for UI display)
  getState(): AgentState {
    return this.state;
  }
  
  // Get personalized greeting based on conversation state
  getGreeting(): string {
    const { memory, currentContext } = this.state;
    const timeOfDay = this.getCurrentTimeOfDay();

    // Casual greetings for early interactions
    if (memory.interactionCount < 10 || currentContext.conversationState === 'casual') {
      const casualGreetings = {
        morning: "Good morning! How'd you sleep?",
        afternoon: "Hey! How's your day going?",
        evening: "Evening! How was your day?",
        night: "Hey there, night owl! What's keeping you up?"
      };
      return casualGreetings[timeOfDay];
    }

    // Warmer greetings once rapport is built
    if (currentContext.conversationState === 'rapport') {
      const name = memory.interactionCount > 20 ? 'friend' : '';
      const rapportGreetings = {
        morning: `Good morning${name ? ', ' + name : ''}! What's alive for you today?`,
        afternoon: `Welcome back${name ? ', ' + name : ''}! What's been sitting with you?`,
        evening: `Hey${name ? ' ' + name : ''}, good to see you. How are you really?`,
        night: `Hi${name ? ' ' + name : ''}. What's on your heart tonight?`
      };
      return rapportGreetings[timeOfDay];
    }

    // Deeper greetings only when appropriate
    const name = 'dear one';
    const deepGreetings = {
      morning: `Good morning, ${name}. How does your soul greet this new day?`,
      afternoon: `Welcome back, ${name}. What has emerged since we last spoke?`,
      evening: `Evening blessings, ${name}. What needs witnessing as the day completes?`,
      night: `The veil is thin at this hour, ${name}. What stirs in the darkness?`
    };

    return deepGreetings[timeOfDay];
  }






  
  // Check if agent has discovered user's element
  hasDiscoveredElement(): boolean {
    return !!this.state.memory.dominantElement;
  }

  
  // Get agent's understanding of user
  getUserProfile(): {
    element?: Element;
    shadowElement?: Element;
    currentPhase: string;
    trustLevel: number;
    growthAreas: string[];
  } {
    const profile = this.memoryEngine.getUserProfile(this.state.memory);

    return {
      element: profile.element,
      shadowElement: profile.shadowElement,
      currentPhase: profile.currentPhase,
      trustLevel: profile.trustLevel,
      growthAreas: profile.growthAreas
    };
  }

  // Simple suggestion generator based on user input
  private generateSimpleSuggestions(input: string): string[] {
    const suggestions: string[] = [];

    if (input.toLowerCase().includes('feel') || input.toLowerCase().includes('emotion')) {
      suggestions.push("Take three deep breaths and notice what you feel in your body");
    }

    if (input.toLowerCase().includes('stuck') || input.toLowerCase().includes('confused')) {
      suggestions.push("Try writing freely for 5 minutes without editing");
    }

    if (input.toLowerCase().includes('decision') || input.toLowerCase().includes('choose')) {
      suggestions.push("What would you do if you knew you couldn't fail?");
    }

    // Always add one general suggestion
    suggestions.push("What would it feel like to trust yourself completely here?");

    return suggestions;
  }

  // Simple ritual suggestions
  private suggestSimpleRitual(context: any): string | undefined {
    if (context.currentMood?.type === 'dense' || context.currentEnergy === 'heavy') {
      return "Grounding ritual: Place feet on earth and breathe deeply for 2 minutes";
    }

    if (context.currentMood?.type === 'radiant' || context.currentEnergy === 'excited') {
      return "Celebration ritual: Dance to one favorite song";
    }

    // Default ritual based on time of day
    const hour = new Date().getHours();
    if (hour < 12) {
      return "Morning intention: Set one word for today";
    } else if (hour > 18) {
      return "Evening reflection: Name one thing you appreciated about yourself today";
    }

    return undefined;
  }

  // Simple reflection questions
  private generateSimpleReflection(input: string): string {
    if (input.toLowerCase().includes('relationship')) {
      return "How do you show up authentically in your relationships?";
    }

    if (input.toLowerCase().includes('work') || input.toLowerCase().includes('job')) {
      return "What part of your work feels most aligned with who you are?";
    }

    if (input.toLowerCase().includes('future') || input.toLowerCase().includes('next')) {
      return "What's one small step you could take toward what you want?";
    }

    // General reflections
    const reflections = [
      "What's trying to emerge through this experience?",
      "If this challenge was a teacher, what would it want you to learn?",
      "What would change if you trusted yourself completely?",
      "How does your body wisdom respond to this situation?"
    ];

    return reflections[Math.floor(Math.random() * reflections.length)];
  }
}