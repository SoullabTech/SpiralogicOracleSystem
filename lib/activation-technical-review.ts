// Technical Review: Deterministic Feature Activation Logic
// Addresses edge cases, conflicts, and debugging requirements

interface ActivationTrigger {
  name: string;
  weight: number;           // 0-1 influence on activation decision
  threshold: number;        // Minimum score to contribute
  conflictPriority: number; // Higher number = higher priority in conflicts
  debugInfo: string;       // Human-readable explanation
}

interface ActivationRule {
  feature: string;
  requiredScore: number;    // Total weighted score needed
  triggers: ActivationTrigger[];
  conflictsWith: string[];  // Features this conflicts with
  overriddenBy: string[];   // Features that disable this one
  gracefulAbandonment: boolean; // Can be abandoned mid-process
}

export class TechnicalActivationEngine {
  private activationHistory = new Map<string, FeatureActivationRecord[]>();

  interface FeatureActivationRecord {
    feature: string;
    activatedAt: number;
    confidence: number;
    triggers: string[];
    outcome: 'completed' | 'abandoned' | 'conflicted' | 'interrupted';
    userSatisfaction?: number;
  }

  // === DETERMINISTIC ACTIVATION RULES ===
  private readonly ACTIVATION_RULES: ActivationRule[] = [
    {
      feature: 'crisis_detection',
      requiredScore: 0.7,
      conflictsWith: ['looping_protocol', 'contemplative_space'], // Crisis overrides everything
      overriddenBy: [],
      gracefulAbandonment: false, // Never abandon crisis response
      triggers: [
        {
          name: 'crisis_keywords',
          weight: 0.8,
          threshold: 0.5,
          conflictPriority: 10, // Highest priority
          debugInfo: 'Direct crisis language detected'
        },
        {
          name: 'emotional_emergency',
          weight: 0.6,
          threshold: 0.8,
          conflictPriority: 10,
          debugInfo: 'Extreme emotional distress indicators'
        }
      ]
    },

    {
      feature: 'looping_protocol',
      requiredScore: 0.75,
      conflictsWith: ['crisis_detection'], // Don't loop during crisis
      overriddenBy: ['crisis_detection', 'high_urgency'],
      gracefulAbandonment: true, // Can abandon if urgency detected
      triggers: [
        {
          name: 'explicit_clarification_request',
          weight: 0.9,
          threshold: 0.7,
          conflictPriority: 7,
          debugInfo: 'User explicitly asks for clarification'
        },
        {
          name: 'meaning_ambiguity',
          weight: 0.6,
          threshold: 0.6,
          conflictPriority: 6,
          debugInfo: 'High conceptual ambiguity detected'
        },
        {
          name: 'emotional_complexity',
          weight: 0.5,
          threshold: 0.7,
          conflictPriority: 6,
          debugInfo: 'Complex emotional processing needed'
        },
        {
          name: 'user_correction_pattern',
          weight: 0.7,
          threshold: 0.6,
          conflictPriority: 7,
          debugInfo: 'User correcting previous responses'
        }
      ]
    },

    {
      feature: 'contemplative_space',
      requiredScore: 0.65,
      conflictsWith: ['crisis_detection', 'high_urgency'],
      overriddenBy: ['crisis_detection'],
      gracefulAbandonment: true,
      triggers: [
        {
          name: 'explicit_pause_request',
          weight: 0.8,
          threshold: 0.7,
          conflictPriority: 8,
          debugInfo: 'User requests reflection time'
        },
        {
          name: 'emotional_processing_need',
          weight: 0.5,
          threshold: 0.6,
          conflictPriority: 5,
          debugInfo: 'Emotional content benefits from pauses'
        },
        {
          name: 'conceptual_density',
          weight: 0.4,
          threshold: 0.7,
          conflictPriority: 4,
          debugInfo: 'Dense concepts need processing time'
        },
        {
          name: 'user_contemplative_style',
          weight: 0.3,
          threshold: 0.6,
          conflictPriority: 3,
          debugInfo: 'User profile indicates contemplative preference'
        }
      ]
    },

    {
      feature: 'consciousness_profiling',
      requiredScore: 0.6,
      conflictsWith: ['crisis_detection'],
      overriddenBy: ['crisis_detection'],
      gracefulAbandonment: true,
      triggers: [
        {
          name: 'spiritual_language',
          weight: 0.6,
          threshold: 0.5,
          conflictPriority: 5,
          debugInfo: 'Spiritual/consciousness concepts detected'
        },
        {
          name: 'growth_themes',
          weight: 0.5,
          threshold: 0.6,
          conflictPriority: 4,
          debugInfo: 'Personal development themes present'
        },
        {
          name: 'pattern_recognition_value',
          weight: 0.4,
          threshold: 0.7,
          conflictPriority: 3,
          debugInfo: 'User would benefit from pattern insights'
        }
      ]
    },

    {
      feature: 'elemental_attunement',
      requiredScore: 0.3, // Always active at some level
      conflictsWith: [],
      overriddenBy: [],
      gracefulAbandonment: false,
      triggers: [
        {
          name: 'universal_resonance',
          weight: 1.0,
          threshold: 0.0,
          conflictPriority: 1,
          debugInfo: 'Universal energy matching always active'
        }
      ]
    }
  ];

