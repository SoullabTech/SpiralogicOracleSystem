// Active Enrichment UI for Cold Start Recovery
// Prompts users to provide sources when field DB is sparse

class ActiveEnrichmentUI {
  constructor(fieldDB, verifier) {
    this.fieldDB = fieldDB;
    this.verifier = verifier;
    this.enrichmentQueue = new Map();
    this.userContributions = new Map();
  }

  // Main enrichment flow
  async checkAndPrompt(query, context, coverage) {
    // Check if we need enrichment
    if (coverage >= 0.5) {
      return null; // Good coverage, no enrichment needed
    }

    // Check if we've already asked about this recently
    if (this.hasRecentlyAsked(query, context.userId)) {
      return null; // Don't spam the user
    }

    // Generate enrichment request
    const enrichmentRequest = this.generateEnrichmentRequest(query, context, coverage);

    // Track that we've asked
    this.recordEnrichmentRequest(query, context.userId);

    return enrichmentRequest;
  }

  generateEnrichmentRequest(query, context, coverage) {
    const riskLevel = this.assessQueryRisk(query, context);

    // Different prompts based on risk and coverage
    if (riskLevel === 'sacred' && coverage < 0.2) {
      return this.generateSacredEnrichmentRequest(query);
    } else if (riskLevel === 'personal' && coverage < 0.3) {
      return this.generatePersonalEnrichmentRequest(query);
    } else if (coverage < 0.35) {
      return this.generateGeneralEnrichmentRequest(query);
    }

    return null;
  }

