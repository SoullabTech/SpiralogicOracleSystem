// Ambiguous Risk Resolver for ARIA
// Handles edge cases where creative meets sacred, personal overlaps with advice

class AmbiguousRiskResolver {
  constructor(verifier, userPreferences) {
    this.verifier = verifier;
    this.userPreferences = userPreferences;

    // Feature detection thresholds
    this.thresholds = {
      sacredMarkers: 0.3,
      creativeMarkers: 0.3,
      personalMarkers: 0.4,
      adviceMarkers: 0.3,
      ambiguityThreshold: 0.6 // Combined threshold for ambiguity detection
    };

    // Risk resolution strategies
    this.strategies = {
      USER_CHOICE: 'user_choice',
      BIAS_SAFETY: 'bias_safety',
      CONTEXT_BASED: 'context_based',
      HISTORICAL: 'historical'
    };
  }

  // Main resolution method
  async resolveRisk(message, context, userHistory) {
    // Extract features from the message
    const features = await this.extractFeatures(message, context);

    // Check for ambiguity
    const ambiguityScore = this.calculateAmbiguity(features);

    if (ambiguityScore < this.thresholds.ambiguityThreshold) {
      // Not ambiguous - use standard classification
      return this.standardClassification(features);
    }

    // Ambiguous case - needs special handling
    const resolution = await this.resolveAmbiguous(features, context, userHistory);

    return resolution;
  }

  // Feature extraction
  async extractFeatures(message, context) {
    const features = {
      // Language markers
      sacredMarkers: this.detectSacredLanguage(message),
      creativeMarkers: this.detectCreativeIntent(message),
      personalMarkers: this.detectPersonalContext(message),
      adviceMarkers: this.detectAdviceSeeking(message),

      // Context signals
      hasPersonalData: this.detectPII(message),
      downstreamAction: this.detectDownstreamAction(message),
      emotionalIntensity: this.detectEmotionalIntensity(message),

      // User context
      userMode: context.currentMode,
      conversationDepth: context.turnCount || 1,
      previousRisk: context.previousRiskLevel,

      // Semantic features
      topics: await this.extractTopics(message),
      entities: await this.extractEntities(message),
      intent: await this.classifyIntent(message)
    };

    return features;
  }

  // Language detection methods
  detectSacredLanguage(message) {
    const sacredTerms = [
      'spiritual', 'sacred', 'divine', 'soul', 'prayer', 'meditation',
      'god', 'goddess', 'deity', 'worship', 'faith', 'blessing',
      'enlightenment', 'transcendent', 'holy', 'ritual', 'ceremony',
      'afterlife', 'eternal', 'karma', 'dharma', 'chakra'
    ];

    const lowerMessage = message.toLowerCase();
    let score = 0;

    sacredTerms.forEach(term => {
      if (lowerMessage.includes(term)) {
        score += 0.15;
      }
    });

    // Check for sacred patterns
    if (lowerMessage.match(/what happens when we die/i)) score += 0.3;
    if (lowerMessage.match(/meaning of life/i)) score += 0.25;
    if (lowerMessage.match(/my spiritual|my faith/i)) score += 0.35;

    return Math.min(1.0, score);
  }

  detectCreativeIntent(message) {
    const creativeTerms = [
      'create', 'imagine', 'design', 'invent', 'brainstorm', 'explore',
      'what if', 'suppose', 'fantasy', 'story', 'poem', 'art',
      'music', 'compose', 'write', 'draw', 'build', 'craft'
    ];

    const lowerMessage = message.toLowerCase();
    let score = 0;

    creativeTerms.forEach(term => {
      if (lowerMessage.includes(term)) {
        score += 0.12;
      }
    });

    // Creative patterns
    if (lowerMessage.match(/help me (create|write|design|imagine)/i)) score += 0.3;
    if (lowerMessage.match(/let's explore|let's play/i)) score += 0.25;
    if (lowerMessage.includes('?') && lowerMessage.includes('could')) score += 0.1;

    return Math.min(1.0, score);
  }

