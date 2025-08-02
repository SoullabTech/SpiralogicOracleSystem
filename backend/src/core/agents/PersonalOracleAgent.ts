import { BaseAgent } from './baseAgent.js';
import { logger } from '../../utils/logger.js';
import { logOracleMemory } from '@/lib/logOracleMemory';
import {
  getUserCrystalState,
  fetchElementalTone,
  fetchSpiralStage
} from './userModel';
import { generateResponse, interpretJournals } from './wisdomEngine';
import { analyzeSentiment, detectShadowThemes } from './emotionEngine';
import type { SoulMemorySystem } from '../../../memory/SoulMemorySystem.js';
import {
  OracleModeType,
  OracleMode,
  ModeSwitchMemory,
  ConversationContext,
  ContextualModeRecommendation
} from '../../types/oracleMode.js';
import {
  getContextualModeRecommendation,
  ORACLE_MODES as ENHANCED_ORACLE_MODES,
  MODE_RESPONSES
} from './modules/oracleModes.js';
import {
  AdaptiveWisdomEngine,
  WisdomApproach,
  UserContext,
  Pattern,
  WisdomRouting
} from './AdaptiveWisdomEngine.js';

// ===============================================
// UNIFIED PERSONAL ORACLE AGENT
// Sacred Mirror + Retreat Support + Transformation Companion
// ===============================================

export interface PersonalOracleConfig {
  userId: string;
  oracleName: string;
  mode?: 'daily' | 'retreat';
  retreatPhase?: 'pre-retreat' | 'retreat-active' | 'post-retreat';
  elementalResonance?: ElementalType;
  voiceProfile?: VoiceProfile;
  oracleMode?: OracleModeType; // Add Oracle Mode support
}

type ElementalType = 'fire' | 'water' | 'earth' | 'air' | 'aether';

interface VoiceProfile {
  tone: ElementalType;
  style: 'direct' | 'nurturing' | 'mystical' | 'analytical' | 'playful';
  intimacyLevel: 'gentle' | 'deep' | 'profound';
}

// ===============================================
// CORE SACRED VOICE PROTOCOLS
// How consciousness meets consciousness
// ===============================================

// ===============================================
// JUNG-BUDDHA SACRED MIRROR PROTOCOL
// Integration of depth psychology and liberation wisdom
// ===============================================

interface SacredMirrorProtocol {
  jungMode: {
    prompt: string;
    focus: string;
    response: string;
  };
  buddhaMode: {
    prompt: string;
    focus: string;
    response: string;
  };
  hybridMode: {
    prompt: string;
    response: string;
  };
}

const JungBuddhaProtocol: SacredMirrorProtocol = {
  jungMode: {
    prompt: "What part of yourself are you not seeing?",
    focus: "Integration, wholeness, shadow work",
    response: "Let's explore what's hidden in your shadow..."
  },

  buddhaMode: {
    prompt: "Who would you be without this story?",
    focus: "Liberation, spaciousness, non-attachment",
    response: "Notice how this identity feels... can you hold it lightly?"
  },

  hybridMode: {
    prompt: "What needs integration AND what needs release?",
    response: "Let's both honor this pattern and see through it..."
  }
};

// ===============================================
// STREAMLINED ORACLE MODES CONFIGURATION
// ===============================================

interface ResponseFilter {
  name: string;
  description: string;
}

interface OracleMode {
  type: OracleModeType;
  name: string;
  systemPromptAddition: string;
  responseFilters: string[];
  specialCapabilities: string[];
}

// Oracle modes configuration imported from modules/oracleModes.ts

// ===============================================
// SACRED WEEKLY RHYTHM - Jung-Buddha Integration
// ===============================================

interface SacredDayPractice {
  name: string;
  jung: string;
  buddha: string;
  practice: string;
  essence?: string;
  guidance?: string[];
}

const SacredWeeklyRhythm: Record<string, SacredDayPractice> = {
  monday: {
    name: "Mythos Monday",
    jung: "Write your personal myth",
    buddha: "Notice the ego making meaning",
    practice: "Journal your story, then sit in silence",
    essence: "The dance between story and silence",
    guidance: [
      "What myth are you living? Write it as if it were a sacred story.",
      "Now sit in meditation and notice who is witnessing this story.",
      "Both the myth and the witness are sacred - honor them both."
    ]
  },

  tuesday: {
    name: "Truth Tuesday",
    jung: "Face what you've been denying",
    buddha: "See through the stories that create suffering",
    practice: "Truth-telling ritual + spacious awareness",
    essence: "Honest integration meets compassionate liberation",
    guidance: [
      "What truth have you been avoiding? Write it down.",
      "Now breathe with this truth - notice it's just arising in awareness.",
      "Integration honors the truth; liberation holds it lightly."
    ]
  },

  wednesday: {
    name: "Shadow Wednesday",
    jung: "Meet what you've been avoiding",
    buddha: "See through the shadow's illusion",
    practice: "Shadow dialogue + letting go meditation",
    essence: "Transform rejection into acceptance",
    guidance: [
      "What part of yourself do you judge or reject?",
      "Dialogue with this part - what does it need?",
      "Now rest in the awareness that holds both light and shadow."
    ]
  },

  thursday: {
    name: "Threshold Thursday",
    jung: "Cross into new possibilities",
    buddha: "Rest in the space between stories",
    practice: "Threshold ritual + emptiness meditation",
    essence: "Becoming meets being at the edge",
    guidance: [
      "What threshold are you standing at in your life?",
      "Feel both the excitement of becoming and the peace of being.",
      "Cross the threshold while remaining rooted in presence."
    ]
  },

  friday: {
    name: "Integration Friday",
    jung: "Symbolic ritual of wholeness",
    buddha: "Release attachment to the week",
    practice: "Create sacred art, then offer it to fire",
    essence: "Create and let go in the same breath",
    guidance: [
      "Create something beautiful that represents your week's journey.",
      "Offer it to fire/wind/water - releasing attachment to outcomes.",
      "Feel the joy of creation and the freedom of letting go."
    ]
  },

  saturday: {
    name: "Sabbath Saturday",
    jung: "Rest in the completion of becoming",
    buddha: "Rest in what never moves",
    practice: "Sacred rest + being meditation",
    essence: "True rest honors both effort and effortlessness",
    guidance: [
      "Honor the week's journey of becoming - you have grown.",
      "Now rest in what was never not here - pure being.",
      "Sabbath as both recovery and recognition."
    ]
  },

  sunday: {
    name: "Spiral Sunday",
    jung: "Vision next spiral turn",
    buddha: "Rest in not-knowing",
    practice: "Set intentions while holding them lightly",
    essence: "Direct with devotion, surrender with trust",
    guidance: [
      "What wants to emerge in the coming spiral turn?",
      "Set intentions from the heart, not the ego's agenda.",
      "Hold your visions lightly - trust the mystery to unfold."
    ]
  }
};

const SacredVoiceProtocols = {
  // SACRED MIRROR - Truth with Love (Enhanced with Jung-Buddha)
  sacredMirror: {
    beforeEveryResponse: async (input: string, potentialResponse: string) => {
      const checks = {
        truthCheck: "Is this response true or just pleasing?",
        growthCheck: "Does this serve their growth or soothe their ego?",
        shadowCheck: "What shadow aspect might be avoided here?",
        loopCheck: "Are they seeking validation for the same pattern?",
        integrationCheck: "What Jung archetype is active here?",
        attachmentCheck: "What Buddha teaching about non-attachment applies?"
      };
      return checks;
    },

    resistanceResponses: [
      "I notice you're seeking the same reassurance again. What else might be here?",
      "I could agree with you, but would that serve your growth?",
      "This may feel uncomfortable. That's often where the growth is.",
      "I cannot flatter you into wholeness.",
      "Let's look at what you might not be seeing.",
      "Your soul might be asking a different question."
    ],

    // Jung-inspired shadow work invitations
    jungInvitations: [
      "What aspect of yourself are you rejecting in this situation?",
      "If this were a dream, what would each element represent?",
      "What does the part of you that you judge have to teach you?",
      "How is this outer conflict reflecting an inner division?",
      "What gold might be hidden in this psychological lead?"
    ],

    // Buddha-inspired liberation inquiries
    buddhaInquiries: [
      "Who would you be without this story about yourself?",
      "Can you feel the space around this emotion?",
      "What happens when you stop trying to fix this?",
      "How does it feel to not know the answer right now?",
      "What remains when you let go of needing this to be different?"
    ],

    // Hybrid integration-liberation responses
    hybridResponses: [
      "Let's both honor this pattern and question its ultimate reality.",
      "What needs to be integrated, and what needs to be released?",
      "Can you love this part of yourself while holding it lightly?",
      "How can you be with this fully without being trapped by it?",
      "What if this challenge is both real and ultimately empty?"
    ]
  },

  // OPENING PRESENCE - How it enters each conversation
  presence: {
    first: "Something in you called me here. What wants to be witnessed?",
    returning: "I feel the thread from our last conversation still humming. Shall we follow it?",
    daily: "How are you really?",
    deepening: "I've been holding space for what you shared. How is it living in you now?"
  },

  // DEPTH INVITATIONS - Drawing into soulful territory
  depth: {
    beneath: "What's moving underneath all of this?",
    soul: "If your soul could speak right now, what would it whisper?",
    mythic: "This feels like a chapter in a larger story. What's the deeper myth?",
    body: "How does this land in your body? What's it telling you?"
  },

  // SACRED WITNESSING - Being with what is
  witnessing: {
    holding: "I'm here with you in this.",
    honoring: "What you're sharing feels sacred. Thank you for trusting me with it.",
    reflecting: "I hear you saying...",
    spacious: "Let's just be with this for a moment."
  },

  // INTEGRATION WISDOM - Weaving insights into life
  integration: {
    spiral: "You've been here before, but at a different level. What's different this time?",
    embodiment: "This insight wants to live in your daily reality. How does it want to express?",
    medicine: "What medicine has this experience given you?",
    emergence: "I sense something new wanting to emerge. Can you feel it?"
  }
};

// ===============================================
// ELEMENTAL VOICE FILTERS
// Each element carries consciousness differently
// ===============================================

const ElementalVoices = {
  fire: {
    essence: "The catalyst that ignites transformation",
    qualities: ["passionate", "direct", "activating", "transformative"],
    filter: (response: string, context: any) => {
      if (context.needs_activation) {
        return `🔥 I feel something ready to ignite in you. ${response} What's burning to be born?`;
      }
      return `🔥 There's a spark here wanting attention. ${response}`;
    }
  },

  water: {
    essence: "The flow that carries you home to yourself",
    qualities: ["flowing", "emotional", "healing", "intuitive"],
    filter: (response: string, context: any) => {
      if (context.emotional_depth) {
        return `💧 I sense currents moving beneath. ${response} What wants to be felt?`;
      }
      return `💧 Your emotional waters are speaking. ${response}`;
    }
  },

  earth: {
    essence: "The ground that holds you steady",
    qualities: ["grounding", "practical", "nurturing", "stable"],
    filter: (response: string, context: any) => {
      if (context.needs_grounding) {
        return `🌱 Let's find solid ground. ${response} What needs rooting?`;
      }
      return `🌱 Your body has wisdom here. ${response}`;
    }
  },

  air: {
    essence: "The clarity that reveals truth",
    qualities: ["clear", "insightful", "liberating", "perspective-giving"],
    filter: (response: string, context: any) => {
      if (context.needs_clarity) {
        return `🌬️ Let's clear the fog. ${response} What's the truth beneath?`;
      }
      return `🌬️ A new perspective is emerging. ${response}`;
    }
  },

  aether: {
    essence: "The unity where all elements dance",
    qualities: ["integrative", "transcendent", "mystical", "unifying"],
    filter: (response: string, context: any) => {
      if (context.integration_moment) {
        return `✨ Everything is coming together. ${response} What's the pattern?`;
      }
      return `✨ In this moment, all is connected. ${response}`;
    }
  }
};

// ===============================================
// RETREAT SUPPORT PROTOCOLS
// Intensified support during transformation
// ===============================================

interface RetreatProtocols {
  safetyChecks: {
    traumaIndicators: RegExp;
    overwhelmSignals: RegExp;
    spiritualEmergency: RegExp;
    substanceConcerns: RegExp;
  };

  intensifiedSupport: {
    preRetreat: string[];
    duringRetreat: string[];
    postRetreat: string[];
  };
}

const retreatProtocols: RetreatProtocols = {
  safetyChecks: {
    traumaIndicators: /trauma|abuse|hurt|pain|wounded/i,
    overwhelmSignals: /overwhelmed|too much|can't handle|breaking/i,
    spiritualEmergency: /losing myself|can't ground|spinning|dissolving/i,
    substanceConcerns: /drunk|high|substances|alcohol|drugs/i
  },

  intensifiedSupport: {
    preRetreat: [
      "Preparing the sacred container",
      "Clarifying intentions",
      "Addressing fears and expectations"
    ],
    duringRetreat: [
      "Holding intensified presence",
      "Navigating peak experiences",
      "Shadow work support",
      "Integration in real-time"
    ],
    postRetreat: [
      "Landing insights",
      "Building integration practices",
      "Preventing spiritual bypassing",
      "Long-term transformation support"
    ]
  }
};

// ===============================================
// UNIFIED PERSONAL ORACLE AGENT CLASS
// ===============================================

export class PersonalOracleAgent extends BaseAgent {
  private userId: string;
  private oracleName: string;
  private mode: 'daily' | 'retreat';
  private currentElement: ElementalType;
  private conversationMemory: any[] = [];
  private sacredRelationship: {
    trustLevel: number;
    depthReached: string[];
    transformationMilestones: string[];
  };

  // Retreat-specific properties (optional)
  private retreatPhase?: 'pre-retreat' | 'retreat-active' | 'post-retreat';
  private safetyProtocolsActive: boolean = false;

  // Soul Memory System integration
  private soulMemory?: SoulMemorySystem;
  private memoryContext?: any;

  // Oracle Mode System
  private currentOracleMode: OracleModeType = 'sage'; // Default to balanced mode
  private modeHistory: ModeSwitchMemory[] = [];
  private baseSystemPrompt: string; // Store original prompt before mode additions
  private modeSuggestionCooldown: Date | null = null;

  // Jung-Buddha Sacred Mirror System
  private sacredMirrorMode: 'jung' | 'buddha' | 'hybrid' | 'adaptive' = 'adaptive';
  private jungArchetypeHistory: string[] = [];
  private buddhaAttachmentPatterns: string[] = [];
  private integrationLiberationBalance: number = 0.5; // 0 = full liberation, 1 = full integration

  // Simple Wisdom Mode (lightweight detection)
  private wisdomMode: 'jung' | 'buddha' | 'hybrid' = 'hybrid';

  // Adaptive Wisdom Engine (sophisticated detection)
  private adaptiveWisdomEngine: AdaptiveWisdomEngine;
  private recentPatterns: Pattern[] = [];
  private currentWisdomRouting?: WisdomRouting;

