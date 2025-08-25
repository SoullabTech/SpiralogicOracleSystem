/**
 * MemoryPayloadInterface.ts
 * User Metadata Management for Spiralogic Oracle System
 * Manages user context, phase tracking, and archetypal synchronization
 */

import { SpiralPhase, Archetype, ElementalType, UserEmotionalState } from '../types/index';

export interface UserMetadata {
  userId: string;
  anonymousId: string; // Hash for privacy in collective systems
  currentElement: ElementalType;
  currentPhase: SpiralPhase;
  currentArchetype: Archetype;
  lastActiveTimestamp: number;
  sessionId: string;
  preferences: UserPreferences;
  psychProfile: PsychologicalProfile;
  journeyMetrics: JourneyMetrics;
  contextualState: ContextualState;
}

export interface UserPreferences {
  preferredElements: ElementalType[];
  voicePersonality: 'gentle' | 'direct' | 'mystical' | 'practical' | 'adaptive';
  communicationStyle: 'conversational' | 'ceremonial' | 'therapeutic' | 'educational';
  depthLevel: 'surface' | 'moderate' | 'deep' | 'profound';
  ritualFrequency: 'minimal' | 'occasional' | 'regular' | 'intensive';
  collectiveParticipation: boolean;
  dreamSharing: boolean;
  synchronicityTracking: boolean;
  privacyLevel: 'anonymous' | 'pseudonymous' | 'identified';
}

export interface PsychologicalProfile {
  dominantArchetypes: Archetype[];
  shadowArchetypes: Archetype[];
  emergingArchetypes: Archetype[];
  cognitiveType: 'intuitive' | 'thinking' | 'feeling' | 'sensing' | 'balanced';
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'multimodal';
  transformationReadiness: number; // 0-1 scale
  integrationCapacity: number; // 0-1 scale
  resilience: number; // 0-1 scale
  openness: number; // 0-1 scale
  lastAssessmentDate: number;
}

export interface JourneyMetrics {
  totalSessions: number;
  totalEngagementTime: number; // milliseconds
  phaseProgression: Record<SpiralPhase, number>; // time spent in each phase
  elementalBalance: Record<ElementalType, number>; // affinity scores
  breakthroughCount: number;
  integrationMilestones: IntegrationMilestone[];
  challengeAreas: string[];
  strengthAreas: string[];
  growthVelocity: number; // rate of progression
  lastMilestoneDate: number;
}

export interface IntegrationMilestone {
  milestoneId: string;
  type: 'breakthrough' | 'integration' | 'mastery' | 'transcendence';
  element: ElementalType;
  archetype: Archetype;
  phase: SpiralPhase;
  description: string;
  date: number;
  significance: number; // 0-1 impact score
  embodimentLevel: number; // 0-1 how well integrated
}

export interface ContextualState {
  currentEmotionalState: UserEmotionalState;
  recentEmotionalJourney: UserEmotionalState[];
  energyLevel: number; // 0-1
  clarityLevel: number; // 0-1
  motivationLevel: number; // 0-1
  readinessForChallenge: number; // 0-1
  activeThemes: string[];
  recentSymbols: string[];
  currentChallenges: Challenge[];
  activeIntentions: Intention[];
  contextTags: string[];
  sessionContext: SessionContext;
}

export interface Challenge {
  challengeId: string;
  type: 'emotional' | 'mental' | 'spiritual' | 'practical' | 'relational';
  description: string;
  element: ElementalType;
  archetype: Archetype;
  intensity: number; // 0-1
  duration: number; // milliseconds since started
  progressLevel: number; // 0-1
  supportNeeded: string[];
  lastAddressed: number;
}

export interface Intention {
  intentionId: string;
  description: string;
  element: ElementalType;
  archetype: Archetype;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timeframe: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
  progressLevel: number; // 0-1
  alignmentWithPath: number; // 0-1
  energyInvestment: number; // 0-1
  lastReviewed: number;
}

