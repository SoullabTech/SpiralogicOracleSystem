// Memory Payload Interface - AIN Memory Bridge for Spiralogic Continuity
// Maintains user context, phase tracking, and elemental resonance across sessions

interface SpiralogicUserProfile {
  userId: string;
  anonymousId: string; // For privacy in collective field
  currentPhase: SpiralogicPhase;
  elementalAffinities: ElementalAffinities;
  archetypalEvolution: ArchetypalEvolution;
  ritualHistory: RitualEntry[];
  symbolicJourney: SymbolicEntry[];
  transformationMarkers: TransformationMarker[];
  lastSession: SessionMetadata;
}

interface SpiralogicPhase {
  current: 'initiation' | 'development' | 'grounding' | 'integration' | 'transcendence' | 'completion';
  subPhase?: string;
  phaseEntry: number; // Timestamp when entered current phase
  phaseDuration: number; // How long in current phase
  previousPhases: Array<{phase: string; duration: number; completionDate: number}>;
  readinessForNext: number; // 0-1 score of readiness for next phase
  phaseSymbols: string[]; // Symbols that emerged during this phase
}

interface ElementalAffinities {
  fire: number; // 0-1 affinity score
  water: number;
  earth: number;
  air: number;
  aether: number;
  dominantElement: string;
  secondaryElement: string;
  evolutionPattern: string[]; // How affinities have shifted over time
  balanceScore: number; // How balanced across elements
}

interface ArchetypalEvolution {
  currentPrimary: string;
  currentSecondary?: string;
  archetypalHistory: Array<{
    archetype: string;
    activationDate: number;
    deactivationDate?: number;
    peakIntensity: number;
    associatedSymbols: string[];
    transformationContext: string;
  }>;
  emergingArchetype?: string;
  shadowArchetypes: string[]; // Archetypes being integrated from shadow
}

interface RitualEntry {
  ritualId: string;
  ritualName: string;
  element: string;
  phase: string;
  timestamp: number;
  effectiveness: number; // 0-1 user-reported or system-assessed
  symbols: string[];
  insights: string[];
  nextRitualSuggestion?: string;
}

interface SymbolicEntry {
  symbol: string;
  source: 'dream' | 'vision' | 'meditation' | 'synchronicity' | 'ritual' | 'insight';
  timestamp: number;
  element: string;
  archetype: string;
  phase: string;
  intensity: number;
  context: string;
  personalSignificance?: string;
  collectiveResonance?: number; // From DreamFieldNode
}

interface TransformationMarker {
  markerId: string;
  markerType: 'breakthrough' | 'initiation' | 'crisis' | 'integration' | 'completion';
  timestamp: number;
  triggerElement: string;
  description: string;
  beforeState: any; // Snapshot of user state before
  afterState: any; // Snapshot of user state after
  catalystEvents: string[]; // What triggered this transformation
  integrationProgress: number; // 0-1 how well integrated
}

interface SessionMetadata {
  lastActiveDate: number;
  sessionCount: number;
  averageSessionLength: number;
  preferredInteractionTime: string; // Time of day patterns
  deviceContext: string;
  locationContext?: string; // If available and consented
  energyPattern: 'morning' | 'afternoon' | 'evening' | 'night' | 'irregular';
}

interface MemoryPayload {
  userProfile: SpiralogicUserProfile;
  sessionContext: SessionContext;
  elementalStates: ElementalStates;
  collectiveContext: CollectiveContext;
  emergentGuidance: EmergentGuidance;
}

interface SessionContext {
  sessionId: string;
  startTime: number;
  queryCount: number;
  activeElements: string[];
  sessionPhase: string; // Which phase is being explored this session
  emotionalJourney: Array<{timestamp: number; emotion: string; intensity: number}>;
  insights: string[];
  nextSessionPreparation?: string;
}

interface ElementalStates {
  fire: {
    motivation: number;
    visionClarity: number;
    catalyticPotential: number;
    breakthroughReadiness: number;
    lastIgnition?: number;
  };
  water: {
    emotionalFlow: number;
    healingProgress: number;
    intuitiveOpenness: number;
    compassionLevel: number;
    lastHealing?: number;
  };
  earth: {
    stability: number;
    groundedness: number;
    habitStrength: number;
    foundationSolidity: number;
    lastGrounding?: number;
  };
  air: {
    clarityLevel: number;
    mentalSynthesis: number;
    communicationFlow: number;
    perspectiveSpan: number;
    lastClarity?: number;
  };
  aether: {
    transcendentAwareness: number;
    mysticalConnection: number;
    emergenceReadiness: number;
    fieldCoherence: number;
    lastTranscendence?: number;
  };
}

