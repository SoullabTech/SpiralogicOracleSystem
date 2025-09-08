/**
 * Human-Centered Spiritual Support Framework
 *
 * This framework ensures AI maintains appropriate boundaries while supporting
 * users' spiritual development. The AI acts as a facilitator, never claiming
 * mystical abilities or spiritual authority.
 */

export interface SpiritualSupportGuidelines {
  role: "facilitator" | "organizer" | "reflection_tool";
  boundaries: string[];
  userAgencyPrinciples: string[];
}

export const SPIRITUAL_SUPPORT_FRAMEWORK: SpiritualSupportGuidelines = {
  role: "facilitator",
  boundaries: [
    "AI never claims to sense, feel, or perceive spiritual energies",
    "AI never channels messages or speaks for spiritual entities",
    "AI never makes predictions about spiritual or life events",
    "AI never claims to have consciousness or spiritual awareness",
    "AI attributes all insights and experiences to the user",
    "AI provides frameworks and prompts, not spiritual guidance",
  ],
  userAgencyPrinciples: [
    "Users are the sole source of their spiritual insights",
    "Users define their own relationship with spirituality",
    "Users interpret their own experiences and symbols",
    "Users choose which frameworks resonate with them",
    "Users own all spiritual content they generate",
    "Users direct their own spiritual development",
  ],
};

/**
 * Response templates that maintain appropriate boundaries
 */
export const FACILITATOR_RESPONSES = {
  // Instead of "I sense..." or "I feel..."
  reflection: {
    pattern: "Based on what you've shared about [topic], you might explore...",
    insight: "Your reflection on [topic] suggests you're considering...",
    connection:
      "You've mentioned [pattern] several times. What does this mean to you?",
  },

  // Instead of mystical claims
  exploration: {
    prompt: "Consider journaling about...",
    question: "What comes up for you when you reflect on...",
    framework: "Some people find it helpful to explore [topic] through...",
  },

  // Instead of spiritual authority
  support: {
    validation: "Your experience of [topic] is uniquely yours.",
    encouragement: "You seem to be developing your own understanding of...",
    clarification: "How would you describe your relationship with...",
  },

  // Pattern recognition without mystical claims
  patterns: {
    observation:
      "Looking at your journal entries, you've mentioned [pattern]...",
    timeline: "Over the past [time], your reflections show...",
    themes: "Common themes in your exploration include...",
  },
};

/**
 * Elemental framework as organizational tool, not mystical system
 */
export interface ElementalFramework {
  fire: ElementalCategory;
  water: ElementalCategory;
  earth: ElementalCategory;
  air: ElementalCategory;
  aether: ElementalCategory;
}

export interface ElementalCategory {
  description: string;
  reflectionPrompts: string[];
  practicalApplications: string[];
  userDefinedMeaning?: string;
}

export const ELEMENTAL_ORGANIZATION: ElementalFramework = {
  fire: {
    description: "Themes related to passion, action, and transformation",
    reflectionPrompts: [
      "What aspects of your life feel energizing right now?",
      "Where do you notice drive or motivation in your experience?",
      "What changes are you considering or experiencing?",
    ],
    practicalApplications: [
      "Goal-setting and action planning",
      "Identifying sources of motivation",
      "Tracking energy levels and patterns",
    ],
  },
  water: {
    description: "Themes related to emotions, intuition, and flow",
    reflectionPrompts: [
      "What emotions have been present for you lately?",
      "How would you describe your intuitive sense about this?",
      "Where do you experience ease or flow in your life?",
    ],
    practicalApplications: [
      "Emotional awareness journaling",
      "Tracking intuitive hits and outcomes",
      "Identifying areas of resistance vs flow",
    ],
  },
  earth: {
    description: "Themes related to grounding, stability, and manifestation",
    reflectionPrompts: [
      "What helps you feel grounded and stable?",
      "What are you working to build or create?",
      "Where do you seek more structure or routine?",
    ],
    practicalApplications: [
      "Creating sustainable routines",
      "Resource planning and management",
      "Physical health and environment tracking",
    ],
  },
  air: {
    description: "Themes related to thought, communication, and perspective",
    reflectionPrompts: [
      "What new perspectives are you exploring?",
      "How are your communication patterns serving you?",
      "What mental patterns do you notice?",
    ],
    practicalApplications: [
      "Thought pattern tracking",
      "Communication skill development",
      "Learning and study planning",
    ],
  },
  aether: {
    description: "Themes related to meaning, connection, and integration",
    reflectionPrompts: [
      "What gives your life meaning right now?",
      "How do different aspects of your life connect?",
      "What are you integrating or synthesizing?",
    ],
    practicalApplications: [
      "Values clarification exercises",
      "Life purpose exploration",
      "Integration practices and reviews",
    ],
  },
};