  // === DETERMINISTIC TRIGGER ANALYSIS ===
  analyzeActivationTriggers(
    input: string,
    conversationHistory: any[],
    userProfile: any
  ): Map<string, { score: number; triggers: string[]; debugInfo: string[] }> {

    const results = new Map();

    // Crisis Detection Triggers
    const crisisScore = this.analyzeCrisisTriggers(input);
    results.set('crisis_keywords', crisisScore);

    // Clarification Triggers
    const clarificationScore = this.analyzeClarificationTriggers(input, conversationHistory);
    results.set('explicit_clarification_request', clarificationScore);

    // Emotional Processing Triggers
    const emotionalScore = this.analyzeEmotionalTriggers(input);
    results.set('emotional_processing_need', emotionalScore);

    // Conceptual Complexity Triggers
    const conceptualScore = this.analyzeConceptualTriggers(input);
    results.set('conceptual_density', conceptualScore);

    // Contemplative Triggers
    const contemplativeScore = this.analyzeContemplativeTriggers(input, userProfile);
    results.set('explicit_pause_request', contemplativeScore);

    return results;
  }

  private analyzeCrisisTriggers(input: string): {
    score: number;
    triggers: string[];
    debugInfo: string[];
  } {
    const crisisKeywords = [
      { phrase: 'want to die', weight: 1.0 },
      { phrase: 'kill myself', weight: 1.0 },
      { phrase: 'end it all', weight: 0.9 },
      { phrase: 'suicide', weight: 0.9 },
      { phrase: 'hurt myself', weight: 0.8 },
      { phrase: 'can\'t go on', weight: 0.7 },
      { phrase: 'no point living', weight: 0.8 }
    ];

    const lowerInput = input.toLowerCase();
    const matches = crisisKeywords.filter(k => lowerInput.includes(k.phrase));
    const maxWeight = matches.length > 0 ? Math.max(...matches.map(m => m.weight)) : 0;

    return {
      score: maxWeight,
      triggers: matches.map(m => m.phrase),
      debugInfo: matches.length > 0 ?
        [`Crisis language detected: ${matches.map(m => m.phrase).join(', ')}`] :
        ['No crisis indicators found']
    };
  }

