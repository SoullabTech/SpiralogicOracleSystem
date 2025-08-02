import {
  UserHolisticProfile,
  DevelopmentStage,
  HolisticRecommendation,
  AdaptiveContent,
  UserState,
  HolisticDomain,
  StateResponsiveGuidance,
  Exercise,
  Resource
} from './types';
import { HolisticAssessmentService } from './HolisticAssessmentService';

export class AdaptiveExperienceEngine {
  private assessmentService: HolisticAssessmentService;

  constructor() {
    this.assessmentService = new HolisticAssessmentService();
  }

  generateAdaptiveContent(
    baseContent: string,
    userProfile: UserHolisticProfile,
    targetDomains: HolisticDomain[]
  ): AdaptiveContent {
    const userStage = this.calculateOverallStage(userProfile);
    const adaptations = this.createStageAdaptations(baseContent, targetDomains);

    return {
      id: this.generateId(),
      baseContent,
      adaptations,
      domainConnections: this.identifyDomainConnections(targetDomains)
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

  private createStageAdaptations(
    baseContent: string,
    domains: HolisticDomain[]
  ): AdaptiveContent['adaptations'] {
    return {
      [DevelopmentStage.BEGINNER]: {
        content: this.simplifyContent(baseContent),
        exercises: this.generateExercises(domains, DevelopmentStage.BEGINNER),
        resources: this.generateResources(domains, DevelopmentStage.BEGINNER)
      },
      [DevelopmentStage.INTERMEDIATE]: {
        content: baseContent,
        exercises: this.generateExercises(domains, DevelopmentStage.INTERMEDIATE),
        resources: this.generateResources(domains, DevelopmentStage.INTERMEDIATE)
      },
      [DevelopmentStage.ADVANCED]: {
        content: this.enhanceContent(baseContent),
        exercises: this.generateExercises(domains, DevelopmentStage.ADVANCED),
        resources: this.generateResources(domains, DevelopmentStage.ADVANCED)
      }
    };
  }

  private simplifyContent(content: string): string {
    return content + "\n\n*Simplified version: Focus on foundational understanding and basic application.*";
  }

  private enhanceContent(content: string): string {
    return content + "\n\n*Advanced integration: Explore systemic connections and teaching opportunities.*";
  }

  private generateExercises(domains: HolisticDomain[], stage: DevelopmentStage): Exercise[] {
    const exercises: Exercise[] = [];
    const durations = {
      [DevelopmentStage.BEGINNER]: 10,
      [DevelopmentStage.INTERMEDIATE]: 20,
      [DevelopmentStage.ADVANCED]: 30
    };

    domains.forEach(domain => {
      exercises.push({
        id: this.generateId(),
        title: `${domain} Integration Practice`,
        instructions: this.getExerciseInstructions(domain, stage),
        duration: durations[stage],
        domains: [domain],
        difficulty: stage
      });
    });

    if (domains.length > 1) {
      exercises.push({
        id: this.generateId(),
        title: 'Holistic Integration Practice',
        instructions: 'Connect insights across all domains through reflective integration.',
        duration: durations[stage] * 1.5,
        domains,
        difficulty: stage
      });
    }

    return exercises;
  }

  private getExerciseInstructions(domain: HolisticDomain, stage: DevelopmentStage): string {
    const instructions = {
      [HolisticDomain.MIND]: {
        [DevelopmentStage.BEGINNER]: 'Practice basic mindfulness of thoughts for 5 minutes.',
        [DevelopmentStage.INTERMEDIATE]: 'Observe thought patterns and practice cognitive reframing.',
        [DevelopmentStage.ADVANCED]: 'Integrate meta-cognitive awareness with teaching others.'
      },
      [HolisticDomain.BODY]: {
        [DevelopmentStage.BEGINNER]: 'Simple body scan meditation, noticing sensations.',
        [DevelopmentStage.INTERMEDIATE]: 'Somatic movement practice with breath awareness.',
        [DevelopmentStage.ADVANCED]: 'Advanced embodiment practices with energy cultivation.'
      },
      [HolisticDomain.SPIRIT]: {
        [DevelopmentStage.BEGINNER]: 'Reflect on personal values and meaning.',
        [DevelopmentStage.INTERMEDIATE]: 'Purpose alignment meditation and visioning.',
        [DevelopmentStage.ADVANCED]: 'Service-oriented practice and legacy work.'
      },
      [HolisticDomain.EMOTIONS]: {
        [DevelopmentStage.BEGINNER]: 'Basic emotion naming and acceptance practice.',
        [DevelopmentStage.INTERMEDIATE]: 'Emotional regulation through somatic techniques.',
        [DevelopmentStage.ADVANCED]: 'Emotional alchemy and transformative practices.'
      }
    };

    return instructions[domain]?.[stage] || 'Engage in domain-specific practice.';
  }

  private generateResources(domains: HolisticDomain[], stage: DevelopmentStage): Resource[] {
    const resources: Resource[] = [];

    domains.forEach(domain => {
      resources.push({
        id: this.generateId(),
        title: `${domain} Development Guide`,
        type: 'article',
        content: `Comprehensive guide for ${stage} practitioners in ${domain} development.`,
        domains: [domain]
      });
    });

    return resources;
  }

  private identifyDomainConnections(domains: HolisticDomain[]) {
    const connections = [];

    for (let i = 0; i < domains.length; i++) {
      for (let j = i + 1; j < domains.length; j++) {
        connections.push({
          primaryDomain: domains[i],
          secondaryDomain: domains[j],
          connectionType: 'integrates' as const,
          description: `${domains[i]} and ${domains[j]} support holistic development through mutual reinforcement.`
        });
      }
    }

    return connections;
  }

  generateStateResponsiveGuidance(
    userProfile: UserHolisticProfile
  ): StateResponsiveGuidance {
    const state = userProfile.currentState;
    const recommendations = this.getStateBasedRecommendations(state, userProfile);
    const priorityOrder = this.prioritizeRecommendations(recommendations, userProfile);
    const adaptiveMessage = this.generateAdaptiveMessage(state, userProfile);

    return {
      userState: state,
      recommendations,
      priorityOrder,
      adaptiveMessage
    };
  }

  private getStateBasedRecommendations(
    state: UserState,
    profile: UserHolisticProfile
  ): HolisticRecommendation[] {
    const recommendations: HolisticRecommendation[] = [];
    const userStage = this.calculateOverallStage(profile);

    switch (state) {
      case UserState.STRESSED:
        recommendations.push(
          this.createRecommendation(
            [HolisticDomain.BODY, HolisticDomain.EMOTIONS],
            'practice',
            'Grounding and Regulation Practice',
            'Somatic grounding techniques combined with emotional regulation.',
            userStage,
            15,
            ['Immediate stress relief', 'Nervous system regulation']
          ),
          this.createRecommendation(
            [HolisticDomain.MIND],
            'insight',
            'Stress Pattern Recognition',
            'Identify and understand your stress triggers and patterns.',
            userStage,
            20,
            ['Self-awareness', 'Pattern interruption']
          )
        );
        break;

      case UserState.SEEKING_CLARITY:
        recommendations.push(
          this.createRecommendation(
            [HolisticDomain.MIND],
            'practice',
            'Mental Clarity Meditation',
            'Focused attention practice for mental clarity.',
            userStage,
            20,
            ['Enhanced focus', 'Clear thinking']
          ),
          this.createRecommendation(
            [HolisticDomain.MIND, HolisticDomain.SPIRIT],
            'integration',
            'Purpose-Aligned Decision Making',
            'Connect mental clarity with deeper purpose.',
            userStage,
            30,
            ['Aligned decisions', 'Purpose clarity']
          )
        );
        break;

      case UserState.DISCONNECTED:
        recommendations.push(
          this.createRecommendation(
            [HolisticDomain.SPIRIT],
            'practice',
            'Connection and Meaning Practice',
            'Reconnect with your sense of purpose and belonging.',
            userStage,
            25,
            ['Renewed purpose', 'Spiritual connection']
          ),
          this.createRecommendation(
            [HolisticDomain.SPIRIT, HolisticDomain.EMOTIONS],
            'integration',
            'Heart-Centered Awareness',
            'Cultivate connection through emotional and spiritual integration.',
            userStage,
            20,
            ['Emotional openness', 'Spiritual grounding']
          )
        );
        break;

      case UserState.PHYSICAL_CONCERNS:
        recommendations.push(
          this.createRecommendation(
            [HolisticDomain.BODY],
            'practice',
            'Gentle Somatic Awareness',
            'Mindful body practices adapted for current physical state.',
            userStage,
            15,
            ['Body awareness', 'Gentle healing']
          ),
          this.createRecommendation(
            [HolisticDomain.BODY, HolisticDomain.EMOTIONS],
            'resource',
            'Body-Emotion Integration Guide',
            'Understanding the body-emotion connection for healing.',
            userStage,
            10,
            ['Holistic healing', 'Integrated wellness']
          )
        );
        break;

      default:
        const priorityDomains = this.assessmentService.identifyPriorityDomains(profile);
        priorityDomains.forEach(domain => {
          recommendations.push(
            this.createRecommendation(
              [domain],
              'practice',
              `${domain} Development Practice`,
              `Targeted practice for ${domain} enhancement.`,
              userStage,
              20,
              [`${domain} growth`, 'Balanced development']
            )
          );
        });
    }

    return recommendations;
  }

  private createRecommendation(
    domains: HolisticDomain[],
    type: HolisticRecommendation['type'],
    title: string,
    description: string,
    complexity: DevelopmentStage,
    estimatedTime: number,
    benefits: string[]
  ): HolisticRecommendation {
    return {
      id: this.generateId(),
      domains,
      type,
      title,
      description,
      complexity,
      estimatedTime,
      benefits,
      prerequisites: complexity === DevelopmentStage.ADVANCED ?
        ['Intermediate practice experience'] : undefined
    };
  }

  private prioritizeRecommendations(
    recommendations: HolisticRecommendation[],
    profile: UserHolisticProfile
  ): string[] {
    return recommendations
      .sort((a, b) => {
        if (profile.currentState === UserState.STRESSED) {
          const aIsGrounding = a.domains.includes(HolisticDomain.BODY) ||
                              a.domains.includes(HolisticDomain.EMOTIONS);
          const bIsGrounding = b.domains.includes(HolisticDomain.BODY) ||
                              b.domains.includes(HolisticDomain.EMOTIONS);
          if (aIsGrounding && !bIsGrounding) return -1;
          if (!aIsGrounding && bIsGrounding) return 1;
        }

        return a.estimatedTime - b.estimatedTime;
      })
      .map(r => r.id);
  }

  private generateAdaptiveMessage(state: UserState, profile: UserHolisticProfile): string {
    const messages = {
      [UserState.STRESSED]: "I notice you're experiencing stress. Let's focus on grounding and regulation practices to help you find center.",
      [UserState.SEEKING_CLARITY]: "It seems you're seeking mental clarity. Let's work with practices that enhance focus and clear thinking.",
      [UserState.DISCONNECTED]: "You may be feeling disconnected from your deeper purpose. Let's explore practices that reconnect you with meaning.",
      [UserState.PHYSICAL_CONCERNS]: "I'm aware of your physical concerns. Let's approach practice gently, honoring your body's current needs.",
      [UserState.BALANCED]: "You're in a balanced state. Let's deepen your practice across all domains.",
      [UserState.ENERGIZED]: "Your energy is high! Let's channel this vitality into transformative practices.",
      [UserState.REFLECTIVE]: "You're in a reflective space. This is perfect for integration and insight work."
    };

    return messages[state] || "Let's explore practices that support your holistic development.";
  }

  adaptComplexityToUser(
    content: any,
    profile: UserHolisticProfile,
    requestedComplexity?: DevelopmentStage
  ): any {
    const userStage = requestedComplexity || this.calculateOverallStage(profile);
    const { stressLevel, energyLevel } = profile;

    if (stressLevel > 7 || energyLevel < 3) {
      return this.simplifyForCurrentCapacity(content, userStage);
    }

    if (energyLevel > 7 && userStage === DevelopmentStage.ADVANCED) {
      return this.enhanceForHighCapacity(content);
    }

    return content;
  }

  private simplifyForCurrentCapacity(content: any, stage: DevelopmentStage): any {
    return {
      ...content,
      adapted: true,
      adaptationNote: 'Content simplified based on current capacity',
      simplificationLevel: stage === DevelopmentStage.BEGINNER ? 'high' : 'moderate'
    };
  }

  private enhanceForHighCapacity(content: any): any {
    return {
      ...content,
      adapted: true,
      adaptationNote: 'Content enhanced for high energy and advanced practice',
      enhancements: ['Deeper integration exercises', 'Teaching opportunities', 'System-level perspectives']
    };
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}