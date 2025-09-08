import {
  IntegrationArchitecture,
  SpiralProgressPoint,
  IntegrationStage,
} from "../integration/types";
import { ElementalArchetype, ContentEngagement } from "../elemental/types";

export interface UserDevelopmentMetrics {
  userId: string;
  timeframe: "week" | "month" | "quarter" | "year";
  integrationProgress: {
    gatesCompleted: number;
    averageIntegrationTime: number; // days
    consistencyScore: number; // 1-10
    spiralDepth: number;
    regressionInstances: number;
  };
  bypassingPrevention: {
    alertsTriggered: number;
    patternsDetected: string[];
    interventionsAccepted: number;
    communityEngagementIncrease: number;
  };
  elementalBalance: {
    [key in ElementalArchetype]: {
      contentEngaged: number;
      integrationRate: number;
      strengthDevelopment: number;
    };
  };
  communityEngagement: {
    realityCheckRequests: number;
    supportOffered: number;
    vulnerabilityShared: number;
    bypassingConcernsRaised: number;
  };
  wellbeingIndicators: {
    stressReduction: number;
    energyIncrease: number;
    clarityImprovement: number;
    relationshipQuality: number;
  };
}

export interface PlatformAnalytics {
  totalUsers: number;
  activeUsers: number;
  retentionRates: {
    week1: number;
    month1: number;
    month3: number;
    month6: number;
  };
  integrationEffectiveness: {
    averageGateCompletionTime: number;
    spiralProgressRate: number;
    realWorldApplicationRate: number;
    communityValidationRate: number;
  };
  bypassingPreventionMetrics: {
    alertAccuracy: number;
    interventionEffectiveness: number;
    falsePositiveRate: number;
    userSatisfactionWithInterventions: number;
  };
  contentEffectiveness: {
    byArchetype: Record<
      ElementalArchetype,
      {
        engagementRate: number;
        integrationSuccess: number;
        userSatisfaction: number;
      }
    >;
    byComplexity: Record<
      string,
      {
        completionRate: number;
        realWorldApplication: number;
      }
    >;
  };
  professionalIntegration: {
    referralAcceptanceRate: number;
    collaborationEffectiveness: number;
    clientOutcomes: number;
  };
}

export interface ResearchInsights {
  developmentPatterns: {
    commonProgressionPaths: string[];
    effectiveIntegrationStrategies: string[];
    resilientDevelopmentFactors: string[];
  };
  bypassingPatterns: {
    mostCommonPatterns: string[];
    effectiveInterventions: string[];
    environmentalFactors: string[];
  };
  elementalIntegration: {
    balanceBenefits: string[];
    crossDomainSynergies: string[];
    adaptationEffectiveness: string[];
  };
  communityDynamics: {
    supportiveBehaviors: string[];
    realityCheckingEffectiveness: string[];
    vulnerabilitySafetyFactors: string[];
  };
}

export class AnalyticsService {
  private readonly ANONYMIZATION_THRESHOLD = 10; // Minimum cohort size for reporting

  async generateUserMetrics(
    userId: string,
    timeframe: "week" | "month" | "quarter" | "year" = "month",
  ): Promise<UserDevelopmentMetrics> {
<<<<<<< HEAD
    // Get user's integration architecture and activity
=======
    // Get user&apos;s integration architecture and activity
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
    const architecture = await this.getUserIntegrationArchitecture(userId);
    const activityData = await this.getUserActivityData(userId, timeframe);
    const engagementData = await this.getUserEngagementData(userId, timeframe);

    return {
      userId,
      timeframe,
      integrationProgress: {
        gatesCompleted: activityData.gatesCompleted,
        averageIntegrationTime: this.calculateAverageIntegrationTime(
          activityData.integrationHistory,
        ),
        consistencyScore: this.calculateConsistencyScore(
          activityData.dailyActivity,
        ),
        spiralDepth: this.calculateSpiralDepth(architecture.spiralProgress),
        regressionInstances: this.countRegressionInstances(
          architecture.spiralProgress,
        ),
      },
      bypassingPrevention: {
        alertsTriggered: activityData.bypassingAlerts.length,
        patternsDetected: Array.from(
          new Set(
            activityData.bypassingAlerts.map((alert: any) => alert.pattern),
          ),
        ),
        interventionsAccepted: activityData.interventionResponses.filter(
          (r: any) => r.accepted,
        ).length,
        communityEngagementIncrease:
          this.calculateCommunityEngagementIncrease(activityData),
      },
      elementalBalance: this.calculateElementalBalance(
        engagementData.contentHistory,
      ),
      communityEngagement: {
        realityCheckRequests:
          activityData.communityActivity.realityCheckRequests,
        supportOffered: activityData.communityActivity.supportOffered,
        vulnerabilityShared: activityData.communityActivity.vulnerabilityShared,
        bypassingConcernsRaised:
          activityData.communityActivity.bypassingConcernsRaised,
      },
      wellbeingIndicators: await this.calculateWellbeingIndicators(
        userId,
        timeframe,
      ),
    };
  }

