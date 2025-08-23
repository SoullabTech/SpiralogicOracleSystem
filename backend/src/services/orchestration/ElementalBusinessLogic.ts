// 🧠 ELEMENTAL BUSINESS LOGIC
// Pure business logic for elemental analysis and response synthesis

interface ArchetypalIntent {
  primary: "fire" | "water" | "earth" | "air" | "aether";
  secondary?: "fire" | "water" | "earth" | "air" | "aether";
  confidence: number;
  reasoning: string[];
}

interface OrchestrationResult {
  primaryAgent: string;
  secondaryAgent?: string;
  synthesis: string;
  archetypalBalance: {
    fire: number;
    water: number;
  };
  metadata: {
    orchestrationStrategy: string;
    wisdomVector: string;
    transformationGoal: string;
  };
}

export class ElementalBusinessLogic {
  
  /**
   * Analyze archetypal intent from input text
   */
  analyzeArchetypalIntent(input: string): ArchetypalIntent {
    const lowerInput = input.toLowerCase();
    const words = lowerInput.split(" ");

    // Define elemental keyword mappings
    const elementalKeywords = {
      fire: [
        "vision", "create", "passion", "action", "dream", "manifest", "power",
        "transform", "ignite", "spark", "burn", "energy", "drive", "ambition",
        "courage", "strength", "force", "build", "make"
      ],
      water: [
        "feel", "emotion", "flow", "heart", "heal", "intuition", "sense",
        "emotional", "relationship", "connect", "depth", "compassion", "empathy",
        "love", "care", "nurture", "gentle", "soft", "fluid"
      ],
      earth: [
        "practical", "grounded", "stable", "work", "money", "physical", "body",
        "material", "concrete", "real", "foundation", "solid", "steady", "routine",
        "structure", "organize", "plan", "step"
      ],
      air: [
        "think", "mind", "idea", "communication", "speak", "words", "clarity",
        "understand", "analyze", "reason", "logic", "perspective", "view",
        "knowledge", "learn", "teach", "explain"
      ],
      aether: [
        "spirit", "spiritual", "divine", "cosmic", "universe", "transcend",
        "mystical", "sacred", "soul", "consciousness", "awareness", "meditation",
        "enlightenment", "wisdom", "truth", "purpose", "meaning"
      ]
    };

    // Calculate scores for each element
    const scores = this.calculateElementalScores(words, elementalKeywords);
    
    // Determine primary and secondary elements
    const sortedElements = Object.entries(scores)
      .sort(([,a], [,b]) => b - a);

    const [primaryElement, primaryScore] = sortedElements[0];
    const [secondaryElement, secondaryScore] = sortedElements[1];

    const totalScore = primaryScore + secondaryScore;
    const confidence = totalScore > 0 ? primaryScore / totalScore : 0.5;
    const secondary = secondaryScore > 0.2 ? secondaryElement as any : undefined;

    const reasoning = this.generateArchetypalReasoning(
      primaryElement,
      primaryScore,
      secondaryScore,
      words,
      elementalKeywords[primaryElement as keyof typeof elementalKeywords]
    );

    return {
      primary: primaryElement as ArchetypalIntent["primary"],
      secondary,
      confidence,
      reasoning
    };
  }

  /**
   * Determine orchestration strategy based on intent and context
   */
  determineOrchestrationStrategy(
    intent: ArchetypalIntent,
    userContext: any,
    userHistory: any[]
  ): string {
    // Single agent strategies for high confidence
    if (intent.confidence > 0.8 && !intent.secondary) {
      return `${intent.primary}_lead`;
    }

    // Dual agent strategies
    if (intent.primary && intent.secondary) {
      return `${intent.primary}_${intent.secondary}_synthesis`;
    }

    // Contextual strategies based on history
    if (userHistory && userHistory.length > 0) {
      const recentElements = this.extractRecentElements(userHistory);
      const strategy = this.determineBalancingStrategy(intent.primary, recentElements);
      if (strategy) return strategy;
    }

    // Default synthesis strategy
    return "dual_synthesis";
  }

  /**
   * Determine which agents are required for the strategy
   */
  determineRequiredAgents(intent: ArchetypalIntent, strategy: string): string[] {
    const agents: string[] = [];

    // Always include primary agent
    agents.push(intent.primary);

    // Add secondary agent based on strategy
    if (strategy.includes("synthesis") || strategy.includes("balance")) {
      if (intent.secondary) {
        agents.push(intent.secondary);
      } else {
        // Add complementary element for balance
        const complement = this.getComplementaryElement(intent.primary);
        if (complement) agents.push(complement);
      }
    }

    return [...new Set(agents)]; // Remove duplicates
  }

