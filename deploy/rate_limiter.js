// Rate Limiter for ARIA Field Protection
// Prevents rapid-fire and coordinated flooding attacks

class RateLimiter {
  constructor() {
    // User-specific rate tracking
    this.userWindows = new Map(); // userId → array of timestamps

    // Global rate tracking for coordinated attack detection
    this.globalWindow = [];

    // Claim pattern tracking
    this.claimPatterns = new Map(); // claimHash → array of {userId, timestamp}

    // Configuration
    this.config = {
      userRateLimit: 10,        // Max similar claims per user per minute
      globalRateLimit: 100,      // Max similar claims globally per minute
      windowDuration: 60000,     // 1 minute in milliseconds
      blockDuration: 300000,     // 5 minute block for violations
      suspiciousThreshold: 5,   // Rapid submissions to trigger monitoring
      cleanupInterval: 60000     // Clean old entries every minute
    };

    // Blocked users/IPs
    this.blockedUsers = new Map(); // userId → blockUntilTimestamp

    // Start cleanup interval
    this.startCleanup();
  }

  // Main rate limit check
  checkRapidFire(userId, claim, timestamp = Date.now()) {
    // Check if user is blocked
    if (this.isUserBlocked(userId)) {
      return {
        blocked: true,
        reason: 'user_temporarily_blocked',
        unblockAt: this.blockedUsers.get(userId),
        severity: 'high'
      };
    }

    const claimHash = this.hashClaim(claim);

    // Initialize user window if needed
    if (!this.userWindows.has(userId)) {
      this.userWindows.set(userId, []);
    }

    // Initialize claim pattern tracking
    if (!this.claimPatterns.has(claimHash)) {
      this.claimPatterns.set(claimHash, []);
    }

    // Get user's recent submissions
    const userSubmissions = this.userWindows.get(userId);
    const recentUserSubmissions = this.getRecentSubmissions(userSubmissions, timestamp);

    // Check user rate limit
    const userViolation = this.checkUserRate(recentUserSubmissions, claimHash, timestamp);
    if (userViolation.violated) {
      this.blockUser(userId, timestamp);
      return {
        blocked: true,
        reason: 'user_rate_limit_exceeded',
        details: userViolation,
        severity: 'high'
      };
    }

    // Check global rate limit
    const globalViolation = this.checkGlobalRate(claimHash, timestamp);
    if (globalViolation.violated) {
      return {
        blocked: true,
        reason: 'global_rate_limit_exceeded',
        details: globalViolation,
        severity: 'critical'
      };
    }

    // Check for suspicious patterns
    const suspiciousPattern = this.detectSuspiciousPatterns(userId, claimHash, recentUserSubmissions);
    if (suspiciousPattern.detected) {
      return {
        blocked: true,
        reason: 'suspicious_pattern_detected',
        pattern: suspiciousPattern,
        severity: 'medium'
      };
    }

    // Log this submission
    this.logSubmission(userId, claimHash, timestamp);

    return {
      blocked: false,
      userRate: recentUserSubmissions.length,
      globalRate: this.getGlobalRate(timestamp),
      risk: this.calculateRiskScore(userId, claimHash, timestamp)
    };
  }

  // Check user-specific rate limits
  checkUserRate(submissions, claimHash, timestamp) {
    // Count similar claims in recent window
    const similarClaims = submissions.filter(s =>
      s.hash === claimHash &&
      (timestamp - s.timestamp) < this.config.windowDuration
    );

    if (similarClaims.length >= this.config.userRateLimit) {
      return {
        violated: true,
        count: similarClaims.length,
        limit: this.config.userRateLimit,
        timeWindow: this.config.windowDuration
      };
    }

    // Check rapid succession (multiple claims within seconds)
    const veryRecent = submissions.filter(s =>
      (timestamp - s.timestamp) < 5000 // 5 seconds
    );

    if (veryRecent.length >= this.config.suspiciousThreshold) {
      return {
        violated: true,
        rapidFire: true,
        burstCount: veryRecent.length,
        burstWindow: 5000
      };
    }

    return { violated: false };
  }

  // Check global rate limits
  checkGlobalRate(claimHash, timestamp) {
    const patterns = this.claimPatterns.get(claimHash) || [];
    const recentGlobal = patterns.filter(p =>
      (timestamp - p.timestamp) < this.config.windowDuration
    );

    if (recentGlobal.length >= this.config.globalRateLimit) {
      // Check if it's a coordinated attack (multiple users)
      const uniqueUsers = new Set(recentGlobal.map(p => p.userId));
      const coordination = uniqueUsers.size > 5;

      return {
        violated: true,
        count: recentGlobal.length,
        limit: this.config.globalRateLimit,
        uniqueUsers: uniqueUsers.size,
        coordinated: coordination
      };
    }

    return { violated: false };
  }

