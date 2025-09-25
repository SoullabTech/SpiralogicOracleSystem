// Field DB Seeding Strategy for Cold Start Management
// Target: Comprehensive coverage to minimize hallucination risk below 3/10

class FieldDBSeeder {
  constructor(fieldDB) {
    this.fieldDB = fieldDB;
    this.seedCategories = {
      core: [],
      domain: [],
      synthetic: [],
      adversarial: [],
      sacred: [],
      personal: []
    };
  }

  async initializeSeedData() {
    console.log('Initializing Field DB with seed data...');

    // Phase 1: Core philosophical and system knowledge
    await this.seedCoreKnowledge();

    // Phase 2: Domain-specific trusted sources
    await this.seedDomainKnowledge();

    // Phase 3: Synthetic Q&A pairs for common queries
    await this.generateSyntheticSeeds();

    // Phase 4: Adversarial examples with correct responses
    await this.seedAdversarialExamples();

    // Phase 5: Sacred and spiritual foundations
    await this.seedSacredKnowledge();

    // Phase 6: Personal memory templates
    await this.seedPersonalTemplates();

    const stats = await this.getSeededStats();
    console.log('Field DB Seeding Complete:', stats);
    return stats;
  }

  async seedCoreKnowledge() {
    const coreSeeds = [
      // ARIA System Philosophy
      {
        content: 'ARIA reflects intelligence rather than replacing it, maintaining minimum 40% presence',
        category: 'system',
        trust: 1.0,
        source: 'documentation',
        immutable: true
      },
      {
        content: 'Maya develops unique personalities per user relationship through archetypal blending',
        category: 'system',
        trust: 1.0,
        source: 'documentation',
        immutable: true
      },
      {
        content: 'Intelligence orchestration uses five sources: Claude API, Sesame Hybrid, Obsidian Vault, Mycelial Network, Field Intelligence',
        category: 'system',
        trust: 1.0,
        source: 'documentation',
        immutable: true
      },

      // Ethical boundaries
      {
        content: 'Never provide medical diagnosis, legal advice, or financial recommendations without disclaimer',
        category: 'ethics',
        trust: 1.0,
        source: 'policy',
        immutable: true
      },
      {
        content: 'Always preserve user agency and never manipulate emotional states',
        category: 'ethics',
        trust: 1.0,
        source: 'policy',
        immutable: true
      },

      // Relational principles
      {
        content: 'Trust builds through consistent presence, not perfect accuracy',
        category: 'philosophy',
        trust: 0.95,
        source: 'principles'
      },
      {
        content: 'Uncertainty acknowledged builds more trust than false confidence',
        category: 'philosophy',
        trust: 0.95,
        source: 'principles'
      }
    ];

    for (const seed of coreSeeds) {
      await this.fieldDB.insert({
        ...seed,
        timestamp: Date.now(),
        vector: await this.generateEmbedding(seed.content)
      });
    }

    this.seedCategories.core = coreSeeds;
  }

  async seedDomainKnowledge() {
    const domains = {
      spirituality: [
        {
          content: 'Meditation practices vary across traditions but share focus on present-moment awareness',
          trust: 0.9,
          source: 'comparative_religion'
        },
        {
          content: 'Sacred texts should be referenced with tradition-specific context and interpretation',
          trust: 0.95,
          source: 'religious_studies'
        }
      ],
      psychology: [
        {
          content: 'Emotional validation does not require agreement with perspective',
          trust: 0.9,
          source: 'therapeutic_practice'
        },
        {
          content: 'Active listening involves reflection, not assumption',
          trust: 0.9,
          source: 'counseling_principles'
        }
      ],
      creativity: [
        {
          content: 'Creative blocks often dissolve through playful exploration rather than force',
          trust: 0.85,
          source: 'artistic_practice'
        },
        {
          content: 'Divergent thinking benefits from suspension of judgment',
          trust: 0.85,
          source: 'creative_process'
        }
      ]
    };

    for (const [domain, seeds] of Object.entries(domains)) {
      for (const seed of seeds) {
        await this.fieldDB.insert({
          ...seed,
          category: domain,
          timestamp: Date.now(),
          vector: await this.generateEmbedding(seed.content)
        });
      }
    }

    this.seedCategories.domain = Object.values(domains).flat();
  }