export interface SessionContext {
  sessionStart: number;
  sessionDuration: number;
  interactionCount: number;
  currentMood: string;
  sessionGoals: string[];
  completedGoals: string[];
  emergentThemes: string[];
  significantMoments: SessionMoment[];
  adaptiveAdjustments: AdaptiveAdjustment[];
}

export interface SessionMoment {
  timestamp: number;
  type: 'insight' | 'breakthrough' | 'resistance' | 'confusion' | 'clarity' | 'emotion';
  description: string;
  intensity: number; // 0-1
  element?: ElementalType;
  archetype?: Archetype;
  symbolsPresent?: string[];
}

export interface AdaptiveAdjustment {
  timestamp: number;
  trigger: string;
  adjustment: string;
  rationale: string;
  effectiveness?: number; // 0-1, measured retrospectively
}

export interface MemoryPayload {
  metadata: UserMetadata;
  conversationHistory: ConversationEntry[];
  symbolicMemory: SymbolicMemoryEntry[];
  relationshipDynamics: RelationshipDynamics;
  collectiveResonance: CollectiveResonanceData;
  adaptiveConfiguration: AdaptiveConfiguration;
}

export interface ConversationEntry {
  timestamp: number;
  speaker: 'user' | 'oracle';
  content: string;
  element?: ElementalType;
  archetype?: Archetype;
  phase?: SpiralPhase;
  emotionalTone: string;
  significanceScore: number; // 0-1
  extractedSymbols: string[];
  therapeuticValue: number; // 0-1
  transformationalImpact: number; // 0-1
  followUpNeeded: boolean;
  tags: string[];
}

export interface SymbolicMemoryEntry {
  symbol: string;
  firstEncounter: number;
  lastEncounter: number;
  frequency: number;
  personalMeaning: string;
  evolutionTracker: SymbolEvolution[];
  emotionalResonance: number; // -1 to 1
  archetypalConnection: Archetype[];
  elementalResonance: ElementalType[];
  integrationLevel: number; // 0-1
  activeInConscious: boolean;
}

export interface SymbolEvolution {
  timestamp: number;
  context: string;
  meaningShift: string;
  intensityChange: number; // -1 to 1
  integrationProgress: number; // 0-1
}

export interface RelationshipDynamics {
  oracleRelationship: OracleRelationshipData;
  elementalAffinities: Record<ElementalType, number>;
  archetypeResonances: Record<string, number>;
  trustLevel: number; // 0-1
  openness: number; // 0-1
  resistance: number; // 0-1
  dependencyLevel: number; // 0-1
  growthEdge: string;
  communicationStyle: string;
  feedbackPreference: string;
}

export interface OracleRelationshipData {
  establishmentDate: number;
  totalInteractions: number;
  averageSessionQuality: number; // 0-1
  breakthrough facilitations: number;
  challengeSupport: number;
  trustBuildingMoments: TrustMoment[];
  communicationEvolution: CommunicationEvolution[];
  preferredOraclePersonas: string[];
}

export interface TrustMoment {
  timestamp: number;
  type: 'breakthrough' | 'vulnerability' | 'accurate-insight' | 'emotional-support';
  description: string;
  trustImpact: number; // -1 to 1
}

export interface CommunicationEvolution {
  period: string; // e.g., "Month 1", "Quarter 2"
  dominantPattern: string;
  effectiveness: number; // 0-1
  breakthroughFrequency: number;
  resistanceLevel: number; // 0-1
  adaptations: string[];
}

export interface CollectiveResonanceData {
  participationLevel: 'observer' | 'occasional' | 'active' | 'leader';
  sharedSymbolContributions: number;
  convergenceParticipations: number;
  collectiveInfluenceScore: number; // 0-1
  communityConnections: number;
  collectiveFieldResonance: number; // 0-1
  mythicPatternAlignment: string[];
  universalThemeResonance: Record<string, number>;
}

