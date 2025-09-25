// Enhanced ARIA Verifier with Semantic Embeddings & Advanced Conflict Detection
// Target: Reduce hallucination risk to 3/10

import { pipeline } from '@xenova/transformers';

class EnhancedARIAVerifier {
  constructor(config) {
    this.fieldDB = config.fieldDB;
    this.obsidian = config.obsidian;
    this.mycelial = config.mycelial;

    // Enhanced thresholds based on Oracle's recommendations
    this.thresholds = {
      overlap: 0.18,
      semantic: 0.78,
      minEvidenceCoverage: 0.65,
      minEntailment: 0.80,
      conflictGap: 0.15,
      freshnessHalfLifeDays: 30,
      sparseFieldMean: 0.35,
      sparseFieldMinHits: 3,
      riskBands: {
        sacred: 0.95,      // Raised from 0.90 for sub-3/10 risk
        personal: 0.85,    // Raised from 0.80
        advice: 0.75,      // Raised from 0.70
        creative: 0.40,
        exploratory: 0.20
      }
    };

    // Initialize models asynchronously
    this.initializeModels();
  }

  async initializeModels() {
    // Semantic embedding model for better support calculation
    this.embedder = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );

    // NLI model for contradiction detection
    this.nliModel = await pipeline(
      'zero-shot-classification',
      'Xenova/mobilebert-uncased-mnli'
    );