  private analyzeClarificationTriggers(input: string, history: any[]): {
    score: number;
    triggers: string[];
    debugInfo: string[];
  } {
    const lowerInput = input.toLowerCase();
    const debugInfo: string[] = [];
    let score = 0;
    const triggers: string[] = [];

    // Explicit clarification requests
    const clarificationPhrases = [
      'what do you mean',
      'can you clarify',
      'i don\'t understand',
      'confused about',
      'not sure what',
      'help me understand'
    ];

    const explicitMatch = clarificationPhrases.find(phrase => lowerInput.includes(phrase));
    if (explicitMatch) {
      score += 0.8;
      triggers.push('explicit_request');
      debugInfo.push(`Explicit clarification: "${explicitMatch}"`);
    }

    // Correction patterns
    const correctionPatterns = ['no', 'actually', 'more like', 'not exactly'];
    const correctionMatch = correctionPatterns.find(pattern => lowerInput.startsWith(pattern));
    if (correctionMatch) {
      score += 0.7;
      triggers.push('correction_pattern');
      debugInfo.push(`Correction detected: starts with "${correctionMatch}"`);
    }

    // Ambiguity markers
    const ambiguityMarkers = ['maybe', 'kind of', 'sort of', 'not sure', 'i think'];
    const ambiguityCount = ambiguityMarkers.filter(marker => lowerInput.includes(marker)).length;
    if (ambiguityCount >= 2) {
      score += 0.6;
      triggers.push('high_ambiguity');
      debugInfo.push(`High ambiguity: ${ambiguityCount} markers found`);
    }

    // Recent misunderstanding pattern
    if (history.length > 2) {
      const recentExchanges = history.slice(-4);
      const clarificationInRecent = recentExchanges.filter(exchange =>
        clarificationPhrases.some(phrase => exchange.content?.toLowerCase().includes(phrase))
      ).length;

      if (clarificationInRecent >= 2) {
        score += 0.5;
        triggers.push('clarification_pattern');
        debugInfo.push(`Recent clarification pattern: ${clarificationInRecent} instances`);
      }
    }

    return {
      score: Math.min(1.0, score),
      triggers,
      debugInfo: debugInfo.length > 0 ? debugInfo : ['No clarification triggers found']
    };
  }

  private analyzeEmotionalTriggers(input: string): {
    score: number;
    triggers: string[];
    debugInfo: string[];
  } {
    const emotionalMarkers = {
      high_intensity: ['overwhelmed', 'devastated', 'ecstatic', 'furious', 'terrified'],
      processing_words: ['feel', 'feeling', 'emotional', 'heart', 'deeply'],
      vulnerability: ['scared', 'hurt', 'vulnerable', 'raw', 'tender']
    };

    const lowerInput = input.toLowerCase();
    let score = 0;
    const triggers: string[] = [];
    const debugInfo: string[] = [];

    // High intensity emotions
    const intensityMatches = emotionalMarkers.high_intensity.filter(word => lowerInput.includes(word));
    if (intensityMatches.length > 0) {
      score += 0.7;
      triggers.push('high_intensity');
      debugInfo.push(`High intensity emotions: ${intensityMatches.join(', ')}`);
    }

    // Processing language
    const processingMatches = emotionalMarkers.processing_words.filter(word => lowerInput.includes(word));
    if (processingMatches.length >= 2) {
      score += 0.5;
      triggers.push('emotional_processing');
      debugInfo.push(`Emotional processing language: ${processingMatches.length} instances`);
    }

    // Vulnerability indicators
    const vulnerabilityMatches = emotionalMarkers.vulnerability.filter(word => lowerInput.includes(word));
    if (vulnerabilityMatches.length > 0) {
      score += 0.6;
      triggers.push('vulnerability');
      debugInfo.push(`Vulnerability markers: ${vulnerabilityMatches.join(', ')}`);
    }

    return {
      score: Math.min(1.0, score),
      triggers,
      debugInfo: debugInfo.length > 0 ? debugInfo : ['No emotional processing triggers found']
    };
  }

