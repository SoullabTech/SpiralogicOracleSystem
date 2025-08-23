/**
 * Domain Types for Integration System
 * Pure domain concepts without infrastructure dependencies
 */

export type UserState = "balanced" | "stressed" | "energized" | "overwhelmed" | "grounded";

export type HolisticDomain = 
  | "spiritual" 
  | "emotional" 
  | "mental" 
  | "physical" 
  | "relational" 
  | "creative" 
  | "professional";

export type DevelopmentStage = 
  | "beginner" 
  | "developing" 
  | "competent" 
  | "proficient" 
  | "expert" 
  | "mastery";

export interface UserHolisticProfile {
  userId: string;
  domains: DomainProfile[];
  currentState: UserState;
  stressLevel: number;
  energyLevel: number;
  lifeCircumstances: string[];
  preferredLearningStyle: "visual" | "auditory" | "kinesthetic" | "mixed";
  developmentGoals: string[];
  lastUpdated: Date;
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

export interface IntegrationArchitecture {
  userId: string;
  spiralProgress: SpiralProgressPoint[];
  integrationGates: IntegrationGate[];
  bypassingDetections: BypassingDetection[];
  embodiedWisdomTracking: EmbodiedWisdomTracking[];
}

export interface SpiralProgressPoint {
  theme: string;
  depth: number;
  phase: "encounter" | "exploration" | "integration" | "embodiment";
  visitDate: Date;
  previousVisits: number;
  integrationQuality: number;
  realWorldApplication: string[];
  strugglesEncountered: string[];
  ordinaryMoments: string[];
}

export interface IntegrationGate {
  contentToUnlock: string;
  gateType: "time_based" | "integration_based" | "community_validation";
  minimumIntegrationDays: number;
  requirements: string[];
  realWorldApplicationRequired: boolean;
  communityValidationRequired: boolean;
  unlocked: boolean;
  unlockedDate?: Date;
}

export interface BypassingDetection {
  pattern: string;
  severity: "low" | "medium" | "high";
  triggerEvents: string[];
  behaviorIndicators: string[];
  patternFrequency: number;
  interventionRecommended: boolean;
  professionalReferralSuggested: boolean;
  addressed: boolean;
  addressedDate?: Date;
}

export interface EmbodiedWisdomTracking {
  type: "somatic_awareness" | "struggle_integration" | "ordinary_moment" | "consistent_practice";
  title: string;
  description: string;
  validated: boolean;
  validationNotes?: string;
  createdAt: Date;
}

export interface CommunityInteraction {
  interactionType: "sharing" | "support_offering" | "validation" | "feedback";
  content: string;
  context: string;
  targetUserId?: string;
  groupContext?: string;
  visibility: "private" | "supportive" | "open";
  createdAt: Date;
}

export interface ProfessionalConnection {
  professionalId: string;
  connectionType: "therapy" | "coaching" | "spiritual_direction" | "consultation";
  initiatedBy: "user" | "professional" | "platform";
  connectionReason: string;
  platformIntegrationConsent: boolean;
  dataSharingLevel: "minimal" | "moderate" | "comprehensive";
  active: boolean;
  createdAt: Date;
}