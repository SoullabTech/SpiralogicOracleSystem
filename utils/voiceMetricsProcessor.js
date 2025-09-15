// Voice Analytics Metrics Processor
// Processes batched voice events to extract key insights

export class VoiceMetricsProcessor {
  constructor(events = []) {
    this.events = events;
  }

  // Group events by session for analysis
  groupBySession() {
    const sessions = new Map();

    this.events.forEach(event => {
      if (!sessions.has(event.sessionId || event.session_id)) {
        const sessionId = event.sessionId || event.session_id;
        sessions.set(sessionId, []);
      }
      const sessionId = event.sessionId || event.session_id;
      sessions.get(sessionId).push(event);
    });

    return sessions;
  }

  // Calculate basic success metrics
  calculateSuccessRates() {
    const sessions = this.groupBySession();
    let totalAttempts = 0;
    let successfulTranscripts = 0;
    let completedResponses = 0;
    let fallbacks = 0;

    sessions.forEach(sessionEvents => {
      const attempts = sessionEvents.filter(e => e.event === 'voice_attempt_started').length;
      const transcripts = sessionEvents.filter(e => e.event === 'voice_transcript_received').length;
      const responses = sessionEvents.filter(e => e.event === 'voice_response_played').length;
      const sessionFallbacks = sessionEvents.filter(e => e.event === 'text_fallback_used').length;

      totalAttempts += attempts;
      successfulTranscripts += transcripts;
      completedResponses += responses;
      fallbacks += sessionFallbacks;
    });

    return {
      totalAttempts,
      transcriptSuccessRate: totalAttempts > 0 ? (successfulTranscripts / totalAttempts) : 0,
      completionRate: totalAttempts > 0 ? (completedResponses / totalAttempts) : 0,
      fallbackRate: totalAttempts > 0 ? (fallbacks / totalAttempts) : 0,
      technicalReliability: successfulTranscripts > 0 ? (completedResponses / successfulTranscripts) : 0
    };
  }

  // Analyze session patterns
  analyzeSessionPatterns() {
    const sessions = this.groupBySession();
    const sessionAnalysis = [];

    sessions.forEach((events, sessionId) => {
      const attempts = events.filter(e => e.event === 'voice_attempt_started').length;
      const transcripts = events.filter(e => e.event === 'voice_transcript_received').length;
      const responses = events.filter(e => e.event === 'voice_response_played').length;
      const fallbacks = events.filter(e => e.event === 'text_fallback_used').length;

      const sortedEvents = events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      const firstEvent = sortedEvents[0];
      const lastEvent = sortedEvents[sortedEvents.length - 1];

      const sessionDuration = new Date(lastEvent.timestamp) - new Date(firstEvent.timestamp);

      sessionAnalysis.push({
        sessionId,
        attempts,
        transcripts,
        responses,
        fallbacks,
        sessionDuration,
        successRate: attempts > 0 ? (transcripts / attempts) : 0,
        abandonedEarly: attempts > 0 && transcripts === 0,
        completedFullFlow: attempts > 0 && responses > 0,
        primarylyFallback: fallbacks > transcripts
      });
    });

    return sessionAnalysis;
  }

  // Calculate retention metrics
  calculateRetention() {
    const sessions = this.analyzeSessionPatterns();

    const totalSessions = sessions.length;
    const successfulSessions = sessions.filter(s => s.completedFullFlow).length;
    const earlyAbandonment = sessions.filter(s => s.abandonedEarly).length;
    const fallbackHeavy = sessions.filter(s => s.primarylyFallback).length;

    const avgAttemptsPerSession = totalSessions > 0 ? sessions.reduce((sum, s) => sum + s.attempts, 0) / totalSessions : 0;
    const avgSessionDuration = totalSessions > 0 ? sessions.reduce((sum, s) => sum + s.sessionDuration, 0) / totalSessions : 0;

    return {
      totalSessions,
      successfulSessions,
      sessionSuccessRate: totalSessions > 0 ? (successfulSessions / totalSessions) : 0,
      earlyAbandonmentRate: totalSessions > 0 ? (earlyAbandonment / totalSessions) : 0,
      fallbackDependencyRate: totalSessions > 0 ? (fallbackHeavy / totalSessions) : 0,
      avgAttemptsPerSession,
      avgSessionDurationMs: avgSessionDuration
    };
  }

