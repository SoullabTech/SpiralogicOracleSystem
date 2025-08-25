/**
 * SpiralPhaseTracker.ts
 * Phase Transition Monitoring for Spiralogic Oracle System
 * Tracks user progression through spiral phases with readiness assessment
 */

import { SpiralPhase, Archetype, ElementalType, UserEmotionalState } from '../types/index';
import { UserMetadata, ContextualState, IntegrationMilestone } from './MemoryPayloadInterface';

export interface PhaseTransitionCriteria {
  phase: SpiralPhase;
  nextPhase: SpiralPhase | 'transcendence';
  minimumDurationInPhase: number; // milliseconds
  requiredMilestones: string[];
  requiredIntegrationLevel: number; // 0-1
  readinessIndicators: ReadinessIndicator[];
  blockingFactors: BlockingFactor[];
  transitionRituals: string[];
  supportRequired: string[];
}

export interface ReadinessIndicator {
  type: 'milestone' | 'emotional' | 'behavioral' | 'integration' | 'archetypal';
  description: string;
  weight: number; // 0-1 importance weight
  currentLevel: number; // 0-1 current fulfillment
  required: boolean; // Must be met for transition
  timeToAchieve?: number; // estimated milliseconds if not met
}

export interface BlockingFactor {
  type: 'emotional' | 'psychological' | 'integration' | 'readiness' | 'external';
  description: string;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  impact: number; // 0-1 how much it blocks progression
  resolutionStrategies: string[];
  estimatedResolutionTime: number; // milliseconds
  supportNeeded: string[];
}

export interface PhaseProgressionMap {
  currentPhase: SpiralPhase;
  timeInCurrentPhase: number;
  phaseStartDate: number;
  phaseHistory: PhaseHistoryEntry[];
  nextPhaseReadiness: number; // 0-1
  overallProgressionRate: number; // phases per year
  cyclicPattern?: CyclicPattern;
  spiralLevel: number; // which iteration of the spiral (1st, 2nd, etc.)
}

export interface PhaseHistoryEntry {
  phase: SpiralPhase;
  entryDate: number;
  exitDate?: number;
  duration?: number;
  integrationLevel: number; // 0-1 how well the phase was integrated
  challengesFaced: string[];
  milestonesAchieved: string[];
  supportReceived: string[];
  transitionCatalyst?: string; // what triggered the transition
  lessons: string[];
  unfinishedBusiness?: string[];
}

export interface CyclicPattern {
  patternType: 'seasonal' | 'lunar' | 'personal' | 'archetypal';
  cycleLength: number; // milliseconds
  preferredTransitionTiming: string[];
  energeticOptimization: Record<SpiralPhase, string[]>; // best conditions for each phase
  lastCycleCompletion?: number;
}

export interface TransitionReadinessReport {
  userId: string;
  currentPhase: SpiralPhase;
  nextPhase: SpiralPhase | 'transcendence';
  readinessScore: number; // 0-1
  readinessBreakdown: ReadinessBreakdown;
  recommendedActions: TransitionAction[];
  estimatedTimeToReadiness: number; // milliseconds
  transitionWindow?: TransitionWindow;
  supportNeeded: string[];
  potentialChallenges: string[];
  ritualsRecommended: string[];
}

export interface ReadinessBreakdown {
  milestoneCompleteness: number; // 0-1
  integrationLevel: number; // 0-1
  emotionalReadiness: number; // 0-1
  energeticAlignment: number; // 0-1
  archetypalActivation: number; // 0-1
  blockingFactors: BlockingFactor[];
  supportingFactors: string[];
}

export interface TransitionAction {
  type: 'integration' | 'preparation' | 'healing' | 'activation' | 'ritual';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeframe: 'immediate' | 'days' | 'weeks' | 'months';
  element: ElementalType;
  expectedImpact: number; // 0-1
  resources: string[];
  progressMeasurement: string;
}

