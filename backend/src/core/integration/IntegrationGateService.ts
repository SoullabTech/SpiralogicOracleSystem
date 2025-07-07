import {
  IntegrationGate,
  IntegrationRequirement,
  ReflectionGap,
  IntegrationEvidence,
  IntegrationValidation,
  IntegrationStage,
  IntegrationArchitecture
} from './types';

export class IntegrationGateService {
  private minimumReflectionDays = {
    insight: 3,
    practice: 7,
    breakthrough: 14,
    major_realization: 21
  };

  createReflectionGap(
    contentId: string,
    contentType: 'insight' | 'practice' | 'breakthrough' | 'major_realization',
    userId: string
  ): ReflectionGap {
    const minimumDuration = this.minimumReflectionDays[contentType];
    
    return {
      id: this.generateId(),
      contentId,
      startDate: new Date(),
      minimumDuration,
      reflectionPrompts: this.getReflectionPrompts(contentType),
      realityCheckQuestions: this.getRealityCheckQuestions(contentType),
      integrationEvidence: [],
      gateStatus: 'processing',
      bypassAttempts: 0
    };
  }

  private getReflectionPrompts(contentType: string): string[] {
    const prompts = {
      insight: [
        'How is this insight showing up in your daily life?',
        'What small, practical step can you take to embody this understanding?',
        'What resistance or challenges have you noticed in applying this?',
        'How has this changed your interactions with others?'
      ],
      practice: [
        'How consistently have you maintained this practice?',
        'What obstacles have you encountered in daily application?',
        'How has this practice affected your ordinary moments?',
        'What adaptations have you made to fit your real life?',
        'How has this practice supported you during difficult times?'
      ],
      breakthrough: [
        'How has this realization translated into daily actions?',
        'What old patterns have you noticed changing?',
        'How are you integrating this without spiritual bypassing?',
        'What grounded steps are you taking to embody this shift?',
        'How has this affected your relationships and responsibilities?'
      ],
      major_realization: [
        'How are you honoring the depth of this realization without rushing to the next one?',
        'What daily practices support the integration of this understanding?',
        'How has this changed your approach to ordinary challenges?',
        'What professional or community support do you need for this integration?',
        'How are you staying grounded while processing this shift?'
      ]
    };

    return prompts[contentType as keyof typeof prompts] || prompts.insight;
  }

  private getRealityCheckQuestions(contentType: string): string[] {
    return [
      'What am I avoiding by focusing on this content?',
      'How am I being accountable to my daily responsibilities while integrating this?',
      'What would my closest relationships say about how this is manifesting in my life?',
      'Am I using this understanding to avoid difficult emotions or situations?',
      'How am I staying connected to my humanity rather than seeking transcendence?'
    ];
  }

  validateIntegrationEvidence(
    evidence: IntegrationEvidence,
    requirements: IntegrationRequirement[]
  ): IntegrationValidation {
    const criteria = this.getValidationCriteria(evidence.type);
    const validated = this.assessEvidence(evidence, criteria);

    return {
      type: 'self_assessment',
      criteria,
      evidence: [evidence.description, evidence.realWorldContext],
      validated,
      validationDate: new Date(),
      notes: validated ? 'Evidence meets integration criteria' : 'Evidence needs more grounding in daily reality'
    };
  }

  private getValidationCriteria(evidenceType: string): string[] {
    const criteria = {
      daily_practice: [
        'Practice occurs consistently in real-world context',
        'Practice adapts to daily challenges and obstacles',
        'Practice maintains presence during mundane activities',
        'Practice supports rather than escapes from responsibilities'
      ],
      relationship_change: [
        'Change observed and validated by others',
        'Change improves real relationship dynamics',
        'Change includes increased accountability and presence',
        'Change maintains healthy boundaries and authenticity'
      ],
      behavior_shift: [
        'Shift sustained over multiple weeks',
        'Shift applicable to ordinary daily situations',
        'Shift includes facing rather than avoiding difficulties',
        'Shift supports practical life improvements'
      ],
      ordinary_moment: [
        'Awareness present during mundane activities',
        'Practice does not seek to escape or transcend ordinary life',
        'Integration honored in simple daily tasks',
        'Appreciation for human limitations and challenges'
      ],
      struggle_navigation: [
        'Healthy coping with real-world challenges',
        'Integration supports rather than replaces professional help when needed',
        'Practice includes accepting human limitations',
        'Wisdom gained without spiritual superiority'
      ]
    };

    return criteria[evidenceType as keyof typeof criteria] || criteria.daily_practice;
  }

