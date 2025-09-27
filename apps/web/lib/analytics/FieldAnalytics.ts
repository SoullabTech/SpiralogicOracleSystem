/**
 * Field Analytics - Collective Consciousness Metrics
 *
 * Aggregates symbolic patterns across all users to reveal collective waves,
 * trending archetypes, and transformation currents in the field.
 */

import { journalAnalytics } from './JournalAnalytics';

export interface SymbolicWave {
  symbol: string;
  velocity: number; // How fast it's growing
  momentum: number; // Total count
  peak: Date; // When it peaked
  users: number; // How many users have this symbol
  trend: 'rising' | 'stable' | 'fading';
}

export interface ArchetypeActivation {
  archetype: string;
  percentage: number;
  weeklyGrowth: number;
  dominantIn: string[]; // Which modes/contexts
  users: number;
}

export interface TransformationCurrent {
  date: string;
  avgScore: number;
  entryCount: number;
  dominantEmotions: string[];
  peakHour?: number;
}

export interface CollectivePattern {
  pattern: string;
  description: string;
  frequency: number;
  exampleSymbols: string[];
}

export interface FieldMetrics {
  totalUsers: number;
  totalEntries: number;
  totalSymbols: number;
  avgCoherence: number;
  lastUpdated: Date;
}

export interface FieldAnalyticsSummary {
  metrics: FieldMetrics;
  symbolicWaves: SymbolicWave[];
  archetypeActivations: ArchetypeActivation[];
  transformationCurrents: TransformationCurrent[];
  collectivePatterns: CollectivePattern[];
  insights: string[];
}

export class FieldAnalytics {
  /**
   * Generate collective field analytics
   * In production, this would aggregate across all users
   * For beta, we simulate collective data based on available entries
   */
  static generateFieldAnalytics(userIds: string[]): FieldAnalyticsSummary {
    // Aggregate data from all users
    const allUserAnalytics = userIds.map(userId =>
      journalAnalytics.generateAnalytics(userId)
    );

    const symbolicWaves = this.calculateSymbolicWaves(allUserAnalytics);
    const archetypeActivations = this.calculateArchetypeActivations(allUserAnalytics);
    const transformationCurrents = this.calculateTransformationCurrents(allUserAnalytics);
    const collectivePatterns = this.detectCollectivePatterns(allUserAnalytics);
    const insights = this.generateFieldInsights(symbolicWaves, archetypeActivations);

    const metrics: FieldMetrics = {
      totalUsers: userIds.length,
      totalEntries: allUserAnalytics.reduce((sum, a) => sum + a.totalEntries, 0),
      totalSymbols: new Set(allUserAnalytics.flatMap(a => a.symbolFrequencies.map(s => s.symbol))).size,
      avgCoherence: allUserAnalytics.reduce((sum, a) => sum + a.coherenceScore, 0) / allUserAnalytics.length,
      lastUpdated: new Date()
    };

    return {
      metrics,
      symbolicWaves,
      archetypeActivations,
      transformationCurrents,
      collectivePatterns,
      insights
    };
  }

  /**
   * Calculate symbolic waves - which symbols are trending
   */
  private static calculateSymbolicWaves(allAnalytics: any[]): SymbolicWave[] {
    const symbolMap = new Map<string, {
      count: number;
      users: Set<string>;
      dates: Date[];
    }>();

    allAnalytics.forEach((analytics, userIndex) => {
      analytics.symbolFrequencies.forEach((sf: any) => {
        const existing = symbolMap.get(sf.symbol);
        if (existing) {
          existing.count += sf.count;
          existing.users.add(userIndex.toString());
          existing.dates.push(sf.lastAppeared);
        } else {
          symbolMap.set(sf.symbol, {
            count: sf.count,
            users: new Set([userIndex.toString()]),
            dates: [sf.lastAppeared]
          });
        }
      });
    });

    const waves: SymbolicWave[] = [];
    symbolMap.forEach((data, symbol) => {
      // Calculate velocity (how fast it's spreading)
      const sortedDates = data.dates.sort((a, b) => a.getTime() - b.getTime());
      const firstSeen = sortedDates[0];
      const lastSeen = sortedDates[sortedDates.length - 1];
      const daysSinceFirst = Math.max(1, (Date.now() - firstSeen.getTime()) / (1000 * 60 * 60 * 24));
      const velocity = data.count / daysSinceFirst;

      // Determine trend
      const recentCount = data.dates.filter(d =>
        (Date.now() - d.getTime()) < (7 * 24 * 60 * 60 * 1000) // Last 7 days
      ).length;
      const trend = recentCount > data.count * 0.5 ? 'rising' :
                    recentCount > data.count * 0.2 ? 'stable' : 'fading';

      waves.push({
        symbol,
        velocity,
        momentum: data.count,
        peak: lastSeen,
        users: data.users.size,
        trend
      });
    });

    return waves.sort((a, b) => b.momentum - a.momentum).slice(0, 20);
  }

