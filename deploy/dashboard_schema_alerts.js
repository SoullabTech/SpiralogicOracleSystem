// Dashboard Schema & Alert Thresholds for ARIA Integration Cascade
// Real-time monitoring of protection, verification, and cache layers

class DashboardSchema {
  constructor() {
    // Define metrics structure for each layer
    this.schema = {
      fieldProtection: {
        metrics: {
          totalRequests: { type: 'counter', unit: 'count' },
          blockedThreats: { type: 'counter', unit: 'count' },
          rateLimited: { type: 'counter', unit: 'count' },
          dampenedClaims: { type: 'gauge', unit: 'percent' },
          sacredGuarded: { type: 'counter', unit: 'count' },
          avgProcessTime: { type: 'gauge', unit: 'ms' }
        },
        breakdown: {
          threatTypes: {
            spam: 0,
            bruteForce: 0,
            rapidFire: 0,
            malicious: 0,
            impersonation: 0
          },
          categoryBlocks: {
            medical: 0,
            financial: 0,
            sacred: 0,
            personal: 0
          }
        }
      },

      mainVerifier: {
        metrics: {
          verificationsRun: { type: 'counter', unit: 'count' },
          avgConfidence: { type: 'gauge', unit: 'score' },
          semanticMatches: { type: 'counter', unit: 'count' },
          contradictionsFound: { type: 'counter', unit: 'count' },
          avgRetrievalTime: { type: 'gauge', unit: 'ms' },
          avgEmbeddingTime: { type: 'gauge', unit: 'ms' }
        },
        modeDistribution: {
          VERIFIED: { count: 0, percentage: 0 },
          LIKELY: { count: 0, percentage: 0 },
          HYPOTHESIS: { count: 0, percentage: 0 },
          EXPLORATORY: { count: 0, percentage: 0 },
          RITUAL_SAFE: { count: 0, percentage: 0 }
        },
        confidenceBuckets: {
          '0.0-0.2': 0,
          '0.2-0.4': 0,
          '0.4-0.6': 0,
          '0.6-0.8': 0,
          '0.8-1.0': 0
        }
      },

      cacheLayer: {
        metrics: {
          hits: { type: 'counter', unit: 'count' },
          misses: { type: 'counter', unit: 'count' },
          evictions: { type: 'counter', unit: 'count' },
          hitRate: { type: 'gauge', unit: 'percent' },
          avgTTL: { type: 'gauge', unit: 'seconds' },
          memoryUsage: { type: 'gauge', unit: 'MB' }
        },
        ttlByMode: {
          VERIFIED: { ttl: 900, hits: 0 },
          LIKELY: { ttl: 600, hits: 0 },
          HYPOTHESIS: { ttl: 300, hits: 0 },
          EXPLORATORY: { ttl: 180, hits: 0 },
          BLOCKED: { ttl: 60, hits: 0 }
        },
        threatFingerprints: {
          active: 0,
          expired: 0,
          matched: 0
        }
      },

      systemWide: {
        metrics: {
          totalThroughput: { type: 'gauge', unit: 'req/s' },
          endToEndLatency: { type: 'gauge', unit: 'ms' },
          hallucinationRate: { type: 'gauge', unit: 'percent' },
          recoverySuccessRate: { type: 'gauge', unit: 'percent' },
          userTrustScore: { type: 'gauge', unit: 'score' },
          systemHealth: { type: 'gauge', unit: 'percent' }
        },
        cascadeFlow: {
          input: 0,
          afterFieldProtection: 0,
          afterVerification: 0,
          output: 0
        }
      }
    };

    // Alert thresholds configuration
    this.alertThresholds = {
      critical: {
        hallucinationRate: { threshold: 0.1, operator: '>' },
        systemHealth: { threshold: 50, operator: '<' },
        endToEndLatency: { threshold: 1000, operator: '>' },
        blockedThreats: { threshold: 100, operator: '>', window: '1m' },
        sacredGuarded: { threshold: 5, operator: '>', window: '5m' }
      },
      warning: {
        hallucinationRate: { threshold: 0.05, operator: '>' },
        avgConfidence: { threshold: 0.5, operator: '<' },
        cacheHitRate: { threshold: 0.3, operator: '<' },
        endToEndLatency: { threshold: 500, operator: '>' },
        rateLimited: { threshold: 50, operator: '>', window: '5m' }
      },
      info: {
        exploratoryRate: { threshold: 0.3, operator: '>' },
        contradictionsFound: { threshold: 10, operator: '>', window: '10m' },
        evictions: { threshold: 100, operator: '>', window: '5m' },
        memoryUsage: { threshold: 100, operator: '>' }
      }
    };
  }

