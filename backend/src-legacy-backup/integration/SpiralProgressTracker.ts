import {
  SpiralProgressPoint,
  SpiralPhase,
  IntegrationArchitecture,
  IntegrationStage,
  OrdinaryMoment,
  StruggleWisdom,
  ConsistencyMetric,
} from "./types";

export class SpiralProgressTracker {
  private spiralThemes = [
    "self_acceptance",
    "relationship_patterns",
    "life_purpose",
    "shadow_integration",
    "creative_expression",
    "service_and_contribution",
    "mortality_and_meaning",
    "interconnection",
    "presence_and_mindfulness",
    "emotional_regulation",
    "boundaries_and_authenticity",
    "forgiveness_and_letting_go",
  ];

  trackSpiralProgress(
    userId: string,
    theme: string,
    currentInsight: string,
    realWorldApplication: string[],
    strugglesEncountered: string[],
  ): SpiralProgressPoint {
    const existingVisits = this.getPreviousVisits(userId, theme);
    const newDepth = this.calculateDepth(
      existingVisits,
      currentInsight,
      realWorldApplication,
    );
    const currentPhase = this.determinePhase(
      newDepth,
      realWorldApplication,
      strugglesEncountered,
    );

    return {
      id: this.generateId(),
      theme,
      depth: newDepth,
      phase: currentPhase,
      visitDate: new Date(),
      previousVisits: existingVisits.map((v) => v.visitDate),
      integrationQuality: this.assessIntegrationQuality(
        realWorldApplication,
        strugglesEncountered,
      ),
      realWorldApplication,
      strugglesEncountered,
      ordinaryMoments: [],
    };
  }

  private getPreviousVisits(
    userId: string,
    theme: string,
  ): SpiralProgressPoint[] {
    // In real implementation, this would query the database
    // For now, return empty array as placeholder
    return [];
  }

  private calculateDepth(
    previousVisits: SpiralProgressPoint[],
    currentInsight: string,
    realWorldApplication: string[],
  ): number {
    const baseDepth = previousVisits.length + 1;

    // Increase depth based on quality of integration
    let depthModifier = 0;

    // Quality indicators
    if (realWorldApplication.length >= 3) depthModifier += 0.5;
    if (this.hasLongTermPerspective(currentInsight)) depthModifier += 0.5;
    if (this.showsHumilityAndOngoingGrowth(currentInsight))
      depthModifier += 0.5;

    return Math.min(baseDepth + depthModifier, 10);
  }

  private hasLongTermPerspective(insight: string): boolean {
    const longTermIndicators = [
      &quot;over time&quot;,
      "gradually",
      "ongoing",
      "continuing to",
      "still learning",
      "process",
      "journey",
    ];

    return longTermIndicators.some((indicator) =>
      insight.toLowerCase().includes(indicator),
    );
  }

  private showsHumilityAndOngoingGrowth(insight: string): boolean {
    const humilityIndicators = [
      "still struggling",
      "continue to work on",
      "learning to",
      "not perfect",
      "ongoing challenge",
      "humbled by",
      "reminds me that",
    ];

    return humilityIndicators.some((indicator) =>
      insight.toLowerCase().includes(indicator),
    );
  }

  private determinePhase(
    depth: number,
    realWorldApplication: string[],
    strugglesEncountered: string[],
  ): SpiralPhase {
    if (depth === 1) return SpiralPhase.FOUNDATION;
    if (depth <= 3) return SpiralPhase.EXPLORATION;
    if (depth <= 5) return SpiralPhase.INTEGRATION;
    if (depth <= 7) return SpiralPhase.DEEPENING;
    if (depth <= 8) return SpiralPhase.SERVICE;
    return SpiralPhase.MAINTENANCE;
  }

  private assessIntegrationQuality(
    realWorldApplication: string[],
    strugglesEncountered: string[],
  ): number {
    let quality = 0;

    // Application quality (40% of score)
    const applicationQuality =
      this.assessApplicationQuality(realWorldApplication);
    quality += applicationQuality * 0.4;

    // Struggle acknowledgment (30% of score)
    const struggleHonesty = this.assessStruggleHonesty(strugglesEncountered);
    quality += struggleHonesty * 0.3;

    // Integration depth (30% of score)
    const integrationDepth = this.assessIntegrationDepth(
      realWorldApplication,
      strugglesEncountered,
    );
    quality += integrationDepth * 0.3;

    return Math.min(quality, 10);
  }

