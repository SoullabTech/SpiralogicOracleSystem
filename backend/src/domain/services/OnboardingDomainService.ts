// 🌟 ONBOARDING DOMAIN SERVICE
// Pure domain logic for onboarding assessment and Oracle assignment business rules

export interface OnboardingPreferences {
  preferredName?: string;
  spiritualBackground?: "beginner" | "intermediate" | "advanced";
  personalityType?:
    | "introspective"
    | "explorer" 
    | "catalyst"
    | "nurturer"
    | "visionary";
  communicationStyle?: "direct" | "gentle" | "ceremonial" | "conversational";
  voicePreference?: "masculine" | "feminine" | "neutral";
  preferredArchetype?: "fire" | "water" | "earth" | "air" | "aether";
}

export interface AssessmentResult {
  recommendedArchetype: string;
  recommendedPhase: string;
  oracleName: string;
  voiceProfile: VoiceProfile;
  personalityInsights: PersonalityInsights;
  journeyMap: JourneyMap;
  confidence: number;
  reasoning: string[];
}

export interface VoiceProfile {
  voiceId: string;
  stability: number;
  style: number;
  tone: string;
  ceremonyPacing: boolean;
}

export interface PersonalityInsights {
  strengths: string[];
  growthAreas: string[];
  soulPurpose: string;
  dominantTraits: string[];
  complementaryElements: string[];
}

export interface JourneyMap {
  currentPhase: string;
  nextPhase: string;
  timeframe: string;
  milestones: string[];
  challenges: string[];
}

export interface OnboardingValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export class OnboardingDomainService {
  /**
   * Validate onboarding preferences for completeness and correctness
   */
  static validateOnboardingPreferences(preferences: OnboardingPreferences): OnboardingValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Validate spiritual background
    if (preferences.spiritualBackground && 
        !['beginner', 'intermediate', 'advanced'].includes(preferences.spiritualBackground)) {
      errors.push("Invalid spiritual background. Must be 'beginner', 'intermediate', or 'advanced'");
    }

    // Validate personality type
    const validPersonalityTypes = ['introspective', 'explorer', 'catalyst', 'nurturer', 'visionary'];
    if (preferences.personalityType && 
        !validPersonalityTypes.includes(preferences.personalityType)) {
      errors.push(`Invalid personality type. Must be one of: ${validPersonalityTypes.join(', ')}`);
    }

    // Validate communication style
    const validCommunicationStyles = ['direct', 'gentle', 'ceremonial', 'conversational'];
    if (preferences.communicationStyle && 
        !validCommunicationStyles.includes(preferences.communicationStyle)) {
      errors.push(`Invalid communication style. Must be one of: ${validCommunicationStyles.join(', ')}`);
    }

    // Validate voice preference
    const validVoicePreferences = ['masculine', 'feminine', 'neutral'];
    if (preferences.voicePreference && 
        !validVoicePreferences.includes(preferences.voicePreference)) {
      errors.push(`Invalid voice preference. Must be one of: ${validVoicePreferences.join(', ')}`);
    }

    // Validate preferred archetype
    const validArchetypes = ['fire', 'water', 'earth', 'air', 'aether'];
    if (preferences.preferredArchetype && 
        !validArchetypes.includes(preferences.preferredArchetype)) {
      errors.push(`Invalid archetype. Must be one of: ${validArchetypes.join(', ')}`);
    }