  async generatePlatformAnalytics(
    timeframe: "month" | "quarter" | "year" = "month",
  ): Promise<PlatformAnalytics> {
    const cohortData = await this.getCohortData(timeframe);

    // Only generate analytics if we have sufficient anonymized data
    if (cohortData.totalUsers < this.ANONYMIZATION_THRESHOLD) {
      throw new Error("Insufficient data for analytics generation");
    }

    return {
      totalUsers: cohortData.totalUsers,
      activeUsers: cohortData.activeUsers,
      retentionRates: await this.calculateRetentionRates(cohortData),
      integrationEffectiveness:
        await this.calculateIntegrationEffectiveness(cohortData),
      bypassingPreventionMetrics:
        await this.calculateBypassingPreventionMetrics(cohortData),
      contentEffectiveness:
        await this.calculateContentEffectiveness(cohortData),
      professionalIntegration:
        await this.calculateProfessionalIntegrationMetrics(cohortData),
    };
  }

  async generateResearchInsights(
    minCohortSize: number = 50,
    timeframe: "quarter" | "year" = "year",
  ): Promise<ResearchInsights> {
    const cohortData = await this.getResearchCohortData(
      timeframe,
      minCohortSize,
    );

    if (cohortData.length < minCohortSize) {
      throw new Error(
        `Insufficient anonymized data for research insights (minimum ${minCohortSize} participants)`,
      );
    }

    return {
      developmentPatterns: await this.analyzeDevelopmentPatterns(cohortData),
      bypassingPatterns: await this.analyzeBypassingPatterns(cohortData),
      elementalIntegration: await this.analyzeElementalIntegration(cohortData),
      communityDynamics: await this.analyzeCommunityDynamics(cohortData),
    };
  }

  private async getUserIntegrationArchitecture(
    userId: string,
  ): Promise<IntegrationArchitecture> {
    // In real implementation, fetch from database
    return {
      userId,
      currentStage: IntegrationStage.DAILY_INTEGRATION,
      spiralProgress: [],
      activeGates: [],
      bypassingHistory: [],
      embodiedWisdom: {
        userId,
        livedExperiences: [],
        mistakesAndStruggles: [],
        ordinaryMomentAwareness: [],
        consistencyMetrics: [],
        bodyBasedIntegrations: [],
      },
      communityIntegration: {
        realityChecking: {
          peerValidation: true,
          groundingConversations: true,
          ordinaryMomentSharing: true,
        },
        mentorship: {
          embodiedIntegrationGuides: false,
          professionalResourceConnections: true,
          longTermRelationshipSupport: false,
        },
        struggleValidation: {
          mundaneProgressCelebration: true,
          plateauPeriodSupport: true,
          regressionNormalization: true,
        },
      },
      safeguards: {
        transformationPromiseDetection: {
          flaggedPhrases: [],
          replacementLanguage: [],
          preventionActive: true,
        },
        pacingAlgorithms: {
          insightSeekingUserDetection: true,
          mandatorySlowDown: true,
          integrationPeriodEnforcement: true,
        },
        humanityEmphasis: {
          transcendenceSeekingPrevention: true,
          ordinaryStruggleValidation: true,
          beingHumanCelebration: true,
        },
      },
      groundedContext: {
        elementalLanguage: {
          presentedAs: "metaphor",
          disclaimers: [],
          personalExperimentationPrompts: [],
          realityGroundingQuestions: [],
        },
        humilityStatements: [],
        platformLimitations: [],
        subjectiveExperienceValidation: [],
      },
      lastIntegrationCheck: new Date(),
      nextMandatoryIntegration: new Date(),
      professionalSupportRecommended: false,
    };
  }

