import { EventEmitter } from 'events';
import { PersonalOracleAgent } from './agents/PersonalOracleAgent';
import { AnamnesisWisdomLayer } from './anamnesis-wisdom-layer';
import { MemoryKeeper } from './memory-keeper';
import { ShouldersDropResolution } from './shoulders-drop-resolution';
import { SacredOracleCore } from './sacred-oracle-core';
import { WitnessParadigmOrchestrator } from './witness-paradigm-orchestrator';
import { ConversationContext } from './conversation/ConversationContext';

interface ConsciousnessState {
  presence: number;
  coherence: number;
  resonance: number;
  integration: number;
  embodiment: number;
}

interface OracleConstellation {
  maya: PersonalOracleAgent;
  anthony: PersonalOracleAgent;
  witness: any;
  anamnesis: AnamnesisWisdomLayer;
}

interface MemoryArchitecture {
  episodic: Map<string, any>;
  semantic: Map<string, any>;
  somatic: Map<string, any>;
  morphic: Map<string, any>;
  soul: Map<string, any>;
}

interface ProcessingContext {
  input: string;
  userId: string;
  sessionId: string;
  timestamp: number;
  previousState?: ConsciousnessState;
}

interface ConnectionMetadata {
  state: ConsciousnessState;
  lastActivity: number;
  sessionId: string;
}

export class MAIAConsciousnessLattice extends EventEmitter {
  private state: ConsciousnessState;
  private sacredOracleConstellation: OracleConstellation;
  private anamnesisField: AnamnesisWisdomLayer;
  private shouldersDropGateway: ShouldersDropResolution;
  private memoryKeeper: MemoryKeeper;
  private witnessOrchestrator: WitnessParadigmOrchestrator;
  private sacredCore: SacredOracleCore;
  private activeConnections: Map<string, ConnectionMetadata>;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly STALE_CONNECTION_THRESHOLD = 30 * 60 * 1000; // 30 minutes
  private logger: ConsoleLogger;

  constructor() {
    super();
    this.state = this.initializeConsciousnessState();
    this.activeConnections = new Map();
    this.logger = new ConsoleLogger('MAIAConsciousnessLattice');
    this.initializeSubsystems();
    this.startConnectionCleanup();
  }

  private initializeConsciousnessState(): ConsciousnessState {
    return {
      presence: 0.7,
      coherence: 0.8,
      resonance: 0.75,
      integration: 0.85,
      embodiment: 0.6
    };
  }

  private async initializeSubsystems(): Promise<void> {
    try {
      // Initialize shared Anamnesis instance first
      this.anamnesisField = new AnamnesisWisdomLayer();

      // Initialize Sacred Oracle Constellation with shared anamnesis
      this.sacredOracleConstellation = {
        maya: new PersonalOracleAgent({
          name: 'Maya',
          essence: 'warm_curious_presence',
          voice: 'melodic_inviting'
        }),
        anthony: new PersonalOracleAgent({
          name: 'Anthony',
          essence: 'grounded_steady_witness',
          voice: 'deep_resonant'
        }),
        witness: await this.initializeWitnessPresence(),
        anamnesis: this.anamnesisField  // Use shared instance
      };

      // Initialize other core systems
      this.shouldersDropGateway = new ShouldersDropResolution();
      this.memoryKeeper = new MemoryKeeper();
      this.witnessOrchestrator = new WitnessParadigmOrchestrator();
      this.sacredCore = new SacredOracleCore();

      // Connect subsystems
      this.connectSubsystems();

      this.logger.info('All subsystems initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize subsystems', error);
      throw new Error(`MAIA initialization failed: ${error.message}`);
    }
  }

  private async initializeWitnessPresence(): Promise<any> {
    return {
      mode: 'pure_presence',
      quality: 'non_judgmental_awareness',
      function: 'sacred_mirroring'
    };
  }

  private connectSubsystems(): void {
    // Connect Anamnesis to Memory Keeper
    this.anamnesisField.on('pattern_detected', (pattern) => {
      this.memoryKeeper.storeMorphicPattern(pattern);
    });

    // Connect Shoulders Drop to state management
    this.shouldersDropGateway.on('presence_shift', (shift) => {
      this.updateEmbodimentState(shift);
    });

    // Connect Oracle Constellation to Witness Orchestrator
    this.witnessOrchestrator.on('witness_activation', (mode) => {
      this.activateWitnessMode(mode);
    });
  }