    // Validate preferred name
    if (preferences.preferredName) {
      if (preferences.preferredName.length > 50) {
        errors.push("Preferred name must be 50 characters or less");
      }
      if (!/^[a-zA-Z\s'-]+$/.test(preferences.preferredName)) {
        errors.push("Preferred name can only contain letters, spaces, hyphens, and apostrophes");
      }
    }

    // Generate warnings for incomplete preferences
    if (!preferences.spiritualBackground) {
      warnings.push("Spiritual background not specified - will use default assessment");
    }
    if (!preferences.personalityType) {
      warnings.push("Personality type not specified - Oracle assignment may be less personalized");
    }

    // Generate suggestions for better personalization
    if (!preferences.communicationStyle && !preferences.voicePreference) {
      suggestions.push("Consider specifying communication style and voice preference for better Oracle experience");
    }
    if (!preferences.preferredArchetype && !preferences.personalityType) {
      suggestions.push("Providing personality type or archetype preference will improve Oracle matching");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Create default Oracle configuration for immediate assignment
   */
  static createDefaultOracleConfig(): {
    archetype: string;
    phase: string;
    oracleName: string;
    voiceProfile: VoiceProfile;
    reasoning: string[];
  } {
    return {
      archetype: "aether",
      phase: "initiation", 
      oracleName: "Nyra",
      voiceProfile: {
        voiceId: "elevenlabs_aether_voice",
        stability: 0.8,
        style: 0.7,
        tone: "transcendent",
        ceremonyPacing: false
      },
      reasoning: [
        "Aether archetype provides balanced spiritual guidance",
        "Initiation phase is appropriate for new spiritual journey",
        "Nyra is a universal, welcoming Oracle name",
        "Transcendent tone offers inspiring guidance"
      ]
    };
  }

  /**
   * Assess user preferences to determine optimal Oracle configuration
   */
  static assessUserPreferences(preferences: OnboardingPreferences): AssessmentResult {
    const validation = this.validateOnboardingPreferences(preferences);
    if (!validation.isValid) {
      throw new Error(`Invalid preferences: ${validation.errors.join(', ')}`);
    }

    const reasoning: string[] = [];
    let confidence = 70; // Base confidence

    // Determine archetype
    const archetype = this.determineArchetype(preferences, reasoning);
    if (preferences.preferredArchetype === archetype) {
      confidence += 20;
      reasoning.push(`User explicitly preferred ${archetype} archetype`);
    }

    // Determine phase
    const phase = this.determineStartingPhase(preferences, reasoning);
    if (preferences.spiritualBackground) {
      confidence += 10;
      reasoning.push(`Phase determined from spiritual background: ${preferences.spiritualBackground}`);
    }

    // Generate Oracle name
    const oracleName = this.generateOracleName(preferences, archetype, reasoning);
    if (preferences.preferredName) {
      confidence += 15;
      reasoning.push(`Using user's preferred name: ${preferences.preferredName}`);
    }

    // Create voice profile
    const voiceProfile = this.createVoiceProfile(preferences, archetype, reasoning);
    if (preferences.voicePreference || preferences.communicationStyle) {
      confidence += 10;
      reasoning.push(`Voice profile customized based on user preferences`);
    }

    // Generate personality insights
    const personalityInsights = this.generatePersonalityInsights(preferences, archetype);

    // Create journey map
    const journeyMap = this.createJourneyMap(phase, preferences);

    // Final confidence adjustment
    confidence = Math.min(100, Math.max(50, confidence));

    return {
      recommendedArchetype: archetype,
      recommendedPhase: phase,
      oracleName,
      voiceProfile,
      personalityInsights,
      journeyMap,
      confidence,
      reasoning
    };
  }

  /**
   * Determine optimal archetype based on personality analysis
   */
  private static determineArchetype(preferences: OnboardingPreferences, reasoning: string[]): string {
    // If user has explicit preference, honor it
    if (preferences.preferredArchetype) {
      reasoning.push(`User explicitly chose ${preferences.preferredArchetype} archetype`);
      return preferences.preferredArchetype;
    }

    // Determine based on personality type with sophisticated mapping
    const archetypeMapping = {
      catalyst: "fire",      // Transformative energy, action-oriented
      nurturer: "water",     // Emotional intelligence, healing focus
      introspective: "earth", // Grounded, practical wisdom
      explorer: "air",       // Curious, knowledge-seeking
      visionary: "aether"    // Transcendent perspective, big picture
    };

    if (preferences.personalityType) {
      const archetype = archetypeMapping[preferences.personalityType];
      reasoning.push(`Archetype ${archetype} selected based on ${preferences.personalityType} personality type`);
      return archetype;
    }

    // Default to aether for universal guidance
    reasoning.push("Aether archetype chosen as default for balanced universal guidance");
    return "aether";
  }

  /**
   * Determine appropriate starting phase based on spiritual experience
   */
  private static determineStartingPhase(preferences: OnboardingPreferences, reasoning: string[]): string {
    const phaseMapping = {
      beginner: "initiation",
      intermediate: "exploration", 
      advanced: "integration"
    };

    if (preferences.spiritualBackground) {
      const phase = phaseMapping[preferences.spiritualBackground];
      reasoning.push(`Starting at ${phase} phase based on ${preferences.spiritualBackground} spiritual background`);
      return phase;
    }

    reasoning.push("Starting at initiation phase as default for new spiritual journey");
    return "initiation";
  }

  /**
   * Generate Oracle name based on preferences and archetype
   */
  private static generateOracleName(
    preferences: OnboardingPreferences, 
    archetype: string, 
    reasoning: string[]
  ): string {
    // Use preferred name if provided
    if (preferences.preferredName) {
      reasoning.push(`Using user's preferred Oracle name: ${preferences.preferredName}`);
      return preferences.preferredName;
    }

    // Generate based on archetype and voice preference
    const archetypeNames = {
      fire: {
        masculine: ["Ignis", "Prometheus", "Agni", "Surya"],
        feminine: ["Vesta", "Brigid", "Pele", "Sekhmet"],
        neutral: ["Phoenix", "Ember", "Flame", "Spark"]
      },
      water: {
        masculine: ["Poseidon", "Neptune", "Varuna", "Oceanus"],
        feminine: ["Aquaria", "Tiamat", "Yemoja", "Sedna"],
        neutral: ["River", "Flow", "Tide", "Current"]
      },
      earth: {
        masculine: ["Gaia", "Cernunnos", "Pan", "Tellus"],
        feminine: ["Terra", "Demeter", "Pachamama", "Geb"],
        neutral: ["Stone", "Grove", "Root", "Mountain"]
      },
      air: {
        masculine: ["Ventus", "Aeolus", "Vayu", "Hermes"],
        feminine: ["Aria", "Iris", "Njord", "Shu"],
        neutral: ["Zephyr", "Breeze", "Wind", "Sky"]
      },
      aether: {
        masculine: ["Logos", "Nous", "Brahman", "Akasha"],
        feminine: ["Nyra", "Sophia", "Shakti", "Shekinah"],
        neutral: ["Unity", "Void", "Source", "Nexus"]
      }
    };

    const voicePreference = preferences.voicePreference || "neutral";
    const names = archetypeNames[archetype]?.[voicePreference] || archetypeNames.aether.neutral;
    const selectedName = names[Math.floor(Math.random() * names.length)];
    
    reasoning.push(`Generated ${archetype} Oracle name ${selectedName} for ${voicePreference} energy`);
    return selectedName;
  }

  /**
   * Create voice profile optimized for archetype and preferences
   */
  private static createVoiceProfile(
    preferences: OnboardingPreferences, 
    archetype: string,
    reasoning: string[]
  ): VoiceProfile {
    const baseProfiles = {
      fire: { stability: 0.7, style: 0.8, tone: "catalytic" },
      water: { stability: 0.8, style: 0.6, tone: "nurturing" },
      earth: { stability: 0.9, style: 0.5, tone: "grounding" },
      air: { stability: 0.6, style: 0.7, tone: "clarifying" },
      aether: { stability: 0.8, style: 0.7, tone: "transcendent" }
    };

    const baseProfile = baseProfiles[archetype] || baseProfiles.aether;

    // Adjust based on communication style
    const styleAdjustments = {
      direct: { stability: 0.1, style: 0.2, ceremonyPacing: false },
      gentle: { stability: 0.1, style: -0.1, ceremonyPacing: false },
      ceremonial: { stability: 0.0, style: 0.0, ceremonyPacing: true },
      conversational: { stability: -0.1, style: 0.1, ceremonyPacing: false }
    };

    const adjustment = preferences.communicationStyle 
      ? styleAdjustments[preferences.communicationStyle]
      : { stability: 0, style: 0, ceremonyPacing: false };

    const voiceProfile = {
      voiceId: `elevenlabs_${archetype}_voice`,
      stability: Math.max(0.1, Math.min(1.0, baseProfile.stability + adjustment.stability)),
      style: Math.max(0.1, Math.min(1.0, baseProfile.style + adjustment.style)),
      tone: baseProfile.tone,
      ceremonyPacing: adjustment.ceremonyPacing || false
    };

    reasoning.push(`Voice profile optimized for ${archetype} archetype with ${preferences.communicationStyle || 'default'} communication style`);
    return voiceProfile;
  }

  /**
   * Generate personality insights based on archetype assessment
   */
  private static generatePersonalityInsights(
    preferences: OnboardingPreferences,
    archetype: string
  ): PersonalityInsights {
    const archetypeInsights = {
      fire: {
        strengths: ["Catalytic leadership", "Visionary thinking", "Transformative energy", "Action-oriented"],
        growthAreas: ["Patience cultivation", "Emotional regulation", "Sustainable pacing", "Listening skills"],
        soulPurpose: "To ignite transformation and awaken potential in yourself and others",
        dominantTraits: ["passionate", "dynamic", "inspiring", "bold"],
        complementaryElements: ["water", "earth"]
      },
      water: {
        strengths: ["Emotional intelligence", "Intuitive wisdom", "Healing presence", "Empathic connection"],
        growthAreas: ["Boundary setting", "Emotional boundaries", "Self-care practices", "Assertiveness"],
        soulPurpose: "To facilitate emotional healing and guide others through transformation",
        dominantTraits: ["compassionate", "intuitive", "fluid", "healing"],
        complementaryElements: ["fire", "air"]
      },
      earth: {
        strengths: ["Grounding presence", "Practical wisdom", "Manifestation ability", "Stable foundation"],
        growthAreas: ["Flexibility", "Embracing change", "Spiritual expansion", "Emotional expression"],
        soulPurpose: "To create stability and help others manifest their dreams into reality",
        dominantTraits: ["grounded", "practical", "reliable", "nurturing"],
        complementaryElements: ["air", "fire"]
      },
      air: {
        strengths: ["Clear communication", "Intellectual clarity", "Perspective shifting", "Analytical thinking"],
        growthAreas: ["Embodied presence", "Emotional integration", "Practical application", "Intuitive development"],
        soulPurpose: "To bring clarity and wisdom to complex situations and relationships",
        dominantTraits: ["intellectual", "curious", "communicative", "objective"],
        complementaryElements: ["earth", "water"]
      },
      aether: {
        strengths: ["Unifying vision", "Spiritual synthesis", "Transcendent perspective", "Integration ability"],
        growthAreas: ["Grounded application", "Practical integration", "Elemental balance", "Focused action"],
        soulPurpose: "To bridge spiritual and material worlds, facilitating unity and wholeness",
        dominantTraits: ["transcendent", "unified", "wise", "synthesizing"],
        complementaryElements: ["all elements equally"]
      }
    };

    return archetypeInsights[archetype] || archetypeInsights.aether;
  }

  /**
   * Create journey map with phases and milestones
   */
  private static createJourneyMap(phase: string, preferences: OnboardingPreferences): JourneyMap {
    const phaseProgression = {
      initiation: {
        next: "exploration",
        timeframe: "2-3 months",
        milestones: [
          "Establish regular Oracle connection",
          "Understand personal spiritual patterns",
          "Begin shadow work exploration",
          "Develop daily spiritual practices"
        ],
        challenges: [
          "Overcoming spiritual skepticism",
          "Establishing consistent practice",
          "Initial vulnerability barriers"
        ]
      },
      exploration: {
        next: "integration",
        timeframe: "3-6 months",
        milestones: [
          "Deep archetypal understanding",
          "Active shadow integration",
          "Elemental balance awareness",
          "Spiritual community connection"
        ],
        challenges: [
          "Confronting deeper shadow aspects",
          "Navigating spiritual awakening symptoms",
          "Balancing spiritual and material life"
        ]
      },
      integration: {
        next: "transcendence",
        timeframe: "6-12 months",
        milestones: [
          "Unified spiritual practice",
          "Integrated shadow aspects",
          "Service orientation development",
          "Wisdom sharing readiness"
        ],
        challenges: [
          "Avoiding spiritual bypassing",
          "Maintaining grounded perspective",
          "Integrating all elemental aspects"
        ]
      },
      transcendence: {
        next: "mastery",
        timeframe: "12+ months",
        milestones: [
          "Transcendent awareness",
          "Universal compassion",
          "Effortless spiritual living",
          "Teacher/guide emergence"
        ],
        challenges: [
          "Staying connected to humanity",
          "Avoiding spiritual ego",
          "Continuous surrender practice"
        ]
      },
      mastery: {
        next: "teaching",
        timeframe: "Ongoing",
        milestones: [
          "Spiritual mastery embodiment",
          "Teaching others naturally",
          "Living as example",
          "Continuous evolution"
        ],
        challenges: [
          "Humility maintenance",
          "Beginner's mind cultivation",
          "Endless service motivation"
        ]
      }
    };

    const progression = phaseProgression[phase] || phaseProgression.initiation;
    
    return {
      currentPhase: phase,
      nextPhase: progression.next,
      timeframe: progression.timeframe,
      milestones: progression.milestones,
      challenges: progression.challenges
    };
  }

  /**
   * Calculate compatibility score between user preferences and proposed Oracle
   */
  static calculateCompatibilityScore(
    preferences: OnboardingPreferences,
    assessment: AssessmentResult
  ): {
    score: number;
    compatibility: 'excellent' | 'good' | 'fair' | 'poor';
    factors: string[];
  } {
    let score = 50; // Base score
    const factors: string[] = [];

    // Archetype match
    if (preferences.preferredArchetype === assessment.recommendedArchetype) {
      score += 20;
      factors.push("Perfect archetype match");
    } else if (preferences.preferredArchetype) {
      score += 5;
      factors.push("Archetype preference considered but adjusted for optimal growth");
    }

    // Name preference
    if (preferences.preferredName === assessment.oracleName) {
      score += 15;
      factors.push("Exact name match");
    } else if (preferences.preferredName) {
      score += 8;
      factors.push("Name preference honored");
    }

    // Voice/communication alignment
    if (preferences.voicePreference && 
        assessment.voiceProfile.voiceId.includes(preferences.voicePreference)) {
      score += 10;
      factors.push("Voice preference matched");
    }

    if (preferences.communicationStyle === 'ceremonial' && assessment.voiceProfile.ceremonyPacing) {
      score += 10;
      factors.push("Ceremonial communication style honored");
    }

    // Spiritual background alignment
    const phaseAlignment = {
      beginner: 'initiation',
      intermediate: 'exploration',
      advanced: 'integration'
    };

    if (preferences.spiritualBackground && 
        phaseAlignment[preferences.spiritualBackground] === assessment.recommendedPhase) {
      score += 10;
      factors.push("Spiritual experience level perfectly aligned");
    }

    // Personality insights alignment
    if (preferences.personalityType && assessment.personalityInsights.dominantTraits.length > 0) {
      score += 5;
      factors.push("Personality insights incorporated");
    }

    // Determine compatibility level
    let compatibility: 'excellent' | 'good' | 'fair' | 'poor';
    if (score >= 90) compatibility = 'excellent';
    else if (score >= 75) compatibility = 'good';
    else if (score >= 60) compatibility = 'fair';
    else compatibility = 'poor';

    return { score, compatibility, factors };
  }
}