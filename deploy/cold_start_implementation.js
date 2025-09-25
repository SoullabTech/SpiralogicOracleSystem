// Cold Start Implementation for ARIA
// Eliminates empty field problem, provides immediate value

const seedData = require('./seed_data.json');

class ColdStartManager {
  constructor() {
    this.universalTruths = seedData.universal_truths;
    this.starterQuestions = seedData.starter_questions;
    this.archetypeDefaults = seedData.archetype_defaults;
    this.explorationConfig = seedData.exploration_mode;
    this.onboardingFlow = seedData.onboarding_flow;
  }

  // Check if user is new (needs cold start)
  isNewUser(session) {
    const triggers = [
      session.duration < 300, // Less than 5 minutes
      session.fieldEntries < 10, // Minimal personal data
      !session.userId || session.isGuest,
      session.interactions < 3
    ];

    return triggers.filter(Boolean).length >= 2;
  }

  // Detect if exploration mode should be active
  shouldUseExplorationMode(context) {
    const { confidence, category, userSession, fieldSize } = context;

    // Check exploration triggers
    const triggers = this.explorationConfig.triggers.map(trigger => {
      if (trigger.includes('user_session_length')) {
        return userSession.duration < 300;
      }
      if (trigger.includes('field_entries')) {
        return fieldSize < 10;
      }
      if (trigger.includes('confidence')) {
        return confidence < 0.7;
      }
      if (trigger.includes('category')) {
        return category === 'creative';
      }
      return false;
    });

    return triggers.some(t => t === true);
  }

  // Get exploration mode banner and styling
  getExplorationModeConfig() {
    return {
      banner: {
        message: this.explorationConfig.banner_message,
        type: 'info',
        icon: '🔍',
        dismissible: false,
        position: 'top'
      },
      style: this.explorationConfig.style_adjustments
    };
  }

  // Initialize new user with seed data
  async initializeNewUser(userId) {
    const initialField = {
      userId,
      createdAt: Date.now(),
      universal: this.getInitialUniversalTruths(),
      personal: [],
      preferences: {
        archetypes: [],
        categories: [],
        communicationStyle: 'balanced'
      },
      metadata: {
        onboardingStep: 'welcome',
        isExploring: true,
        sessionCount: 1
      }
    };

    return initialField;
  }

  // Get subset of universal truths for immediate use
  getInitialUniversalTruths(count = 25) {
    // Select diverse truths across categories
    const categories = [...new Set(this.universalTruths.map(t => t.category))];
    const selected = [];

    // Get at least 3 from each category
    categories.forEach(category => {
      const categoryTruths = this.universalTruths
        .filter(t => t.category === category)
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3);
      selected.push(...categoryTruths);
    });

