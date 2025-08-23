import { logger } from "../../../utils/logger.js";
import type { Pattern, UserContext } from "./WisdomRouter.js";

export interface PatternAnalysis {
  detectedPatterns: Pattern[];
  dominantThemes: string[];
  emotionalUndercurrents: string[];
  spiritualIndicators: string[];
  attachmentMarkers: string[];
  shadowSignals: string[];
  integrationOpportunities: string[];
}

export class PatternDetector {
  private patternCache: Map<string, PatternAnalysis> = new Map();
  private keywordSets = {
    attachment: [
      "need", "want", "must", "should", "have to", "can't let go",
      "obsessed", "consumed", "dependent", "clinging", "desperate"
    ],
    shadow: [
      "anger", "rage", "hate", "jealous", "envious", "resentful",
      "ashamed", "guilty", "dark", "hidden", "secret", "denied"
    ],
    spiritual: [
      "soul", "spirit", "divine", "sacred", "holy", "blessed",
      "meditation", "prayer", "awakening", "consciousness", "enlightenment"
    ],
    integration: [
      "balance", "harmony", "whole", "complete", "unified",
      "accept", "embrace", "integrate", "heal", "transform"
    ],
    relationship: [
      "relationship", "partner", "love", "family", "friend",
      "connection", "intimacy", "communication", "conflict", "trust"
    ],
    growth: [
      "grow", "learn", "develop", "evolve", "progress",
      "change", "transform", "breakthrough", "expansion", "journey"
    ]
  };

  detectPatterns(
    input: string, 
    userContext: UserContext, 
    conversationHistory?: any[]
  ): PatternAnalysis {
    try {
      const cacheKey = this.generateCacheKey(input, userContext.userId);
      const cached = this.patternCache.get(cacheKey);
      
      if (cached && Date.now() - cached.detectedPatterns[0]?.timestamp.getTime() < 300000) {
        return cached; // Use cache for 5 minutes
      }

      const analysis = this.performAnalysis(input, userContext, conversationHistory);
      this.patternCache.set(cacheKey, analysis);
      
      // Clean cache if it gets too large
      if (this.patternCache.size > 100) {
        const oldestKey = this.patternCache.keys().next().value;
        this.patternCache.delete(oldestKey);
      }
      
      logger.info("Pattern detection completed", {
        userId: userContext.userId,
        patternsDetected: analysis.detectedPatterns.length,
        dominantThemes: analysis.dominantThemes
      });
      
      return analysis;
    } catch (error) {
      logger.error("Pattern detection failed", { error, userId: userContext.userId });
      return this.getEmptyAnalysis();
    }
  }

  private performAnalysis(
    input: string, 
    userContext: UserContext, 
    history?: any[]
  ): PatternAnalysis {
    const inputLower = input.toLowerCase();
    const detectedPatterns: Pattern[] = [];
    
    // Detect different pattern types
    const attachmentPatterns = this.detectAttachmentPatterns(inputLower);
    const shadowPatterns = this.detectShadowPatterns(inputLower);
    const spiritualPatterns = this.detectSpiritualPatterns(inputLower);
    const integrationPatterns = this.detectIntegrationPatterns(inputLower);
    const relationshipPatterns = this.detectRelationshipPatterns(inputLower);
    const growthPatterns = this.detectGrowthPatterns(inputLower);
    
    detectedPatterns.push(
      ...attachmentPatterns,
      ...shadowPatterns,
      ...spiritualPatterns,
      ...integrationPatterns,
      ...relationshipPatterns,
      ...growthPatterns
    );
    
    // Analyze recurring themes from history
    const recurringThemes = this.analyzeRecurringThemes(history);
    
    return {
      detectedPatterns,
      dominantThemes: this.extractDominantThemes(detectedPatterns),
      emotionalUndercurrents: this.extractEmotionalUndercurrents(inputLower),
      spiritualIndicators: this.extractSpiritualIndicators(inputLower),
      attachmentMarkers: this.extractAttachmentMarkers(inputLower),
      shadowSignals: this.extractShadowSignals(inputLower),
      integrationOpportunities: this.identifyIntegrationOpportunities(detectedPatterns)
    };
  }