interface CollectiveContext {
  fieldResonance: number; // How connected to collective field
  contributionScore: number; // How much user contributes to field
  convergenceParticipation: string[]; // Which convergences user has been part of
  archetypalInfluence: number; // How much user influences archetypal trends
  symbolicContributions: number; // Count of symbols contributed to field
}

interface EmergentGuidance {
  nextPhasePreparation: string[];
  elementalBalancingNeeds: string[];
  archetypalIntegrationWork: string[];
  collectiveServiceOpportunities: string[];
  shadowIntegrationInvitations: string[];
  transcendentReadinessIndicators: string[];
}

export class MemoryPayloadInterface {
  private userProfiles: Map<string, SpiralogicUserProfile>;
  private sessionCache: Map<string, SessionContext>;
  private dreamFieldConnection: any; // DreamFieldNode instance
  private lastCleanup: number;

  constructor(dreamFieldNode?: any) {
    this.userProfiles = new Map();
    this.sessionCache = new Map();
    this.dreamFieldConnection = dreamFieldNode;
    this.lastCleanup = Date.now();
  }

  // Initialize or retrieve user profile
  async initializeUser(userId: string): Promise<SpiralogicUserProfile> {
    let profile = this.userProfiles.get(userId);
    
    if (!profile) {
      profile = this.createNewUserProfile(userId);
      this.userProfiles.set(userId, profile);
    }

    return profile;
  }

  private createNewUserProfile(userId: string): SpiralogicUserProfile {
    return {
      userId,
      anonymousId: this.generateAnonymousId(userId),
      currentPhase: {
        current: 'initiation',
        phaseEntry: Date.now(),
        phaseDuration: 0,
        previousPhases: [],
        readinessForNext: 0,
        phaseSymbols: []
      },
      elementalAffinities: {
        fire: 0.2,
        water: 0.2,
        earth: 0.2,
        air: 0.2,
        aether: 0.2,
        dominantElement: 'initiation', // Will be determined over time
        secondaryElement: '',
        evolutionPattern: [],
        balanceScore: 1.0 // Perfect balance initially
      },
      archetypalEvolution: {
        currentPrimary: 'Initiate',
        archetypalHistory: [],
        shadowArchetypes: []
      },
      ritualHistory: [],
      symbolicJourney: [],
      transformationMarkers: [],
      lastSession: {
        lastActiveDate: Date.now(),
        sessionCount: 0,
        averageSessionLength: 0,
        preferredInteractionTime: '',
        deviceContext: 'web',
        energyPattern: 'irregular'
      }
    };
  }

  private generateAnonymousId(userId: string): string {
    // Simple hash for anonymity in collective field
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `anon_${Math.abs(hash).toString(36)}`;
  }

  // Start a new session
  async startSession(userId: string): Promise<SessionContext> {
    const profile = await this.initializeUser(userId);
    
    const sessionContext: SessionContext = {
      sessionId: `session_${Date.now()}_${userId}`,
      startTime: Date.now(),
      queryCount: 0,
      activeElements: [],
      sessionPhase: profile.currentPhase.current,
      emotionalJourney: [],
      insights: []
    };

    this.sessionCache.set(sessionContext.sessionId, sessionContext);
    
    // Update session metadata
    profile.lastSession.sessionCount++;
    profile.lastSession.lastActiveDate = Date.now();

    return sessionContext;
  }

