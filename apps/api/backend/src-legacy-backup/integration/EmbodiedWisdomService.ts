import {
  EmbodiedWisdomTracking,
  LivedExperience,
  BodyIntegration,
  StruggleWisdom,
  OrdinaryMoment,
  ConsistencyMetric,
  IntegrationArchitecture,
} from "./types";

export class EmbodiedWisdomService {
  trackLivedExperience(
    insight: string,
    realWorldApplication: string,
    timeframe: string,
    challenges: string[] = [],
    adaptations: string[] = [],
  ): LivedExperience {
    return {
      id: this.generateId(),
      insight,
      realWorldApplication,
      challenges,
      adaptations,
      timeframe,
      ongoingPractice: this.assessOngoingPractice(
        realWorldApplication,
        challenges,
      ),
    };
  }

  private assessOngoingPractice(
    application: string,
    challenges: string[],
  ): boolean {
    const ongoingIndicators = [
      "continue to",
      "still working on",
      "ongoing",
      "daily practice",
      "regular",
      "consistently",
      "maintain",
      "keep practicing",
    ];

    const applicationText = application.toLowerCase();
    const challengesText = challenges.join(" ").toLowerCase();
    const combinedText = `${applicationText} ${challengesText}`;

    return ongoingIndicators.some((indicator) =>
      combinedText.includes(indicator),
    );
  }

  createBodyIntegration(
    somaticAwareness: string,
    physicalPractice: string,
    bodyWisdom: string,
    integrationEvidence: string,
    dailyApplication: string,
  ): BodyIntegration {
    return {
      id: this.generateId(),
      somaticAwareness,
      physicalPractice,
      bodyWisdom,
      integrationEvidence,
      dailyApplication,
    };
  }

  validateBodyIntegration(bodyIntegration: BodyIntegration): {
    isEmbodied: boolean;
    strengths: string[];
    growthAreas: string[];
  } {
    const strengths: string[] = [];
    const growthAreas: string[] = [];

    // Check for somatic specificity
    if (bodyIntegration.somaticAwareness.length > 50) {
      strengths.push("Detailed somatic awareness");
    } else {
      growthAreas.push("Develop more specific body awareness descriptions");
    }

    // Check for daily application
    const dailyIndicators = [
      "daily",
      "everyday",
      "routine",
      "regular",
      "consistent",
    ];
    const hasDailyApplication = dailyIndicators.some((indicator) =>
      bodyIntegration.dailyApplication.toLowerCase().includes(indicator),
    );

    if (hasDailyApplication) {
      strengths.push("Clear daily application");
    } else {
      growthAreas.push("Identify specific daily applications");
    }

    // Check for practical evidence
    if (
      bodyIntegration.integrationEvidence.includes("noticed") ||
      bodyIntegration.integrationEvidence.includes("observed") ||
      bodyIntegration.integrationEvidence.includes("changed")
    ) {
      strengths.push("Observable integration evidence");
    } else {
      growthAreas.push("Document specific observable changes");
    }

    const isEmbodied = strengths.length >= growthAreas.length;

    return { isEmbodied, strengths, growthAreas };
  }

  captureStruggleWisdom(
    struggle: string,
    lessonsLearned: string[],
    ongoingChallenges: string[],
    wisdomGained: string,
    humilityDeveloped: string,
  ): StruggleWisdom {
    return {
      id: this.generateId(),
      struggle,
      lessonsLearned,
      ongoingChallenges,
      wisdomGained,
      humilityDeveloped,
    };
  }

