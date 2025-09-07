// Shared types for frontend components
// These replace the backend imports that were causing Vercel build issues

export interface UserDevelopmentMetrics {
  integrationProgress: {
    gatesCompleted: number;
    consistencyScore: number;
    spiralDepth: number;
    averageIntegrationTime: number;
  };
  elementalBalance: Record<
    string,
    {
      contentEngaged: number;
      integrationRate: number;
    }
  >;
  bypassingPrevention: {
    alertsTriggered: number;
    interventionsAccepted: number;
    communityEngagementIncrease: number;
  };
  communityEngagement: {
    realityCheckRequests: number;
    supportOffered: number;
    vulnerabilityShared: number;
    bypassingConcernsRaised: number;
  };
}

export interface PlatformAnalytics {
  totalUsers: number;
  activeUsers: number;
  retentionRates: {
    month1: number;
    month3: number;
    month6: number;
  };
}

export interface ResearchInsights {
  developmentPatterns: {
    commonProgressionPaths: string[];
  };
  bypassingPatterns: {
    effectiveInterventions: string[];
  };
}

export interface AnalyticsData {
  userMetrics?: UserDevelopmentMetrics;
  platformAnalytics?: PlatformAnalytics;
  researchInsights?: ResearchInsights;
  privacyReport?: {
    dataCollected: string[];
    userRights: string[];
  };
  generatedAt: string;
}

export enum ElementalArchetype {
  FIRE = "fire",
  WATER = "water",
  EARTH = "earth",
  AIR = "air",
  AETHER = "aether",
}