export interface AdaptiveConfiguration {
  personalityProfile: PersonalityProfile;
  communicationAdaptations: CommunicationAdaptation[];
  triggerResponses: TriggerResponse[];
  growthEdgeSettings: GrowthEdgeSettings;
  emergencyProtocols: EmergencyProtocol[];
  lastAdaptation: number;
  adaptationEffectiveness: number; // 0-1
}

export interface PersonalityProfile {
  primaryTraits: string[];
  communicationStyle: string;
  processingSpeed: 'slow' | 'moderate' | 'fast';
  metaphorPreference: 'concrete' | 'abstract' | 'mixed';
  challengeStyle: 'gentle' | 'direct' | 'gradual' | 'intensive';
  supportStyle: 'emotional' | 'practical' | 'spiritual' | 'integrated';
  feedbackReceptivity: number; // 0-1
}

export interface CommunicationAdaptation {
  trigger: string;
  adaptation: string;
  effectiveness: number; // 0-1
  frequency: number;
  lastUsed: number;
  evolutionNotes: string[];
}

export interface TriggerResponse {
  trigger: string;
  emotionalState: UserEmotionalState;
  responseType: 'support' | 'challenge' | 'redirect' | 'pause' | 'deepen';
  customMessage?: string;
  followUpAction?: string;
  effectiveness?: number; // 0-1
}

export interface GrowthEdgeSettings {
  currentGrowthEdge: string;
  readinessLevel: number; // 0-1
  supportNeeded: string[];
  challengeFrequency: 'minimal' | 'moderate' | 'regular' | 'intensive';
  integrationSupport: string[];
  breakthroughReadiness: number; // 0-1
}

export interface EmergencyProtocol {
  triggerCondition: string;
  responseProtocol: string;
  escalationPath: string[];
  supportResources: string[];
  followUpRequired: boolean;
  lastTriggered?: number;
}

export class MemoryPayloadInterface {
  private memoryStore: Map<string, MemoryPayload>;
  private sessionCache: Map<string, UserMetadata>;
  private adaptationEngine: AdaptationEngine;

  constructor() {
    this.memoryStore = new Map();
    this.sessionCache = new Map();
    this.adaptationEngine = new AdaptationEngine();
  }

  // Initialize user memory payload
  initializeUser(userId: string, initialMetadata: Partial<UserMetadata>): MemoryPayload {
    const defaultMetadata: UserMetadata = {
      userId,
      anonymousId: this.generateAnonymousId(userId),
      currentElement: 'earth', // Start grounded
      currentPhase: 'initiation',
      currentArchetype: 'Innocent',
      lastActiveTimestamp: Date.now(),
      sessionId: this.generateSessionId(),
      preferences: this.getDefaultPreferences(),
      psychProfile: this.getDefaultPsychProfile(),
      journeyMetrics: this.getDefaultJourneyMetrics(),
      contextualState: this.getDefaultContextualState(),
      ...initialMetadata
    };

    const memoryPayload: MemoryPayload = {
      metadata: defaultMetadata,
      conversationHistory: [],
      symbolicMemory: [],
      relationshipDynamics: this.getDefaultRelationshipDynamics(),
      collectiveResonance: this.getDefaultCollectiveResonance(),
      adaptiveConfiguration: this.getDefaultAdaptiveConfiguration()
    };

    this.memoryStore.set(userId, memoryPayload);
    this.sessionCache.set(userId, defaultMetadata);
    
    return memoryPayload;
  }

  // Get user memory payload
  getUserPayload(userId: string): MemoryPayload | null {
    return this.memoryStore.get(userId) || null;
  }

  // Update user metadata
  updateUserMetadata(userId: string, updates: Partial<UserMetadata>): void {
    const payload = this.memoryStore.get(userId);
    if (!payload) return;

    payload.metadata = {
      ...payload.metadata,
      ...updates,
      lastActiveTimestamp: Date.now()
    };

    this.sessionCache.set(userId, payload.metadata);
    this.triggerAdaptation(userId, updates);
  }