  private assessEvidence(evidence: IntegrationEvidence, criteria: string[]): boolean {
    // Real implementation would use NLP analysis of evidence description
    // For now, basic validation logic
    const evidenceText = `${evidence.description} ${evidence.realWorldContext}`.toLowerCase();
    
    // Check for grounding indicators
    const groundingWords = ['daily', 'practical', 'ordinary', 'real', 'human', 'struggle', 'consistent'];
    const bypassingWords = ['transcend', 'beyond', 'escape', 'transform completely', 'never again'];
    
    const groundingScore = groundingWords.filter(word => evidenceText.includes(word)).length;
    const bypassingScore = bypassingWords.filter(word => evidenceText.includes(word)).length;
    
    return groundingScore > bypassingScore && groundingScore >= 2;
  }

  checkGateReadiness(gate: IntegrationGate, reflectionGap: ReflectionGap): boolean {
    // Check time requirement
    const daysSinceStart = Math.floor(
      (Date.now() - reflectionGap.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceStart < reflectionGap.minimumDuration) {
      return false;
    }

    // Check evidence requirements
    const validatedEvidence = reflectionGap.integrationEvidence.filter(
      evidence => evidence.validated
    );

    if (validatedEvidence.length < 3) {
      return false;
    }

    // Check requirement completion
    const completedRequirements = gate.requirements.filter(req => req.completed);
    const requiredCompletions = Math.ceil(gate.requirements.length * 0.8); // 80% completion

    return completedRequirements.length >= requiredCompletions;
  }

  handleBypassAttempt(reflectionGap: ReflectionGap, userId: string): string {
    reflectionGap.bypassAttempts += 1;
    
    const messages = {
      1: "Integration takes time. Your insights will be more sustainable if you allow them to settle into your daily life before moving forward.",
      2: "Rushing to new content can prevent deep integration. Consider what you might be avoiding by seeking the next insight.",
      3: "Multiple bypass attempts detected. This pattern may indicate spiritual bypassing. Would you like support in slowing down?",
      4: "Consistent avoidance of integration periods suggests a pattern worth examining. Professional support may be helpful."
    };

    if (reflectionGap.bypassAttempts >= 4) {
      // Trigger professional support consideration
      this.triggerProfessionalSupportReview(userId);
    }

    return messages[reflectionGap.bypassAttempts as keyof typeof messages] || messages[4];
  }

  private triggerProfessionalSupportReview(userId: string): void {
    // This would trigger the bypassing detection service
    console.log(`Professional support review triggered for user ${userId} due to consistent integration avoidance`);
  }

  createIntegrationRequirements(contentType: string): IntegrationRequirement[] {
    const baseRequirements: IntegrationRequirement[] = [
      {
        id: this.generateId(),
        type: 'reflection' as const,
        description: 'Complete daily reflection on insight application',
        minimumDays: 3,
        validationCriteria: [
          'Identifies specific daily applications',
          'Acknowledges challenges and resistance',
          'Describes real-world context'
        ],
        completionPrompts: [
          'How has this insight shown up in your daily interactions?',
          'What challenges have you faced in applying this?',
          'How has this affected your ordinary responsibilities?'
        ],
        completed: false
      },
      {
        id: this.generateId(),
        type: 'reality_check' as const,
        description: 'Assess grounding and avoiding spiritual bypassing',
        minimumDays: 2,
        validationCriteria: [
          'Identifies potential avoidance patterns',
          'Acknowledges human limitations',
          'Demonstrates grounded application'
        ],
        completionPrompts: [
          'What might I be avoiding by focusing on this insight?',
          'How am I staying accountable to my human responsibilities?',
          'Am I using this to escape difficult emotions or situations?'
        ],
        completed: false
      },
      {
        id: this.generateId(),
        type: 'application' as const,
        description: 'Demonstrate consistent real-world application',
        minimumDays: 7,
        validationCriteria: [
          'Shows evidence of consistent practice',
          'Adapts to real-world obstacles',
          'Maintains during ordinary moments'
        ],
        completionPrompts: [
          'How have you maintained this practice during busy or stressful times?',
          'What adaptations have you made for your real-life circumstances?',
          'How has this supported you during mundane daily tasks?'
        ],
        completed: false
      }
    ];

    if (contentType === 'major_realization' || contentType === 'breakthrough') {
      baseRequirements.push({
        id: this.generateId(),
        type: 'community_validation' as const,
        description: 'Share integration with community for reality-checking',
        minimumDays: 5,
        validationCriteria: [
          'Receives feedback on grounded application',
          'Demonstrates humility about growth',
          'Shows sustained integration over time'
        ],
        completionPrompts: [
          'How has your community observed these changes in you?',
          'What feedback have you received about your integration?',
          'How are you maintaining accountability for continued growth?'
        ],
        completed: false
      });
    }

    return baseRequirements;
  }

  calculateIntegrationQuality(
    evidence: IntegrationEvidence[],
    requirements: IntegrationRequirement[]
  ): number {
    let qualityScore = 0;
    const maxScore = 100;

    // Evidence quality assessment (40% of score)
    const evidenceQuality = this.assessEvidenceQuality(evidence);
    qualityScore += evidenceQuality * 0.4;

    // Requirement completion (30% of score)
    const completedRequirements = requirements.filter(req => req.completed).length;
    const requirementScore = (completedRequirements / requirements.length) * 100;
    qualityScore += requirementScore * 0.3;

    // Consistency over time (30% of score)
    const consistencyScore = this.assessConsistency(evidence);
    qualityScore += consistencyScore * 0.3;

    return Math.min(qualityScore, maxScore);
  }

  private assessEvidenceQuality(evidence: IntegrationEvidence[]): number {
    if (evidence.length === 0) return 0;

    const qualityScores = evidence.map(e => {
      let score = 0;
      
      // Diversity of evidence types
      if (evidence.filter(ev => ev.type === e.type).length <= 2) score += 20;
      
      // Real-world context detail
      if (e.realWorldContext.length > 50) score += 20;
      
      // Validation by others
      if (e.validatedBy === 'peer' || e.validatedBy === 'mentor') score += 30;
      
      // Recent and sustained
      const daysSince = Math.floor((Date.now() - e.date.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince <= 7) score += 30;
      
      return score;
    });

    return qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;
  }

  private assessConsistency(evidence: IntegrationEvidence[]): number {
    if (evidence.length < 3) return 0;

    // Check for evidence spread over time
    const dates = evidence.map(e => e.date.getTime()).sort();
    const timeSpan = dates[dates.length - 1] - dates[0];
    const daySpan = timeSpan / (1000 * 60 * 60 * 24);

    if (daySpan >= 7) return 100;
    if (daySpan >= 3) return 70;
    return 40;
  }

  generateProgressiveGates(userArchitecture: IntegrationArchitecture): IntegrationGate[] {
    const gates: IntegrationGate[] = [];
    const currentDepth = this.calculateCurrentSpiralDepth(userArchitecture);

    // Foundation Gate
    gates.push({
      id: this.generateId(),
      contentToUnlock: 'intermediate_practices',
      requirements: this.createIntegrationRequirements('practice'),
      gateType: 'sequential',
      minimumIntegrationDays: 14,
      realWorldApplicationRequired: true,
      communityValidationRequired: false,
      unlocked: false
    });

    // Integration Gate
    gates.push({
      id: this.generateId(),
      contentToUnlock: 'advanced_integration',
      requirements: this.createIntegrationRequirements('breakthrough'),
      gateType: 'cumulative',
      minimumIntegrationDays: 30,
      realWorldApplicationRequired: true,
      communityValidationRequired: true,
      unlocked: false
    });

    // Spiral Depth Gate (unlocks revisiting content at deeper levels)
    if (currentDepth >= 2) {
      gates.push({
        id: this.generateId(),
        contentToUnlock: 'spiral_deepening',
        requirements: this.createDeepIntegrationRequirements(),
        gateType: 'spiral_depth',
        minimumIntegrationDays: 60,
        realWorldApplicationRequired: true,
        communityValidationRequired: true,
        unlocked: false
      });
    }

    return gates;
  }

  private createDeepIntegrationRequirements(): IntegrationRequirement[] {
    return [
      {
        id: this.generateId(),
        type: 'embodiment' as const,
        description: 'Demonstrate lived integration over extended period',
        minimumDays: 30,
        validationCriteria: [
          'Shows sustained practice through challenges',
          'Demonstrates teaching or mentoring others',
          'Maintains humility about ongoing growth needs'
        ],
        completionPrompts: [
          'How have you maintained this practice during your most challenging times?',
          'How have you supported others in similar integration work?',
          'What areas continue to challenge you and require ongoing attention?'
        ],
        completed: false
      }
    ];
  }

  private calculateCurrentSpiralDepth(architecture: IntegrationArchitecture): number {
    if (architecture.spiralProgress.length === 0) return 1;
    
    return Math.max(...architecture.spiralProgress.map(p => p.depth));
  }

  private generateId(): string {
    return `gate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}