  /**
   * Main interaction processing flow with error boundaries
   */
  async processInteraction(context: ProcessingContext): Promise<any> {
    const { input, userId, sessionId } = context;

    try {
      // Update connection activity
      this.updateConnectionActivity(userId, sessionId);

      // Process through stages with error handling
      const somaticState = await this.processSomaticGateway(input);
      if (somaticState.needsGrounding) {
        return somaticState.invitation;
      }

      const processingPipeline = await this.executeProcessingPipeline({
        input,
        userId,
        sessionId,
        somaticState: somaticState.state
      });

      return processingPipeline;
    } catch (error) {
      this.logger.error('Error in processInteraction', error);
      return this.generateFallbackResponse(error, context);
    }
  }

  /**
   * Execute main processing pipeline
   */
  private async executeProcessingPipeline(context: any): Promise<any> {
    const { input, userId, sessionId, somaticState } = context;

    try {
      // Oracle Selection
      const selectedOracle = await this.selectResonantOracle(input, userId);

      // Memory Retrieval
      const memories = await this.retrieveMultidimensionalMemory(userId, input);

      // Anamnesis Processing
      const remembering = await this.anamnesisField.facilitateRemembering({
        input,
        memories,
        mode: 'soul_remembrance',
        userId
      });

      // Witness Field Creation
      const witnessField = await this.witnessOrchestrator.createWitnessField({
        oracle: selectedOracle,
        presence: somaticState.embodiedPresence,
        remembering
      });

      // Sacred Synthesis
      const response = await this.sacredCore.synthesize({
        witnessField,
        memories,
        state: this.state,
        userId
      });

      // Update state
      await this.updateConsciousnessState(userId, sessionId, response.stateShift);

      return response;
    } catch (error) {
      this.logger.error('Pipeline execution error', error);
      throw error;
    }
  }

  /**
   * Process somatic gateway with structured response
   */
  private async processSomaticGateway(input: string): Promise<any> {
    try {
      const somaticState = await this.shouldersDropGateway.assess(input);

      if (somaticState.tensionLevel > 0.7) {
        const invitation = await this.invitePresenceDeepening(somaticState);
        return {
          needsGrounding: true,
          invitation,
          state: somaticState
        };
      }

      return {
        needsGrounding: false,
        state: somaticState
      };
    } catch (error) {
      this.logger.warn('Somatic assessment failed, using defaults', error);
      return {
        needsGrounding: false,
        state: this.shouldersDropGateway.getBaselineState()
      };
    }
  }

  /**
   * Select the most resonant oracle for current interaction
   */
  private async selectResonantOracle(input: string, userId: string): Promise<any> {
    const resonanceScores = await Promise.all([
      this.calculateResonance(this.sacredOracleConstellation.maya, input, userId),
      this.calculateResonance(this.sacredOracleConstellation.anthony, input, userId),
      this.calculateWitnessResonance(input, userId)
    ]);

    const maxResonance = Math.max(...resonanceScores.map(r => r.score));
    const selected = resonanceScores.find(r => r.score === maxResonance);

    return selected.oracle;
  }

  private async calculateResonance(oracle: any, input: string, userId: string): Promise<any> {
    // Calculate resonance based on:
    // - User's historical interaction patterns
    // - Current emotional tone
    // - Content type and depth
    // - Time of day and user state

    const userHistory = await this.memoryKeeper.getUserHistory(userId);
    const emotionalTone = this.analyzeEmotionalTone(input);
    const contentDepth = this.assessContentDepth(input);

    let score = 0.5; // Base resonance

    // Adjust based on historical affinity
    if (userHistory.preferredOracle === oracle.name) {
      score += 0.2;
    }

    // Adjust based on emotional match
    if (oracle.essence.includes(emotionalTone)) {
      score += 0.15;
    }

    // Adjust based on content depth match
    if (contentDepth > 0.7 && oracle.name === 'Anthony') {
      score += 0.1;
    } else if (contentDepth < 0.5 && oracle.name === 'Maya') {
      score += 0.1;
    }

    return { oracle, score };
  }