  validateStruggleWisdom(struggleWisdom: StruggleWisdom): {
    isWisdom: boolean;
    indicators: string[];
    concerns: string[];
  } {
    const indicators: string[] = [];
    const concerns: string[] = [];

    // Check for genuine struggle acknowledgment
    const struggleDepth = struggleWisdom.struggle.length;
    if (struggleDepth > 30) {
      indicators.push("Detailed struggle acknowledgment");
    } else {
      concerns.push("Consider deeper exploration of the struggle");
    }

    // Check for ongoing challenges (prevents spiritual bypassing)
    if (struggleWisdom.ongoingChallenges.length > 0) {
      indicators.push("Acknowledges ongoing challenges");
    } else {
      concerns.push("Important to acknowledge what remains challenging");
    }

    // Check for humility development
    const humilityIndicators = [
      "humbled",
<<<<<<< HEAD
      "learned i don't know",
=======
      "learned i don&apos;t know",
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
      "more questions",
      "realize how much",
      "beginning to understand",
      "still learning",
    ];

    const hasHumility = humilityIndicators.some((indicator) =>
      struggleWisdom.humilityDeveloped.toLowerCase().includes(indicator),
    );

    if (hasHumility) {
      indicators.push("Shows genuine humility development");
    } else {
      concerns.push("Explore how this struggle has developed humility");
    }

    // Check for wisdom vs. platitudes
    const wisdomDepth = struggleWisdom.wisdomGained.length;
    const hasSpecificity =
      struggleWisdom.wisdomGained.includes("specific") ||
      struggleWisdom.wisdomGained.includes("particular") ||
      wisdomDepth > 50;

    if (hasSpecificity) {
      indicators.push("Specific, grounded wisdom");
    } else {
      concerns.push("Develop more specific, lived wisdom insights");
    }

    const isWisdom = indicators.length > concerns.length;

    return { isWisdom, indicators, concerns };
  }

  recordOrdinaryMoment(
    moment: string,
    awareness: string,
    integration: string,
    practiceApplied: string,
    humanness: string,
  ): OrdinaryMoment {
    return {
      id: this.generateId(),
      moment,
      awareness,
      integration,
      practiceApplied,
      humanness,
    };
  }

  validateOrdinaryMoment(ordinaryMoment: OrdinaryMoment): {
    isTrulyOrdinary: boolean;
    celebration: string[];
    deepening: string[];
  } {
    const celebration: string[] = [];
    const deepening: string[] = [];

    // Check for genuinely ordinary moment
    const ordinaryIndicators = [
      "washing dishes",
      "commute",
      "grocery",
      "laundry",
      "waiting",
      "daily",
      "routine",
      "mundane",
      "regular",
      "ordinary",
    ];

    const isOrdinary = ordinaryIndicators.some((indicator) =>
      ordinaryMoment.moment.toLowerCase().includes(indicator),
    );

    if (isOrdinary) {
      celebration.push("Celebrated a genuinely ordinary moment");
    } else {
      deepening.push("Try focusing on more mundane, daily moments");
    }

    // Check for humanness acknowledgment
    const humannessIndicators = [
      "imperfect",
      "messy",
      "flawed",
      "human",
      "mistake",
      "struggle",
      "limitation",
      "vulnerable",
    ];

    const acknowledgesHumanness = humannessIndicators.some((indicator) =>
      ordinaryMoment.humanness.toLowerCase().includes(indicator),
    );

    if (acknowledgesHumanness) {
      celebration.push("Acknowledged human imperfection beautifully");
    } else {
      deepening.push("Explore how this moment revealed your humanity");
    }

    // Check for practical integration
    if (ordinaryMoment.practiceApplied.length > 20) {
      celebration.push("Applied practice in real-world context");
    } else {
      deepening.push("Describe how you applied your practice in this moment");
    }

    const isTrulyOrdinary = celebration.length >= 2;

    return { isTrulyOrdinary, celebration, deepening };
  }

  trackConsistency(
    practice: string,
    frequency: "daily" | "weekly" | "monthly",
    maintainedFor: number,
    consistencyRating: number,
  ): ConsistencyMetric {
    return {
      practice,
      frequency,
      consistencyRating,
      maintainedFor,
      celebratedBy: this.determineCelebrationLevel(
        maintainedFor,
        consistencyRating,
      ),
    };
  }

