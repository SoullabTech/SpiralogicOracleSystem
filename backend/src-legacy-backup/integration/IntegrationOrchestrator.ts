import {
  IntegrationArchitecture,
  IntegrationStage,
  UserHolisticProfile,
} from "./types";
import { SpiritualBypassingDetectionService } from "./SpiritualBypassingDetectionService";
import { IntegrationGateService } from "./IntegrationGateService";
import { SpiralProgressTracker } from "./SpiralProgressTracker";
import { GroundedMetaphysicsService } from "./GroundedMetaphysicsService";
import { AntiCommodificationService } from "./AntiCommodificationService";
import { EmbodiedWisdomService } from "./EmbodiedWisdomService";

export class IntegrationOrchestrator {
  private bypassingDetection: SpiritualBypassingDetectionService;
  private gateService: IntegrationGateService;
  private spiralTracker: SpiralProgressTracker;
  private groundedMetaphysics: GroundedMetaphysicsService;
  private antiCommodification: AntiCommodificationService;
  private embodiedWisdom: EmbodiedWisdomService;

  constructor() {
    this.bypassingDetection = new SpiritualBypassingDetectionService();
    this.gateService = new IntegrationGateService();
    this.spiralTracker = new SpiralProgressTracker();
    this.groundedMetaphysics = new GroundedMetaphysicsService();
    this.antiCommodification = new AntiCommodificationService();
    this.embodiedWisdom = new EmbodiedWisdomService();
  }

  initializeIntegrationArchitecture(userId: string): IntegrationArchitecture {
    return {
      userId,
      currentStage: IntegrationStage.INITIAL_INSIGHT,
      spiralProgress: [],
      activeGates: [],
      bypassingHistory: [],
      embodiedWisdom: {
        userId,
        livedExperiences: [],
        bodyBasedIntegrations: [],
        mistakesAndStruggles: [],
        ordinaryMomentAwareness: [],
        consistencyMetrics: [],
      },
      communityIntegration: {
        realityChecking: {
          peerValidation: false,
          groundingConversations: false,
          ordinaryMomentSharing: false,
        },
        mentorship: {
          embodiedIntegrationGuides: false,
          professionalResourceConnections: false,
          longTermRelationshipSupport: false,
        },
        struggleValidation: {
          mundaneProgressCelebration: false,
          plateauPeriodSupport: false,
          regressionNormalization: false,
        },
      },
      safeguards:
        this.antiCommodification.createAntiCommodificationSafeguards(),
      groundedContext: this.groundedMetaphysics.createGroundedContext(),
      lastIntegrationCheck: new Date(),
      nextMandatoryIntegration: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      professionalSupportRecommended: false,
    };
  }

  processContentRequest(
    architecture: IntegrationArchitecture,
    requestedContent: any,
    userBehavior: any,
  ): {
    allowed: boolean;
    content?: any;
    integrationRequired?: any;
    bypassingConcerns?: any[];
    waitTime?: number;
    message: string;
  } {
    // 1. Check for bypassing patterns
    const bypassingDetections = this.bypassingDetection.detectBypassingPatterns(
      architecture.userId,
      userBehavior,
      { contentType: requestedContent.type },
      { reflectionGapsBypassAttempts: userBehavior.bypassAttempts || 0 },
    );

    // 2. Update architecture with new detections
    architecture.bypassingHistory.push(...bypassingDetections);

    // 3. Check pacing algorithms
    const pacingResult = this.antiCommodification.implementPacingAlgorithm(
      architecture,
      requestedContent,
    );

    if (!pacingResult.allowed) {
      return {
        allowed: false,
        waitTime: pacingResult.waitTime,
        message: pacingResult.message,
        integrationRequired: {
          activities: pacingResult.alternativeActivities,
          minimumTime: pacingResult.waitTime,
        },
      };
    }

    // 4. Check integration gates
    const activeGate = architecture.activeGates.find(
      (gate) => gate.contentToUnlock === requestedContent.type,
    );

    if (activeGate && !activeGate.unlocked) {
      return {
        allowed: false,
        message:
          "This content requires completion of integration requirements.",
        integrationRequired: {
          gate: activeGate,
          requirements: activeGate.requirements.filter((req) => !req.completed),
        },
      };
    }

    // 5. Process and ground the content
    const groundedContent = this.groundedMetaphysics.injectGroundingPrompts(
      requestedContent.content,
      architecture,
    );

    // 6. Create reflection gap
    const reflectionGap = this.gateService.createReflectionGap(
      requestedContent.id,
      requestedContent.type,
      architecture.userId,
    );

    // 7. Update next mandatory integration time
    architecture.lastIntegrationCheck = new Date();
    architecture.nextMandatoryIntegration = new Date(
      Date.now() +
        this.gateService["minimumReflectionDays"][requestedContent.type] *
          24 *
          60 *
          60 *
          1000,
    );

    return {
      allowed: true,
      content: {
        ...requestedContent,
        content: groundedContent,
        groundedContext: this.groundedMetaphysics.createGroundedContext(
          requestedContent.element,
        ),
        reflectionGap,
        integrationPrompts: reflectionGap.reflectionPrompts,
        realityCheckQuestions: reflectionGap.realityCheckQuestions,
      },
      bypassingConcerns:
        bypassingDetections.length > 0 ? bypassingDetections : undefined,
      message:
        "Content provided with integration support. Please honor the reflection period before seeking new content.",
    };
  }