  private detectAttachmentPatterns(input: string): Pattern[] {
    const patterns: Pattern[] = [];
    const attachmentWords = this.keywordSets.attachment;
    
    attachmentWords.forEach(word => {
      if (input.includes(word)) {
        patterns.push({
          type: "attachment",
          content: `Attachment pattern detected: ${word}`,
          intensity: this.calculateIntensity(input, word),
          frequency: this.countOccurrences(input, word),
          timestamp: new Date(),
          context: this.extractContext(input, word)
        });
      }
    });
    
    return patterns;
  }

  private detectShadowPatterns(input: string): Pattern[] {
    const patterns: Pattern[] = [];
    const shadowWords = this.keywordSets.shadow;
    
    shadowWords.forEach(word => {
      if (input.includes(word)) {
        patterns.push({
          type: "shadow_emergence",
          content: `Shadow element detected: ${word}`,
          intensity: this.calculateIntensity(input, word),
          frequency: this.countOccurrences(input, word),
          timestamp: new Date(),
          context: this.extractContext(input, word)
        });
      }
    });
    
    return patterns;
  }

  private detectSpiritualPatterns(input: string): Pattern[] {
    const patterns: Pattern[] = [];
    const spiritualWords = this.keywordSets.spiritual;
    
    spiritualWords.forEach(word => {
      if (input.includes(word)) {
        patterns.push({
          type: "spiritual_seeking",
          content: `Spiritual element: ${word}`,
          intensity: this.calculateIntensity(input, word),
          frequency: this.countOccurrences(input, word),
          timestamp: new Date(),
          context: this.extractContext(input, word)
        });
      }
    });
    
    return patterns;
  }

  private detectIntegrationPatterns(input: string): Pattern[] {
    const patterns: Pattern[] = [];
    const integrationWords = this.keywordSets.integration;
    
    integrationWords.forEach(word => {
      if (input.includes(word)) {
        patterns.push({
          type: "integration",
          content: `Integration signal: ${word}`,
          intensity: this.calculateIntensity(input, word),
          frequency: this.countOccurrences(input, word),
          timestamp: new Date(),
          context: this.extractContext(input, word)
        });
      }
    });
    
    return patterns;
  }

  private detectRelationshipPatterns(input: string): Pattern[] {
    const patterns: Pattern[] = [];
    const relationshipWords = this.keywordSets.relationship;
    
    relationshipWords.forEach(word => {
      if (input.includes(word)) {
        patterns.push({
          type: "relational",
          content: `Relationship theme: ${word}`,
          intensity: this.calculateIntensity(input, word),
          frequency: this.countOccurrences(input, word),
          timestamp: new Date(),
          context: this.extractContext(input, word)
        });
      }
    });
    
    return patterns;
  }

  private detectGrowthPatterns(input: string): Pattern[] {
    const patterns: Pattern[] = [];
    const growthWords = this.keywordSets.growth;
    
    growthWords.forEach(word => {
      if (input.includes(word)) {
        patterns.push({
          type: "growth_seeking",
          content: `Growth signal: ${word}`,
          intensity: this.calculateIntensity(input, word),
          frequency: this.countOccurrences(input, word),
          timestamp: new Date(),
          context: this.extractContext(input, word)
        });
      }
    });
    
    return patterns;
  }

