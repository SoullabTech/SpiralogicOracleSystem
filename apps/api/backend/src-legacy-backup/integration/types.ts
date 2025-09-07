export enum IntegrationStage {
  INITIAL_INSIGHT = "initial_insight",
  REFLECTION_GAP = "reflection_gap",
  REALITY_APPLICATION = "reality_application",
  DAILY_INTEGRATION = "daily_integration",
  EMBODIED_WISDOM = "embodied_wisdom",
  SPIRAL_REVISIT = "spiral_revisit",
}

export enum SpiralPhase {
  FOUNDATION = "foundation",
  EXPLORATION = "exploration",
  INTEGRATION = "integration",
  DEEPENING = "deepening",
  SERVICE = "service",
  MAINTENANCE = "maintenance",
}

export enum BypassingPattern {
  INSIGHT_ADDICTION = "insight_addiction",
  EMOTIONAL_AVOIDANCE = "emotional_avoidance",
  SPIRITUAL_SUPERIORITY = "spiritual_superiority",
  TRANSCENDENCE_SEEKING = "transcendence_seeking",
  RESPONSIBILITY_AVOIDANCE = "responsibility_avoidance",
  ORDINARY_REJECTION = "ordinary_rejection",
}

export enum RedFlagSeverity {
  AWARENESS = "awareness",
  CONCERN = "concern",
  INTERVENTION = "intervention",
  PROFESSIONAL_REFERRAL = "professional_referral",
}

export interface IntegrationRequirement {
  id: string;
  type:
    | "reflection"
    | "reality_check"
    | "application"
    | "embodiment"
    | "community_validation";
  description: string;
  minimumDays: number;
  validationCriteria: string[];
  completionPrompts: string[];
  completed: boolean;
  completedDate?: Date;
  evidenceProvided?: string[];
}

export interface ReflectionGap {
  id: string;
  contentId: string;
  startDate: Date;
  minimumDuration: number; // in days
  reflectionPrompts: string[];
  realityCheckQuestions: string[];
  integrationEvidence: IntegrationEvidence[];
  gateStatus: "open" | "processing" | "completed";
  bypassAttempts: number;
}

export interface IntegrationEvidence {
  id: string;
  type:
    | "daily_practice"
    | "relationship_change"
    | "behavior_shift"
    | "ordinary_moment"
    | "struggle_navigation";
  description: string;
  date: Date;
  validated: boolean;
  validatedBy?: "self" | "peer" | "mentor";
  realWorldContext: string;
}

export interface SpiralProgressPoint {
  id: string;
  theme: string;
  depth: number; // 1-10, increases with each spiral return
  phase: SpiralPhase;
  visitDate: Date;
  previousVisits: Date[];
  integrationQuality: number; // 1-10
  realWorldApplication: string[];
  strugglesEncountered: string[];
  ordinaryMoments: string[];
}

export interface BypassingDetection {
  id: string;
  userId: string;
  pattern: BypassingPattern;
  severity: RedFlagSeverity;
  detectedDate: Date;
  triggerEvents: string[];
  interventionRecommended: string;
  professionalReferralSuggested: boolean;
  addressed: boolean;
}

export interface GroundedMetaphysicsContext {
  elementalLanguage: {
    presentedAs: "metaphor" | "framework" | "experiential_tool";
    disclaimers: string[];
    personalExperimentationPrompts: string[];
    realityGroundingQuestions: string[];
  };
  humilityStatements: string[];
  platformLimitations: string[];
  subjectiveExperienceValidation: string[];
}

export interface IntegrationGate {
  id: string;
  contentToUnlock: string;
  requirements: IntegrationRequirement[];
  gateType: "sequential" | "cumulative" | "spiral_depth";
  minimumIntegrationDays: number;
  realWorldApplicationRequired: boolean;
  communityValidationRequired: boolean;
  unlocked: boolean;
  unlockedDate?: Date;
}

export interface EmbodiedWisdomTracking {
  userId: string;
  livedExperiences: LivedExperience[];
  bodyBasedIntegrations: BodyIntegration[];
  mistakesAndStruggles: StruggleWisdom[];
  ordinaryMomentAwareness: OrdinaryMoment[];
  consistencyMetrics: ConsistencyMetric[];
}

export interface LivedExperience {
  id: string;
  insight: string;
  realWorldApplication: string;
  challenges: string[];
  adaptations: string[];
  timeframe: string;
  ongoingPractice: boolean;
}

export interface BodyIntegration {
  id: string;
  somaticAwareness: string;
  physicalPractice: string;
  bodyWisdom: string;
  integrationEvidence: string;
  dailyApplication: string;
}

export interface StruggleWisdom {
  id: string;
  struggle: string;
  lessonsLearned: string[];
  ongoingChallenges: string[];
  wisdomGained: string;
  humilityDeveloped: string;
}

export interface OrdinaryMoment {
  id: string;
  moment: string;
  awareness: string;
  integration: string;
  practiceApplied: string;
  humanness: string;
}

export interface ConsistencyMetric {
  practice: string;
  frequency: "daily" | "weekly" | "monthly";
  consistencyRating: number; // 1-10
  maintainedFor: number; // days
  celebratedBy: "self" | "community" | "mentor";
}

export interface AntiCommodificationSafeguards {
  transformationPromiseDetection: {
    flaggedPhrases: string[];
    replacementLanguage: string[];
    preventionActive: boolean;
  };
  pacingAlgorithms: {
    insightSeekingUserDetection: boolean;
    mandatorySlowDown: boolean;
    integrationPeriodEnforcement: boolean;
  };
  humanityEmphasis: {
    transcendenceSeekingPrevention: boolean;
    ordinaryStruggleValidation: boolean;
    beingHumanCelebration: boolean;
  };
}

export interface CommunityIntegrationFeatures {
  realityChecking: {
    peerValidation: boolean;
    groundingConversations: boolean;
    ordinaryMomentSharing: boolean;
  };
  mentorship: {
    embodiedIntegrationGuides: boolean;
    professionalResourceConnections: boolean;
    longTermRelationshipSupport: boolean;
  };
  struggleValidation: {
    mundaneProgressCelebration: boolean;
    plateauPeriodSupport: boolean;
    regressionNormalization: boolean;
  };
}

export interface IntegrationArchitecture {
  userId: string;
  currentStage: IntegrationStage;
  spiralProgress: SpiralProgressPoint[];
  activeGates: IntegrationGate[];
  bypassingHistory: BypassingDetection[];
  embodiedWisdom: EmbodiedWisdomTracking;
  communityIntegration: CommunityIntegrationFeatures;
  safeguards: AntiCommodificationSafeguards;
  groundedContext: GroundedMetaphysicsContext;
  lastIntegrationCheck: Date;
  nextMandatoryIntegration: Date;
  professionalSupportRecommended: boolean;
}

export interface RealityGroundingPrompt {
  id: string;
  context: string;
  prompt: string;
  followUpQuestions: string[];
  redFlagIndicators: string[];
  groundingActions: string[];
}

export interface IntegrationValidation {
  type:
    | "self_assessment"
    | "peer_feedback"
    | "mentor_observation"
    | "real_world_evidence";
  criteria: string[];
  evidence: string[];
  validated: boolean;
  validationDate: Date;
  notes: string;
}

export interface ProfessionalSupportTrigger {
  pattern: BypassingPattern;
  severity: RedFlagSeverity;
  triggerCriteria: string[];
  recommendedAction: string;
  resourcesProvided: string[];
  followUpRequired: boolean;
}
