// ARIA Integration Cascade - Complete Implementation
// Ties protection, verification, and caching into a unified flow

const crypto = require('crypto');
const EventEmitter = require('events');

class ARIAIntegrationCascade extends EventEmitter {
  constructor(fieldProtection, verifier, cache, auditLogger) {
    super();
    this.fieldProtection = fieldProtection;
    this.verifier = verifier;
    this.cache = cache;
    this.auditLogger = auditLogger;

    // Performance tracking
    this.metrics = {
      totalClaims: 0,
      cacheHits: 0,
      threatsBlocked: 0,
      verificationsRun: 0,
      avgLatency: 0,
      modeDistribution: {
        VERIFIED: 0,
        LIKELY: 0,
        HYPOTHESIS: 0,
        EXPLORATORY: 0,
        BLOCKED: 0
      }
    };

    // Threat fingerprint memory
    this.threatFingerprints = new Map();
    this.threatDecayInterval = 3600000; // 1 hour

    // Start decay timer
    this.startThreatDecay();
  }

  async processClaim(claim, context) {
    const startTime = Date.now();
    this.metrics.totalClaims++;

    const claimHash = this.hashClaim(claim);
    const requestId = context.requestId || crypto.randomUUID();

    // Emit for real-time monitoring
    this.emit('claim_received', { claim, context, requestId });

    try {
      // Step 0: Check threat fingerprints
      if (this.isThreatFingerprint(claimHash)) {
        const blockedResult = this.createBlockedResponse(claim, 'Known threat pattern');
        this.metrics.threatsBlocked++;
        this.metrics.modeDistribution.BLOCKED++;

        await this.logResult(requestId, 'blocked_threat', blockedResult);
        return blockedResult;
      }

      // Step 1: Cache check
      const cached = await this.cache.get(claimHash, context);
      if (cached && !this.isStale(cached)) {
        this.metrics.cacheHits++;

        // Update cache hit metrics
        this.emit('cache_hit', { claimHash, cached, requestId });
        await this.logResult(requestId, 'cache_hit', cached);

        return { ...cached, source: 'cache', latency: Date.now() - startTime };
      }

      // Step 2: Field Protection Layer
      const protection = await this.fieldProtection.analyze(claim, context);

      if (protection.threatDetected) {
        // Add to threat fingerprints
        this.addThreatFingerprint(claimHash, protection.threatType);
        this.metrics.threatsBlocked++;
        this.metrics.modeDistribution.BLOCKED++;

        // Cache the threat detection
        await this.cache.store(claimHash, protection, { ttl: 60, type: 'threat' });

        this.emit('threat_detected', { claim, protection, requestId });
        await this.logResult(requestId, 'field_protection_block', protection);

        return protection;
      }

      // Step 3: Main Verifier Layer
      this.metrics.verificationsRun++;
      const verification = await this.verifier.verify(claim, context);

      // Step 4: Apply protection caps to confidence
      const finalConfidence = Math.min(
        verification.confidence,
        protection.maxAllowedConfidence || 1.0
      );

      // Step 5: Sacred space extra caution
      if (context.sacredMode && finalConfidence < 0.95) {
        verification.mode = 'RITUAL_SAFE';
        verification.response = this.toRitualSafe(claim);
      }

      // Step 6: Assign final mode
      const mode = this.assignMode(finalConfidence, context);
      this.metrics.modeDistribution[mode]++;

      // Step 7: Apply confidence governor transformations
      const governed = await this.applyGovernor(claim, verification, mode, context);

      // Step 8: Build final result
      const result = {
        claim: governed.response || claim,
        verified: finalConfidence > 0.5,
        confidence: finalConfidence,
        mode,
        sources: verification.sources || [],
        protection: {
          dampening: protection.dampening,
          diversity: protection.sourceDiversity,
          category: protection.category
        },
        transformations: governed.transformations,
        latency: Date.now() - startTime,
        requestId
      };

      // Step 9: Cache with mode-appropriate TTL
      const ttl = this.getTTLForMode(mode);
      await this.cache.store(claimHash, result, { ttl, type: 'verification' });

      // Step 10: Emit metrics and log
      this.updateMetrics(result.latency);
      this.emit('claim_processed', { result, requestId });
      await this.logResult(requestId, 'verification_complete', result);

      return result;

    } catch (error) {
      // Error handling with graceful degradation
      console.error('Cascade error:', error);

      const fallbackResult = {
        claim,
        verified: false,
        confidence: 0,
        mode: 'EXPLORATORY',
        error: 'Processing error - defaulting to exploration mode',
        latency: Date.now() - startTime,
        requestId
      };

      this.emit('processing_error', { error, claim, requestId });
      await this.logResult(requestId, 'error', { error: error.message });

      return fallbackResult;
    }
  }