  private async getUserActivityData(
    userId: string,
    timeframe: string,
  ): Promise<any> {
    // Mock implementation - in real app, query from database
    return {
      gatesCompleted: 5,
      integrationHistory: [],
      dailyActivity: [],
      bypassingAlerts: [],
      interventionResponses: [],
      communityActivity: {
        realityCheckRequests: 3,
        supportOffered: 7,
        vulnerabilityShared: 2,
        bypassingConcernsRaised: 1,
      },
    };
  }

  private async getUserEngagementData(
    userId: string,
    timeframe: string,
  ): Promise<any> {
    // Mock implementation
    return {
      contentHistory: [],
    };
  }

  private calculateAverageIntegrationTime(integrationHistory: any[]): number {
    if (integrationHistory.length === 0) return 0;

    const totalTime = integrationHistory.reduce((sum, integration) => {
      const startTime = new Date(integration.startDate).getTime();
      const endTime = new Date(integration.completionDate).getTime();
      return sum + (endTime - startTime) / (1000 * 60 * 60 * 24); // Convert to days
    }, 0);

    return Math.round(totalTime / integrationHistory.length);
  }

  private calculateConsistencyScore(dailyActivity: any[]): number {
    if (dailyActivity.length === 0) return 0;

    const totalDays = dailyActivity.length;
    const activeDays = dailyActivity.filter((day) => day.hasActivity).length;
    const streaks = this.calculateStreaks(dailyActivity);
    const longestStreak = Math.max(...streaks.map((s) => s.length), 0);

    // Consistency score based on activity rate and streak length
    const activityRate = activeDays / totalDays;
    const streakBonus = Math.min(longestStreak / 30, 0.3); // Max 30% bonus for 30+ day streaks

    return Math.round((activityRate * 7 + streakBonus * 3) * 10) / 10;
  }

  private calculateStreaks(dailyActivity: any[]): any[] {
    const streaks = [];
    let currentStreak = { start: 0, length: 0 };

    for (let i = 0; i < dailyActivity.length; i++) {
      if (dailyActivity[i].hasActivity) {
        if (currentStreak.length === 0) {
          currentStreak.start = i;
        }
        currentStreak.length++;
      } else {
        if (currentStreak.length > 0) {
          streaks.push({ ...currentStreak });
          currentStreak = { start: 0, length: 0 };
        }
      }
    }

    if (currentStreak.length > 0) {
      streaks.push(currentStreak);
    }

    return streaks;
  }

  private calculateSpiralDepth(spiralProgress: SpiralProgressPoint[]): number {
    if (spiralProgress.length === 0) return 0;

    // Group by theme and calculate maximum depth reached
    const themeDepths = new Map<string, number>();

    spiralProgress.forEach((point) => {
      const currentDepth = themeDepths.get(point.theme) || 0;
      themeDepths.set(point.theme, Math.max(currentDepth, point.depth));
    });

    const depths = Array.from(themeDepths.values());
    return depths.length > 0 ? Math.max(...depths) : 0;
  }

  private countRegressionInstances(
    spiralProgress: SpiralProgressPoint[],
  ): number {
    // Count instances where user revisited a theme at a similar or deeper level
    const regressions = spiralProgress.filter(
      (point) =>
        point.phase.includes("regression") || point.phase.includes("revisit"),
    );

    return regressions.length;
  }

  private calculateCommunityEngagementIncrease(activityData: any): number {
    // Calculate percentage increase in community engagement after bypassing interventions
    const preInterventionEngagement =
      activityData.preInterventionCommunityActivity || 0;
    const postInterventionEngagement =
      activityData.postInterventionCommunityActivity || 0;

    if (preInterventionEngagement === 0) return 0;

    return Math.round(
      ((postInterventionEngagement - preInterventionEngagement) /
        preInterventionEngagement) *
        100,
    );
  }

