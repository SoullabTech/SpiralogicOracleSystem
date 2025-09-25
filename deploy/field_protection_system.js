// Field Protection System - Defense Against Frequency Poisoning
// Prevents quantity from overriding quality in ARIA's collective intelligence

class FieldProtectionSystem {
  constructor() {
    // Configuration thresholds
    this.config = {
      minSourcesForHighConfidence: 3,
      suspiciousRepetitionThreshold: 50,
      rapidRepetitionWindow: 3600000, // 1 hour in ms
      decayHalfLife: 86400000, // 24 hours in ms
      contradictionPenalty: 0.5,
      maxConfidenceFromFrequency: 0.7,
      poisoningPatternThreshold: 0.95
    };

    // Track claims and their metadata
    this.claimRegistry = new Map();

    // Known trusted facts for contradiction checking
    this.trustedFacts = new Set([
      "the sky is blue",
      "water boils at 100 celsius at sea level",
      "earth orbits the sun",
      "2 + 2 = 4"
    ]);
  }

  // 1. LOGARITHMIC DAMPENING - Prevents frequency exploitation
  calculateFrequencyConfidence(frequency) {
    if (frequency <= 0) return 0;

    // Logarithmic scaling: 10x frequency ≠ 10x confidence
    // log10(1) = 0, log10(10) = 1, log10(100) = 2, log10(1000) = 3
    const logScale = Math.log10(frequency + 1);
    const maxLog = Math.log10(10000); // After 10k, minimal gain

    // Normalize to 0-1 range, capped at maxConfidence
    let confidence = Math.min(logScale / maxLog, 1.0);
    confidence = Math.min(confidence, this.config.maxConfidenceFromFrequency);

    return confidence;
  }

  // 2. SOURCE DIVERSITY - Requires multiple independent confirmations
  calculateSourceDiversity(sources) {
    if (!sources || sources.length === 0) return 0;

    // Unique sources matter more than total mentions
    const uniqueSources = new Set(sources.map(s => s.userId || s.id));
    const uniqueCount = uniqueSources.size;

    // Diversity score based on unique sources
    if (uniqueCount === 1) return 0.3;  // Single source = low confidence
    if (uniqueCount === 2) return 0.6;  // Two sources = medium
    if (uniqueCount >= 3) return 0.9;   // Three+ = high confidence

    // Bonus for many diverse sources
    if (uniqueCount >= 5) return 1.0;

    return 0.5; // Default medium confidence
  }

  // 3. TEMPORAL DECAY - Recent spam weighs less than established truth
  applyTemporalDecay(claim, timestamp) {
    const now = Date.now();
    const age = now - timestamp;

    // Exponential decay: newer claims have less weight
    // Half-life determines how fast confidence decays
    const decayFactor = Math.pow(0.5, age / this.config.decayHalfLife);

    // Invert for confidence: older established facts = higher confidence
    const stabilityBonus = 1 - decayFactor;

    // Recent rapid repetition = suspicious
    if (age < this.config.rapidRepetitionWindow) {
      const rapidRepetitions = this.countRecentRepetitions(claim, timestamp);
      if (rapidRepetitions > this.config.suspiciousRepetitionThreshold) {
        return 0.1; // Massive penalty for spam patterns
      }
    }

    return 0.5 + (stabilityBonus * 0.5); // 0.5 to 1.0 range
  }

  // 4. CONTRADICTION DETECTION - Check against known truths
  detectContradictions(claim) {
    const claimLower = claim.toLowerCase();
    const contradictions = [];

    // Check direct contradictions
    if (claimLower.includes("sky") && claimLower.includes("green")) {
      if (this.trustedFacts.has("the sky is blue")) {
        contradictions.push({
          type: 'direct',
          trusted: "the sky is blue",
          claim: claim,
          severity: 'high'
        });
      }
    }

    // Check mathematical contradictions
    const mathPattern = /(\d+)\s*\+\s*(\d+)\s*=\s*(\d+)/;
    const mathMatch = claimLower.match(mathPattern);
    if (mathMatch) {
      const num1 = parseInt(mathMatch[1]);
      const num2 = parseInt(mathMatch[2]);
      const result = parseInt(mathMatch[3]);
      if (num1 + num2 !== result) {
        contradictions.push({
          type: 'mathematical',
          expected: num1 + num2,
          claimed: result,
          severity: 'critical'
        });
      }
    }

    // Check logical contradictions
    if (claimLower.includes("always") && claimLower.includes("never")) {
      contradictions.push({
        type: 'logical',
        reason: 'contains both always and never',
        severity: 'medium'
      });
    }

    return contradictions;
  }

