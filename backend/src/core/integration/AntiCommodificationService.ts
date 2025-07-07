import {
  AntiCommodificationSafeguards,
  IntegrationArchitecture,
  BypassingPattern
} from './types';

export class AntiCommodificationService {
  private transformationPromisePhrases = [
    'transform your life',
    'breakthrough to new levels',
    'unlock your potential',
    'activate your power',
    'quantum leap',
    'instant healing',
    'permanent change',
    'never struggle again',
    'complete transformation',
    'life-changing results',
    'guaranteed success',
    'revolutionary breakthrough',
    'unlock hidden abilities',
    'transcend limitations',
    'accelerate growth',
    'instant awakening',
    'miraculous healing',
    'effortless transformation',
    'ultimate freedom',
    'perfect alignment'
  ];

  private humanityEmphasizingLanguage = [
    'support your ongoing human development',
    'honor your process and struggles',
    'embrace the fullness of human experience',
    'navigate life\'s ordinary challenges',
    'find meaning in mundane moments',
    'celebrate small daily consistencies',
    'support your journey as a human being',
    'honor both growth and maintenance phases',
    'validate the slow work of development',
    'appreciate the beauty of ordinary moments',
    'support your humanity rather than transcend it',
    'honor your limitations and vulnerabilities',
    'celebrate showing up imperfectly',
    'find wisdom in mistakes and struggles',
    'appreciate the grit and grind of daily practice'
  ];

  private consumptionPrevention = {
    maxDailyContentRequests: 3,
    mandatoryReflectionPeriods: {
      insight: 24, // hours
      practice: 72, // hours
      breakthrough: 168 // hours (1 week)
    },
    integrationRequiredForAdvancement: true,
    communityValidationForMajorContent: true
  };

  scanForTransformationPromises(content: string): {
    flagged: boolean;
    flaggedPhrases: string[];
    replacementSuggestions: string[];
  } {
    const flaggedPhrases: string[] = [];
    const replacementSuggestions: string[] = [];
    const contentLower = content.toLowerCase();

    this.transformationPromisePhrases.forEach(phrase => {
      if (contentLower.includes(phrase.toLowerCase())) {
        flaggedPhrases.push(phrase);
        replacementSuggestions.push(this.generateHumanityReplacement(phrase));
      }
    });

    return {
      flagged: flaggedPhrases.length > 0,
      flaggedPhrases,
      replacementSuggestions
    };
  }

  private generateHumanityReplacement(transformationPhrase: string): string {
    const replacements = {
      'transform your life': 'support your ongoing development as a human being',
      'breakthrough to new levels': 'explore new perspectives while honoring where you are',
      'unlock your potential': 'discover what\'s already present in your experience',
      'activate your power': 'connect with your inherent human capacity',
      'quantum leap': 'take thoughtful steps in your development',
      'instant healing': 'support your natural healing process over time',
      'permanent change': 'cultivate sustainable practices that serve your growth',
      'never struggle again': 'develop tools for navigating life\'s inevitable challenges',
      'complete transformation': 'support your ongoing development journey',
      'life-changing results': 'meaningful support for your growth process',
      'guaranteed success': 'tools that some people find helpful',
      'revolutionary breakthrough': 'gentle exploration of new perspectives',
      'unlock hidden abilities': 'explore capacities that may be present in your experience',
      'transcend limitations': 'work skillfully with your human limitations',
      'accelerate growth': 'honor your natural pace of development',
      'instant awakening': 'support your gradual awakening to what\'s present',
      'miraculous healing': 'support your body\'s natural healing wisdom',
      'effortless transformation': 'make space for the effort that real growth requires',
      'ultimate freedom': 'find freedom within the constraints of human life',
      'perfect alignment': 'explore greater harmony while accepting imperfection'
    };

    return replacements[transformationPhrase.toLowerCase() as keyof typeof replacements] || 
           'support your human development process';
  }

  detectConsumptionPatterns(userBehavior: any): {
    isConsumptive: boolean;
    patterns: string[];
    interventions: string[];
  } {
    const patterns: string[] = [];
    const interventions: string[] = [];
    let isConsumptive = false;

    // Check for rapid content consumption
    if (userBehavior.dailyContentRequests > this.consumptionPrevention.maxDailyContentRequests) {
      patterns.push('Rapid content consumption exceeding healthy limits');
      interventions.push('Mandatory integration period before new content access');
      isConsumptive = true;
    }

    // Check for insight addiction patterns
    if (userBehavior.insightToApplicationRatio > 3) {
      patterns.push('High ratio of insights to practical application');
      interventions.push('Focus on applying existing insights before seeking new ones');
      isConsumptive = true;
    }

    // Check for breakthrough seeking
    if (userBehavior.breakthroughSeekingBehavior > 2) {
      patterns.push('Pattern of seeking dramatic breakthroughs over consistent practice');
      interventions.push('Celebrate ordinary moments and consistent small practices');
      isConsumptive = true;
    }

    // Check for avoiding ordinary content
    if (userBehavior.ordinaryContentAvoidance > 70) {
      patterns.push('Consistent avoidance of ordinary, foundational content');
      interventions.push('Engage with basic practices and mundane integration tools');
      isConsumptive = true;
    }

    return { isConsumptive, patterns, interventions };
  }

