import { VoiceJournalSession, voiceJournalingService } from '@/lib/journaling/VoiceJournalingService';

export interface SymbolFrequency {
  symbol: string;
  count: number;
  firstAppeared: Date;
  lastAppeared: Date;
  modes: string[];
}

export interface ArchetypeDistribution {
  archetype: string;
  count: number;
  percentage: number;
  firstAppeared: Date;
  associatedSymbols: string[];
}

export interface EmotionalPattern {
  emotion: string;
  count: number;
  percentage: number;
  avgTransformationScore: number;
}

export interface TemporalPattern {
  date: string;
  entryCount: number;
  dominantSymbol?: string;
  dominantArchetype?: string;
  avgTransformationScore: number;
}

export interface ElementalResonance {
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  count: number;
  percentage: number;
  avgTransformationScore: number;
}

export interface ModeDistribution {
  mode: string;
  count: number;
  percentage: number;
  avgWordCount: number;
}

export interface JournalAnalyticsSummary {
  totalEntries: number;
  totalWords: number;
  dateRange: {
    start: Date;
    end: Date;
  };
  symbolFrequencies: SymbolFrequency[];
  archetypeDistribution: ArchetypeDistribution[];
  emotionalPatterns: EmotionalPattern[];
  temporalPatterns: TemporalPattern[];
  elementalResonance: ElementalResonance[];
  modeDistribution: ModeDistribution[];
  transformationVelocity: number;
  coherenceScore: number;
  insights: string[];
}

export class JournalAnalytics {
  /**
   * Generate comprehensive analytics from journal sessions
   */
  static generateAnalytics(userId: string): JournalAnalyticsSummary {
    const sessions = voiceJournalingService.getSessionHistory(userId);

    if (sessions.length === 0) {
      return this.getEmptyAnalytics();
    }

    const symbolFrequencies = this.calculateSymbolFrequencies(sessions);
    const archetypeDistribution = this.calculateArchetypeDistribution(sessions);
    const emotionalPatterns = this.calculateEmotionalPatterns(sessions);
    const temporalPatterns = this.calculateTemporalPatterns(sessions);
    const elementalResonance = this.calculateElementalResonance(sessions);
    const modeDistribution = this.calculateModeDistribution(sessions);

    const totalWords = sessions.reduce((sum, s) => sum + s.wordCount, 0);
    const transformationVelocity = this.calculateTransformationVelocity(sessions);
    const coherenceScore = this.calculateCoherenceScore(sessions);
    const insights = this.generateInsights(sessions, symbolFrequencies, archetypeDistribution);

    const dates = sessions.map(s => s.startTime);
    const dateRange = {
      start: new Date(Math.min(...dates.map(d => d.getTime()))),
      end: new Date(Math.max(...dates.map(d => d.getTime())))
    };

    return {
      totalEntries: sessions.length,
      totalWords,
      dateRange,
      symbolFrequencies,
      archetypeDistribution,
      emotionalPatterns,
      temporalPatterns,
      elementalResonance,
      modeDistribution,
      transformationVelocity,
      coherenceScore,
      insights
    };
  }

  private static calculateSymbolFrequencies(sessions: VoiceJournalSession[]): SymbolFrequency[] {
    const symbolMap = new Map<string, {
      count: number;
      firstAppeared: Date;
      lastAppeared: Date;
      modes: Set<string>;
    }>();

    sessions.forEach(session => {
      const symbols = session.analysis?.symbols || [];
      symbols.forEach(symbol => {
        const existing = symbolMap.get(symbol);
        if (existing) {
          existing.count++;
          existing.lastAppeared = session.startTime;
          existing.modes.add(session.mode);
        } else {
          symbolMap.set(symbol, {
            count: 1,
            firstAppeared: session.startTime,
            lastAppeared: session.startTime,
            modes: new Set([session.mode])
          });
        }
      });
    });

    return Array.from(symbolMap.entries())
      .map(([symbol, data]) => ({
        symbol,
        count: data.count,
        firstAppeared: data.firstAppeared,
        lastAppeared: data.lastAppeared,
        modes: Array.from(data.modes)
      }))
      .sort((a, b) => b.count - a.count);
  }

