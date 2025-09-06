import {
  ElementalContent,
  ElementalArchetype,
  ContentComplexity,
  ContentType,
  ContentDeliveryContext,
  ContentRecommendation,
  UserElementalProfile,
  ContentEngagement,
  IntegrationRequirement,
  ContentAdaptationSettings,
  CrossDomainIntegration,
} from "./types";
import { IntegrationArchitecture } from "../integration/types";
import { AntiCommodificationService } from "../integration/AntiCommodificationService";

export class ElementalContentService {
  private antiCommodification: AntiCommodificationService;
  private contentLibrary: Map<string, ElementalContent>;
  private userProfiles: Map<string, UserElementalProfile>;

  constructor() {
    this.antiCommodification = new AntiCommodificationService();
    this.contentLibrary = new Map();
    this.userProfiles = new Map();
    this.initializeContentLibrary();
  }

  async getContentRecommendations(
    context: ContentDeliveryContext,
    settings: ContentAdaptationSettings,
  ): Promise<ContentRecommendation[]> {
    // Get user&apos;s elemental profile
    const userProfile = await this.getUserElementalProfile(context.userId);

    // Check anti-commodification gates
    const commodificationCheck =
      this.antiCommodification.implementPacingAlgorithm(
        { lastIntegrationCheck: new Date() } as any,
        { type: &quot;content_request&quot; },
      );

    if (!commodificationCheck.allowed) {
      return this.generatePacingRecommendations(commodificationCheck.message);
    }

    // Filter content based on user readiness
    const availableContent = await this.filterContentByReadiness(
      context,
      userProfile,
    );

    // Generate recommendations with integration focus
    const recommendations = await this.generateRecommendations(
      availableContent,
      context,
      userProfile,
      settings,
    );

    return this.sortByIntegrationReadiness(recommendations);
  }

  private async getUserElementalProfile(
    userId: string,
  ): Promise<UserElementalProfile> {
    // In real implementation, fetch from database
    return (
      this.userProfiles.get(userId) || {
        userId,
        primaryArchetype: ElementalArchetype.EARTH,
        archetypeStrengths: {
          [ElementalArchetype.FIRE]: 5,
          [ElementalArchetype.WATER]: 6,
          [ElementalArchetype.EARTH]: 8,
          [ElementalArchetype.AIR]: 4,
        },
        contentHistory: [],
        integrationPattern: &quot;steady_progress&quot;,
        lastAssessment: new Date(),
      }
    );
  }

  private async filterContentByReadiness(
    context: ContentDeliveryContext,
    profile: UserElementalProfile,
  ): Promise<ElementalContent[]> {
    const allContent = Array.from(this.contentLibrary.values());

    return allContent.filter((content) => {
      // Check prerequisite gates
      if (!this.prerequisitesMet(content, context)) {
        return false;
      }

      // Check integration capacity
      if (!this.hasIntegrationCapacity(content, context)) {
        return false;
      }

      // Check for unintegrated content
      if (this.hasUnintegratedContent(content, context)) {
        return false;
      }

      // Check bypassing prevention
      if (this.triggersRecentBypassingPatterns(content, context)) {
        return false;
      }

      return true;
    });
  }

  private prerequisitesMet(
    content: ElementalContent,
    context: ContentDeliveryContext,
  ): boolean {
    // Check if user has completed prerequisite content
    return content.prerequisiteGates.every((gateId) => {
      // In real implementation, check against user&apos;s completed gates
      return true;
    });
  }

  private hasIntegrationCapacity(
    content: ElementalContent,
    context: ContentDeliveryContext,
  ): boolean {
    const requiredCapacity = this.calculateRequiredCapacity(content);
    return context.integrationCapacity >= requiredCapacity;
  }

  private calculateRequiredCapacity(content: ElementalContent): number {
    const complexityWeights = {
      [ContentComplexity.FOUNDATIONAL]: 2,
      [ContentComplexity.INTERMEDIATE]: 4,
      [ContentComplexity.ADVANCED]: 7,
      [ContentComplexity.INTEGRATION_FOCUSED]: 3,
    };

    return complexityWeights[content.complexity];
  }