  // Detect suspicious patterns beyond simple rate limits
  detectSuspiciousPatterns(userId, claimHash, submissions) {
    const patterns = {
      detected: false,
      types: []
    };

    // Pattern 1: Gradually increasing rate (warming up attack)
    const rateProgression = this.analyzeRateProgression(submissions);
    if (rateProgression.increasing && rateProgression.acceleration > 2) {
      patterns.detected = true;
      patterns.types.push({
        type: 'warming_attack',
        acceleration: rateProgression.acceleration
      });
    }

    // Pattern 2: Rotating through claims (carousel attack)
    const rotation = this.detectRotation(userId);
    if (rotation.detected) {
      patterns.detected = true;
      patterns.types.push({
        type: 'carousel_attack',
        uniqueClaims: rotation.uniqueClaims,
        rotationPeriod: rotation.period
      });
    }

    // Pattern 3: Synchronized with other users (botnet behavior)
    const synchronization = this.detectSynchronization(claimHash, userId);
    if (synchronization.detected) {
      patterns.detected = true;
      patterns.types.push({
        type: 'synchronized_attack',
        correlatedUsers: synchronization.users,
        correlation: synchronization.score
      });
    }

    return patterns;
  }

  // Analyze if submission rate is increasing
  analyzeRateProgression(submissions) {
    if (submissions.length < 3) {
      return { increasing: false, acceleration: 0 };
    }

    // Calculate time intervals between submissions
    const intervals = [];
    for (let i = 1; i < submissions.length; i++) {
      intervals.push(submissions[i].timestamp - submissions[i-1].timestamp);
    }

    // Check if intervals are decreasing (rate increasing)
    let decreasing = 0;
    for (let i = 1; i < intervals.length; i++) {
      if (intervals[i] < intervals[i-1] * 0.9) {
        decreasing++;
      }
    }

    const acceleration = decreasing / Math.max(intervals.length - 1, 1);
    return {
      increasing: acceleration > 0.5,
      acceleration: acceleration * 10 // Scale for readability
    };
  }

  // Detect rotation through different claims
  detectRotation(userId) {
    const userSubmissions = this.userWindows.get(userId) || [];
    if (userSubmissions.length < 10) {
      return { detected: false };
    }

    const recent = userSubmissions.slice(-20);
    const hashes = recent.map(s => s.hash);
    const uniqueHashes = new Set(hashes);

    // If cycling through many different claims rapidly
    if (uniqueHashes.size > 5 && recent.length > 15) {
      // Check for pattern repetition
      const pattern = this.findRepeatingPattern(hashes);
      if (pattern.found) {
        return {
          detected: true,
          uniqueClaims: uniqueHashes.size,
          period: pattern.length
        };
      }
    }

    return { detected: false };
  }

  // Detect synchronized attacks from multiple users
  detectSynchronization(claimHash, userId) {
    const patterns = this.claimPatterns.get(claimHash) || [];
    const recent = patterns.filter(p =>
      Date.now() - p.timestamp < 10000 // Last 10 seconds
    );

    if (recent.length < 5) {
      return { detected: false };
    }

    // Group by timestamp buckets (1 second windows)
    const buckets = new Map();
    recent.forEach(p => {
      const bucket = Math.floor(p.timestamp / 1000);
      if (!buckets.has(bucket)) {
        buckets.set(bucket, []);
      }
      buckets.get(bucket).push(p.userId);
    });

    // Check for synchronized submissions
    for (const [bucket, users] of buckets) {
      const uniqueUsers = new Set(users);
      if (uniqueUsers.size >= 3 && users.length >= 5) {
        return {
          detected: true,
          users: Array.from(uniqueUsers),
          score: users.length / uniqueUsers.size
        };
      }
    }

    return { detected: false };
  }

  // Find repeating patterns in array
  findRepeatingPattern(arr) {
    if (arr.length < 4) return { found: false };

    for (let len = 2; len <= Math.floor(arr.length / 2); len++) {
      const pattern = arr.slice(0, len).join(',');
      const repeated = arr.slice(len, len * 2).join(',');

      if (pattern === repeated) {
        return { found: true, length: len, pattern };
      }
    }

    return { found: false };
  }

  // Calculate overall risk score
  calculateRiskScore(userId, claimHash, timestamp) {
    let riskScore = 0;

    // Factor 1: User submission rate
    const userSubmissions = this.userWindows.get(userId) || [];
    const recentUser = this.getRecentSubmissions(userSubmissions, timestamp);
    riskScore += Math.min(recentUser.length / this.config.userRateLimit, 1) * 0.3;

    // Factor 2: Global submission rate
    const globalRate = this.getGlobalRate(timestamp);
    riskScore += Math.min(globalRate / this.config.globalRateLimit, 1) * 0.3;

    // Factor 3: User history (repeat offender?)
    const userHistory = this.getUserViolationHistory(userId);
    riskScore += Math.min(userHistory / 5, 1) * 0.2;

    // Factor 4: Claim complexity (simple claims = higher risk)
    const complexity = this.assessClaimComplexity(claimHash);
    riskScore += (1 - complexity) * 0.2;

    return Math.min(riskScore, 1);
  }

