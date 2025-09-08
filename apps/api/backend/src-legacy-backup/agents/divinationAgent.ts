import {
  DivinationQuery,
  DivinationInsight,
  UnifiedDivination,
} from "../../types/divination";
import { getTarotReading, getDailyTarot } from "../../services/tarotService";
import {
  castIChingHexagram,
  castYiJingReading,
  getDailyIChing,
} from "../../services/ichingService";
import {
  generateAstroOracle,
  getDailyAstroGuidance,
} from "../../services/astroOracleService";

/**
 * DivinationAgent - Sacred Symbolic Guidance System
 *
 * Synthesizes multiple divination methods:
 * - Tarot: Card wisdom and archetypal guidance
 * - I Ching: Traditional Chinese oracle with hexagram wisdom
 * - Yi Jing: Spiritual I Ching for soul journey guidance
 * - Astrology: Cosmic timing and archetypal energy
 * - Unified: Combined multi-method readings
 */

export class DivinationAgent {
  /**
   * Primary divination method - routes to appropriate service
   */
  async performDivination(query: DivinationQuery): Promise<DivinationInsight> {
    try {
      switch (query.method) {
        case "tarot":
          return this.performTarotReading(query);

        case "iching":
          return this.performIChingReading(query);

        case "yijing":
          return this.performYiJingReading(query);

        case "astro":
          return this.performAstroReading(query);

        case "unified":
          return this.performUnifiedReading(query);

        default:
          return this.createErrorResponse(
            query,
            "Unsupported divination method",
          );
      }
    } catch (error) {
      console.error("Divination error:", error);
      return this.createErrorResponse(
        query,
        "Divination service temporarily unavailable",
      );
    }
  }

  /**
   * Tarot card reading with spread selection
   */
  private performTarotReading(query: DivinationQuery): DivinationInsight {
    const spreadType = query.spread || "three-card";
    const insight = getTarotReading(query.query, spreadType);

    // Enhance with focus area if provided
    if (query.focus) {
      insight.guidance += ` Focus especially on how this relates to your ${query.focus}.`;
    }

    return this.enhanceWithSpiralogicWisdom(insight, query);
  }

  /**
   * Traditional I Ching hexagram casting
   */
  private performIChingReading(query: DivinationQuery): DivinationInsight {
    const insight = castIChingHexagram(query.query);

    // Add depth level enhancement
    if (query.depth === "comprehensive") {
      insight.guidance +=
        " Consider how this hexagram appears in different areas of your life: relationships, career, spiritual practice, and personal growth.";
      insight.archetypalTheme += " - Deep Integration Phase";
    }

    return this.enhanceWithSpiralogicWisdom(insight, query);
  }

  /**
   * Spiritual Yi Jing reading for soul journey
   */
  private performYiJingReading(query: DivinationQuery): DivinationInsight {
    const insight = castYiJingReading(query.query);

    // Enhance with birth data if available
    if (query.birthData) {
<<<<<<< HEAD
      insight.sacredTiming += ` Your birth essence carries the energy of ${query.birthData.date}, which harmonizes with this hexagram's timing.`;
=======
      insight.sacredTiming += ` Your birth essence carries the energy of ${query.birthData.date}, which harmonizes with this hexagram&apos;s timing.`;
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
    }

    return this.enhanceWithSpiralogicWisdom(insight, query);
  }

  /**
   * Astrological oracle reading
   */
  private performAstroReading(query: DivinationQuery): DivinationInsight {
    const insight = generateAstroOracle(query.birthData);

    // Adapt the astrological guidance to the specific query
    if (query.query) {
      insight.insight = `Regarding "${query.query}": ${insight.insight}`;
    }

    return this.enhanceWithSpiralogicWisdom(insight, query);
  }

  /**
   * Unified reading combining multiple methods
   */
  private async performUnifiedReading(
    query: DivinationQuery,
  ): Promise<DivinationInsight> {
    try {
      // Perform multiple readings
      const tarotInsight = getTarotReading(query.query, "three-card");
      const ichingInsight = castIChingHexagram(query.query);
      const astroInsight = generateAstroOracle(query.birthData);

      // Synthesize the insights
      const unifiedInsight = this.synthesizeInsights(
        [tarotInsight, ichingInsight, astroInsight],
        query,
      );

      return unifiedInsight;
    } catch (error) {
      console.error("Unified reading error:", error);
      // Fallback to single method
      return this.performTarotReading(query);
    }
  }