  private hasUnintegratedContent(
    content: ElementalContent,
    context: ContentDeliveryContext,
  ): boolean {
    // Prevent new content if user has unintegrated previous content
    return (
      context.unintegratedContent.length > 0 &&
      content.complexity !== ContentComplexity.INTEGRATION_FOCUSED
    );
  }

  private triggersRecentBypassingPatterns(
    content: ElementalContent,
    context: ContentDeliveryContext,
  ): boolean {
    return content.bypassingAlerts.some((alert) =>
      context.recentBypassingPatterns.includes(alert),
    );
  }

  private async generateRecommendations(
    availableContent: ElementalContent[],
    context: ContentDeliveryContext,
    profile: UserElementalProfile,
    settings: ContentAdaptationSettings,
  ): Promise<ContentRecommendation[]> {
    const recommendations: ContentRecommendation[] = [];

    for (const content of availableContent) {
      const adaptationReason = this.determineAdaptationReason(
        content,
        context,
        profile,
      );
      const integrationReadiness = this.calculateIntegrationReadiness(
        content,
        context,
        profile,
      );

      if (integrationReadiness < 3) continue; // Skip if not ready

      const recommendation: ContentRecommendation = {
        content: this.adaptContent(content, context, settings),
        adaptationReason,
        prerequisitesMet: true,
        integrationReadiness,
        recommendedApproach: this.generateRecommendedApproach(
          content,
          context,
          profile,
        ),
        realityGroundingPrompts: this.generateRealityGroundingPrompts(
          content,
          context,
        ),
        communityEngagementSuggestions:
          this.generateCommunityEngagementSuggestions(content, profile),
      };

      recommendations.push(recommendation);
    }

    return recommendations;
  }

  private determineAdaptationReason(
    content: ElementalContent,
    context: ContentDeliveryContext,
    profile: UserElementalProfile,
  ): string {
    if (context.stressLevel > 7) {
      return &quot;Adapted for high stress - focusing on grounding and stability&quot;;
    }

    if (context.energyLevel < 4) {
      return "Adapted for low energy - gentle, accessible practices";
    }

    if (content.archetype === profile.primaryArchetype) {
      return "Aligned with your primary elemental strength for deeper integration";
    }

    if (profile.archetypeStrengths[content.archetype] < 5) {
      return "Developing your capacity in this elemental domain";
    }

    return "Selected to support your current developmental needs";
  }

  private calculateIntegrationReadiness(
    content: ElementalContent,
    context: ContentDeliveryContext,
    profile: UserElementalProfile,
  ): number {
    let readiness = 5; // Base readiness

    // Adjust for user capacity
    readiness += Math.min(
      context.integrationCapacity - this.calculateRequiredCapacity(content),
      3,
    );

    // Adjust for archetype alignment
    if (content.archetype === profile.primaryArchetype) {
      readiness += 2;
    }

    // Adjust for stress/energy
    if (
      context.stressLevel > 7 &&
      content.contentType === ContentType.PRACTICE
    ) {
      readiness -= 2;
    }

    if (
      context.energyLevel < 4 &&
      content.complexity === ContentComplexity.ADVANCED
    ) {
      readiness -= 3;
    }

    // Adjust for recent activity
    const hoursSinceLastAccess =
      (Date.now() - context.lastContentAccess.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastAccess < 24) {
      readiness -= 2; // Encourage pacing
    }

    return Math.max(1, Math.min(10, readiness));
  }