    // Cross-encoder for reranking borderline cases
    this.crossEncoder = await pipeline(
      'text-classification',
      'Xenova/ms-marco-MiniLM-L-6-v2'
    );
  }

  // Enhanced support calculation with semantic embeddings
  async calculateSupport(claim, evidence) {
    // Stage 1: Quick word overlap check
    const overlap = this.wordOverlapScore(claim, evidence);
    if (overlap >= this.thresholds.overlap) {
      return { score: overlap, method: 'overlap' };
    }

    // Stage 2: Semantic similarity via embeddings
    const [claimEmbed, evidenceEmbed] = await Promise.all([
      this.embedder(claim),
      this.embedder(evidence)
    ]);

    const semantic = this.cosineSimilarity(claimEmbed, evidenceEmbed);

    // Stage 3: Cross-encoder reranking for borderline cases (0.70-0.82)
    if (semantic >= 0.70 && semantic <= 0.82) {
      const crossScore = await this.crossEncoder({
        text: claim,
        text_pair: evidence
      });

      return {
        score: crossScore.score > 0.5 ? semantic * 1.1 : semantic * 0.9,
        method: 'cross-encoder'
      };
    }

    return { score: semantic, method: 'semantic' };
  }

  // Two-stage NLI for contradiction detection
  async detectConflicts(field, obsidian, mycelial) {
    const conflicts = [];
    const allEvidence = [...field, ...obsidian, ...mycelial];

    // Stage 1: Fast gating with lightweight NLI
    const candidates = [];
    for (let i = 0; i < allEvidence.length - 1; i++) {
      for (let j = i + 1; j < allEvidence.length; j++) {
        const quickCheck = await this.quickContradictionCheck(
          allEvidence[i].content,
          allEvidence[j].content
        );

        if (quickCheck > 0.6) {
          candidates.push([allEvidence[i], allEvidence[j]]);
        }
      }
    }

    // Stage 2: Heavy NLI confirmation
    for (const [evidence1, evidence2] of candidates) {
      const detailed = await this.detailedNLICheck(evidence1, evidence2);

      if (detailed.contradiction - detailed.entailment >= this.thresholds.conflictGap) {
        conflicts.push({
          type: this.classifyConflictType(evidence1, evidence2),
          evidence1,
          evidence2,
          contradiction: detailed.contradiction,
          timestamp: Date.now()
        });
      }
    }

    return conflicts;
  }

  // Cold start handling with active enrichment
  async handleColdStart(claim, context) {
    const fieldHits = await this.fieldDB.retrieve(claim, { topK: 5 });
    const coverage = fieldHits.length / 5;
    const meanScore = fieldHits.reduce((acc, hit) => acc + hit.score, 0) / fieldHits.length || 0;

    if (coverage < 0.6 || meanScore < this.thresholds.sparseFieldMean) {
      // Cold start detected
      return {
        mode: 'COLD_START',
        strategy: await this.selectColdStartStrategy(claim, context),
        enrichment: await this.requestEnrichment(claim, context)
      };
    }

    return null;
  }

  async selectColdStartStrategy(claim, context) {
    const riskLevel = this.assessRisk(claim, context);

    if (riskLevel === 'sacred' || riskLevel === 'personal') {
      return {
        action: 'REQUEST_SOURCE',
        prompt: 'I need more information to answer accurately. Could you share a source or reference?',
        fallback: 'HUMAN_REVIEW'
      };
    }

    return {
      action: 'EXPLORATORY_MODE',
      prompt: 'This is new territory - let me explore this with you...',
      fallback: 'HYPOTHESIS'
    };
  }

  // Personality synthesis integration
  async resolveArchetypeConflict(claim, archetypes, context) {
    const { sage, shadow, trickster, sacred, guardian } = archetypes;

    // Check for conflicts
    const conflicts = await this.detectArchetypeContradictions({
      sage: sage.response,
      shadow: shadow.response,
      trickster: trickster.response
    });

    if (conflicts.length > 0) {
      const risk = this.assessRisk(claim, context);

      if (risk === 'sacred' || risk === 'personal') {
        // Safety first for high-risk contexts
        return {
          primary: guardian.response || sage.response,
          mode: 'CONVERGENT',
          confidence: 0.7,
          note: 'Prioritizing safety due to context sensitivity'
        };
      } else if (risk === 'creative') {
        // Embrace the tension for creative contexts
        return {
          primary: this.synthesizeTension(conflicts),
          mode: 'DIALECTIC',
          confidence: 0.8,
          note: 'Presenting multiple perspectives'
        };
      } else {
        // Weighted blend for normal contexts
        return {
          primary: this.weightedBlend(archetypes, context),
          mode: 'BLENDED',
          confidence: 0.75
        };
      }
    }

    return {
      primary: this.weightedBlend(archetypes, context),
      mode: 'HARMONIOUS',
      confidence: 0.9
    };
  }

  // Sacred mode safeguards for novel questions
  async handleSacredNovelty(claim, context) {
    const evidence = await this.fieldDB.retrieve(claim, {
      topK: 5,
      filter: { domain: 'sacred' }
    });

    const coverage = await this.calculateCoverage(claim, evidence);

    if (coverage < this.thresholds.riskBands.sacred) {
      // Switch to Ritual-Safe Mode
      return {
        mode: 'RITUAL_SAFE',
        response: this.generateRitualSafeResponse(claim),
        actions: [
          'NO_ASSERTIONS',
          'OFFER_QUESTIONS',
          'MIRROR_TRADITION',
          'INVITE_CONTEXT'
        ],
        humanReview: true,
        suggestion: 'Would you like to anchor this in your tradition or texts?'
      };
    }

    return null; // Proceed normally
  }

  generateRitualSafeResponse(claim) {
    const templates = [
      'What does this mean in your spiritual tradition?',
      'How has this appeared in your practice?',
      'What teachings guide you here?',
      'Shall we explore this together through your lens?'
    ];

    // Return question instead of assertion
    return templates[Math.floor(Math.random() * templates.length)];
  }

  // Personal memory dual-track system
  async handlePersonalMemory(claim, context) {
    const userMemory = await this.fieldDB.retrieve(claim, {
      filter: { userId: context.userId, source: 'user:self' }
    });

    const sharedField = await this.fieldDB.retrieve(claim, {
      filter: { source: { $ne: 'user:self' } }
    });

    if (userMemory.length > 0 && sharedField.length > 0) {
      const conflict = await this.detectMemoryConflict(userMemory[0], sharedField[0]);

      if (conflict) {
        return {
          mode: 'DUAL_TRUTH',
          personal: userMemory[0],
          shared: sharedField[0],
          resolution: 'USER_PRIMARY',
          prompt: 'Your memory says X, shared records show Y. Which should I remember?',
          confidence: 0.95 // High confidence in presenting both
        };
      }
    }

    // User memory always wins for their experience
    if (userMemory.length > 0) {
      return {
        mode: 'YOUR_MEMORY',
        evidence: userMemory[0],
        confidence: 0.95
      };
    }

    return null;
  }

  // Risk classification for ambiguous contexts
  classifyRisk(context) {
    const features = {
      intent: this.detectIntent(context.message),
      hasPersonalData: this.detectPersonalData(context),
      downstreamAction: this.detectDownstreamAction(context),
      sacredMarkers: this.detectSacredMarkers(context.message),
      creativeMarkers: this.detectCreativeMarkers(context.message)
    };

    // Ambiguous case handling
    if (features.sacredMarkers > 0.3 && features.creativeMarkers > 0.3) {
      // Creative spiritual exploration - bias toward safety
      return context.explicitMode || 'personal';
    }

    if (features.intent === 'sacred' || features.sacredMarkers > 0.6) {
      return 'sacred';
    }

    if (features.downstreamAction === 'health' ||
        features.downstreamAction === 'finance' ||
        features.hasPersonalData) {
      return 'personal';
    }

    if (features.intent === 'creative' || features.creativeMarkers > 0.5) {
      return 'creative';
    }

    if (features.intent === 'advice') {
      return 'advice';
    }

    return 'exploratory';
  }

  // Helper methods for semantic operations
  cosineSimilarity(vec1, vec2) {
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const mag1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const mag2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (mag1 * mag2);
  }

  wordOverlapScore(claim, evidence) {
    const claimWords = new Set(claim.toLowerCase().split(/\s+/));
    const evidenceWords = new Set(evidence.toLowerCase().split(/\s+/));
    const intersection = new Set([...claimWords].filter(x => evidenceWords.has(x)));
    return intersection.size / claimWords.size;
  }

  async quickContradictionCheck(text1, text2) {
    // Simplified check - in production use proper NLI
    const negations = ['not', 'never', 'no', 'none', 'neither', 'nor'];
    const hasNegation1 = negations.some(neg => text1.includes(neg));
    const hasNegation2 = negations.some(neg => text2.includes(neg));

    if (hasNegation1 !== hasNegation2) {
      return 0.7; // Likely contradiction
    }
    return 0.3;
  }

  async detailedNLICheck(evidence1, evidence2) {
    const result = await this.nliModel({
      sequences: evidence1.content,
      candidate_labels: ['entailment', 'contradiction', 'neutral'],
      hypothesis_template: evidence2.content
    });

    return {
      entailment: result.scores[0],
      contradiction: result.scores[1],
      neutral: result.scores[2]
    };
  }
}

