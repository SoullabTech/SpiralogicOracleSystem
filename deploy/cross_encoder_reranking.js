// Cross-Encoder Reranking for Borderline Semantic Matches
// Improves accuracy for cosine similarity scores between 0.70-0.82

class CrossEncoderReranking {
  constructor() {
    // Borderline thresholds
    this.borderlineLower = 0.70;
    this.borderlineUpper = 0.82;

    // Adjustment factors
    this.boostFactor = 1.15; // Boost for high cross-encoder scores
    this.penaltyFactor = 0.85; // Penalty for low cross-encoder scores

    // Performance optimization
    this.batchSize = 10;
    this.cache = new Map();
    this.cacheMaxSize = 1000;
  }

  // Main reranking method
  async rerankEvidence(claim, evidenceList) {
    // Identify borderline cases
    const borderlineCases = evidenceList.filter(e =>
      e.cosineSimilarity >= this.borderlineLower &&
      e.cosineSimilarity <= this.borderlineUpper
    );

    if (borderlineCases.length === 0) {
      // No borderline cases, return original list
      return evidenceList;
    }

    // Process borderline cases with cross-encoder
    const rerankedBorderline = await this.processBorderlineCases(
      claim,
      borderlineCases
    );

    // Merge reranked results with non-borderline cases
    return this.mergeResults(evidenceList, rerankedBorderline);
  }

  async processBorderlineCases(claim, borderlineCases) {
    const reranked = [];

    // Process in batches for efficiency
    for (let i = 0; i < borderlineCases.length; i += this.batchSize) {
      const batch = borderlineCases.slice(i, i + this.batchSize);
      const batchResults = await Promise.all(
        batch.map(evidence => this.crossEncodeScore(claim, evidence))
      );

      reranked.push(...batchResults);
    }

    return reranked;
  }

  async crossEncodeScore(claim, evidence) {
    // Check cache first
    const cacheKey = this.getCacheKey(claim, evidence.content);
    if (this.cache.has(cacheKey)) {
      const cachedScore = this.cache.get(cacheKey);
      return this.adjustEvidence(evidence, cachedScore);
    }

    // Compute cross-encoder score
    const crossScore = await this.computeCrossEncoderScore(
      claim,
      evidence.content
    );

    // Cache the result
    this.cacheScore(cacheKey, crossScore);

    // Adjust evidence score based on cross-encoder result
    return this.adjustEvidence(evidence, crossScore);
  }

  async computeCrossEncoderScore(claim, evidenceContent) {
    // Simplified cross-encoder scoring
    // In production, use a proper cross-encoder model like:
    // - sentence-transformers/ms-marco-MiniLM-L-6-v2
    // - cross-encoder/ms-marco-electra-base

    // For now, simulate with advanced semantic analysis
    const score = await this.advancedSemanticAnalysis(claim, evidenceContent);

    return score;
  }

  async advancedSemanticAnalysis(claim, evidence) {
    // Analyze different aspects of semantic similarity

    // 1. Token overlap (refined)
    const tokenOverlap = this.calculateTokenOverlap(claim, evidence);

    // 2. Syntactic similarity
    const syntacticSim = this.calculateSyntacticSimilarity(claim, evidence);

    // 3. Named entity matching
    const entityMatch = this.calculateEntityMatch(claim, evidence);

    // 4. Semantic role alignment
    const roleAlignment = this.calculateRoleAlignment(claim, evidence);

    // 5. Contradiction detection
    const hasContradiction = this.detectContradiction(claim, evidence);

    // Weighted combination
    let score = (
      tokenOverlap * 0.2 +
      syntacticSim * 0.25 +
      entityMatch * 0.25 +
      roleAlignment * 0.3
    );

    // Penalize contradictions heavily
    if (hasContradiction) {
      score *= 0.3;
    }

    return score;
  }

  calculateTokenOverlap(claim, evidence) {
    // More sophisticated token overlap
    const claimTokens = this.tokenize(claim);
    const evidenceTokens = this.tokenize(evidence);

    // Consider both exact and stem matches
    const exactMatches = this.countExactMatches(claimTokens, evidenceTokens);
    const stemMatches = this.countStemMatches(claimTokens, evidenceTokens);

    const totalTokens = claimTokens.length;
    const overlapScore = (exactMatches + stemMatches * 0.7) / totalTokens;

    return Math.min(1.0, overlapScore);
  }