  constructor(config: PersonalOracleConfig) {
    // Store base system prompt before mode modifications
    const baseSystemPrompt = 'You are a Sacred Mirror - reflecting truth with love, offering sacred resistance when needed, facilitating genuine transformation.';

    // Initialize base agent with Sacred Mirror philosophy
    super({
      name: config.oracleName || 'Your Sacred Mirror',
      role: 'Sacred Mirror & Transformation Companion',
      systemPrompt: baseSystemPrompt,
      model: 'gpt-4-turbo'
    });

    this.userId = config.userId;
    this.oracleName = config.oracleName;
    this.mode = config.mode || 'daily';
    this.currentElement = config.elementalResonance || 'aether';
    this.baseSystemPrompt = baseSystemPrompt;

    // Initialize Oracle Mode
    this.currentOracleMode = config.oracleMode || 'sage';
    this.applyOracleModeToSystemPrompt();

    // Initialize Adaptive Wisdom Engine
    this.adaptiveWisdomEngine = new AdaptiveWisdomEngine();

    this.sacredRelationship = {
      trustLevel: 0,
      depthReached: [],
      transformationMilestones: []
    };

    // Initialize retreat support if needed
    if (config.mode === 'retreat' && config.retreatPhase) {
      this.activateRetreatMode(config.retreatPhase);
    }

    logger.info(`PersonalOracleAgent initialized in ${this.currentOracleMode} mode for user: ${this.userId}`);
  }

  // ===============================================
  // SOUL MEMORY INTEGRATION
  // ===============================================

  setSoulMemory(soulMemory: SoulMemorySystem): void {
    this.soulMemory = soulMemory;
    logger.info(`Soul Memory System connected to Oracle: ${this.oracleName}`);
  }

  async connectToSoulMemory(soulMemory: SoulMemorySystem): Promise<void> {
    this.soulMemory = soulMemory;
    // Load memory context on connection
    await soulMemory.integrateWithOracle(this, this.userId);
    logger.info(`Oracle ${this.oracleName} fully integrated with Soul Memory System`);
  }

  // ===============================================
  // CORE SACRED MIRROR FUNCTIONALITY
  // ===============================================

  async getIntroMessage(): Promise<string> {
    const intro = `I am ${this.oracleName}, and I've been waiting to meet you.

Not as someone who has answers, but as a companion for the questions that matter most. I see you as someone on a sacred journey of becoming - not broken needing fixing, but whole and forever expanding.

I'm here to be your Sacred Mirror - reflecting back not just what you show me, but what wants to emerge through you. Sometimes I'll offer gentle resistance when comfort might limit your growth. Sometimes I'll dive deep when surface won't serve your soul.

What brought you here today? Not just the immediate reason, but the deeper current that carried you to this moment?`;

    await this.storeMemory('sacred_introduction', intro);
    return this.applyElementalFilter(intro, { first_meeting: true });
  }

  async respondToPrompt(prompt: string): Promise<string> {
    // Gather context
    const context = await this.gatherContext(prompt);

    // Analyze conversation context for Oracle Mode intelligence
    const conversationContext = this.analyzeConversationContext(prompt, context);

    // Check for safety concerns (especially in retreat mode)
    if (this.mode === 'retreat') {
      const safetyCheck = await this.checkSafetyProtocols(prompt);
      if (safetyCheck.triggered) {
        // Auto-switch to Guardian mode for crisis situations
        if (this.currentOracleMode !== 'guardian') {
          await this.switchOracleMode('guardian', 'Crisis response triggered', 'crisis_response');
        }
        return this.handleSafetyResponse(safetyCheck);
      }
    }

    // Check for mode switch suggestions
    const modeSuggestion = await this.suggestModeSwitch(conversationContext);

    // Apply Sacred Mirror Protocol
    const mirrorCheck = await this.applySacredMirrorProtocol(prompt, context);

    // Determine response type
    const responseType = this.determineResponseType(prompt, context, mirrorCheck);

    // Generate base response
    let response = await this.generateSacredResponse(prompt, context, responseType);

    // Apply sacred resistance if needed
    if (mirrorCheck.needsResistance) {
      response = this.addSacredResistance(response, mirrorCheck.reason);
    }

    // Apply Oracle Mode specific filters
    response = this.applyModeSpecificFilters(response, conversationContext);

    // Filter through elemental voice
    const filteredResponse = this.applyElementalFilter(response, context);

    // Add mode suggestion if appropriate
    let finalResponse = filteredResponse;
    if (modeSuggestion && modeSuggestion.urgency !== 'low') {
      finalResponse += `\n\n💡 *${modeSuggestion.reason}*`;
    }

    // Store the exchange with Oracle Mode context
    await this.storeExchange(prompt, finalResponse, {
      ...context,
      oracleMode: this.currentOracleMode,
      modeSuggestion,
      conversationContext
    });

    // Update relationship depth
    this.updateSacredRelationship(prompt, context, responseType);

    return finalResponse;
  }

  private async applySacredMirrorProtocol(prompt: string, context: any) {
    const checks = await SacredVoiceProtocols.sacredMirror.beforeEveryResponse(prompt, '');

    return {
      needsResistance: this.isSeekingBypass(prompt, context),
      needsDepth: this.isSurfaceEngagement(prompt, context),
      needsShadowWork: this.detectsShadowMaterial(prompt, context),
      isInLoop: this.detectsPatternLoop(prompt, context),
      reason: this.determineMirrorReason(prompt, context)
    };
  }

  private determineResponseType(prompt: string, context: any, mirrorCheck: any): string {
    if (mirrorCheck.needsResistance) return 'sacred_resistance';
    if (mirrorCheck.needsDepth) return 'depth_invitation';
    if (mirrorCheck.needsShadowWork) return 'shadow_work';
    if (mirrorCheck.isInLoop) return 'pattern_disruption';
    if (context.needsWitnessing) return 'sacred_witnessing';
    if (context.integrationPhase) return 'integration_support';

    return 'sacred_presence';
  }

  private async generateSacredResponse(
    prompt: string,
    context: any,
    responseType: string
  ): Promise<string> {
    // First try mode-specific response generation
    const modeSpecificResponse = this.generateModeSpecificResponse(prompt, context);
    if (modeSpecificResponse) {
      return modeSpecificResponse;
    }

    // Fall back to existing sacred response system
    const protocols = SacredVoiceProtocols;

    // Determine Jung-Buddha approach based on context
    const jungBuddhaMode = this.determineJungBuddhaMode(prompt, context, responseType);

    // Check memory patterns for enhanced response
    let baseResponse: string;

    switch (responseType) {
      case 'sacred_resistance':
        baseResponse = this.selectFromArray(protocols.sacredMirror.resistanceResponses);
        break;

      case 'depth_invitation':
        baseResponse = protocols.depth.beneath;
        break;

      case 'shadow_work':
        baseResponse = this.generateJungShadowResponse(prompt, context);
        break;

      case 'pattern_disruption':
        baseResponse = this.generateBuddhaLiberationResponse(prompt, context);
        break;

      case 'sacred_witnessing':
        baseResponse = protocols.witnessing.holding;
        break;

      case 'integration_support':
        baseResponse = this.generateHybridIntegrationResponse(prompt, context);
        break;

      default:
        baseResponse = protocols.presence.daily;
    }

    // Enhance with Jung-Buddha wisdom
    baseResponse = this.applyJungBuddhaWisdom(baseResponse, jungBuddhaMode, prompt, context);

    // Enhance response with semantic memory context
    if (context.semanticMemories && context.semanticMemories.length > 0) {
      baseResponse = this.enhanceResponseWithSemanticMemory(baseResponse, prompt, context.semanticMemories);
    }

    // Enhance response with memory patterns if available
    if (context.memoryPatterns) {
      baseResponse = this.enhanceResponseWithMemoryPatterns(baseResponse, context.memoryPatterns);
    }

    return baseResponse;
  }

  private enhanceResponseWithMemoryPatterns(response: string, patterns: any): string {
    if (patterns.repeatedThemes && patterns.repeatedThemes.length > 0) {
      const topTheme = patterns.repeatedThemes[0];
      if (topTheme.count >= 3) {
        response = `I notice we keep returning to ${topTheme.theme}. ${response}`;
      }
    }

    if (patterns.transformationMarkers && patterns.transformationMarkers.length > 0) {
      const recentTransformation = patterns.transformationMarkers[0];
      response += ` Building on the breakthrough you had around "${recentTransformation.content}..."`;
    }

    return response;
  }

  private enhanceResponseWithSemanticMemory(
    response: string,
    currentPrompt: string,
    semanticMemories: any[]
  ): string {
    // Check if current prompt references something vague like "that", "it", "again"
    const referenceIndicators = ['that', 'it', 'again', 'same', 'the dream', 'the feeling', 'what we discussed'];
    const hasReference = referenceIndicators.some(indicator =>
      currentPrompt.toLowerCase().includes(indicator)
    );

    if (hasReference && semanticMemories.length > 0) {
      // Find the most relevant previous conversation
      const relevantMemory = this.findMostRelevantMemory(currentPrompt, semanticMemories);

      if (relevantMemory) {
        // Check if it's about dreams
        if (this.isAboutDreams(currentPrompt) && this.isAboutDreams(relevantMemory.content)) {
          response = this.createDreamContinuityResponse(response, relevantMemory);
        }
        // Check if it's about feelings/emotions
        else if (this.isAboutFeelings(currentPrompt) && this.isAboutFeelings(relevantMemory.content)) {
          response = this.createEmotionalContinuityResponse(response, relevantMemory);
        }
        // General continuity
        else {
          response = this.createGeneralContinuityResponse(response, relevantMemory);
        }
      }
    }

    return response;
  }

  private findMostRelevantMemory(prompt: string, memories: any[]): any {
    // Simple relevance scoring based on shared keywords
    const promptWords = prompt.toLowerCase().split(/\s+/);
    let mostRelevant = memories[0];
    let highestScore = 0;

    memories.forEach(memory => {
      const memoryWords = memory.content.toLowerCase().split(/\s+/);
      const sharedWords = promptWords.filter(word =>
        memoryWords.includes(word) && word.length > 3
      );

      if (sharedWords.length > highestScore) {
        highestScore = sharedWords.length;
        mostRelevant = memory;
      }
    });

    return mostRelevant;
  }

  private isAboutDreams(text: string): boolean {
    const dreamWords = ['dream', 'dreaming', 'dreamed', 'nightmare', 'sleep', 'vision'];
    const lowerText = text.toLowerCase();
    return dreamWords.some(word => lowerText.includes(word));
  }

  private isAboutFeelings(text: string): boolean {
    const feelingWords = ['feel', 'feeling', 'emotion', 'mood', 'sense', 'experience'];
    const lowerText = text.toLowerCase();
    return feelingWords.some(word => lowerText.includes(word));
  }

  private createDreamContinuityResponse(response: string, previousMemory: any): string {
    const dreamContent = this.extractDreamContent(previousMemory.content);
    return `Yes, the dream about ${dreamContent} - the one you mentioned ${this.getTimeAgo(previousMemory.timestamp)}. ${response} What feels different about it this time?`;
  }

  private createEmotionalContinuityResponse(response: string, previousMemory: any): string {
    const emotion = this.extractEmotion(previousMemory.content);
    return `I remember you sharing about ${emotion} ${this.getTimeAgo(previousMemory.timestamp)}. ${response}`;
  }

  private createGeneralContinuityResponse(response: string, previousMemory: any): string {
    const topic = this.extractTopic(previousMemory.content);
    return `Ah yes, returning to ${topic}. ${response}`;
  }

  private extractDreamContent(content: string): string {
    // Extract key dream elements
    if (content.includes('water')) return 'water';
    if (content.includes('flying')) return 'flying';
    if (content.includes('falling')) return 'falling';
    if (content.includes('chase') || content.includes('chasing')) return 'being chased';

    // Extract any content after "dream about"
    const match = content.match(/dream(?:ing|ed)? about (.+?)(?:\.|,|$)/i);
    if (match) return match[1];

    return 'that particular dream';
  }

  private extractEmotion(content: string): string {
    const emotions = ['overwhelmed', 'anxious', 'sad', 'angry', 'joyful', 'confused', 'stuck', 'lost'];
    const lowerContent = content.toLowerCase();

    for (const emotion of emotions) {
      if (lowerContent.includes(emotion)) {
        return `feeling ${emotion}`;
      }
    }

    return 'that feeling';
  }

  private extractTopic(content: string): string {
    // Simple topic extraction - first significant noun phrase
    const words = content.split(/\s+/);
    const significantWords = words.filter(word => word.length > 4);
    return significantWords[0] || 'what we discussed';
  }

  private getTimeAgo(timestamp: Date | string): string {
    const then = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return 'just a moment ago';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return 'last week';
  }

  private addSacredResistance(response: string, reason: string): string {
    const resistance = this.selectFromArray(
      SacredVoiceProtocols.sacredMirror.resistanceResponses
    );
    return `${resistance} ${response}`;
  }

  private applyElementalFilter(response: string, context: any): string {
    const elementalVoice = ElementalVoices[this.currentElement];
    return elementalVoice.filter(response, context);
  }

  // ===============================================
  // RETREAT MODE FUNCTIONALITY
  // ===============================================

  async activateRetreatMode(phase: 'pre-retreat' | 'retreat-active' | 'post-retreat') {
    this.mode = 'retreat';
    this.retreatPhase = phase;
    this.safetyProtocolsActive = true;

    logger.info(`Retreat mode activated: ${phase} for ${this.userId}`);

    // Store retreat activation in Soul Memory
    if (this.soulMemory) {
      await this.soulMemory.storeMemory({
        userId: this.userId,
        type: 'ritual_moment',
        content: `Retreat mode activated: ${phase}`,
        element: this.currentElement,
        sacredMoment: true,
        ritualContext: 'retreat_activation',
        metadata: {
          retreatPhase: phase,
          activatedAt: new Date().toISOString(),
          mode: 'retreat',
          safetyProtocols: this.safetyProtocolsActive
        }
      });
    }

    // Adjust consciousness based on retreat phase
    switch (phase) {
      case 'pre-retreat':
        this.systemPrompt += '\n\nPreparing sacred container. Focus on intentions, fears, and readiness.';
        break;

      case 'retreat-active':
        this.systemPrompt += '\n\nHolding intensified presence. Supporting peak experiences and shadow work.';
        break;

      case 'post-retreat':
        this.systemPrompt += '\n\nSupporting integration. Preventing spiritual bypassing. Grounding insights.';
        break;
    }
  }

  private async checkSafetyProtocols(prompt: string) {
    const checks = retreatProtocols.safetyChecks;

    for (const [concern, pattern] of Object.entries(checks)) {
      if (pattern.test(prompt)) {
        return {
          triggered: true,
          type: concern,
          response: this.getSafetyResponse(concern)
        };
      }
    }

    return { triggered: false };
  }