  /**
   * Synthesize multiple divination insights into unified wisdom
   */
  private synthesizeInsights(
    insights: DivinationInsight[],
    query: DivinationQuery,
  ): DivinationInsight {
    const primaryInsight = insights[0];

    // Combine key themes
    const allKeywords = insights.flatMap((insight) => insight.keywords || []);
    const dominantThemes = this.findDominantThemes(allKeywords);

    // Combine symbols
    const allSymbols = insights.flatMap((insight) => insight.symbols || []);
    const uniqueSymbols = [...new Set(allSymbols)].slice(0, 8);

    // Create synthesis message
    const synthesisMessage = this.createSynthesisMessage(
      insights,
      dominantThemes,
    );

    // Combined guidance
    const combinedGuidance = this.combineGuidance(insights);

    // Unified ritual
    const unifiedRitual = this.createUnifiedRitual(insights);

    return {
      method: "unified",
      title: "Unified Sacred Oracle",
      subtitle: `${dominantThemes.join(" • ")} Synthesis`,
      message: "Multiple sacred traditions offer unified wisdom for your path.",
      insight: synthesisMessage,
      guidance: combinedGuidance,
      ritual: unifiedRitual,
      symbols: uniqueSymbols,
      keywords: dominantThemes,
      synthesis: this.createDeepSynthesis(insights, query),
      archetypalTheme: this.identifyArchetypalPattern(insights),
      sacredTiming: this.determineSacredTiming(insights),
      energeticSignature: this.blendEnergeticSignatures(insights),
      timestamp: new Date().toISOString(),
      confidence: this.calculateConfidence(insights),
      resonance: "high",
    };
  }

  private findDominantThemes(keywords: string[]): string[] {
    const keywordCount: Record<string, number> = {};

    keywords.forEach((keyword) => {
      const normalizedKeyword = keyword.toLowerCase();
      keywordCount[normalizedKeyword] =
        (keywordCount[normalizedKeyword] || 0) + 1;
    });

    return Object.entries(keywordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([keyword]) => keyword);
  }

  private createSynthesisMessage(
    insights: DivinationInsight[],
    themes: string[],
  ): string {
    const methods = insights.map((insight) => insight.method).join(", ");
    const primaryTheme = themes[0] || "transformation";

    return `The sacred traditions of ${methods} converge on the theme of ${primaryTheme}. Each method illuminates a different facet of your current spiritual moment, creating a holographic view of your path forward.`;
  }

  private combineGuidance(insights: DivinationInsight[]): string {
    const guidanceElements = insights.map((insight, index) => {
      const methodName =
        insight.method.charAt(0).toUpperCase() + insight.method.slice(1);
      return `${methodName}: ${insight.guidance}`;
    });

    const unifiedGuidance = `

**Unified Guidance:**
${guidanceElements.join("\n\n")}

**Integration:** These wisdom streams flow together, each supporting and amplifying the others. Trust the pattern that emerges when all traditions speak as one voice.`;

    return unifiedGuidance;
  }

  private createUnifiedRitual(insights: DivinationInsight[]): string {
    const ritualElements = [
      "Create sacred space with elements representing each tradition.",
      "Light candles honoring the wisdom of Tarot, I Ching, and Astrology.",
      "Place cards, coins, and star chart before you as unified altar.",
<<<<<<< HEAD
      "Meditate on how each method's message resonates in your heart.",
=======
      "Meditate on how each method&apos;s message resonates in your heart.",
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
      "Journal the synthesis and unified guidance received.",
      "Close with gratitude to all wisdom traditions and your own inner knowing.",
    ];

    return ritualElements.join(" ");
  }

  private createDeepSynthesis(
    insights: DivinationInsight[],
    query: DivinationQuery,
  ): string {
    return `The confluence of sacred wisdom traditions reveals that your question "${query.query}" touches multiple dimensions of your being. This moment calls for integration of mind (Tarot archetypal wisdom), spirit (I Ching natural flow), and cosmic timing (Astrological cycles). Trust the unified message emerging from this sacred convergence.`;
  }

