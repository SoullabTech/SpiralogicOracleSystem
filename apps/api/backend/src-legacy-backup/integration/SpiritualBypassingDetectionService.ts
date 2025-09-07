import {
  BypassingPattern,
  BypassingDetection,
  RedFlagSeverity,
  ProfessionalSupportTrigger,
  IntegrationArchitecture,
  RealityGroundingPrompt,
} from "./types";

export class SpiritualBypassingDetectionService {
  private bypassingPatterns = {
    [BypassingPattern.INSIGHT_ADDICTION]: {
      indicators: [
        "seeks new insights without integrating previous ones",
        "focuses on peak experiences over daily practice",
        "avoids reflection gaps between content consumption",
        "prioritizes dramatic breakthroughs over consistent small actions",
        "becomes restless during integration periods",
      ],
      interventions: [
        "Mandatory integration periods between insights",
        "Focus on micro-practices over breakthrough seeking",
        "Reality application tracking requirements",
        "Community accountability for integration",
      ],
    },
    [BypassingPattern.EMOTIONAL_AVOIDANCE]: {
      indicators: [
        "uses spiritual concepts to avoid difficult emotions",
        "seeks transcendence when facing personal challenges",
        "intellectualizes emotions rather than feeling them",
        "avoids shadow work or challenging content",
        "jumps to spiritual solutions for practical problems",
      ],
      interventions: [
        "Mandatory emotional processing in spiritual practices",
        "Shadow work integration requirements",
        "Therapy referrals when patterns persist",
        "Reality-grounding exercises during emotional avoidance",
      ],
    },
    [BypassingPattern.SPIRITUAL_SUPERIORITY]: {
      indicators: [
        "uses spiritual concepts to feel superior to others",
        'dismisses others as "less awakened"',
        "avoids ordinary human struggles and responsibilities",
        "seeks advanced content to feel special",
        "judges others for their spiritual choices",
      ],
      interventions: [
        "Humility practices and reality checks",
        "Community service requirements",
        "Focus on ordinary human struggles",
        "Mentorship opportunities to develop empathy",
      ],
    },
    [BypassingPattern.TRANSCENDENCE_SEEKING]: {
      indicators: [
        "seeks to transcend rather than embrace humanity",
        "avoids mundane aspects of daily life",
        "pursues peak states over sustainable practice",
        "devalues ordinary moments and experiences",
        "seeks escape from human limitations",
      ],
      interventions: [
        "Ordinary moment awareness practices",
        "Celebration of mundane consistency",
        "Integration of spiritual insights into daily tasks",
        "Reality grounding through body-based practices",
      ],
    },
    [BypassingPattern.RESPONSIBILITY_AVOIDANCE]: {
      indicators: [
        "uses spiritual concepts to avoid personal responsibility",
        "blames lack of progress on external factors",
        "seeks spiritual reasons for avoiding difficult work",
        "expects transformation without consistent effort",
        "avoids accountability in relationships",
      ],
      interventions: [
        "Personal accountability tracking",
        "Reality-based goal setting",
        "Community accountability partnerships",
        "Professional support for responsibility patterns",
      ],
    },
    [BypassingPattern.ORDINARY_REJECTION]: {
      indicators: [
        "devalues ordinary human experiences",
        "seeks only peak or transcendent states",
        "avoids dealing with mundane life challenges",
        'dismisses practical concerns as "unspiritual"',
        "pursues extraordinary experiences over daily integration",
      ],
      interventions: [
        "Ordinary moment celebration practices",
        "Daily life integration requirements",
        "Reality-grounding through practical tasks",
        "Community sharing of mundane struggles",
      ],
    },
  };

  detectBypassingPatterns(
    userId: string,
    userBehavior: any,
    contentInteraction: any,
    integrationHistory: any,
  ): BypassingDetection[] {
    const detections: BypassingDetection[] = [];

    // Analyze each pattern
    Object.entries(this.bypassingPatterns).forEach(([pattern, config]) => {
      const detection = this.analyzePattern(
        userId,
        pattern as BypassingPattern,
        config,
        userBehavior,
        contentInteraction,
        integrationHistory,
      );

      if (detection) {
        detections.push(detection);
      }
    });

    return detections;
  }

