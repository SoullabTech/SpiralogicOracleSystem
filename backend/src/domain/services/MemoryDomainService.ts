// 🧠 MEMORY DOMAIN SERVICE
// Pure domain logic for memory operations and spiritual pattern recognition

export interface MemoryItem {
  id: string;
  user_id: string;
  content: string;
  element?: string;
  source_agent?: string;
  confidence?: number;
  metadata?: any;
  symbols?: string[];
  timestamp: string;
  created_at?: string;
  updated_at?: string;
}

export interface SpiritualPattern {
  theme: string;
  frequency: number;
  evolution: string[];
  significance: 'emerging' | 'developing' | 'integrated' | 'transcendent';
  firstAppearance: string;
  lastAppearance: string;
  relatedSymbols: string[];
}

export interface MemoryInsight {
  type: 'pattern' | 'synchronicity' | 'breakthrough' | 'integration';
  content: string;
  confidence: number;
  supportingMemories: string[];
  depth: 'surface' | 'emerging' | 'deep' | 'integrated';
}

export interface MemoryAnalysis {
  patterns: SpiritualPattern[];
  insights: MemoryInsight[];
  elementalBalance: Record<string, number>;
  evolutionStage: string;
  nextEvolutionOpportunity?: string;
}

export class MemoryDomainService {
  /**
   * Extract spiritual themes from content
   */
  static extractSpiritualThemes(content: string): string[] {
    const themes: string[] = [];
    const lowerContent = content.toLowerCase();

    const themeKeywords = {
      transformation: ['transform', 'change', 'evolve', 'breakthrough', 'shift'],
      shadow: ['shadow', 'dark', 'hidden', 'suppressed', 'denied'],
      integration: ['integrate', 'whole', 'complete', 'unite', 'balance'],
      awakening: ['awaken', 'aware', 'conscious', 'realize', 'recognize'],
      purpose: ['purpose', 'calling', 'mission', 'path', 'destiny'],
      healing: ['heal', 'repair', 'restore', 'recover', 'mend'],
      wisdom: ['wisdom', 'insight', 'understanding', 'knowledge', 'truth'],
      love: ['love', 'compassion', 'heart', 'connection', 'unity'],
      power: ['power', 'strength', 'energy', 'force', 'will'],
      surrender: ['surrender', 'let go', 'release', 'accept', 'flow']
    };

    for (const [theme, keywords] of Object.entries(themeKeywords)) {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        themes.push(theme);
      }
    }