  private determineCelebrationLevel(
    maintainedFor: number,
    consistencyRating: number,
  ): "self" | "community" | "mentor" {
    if (maintainedFor >= 90 && consistencyRating >= 8) {
      return "mentor"; // Worthy of mentor recognition
    } else if (maintainedFor >= 30 && consistencyRating >= 7) {
      return "community"; // Community celebration
    } else {
      return "self"; // Self-acknowledgment
    }
  }

  celebrateConsistency(metrics: ConsistencyMetric[]): {
    celebrations: string[];
    encouragements: string[];
    realityChecks: string[];
  } {
    const celebrations: string[] = [];
    const encouragements: string[] = [];
    const realityChecks: string[] = [];

    // Celebrate long-term consistency
    const longTermPractices = metrics.filter((m) => m.maintainedFor >= 60);
    longTermPractices.forEach((practice) => {
      celebrations.push(
        `🌱 ${practice.maintainedFor} days of consistent ${practice.practice} - this is the foundation of all sustainable growth.`,
      );
    });

    // Celebrate boring consistency
    const boringButConsistent = metrics.filter(
      (m) => m.consistencyRating >= 6 && m.maintainedFor >= 21,
    );

    if (boringButConsistent.length > 0) {
      celebrations.push(
        '✨ Your "boring" consistency is actually the most profound spiritual practice. This steady showing up transforms life.',
      );
    }

    // Encourage through struggles
    const strugglingPractices = metrics.filter((m) => m.consistencyRating < 6);
    if (strugglingPractices.length > 0) {
      encouragements.push(
<<<<<<< HEAD
        "🌿 Struggling with consistency is part of the human experience. The practice is showing up even when it's difficult.",
=======
        "🌿 Struggling with consistency is part of the human experience. The practice is showing up even when it&apos;s difficult.",
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
      );
    }

    // Reality check for perfectionism
    const perfectPractices = metrics.filter((m) => m.consistencyRating >= 9);
    if (perfectPractices.length > 2) {
      realityChecks.push(
<<<<<<< HEAD
        "💫 High consistency is wonderful, but remember that perfection isn't the goal. Allow space for your humanity.",
=======
        "💫 High consistency is wonderful, but remember that perfection isn&apos;t the goal. Allow space for your humanity.",
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
      );
    }

    return { celebrations, encouragements, realityChecks };
  }

  generateEmbodiedWisdomInsights(tracking: EmbodiedWisdomTracking): {
    strengths: string[];
    growthEdges: string[];
    integrationOpportunities: string[];
  } {
    const strengths: string[] = [];
    const growthEdges: string[] = [];
    const integrationOpportunities: string[] = [];

    // Analyze lived experiences
    const ongoingPractices = tracking.livedExperiences.filter(
      (e) => e.ongoingPractice,
    );
    if (ongoingPractices.length > 0) {
      strengths.push(
        "You understand that growth is an ongoing process, not a destination",
      );
    }

    const experienceDepth =
      tracking.livedExperiences.reduce(
        (sum, e) => sum + e.challenges.length,
        0,
      ) / tracking.livedExperiences.length;

    if (experienceDepth >= 2) {
<<<<<<< HEAD
      strengths.push("You're honest about the challenges in applying insights");
=======
      strengths.push("You&apos;re honest about the challenges in applying insights");
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
    } else {
      growthEdges.push(
        "Consider exploring the challenges more deeply - they contain wisdom",
      );
    }

    // Analyze body integration
    if (tracking.bodyBasedIntegrations.length > 0) {
      strengths.push("You recognize the importance of embodied wisdom");

      const somaticDepth =
        tracking.bodyBasedIntegrations.reduce(
          (sum, b) => sum + b.somaticAwareness.length,
          0,
        ) / tracking.bodyBasedIntegrations.length;

      if (somaticDepth < 30) {
        growthEdges.push(
          "Develop more detailed somatic awareness descriptions",
        );
      }
    } else {
      growthEdges.push("Consider how your insights live in your body");
    }

    // Analyze struggle wisdom
    const wisdomToStruggleRatio =
      tracking.mistakesAndStruggles.length > 0
        ? tracking.livedExperiences.length /
          tracking.mistakesAndStruggles.length
        : 0;

    if (wisdomToStruggleRatio > 3) {
      growthEdges.push(
        "Balance insights with honest acknowledgment of ongoing struggles",
      );
    } else if (wisdomToStruggleRatio < 1) {
      growthEdges.push(
        "Celebrate the wisdom you're gaining from your struggles",
      );
    }

    // Analyze ordinary moments
    const ordinaryToInsightRatio =
      tracking.ordinaryMomentAwareness.length > 0
        ? tracking.livedExperiences.length /
          tracking.ordinaryMomentAwareness.length
        : 0;

    if (ordinaryToInsightRatio > 2) {
      integrationOpportunities.push(
        "Practice finding wisdom in more ordinary, mundane moments",
      );
    } else {
      strengths.push("You appreciate the wisdom in ordinary moments");
    }

    // Analyze consistency
    const avgConsistency =
      tracking.consistencyMetrics.reduce(
        (sum, m) => sum + m.consistencyRating,
        0,
      ) / tracking.consistencyMetrics.length;

    if (avgConsistency >= 7) {
      strengths.push(
        "You demonstrate remarkable consistency in your practices",
      );
    } else if (avgConsistency >= 5) {
      strengths.push(
        "You maintain realistic, sustainable practice consistency",
      );
    } else {
      integrationOpportunities.push(
        "Consider starting with one small, daily practice to build consistency",
      );
    }

    return { strengths, growthEdges, integrationOpportunities };
  }