  /**
   * Synthesize responses from multiple agents
   */
  async synthesizeAgentResponses(
    responses: Record<string, any>,
    intent: ArchetypalIntent,
    strategy: string
  ): Promise<OrchestrationResult> {
    const availableResponses = Object.keys(responses).filter(key => responses[key]);
    
    if (availableResponses.length === 0) {
      return this.createFallbackResult(intent, strategy);
    }

    // Single agent response
    if (availableResponses.length === 1) {
      const agentType = availableResponses[0];
      const response = responses[agentType];
      
      return {
        primaryAgent: agentType,
        synthesis: response.message || response.content || "Guidance flows from the elements.",
        archetypalBalance: this.calculateSingleAgentBalance(agentType),
        metadata: {
          orchestrationStrategy: strategy,
          wisdomVector: response.wisdomVector || "individual",
          transformationGoal: response.transformationGoal || "elemental_alignment"
        }
      };
    }

    // Multi-agent synthesis
    return await this.synthesizeMultipleResponses(responses, intent, strategy);
  }

  /**
   * Calculate archetypal insights from user patterns
   */
  calculateArchetypalInsights(patterns: any[], interactions: any[]): any {
    if (patterns.length === 0) {
      return this.getDefaultArchetypalInsights();
    }

    // Calculate average elemental balance
    const avgBalance = this.calculateAverageBalance(patterns);
    
    // Identify dominant patterns
    const dominantPatterns = this.identifyDominantPatterns(patterns);
    
    // Generate emergent wisdom
    const emergentWisdom = this.generateEmergentWisdom(avgBalance, dominantPatterns);

    return {
      archetypalBalance: avgBalance,
      dominantPatterns,
      emergentWisdom
    };
  }

  /**
   * Get default archetypal insights for new users
   */
  getDefaultArchetypalInsights(): any {
    return {
      archetypalBalance: { fire: 0.5, water: 0.5, earth: 0.5, air: 0.5, aether: 0.5 },
      dominantPatterns: [],
      emergentWisdom: "Your elemental journey begins. All elements await your exploration."
    };
  }

  /**
   * Get available elements
   */
  getAvailableElements(): string[] {
    return ["fire", "water", "earth", "air", "aether"];
  }

  // Private helper methods

  private calculateElementalScores(
    words: string[], 
    elementalKeywords: Record<string, string[]>
  ): Record<string, number> {
    const scores: Record<string, number> = {};

    for (const [element, keywords] of Object.entries(elementalKeywords)) {
      const matches = words.filter(word =>
        keywords.some(keyword => 
          word.includes(keyword) || keyword.includes(word)
        )
      );
      scores[element] = matches.length / words.length;
    }

    return scores;
  }

  private generateArchetypalReasoning(
    primary: string,
    primaryScore: number,
    secondaryScore: number,
    words: string[],
    keywords: string[]
  ): string[] {
    const matchedKeywords = words.filter(word =>
      keywords.some(keyword => 
        word.includes(keyword) || keyword.includes(word)
      )
    );

    return [
      `Primary element: ${primary} (score: ${primaryScore.toFixed(2)})`,
      `Matched keywords: ${matchedKeywords.join(", ") || "none"}`,
      `Secondary energy: ${secondaryScore.toFixed(2)}`
    ];
  }

  private extractRecentElements(history: any[]): string[] {
    return history
      .slice(-5) // Last 5 interactions
      .map(interaction => interaction.primaryAgent || interaction.element)
      .filter(Boolean);
  }