  private assessApplicationQuality(applications: string[]): number {
    if (applications.length === 0) return 0;

    let score = 0;
    const maxScore = 10;

    // Quantity
    score += Math.min(applications.length * 2, 4);

    // Specificity
    const specificApplications = applications.filter((app) => app.length > 30);
    score += Math.min(specificApplications.length * 2, 4);

    // Diversity (different life areas)
    const lifeAreas = [
      &quot;work&quot;,
      "relationship",
      "family",
      "daily",
      "social",
      "personal",
    ];
    const areasPresent = lifeAreas.filter((area) =>
      applications.some((app) => app.toLowerCase().includes(area)),
    );
    score += Math.min(areasPresent.length * 0.5, 2);

    return Math.min(score, maxScore);
  }

  private assessStruggleHonesty(struggles: string[]): number {
    if (struggles.length === 0) return 0;

    let score = 0;
    const maxScore = 10;

    // Acknowledgment of struggles
    score += Math.min(struggles.length * 2, 6);

    // Depth of struggle awareness
    const deepStruggles = struggles.filter((struggle) => struggle.length > 40);
    score += Math.min(deepStruggles.length * 2, 4);

    return Math.min(score, maxScore);
  }

  private assessIntegrationDepth(
    applications: string[],
    struggles: string[],
  ): number {
    let score = 0;
    const maxScore = 10;

    // Integration of both application and struggle
    if (applications.length > 0 && struggles.length > 0) score += 4;

    // Connection between applications and struggles
    const connected = applications.some((app) =>
      struggles.some((struggle) => this.hasConceptualOverlap(app, struggle)),
    );
    if (connected) score += 3;

    // Evidence of ongoing process rather than completed achievement
    const processLanguage = [...applications, ...struggles].some((item) =>
      this.hasProcessLanguage(item),
    );
    if (processLanguage) score += 3;

    return Math.min(score, maxScore);
  }

  private hasConceptualOverlap(text1: string, text2: string): boolean {
    const words1 = text1.toLowerCase().split(" ");
    const words2 = text2.toLowerCase().split(" ");

    const overlap = words1.filter(
      (word) => word.length > 4 && words2.includes(word),
    );

    return overlap.length > 0;
  }

  private hasProcessLanguage(text: string): boolean {
    const processWords = [
      "continuing",
      "working on",
      "practicing",
      "learning",
      "developing",
      "growing",
      "process",
      "journey",
    ];

    return processWords.some((word) => text.toLowerCase().includes(word));
  }

  validateNonLinearProgress(progressHistory: SpiralProgressPoint[]): {
    isHealthy: boolean;
    insights: string[];
    concerns: string[];
  } {
    const insights: string[] = [];
    const concerns: string[] = [];

    // Check for healthy regression patterns
    const hasRegressions = this.detectHealthyRegressions(progressHistory);
    if (hasRegressions) {
      insights.push(
        "Your journey includes healthy revisiting of earlier themes - this is natural spiral growth",
      );
    } else if (progressHistory.length > 5) {
      concerns.push(
        "Consider that growth often involves revisiting earlier challenges at deeper levels",
      );
    }

    // Check for depth progression over time
    const hasDepthProgression = this.validateDepthProgression(progressHistory);
    if (hasDepthProgression) {
      insights.push(
        "You show deepening understanding over time across multiple themes",
      );
    }

    // Check for consistency vs intensity balance
    const consistencyBalance = this.assessConsistencyBalance(progressHistory);
    if (consistencyBalance.balanced) {
      insights.push(
        "You demonstrate healthy balance between consistency and growth spurts",
      );
    } else if (consistencyBalance.tooIntense) {
      concerns.push("Consider slowing down to allow for deeper integration");
    } else if (consistencyBalance.tooStagnant) {
      concerns.push(
        "Gentle exploration of new themes might support your continued growth",
      );
    }

    const isHealthy = concerns.length <= insights.length;

    return { isHealthy, insights, concerns };
  }

  private detectHealthyRegressions(history: SpiralProgressPoint[]): boolean {
    if (history.length < 3) return false;

    const themeRevisits = new Map<string, number>();
    history.forEach((point) => {
      themeRevisits.set(point.theme, (themeRevisits.get(point.theme) || 0) + 1);
    });

    const revisitedThemes = Array.from(themeRevisits.values()).filter(
      (count) => count > 1,
    );
    return revisitedThemes.length > 0;
  }