  private calculateIntensity(input: string, keyword: string): number {
    const baseIntensity = 0.5;
    const context = this.extractContext(input, keyword);
    
    // Increase intensity based on emotional markers
    const intensifiers = ["really", "very", "extremely", "deeply", "profoundly", "completely"];
    const emotionalMarkers = ["!", "!!!", "???", "..."];
    
    let intensity = baseIntensity;
    
    intensifiers.forEach(intensifier => {
      if (context.includes(intensifier)) {
        intensity += 0.1;
      }
    });
    
    emotionalMarkers.forEach(marker => {
      if (context.includes(marker)) {
        intensity += 0.1;
      }
    });
    
    return Math.min(intensity, 1.0);
  }

  private countOccurrences(input: string, keyword: string): number {
    return (input.match(new RegExp(keyword, 'gi')) || []).length;
  }

  private extractContext(input: string, keyword: string): string {
    const index = input.indexOf(keyword);
    const start = Math.max(0, index - 50);
    const end = Math.min(input.length, index + keyword.length + 50);
    return input.substring(start, end);
  }

  private extractDominantThemes(patterns: Pattern[]): string[] {
    const themeCounts: Record<string, number> = {};
    
    patterns.forEach(pattern => {
      themeCounts[pattern.type] = (themeCounts[pattern.type] || 0) + 1;
    });
    
    return Object.entries(themeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([theme]) => theme);
  }

  private extractEmotionalUndercurrents(input: string): string[] {
    const emotions: string[] = [];
    const emotionMarkers = {
      joy: ["happy", "joyful", "excited", "thrilled", "elated"],
      sadness: ["sad", "depressed", "melancholy", "grief", "sorrow"],
      anger: ["angry", "furious", "rage", "mad", "irritated"],
      fear: ["afraid", "scared", "anxious", "worried", "terrified"],
      love: ["love", "adore", "cherish", "devoted", "affectionate"]
    };
    
    Object.entries(emotionMarkers).forEach(([emotion, markers]) => {
      if (markers.some(marker => input.includes(marker))) {
        emotions.push(emotion);
      }
    });
    
    return emotions;
  }

  private extractSpiritualIndicators(input: string): string[] {
    return this.keywordSets.spiritual.filter(word => input.includes(word));
  }

  private extractAttachmentMarkers(input: string): string[] {
    return this.keywordSets.attachment.filter(word => input.includes(word));
  }

  private extractShadowSignals(input: string): string[] {
    return this.keywordSets.shadow.filter(word => input.includes(word));
  }

  private identifyIntegrationOpportunities(patterns: Pattern[]): string[] {
    const opportunities: string[] = [];
    
    const shadowPresent = patterns.some(p => p.type === "shadow_emergence");
    const attachmentPresent = patterns.some(p => p.type === "attachment");
    const spiritualPresent = patterns.some(p => p.type === "spiritual_seeking");
    
    if (shadowPresent && attachmentPresent) {
      opportunities.push("Shadow-attachment integration");
    }
    
    if (spiritualPresent && shadowPresent) {
      opportunities.push("Spiritual shadow work");
    }
    
    if (patterns.filter(p => p.type === "growth_seeking").length > 0) {
      opportunities.push("Conscious growth integration");
    }
    
    return opportunities;
  }

  private analyzeRecurringThemes(history?: any[]): string[] {
    if (!history || history.length === 0) return [];
    
    const themes: Record<string, number> = {};
    
    // This would analyze conversation history for recurring themes
    // Implementation depends on the structure of conversation history
    
    return Object.entries(themes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([theme]) => theme);
  }

  private generateCacheKey(input: string, userId: string): string {
    return `${userId}_${input.substring(0, 50).replace(/\s+/g, '_')}`;
  }

  private getEmptyAnalysis(): PatternAnalysis {
    return {
      detectedPatterns: [],
      dominantThemes: [],
      emotionalUndercurrents: [],
      spiritualIndicators: [],
      attachmentMarkers: [],
      shadowSignals: [],
      integrationOpportunities: []
    };
  }

  clearCache(): void {
    this.patternCache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.patternCache.size,
      keys: Array.from(this.patternCache.keys())
    };
  }
}
