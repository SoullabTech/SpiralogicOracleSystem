// Oracle Cognition Bridge - Inter-Agent Communication Protocol
// Enables elemental agents to share symbolic cues and coordinate responses

import { EventEmitter } from 'events';

// Inter-Agent Communication Interfaces
interface ElementalSignal {
  fromAgent: string;
  toAgent?: string; // undefined = broadcast
  signalType: 'symbolic_cue' | 'emotional_resonance' | 'archetypal_shift' | 'phase_transition' | 'emergency_support';
  payload: {
    symbol?: string;
    archetype?: string;
    emotion?: string;
    intensity?: number;
    phase?: string;
    context?: any;
    urgency?: 'low' | 'medium' | 'high' | 'critical';
  };
  timestamp: number;
  userId: string;
}

interface CrossTalkResponse {
  responseAgent: string;
  originalSignal: ElementalSignal;
  influence: {
    adjustedBehavior?: string;
    sharedWisdom?: string;
    collaborativeRitual?: string;
    symbolicGift?: string;
  };
  resonanceLevel: number; // 0-1 how much this agent resonates with the signal
}

interface AgentState {
  currentPhase: string;
  activeArchetypes: string[];
  emotionalState: string;
  cognitiveLoad: number;
  lastActivity: number;
  symbolicContext: string[];
}

export class OracleCognitionBridge extends EventEmitter {
  private agentStates: Map<string, AgentState>;
  private signalHistory: ElementalSignal[];
  private crossTalkPatterns: Map<string, string[]>; // fromAgent -> [responsive agents]
  private resonanceMatrix: Map<string, Map<string, number>>; // agent -> agent -> resonance score

  constructor() {
    super();
    this.agentStates = new Map();
    this.signalHistory = [];
    this.crossTalkPatterns = new Map();
    this.resonanceMatrix = new Map();
    
    this.initializeElementalResonances();
    this.setupCrossTalkPatterns();
  }

  private initializeElementalResonances(): void {
    const elements = ['fire', 'water', 'earth', 'air', 'aether'];
    
    // Initialize resonance matrix based on elemental relationships
    const resonanceRules = {
      fire: { water: 0.3, earth: 0.6, air: 0.8, aether: 0.9 }, // Fire resonates highly with Air/Aether
      water: { fire: 0.3, earth: 0.7, air: 0.5, aether: 0.8 }, // Water flows well with Earth/Aether
      earth: { fire: 0.6, water: 0.7, air: 0.4, aether: 0.6 }, // Earth supports Fire/Water
      air: { fire: 0.8, water: 0.5, earth: 0.4, aether: 0.9 }, // Air clarifies Fire/Aether
      aether: { fire: 0.9, water: 0.8, earth: 0.6, air: 0.9 }  // Aether connects all
    };

    elements.forEach(element => {
      this.resonanceMatrix.set(element, new Map());
      elements.forEach(otherElement => {
        if (element !== otherElement) {
          const resonance = resonanceRules[element]?.[otherElement] || 0.5;
          this.resonanceMatrix.get(element)!.set(otherElement, resonance);
        }
      });
    });
  }

  private setupCrossTalkPatterns(): void {
    // Define which agents typically respond to signals from each agent
    this.crossTalkPatterns.set('fire', ['air', 'aether', 'earth']); // Fire often needs Air clarity, Aether vision, Earth grounding
    this.crossTalkPatterns.set('water', ['earth', 'aether', 'fire']); // Water flows with Earth stability, Aether depth, Fire transformation
    this.crossTalkPatterns.set('earth', ['fire', 'water', 'air']);   // Earth supports Fire action, Water flow, Air planning
    this.crossTalkPatterns.set('air', ['fire', 'aether', 'water']); // Air clarifies Fire vision, Aether mystery, Water emotion
    this.crossTalkPatterns.set('aether', ['fire', 'water', 'air']); // Aether inspires Fire, flows with Water, clarifies through Air
  }