  processIntegrationSubmission(
    architecture: IntegrationArchitecture,
    submissionType:
      | "lived_experience"
      | "body_integration"
      | "struggle_wisdom"
      | "ordinary_moment",
    submission: any,
  ): {
    accepted: boolean;
    feedback: string[];
    celebration?: string[];
    growthEdges?: string[];
    spiralProgress?: any;
  } {
    let feedback: string[] = [];
    let celebration: string[] = [];
    let growthEdges: string[] = [];
    let accepted = false;

    switch (submissionType) {
      case "lived_experience":
        const livedExperience = this.embodiedWisdom.trackLivedExperience(
          submission.insight,
          submission.realWorldApplication,
          submission.timeframe,
          submission.challenges,
          submission.adaptations,
        );

        architecture.embodiedWisdom.livedExperiences.push(livedExperience);
        accepted = true;

        if (livedExperience.ongoingPractice) {
          celebration.push(
            "🌱 You recognize that growth is an ongoing process - this shows wisdom!",
          );
        }

        if (submission.challenges.length > 0) {
          celebration.push(
            "✨ Your honesty about challenges prevents spiritual bypassing.",
          );
        } else {
          growthEdges.push(
            "Consider exploring what challenges you encountered in applying this insight.",
          );
        }
        break;

      case "body_integration":
        const bodyIntegration = this.embodiedWisdom.createBodyIntegration(
          submission.somaticAwareness,
          submission.physicalPractice,
          submission.bodyWisdom,
          submission.integrationEvidence,
          submission.dailyApplication,
        );

        const bodyValidation =
          this.embodiedWisdom.validateBodyIntegration(bodyIntegration);

        if (bodyValidation.isEmbodied) {
          architecture.embodiedWisdom.bodyBasedIntegrations.push(
            bodyIntegration,
          );
          accepted = true;
          celebration.push(...bodyValidation.strengths.map((s) => `🌱 ${s}`));
        } else {
          accepted = false;
          growthEdges.push(...bodyValidation.growthAreas);
        }
        break;

      case "struggle_wisdom":
        const struggleWisdom = this.embodiedWisdom.captureStruggleWisdom(
          submission.struggle,
          submission.lessonsLearned,
          submission.ongoingChallenges,
          submission.wisdomGained,
          submission.humilityDeveloped,
        );

        const wisdomValidation =
          this.embodiedWisdom.validateStruggleWisdom(struggleWisdom);

        if (wisdomValidation.isWisdom) {
          architecture.embodiedWisdom.mistakesAndStruggles.push(struggleWisdom);
          accepted = true;
          celebration.push(
            "💫 Your willingness to find wisdom in struggle is profound.",
          );
          celebration.push(
            ...wisdomValidation.indicators.map((i) => `✨ ${i}`),
          );
        } else {
          accepted = false;
          growthEdges.push(...wisdomValidation.concerns);
        }
        break;

      case "ordinary_moment":
        const ordinaryMoment = this.embodiedWisdom.recordOrdinaryMoment(
          submission.moment,
          submission.awareness,
          submission.integration,
          submission.practiceApplied,
          submission.humanness,
        );

        const momentValidation =
          this.embodiedWisdom.validateOrdinaryMoment(ordinaryMoment);

        if (momentValidation.isTrulyOrdinary) {
          architecture.embodiedWisdom.ordinaryMomentAwareness.push(
            ordinaryMoment,
          );
          accepted = true;
          celebration.push(
            "🌿 Celebrating the profound wisdom in ordinary moments!",
          );
          celebration.push(...momentValidation.celebration);
        } else {
          accepted = false;
          growthEdges.push(...momentValidation.deepening);
        }
        break;
    }

    return { accepted, feedback, celebration, growthEdges };
  }

