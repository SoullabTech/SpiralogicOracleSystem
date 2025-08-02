import {
  UserHolisticProfile,
  PersonalizedPathway,
  PathwayStep,
  HolisticDomain,
  DevelopmentStage,
  Exercise,
  ProgressMetric,
  DevelopmentGoal
} from './types';
import { HolisticAssessmentService } from './HolisticAssessmentService';
import { ElementalDomainMapper } from './ElementalDomainMapper';

export class PersonalizedPathwayGenerator {
  private assessmentService: HolisticAssessmentService;
  private elementalMapper: ElementalDomainMapper;

  constructor() {
    this.assessmentService = new HolisticAssessmentService();
    this.elementalMapper = new ElementalDomainMapper();
  }

  generatePersonalizedPathway(
    profile: UserHolisticProfile,
    goals?: DevelopmentGoal[]
  ): PersonalizedPathway {
    const priorityDomains = this.assessmentService.identifyPriorityDomains(profile);
    const balancingElement = this.elementalMapper.getBalancingElement(profile);
    const overallStage = this.calculateOverallStage(profile);

    const pathwaySteps = this.createPathwaySteps(
      profile,
      priorityDomains,
      balancingElement,
      overallStage,
      goals
    );

    const integrativeExercises = this.generateIntegrativeExercises(
      priorityDomains,
      overallStage
    );

    const progressMetrics = this.createProgressMetrics(priorityDomains);

    return {
      userId: profile.userId,
      currentPhase: this.determineCurrentPhase(profile),
      pathwaySteps,
      integrativeExercises,
      progressMetrics
    };
  }

  private calculateOverallStage(profile: UserHolisticProfile): DevelopmentStage {
    const stages = profile.domains.map(d => d.developmentStage);
    const stageWeights = {
      [DevelopmentStage.BEGINNER]: 1,
      [DevelopmentStage.INTERMEDIATE]: 2,
      [DevelopmentStage.ADVANCED]: 3
    };

    const avgWeight = stages.reduce((sum, stage) => sum + stageWeights[stage], 0) / stages.length;

    if (avgWeight >= 2.5) return DevelopmentStage.ADVANCED;
    if (avgWeight >= 1.5) return DevelopmentStage.INTERMEDIATE;
    return DevelopmentStage.BEGINNER;
  }

  private createPathwaySteps(
    profile: UserHolisticProfile,
    priorityDomains: HolisticDomain[],
    balancingElement: string,
    overallStage: DevelopmentStage,
    goals?: DevelopmentGoal[]
  ): PathwayStep[] {
    const steps: PathwayStep[] = [];
    let stepOrder = 0;

    // Foundation Phase: Address most urgent needs first
    if (profile.currentState === 'stressed' || profile.stressLevel > 7) {
      steps.push(this.createFoundationStep(stepOrder++, profile));
    }

    // Domain-Specific Development Steps
    priorityDomains.forEach((domain, index) => {
      steps.push(this.createDomainStep(stepOrder++, domain, overallStage, index === 0));
    });

    // Elemental Balancing Step
    steps.push(this.createElementalStep(stepOrder++, balancingElement, overallStage));

    // Integration Step
    steps.push(this.createIntegrationStep(stepOrder++, priorityDomains, overallStage));

    // Goal-Specific Steps
    if (goals && goals.length > 0) {
      goals.forEach(goal => {
        steps.push(this.createGoalStep(stepOrder++, goal, overallStage));
      });
    }

    // Advanced Integration (if applicable)
    if (overallStage === DevelopmentStage.ADVANCED) {
      steps.push(this.createAdvancedIntegrationStep(stepOrder++));
    }

    return steps;
  }

  private createFoundationStep(order: number, profile: UserHolisticProfile): PathwayStep {
    return {
      id: `foundation-${order}`,
      order,
      title: 'Foundation & Stabilization',
      description: 'Establish emotional and physical stability before deeper work.',
      domains: [HolisticDomain.BODY, HolisticDomain.EMOTIONS],
      practices: [
        {
          id: 'grounding-practice',
          title: 'Grounding Practice',
          instructions: 'Daily 10-minute grounding meditation to establish emotional stability.',
          duration: 10,
          domains: [HolisticDomain.BODY, HolisticDomain.EMOTIONS],
          difficulty: DevelopmentStage.BEGINNER
        },
        {
          id: 'breath-regulation',
          title: 'Breath Regulation',
          instructions: 'Simple breathing exercises for nervous system regulation.',
          duration: 8,
          domains: [HolisticDomain.BODY],
          difficulty: DevelopmentStage.BEGINNER
        }
      ],
      expectedDuration: 7,
      completionCriteria: [
        'Can maintain calm during stress',
        'Regular grounding practice established',
        'Stress level reduced by 2 points'
      ],
      completed: false
    };
  }