  private analyzePattern(
    userId: string,
    pattern: BypassingPattern,
    config: any,
    userBehavior: any,
    contentInteraction: any,
    integrationHistory: any,
  ): BypassingDetection | null {
    const triggerEvents: string[] = [];
    let severity = RedFlagSeverity.AWARENESS;

    switch (pattern) {
      case BypassingPattern.INSIGHT_ADDICTION:
        if (
          this.detectInsightAddiction(
            userBehavior,
            contentInteraction,
            integrationHistory,
          )
        ) {
          triggerEvents.push("Rapid content consumption without integration");
          if (integrationHistory.reflectionGapsBypassAttempts > 3) {
            severity = RedFlagSeverity.INTERVENTION;
            triggerEvents.push("Multiple attempts to bypass reflection gaps");
          }
        }
        break;

      case BypassingPattern.EMOTIONAL_AVOIDANCE:
        if (this.detectEmotionalAvoidance(userBehavior, contentInteraction)) {
          triggerEvents.push("Avoidance of emotional processing content");
          if (userBehavior.shadowWorkAvoidance > 2) {
            severity = RedFlagSeverity.CONCERN;
            triggerEvents.push("Consistent avoidance of shadow work");
          }
        }
        break;

      case BypassingPattern.TRANSCENDENCE_SEEKING:
        if (this.detectTranscendenceSeeking(userBehavior, contentInteraction)) {
          triggerEvents.push("Focus on peak experiences over daily practice");
          if (userBehavior.ordinaryMomentRejection > 70) {
            severity = RedFlagSeverity.INTERVENTION;
            triggerEvents.push(
              "Consistent rejection of ordinary moment practices",
            );
          }
        }
        break;

      default:
        return null;
    }

    if (triggerEvents.length === 0) return null;

    return {
      id: this.generateId(),
      userId,
      pattern,
      severity,
      detectedDate: new Date(),
      triggerEvents,
      interventionRecommended: config.interventions[0],
      professionalReferralSuggested: false, // Will be set later through severity escalation
      addressed: false,
    };
  }

  private detectInsightAddiction(
    userBehavior: any,
    contentInteraction: any,
    integrationHistory: any,
  ): boolean {
    const rapidConsumption = contentInteraction.dailyContentRequests > 5;
    const lowIntegration = integrationHistory.averageIntegrationDays < 2;
    const bypassAttempts = integrationHistory.reflectionGapsBypassAttempts > 0;

    return rapidConsumption && (lowIntegration || bypassAttempts);
  }

  private detectEmotionalAvoidance(
    userBehavior: any,
    contentInteraction: any,
  ): boolean {
    const shadowAvoidance = userBehavior.shadowWorkAvoidance > 1;
    const emotionalContentSkip =
      contentInteraction.emotionalProcessingSkipped > 2;
    const intellectualization = userBehavior.intellectualizationPattern > 3;

    return shadowAvoidance || emotionalContentSkip || intellectualization;
  }

  private detectTranscendenceSeeking(
    userBehavior: any,
    contentInteraction: any,
  ): boolean {
    const peakSeekingBehavior =
      contentInteraction.peakExperienceRequests >
      contentInteraction.dailyPracticeEngagement;
    const ordinaryRejection = userBehavior.ordinaryMomentRejection > 50;
    const transcendenceLanguage = userBehavior.transcendenceLanguageUsage > 5;

    return peakSeekingBehavior || ordinaryRejection || transcendenceLanguage;
  }