  generateSacredEnrichmentRequest(query) {
    return {
      type: 'enrichment_request',
      priority: 'high',
      mode: 'sacred',
      message: 'This touches on sacred territory I'm still learning about.',
      subMessage: 'Your wisdom would help me understand and serve you better.',
      options: [
        {
          id: 'share_tradition',
          label: 'Share from your tradition',
          icon: '📿',
          description: 'Text, teachings, or personal understanding',
          action: 'text_input',
          placeholder: 'Share what this means in your spiritual context...'
        },
        {
          id: 'provide_source',
          label: 'Share a sacred text or reference',
          icon: '📖',
          description: 'Link to teachings or upload a document',
          action: 'source_input',
          accepts: ['text', 'link', 'pdf', 'epub']
        },
        {
          id: 'guide_exploration',
          label: 'Guide my understanding',
          icon: '🕊️',
          description: 'Help me learn through conversation',
          action: 'conversational',
          prompt: 'Tell me more about your spiritual perspective on this...'
        },
        {
          id: 'prefer_not',
          label: 'Continue without enrichment',
          icon: '→',
          description: 'Explore together with current knowledge',
          action: 'skip'
        }
      ],
      ui: {
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05), rgba(236, 72, 153, 0.05))',
        borderStyle: 'double',
        animation: 'gentle-glow'
      }
    };
  }

  generatePersonalEnrichmentRequest(query) {
    return {
      type: 'enrichment_request',
      priority: 'medium',
      mode: 'personal',
      message: "I'd like to understand this better to serve you personally.",
      subMessage: 'Your input helps me provide more accurate and relevant responses.',
      options: [
        {
          id: 'share_context',
          label: 'Provide context',
          icon: '💭',
          description: 'Help me understand your specific situation',
          action: 'text_input',
          placeholder: 'Here's what I mean by this...'
        },
        {
          id: 'share_reference',
          label: 'Share a reference',
          icon: '🔗',
          description: 'Article, document, or link that explains this',
          action: 'source_input',
          accepts: ['text', 'link', 'pdf', 'doc']
        },
        {
          id: 'correct_understanding',
          label: 'Correct my understanding',
          icon: '✏️',
          description: 'Point out what I might be missing',
          action: 'correction',
          showCurrent: true
        },
        {
          id: 'continue_anyway',
          label: 'Continue with current understanding',
          icon: '→',
          action: 'skip'
        }
      ],
      ui: {
        background: 'rgba(59, 130, 246, 0.05)',
        borderStyle: 'solid',
        borderColor: '#3b82f6'
      }
    };
  }

  generateGeneralEnrichmentRequest(query) {
    return {
      type: 'enrichment_request',
      priority: 'low',
      mode: 'general',
      message: "I'm still learning about this topic.",
      subMessage: 'Your knowledge would help improve my understanding.',
      options: [
        {
          id: 'quick_input',
          label: 'Quick explanation',
          icon: '💡',
          description: 'Brief text to help me understand',
          action: 'text_input',
          placeholder: 'Here's what this means...',
          maxLength: 500
        },
        {
          id: 'detailed_source',
          label: 'Detailed source',
          icon: '📄',
          description: 'Document or link with more information',
          action: 'source_input',
          accepts: ['text', 'link', 'any']
        },
        {
          id: 'explore_together',
          label: 'Explore together',
          icon: '🔍',
          description: "Let's figure this out collaboratively",
          action: 'exploratory',
          mode: 'collaborative'
        },
        {
          id: 'skip',
          label: 'Skip for now',
          icon: '⏭️',
          action: 'skip'
        }
      ],
      ui: {
        background: 'rgba(34, 197, 94, 0.05)',
        borderStyle: 'dashed',
        borderColor: '#22c55e'
      }
    };
  }

  // Process user's enrichment response
  async processEnrichment(enrichmentId, userChoice, data, context) {
    const enrichmentRequest = this.enrichmentQueue.get(enrichmentId);
    if (!enrichmentRequest) return;

    switch (userChoice.action) {
      case 'text_input':
        return await this.processTextEnrichment(enrichmentRequest, data, context);

      case 'source_input':
        return await this.processSourceEnrichment(enrichmentRequest, data, context);

      case 'conversational':
      case 'exploratory':
        return await this.processConversationalEnrichment(enrichmentRequest, data, context);

      case 'correction':
        return await this.processCorrectionEnrichment(enrichmentRequest, data, context);

      case 'skip':
        return this.processSkip(enrichmentRequest, context);

      default:
        return null;
    }
  }

  async processTextEnrichment(request, text, context) {
    // Validate the text
    const validation = await this.validateEnrichmentText(text, request.query);

    if (!validation.valid) {
      return {
        success: false,
        message: 'The provided text seems unrelated to the query.',
        suggestion: 'Please provide information directly related to: ' + request.query
      };
    }

    // Store in field DB
    const entry = {
      content: text,
      query: request.query,
      source: `user:${context.userId}`,
      type: 'enrichment',
      trust: this.calculateTrustScore(context.userId),
      category: request.mode,
      timestamp: Date.now(),
      metadata: {
        enrichmentId: request.id,
        coverage: request.coverage,
        validated: validation.score
      }
    };

    await this.fieldDB.insert(entry);

    // Track user contribution
    this.trackUserContribution(context.userId, entry);

    return {
      success: true,
      message: 'Thank you! Your knowledge helps me serve you better.',
      impact: await this.calculateEnrichmentImpact(request.query),
      entry
    };
  }

  async processSourceEnrichment(request, source, context) {
    let content;

    // Process different source types
    if (source.type === 'link') {
      content = await this.fetchAndProcessLink(source.url);
    } else if (source.type === 'document') {
      content = await this.processDocument(source.data);
    } else {
      content = source.text;
    }

    // Validate relevance
    const validation = await this.validateSourceContent(content, request.query);

    if (!validation.valid) {
      return {
        success: false,
        message: 'The source seems unrelated to the query.',
        suggestion: 'Please provide a source about: ' + request.query
      };
    }

    // Extract and store relevant snippets
    const snippets = await this.extractRelevantSnippets(content, request.query);

    for (const snippet of snippets) {
      await this.fieldDB.insert({
        content: snippet.text,
        query: request.query,
        source: source.type === 'link' ? source.url : `user:${context.userId}`,
        type: 'enrichment_source',
        trust: this.calculateSourceTrust(source, context),
        category: request.mode,
        timestamp: Date.now(),
        metadata: {
          enrichmentId: request.id,
          sourceType: source.type,
          relevance: snippet.relevance
        }
      });
    }

    return {
      success: true,
      message: 'Source processed successfully!',
      snippetsExtracted: snippets.length,
      impact: await this.calculateEnrichmentImpact(request.query)
    };
  }

  async processConversationalEnrichment(request, conversation, context) {
    // This starts a guided conversation to extract knowledge
    return {
      type: 'conversational_enrichment',
      mode: 'active',
      messages: [
        {
          role: 'assistant',
          content: request.mode === 'sacred'
            ? "I'd like to learn from your spiritual perspective. What tradition or understanding guides you here?"
            : "Help me understand this better. What's your experience or knowledge about this?"
        }
      ],
      callbacks: {
        onMessage: async (message) => {
          // Process each message in the conversation
          const extracted = await this.extractKnowledgeFromConversation(message, request.query);

          if (extracted.valuable) {
            await this.fieldDB.insert({
              content: extracted.knowledge,
              query: request.query,
              source: `conversation:${context.userId}`,
              type: 'enrichment_conversational',
              trust: 0.7,
              category: request.mode,
              timestamp: Date.now()
            });
          }

          return extracted.response;
        }
      }
    };
  }

  async processCorrectionEnrichment(request, correction, context) {
    // User is correcting our understanding
    const original = correction.original;
    const corrected = correction.corrected;

    // Store the correction
    await this.fieldDB.insert({
      content: corrected,
      query: request.query,
      source: `correction:${context.userId}`,
      type: 'enrichment_correction',
      trust: 0.9, // High trust for direct corrections
      category: request.mode,
      timestamp: Date.now(),
      metadata: {
        original,
        correction: corrected,
        enrichmentId: request.id
      }
    });

    // Mark the original as incorrect
    await this.fieldDB.markAsIncorrect(original, context.userId);

    return {
      success: true,
      message: 'Thank you for the correction! I've updated my understanding.',
      impact: 'high'
    };
  }

  processSkip(request, context) {
    // User chose to skip enrichment
    this.recordSkip(request.query, context.userId);

    return {
      success: true,
      skipped: true,
      fallbackMode: 'EXPLORATORY',
      message: "Let's explore this together with what we know."
    };
  }

  // Helper methods
  hasRecentlyAsked(query, userId) {
    const key = `${userId}:${this.normalizeQuery(query)}`;
    const lastAsked = this.enrichmentQueue.get(key);

    if (!lastAsked) return false;

    const hoursSinceAsked = (Date.now() - lastAsked.timestamp) / (1000 * 60 * 60);
    return hoursSinceAsked < 24; // Don't ask about same topic within 24 hours
  }

  recordEnrichmentRequest(query, userId) {
    const key = `${userId}:${this.normalizeQuery(query)}`;
    this.enrichmentQueue.set(key, {
      query,
      userId,
      timestamp: Date.now()
    });
  }

  normalizeQuery(query) {
    return query.toLowerCase().replace(/[^\w\s]/g, '').trim();
  }

  assessQueryRisk(query, context) {
    // Simplified risk assessment
    const lowerQuery = query.toLowerCase();

    if (context.sacredMode || lowerQuery.match(/spiritual|sacred|divine|soul|prayer/)) {
      return 'sacred';
    }
    if (context.personalMode || lowerQuery.match(/my|personal|private/)) {
      return 'personal';
    }
    return 'general';
  }

  calculateTrustScore(userId) {
    const contributions = this.userContributions.get(userId) || [];
    const validContributions = contributions.filter(c => c.validated).length;
    const totalContributions = contributions.length;

    if (totalContributions === 0) return 0.5; // Baseline trust

    return Math.min(0.9, 0.5 + (validContributions / totalContributions) * 0.4);
  }

  calculateSourceTrust(source, context) {
    let trust = 0.5; // Baseline

    // Boost for known good domains
    const trustedDomains = ['wikipedia.org', 'stanford.edu', 'mit.edu', 'nature.com'];
    if (source.type === 'link' && trustedDomains.some(d => source.url.includes(d))) {
      trust += 0.3;
    }

    // Boost for user history
    const userTrust = this.calculateTrustScore(context.userId);
    trust = trust * 0.7 + userTrust * 0.3;

    return Math.min(0.95, trust);
  }

  async validateEnrichmentText(text, query) {
    // Check if text is relevant to query
    const relevance = await this.verifier.calculateRelevance(text, query);

    return {
      valid: relevance > 0.3,
      score: relevance
    };
  }

  async validateSourceContent(content, query) {
    // More thorough validation for source content
    const relevance = await this.verifier.calculateRelevance(content, query);
    const quality = this.assessContentQuality(content);

    return {
      valid: relevance > 0.4 && quality > 0.5,
      relevance,
      quality
    };
  }

  assessContentQuality(content) {
    // Simple quality metrics
    const length = content.length;
    const sentences = content.split(/[.!?]/).length;
    const avgSentenceLength = length / sentences;

    // Quality indicators
    let quality = 0.5;

    if (length > 100 && length < 10000) quality += 0.2;
    if (avgSentenceLength > 10 && avgSentenceLength < 50) quality += 0.2;
    if (content.match(/\b(because|therefore|however|moreover)\b/gi)) quality += 0.1;

    return Math.min(1.0, quality);
  }

  async extractRelevantSnippets(content, query) {
    // Break content into snippets and rank by relevance
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
    const snippets = [];

    for (const sentence of sentences) {
      const relevance = await this.verifier.calculateRelevance(sentence, query);

      if (relevance > 0.5) {
        snippets.push({
          text: sentence.trim(),
          relevance
        });
      }
    }

    // Return top 5 most relevant
    return snippets
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5);
  }

  async calculateEnrichmentImpact(query) {
    // Check how much coverage improved
    const newCoverage = await this.fieldDB.calculateCoverage(query);

    return {
      coverageBefore: this.lastCoverage || 0,
      coverageAfter: newCoverage,
      improvement: newCoverage - (this.lastCoverage || 0),
      status: newCoverage > 0.5 ? 'sufficient' : 'needs_more'
    };
  }

  trackUserContribution(userId, entry) {
    if (!this.userContributions.has(userId)) {
      this.userContributions.set(userId, []);
    }

    this.userContributions.get(userId).push({
      entryId: entry.id,
      timestamp: entry.timestamp,
      validated: entry.metadata?.validated || false,
      type: entry.type
    });
  }

  recordSkip(query, userId) {
    // Track skips to identify patterns
    const key = `skip:${userId}:${this.normalizeQuery(query)}`;
    this.enrichmentQueue.set(key, {
      action: 'skip',
      timestamp: Date.now()
    });
  }

  async fetchAndProcessLink(url) {
    // Placeholder for link fetching
    // In production, use proper web scraping
    return `Content from ${url}`;
  }

  async processDocument(documentData) {
    // Placeholder for document processing
    // In production, use proper document parsing
    return `Processed document content`;
  }

  async extractKnowledgeFromConversation(message, query) {
    // Extract valuable knowledge from conversational enrichment
    const relevance = await this.verifier.calculateRelevance(message, query);

    return {
      valuable: relevance > 0.4,
      knowledge: message,
      response: relevance > 0.4
        ? "That's helpful! Tell me more about that aspect."
        : "I see. Is there another angle to this?"
    };
  }
}

module.exports = { ActiveEnrichmentUI };