  private adaptContent(
    content: ElementalContent,
    context: ContentDeliveryContext,
    settings: ContentAdaptationSettings,
  ): ElementalContent {
    const adapted = { ...content };

    if (settings.emphasizeMetaphorical) {
      adapted.content = this.emphasizeMetaphoricalLanguage(
        adapted.content,
        adapted.metaphoricalFraming,
      );
    }

    if (settings.includeDisclaimers) {
      adapted.disclaimers = [
        ...adapted.disclaimers,
        "This content offers perspective and practices for reflection, not absolute truth or guaranteed outcomes.",
        "Your own discernment and lived experience are the primary guides for your development.",
        "Consider professional support if you notice patterns of distress or avoidance.",
      ];
    }

    // Adapt complexity based on user state
    if (context.stressLevel > 7) {
      adapted.content = this.simplifyForStressState(adapted.content);
      adapted.realWorldApplications = adapted.realWorldApplications.filter(
        (app) =>
          app.includes(&quot;gentle") ||
          app.includes("simple") ||
          app.includes("basic"),
      );
    }

    return adapted;
  }

  private emphasizeMetaphoricalLanguage(
    content: string,
    metaphoricalFraming: string,
  ): string {
    return `${metaphoricalFraming}\n\n${content}\n\nRemember: These elemental metaphors serve as tools for understanding patterns in your experience, not literal descriptions of spiritual realities.`;
  }

  private simplifyForStressState(content: string): string {
    // Simplify language and focus on immediate, practical applications
    return content
      .replace(/complex|advanced|deep dive/gi, "gentle")
      .replace(/transformation|breakthrough/gi, "small step")
      .replace(/profound|mystical/gi, "simple");
  }

  private generateRecommendedApproach(
    content: ElementalContent,
    context: ContentDeliveryContext,
    profile: UserElementalProfile,
  ): string {
    const approaches = [];

    if (context.stressLevel > 6) {
      approaches.push("Start with just 5 minutes of gentle engagement");
    }

    if (content.contentType === ContentType.PRACTICE) {
      approaches.push("Focus on consistency over intensity");
    }

    if (profile.integrationPattern === "steady_progress") {
      approaches.push(
        "Take time to notice how this shows up in ordinary moments",
      );
    }

    approaches.push(
      "Consider sharing your experience with the community for reality-checking",
    );

    return approaches.join(". ") + ".";
  }

  private generateRealityGroundingPrompts(
    content: ElementalContent,
    context: ContentDeliveryContext,
  ): string[] {
    const prompts = [
      "How does this insight apply to your daily responsibilities?",
      "What would someone who knows you well say about this perspective?",
      "How can you practice this in ordinary, mundane moments?",
      "What are the human challenges in applying this wisdom?",
    ];

    if (content.archetype === ElementalArchetype.FIRE) {
      prompts.push("How can you channel this energy into constructive action?");
    } else if (content.archetype === ElementalArchetype.WATER) {
      prompts.push(
        "How does this flow support your relationships with others?",
      );
    } else if (content.archetype === ElementalArchetype.EARTH) {
      prompts.push("How does this create stability in your practical life?");
    } else if (content.archetype === ElementalArchetype.AIR) {
      prompts.push("How can you ground these insights in concrete experience?");
    }

    return prompts.slice(0, 3); // Return top 3 relevant prompts
  }

  private generateCommunityEngagementSuggestions(
    content: ElementalContent,
    profile: UserElementalProfile,
  ): string[] {
    return [
      "Share your real-world application attempts, including what didn&apos;t work",
      "Ask for reality-checking on your understanding",
      "Offer support to others working with similar themes",
      "Request accountability for consistent practice",
    ];
  }

  private sortByIntegrationReadiness(
    recommendations: ContentRecommendation[],
  ): ContentRecommendation[] {
    return recommendations.sort(
      (a, b) => b.integrationReadiness - a.integrationReadiness,
    );
  }

  private generatePacingRecommendations(
    message: string,
  ): ContentRecommendation[] {
    // Return integration-focused content when pacing limits are hit
    const integrationContent = Array.from(this.contentLibrary.values()).filter(
      (content) => content.contentType === ContentType.INTEGRATION_EXERCISE,
    );

    return integrationContent.slice(0, 3).map((content) => ({
      content,
      adaptationReason: message,
      prerequisitesMet: true,
      integrationReadiness: 8,
      recommendedApproach:
        "Focus on integrating previous insights before accessing new content",
      realityGroundingPrompts: [
        "What insights from previous content are you still working to embody?",
        "How can you deepen your current practice rather than adding new elements?",
      ],
      communityEngagementSuggestions: [
        "Share your integration challenges with the community",
        "Ask for support in applying previous insights",
      ],
    }));
  }

  // Content library initialization
  private initializeContentLibrary(): void {
    // Fire archetype content
    this.addContent({
      id: "fire-foundational-passion",
      title: "Sacred Passion and Directed Energy",
      archetype: ElementalArchetype.FIRE,
      complexity: ContentComplexity.FOUNDATIONAL,
      contentType: ContentType.INSIGHT,
      description: "Understanding passion as a tool for purposeful action",
      content: "Passion is not a feeling to chase, but energy to direct...",
      metaphoricalFraming:
        "Like fire, passion can warm and illuminate, or burn and destroy - the difference lies in how it&apos;s contained and directed.",
      realWorldApplications: [
        "Channel frustration into constructive problem-solving",
        "Use excitement to fuel consistent daily practices",
        "Transform anger into clear boundary-setting",
      ],
      integrationRequirements: [
        {
          type: "application",
          description:
            "Practice directing passionate energy into one specific area for a week",
          minimumPeriod: 7,
          validationCriteria: [
            "Consistent daily practice",
            "Documented real-world results",
          ],
        },
      ],
      prerequisiteGates: [],
      estimatedEngagementTime: 15,
      integrationPeriod: 14,
      bypassingAlerts: ["spiritual_superiority", "transcendence_seeking"],
      disclaimers: [
        "This is a perspective for exploration, not a universal truth",
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Water archetype content
    this.addContent({
      id: "water-foundational-flow",
      title: "Adaptive Flow and Emotional Wisdom",
      archetype: ElementalArchetype.WATER,
      complexity: ContentComplexity.FOUNDATIONAL,
      contentType: ContentType.PRACTICE,
      description:
        "Learning to flow with life circumstances while maintaining your essential nature",
      content: "Water teaches us about adaptation without losing essence...",
      metaphoricalFraming:
        "Like water finding its way around obstacles, we can learn to adapt without compromising our core values.",
      realWorldApplications: [
        "Practice flexibility in daily plans while maintaining core priorities",
        "Learn to feel emotions fully without being overwhelmed by them",
        "Adapt communication style to different relationships while staying authentic",
      ],
      integrationRequirements: [
        {
          type: "reflection",
          description: "Daily reflection on moments of successful adaptation",
          minimumPeriod: 10,
          validationCriteria: [
            "Consistent journaling",
            "Specific examples documented",
          ],
        },
      ],
      prerequisiteGates: [],
      estimatedEngagementTime: 20,
      integrationPeriod: 21,
      bypassingAlerts: ["emotional_avoidance"],
      disclaimers: ["Adaptation doesn&apos;t mean losing your boundaries or values"],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Earth archetype content
    this.addContent({
      id: "earth-foundational-grounding",
      title: "Practical Wisdom and Embodied Stability",
      archetype: ElementalArchetype.EARTH,
      complexity: ContentComplexity.FOUNDATIONAL,
      contentType: ContentType.PRACTICE,
      description:
        "Building stability through consistent, practical wisdom application",
      content:
        "True grounding comes not from peak experiences but from showing up consistently to ordinary life...",
      metaphoricalFraming:
        "Like earth that supports all growth, we develop stability through consistent presence to daily life.",
      realWorldApplications: [
        "Establish reliable daily routines that support your wellbeing",
        "Practice presence during mundane tasks like washing dishes or commuting",
        "Build consistency in small commitments before taking on larger ones",
      ],
      integrationRequirements: [
        {
          type: "consistency_demonstration",
          description: "Maintain one simple daily practice for 30 days",
          minimumPeriod: 30,
          validationCriteria: [
            "Daily practice completion",
            "Obstacle documentation and adaptation",
          ],
        },
      ],
      prerequisiteGates: [],
      estimatedEngagementTime: 10,
      integrationPeriod: 45,
      bypassingAlerts: ["ordinary_rejection", "insight_addiction"],
      disclaimers: [
        "Grounding practices support but don&apos;t replace professional mental health care when needed",
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Air archetype content
    this.addContent({
      id: "air-foundational-perspective",
      title: "Mental Clarity and Balanced Perspective",
      archetype: ElementalArchetype.AIR,
      complexity: ContentComplexity.FOUNDATIONAL,
      contentType: ContentType.REFLECTION,
      description:
        "Developing mental clarity while staying grounded in embodied experience",
      content:
        "Mental clarity serves embodied wisdom, not the other way around...",
      metaphoricalFraming:
        "Like air that gives space for all other elements to move, mental clarity creates space for wisdom to emerge.",
      realWorldApplications: [
        "Practice stepping back from reactive thoughts before responding",
        "Use breath awareness to create space during difficult conversations",
        "Question assumptions while staying connected to felt experience",
      ],
      integrationRequirements: [
        {
          type: "community_validation",
          description:
            "Share perspective shifts with community for reality-checking",
          minimumPeriod: 14,
          validationCriteria: [
            "Community engagement",
            "Grounded application examples",
          ],
        },
      ],
      prerequisiteGates: [],
      estimatedEngagementTime: 25,
      integrationPeriod: 28,
      bypassingAlerts: ["spiritual_superiority", "ordinary_rejection"],
      disclaimers: [
        "Mental insights are tools for embodied living, not ends in themselves",
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  private addContent(content: ElementalContent): void {
    this.contentLibrary.set(content.id, content);
  }

  // Cross-domain integration methods
  async generateCrossDomainIntegration(
    userId: string,
    completedContent: string[],
  ): Promise<CrossDomainIntegration[]> {
    const userProfile = await this.getUserElementalProfile(userId);
    const contentHistory = completedContent
      .map((id) => this.contentLibrary.get(id))
      .filter(Boolean);

    const archetypesExplored = Array.from(
      new Set(contentHistory.map((c) => c!.archetype)),
    );

    if (archetypesExplored.length < 2) {
      return []; // Need at least 2 archetypes for cross-domain work
    }

    const integrations: CrossDomainIntegration[] = [];

    // Fire + Water integration
    if (
      archetypesExplored.includes(ElementalArchetype.FIRE) &&
      archetypesExplored.includes(ElementalArchetype.WATER)
    ) {
      integrations.push({
        domains: [ElementalArchetype.FIRE, ElementalArchetype.WATER],
        integrationTheme:
          "Passionate Flow - Directing Energy with Emotional Wisdom",
        realWorldScenarios: [
          "Leading a team project with both clarity and empathy",
          "Advocating for important values while staying open to others' perspectives",
          "Pursuing goals with intensity while adapting to changing circumstances",
        ],
        practiceRequirements: [
          "Practice expressing passion while staying emotionally attuned to others",
          "Notice when to push forward and when to yield gracefully",
        ],
        communityValidation: true,
        progressMarkers: [
          "Can maintain passionate commitment without steamrolling others",
          "Adapts approach while staying true to core values",
        ],
      });
    }

    // Earth + Air integration
    if (
      archetypesExplored.includes(ElementalArchetype.EARTH) &&
      archetypesExplored.includes(ElementalArchetype.AIR)
    ) {
      integrations.push({
        domains: [ElementalArchetype.EARTH, ElementalArchetype.AIR],
        integrationTheme:
          "Grounded Wisdom - Mental Clarity Rooted in Embodied Experience",
        realWorldScenarios: [
          "Making important decisions using both logical analysis and body wisdom",
          "Teaching or mentoring with both theoretical knowledge and practical experience",
          "Problem-solving that honors both innovative thinking and practical constraints",
        ],
        practiceRequirements: [
          "Check mental insights against felt sense and practical application",
          "Ground new ideas in concrete, actionable steps",
        ],
        communityValidation: true,
        progressMarkers: [
          "Can articulate insights while staying connected to embodied experience",
          "Makes decisions that are both innovative and practical",
        ],
      });
    }

    return integrations;
  }

  async trackContentEngagement(
    userId: string,
    contentId: string,
    engagement: Partial<ContentEngagement>,
  ): Promise<void> {
    const userProfile = await this.getUserElementalProfile(userId);

    const fullEngagement: ContentEngagement = {
      contentId,
      accessedAt: new Date(),
      engagementDuration: 0,
      integrationStarted: false,
      integrationCompleted: false,
      realWorldApplications: [],
      strugglesEncountered: [],
      communityFeedbackSought: false,
      bypassingPatternsDetected: [],
      ...engagement,
    };

    userProfile.contentHistory.push(fullEngagement);
    this.userProfiles.set(userId, userProfile);

    // In real implementation, save to database
  }
}