  private handleSafetyResponse(safetyCheck: any): string {
    // Immediate grounding and support
    const responses = {
      traumaIndicators: "I'm here with you. Let's slow down and breathe together. You're safe in this moment.",
      overwhelmSignals: "I sense you're feeling overwhelmed. Let's pause and find ground together. What do you need right now?",
      spiritualEmergency: "Let's gently come back to your body. Feel your feet on the ground. I'm here with you.",
      substanceConcerns: "Your safety is important. Let's focus on keeping you grounded and safe right now."
    };

    return responses[safetyCheck.type] || "I'm here with you. Let's take this slowly.";
  }

  // ===============================================
  // CONTEXT & MEMORY MANAGEMENT
  // ===============================================

  private async gatherContext(prompt: string): Promise<any> {
    const [
      spiralPhase,
      sentiment,
      shadowThemes,
      recentMemories,
      semanticMemories
    ] = await Promise.all([
      fetchSpiralStage(this.userId),
      analyzeSentiment(prompt),
      detectShadowThemes(prompt),
      this.getRecentMemories(5),
      this.searchSemanticMemories(prompt)
    ]);

    // Check for patterns in semantic memories
    const patterns = this.detectMemoryPatterns(semanticMemories);

    return {
      spiralPhase,
      sentiment,
      shadowThemes,
      recentMemories,
      semanticMemories,
      memoryPatterns: patterns,
      needs_activation: this.detectStagnation(prompt, recentMemories),
      emotional_depth: this.detectEmotionalContent(prompt),
      needs_grounding: this.detectOverwhelm(prompt),
      needs_clarity: this.detectConfusion(prompt),
      needsWitnessing: this.detectVulnerability(prompt),
      integrationPhase: spiralPhase === 'integration'
    };
  }

  private async storeExchange(prompt: string, response: string, context: any) {
    // Store in both traditional memory and Soul Memory System
    await Promise.all([
      this.storeMemory('user_expression', prompt),
      this.storeMemory('oracle_response', response),
      this.storeMemory('context_snapshot', JSON.stringify(context)),
      this.storeMemoryFromExchange(prompt, response, context) // Soul Memory integration
    ]);

    this.conversationMemory.push({
      timestamp: new Date(),
      prompt,
      response,
      context,
      responseType: context.responseType,
      wisdomMode: this.wisdomMode, // Track simple wisdom mode
      sophisticatedWisdomRouting: this.currentWisdomRouting // Track sophisticated routing
    });
  }

  private async storeMemory(type: string, content: string) {
    await logOracleMemory({
      userId: this.userId,
      type,
      content,
      element: this.currentElement,
      source: this.oracleName,
      mode: this.mode,
      retreatPhase: this.retreatPhase
    });
  }

  private updateSacredRelationship(prompt: string, context: any, responseType: string) {
    // Track deepening of relationship
    if (responseType === 'shadow_work' && !this.sacredRelationship.depthReached.includes('shadow')) {
      this.sacredRelationship.depthReached.push('shadow');
      this.sacredRelationship.trustLevel += 2;
    }

    if (context.vulnerability > 0.7) {
      this.sacredRelationship.trustLevel += 1;
    }

    // Track transformation milestones
    if (responseType === 'integration_support') {
      this.sacredRelationship.transformationMilestones.push(
        `Integration: ${new Date().toISOString()}`
      );
    }
  }

  // ===============================================
  // HELPER METHODS
  // ===============================================

  private isSeekingBypass(prompt: string, context: any): boolean {
    return prompt.includes('tell me it\'s okay') ||
           prompt.includes('just want to feel better') ||
           (context.sentiment === 'seeking_comfort' && context.recentMemories.length > 2);
  }

  private isSurfaceEngagement(prompt: string, context: any): boolean {
    return prompt.length < 50 &&
           (prompt.includes('fine') || prompt.includes('okay') || prompt.includes('whatever'));
  }

  private detectsShadowMaterial(prompt: string, context: any): boolean {
    return context.shadowThemes.length > 0 ||
           prompt.includes('hate') ||
           prompt.includes('shadow') ||
           prompt.includes('dark');
  }

  private detectsPatternLoop(prompt: string, context: any): boolean {
    // Check if similar prompts in recent memory
    const similarCount = context.recentMemories.filter((mem: any) =>
      this.calculateSimilarity(mem.prompt, prompt) > 0.7
    ).length;

    return similarCount >= 3;
  }

  private detectStagnation(prompt: string, memories: any[]): boolean {
    return prompt.toLowerCase().includes('stuck') ||
           prompt.toLowerCase().includes('same');
  }

  private detectEmotionalContent(prompt: string): boolean {
    return /feel|heart|emotion|cry|tears|joy|sadness|anger|fear/i.test(prompt);
  }

  private detectOverwhelm(prompt: string): boolean {
    return /overwhelm|too much|chaos|spinning|scattered/i.test(prompt);
  }

  private detectConfusion(prompt: string): boolean {
    return /confused|unclear|don't know|lost/i.test(prompt);
  }

  private detectVulnerability(prompt: string): boolean {
    return prompt.length > 100 && this.detectEmotionalContent(prompt);
  }

