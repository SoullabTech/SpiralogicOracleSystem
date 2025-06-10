/**
 * Chart and data visualization interfaces
 */

/**
 * Basic data point for trend charts
 */
export interface TrendDataPoint {
  time: string;
  value: number;
  label?: string;
}

/**
 * Elemental balance data point
 */
export interface ElementalDataPoint {
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  value: number;
  percentage: number;
  color: string;
}

/**
 * Phase timeline entry
 */
export interface PhaseTimelineEntry {
  date: string;
  phase: string;
  keywords: string[];
  element?: string;
  intensity?: number;
}

/**
 * Holoflower chart data
 */
export interface HoloflowerData {
  timestamp: string;
  petals: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
  center: {
    coherence: number;
    resonance: number;
  };
  metadata?: {
    dominant_element: string;
    balance_score: number;
    transformation_phase: string;
  };
}

/**
 * Insight statistics for charts
 */
export interface InsightStats {
  totalEntries: number;
  avgIntensity: number;
  dominantPhase: string;
  topKeywords: string[];
  elementalDistribution: ElementalDataPoint[];
  phaseProgression: TrendDataPoint[];
}

/**
 * Oracle interaction trend data
 */
export interface InteractionTrend {
  period: 'daily' | 'weekly' | 'monthly';
  data: TrendDataPoint[];
  total: number;
  average: number;
  peak: {
    time: string;
    value: number;
  };
}

/**
 * Emotional tone chart data
 */
export interface EmotionalToneData {
  timestamp: string;
  tones: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    love: number;
  };
  dominant: string;
  intensity: number;
}