  generateRealityGroundingPrompts(
    pattern: BypassingPattern,
  ): RealityGroundingPrompt[] {
    const prompts = {
      [BypassingPattern.INSIGHT_ADDICTION]: [
        {
          id: "insight-grounding-1",
          context: "After receiving new insight",
          prompt:
            "Before seeking more information, what is one small way you can practice this insight in your daily life today?",
          followUpQuestions: [
            "What might you be avoiding by seeking more insights?",
            "How can you honor the wisdom you already have?",
            "What would change if you focused on applying rather than acquiring?",
          ],
          redFlagIndicators: [
            "Dismisses question as unnecessary",
            "Immediately seeks more complex insights",
            "Avoids practical application",
          ],
          groundingActions: [
            "Set a specific daily practice",
            "Share insight application with community",
            "Track real-world changes for one week",
          ],
        },
      ],
      [BypassingPattern.EMOTIONAL_AVOIDANCE]: [
        {
          id: "emotional-grounding-1",
          context: "When spiritual concepts arise during emotional difficulty",
          prompt:
            "What emotion are you feeling right now, and how can you be present with it without trying to transcend or transform it?",
          followUpQuestions: [
            "What would happen if you let this emotion be here?",
            "How might this feeling have valuable information for you?",
            "What support do you need to be with this experience?",
          ],
          redFlagIndicators: [
            "Immediately spiritualizes the emotion",
            "Seeks to transform rather than be with",
            "Avoids naming specific emotions",
          ],
          groundingActions: [
            "Sit with emotion for 5 minutes without changing it",
            "Name emotion specifically",
            "Seek appropriate human support",
          ],
        },
      ],
      [BypassingPattern.TRANSCENDENCE_SEEKING]: [
        {
          id: "transcendence-grounding-1",
          context: "When seeking peak experiences",
          prompt:
            "How can you find meaning and connection in this ordinary moment, exactly as it is?",
          followUpQuestions: [
            "What beauty can you find in mundane experiences?",
            "How does this moment connect you to your humanity?",
            "What would change if you valued ordinary moments equally with peak experiences?",
          ],
          redFlagIndicators: [
            "Dismisses ordinary moments as valueless",
            "Seeks immediate transcendent experience",
            "Avoids engagement with present reality",
          ],
          groundingActions: [
            "Practice mundane task meditation",
            "Share ordinary moment appreciations",
            "Celebrate small daily consistencies",
          ],
        },
      ],
    };

    return prompts[pattern as keyof typeof prompts] || [];
  }

  assessSeverityEscalation(
    detection: BypassingDetection,
    recentBehavior: any,
  ): RedFlagSeverity {
    let escalatedSeverity = detection.severity;

    // Escalation criteria
    if (detection.pattern === BypassingPattern.EMOTIONAL_AVOIDANCE) {
      if (recentBehavior.therapyReferralRejections > 2) {
        escalatedSeverity = RedFlagSeverity.PROFESSIONAL_REFERRAL;
      }
    }

    if (detection.pattern === BypassingPattern.INSIGHT_ADDICTION) {
      if (recentBehavior.integrationGateBypassAttempts > 5) {
        escalatedSeverity = RedFlagSeverity.INTERVENTION;
      }
    }

    return escalatedSeverity;
  }

  generateProfessionalSupportTrigger(
    detection: BypassingDetection,
  ): ProfessionalSupportTrigger | null {
    if (detection.severity !== RedFlagSeverity.PROFESSIONAL_REFERRAL) {
      return null;
    }

    const supportTriggers = {
      [BypassingPattern.EMOTIONAL_AVOIDANCE]: {
        recommendedAction:
          "Individual therapy referral for emotional processing support",
        resourcesProvided: [
          "Local therapy directory",
          "Trauma-informed therapy options",
          "Somatic therapy practitioners",
          "Integration-focused therapeutic approaches",
        ],
      },
      [BypassingPattern.RESPONSIBILITY_AVOIDANCE]: {
        recommendedAction: "Life coaching or accountability coaching referral",
        resourcesProvided: [
          "Personal accountability coaches",
          "Life transition support services",
          "Practical life skills coaching",
          "Community accountability programs",
        ],
      },
    };

    const trigger =
      supportTriggers[detection.pattern as keyof typeof supportTriggers];
    if (!trigger) return null;

    return {
      pattern: detection.pattern,
      severity: detection.severity,
      triggerCriteria: detection.triggerEvents,
      recommendedAction: trigger.recommendedAction,
      resourcesProvided: trigger.resourcesProvided,
      followUpRequired: true,
    };
  }

  private generateId(): string {
    return `bypass-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