  /**
   * Calculate archetype activations across the field
   */
  private static calculateArchetypeActivations(allAnalytics: any[]): ArchetypeActivation[] {
    const archetypeMap = new Map<string, {
      count: number;
      users: Set<string>;
      modes: string[];
      recentCount: number;
    }>();

    allAnalytics.forEach((analytics, userIndex) => {
      analytics.archetypeDistribution.forEach((ad: any) => {
        const existing = archetypeMap.get(ad.archetype);
        if (existing) {
          existing.count += ad.count;
          existing.users.add(userIndex.toString());
        } else {
          archetypeMap.set(ad.archetype, {
            count: ad.count,
            users: new Set([userIndex.toString()]),
            modes: [],
            recentCount: 0
          });
        }
      });
    });

    const totalCount = Array.from(archetypeMap.values()).reduce((sum, data) => sum + data.count, 0);

    const activations: ArchetypeActivation[] = [];
    archetypeMap.forEach((data, archetype) => {
      activations.push({
        archetype,
        percentage: (data.count / totalCount) * 100,
        weeklyGrowth: 0, // Would track week-over-week in production
        dominantIn: data.modes,
        users: data.users.size
      });
    });

    return activations.sort((a, b) => b.percentage - a.percentage);
  }

  /**
   * Calculate transformation currents - collective energy over time
   */
  private static calculateTransformationCurrents(allAnalytics: any[]): TransformationCurrent[] {
    const dateMap = new Map<string, {
      scores: number[];
      entries: number;
      emotions: Map<string, number>;
    }>();

    allAnalytics.forEach(analytics => {
      analytics.temporalPatterns.forEach((tp: any) => {
        const existing = dateMap.get(tp.date);
        if (existing) {
          existing.scores.push(tp.avgTransformationScore);
          existing.entries += tp.entryCount;
        } else {
          dateMap.set(tp.date, {
            scores: [tp.avgTransformationScore],
            entries: tp.entryCount,
            emotions: new Map()
          });
        }
      });

      analytics.emotionalPatterns.forEach((ep: any) => {
        // Simplified: would need temporal emotion data in production
      });
    });

    const currents: TransformationCurrent[] = [];
    dateMap.forEach((data, date) => {
      const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
      currents.push({
        date,
        avgScore,
        entryCount: data.entries,
        dominantEmotions: []
      });
    });

    return currents.sort((a, b) => a.date.localeCompare(b.date)).slice(-30); // Last 30 days
  }

  /**
   * Detect collective patterns across the field
   */
  private static detectCollectivePatterns(allAnalytics: any[]): CollectivePattern[] {
    const patterns: CollectivePattern[] = [];

    // Pattern 1: Shadow Integration Wave
    const shadowModeCount = allAnalytics.reduce((sum, a) => {
      const shadowMode = a.modeDistribution.find((m: any) => m.mode === 'shadow');
      return sum + (shadowMode?.count || 0);
    }, 0);

    if (shadowModeCount > allAnalytics.length * 2) {
      patterns.push({
        pattern: 'Shadow Integration Wave',
        description: 'Many users are actively engaging in shadow work',
        frequency: shadowModeCount,
        exampleSymbols: ['Shadow', 'Mirror', 'Depth']
      });
    }

    // Pattern 2: Dream Synchronicity
    const dreamSymbols = new Set<string>();
    allAnalytics.forEach(a => {
      const dreamMode = a.modeDistribution.find((m: any) => m.mode === 'dream');
      if (dreamMode) {
        a.symbolFrequencies.forEach((sf: any) => {
          if (['River', 'Bridge', 'Path', 'Door', 'Light'].includes(sf.symbol)) {
            dreamSymbols.add(sf.symbol);
          }
        });
      }
    });

    if (dreamSymbols.size >= 3) {
      patterns.push({
        pattern: 'Dream Synchronicity',
        description: 'Similar dream symbols appearing across users',
        frequency: dreamSymbols.size,
        exampleSymbols: Array.from(dreamSymbols)
      });
    }

    // Pattern 3: Transformation Surge
    const avgCoherence = allAnalytics.reduce((sum, a) => sum + a.coherenceScore, 0) / allAnalytics.length;
    if (avgCoherence > 0.7) {
      patterns.push({
        pattern: 'Collective Transformation Surge',
        description: 'High coherence scores across the field',
        frequency: Math.round(avgCoherence * 100),
        exampleSymbols: ['Light', 'Bridge', 'Threshold']
      });
    }

    return patterns;
  }