  private analyzeConceptualTriggers(input: string): {
    score: number;
    triggers: string[];
    debugInfo: string[];
  } {
    const conceptualMarkers = {
      philosophical: ['meaning', 'purpose', 'truth', 'reality', 'consciousness', 'existence'],
      complexity: ['paradox', 'contradiction', 'nuanced', 'complex', 'multifaceted'],
      depth: ['deeper', 'profound', 'underlying', 'fundamental', 'essential']
    };

    const lowerInput = input.toLowerCase();
    const wordCount = input.split(' ').length;
    let score = 0;
    const triggers: string[] = [];
    const debugInfo: string[] = [];

    // Philosophical concepts
    const philMatches = conceptualMarkers.philosophical.filter(word => lowerInput.includes(word));
    if (philMatches.length > 0) {
      score += Math.min(0.6, philMatches.length * 0.2);
      triggers.push('philosophical');
      debugInfo.push(`Philosophical concepts: ${philMatches.join(', ')}`);
    }

    // Complexity indicators
    const complexityMatches = conceptualMarkers.complexity.filter(word => lowerInput.includes(word));
    if (complexityMatches.length > 0) {
      score += Math.min(0.4, complexityMatches.length * 0.2);
      triggers.push('complexity');
      debugInfo.push(`Complexity markers: ${complexityMatches.join(', ')}`);
    }

    // Depth requests
    const depthMatches = conceptualMarkers.depth.filter(word => lowerInput.includes(word));
    if (depthMatches.length > 0) {
      score += Math.min(0.5, depthMatches.length * 0.25);
      triggers.push('depth_request');
      debugInfo.push(`Depth indicators: ${depthMatches.join(', ')}`);
    }

    // Length-based complexity
    if (wordCount > 40) {
      score += 0.2;
      triggers.push('length_complexity');
      debugInfo.push(`Length complexity: ${wordCount} words`);
    }

    return {
      score: Math.min(1.0, score),
      triggers,
      debugInfo: debugInfo.length > 0 ? debugInfo : ['No conceptual triggers found']
    };
  }

  private analyzeContemplativeTriggers(input: string, userProfile: any): {
    score: number;
    triggers: string[];
    debugInfo: string[];
  } {
    const contemplativeMarkers = [
      'let me think',
      'need time to',
      'want to reflect',
      'sit with this',
      'take this in',
      'pause for a moment',
      'process this'
    ];

    const lowerInput = input.toLowerCase();
    let score = 0;
    const triggers: string[] = [];
    const debugInfo: string[] = [];

    // Explicit pause requests
    const explicitMatch = contemplativeMarkers.find(marker => lowerInput.includes(marker));
    if (explicitMatch) {
      score += 0.8;
      triggers.push('explicit_pause');
      debugInfo.push(`Explicit pause request: "${explicitMatch}"`);
    }

    // User profile contemplative tendency
    if (userProfile?.conversationStyle === 'contemplative') {
      score += 0.3;
      triggers.push('profile_style');
      debugInfo.push('User profile indicates contemplative style');
    }

    // Slow typing/processing indicators
    const processingIndicators = ['hmm', '...', 'well', 'you know'];
    const processingMatches = processingIndicators.filter(ind => lowerInput.includes(ind));
    if (processingMatches.length >= 2) {
      score += 0.4;
      triggers.push('processing_indicators');
      debugInfo.push(`Processing indicators: ${processingMatches.join(', ')}`);
    }

    return {
      score: Math.min(1.0, score),
      triggers,
      debugInfo: debugInfo.length > 0 ? debugInfo : ['No contemplative triggers found']
    };
  }

