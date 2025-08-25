/**
 * StateManager.ts
 * Centralized state management with event sourcing and change tracking
 * Eliminates scattered state updates across multiple modules
 */

import { UserMetadata, ContextualState, IntegrationMilestone } from '../MemoryPayloadInterface';
import { ElementalType, SpiralPhase, Archetype } from '../../types/index';
import { CalculationEngine } from './CalculationEngine';
import { CacheManager } from './CacheManager';

export interface StateChangeEvent {
  eventId: string;
  userId: string;
  eventType: 'metadata_update' | 'phase_transition' | 'milestone_achieved' | 'context_change';
  timestamp: number;
  previousState: Partial<UserMetadata>;
  newState: Partial<UserMetadata>;
  trigger: string;
  significance: number; // 0-1
}

export interface StateSubscription {
  subscriptionId: string;
  userId?: string; // If undefined, subscribes to all users
  eventTypes: StateChangeEvent['eventType'][];
  callback: StateChangeCallback;
  filter?: (event: StateChangeEvent) => boolean;
}

export type StateChangeCallback = (event: StateChangeEvent) => void;

export interface StateSnapshot {
  timestamp: number;
  userStates: Map<string, UserMetadata>;
  globalMetrics: {
    totalUsers: number;
    activeUsers: number;
    averageCoherence: number;
    elementalDistribution: Record<ElementalType, number>;
    phaseDistribution: Record<SpiralPhase, number>;
  };
}

export class StateManager {
  private userStates = new Map<string, UserMetadata>();
  private eventHistory: StateChangeEvent[] = [];
  private subscribers = new Map<string, StateSubscription>();
  private cache = new CacheManager({ maxSize: 200, defaultTTL: 300000 }); // 5 min TTL
  
  private eventCleanupInterval: NodeJS.Timeout;
  private stateSnapshotInterval: NodeJS.Timeout;
  private maxEventHistory = 10000;
  private maxEventAge = 7776000000; // 90 days

  constructor() {
    // Clean up old events every hour
    this.eventCleanupInterval = setInterval(
      () => this.cleanupOldEvents(),
      3600000
    );
    
    // Take state snapshots every 15 minutes
    this.stateSnapshotInterval = setInterval(
      () => this.takeStateSnapshot(),
      900000
    );
  }