  prioritizeBodyBasedPractices(architecture: IntegrationArchitecture): {
    recommended: string[];
    rationale: string[];
  } {
    const recommended: string[] = [];
    const rationale: string[] = [];

    // Check for emotional avoidance patterns
    const hasEmotionalAvoidance = architecture.bypassingHistory.some(
      (b) => b.pattern === "emotional_avoidance",
    );

    if (hasEmotionalAvoidance) {
      recommended.push("Somatic emotional regulation practices");
      rationale.push(
        "Body-based practices help process emotions without bypassing",
      );
    }

    // Check for transcendence seeking
    const hasTranscendenceSeeking = architecture.bypassingHistory.some(
      (b) => b.pattern === "transcendence_seeking",
    );

    if (hasTranscendenceSeeking) {
      recommended.push("Grounding and embodiment exercises");
      rationale.push("Physical practices anchor awareness in human experience");
    }

    // Check for insight addiction
    const hasInsightAddiction = architecture.bypassingHistory.some(
      (b) => b.pattern === "insight_addiction",
    );

    if (hasInsightAddiction) {
      recommended.push("Simple daily movement practices");
      rationale.push(
        "Body practices slow down mental activity and support integration",
      );
    }

    // Always include foundational practices
    recommended.push(
      "Daily body scan meditation",
      "Mindful eating practice",
      "Walking meditation",
      "Breath awareness during daily tasks",
    );

    rationale.push(
      "Foundational practices support all other development work",
      "Body-based integration prevents spiritual bypassing",
      "Somatic practices honor the fullness of human experience",
    );

    return { recommended, rationale };
  }

  generateMistakeWisdomPrompts(): string[] {
    return [
      "What recent mistake taught you something valuable about your humanity?",
      "How has a failure or struggle revealed wisdom you wouldn't have gained otherwise?",
      "What pattern of difficulty keeps showing up in your life, and what might it be teaching you?",
      "How has being wrong about something important opened new understanding?",
      "What struggle are you currently facing that might contain wisdom for your development?",
      "How has a recent embarrassment or failure connected you more deeply to your humanness?",
      "What ongoing challenge continues to humble you and teach you?",
      "How have your limitations or weaknesses actually served your growth?",
      "What would you tell someone facing the same struggle you've navigated?",
      "How has accepting a particular human limitation actually brought you freedom?",
    ];
  }

  private generateId(): string {
    return `embodied-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
