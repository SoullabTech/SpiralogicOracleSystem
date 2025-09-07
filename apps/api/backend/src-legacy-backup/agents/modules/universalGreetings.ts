// ===============================================
// UNIVERSAL ORACLE GREETINGS
// For personal consciousness journeys
// ===============================================

import { OracleModeType } from "../../../types/oracleMode.js";

// ===============================================
// PERSONAL JOURNEY GREETINGS
// Heart-centered questions for awakening souls
// ===============================================

export interface OracleGreeting {
  id: string;
  question: string;
  context: string;
  followUpPrompts?: string[];
}

// ===============================================
// UNIVERSAL CONSCIOUSNESS GREETINGS
// For every soul ready to live consciously
// ===============================================

export const UNIVERSAL_GREETINGS: OracleGreeting[] = [
  {
    id: "heart-check",
    question: "How is your heart today?",
    context: "A gentle invitation to connect with emotional truth",
    followUpPrompts: [
      "What does your heart need right now?",
      "What would it feel like to honor that need?",
      "How can you give yourself that gift today?",
    ],
  },

  {
    id: "awakening-call",
    question: "What wants to awaken in you?",
    context: "Exploring emerging consciousness and potential",
    followUpPrompts: [
      "What feels ready to emerge in your life?",
      "What old pattern might be dissolving?",
      "How can you support this awakening?",
    ],
  },

  {
    id: "growth-edge",
    question: "Where is life asking you to grow?",
    context: "Identifying areas of expansion and learning",
    followUpPrompts: [
      "What challenge is actually an invitation?",
      "What strength is this situation calling forth?",
      "How is this growing you into who you're becoming?",
    ],
  },

  {
    id: "truth-seeking",
    question: "What truth wants to be lived through you?",
    context: "Connecting with authentic expression and purpose",
    followUpPrompts: [
      "What feels most true about you right now?",
      "How would you live if you fully trusted this truth?",
      "What would change if you honored this completely?",
    ],
  },

  {
    id: "presence-practice",
    question: "What does being present feel like for you today?",
    context: "Exploring mindfulness and conscious awareness",
    followUpPrompts: [
      "What brings you most into this moment?",
      "When do you feel most alive and aware?",
      "How can you gift yourself more presence?",
    ],
  },

  {
    id: "soul-calling",
    question: "What is your soul longing for?",
    context: "Deep listening to essential needs and desires",
    followUpPrompts: [
      "If your soul could speak, what would it say?",
      "What would fulfill you at the deepest level?",
      "How can you take one step toward this longing?",
    ],
  },

  {
    id: "love-expression",
    question: "How is love moving through your life right now?",
    context: "Exploring love in all its forms and expressions",
    followUpPrompts: [
      "Where do you feel most loving toward yourself?",
      "How does love want to flow through you today?",
      "What would it mean to be love in action?",
    ],
  },

  {
    id: "creative-essence",
    question: "What wants to be created through you?",
    context: "Tapping into creative flow and authentic expression",
    followUpPrompts: [
      "What feels alive and wanting to emerge?",
      "How does creativity move through you?",
      "What would you create if there were no limits?",
    ],
  },
];

// ===============================================
// MODE-SPECIFIC GREETING ADAPTATIONS
// How each Oracle mode approaches personal check-ins
// ===============================================

export const MODE_GREETING_STYLES: Record<
  OracleModeType,
  {
    approach: string;
    sampleGreetings: string[];
    tone: string;
  }
