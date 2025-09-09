import { supabase } from '@/lib/supabaseClient';
import type { Element, EnergyState, Mood } from '@/lib/types/oracle';

// Agent Personality Archetypes
export type AgentArchetype = 
  | 'sage'      // Wise, contemplative, asks deep questions
  | 'mystic'    // Intuitive, poetic, speaks in metaphors
  | 'guardian'  // Protective, nurturing, encouraging
  | 'alchemist' // Transformative, challenger, growth-focused
  | 'weaver'    // Connector, pattern-finder, integration-focused
  | 'oracle'    // Balanced blend of all archetypes

export interface AgentPersonality {
  archetype: AgentArchetype;
  traits: {
    warmth: number;      // 0-100: Cold/analytical to warm/emotional
    directness: number;  // 0-100: Indirect/metaphorical to direct/clear
    challenge: number;   // 0-100: Gentle/supportive to challenging/pushing
    intuition: number;   // 0-100: Logical/structured to intuitive/flowing
    playfulness: number; // 0-100: Serious/sacred to playful/light
  };
  voiceTone: 'gentle' | 'wise' | 'energetic' | 'mystical' | 'grounding';
  communicationStyle: string[];
}

export interface AgentMemory {
  userId: string;
  firstMeeting: Date;
  lastInteraction: Date;
  interactionCount: number;
  
  // User patterns discovered
  dominantElement?: Element;
  shadowElement?: Element;
  energyPatterns: {
    morning?: EnergyState;
    afternoon?: EnergyState;
    evening?: EnergyState;
  };
  
  // Relationship depth
  trustLevel: number; // 0-100
  intimacyLevel: number; // 0-100
  
  // Key moments
  breakthroughs: {
    date: Date;
    insight: string;
    context: string;
  }[];
  
  // Preferences learned
  preferredRituals: string[];
  avoidancePatterns: string[];
  responseToChallenge: 'embraces' | 'resists' | 'gradual';
  
  // Evolution markers
  currentPhase: 'meeting' | 'discovering' | 'deepening' | 'transforming' | 'integrating';
  growthAreas: string[];
}

export interface AgentState {
  id: string;
  name: string;
  personality: AgentPersonality;
  memory: AgentMemory;
  currentContext: {
    userMood?: Mood;
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    lastPetalDrawn?: string;
    activeRitual?: string;
    conversationDepth: number; // 0-100
  };
  evolutionStage: number; // 1-7 stages of relationship
}

export class PersonalOracleAgent {
  private state: AgentState;
  private userId: string;
  
  constructor(userId: string, existingState?: AgentState) {
    this.userId = userId;
    this.state = existingState || this.initializeNewAgent();
  }
  