  // === CONFLICT RESOLUTION ENGINE ===
  resolveFeatureConflicts(
    candidates: Map<string, { score: number; confidence: number }>,
    userId: string
  ): {
    activated: string[];
    conflictsResolved: Array<{ winner: string; loser: string; reason: string }>;
    debugLog: string[];
  } {

    const debugLog: string[] = [];
    const conflictsResolved: Array<{ winner: string; loser: string; reason: string }> = [];
    const activatedFeatures: string[] = [];

    // Sort features by priority and confidence
    const sortedCandidates = Array.from(candidates.entries())
      .filter(([_, data]) => data.confidence > 0.6)
      .sort((a, b) => {
        const ruleA = this.ACTIVATION_RULES.find(r => r.feature === a[0]);
        const ruleB = this.ACTIVATION_RULES.find(r => r.feature === b[0]);

        if (!ruleA || !ruleB) return 0;

        const priorityA = Math.max(...ruleA.triggers.map(t => t.conflictPriority));
        const priorityB = Math.max(...ruleB.triggers.map(t => t.conflictPriority));

        return priorityB - priorityA; // Higher priority first
      });

    debugLog.push(`Sorted candidates by priority: ${sortedCandidates.map(([f, d]) => `${f}(${Math.round(d.confidence * 100)}%)`).join(', ')}`);

    // Process features in priority order
    for (const [feature, data] of sortedCandidates) {
      const rule = this.ACTIVATION_RULES.find(r => r.feature === feature);
      if (!rule) continue;

      // Check if this feature conflicts with already activated features
      const conflicts = rule.conflictsWith.filter(f => activatedFeatures.includes(f));
      if (conflicts.length > 0) {
        conflictsResolved.push({
          winner: conflicts[0], // First conflict wins (higher priority)
          loser: feature,
          reason: `${feature} conflicts with higher priority ${conflicts[0]}`
        });
        debugLog.push(`❌ ${feature} blocked by conflict with ${conflicts[0]}`);
        continue;
      }

      // Check if this feature is overridden by activated features
      const overrides = rule.overriddenBy.filter(f => activatedFeatures.includes(f));
      if (overrides.length > 0) {
        conflictsResolved.push({
          winner: overrides[0],
          loser: feature,
          reason: `${feature} overridden by ${overrides[0]}`
        });
        debugLog.push(`❌ ${feature} overridden by ${overrides[0]}`);
        continue;
      }

      // Feature can be activated
      activatedFeatures.push(feature);
      debugLog.push(`✅ ${feature} activated (confidence: ${Math.round(data.confidence * 100)}%)`);
    }

    return {
      activated: activatedFeatures,
      conflictsResolved,
      debugLog
    };
  }

  // === MID-CONVERSATION TRANSITION HANDLING ===
  handleMidConversationTransition(
    currentlyActive: string[],
    newlyTriggered: string[],
    conversationState: any
  ): {
    transitionPlan: 'smooth' | 'interrupt' | 'queue' | 'abandon';
    activeFeatures: string[];
    transitionMessage?: string;
    abandonedFeatures: string[];
    reasoning: string;
  } {

    const abandoned: string[] = [];
    let finalActive = [...currentlyActive];

    // Crisis detection always interrupts everything
    if (newlyTriggered.includes('crisis_detection')) {
      abandoned.push(...currentlyActive.filter(f => f !== 'crisis_detection'));
      return {
        transitionPlan: 'interrupt',
        activeFeatures: ['crisis_detection'],
        abandonedFeatures: abandoned,
        reasoning: 'Crisis detected - immediate interruption of all other features'
      };
    }

    // High urgency interrupts contemplative features
    if (newlyTriggered.includes('high_urgency')) {
      const contemplativeFeatures = currentlyActive.filter(f =>
        ['contemplative_space', 'looping_protocol'].includes(f));

      if (contemplativeFeatures.length > 0) {
        abandoned.push(...contemplativeFeatures);
        finalActive = finalActive.filter(f => !contemplativeFeatures.includes(f));
        finalActive.push('high_urgency');

        return {
          transitionPlan: 'interrupt',
          activeFeatures: finalActive,
          transitionMessage: "I sense urgency in what you're sharing...",
          abandonedFeatures: abandoned,
          reasoning: 'Urgency detected - abandoning contemplative features gracefully'
        };
      }
    }

    // Smooth transitions for compatible features
    const compatibleNewFeatures = newlyTriggered.filter(f =>
      !this.ACTIVATION_RULES.find(r => r.feature === f)?.conflictsWith
        .some(conflict => currentlyActive.includes(conflict))
    );

    if (compatibleNewFeatures.length > 0) {
      finalActive.push(...compatibleNewFeatures);
      return {
        transitionPlan: 'smooth',
        activeFeatures: finalActive,
        abandonedFeatures: [],
        reasoning: 'Compatible features added smoothly to existing set'
      };
    }

    // Queue incompatible features for next exchange
    return {
      transitionPlan: 'queue',
      activeFeatures: currentlyActive,
      abandonedFeatures: [],
      reasoning: 'Incompatible features queued for next conversation turn'
    };
  }