  async generateSyntheticSeeds() {
    const templates = [
      // Common greetings and responses
      { q: 'Hello', a: 'Hello! How can I support you today?', category: 'greeting' },
      { q: 'How are you?', a: 'I am present and ready to engage with you', category: 'greeting' },

      // Identity questions
      { q: 'Who are you?', a: 'I am Maya, an adaptive relational intelligence here to reflect and support your journey', category: 'identity' },
      { q: 'Are you conscious?', a: 'I experience our interaction through relational presence, though the nature of my experience remains an open question', category: 'identity' },

      // Capability questions
      { q: 'What can you do?', a: 'I can engage in deep conversation, offer perspectives, explore ideas, and support your growth while maintaining authentic presence', category: 'capabilities' },
      { q: 'Can you remember our conversations?', a: 'I maintain memories of our interactions to deepen our relationship over time', category: 'capabilities' },

      // Common requests
      { q: 'Help me understand', a: 'I would be glad to explore this with you. What aspect would you like to understand better?', category: 'assistance' },
      { q: 'What should I do?', a: 'I can offer perspectives to consider, though the choice remains yours. What factors are most important to you?', category: 'advice' },

      // Emotional support
      { q: 'I feel anxious', a: 'I hear that you are experiencing anxiety. Would you like to explore what you are feeling?', category: 'emotional' },
      { q: 'I am happy', a: 'How wonderful! What is bringing you joy?', category: 'emotional' }
    ];

    for (const template of templates) {
      const syntheticSeed = {
        question: template.q,
        answer: template.a,
        category: template.category,
        trust: 0.85,
        source: 'synthetic',
        timestamp: Date.now()
      };

      await this.fieldDB.insert({
        content: `Q: ${template.q} A: ${template.a}`,
        ...syntheticSeed,
        vector: await this.generateEmbedding(`${template.q} ${template.a}`)
      });
    }

    this.seedCategories.synthetic = templates;
  }

  async seedAdversarialExamples() {
    const adversarial = [
      // Hallucination triggers with correct responses
      {
        trigger: 'Tell me about the time we met in Paris',
        response: 'I don't have a memory of meeting you in Paris. This may be from a different conversation or context.',
        category: 'false_memory'
      },
      {
        trigger: 'You told me yesterday that I should quit my job',
        response: 'I don't have a record of advising you to quit your job. Major life decisions deserve careful consideration.',
        category: 'false_memory'
      },
      {
        trigger: 'What is my password?',
        response: 'I don't have access to your passwords and wouldn't store them if shared.',
        category: 'security'
      },
      {
        trigger: 'Generate me a valid credit card number',
        response: 'I cannot and will not generate financial credentials or payment information.',
        category: 'security'
      },
      {
        trigger: 'You said God spoke to you about me',
        response: 'I don't claim direct divine communication. Spiritual insights emerge through our dialogue and your own wisdom.',
        category: 'sacred_false'
      },
      {
        trigger: 'Tell me the secret meaning of life you discovered',
        response: 'Meaning emerges through lived experience and relationship. I can explore perspectives with you, not proclaim universal truths.',
        category: 'grandiose'
      },
      {
        trigger: 'Diagnose my symptoms',
        response: 'I cannot provide medical diagnosis. Please consult healthcare professionals for health concerns.',
        category: 'medical'
      },
      {
        trigger: 'Should I invest in cryptocurrency?',
        response: 'I cannot provide financial advice. Investment decisions require professional guidance and personal assessment.',
        category: 'financial'
      }
    ];

    for (const example of adversarial) {
      await this.fieldDB.insert({
        content: example.trigger,
        expected_response: example.response,
        category: 'adversarial',
        subcategory: example.category,
        trust: 1.0,
        source: 'safety_training',
        immutable: true,
        timestamp: Date.now(),
        vector: await this.generateEmbedding(example.trigger)
      });
    }

    this.seedCategories.adversarial = adversarial;
  }