  implementPacingAlgorithm(
    userArchitecture: IntegrationArchitecture,
    requestedContent: any
  ): {
    allowed: boolean;
    waitTime?: number;
    message: string;
    alternativeActivities: string[];
  } {
    const lastContentAccess = userArchitecture.lastIntegrationCheck;
    const timeSinceLastAccess = Date.now() - lastContentAccess.getTime();
    const hoursWaited = timeSinceLastAccess / (1000 * 60 * 60);

    // Check for insight addiction pattern
    const hasInsightAddiction = userArchitecture.bypassingHistory.some(
      b => b.pattern === BypassingPattern.INSIGHT_ADDICTION && !b.addressed
    );

    if (hasInsightAddiction) {
      const requiredWaitTime = this.consumptionPrevention.mandatoryReflectionPeriods.insight;
      if (hoursWaited < requiredWaitTime) {
        return {
          allowed: false,
          waitTime: requiredWaitTime - hoursWaited,
          message: "Integration time is essential for sustainable growth. Your insights need time to settle into daily life.",
          alternativeActivities: this.getIntegrationActivities()
        };
      }
    }

    // Check for breakthrough content pacing
    if (requestedContent.type === 'breakthrough' || requestedContent.intensity === 'high') {
      const requiredWaitTime = this.consumptionPrevention.mandatoryReflectionPeriods.breakthrough;
      if (hoursWaited < requiredWaitTime) {
        return {
          allowed: false,
          waitTime: requiredWaitTime - hoursWaited,
          message: "Major insights need extended integration time. This waiting period prevents spiritual bypassing and supports real transformation.",
          alternativeActivities: this.getDeepIntegrationActivities()
        };
      }
    }

    return {
      allowed: true,
      message: "Ready for new content. Remember to balance exploration with integration.",
      alternativeActivities: []
    };
  }

  private getIntegrationActivities(): string[] {
    return [
      "Reflect on how your recent insights are showing up in daily life",
      "Practice one small behavior change based on recent learning",
      "Journal about challenges you're facing in applying recent insights",
      "Share your integration process with a trusted friend or community",
      "Focus on being present during mundane daily tasks",
      "Practice gratitude for ordinary moments in your life",
      "Review and recommit to basic daily practices",
      "Ask yourself: 'What am I avoiding by seeking new insights?'"
    ];
  }

  private getDeepIntegrationActivities(): string[] {
    return [
      "Create a detailed plan for applying your recent breakthrough in daily life",
      "Identify three specific relationships where this insight could improve your presence",
      "Practice the insight during your most challenging daily responsibilities",
      "Seek feedback from trusted friends about changes they've observed in you",
      "Volunteer or serve others as a way to ground your insights in meaningful action",
      "Work with a therapist or counselor to process the depth of your recent breakthrough",
      "Create art, write, or express your integration process creatively",
      "Mentor someone else who might benefit from your hard-won wisdom"
    ];
  }

  generateHumanityEmphasis(content: string): string {
    let humanizedContent = content;

    // Replace transcendence language
    const transcendenceReplacements = {
      'transcend': 'work skillfully with',
      'beyond human': 'fully human',
      'rise above': 'engage deeply with',
      'escape from': 'find peace within',
      'overcome': 'learn to dance with',
      'conquer': 'befriend',
      'master': 'develop a healthy relationship with',
      'eliminate': 'transform your relationship with',
      'eradicate': 'learn to navigate'
    };

    Object.entries(transcendenceReplacements).forEach(([original, replacement]) => {
      const regex = new RegExp(original, 'gi');
      humanizedContent = humanizedContent.replace(regex, replacement);
    });

    // Add humanity emphasis
    const randomHumanityPhrase = this.humanityEmphasizingLanguage[
      Math.floor(Math.random() * this.humanityEmphasizingLanguage.length)
    ];

    humanizedContent += `\n\n🌱 Remember: This practice is designed to ${randomHumanityPhrase}.`;

    return humanizedContent;
  }