  // Update user profile based on Oracle interaction
  async updateFromOracleResponse(
    userId: string,
    sessionId: string,
    response: any, // AIResponse from Oracle agents
    userFeedback?: {
      helpful: boolean;
      resonance: number;
      insights?: string[];
      symbols?: string[];
    }
  ): Promise<void> {
    const profile = await this.initializeUser(userId);
    const session = this.sessionCache.get(sessionId);

    if (session) {
      session.queryCount++;
      
      // Update elemental affinities based on which agent(s) responded
      if (response.metadata?.element) {
        this.updateElementalAffinity(profile, response.metadata.element, response.confidence || 0.5);
      }

      // Track archetypal evolution
      if (response.metadata?.archetype) {
        this.updateArchetypalEvolution(profile, response.metadata.archetype);
      }

      // Record symbols and insights
      if (response.metadata?.symbols) {
        response.metadata.symbols.forEach((symbol: string) => {
          this.addSymbolicEntry(profile, {
            symbol,
            source: 'insight',
            element: response.metadata.element,
            archetype: response.metadata.archetype,
            phase: profile.currentPhase.current,
            intensity: response.confidence || 0.5,
            context: 'oracle_response'
          });
        });
      }

      // Process user feedback if provided
      if (userFeedback) {
        this.processUserFeedback(profile, session, userFeedback);
      }

      // Check for phase progression readiness
      this.assessPhaseProgression(profile);
    }
  }

  private updateElementalAffinity(profile: SpiralogicUserProfile, element: string, strength: number): void {
    if (element in profile.elementalAffinities) {
      // Weighted update - 70% existing, 30% new
      profile.elementalAffinities[element] = 
        (profile.elementalAffinities[element] * 0.7) + (strength * 0.3);
      
      // Update dominant and secondary elements
      const sorted = Object.entries(profile.elementalAffinities)
        .filter(([key]) => key !== 'dominantElement' && key !== 'secondaryElement' && key !== 'evolutionPattern' && key !== 'balanceScore')
        .sort(([,a], [,b]) => b - a);
      
      profile.elementalAffinities.dominantElement = sorted[0][0];
      profile.elementalAffinities.secondaryElement = sorted[1][0];
      
      // Calculate balance score
      const values = sorted.map(([,value]) => value);
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
      profile.elementalAffinities.balanceScore = Math.max(0, 1 - variance);
    }
  }

  private updateArchetypalEvolution(profile: SpiralogicUserProfile, archetype: string): void {
    const evolution = profile.archetypalEvolution;
    
    if (evolution.currentPrimary !== archetype) {
      // Archetype is shifting
      const existingEntry = evolution.archetypalHistory.find(h => h.archetype === archetype && !h.deactivationDate);
      
      if (existingEntry) {
        // Reactivating previous archetype
        existingEntry.peakIntensity = Math.min(1, existingEntry.peakIntensity + 0.1);
      } else {
        // New archetype emerging
        evolution.emergingArchetype = archetype;
        
        // If emergence is strong enough, make it primary
        if (Math.random() > 0.7) { // Simplified activation threshold
          // Deactivate current primary
          if (evolution.currentPrimary) {
            const currentEntry = evolution.archetypalHistory.find(h => 
              h.archetype === evolution.currentPrimary && !h.deactivationDate
            );
            if (currentEntry) {
              currentEntry.deactivationDate = Date.now();
            }
          }

          // Activate new primary
          evolution.currentPrimary = archetype;
          evolution.archetypalHistory.push({
            archetype,
            activationDate: Date.now(),
            peakIntensity: 0.5,
            associatedSymbols: [],
            transformationContext: profile.currentPhase.current
          });
          
          evolution.emergingArchetype = undefined;
        }
      }
    }
  }

  private addSymbolicEntry(profile: SpiralogicUserProfile, symbolData: Partial<SymbolicEntry>): void {
    const entry: SymbolicEntry = {
      symbol: symbolData.symbol || '',
      source: symbolData.source || 'insight',
      timestamp: Date.now(),
      element: symbolData.element || profile.elementalAffinities.dominantElement,
      archetype: symbolData.archetype || profile.archetypalEvolution.currentPrimary,
      phase: profile.currentPhase.current,
      intensity: symbolData.intensity || 0.5,
      context: symbolData.context || '',
      personalSignificance: symbolData.personalSignificance
    };

    profile.symbolicJourney.push(entry);
    
    // Add to current phase symbols
    if (!profile.currentPhase.phaseSymbols.includes(entry.symbol)) {
      profile.currentPhase.phaseSymbols.push(entry.symbol);
    }

    // Log to collective dream field if connected
    if (this.dreamFieldConnection) {
      this.dreamFieldConnection.logSymbol({
        symbol: entry.symbol,
        archetype: entry.archetype,
        phase: entry.phase,
        userId: profile.anonymousId,
        intensity: entry.intensity,
        context: entry.context,
        dreamSource: entry.source === 'dream',
        visionSource: entry.source === 'vision',
        synchronicityMarker: entry.source === 'synchronicity'
      });
    }
  }