  updateSpiralProgress(
    architecture: IntegrationArchitecture,
    theme: string,
    insight: string,
    realWorldApplication: string[],
    struggles: string[],
  ): any {
    const spiralPoint = this.spiralTracker.trackSpiralProgress(
      architecture.userId,
      theme,
      insight,
      realWorldApplication,
      struggles,
    );

    architecture.spiralProgress.push(spiralPoint);

    // Validate non-linear progress
    const progressValidation = this.spiralTracker.validateNonLinearProgress(
      architecture.spiralProgress,
    );

    // Generate spiral insights
    const spiralInsights = this.spiralTracker.generateSpiralInsights(
      architecture.spiralProgress,
    );

    return {
      spiralPoint,
      progressValidation,
      spiralInsights,
      celebration: progressValidation.isHealthy
        ? "🌀 Your spiral growth pattern shows healthy development!"
        : "🌱 Consider allowing more time for integration and revisiting earlier themes.",
    };
  }

  checkGateReadiness(
    architecture: IntegrationArchitecture,
    gateId: string,
  ): {
    ready: boolean;
    progress: any;
    nextSteps: string[];
  } {
    const gate = architecture.activeGates.find((g) => g.id === gateId);
    if (!gate) {
      return {
        ready: false,
        progress: null,
        nextSteps: ["Gate not found"],
      };
    }

    // Find corresponding reflection gap
    const reflectionGap = this.findReflectionGap(
      architecture,
      gate.contentToUnlock,
    );

    const ready = this.gateService.checkGateReadiness(gate, reflectionGap);

    const completedRequirements = gate.requirements.filter(
      (req) => req.completed,
    );
    const progress = {
      completedRequirements: completedRequirements.length,
      totalRequirements: gate.requirements.length,
      percentComplete:
        (completedRequirements.length / gate.requirements.length) * 100,
      integrationQuality: reflectionGap
        ? this.gateService.calculateIntegrationQuality(
            reflectionGap.integrationEvidence,
            gate.requirements,
          )
        : 0,
    };

    const nextSteps = gate.requirements
      .filter((req) => !req.completed)
      .map((req) => req.description);

    return { ready, progress, nextSteps };
  }

  private findReflectionGap(
    architecture: IntegrationArchitecture,
    contentId: string,
  ): any {
    // In real implementation, this would query stored reflection gaps
    return {
      integrationEvidence: [],
      minimumDuration: 3,
      startDate: new Date(),
      bypassAttempts: 0,
    };
  }