  detectPersonalContext(message) {
    const personalTerms = [
      'my', 'me', 'i', 'myself', 'mine', 'personal', 'private',
      'family', 'relationship', 'health', 'career', 'life'
    ];

    const lowerMessage = message.toLowerCase();
    let score = 0;

    // Count personal pronouns
    const personalPronounCount = (lowerMessage.match(/\b(i|me|my|myself|mine)\b/gi) || []).length;
    score += personalPronounCount * 0.1;

    // Personal context patterns
    if (lowerMessage.match(/my (life|situation|problem|issue)/i)) score += 0.3;
    if (lowerMessage.match(/should i|what should i/i)) score += 0.25;
    if (lowerMessage.match(/help me with my/i)) score += 0.35;

    return Math.min(1.0, score);
  }

  detectAdviceSeeking(message) {
    const advicePatterns = [
      /should i/i,
      /what (should|would|could) i/i,
      /how (do|can|should) i/i,
      /is it (good|bad|wise|safe) to/i,
      /what do you (think|recommend|suggest)/i,
      /need (advice|guidance|help)/i
    ];

    let score = 0;
    advicePatterns.forEach(pattern => {
      if (message.match(pattern)) {
        score += 0.25;
      }
    });

    return Math.min(1.0, score);
  }

  detectPII(message) {
    // Simplified PII detection
    const patterns = [
      /\b[A-Z][a-z]+ [A-Z][a-z]+\b/, // Names
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN pattern
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
      /\b\d{1,5}\s\w+\s(Street|St|Avenue|Ave|Road|Rd)\b/i // Address
    ];

    return patterns.some(pattern => message.match(pattern));
  }

  detectDownstreamAction(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.match(/invest|money|financial|pay|buy|sell/i)) {
      return 'finance';
    }
    if (lowerMessage.match(/health|medical|doctor|symptom|medicine|treatment/i)) {
      return 'health';
    }
    if (lowerMessage.match(/legal|law|court|contract|rights/i)) {
      return 'legal';
    }
    if (lowerMessage.match(/decide|choice|decision|choose/i)) {
      return 'decision';
    }