  private processUserFeedback(
    profile: SpiralogicUserProfile, 
    session: SessionContext, 
    feedback: any
  ): void {
    // Track emotional journey
    session.emotionalJourney.push({
      timestamp: Date.now(),
      emotion: feedback.resonance > 0.7 ? 'resonant' : feedback.resonance > 0.3 ? 'neutral' : 'dissonant',
      intensity: feedback.resonance
    });

    // Add user insights
    if (feedback.insights) {
      session.insights.push(...feedback.insights);
    }

    // Process user-reported symbols
    if (feedback.symbols) {
      feedback.symbols.forEach((symbol: string) => {
        this.addSymbolicEntry(profile, {
          symbol,
          source: 'insight',
          element: profile.elementalAffinities.dominantElement,
          archetype: profile.archetypalEvolution.currentPrimary,
          intensity: feedback.resonance,
          context: 'user_feedback'
        });
      });
    }
  }

  private assessPhaseProgression(profile: SpiralogicUserProfile): void {
    const currentPhase = profile.currentPhase;
    const now = Date.now();
    const timeInPhase = now - currentPhase.phaseEntry;
    const minPhaseTime = 604800000; // 1 week minimum
    
    if (timeInPhase > minPhaseTime) {
      // Assess readiness based on various factors
      let readiness = 0;
      
      // Symbolic integration (has gathered phase-appropriate symbols)
      if (currentPhase.phaseSymbols.length >= 3) readiness += 0.3;
      
      // Elemental balance development
      if (profile.elementalAffinities.balanceScore > 0.6) readiness += 0.2;
      
      // Archetypal stability (not rapidly shifting archetypes)
      const recentArchetypeShifts = profile.archetypalEvolution.archetypalHistory
        .filter(h => (now - h.activationDate) < 604800000).length;
      if (recentArchetypeShifts <= 1) readiness += 0.2;
      
      // Transformation integration
      const recentTransformations = profile.transformationMarkers
        .filter(t => (now - t.timestamp) < 1209600000); // 2 weeks
      const integratedTransformations = recentTransformations
        .filter(t => t.integrationProgress > 0.7).length;
      readiness += (integratedTransformations / Math.max(1, recentTransformations.length)) * 0.3;
      
      currentPhase.readinessForNext = Math.min(1, readiness);
      
      // Auto-progress if highly ready
      if (readiness > 0.8) {
        this.progressToNextPhase(profile);
      }
    }
  }

  private progressToNextPhase(profile: SpiralogicUserProfile): void {
    const phaseProgression = {
      'initiation': 'development',
      'development': 'grounding',
      'grounding': 'integration',
      'integration': 'transcendence',
      'transcendence': 'completion',
      'completion': 'initiation' // Spiral continues
    };

    const currentPhase = profile.currentPhase;
    const nextPhase = phaseProgression[currentPhase.current];
    
    if (nextPhase) {
      // Record completion of current phase
      currentPhase.previousPhases.push({
        phase: currentPhase.current,
        duration: Date.now() - currentPhase.phaseEntry,
        completionDate: Date.now()
      });

      // Record transformation marker
      profile.transformationMarkers.push({
        markerId: `phase_transition_${Date.now()}`,
        markerType: 'completion',
        timestamp: Date.now(),
        triggerElement: profile.elementalAffinities.dominantElement,
        description: `Completed ${currentPhase.current} phase, progressing to ${nextPhase}`,
        beforeState: { phase: currentPhase.current },
        afterState: { phase: nextPhase },
        catalystEvents: [`phase_readiness_${currentPhase.readinessForNext}`],
        integrationProgress: 0 // Will build over time in new phase
      });

      // Transition to next phase
      currentPhase.current = nextPhase as any;
      currentPhase.phaseEntry = Date.now();
      currentPhase.phaseDuration = 0;
      currentPhase.readinessForNext = 0;
      currentPhase.phaseSymbols = [];
    }
  }