  private createDomainStep(
    order: number,
    domain: HolisticDomain,
    stage: DevelopmentStage,
    isPrimary: boolean
  ): PathwayStep {
    const practices = this.generateDomainPractices(domain, stage, isPrimary);

    return {
      id: `domain-${domain}-${order}`,
      order,
      title: `${domain.charAt(0).toUpperCase() + domain.slice(1)} Development`,
      description: `Focused development in the ${domain} domain to build foundational strength.`,
      domains: [domain],
      practices,
      expectedDuration: isPrimary ? 14 : 10,
      completionCriteria: this.getDomainCompletionCriteria(domain, stage),
      completed: false
    };
  }

  private generateDomainPractices(
    domain: HolisticDomain,
    stage: DevelopmentStage,
    isPrimary: boolean
  ): Exercise[] {
    const practiceTemplates = {
      [HolisticDomain.MIND]: [
        {
          title: 'Mental Clarity Practice',
          baseInstructions: 'Focused attention and thought observation',
          duration: 15
        },
        {
          title: 'Communication Practice',
          baseInstructions: 'Clear expression and active listening',
          duration: 20
        }
      ],
      [HolisticDomain.BODY]: [
        {
          title: 'Somatic Awareness Practice',
          baseInstructions: 'Body scanning and sensation awareness',
          duration: 15
        },
        {
          title: 'Movement Practice',
          baseInstructions: 'Mindful movement and energy cultivation',
          duration: 25
        }
      ],
      [HolisticDomain.SPIRIT]: [
        {
          title: 'Purpose Exploration',
          baseInstructions: 'Values clarification and meaning exploration',
          duration: 20
        },
        {
          title: 'Connection Practice',
          baseInstructions: 'Spiritual connection and transcendent awareness',
          duration: 25
        }
      ],
      [HolisticDomain.EMOTIONS]: [
        {
          title: 'Emotional Awareness Practice',
          baseInstructions: 'Emotion identification and acceptance',
          duration: 15
        },
        {
          title: 'Emotional Expression Practice',
          baseInstructions: 'Healthy emotional expression and regulation',
          duration: 20
        }
      ]
    };

    const templates = practiceTemplates[domain] || [];
    return templates.map((template, index) => ({
      id: `${domain}-practice-${index}`,
      title: template.title,
      instructions: this.adaptInstructionsToStage(template.baseInstructions, stage),
      duration: isPrimary ? template.duration * 1.2 : template.duration,
      domains: [domain],
      difficulty: stage
    }));
  }

  private adaptInstructionsToStage(baseInstructions: string, stage: DevelopmentStage): string {
    const adaptations = {
      [DevelopmentStage.BEGINNER]: 'Start with simple, guided approaches. ' + baseInstructions,
      [DevelopmentStage.INTERMEDIATE]: baseInstructions + ' Practice regularly and notice patterns.',
      [DevelopmentStage.ADVANCED]: baseInstructions + ' Explore teaching others and systemic applications.'
    };

    return adaptations[stage] || baseInstructions;
  }

  private getDomainCompletionCriteria(domain: HolisticDomain, stage: DevelopmentStage): string[] {
    const baseCriteria = {
      [HolisticDomain.MIND]: [
        'Improved mental clarity scores',
        'Regular practice established',
        'Communication skills enhanced'
      ],
      [HolisticDomain.BODY]: [
        'Increased body awareness',
        'Regular movement practice',
        'Energy levels improved'
      ],
      [HolisticDomain.SPIRIT]: [
        'Clearer sense of purpose',
        'Regular spiritual practice',
        'Values alignment improved'
      ],
      [HolisticDomain.EMOTIONS]: [
        'Better emotional regulation',
        'Healthy expression patterns',
        'Increased emotional intelligence'
      ]
    };

    const stageCriteria = {
      [DevelopmentStage.ADVANCED]: ['Can guide others in this domain'],
      [DevelopmentStage.INTERMEDIATE]: ['Shows consistent improvement'],
      [DevelopmentStage.BEGINNER]: ['Basic understanding established']
    };

    return [...(baseCriteria[domain] || []), ...(stageCriteria[stage] || [])];
  }

  private createElementalStep(
    order: number,
    element: string,
    stage: DevelopmentStage
  ): PathwayStep {
    const elementalMapping = this.elementalMapper.getElementalMapping(element);
    const practices = this.elementalMapper.generateElementalExercises(
      element,
      elementalMapping?.primaryDomains || [],
      stage
    );

    return {
      id: `elemental-${element}-${order}`,
      order,
      title: `${element.charAt(0).toUpperCase() + element.slice(1)} Element Integration`,
      description: `Balance and integrate ${element} elemental energy to support overall development.`,
      domains: elementalMapping?.primaryDomains || [],
      practices,
      expectedDuration: 10,
      completionCriteria: [
        `${element} element practices established`,
        'Elemental balance improved',
        'Integration with other elements'
      ],
      completed: false
    };
  }