    // Fill remaining with highest confidence
    const remaining = this.universalTruths
      .filter(t => !selected.includes(t))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, count - selected.length);

    return [...selected, ...remaining];
  }

  // Get contextual starter questions
  getStarterQuestions(context = {}) {
    const { timeOfDay, userMood, previousTopics } = context;

    let questions = [...this.starterQuestions];

    // Contextual filtering
    if (timeOfDay === 'morning') {
      questions = questions.filter(q =>
        ['productivity', 'habits', 'wisdom'].includes(q.category)
      );
    } else if (timeOfDay === 'evening') {
      questions = questions.filter(q =>
        ['emotional', 'relationships', 'self_discovery'].includes(q.category)
      );
    }

    // Avoid repetition
    if (previousTopics && previousTopics.length > 0) {
      questions = questions.filter(q =>
        !previousTopics.includes(q.category)
      );
    }

    return questions.slice(0, 5);
  }

  // Generate first response for new user
  async generateColdStartResponse(question, archetype = 'sage') {
    const archetypeConfig = this.archetypeDefaults[archetype];

    // Find relevant universal truths
    const relevantTruths = this.findRelevantTruths(question);

    // Build response with exploration mode indicators
    const response = {
      text: this.craftResponse(question, relevantTruths, archetypeConfig),
      mode: 'exploration',
      confidence: archetypeConfig.default_confidence * 0.9, // Slightly lower for cold start
      sources: relevantTruths.map(t => ({
        type: 'universal_truth',
        id: t.id,
        confidence: t.confidence
      })),
      archetype: archetype,
      metadata: {
        isExploring: true,
        truthsUsed: relevantTruths.length,
        responseType: 'cold_start'
      }
    };

    return response;
  }

  // Find universal truths relevant to question
  findRelevantTruths(question, maxResults = 3) {
    const questionLower = question.toLowerCase();
    const keywords = this.extractKeywords(questionLower);

    // Score each truth by relevance
    const scored = this.universalTruths.map(truth => {
      let score = 0;

      // Check content match
      const contentLower = truth.content.toLowerCase();
      keywords.forEach(keyword => {
        if (contentLower.includes(keyword)) score += 2;
      });

      // Check tag match
      if (truth.tags) {
        truth.tags.forEach(tag => {
          keywords.forEach(keyword => {
            if (tag.includes(keyword) || keyword.includes(tag)) score += 1;
          });
        });
      }

      // Check category match
      keywords.forEach(keyword => {
        if (truth.category.includes(keyword)) score += 1.5;
      });

      return { ...truth, relevanceScore: score };
    });

    // Return top results
    return scored
      .filter(t => t.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);
  }

  // Extract keywords from question
  extractKeywords(text) {
    const stopWords = ['what', 'how', 'why', 'when', 'where', 'who', 'should', 'could', 'would', 'can', 'will', 'do', 'i', 'my', 'me', 'the', 'a', 'an', 'to', 'for', 'of', 'in', 'on', 'at', 'is', 'are', 'was', 'were'];

    return text
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !stopWords.includes(word))
      .map(word => word.replace(/[^\w]/g, ''));
  }

  // Craft response using archetype style and truths
  craftResponse(question, truths, archetypeConfig) {
    const intro = this.getArchetypeIntro(question, archetypeConfig);
    const body = this.weaveTruths(truths, archetypeConfig.style);
    const outro = this.getArchetypeOutro(archetypeConfig);

    return `${intro}\n\n${body}\n\n${outro}`;
  }

  getArchetypeIntro(question, config) {
    const intros = {
      'thoughtful, questioning, philosophical': [
        "Let's explore this together...",
        "An interesting question to ponder...",
        "This invites deeper reflection..."
      ],
      'direct, empowering, action-oriented': [
        "Here's what you need to know:",
        "Let's tackle this head-on:",
        "Time for action. Here's the path:"
      ],
      'warm, empathetic, connection-focused': [
        "I hear what you're asking...",
        "This touches something important...",
        "Let's explore this with care..."
      ]
    };

    const styleIntros = intros[config.style] || ["Let me help with that..."];
    return styleIntros[Math.floor(Math.random() * styleIntros.length)];
  }

  weaveTruths(truths, style) {
    if (truths.length === 0) {
      return "I'm still learning about this area. Let's explore it together.";
    }

    const connectors = {
      'thoughtful, questioning, philosophical': ['Consider that', 'One might observe', 'It's worth noting'],
      'direct, empowering, action-oriented': ['Remember:', 'Key point:', 'Focus on this:'],
      'warm, empathetic, connection-focused': ['Something to consider:', 'From my understanding,', 'What I've learned:']
    };

    const styleConnectors = connectors[style] || [''];

    return truths.map((truth, index) => {
      const connector = styleConnectors[index % styleConnectors.length];
      return `${connector} ${truth.content}`;
    }).join('\n\n');
  }

  getArchetypeOutro(config) {
    const outros = {
      sage: "What aspects resonate most with your situation?",
      warrior: "Which action will you take first?",
      lover: "How does this feel for you?",
      explorer: "What possibilities do you see emerging?",
      sovereign: "What structure will best serve your goals?",
      healer: "What needs the most attention right now?",
      mystic: "What patterns are revealing themselves?",
      rebel: "What convention will you challenge?",
      innocent: "What brings you joy in this?",
      builder: "What will you create from this?",
      diplomat: "How can this bring more harmony?",
      hero: "What quest calls to you now?"
    };

    return outros[Object.keys(this.archetypeDefaults).find(key =>
      this.archetypeDefaults[key].style === config.style
    )] || "What would you like to explore further?";
  }

  // Handle onboarding flow progression
  async progressOnboarding(userId, currentStep, interaction) {
    const flow = this.onboardingFlow.steps;
    const currentIndex = flow.findIndex(s => s.id === currentStep);
    const nextStep = flow[currentIndex + 1];

    if (!nextStep) {
      // Onboarding complete
      return {
        step: 'completed',
        action: 'switch_to_personalized',
        isExploring: false
      };
    }

    // Check if we should advance based on time or interaction
    const shouldAdvance =
      interaction.duration > nextStep.duration.split('-')[0] ||
      interaction.quality === 'high';

    if (shouldAdvance) {
      return {
        step: nextStep.id,
        action: nextStep.action,
        message: nextStep.message,
        isExploring: nextStep.id !== 'transition'
      };
    }

    return {
      step: currentStep,
      action: 'continue',
      isExploring: true
    };
  }

  // Track metrics for cold start performance
  trackColdStartMetrics(event) {
    const metrics = {
      timeToFirstInteraction: event.firstInteractionTime,
      timeToValue: event.firstUsefulResponse,
      abandonmentPoint: event.sessionEndTime,
      questionsAsked: event.questionCount,
      truthsUsed: event.truthsAccessed,
      confidenceProgression: event.confidenceOverTime,
      modeTransition: event.transitionToPersonalized
    };

    // Log for analysis
    console.log('Cold Start Metrics:', metrics);

    // Alert if performance targets not met
    const targets = seedData.performance_targets.cold_start;
    if (metrics.timeToFirstInteraction > targets.time_to_first_interaction) {
      console.warn('Cold start taking too long:', metrics.timeToFirstInteraction);
    }

    return metrics;
  }
}

// Export for use in main application
module.exports = ColdStartManager;

// Example usage
if (require.main === module) {
  const manager = new ColdStartManager();

  // Simulate new user
  const session = {
    duration: 10,
    fieldEntries: 0,
    userId: null,
    isGuest: true,
    interactions: 0
  };

  console.log('Is new user?', manager.isNewUser(session));
  console.log('Starter questions:', manager.getStarterQuestions({ timeOfDay: 'morning' }));

  // Test cold start response
  manager.generateColdStartResponse("What should I focus on today?", "warrior")
    .then(response => {
      console.log('Cold start response:', response);
    });
}