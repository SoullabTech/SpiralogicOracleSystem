import {
  HolisticDomain,
  DevelopmentStage,
  UserState,
  DomainProfile,
  UserHolisticProfile,
  HolisticRecommendation,
} from "./types";

export class HolisticAssessmentService {
  private assessmentQuestions = {
    [HolisticDomain.MIND]: [
      {
        question: "How clear and focused do you feel in your daily thinking?",
        scoreMapping: {
          very_clear: 8,
          mostly_clear: 6,
          somewhat_foggy: 4,
          very_foggy: 2,
        },
      },
      {
        question: "How well do you communicate your thoughts and ideas?",
        scoreMapping: { excellently: 8, well: 6, adequately: 4, poorly: 2 },
      },
      {
        question:
          "How effectively do you solve problems and learn new concepts?",
        scoreMapping: {
          very_effectively: 8,
          effectively: 6,
          somewhat: 4,
          struggle: 2,
        },
      },
    ],
    [HolisticDomain.BODY]: [
      {
        question: "How connected do you feel to your physical body?",
        scoreMapping: {
          very_connected: 8,
          connected: 6,
          somewhat: 4,
          disconnected: 2,
        },
      },
      {
        question: "How would you rate your overall physical energy levels?",
        scoreMapping: { high: 8, good: 6, moderate: 4, low: 2 },
      },
      {
        question: "How well do you maintain physical wellness practices?",
        scoreMapping: {
          consistently: 8,
          regularly: 6,
          occasionally: 4,
          rarely: 2,
        },
      },
    ],
    [HolisticDomain.SPIRIT]: [
      {
        question: "How connected do you feel to your life purpose?",
        scoreMapping: { deeply: 8, connected: 6, searching: 4, lost: 2 },
      },
      {
        question:
          "How often do you experience moments of transcendence or deep meaning?",
        scoreMapping: {
          frequently: 8,
          regularly: 6,
          occasionally: 4,
          rarely: 2,
        },
      },
      {
        question: "How aligned do your actions feel with your values?",
        scoreMapping: { fully: 8, mostly: 6, somewhat: 4, misaligned: 2 },
      },
    ],
    [HolisticDomain.EMOTIONS]: [
      {
        question: "How well do you understand and process your emotions?",
        scoreMapping: { very_well: 8, well: 6, adequately: 4, poorly: 2 },
      },
      {
        question: "How effectively do you express emotions in healthy ways?",
        scoreMapping: {
          very_effectively: 8,
          effectively: 6,
          somewhat: 4,
          struggle: 2,
        },
      },
      {
        question: "How resilient are you in emotional challenges?",
        scoreMapping: {
          very_resilient: 8,
          resilient: 6,
          somewhat: 4,
          fragile: 2,
        },
      },
    ],
  };

  assessUserDomain(
    domain: HolisticDomain,
    responses: Record<string, string>,
  ): DomainProfile {
    const questions = this.assessmentQuestions[domain];
    let totalScore = 0;
    let responseCount = 0;

    questions.forEach((q, index) => {
      const response = responses[`q${index}`];
      if (response && q.scoreMapping[response]) {
        totalScore += q.scoreMapping[response];
        responseCount++;
      }
    });

    const averageScore = responseCount > 0 ? totalScore / responseCount : 0;
    const developmentStage = this.calculateDevelopmentStage(averageScore);
    const strengths = this.identifyStrengths(domain, responses, averageScore);
    const growthEdges = this.identifyGrowthEdges(
      domain,
      responses,
      averageScore,
    );

    return {
      domain,
      currentLevel: averageScore,
      developmentStage,
      strengths,
      growthEdges,
      practicesEngaged: [],
      lastAssessment: new Date(),
    };
  }

  private calculateDevelopmentStage(score: number): DevelopmentStage {
    if (score >= 7) return DevelopmentStage.ADVANCED;
    if (score >= 5) return DevelopmentStage.INTERMEDIATE;
    return DevelopmentStage.BEGINNER;
  }