  // Generate real-time dashboard data structure
  generateDashboardData(metrics) {
    return {
      timestamp: Date.now(),
      layers: {
        fieldProtection: this.calculateFieldProtectionMetrics(metrics),
        mainVerifier: this.calculateVerifierMetrics(metrics),
        cacheLayer: this.calculateCacheMetrics(metrics),
        systemWide: this.calculateSystemMetrics(metrics)
      },
      alerts: this.checkAlerts(metrics),
      cascadeVisualization: this.generateCascadeFlow(metrics)
    };
  }

  calculateFieldProtectionMetrics(metrics) {
    const total = metrics.fieldProtection.totalRequests || 1;
    const blocked = metrics.fieldProtection.blockedThreats || 0;

    return {
      blockRate: (blocked / total * 100).toFixed(2),
      passThroughRate: ((total - blocked) / total * 100).toFixed(2),
      threatBreakdown: this.calculateThreatBreakdown(metrics),
      performanceImpact: metrics.fieldProtection.avgProcessTime || 0
    };
  }

  calculateVerifierMetrics(metrics) {
    const total = metrics.mainVerifier.verificationsRun || 1;
    const distribution = metrics.mainVerifier.modeDistribution;

    // Calculate percentages
    Object.keys(distribution).forEach(mode => {
      distribution[mode].percentage = (distribution[mode].count / total * 100).toFixed(1);
    });

    return {
      avgConfidence: (metrics.mainVerifier.avgConfidence || 0).toFixed(3),
      modeDistribution: distribution,
      confidenceHistogram: this.generateConfidenceHistogram(metrics),
      semanticMatchRate: (metrics.mainVerifier.semanticMatches / total * 100).toFixed(1)
    };
  }

  calculateCacheMetrics(metrics) {
    const hits = metrics.cacheLayer.hits || 0;
    const misses = metrics.cacheLayer.misses || 0;
    const total = hits + misses || 1;

    return {
      hitRate: (hits / total * 100).toFixed(1),
      missRate: (misses / total * 100).toFixed(1),
      avgTTL: metrics.cacheLayer.avgTTL || 0,
      memoryEfficiency: this.calculateMemoryEfficiency(metrics),
      threatFingerprintEffectiveness: this.calculateFingerprintEffectiveness(metrics)
    };
  }

  calculateSystemMetrics(metrics) {
    return {
      overallHealth: this.calculateSystemHealth(metrics),
      hallucinationTrend: this.calculateHallucinationTrend(metrics),
      performanceProfile: {
        p50: metrics.systemWide.latencyP50 || 0,
        p95: metrics.systemWide.latencyP95 || 0,
        p99: metrics.systemWide.latencyP99 || 0
      },
      trustIndicators: {
        score: metrics.systemWide.userTrustScore || 0,
        trend: this.calculateTrustTrend(metrics)
      }
    };
  }

  // Alert checking logic
  checkAlerts(metrics) {
    const alerts = [];

    // Check each threshold category
    ['critical', 'warning', 'info'].forEach(level => {
      Object.entries(this.alertThresholds[level]).forEach(([metric, config]) => {
        const value = this.getMetricValue(metrics, metric);
        if (this.checkThreshold(value, config)) {
          alerts.push({
            level,
            metric,
            value,
            threshold: config.threshold,
            message: this.generateAlertMessage(level, metric, value, config),
            timestamp: Date.now()
          });
        }
      });
    });

    return alerts.sort((a, b) =>
      this.getAlertPriority(b.level) - this.getAlertPriority(a.level)
    );
  }

  checkThreshold(value, config) {
    switch (config.operator) {
      case '>': return value > config.threshold;
      case '<': return value < config.threshold;
      case '>=': return value >= config.threshold;
      case '<=': return value <= config.threshold;
      case '==': return value === config.threshold;
      default: return false;
    }
  }

  generateAlertMessage(level, metric, value, config) {
    const messages = {
      hallucinationRate: `Hallucination rate at ${(value * 100).toFixed(1)}% (threshold: ${(config.threshold * 100)}%)`,
      systemHealth: `System health degraded to ${value}% (minimum: ${config.threshold}%)`,
      endToEndLatency: `High latency detected: ${value}ms (max: ${config.threshold}ms)`,
      blockedThreats: `Unusual threat activity: ${value} blocks in ${config.window}`,
      avgConfidence: `Low confidence detected: ${value.toFixed(2)} (minimum: ${config.threshold})`,
      cacheHitRate: `Cache performance low: ${(value * 100).toFixed(1)}% hits (expected: >${(config.threshold * 100)}%)`,
      exploratoryRate: `High uncertainty: ${(value * 100).toFixed(1)}% exploratory responses`
    };

    return messages[metric] || `${metric} alert: ${value} ${config.operator} ${config.threshold}`;
  }

  getAlertPriority(level) {
    const priorities = { critical: 3, warning: 2, info: 1 };
    return priorities[level] || 0;
  }