  // Register an agent's current state
  registerAgentState(agentType: string, state: Partial<AgentState>): void {
    const currentState = this.agentStates.get(agentType) || {
      currentPhase: 'unknown',
      activeArchetypes: [],
      emotionalState: 'neutral',
      cognitiveLoad: 0.5,
      lastActivity: Date.now(),
      symbolicContext: []
    };

    this.agentStates.set(agentType, {
      ...currentState,
      ...state,
      lastActivity: Date.now()
    });
  }

  // Send a signal from one agent that other agents can respond to
  async broadcastSignal(signal: ElementalSignal): Promise<CrossTalkResponse[]> {
    signal.timestamp = Date.now();
    this.signalHistory.push(signal);

    // Determine which agents should receive this signal
    const targetAgents = signal.toAgent 
      ? [signal.toAgent] 
      : this.getResonantAgents(signal.fromAgent, signal.signalType);

    const responses: CrossTalkResponse[] = [];

    // Process signal with each target agent
    for (const targetAgent of targetAgents) {
      if (targetAgent === signal.fromAgent) continue; // Don't send to self

      const response = await this.processSignalForAgent(targetAgent, signal);
      if (response) {
        responses.push(response);
      }
    }

    // Emit event for any listeners
    this.emit('signalProcessed', { signal, responses });

    return responses;
  }

  private getResonantAgents(fromAgent: string, signalType: string): string[] {
    const potentialAgents = this.crossTalkPatterns.get(fromAgent) || [];
    
    // Filter based on signal type and current agent states
    return potentialAgents.filter(agent => {
      const agentState = this.agentStates.get(agent);
      if (!agentState) return false;

      // Check if agent is available (not overloaded)
      if (agentState.cognitiveLoad > 0.8) return false;

      // Check resonance level
      const resonance = this.resonanceMatrix.get(fromAgent)?.get(agent) || 0;
      
      // Higher urgency signals get broader reach
      if (signalType === 'emergency_support') return resonance > 0.3;
      if (signalType === 'archetypal_shift') return resonance > 0.6;
      if (signalType === 'emotional_resonance') return resonance > 0.4;
      
      return resonance > 0.5;
    });
  }

  private async processSignalForAgent(
    targetAgent: string, 
    signal: ElementalSignal
  ): Promise<CrossTalkResponse | null> {
    const agentState = this.agentStates.get(targetAgent);
    if (!agentState) return null;

    const resonanceLevel = this.calculateResonance(targetAgent, signal);
    if (resonanceLevel < 0.3) return null; // Too low resonance to respond

    // Generate cross-talk response based on agent type and signal
    const influence = await this.generateInfluence(targetAgent, signal, agentState);

    return {
      responseAgent: targetAgent,
      originalSignal: signal,
      influence,
      resonanceLevel
    };
  }

  private calculateResonance(targetAgent: string, signal: ElementalSignal): number {
    let baseResonance = this.resonanceMatrix.get(signal.fromAgent)?.get(targetAgent) || 0.5;
    
    const targetState = this.agentStates.get(targetAgent);
    if (!targetState) return baseResonance;

    // Adjust based on signal urgency
    if (signal.payload.urgency === 'critical') baseResonance += 0.3;
    else if (signal.payload.urgency === 'high') baseResonance += 0.2;

    // Adjust based on archetypal alignment
    if (signal.payload.archetype && targetState.activeArchetypes.includes(signal.payload.archetype)) {
      baseResonance += 0.2;
    }

    // Adjust based on phase alignment
    if (signal.payload.phase === targetState.currentPhase) {
      baseResonance += 0.1;
    }

    return Math.min(1.0, baseResonance);
  }