  private identifyStrengths(
    domain: HolisticDomain,
    responses: Record<string, string>,
    score: number,
  ): string[] {
    const strengths: string[] = [];

    if (domain === HolisticDomain.MIND && score >= 6) {
      strengths.push("Clear thinking patterns", "Effective communication");
    }
    if (domain === HolisticDomain.BODY && score >= 6) {
      strengths.push("Body awareness", "Physical vitality");
    }
    if (domain === HolisticDomain.SPIRIT && score >= 6) {
      strengths.push("Purpose alignment", "Value coherence");
    }
    if (domain === HolisticDomain.EMOTIONS && score >= 6) {
      strengths.push("Emotional intelligence", "Healthy expression");
    }

    return strengths;
  }

  private identifyGrowthEdges(
    domain: HolisticDomain,
    responses: Record<string, string>,
    score: number,
  ): string[] {
    const growthEdges: string[] = [];

    if (domain === HolisticDomain.MIND && score < 6) {
      growthEdges.push("Mental clarity practices", "Communication skills");
    }
    if (domain === HolisticDomain.BODY && score < 6) {
      growthEdges.push("Somatic awareness", "Energy management");
    }
    if (domain === HolisticDomain.SPIRIT && score < 6) {
      growthEdges.push("Purpose exploration", "Meaning-making practices");
    }
    if (domain === HolisticDomain.EMOTIONS && score < 6) {
      growthEdges.push("Emotional regulation", "Expression techniques");
    }

    return growthEdges;
  }

  detectUserState(
    profile: UserHolisticProfile,
    recentInputs?: string[],
  ): UserState {
    const { stressLevel, energyLevel, domains } = profile;

    if (stressLevel > 7) return UserState.STRESSED;
    if (energyLevel < 3) return UserState.PHYSICAL_CONCERNS;

    const mindScore =
      domains.find((d) => d.domain === HolisticDomain.MIND)?.currentLevel || 0;
    const spiritScore =
      domains.find((d) => d.domain === HolisticDomain.SPIRIT)?.currentLevel ||
      0;

    if (mindScore < 4) return UserState.SEEKING_CLARITY;
    if (spiritScore < 4) return UserState.DISCONNECTED;
    if (energyLevel > 7) return UserState.ENERGIZED;

    return UserState.BALANCED;
  }

  generateHolisticProfile(
    userId: string,
    assessmentData: any,
  ): UserHolisticProfile {
    const domains: DomainProfile[] = [];

    Object.values(HolisticDomain).forEach((domain) => {
      if (assessmentData[domain]) {
        domains.push(this.assessUserDomain(domain, assessmentData[domain]));
      }
    });

    const profile: UserHolisticProfile = {
      userId,
      domains,
      currentState: UserState.BALANCED,
      stressLevel: assessmentData.stressLevel || 5,
      energyLevel: assessmentData.energyLevel || 5,
      lifeCircumstances: assessmentData.lifeCircumstances || [],
      preferredLearningStyle: assessmentData.learningStyle || "mixed",
      developmentGoals: [],
      lastUpdated: new Date(),
    };

    profile.currentState = this.detectUserState(profile);

    return profile;
  }

  calculateDomainBalance(
    profile: UserHolisticProfile,
  ): Record<HolisticDomain, number> {
    const balance: Record<HolisticDomain, number> = {
      [HolisticDomain.MIND]: 0,
      [HolisticDomain.BODY]: 0,
      [HolisticDomain.SPIRIT]: 0,
      [HolisticDomain.EMOTIONS]: 0,
    };

    profile.domains.forEach((domain) => {
      balance[domain.domain] = domain.currentLevel;
    });

    return balance;
  }

  identifyPriorityDomains(profile: UserHolisticProfile): HolisticDomain[] {
    const balance = this.calculateDomainBalance(profile);
    const avgScore = Object.values(balance).reduce((a, b) => a + b, 0) / 4;

    return Object.entries(balance)
      .filter(([_, score]) => score < avgScore - 1)
      .sort(([_, a], [__, b]) => a - b)
      .map(([domain]) => domain as HolisticDomain);
  }
}