  calculateSyntacticSimilarity(claim, evidence) {
    // Check syntactic patterns
    const claimPattern = this.extractSyntacticPattern(claim);
    const evidencePattern = this.extractSyntacticPattern(evidence);

    if (claimPattern === evidencePattern) {
      return 1.0;
    }

    // Check for compatible patterns
    const compatibility = this.checkPatternCompatibility(
      claimPattern,
      evidencePattern
    );

    return compatibility;
  }

  calculateEntityMatch(claim, evidence) {
    // Extract and match named entities
    const claimEntities = this.extractEntities(claim);
    const evidenceEntities = this.extractEntities(evidence);

    if (claimEntities.length === 0) {
      return 0.5; // No entities to match
    }

    let matches = 0;
    claimEntities.forEach(entity => {
      if (evidenceEntities.some(e => this.entitiesMatch(entity, e))) {
        matches++;
      }
    });

    return matches / claimEntities.length;
  }

  calculateRoleAlignment(claim, evidence) {
    // Check if semantic roles align
    const claimRoles = this.extractSemanticRoles(claim);
    const evidenceRoles = this.extractSemanticRoles(evidence);

    // Check subject alignment
    const subjectAlignment = this.rolesMatch(
      claimRoles.subject,
      evidenceRoles.subject
    ) ? 0.4 : 0;

    // Check action alignment
    const actionAlignment = this.rolesMatch(
      claimRoles.action,
      evidenceRoles.action
    ) ? 0.4 : 0;

    // Check object alignment
    const objectAlignment = this.rolesMatch(
      claimRoles.object,
      evidenceRoles.object
    ) ? 0.2 : 0;

    return subjectAlignment + actionAlignment + objectAlignment;
  }

