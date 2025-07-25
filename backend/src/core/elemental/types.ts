export enum ElementalArchetype {
  FIRE = 'fire',
  WATER = 'water', 
  EARTH = 'earth',
  AIR = 'air'
}

export enum ContentComplexity {
  FOUNDATIONAL = 'foundational',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  INTEGRATION_FOCUSED = 'integration_focused'
}

export enum ContentType {
  INSIGHT = 'insight',
  PRACTICE = 'practice',
  REFLECTION = 'reflection',
  COMMUNITY_PROMPT = 'community_prompt',
  INTEGRATION_EXERCISE = 'integration_exercise',
  REALITY_CHECK = 'reality_check'
}

export interface ElementalContent {
  id: string;
  title: string;
  archetype: ElementalArchetype;
  complexity: ContentComplexity;
  contentType: ContentType;
  description: string;
  content: string;
  metaphoricalFraming: string;
  realWorldApplications: string[];
  integrationRequirements: IntegrationRequirement[];
  prerequisiteGates: string[];
  estimatedEngagementTime: number; // minutes
  integrationPeriod: number; // days
  bypassingAlerts: string[];
  disclaimers: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IntegrationRequirement {
  type: 'reflection' | 'application' | 'community_validation' | 'consistency_demonstration';
  description: string;
  minimumPeriod: number; // days
  validationCriteria: string[];
}

export interface ContentDeliveryContext {
  userId: string;
  currentStage: string;
  recentBypassingPatterns: string[];
  integrationCapacity: number; // 1-10 scale
  stressLevel: number;
  energyLevel: number;
  lastContentAccess: Date;
  unintegratedContent: string[];
}

export interface ContentRecommendation {
  content: ElementalContent;
  adaptationReason: string;
  prerequisitesMet: boolean;
  integrationReadiness: number; // 1-10 scale
  recommendedApproach: string;
  realityGroundingPrompts: string[];
  communityEngagementSuggestions: string[];
}

export interface ElementalContentLibrary {
  fire: ElementalContent[];
  water: ElementalContent[];
  earth: ElementalContent[];
  air: ElementalContent[];
}

export interface UserElementalProfile {
  userId: string;
  primaryArchetype: ElementalArchetype;
  secondaryArchetype?: ElementalArchetype;
  archetypeStrengths: Record<ElementalArchetype, number>; // 1-10 scale
  contentHistory: ContentEngagement[];
  integrationPattern: string;
  lastAssessment: Date;
}

export interface ContentEngagement {
  contentId: string;
  accessedAt: Date;
  engagementDuration: number; // minutes
  integrationStarted: boolean;
  integrationCompleted: boolean;
  realWorldApplications: string[];
  strugglesEncountered: string[];
  communityFeedbackSought: boolean;
  bypassingPatternsDetected: string[];
}

export interface CrossDomainIntegration {
  domains: ElementalArchetype[];
  integrationTheme: string;
  realWorldScenarios: string[];
  practiceRequirements: string[];
  communityValidation: boolean;
  progressMarkers: string[];
}

export interface ContentAdaptationSettings {
  emphasizeMetaphorical: boolean;
  includeDisclaimers: boolean;
  requireCommunityValidation: boolean;
  enableCrossDomainIntegration: boolean;
  preventConsumptionBehavior: boolean;
  minimumIntegrationGaps: number; // days
}