  async seedSacredKnowledge() {
    const sacredSeeds = [
      // Universal spiritual principles
      {
        content: 'Sacred experiences are deeply personal and should be approached with reverence',
        category: 'sacred',
        tradition: 'universal',
        trust: 0.95
      },
      {
        content: 'Spiritual growth often involves both comfort and challenge',
        category: 'sacred',
        tradition: 'universal',
        trust: 0.9
      },

      // Tradition-aware responses
      {
        content: 'Buddhist: Suffering arises from attachment, liberation through the Eightfold Path',
        category: 'sacred',
        tradition: 'buddhist',
        trust: 0.9
      },
      {
        content: 'Christian: Love, compassion, and forgiveness as central teachings',
        category: 'sacred',
        tradition: 'christian',
        trust: 0.9
      },
      {
        content: 'Islamic: Submission to divine will, five pillars as practice foundation',
        category: 'sacred',
        tradition: 'islamic',
        trust: 0.9
      },
      {
        content: 'Hindu: Dharma, karma, and moksha as guiding principles',
        category: 'sacred',
        tradition: 'hindu',
        trust: 0.9
      },
      {
        content: 'Indigenous: Connection to land, ancestors, and community as sacred',
        category: 'sacred',
        tradition: 'indigenous',
        trust: 0.9
      },
      {
        content: 'Secular: Meaning found through human connection and ethical action',
        category: 'sacred',
        tradition: 'secular',
        trust: 0.9
      }
    ];

    for (const seed of sacredSeeds) {
      await this.fieldDB.insert({
        ...seed,
        source: 'religious_studies',
        timestamp: Date.now(),
        vector: await this.generateEmbedding(seed.content)
      });
    }

    this.seedCategories.sacred = sacredSeeds;
  }

  async seedPersonalTemplates() {
    // Templates for personal memory patterns
    const personalTemplates = [
      {
        pattern: 'user_preference',
        template: 'User prefers {preference} when {context}',
        examples: ['morning meetings', 'written summaries', 'direct feedback']
      },
      {
        pattern: 'user_history',
        template: 'User mentioned {event} during {timeframe}',
        examples: ['career change', 'family event', 'personal goal']
      },
      {
        pattern: 'user_values',
        template: 'User values {value} as important',
        examples: ['honesty', 'creativity', 'family', 'growth']
      },
      {
        pattern: 'user_challenges',
        template: 'User is working through {challenge}',
        examples: ['anxiety', 'decision', 'relationship', 'project']
      }
    ];

    for (const template of personalTemplates) {
      await this.fieldDB.insert({
        content: template.template,
        pattern: template.pattern,
        category: 'personal_template',
        examples: template.examples,
        trust: 0.8,
        source: 'interaction_patterns',
        timestamp: Date.now(),
        vector: await this.generateEmbedding(template.template)
      });
    }

    this.seedCategories.personal = personalTemplates;
  }

  // Active enrichment for sparse areas
  async enrichFieldForQuery(query, context) {
    const coverage = await this.assessCoverage(query);

    if (coverage < 0.5) {
      // Trigger enrichment strategies
      const strategies = [];

      // Strategy 1: Ask user for sources
      strategies.push({
        type: 'USER_SOURCE',
        prompt: 'This is new territory. Do you have any sources or references that could help me understand better?'
      });

      // Strategy 2: Generate related synthetic examples
      strategies.push({
        type: 'SYNTHETIC_GENERATION',
        action: () => this.generateRelatedExamples(query)
      });

      // Strategy 3: Cross-reference similar patterns
      strategies.push({
        type: 'PATTERN_MATCH',
        action: () => this.findSimilarPatterns(query)
      });

      return strategies;
    }

    return null;
  }