  private static calculateArchetypeDistribution(sessions: VoiceJournalSession[]): ArchetypeDistribution[] {
    const archetypeMap = new Map<string, {
      count: number;
      firstAppeared: Date;
      symbols: Set<string>;
    }>();

    sessions.forEach(session => {
      const archetypes = session.analysis?.archetypes || [];
      const symbols = session.analysis?.symbols || [];

      archetypes.forEach(archetype => {
        const existing = archetypeMap.get(archetype);
        if (existing) {
          existing.count++;
          symbols.forEach(s => existing.symbols.add(s));
        } else {
          archetypeMap.set(archetype, {
            count: 1,
            firstAppeared: session.startTime,
            symbols: new Set(symbols)
          });
        }
      });
    });

    const totalArchetypes = Array.from(archetypeMap.values())
      .reduce((sum, data) => sum + data.count, 0);

    return Array.from(archetypeMap.entries())
      .map(([archetype, data]) => ({
        archetype,
        count: data.count,
        percentage: (data.count / totalArchetypes) * 100,
        firstAppeared: data.firstAppeared,
        associatedSymbols: Array.from(data.symbols).slice(0, 5)
      }))
      .sort((a, b) => b.count - a.count);
  }

  private static calculateEmotionalPatterns(sessions: VoiceJournalSession[]): EmotionalPattern[] {
    const emotionMap = new Map<string, {
      count: number;
      totalTransformationScore: number;
    }>();

    sessions.forEach(session => {
      const emotion = session.analysis?.emotionalTone;
      if (emotion) {
        const existing = emotionMap.get(emotion);
        const score = session.analysis?.transformationScore || 0.5;

        if (existing) {
          existing.count++;
          existing.totalTransformationScore += score;
        } else {
          emotionMap.set(emotion, {
            count: 1,
            totalTransformationScore: score
          });
        }
      }
    });

    const totalEmotions = Array.from(emotionMap.values())
      .reduce((sum, data) => sum + data.count, 0);

    return Array.from(emotionMap.entries())
      .map(([emotion, data]) => ({
        emotion,
        count: data.count,
        percentage: (data.count / totalEmotions) * 100,
        avgTransformationScore: data.totalTransformationScore / data.count
      }))
      .sort((a, b) => b.count - a.count);
  }