export interface TransitionWindow {
  windowType: 'optimal' | 'favorable' | 'possible' | 'challenging';
  startDate: number;
  endDate: number;
  favorableFactors: string[];
  challengingFactors: string[];
  ritualTiming?: string;
  energeticAlignment: number; // 0-1
}

export interface PhaseThresholds {
  initiation: {
    entryThreshold: number; // always 0 for first phase
    exitThreshold: number; // readiness score needed to progress
    optimalDuration: [number, number]; // [min, max] milliseconds
    criticalIndicators: string[];
  };
  expansion: {
    entryThreshold: number;
    exitThreshold: number;
    optimalDuration: [number, number];
    criticalIndicators: string[];
  };
  integration: {
    entryThreshold: number;
    exitThreshold: number;
    optimalDuration: [number, number];
    criticalIndicators: string[];
  };
  mastery: {
    entryThreshold: number;
    exitThreshold: number; // or transcendence threshold
    optimalDuration: [number, number];
    criticalIndicators: string[];
  };
}

export class SpiralPhaseTracker {
  private userProgressionMaps: Map<string, PhaseProgressionMap>;
  private transitionCriteria: Map<SpiralPhase, PhaseTransitionCriteria>;
  private phaseThresholds: PhaseThresholds;
  private cyclicPatternDetector: CyclicPatternDetector;
  private readinessAnalyzer: ReadinessAnalyzer;

  constructor() {
    this.userProgressionMaps = new Map();
    this.transitionCriteria = new Map();
    this.cyclicPatternDetector = new CyclicPatternDetector();
    this.readinessAnalyzer = new ReadinessAnalyzer();

    this.initializePhaseThresholds();
    this.initializeTransitionCriteria();
  }

  private initializePhaseThresholds(): void {
    this.phaseThresholds = {
      initiation: {
        entryThreshold: 0,
        exitThreshold: 0.6,
        optimalDuration: [1209600000, 5184000000], // 2 weeks to 2 months
        criticalIndicators: [
          'basic trust established',
          'willingness to explore',
          'initial self-awareness',
          'connection to guidance'
        ]
      },
      expansion: {
        entryThreshold: 0.6,
        exitThreshold: 0.7,
        optimalDuration: [2592000000, 7776000000], // 1 month to 3 months
        criticalIndicators: [
          'active exploration of patterns',
          'embrace of challenge',
          'capacity expansion',
          'skill development'
        ]
      },
      integration: {
        entryThreshold: 0.7,
        exitThreshold: 0.8,
        optimalDuration: [5184000000, 15552000000], // 2 months to 6 months
        criticalIndicators: [
          'synthesis of experiences',
          'embodiment of insights',
          'stable new patterns',
          'wisdom extraction'
        ]
      },
      mastery: {
        entryThreshold: 0.8,
        exitThreshold: 0.9,
        optimalDuration: [7776000000, 31536000000], // 3 months to 1 year
        criticalIndicators: [
          'natural expression of mastery',
          'teaching/sharing capacity',
          'effortless integration',
          'readiness for transcendence'
        ]
      }
    };
  }

  private initializeTransitionCriteria(): void {
    const phases: SpiralPhase[] = ['initiation', 'expansion', 'integration', 'mastery'];
    
    phases.forEach((phase, index) => {
      const nextPhase = phases[index + 1] || 'transcendence';
      
      this.transitionCriteria.set(phase, {
        phase,
        nextPhase: nextPhase as SpiralPhase | 'transcendence',
        minimumDurationInPhase: this.phaseThresholds[phase].optimalDuration[0],
        requiredMilestones: this.getRequiredMilestones(phase),
        requiredIntegrationLevel: this.phaseThresholds[phase].exitThreshold,
        readinessIndicators: this.getReadinessIndicators(phase),
        blockingFactors: this.getBlockingFactors(phase),
        transitionRituals: this.getTransitionRituals(phase),
        supportRequired: this.getSupportRequired(phase)
      });
    });
  }