    return themes;
  }

  /**
   * Calculate spiritual significance of content
   */
  static calculateSpiritualSignificance(
    content: string,
    element?: string,
    sourceAgent?: string
  ): number {
    let significance = 0.5; // Base significance

    // Content depth indicators
    const depthKeywords = [
      'soul', 'spirit', 'divine', 'sacred', 'transcend', 'mystical',
      'cosmic', 'infinite', 'eternal', 'consciousness'
    ];

    const lowerContent = content.toLowerCase();
    const depthMatches = depthKeywords.filter(keyword => 
      lowerContent.includes(keyword)
    ).length;

    significance += (depthMatches / depthKeywords.length) * 0.3;

    // Element-specific significance
    if (element) {
      const elementalDepth = this.calculateElementalDepth(content, element);
      significance += elementalDepth * 0.2;
    }

    // Source agent credibility
    if (sourceAgent) {
      const agentCredibility = this.getAgentCredibility(sourceAgent);
      significance += agentCredibility * 0.1;
    }

    return Math.min(1.0, significance);
  }

  /**
   * Analyze memories for spiritual patterns
   */
  static analyzeSpiritualPatterns(memories: MemoryItem[]): SpiritualPattern[] {
    const patterns: Map<string, SpiritualPattern> = new Map();

    memories.forEach(memory => {
      const themes = this.extractSpiritualThemes(memory.content);
      
      themes.forEach(theme => {
        if (!patterns.has(theme)) {
          patterns.set(theme, {
            theme,
            frequency: 0,
            evolution: [],
            significance: 'emerging',
            firstAppearance: memory.timestamp,
            lastAppearance: memory.timestamp,
            relatedSymbols: memory.symbols || []
          });
        }

        const pattern = patterns.get(theme)!;
        pattern.frequency++;
        pattern.lastAppearance = memory.timestamp;
        
        // Merge symbols
        if (memory.symbols) {
          pattern.relatedSymbols = [
            ...new Set([...pattern.relatedSymbols, ...memory.symbols])
          ];
        }

        // Track evolution
        if (memory.content.length > 100) { // Detailed content suggests evolution
          pattern.evolution.push(memory.content.substring(0, 100) + '...');
        }
      });
    });

    // Determine significance levels
    return Array.from(patterns.values()).map(pattern => ({
      ...pattern,
      significance: this.determinePatternSignificance(pattern, memories.length)
    }));
  }

  /**
   * Generate memory insights from patterns
   */
  static generateMemoryInsights(
    patterns: SpiritualPattern[],
    memories: MemoryItem[]
  ): MemoryInsight[] {
    const insights: MemoryInsight[] = [];

    // Pattern-based insights
    patterns.forEach(pattern => {
      if (pattern.frequency > 3 && pattern.significance !== 'emerging') {
        insights.push({
          type: 'pattern',
          content: this.generatePatternInsight(pattern),
          confidence: this.calculatePatternConfidence(pattern),
          supportingMemories: this.findSupportingMemories(pattern, memories),
          depth: this.mapSignificanceToDepth(pattern.significance)
        });
      }
    });

    // Synchronicity detection
    const synchronicities = this.detectSynchronicities(memories);
    synchronicities.forEach(sync => {
      insights.push({
        type: 'synchronicity',
        content: sync.description,
        confidence: sync.confidence,
        supportingMemories: sync.relatedMemoryIds,
        depth: sync.depth
      });
    });

    // Breakthrough detection
    const breakthroughs = this.detectBreakthroughs(memories);
    breakthroughs.forEach(breakthrough => {
      insights.push({
        type: 'breakthrough',
        content: breakthrough.description,
        confidence: breakthrough.confidence,
        supportingMemories: [breakthrough.memoryId],
        depth: breakthrough.depth
      });
    });

    return insights.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Calculate elemental balance from memories
   */
  static calculateElementalBalance(memories: MemoryItem[]): Record<string, number> {
    const elementCounts = {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0,
      aether: 0
    };

    const total = memories.length || 1;

    memories.forEach(memory => {
      if (memory.element && elementCounts.hasOwnProperty(memory.element)) {
        elementCounts[memory.element as keyof typeof elementCounts]++;
      }
    });

    // Convert to percentages
    return Object.entries(elementCounts).reduce((balance, [element, count]) => ({
      ...balance,
      [element]: count / total
    }), {});
  }

  /**
   * Determine evolution stage from memory analysis
   */
  static determineEvolutionStage(
    patterns: SpiritualPattern[],
    memories: MemoryItem[]
  ): string {
    const stages = ['initiation', 'exploration', 'integration', 'transcendence', 'mastery'];
    
    // Count integrated vs emerging patterns
    const integratedCount = patterns.filter(p => 
      p.significance === 'integrated' || p.significance === 'transcendent'
    ).length;
    
    const totalPatterns = patterns.length || 1;
    const integrationRatio = integratedCount / totalPatterns;
    
    // Check memory depth and frequency
    const recentMemories = memories.slice(-10);
    const avgSignificance = recentMemories.reduce((sum, memory) => 
      sum + this.calculateSpiritualSignificance(memory.content, memory.element), 0
    ) / recentMemories.length;

    // Determine stage based on integration and depth
    if (integrationRatio > 0.8 && avgSignificance > 0.8) return 'mastery';
    if (integrationRatio > 0.6 && avgSignificance > 0.7) return 'transcendence';
    if (integrationRatio > 0.4 && avgSignificance > 0.6) return 'integration';
    if (memories.length > 5 && avgSignificance > 0.5) return 'exploration';
    return 'initiation';
  }

  /**
   * Suggest next evolution opportunity
   */
  static suggestNextEvolutionOpportunity(
    currentStage: string,
    patterns: SpiritualPattern[],
    elementalBalance: Record<string, number>
  ): string | undefined {
    const opportunities = {
      initiation: 'Explore your spiritual curiosity through deeper questioning',
      exploration: 'Begin integrating your insights into daily practice',
      integration: 'Seek transcendent experiences that unite all aspects',
      transcendence: 'Share your wisdom and guide others on their path',
      mastery: 'Continue evolving as a beacon of integrated consciousness'
    };

    const baseOpportunity = opportunities[currentStage as keyof typeof opportunities];
    
    // Customize based on elemental imbalance
    const mostDominant = Object.entries(elementalBalance)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (mostDominant && mostDominant[1] > 0.5) {
      const element = mostDominant[0];
      return `${baseOpportunity} Focus on balancing ${element} energy with complementary elements.`;
    }

    return baseOpportunity;
  }

  // Private helper methods

  private static calculateElementalDepth(content: string, element: string): number {
    const elementKeywords = {
      fire: ['passion', 'energy', 'transform', 'create', 'power', 'action'],
      water: ['emotion', 'flow', 'heal', 'intuition', 'depth', 'feeling'],
      earth: ['ground', 'practical', 'manifest', 'stable', 'body', 'material'],
      air: ['think', 'communicate', 'clarity', 'ideas', 'mind', 'knowledge'],
      aether: ['spirit', 'transcend', 'divine', 'cosmic', 'infinite', 'consciousness']
    };

    const keywords = elementKeywords[element as keyof typeof elementKeywords] || [];
    const lowerContent = content.toLowerCase();
    
    const matches = keywords.filter(keyword => lowerContent.includes(keyword)).length;
    return Math.min(1.0, matches / keywords.length);
  }

  private static getAgentCredibility(sourceAgent: string): number {
    const agentCredibility = {
      'MainOracleAgent': 0.9,
      'fire_agent': 0.8,
      'water_agent': 0.8,
      'earth_agent': 0.8,
      'air_agent': 0.8,
      'aether_agent': 0.9,
      'shadow_agent': 0.7,
      'default': 0.5
    };

    return agentCredibility[sourceAgent as keyof typeof agentCredibility] || 
           agentCredibility.default;
  }

  private static determinePatternSignificance(
    pattern: SpiritualPattern,
    totalMemories: number
  ): 'emerging' | 'developing' | 'integrated' | 'transcendent' {
    const frequencyRatio = pattern.frequency / totalMemories;
    
    if (frequencyRatio > 0.3 && pattern.evolution.length > 3) return 'transcendent';
    if (frequencyRatio > 0.2 && pattern.evolution.length > 2) return 'integrated';
    if (frequencyRatio > 0.1 && pattern.evolution.length > 1) return 'developing';
    return 'emerging';
  }

  private static generatePatternInsight(pattern: SpiritualPattern): string {
    const insights = {
      transformation: `You're in a profound process of transformation. This ${pattern.theme} pattern appears ${pattern.frequency} times, showing your soul's commitment to growth.`,
      shadow: `Your shadow work is deepening. The recurring ${pattern.theme} theme suggests important integration opportunities.`,
      integration: `You're successfully integrating different aspects of yourself. This ${pattern.theme} pattern shows growing wholeness.`,
      awakening: `Your spiritual awakening is accelerating. The ${pattern.theme} theme appears consistently in your journey.`,
      purpose: `Your soul purpose is becoming clearer. The ${pattern.theme} pattern reveals your deeper calling.`
    };

    return insights[pattern.theme as keyof typeof insights] || 
           `The ${pattern.theme} pattern is significant in your spiritual development, appearing ${pattern.frequency} times.`;
  }

  private static calculatePatternConfidence(pattern: SpiritualPattern): number {
    let confidence = 0.5;
    
    // Frequency contributes to confidence
    confidence += Math.min(0.3, pattern.frequency * 0.05);
    
    // Evolution depth contributes
    confidence += Math.min(0.2, pattern.evolution.length * 0.05);
    
    // Significance level contributes
    const significanceBonus = {
      'emerging': 0.0,
      'developing': 0.1,
      'integrated': 0.2,
      'transcendent': 0.3
    };
    confidence += significanceBonus[pattern.significance];

    return Math.min(1.0, confidence);
  }

  private static findSupportingMemories(
    pattern: SpiritualPattern,
    memories: MemoryItem[]
  ): string[] {
    return memories
      .filter(memory => 
        this.extractSpiritualThemes(memory.content).includes(pattern.theme)
      )
      .map(memory => memory.id)
      .slice(0, 3); // Limit to most relevant
  }

  private static mapSignificanceToDepth(
    significance: 'emerging' | 'developing' | 'integrated' | 'transcendent'
  ): 'surface' | 'emerging' | 'deep' | 'integrated' {
    const mapping = {
      'emerging': 'surface' as const,
      'developing': 'emerging' as const,
      'integrated': 'deep' as const,
      'transcendent': 'integrated' as const
    };

    return mapping[significance];
  }

  private static detectSynchronicities(memories: MemoryItem[]): any[] {
    // Simplified synchronicity detection
    // In a full implementation, this would use more sophisticated pattern matching
    return [];
  }

  private static detectBreakthroughs(memories: MemoryItem[]): any[] {
    // Simplified breakthrough detection
    // Look for high-significance memories with breakthrough keywords
    return memories
      .filter(memory => {
        const content = memory.content.toLowerCase();
        return content.includes('breakthrough') || 
               content.includes('realization') || 
               content.includes('awakening');
      })
      .map(memory => ({
        memoryId: memory.id,
        description: `Breakthrough moment detected in your spiritual journey`,
        confidence: this.calculateSpiritualSignificance(memory.content, memory.element),
        depth: 'deep' as const
      }));
  }
}