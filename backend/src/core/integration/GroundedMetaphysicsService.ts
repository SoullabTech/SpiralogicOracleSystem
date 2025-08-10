import {
  GroundedMetaphysicsContext,
  RealityGroundingPrompt,
  IntegrationArchitecture,
} from "./types";

export class GroundedMetaphysicsService {
  private elementalDisclaimers = {
    fire: [
      "Fire energy is presented as a metaphorical framework for understanding personal qualities like motivation, clarity, and transformation.",
      "These concepts are tools for reflection, not statements about objective reality or universal truth.",
      "Your personal experience with these ideas is valid whether or not you relate to the elemental language.",
    ],
    water: [
      "Water energy serves as a metaphor for emotional flow, intuition, and adaptive qualities.",
      "This framework is one of many ways to understand emotional and intuitive processes.",
      "The value lies in what resonates with your lived experience, not in any universal truth claims.",
    ],
    earth: [
      "Earth energy represents metaphorical grounding, stability, and practical manifestation.",
      "These concepts are frameworks for understanding, not descriptions of literal energetic forces.",
      "Feel free to translate these ideas into language that feels authentic to your worldview.",
    ],
    air: [
      "Air energy symbolizes communication, mental clarity, and connection - purely as metaphorical tools.",
      "This language is meant to serve your understanding, not to assert any particular worldview.",
      "Your rational mind and personal discernment are always the final authorities in your growth.",
    ],
    aether: [
      "Aether represents integration and wholeness as conceptual frameworks, not metaphysical claims.",
      "This serves as one possible way to think about unity and connection.",
      "The platform cannot provide spiritual truths - only tools for your own exploration and discernment.",
    ],
  };

  private platformLimitations = [
    "This platform is a tool for practice and reflection, not a source of spiritual authority or truth.",
    "Technology cannot replace human wisdom, professional support, or your own discernment.",
    "The insights you generate through this platform come from your own wisdom, not from the technology itself.",
    "Complex human development requires real relationships and professional support that no platform can provide.",
    "The platform's role is to support your practice, not to direct your spiritual or personal development.",
    "Your lived experience and intuition are always more authoritative than any algorithmic recommendations.",
  ];

  private humilityStatements = [
    "This platform offers tools and frameworks, never definitive answers about your life or development.",
    "Real wisdom emerges through your lived experience, not through consuming content or following prescribed paths.",
    "The most important work happens in your daily life, relationships, and real-world challenges.",
    "Sustainable growth comes from consistent small practices, not from insights or breakthrough experiences.",
    "The platform cannot know what's truly right for you - that discernment is yours alone.",
    "Human development is slow, non-linear, and deeply personal - no system can optimize or accelerate it.",
  ];

  createGroundedContext(elementUsed?: string): GroundedMetaphysicsContext {
    const context: GroundedMetaphysicsContext = {
      elementalLanguage: {
        presentedAs: "metaphor",
        disclaimers: elementUsed
          ? this.elementalDisclaimers[elementUsed] || []
          : [],
        personalExperimentationPrompts:
          this.getExperimentationPrompts(elementUsed),
        realityGroundingQuestions: this.getRealityGroundingQuestions(),
      },
      humilityStatements: this.humilityStatements,
      platformLimitations: this.platformLimitations,
      subjectiveExperienceValidation: this.getSubjectiveValidations(),
    };

    return context;
  }

  private getExperimentationPrompts(element?: string): string[] {
    const basePrompts = [
      "Notice what aspects of this framework feel meaningful to your actual experience.",
      "Experiment with these ideas as tools rather than truths to be believed.",
      "Trust your own discernment about what serves your growth and what doesn't.",
      "Feel free to adapt, reject, or modify these concepts to fit your authentic experience.",
    ];

    if (element) {
      const elementSpecific = {
        fire: "Notice when motivation and clarity arise naturally in your life, regardless of whether you think of it as 'fire energy.'",
        water:
          "Pay attention to your natural emotional rhythms and adaptive responses without needing to label them as elemental.",
        earth:
          "Observe your own ways of creating stability and groundedness that feel authentic to you.",
        air: "Notice your natural communication patterns and mental processes without imposing external frameworks.",
        aether:
          "Experiment with integration in ways that feel organic to your actual life circumstances.",
      };

      if (elementSpecific[element]) {
        basePrompts.push(elementSpecific[element]);
      }
    }

    return basePrompts;
  }