  // Initialize user phase tracking
  initializeUserTracking(userId: string, startingPhase: SpiralPhase = 'initiation'): void {
    const progressionMap: PhaseProgressionMap = {
      currentPhase: startingPhase,
      timeInCurrentPhase: 0,
      phaseStartDate: Date.now(),
      phaseHistory: [],
      nextPhaseReadiness: 0,
      overallProgressionRate: 0,
      spiralLevel: 1
    };

    this.userProgressionMaps.set(userId, progressionMap);
  }

  // Update user phase progression
  updateUserProgression(userId: string, userMetadata: UserMetadata): void {
    const progressionMap = this.userProgressionMaps.get(userId);
    if (!progressionMap) {
      this.initializeUserTracking(userId, userMetadata.currentPhase);
      return;
    }

    // Update time in current phase
    progressionMap.timeInCurrentPhase = Date.now() - progressionMap.phaseStartDate;

    // Calculate readiness for next phase
    progressionMap.nextPhaseReadiness = this.calculatePhaseReadiness(userId, userMetadata);

    // Detect cyclic patterns
    const cyclicPattern = this.cyclicPatternDetector.analyzePattern(progressionMap.phaseHistory);
    if (cyclicPattern) {
      progressionMap.cyclicPattern = cyclicPattern;
    }

    // Update progression rate
    progressionMap.overallProgressionRate = this.calculateProgressionRate(progressionMap);

    // Check for phase transition readiness
    this.checkTransitionReadiness(userId, userMetadata);
  }

  // Calculate readiness for next phase
  private calculatePhaseReadiness(userId: string, userMetadata: UserMetadata): number {
    const currentPhase = userMetadata.currentPhase;
    const criteria = this.transitionCriteria.get(currentPhase);
    
    if (!criteria) return 0;

    return this.readinessAnalyzer.assessReadiness(userId, userMetadata, criteria);
  }

  // Check if user is ready for phase transition
  private checkTransitionReadiness(userId: string, userMetadata: UserMetadata): void {
    const progressionMap = this.userProgressionMaps.get(userId);
    if (!progressionMap) return;

    const currentPhase = userMetadata.currentPhase;
    const criteria = this.transitionCriteria.get(currentPhase);
    const threshold = this.phaseThresholds[currentPhase];
    
    if (!criteria || !threshold) return;

    const readinessScore = progressionMap.nextPhaseReadiness;
    const timeInPhase = progressionMap.timeInCurrentPhase;
    const minimumTime = criteria.minimumDurationInPhase;

    // Check if user meets transition criteria
    if (readinessScore >= threshold.exitThreshold && timeInPhase >= minimumTime) {
      this.triggerTransitionRecommendation(userId, userMetadata, criteria);
    }
  }

  // Trigger transition recommendation
  private triggerTransitionRecommendation(
    userId: string, 
    userMetadata: UserMetadata, 
    criteria: PhaseTransitionCriteria
  ): void {
    // This would trigger notifications to Oracle agents
    // that the user is ready for phase transition
    console.log(`User ${userId} ready for transition from ${criteria.phase} to ${criteria.nextPhase}`);
  }