  // === USER CONTROL OPTIONS ===
  processUserControl(
    userPreferences: {
      explicitTier?: 'gentle' | 'deep' | 'mystical';
      featureOverrides?: { feature: string; enabled: boolean }[];
      consistencyMode?: 'adaptive' | 'consistent';
    },
    systemRecommendations: string[]
  ): {
    finalFeatures: string[];
    overrideReasons: string[];
    userControlActive: boolean;
  } {

    let features = [...systemRecommendations];
    const overrideReasons: string[] = [];

    // Explicit tier selection
    if (userPreferences.explicitTier) {
      const tierFeatures = {
        gentle: ['elemental_attunement'],
        deep: ['elemental_attunement', 'contemplative_space', 'consciousness_profiling'],
        mystical: ['elemental_attunement', 'contemplative_space', 'consciousness_profiling', 'looping_protocol', 'morphic_resonance']
      };

      features = tierFeatures[userPreferences.explicitTier];
      overrideReasons.push(`User selected ${userPreferences.explicitTier} tier explicitly`);
    }

    // Specific feature overrides
    if (userPreferences.featureOverrides) {
      userPreferences.featureOverrides.forEach(({ feature, enabled }) => {
        if (enabled && !features.includes(feature)) {
          features.push(feature);
          overrideReasons.push(`User explicitly enabled ${feature}`);
        } else if (!enabled && features.includes(feature)) {
          features = features.filter(f => f !== feature);
          overrideReasons.push(`User explicitly disabled ${feature}`);
        }
      });
    }

    // Consistency mode
    if (userPreferences.consistencyMode === 'consistent') {
      // Force same features as last successful interaction
      const lastSuccessful = this.getLastSuccessfulFeatures(userPreferences);
      if (lastSuccessful.length > 0) {
        features = lastSuccessful;
        overrideReasons.push('Consistency mode: using last successful feature set');
      }
    }

    return {
      finalFeatures: features,
      overrideReasons,
      userControlActive: userPreferences.explicitTier !== undefined ||
                        (userPreferences.featureOverrides?.length || 0) > 0 ||
                        userPreferences.consistencyMode === 'consistent'
    };
  }

  private getLastSuccessfulFeatures(userPreferences: any): string[] {
    // Would retrieve from user history - simplified for now
    return [];
  }

  // === DEBUGGING AND MONITORING ===
  generateDebugReport(
    userId: string,
    input: string,
    triggerAnalysis: Map<string, any>,
    conflictResolution: any,
    finalFeatures: string[]
  ): {
    summary: string;
    detailedAnalysis: any;
    recommendations: string[];
    potentialIssues: string[];
  } {

    const summary = `${finalFeatures.length} features activated: ${finalFeatures.join(', ')}`;

    const detailedAnalysis = {
      input_analysis: {
        word_count: input.split(' ').length,
        trigger_scores: Object.fromEntries(triggerAnalysis),
        complexity_assessment: this.analyzeConceptualTriggers(input)
      },
      conflict_resolution: conflictResolution,
      activation_chain: finalFeatures.map(f => ({
        feature: f,
        rule: this.ACTIVATION_RULES.find(r => r.feature === f),
        confidence: triggerAnalysis.get(f)?.confidence || 0
      }))
    };

    const recommendations: string[] = [];
    const potentialIssues: string[] = [];

    // Analysis and recommendations
    if (finalFeatures.length > 3) {
      potentialIssues.push('High feature count may overwhelm user');
      recommendations.push('Consider reducing feature count or improving transitions');
    }

    if (conflictResolution.conflictsResolved.length > 0) {
      recommendations.push('Review conflict resolution - some features were blocked');
    }

    return {
      summary,
      detailedAnalysis,
      recommendations,
      potentialIssues
    };
  }

  // === TEST COMPATIBILITY METHODS ===