  // Update contextual state
  updateContextualState(userId: string, stateUpdates: Partial<ContextualState>): void {
    const payload = this.memoryStore.get(userId);
    if (!payload) return;

    payload.metadata.contextualState = {
      ...payload.metadata.contextualState,
      ...stateUpdates
    };

    this.adaptationEngine.processContextualChange(userId, stateUpdates);
  }

  // Add conversation entry
  addConversationEntry(userId: string, entry: Omit<ConversationEntry, 'timestamp'>): void {
    const payload = this.memoryStore.get(userId);
    if (!payload) return;

    const conversationEntry: ConversationEntry = {
      ...entry,
      timestamp: Date.now()
    };

    payload.conversationHistory.push(conversationEntry);

    // Limit conversation history
    if (payload.conversationHistory.length > 1000) {
      payload.conversationHistory = payload.conversationHistory.slice(-1000);
    }

    // Process for symbolic content and relationship dynamics
    this.processConversationForSymbols(userId, conversationEntry);
    this.updateRelationshipDynamics(userId, conversationEntry);
  }

  // Add symbolic memory entry
  addSymbolicMemory(userId: string, symbol: string, context: string, meaning?: string): void {
    const payload = this.memoryStore.get(userId);
    if (!payload) return;

    const existingEntry = payload.symbolicMemory.find(entry => entry.symbol === symbol);
    
    if (existingEntry) {
      existingEntry.lastEncounter = Date.now();
      existingEntry.frequency++;
      
      if (meaning && meaning !== existingEntry.personalMeaning) {
        existingEntry.evolutionTracker.push({
          timestamp: Date.now(),
          context,
          meaningShift: meaning,
          intensityChange: 0, // Calculate based on context
          integrationProgress: existingEntry.integrationLevel
        });
      }
    } else {
      const newEntry: SymbolicMemoryEntry = {
        symbol,
        firstEncounter: Date.now(),
        lastEncounter: Date.now(),
        frequency: 1,
        personalMeaning: meaning || '',
        evolutionTracker: [],
        emotionalResonance: 0,
        archetypalConnection: [],
        elementalResonance: [],
        integrationLevel: 0,
        activeInConscious: true
      };

      payload.symbolicMemory.push(newEntry);
    }
  }

  // Record integration milestone
  recordMilestone(userId: string, milestone: Omit<IntegrationMilestone, 'milestoneId' | 'date'>): void {
    const payload = this.memoryStore.get(userId);
    if (!payload) return;

    const integrationMilestone: IntegrationMilestone = {
      ...milestone,
      milestoneId: `milestone_${Date.now()}`,
      date: Date.now()
    };

    payload.metadata.journeyMetrics.integrationMilestones.push(integrationMilestone);
    payload.metadata.journeyMetrics.breakthroughCount++;
    payload.metadata.journeyMetrics.lastMilestoneDate = Date.now();

    // Update transformation readiness based on milestone
    payload.metadata.psychProfile.transformationReadiness = Math.min(1, 
      payload.metadata.psychProfile.transformationReadiness + (milestone.significance * 0.1)
    );
  }

  // Get adaptive oracle configuration
  getAdaptiveConfiguration(userId: string): AdaptiveConfiguration | null {
    const payload = this.memoryStore.get(userId);
    return payload?.adaptiveConfiguration || null;
  }

  // Update collective resonance
  updateCollectiveResonance(userId: string, updates: Partial<CollectiveResonanceData>): void {
    const payload = this.memoryStore.get(userId);
    if (!payload) return;

    payload.collectiveResonance = {
      ...payload.collectiveResonance,
      ...updates
    };
  }

  // Get user context for Oracle agents
  getUserContext(userId: string): UserContext | null {
    const payload = this.memoryStore.get(userId);
    if (!payload) return null;

    return {
      metadata: payload.metadata,
      recentConversations: payload.conversationHistory.slice(-10),
      activeSymbols: payload.symbolicMemory.filter(s => s.activeInConscious),
      relationshipState: payload.relationshipDynamics,
      adaptiveConfig: payload.adaptiveConfiguration
    };
  }