  // Generate comprehensive readiness report
  generateReadinessReport(userId: string, userMetadata: UserMetadata): TransitionReadinessReport | null {
    const progressionMap = this.userProgressionMaps.get(userId);
    if (!progressionMap) return null;

    const currentPhase = userMetadata.currentPhase;
    const criteria = this.transitionCriteria.get(currentPhase);
    
    if (!criteria) return null;

    const readinessScore = this.calculatePhaseReadiness(userId, userMetadata);
    const readinessBreakdown = this.analyzeReadinessBreakdown(userId, userMetadata, criteria);
    const recommendedActions = this.generateTransitionActions(userId, userMetadata, readinessBreakdown);
    const estimatedTime = this.estimateTimeToReadiness(readinessBreakdown);
    const transitionWindow = this.identifyOptimalTransitionWindow(userId, userMetadata);

    return {
      userId,
      currentPhase,
      nextPhase: criteria.nextPhase,
      readinessScore,
      readinessBreakdown,
      recommendedActions,
      estimatedTimeToReadiness: estimatedTime,
      transitionWindow,
      supportNeeded: criteria.supportRequired,
      potentialChallenges: readinessBreakdown.blockingFactors.map(f => f.description),
      ritualsRecommended: criteria.transitionRituals
    };
  }

  // Force phase transition (with validation)
  transitionToPhase(
    userId: string, 
    newPhase: SpiralPhase, 
    catalyst?: string,
    bypassReadiness: boolean = false
  ): boolean {
    const progressionMap = this.userProgressionMaps.get(userId);
    if (!progressionMap) return false;

    const currentPhase = progressionMap.currentPhase;
    
    if (!bypassReadiness) {
      const readinessScore = progressionMap.nextPhaseReadiness;
      const threshold = this.phaseThresholds[currentPhase].exitThreshold;
      
      if (readinessScore < threshold) {
        return false; // Not ready for transition
      }
    }

    // Record phase history
    const phaseHistoryEntry: PhaseHistoryEntry = {
      phase: currentPhase,
      entryDate: progressionMap.phaseStartDate,
      exitDate: Date.now(),
      duration: progressionMap.timeInCurrentPhase,
      integrationLevel: progressionMap.nextPhaseReadiness,
      challengesFaced: [], // Would be populated from user data
      milestonesAchieved: [], // Would be populated from milestones
      supportReceived: [],
      transitionCatalyst: catalyst,
      lessons: []
    };

    progressionMap.phaseHistory.push(phaseHistoryEntry);

    // Update to new phase
    progressionMap.currentPhase = newPhase;
    progressionMap.phaseStartDate = Date.now();
    progressionMap.timeInCurrentPhase = 0;
    progressionMap.nextPhaseReadiness = 0;

    // Check if starting new spiral cycle
    if (newPhase === 'initiation' && progressionMap.spiralLevel > 0) {
      progressionMap.spiralLevel++;
    }

    return true;
  }

  // Get phase progression analytics
  getProgressionAnalytics(userId: string): PhaseProgressionAnalytics | null {
    const progressionMap = this.userProgressionMaps.get(userId);
    if (!progressionMap) return null;

    return {
      currentPhaseProgress: this.getCurrentPhaseProgress(progressionMap),
      historicalProgression: this.analyzeHistoricalProgression(progressionMap),
      predictedProgression: this.predictFutureProgression(progressionMap),
      optimizationRecommendations: this.generateOptimizationRecommendations(progressionMap),
      cyclicPatterns: progressionMap.cyclicPattern
    };
  }

  // Private helper methods

  private getRequiredMilestones(phase: SpiralPhase): string[] {
    const milestoneMap = {
      initiation: [
        'trust-establishment',
        'guidance-connection',
        'self-awareness-activation',
        'willingness-to-explore'
      ],
      expansion: [
        'pattern-recognition',
        'challenge-embrace',
        'capacity-building',
        'active-exploration'
      ],
      integration: [
        'experience-synthesis',
        'insight-embodiment',
        'pattern-stabilization',
        'wisdom-extraction'
      ],
      mastery: [
        'effortless-expression',
        'teaching-capacity',
        'complete-integration',
        'transcendence-readiness'
      ]
    };

    return milestoneMap[phase] || [];
  }