  private getRealityGroundingQuestions(): string[] {
    return [
      "How does this apply to your actual daily life and real relationships?",
      "What would this look like in practice during ordinary, unglamorous moments?",
      "How does this support you in facing difficult emotions or challenging situations?",
      "In what ways might this framework be limiting or incomplete for your experience?",
      "How does this honor your human limitations rather than trying to transcend them?",
      "What would be different if you applied this during your most mundane responsibilities?",
    ];
  }

  private getSubjectiveValidations(): string[] {
    return [
      "Your personal experience with these concepts is valid regardless of how it compares to others.",
      "There is no 'right' way to relate to these frameworks - only what serves your authentic growth.",
      "Your skepticism, resistance, or lack of resonance is as valuable as any positive response.",
      "The goal is not to adopt these ideas but to use what serves your real-life development.",
      "Your rational, critical thinking is welcome and necessary in evaluating these tools.",
      "Your individual path will look different from anyone else's, and that's exactly as it should be.",
    ];
  }

  scanForMagicalThinking(content: string): {
    flagged: boolean;
    concerns: string[];
    suggestions: string[];
  } {
    const magicalThinkingFlags = [
      "will transform you",
      "guaranteed results",
      "unlock your potential",
      "spiritual truth",
      "universal law",
      "energy field",
      "vibration",
      "manifestation power",
      "cosmic energy",
      "divine guidance",
      "channeled wisdom",
      "ancient secrets",
      "mystical power",
      "spiritual awakening guaranteed",
    ];

    const transformationPromises = [
      "transform your life",
      "breakthrough to new levels",
      "transcend your limitations",
      "activate your power",
      "unlock hidden abilities",
      "accelerate your growth",
      "quantum leap",
      "instant healing",
      "permanent change",
      "never struggle again",
    ];

    const concerns: string[] = [];
    const suggestions: string[] = [];
    const contentLower = content.toLowerCase();

    // Check for magical thinking language
    magicalThinkingFlags.forEach((flag) => {
      if (contentLower.includes(flag)) {
        concerns.push(
          `Contains potentially magical thinking language: "${flag}"`,
        );
        suggestions.push(
          `Consider reframing "${flag}" as a tool for exploration rather than a mystical truth.`,
        );
      }
    });

    // Check for transformation promises
    transformationPromises.forEach((promise) => {
      if (contentLower.includes(promise)) {
        concerns.push(`Contains transformation promise: "${promise}"`);
        suggestions.push(
          `Consider reframing "${promise}" to focus on supporting practice rather than promising outcomes.`,
        );
      }
    });

    // Check for authority claims
    const authorityClaims = [
      "the truth is",
      "you must",
      "always",
      "never",
      "the only way",
    ];
    authorityClaims.forEach((claim) => {
      if (contentLower.includes(claim)) {
        concerns.push(`Contains authority claim: "${claim}"`);
        suggestions.push(
          `Consider softening "${claim}" to invite exploration rather than assert universal truth.`,
        );
      }
    });

    return {
      flagged: concerns.length > 0,
      concerns,
      suggestions,
    };
  }

  generateGroundedAlternatives(flaggedContent: string): string[] {
    const alternatives: string[] = [];

    // Replace transformation promises
    if (flaggedContent.toLowerCase().includes("transform")) {
      alternatives.push(
        "This practice may support your ongoing development process.",
      );
    }

    if (
      flaggedContent.toLowerCase().includes("guaranteed") ||
      flaggedContent.toLowerCase().includes("will")
    ) {
      alternatives.push(
        "Some people find this approach helpful for their growth.",
      );
    }

    if (
      flaggedContent.toLowerCase().includes("unlock") ||
      flaggedContent.toLowerCase().includes("activate")
    ) {
      alternatives.push(
        "This framework invites you to explore aspects of your experience.",
      );
    }

    if (
      flaggedContent.toLowerCase().includes("truth") ||
      flaggedContent.toLowerCase().includes("law")
    ) {
      alternatives.push(
        "This perspective offers one way of understanding these experiences.",
      );
    }

    if (
      flaggedContent.toLowerCase().includes("energy") ||
      flaggedContent.toLowerCase().includes("vibration")
    ) {
      alternatives.push(
        "This metaphorical framework may help you reflect on these patterns.",
      );
    }

    // General grounding alternatives
    alternatives.push(
      "Consider experimenting with this approach to see if it serves your growth.",
      "This tool is offered for your discernment and personal experimentation.",
      "Your lived experience will be the best guide for whether this is helpful.",
      "This framework is one of many possible ways to think about these experiences.",
    );

    return alternatives;
  }