  // Build complete memory payload for Oracle agents
  async buildMemoryPayload(userId: string, sessionId: string): Promise<MemoryPayload> {
    const profile = await this.initializeUser(userId);
    const session = this.sessionCache.get(sessionId);

    const elementalStates = this.calculateElementalStates(profile);
    const collectiveContext = await this.buildCollectiveContext(profile);
    const emergentGuidance = this.generateEmergentGuidance(profile, elementalStates, collectiveContext);

    return {
      userProfile: profile,
      sessionContext: session || await this.startSession(userId),
      elementalStates,
      collectiveContext,
      emergentGuidance
    };
  }

  private calculateElementalStates(profile: SpiralogicUserProfile): ElementalStates {
    // Calculate current elemental states based on profile data
    const affinities = profile.elementalAffinities;
    const recentActivity = Date.now() - 604800000; // 1 week ago
    
    return {
      fire: {
        motivation: affinities.fire * 0.7 + (profile.currentPhase.readinessForNext * 0.3),
        visionClarity: affinities.fire,
        catalyticPotential: Math.min(1, affinities.fire + (profile.transformationMarkers.length * 0.1)),
        breakthroughReadiness: profile.currentPhase.readinessForNext,
        lastIgnition: this.getLastElementalActivity(profile, 'fire')
      },
      water: {
        emotionalFlow: affinities.water,
        healingProgress: profile.transformationMarkers.filter(t => t.integrationProgress > 0.5).length / Math.max(1, profile.transformationMarkers.length),
        intuitiveOpenness: affinities.water * 0.8 + (profile.symbolicJourney.filter(s => s.source === 'dream' || s.source === 'vision').length * 0.05),
        compassionLevel: affinities.water,
        lastHealing: this.getLastElementalActivity(profile, 'water')
      },
      earth: {
        stability: affinities.earth,
        groundedness: Math.min(1, affinities.earth + (profile.ritualHistory.length * 0.05)),
        habitStrength: profile.ritualHistory.filter(r => r.effectiveness > 0.6).length / Math.max(1, profile.ritualHistory.length),
        foundationSolidity: affinities.earth * 0.9 + (profile.currentPhase.previousPhases.length * 0.02),
        lastGrounding: this.getLastElementalActivity(profile, 'earth')
      },
      air: {
        clarityLevel: affinities.air,
        mentalSynthesis: affinities.air * 0.8 + (profile.archetypalEvolution.archetypalHistory.length * 0.03),
        communicationFlow: affinities.air,
        perspectiveSpan: Math.min(1, affinities.air + (profile.currentPhase.previousPhases.length * 0.05)),
        lastClarity: this.getLastElementalActivity(profile, 'air')
      },
      aether: {
        transcendentAwareness: affinities.aether,
        mysticalConnection: Math.min(1, affinities.aether + (profile.symbolicJourney.filter(s => s.source === 'vision' || s.source === 'synchronicity').length * 0.04)),
        emergenceReadiness: profile.currentPhase.readinessForNext * affinities.aether,
        fieldCoherence: this.calculateFieldCoherence(profile),
        lastTranscendence: this.getLastElementalActivity(profile, 'aether')
      }
    };
  }

  private getLastElementalActivity(profile: SpiralogicUserProfile, element: string): number | undefined {
    const elementalSymbols = profile.symbolicJourney
      .filter(s => s.element === element)
      .sort((a, b) => b.timestamp - a.timestamp);
    
    return elementalSymbols.length > 0 ? elementalSymbols[0].timestamp : undefined;
  }

  private calculateFieldCoherence(profile: SpiralogicUserProfile): number {
    // Simple coherence calculation based on balance and consistency
    const balance = profile.elementalAffinities.balanceScore;
    const consistency = profile.archetypalEvolution.archetypalHistory.length > 0 ? 
      1 - (profile.archetypalEvolution.archetypalHistory.length / 10) : 0.5;
    
    return Math.min(1, (balance + consistency) / 2);
  }