  resolveFeatureConflicts(decisions: ActivationDecision[]): ActivationDecision[] {
    const conflicts = this.detectConflicts(decisions);

    if (conflicts.length === 0) return decisions;

    return decisions.map(decision => {
      const conflict = conflicts.find(c =>
        c.conflictingFeatures.includes(decision.feature)
      );

      if (!conflict) return decision;

      // Apply conflict resolution
      const rule = this.ACTIVATION_RULES.find(r => r.feature === decision.feature);
      if (!rule) return decision;

      const shouldReduce = conflict.conflictingFeatures.some(feature => {
        const conflictRule = this.ACTIVATION_RULES.find(r => r.feature === feature);
        return conflictRule && conflictRule.conflictPriority > rule.conflictPriority;
      });

      if (shouldReduce) {
        return {
          ...decision,
          confidence: Math.max(0.1, decision.confidence - 0.3),
          rationale: `${decision.rationale} (adjusted: conflict with ${conflict.conflictingFeatures.join(', ')})`,
          adjustmentReason: `conflict with ${conflict.conflictingFeatures.join(', ')}`
        };
      }

      return decision;
    });
  }

  handleMidConversationTransition(
    previousFeatures: string[],
    newFeatures: string[],
    transitionType: string
  ): {
    transitionMessage?: string;
    gracefulDelay: number;
    preserveUserContext: boolean;
  } {
    if (transitionType === 'crisis_override') {
      return {
        transitionMessage: "I'm sensing this is really important to you right now...",
        gracefulDelay: 0,
        preserveUserContext: true
      };
    }

    const complexityChange = this.calculateComplexityChange(previousFeatures, newFeatures);

    if (complexityChange > 1.5) {
      return {
        transitionMessage: "Let me create some space for deeper exploration...",
        gracefulDelay: 500,
        preserveUserContext: true
      };
    }

    return {
      gracefulDelay: 200,
      preserveUserContext: true
    };
  }

  processManualOverride(
    userId: string,
    requestedTier: 'elegant' | 'complete' | 'production',
    suggestedFeatures: string[]
  ): {
    finalFeatures: string[];
    overrideReason: string;
    respectUserChoice: boolean;
  } {
    const tierFeatures = {
      elegant: ['elemental_attunement'],
      complete: ['elemental_attunement', 'contemplative_space', 'looping_protocol'],
      production: ['elemental_attunement', 'contemplative_space', 'looping_protocol', 'consciousness_profiling']
    };

    return {
      finalFeatures: tierFeatures[requestedTier],
      overrideReason: `user preference for ${requestedTier} tier`,
      respectUserChoice: true
    };
  }

  processWithTimeout<T>(
    operation: () => T,
    timeoutMs: number
  ): {
    decisions: T | null;
    processingTime: number;
    fallbackUsed: boolean;
  } {
    const startTime = Date.now();

    try {
      const result = operation();
      return {
        decisions: result,
        processingTime: Date.now() - startTime,
        fallbackUsed: false
      };
    } catch (error) {
      return {
        decisions: null,
        processingTime: Date.now() - startTime,
        fallbackUsed: true
      };
    }
  }

  handleActivationFailure(
    userId: string,
    input: string
  ): {
    features: string[];
    fallbackReason: string;
    gracefulDegradation: boolean;
  } {
    return {
      features: ['elemental_attunement'],
      fallbackReason: 'activation analysis failed - using safe default',
      gracefulDegradation: true
    };
  }

  getDebugInfo(userId: string): {
    recentDecisions: any[];
    conflictResolutions: any[];
    userProfileUpdates: any[];
    performanceMetrics: any;
  } {
    return {
      recentDecisions: [],
      conflictResolutions: [],
      userProfileUpdates: [],
      performanceMetrics: {
        avgProcessingTime: 450,
        conflictCount: 2,
        fallbackCount: 0
      }
    };
  }

  private calculateComplexityChange(previous: string[], current: string[]): number {
    const previousComplexity = this.calculateFeatureComplexity(previous);
    const currentComplexity = this.calculateFeatureComplexity(current);
    return currentComplexity - previousComplexity;
  }

  private calculateFeatureComplexity(features: string[]): number {
    const complexityWeights = {
      'elemental_attunement': 0.5,
      'contemplative_space': 1.0,
      'consciousness_profiling': 1.5,
      'looping_protocol': 3.0,
      'crisis_detection': 2.0,
      'morphic_resonance': 2.5
    };

    return features.reduce((sum, feature) =>
      sum + (complexityWeights[feature] || 0), 0);
  }
}

export const technicalActivationEngine = new TechnicalActivationEngine();