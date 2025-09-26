/**
 * Privacy-Preserved Analytics for Maya Beta
 * Tracks patterns without storing personal content
 */

import { createClient } from '@/lib/supabase';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

interface BetaMetrics {
  // Session metrics
  sessionDuration: number; // minutes
  messageCount: number;
  voiceTextRatio: number;

  // Evolution tracking
  safetyEstablished: boolean;
  patternAwareness: boolean;
  explorationAttempts: number;

  // Engagement quality
  dropoutPoint?: string; // Where users leave
  returnPattern?: string; // What brings them back
  protectionType?: 'speed' | 'intellectual' | 'deflection' | 'pleasing' | 'control';
  thresholdMoments: number;

  // Feedback
  feelingSafe?: 1 | 2 | 3 | 4 | 5;
  feelingSeen?: 1 | 2 | 3 | 4 | 5;
  wouldReturn?: boolean;

  // Technical health
  voiceErrors: number;
  sessionRecoveries: number;
  latencyAverage: number;
}

export class BetaAnalytics {
  private static sessionMetrics = new Map<string, Partial<BetaMetrics>>();

  /**
   * Start session tracking
   */
  static startSession(sessionId: string): void {
    this.sessionMetrics.set(sessionId, {
      messageCount: 0,
      voiceErrors: 0,
      sessionRecoveries: 0,
      thresholdMoments: 0,
      explorationAttempts: 0
    });
  }

  /**
   * Track message without storing content
   */
  static trackMessage(
    sessionId: string,
    role: 'user' | 'maya',
    mode: 'voice' | 'text',
    responseTime?: number
  ): void {
    const metrics = this.sessionMetrics.get(sessionId) || {};

    metrics.messageCount = (metrics.messageCount || 0) + 1;

    // Update voice/text ratio
    if (mode === 'voice') {
      const voiceCount = Math.floor((metrics.voiceTextRatio || 0.5) * metrics.messageCount!) + 1;
      metrics.voiceTextRatio = voiceCount / metrics.messageCount!;
    }

    // Track latency
    if (responseTime) {
      const avgLatency = metrics.latencyAverage || 0;
      const count = metrics.messageCount || 1;
      metrics.latencyAverage = (avgLatency * (count - 1) + responseTime) / count;
    }

    this.sessionMetrics.set(sessionId, metrics);
  }

  /**
   * Detect protection patterns from behavior, not content
   */
  static detectProtectionPattern(
    sessionId: string,
    messageLength: number,
    messageTime: number
  ): void {
    const metrics = this.sessionMetrics.get(sessionId) || {};

    // Speed pattern: many words in short time
    if (messageLength > 100 && messageTime < 5000) {
      metrics.protectionType = 'speed';
    }

    // Intellectual pattern: long, structured messages
    if (messageLength > 200 && messageTime > 30000) {
      metrics.protectionType = 'intellectual';
    }

    this.sessionMetrics.set(sessionId, metrics);
  }

  /**
   * Track evolution markers
   */
  static trackEvolution(
    sessionId: string,
    marker: 'safety' | 'awareness' | 'exploration' | 'threshold'
  ): void {
    const metrics = this.sessionMetrics.get(sessionId) || {};

    switch (marker) {
      case 'safety':
        metrics.safetyEstablished = true;
        break;
      case 'awareness':
        metrics.patternAwareness = true;
        break;
      case 'exploration':
        metrics.explorationAttempts = (metrics.explorationAttempts || 0) + 1;
        break;
      case 'threshold':
        metrics.thresholdMoments = (metrics.thresholdMoments || 0) + 1;
        break;
    }

    this.sessionMetrics.set(sessionId, metrics);
  }

  /**
   * Track dropout point
   */
  static trackDropout(sessionId: string, context: string): void {
    const metrics = this.sessionMetrics.get(sessionId) || {};
    metrics.dropoutPoint = context; // e.g., "after_vulnerability", "during_exploration"
    this.sessionMetrics.set(sessionId, metrics);
  }

  /**
   * Track return pattern
   */
  static trackReturn(sessionId: string, timeSinceLastSession: number): void {
    const metrics = this.sessionMetrics.get(sessionId) || {};

    if (timeSinceLastSession < 86400000) { // Less than 24 hours
      metrics.returnPattern = 'daily';
    } else if (timeSinceLastSession < 604800000) { // Less than a week
      metrics.returnPattern = 'weekly';
    } else {
      metrics.returnPattern = 'irregular';
    }

    this.sessionMetrics.set(sessionId, metrics);
  }

  /**
   * Track technical issues
   */
  static trackError(sessionId: string, errorType: 'voice' | 'session' | 'network'): void {
    const metrics = this.sessionMetrics.get(sessionId) || {};

    if (errorType === 'voice') {
      metrics.voiceErrors = (metrics.voiceErrors || 0) + 1;
    } else if (errorType === 'session') {
      metrics.sessionRecoveries = (metrics.sessionRecoveries || 0) + 1;
    }

    this.sessionMetrics.set(sessionId, metrics);
  }