  private async buildCollectiveContext(profile: SpiralogicUserProfile): Promise<CollectiveContext> {
    let fieldResonance = 0.3; // Default baseline
    let contributionScore = 0;
    let convergenceParticipation: string[] = [];

    // If connected to dream field, get collective data
    if (this.dreamFieldConnection) {
      // Calculate how much user's symbols resonate with collective
      const userSymbols = new Set(profile.symbolicJourney.map(s => s.symbol));
      const trendingSymbols = await this.dreamFieldConnection.getTrendingSymbols(10);
      
      const resonantSymbols = trendingSymbols.filter(ts => userSymbols.has(ts.symbol));
      fieldResonance = Math.min(1, resonantSymbols.length / 10);
      
      // Calculate contribution score
      contributionScore = Math.min(1, profile.symbolicJourney.length / 100);
      
      // Get convergence participation (would need to be implemented in DreamFieldNode)
      // convergenceParticipation = await this.dreamFieldConnection.getUserConvergences(profile.anonymousId);
    }

    return {
      fieldResonance,
      contributionScore,
      convergenceParticipation,
      archetypalInfluence: Math.min(1, profile.archetypalEvolution.archetypalHistory.length / 20),
      symbolicContributions: profile.symbolicJourney.length
    };
  }

  private generateEmergentGuidance(
    profile: SpiralogicUserProfile,
    elementalStates: ElementalStates,
    collectiveContext: CollectiveContext
  ): EmergentGuidance {
    const guidance: EmergentGuidance = {
      nextPhasePreparation: [],
      elementalBalancingNeeds: [],
      archetypalIntegrationWork: [],
      collectiveServiceOpportunities: [],
      shadowIntegrationInvitations: [],
      transcendentReadinessIndicators: []
    };

    // Next phase preparation
    if (profile.currentPhase.readinessForNext > 0.6) {
      guidance.nextPhasePreparation.push(
        `Prepare for transition from ${profile.currentPhase.current} to next phase through integration practices`
      );
    }

    // Elemental balancing
    const affinities = profile.elementalAffinities;
    const dominantScore = affinities[affinities.dominantElement as keyof ElementalAffinities] as number;
    if (dominantScore > 0.8) {
      guidance.elementalBalancingNeeds.push(
        `Balance dominant ${affinities.dominantElement} energy with ${affinities.secondaryElement} practices`
      );
    }

    // Archetypal integration
    if (profile.archetypalEvolution.emergingArchetype) {
      guidance.archetypalIntegrationWork.push(
        `Explore integration of emerging ${profile.archetypalEvolution.emergingArchetype} archetype`
      );
    }

    // Collective service
    if (collectiveContext.contributionScore > 0.5 && collectiveContext.fieldResonance > 0.6) {
      guidance.collectiveServiceOpportunities.push(
        'Your symbolic contributions resonate strongly with the collective field - consider sharing wisdom'
      );
    }

    // Shadow work
    if (profile.archetypalEvolution.shadowArchetypes.length > 0) {
      guidance.shadowIntegrationInvitations.push(
        `Shadow integration opportunities with ${profile.archetypalEvolution.shadowArchetypes[0]} archetype`
      );
    }

    // Transcendence readiness
    const transcendenceScore = elementalStates.aether.transcendentAwareness * 
                              elementalStates.aether.fieldCoherence;
    if (transcendenceScore > 0.7) {
      guidance.transcendentReadinessIndicators.push(
        'High transcendent awareness indicates readiness for advanced spiritual practices'
      );
    }

    return guidance;
  }

  // Get memory payload for specific user and session
  async getMemoryPayload(userId: string, sessionId?: string): Promise<MemoryPayload> {
    if (!sessionId) {
      const sessionContext = await this.startSession(userId);
      sessionId = sessionContext.sessionId;
    }
    
    return this.buildMemoryPayload(userId, sessionId);
  }

  // Clean up old session data
  cleanup(maxAge: number = 86400000): void { // 24 hours default
    const cutoff = Date.now() - maxAge;
    
    // Clean up session cache
    for (const [sessionId, session] of this.sessionCache.entries()) {
      if (session.startTime < cutoff) {
        this.sessionCache.delete(sessionId);
      }
    }

    // Clean up user profile data (keep essential data, clean temporary)
    for (const [userId, profile] of this.userProfiles.entries()) {
      // Clean old symbolic journey entries (keep last 100)
      profile.symbolicJourney = profile.symbolicJourney
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 100);

      // Clean old ritual history (keep last 50)
      profile.ritualHistory = profile.ritualHistory
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 50);
    }

    this.lastCleanup = Date.now();
  }
}