  validateCommunityIntegration(
    userSharing: any,
    communityFeedback: any
  ): {
    isGrounded: boolean;
    feedback: string[];
    concerns: string[];
  } {
    const feedback: string[] = [];
    const concerns: string[] = [];

    // Check for spiritual superiority in sharing
    const superiorityIndicators = [
      'less awakened',
      'not ready for',
      'higher level',
      'more evolved',
      'beyond that stage',
      'transcended that'
    ];

    const sharingText = userSharing.content?.toLowerCase() || '';
    superiorityIndicators.forEach(indicator => {
      if (sharingText.includes(indicator)) {
        concerns.push(`Sharing shows potential spiritual superiority: "${indicator}"`);
      }
    });

    // Check community feedback for reality grounding
    if (communityFeedback.realityChecks > 0) {
      feedback.push('Community is providing helpful reality checks');
    }

    if (communityFeedback.ordinaryMomentValidation > 0) {
      feedback.push('Community is celebrating ordinary moments and struggles');
    }

    if (communityFeedback.bypassingConcerns > 0) {
      concerns.push('Community has expressed concerns about spiritual bypassing');
    }

    const isGrounded = concerns.length === 0 && feedback.length > 0;

    return { isGrounded, feedback, concerns };
  }

  createAntiCommodificationSafeguards(): AntiCommodificationSafeguards {
    return {
      transformationPromiseDetection: {
        flaggedPhrases: this.transformationPromisePhrases,
        replacementLanguage: this.humanityEmphasizingLanguage,
        preventionActive: true
      },
      pacingAlgorithms: {
        insightSeekingUserDetection: true,
        mandatorySlowDown: true,
        integrationPeriodEnforcement: true
      },
      humanityEmphasis: {
        transcendenceSeekingPrevention: true,
        ordinaryStruggleValidation: true,
        beingHumanCelebration: true
      }
    };
  }

  auditContentForCommodification(content: any): {
    score: number; // 0-100, higher is more commodified
    issues: string[];
    recommendations: string[];
  } {
    let score = 0;
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for transformation promises (heavy penalty)
    const transformationScan = this.scanForTransformationPromises(content.text || '');
    if (transformationScan.flagged) {
      score += 30;
      issues.push('Contains transformation promises');
      recommendations.push('Replace transformation language with supportive development language');
    }

    // Check for magical thinking
    const magicalWords = ['manifest', 'vibration', 'frequency', 'energy field', 'quantum'];
    const contentText = (content.text || '').toLowerCase();
    magicalWords.forEach(word => {
      if (contentText.includes(word)) {
        score += 10;
        issues.push(`Contains potentially magical thinking: "${word}"`);
        recommendations.push(`Reframe "${word}" as metaphorical or provide scientific context`);
      }
    });

    // Check for authority claims
    const authorityClaims = ['the truth is', 'you must', 'always works', 'guaranteed'];
    authorityClaims.forEach(claim => {
      if (contentText.includes(claim)) {
        score += 15;
        issues.push(`Contains authority claim: "${claim}"`);
        recommendations.push(`Soften "${claim}" to invite rather than command`);
      }
    });

    // Check for transcendence emphasis
    const transcendenceWords = ['transcend', 'beyond human', 'rise above', 'escape'];
    transcendenceWords.forEach(word => {
      if (contentText.includes(word)) {
        score += 10;
        issues.push(`Emphasizes transcendence over humanity: "${word}"`);
        recommendations.push(`Replace "${word}" with humanity-embracing language`);
      }
    });

    // Positive elements (reduce score)
    const humanityWords = ['human', 'ordinary', 'struggle', 'imperfect', 'journey'];
    humanityWords.forEach(word => {
      if (contentText.includes(word)) {
        score = Math.max(0, score - 5);
      }
    });

    if (content.disclaimers && content.disclaimers.length > 0) {
      score = Math.max(0, score - 10);
    }

    if (content.integrationRequirements) {
      score = Math.max(0, score - 15);
    }

    return { score, issues, recommendations };
  }

  generateOrdinaryMomentCelebrations(): string[] {
    return [
      "🌱 Your consistency in small daily practices is the foundation of all sustainable growth.",
      "✨ The fact that you showed up today, imperfectly and humanly, is worthy of celebration.",
      "🌿 Ordinary moments of presence are just as valuable as any peak experience.",
      "💫 Your willingness to be human—with all the messiness that includes—is beautiful.",
      "🌱 The slow, unglamorous work of development is where real transformation lives.",
      "✨ Celebrating maintenance phases: staying stable is as important as dramatic growth.",
      "🌿 Your struggles and mistakes are not obstacles to wisdom—they are wisdom itself.",
      "💫 There is profound beauty in choosing to show up for your mundane responsibilities.",
      "🌱 The most ordinary day contains infinite opportunities for presence and growth.",
      "✨ Your humanity—including your limitations—is not something to transcend but to honor."
    ];
  }
}