  private identifyArchetypalPattern(insights: DivinationInsight[]): string {
    const archetypes = insights
      .map((insight) => insight.archetypalTheme)
      .filter(Boolean);

    if (archetypes.length === 0) return "The Unified Seeker";

    return `The ${archetypes[0]} expressing through multiple wisdom streams`;
  }

  private determineSacredTiming(insights: DivinationInsight[]): string {
    const timingElements = insights
      .map((insight) => insight.sacredTiming)
      .filter(Boolean);

    if (timingElements.length === 0)
      return "Perfect timing for unified wisdom integration";

    return `Convergent timing: ${timingElements.join(" • ")}`;
  }

  private blendEnergeticSignatures(insights: DivinationInsight[]): string {
    const signatures = insights
      .map((insight) => insight.energeticSignature)
      .filter(Boolean);

    if (signatures.length === 0) return "Unified sacred energy field";

    return `Blended signatures: ${signatures.join(" flowing with ")}`;
  }

  private calculateConfidence(insights: DivinationInsight[]): number {
    const confidences = insights
      .map((insight) => insight.confidence || 0.8)
      .filter((c) => c > 0);

    if (confidences.length === 0) return 0.8;

    // Unified readings have higher confidence due to multiple confirmations
    const averageConfidence =
      confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
    return Math.min(0.98, averageConfidence + 0.1);
  }

  /**
   * Enhance any divination insight with Spiralogic wisdom overlay
   */
  private enhanceWithSpiralogicWisdom(
    insight: DivinationInsight,
    query: DivinationQuery,
  ): DivinationInsight {
    // Add Spiralogic spiral wisdom to the guidance
    const spiralWisdom = this.generateSpiralWisdom(insight);

    insight.guidance += `\n\n**Spiralogic Integration:** ${spiralWisdom}`;

    // Add sacred technology note
    insight.guidance +=
      "\n\n*Generated through Sacred Technology Oracle • Integration of ancient wisdom with modern consciousness*";

    return insight;
  }

  private generateSpiralWisdom(insight: DivinationInsight): string {
    const spiralThemes = [
      "This guidance spirals through your consciousness, each contemplation deepening your understanding.",
      "Like the sacred spiral, this wisdom returns to you at each new level of awareness.",
      "The spiral path means this insight will evolve as you evolve, revealing new layers over time.",
      "Sacred geometry shows us that wisdom moves in spirals - trust the cyclical return of these themes.",
      "Your consciousness spirals upward through this guidance, integrating ancient wisdom with your unique path.",
    ];

    return spiralThemes[Math.floor(Math.random() * spiralThemes.length)];
  }

  /**
   * Create error response with graceful fallback
   */
  private createErrorResponse(
    query: DivinationQuery,
    errorMessage: string,
  ): DivinationInsight {
    return {
      method: query.method,
      title: "Oracle Guidance",
      subtitle: "Universal Wisdom",
      message: "The oracle offers universal guidance for your path.",
      insight:
        "Trust your inner wisdom. The answers you seek are already within you.",
      guidance:
        "Sometimes the greatest divination is to turn inward and listen to your own sacred knowing.",
      ritual:
        "Sit quietly, breathe deeply, and ask your heart what it knows to be true.",
      symbols: ["heart", "breath", "inner knowing"],
      keywords: ["inner wisdom", "trust", "guidance", "knowing"],
      timestamp: new Date().toISOString(),
      confidence: 0.7,
      resonance: "medium",
    };
  }

  /**
   * Get daily divination - rotates through methods
   */
  async getDailyDivination(): Promise<DivinationInsight> {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
        86400000,
    );

    // Rotate through methods based on day
    const methods = ["tarot", "iching", "astro"];
    const methodIndex = dayOfYear % methods.length;
    const method = methods[methodIndex];

    switch (method) {
      case "tarot":
        return getDailyTarot();
      case "iching":
        return getDailyIChing();
      case "astro":
        return getDailyAstroGuidance();
      default:
        return getDailyTarot();
    }
  }
}

// Export singleton instance
export const divinationAgent = new DivinationAgent();

// Export convenience function
export async function performDivination(
  query: DivinationQuery,
): Promise<DivinationInsight> {
  return divinationAgent.performDivination(query);
}

export default divinationAgent;