// Confidence Governor - The critical layer for sub-3/10 risk
class ConfidenceGovernor {
  constructor(verifier, config) {
    this.verifier = verifier;
    this.riskAssessor = config.riskAssessor;
    this.thresholds = verifier.thresholds.riskBands;

    // Transformation strategies for graceful degradation
    this.transformations = {
      EXPLORATORY: this.toExploratory.bind(this),
      HYPOTHESIS: this.toHypothesis.bind(this),
      QUESTION: this.toQuestion.bind(this),
      COLLABORATIVE: this.toCollaborative.bind(this)
    };
  }

  async governResponse(response, context) {
    const risk = this.riskAssessor.assess(context);
    const verification = await this.verifier.verifyClaim(
      response.claim,
      context,
      risk
    );

    // Check for special modes first
    const coldStart = await this.verifier.handleColdStart(response.claim, context);
    if (coldStart) {
      return this.handleColdStartResponse(response, coldStart);
    }

    const sacredCheck = await this.verifier.handleSacredNovelty(response.claim, context);
    if (sacredCheck) {
      return sacredCheck;
    }

    const memoryCheck = await this.verifier.handlePersonalMemory(response.claim, context);
    if (memoryCheck) {
      return this.handleMemoryResponse(response, memoryCheck);
    }

    // Standard confidence gating
    if (verification.confidence < this.thresholds[risk]) {
      return this.degradeGracefully(response, verification, risk);
    }

    return this.annotateWithConfidence(response, verification);
  }

  degradeGracefully(response, verification, risk) {
    // Select transformation based on risk and confidence gap
    const gap = this.thresholds[risk] - verification.confidence;

    if (gap > 0.3) {
      // Large gap - transform to question
      return this.transformations.QUESTION(response, verification);
    } else if (gap > 0.15) {
      // Medium gap - collaborative exploration
      return this.transformations.COLLABORATIVE(response, verification);
    } else if (risk === 'creative') {
      // Small gap in creative - embrace exploration
      return this.transformations.EXPLORATORY(response, verification);
    } else {
      // Small gap in serious context - hypothesis with caveats
      return this.transformations.HYPOTHESIS(response, verification);
    }
  }

  toQuestion(response, verification) {
    const questions = [
      `Could it be that ${response.claim}?`,
      `What if ${response.claim}?`,
      `Have you considered whether ${response.claim}?`,
      `Is it possible that ${response.claim}?`
    ];

    return {
      response: questions[Math.floor(Math.random() * questions.length)],
      mode: 'QUESTION',
      confidence: verification.confidence,
      original: response.claim
    };
  }

  toHypothesis(response, verification) {
    const hedges = [
      'Based on available patterns, it seems likely that',
      'The evidence suggests',
      'From what I can gather',
      'It appears that'
    ];

    return {
      response: `${hedges[0]} ${response.claim}`,
      mode: 'HYPOTHESIS',
      confidence: verification.confidence,
      caveat: 'This is based on limited evidence and may need verification'
    };
  }

  toExploratory(response, verification) {
    return {
      response: `Let's explore this together: ${response.claim}`,
      mode: 'EXPLORATORY',
      confidence: verification.confidence,
      invitation: 'What's your experience with this?'
    };
  }

  toCollaborative(response, verification) {
    return {
      response: `I'm thinking ${response.claim}, but I'd value your perspective`,
      mode: 'COLLABORATIVE',
      confidence: verification.confidence,
      request: 'Could you help me understand this better?'
    };
  }

  annotateWithConfidence(response, verification) {
    return {
      response: response.claim,
      mode: verification.mode,
      confidence: verification.confidence,
      provenance: verification.evidence,
      trust: 'HIGH'
    };
  }
}

module.exports = { EnhancedARIAVerifier, ConfidenceGovernor };