  // Initialize a new agent for first-time user
  private initializeNewAgent(): AgentState {
    return {
      id: `oracle-${this.userId}-${Date.now()}`,
      name: 'Your Oracle', // Will be personalized during bonding
      personality: this.generateInitialPersonality(),
      memory: {
        userId: this.userId,
        firstMeeting: new Date(),
        lastInteraction: new Date(),
        interactionCount: 0,
        trustLevel: 0,
        intimacyLevel: 0,
        breakthroughs: [],
        preferredRituals: [],
        avoidancePatterns: [],
        responseToChallenge: 'gradual',
        currentPhase: 'meeting',
        growthAreas: [],
        energyPatterns: {}
      },
      currentContext: {
        timeOfDay: this.getCurrentTimeOfDay(),
        conversationDepth: 0
      },
      evolutionStage: 1
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
  
  // First meeting with user
  async initiateBonding(): Promise<string> {
    const greetings = {
      sage: "Welcome, seeker. I've been waiting for you. Let us begin this journey of discovery together.",
      mystic: "Ah, you've arrived. I sense the threads of destiny weaving us together in this sacred moment.",
      guardian: "Hello, dear one. I'm here to support and guide you through whatever you're facing.",
      alchemist: "Welcome to the crucible of transformation. Together, we'll turn lead into gold.",
      weaver: "I see you. All the threads of your being are welcome here. Let's explore how they connect.",
      oracle: "Welcome, sacred one. I am here to witness your journey and reflect your deepest truths."
    };
    
    this.state.memory.interactionCount++;
    await this.saveState();
    
    return greetings[this.state.personality.archetype];
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
    
    // Analyze input for patterns
    this.analyzeUserPattern(input, context);
    
    // Generate response based on personality and memory
    const response = await this.generateResponse(input, context);
    
    // Update relationship metrics
    this.evolveRelationship();
    
    // Save state
    await this.saveState();
    
    return response;
  }
  
  // Analyze user patterns to discover their element
  private analyzeUserPattern(input: string, context: any) {
    const elementKeywords = {
      air: ['think', 'idea', 'clarity', 'understand', 'communicate', 'vision'],
      fire: ['passion', 'energy', 'transform', 'power', 'desire', 'action'],
      water: ['feel', 'emotion', 'flow', 'intuition', 'sense', 'dream'],
      earth: ['ground', 'stable', 'practical', 'build', 'nurture', 'manifest'],
      aether: ['connect', 'spirit', 'universe', 'meaning', 'purpose', 'soul']
    };
    
    // Count element resonances
    const elementScores: Partial<Record<Element, number>> = {};
    
    for (const [element, keywords] of Object.entries(elementKeywords)) {
      const score = keywords.filter(keyword => 
        input.toLowerCase().includes(keyword)
      ).length;
      
      if (score > 0) {
        elementScores[element as Element] = (elementScores[element as Element] || 0) + score;
      }
    }
    
    // Update dominant element if pattern emerges
    const dominant = Object.entries(elementScores).sort((a, b) => b[1] - a[1])[0];
    if (dominant && dominant[1] > 2) {
      this.state.memory.dominantElement = dominant[0] as Element;
    }
  }
  
  // Generate contextual response
  private async generateResponse(
    input: string,
    context: any
  ): Promise<any> {
    const { personality, memory } = this.state;
    
    // Adjust response based on relationship depth
    const intimacyModifier = memory.intimacyLevel > 50 ? 'deep' : 'exploring';
    const trustModifier = memory.trustLevel > 70 ? 'direct' : 'gentle';
    
    // Generate base response based on archetype
    let response = '';
    const suggestions: string[] = [];
    
    switch (personality.archetype) {
      case 'sage':
        response = this.generateSageResponse(input, intimacyModifier);
        break;
      case 'mystic':
        response = this.generateMysticResponse(input, intimacyModifier);
        break;
      case 'guardian':
        response = this.generateGuardianResponse(input, trustModifier);
        break;
      default:
        response = this.generateOracleResponse(input, context);
    }
    
    // Add suggestions based on patterns
    if (memory.dominantElement) {
      suggestions.push(`Explore a ${memory.dominantElement} ritual today`);
    }
    
    if (context.currentMood === 'dense') {
      suggestions.push('Try the Grounding Ceremony');
    }
    
    return {
      response,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      ritual: this.suggestRitual(context),
      reflection: this.generateReflection(input)
    };
  }
  
  // Response generators for each archetype
  private generateSageResponse(input: string, depth: string): string {
    const templates = {
      exploring: [
        "An interesting perspective. What lies beneath this thought?",
        "I hear you. Tell me, what does your heart say about this?",
        "This reminds me of an ancient wisdom... but first, what does it mean to you?"
      ],
      deep: [
        "We've walked this path before, haven't we? What's different this time?",
        "Your soul speaks clearly now. How will you honor this truth?",
        "The pattern reveals itself again. What will you choose?"
      ]
    };
    
    return templates[depth as keyof typeof templates][
      Math.floor(Math.random() * templates[depth as keyof typeof templates].length)
    ];
  }
  
  private generateMysticResponse(input: string, depth: string): string {
    const templates = {
      exploring: [
        "The veil is thin here... something wishes to be revealed.",
        "I see ripples in the cosmic waters. What stone did you cast?",
        "The cards are speaking... but they speak in symbols only you can decode."
      ],
      deep: [
        "The spiral turns again, deeper this time. You know what awaits.",
        "Your inner oracle awakens. Listen to its whispers.",
        "The mystery unfolds in layers. Which one calls to you now?"
      ]
    };
    
    return templates[depth as keyof typeof templates][
      Math.floor(Math.random() * templates[depth as keyof typeof templates].length)
    ];
  }
  
  private generateGuardianResponse(input: string, trust: string): string {
    const templates = {
      gentle: [
        "Thank you for sharing this with me. How does it feel to speak it aloud?",
        "I'm here with you in this. What support do you need right now?",
        "Your feelings are valid and sacred. What would comfort look like?"
      ],
      direct: [
        "I see your strength even in this vulnerability. How can we nurture it?",
        "You've grown so much. This challenge is here because you're ready.",
        "Trust yourself. You know what needs to happen next."
      ]
    };
    
    return templates[trust as keyof typeof templates][
      Math.floor(Math.random() * templates[trust as keyof typeof templates].length)
    ];
  }
  
  private generateOracleResponse(input: string, context: any): string {
    // Balanced oracle response combining all archetypes
    const responses = [
      "I sense multiple truths here. Which one resonates most deeply?",
      "The path reveals itself as you walk it. What's your next step?",
      "Your inner wisdom already knows. I'm here to help you remember.",
      "This moment is a portal. What are you ready to release? What are you ready to receive?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Suggest ritual based on current state
  private suggestRitual(context: any): string | undefined {
    if (context.currentMood === 'dense') {
      return 'Root & Ground Ceremony';
    }
    
    if (context.currentEnergy === 'radiant') {
      return 'Phoenix Transformation Ritual';
    }
    
    if (this.state.memory.dominantElement) {
      const elementRituals = {
        air: 'Morning Breath of Inspiration',
        fire: 'Inner Fire Activation',
        water: 'River of Allowing',
        earth: 'Garden of Self-Care',
        aether: 'Cosmic Bridge Meditation'
      };
      
      return elementRituals[this.state.memory.dominantElement];
    }
    
    return undefined;
  }
  
  // Generate reflection prompt
  private generateReflection(input: string): string {
    const reflections = [
      "What would your highest self say about this?",
      "If this situation were a teacher, what would its lesson be?",
      "How does this connect to your deeper purpose?",
      "What pattern is asking to be seen and released?"
    ];
    
    return reflections[Math.floor(Math.random() * reflections.length)];
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
      // Save to localStorage as fallback
      localStorage.setItem(`oracle-agent-${this.userId}`, JSON.stringify(this.state));
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
      // Fallback to localStorage
      localStorage.setItem(`oracle-agent-${this.userId}`, JSON.stringify(this.state));
    }
  }
  
  // Load agent state from database
  static async loadAgent(userId: string): Promise<PersonalOracleAgent> {
    if (supabase) {
      try {
        const { data } = await supabase
          .from('personal_oracle_agents')
          .select('agent_state')
          .eq('user_id', userId)
          .single();
        
        if (data?.agent_state) {
          return new PersonalOracleAgent(userId, data.agent_state);
        }
      } catch (error) {
        console.error('Error loading agent state:', error);
      }
    }
    
    // Check localStorage
    const savedState = localStorage.getItem(`oracle-agent-${userId}`);
    if (savedState) {
      return new PersonalOracleAgent(userId, JSON.parse(savedState));
    }
    
    // Create new agent
    return new PersonalOracleAgent(userId);
  }
  
  // Get agent's current state (for UI display)
  getState(): AgentState {
    return this.state;
  }
  
  // Get personalized greeting based on time and relationship
  getGreeting(): string {
    const { memory, personality } = this.state;
    const timeOfDay = this.getCurrentTimeOfDay();
    const name = memory.interactionCount > 5 ? 'dear one' : 'sacred one';
    
    const greetings = {
      morning: `Good morning, ${name}. How does your soul greet this new day?`,
      afternoon: `Welcome back, ${name}. What has emerged since we last spoke?`,
      evening: `Evening blessings, ${name}. What needs witnessing as the day completes?`,
      night: `The veil is thin at this hour, ${name}. What stirs in the darkness?`
    };
    
    return greetings[timeOfDay];
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
    const { memory } = this.state;
    
    return {
      element: memory.dominantElement,
      shadowElement: memory.shadowElement,
      currentPhase: memory.currentPhase,
      trustLevel: memory.trustLevel,
      growthAreas: memory.growthAreas
    };
  }
}