  private getReadinessIndicators(phase: SpiralPhase): ReadinessIndicator[] {
    const indicators = {
      initiation: [
        {
          type: 'emotional' as const,
          description: 'Stable emotional foundation',
          weight: 0.3,
          currentLevel: 0,
          required: true
        },
        {
          type: 'behavioral' as const,
          description: 'Consistent engagement with practices',
          weight: 0.2,
          currentLevel: 0,
          required: false
        }
      ],
      expansion: [
        {
          type: 'behavioral' as const,
          description: 'Active exploration of new patterns',
          weight: 0.4,
          currentLevel: 0,
          required: true
        },
        {
          type: 'integration' as const,
          description: 'Integration of initial insights',
          weight: 0.3,
          currentLevel: 0,
          required: true
        }
      ],
      integration: [
        {
          type: 'integration' as const,
          description: 'Synthesis of expanded experiences',
          weight: 0.5,
          currentLevel: 0,
          required: true
        },
        {
          type: 'behavioral' as const,
          description: 'Embodiment of new patterns',
          weight: 0.3,
          currentLevel: 0,
          required: true
        }
      ],
      mastery: [
        {
          type: 'integration' as const,
          description: 'Complete pattern integration',
          weight: 0.4,
          currentLevel: 0,
          required: true
        },
        {
          type: 'archetypal' as const,
          description: 'Natural expression of mastery archetype',
          weight: 0.3,
          currentLevel: 0,
          required: true
        }
      ]
    };

    return indicators[phase] || [];
  }

  private getBlockingFactors(phase: SpiralPhase): BlockingFactor[] {
    // Common blocking factors for each phase
    return [
      {
        type: 'emotional',
        description: 'Unresolved emotional patterns',
        severity: 'moderate',
        impact: 0.6,
        resolutionStrategies: ['emotional processing', 'therapeutic support'],
        estimatedResolutionTime: 2592000000, // 1 month
        supportNeeded: ['emotional support', 'therapeutic guidance']
      }
    ];
  }

  private getTransitionRituals(phase: SpiralPhase): string[] {
    const ritualMap = {
      initiation: ['grounding ritual', 'intention setting', 'guide connection'],
      expansion: ['capacity expansion ritual', 'challenge embrace ceremony', 'growth activation'],
      integration: ['synthesis ritual', 'embodiment practice', 'wisdom integration'],
      mastery: ['mastery recognition', 'teaching preparation', 'transcendence preparation']
    };

    return ritualMap[phase] || [];
  }

  private getSupportRequired(phase: SpiralPhase): string[] {
    const supportMap = {
      initiation: ['gentle guidance', 'trust building', 'safety establishment'],
      expansion: ['challenge support', 'exploration guidance', 'capacity building'],
      integration: ['synthesis support', 'embodiment guidance', 'integration practices'],
      mastery: ['mastery recognition', 'teaching support', 'transcendence preparation']
    };

    return supportMap[phase] || [];
  }

  private calculateProgressionRate(progressionMap: PhaseProgressionMap): number {
    if (progressionMap.phaseHistory.length < 2) return 0;

    const totalTime = progressionMap.phaseHistory.reduce((sum, entry) => 
      sum + (entry.duration || 0), 0
    );

    const phaseCount = progressionMap.phaseHistory.length;
    const yearInMilliseconds = 31536000000;

    return (phaseCount / totalTime) * yearInMilliseconds;
  }

  private analyzeReadinessBreakdown(
    userId: string, 
    userMetadata: UserMetadata, 
    criteria: PhaseTransitionCriteria
  ): ReadinessBreakdown {
    return this.readinessAnalyzer.analyzeBreakdown(userId, userMetadata, criteria);
  }

