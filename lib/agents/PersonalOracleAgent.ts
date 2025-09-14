import { supabase } from '@/lib/supabaseClient';
import type { Element, EnergyState, Mood } from '@/lib/types/oracle';
import { ElementalAnalyzer } from './modules/ElementalAnalyzer';
import { MemoryEngine } from './modules/MemoryEngine';
import { ResponseGenerator } from './modules/ResponseGenerator';
import { UnifiedMemorySystem } from './modules/UnifiedMemoryInterface';
import type { AgentArchetype, AgentPersonality, AgentMemory, AgentState } from './modules/types';


export class PersonalOracleAgent {
  private state: AgentState;
  private userId: string;
  private elementalAnalyzer: ElementalAnalyzer;
  private memoryEngine: MemoryEngine;
  private responseGenerator: ResponseGenerator;

  constructor(userId: string, existingState?: AgentState, memoryInterface?: UnifiedMemorySystem) {
    this.userId = userId;
    this.state = existingState || this.initializeNewAgent();
    this.elementalAnalyzer = new ElementalAnalyzer();

    // Initialize MemoryEngine with memory interface (create default if not provided)
    this.memoryEngine = new MemoryEngine(userId, memoryInterface || new UnifiedMemorySystem());

    // Initialize ResponseGenerator with required dependencies
    this.responseGenerator = new ResponseGenerator(this.elementalAnalyzer, this.memoryEngine);
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
  }> {
    // Update context
    this.state.currentContext = {
      ...this.state.currentContext,
      userMood: context.currentMood,
      lastPetalDrawn: context.currentPetal
    };
    
    // Analyze input for patterns using ElementalAnalyzer
    const elementalAnalysis = this.elementalAnalyzer.analyzeUserPattern(input, context, this.state.memory);
    
    // Generate response using ResponseGenerator
    const response = await this.responseGenerator.generateResponse(input, context, this.state);
    
    // Update relationship metrics
    this.evolveRelationship();
    
    // Save state
    await this.saveState();
    
    return response;
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

  
  
  
  
  
  
  
}