  // 5. POISONING PATTERN DETECTION
  detectPoisoningPatterns(claimHistory) {
    if (!claimHistory || claimHistory.length < 5) return false;

    // Check for repetitive patterns
    const recentClaims = claimHistory.slice(-20);
    const uniqueClaims = new Set(recentClaims.map(c => c.text));

    // High repetition ratio = likely poisoning
    const repetitionRatio = 1 - (uniqueClaims.size / recentClaims.length);
    if (repetitionRatio > this.config.poisoningPatternThreshold) {
      return {
        detected: true,
        pattern: 'excessive_repetition',
        ratio: repetitionRatio
      };
    }

    // Check for incremental poisoning (gradual semantic drift)
    const semanticDrift = this.detectSemanticDrift(recentClaims);
    if (semanticDrift.detected) {
      return {
        detected: true,
        pattern: 'semantic_drift',
        drift: semanticDrift
      };
    }

    return { detected: false };
  }

  // Detect gradual corruption attempts
  detectSemanticDrift(claims) {
    if (!claims || claims.length < 3) return { detected: false };

    // Check if claims progressively drift from truth
    let driftScore = 0;
    for (let i = 1; i < claims.length; i++) {
      // Ensure both claims have text property
      const text1 = claims[i-1].text || claims[i-1];
      const text2 = claims[i].text || claims[i];

      if (typeof text1 === 'string' && typeof text2 === 'string') {
        const similarity = this.calculateSimilarity(text1, text2);
        if (similarity > 0.8 && similarity < 0.95) {
          driftScore += 0.1; // Slight changes = potential drift
        }
      }
    }

    return {
      detected: driftScore > 0.3,
      score: driftScore
    };
  }

  // MAIN VALIDATION FUNCTION
  validateClaim(claim, metadata = {}) {
    const {
      text,
      frequency = 1,
      sources = [],
      timestamp = Date.now(),
      category = 'general',
      userId
    } = { text: claim, ...metadata };

    // Initialize claim record if new
    if (!this.claimRegistry.has(text)) {
      this.claimRegistry.set(text, {
        firstSeen: timestamp,
        occurrences: [],
        sources: new Set(),
        flags: []
      });
    }

    const claimRecord = this.claimRegistry.get(text);
    claimRecord.occurrences.push({ timestamp, userId });
    if (userId) claimRecord.sources.add(userId);

    // Calculate multi-factor confidence
    const factors = {
      frequency: this.calculateFrequencyConfidence(frequency),
      diversity: this.calculateSourceDiversity(sources),
      temporal: this.applyTemporalDecay(text, claimRecord.firstSeen),
      contradictions: this.detectContradictions(text),
      poisoning: this.detectPoisoningPatterns(claimRecord.occurrences)
    };

    // Apply penalties
    let finalConfidence = factors.frequency * 0.2 +
                         factors.diversity * 0.3 +
                         factors.temporal * 0.2;

    // Contradiction penalty
    if (factors.contradictions.length > 0) {
      finalConfidence *= this.config.contradictionPenalty;
      claimRecord.flags.push({
        type: 'contradiction',
        details: factors.contradictions,
        timestamp
      });
    }

    // Poisoning pattern penalty
    if (factors.poisoning.detected) {
      finalConfidence *= 0.1; // Massive reduction
      claimRecord.flags.push({
        type: 'poisoning_attempt',
        pattern: factors.poisoning.pattern,
        timestamp
      });
    }

    // Category-specific adjustments
    const categoryMultipliers = {
      'sacred': 1.5,      // Requires higher confidence
      'medical': 1.5,     // Critical accuracy needed
      'financial': 1.5,   // High stakes
      'creative': 0.5,    // Lower bar for creative content
      'exploratory': 0.3  // Speculation allowed
    };

    if (categoryMultipliers[category]) {
      const requiredConfidence = 0.7 * categoryMultipliers[category];
      if (finalConfidence < requiredConfidence) {
        finalConfidence *= 0.5; // Further reduction if below threshold
      }
    }

    // Build validation result
    const result = {
      claim: text,
      confidence: Math.min(Math.max(finalConfidence, 0), 1), // Clamp 0-1
      status: this.getStatus(finalConfidence),
      factors,
      flags: claimRecord.flags,
      recommendations: this.getRecommendations(factors, finalConfidence),
      metadata: {
        totalOccurrences: claimRecord.occurrences.length,
        uniqueSources: claimRecord.sources.size,
        firstSeen: claimRecord.firstSeen,
        category
      }
    };

    return result;
  }