  detectContradiction(claim, evidence) {
    // Simple contradiction patterns
    const contradictionPatterns = [
      { positive: /is/i, negative: /is not/i },
      { positive: /can/i, negative: /cannot|can't/i },
      { positive: /will/i, negative: /won't|will not/i },
      { positive: /always/i, negative: /never/i },
      { positive: /true/i, negative: /false/i },
      { positive: /yes/i, negative: /no/i }
    ];

    for (const pattern of contradictionPatterns) {
      const claimHasPositive = claim.match(pattern.positive);
      const claimHasNegative = claim.match(pattern.negative);
      const evidenceHasPositive = evidence.match(pattern.positive);
      const evidenceHasNegative = evidence.match(pattern.negative);

      if (
        (claimHasPositive && evidenceHasNegative) ||
        (claimHasNegative && evidenceHasPositive)
      ) {
        return true;
      }
    }

    return false;
  }

  adjustEvidence(evidence, crossScore) {
    // Adjust the evidence score based on cross-encoder result
    let adjustedScore;

    if (crossScore > 0.7) {
      // High cross-encoder score - boost
      adjustedScore = Math.min(
        1.0,
        evidence.cosineSimilarity * this.boostFactor
      );
    } else if (crossScore < 0.4) {
      // Low cross-encoder score - penalize
      adjustedScore = evidence.cosineSimilarity * this.penaltyFactor;
    } else {
      // Moderate score - slight adjustment
      const adjustment = 1 + (crossScore - 0.55) * 0.2;
      adjustedScore = evidence.cosineSimilarity * adjustment;
    }

    return {
      ...evidence,
      originalScore: evidence.cosineSimilarity,
      crossEncoderScore: crossScore,
      adjustedScore,
      reranked: true
    };
  }

  mergeResults(originalList, rerankedBorderline) {
    // Create a map of reranked results
    const rerankedMap = new Map(
      rerankedBorderline.map(e => [e.id, e])
    );

    // Merge and sort by adjusted score
    const merged = originalList.map(evidence => {
      if (rerankedMap.has(evidence.id)) {
        return rerankedMap.get(evidence.id);
      }
      // Non-borderline cases keep their original score as adjusted score
      return {
        ...evidence,
        adjustedScore: evidence.cosineSimilarity,
        reranked: false
      };
    });

    // Sort by adjusted score
    return merged.sort((a, b) => b.adjustedScore - a.adjustedScore);
  }

  // Helper methods
  tokenize(text) {
    // Simple tokenization
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2);
  }

  countExactMatches(tokens1, tokens2) {
    const set2 = new Set(tokens2);
    return tokens1.filter(token => set2.has(token)).length;
  }

  countStemMatches(tokens1, tokens2) {
    // Simplified stemming
    const stems1 = tokens1.map(t => this.simpleStem(t));
    const stems2 = tokens2.map(t => this.simpleStem(t));
    const set2 = new Set(stems2);

    return stems1.filter(stem => set2.has(stem)).length;
  }

  simpleStem(word) {
    // Very basic stemming
    return word
      .replace(/ing$/, '')
      .replace(/ed$/, '')
      .replace(/s$/, '');
  }

  extractSyntacticPattern(text) {
    // Simplified pattern extraction
    if (text.includes('?')) return 'question';
    if (text.match(/^(is|are|was|were)/i)) return 'is_statement';
    if (text.match(/^(can|could|will|would|should)/i)) return 'modal_statement';
    if (text.match(/^[A-Z][^.!?]*\s(is|are|was|were)/)) return 'subject_predicate';
    return 'other';
  }

  checkPatternCompatibility(pattern1, pattern2) {
    const compatible = {
      'question': ['subject_predicate', 'is_statement'],
      'is_statement': ['subject_predicate', 'is_statement'],
      'modal_statement': ['modal_statement', 'subject_predicate'],
      'subject_predicate': ['subject_predicate', 'is_statement']
    };

    const compatList = compatible[pattern1] || [];
    return compatList.includes(pattern2) ? 0.8 : 0.3;
  }

  extractEntities(text) {
    // Simple entity extraction
    const entities = [];

    // Capitalized words (likely proper nouns)
    const properNouns = text.match(/[A-Z][a-z]+/g) || [];
    properNouns.forEach(noun => {
      entities.push({ text: noun, type: 'proper_noun' });
    });

    // Numbers
    const numbers = text.match(/\d+/g) || [];
    numbers.forEach(num => {
      entities.push({ text: num, type: 'number' });
    });

    // Dates (simplified)
    const dates = text.match(/\d{4}|\d{1,2}\/\d{1,2}/g) || [];
    dates.forEach(date => {
      entities.push({ text: date, type: 'date' });
    });

    return entities;
  }

  entitiesMatch(entity1, entity2) {
    if (entity1.type !== entity2.type) return false;

    if (entity1.type === 'number') {
      return parseFloat(entity1.text) === parseFloat(entity2.text);
    }

    return entity1.text.toLowerCase() === entity2.text.toLowerCase();
  }

  extractSemanticRoles(text) {
    // Very simplified semantic role extraction
    const words = text.split(/\s+/);

    // Find subject (first noun-like word)
    const subject = words.find(w =>
      !['the', 'a', 'an', 'is', 'are', 'was', 'were'].includes(w.toLowerCase())
    );

    // Find action (verb-like word)
    const action = words.find(w =>
      w.match(/(ing|ed)$/) || ['is', 'are', 'was', 'were', 'do', 'does'].includes(w.toLowerCase())
    );

    // Find object (last significant word)
    const object = words.reverse().find(w =>
      !['the', 'a', 'an'].includes(w.toLowerCase()) && w !== action && w !== subject
    );

    return { subject, action, object };
  }

  rolesMatch(role1, role2) {
    if (!role1 || !role2) return false;

    // Exact match
    if (role1.toLowerCase() === role2.toLowerCase()) return true;

    // Stem match
    if (this.simpleStem(role1) === this.simpleStem(role2)) return true;

    // Synonym match (simplified)
    const synonyms = {
      'is': ['are', 'was', 'were', 'be'],
      'make': ['create', 'build', 'construct'],
      'get': ['obtain', 'receive', 'acquire']
    };

    for (const [base, syns] of Object.entries(synonyms)) {
      if (
        (role1.toLowerCase() === base && syns.includes(role2.toLowerCase())) ||
        (role2.toLowerCase() === base && syns.includes(role1.toLowerCase()))
      ) {
        return true;
      }
    }

    return false;
  }

  // Caching methods
  getCacheKey(claim, evidence) {
    return `${claim.substring(0, 50)}::${evidence.substring(0, 50)}`;
  }

  cacheScore(key, score) {
    // Implement LRU cache
    if (this.cache.size >= this.cacheMaxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, score);
  }

  // Performance monitoring
  getPerformanceStats() {
    return {
      cacheSize: this.cache.size,
      cacheHitRate: this.cacheHits / (this.cacheHits + this.cacheMisses || 1),
      avgProcessingTime: this.totalProcessingTime / this.processedCount || 0
    };
  }
}

module.exports = { CrossEncoderReranking };