  private validateDepthProgression(history: SpiralProgressPoint[]): boolean {
    if (history.length < 4) return true;

    const recentHistory = history.slice(-6); // Last 6 entries
    const avgEarlyDepth =
      recentHistory.slice(0, 3).reduce((sum, p) => sum + p.depth, 0) / 3;
    const avgLateDepth =
      recentHistory.slice(-3).reduce((sum, p) => sum + p.depth, 0) / 3;

    return avgLateDepth >= avgEarlyDepth;
  }

  private assessConsistencyBalance(history: SpiralProgressPoint[]): {
    balanced: boolean;
    tooIntense: boolean;
    tooStagnant: boolean;
  } {
    if (history.length < 5)
      return { balanced: true, tooIntense: false, tooStagnant: false };

    const recentMonth = history.filter(
      (p) => Date.now() - p.visitDate.getTime() < 30 * 24 * 60 * 60 * 1000,
    );

    const tooIntense = recentMonth.length > 8; // More than 8 significant insights per month
    const tooStagnant = recentMonth.length === 0 && history.length > 0;
    const balanced = !tooIntense && !tooStagnant;

    return { balanced, tooIntense, tooStagnant };
  }

  celebrateBoringConsistency(
    consistencyMetrics: ConsistencyMetric[],
    ordinaryMoments: OrdinaryMoment[],
  ): {
    celebrations: string[];
    encouragements: string[];
  } {
    const celebrations: string[] = [];
    const encouragements: string[] = [];

    // Celebrate long-term consistency
    const longTermPractices = consistencyMetrics.filter(
      (m) => m.maintainedFor > 30,
    );
    longTermPractices.forEach((practice) => {
      celebrations.push(
        `🌱 You&apos;ve maintained ${practice.practice} for ${practice.maintainedFor} days. This steady presence is the foundation of all growth.`,
      );
    });

    // Celebrate ordinary moments
    const recentOrdinaryMoments = ordinaryMoments.filter(
      (m) => Date.now() - new Date(m.id).getTime() < 7 * 24 * 60 * 60 * 1000, // Last week
    );

    if (recentOrdinaryMoments.length > 0) {
      celebrations.push(
        `✨ You&apos;ve been present to ${recentOrdinaryMoments.length} ordinary moments this week. This presence is where real transformation lives.`,
      );
    }

    // Encourage maintenance phases
    const maintenancePhases = consistencyMetrics.filter(
      (m) => m.consistencyRating >= 7 && m.maintainedFor > 14,
    );

    if (maintenancePhases.length > 0) {
      encouragements.push(
        &quot;Maintenance phases are as valuable as growth spurts. Your steady practice creates the soil for future insights.",
      );
    }

    // Encourage plateau periods
    const plateauIndicators = consistencyMetrics.filter(
      (m) => m.consistencyRating >= 6,
    );
    if (plateauIndicators.length >= 2) {
      encouragements.push(
        "Plateaus are not stagnation - they are integration periods. Trust the value of where you are now.",
      );
    }

    return { celebrations, encouragements };
  }

  generateSpiralInsights(progressHistory: SpiralProgressPoint[]): {
    patterns: string[];
    nextSuggestedThemes: string[];
    integrationOpportunities: string[];
  } {
    const patterns: string[] = [];
    const nextSuggestedThemes: string[] = [];
    const integrationOpportunities: string[] = [];

    // Identify recurring themes
    const themeCounts = new Map<string, number>();
    progressHistory.forEach((point) => {
      themeCounts.set(point.theme, (themeCounts.get(point.theme) || 0) + 1);
    });

    const frequentThemes = Array.from(themeCounts.entries())
      .filter(([_, count]) => count > 1)
      .map(([theme, _]) => theme);

    if (frequentThemes.length > 0) {
      patterns.push(
        `You frequently return to themes of ${frequentThemes.join(", ")} - this suggests these are core growth areas for you.`,
      );
    }

    // Suggest complementary themes
    const recentThemes = progressHistory.slice(-3).map((p) => p.theme);
    const unexploredThemes = this.spiralThemes.filter(
      (theme) => !recentThemes.includes(theme),
    );

    nextSuggestedThemes.push(...unexploredThemes.slice(0, 2));

    // Identify integration opportunities
    const highDepthThemes = progressHistory
      .filter((p) => p.depth >= 5)
      .map((p) => p.theme);
    if (highDepthThemes.length >= 2) {
      integrationOpportunities.push(
        `Consider how your work with ${highDepthThemes.slice(0, 2).join(" and ")} might inform each other.`,
      );
    }

    return { patterns, nextSuggestedThemes, integrationOpportunities };
  }

  private generateId(): string {
    return `spiral-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