  private determineBalancingStrategy(
    primaryElement: string, 
    recentElements: string[]
  ): string | null {
    if (recentElements.length === 0) return null;

    // Count recent element usage
    const elementCounts = recentElements.reduce((counts, element) => {
      counts[element] = (counts[element] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    // Check if one element is overused
    const overusedElements = Object.entries(elementCounts)
      .filter(([, count]) => count > 2);

    if (overusedElements.length > 0) {
      const [overusedElement] = overusedElements[0];
      if (overusedElement !== primaryElement) {
        return `${primaryElement}_balance`;
      }
    }

    return null;
  }

  private getComplementaryElement(element: string): string | null {
    const complementaryPairs: Record<string, string> = {
      fire: "water",
      water: "fire",
      earth: "air", 
      air: "earth",
      aether: "earth" // Aether complements with grounding
    };

    return complementaryPairs[element] || null;
  }

  private createFallbackResult(
    intent: ArchetypalIntent, 
    strategy: string
  ): OrchestrationResult {
    return {
      primaryAgent: intent.primary,
      synthesis: "The elements stir, ready to offer guidance when you're open to receive it.",
      archetypalBalance: this.calculateSingleAgentBalance(intent.primary),
      metadata: {
        orchestrationStrategy: strategy,
        wisdomVector: "fallback",
        transformationGoal: "elemental_reconnection"
      }
    };
  }

  private calculateSingleAgentBalance(agentType: string): { fire: number; water: number } {
    // Simplified balance for backward compatibility
    return {
      fire: agentType === "fire" ? 0.8 : 0.2,
      water: agentType === "water" ? 0.8 : 0.2
    };
  }

  private async synthesizeMultipleResponses(
    responses: Record<string, any>,
    intent: ArchetypalIntent,
    strategy: string
  ): Promise<OrchestrationResult> {
    const responseEntries = Object.entries(responses);
    const [primaryAgent] = responseEntries[0];
    const [secondaryAgent] = responseEntries[1] || [undefined];

    // Create synthesis based on strategy
    let synthesis = "";
    
    if (strategy.includes("fire_water")) {
      synthesis = this.synthesizeFireWater(responses.fire, responses.water);
    } else if (strategy.includes("synthesis")) {
      synthesis = this.synthesizeGeneral(responseEntries);
    } else {
      // Single agent response
      synthesis = responses[primaryAgent]?.message || responses[primaryAgent]?.content || 
                  "The elements offer their wisdom in harmony.";
    }

    // Calculate archetypal balance
    const archetypalBalance = this.calculateMultiAgentBalance(responseEntries, intent);

    return {
      primaryAgent,
      secondaryAgent,
      synthesis,
      archetypalBalance,
      metadata: {
        orchestrationStrategy: strategy,
        wisdomVector: this.determineWisdomVector(responses),
        transformationGoal: this.determineTransformationGoal(responses, intent)
      }
    };
  }

  private synthesizeFireWater(fireResponse: any, waterResponse: any): string {
    const fireMessage = fireResponse?.message || fireResponse?.content || "";
    const waterMessage = waterResponse?.message || waterResponse?.content || "";

    if (fireMessage && waterMessage) {
      return `Your fire energy says: ${fireMessage}\n\nYour water wisdom adds: ${waterMessage}\n\nTogether, they guide you toward integrated action that honors both vision and feeling.`;
    }

    return fireMessage || waterMessage || "Fire and water dance in harmony within you.";
  }

  private synthesizeGeneral(responseEntries: [string, any][]): string {
    const responses = responseEntries
      .map(([agent, response]) => response?.message || response?.content)
      .filter(Boolean);

    if (responses.length === 0) {
      return "The elements whisper their wisdom, waiting for you to listen.";
    }

    if (responses.length === 1) {
      return responses[0];
    }

    // Multi-response synthesis
    return responses.join("\n\nAnd from another perspective: ") + 
           "\n\nLet these different elemental voices guide you toward wholeness.";
  }

  private calculateMultiAgentBalance(
    responseEntries: [string, any][],
    intent: ArchetypalIntent
  ): { fire: number; water: number } {
    let fireWeight = intent.primary === "fire" ? intent.confidence : 1 - intent.confidence;
    let waterWeight = intent.primary === "water" ? intent.confidence : 1 - intent.confidence;

    // Adjust based on available responses
    responseEntries.forEach(([agent, response]) => {
      if (agent === "fire" && response) fireWeight *= 1.2;
      if (agent === "water" && response) waterWeight *= 1.2;
    });

    const total = fireWeight + waterWeight;
    return {
      fire: fireWeight / total,
      water: waterWeight / total
    };
  }

  private calculateAverageBalance(patterns: any[]): any {
    if (patterns.length === 0) return { fire: 0.5, water: 0.5 };

    const totals = patterns.reduce((acc, pattern) => {
      if (pattern.balance) {
        acc.fire += pattern.balance.fire || 0;
        acc.water += pattern.balance.water || 0;
      }
      return acc;
    }, { fire: 0, water: 0 });

    return {
      fire: totals.fire / patterns.length,
      water: totals.water / patterns.length
    };
  }

  private identifyDominantPatterns(patterns: any[]): any[] {
    const agentCounts = patterns.reduce((counts, pattern) => {
      if (pattern.primary) {
        counts[pattern.primary] = (counts[pattern.primary] || 0) + 1;
      }
      return counts;
    }, {} as Record<string, number>);

    return Object.entries(agentCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([agent, count]) => ({
        agent,
        frequency: count / patterns.length
      }));
  }

  private generateEmergentWisdom(avgBalance: any, dominantPatterns: any[]): string {
    const fireBalance = avgBalance.fire || 0.5;
    const waterBalance = avgBalance.water || 0.5;
    const balance = Math.abs(fireBalance - waterBalance);

    if (balance < 0.2) {
      return "You're finding beautiful balance between action and feeling, vision and flow. This integration is your gift.";
    }

    if (fireBalance > waterBalance + 0.3) {
      return "Your fire burns bright with vision and creative power. Consider how emotional wisdom might deepen and sustain your flames.";
    }

    if (waterBalance > fireBalance + 0.3) {
      return "You move with deep emotional intelligence and intuitive knowing. Your fire energy awaits integration to manifest your visions.";
    }

    return "Your elemental journey unfolds uniquely. Trust the dance between different energies within you.";
  }

  private determineWisdomVector(responses: Record<string, any>): string {
    const vectors = Object.values(responses)
      .map(response => response?.wisdomVector)
      .filter(Boolean);

    if (vectors.length === 0) return "elemental";
    if (vectors.length === 1) return vectors[0];

    // Multiple vectors - return synthesis
    return "synthesis";
  }

  private determineTransformationGoal(
    responses: Record<string, any>,
    intent: ArchetypalIntent
  ): string {
    const goals = Object.values(responses)
      .map(response => response?.transformationGoal)
      .filter(Boolean);

    if (goals.length === 0) return "elemental_integration";
    if (goals.length === 1) return goals[0];

    return `${intent.primary}_synthesis`;
  }
}