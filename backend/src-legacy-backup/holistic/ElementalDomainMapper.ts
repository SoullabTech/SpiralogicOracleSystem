import {
  ElementalDomainMapping,
  HolisticDomain,
  UserHolisticProfile,
  Exercise,
  HolisticRecommendation,
  DevelopmentStage,
} from "./types";

export class ElementalDomainMapper {
  private elementalMappings: ElementalDomainMapping[] = [
    {
      element: "fire",
      primaryDomains: [HolisticDomain.MIND, HolisticDomain.SPIRIT],
      qualities: [
        "transformation",
        "will",
        "passion",
        "action",
        "clarity",
        "purpose",
      ],
      practices: [
        "goal setting",
        "willpower exercises",
        "transformative meditation",
        "purpose visioning",
      ],
    },
    {
      element: "water",
      primaryDomains: [HolisticDomain.EMOTIONS, HolisticDomain.SPIRIT],
      qualities: [
        "flow",
        "intuition",
        "healing",
        "receptivity",
        "adaptability",
        "wisdom",
      ],
      practices: [
        "emotional flow work",
        "intuitive meditation",
        "healing practices",
        "receptive awareness",
      ],
    },
    {
      element: "earth",
      primaryDomains: [HolisticDomain.BODY, HolisticDomain.MIND],
      qualities: [
        "grounding",
        "stability",
        "manifestation",
        "structure",
        "abundance",
        "practical wisdom",
      ],
      practices: [
        "grounding exercises",
        "body awareness",
        "manifestation work",
        "practical application",
      ],
    },
    {
      element: "air",
      primaryDomains: [HolisticDomain.MIND, HolisticDomain.EMOTIONS],
      qualities: [
        "communication",
        "inspiration",
        "connection",
        "perspective",
        "flexibility",
        "social wisdom",
      ],
      practices: [
        "breathwork",
        "communication exercises",
        "perspective practices",
        "social connection",
      ],
    },
    {
      element: "aether",
      primaryDomains: [
        HolisticDomain.SPIRIT,
        HolisticDomain.MIND,
        HolisticDomain.EMOTIONS,
        HolisticDomain.BODY,
      ],
      qualities: [
        "integration",
        "wholeness",
        "transcendence",
        "unity",
        "service",
        "cosmic consciousness",
      ],
      practices: [
        "integration meditation",
        "service practices",
        "unity consciousness",
        "holistic awareness",
      ],
    },
  ];

  getElementalMapping(element: string): ElementalDomainMapping | undefined {
    return this.elementalMappings.find(
      (mapping) => mapping.element === element,
    );
  }

  getDominantElementForProfile(profile: UserHolisticProfile): string {
    const domainStrengths = this.calculateDomainStrengths(profile);
    const elementScores = this.calculateElementalAffinity(domainStrengths);

    return Object.entries(elementScores).sort(([, a], [, b]) => b - a)[0][0];
  }

  private calculateDomainStrengths(
    profile: UserHolisticProfile,
  ): Record<HolisticDomain, number> {
    const strengths: Record<HolisticDomain, number> = {
      [HolisticDomain.MIND]: 0,
      [HolisticDomain.BODY]: 0,
      [HolisticDomain.SPIRIT]: 0,
      [HolisticDomain.EMOTIONS]: 0,
    };

    profile.domains.forEach((domain) => {
      strengths[domain.domain] = domain.currentLevel;
    });

    return strengths;
  }

  private calculateElementalAffinity(
    domainStrengths: Record<HolisticDomain, number>,
  ): Record<string, number> {
    const elementScores: Record<string, number> = {};

    this.elementalMappings.forEach((mapping) => {
      let score = 0;
      mapping.primaryDomains.forEach((domain) => {
        score += domainStrengths[domain] || 0;
      });
      elementScores[mapping.element] = score / mapping.primaryDomains.length;
    });

    return elementScores;
  }

  generateElementalRecommendations(
    profile: UserHolisticProfile,
    targetElement?: string,
  ): HolisticRecommendation[] {
    const element = targetElement || this.getDominantElementForProfile(profile);
    const mapping = this.getElementalMapping(element);

    if (!mapping) return [];

    const recommendations: HolisticRecommendation[] = [];
    const userStage = this.calculateOverallStage(profile);

    mapping.practices.forEach((practice, index) => {
      recommendations.push({
        id: `elemental-${element}-${index}`,
        domains: mapping.primaryDomains,
        type: "practice",
        title: `${mapping.element.charAt(0).toUpperCase() + mapping.element.slice(1)} Element: ${practice}`,
        description: this.generatePracticeDescription(
          mapping.element,
          practice,
          userStage,
        ),
        complexity: userStage,
        estimatedTime: this.calculatePracticeTime(practice, userStage),
        benefits: this.getPracticeBenefits(mapping.element, practice),
      });
    });

    return recommendations;
  }