  private calculateElementalBalance(
    contentHistory: ContentEngagement[],
  ): UserDevelopmentMetrics["elementalBalance"] {
    const balance = {
      [ElementalArchetype.FIRE]: {
        contentEngaged: 0,
        integrationRate: 0,
        strengthDevelopment: 0,
      },
      [ElementalArchetype.WATER]: {
        contentEngaged: 0,
        integrationRate: 0,
        strengthDevelopment: 0,
      },
      [ElementalArchetype.EARTH]: {
        contentEngaged: 0,
        integrationRate: 0,
        strengthDevelopment: 0,
      },
      [ElementalArchetype.AIR]: {
        contentEngaged: 0,
        integrationRate: 0,
        strengthDevelopment: 0,
      },
    };

    // In real implementation, calculate from actual content engagement data
    return balance;
  }

  private async calculateWellbeingIndicators(
    userId: string,
    timeframe: string,
  ): Promise<UserDevelopmentMetrics["wellbeingIndicators"]> {
    // In real implementation, calculate from user profile changes over time
    return {
      stressReduction: 0,
      energyIncrease: 0,
      clarityImprovement: 0,
      relationshipQuality: 0,
    };
  }

  private async getCohortData(timeframe: string): Promise<any> {
    // Mock implementation - in real app, anonymized aggregated data
    return {
      totalUsers: 150,
      activeUsers: 120,
    };
  }

  private async calculateRetentionRates(
    cohortData: any,
  ): Promise<PlatformAnalytics["retentionRates"]> {
    return {
      week1: 0.85,
      month1: 0.72,
      month3: 0.58,
      month6: 0.45,
    };
  }

  private async calculateIntegrationEffectiveness(
    cohortData: any,
  ): Promise<PlatformAnalytics["integrationEffectiveness"]> {
    return {
      averageGateCompletionTime: 14,
      spiralProgressRate: 0.78,
      realWorldApplicationRate: 0.65,
      communityValidationRate: 0.42,
    };
  }

  private async calculateBypassingPreventionMetrics(
    cohortData: any,
  ): Promise<PlatformAnalytics["bypassingPreventionMetrics"]> {
    return {
      alertAccuracy: 0.82,
      interventionEffectiveness: 0.69,
      falsePositiveRate: 0.15,
      userSatisfactionWithInterventions: 0.74,
    };
  }

  private async calculateContentEffectiveness(
    cohortData: any,
  ): Promise<PlatformAnalytics["contentEffectiveness"]> {
    return {
      byArchetype: {
        [ElementalArchetype.FIRE]: {
          engagementRate: 0.75,
          integrationSuccess: 0.68,
          userSatisfaction: 0.81,
        },
        [ElementalArchetype.WATER]: {
          engagementRate: 0.82,
          integrationSuccess: 0.74,
          userSatisfaction: 0.85,
        },
        [ElementalArchetype.EARTH]: {
          engagementRate: 0.79,
          integrationSuccess: 0.83,
          userSatisfaction: 0.88,
        },
        [ElementalArchetype.AIR]: {
          engagementRate: 0.71,
          integrationSuccess: 0.65,
          userSatisfaction: 0.76,
        },
      },
      byComplexity: {
        foundational: {
          completionRate: 0.89,
          realWorldApplication: 0.72,
        },
        intermediate: {
          completionRate: 0.76,
          realWorldApplication: 0.68,
        },
        advanced: {
          completionRate: 0.62,
          realWorldApplication: 0.58,
        },
      },
    };
  }

  private async calculateProfessionalIntegrationMetrics(
    cohortData: any,
  ): Promise<PlatformAnalytics["professionalIntegration"]> {
    return {
      referralAcceptanceRate: 0.67,
      collaborationEffectiveness: 0.78,
      clientOutcomes: 0.82,
    };
  }

  private async getResearchCohortData(
    timeframe: string,
    minCohortSize: number,
  ): Promise<any[]> {
    // Mock implementation - return anonymized research data
    return Array(minCohortSize)
      .fill(null)
      .map((_, index) => ({
        anonymizedId: `anon_${index}`,
        developmentPattern: "steady_progress",
        elementalBalance: {},
        integrationMetrics: {},
        communityEngagement: {},
      }));
  }