  // Cascade flow visualization data
  generateCascadeFlow(metrics) {
    const total = metrics.systemWide.cascadeFlow.input || 100;

    return {
      nodes: [
        { id: 'input', label: 'Incoming Claims', value: total },
        { id: 'cache_hit', label: 'Cache Hits', value: metrics.cacheLayer.hits || 0 },
        { id: 'field_protection', label: 'Field Protection', value: total - metrics.cacheLayer.hits },
        { id: 'blocked', label: 'Blocked', value: metrics.fieldProtection.blockedThreats || 0 },
        { id: 'verifier', label: 'Main Verifier', value: metrics.mainVerifier.verificationsRun || 0 },
        { id: 'verified', label: 'VERIFIED', value: metrics.mainVerifier.modeDistribution.VERIFIED.count || 0 },
        { id: 'likely', label: 'LIKELY', value: metrics.mainVerifier.modeDistribution.LIKELY.count || 0 },
        { id: 'hypothesis', label: 'HYPOTHESIS', value: metrics.mainVerifier.modeDistribution.HYPOTHESIS.count || 0 },
        { id: 'exploratory', label: 'EXPLORATORY', value: metrics.mainVerifier.modeDistribution.EXPLORATORY.count || 0 }
      ],
      links: [
        { source: 'input', target: 'cache_hit' },
        { source: 'input', target: 'field_protection' },
        { source: 'field_protection', target: 'blocked' },
        { source: 'field_protection', target: 'verifier' },
        { source: 'verifier', target: 'verified' },
        { source: 'verifier', target: 'likely' },
        { source: 'verifier', target: 'hypothesis' },
        { source: 'verifier', target: 'exploratory' }
      ]
    };
  }

  // Helper calculation methods
  calculateThreatBreakdown(metrics) {
    const threats = metrics.fieldProtection.breakdown.threatTypes;
    const total = Object.values(threats).reduce((sum, count) => sum + count, 0) || 1;

    return Object.entries(threats).map(([type, count]) => ({
      type,
      count,
      percentage: (count / total * 100).toFixed(1)
    }));
  }

  generateConfidenceHistogram(metrics) {
    const buckets = metrics.mainVerifier.confidenceBuckets;
    const total = Object.values(buckets).reduce((sum, count) => sum + count, 0) || 1;

    return Object.entries(buckets).map(([range, count]) => ({
      range,
      count,
      percentage: (count / total * 100).toFixed(1)
    }));
  }

  calculateMemoryEfficiency(metrics) {
    const memory = metrics.cacheLayer.memoryUsage || 0;
    const entries = metrics.cacheLayer.size || 1;
    return (memory / entries).toFixed(2); // KB per entry
  }

  calculateFingerprintEffectiveness(metrics) {
    const fingerprints = metrics.cacheLayer.threatFingerprints;
    const matched = fingerprints.matched || 0;
    const active = fingerprints.active || 1;
    return (matched / active * 100).toFixed(1);
  }

  calculateSystemHealth(metrics) {
    // Weighted health score
    const weights = {
      hallucinationRate: 0.3,
      avgConfidence: 0.25,
      cacheHitRate: 0.15,
      latency: 0.2,
      errors: 0.1
    };

    let health = 100;

    // Deduct for high hallucination rate
    health -= (metrics.systemWide.hallucinationRate || 0) * 100 * weights.hallucinationRate;

    // Deduct for low confidence
    health -= (1 - (metrics.mainVerifier.avgConfidence || 0.5)) * 100 * weights.avgConfidence;

    // Deduct for poor cache performance
    health -= (1 - (metrics.cacheLayer.hitRate || 0.5)) * 100 * weights.cacheHitRate;

    // Deduct for high latency
    const latencyPenalty = Math.min((metrics.systemWide.endToEndLatency || 0) / 1000, 1);
    health -= latencyPenalty * 100 * weights.latency;

    // Deduct for errors
    const errorRate = metrics.systemWide.errorRate || 0;
    health -= errorRate * 100 * weights.errors;

    return Math.max(0, Math.min(100, health));
  }

  calculateHallucinationTrend(metrics) {
    // Simple trend based on recent history
    const history = metrics.systemWide.hallucinationHistory || [];
    if (history.length < 2) return 'stable';

    const recent = history.slice(-5);
    const older = history.slice(-10, -5);

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    if (recentAvg > olderAvg * 1.1) return 'increasing';
    if (recentAvg < olderAvg * 0.9) return 'decreasing';
    return 'stable';
  }

  calculateTrustTrend(metrics) {
    const current = metrics.systemWide.userTrustScore || 0.5;
    const previous = metrics.systemWide.previousTrustScore || 0.5;

    if (current > previous + 0.05) return 'improving';
    if (current < previous - 0.05) return 'declining';
    return 'stable';
  }