  private calculateOverallStage(
    profile: UserHolisticProfile,
  ): DevelopmentStage {
    const stages = profile.domains.map((d) => d.developmentStage);
    const stageWeights = {
      [DevelopmentStage.BEGINNER]: 1,
      [DevelopmentStage.INTERMEDIATE]: 2,
      [DevelopmentStage.ADVANCED]: 3,
    };

    const avgWeight =
      stages.reduce((sum, stage) => sum + stageWeights[stage], 0) /
      stages.length;

    if (avgWeight >= 2.5) return DevelopmentStage.ADVANCED;
    if (avgWeight >= 1.5) return DevelopmentStage.INTERMEDIATE;
    return DevelopmentStage.BEGINNER;
  }

  private generatePracticeDescription(
    element: string,
    practice: string,
    stage: DevelopmentStage,
  ): string {
    const baseDescriptions: Record<string, Record<string, string>> = {
      fire: {
        "goal setting":
          "Harness fire energy to set clear, passionate intentions.",
        "willpower exercises":
          "Strengthen your inner fire through disciplined practice.",
        "transformative meditation":
          "Use fire energy to burn through limiting patterns.",
        "purpose visioning": "Connect with your deepest purpose and mission.",
      },
      water: {
        "emotional flow work":
          "Allow emotions to flow naturally and heal old wounds.",
        "intuitive meditation":
          "Access deeper wisdom through receptive awareness.",
        "healing practices":
          "Use water energy for emotional and spiritual healing.",
        "receptive awareness":
          "Cultivate openness and receptivity to guidance.",
      },
      earth: {
        "grounding exercises":
          "Connect with earth energy for stability and presence.",
        "body awareness": "Develop somatic intelligence and physical wisdom.",
        "manifestation work":
          "Bring ideas into concrete form through earth energy.",
        "practical application": "Apply spiritual insights to daily life.",
      },
      air: {
        breathwork: "Use breath to cultivate clarity and connection.",
        "communication exercises":
          "Enhance expression and interpersonal skills.",
        "perspective practices": "Develop flexibility and multiple viewpoints.",
        "social connection": "Build meaningful relationships and community.",
      },
      aether: {
        "integration meditation":
          "Synthesize all elements into unified awareness.",
        "service practices": "Express highest development through service.",
        "unity consciousness": "Experience the interconnectedness of all life.",
        "holistic awareness":
          "Maintain awareness of the whole while engaging parts.",
      },
    };

    let description =
      baseDescriptions[element]?.[practice] ||
      `Elemental practice focusing on ${practice} with ${element} energy.`;

    if (stage === DevelopmentStage.BEGINNER) {
      description += " Start with simple, foundational approaches.";
    } else if (stage === DevelopmentStage.ADVANCED) {
      description += " Explore deeper layers and teaching opportunities.";
    }

    return description;
  }

  private calculatePracticeTime(
    practice: string,
    stage: DevelopmentStage,
  ): number {
    const baseTimes: Record<string, number> = {
      "goal setting": 15,
      "willpower exercises": 20,
      "transformative meditation": 25,
      "purpose visioning": 30,
      "emotional flow work": 20,
      "intuitive meditation": 25,
      "healing practices": 30,
      "receptive awareness": 15,
      "grounding exercises": 15,
      "body awareness": 20,
      "manifestation work": 25,
      "practical application": 20,
      breathwork: 15,
      "communication exercises": 20,
      "perspective practices": 25,
      "social connection": 30,
      "integration meditation": 30,
      "service practices": 45,
      "unity consciousness": 35,
      "holistic awareness": 25,
    };

    const baseTime = baseTimes[practice] || 20;
    const stageMultipliers = {
      [DevelopmentStage.BEGINNER]: 0.75,
      [DevelopmentStage.INTERMEDIATE]: 1,
      [DevelopmentStage.ADVANCED]: 1.5,
    };

    return Math.round(baseTime * stageMultipliers[stage]);
  }

  private getPracticeBenefits(element: string, practice: string): string[] {
    const benefitMap: Record<string, Record<string, string[]>> = {
      fire: {
        "goal setting": [
          "Clarity of direction",
          "Motivation enhancement",
          "Achievement focus",
        ],
        "willpower exercises": [
          "Self-discipline",
          "Inner strength",
          "Perseverance",
        ],
        "transformative meditation": [
          "Pattern breaking",
          "Personal transformation",
          "Renewal",
        ],
        "purpose visioning": [
          "Life direction",
          "Meaning clarity",
          "Spiritual alignment",
        ],
      },
      water: {
        "emotional flow work": [
          "Emotional healing",
          "Increased flow",
          "Emotional intelligence",
        ],
        "intuitive meditation": [
          "Enhanced intuition",
          "Inner guidance",
          "Wisdom access",
        ],
        "healing practices": [
          "Deep healing",
          "Emotional regulation",
          "Inner peace",
        ],
        "receptive awareness": [
          "Openness",
          "Receptivity",
          "Spiritual sensitivity",
        ],
      },
      earth: {
        "grounding exercises": ["Stability", "Presence", "Centeredness"],
        "body awareness": [
          "Somatic intelligence",
          "Physical wellness",
          "Embodiment",
        ],
        "manifestation work": [
          "Material success",
          "Goal achievement",
          "Practical results",
        ],
        "practical application": [
          "Real-world skills",
          "Integration",
          "Effectiveness",
        ],
      },
      air: {
        breathwork: ["Mental clarity", "Stress relief", "Energetic balance"],
        "communication exercises": [
          "Better relationships",
          "Clear expression",
          "Social skills",
        ],
        "perspective practices": [
          "Mental flexibility",
          "Broader understanding",
          "Wisdom",
        ],
        "social connection": ["Community", "Belonging", "Support network"],
      },
      aether: {
        "integration meditation": ["Holistic awareness", "Unity", "Synthesis"],
        "service practices": [
          "Meaningful contribution",
          "Fulfillment",
          "Legacy",
        ],
        "unity consciousness": [
          "Spiritual realization",
          "Transcendence",
          "Peace",
        ],
        "holistic awareness": [
          "Comprehensive understanding",
          "Balance",
          "Wisdom",
        ],
      },
    };

    return (
      benefitMap[element]?.[practice] || [
        "Personal growth",
        "Elemental balance",
      ]
    );
  }