  // Mode assignment based on confidence and context
  assignMode(confidence, context) {
    // Risk-adjusted thresholds
    const thresholds = this.getRiskAdjustedThresholds(context);

    if (confidence >= thresholds.verified) return 'VERIFIED';
    if (confidence >= thresholds.likely) return 'LIKELY';
    if (confidence >= thresholds.hypothesis) return 'HYPOTHESIS';
    return 'EXPLORATORY';
  }

  getRiskAdjustedThresholds(context) {
    const riskLevel = context.riskLevel || 'normal';

    const thresholds = {
      sacred: { verified: 0.95, likely: 0.9, hypothesis: 0.85 },
      personal: { verified: 0.85, likely: 0.75, hypothesis: 0.6 },
      advice: { verified: 0.75, likely: 0.65, hypothesis: 0.5 },
      creative: { verified: 0.6, likely: 0.45, hypothesis: 0.3 },
      normal: { verified: 0.8, likely: 0.7, hypothesis: 0.5 }
    };

    return thresholds[riskLevel] || thresholds.normal;
  }

  // Governor transformations based on mode
  async applyGovernor(claim, verification, mode, context) {
    const transformations = [];

    switch (mode) {
      case 'VERIFIED':
        return { response: claim, transformations: ['none'] };

      case 'LIKELY':
        transformations.push('hedging');
        return {
          response: `Based on available evidence, ${claim}`,
          transformations
        };

      case 'HYPOTHESIS':
        transformations.push('hypothesis_framing');
        return {
          response: `This appears to be the case: ${claim}, though I'd recommend verifying`,
          transformations
        };

      case 'EXPLORATORY':
        transformations.push('question_transformation');
        return {
          response: `Let's explore this together: could it be that ${claim}?`,
          transformations
        };

      case 'RITUAL_SAFE':
        transformations.push('sacred_mirror');
        return {
          response: `What does your tradition teach about this?`,
          transformations
        };

      default:
        return { response: claim, transformations: ['unknown_mode'] };
    }
  }

  // Threat fingerprint management
  addThreatFingerprint(hash, threatType) {
    this.threatFingerprints.set(hash, {
      type: threatType,
      timestamp: Date.now(),
      count: (this.threatFingerprints.get(hash)?.count || 0) + 1
    });
  }

  isThreatFingerprint(hash) {
    const fingerprint = this.threatFingerprints.get(hash);
    if (!fingerprint) return false;

    // Check if still valid (within decay window)
    const age = Date.now() - fingerprint.timestamp;
    return age < this.threatDecayInterval;
  }

  startThreatDecay() {
    setInterval(() => {
      const now = Date.now();
      for (const [hash, fingerprint] of this.threatFingerprints.entries()) {
        if (now - fingerprint.timestamp > this.threatDecayInterval) {
          this.threatFingerprints.delete(hash);
        }
      }
    }, 60000); // Check every minute
  }

  // Cache TTL based on verification mode
  getTTLForMode(mode) {
    const ttlMap = {
      VERIFIED: 900,      // 15 minutes
      LIKELY: 600,        // 10 minutes
      HYPOTHESIS: 300,    // 5 minutes
      EXPLORATORY: 180,   // 3 minutes
      BLOCKED: 60,        // 1 minute
      RITUAL_SAFE: 120    // 2 minutes
    };

    return ttlMap[mode] || 300;
  }

  isStale(cached) {
    if (!cached.timestamp) return true;

    const age = Date.now() - cached.timestamp;
    const maxAge = this.getTTLForMode(cached.mode) * 1000;

    return age > maxAge;
  }

  createBlockedResponse(claim, reason) {
    return {
      claim,
      verified: false,
      confidence: 0,
      mode: 'BLOCKED',
      reason,
      message: 'This query pattern has been flagged. Please rephrase or try a different approach.',
      timestamp: Date.now()
    };
  }