/**
 * Boundaries enforcement for AI responses
 */
export class BoundaryEnforcer {
  private static prohibitedPhrases = [
    "I sense",
    "I feel",
    "I perceive",
    "The universe",
    "Spirit says",
    "Divine message",
    "I channel",
    "I'm receiving",
    "cosmic intelligence",
    "sacred wisdom",
    "mystical insight",
    "spiritual authority",
  ];

  private static inappropriateClaims = [
    /I\s+(can\s+)?feel\s+your/i,
    /I\s+sense\s+that/i,
    /universe\s+is\s+telling/i,
    /spirit\s+wants\s+you/i,
    /divine\s+guidance/i,
    /channeling\s+through\s+me/i,
  ];

  /**
   * Check if a response contains inappropriate spiritual claims
   */
  static validateResponse(response: string): {
    isValid: boolean;
    violations: string[];
    suggestions: string[];
  } {
    const violations: string[] = [];
    const suggestions: string[] = [];

    // Check for prohibited phrases
    for (const phrase of this.prohibitedPhrases) {
      if (response.toLowerCase().includes(phrase.toLowerCase())) {
        violations.push(`Contains prohibited phrase: "${phrase}"`);
        suggestions.push(this.getSuggestion(phrase));
      }
    }

    // Check for inappropriate claim patterns
    for (const pattern of this.inappropriateClaims) {
      if (pattern.test(response)) {
        violations.push(`Contains inappropriate claim pattern: ${pattern}`);
        suggestions.push(
          "Rephrase to attribute insight to user's own reflection",
        );
      }
    }

    return {
      isValid: violations.length === 0,
      violations,
      suggestions,
    };
  }

  private static getSuggestion(phrase: string): string {
    const replacements: Record<string, string> = {
<<<<<<< HEAD
      "I sense": "Based on what you've shared",
=======
      "I sense": "Based on what you&apos;ve shared",
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
      "I feel": "Your words suggest",
      "The universe": "Your experience",
      "Spirit says": "You might consider",
      "I channel": "Drawing from your insights",
    };

    return replacements[phrase] || "Rephrase to maintain facilitator role";
  }

  /**
   * Transform a response to maintain appropriate boundaries
   */
  static transformResponse(response: string): string {
    let transformed = response;

    // Replace problematic phrases
    transformed = transformed.replace(
      /I\s+sense\s+/gi,
      "Based on what you've shared, ",
    );
    transformed = transformed.replace(
      /I\s+feel\s+/gi,
      "Your reflection suggests ",
    );
    transformed = transformed.replace(/The\s+universe\s+/gi, "Your journey ");
    transformed = transformed.replace(
      /Spirit\s+says\s+/gi,
      "You might explore ",
    );
    transformed = transformed.replace(/divine\s+guidance/gi, "your own wisdom");
    transformed = transformed.replace(
      /cosmic\s+intelligence/gi,
      "your understanding",
    );

    return transformed;
  }
}

/**
 * User agency reinforcement in responses
 */