  validateGroundedPresentation(content: any): {
    isGrounded: boolean;
    improvements: string[];
    validGroundingElements: string[];
  } {
    const improvements: string[] = [];
    const validGroundingElements: string[] = [];

    // Check for proper disclaimers
    if (content.disclaimers && content.disclaimers.length > 0) {
      validGroundingElements.push("Includes appropriate disclaimers");
    } else {
      improvements.push(
        "Add disclaimers about metaphorical nature of elemental language",
      );
    }

    // Check for humility statements
    if (content.humilityStatements && content.humilityStatements.length > 0) {
      validGroundingElements.push(
        "Includes humility about platform limitations",
      );
    } else {
      improvements.push("Add statements acknowledging platform limitations");
    }

    // Check for subjective experience validation
    if (content.subjectiveValidation) {
      validGroundingElements.push("Validates individual subjective experience");
    } else {
      improvements.push("Add validation for diverse individual experiences");
    }

    // Check for reality grounding prompts
    if (content.realityGrounding && content.realityGrounding.length > 0) {
      validGroundingElements.push("Includes reality grounding questions");
    } else {
      improvements.push("Add questions that ground insights in daily reality");
    }

    // Check for experimentation language
    const hasExperimentationLanguage =
      content.content &&
      (content.content.includes("experiment") ||
        content.content.includes("explore") ||
        content.content.includes("try") ||
        content.content.includes("notice"));

    if (hasExperimentationLanguage) {
      validGroundingElements.push(
        "Uses experimental rather than authoritative language",
      );
    } else {
      improvements.push(
        "Frame content as invitation to experiment rather than truth to accept",
      );
    }

    const isGrounded = improvements.length <= validGroundingElements.length;

    return {
      isGrounded,
      improvements,
      validGroundingElements,
    };
  }

  injectGroundingPrompts(
    content: string,
    userArchitecture: IntegrationArchitecture,
  ): string {
    let groundedContent = content;

    // Add grounding context based on user's bypassing history
    const hasEmotionalAvoidance = userArchitecture.bypassingHistory.some(
      (b) => b.pattern === "emotional_avoidance" && !b.addressed,
    );

    const hasInsightAddiction = userArchitecture.bypassingHistory.some(
      (b) => b.pattern === "insight_addiction" && !b.addressed,
    );

    if (hasEmotionalAvoidance) {
      groundedContent +=
        "\n\n🌱 Grounding Reminder: As you explore this content, notice any emotions that arise and allow them to be present without trying to transform or transcend them.";
    }

    if (hasInsightAddiction) {
      groundedContent +=
        "\n\n🌱 Grounding Reminder: Before moving to new content, consider how you might apply this insight in one small, practical way in your daily life.";
    }

    // Add universal grounding footer
    groundedContent += "\n\n" + this.getRandomHumilityStatement();

    return groundedContent;
  }

  private getRandomHumilityStatement(): string {
    const randomIndex = Math.floor(
      Math.random() * this.humilityStatements.length,
    );
    return "💫 Remember: " + this.humilityStatements[randomIndex];
  }

  generateRealityCheckPrompts(context: string): RealityGroundingPrompt[] {
    return [
      {
        id: "reality-check-1",
        context,
        prompt:
          "How might you be using this spiritual concept to avoid dealing with practical challenges in your life?",
        followUpQuestions: [
          "What difficult emotions or situations might you be avoiding?",
          "How can you stay present to your human limitations while exploring this?",
          "What practical steps need attention in your daily life right now?",
        ],
        redFlagIndicators: [
          "Dismisses practical concerns as 'unspiritual'",
          "Uses spiritual language to avoid accountability",
          "Seeks transcendence rather than integration",
        ],
        groundingActions: [
          "Address one practical life concern before continuing",
          "Share your integration challenges with a trusted friend",
          "Practice presence during mundane daily tasks",
        ],
      },
      {
        id: "reality-check-2",
        context,
        prompt:
          "How does this insight serve your ability to be present and helpful in your actual relationships?",
        followUpQuestions: [
          "How are the people closest to you experiencing your growth?",
          "What feedback have you received about changes in your behavior?",
          "How does this support your ability to show up for others?",
        ],
        redFlagIndicators: [
          "Focuses only on personal transformation",
          "Dismisses others as 'less awakened'",
          "Avoids feedback from close relationships",
        ],
        groundingActions: [
          "Ask a close friend for honest feedback",
          "Practice active listening in your next conversation",
          "Focus on being helpful rather than spiritually impressive",
        ],
      },
    ];
  }
}
