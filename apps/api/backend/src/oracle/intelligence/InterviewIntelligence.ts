/**
 * Interview Intelligence Module
 * Implements Motivational Interviewing + Clean Language + Jungian Amplification
 * This is what makes Maya truly engaging and eliciting
 */

export interface ConversationSignal {
  emotion?: string;
  metaphors: string[];
  keywords: string[];
  intensity: 'low' | 'medium' | 'high';
  openness: number; // 0-1 scale
}

export class InterviewIntelligence {
  // OARS from Motivational Interviewing
  private readonly OPEN_QUESTIONS = [
    "What brings you here?",
    "Tell me more about that.",
    "What's that like for you?",
    "How does that sit with you?",
    "What comes up when you say that?"
  ];

  private readonly AFFIRMATIONS = [
    "That takes courage to say.",
    "You're being honest.",
    "That's a powerful insight.",
    "You know yourself well.",
    "That's real."
  ];

  private readonly REFLECTIONS = {
    simple: [
      "You feel {emotion}.",
      "That's {intensity} for you.",
      "{keyword} matters to you."
    ],
    complex: [
      "Part of you {feeling1}, another part {feeling2}.",
      "Underneath {surface} is {deeper}.",
      "You're torn between {option1} and {option2}."
    ],
    metaphorical: [
      "It's like {metaphor}.",
      "You're describing a kind of {image}.",
      "That sounds like {symbol}."
    ]
  };

  // Clean Language patterns (David Grove)
  private readonly CLEAN_QUESTIONS = {
    developing: [
      "And what kind of {X} is that {X}?",
      "And is there anything else about {X}?",
      "And where is {X}?",
      "And whereabouts?"
    ],
    sequence: [
      "And then what happens?",
      "And what happens next?",
      "And what happens just before {X}?"
    ],
    metaphor: [
      "And that's {X} like what?",
      "And if {X} was a shape, what shape?",
      "And if {X} had a color?"
    ],
    desired_outcome: [
      "And what would you like to have happen?",
      "And when {X}, what would you like to have happen?"
    ]
  };

  // Jungian Amplification patterns
  private readonly AMPLIFICATION_PROMPTS = {
    shadow: [
      "What's the part you don't want to see?",
      "What lives in the dark here?",
      "What's been rejected?"
    ],
    symbol: [
      "If this were a dream, what would it mean?",
      "What ancient story does this remind you of?",
      "What archetype is speaking?"
    ],
    individuation: [
      "How is this calling you to grow?",
      "What's trying to emerge?",
      "Where's the gold in this?"
    ]
  };

  /**
   * Select the right question based on conversation depth and signal
   */
  selectIntervention(
    signal: ConversationSignal,
    depth: number,
    lastUserInput: string
  ): { type: string; template: string; reasoning: string } {
    // Opening moves (depth 0-2)
    if (depth <= 2) {
      if (signal.openness < 0.3) {
        return {
          type: 'open_question',
          template: this.OPEN_QUESTIONS[Math.floor(Math.random() * 3)],
          reasoning: 'User seems closed, using open question to invite'
        };
      }
      if (signal.intensity === 'high') {
        return {
          type: 'reflection',
          template: this.fillTemplate(
            this.REFLECTIONS.simple[0],
            { emotion: signal.emotion || 'intense' }
          ),
          reasoning: 'High intensity, reflecting to validate'
        };
      }
    }

    // Middle moves (depth 3-5)
    if (depth <= 5) {
      if (signal.metaphors.length > 0) {
        return {
          type: 'clean_metaphor',
          template: this.fillTemplate(
            this.CLEAN_QUESTIONS.metaphor[0],
            { X: signal.metaphors[0] }
          ),
          reasoning: 'Metaphor detected, exploring symbolically'
        };
      }
      if (signal.openness > 0.6) {
        return {
          type: 'clean_developing',
          template: this.fillTemplate(
            this.CLEAN_QUESTIONS.developing[1],
            { X: signal.keywords[0] || 'that' }
          ),
          reasoning: 'User is open, developing their material'
        };
      }
    }

    // Deep moves (depth 6+)
    if (depth > 5) {
      if (signal.intensity === 'high' && signal.openness > 0.7) {
        return {
          type: 'amplification',
          template: this.AMPLIFICATION_PROMPTS.individuation[
            Math.floor(Math.random() * 3)
          ],
          reasoning: 'Deep engagement, amplifying toward growth'
        };
      }
      return {
        type: 'desired_outcome',
        template: this.CLEAN_QUESTIONS.desired_outcome[0],
        reasoning: 'Time to orient toward desired state'
      };
    }

    // Default fallback
    return {
      type: 'open_question',
      template: "What else?",
      reasoning: 'Default elicitation'
    };
  }

  /**
   * Analyze user input for signals
   */
  analyzeSignal(userInput: string): ConversationSignal {
    const lower = userInput.toLowerCase();

    // Detect emotion
    const emotions = {
      sad: /sad|down|depressed|blue|heavy/i,
      angry: /angry|mad|pissed|furious|rage/i,
      scared: /scared|afraid|anxious|worried|fear/i,
      happy: /happy|joy|excited|good|great/i,
      confused: /confused|lost|stuck|uncertain/i
    };

    let detectedEmotion = 'neutral';
    for (const [emotion, pattern] of Object.entries(emotions)) {
      if (pattern.test(lower)) {
        detectedEmotion = emotion;
        break;
      }
    }

    // Detect metaphors (basic)
    const metaphorPatterns = [
      /like\s+(\w+)/gi,
      /it's\s+a\s+(\w+)/gi,
      /feels\s+like\s+(\w+)/gi,
      /as\s+if\s+(.+)/gi
    ];

    const metaphors: string[] = [];
    for (const pattern of metaphorPatterns) {
      const matches = lower.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) metaphors.push(match[1]);
      }
    }

    // Extract keywords (nouns and important verbs)
    const keywords = userInput
      .split(/\s+/)
      .filter(word => word.length > 4)
      .filter(word => !['that', 'this', 'what', 'when', 'where'].includes(word.toLowerCase()))
      .slice(0, 3);

    // Calculate intensity
    const intensityMarkers = {
      high: /really|very|so\s+much|extremely|totally|completely/i,
      medium: /quite|pretty|somewhat|fairly/i
    };

    let intensity: 'low' | 'medium' | 'high' = 'low';
    if (intensityMarkers.high.test(lower)) intensity = 'high';
    else if (intensityMarkers.medium.test(lower)) intensity = 'medium';

    // Calculate openness (length + personal pronouns)
    const wordCount = userInput.split(/\s+/).length;
    const hasPersonal = /\b(i|me|my|myself)\b/i.test(lower);
    const openness = Math.min(1, (wordCount / 50) + (hasPersonal ? 0.3 : 0));

    return {
      emotion: detectedEmotion,
      metaphors,
      keywords,
      intensity,
      openness
    };
  }

  /**
   * Fill template with values
   */
  private fillTemplate(template: string, values: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(values)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    return result;
  }

  /**
   * Generate affirmation when appropriate
   */
  generateAffirmation(signal: ConversationSignal): string | null {
    if (signal.openness > 0.6 && signal.intensity === 'high') {
      return this.AFFIRMATIONS[Math.floor(Math.random() * this.AFFIRMATIONS.length)];
    }
    return null;
  }
}

export const interviewIntelligence = new InterviewIntelligence();