  // Identify problem patterns
  identifyIssues() {
    const sessions = this.analyzeSessionPatterns();
    if (sessions.length === 0) return [];

    const issues = [];

    // High early abandonment
    const earlyAbandonRate = sessions.filter(s => s.abandonedEarly).length / sessions.length;
    if (earlyAbandonRate > 0.3) {
      issues.push({
        type: 'high_early_abandonment',
        severity: 'high',
        description: `${(earlyAbandonRate * 100).toFixed(1)}% of sessions abandon voice after first attempt`,
        recommendation: 'Check microphone permissions, speech recognition accuracy, or user education'
      });
    }

    // Low completion rates
    const successRate = this.calculateSuccessRates().completionRate;
    if (successRate < 0.7 && this.calculateSuccessRates().totalAttempts > 0) {
      issues.push({
        type: 'low_completion_rate',
        severity: 'medium',
        description: `Only ${(successRate * 100).toFixed(1)}% of voice attempts complete successfully`,
        recommendation: 'Investigate audio playback issues or API response problems'
      });
    }

    // High fallback usage
    const fallbackRate = this.calculateSuccessRates().fallbackRate;
    if (fallbackRate > 0.4 && this.calculateSuccessRates().totalAttempts > 0) {
      issues.push({
        type: 'high_fallback_usage',
        severity: 'medium',
        description: `${(fallbackRate * 100).toFixed(1)}% of attempts result in text fallback`,
        recommendation: 'Users may find voice interface unreliable or cognitively taxing'
      });
    }

    return issues;
  }

  // Generate summary report
  generateReport() {
    const successRates = this.calculateSuccessRates();
    const retention = this.calculateRetention();
    const issues = this.identifyIssues();
    const timeRange = this.getTimeRange();

    return {
      reportGeneratedAt: new Date().toISOString(),
      timeRange,
      overview: {
        totalEvents: this.events.length,
        totalSessions: retention.totalSessions,
        totalVoiceAttempts: successRates.totalAttempts
      },
      technicalMetrics: {
        transcriptSuccessRate: `${(successRates.transcriptSuccessRate * 100).toFixed(1)}%`,
        completionRate: `${(successRates.completionRate * 100).toFixed(1)}%`,
        technicalReliability: `${(successRates.technicalReliability * 100).toFixed(1)}%`
      },
      userBehavior: {
        sessionSuccessRate: `${(retention.sessionSuccessRate * 100).toFixed(1)}%`,
        avgAttemptsPerSession: retention.avgAttemptsPerSession.toFixed(1),
        avgSessionDuration: `${(retention.avgSessionDurationMs / 1000).toFixed(1)}s`,
        earlyAbandonmentRate: `${(retention.earlyAbandonmentRate * 100).toFixed(1)}%`
      },
      issues: issues.length > 0 ? issues : [{ type: 'none', description: 'No significant issues detected' }]
    };
  }

  // Helper: Get time range of data
  getTimeRange() {
    if (this.events.length === 0) return null;

    const timestamps = this.events.map(e => new Date(e.timestamp)).sort();
    return {
      start: timestamps[0].toISOString(),
      end: timestamps[timestamps.length - 1].toISOString(),
      durationHours: ((timestamps[timestamps.length - 1] - timestamps[0]) / (1000 * 60 * 60)).toFixed(1)
    };
  }
}

// Quick CLI-style processor for development
export function quickAnalysis(events) {
  const processor = new VoiceMetricsProcessor(events);
  const report = processor.generateReport();

  console.log('\n=== VOICE ANALYTICS REPORT ===');
  console.log(`📊 Overview: ${report.overview.totalVoiceAttempts} attempts across ${report.overview.totalSessions} sessions`);
  console.log(`⏱️  Time Range: ${report.timeRange?.durationHours || 0}h`);
  console.log('\n📈 Technical Performance:');
  console.log(`   Speech Recognition: ${report.technicalMetrics.transcriptSuccessRate}`);
  console.log(`   End-to-End Success: ${report.technicalMetrics.completionRate}`);
  console.log(`   Audio Playback: ${report.technicalMetrics.technicalReliability}`);
  console.log('\n👤 User Behavior:');
  console.log(`   Session Success: ${report.userBehavior.sessionSuccessRate}`);
  console.log(`   Avg Attempts/Session: ${report.userBehavior.avgAttemptsPerSession}`);
  console.log(`   Early Abandonment: ${report.userBehavior.earlyAbandonmentRate}`);

  if (report.issues.length > 0 && report.issues[0].type !== 'none') {
    console.log('\n⚠️  Issues Detected:');
    report.issues.forEach(issue => {
      console.log(`   ${issue.type}: ${issue.description}`);
      console.log(`     → ${issue.recommendation}`);
    });
  } else {
    console.log('\n✅ No significant issues detected');
  }

  return report;
}

// Usage example:
// const processor = new VoiceMetricsProcessor(eventBatch);
// const report = processor.generateReport();
// console.log(JSON.stringify(report, null, 2));