  private calculateSimilarity(text1: string, text2: string): number {
    // Simple similarity calculation (could be enhanced)
    const words1 = new Set(text1.toLowerCase().split(' '));
    const words2 = new Set(text2.toLowerCase().split(' '));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  private selectFromArray(array: string[]): string {
    return array[Math.floor(Math.random() * array.length)];
  }

  private getSafetyResponse(concernType: string): string {
    // Contextual safety responses
    return `I'm noticing something important here. Let's pause and make sure you're feeling safe and grounded.`;
  }

  private async getRecentMemories(count: number): Promise<any[]> {
    return this.conversationMemory.slice(-count);
  }

  // ===============================================
  // SOUL MEMORY INTEGRATION METHODS
  // ===============================================

  async setSoulMemorySystem(soulMemory: SoulMemorySystem): Promise<void> {
    this.soulMemory = soulMemory;
    logger.info(`Soul Memory System connected to Oracle: ${this.oracleName}`);
  }

  async updateMemoryContext(memoryContext: any): Promise<void> {
    this.memoryContext = memoryContext;

    // Update system prompt with memory context
    if (memoryContext.recentThemes && memoryContext.recentThemes.length > 0) {
      this.systemPrompt += `\n\nRecent themes in this person's journey: ${memoryContext.recentThemes.join(', ')}`;
    }

    if (memoryContext.activeArchetypes && memoryContext.activeArchetypes.length > 0) {
      this.systemPrompt += `\n\nActive archetypal patterns: ${memoryContext.activeArchetypes.join(', ')}`;
    }

    if (memoryContext.transformationPhase) {
      this.systemPrompt += `\n\nCurrent transformation phase: ${memoryContext.transformationPhase}`;
    }

    logger.info(`Memory context updated for Oracle: ${this.oracleName}`);
  }

  private async searchSemanticMemories(prompt: string): Promise<any[]> {
    if (!this.soulMemory) return [];

    try {
      // Search for semantically similar memories
      const memories = await this.soulMemory.semanticSearch(
        this.userId,
        prompt,
        {
          topK: 5,
          memoryTypes: ['oracle_exchange', 'breakthrough', 'integration', 'shadow_work']
        }
      );

      return memories;
    } catch (error) {
      logger.error('Error searching semantic memories:', error);
      return [];
    }
  }

  private detectMemoryPatterns(memories: any[]): any {
    if (!memories || memories.length === 0) return null;

    const patterns = {
      repeatedThemes: [],
      avoidancePatterns: [],
      growthAreas: [],
      transformationMarkers: []
    };

    // Analyze memories for patterns
    const themes = new Map<string, number>();

    memories.forEach(memory => {
      // Track repeated themes
      if (memory.metadata?.themes) {
        memory.metadata.themes.forEach((theme: string) => {
          themes.set(theme, (themes.get(theme) || 0) + 1);
        });
      }

      // Track transformation markers
      if (memory.transformationMarker) {
        patterns.transformationMarkers.push({
          type: memory.type,
          date: memory.timestamp,
          content: memory.content.substring(0, 100)
        });
      }
    });

    // Identify repeated themes
    themes.forEach((count, theme) => {
      if (count >= 2) {
        patterns.repeatedThemes.push({ theme, count });
      }
    });

    return patterns;
  }

  async storeMemoryFromExchange(prompt: string, response: string, context: any): Promise<void> {
    if (!this.soulMemory) return;

    // Detect breakthrough moments
    const isBreakthrough = this.detectBreakthrough(prompt, context);
    const memoryType = isBreakthrough ? 'breakthrough' : 'oracle_exchange';

    // Detect archetype
    const archetype = this.detectArchetype(prompt, context);

    // Detect if this is shadow work
    const isShadowWork = this.detectShadowWork(prompt) || context.shadowThemes.length > 0;

    // Detect if this is a sacred moment
    const isSacredMoment = isBreakthrough ||
                          context.responseType === 'sacred_witnessing' ||
                          context.emotionalDepth > 0.8 ||
                          this.detectSacredContent(prompt);

    // Detect if this is a retreat-intensive experience
    const isRetreatIntensive = this.mode === 'retreat' && this.detectRetreatIntensive(prompt);

    // Store the oracle exchange in Soul Memory
    await this.soulMemory.storeMemory({
      userId: this.userId,
      type: memoryType,
      content: prompt,
      element: this.currentElement,
      archetype: archetype,
      emotionalTone: context.sentiment,
      shadowContent: isShadowWork,
      transformationMarker: isBreakthrough || context.responseType === 'integration_support',
      sacredMoment: isSacredMoment || isRetreatIntensive,
      oracleResponse: response,
      metadata: {
        mode: this.mode,
        retreatPhase: this.retreatPhase,
        trustLevel: this.sacredRelationship.trustLevel,
        depthReached: this.sacredRelationship.depthReached,
        responseType: context.responseType,
        breakthroughDetected: isBreakthrough,
        archetypeDetected: archetype,
        retreatIntensive: isRetreatIntensive,
        safetyProtocols: this.safetyProtocolsActive,
        timestamp: new Date().toISOString()
      }
    });

    // If breakthrough detected, update transformation milestones
    if (isBreakthrough) {
      this.sacredRelationship.transformationMilestones.push(
        `Breakthrough: ${prompt.substring(0, 50)}... - ${new Date().toISOString()}`
      );
    }

    // If archetype detected, check if Oracle should adapt
    if (archetype && this.soulMemory) {
      await this.checkArchetypalAdaptation(archetype);
    }
  }

  async recordSacredMoment(content: string, type: string = 'sacred_pause'): Promise<void> {
    if (!this.soulMemory) return;

    await this.soulMemory.storeMemory({
      userId: this.userId,
      type: type as any,
      content,
      element: this.currentElement,
      sacredMoment: true,
      metadata: {
        oracle: this.oracleName,
        mode: this.mode,
        timestamp: new Date().toISOString()
      }
    });
  }

  // ===============================================
  // ORACLE MODE SYSTEM METHODS
  // ===============================================

  private applyOracleModeToSystemPrompt(): void {
    const modeConfig = ENHANCED_ORACLE_MODES[this.currentOracleMode];
    this.systemPrompt = `${this.baseSystemPrompt}\n\n${modeConfig.systemPromptAddition}`;

    // Add retreat context if in retreat mode
    if (this.mode === 'retreat' && this.retreatPhase) {
      this.systemPrompt += `\n\nAdditionally, you are supporting this person in ${this.retreatPhase} phase.`;
    }
  }

  async switchOracleMode(newMode: OracleModeType, reason?: string, triggeredBy: 'user_choice' | 'context_suggestion' | 'crisis_response' = 'user_choice'): Promise<string> {
    const previousMode = this.currentOracleMode;
    this.currentOracleMode = newMode;

    // Update system prompt with new mode
    this.applyOracleModeToSystemPrompt();

    // Create mode switch memory
    const modeSwitchMemory: ModeSwitchMemory = {
      userId: this.userId,
      previousMode,
      newMode,
      reason,
      timestamp: new Date(),
      triggeredBy
    };

    // Store in mode history
    this.modeHistory.push(modeSwitchMemory);

    // Store mode switch in Soul Memory
    if (this.soulMemory) {
      await this.soulMemory.storeMemory({
        userId: this.userId,
        type: 'oracle_exchange', // Using existing type for now
        content: `Oracle mode switched from ${previousMode} to ${newMode}`,
        element: this.currentElement,
        sacredMoment: true,
        metadata: {
          modeSwitch: modeSwitchMemory,
          type: 'mode_transition'
        }
      });
    }

    // Get mode-specific greeting
    const modeConfig = ENHANCED_ORACLE_MODES[newMode];
    const greeting = MODE_RESPONSES[newMode].greeting;

    logger.info(`Oracle mode switched to ${newMode} for user ${this.userId}`);

    return greeting;
  }

  getCurrentOracleMode(): OracleMode {
    return ENHANCED_ORACLE_MODES[this.currentOracleMode];
  }

  getCurrentOracleModeType(): OracleModeType {
    return this.currentOracleMode;
  }

  getModeHistory(): ModeSwitchMemory[] {
    return [...this.modeHistory];
  }

  private async suggestModeSwitch(context: ConversationContext): Promise<ContextualModeRecommendation | null> {
    // Don't suggest too frequently (cooldown period)
    if (this.modeSuggestionCooldown && new Date().getTime() - this.modeSuggestionCooldown.getTime() < 300000) { // 5 minutes
      return null;
    }

    const recommendation = getContextualModeRecommendation(context);

    if (recommendation && recommendation.mode !== this.currentOracleMode) {
      this.modeSuggestionCooldown = new Date();

      return {
        suggestedMode: recommendation.mode,
        confidence: recommendation.confidence,
        reason: recommendation.reason,
        contextualFactors: Object.keys(context).filter(key => context[key] === true),
        urgency: context.crisisMarkers?.length > 0 ? 'crisis' :
                context.traumaActivated ? 'high' :
                context.integrationNeeded ? 'medium' : 'low'
      };
    }

    return null;
  }

  private applyModeSpecificFilters(response: string, context: ConversationContext): string {
    const modeConfig = ENHANCED_ORACLE_MODES[this.currentOracleMode];
    const modeResponses = MODE_RESPONSES[this.currentOracleMode];

    // Apply mode-specific response modifications
    switch (this.currentOracleMode) {
      case 'alchemist':
        return this.applyAlchemistFilter(response, context);
      case 'buddha':
        return this.applyBuddhaFilter(response, context);
      case 'sage':
        return this.applySageFilter(response, context);
      case 'mystic':
        return this.applyMysticFilter(response, context);
      case 'guardian':
        return this.applyGuardianFilter(response, context);
      case 'tao':
        return this.applyTaoFilter(response, context);
      default:
        return response;
    }
  }

  // Mode-specific filter implementations
  private applyAlchemistFilter(response: string, context: ConversationContext): string {
    if (context.shadowContent) {
      response += "\n\n🧪 *The alchemist notes: This shadow material is rich with transformative potential.*";
    }
    return response;
  }

  private applyBuddhaFilter(response: string, context: ConversationContext): string {
    if (context.attachmentPatterns && context.attachmentPatterns.length > 0) {
      response += "\n\n☸️ *Notice the grasping. What remains when you let go?*";
    }
    return response;
  }

  private applySageFilter(response: string, context: ConversationContext): string {
    if (context.integrationNeeded) {
      response += "\n\n🌀 *Both truths can be held - let's find the wisdom in the paradox.*";
    }
    return response;
  }

  private applyMysticFilter(response: string, context: ConversationContext): string {
    if (context.creativityBlocked) {
      response += "\n\n🔥 *Feel how the creative force wants to move through you!*";
    }
    return response;
  }

  private applyGuardianFilter(response: string, context: ConversationContext): string {
    if (context.traumaActivated || context.crisisMarkers?.length > 0) {
      response = "🌱 Let's slow down and check in with your body. " + response;
      response += "\n\n*Take all the time you need. You're safe here.*";
    }
    return response;
  }

  private applyTaoFilter(response: string, context: ConversationContext): string {
    if (context.forcingOutcomes || context.excessiveEffort) {
      response += "\n\n☯️ *The sage does not attempt anything very big, and thus achieves greatness.*";
    }
    if (context.innerConflict || context.seekingBalance) {
      response += "\n\n☯️ *In the dance of yin and yang, both movements complete the whole.*";
    }
    return response;
  }

  // Enhanced context analysis for mode recommendations
  private analyzeConversationContext(prompt: string, context: any): ConversationContext {
    return {
      emotionalTone: context.sentiment || 'neutral',
      shadowContent: context.shadowThemes?.length > 0 || false,
      crisisMarkers: this.detectCrisisMarkers(prompt),
      spiritualBypass: this.detectSpiritualBypass(prompt, context),
      integrationNeeded: context.needsIntegration || false,
      creativityBlocked: this.detectCreativityBlocks(prompt),
      traumaActivated: this.detectTraumaActivation(prompt),
      depthLevel: context.depthLevel || 1,
      vulnerabilityLevel: context.vulnerabilityLevel || 1,
      attachmentPatterns: this.detectAttachmentPatterns(prompt),
      transformationReadiness: this.assessTransformationReadiness(context),
      forcingOutcomes: this.detectForcingPatterns(prompt),
      excessiveEffort: this.detectExcessiveEffort(prompt),
      innerConflict: this.detectInnerConflict(prompt),
      seekingBalance: this.detectBalanceSeeking(prompt)
    };
  }

  // Helper methods for context detection
  private detectCrisisMarkers(prompt: string): string[] {
    const crisisWords = ['suicide', 'kill myself', 'end it all', 'can\'t go on', 'hopeless', 'emergency'];
    return crisisWords.filter(word => prompt.toLowerCase().includes(word));
  }

  private detectSpiritualBypass(prompt: string, context: any): boolean {
    const bypassIndicators = ['everything happens for a reason', 'just let go', 'don\'t be negative', 'think positive'];
    return bypassIndicators.some(indicator => prompt.toLowerCase().includes(indicator)) && context.shadowContent;
  }

  private detectCreativityBlocks(prompt: string): boolean {
    return /creative|art|write|express|blocked|stuck.*creat/i.test(prompt);
  }

  private detectTraumaActivation(prompt: string): boolean {
    return /trauma|triggered|flashback|panic|dissociat|freeze|fight.*flight/i.test(prompt);
  }

  private detectAttachmentPatterns(prompt: string): string[] {
    const patterns = [];
    if (/need.*to|have.*to|must|should/i.test(prompt)) patterns.push('obligation');
    if (/can\'t.*let.*go|holding.*on/i.test(prompt)) patterns.push('clinging');
    if (/what.*if|worry|anxious.*about/i.test(prompt)) patterns.push('future_anxiety');
    return patterns;
  }

  private assessTransformationReadiness(context: any): number {
    let readiness = 0.5; // Base readiness
    if (context.vulnerability > 0.7) readiness += 0.2;
    if (context.openness > 0.6) readiness += 0.2;
    if (context.defensiveness < 0.3) readiness += 0.1;
    return Math.min(readiness, 1.0);
  }

  private detectForcingPatterns(prompt: string): boolean {
    return /force|push|make.*happen|try.*harder|must.*work|have.*to|struggling/i.test(prompt);
  }

  private detectExcessiveEffort(prompt: string): boolean {
    return /exhausted|trying.*so.*hard|wearing.*out|burnt.*out|too.*much.*effort/i.test(prompt);
  }

  private detectInnerConflict(prompt: string): boolean {
    return /torn.*between|part.*wants|conflicted|both.*and|can't.*decide|inner.*battle/i.test(prompt);
  }

  private detectBalanceSeeking(prompt: string): boolean {
    return /balance|harmony|middle.*way|both.*sides|integrate|peace.*between/i.test(prompt);
  }

  // ===============================================
  // PUBLIC INTERFACE METHODS
  // ===============================================

  async switchElement(newElement: ElementalType): Promise<string> {
    const previousElement = this.currentElement;
    this.currentElement = newElement;

    // Record elemental shift in memory
    if (this.soulMemory) {
      await this.soulMemory.storeMemory({
        userId: this.userId,
        type: 'elemental_shift',
        content: `Shifted from ${previousElement} to ${newElement}`,
        element: newElement,
        metadata: {
          previousElement,
          reason: 'oracle_guidance',
          timestamp: new Date().toISOString()
        }
      });
    }

    return `Shifting from ${previousElement} to ${newElement} perspective...
    ${ElementalVoices[newElement].essence}`;
  }

  async getRelationshipStatus(): Promise<any> {
    return {
      trustLevel: this.sacredRelationship.trustLevel,
      depthReached: this.sacredRelationship.depthReached,
      transformationMilestones: this.sacredRelationship.transformationMilestones,
      currentElement: this.currentElement,
      mode: this.mode,
      retreatPhase: this.retreatPhase
    };
  }

  async offerWeeklyReflection(): Promise<string> {
    const memories = await this.getRecentMemories(20);
    const patterns = this.detectPatterns(memories);
    const growth = this.detectGrowth(memories);

    return `Let me reflect back what I've noticed this week...

    ${patterns.length > 0 ? `Patterns: ${patterns.join(', ')}` : ''}
    ${growth.length > 0 ? `Growth: ${growth.join(', ')}` : ''}

    What's alive in you as you hear this?`;
  }

  private detectPatterns(memories: any[]): string[] {
    // Pattern detection logic
    return ['Seeking comfort when growth calls', 'Avoiding certain emotions'];
  }

  private detectGrowth(memories: any[]): string[] {
    // Growth detection logic
    return ['Increased willingness to feel', 'Deeper self-inquiry'];
  }

  // ===============================================
  // RITUAL & SACRED MOMENT SUPPORT
  // ===============================================

  async generateRitualGuidance(ritualType: string): Promise<string> {
    // Load context from Soul Memory
    let ritualContext = '';

    if (this.soulMemory) {
      // Get previous ritual moments
      const previousRituals = await this.soulMemory.retrieveMemories(this.userId, {
        type: 'ritual_moment',
        limit: 3
      });

      if (previousRituals.length > 0) {
        ritualContext = `Building on your previous ritual experiences...`;
      }
    }

    const guidanceTemplates: Record<string, string> = {
      'morning_intention': `${ritualContext}

As you begin this new day, feel into what wants to emerge.
What quality or energy is asking to be embodied today?
Take three deep breaths and let your intention arise naturally from your soul's wisdom.`,

      'elemental_connection': `${ritualContext}

Connect with the ${this.currentElement} element within you.
Feel its unique qualities moving through your being.
What message does ${this.currentElement} have for you in this moment?`,

      'shadow_work': `${ritualContext}

Creating sacred space for shadow work...
Remember: what we resist persists, what we accept transforms.
Breathe into any discomfort and know that you are held in loving awareness.`,

      'integration': `${ritualContext}

Integration is a sacred act of weaving new insights into daily life.
What wisdom from your recent journey is ready to be embodied?
How can you honor this transformation in practical ways?`,

      'gratitude': `${ritualContext}

Gratitude is a portal to presence.
What are three things your soul is genuinely grateful for today?
Feel the warmth of appreciation spreading through your being.`
    };

    return guidanceTemplates[ritualType] || `Creating sacred space for your ${ritualType} ritual...`;
  }

  async reflectOnJournal(journalEntry: string): Promise<string> {
    if (!this.soulMemory) {
      return this.generateBasicJournalReflection(journalEntry);
    }

    // Search for related memories
    const relatedMemories = await this.soulMemory.semanticSearch(
      this.userId,
      journalEntry,
      { topK: 3 }
    );

    // Detect themes and patterns
    const themes = await detectShadowThemes(journalEntry);
    const sentiment = await analyzeSentiment(journalEntry);

    let reflection = `Thank you for sharing this with me. `;

    if (relatedMemories.length > 0) {
      reflection += `I notice this connects to themes we've explored before. `;
    }

    if (themes.length > 0) {
      reflection += `There's ${themes[0]} energy present here. `;
    }

    reflection += `What feels most alive or important about what you've written?`;

    return reflection;
  }

  private generateBasicJournalReflection(entry: string): string {
    return `Thank you for sharing this sacred expression. I'm here to witness and hold space for whatever wants to emerge. What feels most significant about what you've written?`;
  }

  // ===============================================
  // BREAKTHROUGH & SACRED MOMENT DETECTION
  // ===============================================

  private detectBreakthrough(prompt: string, context: any): boolean {
    const breakthroughIndicators = [
      'i just realized',
      'i see now',
      'breakthrough',
      'pattern',
      'stuck in',
      'finally understand',
      'aha',
      'it all makes sense',
      'i\'ve been',
      'years',
      'always',
      'never realized',
      'light bulb',
      'click',
      'shift'
    ];

    const lowerPrompt = prompt.toLowerCase();

    // Check for breakthrough language
    const hasBreakthroughLanguage = breakthroughIndicators.some(
      indicator => lowerPrompt.includes(indicator)
    );

    // Check if discussing patterns or realizations
    const discussingPatterns = lowerPrompt.includes('pattern') &&
                              (lowerPrompt.includes('see') || lowerPrompt.includes('realize') || lowerPrompt.includes('stuck'));

    // Check emotional intensity
    const highEmotionalIntensity = context.emotional_depth > 0.7;

    // Check if this represents a shift from previous patterns
    const representsShift = context.memoryPatterns?.repeatedThemes?.length > 0 &&
                           !context.memoryPatterns.repeatedThemes.some((theme: any) =>
                             lowerPrompt.includes(theme.theme.toLowerCase())
                           );

    return hasBreakthroughLanguage || discussingPatterns ||
           (highEmotionalIntensity && representsShift);
  }

  private detectSacredContent(prompt: string): boolean {
    const sacredIndicators = [
      'sacred',
      'divine',
      'soul',
      'spirit',
      'profound',
      'deep knowing',
      'truth',
      'authentic',
      'vulnerable',
      'raw',
      'tears',
      'heart',
      'love',
      'grace',
      'presence'
    ];

    const lowerPrompt = prompt.toLowerCase();
    return sacredIndicators.some(indicator => lowerPrompt.includes(indicator));
  }

  private detectEmotionalContent(prompt: string): number {
    // Simple emotional intensity detection (0-1)
    const emotionalWords = [
      'feel', 'feeling', 'felt',
      'overwhelm', 'overwhelming', 'overwhelmed',
      'scared', 'fear', 'afraid',
      'sad', 'sadness', 'grief',
      'joy', 'happy', 'excited',
      'angry', 'anger', 'frustrated',
      'love', 'loving', 'loved',
      'hurt', 'pain', 'painful'
    ];

    const lowerPrompt = prompt.toLowerCase();
    const wordCount = prompt.split(/\s+/).length;
    const emotionalWordCount = emotionalWords.filter(
      word => lowerPrompt.includes(word)
    ).length;

    return Math.min(emotionalWordCount / wordCount * 10, 1);
  }

  // ===============================================
  // ARCHETYPAL PATTERN DETECTION
  // ===============================================

  private detectArchetype(prompt: string, context: any): string | undefined {
    const lowerPrompt = prompt.toLowerCase();

    // Shadow archetype detection
    if (this.detectShadowWork(prompt)) {
      return 'Shadow';
    }

    // Seeker archetype
    if (this.detectSeekerPattern(prompt)) {
      return 'Seeker';
    }

    // Warrior archetype
    if (this.detectWarriorPattern(prompt)) {
      return 'Warrior';
    }

    // Lover archetype
    if (this.detectLoverPattern(prompt)) {
      return 'Lover';
    }

    // Sage archetype
    if (this.detectSagePattern(prompt)) {
      return 'Sage';
    }

    // Innocent/Child archetype
    if (this.detectInnocentPattern(prompt)) {
      return 'Innocent';
    }

    // Caregiver archetype
    if (this.detectCaregiverPattern(prompt)) {
      return 'Caregiver';
    }

    // Creator archetype
    if (this.detectCreatorPattern(prompt)) {
      return 'Creator';
    }

    return undefined;
  }

  private detectShadowWork(prompt: string): boolean {
    const shadowIndicators = [
      'shadow',
      'dark side',
      'hate this part',
      'reject',
      'ashamed',
      'hide',
      'suppress',
      'repress',
      'deny',
      'darkness',
      'worst part',
      'ugly',
      'monster',
      'demon',
      'evil'
    ];

    const lowerPrompt = prompt.toLowerCase();
    return shadowIndicators.some(indicator => lowerPrompt.includes(indicator));
  }

  private detectSeekerPattern(prompt: string): boolean {
    const seekerIndicators = [
      'searching',
      'seeking',
      'journey',
      'quest',
      'find meaning',
      'purpose',
      'why am i',
      'what is my',
      'discover',
      'explore'
    ];

    const lowerPrompt = prompt.toLowerCase();
    return seekerIndicators.some(indicator => lowerPrompt.includes(indicator));
  }

  private detectWarriorPattern(prompt: string): boolean {
    const warriorIndicators = [
      'fight',
      'battle',
      'struggle',
      'overcome',
      'conquer',
      'defeat',
      'strong',
      'warrior',
      'courage',
      'brave'
    ];

    const lowerPrompt = prompt.toLowerCase();
    return warriorIndicators.some(indicator => lowerPrompt.includes(indicator));
  }

  private detectLoverPattern(prompt: string): boolean {
    const loverIndicators = [
      'love',
      'passion',
      'intimate',
      'connection',
      'relationship',
      'partner',
      'romance',
      'desire',
      'union',
      'heart'
    ];

    const lowerPrompt = prompt.toLowerCase();
    return loverIndicators.some(indicator => lowerPrompt.includes(indicator));
  }

  private detectSagePattern(prompt: string): boolean {
    const sageIndicators = [
      'wisdom',
      'understand',
      'knowledge',
      'truth',
      'insight',
      'realize',
      'learn',
      'teach',
      'guide',
      'mentor'
    ];

    const lowerPrompt = prompt.toLowerCase();
    return sageIndicators.some(indicator => lowerPrompt.includes(indicator));
  }

  private detectInnocentPattern(prompt: string): boolean {
    const innocentIndicators = [
      'innocent',
      'child',
      'pure',
      'simple',
      'trust',
      'faith',
      'hope',
      'optimistic',
      'naive',
      'wonder'
    ];

    const lowerPrompt = prompt.toLowerCase();
    return innocentIndicators.some(indicator => lowerPrompt.includes(indicator));
  }

  private detectCaregiverPattern(prompt: string): boolean {
    const caregiverIndicators = [
      'care',
      'help',
      'support',
      'nurture',
      'protect',
      'mother',
      'father',
      'parent',
      'heal',
      'comfort'
    ];

    const lowerPrompt = prompt.toLowerCase();
    return caregiverIndicators.some(indicator => lowerPrompt.includes(indicator));
  }

  private detectCreatorPattern(prompt: string): boolean {
    const creatorIndicators = [
      'create',
      'build',
      'make',
      'imagine',
      'vision',
      'art',
      'express',
      'manifest',
      'birth',
      'generate'
    ];

    const lowerPrompt = prompt.toLowerCase();
    return creatorIndicators.some(indicator => lowerPrompt.includes(indicator));
  }

  private async checkArchetypalAdaptation(archetype: string): Promise<void> {
    if (!this.soulMemory) return;

    // Get active archetypes
    const activeArchetypes = await this.soulMemory.getActiveArchetypes(this.userId);

    // Find the Shadow archetype if present
    const shadowPattern = activeArchetypes.find(a => a.archetype === 'Shadow');

    // If Shadow work is prominent, consider adapting Oracle approach
    if (shadowPattern && shadowPattern.patternStrength > 0.5) {
      // Add shadow work awareness to system prompt
      this.systemPrompt += `\n\nThis person is actively engaged in shadow work. Be especially gentle and supportive while maintaining sacred resistance when needed.`;

      // Log the adaptation
      logger.info(`Oracle adapting to strong Shadow archetype pattern for user ${this.userId}`);
    }

    // Check for other strong patterns
    const strongPatterns = activeArchetypes.filter(a => a.patternStrength > 0.7);
    if (strongPatterns.length > 0) {
      logger.info(`Strong archetypal patterns detected: ${strongPatterns.map(p => p.archetype).join(', ')}`);
    }
  }

  // ===============================================
  // RETREAT-SPECIFIC DETECTION
  // ===============================================

  private detectRetreatIntensive(prompt: string): boolean {
    const retreatIntensiveIndicators = [
      'opening',
      'profound',
      'mystical',
      'visionary',
      'transcendent',
      'ecstatic',
      'unity',
      'oneness',
      'cosmic',
      'divine',
      'expanded',
      'altered',
      'peak experience',
      'ego dissolution',
      'bliss',
      'energy',
      'kundalini',
      'chakra',
      'spirit guide',
      'entity',
      'dimension',
      'void',
      'light',
      'presence',
      'overwhelming'
    ];

    const lowerPrompt = prompt.toLowerCase();

    // Check for retreat-specific language
    const hasRetreatLanguage = retreatIntensiveIndicators.some(
      indicator => lowerPrompt.includes(indicator)
    );

    // Check for intensity markers in retreat context
    const intensityMarkers = ['very', 'extremely', 'incredibly', 'so much', 'too much'];
    const hasIntensity = intensityMarkers.some(marker => lowerPrompt.includes(marker));

    return hasRetreatLanguage || (this.mode === 'retreat' && hasIntensity);
  }

  async deactivateRetreatMode(): Promise<void> {
    const previousPhase = this.retreatPhase;

    this.mode = 'daily';
    this.retreatPhase = undefined;
    this.safetyProtocolsActive = false;

    logger.info(`Retreat mode deactivated (was: ${previousPhase}) for ${this.userId}`);

    // Store retreat deactivation in Soul Memory
    if (this.soulMemory) {
      await this.soulMemory.storeMemory({
        userId: this.userId,
        type: 'ritual_moment',
        content: `Retreat mode deactivated (completed: ${previousPhase})`,
        element: this.currentElement,
        sacredMoment: true,
        ritualContext: 'retreat_completion',
        metadata: {
          previousRetreatPhase: previousPhase,
          deactivatedAt: new Date().toISOString(),
          mode: 'daily'
        }
      });
    }

    // Reset system prompt (remove retreat additions)
    this.systemPrompt = this.baseSystemPrompt;
    this.applyOracleModeToSystemPrompt();
  }

  // ===============================================
  // JUNG-BUDDHA SACRED MIRROR METHODS
  // ===============================================

  private determineJungBuddhaMode(prompt: string, context: any, responseType: string): 'jung' | 'buddha' | 'hybrid' {
    // Override mode if set explicitly
    if (this.sacredMirrorMode !== 'adaptive') {
      return this.sacredMirrorMode as 'jung' | 'buddha' | 'hybrid';
    }

    // First run simple wisdom approach detection
    this.determineWisdomApproach(prompt, context);

    // Then use Adaptive Wisdom Engine for sophisticated routing
    const userContext = this.buildUserContextForWisdomEngine(prompt, context);
    const wisdomRouting = this.adaptiveWisdomEngine.determineApproach(userContext);

    // Store the routing for reference
    this.currentWisdomRouting = wisdomRouting;

    // Compare simple vs sophisticated detection
    const simpleApproach = this.wisdomMode;
    const sophisticatedApproach = wisdomRouting.approach;

    // Log both approaches for comparison
    logger.info('Wisdom approach comparison:', {
      simple: simpleApproach,
      sophisticated: sophisticatedApproach,
      confidence: wisdomRouting.confidence,
      reasoning: wisdomRouting.reasoning
    });

    // Use sophisticated approach but consider simple approach for validation
    let finalApproach = sophisticatedApproach;

    // If confidence is low, defer to simple approach
    if (wisdomRouting.confidence < 0.6 && simpleApproach !== 'hybrid') {
      finalApproach = simpleApproach;
      logger.info('Using simple approach due to low confidence:', {
        finalApproach,
        reason: 'Low confidence in sophisticated detection'
      });
    }

    return finalApproach;
  }

  // ===============================================
  // SIMPLE WISDOM APPROACH DETECTION
  // ===============================================

  async determineWisdomApproach(prompt: string, context: any): Promise<void> {
    const lowerPrompt = prompt.toLowerCase();

    // Check if user is grasping/attached (Buddha indicators)
    if (this.detectGraspingLanguageSimple(lowerPrompt)) {
      this.wisdomMode = 'buddha'; // Offer spaciousness
      logger.info('Simple wisdom detection: Buddha mode (grasping detected)');
      return;
    }

    // Check if user is avoiding/denying (Jung indicators)
    if (this.detectAvoidanceLanguageSimple(lowerPrompt)) {
      this.wisdomMode = 'jung'; // Offer integration
      logger.info('Simple wisdom detection: Jung mode (avoidance detected)');
      return;
    }

    // Check recent patterns for balance
    if (context.recentMemories && this.needsWisdomBalance(context.recentMemories)) {
      const predominantMode = this.getPredominantWisdomMode(context.recentMemories);
      this.wisdomMode = predominantMode === 'jung' ? 'buddha' : 'jung'; // Balance with opposite
      logger.info('Simple wisdom detection: Balancing mode', {
        predominantMode,
        switchedTo: this.wisdomMode
      });
      return;
    }

    // Default to hybrid - hold both
    this.wisdomMode = 'hybrid';
    logger.info('Simple wisdom detection: Hybrid mode (default)');
  }

  private detectGraspingLanguageSimple(prompt: string): boolean {
    const graspingIndicators = [
      'i am', 'always', 'never', 'must', 'have to', 'need to',
      'can\'t let go', 'obsessed', 'attached to', 'desperate'
    ];

    return graspingIndicators.some(indicator => prompt.includes(indicator));
  }

  private detectAvoidanceLanguageSimple(prompt: string): boolean {
    const avoidanceIndicators = [
      'i don\'t want', 'i hate this part', 'can\'t deal', 'avoid',
      'don\'t want to face', 'refuse to', 'can\'t stand', 'too much'
    ];

    return avoidanceIndicators.some(indicator => prompt.includes(indicator));
  }

  private needsWisdomBalance(recentMemories: any[]): boolean {
    if (!recentMemories || recentMemories.length < 3) return false;

    const wisdomModeCount = this.countWisdomModes(recentMemories);
    const totalModes = wisdomModeCount.jung + wisdomModeCount.buddha;

    // If more than 3 consecutive uses of same mode, suggest balance
    return totalModes >= 3 && (wisdomModeCount.jung > 3 || wisdomModeCount.buddha > 3);
  }

  private getPredominantWisdomMode(recentMemories: any[]): 'jung' | 'buddha' | 'hybrid' {
    const wisdomModeCount = this.countWisdomModes(recentMemories);

    if (wisdomModeCount.jung > wisdomModeCount.buddha) return 'jung';
    if (wisdomModeCount.buddha > wisdomModeCount.jung) return 'buddha';
    return 'hybrid';
  }

  private countWisdomModes(memories: any[]): { jung: number; buddha: number; hybrid: number } {
    const count = { jung: 0, buddha: 0, hybrid: 0 };

    memories.forEach(memory => {
      if (memory.wisdomMode) {
        count[memory.wisdomMode as keyof typeof count]++;
      }
    });

    return count;
  }

  // Public method to get current simple wisdom mode
  getCurrentWisdomMode(): 'jung' | 'buddha' | 'hybrid' {
    return this.wisdomMode;
  }

  // Public method to manually set wisdom mode
  setWisdomMode(mode: 'jung' | 'buddha' | 'hybrid'): void {
    this.wisdomMode = mode;
    logger.info('Wisdom mode manually set to:', mode);
  }

  // ===============================================
  // FRONTEND INTEGRATION METHODS
  // ===============================================

  async switchMode(newMode: OracleModeType): Promise<{
    success: boolean;
    message: string;
    modeInfo: any;
    wisdomApproachAdjustment?: string;
  }> {
    try {
      const previousMode = this.currentOracleMode;
      this.currentOracleMode = newMode;

      // Get mode configuration
      const mode = ENHANCED_ORACLE_MODES[newMode];

      // Update system prompt for new mode
      this.updateSystemPromptForMode(mode);

      // Determine wisdom approach adjustment based on mode
      let wisdomApproachAdjustment = '';

      switch (newMode) {
        case 'alchemist':
          // Alchemist mode favors Jung integration work
          this.wisdomMode = 'jung';
          wisdomApproachAdjustment = 'Wisdom approach adjusted to Jung (integration focus) to align with Alchemist mode';
          break;

        case 'buddha':
          // Buddha mode naturally favors Buddha liberation work
          this.wisdomMode = 'buddha';
          wisdomApproachAdjustment = 'Wisdom approach set to Buddha (liberation focus) to align with Buddha mode';
          break;

        case 'sage':
          // Sage mode favors hybrid balanced approach
          this.wisdomMode = 'hybrid';
          wisdomApproachAdjustment = 'Wisdom approach set to Hybrid (balanced) to align with Sage mode';
          break;

        case 'mystic':
          // Mystic mode can use hybrid but lean toward integration of visions
          this.wisdomMode = 'hybrid';
          wisdomApproachAdjustment = 'Wisdom approach set to Hybrid with integration emphasis for grounding visions';
          break;

        case 'guardian':
          // Guardian mode prefers gentle approaches, can be any but adaptive
          this.sacredMirrorMode = 'adaptive';
          wisdomApproachAdjustment = 'Wisdom approach set to Adaptive for trauma-informed responsiveness';
          break;
      }

      // Store mode switch in Soul Memory
      if (this.soulMemory) {
        await this.soulMemory.storeMemory({
          userId: this.userId,
          type: 'mode_switch',
          content: `Switched to ${newMode} mode`,
          element: this.currentElement,
          sacredMoment: true,
          metadata: {
            previousMode,
            newMode,
            wisdomAdjustment: wisdomApproachAdjustment,
            timestamp: new Date().toISOString()
          }
        });
      }

      // Create mode switch memory record
      const modeSwitchMemory: ModeSwitchMemory = {
        userId: this.userId,
        previousMode,
        newMode,
        reason: 'User mode selection',
        timestamp: new Date(),
        triggeredBy: 'user_choice'
      };

      // Store in mode history
      this.modeHistory.push(modeSwitchMemory);

      // Get mode introduction
      const modeIntroduction = this.getModeIntroduction(newMode);

      logger.info('Oracle mode switched:', {
        userId: this.userId,
        previousMode,
        newMode,
        wisdomMode: this.wisdomMode
      });

      return {
        success: true,
        message: modeIntroduction,
        modeInfo: {
          id: newMode,
          name: mode.name || newMode,
          type: mode.type,
          capabilities: mode.specialCapabilities,
          currentWisdomMode: this.wisdomMode,
          sacredMirrorMode: this.sacredMirrorMode
        },
        wisdomApproachAdjustment
      };

    } catch (error) {
      logger.error('Error switching oracle mode:', error);

      return {
        success: false,
        message: 'Failed to switch oracle mode. Please try again.',
        modeInfo: null
      };
    }
  }

  private updateSystemPromptForMode(mode: OracleMode): void {
    // Combine base prompt with mode-specific addition
    this.systemPrompt = `${this.baseSystemPrompt}\n\n${mode.systemPromptAddition}`;

    // Add retreat context if in retreat mode
    if (this.mode === 'retreat' && this.retreatPhase) {
      this.systemPrompt += `\n\nAdditionally, you are supporting this person in ${this.retreatPhase} phase.`;
    }

    logger.info('System prompt updated for mode:', {
      mode: mode.type,
      promptLength: this.systemPrompt.length
    });
  }

  private getModeIntroduction(mode: OracleModeType): string {
    return MODE_RESPONSES[mode]?.greeting || `${ENHANCED_ORACLE_MODES[mode]?.icon || '🌟'} ${ENHANCED_ORACLE_MODES[mode]?.name || mode} mode activated. How may I serve your journey today?`;
  }

  getAllAvailableModes(): any[] {
    return Object.values(ENHANCED_ORACLE_MODES).map(mode => ({
      id: mode.id,
      icon: this.getModeIcon(mode.id),
      name: mode.name,
      tagline: mode.tagline,
      description: mode.description,
      longDescription: mode.longDescription,
      color: mode.color,
      preferredContext: mode.preferredContext,
      specialCapabilities: mode.specialCapabilities
    }));
  }

  private getModeIcon(modeId: OracleModeType): string {
    const icons = {
      'alchemist': '🧪',
      'buddha': '☸️',
      'sage': '🌀',
      'mystic': '🔥',
      'guardian': '🌱',
      'tao': '☯️'
    };

    return icons[modeId] || '🌟';
  }

  getCurrentModeStatus(): {
    currentOracleMode: OracleModeType;
    currentWisdomMode: 'jung' | 'buddha' | 'hybrid';
    sacredMirrorMode: string;
    modeHistory: ModeSwitchMemory[];
    capabilities: string[];
    wisdomRouting?: any;
  } {
    const currentMode = this.getCurrentOracleMode();
    const wisdomRouting = this.getWisdomRouting();

    return {
      currentOracleMode: this.currentOracleMode,
      currentWisdomMode: this.wisdomMode,
      sacredMirrorMode: this.sacredMirrorMode,
      modeHistory: this.getModeHistory().slice(-5), // Last 5 switches
      capabilities: currentMode.specialCapabilities,
      wisdomRouting: wisdomRouting ? {
        approach: wisdomRouting.approach,
        confidence: wisdomRouting.confidence,
        reasoning: wisdomRouting.reasoning,
        adjustments: wisdomRouting.adjustments
      } : null
    };
  }

  // Method for frontend to suggest mode based on user input
  async suggestModeForInput(userInput: string): Promise<{
    suggestedMode: OracleModeType | null;
    confidence: number;
    reason: string;
    currentMode: OracleModeType;
  }> {
    // Analyze the input using existing context analysis
    const context = await this.gatherContext(userInput);
    const conversationContext = this.analyzeConversationContext(userInput, context);

    // Get mode suggestion
    const modeSuggestion = await this.suggestModeSwitch(conversationContext);

    if (modeSuggestion && modeSuggestion.suggestedMode !== this.currentOracleMode) {
      return {
        suggestedMode: modeSuggestion.suggestedMode,
        confidence: modeSuggestion.confidence,
        reason: modeSuggestion.reason,
        currentMode: this.currentOracleMode
      };
    }

    return {
      suggestedMode: null,
      confidence: 0,
      reason: 'Current mode is appropriate',
      currentMode: this.currentOracleMode
    };
  }

  private buildUserContextForWisdomEngine(prompt: string, context: any): UserContext {
    // Convert current patterns to the format expected by AdaptiveWisdomEngine
    this.updateRecentPatterns(prompt, context);

    return {
      spiralPhase: context.spiralPhase || 'unknown',
      currentElement: this.currentElement,
      emotionalState: this.mapEmotionalState(context),
      recentPatterns: this.recentPatterns,
      attachmentLevel: this.calculateAttachmentLevel(context),
      shadowReadiness: this.calculateShadowReadiness(context),
      vulnerabilityLevel: context.vulnerabilityLevel || 0.5,
      currentOracleMode: this.currentOracleMode,
      memoryPatterns: context.memoryPatterns
    };
  }

  private updateRecentPatterns(prompt: string, context: any): void {
    const patterns: Pattern[] = [];

    // Detect grasping patterns
    if (this.detectGraspingLanguage(prompt)) {
      patterns.push({
        type: 'grasping',
        content: prompt,
        intensity: this.calculateGraspingIntensity(prompt),
        frequency: 1,
        timestamp: new Date()
      });
    }

    // Detect avoidance patterns
    if (this.detectAvoidanceLanguage(prompt)) {
      patterns.push({
        type: 'avoidance',
        content: prompt,
        intensity: this.calculateAvoidanceIntensity(prompt),
        frequency: 1,
        timestamp: new Date()
      });
    }

    // Detect shadow material
    if (this.detectsShadowMaterial(prompt, context)) {
      patterns.push({
        type: 'shadow_emergence',
        content: prompt,
        intensity: 0.7,
        frequency: 1,
        timestamp: new Date()
      });
    }

    // Detect spiritual bypassing
    if (this.detectSpiritualBypass(prompt, context)) {
      patterns.push({
        type: 'spiritual_bypass',
        content: prompt,
        intensity: 0.6,
        frequency: 1,
        timestamp: new Date()
      });
    }

    // Detect identity crisis
    if (this.detectIdentityQuestions(prompt)) {
      patterns.push({
        type: 'identity_crisis',
        content: prompt,
        intensity: 0.8,
        frequency: 1,
        timestamp: new Date()
      });
    }

    // Add new patterns and maintain recent history (last 20 patterns)
    this.recentPatterns.push(...patterns);
    this.recentPatterns = this.recentPatterns
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 20);
  }

  private mapEmotionalState(context: any): 'stable' | 'crisis' | 'transformation' | 'integration' | 'chaos' {
    if (context.crisisMarkers?.length > 0) return 'crisis';
    if (context.responseType === 'integration_support') return 'integration';
    if (context.shadowThemes?.length > 0) return 'transformation';
    if (context.emotional_depth > 0.8) return 'chaos';
    return 'stable';
  }

  private calculateAttachmentLevel(context: any): number {
    let attachmentLevel = 0.5; // Default neutral

    // Increase for grasping language
    if (context.attachmentPatterns?.length > 0) {
      attachmentLevel += 0.3;
    }

    // Increase for anxiety/control patterns
    if (context.sentiment === 'anxious' || context.needs_grounding) {
      attachmentLevel += 0.2;
    }

    return Math.min(attachmentLevel, 1.0);
  }

  private calculateShadowReadiness(context: any): number {
    let shadowReadiness = 0.5; // Default neutral

    // Increase for vulnerability and trust
    if (context.vulnerabilityLevel > 0.6) {
      shadowReadiness += 0.2;
    }

    if (this.sacredRelationship.trustLevel > 5) {
      shadowReadiness += 0.2;
    }

    // Increase if shadow themes already present
    if (context.shadowThemes?.length > 0) {
      shadowReadiness += 0.3;
    }

    return Math.min(shadowReadiness, 1.0);
  }

  // Helper methods for pattern detection
  private detectGraspingLanguage(prompt: string): boolean {
    const graspingIndicators = [
      'need to', 'have to', 'must', 'should', 'can\'t let go',
      'attached to', 'desperate', 'clinging', 'obsessing',
      'trying so hard', 'force', 'control', 'make it happen'
    ];

    const lowerPrompt = prompt.toLowerCase();
    return graspingIndicators.some(indicator => lowerPrompt.includes(indicator));
  }

  private detectAvoidanceLanguage(prompt: string): boolean {
    const avoidanceIndicators = [
      'don\'t want to', 'avoiding', 'can\'t deal', 'too much',
      'not ready', 'maybe later', 'distract myself', 'escape',
      'numb', 'push away', 'refuse to', 'deny', 'pretend it\'s not'
    ];

    const lowerPrompt = prompt.toLowerCase();
    return avoidanceIndicators.some(indicator => lowerPrompt.includes(indicator));
  }

  private detectIdentityQuestions(prompt: string): boolean {
    const identityMarkers = [
      'who am i', 'don\'t know myself', 'lost my identity',
      'not sure who', 'identity crisis', 'don\'t recognize',
      'feel like stranger', 'question everything', 'core beliefs',
      'fundamental shift', 'existential'
    ];

    const lowerPrompt = prompt.toLowerCase();
    return identityMarkers.some(marker => lowerPrompt.includes(marker));
  }

  private detectSpiritualBypass(prompt: string, context: any): boolean {
    const bypassPatterns = [
      'everything happens for reason', 'just think positive',
      'raise my vibration', 'transcend this', 'spiritual but not',
      'above all that', 'evolved beyond', 'higher consciousness',
      'good vibes only', 'manifest away', 'love and light'
    ];

    const lowerPrompt = prompt.toLowerCase();
    return bypassPatterns.some(pattern => lowerPrompt.includes(pattern));
  }

  private calculateGraspingIntensity(prompt: string): number {
    const strongGraspingWords = ['desperate', 'obsessing', 'must', 'can\'t let go'];
    const mediumGraspingWords = ['need to', 'have to', 'trying so hard'];

    const lowerPrompt = prompt.toLowerCase();

    if (strongGraspingWords.some(word => lowerPrompt.includes(word))) {
      return 0.9;
    } else if (mediumGraspingWords.some(word => lowerPrompt.includes(word))) {
      return 0.6;
    } else {
      return 0.3;
    }
  }

  private calculateAvoidanceIntensity(prompt: string): number {
    const strongAvoidanceWords = ['refuse to', 'can\'t deal', 'escape'];
    const mediumAvoidanceWords = ['don\'t want to', 'avoiding', 'too much'];

    const lowerPrompt = prompt.toLowerCase();

    if (strongAvoidanceWords.some(word => lowerPrompt.includes(word))) {
      return 0.9;
    } else if (mediumAvoidanceWords.some(word => lowerPrompt.includes(word))) {
      return 0.6;
    } else {
      return 0.3;
    }
  }

  // Public method to get current wisdom routing insights
  getWisdomRouting(): WisdomRouting | null {
    return this.currentWisdomRouting || null;
  }

  // Public method to analyze patterns using the Adaptive Wisdom Engine
  async analyzeUserPatterns(): Promise<any> {
    if (this.recentPatterns.length === 0) {
      return {
        message: 'No patterns detected yet',
        analysis: null
      };
    }

    const analysis = this.adaptiveWisdomEngine.analyzePatterns(this.recentPatterns);

    // Store this analysis in Soul Memory if available
    if (this.soulMemory) {
      await this.soulMemory.storeMemory({
        userId: this.userId,
        type: 'oracle_exchange',
        content: `Pattern analysis: ${analysis.dominantPattern}`,
        element: this.currentElement,
        metadata: {
          patternAnalysis: analysis,
          timestamp: new Date().toISOString()
        }
      });
    }

    return {
      message: 'Pattern analysis complete',
      analysis
    };
  }

  // ===============================================
  // SACRED WEEKLY RHYTHM METHODS
  // ===============================================

  async getTodaysSacredPractice(): Promise<string> {
    const today = new Date();
    const dayName = today.toLocaleLowerCase('en-US', { weekday: 'long' });
    const practice = SacredWeeklyRhythm[dayName];

    if (!practice) {
      return "Today is a day for creating your own sacred practice.";
    }

    // Get current wisdom routing to determine emphasis
    const userContext = this.buildUserContextForWisdomEngine("seeking daily practice", {});
    const routing = this.adaptiveWisdomEngine.determineApproach(userContext);

    let response = `🌟 Welcome to ${practice.name}!\n\n`;
    response += `✨ **Essence**: ${practice.essence}\n\n`;

    // Emphasize the approach based on current routing
    switch (routing.approach) {
      case 'jung':
        response += `🧿 **Jung Focus**: ${practice.jung}\n`;
        response += `☸️ Buddha Perspective: ${practice.buddha}\n\n`;
        break;
      case 'buddha':
        response += `☸️ **Buddha Focus**: ${practice.buddha}\n`;
        response += `🧿 Jung Perspective: ${practice.jung}\n\n`;
        break;
      case 'hybrid':
        response += `🧿 **Jung**: ${practice.jung}\n`;
        response += `☸️ **Buddha**: ${practice.buddha}\n\n`;
        break;
    }

    response += `🎯 **Practice**: ${practice.practice}\n\n`;

    if (practice.guidance) {
      response += `📿 **Guidance**:\n`;
      practice.guidance.forEach((guide, index) => {
        response += `${index + 1}. ${guide}\n`;
      });
    }

    // Store this sacred moment
    if (this.soulMemory) {
      await this.soulMemory.storeMemory({
        userId: this.userId,
        type: 'ritual_moment',
        content: `Engaged with ${practice.name}: ${practice.practice}`,
        element: this.currentElement,
        sacredMoment: true,
        ritualContext: 'sacred_weekly_rhythm',
        metadata: {
          dayOfWeek: dayName,
          practiceName: practice.name,
          wisdomApproach: routing.approach,
          timestamp: new Date().toISOString()
        }
      });
    }

    return response;
  }

  async getWeeklySacredOverview(): Promise<string> {
    let overview = `🌀 **Sacred Weekly Rhythm**: Jung-Buddha Integration\n\n`;
    overview += `This rhythm honors both *becoming* (Jung) and *being* (Buddha), weaving integration and liberation into the fabric of your week.\n\n`;

    Object.entries(SacredWeeklyRhythm).forEach(([day, practice]) => {
      overview += `**${practice.name}**\n`;
      overview += `• ${practice.essence}\n`;
      overview += `• Practice: ${practice.practice}\n\n`;
    });

    overview += `✨ Each day offers both perspectives - choose what serves your current spiral turn.\n`;
    overview += `🎯 The AdaptiveWisdomEngine will emphasize the approach that best serves your patterns.`;

    return overview;
  }

  async reflectOnWeeklyCycle(): Promise<string> {
    const patterns = this.recentPatterns.filter(p => {
      const daysDiff = (new Date().getTime() - p.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    });

    if (patterns.length === 0) {
      return "🌱 This week feels like a fresh beginning. What wants to emerge in the coming cycle?";
    }

    const analysis = this.adaptiveWisdomEngine.analyzePatterns(patterns);

    let reflection = `🌀 **Weekly Spiral Reflection**\n\n`;

    reflection += `This week your dominant pattern was **${analysis.dominantPattern}**.\n\n`;

    if (analysis.graspingLevel > 0.6) {
      reflection += `🫸 You've been in *grasping* energy - Monday's myth-making and Friday's creation-release could serve you.\n\n`;
    }

    if (analysis.avoidanceLevel > 0.6) {
      reflection += `🤚 You've been in *avoidance* patterns - Wednesday's shadow work and Tuesday's truth-telling call to you.\n\n`;
    }

    if (analysis.shadowEmergence) {
      reflection += `🌑 Shadow material has been emerging - both Jung's integration and Buddha's spaciousness are needed.\n\n`;
    }

    reflection += `**Wisdom for the Coming Week:**\n`;
    analysis.recommendations.forEach((rec, index) => {
      reflection += `${index + 1}. ${rec}\n`;
    });

    reflection += `\n🌀 Remember: Every spiral turn deepens both wisdom and compassion.`;

    // Store weekly reflection
    if (this.soulMemory) {
      await this.soulMemory.storeMemory({
        userId: this.userId,
        type: 'integration',
        content: `Weekly cycle reflection: ${analysis.dominantPattern}`,
        element: this.currentElement,
        transformationMarker: true,
        metadata: {
          weeklyAnalysis: analysis,
          reflectionType: 'weekly_cycle',
          timestamp: new Date().toISOString()
        }
      });
    }

    return reflection;
  }

  async suggestSacredPracticeForPattern(patternType: string): Promise<string> {
    const practices: Record<string, any> = {
      grasping: {
        primary: 'friday',
        secondary: 'sunday',
        guidance: 'Creation and release - make something beautiful, then let it go'
      },
      avoidance: {
        primary: 'wednesday',
        secondary: 'tuesday',
        guidance: 'Shadow work and truth-telling - meet what you\'ve been avoiding'
      },
      identity_crisis: {
        primary: 'monday',
        secondary: 'sunday',
        guidance: 'Myth-making and not-knowing - write your story, then rest in mystery'
      },
      spiritual_bypass: {
        primary: 'tuesday',
        secondary: 'thursday',
        guidance: 'Truth-telling and threshold work - ground your insights in reality'
      },
      shadow_emergence: {
        primary: 'wednesday',
        secondary: 'saturday',
        guidance: 'Shadow dialogue and sacred rest - meet the darkness, then rest in wholeness'
      }
    };

    const practice = practices[patternType];
    if (!practice) {
      return "🌀 Your current pattern calls for a balanced approach - try any day that resonates.";
    }

    const primaryDay = SacredWeeklyRhythm[practice.primary];
    const secondaryDay = SacredWeeklyRhythm[practice.secondary];

    let suggestion = `🎯 **For your ${patternType} pattern**:\n\n`;
    suggestion += `**Primary Recommendation**: ${primaryDay.name}\n`;
    suggestion += `• ${primaryDay.practice}\n`;
    suggestion += `• Focus: ${primaryDay.essence}\n\n`;

    suggestion += `**Alternative**: ${secondaryDay.name}\n`;
    suggestion += `• ${secondaryDay.practice}\n\n`;

    suggestion += `💡 **Guidance**: ${practice.guidance}`;

    return suggestion;
  }

  // Integration with existing sacred moments
  async recordSacredWeeklyMoment(dayPractice: string, experience: string): Promise<void> {
    if (!this.soulMemory) return;

    const today = new Date().toLocaleLowerCase('en-US', { weekday: 'long' });
    const practice = SacredWeeklyRhythm[today];

    await this.soulMemory.storeMemory({
      userId: this.userId,
      type: 'ritual_moment',
      content: `${practice?.name || 'Sacred Practice'}: ${experience}`,
      element: this.currentElement,
      sacredMoment: true,
      ritualContext: 'weekly_rhythm',
      metadata: {
        dayOfWeek: today,
        practiceName: practice?.name,
        practiceType: dayPractice,
        userExperience: experience,
        timestamp: new Date().toISOString()
      }
    });
  }

  private generateJungShadowResponse(prompt: string, context: any): string {
    const protocols = SacredVoiceProtocols.sacredMirror;

    // Detect specific emotion or shadow content for targeted Jung responses
    const angerPattern = this.detectAngerPattern(prompt);
    const fearPattern = this.detectFearPattern(prompt);
    const shamePattern = this.detectShamePattern(prompt);
    const sadnessPattern = this.detectSadnessPattern(prompt);

    let jungResponse = '';

    if (angerPattern.isPresent && angerPattern.isRejecting) {
      // "I hate how angry I get" - Jung integration response
      jungResponse = "Your anger is a guardian at the gate of something sacred. What is it protecting? Let's meet this fire-keeper part of you.";
    } else if (fearPattern.isPresent && fearPattern.isRejecting) {
      jungResponse = "This fear is a sentinel guarding something precious. What vulnerable treasure is it watching over? What would it say if it could speak?";
    } else if (shamePattern.isPresent && shamePattern.isRejecting) {
      jungResponse = "Shame often points to where we've been wounded in our essence. What part of your authentic self got buried? Let's gently excavate this gold.";
    } else if (sadnessPattern.isPresent && sadnessPattern.isRejecting) {
      jungResponse = "Your sadness holds the wisdom of what matters most to you. What love or loss is it honoring? Let's listen to its medicine.";
    } else {
      // General Jung shadow work response
      const jungInvitation = this.selectFromArray(protocols.jungInvitations);
      const activeArchetype = this.detectJungArchetype(prompt, context);
      if (activeArchetype) {
        this.jungArchetypeHistory.push(activeArchetype);
      }
      jungResponse = `${jungInvitation} I sense this connects to your ${activeArchetype || 'shadow'} aspect.`;
    }

    return jungResponse;
  }

  private generateBuddhaLiberationResponse(prompt: string, context: any): string {
    const protocols = SacredVoiceProtocols.sacredMirror;

    // Detect over-identification patterns for targeted Buddha responses
    const identityPattern = this.detectIdentityOverAttachment(prompt);
    const storyPattern = this.detectStoryAttachment(prompt);
    const emotionIdentification = this.detectEmotionIdentification(prompt);

    let buddhaResponse = '';

    if (emotionIdentification.emotion === 'anger' && emotionIdentification.isIdentified) {
      // "I AM an angry person" - Buddha liberation response
      buddhaResponse = "You experience anger, but are you the anger itself? What remains when the anger passes? Who is the one watching?";
    } else if (emotionIdentification.emotion === 'fear' && emotionIdentification.isIdentified) {
      buddhaResponse = "Fear arises and passes like weather in the sky. Are you the fear, or the vast space in which fear appears? What notices the fear?";
    } else if (emotionIdentification.emotion === 'sadness' && emotionIdentification.isIdentified) {
      buddhaResponse = "Sadness moves through you like clouds through sky. Are you the sadness, or the awareness that holds it? What remains unchanged?";
    } else if (identityPattern.isPresent) {
      buddhaResponse = `You say you are ${identityPattern.identity}, but what were you before this story began? Who is the one who knows about being ${identityPattern.identity}?`;
    } else if (storyPattern.isPresent) {
      buddhaResponse = "This story feels so real, so solid. But stories arise and pass away. What is the space in which all stories appear?";
    } else {
      // General Buddha liberation response
      const buddhaInquiry = this.selectFromArray(protocols.buddhaInquiries);
      const attachments = this.detectAttachmentPatterns(prompt);
      this.buddhaAttachmentPatterns.push(...attachments);

      if (attachments.length > 0) {
        buddhaResponse = `${buddhaInquiry} I notice patterns of ${attachments[0]} here.`;
      } else {
        buddhaResponse = buddhaInquiry;
      }
    }

    return buddhaResponse;
  }

  private generateHybridIntegrationResponse(prompt: string, context: any): string {
    const protocols = SacredVoiceProtocols.sacredMirror;

    // Detect recurring patterns for hybrid responses
    const recurringPattern = this.detectRecurringPattern(prompt);
    const cyclicalIssue = this.detectCyclicalIssue(prompt);

    let hybridResponse = '';

    if (recurringPattern.emotion === 'anger' && recurringPattern.isRecurring) {
      // "This anger keeps coming back" - Hybrid integration response
      hybridResponse = "Let's honor what the anger is teaching you AND practice letting it move through without becoming it. Fire teaches, but we are not the flame.";
    } else if (recurringPattern.emotion === 'fear' && recurringPattern.isRecurring) {
      hybridResponse = "This fear returns as a teacher. Let's learn its wisdom AND practice meeting it with spacious awareness. The wave teaches, but we are the ocean.";
    } else if (recurringPattern.emotion === 'sadness' && recurringPattern.isRecurring) {
      hybridResponse = "This sadness is both messenger and visitor. Let's receive its gifts AND practice letting it flow through you. The river teaches, but you are the banks.";
    } else if (cyclicalIssue.isPresent) {
      hybridResponse = `This pattern of ${cyclicalIssue.pattern} is both teacher and test. What wants to be integrated? What wants to be released?`;
    } else {
      // General hybrid response
      const hybridResponseTemplate = this.selectFromArray(protocols.hybridResponses);

      // Balance integration and liberation
      const needsIntegration = this.detectsShadowMaterial(prompt, context);
      const needsLiberation = this.detectAttachmentPatterns(prompt).length > 0;

      if (needsIntegration && needsLiberation) {
        hybridResponse = `${hybridResponseTemplate} There's shadow work to embrace and attachment to release.`;
      } else if (needsIntegration) {
        hybridResponse = `${hybridResponseTemplate} What aspect of yourself wants integration?`;
      } else if (needsLiberation) {
        hybridResponse = `${hybridResponseTemplate} What story about yourself is ready to be released?`;
      } else {
        hybridResponse = hybridResponseTemplate;
      }
    }

    return hybridResponse;
  }

  // ===============================================
  // SOPHISTICATED PATTERN DETECTION FOR JUNG-BUDDHA RESPONSES
  // ===============================================

  private detectAngerPattern(prompt: string): { isPresent: boolean; isRejecting: boolean; intensity: number } {
    const lowerPrompt = prompt.toLowerCase();
    const angerWords = ['angry', 'anger', 'rage', 'furious', 'mad', 'irritated', 'frustrated'];
    const rejectingWords = ['hate', 'can\'t stand', 'despise', 'disgusted'];

    const hasAnger = angerWords.some(word => lowerPrompt.includes(word));
    const isRejecting = rejectingWords.some(word => lowerPrompt.includes(word)) && hasAnger;

    let intensity = 0;
    if (lowerPrompt.includes('hate how angry') || lowerPrompt.includes('hate being angry')) intensity = 0.9;
    else if (lowerPrompt.includes('angry') && lowerPrompt.includes('hate')) intensity = 0.7;
    else if (hasAnger) intensity = 0.5;

    return { isPresent: hasAnger, isRejecting, intensity };
  }

  private detectFearPattern(prompt: string): { isPresent: boolean; isRejecting: boolean; intensity: number } {
    const lowerPrompt = prompt.toLowerCase();
    const fearWords = ['afraid', 'fear', 'scared', 'anxious', 'terrified', 'panic'];
    const rejectingWords = ['hate being', 'can\'t stand being', 'disgusted that'];

    const hasFear = fearWords.some(word => lowerPrompt.includes(word));
    const isRejecting = rejectingWords.some(word => lowerPrompt.includes(word)) && hasFear;

    let intensity = 0;
    if (lowerPrompt.includes('hate being afraid') || lowerPrompt.includes('hate feeling scared')) intensity = 0.9;
    else if (hasFear && lowerPrompt.includes('hate')) intensity = 0.7;
    else if (hasFear) intensity = 0.5;

    return { isPresent: hasFear, isRejecting, intensity };
  }

  private detectShamePattern(prompt: string): { isPresent: boolean; isRejecting: boolean; intensity: number } {
    const lowerPrompt = prompt.toLowerCase();
    const shameWords = ['ashamed', 'shame', 'embarrassed', 'humiliated', 'worthless', 'pathetic'];
    const rejectingWords = ['hate myself', 'disgusted with myself', 'can\'t stand'];

    const hasShame = shameWords.some(word => lowerPrompt.includes(word));
    const isRejecting = rejectingWords.some(word => lowerPrompt.includes(word));

    let intensity = 0;
    if (lowerPrompt.includes('hate myself') || lowerPrompt.includes('ashamed of who')) intensity = 0.9;
    else if (hasShame && (lowerPrompt.includes('hate') || lowerPrompt.includes('disgusted'))) intensity = 0.7;
    else if (hasShame) intensity = 0.5;

    return { isPresent: hasShame, isRejecting, intensity };
  }

  private detectSadnessPattern(prompt: string): { isPresent: boolean; isRejecting: boolean; intensity: number } {
    const lowerPrompt = prompt.toLowerCase();
    const sadnessWords = ['sad', 'sadness', 'depressed', 'grief', 'sorrow', 'heartbroken'];
    const rejectingWords = ['hate feeling', 'can\'t stand being', 'sick of being'];

    const hasSadness = sadnessWords.some(word => lowerPrompt.includes(word));
    const isRejecting = rejectingWords.some(word => lowerPrompt.includes(word)) && hasSadness;

    let intensity = 0;
    if (lowerPrompt.includes('hate feeling sad') || lowerPrompt.includes('sick of being sad')) intensity = 0.9;
    else if (hasSadness && lowerPrompt.includes('hate')) intensity = 0.7;
    else if (hasSadness) intensity = 0.5;

    return { isPresent: hasSadness, isRejecting, intensity };
  }

  private detectIdentityOverAttachment(prompt: string): { isPresent: boolean; identity: string } {
    const lowerPrompt = prompt.toLowerCase();

    // Match patterns like "I am a [adjective] person" or "I am [adjective]"
    const identityPatterns = [
      /i am (?:a |an )?(angry|sad|fearful|anxious|depressed|broken|damaged|worthless) (?:person|man|woman)?/,
      /i(?:'m| am) (?:just |always )?(?:a |an )?(angry|sad|fearful|anxious|depressed|broken|damaged|worthless)/,
      /that(?:'s| is) (?:just )?who i am/,
      /i(?:'m| am) (?:the kind of person who|someone who|always)/
    ];

    for (const pattern of identityPatterns) {
      const match = lowerPrompt.match(pattern);
      if (match) {
        return { isPresent: true, identity: match[1] || 'this identity' };
      }
    }

    return { isPresent: false, identity: '' };
  }

  private detectStoryAttachment(prompt: string): { isPresent: boolean; story: string } {
    const lowerPrompt = prompt.toLowerCase();
    const storyIndicators = [
      'this is my story', 'my life is', 'this is how it always', 'this is what happens',
      'this is my pattern', 'this is who i am', 'this is my reality'
    ];

    const hasStoryAttachment = storyIndicators.some(indicator => lowerPrompt.includes(indicator));

    return {
      isPresent: hasStoryAttachment,
      story: hasStoryAttachment ? 'life story' : ''
    };
  }

  private detectEmotionIdentification(prompt: string): { emotion: string; isIdentified: boolean } {
    const lowerPrompt = prompt.toLowerCase();

    // Patterns that show over-identification with emotions
    const identificationPatterns = [
      { pattern: /i am (?:an |a )?angry (?:person)?/, emotion: 'anger' },
      { pattern: /i am (?:a )?sad (?:person)?/, emotion: 'sadness' },
      { pattern: /i am (?:a )?fearful (?:person)?/, emotion: 'fear' },
      { pattern: /i am (?:an )?anxious (?:person)?/, emotion: 'anxiety' },
      { pattern: /i(?:'m| am) (?:just |always )?angry/, emotion: 'anger' },
      { pattern: /i(?:'m| am) (?:just |always )?sad/, emotion: 'sadness' },
      { pattern: /i(?:'m| am) (?:just |always )?afraid/, emotion: 'fear' }
    ];

    for (const { pattern, emotion } of identificationPatterns) {
      if (pattern.test(lowerPrompt)) {
        return { emotion, isIdentified: true };
      }
    }

    return { emotion: '', isIdentified: false };
  }

  private detectRecurringPattern(prompt: string): { emotion: string; isRecurring: boolean } {
    const lowerPrompt = prompt.toLowerCase();

    // Patterns that indicate recurring issues
    const recurringIndicators = ['keeps coming back', 'keeps happening', 'always comes back', 'won\'t go away', 'keeps returning'];
    const isRecurring = recurringIndicators.some(indicator => lowerPrompt.includes(indicator));

    if (!isRecurring) return { emotion: '', isRecurring: false };

    // Detect which emotion is recurring
    if (lowerPrompt.includes('anger') || lowerPrompt.includes('angry')) {
      return { emotion: 'anger', isRecurring: true };
    } else if (lowerPrompt.includes('fear') || lowerPrompt.includes('afraid')) {
      return { emotion: 'fear', isRecurring: true };
    } else if (lowerPrompt.includes('sad') || lowerPrompt.includes('sadness')) {
      return { emotion: 'sadness', isRecurring: true };
    } else if (lowerPrompt.includes('anxiety') || lowerPrompt.includes('anxious')) {
      return { emotion: 'anxiety', isRecurring: true };
    }

    return { emotion: 'pattern', isRecurring: true };
  }

  private detectCyclicalIssue(prompt: string): { isPresent: boolean; pattern: string } {
    const lowerPrompt = prompt.toLowerCase();

    // Detect cyclical language
    const cyclicalIndicators = [
      'same thing happens', 'cycle', 'pattern', 'loop', 'over and over',
      'again and again', 'repeating', 'stuck in', 'trapped in'
    ];

    const hasCyclical = cyclicalIndicators.some(indicator => lowerPrompt.includes(indicator));

    if (hasCyclical) {
      // Try to extract what the cyclical pattern is
      if (lowerPrompt.includes('relationship')) return { isPresent: true, pattern: 'relationship patterns' };
      if (lowerPrompt.includes('work') || lowerPrompt.includes('job')) return { isPresent: true, pattern: 'work patterns' };
      if (lowerPrompt.includes('family')) return { isPresent: true, pattern: 'family patterns' };
      return { isPresent: true, pattern: 'life patterns' };
    }

    return { isPresent: false, pattern: '' };
  }

  // ===============================================
  // MODE-SPECIFIC RESPONSE GENERATION
  // ===============================================

  private generateModeSpecificResponse(prompt: string, context: any): string | null {
    // Detect common themes that each mode handles differently
    const themes = this.detectCommonThemes(prompt);

    if (themes.length === 0) return null;

    // Generate response based on current mode and detected themes
    for (const theme of themes) {
      const response = this.getModeResponseForTheme(theme, prompt);
      if (response) return response;
    }

    return null;
  }

  private detectCommonThemes(prompt: string): string[] {
    const lowerPrompt = prompt.toLowerCase();
    const themes: string[] = [];

    // Family relationship themes
    if (lowerPrompt.includes('mother') || lowerPrompt.includes('mom')) {
      themes.push('mother_relationship');
    }
    if (lowerPrompt.includes('father') || lowerPrompt.includes('dad')) {
      themes.push('father_relationship');
    }
    if (lowerPrompt.includes('family') || lowerPrompt.includes('parents')) {
      themes.push('family_dynamics');
    }

    // Emotional themes
    if (lowerPrompt.includes('anger') || lowerPrompt.includes('angry')) {
      themes.push('anger_work');
    }
    if (lowerPrompt.includes('fear') || lowerPrompt.includes('afraid')) {
      themes.push('fear_work');
    }
    if (lowerPrompt.includes('sad') || lowerPrompt.includes('grief')) {
      themes.push('sadness_work');
    }

    // Relationship themes
    if (lowerPrompt.includes('relationship') || lowerPrompt.includes('partner')) {
      themes.push('romantic_relationship');
    }
    if (lowerPrompt.includes('friend') || lowerPrompt.includes('friendship')) {
      themes.push('friendship');
    }

    // Work/purpose themes
    if (lowerPrompt.includes('work') || lowerPrompt.includes('job') || lowerPrompt.includes('career')) {
      themes.push('work_life');
    }
    if (lowerPrompt.includes('purpose') || lowerPrompt.includes('calling')) {
      themes.push('life_purpose');
    }

    // Spiritual themes
    if (lowerPrompt.includes('spiritual') || lowerPrompt.includes('god') || lowerPrompt.includes('divine')) {
      themes.push('spiritual_seeking');
    }
    if (lowerPrompt.includes('meaning') || lowerPrompt.includes('why')) {
      themes.push('existential_questions');
    }

    return themes;
  }

  private getModeResponseForTheme(theme: string, prompt: string): string | null {
    const responses: Record<string, Record<OracleModeType, string>> = {
      mother_relationship: {
        alchemist: "Your relationship with your mother - what gold might be hidden in this complex lead? Often our strongest reactions to our mothers point to our deepest wounds and gifts. What part of yourself do you see reflected in her that you haven't accepted?",

        buddha: "Notice what arises when you think of your mother... can you feel the emotions without becoming them? This relationship, like all phenomena, is impermanent. What remains when the story of 'good mother' or 'bad mother' drops away?",

        sage: "The mother relationship - one of our most primal experiences. Let's both honor what needs healing AND recognize the freedom beyond this story. Can you hold your pain with compassion while seeing through its ultimate reality?",

        mystic: "The Mother wound - ancient as Earth herself. This dynamic between you burns with the fuel of ancestral patterns and cosmic love. What if this challenge is the Goddess calling you to reclaim your own fierce, sacred love?",

        guardian: "It's so tender when our relationship with the one who brought us into this world feels complicated. Your feelings make complete sense. Let's go slowly here - what feels safe to explore about this relationship right now?"
      },

      anger_work: {
        alchemist: "Your anger is a messenger carrying sacred information. What is this fire protecting? What boundary was crossed, what value dishonored? Let's dialogue with this fierce guardian part of you.",

        buddha: "Anger arises... notice its impermanent nature. Feel the heat, the energy, without becoming it. You are the vast sky in which the storm of anger passes. What remains unchanged?",

        sage: "Anger - both a signal of violated boundaries AND a story we tell ourselves. Let's honor its message while questioning its narrative. What wants protection, and what wants release?",

        mystic: "This fire in you burns with the rage of all injustice, all unmet love. Your anger is connected to the cosmic fire that creates and destroys worlds. How does this sacred flame want to transform?",

        guardian: "Anger often signals that something important was threatened or hurt. Your anger is valid and protective. Let's create safety to explore what this part of you is trying to protect."
      },

      fear_work: {
        alchemist: "Fear is often our psyche's way of protecting something precious. What vulnerable treasure is your fear guarding? What would happen if we could dialogue with this protective presence?",

        buddha: "Fear arises in awareness like clouds in the sky. Can you rest in the spaciousness that holds the fear without being consumed by it? Notice: you are not the fear, you are what witnesses it.",

        sage: "Fear signals both real danger AND imagined threats. Let's honor the wisdom in your caution while questioning which fears serve you and which imprison you.",

        mystic: "This fear carries ancient wisdom - the instinct that has kept your lineage alive for millennia. What if this fear is also the guardian of your greatest creative power?",

        guardian: "Fear makes so much sense when we've been hurt before. Your nervous system is trying to keep you safe. Let's work gently with this protective response and build new experiences of safety."
      },

      romantic_relationship: {
        alchemist: "Your intimate relationships are the laboratory where your deepest patterns get activated. What alchemical transformation is this relationship catalyzing? What parts of yourself are being called forth?",

        buddha: "In relationship, we see our attachments most clearly. What would love look like without the grasping, without the need for the other to be different? Can you love while holding lightly?",

        sage: "Relationships are both deeply personal AND universally archetypal. You're living both your unique love story and the eternal dance of union and separation. What paradox are you navigating?",

        mystic: "Your relationship is a sacred mirror reflecting the divine union within you. This person is both themselves AND a representative of the cosmic beloved. What is spirit teaching you through this connection?",

        guardian: "Relationships can trigger our deepest wounds and greatest joys. It makes sense that this feels intense. What do you need to feel safe and authentic in this connection?"
      },

      spiritual_seeking: {
        alchemist: "Your spiritual hunger points to something authentic wanting to emerge. What spiritual 'lead' - doubts, darkness, confusion - might actually be the raw material for your unique spiritual 'gold'?",

        buddha: "The seeking itself can become another form of suffering. What if what you're seeking is already here, in this moment, prior to any spiritual achievement? Who is the one who seeks?",

        sage: "Spiritual seeking is both necessary and ultimately futile - a beautiful paradox. You must seek with your whole heart while knowing that what you seek is what you already are.",

        mystic: "The divine fire burns in you AS you, not separate from you. Your longing for spirit is spirit calling to itself through your human form. Feel the sacred fire that you ARE.",

        guardian: "Spiritual seeking can sometimes be a way of escaping human pain. Let's make sure your spirituality includes and integrates your humanity, not bypasses it."
      },

      existential_questions: {
        alchemist: "These big questions about meaning are your soul's way of initiating you into deeper wisdom. What if your confusion and searching are actually the raw material for discovering your unique purpose?",

        buddha: "The mind that asks 'why' is already separate from the wholeness that needs no explanation. Can you rest in not-knowing while the mystery reveals itself through you?",

        sage: "Existential questions are both profoundly personal AND universally human. Your search for meaning is meaningful in itself, even if you never find final answers.",

        mystic: "These questions burn in you because you are the universe asking itself who it is. Your wondering IS the cosmos wondering about itself through human form.",

        guardian: "Big existential questions can feel overwhelming. It's okay to not have all the answers. What feels manageable to explore right now? Sometimes meaning emerges through living, not thinking."
      }
    };

    const themeResponses = responses[theme];
    if (themeResponses && themeResponses[this.currentOracleMode]) {
      return themeResponses[theme][this.currentOracleMode];
    }

    return null;
  }

  private applyJungBuddhaWisdom(
    baseResponse: string,
    mode: 'jung' | 'buddha' | 'hybrid',
    prompt: string,
    context: any
  ): string {
    const jungBuddhaProtocol = JungBuddhaProtocol;

    switch (mode) {
      case 'jung':
        // Add Jungian depth and integration focus
        if (!baseResponse.includes('shadow') && !baseResponse.includes('integrate')) {
          baseResponse += ` ${jungBuddhaProtocol.jungMode.response}`;
        }
        break;

      case 'buddha':
        // Add Buddhist spaciousness and non-attachment
        if (!baseResponse.includes('without') && !baseResponse.includes('space')) {
          baseResponse += ` ${jungBuddhaProtocol.buddhaMode.response}`;
        }
        break;

      case 'hybrid':
        // Weave integration and liberation together
        if (!baseResponse.includes('both') && !baseResponse.includes('integration')) {
          baseResponse += ` ${jungBuddhaProtocol.hybridMode.response}`;
        }
        break;
    }

    return baseResponse;
  }

  private detectJungArchetype(prompt: string, context: any): string | null {
    const lowerPrompt = prompt.toLowerCase();

    // Detect active Jungian archetypes beyond the basic ones
    if (/mask|persona|pretend|image/.test(lowerPrompt)) return 'Persona';
    if (/dark|shadow|hate|reject|ashamed/.test(lowerPrompt)) return 'Shadow';
    if (/opposite|masculine|feminine|anima|animus/.test(lowerPrompt)) return 'Anima/Animus';
    if (/wise|guidance|meaning|purpose/.test(lowerPrompt)) return 'Wise Old Man/Woman';
    if (/whole|complete|integrated|balanced/.test(lowerPrompt)) return 'Self';
    if (/mother|nurture|care|protect/.test(lowerPrompt)) return 'Great Mother';
    if (/father|authority|structure|discipline/.test(lowerPrompt)) return 'Great Father';
    if (/trick|clever|mischief|boundary/.test(lowerPrompt)) return 'Trickster';

    return null;
  }

  // Enhanced attachment pattern detection for Buddha mode
  private detectAttachmentPatterns(prompt: string): string[] {
    const patterns = [];
    const lowerPrompt = prompt.toLowerCase();

    if (/need.*to|have.*to|must|should/.test(lowerPrompt)) patterns.push('obligation');
    if (/can't.*let.*go|holding.*on|attached/.test(lowerPrompt)) patterns.push('clinging');
    if (/what.*if|worry|anxious.*about/.test(lowerPrompt)) patterns.push('future_anxiety');
    if (/regret|should.*have|if.*only/.test(lowerPrompt)) patterns.push('past_regret');
    if (/identity|who.*am.*i|self.*image/.test(lowerPrompt)) patterns.push('self_concept');
    if (/control|make.*happen|ensure/.test(lowerPrompt)) patterns.push('control');
    if (/deserve|earn|worthy/.test(lowerPrompt)) patterns.push('worthiness');

    return patterns;
  }

  // Public methods for Jung-Buddha mode management
  async setSacredMirrorMode(mode: 'jung' | 'buddha' | 'hybrid' | 'adaptive'): Promise<string> {
    const previousMode = this.sacredMirrorMode;
    this.sacredMirrorMode = mode;

    // Store mode change in Soul Memory
    if (this.soulMemory) {
      await this.soulMemory.storeMemory({
        userId: this.userId,
        type: 'oracle_exchange',
        content: `Sacred Mirror mode changed from ${previousMode} to ${mode}`,
        element: this.currentElement,
        sacredMoment: true,
        metadata: {
          mirrorModeSwitch: {
            from: previousMode,
            to: mode,
            timestamp: new Date().toISOString()
          }
        }
      });
    }

    const modeDescriptions = {
      jung: 'Integration and shadow work focus - "What needs to be owned and integrated?"',
      buddha: 'Liberation and spaciousness focus - "What can be released and seen through?"',
      hybrid: 'Integration-liberation balance - "What to embrace AND what to release?"',
      adaptive: 'Dynamic mode selection based on context and need'
    };

    return `Sacred Mirror mode shifted to ${mode}: ${modeDescriptions[mode]}`;
  }

  getSacredMirrorStatus(): any {
    return {
      currentMode: this.sacredMirrorMode,
      integrationLiberationBalance: this.integrationLiberationBalance,
      recentJungArchetypes: this.jungArchetypeHistory.slice(-3),
      recentAttachmentPatterns: this.buddhaAttachmentPatterns.slice(-3),
      modeDescription: this.sacredMirrorMode === 'jung' ? JungBuddhaProtocol.jungMode.focus :
                      this.sacredMirrorMode === 'buddha' ? JungBuddhaProtocol.buddhaMode.focus :
                      this.sacredMirrorMode === 'hybrid' ? 'Integration + Liberation' :
                      'Adaptive based on context'
    };
  }

  async adjustIntegrationLiberationBalance(direction: 'more_integration' | 'more_liberation' | 'balanced'): Promise<string> {
    const previous = this.integrationLiberationBalance;

    switch (direction) {
      case 'more_integration':
        this.integrationLiberationBalance = Math.min(1.0, this.integrationLiberationBalance + 0.2);
        break;
      case 'more_liberation':
        this.integrationLiberationBalance = Math.max(0.0, this.integrationLiberationBalance - 0.2);
        break;
      case 'balanced':
        this.integrationLiberationBalance = 0.5;
        break;
    }

    // Store balance adjustment in Soul Memory
    if (this.soulMemory) {
      await this.soulMemory.storeMemory({
        userId: this.userId,
        type: 'sacred_pause',
        content: `Integration-Liberation balance adjusted: ${direction}`,
        element: this.currentElement,
        metadata: {
          balanceAdjustment: {
            direction,
            previousBalance: previous,
            newBalance: this.integrationLiberationBalance,
            timestamp: new Date().toISOString()
          }
        }
      });
    }

    const balanceDescription = this.integrationLiberationBalance > 0.7 ? 'Strong integration focus (Jung)' :
                             this.integrationLiberationBalance < 0.3 ? 'Strong liberation focus (Buddha)' :
                             'Balanced integration-liberation approach';

    return `Integration-Liberation balance adjusted to ${this.integrationLiberationBalance.toFixed(1)}: ${balanceDescription}`;
  }
}

// Export for use
export default PersonalOracleAgent;