  generateDashboardData(architecture: IntegrationArchitecture): {
    currentStage: string;
    integrationProgress: any;
    bypassingAlerts: any[];
    spiralInsights: any;
    consistencyMetrics: any;
    nextActions: string[];
  } {
    // Generate consistency celebrations
    const consistencyData = this.embodiedWisdom.celebrateConsistency(
      architecture.embodiedWisdom.consistencyMetrics,
      architecture.embodiedWisdom.ordinaryMomentAwareness,
    );

    // Generate embodied wisdom insights
    const wisdomInsights = this.embodiedWisdom.generateEmbodiedWisdomInsights(
      architecture.embodiedWisdom,
    );

    // Generate spiral insights
    const spiralInsights = this.spiralTracker.generateSpiralInsights(
      architecture.spiralProgress,
    );

    // Active bypassing alerts
    const activeBypassingAlerts = architecture.bypassingHistory
      .filter((b) => !b.addressed)
      .map((b) => ({
        pattern: b.pattern,
        severity: b.severity,
        interventionRecommended: b.interventionRecommended,
        professionalReferralSuggested: b.professionalReferralSuggested,
      }));

    // Calculate integration progress
    const totalGates = architecture.activeGates.length;
    const unlockedGates = architecture.activeGates.filter(
      (g) => g.unlocked,
    ).length;
    const integrationProgress = {
      gatesUnlocked: unlockedGates,
      totalGates,
      percentComplete: totalGates > 0 ? (unlockedGates / totalGates) * 100 : 0,
      currentPhase: this.determineDevelopmentPhase(architecture),
    };

    // Generate next actions
    const nextActions = this.generateNextActions(architecture, wisdomInsights);

    return {
      currentStage: architecture.currentStage,
      integrationProgress,
      bypassingAlerts: activeBypassingAlerts,
      spiralInsights,
      consistencyMetrics: {
        celebrations: consistencyData.celebrations,
        encouragements: consistencyData.encouragements,
        realityChecks: consistencyData.realityChecks,
      },
      nextActions,
    };
  }

  private determineDevelopmentPhase(
    architecture: IntegrationArchitecture,
  ): string {
    const avgSpiralDepth =
      architecture.spiralProgress.length > 0
        ? architecture.spiralProgress.reduce((sum, p) => sum + p.depth, 0) /
          architecture.spiralProgress.length
        : 1;

    const consistencyCount =
      architecture.embodiedWisdom.consistencyMetrics.length;
    const embodiedWisdomCount =
      architecture.embodiedWisdom.livedExperiences.length;

    if (
      avgSpiralDepth >= 6 &&
      consistencyCount >= 3 &&
      embodiedWisdomCount >= 5
    ) {
      return "Service & Integration";
    } else if (avgSpiralDepth >= 4 && embodiedWisdomCount >= 3) {
      return "Deepening & Embodiment";
    } else if (embodiedWisdomCount >= 1 && consistencyCount >= 1) {
      return "Integration & Practice";
    } else {
      return "Foundation & Exploration";
    }
  }

  private generateNextActions(
    architecture: IntegrationArchitecture,
    wisdomInsights: any,
  ): string[] {
    const actions: string[] = [];

    // Based on wisdom insights
    if (wisdomInsights.growthEdges.length > 0) {
      actions.push(wisdomInsights.growthEdges[0]);
    }

    // Based on bypassing patterns
    const activeBypassingPatterns = architecture.bypassingHistory
      .filter((b) => !b.addressed)
      .slice(0, 1);

    if (activeBypassingPatterns.length > 0) {
      actions.push(activeBypassingPatterns[0].interventionRecommended);
    }

    // Based on integration opportunities
    if (wisdomInsights.integrationOpportunities.length > 0) {
      actions.push(wisdomInsights.integrationOpportunities[0]);
    }

    // Default actions if none specific
    if (actions.length === 0) {
      actions.push(
        "Record one ordinary moment where you applied your practice",
        "Reflect on a recent challenge and what wisdom it offered",
      );
    }

    return actions.slice(0, 3); // Max 3 actions
  }

  auditSystemForMagicalThinking(): {
    auditResults: any[];
    totalIssues: number;
    priorityFixes: string[];
  } {
    const auditResults: any[] = [];
    let totalIssues = 0;
    const priorityFixes: string[] = [];

    // This would audit all content, messaging, and system language
    // For now, provide framework for actual implementation

    priorityFixes.push(
      "Replace all transformation promise language with supportive development language",
      "Add grounding disclaimers to all elemental content",
      "Implement mandatory integration periods between all major content",
      "Create reality-checking prompts for all spiritual concepts",
      "Add professional support referral triggers for bypassing patterns",
    );

    return { auditResults, totalIssues, priorityFixes };
  }
}