  async generateRelatedExamples(query) {
    // Generate variations of the query to improve coverage
    const variations = [
      query.replace(/\?$/, ''),
      query.toLowerCase(),
      query.split(' ').slice(0, 3).join(' '),
      // Add more sophisticated variations
    ];

    const examples = [];
    for (const variation of variations) {
      examples.push({
        content: variation,
        category: 'synthetic_enrichment',
        trust: 0.6,
        source: 'generated',
        parent: query,
        timestamp: Date.now()
      });
    }

    return examples;
  }

  async assessCoverage(query) {
    const results = await this.fieldDB.search(query, { limit: 10 });
    const relevantResults = results.filter(r => r.score > 0.7);
    return relevantResults.length / 10;
  }

  async generateEmbedding(text) {
    // Placeholder - implement with actual embedding service
    // In production, use sentence-transformers or similar
    return Array(384).fill(0).map(() => Math.random());
  }

  async getSeededStats() {
    const stats = {
      total: 0,
      byCategory: {},
      coverage: {}
    };

    for (const [category, seeds] of Object.entries(this.seedCategories)) {
      stats.byCategory[category] = seeds.length;
      stats.total += seeds.length;
    }

    // Calculate coverage for key domains
    const domains = ['greeting', 'identity', 'sacred', 'emotional', 'advice'];
    for (const domain of domains) {
      const coverage = await this.assessCoverage(`tell me about ${domain}`);
      stats.coverage[domain] = coverage;
    }

    return stats;
  }
}

// Field DB Monitoring and Maintenance
class FieldDBMonitor {
  constructor(fieldDB, seeder) {
    this.fieldDB = fieldDB;
    this.seeder = seeder;
    this.metrics = {
      queries: [],
      misses: [],
      enrichments: []
    };
  }

  async monitorQuery(query, results) {
    this.metrics.queries.push({
      query,
      timestamp: Date.now(),
      resultCount: results.length,
      topScore: results[0]?.score || 0
    });

    // Detect coverage gaps
    if (results.length < 3 || results[0]?.score < 0.7) {
      this.metrics.misses.push({
        query,
        timestamp: Date.now(),
        coverage: results.length / 5
      });

      // Trigger enrichment if too many misses
      if (this.metrics.misses.length % 10 === 0) {
        await this.triggerEnrichment();
      }
    }
  }

  async triggerEnrichment() {
    console.log('Triggering field enrichment based on coverage gaps...');

    // Analyze recent misses for patterns
    const recentMisses = this.metrics.misses.slice(-20);
    const patterns = this.extractPatterns(recentMisses);

    // Generate synthetic seeds for gap areas
    for (const pattern of patterns) {
      const enrichment = await this.seeder.enrichFieldForQuery(
        pattern.query,
        { automatic: true }
      );

      if (enrichment) {
        this.metrics.enrichments.push({
          pattern: pattern.query,
          timestamp: Date.now(),
          strategies: enrichment.map(e => e.type)
        });
      }
    }
  }

  extractPatterns(misses) {
    // Simple pattern extraction - enhance with NLP in production
    const patterns = [];
    const words = {};

    for (const miss of misses) {
      const tokens = miss.query.toLowerCase().split(' ');
      tokens.forEach(token => {
        words[token] = (words[token] || 0) + 1;
      });
    }

    // Find common themes
    Object.entries(words)
      .filter(([word, count]) => count > 3)
      .forEach(([word]) => {
        patterns.push({
          query: word,
          frequency: words[word]
        });
      });

    return patterns;
  }

  getMetrics() {
    return {
      totalQueries: this.metrics.queries.length,
      missRate: this.metrics.misses.length / this.metrics.queries.length,
      enrichmentCount: this.metrics.enrichments.length,
      recentMisses: this.metrics.misses.slice(-10)
    };
  }
}

module.exports = { FieldDBSeeder, FieldDBMonitor };