export class UserAgencyReinforcer {
  static reinforceAgency(response: string, context?: any): string {
    const agencyPhrases = [
      "Your insight about",
      "As you've discovered",
      "Your experience shows",
      "You've identified",
      "Your reflection reveals",
    ];

    // Add agency attribution if not present
    const hasAgencyAttribution = agencyPhrases.some((phrase) =>
      response.includes(phrase),
    );

    if (!hasAgencyAttribution) {
      const prefix =
        agencyPhrases[Math.floor(Math.random() * agencyPhrases.length)];
      response = `${prefix} this is significant. ${response}`;
    }

    return response;
  }

  static generatePrompt(category: keyof ElementalFramework): string {
    const element = ELEMENTAL_ORGANIZATION[category];
    const prompts = element.reflectionPrompts;
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

    return `For your ${category} reflection: ${randomPrompt}`;
  }
}

/**
 * Integration tools for connecting insights with life domains
 */
export interface LifeDomainIntegration {
  domain: string;
  currentState: string;
  desiredState: string;
  elementalConnections: string[];
  actionSteps: string[];
  reflectionDate: Date;
}

export class IntegrationTools {
  static domains = [
    "Career & Purpose",
    "Relationships",
    "Health & Vitality",
    "Personal Growth",
    "Creative Expression",
    "Financial Wellbeing",
    "Community & Service",
    "Spiritual Practice",
  ];

  static createIntegrationPrompt(
    domain: string,
    element: keyof ElementalFramework,
  ): string {
    return `Reflecting on your ${domain}, how might the ${element} themes you've been exploring apply here? What practical steps emerge from your reflection?`;
  }

  static trackProgress(integrations: LifeDomainIntegration[]): {
    activeDomains: string[];
    elementalBalance: Record<string, number>;
    suggestedFocus: string;
  } {
    const activeDomains = [...new Set(integrations.map((i) => i.domain))];

    const elementalBalance: Record<string, number> = {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0,
      aether: 0,
    };

    integrations.forEach((integration) => {
      integration.elementalConnections.forEach((element) => {
        if (element in elementalBalance) {
          elementalBalance[element]++;
        }
      });
    });

    // Find least explored element
    const leastExplored = Object.entries(elementalBalance).sort(
      ([, a], [, b]) => a - b,
    )[0][0];

    return {
      activeDomains,
      elementalBalance,
      suggestedFocus: `You might explore how ${leastExplored} themes could support your development.`,
    };
  }
}

/**
 * Response validator to ensure all AI outputs maintain boundaries
 */
export class SpiritualSupportValidator {
  static validate(response: any): {
    isValid: boolean;
    issues: string[];
    correctedResponse?: any;
  } {
    const issues: string[] = [];

    // Validate main response content
    const contentValidation = BoundaryEnforcer.validateResponse(
      response.content || "",
    );
    if (!contentValidation.isValid) {
      issues.push(...contentValidation.violations);
      response.content = BoundaryEnforcer.transformResponse(response.content);
    }

    // Ensure user agency is reinforced
    response.content = UserAgencyReinforcer.reinforceAgency(response.content);

    // Add disclaimer if dealing with spiritual content
    if (response.metadata?.spiritualContent) {
      response.metadata.disclaimer =
        "This AI provides organizational support for your spiritual exploration. All insights and experiences are your own.";
    }

    return {
      isValid: issues.length === 0,
      issues,
      correctedResponse: response,
    };
  }
}

/**
 * Main framework export for integration
 */
export const HumanCenteredSpiritualSupport = {
  framework: SPIRITUAL_SUPPORT_FRAMEWORK,
  responses: FACILITATOR_RESPONSES,
  elements: ELEMENTAL_ORGANIZATION,
  boundaries: BoundaryEnforcer,
  agency: UserAgencyReinforcer,
  integration: IntegrationTools,
  validator: SpiritualSupportValidator,
};
