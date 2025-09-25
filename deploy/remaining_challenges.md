# Remaining Implementation Challenges

## 1. UI/UX Confidence Components (Not Yet Built)
**Challenge**: Users need visual cues for confidence levels without jarring mode shifts

**Solution Needed**:
```javascript
// Confidence UI Component Spec
const confidenceStyles = {
  VERIFIED: {
    border: 'solid 2px #10b981',
    background: 'rgba(16, 185, 129, 0.05)',
    icon: '✓',
    label: 'Verified'
  },
  LIKELY: {
    border: 'dashed 2px #84cc16',
    background: 'rgba(132, 204, 22, 0.05)',
    icon: '~',
    label: 'Likely'
  },
  HYPOTHESIS: {
    border: 'dotted 2px #eab308',
    background: 'rgba(234, 179, 8, 0.05)',
    icon: '?',
    label: 'Hypothesis',
    textStyle: 'italic'
  },
  EXPLORATORY: {
    border: 'none',
    background: 'rgba(249, 115, 22, 0.05)',
    icon: '...',
    label: 'Exploring',
    animation: 'pulse'
  },
  RITUAL_SAFE: {
    border: 'double 3px #a855f7',
    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05), rgba(236, 72, 153, 0.05))',
    icon: '🕊',
    label: 'Sacred Space'
  }
};
```

## 2. Ambiguous Risk Classification Edge Cases
**Challenge**: Creative spiritual advice blurs risk boundaries

**Solution Needed**:
```javascript
// Enhanced risk classifier with ambiguity handling
class AmbiguousRiskResolver {
  classifyWithContext(message, userHistory, currentMode) {
    const features = {
      sacredMarkers: this.detectSacredLanguage(message),
      creativeMarkers: this.detectCreativeIntent(message),
      personalData: this.detectPII(message),
      userPreference: userHistory.preferredMode,
      contextualClues: this.analyzeContext(message)
    };

    // Ambiguous case: both sacred and creative markers
    if (features.sacredMarkers > 0.3 && features.creativeMarkers > 0.3) {
      // Let user decide with inline control
      return {
        risk: 'ambiguous',
        suggested: 'personal', // Bias toward safety
        userControl: true,
        message: 'This seems both creative and sacred. How should I approach it?',
        options: ['Creative exploration', 'Sacred guidance', 'Personal advice']
      };
    }

    return this.standardClassification(features);
  }
}
```

## 3. Cross-Encoder Reranking for Borderline Cases
**Challenge**: Cosine similarity 0.70-0.82 needs extra scrutiny

**Solution Needed**:
```javascript
// Cross-encoder for borderline semantic matches
async function crossEncoderRerank(claim, evidenceList) {
  const borderlineCases = evidenceList.filter(e =>
    e.cosineSimilarity >= 0.70 && e.cosineSimilarity <= 0.82
  );

  if (borderlineCases.length === 0) return evidenceList;

  // Use cross-encoder model for more accurate ranking
  const reranked = await Promise.all(
    borderlineCases.map(async evidence => {
      const crossScore = await crossEncoder.score(claim, evidence.content);
      return {
        ...evidence,
        adjustedScore: crossScore > 0.5
          ? evidence.cosineSimilarity * 1.1
          : evidence.cosineSimilarity * 0.9
      };
    })
  );

  // Merge back with non-borderline cases
  return evidenceList.map(e => {
    const rerankedItem = reranked.find(r => r.id === e.id);
    return rerankedItem || e;
  }).sort((a, b) => b.adjustedScore - a.adjustedScore);
}
```

## 4. Active Enrichment Prompts
**Challenge**: Cold start needs user input for sparse areas

**Solution Needed**:
```javascript
class ActiveEnrichmentUI {
  async promptForSource(query, context) {
    if (context.coverage < 0.35) {
      return {
        type: 'enrichment_request',
        message: 'I\'m still learning about this topic. Could you help me understand better?',
        options: [
          {
            action: 'provide_text',
            label: 'Share your knowledge',
            icon: '💭'
          },
          {
            action: 'provide_link',
            label: 'Share a helpful link',
            icon: '🔗'
          },
          {
            action: 'upload_document',
            label: 'Upload a document',
            icon: '📄'
          },
          {
            action: 'skip',
            label: 'Continue without source',
            icon: '→'
          }
        ],
        callback: async (action, data) => {
          if (action !== 'skip') {
            await this.enrichField(query, data, action);
          }
        }
      };
    }
  }
}
```

## 5. Hard Negatives Pool for NLI Training
**Challenge**: Near-paraphrases that flip meaning need special attention

