import { analyzeSentiment, detectShadowThemes } from "../emotionEngine";
import { logger } from "../../../utils/logger.js";
import type { SoulMemorySystem } from "../../../memory/SoulMemorySystem";

interface PatternDetection {
  themes: string[];
  emotions: string[];
  shadowAspects: string[];
  confidence: number;
  recurringPatterns: string[];
}

interface UserPattern {
  patternId: string;
  type: "emotional" | "behavioral" | "shadow" | "growth";
  frequency: number;
  lastOccurrence: Date;
  description: string;
  context: string[];
}

export class PatternEngine {
  private userId: string;
  private detectedPatterns: Map<string, UserPattern>;
  private soulMemory?: SoulMemorySystem;

  constructor(userId: string) {
    this.userId = userId;
    this.detectedPatterns = new Map();
  }

  setSoulMemory(soulMemory: SoulMemorySystem): void {
    this.soulMemory = soulMemory;
  }

  async analyzeInput(input: string, context?: any): Promise<PatternDetection> {
    try {
      // Sentiment and emotion analysis
      const sentiment = await analyzeSentiment(input);
      const shadowThemes = await detectShadowThemes(input, this.userId);

      // Extract themes and patterns
      const themes = this.extractThemes(input);
      const recurringPatterns = await this.identifyRecurringPatterns(input);

      const detection: PatternDetection = {
        themes,
        emotions: sentiment.emotions || [],
        shadowAspects: shadowThemes || [],
        confidence: this.calculateConfidence(themes, sentiment, shadowThemes),
        recurringPatterns,
      };

      // Update pattern database
      await this.updatePatternDatabase(detection, input, context);

      return detection;
    } catch (error) {
      logger.error("Pattern analysis failed", { error, userId: this.userId });
      return {
        themes: [],
        emotions: [],
        shadowAspects: [],
        confidence: 0,
        recurringPatterns: [],
      };
    }
  }

  private extractThemes(input: string): string[] {
    const themes: string[] = [];
    const themeKeywords = {
      relationships: ["relationship", "love", "family", "partner", "friend"],
      career: ["work", "job", "career", "professional", "business"],
      spirituality: ["spiritual", "soul", "divine", "sacred", "meditation"],
      growth: ["growth", "develop", "learn", "change", "transform"],
      healing: ["heal", "pain", "hurt", "trauma", "recover"],
      purpose: ["purpose", "meaning", "direction", "path", "calling"],
    };

    const inputLower = input.toLowerCase();
    Object.entries(themeKeywords).forEach(([theme, keywords]) => {
      if (keywords.some(keyword => inputLower.includes(keyword))) {
        themes.push(theme);
      }
    });

    return themes;
  }

  private async identifyRecurringPatterns(input: string): Promise<string[]> {
    const patterns: string[] = [];
    
    // Check against existing patterns
    for (const [patternId, pattern] of this.detectedPatterns) {
      if (this.matchesPattern(input, pattern)) {
        patterns.push(pattern.description);
        
        // Update pattern frequency
        pattern.frequency++;
        pattern.lastOccurrence = new Date();
      }
    }

    return patterns;
  }

  private matchesPattern(input: string, pattern: UserPattern): boolean {
    const inputLower = input.toLowerCase();
    return pattern.context.some(context => 
      inputLower.includes(context.toLowerCase())
    );
  }

  private calculateConfidence(
    themes: string[],
    sentiment: any,
    shadowThemes: string[]
  ): number {
    let confidence = 0.3; // Base confidence

    if (themes.length > 0) confidence += 0.2;
    if (sentiment && sentiment.emotions?.length > 0) confidence += 0.2;
    if (shadowThemes && shadowThemes.length > 0) confidence += 0.3;

    return Math.min(confidence, 1.0);
  }

  private async updatePatternDatabase(
    detection: PatternDetection,
    input: string,
    context?: any
  ): Promise<void> {
    // Create new patterns from detection
    detection.themes.forEach(theme => {
      const patternId = `theme_${theme}_${this.userId}`;
      if (!this.detectedPatterns.has(patternId)) {
        this.detectedPatterns.set(patternId, {
          patternId,
          type: "emotional",
          frequency: 1,
          lastOccurrence: new Date(),
          description: `Recurring theme: ${theme}`,
          context: [input.substring(0, 100)], // Store context snippet
        });
      } else {
        const pattern = this.detectedPatterns.get(patternId)!;
        pattern.frequency++;
        pattern.lastOccurrence = new Date();
      }
    });

    // Store pattern update in Soul Memory
    if (this.soulMemory && detection.confidence > 0.6) {
      await this.soulMemory.storeMemory({
        userId: this.userId,
        type: "pattern_detection",
        content: `Patterns detected: ${detection.themes.join(", ")}`,
        metadata: {
          detection,
          inputContext: input.substring(0, 200),
        },
      });
    }
  }

  getUserPatterns(): UserPattern[] {
    return Array.from(this.detectedPatterns.values())
      .sort((a, b) => b.frequency - a.frequency);
  }

  getPatternInsights(): {
    topPatterns: UserPattern[];
    patternTrends: Record<string, number>;
    suggestedFocus: string[];
  } {
    const patterns = this.getUserPatterns();
    const topPatterns = patterns.slice(0, 5);
    
    const patternTrends: Record<string, number> = {};
    patterns.forEach(pattern => {
      patternTrends[pattern.type] = (patternTrends[pattern.type] || 0) + pattern.frequency;
    });

    const suggestedFocus = topPatterns
      .filter(p => p.frequency > 3)
      .map(p => p.description);

    return {
      topPatterns,
      patternTrends,
      suggestedFocus,
    };
  }

  clearOldPatterns(olderThanDays: number = 30): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    let removedCount = 0;
    for (const [patternId, pattern] of this.detectedPatterns) {
      if (pattern.lastOccurrence < cutoffDate && pattern.frequency < 5) {
        this.detectedPatterns.delete(patternId);
        removedCount++;
      }
    }

    logger.info("Pattern cleanup completed", {
      userId: this.userId,
      removedPatterns: removedCount,
      remainingPatterns: this.detectedPatterns.size
    });

    return removedCount;
  }
}