  /**
   * Generate insights about the field
   */
  private static generateFieldInsights(
    waves: SymbolicWave[],
    activations: ArchetypeActivation[]
  ): string[] {
    const insights: string[] = [];

    // Top wave
    if (waves.length > 0) {
      const topWave = waves[0];
      insights.push(`"${topWave.symbol}" is emerging strongly — ${topWave.users} users, ${topWave.trend}.`);
    }

    // Archetype trends
    if (activations.length > 0) {
      const topArchetype = activations[0];
      insights.push(`The ${topArchetype.archetype} archetype is most active (${Math.round(topArchetype.percentage)}% of field).`);
    }

    // Rising waves
    const risingWaves = waves.filter(w => w.trend === 'rising');
    if (risingWaves.length >= 3) {
      insights.push(`${risingWaves.length} symbols are gaining momentum this week.`);
    }

    // Multiple users on same symbol
    const sharedWaves = waves.filter(w => w.users > 1);
    if (sharedWaves.length > 0) {
      insights.push(`Collective resonance: ${sharedWaves.length} symbols appearing across multiple users.`);
    }

    return insights;
  }

  /**
   * For beta/demo: Generate simulated field data
   */
  static generateDemoFieldData(): FieldAnalyticsSummary {
    return {
      metrics: {
        totalUsers: 42,
        totalEntries: 367,
        totalSymbols: 87,
        avgCoherence: 0.68,
        lastUpdated: new Date()
      },
      symbolicWaves: [
        {
          symbol: 'River',
          velocity: 2.4,
          momentum: 34,
          peak: new Date(),
          users: 12,
          trend: 'rising'
        },
        {
          symbol: 'Bridge',
          velocity: 1.8,
          momentum: 28,
          peak: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          users: 10,
          trend: 'stable'
        },
        {
          symbol: 'Shadow',
          velocity: 3.1,
          momentum: 31,
          peak: new Date(),
          users: 14,
          trend: 'rising'
        },
        {
          symbol: 'Light',
          velocity: 2.2,
          momentum: 26,
          peak: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          users: 11,
          trend: 'rising'
        },
        {
          symbol: 'Path',
          velocity: 1.5,
          momentum: 22,
          peak: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          users: 9,
          trend: 'stable'
        }
      ],
      archetypeActivations: [
        {
          archetype: 'Seeker',
          percentage: 32,
          weeklyGrowth: 5.2,
          dominantIn: ['free', 'direction'],
          users: 18
        },
        {
          archetype: 'Mystic',
          percentage: 24,
          weeklyGrowth: 8.1,
          dominantIn: ['dream', 'shadow'],
          users: 15
        },
        {
          archetype: 'Healer',
          percentage: 18,
          weeklyGrowth: 3.4,
          dominantIn: ['emotional'],
          users: 12
        },
        {
          archetype: 'Shadow',
          percentage: 15,
          weeklyGrowth: 12.3,
          dominantIn: ['shadow'],
          users: 11
        },
        {
          archetype: 'Sage',
          percentage: 11,
          weeklyGrowth: 2.1,
          dominantIn: ['direction'],
          users: 8
        }
      ],
      transformationCurrents: Array.from({ length: 14 }, (_, i) => {
        const date = new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000);
        return {
          date: date.toISOString().split('T')[0],
          avgScore: 0.55 + Math.random() * 0.3,
          entryCount: Math.floor(15 + Math.random() * 20),
          dominantEmotions: ['anticipation', 'joy', 'contemplative']
        };
      }),
      collectivePatterns: [
        {
          pattern: 'Shadow Integration Wave',
          description: 'Collective engagement with shadow work is intensifying',
          frequency: 47,
          exampleSymbols: ['Shadow', 'Mirror', 'Depth', 'Cave']
        },
        {
          pattern: 'Dream Synchronicity',
          description: 'Similar archetypal dreams emerging across users',
          frequency: 5,
          exampleSymbols: ['River', 'Bridge', 'Path', 'Door', 'Light']
        }
      ],
      insights: [
        '"Shadow" is emerging strongly — 14 users, rising.',
        'The Seeker archetype is most active (32% of field).',
        '4 symbols are gaining momentum this week.',
        'Collective resonance: 12 symbols appearing across multiple users.'
      ]
    };
  }
}

export const fieldAnalytics = FieldAnalytics;