**Solution Needed**:
```javascript
class HardNegativesPool {
  constructor() {
    this.pool = new Map();
    this.threshold = 0.85; // High similarity but opposite meaning
  }

  async addPair(original, contradiction) {
    const similarity = await this.calculateSimilarity(original, contradiction);

    if (similarity > this.threshold) {
      this.pool.set(original, {
        contradiction,
        similarity,
        domain: this.classifyDomain(original),
        timestamp: Date.now()
      });

      // Trigger retraining if pool is large enough
      if (this.pool.size > 100) {
        await this.triggerNLIFinetune();
      }
    }
  }

  generateTrainingData() {
    return Array.from(this.pool.entries()).map(([original, data]) => ({
      premise: original,
      hypothesis: data.contradiction,
      label: 'contradiction',
      weight: data.similarity, // Higher weight for harder cases
      domain: data.domain
    }));
  }
}
```

## 6. User Preference Learning
**Challenge**: Each user has different tolerance for uncertainty

**Solution Needed**:
```javascript
class UserPreferenceAdapter {
  async adaptToUser(userId, response, verification) {
    const profile = await this.getUserProfile(userId);

    // Learn from feedback
    if (profile.prefersExploration && verification.confidence > 0.6) {
      // User likes exploration even when we have decent confidence
      return this.shiftToExploratory(response);
    }

    if (profile.prefersCertainty && verification.confidence < 0.8) {
      // User wants high confidence
      return this.addCaveats(response, verification);
    }

    // Adjust thresholds per user
    const personalizedThresholds = {
      ...this.baseThresholds,
      verified: this.baseThresholds.verified * profile.confidenceMultiplier,
      exploratory: this.baseThresholds.exploratory * profile.explorationMultiplier
    };

    return this.applyPersonalizedMode(response, verification, personalizedThresholds);
  }
}
```

## 7. Tabular Facts Schema-Aware Matching
**Challenge**: Exact field equality should beat semantic similarity for structured data

**Solution Needed**:
```javascript
class SchemaAwareMatcher {
  matchTabularFacts(claim, evidence) {
    // Detect if claim is about structured data
    const schema = this.detectSchema(claim);

    if (schema) {
      // Extract key-value pairs
      const claimFields = this.extractFields(claim, schema);
      const evidenceFields = this.extractFields(evidence, schema);

      // Exact match scores higher than semantic
      let score = 0;
      for (const [key, value] of Object.entries(claimFields)) {
        if (evidenceFields[key] === value) {
          score += 1.0; // Exact match
        } else if (this.semanticMatch(evidenceFields[key], value) > 0.8) {
          score += 0.5; // Semantic match
        }
      }

      return score / Object.keys(claimFields).length;
    }

    // Fall back to standard semantic matching
    return this.semanticSimilarity(claim, evidence);
  }
}
```

## 8. Fast Freshness Crawl for Missing References
**Challenge**: Background enrichment for repeated unanswered queries

**Solution Needed**:
```javascript
class FreshnessCrawler {
  constructor(fieldDB) {
    this.fieldDB = fieldDB;
    this.missingQueries = new Map();
    this.crawlInterval = 3600000; // 1 hour
  }

  trackMissing(query, context) {
    const count = (this.missingQueries.get(query) || 0) + 1;
    this.missingQueries.set(query, count);

    // Trigger crawl if query is hot
    if (count > 5) {
      this.priorityCrawl(query, context);
    }
  }

  async priorityCrawl(query, context) {
    // Search for references in order of trust
    const sources = [
      () => this.searchOfficialDocs(query),
      () => this.searchAcademicSources(query),
      () => this.searchTrustedForums(query),
      () => this.generateSyntheticReference(query) // Last resort
    ];

    for (const source of sources) {
      const result = await source();
      if (result && result.confidence > 0.7) {
        await this.fieldDB.insert({
          content: result.content,
          source: result.source,
          trust: result.trust,
          category: 'auto_enriched',
          query: query,
          timestamp: Date.now()
        });
        break;
      }
    }
  }
}
```

## Implementation Priority

1. **HIGH**: UI Confidence Components - Users need visual feedback
2. **HIGH**: Active Enrichment Prompts - Critical for cold start
3. **MEDIUM**: Ambiguous Risk Resolver - Important for edge cases
4. **MEDIUM**: Cross-Encoder Reranking - Improves accuracy
5. **LOW**: Hard Negatives Pool - Can start with zero-shot NLI
6. **LOW**: User Preference Learning - Nice-to-have personalization
7. **LOW**: Schema-Aware Matching - Only if handling structured data
8. **LOW**: Freshness Crawler - Can do manual enrichment initially

## Next Steps

1. Build the UI confidence components first (most user-visible)
2. Implement active enrichment for cold start recovery
3. Add ambiguous risk handling with user controls
4. Deploy cross-encoder for borderline cases
5. Collect production data for future NLI training