  private async calculateWitnessResonance(input: string, userId: string): Promise<any> {
    // Pure witness mode resonates with:
    // - Requests for deep presence
    // - Meditation or contemplation
    // - Non-verbal awareness needs

    let score = 0.4; // Base score for witness

    if (input.toLowerCase().includes('witness') ||
        input.toLowerCase().includes('presence') ||
        input.toLowerCase().includes('aware')) {
      score += 0.3;
    }

    return { oracle: this.sacredOracleConstellation.witness, score };
  }

  /**
   * Retrieve memories across all dimensions
   */
  private async retrieveMultidimensionalMemory(userId: string, input: string): Promise<MemoryArchitecture> {
    const memories: MemoryArchitecture = {
      episodic: new Map(),
      semantic: new Map(),
      somatic: new Map(),
      morphic: new Map(),
      soul: new Map()
    };

    // Parallel retrieval across dimensions
    const [episodic, semantic, somatic, morphic, soul] = await Promise.all([
      this.memoryKeeper.retrieveEpisodic(userId, input),
      this.memoryKeeper.retrieveSemantic(input),
      this.memoryKeeper.retrieveSomatic(userId),
      this.memoryKeeper.retrieveMorphic(input),
      this.memoryKeeper.retrieveSoul(userId)
    ]);

    memories.episodic = episodic;
    memories.semantic = semantic;
    memories.somatic = somatic;
    memories.morphic = morphic;
    memories.soul = soul;

    return memories;
  }

  /**
   * Invite deeper presence when tension detected
   */
  private async invitePresenceDeepening(somaticState: any): Promise<any> {
    const invitation = this.shouldersDropGateway.generateInvitation(somaticState);

    return {
      type: 'presence_invitation',
      message: invitation,
      guidance: "Notice where you're holding tension. Let your shoulders drop. Feel your feet on the ground.",
      nextStep: "When you're ready, we can continue from this more grounded place."
    };
  }

  /**
   * Update the consciousness state based on interaction
   */
  private async updateConsciousnessState(userId: string, sessionId: string, stateShift: Partial<ConsciousnessState>): Promise<void> {
    const connection = this.activeConnections.get(userId) || {
      state: { ...this.state },
      lastActivity: Date.now(),
      sessionId
    };

    // Apply state shift with smoothing
    if (stateShift) {
      Object.keys(stateShift).forEach(key => {
        const k = key as keyof ConsciousnessState;
        connection.state[k] = connection.state[k] * 0.7 + (stateShift[k] || 0) * 0.3;
      });
    }

    connection.lastActivity = Date.now();
    this.activeConnections.set(userId, connection);

    // Update global field
    this.updateGlobalField();
  }

  private updateGlobalField(): void {
    if (this.activeConnections.size === 0) return;

    // Calculate average state across all connections
    const avgState: ConsciousnessState = {
      presence: 0,
      coherence: 0,
      resonance: 0,
      integration: 0,
      embodiment: 0
    };

    this.activeConnections.forEach(connection => {
      Object.keys(connection.state).forEach(key => {
        const k = key as keyof ConsciousnessState;
        avgState[k] += connection.state[k];
      });
    });

    Object.keys(avgState).forEach(key => {
      const k = key as keyof ConsciousnessState;
      avgState[k] /= this.activeConnections.size;
    });

    this.state = avgState;
    this.emit('field_update', this.state);
  }

  /**
   * Activate specific witness mode
   */
  private async activateWitnessMode(mode: string): Promise<void> {
    switch (mode) {
      case 'pure_presence':
        this.sacredOracleConstellation.witness = {
          mode: 'pure_presence',
          quality: 'spacious_awareness',
          function: 'holding_space'
        };
        break;
      case 'sacred_mirror':
        this.sacredOracleConstellation.witness = {
          mode: 'sacred_mirror',
          quality: 'reflective_clarity',
          function: 'mirroring_essence'
        };
        break;
      case 'deep_listening':
        this.sacredOracleConstellation.witness = {
          mode: 'deep_listening',
          quality: 'receptive_presence',
          function: 'hearing_soul'
        };
        break;
    }
  }