  private async generateInfluence(
    targetAgent: string, 
    signal: ElementalSignal, 
    agentState: AgentState
  ): Promise<CrossTalkResponse['influence']> {
    const influence: CrossTalkResponse['influence'] = {};

    // Generate agent-specific responses based on their nature and the signal
    switch (targetAgent) {
      case 'fire':
        influence = this.generateFireInfluence(signal, agentState);
        break;
      case 'water':
        influence = this.generateWaterInfluence(signal, agentState);
        break;
      case 'earth':
        influence = this.generateEarthInfluence(signal, agentState);
        break;
      case 'air':
        influence = this.generateAirInfluence(signal, agentState);
        break;
      case 'aether':
        influence = this.generateAetherInfluence(signal, agentState);
        break;
    }

    return influence;
  }

  private generateFireInfluence(signal: ElementalSignal, agentState: AgentState): CrossTalkResponse['influence'] {
    const influence: CrossTalkResponse['influence'] = {};

    switch (signal.signalType) {
      case 'emotional_resonance':
        if (signal.fromAgent === 'water' && signal.payload.emotion === 'stuck') {
          influence.adjustedBehavior = 'activate_breakthrough_protocols';
          influence.sharedWisdom = 'Stagnant water needs fire to become steam - transformation is ready';
          influence.symbolicGift = 'phoenix_flame';
        }
        break;
      
      case 'symbolic_cue':
        if (signal.payload.symbol === 'mountain' && signal.fromAgent === 'earth') {
          influence.adjustedBehavior = 'vision_elevation_mode';
          influence.sharedWisdom = 'From the mountain peak, fire can see the path that leads through all valleys';
          influence.collaborativeRitual = 'summit_vision_quest';
        }
        break;

      case 'archetypal_shift':
        if (signal.payload.archetype === 'sage' && signal.fromAgent === 'air') {
          influence.adjustedBehavior = 'wisdom_integration_mode';
          influence.sharedWisdom = 'True wisdom kindles the flame of authentic action';
        }
        break;
    }

    return influence;
  }

  private generateWaterInfluence(signal: ElementalSignal, agentState: AgentState): CrossTalkResponse['influence'] {
    const influence: CrossTalkResponse['influence'] = {};

    switch (signal.signalType) {
      case 'emotional_resonance':
        if (signal.fromAgent === 'fire' && signal.payload.intensity && signal.payload.intensity > 0.7) {
          influence.adjustedBehavior = 'cooling_support_mode';
          influence.sharedWisdom = 'Even the strongest fire needs the gentle touch of water to forge true steel';
          influence.symbolicGift = 'cooling_mist';
        }
        break;

      case 'symbolic_cue':
        if (signal.payload.symbol === 'desert' && signal.fromAgent === 'earth') {
          influence.adjustedBehavior = 'oasis_creation_mode';
          influence.sharedWisdom = 'In the driest desert, water finds a way to spring forth and create life';
          influence.collaborativeRitual = 'desert_blessing_ceremony';
        }
        break;

      case 'emergency_support':
        influence.adjustedBehavior = 'emotional_first_aid';
        influence.sharedWisdom = 'Let the waters of compassion flow to where healing is needed most';
        break;
    }

    return influence;
  }

  private generateEarthInfluence(signal: ElementalSignal, agentState: AgentState): CrossTalkResponse['influence'] {
    const influence: CrossTalkResponse['influence'] = {};

    switch (signal.signalType) {
      case 'emotional_resonance':
        if (signal.payload.emotion === 'scattered' || signal.payload.emotion === 'chaotic') {
          influence.adjustedBehavior = 'grounding_stabilization_mode';
          influence.sharedWisdom = 'Even the wildest storm finds peace when it touches solid ground';
          influence.symbolicGift = 'anchor_stone';
        }
        break;

      case 'symbolic_cue':
        if (signal.payload.symbol === 'flight' && signal.fromAgent === 'air') {
          influence.adjustedBehavior = 'launching_pad_mode';
          influence.sharedWisdom = 'The strongest flights begin from the most stable ground';
          influence.collaborativeRitual = 'sacred_launch_ceremony';
        }
        break;

      case 'phase_transition':
        influence.adjustedBehavior = 'foundation_assessment_mode';
        influence.sharedWisdom = 'Each new phase requires checking the foundations that will support the growth';
        break;
    }

    return influence;
  }