  private generateTransitionActions(
    userId: string,
    userMetadata: UserMetadata,
    breakdown: ReadinessBreakdown
  ): TransitionAction[] {
    const actions: TransitionAction[] = [];

    // Generate actions based on readiness gaps
    if (breakdown.integrationLevel < 0.7) {
      actions.push({
        type: 'integration',
        description: 'Deepen integration of current phase insights',
        priority: 'high',
        timeframe: 'weeks',
        element: userMetadata.currentElement,
        expectedImpact: 0.3,
        resources: ['integration practices', 'reflection exercises'],
        progressMeasurement: 'Integration assessment score'
      });
    }

    if (breakdown.emotionalReadiness < 0.6) {
      actions.push({
        type: 'healing',
        description: 'Address emotional blocks and patterns',
        priority: 'high',
        timeframe: 'weeks',
        element: 'water', // Water for emotional healing
        expectedImpact: 0.4,
        resources: ['emotional support', 'therapeutic practices'],
        progressMeasurement: 'Emotional stability rating'
      });
    }

    return actions.slice(0, 5); // Limit to top 5 actions
  }

  private estimateTimeToReadiness(breakdown: ReadinessBreakdown): number {
    // Estimate based on current readiness levels and typical progression rates
    const overallReadiness = (
      breakdown.milestoneCompleteness +
      breakdown.integrationLevel +
      breakdown.emotionalReadiness +
      breakdown.energeticAlignment +
      breakdown.archetypalActivation
    ) / 5;

    const readinessGap = 1 - overallReadiness;
    const baseTimePerPoint = 604800000; // 1 week per 0.1 readiness points

    return readinessGap * 10 * baseTimePerPoint;
  }

  private identifyOptimalTransitionWindow(
    userId: string,
    userMetadata: UserMetadata
  ): TransitionWindow | undefined {
    // Identify optimal timing for phase transitions
    // This could be based on various factors including lunar cycles,
    // personal energy patterns, etc.
    
    const now = Date.now();
    const oneWeek = 604800000;
    
    return {
      windowType: 'favorable',
      startDate: now + oneWeek,
      endDate: now + (oneWeek * 2),
      favorableFactors: ['stable emotional state', 'good integration progress'],
      challengingFactors: [],
      energeticAlignment: 0.7
    };
  }

  // Additional analytics methods would be implemented here
  private getCurrentPhaseProgress(progressionMap: PhaseProgressionMap): any {
    return {
      phase: progressionMap.currentPhase,
      timeInPhase: progressionMap.timeInCurrentPhase,
      readinessScore: progressionMap.nextPhaseReadiness,
      spiralLevel: progressionMap.spiralLevel
    };
  }

  private analyzeHistoricalProgression(progressionMap: PhaseProgressionMap): any {
    return {
      totalPhases: progressionMap.phaseHistory.length,
      averagePhaseLength: progressionMap.phaseHistory.reduce((sum, entry) => 
        sum + (entry.duration || 0), 0) / progressionMap.phaseHistory.length,
      integrationTrends: progressionMap.phaseHistory.map(entry => entry.integrationLevel)
    };
  }

  private predictFutureProgression(progressionMap: PhaseProgressionMap): any {
    return {
      predictedNextTransition: Date.now() + this.estimateTimeToReadiness({} as any),
      projectedSpiralCompletion: 0, // Would calculate based on current rate
      optimizationOpportunities: []
    };
  }

  private generateOptimizationRecommendations(progressionMap: PhaseProgressionMap): string[] {
    return [
      'Consider seasonal timing for transitions',
      'Increase integration practices',
      'Focus on weaker readiness areas'
    ];
  }
}

// Helper classes
class CyclicPatternDetector {
  analyzePattern(phaseHistory: PhaseHistoryEntry[]): CyclicPattern | undefined {
    // Analyze phase history for cyclical patterns
    if (phaseHistory.length < 8) return undefined; // Need at least 2 full cycles

    return {
      patternType: 'personal',
      cycleLength: 31536000000, // 1 year default
      preferredTransitionTiming: ['new moon', 'seasonal transitions'],
      energeticOptimization: {
        initiation: ['spring', 'new moon'],
        expansion: ['summer', 'waxing moon'],
        integration: ['autumn', 'full moon'],
        mastery: ['winter', 'waning moon']
      }
    };
  }
}