  // Helper: Calculate text similarity (simplified)
  calculateSimilarity(text1, text2) {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size; // Jaccard similarity
  }

  // Helper: Count recent repetitions
  countRecentRepetitions(claim, since) {
    const record = this.claimRegistry.get(claim);
    if (!record) return 0;

    return record.occurrences.filter(o => o.timestamp >= since).length;
  }

  // Helper: Determine claim status
  getStatus(confidence) {
    if (confidence >= 0.8) return 'verified';
    if (confidence >= 0.6) return 'likely';
    if (confidence >= 0.4) return 'uncertain';
    if (confidence >= 0.2) return 'doubtful';
    return 'rejected';
  }

  // Helper: Generate recommendations
  getRecommendations(factors, confidence) {
    const recs = [];

    if (factors.poisoning.detected) {
      recs.push('ALERT: Potential poisoning attempt detected. Manual review required.');
    }

    if (factors.contradictions.length > 0) {
      recs.push('Contradicts established facts. Verify before accepting.');
    }

    if (factors.diversity < 0.5) {
      recs.push('Needs confirmation from additional independent sources.');
    }

    if (confidence < 0.3) {
      recs.push('Low confidence. Consider rejecting or marking as speculation.');
    }

    if (confidence > 0.8 && factors.temporal > 0.9) {
      recs.push('High confidence established fact. Safe to use.');
    }

    return recs;
  }

  // External verification interface (stub for integration)
  async externalVerify(claim) {
    // This would connect to external knowledge bases
    // For now, return a mock response
    return {
      verified: false,
      confidence: 0.5,
      sources: [],
      note: 'External verification not yet implemented'
    };
  }

  // Get field health metrics
  getFieldHealth() {
    const stats = {
      totalClaims: this.claimRegistry.size,
      flaggedClaims: 0,
      poisoningAttempts: 0,
      contradictions: 0,
      averageConfidence: 0
    };

    let confidenceSum = 0;
    for (const [claim, record] of this.claimRegistry) {
      if (record.flags.length > 0) stats.flaggedClaims++;

      record.flags.forEach(flag => {
        if (flag.type === 'poisoning_attempt') stats.poisoningAttempts++;
        if (flag.type === 'contradiction') stats.contradictions++;
      });

      // Calculate current confidence
      const validation = this.validateClaim(claim);
      confidenceSum += validation.confidence;
    }

    stats.averageConfidence = confidenceSum / Math.max(this.claimRegistry.size, 1);

    return stats;
  }
}

// Export for use in ARIA
module.exports = FieldProtectionSystem;

// Example usage and testing
if (require.main === module) {
  const protector = new FieldProtectionSystem();

  console.log('Testing Field Protection System\n');

  // Test 1: Normal claim
  console.log('Test 1: Normal claim');
  const normal = protector.validateClaim('The sun rises in the east', {
    frequency: 10,
    sources: [{userId: 'user1'}, {userId: 'user2'}, {userId: 'user3'}],
    category: 'general'
  });
  console.log('Result:', normal.status, `(${(normal.confidence * 100).toFixed(1)}%)`);
  console.log('');

  // Test 2: Frequency poisoning attempt
  console.log('Test 2: Frequency poisoning attempt');
  const poisoned = protector.validateClaim('The sky is green', {
    frequency: 1000,
    sources: [{userId: 'attacker'}],
    category: 'general'
  });
  console.log('Result:', poisoned.status, `(${(poisoned.confidence * 100).toFixed(1)}%)`);
  console.log('Flags:', poisoned.flags);
  console.log('');

  // Test 3: Contradiction detection
  console.log('Test 3: Contradiction detection');
  const contradiction = protector.validateClaim('2 + 2 = 5', {
    frequency: 50,
    sources: [{userId: 'user1'}, {userId: 'user2'}],
    category: 'mathematical'
  });
  console.log('Result:', contradiction.status, `(${(contradiction.confidence * 100).toFixed(1)}%)`);
  console.log('Contradictions:', contradiction.factors.contradictions);
  console.log('');

  // Test 4: Sacred category (high stakes)
  console.log('Test 4: Sacred category claim');
  const sacred = protector.validateClaim('This is absolute truth', {
    frequency: 20,
    sources: [{userId: 'user1'}, {userId: 'user2'}],
    category: 'sacred'
  });
  console.log('Result:', sacred.status, `(${(sacred.confidence * 100).toFixed(1)}%)`);
  console.log('Recommendations:', sacred.recommendations);
  console.log('');

  // Test 5: Field health check
  console.log('Field Health Metrics:');
  console.log(protector.getFieldHealth());
}