  /**
   * Collect in-conversation feedback
   */
  static async collectFeedback(
    sessionId: string,
    feedback: {
      feelingSafe?: 1 | 2 | 3 | 4 | 5;
      feelingSeen?: 1 | 2 | 3 | 4 | 5;
      wouldReturn?: boolean;
    }
  ): Promise<void> {
    const metrics = this.sessionMetrics.get(sessionId) || {};

    metrics.feelingSafe = feedback.feelingSafe;
    metrics.feelingSeen = feedback.feelingSeen;
    metrics.wouldReturn = feedback.wouldReturn;

    this.sessionMetrics.set(sessionId, metrics);

    // Save feedback immediately
    await this.saveMetrics(sessionId);
  }

  /**
   * Save session metrics to database
   */
  static async saveMetrics(sessionId: string): Promise<void> {
    const metrics = this.sessionMetrics.get(sessionId);
    if (!metrics) return;

    try {
      const supabase = getSupabaseClient();
      await supabase.from('beta_metrics').insert({
        session_id_hash: Buffer.from(sessionId).toString('base64').substring(0, 8),
        timestamp: new Date().toISOString(),
        duration_minutes: metrics.sessionDuration,
        message_count: metrics.messageCount,
        voice_text_ratio: metrics.voiceTextRatio,
        safety_established: metrics.safetyEstablished,
        pattern_awareness: metrics.patternAwareness,
        exploration_attempts: metrics.explorationAttempts,
        protection_type: metrics.protectionType,
        threshold_moments: metrics.thresholdMoments,
        feeling_safe: metrics.feelingSafe,
        feeling_seen: metrics.feelingSeen,
        would_return: metrics.wouldReturn,
        dropout_point: metrics.dropoutPoint,
        return_pattern: metrics.returnPattern,
        voice_errors: metrics.voiceErrors,
        session_recoveries: metrics.sessionRecoveries,
        latency_average: metrics.latencyAverage
      });
    } catch (error) {
      console.error('Failed to save metrics:', error);
    }
  }

  /**
   * End session and save final metrics
   */
  static async endSession(sessionId: string, startTime: Date): Promise<void> {
    const metrics = this.sessionMetrics.get(sessionId) || {};

    // Calculate duration
    const duration = (Date.now() - startTime.getTime()) / 60000; // in minutes
    metrics.sessionDuration = Math.round(duration);

    // Save and clean up
    await this.saveMetrics(sessionId);
    this.sessionMetrics.delete(sessionId);
  }

  /**
   * Get aggregated insights for dashboard
   */
  static async getInsights(): Promise<any> {
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from('beta_metrics')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (!data) return null;

    return {
      avgSessionDuration: this.average(data.map(d => d.duration_minutes)),
      avgMessageCount: this.average(data.map(d => d.message_count)),
      protectionDistribution: this.distribution(data.map(d => d.protection_type)),
      safetyRate: this.percentage(data.map(d => d.safety_established)),
      returnRate: this.percentage(data.map(d => d.would_return)),
      avgFeelingSafe: this.average(data.map(d => d.feeling_safe).filter(Boolean)),
      avgFeelingSeen: this.average(data.map(d => d.feeling_seen).filter(Boolean)),
      commonDropoutPoints: this.topN(data.map(d => d.dropout_point).filter(Boolean), 3),
      thresholdFrequency: this.average(data.map(d => d.threshold_moments))
    };
  }

  // Helper methods
  private static average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  private static percentage(booleans: boolean[]): number {
    if (booleans.length === 0) return 0;
    return (booleans.filter(Boolean).length / booleans.length) * 100;
  }

  private static distribution(items: string[]): Record<string, number> {
    const dist: Record<string, number> = {};
    items.forEach(item => {
      if (item) dist[item] = (dist[item] || 0) + 1;
    });
    return dist;
  }

  private static topN(items: string[], n: number): string[] {
    const counts = this.distribution(items);
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([item]) => item);
  }
}

/**
 * Real-time session observer
 */
export class SessionObserver {
  private startTime: Date;
  private sessionId: string;
  private messageTimestamps: Date[] = [];

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.startTime = new Date();
    BetaAnalytics.startSession(sessionId);
  }

  observeMessage(role: 'user' | 'maya', content: string, mode: 'voice' | 'text'): void {
    const now = new Date();
    const responseTime = this.messageTimestamps.length > 0
      ? now.getTime() - this.messageTimestamps[this.messageTimestamps.length - 1].getTime()
      : 0;

    this.messageTimestamps.push(now);

    // Track without storing content
    BetaAnalytics.trackMessage(this.sessionId, role, mode, responseTime);

    // Detect patterns from metadata
    if (role === 'user') {
      BetaAnalytics.detectProtectionPattern(
        this.sessionId,
        content.length,
        responseTime
      );
    }
  }

  markEvolution(type: 'safety' | 'awareness' | 'exploration' | 'threshold'): void {
    BetaAnalytics.trackEvolution(this.sessionId, type);
  }

  async endSession(): Promise<void> {
    await BetaAnalytics.endSession(this.sessionId, this.startTime);
  }
}