  getBalancingElement(profile: UserHolisticProfile): string {
    const domainStrengths = this.calculateDomainStrengths(profile);
    const weakestDomain = Object.entries(domainStrengths).sort(
      ([, a], [, b]) => a - b,
    )[0][0] as HolisticDomain;

    const elementForDomain = this.elementalMappings.find((mapping) =>
      mapping.primaryDomains.includes(weakestDomain),
    );

    return elementForDomain?.element || "aether";
  }

  generateElementalExercises(
    element: string,
    domains: HolisticDomain[],
    stage: DevelopmentStage,
  ): Exercise[] {
    const mapping = this.getElementalMapping(element);
    if (!mapping) return [];

    return mapping.practices.map((practice, index) => ({
      id: `exercise-${element}-${index}`,
      title: `${element.charAt(0).toUpperCase() + element.slice(1)} ${practice}`,
      instructions: this.getExerciseInstructions(element, practice, stage),
      duration: this.calculatePracticeTime(practice, stage),
      domains: domains.filter((d) => mapping.primaryDomains.includes(d)),
      difficulty: stage,
    }));
  }

  private getExerciseInstructions(
    element: string,
    practice: string,
    stage: DevelopmentStage,
  ): string {
    const instructions: Record<
      string,
      Record<string, Record<DevelopmentStage, string>>
    > = {
      fire: {
        "goal setting": {
          [DevelopmentStage.BEGINNER]:
            "Set one clear, achievable goal. Write it down and visualize success.",
          [DevelopmentStage.INTERMEDIATE]:
            "Create SMART goals aligned with your values. Include emotional connection.",
          [DevelopmentStage.ADVANCED]:
            "Develop multi-layered goals that serve others while fulfilling your purpose.",
        },
      },
      water: {
        "emotional flow work": {
          [DevelopmentStage.BEGINNER]:
            "Notice emotions without judgment. Practice basic acceptance.",
          [DevelopmentStage.INTERMEDIATE]:
            "Allow emotions to move through you. Practice emotional alchemy.",
          [DevelopmentStage.ADVANCED]:
            "Use emotions as wisdom teachers. Guide others in emotional mastery.",
        },
      },
      earth: {
        "grounding exercises": {
          [DevelopmentStage.BEGINNER]:
            "Stand barefoot on earth. Feel your connection to the ground.",
          [DevelopmentStage.INTERMEDIATE]:
            "Practice earthing meditation. Sense your place in nature.",
          [DevelopmentStage.ADVANCED]:
            "Embody earth consciousness. Teach grounding to others.",
        },
      },
      air: {
        breathwork: {
          [DevelopmentStage.BEGINNER]:
            "Practice simple conscious breathing for 5 minutes.",
          [DevelopmentStage.INTERMEDIATE]:
            "Use rhythmic breathing patterns for specific outcomes.",
          [DevelopmentStage.ADVANCED]:
            "Master advanced pranayama techniques. Teach breath mastery.",
        },
      },
      aether: {
        "integration meditation": {
          [DevelopmentStage.BEGINNER]:
            "Sit quietly and sense your wholeness beyond separate parts.",
          [DevelopmentStage.INTERMEDIATE]:
            "Meditate on the connections between all life.",
          [DevelopmentStage.ADVANCED]:
            "Embody unity consciousness and share this awareness.",
        },
      },
    };

    return (
      instructions[element]?.[practice]?.[stage] ||
      `Practice ${practice} with ${element} elemental energy at your level.`
    );
  }

  createElementalBalance(profile: UserHolisticProfile): Record<string, number> {
    const domainStrengths = this.calculateDomainStrengths(profile);
    const elementalAffinity = this.calculateElementalAffinity(domainStrengths);

    const totalScore = Object.values(elementalAffinity).reduce(
      (sum, score) => sum + score,
      0,
    );
    const balance: Record<string, number> = {};

    Object.entries(elementalAffinity).forEach(([element, score]) => {
      balance[element] = totalScore > 0 ? (score / totalScore) * 100 : 20;
    });

    return balance;
  }
}