  /**
   * Update user metadata with event sourcing
   */
  updateUserState(
    userId: string, 
    updates: Partial<UserMetadata>, 
    trigger: string = 'manual_update'
  ): StateChangeEvent {
    const previousState = this.userStates.get(userId);
    
    if (!previousState) {
      throw new Error(`User ${userId} not found. Initialize user first.`);
    }

    // Create new state by merging updates
    const newState: UserMetadata = {
      ...previousState,
      ...updates,
      lastActiveTimestamp: Date.now()
    };

    // Calculate significance of change
    const significance = this.calculateChangeSignificance(previousState, newState);

    // Create state change event
    const event: StateChangeEvent = {
      eventId: `state_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      eventType: this.determineEventType(updates),
      timestamp: Date.now(),
      previousState,
      newState: updates,
      trigger,
      significance
    };

    // Update state
    this.userStates.set(userId, newState);
    this.eventHistory.push(event);

    // Trigger recalculations if needed
    this.triggerRecalculations(userId, newState, event);

    // Notify subscribers
    this.notifySubscribers(event);

    // Clear related caches
    this.cache.clearByPattern(`*${userId}*`);
    CalculationEngine.clearCache(userId);

    return event;
  }

  /**
   * Initialize or get user state
   */
  initializeUserState(userId: string, initialState: UserMetadata): UserMetadata {
    const existing = this.userStates.get(userId);
    
    if (existing) {
      return existing;
    }

    this.userStates.set(userId, initialState);
    
    // Create initialization event
    const event: StateChangeEvent = {
      eventId: `init_${Date.now()}_${userId}`,
      userId,
      eventType: 'metadata_update',
      timestamp: Date.now(),
      previousState: {},
      newState: initialState,
      trigger: 'user_initialization',
      significance: 1.0
    };

    this.eventHistory.push(event);
    this.notifySubscribers(event);

    return initialState;
  }

  /**
   * Get current user state
   */
  getUserState(userId: string): UserMetadata | undefined {
    return this.userStates.get(userId);
  }

  /**
   * Update contextual state specifically
   */
  updateContextualState(
    userId: string, 
    contextUpdates: Partial<ContextualState>,
    trigger: string = 'context_update'
  ): StateChangeEvent {
    const currentState = this.userStates.get(userId);
    
    if (!currentState) {
      throw new Error(`User ${userId} not found`);
    }

    const updatedContext = {
      ...currentState.contextualState,
      ...contextUpdates
    };

    return this.updateUserState(userId, {
      contextualState: updatedContext
    }, trigger);
  }

  /**
   * Record milestone achievement
   */
  recordMilestone(
    userId: string, 
    milestone: Omit<IntegrationMilestone, 'milestoneId' | 'date'>,
    trigger: string = 'milestone_achieved'
  ): StateChangeEvent {
    const currentState = this.userStates.get(userId);
    
    if (!currentState) {
      throw new Error(`User ${userId} not found`);
    }

    const newMilestone: IntegrationMilestone = {
      ...milestone,
      milestoneId: `milestone_${Date.now()}_${userId}`,
      date: Date.now()
    };

    const updatedMilestones = [...currentState.journeyMetrics.integrationMilestones, newMilestone];
    const updatedMetrics = {
      ...currentState.journeyMetrics,
      integrationMilestones: updatedMilestones,
      breakthroughCount: currentState.journeyMetrics.breakthroughCount + 1,
      lastMilestoneDate: Date.now()
    };

    // Update transformation readiness
    const updatedPsychProfile = {
      ...currentState.psychProfile,
      transformationReadiness: Math.min(1, 
        currentState.psychProfile.transformationReadiness + (milestone.significance * 0.1)
      )
    };

    return this.updateUserState(userId, {
      journeyMetrics: updatedMetrics,
      psychProfile: updatedPsychProfile
    }, trigger);
  }

  /**
   * Transition user to new phase
   */
  transitionPhase(
    userId: string, 
    newPhase: SpiralPhase,
    catalyst: string = 'natural_progression'
  ): StateChangeEvent {
    const currentState = this.userStates.get(userId);
    
    if (!currentState) {
      throw new Error(`User ${userId} not found`);
    }

    // Update phase progression metrics
    const phaseTime = Date.now() - currentState.lastActiveTimestamp;
    const updatedProgression = {
      ...currentState.journeyMetrics.phaseProgression,
      [currentState.currentPhase]: (currentState.journeyMetrics.phaseProgression[currentState.currentPhase] || 0) + phaseTime
    };

    const updatedMetrics = {
      ...currentState.journeyMetrics,
      phaseProgression: updatedProgression
    };

    return this.updateUserState(userId, {
      currentPhase: newPhase,
      journeyMetrics: updatedMetrics
    }, `phase_transition_${catalyst}`);
  }

  /**
   * Subscribe to state changes
   */
  subscribeToStateChanges(subscription: Omit<StateSubscription, 'subscriptionId'>): string {
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullSubscription: StateSubscription = {
      ...subscription,
      subscriptionId
    };

    this.subscribers.set(subscriptionId, fullSubscription);
    
    return subscriptionId;
  }

  /**
   * Unsubscribe from state changes
   */
  unsubscribe(subscriptionId: string): boolean {
    return this.subscribers.delete(subscriptionId);
  }

  /**
   * Get user event history
   */
  getUserEventHistory(userId: string, limit: number = 50): StateChangeEvent[] {
    return this.eventHistory
      .filter(event => event.userId === userId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get global state metrics
   */
  getGlobalMetrics(): StateSnapshot['globalMetrics'] {
    const cacheKey = 'global_metrics';
    
    return this.cache.get(cacheKey, () => {
      const userStates = Array.from(this.userStates.values());
      const activeUsers = userStates.filter(state => 
        Date.now() - state.lastActiveTimestamp < 86400000 // Active in last 24 hours
      );

      // Calculate average coherence
      let totalCoherence = 0;
      let coherenceCount = 0;
      
      userStates.forEach(state => {
        const coherence = CalculationEngine.calculateUserCoherence(state);
        totalCoherence += coherence.value;
        coherenceCount++;
      });

      // Calculate elemental distribution
      const elementalDistribution: Record<ElementalType, number> = {
        fire: 0, water: 0, earth: 0, air: 0, aether: 0
      };

      userStates.forEach(state => {
        elementalDistribution[state.currentElement]++;
      });

      // Normalize elemental distribution
      const totalUsers = userStates.length || 1;
      Object.keys(elementalDistribution).forEach(element => {
        elementalDistribution[element as ElementalType] /= totalUsers;
      });

      // Calculate phase distribution
      const phaseDistribution: Record<SpiralPhase, number> = {
        initiation: 0, expansion: 0, integration: 0, mastery: 0
      };

      userStates.forEach(state => {
        phaseDistribution[state.currentPhase]++;
      });

      // Normalize phase distribution
      Object.keys(phaseDistribution).forEach(phase => {
        phaseDistribution[phase as SpiralPhase] /= totalUsers;
      });

      return {
        totalUsers: userStates.length,
        activeUsers: activeUsers.length,
        averageCoherence: coherenceCount > 0 ? totalCoherence / coherenceCount : 0,
        elementalDistribution,
        phaseDistribution
      };
    }, 300000); // Cache for 5 minutes
  }

  /**
   * Take a complete state snapshot for backup/analysis
   */
  takeStateSnapshot(): StateSnapshot {
    const snapshot: StateSnapshot = {
      timestamp: Date.now(),
      userStates: new Map(this.userStates),
      globalMetrics: this.getGlobalMetrics()
    };

    // Could save to persistent storage here
    console.debug(`State snapshot taken: ${snapshot.globalMetrics.totalUsers} users, ${snapshot.globalMetrics.activeUsers} active`);
    
    return snapshot;
  }

  // Private helper methods

  private determineEventType(updates: Partial<UserMetadata>): StateChangeEvent['eventType'] {
    if (updates.currentPhase) return 'phase_transition';
    if (updates.contextualState) return 'context_change';
    if (updates.journeyMetrics?.integrationMilestones) return 'milestone_achieved';
    return 'metadata_update';
  }

  private calculateChangeSignificance(previous: UserMetadata, updated: UserMetadata): number {
    let significance = 0;

    // Phase change is highly significant
    if (previous.currentPhase !== updated.currentPhase) {
      significance += 0.8;
    }

    // Element change is moderately significant
    if (previous.currentElement !== updated.currentElement) {
      significance += 0.5;
    }

    // Archetype change is moderately significant
    if (previous.currentArchetype !== updated.currentArchetype) {
      significance += 0.4;
    }

    // Milestone achievement is significant
    if (updated.journeyMetrics?.integrationMilestones && 
        updated.journeyMetrics.integrationMilestones.length > previous.journeyMetrics.integrationMilestones.length) {
      significance += 0.6;
    }

    // Large coherence changes are significant
    const prevCoherence = CalculationEngine.calculateUserCoherence(previous);
    const newCoherence = CalculationEngine.calculateUserCoherence(updated);
    const coherenceChange = Math.abs(newCoherence.value - prevCoherence.value);
    significance += coherenceChange * 0.3;

    return Math.min(1, significance);
  }

  private triggerRecalculations(userId: string, newState: UserMetadata, event: StateChangeEvent): void {
    // Trigger any dependent recalculations based on the type of change
    if (event.eventType === 'phase_transition') {
      // Recalculate phase readiness for other users (collective effects)
      // This would be implemented based on specific needs
    }

    if (event.significance > 0.5) {
      // Significant changes might affect collective field calculations
      this.cache.clearByPattern('global_*');
    }
  }

  private notifySubscribers(event: StateChangeEvent): void {
    this.subscribers.forEach(subscription => {
      // Check if subscription applies to this event
      if (subscription.userId && subscription.userId !== event.userId) {
        return;
      }

      if (!subscription.eventTypes.includes(event.eventType)) {
        return;
      }

      if (subscription.filter && !subscription.filter(event)) {
        return;
      }

      // Notify subscriber (in production, this should be async and error-handled)
      try {
        subscription.callback(event);
      } catch (error) {
        console.error(`Error in state change subscription ${subscription.subscriptionId}:`, error);
      }
    });
  }

  private cleanupOldEvents(): void {
    const cutoff = Date.now() - this.maxEventAge;
    const originalLength = this.eventHistory.length;
    
    this.eventHistory = this.eventHistory
      .filter(event => event.timestamp > cutoff)
      .slice(-this.maxEventHistory); // Keep only most recent events

    const cleaned = originalLength - this.eventHistory.length;
    if (cleaned > 0) {
      console.debug(`StateManager cleaned up ${cleaned} old events`);
    }
  }

  /**
   * Get state manager statistics
   */
  getStats(): {
    totalUsers: number;
    totalEvents: number;
    activeSubscriptions: number;
    cacheStats: any;
    oldestEvent: number;
    newestEvent: number;
  } {
    const events = this.eventHistory;
    
    return {
      totalUsers: this.userStates.size,
      totalEvents: events.length,
      activeSubscriptions: this.subscribers.size,
      cacheStats: this.cache.getStats(),
      oldestEvent: events.length > 0 ? Math.min(...events.map(e => e.timestamp)) : 0,
      newestEvent: events.length > 0 ? Math.max(...events.map(e => e.timestamp)) : 0
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    clearInterval(this.eventCleanupInterval);
    clearInterval(this.stateSnapshotInterval);
    this.cache.clearAll();
    this.userStates.clear();
    this.eventHistory = [];
    this.subscribers.clear();
  }
}