  private createIntegrationStep(
    order: number,
    domains: HolisticDomain[],
    stage: DevelopmentStage
  ): PathwayStep {
    return {
      id: `integration-${order}`,
      order,
      title: 'Holistic Integration',
      description: 'Integrate learnings across all domains for unified development.',
      domains,
      practices: [
        {
          id: 'holistic-meditation',
          title: 'Holistic Integration Meditation',
          instructions: this.getIntegrationInstructions(stage),
          duration: 30,
          domains,
          difficulty: stage
        },
        {
          id: 'cross-domain-practice',
          title: 'Cross-Domain Practice',
          instructions: 'Practice that consciously connects insights across domains.',
          duration: 25,
          domains,
          difficulty: stage
        }
      ],
      expectedDuration: 14,
      completionCriteria: [
        'Can integrate insights across domains',
        'Experiences holistic awareness',
        'Demonstrates unified understanding'
      ],
      completed: false
    };
  }

  private getIntegrationInstructions(stage: DevelopmentStage): string {
    const instructions = {
      [DevelopmentStage.BEGINNER]: 'Sit quietly and sense how mind, body, spirit, and emotions are connected.',
      [DevelopmentStage.INTERMEDIATE]: 'Meditate on the dynamic interplay between all aspects of your being.',
      [DevelopmentStage.ADVANCED]: 'Embody unified awareness and explore how to share this integration with others.'
    };

    return instructions[stage] || 'Practice holistic integration meditation.';
  }

  private createGoalStep(
    order: number,
    goal: DevelopmentGoal,
    stage: DevelopmentStage
  ): PathwayStep {
    return {
      id: `goal-${goal.id}-${order}`,
      order,
      title: `Goal: ${goal.description}`,
      description: `Dedicated pathway step for achieving specific goal in ${goal.domain}.`,
      domains: [goal.domain],
      practices: this.generateGoalPractices(goal, stage),
      expectedDuration: 21,
      completionCriteria: goal.milestones.map(m => m.description),
      completed: false
    };
  }

  private generateGoalPractices(goal: DevelopmentGoal, stage: DevelopmentStage): Exercise[] {
    return [
      {
        id: `goal-practice-${goal.id}`,
        title: `${goal.description} Practice`,
        instructions: `Focused practice to achieve: ${goal.description}`,
        duration: 25,
        domains: [goal.domain],
        difficulty: stage
      }
    ];
  }

  private createAdvancedIntegrationStep(order: number): PathwayStep {
    return {
      id: `advanced-integration-${order}`,
      order,
      title: 'Advanced Integration & Service',
      description: 'Master-level integration with focus on teaching and serving others.',
      domains: Object.values(HolisticDomain),
      practices: [
        {
          id: 'teaching-practice',
          title: 'Teaching & Mentoring Practice',
          instructions: 'Practice teaching others what you have learned.',
          duration: 45,
          domains: Object.values(HolisticDomain),
          difficulty: DevelopmentStage.ADVANCED
        },
        {
          id: 'service-practice',
          title: 'Service Practice',
          instructions: 'Apply your development in service to others and the world.',
          duration: 60,
          domains: Object.values(HolisticDomain),
          difficulty: DevelopmentStage.ADVANCED
        }
      ],
      expectedDuration: 30,
      completionCriteria: [
        'Can effectively teach others',
        'Regularly serves community',
        'Embodies mastery in daily life'
      ],
      completed: false
    };
  }

  private generateIntegrativeExercises(
    domains: HolisticDomain[],
    stage: DevelopmentStage
  ): Exercise[] {
    return [
      {
        id: 'daily-integration-check-in',
        title: 'Daily Integration Check-In',
        instructions: 'Brief daily practice connecting all domains of development.',
        duration: 10,
        domains,
        difficulty: stage
      },
      {
        id: 'weekly-holistic-review',
        title: 'Weekly Holistic Review',
        instructions: 'Weekly reflection on progress across all domains.',
        duration: 30,
        domains,
        difficulty: stage
      }
    ];
  }

  private createProgressMetrics(domains: HolisticDomain[]): ProgressMetric[] {
    return domains.map(domain => ({
      domain,
      metricType: 'quantitative',
      currentValue: 5,
      targetValue: 8,
      trend: 'stable',
      lastMeasured: new Date()
    }));
  }

  private determineCurrentPhase(profile: UserHolisticProfile): string {
    const overallStage = this.calculateOverallStage(profile);
    const stressLevel = profile.stressLevel;

    if (stressLevel > 7) return 'Foundation & Stabilization';
    if (overallStage === DevelopmentStage.BEGINNER) return 'Foundational Development';
    if (overallStage === DevelopmentStage.INTERMEDIATE) return 'Integration & Balance';
    return 'Mastery & Service';
  }

  updatePathwayProgress(
    pathway: PersonalizedPathway,
    stepId: string,
    completed: boolean
  ): PersonalizedPathway {
    return {
      ...pathway,
      pathwaySteps: pathway.pathwaySteps.map(step =>
        step.id === stepId ? { ...step, completed } : step
      )
    };
  }

  generateNextStepRecommendation(
    pathway: PersonalizedPathway
  ): PathwayStep | null {
    return pathway.pathwaySteps.find(step => !step.completed) || null;
  }

  calculatePathwayProgress(pathway: PersonalizedPathway): number {
    const totalSteps = pathway.pathwaySteps.length;
    const completedSteps = pathway.pathwaySteps.filter(step => step.completed).length;

    return totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  }
}