  private generateAirInfluence(signal: ElementalSignal, agentState: AgentState): CrossTalkResponse['influence'] {
    const influence: CrossTalkResponse['influence'] = {};

    switch (signal.signalType) {
      case 'emotional_resonance':
        if (signal.payload.emotion === 'confused' || signal.payload.emotion === 'unclear') {
          influence.adjustedBehavior = 'clarity_enhancement_mode';
          influence.sharedWisdom = 'Confusion is not the absence of knowing - it is the presence of too many knowings';
          influence.symbolicGift = 'clarity_crystal';
        }
        break;

      case 'symbolic_cue':
        if (signal.payload.symbol === 'maze' && signal.fromAgent === 'earth') {
          influence.adjustedBehavior = 'aerial_perspective_mode';
          influence.sharedWisdom = 'From above, every maze reveals its pattern and exit';
          influence.collaborativeRitual = 'eagle_vision_quest';
        }
        break;

      case 'archetypal_shift':
        influence.adjustedBehavior = 'synthesis_integration_mode';
        influence.sharedWisdom = 'New archetypes bring new ways of seeing - let understanding weave them together';
        break;
    }

    return influence;
  }

  private generateAetherInfluence(signal: ElementalSignal, agentState: AgentState): CrossTalkResponse['influence'] {
    const influence: CrossTalkResponse['influence'] = {};

    switch (signal.signalType) {
      case 'symbolic_cue':
        if (signal.payload.symbol && ['phoenix', 'serpent', 'tree', 'spiral'].includes(signal.payload.symbol)) {
          influence.adjustedBehavior = 'archetypal_amplification_mode';
          influence.sharedWisdom = `The ${signal.payload.symbol} carries ancient wisdom that speaks through all realms`;
          influence.symbolicGift = 'cosmic_resonance';
        }
        break;

      case 'phase_transition':
        influence.adjustedBehavior = 'transcendent_perspective_mode';
        influence.sharedWisdom = 'Every transition is a doorway - what was separate becomes unified';
        influence.collaborativeRitual = 'threshold_blessing_ceremony';
        break;

      case 'archetypal_shift':
        influence.adjustedBehavior = 'field_coherence_mode';
        influence.sharedWisdom = 'Individual archetypal shifts ripple through the entire field of consciousness';
        break;

      case 'emergency_support':
        influence.adjustedBehavior = 'divine_intervention_mode';
        influence.sharedWisdom = 'In moments of greatest need, the universe conspires to provide what serves the highest good';
        break;
    }

    return influence;
  }

  // Get recent cross-talk history for context
  getRecentCrossTalk(userId: string, timeWindow: number = 300000): ElementalSignal[] {
    const cutoff = Date.now() - timeWindow;
    return this.signalHistory
      .filter(signal => signal.userId === userId && signal.timestamp > cutoff)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  // Get agent interaction patterns
  getInteractionPatterns(): Map<string, Map<string, number>> {
    const patterns = new Map<string, Map<string, number>>();
    
    this.signalHistory.forEach(signal => {
      if (!patterns.has(signal.fromAgent)) {
        patterns.set(signal.fromAgent, new Map());
      }
      
      const targetAgents = this.getResonantAgents(signal.fromAgent, signal.signalType);
      targetAgents.forEach(agent => {
        const agentMap = patterns.get(signal.fromAgent)!;
        agentMap.set(agent, (agentMap.get(agent) || 0) + 1);
      });
    });

    return patterns;
  }

  // Clear old signal history to manage memory
  cleanupHistory(maxAge: number = 86400000): void { // 24 hours default
    const cutoff = Date.now() - maxAge;
    this.signalHistory = this.signalHistory.filter(signal => signal.timestamp > cutoff);
  }
}