  getMetricValue(metrics, metricName) {
    // Navigate nested metrics structure
    const path = metricName.split('.');
    let value = metrics;

    for (const key of path) {
      if (value && typeof value === 'object') {
        value = value[key];
      } else {
        return 0;
      }
    }

    return value || 0;
  }
}

// Real-time dashboard updater
class DashboardUpdater {
  constructor(schema, websocketServer) {
    this.schema = schema;
    this.ws = websocketServer;
    this.updateInterval = 1000; // 1 second
    this.historyWindow = 3600000; // 1 hour
    this.metricsHistory = [];
  }

  start() {
    setInterval(() => {
      const metrics = this.collectMetrics();
      const dashboardData = this.schema.generateDashboardData(metrics);

      // Store history
      this.metricsHistory.push({
        timestamp: Date.now(),
        data: dashboardData
      });

      // Trim old history
      const cutoff = Date.now() - this.historyWindow;
      this.metricsHistory = this.metricsHistory.filter(m => m.timestamp > cutoff);

      // Broadcast to all connected clients
      this.broadcast(dashboardData);

      // Check for alerts
      this.handleAlerts(dashboardData.alerts);

    }, this.updateInterval);
  }

  collectMetrics() {
    // Collect from all layers (integrate with actual cascade)
    return {
      fieldProtection: global.fieldProtectionMetrics || {},
      mainVerifier: global.verifierMetrics || {},
      cacheLayer: global.cacheMetrics || {},
      systemWide: global.systemMetrics || {}
    };
  }

  broadcast(data) {
    if (this.ws) {
      this.ws.clients.forEach(client => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(JSON.stringify({
            type: 'dashboard_update',
            data
          }));
        }
      });
    }
  }

  handleAlerts(alerts) {
    alerts.forEach(alert => {
      if (alert.level === 'critical') {
        this.sendCriticalAlert(alert);
      }

      // Log all alerts
      console.log(`[${alert.level.toUpperCase()}] ${alert.message}`);

      // Broadcast alert to dashboard
      this.broadcast({
        type: 'alert',
        alert
      });
    });
  }

  sendCriticalAlert(alert) {
    // Integration point for critical alerts (email, Slack, PagerDuty, etc.)
    console.error('CRITICAL ALERT:', alert.message);

    // Example: Send to monitoring service
    // monitoringService.alert({
    //   severity: 'critical',
    //   message: alert.message,
    //   metric: alert.metric,
    //   value: alert.value
    // });
  }

  getHistoricalData(window = 3600000) {
    const cutoff = Date.now() - window;
    return this.metricsHistory.filter(m => m.timestamp > cutoff);
  }

  generateReport() {
    const history = this.getHistoricalData();

    return {
      period: '1 hour',
      summary: {
        totalClaims: history.reduce((sum, h) =>
          sum + (h.data.layers.systemWide.cascadeFlow.input || 0), 0),
        avgHallucinationRate: this.average(history.map(h =>
          h.data.layers.systemWide.hallucinationRate || 0)),
        avgConfidence: this.average(history.map(h =>
          h.data.layers.mainVerifier.avgConfidence || 0)),
        cacheEfficiency: this.average(history.map(h =>
          h.data.layers.cacheLayer.hitRate || 0)),
        totalThreatsBlocked: history.reduce((sum, h) =>
          sum + (h.data.layers.fieldProtection.blockedThreats || 0), 0)
      },
      alerts: {
        critical: history.flatMap(h => h.data.alerts)
          .filter(a => a.level === 'critical').length,
        warning: history.flatMap(h => h.data.alerts)
          .filter(a => a.level === 'warning').length,
        info: history.flatMap(h => h.data.alerts)
          .filter(a => a.level === 'info').length
      },
      recommendations: this.generateRecommendations(history)
    };
  }

  average(arr) {
    return arr.reduce((a, b) => a + b, 0) / (arr.length || 1);
  }

  generateRecommendations(history) {
    const recommendations = [];

    // Analyze patterns
    const avgHallucination = this.average(history.map(h =>
      h.data.layers.systemWide.hallucinationRate || 0));

    if (avgHallucination > 0.05) {
      recommendations.push({
        priority: 'high',
        action: 'Increase Field DB seeding for common queries',
        reason: `Hallucination rate ${(avgHallucination * 100).toFixed(1)}% exceeds target`
      });
    }

    const avgCacheHit = this.average(history.map(h =>
      h.data.layers.cacheLayer.hitRate || 0));

    if (avgCacheHit < 0.4) {
      recommendations.push({
        priority: 'medium',
        action: 'Increase cache TTLs for VERIFIED responses',
        reason: `Cache hit rate ${(avgCacheHit * 100).toFixed(1)}% is suboptimal`
      });
    }

    return recommendations;
  }
}

module.exports = { DashboardSchema, DashboardUpdater };