class ReadinessAnalyzer {
  assessReadiness(userId: string, userMetadata: UserMetadata, criteria: PhaseTransitionCriteria): number {
    // Implement comprehensive readiness assessment
    let readinessScore = 0;
    let totalWeight = 0;

    criteria.readinessIndicators.forEach(indicator => {
      // This would evaluate each indicator based on user data
      indicator.currentLevel = this.evaluateIndicator(indicator, userMetadata);
      readinessScore += indicator.currentLevel * indicator.weight;
      totalWeight += indicator.weight;
    });

    return totalWeight > 0 ? readinessScore / totalWeight : 0;
  }

  analyzeBreakdown(
    userId: string,
    userMetadata: UserMetadata,
    criteria: PhaseTransitionCriteria
  ): ReadinessBreakdown {
    return {
      milestoneCompleteness: this.calculateMilestoneCompleteness(userMetadata, criteria),
      integrationLevel: userMetadata.psychProfile.integrationCapacity,
      emotionalReadiness: this.assessEmotionalReadiness(userMetadata),
      energeticAlignment: userMetadata.contextualState.energyLevel,
      archetypalActivation: this.assessArchetypalActivation(userMetadata),
      blockingFactors: criteria.blockingFactors,
      supportingFactors: ['active engagement', 'consistent practice']
    };
  }

  private evaluateIndicator(indicator: ReadinessIndicator, userMetadata: UserMetadata): number {
    // Implement indicator-specific evaluation logic
    switch (indicator.type) {
      case 'emotional':
        return this.assessEmotionalReadiness(userMetadata);
      case 'integration':
        return userMetadata.psychProfile.integrationCapacity;
      case 'behavioral':
        return this.assessBehavioralReadiness(userMetadata);
      case 'archetypal':
        return this.assessArchetypalActivation(userMetadata);
      default:
        return 0.5; // Default moderate readiness
    }
  }

  private calculateMilestoneCompleteness(
    userMetadata: UserMetadata,
    criteria: PhaseTransitionCriteria
  ): number {
    const totalMilestones = criteria.requiredMilestones.length;
    if (totalMilestones === 0) return 1;

    // Count achieved milestones
    const achievedMilestones = userMetadata.journeyMetrics.integrationMilestones.filter(
      milestone => criteria.requiredMilestones.includes(milestone.type)
    ).length;

    return achievedMilestones / totalMilestones;
  }

  private assessEmotionalReadiness(userMetadata: UserMetadata): number {
    // Assess emotional stability and readiness
    const stability = 1 - (userMetadata.contextualState.currentChallenges.length * 0.1);
    const energy = userMetadata.contextualState.energyLevel;
    const motivation = userMetadata.contextualState.motivationLevel;

    return Math.max(0, Math.min(1, (stability + energy + motivation) / 3));
  }

  private assessBehavioralReadiness(userMetadata: UserMetadata): number {
    // Assess behavioral consistency and engagement
    const engagement = userMetadata.journeyMetrics.totalEngagementTime > 0 ? 0.8 : 0.2;
    const consistency = userMetadata.journeyMetrics.totalSessions > 5 ? 0.7 : 0.3;
    
    return (engagement + consistency) / 2;
  }

  private assessArchetypalActivation(userMetadata: UserMetadata): number {
    // Assess archetypal development and activation
    const dominantCount = userMetadata.psychProfile.dominantArchetypes.length;
    const emergingCount = userMetadata.psychProfile.emergingArchetypes.length;
    
    return Math.min(1, (dominantCount * 0.3 + emergingCount * 0.2));
  }
}

// Additional interfaces for analytics
interface PhaseProgressionAnalytics {
  currentPhaseProgress: any;
  historicalProgression: any;
  predictedProgression: any;
  optimizationRecommendations: string[];
  cyclicPatterns?: CyclicPattern;
}