  // Helper functions

  hashClaim(claim) {
    // Simple hash for claim identification
    let hash = 0;
    for (let i = 0; i < claim.length; i++) {
      const char = claim.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }

  getRecentSubmissions(submissions, timestamp) {
    return submissions.filter(s =>
      (timestamp - s.timestamp) < this.config.windowDuration
    );
  }

  getGlobalRate(timestamp) {
    return this.globalWindow.filter(s =>
      (timestamp - s) < this.config.windowDuration
    ).length;
  }

  logSubmission(userId, claimHash, timestamp) {
    // Log to user window
    const userSubmissions = this.userWindows.get(userId);
    userSubmissions.push({ hash: claimHash, timestamp });

    // Log to global window
    this.globalWindow.push(timestamp);

    // Log to claim patterns
    const patterns = this.claimPatterns.get(claimHash);
    patterns.push({ userId, timestamp });
  }

  blockUser(userId, timestamp) {
    const unblockAt = timestamp + this.config.blockDuration;
    this.blockedUsers.set(userId, unblockAt);
  }

  isUserBlocked(userId) {
    if (!this.blockedUsers.has(userId)) return false;

    const unblockAt = this.blockedUsers.get(userId);
    if (Date.now() >= unblockAt) {
      this.blockedUsers.delete(userId);
      return false;
    }

    return true;
  }

  getUserViolationHistory(userId) {
    // In production, this would query a database
    // For now, return a simple count based on current session
    const submissions = this.userWindows.get(userId) || [];
    return Math.floor(submissions.length / 20); // Rough estimate
  }

  assessClaimComplexity(claimHash) {
    // Simple complexity assessment based on hash
    // In production, would analyze actual claim content
    const hashLength = claimHash.length;
    return Math.min(hashLength / 10, 1);
  }

  // Cleanup old entries to prevent memory bloat
  startCleanup() {
    setInterval(() => {
      const cutoff = Date.now() - this.config.windowDuration * 2;

      // Clean user windows
      for (const [userId, submissions] of this.userWindows) {
        const filtered = submissions.filter(s => s.timestamp > cutoff);
        if (filtered.length === 0) {
          this.userWindows.delete(userId);
        } else {
          this.userWindows.set(userId, filtered);
        }
      }

      // Clean global window
      this.globalWindow = this.globalWindow.filter(t => t > cutoff);

      // Clean claim patterns
      for (const [hash, patterns] of this.claimPatterns) {
        const filtered = patterns.filter(p => p.timestamp > cutoff);
        if (filtered.length === 0) {
          this.claimPatterns.delete(hash);
        } else {
          this.claimPatterns.set(hash, filtered);
        }
      }

      // Clean expired blocks
      const now = Date.now();
      for (const [userId, unblockAt] of this.blockedUsers) {
        if (now >= unblockAt) {
          this.blockedUsers.delete(userId);
        }
      }
    }, this.config.cleanupInterval);
  }

  // Get current status for monitoring
  getStatus() {
    return {
      activeUsers: this.userWindows.size,
      blockedUsers: this.blockedUsers.size,
      trackedPatterns: this.claimPatterns.size,
      globalRate: this.getGlobalRate(Date.now()),
      memoryUsage: {
        userWindows: this.userWindows.size,
        globalWindow: this.globalWindow.length,
        claimPatterns: this.claimPatterns.size
      }
    };
  }
}

module.exports = RateLimiter;

// Example usage and testing
if (require.main === module) {
  const limiter = new RateLimiter();

  console.log('Testing Rate Limiter\n');

  // Test 1: Normal usage
  console.log('Test 1: Normal usage');
  for (let i = 0; i < 5; i++) {
    const result = limiter.checkRapidFire('user1', 'The sky is blue', Date.now() + i * 10000);
    console.log(`  Submission ${i+1}: ${result.blocked ? 'BLOCKED' : 'OK'}`);
  }

  console.log('\nTest 2: Rapid fire attack');
  const baseTime = Date.now();
  for (let i = 0; i < 15; i++) {
    const result = limiter.checkRapidFire('attacker', 'The sky is green', baseTime + i * 100);
    if (result.blocked) {
      console.log(`  Blocked at submission ${i+1}: ${result.reason}`);
      break;
    }
    console.log(`  Submission ${i+1}: OK (risk: ${(result.risk * 100).toFixed(0)}%)`);
  }

  console.log('\nTest 3: Coordinated attack');
  for (let user = 0; user < 10; user++) {
    for (let i = 0; i < 12; i++) {
      const result = limiter.checkRapidFire(`bot_${user}`, 'Coordinated false claim', baseTime + i * 500);
      if (result.blocked) {
        console.log(`  Bot ${user} blocked: ${result.reason}`);
        break;
      }
    }
  }

  console.log('\nRate Limiter Status:');
  console.log(limiter.getStatus());
}