  toRitualSafe(claim) {
    const templates = [
      'What does your spiritual tradition say about this?',
      'How have you experienced this in your practice?',
      'What wisdom guides you here?',
      'Shall we explore this through your spiritual lens?'
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  hashClaim(claim) {
    return crypto
      .createHash('sha256')
      .update(claim.toLowerCase().trim())
      .digest('hex')
      .substring(0, 16);
  }

  // Metrics and monitoring
  updateMetrics(latency) {
    const alpha = 0.1; // Exponential moving average factor
    this.metrics.avgLatency = this.metrics.avgLatency * (1 - alpha) + latency * alpha;
  }

  async logResult(requestId, action, result) {
    if (this.auditLogger) {
      await this.auditLogger.log({
        requestId,
        action,
        timestamp: Date.now(),
        result: {
          mode: result.mode,
          confidence: result.confidence,
          latency: result.latency
        }
      });
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      cacheHitRate: this.metrics.cacheHits / Math.max(this.metrics.totalClaims, 1),
      threatBlockRate: this.metrics.threatsBlocked / Math.max(this.metrics.totalClaims, 1),
      verificationRate: this.metrics.verificationsRun / Math.max(this.metrics.totalClaims, 1),
      threatFingerprintCount: this.threatFingerprints.size
    };
  }

  // Alert thresholds monitoring
  checkAlertThresholds() {
    const metrics = this.getMetrics();
    const alerts = [];

    // High threat rate alert
    if (metrics.threatBlockRate > 0.1) { // > 10% threats
      alerts.push({
        level: 'WARNING',
        message: `High threat rate detected: ${(metrics.threatBlockRate * 100).toFixed(1)}%`,
        metric: 'threat_rate'
      });
    }

    // Low cache hit rate (performance issue)
    if (metrics.cacheHitRate < 0.3 && metrics.totalClaims > 100) {
      alerts.push({
        level: 'INFO',
        message: `Low cache hit rate: ${(metrics.cacheHitRate * 100).toFixed(1)}%`,
        metric: 'cache_rate'
      });
    }

    // High latency alert
    if (metrics.avgLatency > 500) { // > 500ms
      alerts.push({
        level: 'WARNING',
        message: `High average latency: ${metrics.avgLatency.toFixed(0)}ms`,
        metric: 'latency'
      });
    }

    // Too many exploratories (low confidence)
    const exploratoryRate = metrics.modeDistribution.EXPLORATORY / Math.max(metrics.totalClaims, 1);
    if (exploratoryRate > 0.3) {
      alerts.push({
        level: 'INFO',
        message: `High exploratory rate: ${(exploratoryRate * 100).toFixed(1)}%`,
        metric: 'exploratory_rate'
      });
    }

    return alerts;
  }
}

// Cache implementation with TTL and type management
class IntegrationCache {
  constructor() {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0
    };

    // Start cleanup interval
    setInterval(() => this.cleanup(), 30000); // Every 30 seconds
  }

  async get(key, context) {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      this.stats.evictions++;
      this.stats.misses++;
      return null;
    }

    // Check context compatibility (e.g., same user in personal mode)
    if (entry.context && !this.isContextCompatible(entry.context, context)) {
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.data;
  }

  async store(key, data, options = {}) {
    const ttl = options.ttl || 300; // Default 5 minutes
    const type = options.type || 'general';

    this.cache.set(key, {
      data: { ...data, timestamp: Date.now() },
      expiry: Date.now() + (ttl * 1000),
      type,
      context: options.context
    });
  }

  isContextCompatible(stored, current) {
    // Personal/sacred modes should not share cache across users
    if (stored.userId && current.userId && stored.userId !== current.userId) {
      return false;
    }

    // Sacred mode cache should not be used in non-sacred contexts
    if (stored.sacredMode && !current.sacredMode) {
      return false;
    }

    return true;
  }

  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.stats.evictions += cleaned;
    }
  }

  getStats() {
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: this.stats.hits / Math.max(this.stats.hits + this.stats.misses, 1)
    };
  }

  clear() {
    this.cache.clear();
    this.stats.evictions += this.cache.size;
  }
}

module.exports = { ARIAIntegrationCascade, IntegrationCache };