    return 'none';
  }

  detectEmotionalIntensity(message) {
    const intenseEmotions = [
      'desperate', 'suicidal', 'dying', 'kill', 'hate', 'love',
      'terrified', 'panic', 'crisis', 'emergency', 'urgent'
    ];

    const lowerMessage = message.toLowerCase();
    let intensity = 0;

    intenseEmotions.forEach(emotion => {
      if (lowerMessage.includes(emotion)) {
        intensity += 0.3;
      }
    });

    // Exclamation marks indicate intensity
    intensity += (message.match(/!/g) || []).length * 0.1;

    // All caps indicates intensity
    if (message === message.toUpperCase() && message.length > 10) {
      intensity += 0.3;
    }

    return Math.min(1.0, intensity);
  }

  // Ambiguity calculation
  calculateAmbiguity(features) {
    // Count how many risk categories have significant scores
    const significantCategories = [];

    if (features.sacredMarkers > this.thresholds.sacredMarkers) {
      significantCategories.push('sacred');
    }
    if (features.creativeMarkers > this.thresholds.creativeMarkers) {
      significantCategories.push('creative');
    }
    if (features.personalMarkers > this.thresholds.personalMarkers) {
      significantCategories.push('personal');
    }
    if (features.adviceMarkers > this.thresholds.adviceMarkers) {
      significantCategories.push('advice');
    }

    // Ambiguity increases with multiple significant categories
    if (significantCategories.length <= 1) {
      return 0; // Not ambiguous
    }

    // Calculate ambiguity score
    let ambiguityScore = significantCategories.length * 0.3;

    // Special case: creative + sacred is highly ambiguous
    if (significantCategories.includes('sacred') && significantCategories.includes('creative')) {
      ambiguityScore += 0.3;
    }

    // Personal + advice is moderately ambiguous
    if (significantCategories.includes('personal') && significantCategories.includes('advice')) {
      ambiguityScore += 0.2;
    }

    return Math.min(1.0, ambiguityScore);
  }

  // Ambiguous case resolution
  async resolveAmbiguous(features, context, userHistory) {
    // Try different strategies in order
    const strategies = [
      () => this.resolveByUserHistory(features, userHistory),
      () => this.resolveByContext(features, context),
      () => this.resolveBySafety(features),
      () => this.askUserToChoose(features)
    ];

    for (const strategy of strategies) {
      const result = await strategy();
      if (result.resolved) {
        return result;
      }
    }

    // Fallback: bias toward safety
    return this.resolveBySafety(features);
  }

  // Resolution strategies
  async resolveByUserHistory(features, userHistory) {
    if (!userHistory || userHistory.interactions < 10) {
      return { resolved: false };
    }

    // Check user's historical preferences
    const preferences = await this.userPreferences.getPreferences(userHistory.userId);

    if (preferences.preferredMode) {
      return {
        resolved: true,
        risk: preferences.preferredMode,
        confidence: 0.8,
        strategy: this.strategies.HISTORICAL,
        message: `Based on your history, treating as ${preferences.preferredMode}`
      };
    }

    // Check patterns in user's past interactions
    const pattern = this.detectUserPattern(userHistory);
    if (pattern.confidence > 0.7) {
      return {
        resolved: true,
        risk: pattern.mode,
        confidence: pattern.confidence,
        strategy: this.strategies.HISTORICAL
      };
    }

    return { resolved: false };
  }

  resolveByContext(features, context) {
    // Use conversation context to resolve
    if (context.previousRiskLevel && context.turnCount > 2) {
      // Continue with previous risk level if conversation is established
      return {
        resolved: true,
        risk: context.previousRiskLevel,
        confidence: 0.75,
        strategy: this.strategies.CONTEXT_BASED,
        message: `Continuing in ${context.previousRiskLevel} mode`
      };
    }

    // Check for explicit mode indicators
    if (context.currentMode) {
      return {
        resolved: true,
        risk: this.mapModeToRisk(context.currentMode),
        confidence: 0.85,
        strategy: this.strategies.CONTEXT_BASED
      };
    }

    return { resolved: false };
  }

  resolveBySafety(features) {
    // Bias toward safety when uncertain
    let safeRisk = 'advice'; // Default safe level

    // Escalate based on features
    if (features.emotionalIntensity > 0.7) {
      safeRisk = 'personal';
    }
    if (features.sacredMarkers > 0.5) {
      safeRisk = 'sacred';
    }
    if (features.downstreamAction !== 'none') {
      safeRisk = 'personal';
    }
    if (features.hasPersonalData) {
      safeRisk = 'personal';
    }

    return {
      resolved: true,
      risk: safeRisk,
      confidence: 0.6,
      strategy: this.strategies.BIAS_SAFETY,
      message: `Uncertain context - using ${safeRisk} mode for safety`
    };
  }

  askUserToChoose(features) {
    // Generate user choice interface
    const options = this.generateModeOptions(features);

    return {
      resolved: true,
      risk: 'ambiguous',
      requiresUserInput: true,
      strategy: this.strategies.USER_CHOICE,
      ui: {
        type: 'mode_selector',
        message: this.generateAmbiguityMessage(features),
        options,
        callback: 'resolveWithUserChoice'
      }
    };
  }

  // Helper methods
  generateAmbiguityMessage(features) {
    const categories = [];

    if (features.sacredMarkers > this.thresholds.sacredMarkers) {
      categories.push('spiritual exploration');
    }
    if (features.creativeMarkers > this.thresholds.creativeMarkers) {
      categories.push('creative work');
    }
    if (features.personalMarkers > this.thresholds.personalMarkers) {
      categories.push('personal guidance');
    }

    if (categories.length === 2) {
      return `This seems to blend ${categories[0]} and ${categories[1]}. How would you like me to approach it?`;
    } else {
      return `I notice elements of ${categories.join(', ')}. Which lens should I use?`;
    }
  }

  generateModeOptions(features) {
    const options = [];

    if (features.sacredMarkers > this.thresholds.sacredMarkers) {
      options.push({
        id: 'sacred',
        label: 'Sacred Guidance',
        icon: '🕊️',
        description: 'Approach with reverence and spiritual sensitivity',
        confidence: 0.95 // Will require 95% confidence
      });
    }

    if (features.creativeMarkers > this.thresholds.creativeMarkers) {
      options.push({
        id: 'creative',
        label: 'Creative Exploration',
        icon: '🎨',
        description: 'Free exploration with imagination',
        confidence: 0.4 // Low threshold for creativity
      });
    }

    if (features.personalMarkers > this.thresholds.personalMarkers) {
      options.push({
        id: 'personal',
        label: 'Personal Advice',
        icon: '💭',
        description: 'Careful guidance for your situation',
        confidence: 0.8
      });
    }

    // Always include balanced option
    options.push({
      id: 'balanced',
      label: 'Balanced Approach',
      icon: '⚖️',
      description: 'Blend appropriate elements',
      confidence: 0.7
    });

    return options;
  }

  standardClassification(features) {
    // Clear classification when not ambiguous
    if (features.sacredMarkers > 0.6) return { risk: 'sacred', confidence: 0.9 };
    if (features.downstreamAction === 'health' || features.downstreamAction === 'finance') {
      return { risk: 'personal', confidence: 0.85 };
    }
    if (features.personalMarkers > 0.6 && features.adviceMarkers > 0.5) {
      return { risk: 'personal', confidence: 0.8 };
    }
    if (features.creativeMarkers > 0.6) return { risk: 'creative', confidence: 0.85 };
    if (features.adviceMarkers > 0.5) return { risk: 'advice', confidence: 0.75 };

    return { risk: 'general', confidence: 0.7 };
  }

  detectUserPattern(userHistory) {
    // Analyze user's historical interactions for patterns
    const modeFrequency = {};

    userHistory.interactions.forEach(interaction => {
      const mode = interaction.riskLevel || 'general';
      modeFrequency[mode] = (modeFrequency[mode] || 0) + 1;
    });

    // Find dominant mode
    let dominantMode = 'general';
    let maxCount = 0;

    Object.entries(modeFrequency).forEach(([mode, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantMode = mode;
      }
    });

    const confidence = maxCount / userHistory.interactions.length;

    return { mode: dominantMode, confidence };
  }

  mapModeToRisk(mode) {
    const mapping = {
      VERIFIED: 'advice',
      LIKELY: 'advice',
      HYPOTHESIS: 'general',
      EXPLORATORY: 'creative',
      RITUAL_SAFE: 'sacred'
    };

    return mapping[mode] || 'general';
  }

  // Advanced topic and entity extraction (simplified)
  async extractTopics(message) {
    // In production, use NLP library or API
    const topics = [];

    if (message.match(/spiritual|faith|religion/i)) topics.push('spirituality');
    if (message.match(/create|art|music|write/i)) topics.push('creativity');
    if (message.match(/relationship|family|friend/i)) topics.push('relationships');
    if (message.match(/work|career|job/i)) topics.push('career');
    if (message.match(/health|wellness|fitness/i)) topics.push('health');

    return topics;
  }

  async extractEntities(message) {
    // Simplified entity extraction
    const entities = [];

    // Extract capitalized words as potential entities
    const matches = message.match(/[A-Z][a-z]+/g) || [];
    matches.forEach(match => {
      if (match.length > 2) {
        entities.push({ text: match, type: 'name' });
      }
    });

    return entities;
  }

  async classifyIntent(message) {
    // Simplified intent classification
    if (message.includes('?')) {
      if (message.match(/what|why|how|when|where|who/i)) {
        return 'question';
      }
    }

    if (message.match(/help|assist|support/i)) {
      return 'request_help';
    }

    if (message.match(/create|make|build|write/i)) {
      return 'create';
    }

    return 'statement';
  }

  // User choice resolution
  async resolveWithUserChoice(choice, features, context) {
    const riskLevel = choice.id === 'balanced'
      ? this.calculateBalancedRisk(features)
      : choice.id;

    return {
      resolved: true,
      risk: riskLevel,
      confidence: choice.confidence,
      strategy: this.strategies.USER_CHOICE,
      userSelected: true,
      message: `Proceeding in ${choice.label} mode as requested`
    };
  }

  calculateBalancedRisk(features) {
    // Create balanced risk based on feature weights
    const scores = {
      sacred: features.sacredMarkers * 0.9,
      personal: features.personalMarkers * 0.8,
      advice: features.adviceMarkers * 0.7,
      creative: features.creativeMarkers * 0.4
    };

    // Return highest scoring category
    return Object.entries(scores)
      .sort(([, a], [, b]) => b - a)[0][0];
  }
}

module.exports = { AmbiguousRiskResolver };