export enum HolisticDomain {
  MIND = "mind",
  BODY = "body",
  SPIRIT = "spirit",
  EMOTIONS = "emotions",
}

export enum DevelopmentStage {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
}

export enum UserState {
  STRESSED = "stressed",
  SEEKING_CLARITY = "seeking_clarity",
  DISCONNECTED = "disconnected",
  PHYSICAL_CONCERNS = "physical_concerns",
  BALANCED = "balanced",
  ENERGIZED = "energized",
  REFLECTIVE = "reflective",
}

export interface DomainProfile {
  domain: HolisticDomain;
  currentLevel: number;
  developmentStage: DevelopmentStage;
  strengths: string[];
  growthEdges: string[];
  practicesEngaged: string[];
  lastAssessment: Date;
}

export interface UserHolisticProfile {
  userId: string;
  domains: DomainProfile[];
  currentState: UserState;
  stressLevel: number;
  energyLevel: number;
  lifeCircumstances: LifeCircumstance[];
  preferredLearningStyle: LearningStyle;
  developmentGoals: DevelopmentGoal[];
  lastUpdated: Date;
}

export interface LifeCircumstance {
  type: "transition" | "crisis" | "celebration" | "growth" | "maintenance";
  description: string;
  impactLevel: number;
  startDate: Date;
  endDate?: Date;
}

export enum LearningStyle {
  VISUAL = "visual",
  AUDITORY = "auditory",
  KINESTHETIC = "kinesthetic",
  READING_WRITING = "reading_writing",
  MIXED = "mixed",
}

export interface DevelopmentGoal {
  id: string;
  domain: HolisticDomain;
  description: string;
  targetDate?: Date;
  milestones: Milestone[];
  priority: "high" | "medium" | "low";
}

export interface Milestone {
  id: string;
  description: string;
  completed: boolean;
  completedDate?: Date;
}

export interface HolisticRecommendation {
  id: string;
  domains: HolisticDomain[];
  type: "practice" | "insight" | "integration" | "resource";
  title: string;
  description: string;
  complexity: DevelopmentStage;
  estimatedTime: number;
  benefits: string[];
  prerequisites?: string[];
}

export interface AdaptiveContent {
  id: string;
  baseContent: string;
  adaptations: {
    [key in DevelopmentStage]: {
      content: string;
      exercises: Exercise[];
      resources: Resource[];
    };
  };
  domainConnections: DomainConnection[];
}

export interface Exercise {
  id: string;
  title: string;
  instructions: string;
  duration: number;
  domains: HolisticDomain[];
  difficulty: DevelopmentStage;
}

export interface Resource {
  id: string;
  title: string;
  type: "article" | "video" | "audio" | "practice" | "tool";
  url?: string;
  content?: string;
  domains: HolisticDomain[];
}

export interface DomainConnection {
  primaryDomain: HolisticDomain;
  secondaryDomain: HolisticDomain;
  connectionType: "supports" | "enhances" | "balances" | "integrates";
  description: string;
}

export interface StateResponsiveGuidance {
  userState: UserState;
  recommendations: HolisticRecommendation[];
  priorityOrder: string[];
  adaptiveMessage: string;
}

export interface ElementalDomainMapping {
  element: "fire" | "water" | "earth" | "air" | "aether";
  primaryDomains: HolisticDomain[];
  qualities: string[];
  practices: string[];
}

export interface PersonalizedPathway {
  userId: string;
  currentPhase: string;
  pathwaySteps: PathwayStep[];
  integrativeExercises: Exercise[];
  progressMetrics: ProgressMetric[];
}

export interface PathwayStep {
  id: string;
  order: number;
  title: string;
  description: string;
  domains: HolisticDomain[];
  practices: Exercise[];
  expectedDuration: number;
  completionCriteria: string[];
  completed: boolean;
}

export interface ProgressMetric {
  domain: HolisticDomain;
  metricType: "quantitative" | "qualitative";
  currentValue: number | string;
  targetValue: number | string;
  trend: "improving" | "stable" | "declining";
  lastMeasured: Date;
}