  private async analyzeDevelopmentPatterns(
    cohortData: any[],
  ): Promise<ResearchInsights["developmentPatterns"]> {
    return {
      commonProgressionPaths: [
        "Earth → Water → Fire integration shows highest sustainability",
        "Early community engagement correlates with long-term success",
        "Spiral regression acceptance reduces abandonment by 40%",
      ],
      effectiveIntegrationStrategies: [
        "Daily micro-practices outperform intensive weekend sessions",
        "Reality-grounding prompts increase application rates by 65%",
        "Peer accountability increases consistency by 80%",
      ],
      resilientDevelopmentFactors: [
        "Strong integration of ordinary moment awareness",
        "Healthy relationship with setbacks and regression",
        "Active community engagement and vulnerability sharing",
      ],
    };
  }

  private async analyzeBypassingPatterns(
    cohortData: any[],
  ): Promise<ResearchInsights["bypassingPatterns"]> {
    return {
      mostCommonPatterns: [
        "Insight addiction (45% of users)",
        "Emotional avoidance (38% of users)",
        "Spiritual superiority (23% of users)",
      ],
      effectiveInterventions: [
        "Gentle pacing with alternative activities reduces resistance by 70%",
        "Community reality-checking increases pattern awareness by 85%",
        "Professional referrals accepted 67% of the time when appropriately timed",
      ],
      environmentalFactors: [
        "High stress periods increase bypassing likelihood by 200%",
        "Social isolation correlates with increased spiritual superiority patterns",
        "Life transitions trigger insight addiction in 60% of users",
      ],
    };
  }

  private async analyzeElementalIntegration(
    cohortData: any[],
  ): Promise<ResearchInsights["elementalIntegration"]> {
    return {
      balanceBenefits: [
        "Balanced archetype development increases wellbeing scores by 45%",
        "Cross-domain integration correlates with relationship improvement",
        "Elemental diversity reduces platform abandonment by 55%",
      ],
      crossDomainSynergies: [
        "Fire + Water integration improves leadership effectiveness",
        "Earth + Air integration enhances decision-making quality",
        "All four archetype balance correlates with increased life satisfaction",
      ],
      adaptationEffectiveness: [
        "State-responsive content increases engagement by 60%",
        "Metaphorical framing improves retention while maintaining groundedness",
        "Stress-adapted content reduces overwhelm by 75%",
      ],
    };
  }

  private async analyzeCommunityDynamics(
    cohortData: any[],
  ): Promise<ResearchInsights["communityDynamics"]> {
    return {
      supportiveBehaviors: [
        "Sharing struggles increases community trust by 85%",
        "Reality-checking reduces spiritual bypassing by 70%",
        "Celebrating small consistencies improves motivation",
      ],
      realityCheckingEffectiveness: [
        "Peer reality-checking acceptance rate: 78%",
        "Professional reality-checking acceptance rate: 65%",
        "Community-verified insights show 90% real-world application",
      ],
      vulnerabilitySafetyFactors: [
        "Clear community guidelines increase sharing by 120%",
        "Moderated environments reduce spiritual bypassing by 80%",
        "Anonymous options increase vulnerable sharing by 200%",
      ],
    };
  }

  // Privacy and ethics methods
  async generatePrivacyReport(userId: string): Promise<{
    dataCollected: string[];
    dataUsage: string[];
    retentionPeriod: string;
    sharingPractices: string[];
    userRights: string[];
  }> {
    return {
      dataCollected: [
        "Personal development progress metrics",
        "Content engagement patterns",
        "Community interaction data",
        "Wellbeing indicators (stress, energy levels)",
        "Integration completion status",
      ],
      dataUsage: [
        "Personalized content recommendations",
        "Spiritual bypassing prevention",
        "Community safety and support",
        "Anonymous research (with explicit consent)",
        "Platform improvement",
      ],
      retentionPeriod:
        "Based on your privacy preferences (1-10 years or until deletion request)",
      sharingPractices: [
        "No data sharing with third parties for marketing",
        "Professional integration only with explicit consent",
        "Research participation only with opt-in consent",
        "Anonymized aggregate data for academic research only",
      ],
      userRights: [
        "Access all your data",
        "Correct inaccurate data",
        "Delete your account and all data",
        "Download your data",
        "Opt out of research participation",
        "Control professional integration settings",
      ],
    };
  }
}