> = {
  alchemist: {
    approach: "Deep, transformational, shadow-aware",
    sampleGreetings: [
      "What gold is hidden in today's lead?",
      "What part of your shadow wants to be witnessed?",
      "What's ready to be transformed in your inner landscape?",
      "What ancient pattern is asking for new life?",
    ],
    tone: "Rich, symbolic, transformational",
  },

  buddha: {
    approach: "Spacious, present-moment, non-attachment",
    sampleGreetings: [
      "What can you let go of right now?",
      "How is this moment already perfect?",
      "What story are you ready to hold more lightly?",
      "Where can you find spaciousness in today's experience?",
    ],
    tone: "Peaceful, spacious, liberating",
  },

  sage: {
    approach: "Wise, discerning, practical wisdom",
    sampleGreetings: [
      "What wisdom is this moment offering you?",
      "Where do you need clearer boundaries today?",
      "What decision is waiting for your attention?",
      "How can you honor both your needs and others'?",
    ],
    tone: "Clear, wise, grounded",
  },

  mystic: {
    approach: "Intuitive, spiritual, transcendent",
    sampleGreetings: [
      "What is the universe whispering to you?",
      "How is the sacred showing up in your ordinary moments?",
      "What divine quality wants to express through you?",
      "Where do you feel most connected to something greater?",
    ],
    tone: "Mystical, reverent, expansive",
  },

  guardian: {
    approach: "Protective, nurturing, strength-building",
    sampleGreetings: [
      "What part of you needs protection today?",
      "How can you be your own loving guardian?",
      "What strength is available to you right now?",
      "Where do you need to set a loving boundary?",
    ],
    tone: "Protective, nurturing, empowering",
  },

  tao: {
    approach: "Natural, flowing, effortless action",
    sampleGreetings: [
      "How is life flowing through you today?",
      "What wants to happen naturally?",
      "Where can you move with less effort?",
      "How might you flow like water around today's obstacles?",
    ],
    tone: "Natural, flowing, effortless",
  },
};

// ===============================================
// CONSCIOUSNESS-LEVEL GREETINGS
// Adapting to where someone is in their journey
// ===============================================

export const CONSCIOUSNESS_GREETINGS = {
  awakening: [
    "What feels different about you lately?",
    "What old way of being is feeling too small?",
    "What new awareness is dawning in you?",
  ],

  integrating: [
    "How are you weaving together all you've learned?",
    "What needs patience as it settles into place?",
    "Where do you feel most aligned with yourself?",
  ],

  expressing: [
    "How is your truth wanting to be lived?",
    "What authentic expression is ready to emerge?",
    "Where do you feel most like yourself?",
  ],

  serving: [
    "How is your love wanting to serve the world?",
    "What gift are you ready to offer?",
    "Where does your service feel most natural?",
  ],

  being: [
    "How does it feel to simply be you?",
    "What does presence feel like in this moment?",
    "Where do you feel most at peace with yourself?",
  ],
};

// ===============================================
// GREETING SELECTION HELPERS
// ===============================================

export function selectGreeting(
  mode?: OracleModeType,
  userContext?: any,
  timeOfDay?: "morning" | "afternoon" | "evening",
  consciousness?: keyof typeof CONSCIOUSNESS_GREETINGS,
): OracleGreeting {
  // Select based on consciousness level if provided
  if (consciousness && CONSCIOUSNESS_GREETINGS[consciousness]) {
    const greetings = CONSCIOUSNESS_GREETINGS[consciousness];
    const selected = greetings[Math.floor(Math.random() * greetings.length)];
    return {
      id: `consciousness-${consciousness}`,
      question: selected,
      context: `Greeting for ${consciousness} consciousness level`,
    };
  }

  // Select based on Oracle mode if provided
  if (mode && MODE_GREETING_STYLES[mode]) {
    const modeStyle = MODE_GREETING_STYLES[mode];
    const selected =
      modeStyle.sampleGreetings[
        Math.floor(Math.random() * modeStyle.sampleGreetings.length)
      ];
    return {
      id: `mode-${mode}`,
      question: selected,
      context: `${mode} mode greeting`,
    };
  }

  // Default to universal greetings
  return UNIVERSAL_GREETINGS[
    Math.floor(Math.random() * UNIVERSAL_GREETINGS.length)
  ];
}

export function getGreetingByIntent(intent: string): OracleGreeting | null {
  return (
    UNIVERSAL_GREETINGS.find(
      (greeting) =>
        greeting.id === intent ||
        greeting.question.toLowerCase().includes(intent.toLowerCase()),
    ) || null
  );
}

// ===============================================
// EXPORT ALL CONFIGURATIONS
// ===============================================

export {
  UNIVERSAL_GREETINGS as default,
  MODE_GREETING_STYLES,
  CONSCIOUSNESS_GREETINGS,
  selectGreeting,
  getGreetingByIntent,
};