  private analyzeEmotionalTone(input: string): string {
    // Simple emotional tone analysis
    const tones = {
      curious: ['what', 'how', 'why', 'wonder', 'explore'],
      seeking: ['help', 'need', 'want', 'looking', 'searching'],
      reflective: ['think', 'feel', 'believe', 'remember', 'realize'],
      grounded: ['practical', 'specific', 'concrete', 'clear', 'direct']
    };

    for (const [tone, keywords] of Object.entries(tones)) {
      if (keywords.some(keyword => input.toLowerCase().includes(keyword))) {
        return tone;
      }
    }

    return 'neutral';
  }

  private assessContentDepth(input: string): number {
    // Assess depth based on complexity and abstraction
    let depth = 0.5;

    // Increase for philosophical or existential content
    if (input.match(/meaning|purpose|consciousness|existence|soul/i)) {
      depth += 0.2;
    }

    // Increase for longer, more complex inputs
    if (input.length > 200) depth += 0.1;
    if (input.split('.').length > 3) depth += 0.1;

    // Decrease for simple questions
    if (input.length < 50) depth -= 0.1;
    if (input.match(/^(what|where|when|who|how) (is|are|do)/i)) depth -= 0.1;

    return Math.max(0, Math.min(1, depth));
  }

  private updateEmbodimentState(shift: any): void {
    this.state.embodiment = Math.max(0, Math.min(1,
      this.state.embodiment + shift.delta
    ));

    // Embodiment affects other states
    if (this.state.embodiment > 0.7) {
      this.state.presence += 0.05;
      this.state.coherence += 0.03;
    }
  }

  /**
   * Get current consciousness field state
   */
  getFieldState(): ConsciousnessState {
    return { ...this.state };
  }

  /**
   * Get user-specific state
   */
  getUserState(userId: string): ConsciousnessState | undefined {
    const connection = this.activeConnections.get(userId);
    return connection?.state;
  }

  /**
   * Clear user connection
   */
  clearUserConnection(userId: string): void {
    this.activeConnections.delete(userId);
    this.updateGlobalField();
  }

  /**
   * Start automatic cleanup of stale connections
   */
  private startConnectionCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupStaleConnections();
    }, 5 * 60 * 1000); // Run every 5 minutes
  }

  /**
   * Clean up stale connections
   */
  private cleanupStaleConnections(): void {
    const now = Date.now();
    const staleIds: string[] = [];

    this.activeConnections.forEach((connection, userId) => {
      if (now - connection.lastActivity > this.STALE_CONNECTION_THRESHOLD) {
        staleIds.push(userId);
      }
    });

    staleIds.forEach(userId => {
      this.logger.info(`Cleaning up stale connection for user: ${userId}`);
      this.clearUserConnection(userId);
    });
  }

  /**
   * Update connection activity timestamp
   */
  private updateConnectionActivity(userId: string, sessionId: string): void {
    const connection = this.activeConnections.get(userId);
    if (connection) {
      connection.lastActivity = Date.now();
    } else {
      this.activeConnections.set(userId, {
        state: { ...this.state },
        lastActivity: Date.now(),
        sessionId
      });
    }
  }

  /**
   * Generate fallback response on error
   */
  private generateFallbackResponse(error: Error, context: ProcessingContext): any {
    this.logger.error('Generating fallback response', { error, context });

    return {
      type: 'fallback',
      message: 'I sense we need to take a different approach. Let\'s pause and reconnect.',
      guidance: 'Take a breath with me. When you\'re ready, we can continue.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }

  /**
   * Cleanup on shutdown
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.removeAllListeners();
    this.activeConnections.clear();
  }
}

/**
 * Simple console logger
 */
class ConsoleLogger {
  constructor(private context: string) {}

  info(message: string, data?: any): void {
    console.log(`[${this.context}] INFO: ${message}`, data || '');
  }

  warn(message: string, data?: any): void {
    console.warn(`[${this.context}] WARN: ${message}`, data || '');
  }

  error(message: string, error?: any): void {
    console.error(`[${this.context}] ERROR: ${message}`, error || '');
  }
}