  private static calculateTemporalPatterns(sessions: VoiceJournalSession[]): TemporalPattern[] {
    const dateMap = new Map<string, {
      count: number;
      symbols: Map<string, number>;
      archetypes: Map<string, number>;
      totalTransformationScore: number;
    }>();

    sessions.forEach(session => {
      const dateKey = session.startTime.toISOString().split('T')[0];
      const existing = dateMap.get(dateKey);
      const score = session.analysis?.transformationScore || 0.5;

      if (existing) {
        existing.count++;
        existing.totalTransformationScore += score;
        session.analysis?.symbols?.forEach(s => {
          existing.symbols.set(s, (existing.symbols.get(s) || 0) + 1);
        });
        session.analysis?.archetypes?.forEach(a => {
          existing.archetypes.set(a, (existing.archetypes.get(a) || 0) + 1);
        });
      } else {
        const symbolMap = new Map<string, number>();
        const archetypeMap = new Map<string, number>();
        session.analysis?.symbols?.forEach(s => symbolMap.set(s, 1));
        session.analysis?.archetypes?.forEach(a => archetypeMap.set(a, 1));

        dateMap.set(dateKey, {
          count: 1,
          symbols: symbolMap,
          archetypes: archetypeMap,
          totalTransformationScore: score
        });
      }
    });

    return Array.from(dateMap.entries())
      .map(([date, data]) => {
        const dominantSymbol = Array.from(data.symbols.entries())
          .sort((a, b) => b[1] - a[1])[0]?.[0];
        const dominantArchetype = Array.from(data.archetypes.entries())
          .sort((a, b) => b[1] - a[1])[0]?.[0];

        return {
          date,
          entryCount: data.count,
          dominantSymbol,
          dominantArchetype,
          avgTransformationScore: data.totalTransformationScore / data.count
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private static calculateElementalResonance(sessions: VoiceJournalSession[]): ElementalResonance[] {
    const elementMap = new Map<string, {
      count: number;
      totalTransformationScore: number;
    }>();

    sessions.forEach(session => {
      const element = session.element;
      const score = session.analysis?.transformationScore || 0.5;

      const existing = elementMap.get(element);
      if (existing) {
        existing.count++;
        existing.totalTransformationScore += score;
      } else {
        elementMap.set(element, {
          count: 1,
          totalTransformationScore: score
        });
      }
    });

    const totalElements = Array.from(elementMap.values())
      .reduce((sum, data) => sum + data.count, 0);

    return Array.from(elementMap.entries())
      .map(([element, data]) => ({
        element: element as any,
        count: data.count,
        percentage: (data.count / totalElements) * 100,
        avgTransformationScore: data.totalTransformationScore / data.count
      }))
      .sort((a, b) => b.count - a.count);
  }

  private static calculateModeDistribution(sessions: VoiceJournalSession[]): ModeDistribution[] {
    const modeMap = new Map<string, {
      count: number;
      totalWordCount: number;
    }>();

    sessions.forEach(session => {
      const mode = session.mode;
      const existing = modeMap.get(mode);

      if (existing) {
        existing.count++;
        existing.totalWordCount += session.wordCount;
      } else {
        modeMap.set(mode, {
          count: 1,
          totalWordCount: session.wordCount
        });
      }
    });

    const totalModes = Array.from(modeMap.values())
      .reduce((sum, data) => sum + data.count, 0);

    return Array.from(modeMap.entries())
      .map(([mode, data]) => ({
        mode,
        count: data.count,
        percentage: (data.count / totalModes) * 100,
        avgWordCount: data.totalWordCount / data.count
      }))
      .sort((a, b) => b.count - a.count);
  }

  private static calculateTransformationVelocity(sessions: VoiceJournalSession[]): number {
    if (sessions.length < 2) return 0;

    const sortedSessions = [...sessions].sort((a, b) =>
      a.startTime.getTime() - b.startTime.getTime()
    );

    let totalVelocity = 0;
    let count = 0;

    for (let i = 1; i < sortedSessions.length; i++) {
      const prev = sortedSessions[i - 1];
      const curr = sortedSessions[i];

      const prevScore = prev.analysis?.transformationScore || 0.5;
      const currScore = curr.analysis?.transformationScore || 0.5;

      const scoreDelta = Math.abs(currScore - prevScore);
      totalVelocity += scoreDelta;
      count++;
    }

    return count > 0 ? totalVelocity / count : 0;
  }

  private static calculateCoherenceScore(sessions: VoiceJournalSession[]): number {
    if (sessions.length === 0) return 0;

    const avgTransformationScore = sessions.reduce((sum, s) =>
      sum + (s.analysis?.transformationScore || 0.5), 0
    ) / sessions.length;

    const symbolDiversity = new Set(
      sessions.flatMap(s => s.analysis?.symbols || [])
    ).size;

    const archetypeDiversity = new Set(
      sessions.flatMap(s => s.analysis?.archetypes || [])
    ).size;

    const consistencyScore = sessions.length >= 5 ? 0.2 : (sessions.length / 5) * 0.2;
    const transformationWeight = avgTransformationScore * 0.4;
    const diversityWeight = Math.min((symbolDiversity + archetypeDiversity) / 20, 1) * 0.4;

    return Math.min(consistencyScore + transformationWeight + diversityWeight, 1);
  }

  private static generateInsights(
    sessions: VoiceJournalSession[],
    symbolFrequencies: SymbolFrequency[],
    archetypeDistribution: ArchetypeDistribution[]
  ): string[] {
    const insights: string[] = [];

    if (sessions.length >= 3 && symbolFrequencies.length > 0) {
      const topSymbol = symbolFrequencies[0];
      insights.push(`Your most recurring symbol is "${topSymbol.symbol}" — it appears ${topSymbol.count} times across different modes.`);
    }

    if (archetypeDistribution.length > 0) {
      const topArchetype = archetypeDistribution[0];
      if (topArchetype.percentage > 50) {
        insights.push(`The ${topArchetype.archetype} archetype is dominant in your journey (${Math.round(topArchetype.percentage)}% of entries).`);
      }
    }

    if (sessions.length >= 5) {
      const recentSessions = sessions.slice(-5);
      const recentScores = recentSessions.map(s => s.analysis?.transformationScore || 0.5);
      const avgRecentScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

      if (avgRecentScore > 0.7) {
        insights.push('Your recent entries show high transformation energy. Something is shifting.');
      } else if (avgRecentScore < 0.4) {
        insights.push('Your recent entries suggest a quieter, reflective period. This is part of the cycle.');
      }
    }

    const symbolsLastWeek = sessions
      .filter(s => {
        const daysSince = (Date.now() - s.startTime.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 7;
      })
      .flatMap(s => s.analysis?.symbols || []);

    if (symbolsLastWeek.length > 0) {
      const uniqueSymbols = new Set(symbolsLastWeek);
      if (uniqueSymbols.size >= 5) {
        insights.push('This week shows rich symbolic diversity. Many themes are alive right now.');
      }
    }

    return insights;
  }

  private static getEmptyAnalytics(): JournalAnalyticsSummary {
    return {
      totalEntries: 0,
      totalWords: 0,
      dateRange: {
        start: new Date(),
        end: new Date()
      },
      symbolFrequencies: [],
      archetypeDistribution: [],
      emotionalPatterns: [],
      temporalPatterns: [],
      elementalResonance: [],
      modeDistribution: [],
      transformationVelocity: 0,
      coherenceScore: 0,
      insights: ['Start journaling to see your patterns emerge.']
    };
  }
}

export const journalAnalytics = JournalAnalytics;