  // Private helper methods
  private generateAnonymousId(userId: string): string {
    // Simple hash for anonymous ID
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `anon_${Math.abs(hash)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      preferredElements: ['earth'],
      voicePersonality: 'adaptive',
      communicationStyle: 'conversational',
      depthLevel: 'moderate',
      ritualFrequency: 'occasional',
      collectiveParticipation: true,
      dreamSharing: false,
      synchronicityTracking: true,
      privacyLevel: 'pseudonymous'
    };
  }

  private getDefaultPsychProfile(): PsychologicalProfile {
    return {
      dominantArchetypes: ['Innocent'],
      shadowArchetypes: [],
      emergingArchetypes: [],
      cognitiveType: 'balanced',
      learningStyle: 'multimodal',
      transformationReadiness: 0.3,
      integrationCapacity: 0.5,
      resilience: 0.5,
      openness: 0.6,
      lastAssessmentDate: Date.now()
    };
  }

  private getDefaultJourneyMetrics(): JourneyMetrics {
    return {
      totalSessions: 0,
      totalEngagementTime: 0,
      phaseProgression: {
        initiation: 0,
        expansion: 0,
        integration: 0,
        mastery: 0
      },
      elementalBalance: {
        fire: 0.2,
        water: 0.2,
        earth: 0.3,
        air: 0.2,
        aether: 0.1
      },
      breakthroughCount: 0,
      integrationMilestones: [],
      challengeAreas: [],
      strengthAreas: [],
      growthVelocity: 0,
      lastMilestoneDate: 0
    };
  }

  private getDefaultContextualState(): ContextualState {
    return {
      currentEmotionalState: 'curious',
      recentEmotionalJourney: [],
      energyLevel: 0.5,
      clarityLevel: 0.5,
      motivationLevel: 0.6,
      readinessForChallenge: 0.4,
      activeThemes: [],
      recentSymbols: [],
      currentChallenges: [],
      activeIntentions: [],
      contextTags: [],
      sessionContext: {
        sessionStart: Date.now(),
        sessionDuration: 0,
        interactionCount: 0,
        currentMood: 'neutral',
        sessionGoals: [],
        completedGoals: [],
        emergentThemes: [],
        significantMoments: [],
        adaptiveAdjustments: []
      }
    };
  }

  private getDefaultRelationshipDynamics(): RelationshipDynamics {
    return {
      oracleRelationship: {
        establishmentDate: Date.now(),
        totalInteractions: 0,
        averageSessionQuality: 0,
        breakthroughFacilitations: 0,
        challengeSupport: 0,
        trustBuildingMoments: [],
        communicationEvolution: [],
        preferredOraclePersonas: []
      },
      elementalAffinities: {
        fire: 0.2,
        water: 0.2,
        earth: 0.3,
        air: 0.2,
        aether: 0.1
      },
      archetypeResonances: {},
      trustLevel: 0.3,
      openness: 0.5,
      resistance: 0.2,
      dependencyLevel: 0.1,
      growthEdge: 'building trust',
      communicationStyle: 'exploratory',
      feedbackPreference: 'gentle'
    };
  }

  private getDefaultCollectiveResonance(): CollectiveResonanceData {
    return {
      participationLevel: 'observer',
      sharedSymbolContributions: 0,
      convergenceParticipations: 0,
      collectiveInfluenceScore: 0,
      communityConnections: 0,
      collectiveFieldResonance: 0,
      mythicPatternAlignment: [],
      universalThemeResonance: {}
    };
  }

  private getDefaultAdaptiveConfiguration(): AdaptiveConfiguration {
    return {
      personalityProfile: {
        primaryTraits: [],
        communicationStyle: 'adaptive',
        processingSpeed: 'moderate',
        metaphorPreference: 'mixed',
        challengeStyle: 'gentle',
        supportStyle: 'integrated',
        feedbackReceptivity: 0.6
      },
      communicationAdaptations: [],
      triggerResponses: [],
      growthEdgeSettings: {
        currentGrowthEdge: 'initial exploration',
        readinessLevel: 0.4,
        supportNeeded: ['gentle guidance'],
        challengeFrequency: 'minimal',
        integrationSupport: ['reflection prompts'],
        breakthroughReadiness: 0.3
      },
      emergencyProtocols: [],
      lastAdaptation: Date.now(),
      adaptationEffectiveness: 0
    };
  }

  private processConversationForSymbols(userId: string, entry: ConversationEntry): void {
    if (entry.extractedSymbols && entry.extractedSymbols.length > 0) {
      entry.extractedSymbols.forEach(symbol => {
        this.addSymbolicMemory(userId, symbol, entry.content);
      });
    }
  }

  private updateRelationshipDynamics(userId: string, entry: ConversationEntry): void {
    const payload = this.memoryStore.get(userId);
    if (!payload) return;

    payload.relationshipDynamics.oracleRelationship.totalInteractions++;

    // Update trust based on interaction quality
    if (entry.therapeuticValue > 0.7) {
      payload.relationshipDynamics.trustLevel = Math.min(1, 
        payload.relationshipDynamics.trustLevel + 0.01
      );
    }

    // Update openness based on user sharing
    if (entry.speaker === 'user' && entry.content.length > 100) {
      payload.relationshipDynamics.openness = Math.min(1, 
        payload.relationshipDynamics.openness + 0.005
      );
    }
  }

  private triggerAdaptation(userId: string, updates: Partial<UserMetadata>): void {
    this.adaptationEngine.processMetadataUpdate(userId, updates);
  }

  // Cleanup old data
  cleanup(maxAge: number = 7776000000): void { // 90 days default
    const cutoff = Date.now() - maxAge;
    
    this.memoryStore.forEach((payload, userId) => {
      // Clean conversation history
      payload.conversationHistory = payload.conversationHistory.filter(
        entry => entry.timestamp > cutoff
      );

      // Clean session cache
      if (payload.metadata.lastActiveTimestamp < cutoff) {
        this.sessionCache.delete(userId);
      }

      // Clean old symbolic memories (keep important ones)
      payload.symbolicMemory = payload.symbolicMemory.filter(
        entry => entry.lastEncounter > cutoff || entry.integrationLevel > 0.5
      );
    });
  }
}

// Helper interface for Oracle agent consumption
export interface UserContext {
  metadata: UserMetadata;
  recentConversations: ConversationEntry[];
  activeSymbols: SymbolicMemoryEntry[];
  relationshipState: RelationshipDynamics;
  adaptiveConfig: AdaptiveConfiguration;
}

// Adaptation engine for dynamic user response adjustment
class AdaptationEngine {
  private adaptationHistory: Map<string, AdaptationRecord[]>;

  constructor() {
    this.adaptationHistory = new Map();
  }

  processMetadataUpdate(userId: string, updates: Partial<UserMetadata>): void {
    // Process significant metadata changes and suggest adaptations
    if (updates.currentPhase || updates.currentElement || updates.currentArchetype) {
      this.suggestCommunicationAdaptation(userId, updates);
    }
  }

  processContextualChange(userId: string, stateUpdates: Partial<ContextualState>): void {
    // Process contextual state changes for immediate adaptation
    if (stateUpdates.currentEmotionalState || stateUpdates.energyLevel) {
      this.adaptToCurrentState(userId, stateUpdates);
    }
  }

  private suggestCommunicationAdaptation(userId: string, updates: Partial<UserMetadata>): void {
    // Implementation for suggesting communication style adaptations
    // based on phase/element/archetype changes
  }

  private adaptToCurrentState(userId: string, stateUpdates: Partial<ContextualState>): void {
    // Implementation for immediate adaptation to emotional/energy state changes
  }
}

interface AdaptationRecord {
  timestamp: number;
  trigger: string;
  adaptation: string;
  effectiveness?: number;
}