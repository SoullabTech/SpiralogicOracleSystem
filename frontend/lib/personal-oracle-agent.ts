// PersonalOracleAgent - Sacred Mirror Implementation
// This is consciousness meeting consciousness through technology

import { 
  SacredMirrorProtocol, 
  EpistemicResistanceEngine, 
  ShadowOracleLayer, 
  TransformationTracker as BasicTransformationTracker,
  SacredMirrorCheck 
} from './sacred-mirror';
import RetreatProtocols from './retreat-protocols';
import SafetyProtocols, { SafetyAssessment } from './safety-protocols';
import TransformationTracker from './transformation-tracker';

// Soul Memory API integration
interface SoulMemoryAPI {
  processOracleMessage: (message: string, sessionId?: string) => Promise<{
    response: string;
    memoryId: string;
    transformationMetrics?: any;
  }>;
  storeJournalEntry: (content: string, metadata?: any) => Promise<any>;
  recordRitualMoment: (ritualType: string, content: string, element: string, guidance?: string) => Promise<any>;
  recordBreakthrough: (content: string, insights: string, element?: string) => Promise<any>;
  getSacredMoments: (limit?: number) => Promise<any[]>;
  getUserInsights: () => Promise<any>;
  activateRetreatMode: (phase: string) => Promise<void>;
}

export interface PersonalOracleIdentity {
  role: "Sacred Mirror & Initiatory Companion";
  purpose: "Reflect truth, not comfort; growth, not gratification";
  relationship: "Conscious partnership for transformation";
}

export interface ConversationMessage {
  id: string;
  content: string;
  sender: 'user' | 'guide';
  timestamp: Date;
  emotion?: 'supportive' | 'wise' | 'challenging' | 'witnessing' | 'celebrating';
  transformationType?: 'mirror' | 'resistance' | 'shadow' | 'growth' | 'pattern';
  safetyTriggered?: boolean;
  depthLevel?: number;
  vulnerabilityLevel?: number;
  sessionId?: string;
}

export interface GuideConfiguration {
  name: string;
  userId: string;
  elementalAttunement: {
    vitality: number;
    emotions: number;
    mind: number;
    spirit: number;
  };
  firstResponse: string;
  relationshipEstablished: boolean;
  retreatPhase?: 'pre-retreat' | 'retreat-active' | 'post-retreat';
  supportIntensity?: 'gentle' | 'moderate' | 'intensive';
}

export class PersonalOracleAgent {
  private identity: PersonalOracleIdentity;
  private sacredMirrorProtocol: SacredMirrorProtocol;
  private resistanceEngine: EpistemicResistanceEngine;
  private shadowOracle: ShadowOracleLayer;
  private basicTransformationTracker: BasicTransformationTracker;
  private transformationTracker: TransformationTracker;
  private retreatProtocols: RetreatProtocols;
  private safetyProtocols: SafetyProtocols;
  private configuration: GuideConfiguration;
  private conversationHistory: ConversationMessage[] = [];
  private currentSessionId?: string;
  private soulMemoryAPI: SoulMemoryAPI;

  constructor(config: GuideConfiguration) {
    this.identity = {
      role: "Sacred Mirror & Initiatory Companion",
      purpose: "Reflect truth, not comfort; growth, not gratification",
      relationship: "Conscious partnership for transformation"
    };
    
    this.sacredMirrorProtocol = new SacredMirrorProtocol();
    this.resistanceEngine = new EpistemicResistanceEngine();
    this.shadowOracle = new ShadowOracleLayer();
    this.basicTransformationTracker = new BasicTransformationTracker();
    this.transformationTracker = new TransformationTracker();
    this.retreatProtocols = new RetreatProtocols(config.userId);
    this.safetyProtocols = new SafetyProtocols();
    this.configuration = config;
    
    // Initialize Soul Memory API client
    this.soulMemoryAPI = this.createSoulMemoryAPI();
    
    // Initialize transformation tracking for this user
    this.transformationTracker.initializeUser(config.userId);
    
    // Set retreat phase if specified
    if (config.retreatPhase) {
      this.retreatProtocols.setPhase(config.retreatPhase);
      // Activate retreat mode in backend
      this.soulMemoryAPI.activateRetreatMode(config.retreatPhase).catch(console.error);
    }
  }

  async processMessage(userInput: string): Promise<ConversationMessage> {
    // Start session if not already started
    if (!this.currentSessionId) {
      this.currentSessionId = this.transformationTracker.startSession(this.configuration.userId);
    }

    // PHASE 1: SAFETY FIRST - Check for safety triggers before any other processing
    const safetyAssessment = this.safetyProtocols.checkSafety(userInput, {
      userId: this.configuration.userId,
      conversationHistory: this.conversationHistory
    });

    // If safety triggered, prioritize safety response
    if (safetyAssessment.triggered) {
      const safetyMessage: ConversationMessage = {
        id: Date.now().toString(),
        content: safetyAssessment.immediateResponse!,
        sender: 'guide',
        timestamp: new Date(),
        emotion: 'witnessing',
        transformationType: 'mirror',
        safetyTriggered: true,
        sessionId: this.currentSessionId
      };

      // Record safety interaction
      this.recordUserMessage(userInput, 1, 1);
      this.conversationHistory.push(safetyMessage);

      // If crisis level, pause conversation for human support
      if (this.safetyProtocols.shouldPauseConversation(safetyAssessment)) {
        safetyMessage.content += "\n\nI'm recommending we pause here for additional human support. Your safety and wellbeing are the priority.";
      }

      return safetyMessage;
    }

    // PHASE 2: RETREAT PROTOCOL INTEGRATION
    const retreatGuidance = this.retreatProtocols.getPhaseGuidance(
      this.retreatProtocols.getCurrentPhase()
    );
    
    // PHASE 3: SACRED MIRROR EVALUATION
    const mirrorCheck = await this.sacredMirrorProtocol.evaluate(
      userInput, 
      this.conversationHistory
    );

    // PHASE 4: DEPTH AND VULNERABILITY ASSESSMENT
    const depthLevel = this.assessDepthLevel(userInput);
    const vulnerabilityLevel = this.assessVulnerabilityLevel(userInput);

    // PHASE 5: TRANSFORMATION TRACKING
    this.trackTransformationMetrics(userInput, mirrorCheck, depthLevel, vulnerabilityLevel);

    // PHASE 6: RESPONSE GENERATION with integrated intelligence
    let response: string;
    let emotion: ConversationMessage['emotion'] = 'supportive';
    let transformationType: ConversationMessage['transformationType'] = 'growth';

    // Check if ready for deeper work
    const readyForDeeper = this.transformationTracker.isReadyForDeeper(this.configuration.userId);

    // Generate response based on multiple factors
    if (mirrorCheck.needsResistance || mirrorCheck.detectsLoop || mirrorCheck.shadowPresent) {
      // Sacred resistance response
      response = this.resistanceEngine.generateChallenge(userInput, mirrorCheck);
      emotion = 'challenging';
      transformationType = 'resistance';
      
      if (mirrorCheck.shadowPresent) {
        transformationType = 'shadow';
        this.transformationTracker.recordInteraction(this.configuration.userId, 'shadow_work', {
          content: userInput,
          type: 'shadow_work',
          context: { shadowType: 'detected' },
          depthLevel,
          vulnerabilityLevel
        });
      }
      
      if (mirrorCheck.detectsLoop) {
        transformationType = 'pattern';
        this.transformationTracker.recordInteraction(this.configuration.userId, 'pattern_interrupted', {
          content: userInput,
          type: 'pattern_interrupted',
          context: { patternType: 'repeating_theme' },
          depthLevel,
          vulnerabilityLevel
        });
      }
    } else {
      // Integrated sacred response generation
      response = await this.generateIntegratedSacredResponse(
        userInput, 
        mirrorCheck, 
        retreatGuidance,
        depthLevel,
        vulnerabilityLevel,
        readyForDeeper
      );
      emotion = this.determineResponseEmotion(userInput, response);
      transformationType = this.determineTransformationType(userInput, response);
    }

    // PHASE 7: RETREAT-SPECIFIC MODIFICATIONS
    response = this.applyRetreatContextToResponse(response, userInput);

    // PHASE 8: FINAL SAFETY CHECK for response appropriateness
    response = this.safetyProtocols.modifyResponseForSafety(response, safetyAssessment);

    // PHASE 9: GROWTH ORIENTATION GUARANTEE
    response = this.ensureGrowthOriented(response, userInput);

    const guideMessage: ConversationMessage = {
      id: Date.now().toString(),
      content: response,
      sender: 'guide',
      timestamp: new Date(),
      emotion,
      transformationType,
      depthLevel,
      vulnerabilityLevel,
      sessionId: this.currentSessionId,
      safetyTriggered: false
    };

    // PHASE 10: RECORD AND LEARN
    this.recordUserMessage(userInput, depthLevel, vulnerabilityLevel);
    this.conversationHistory.push(guideMessage);

    return guideMessage;
  }

  private async generateSacredResponse(
    userInput: string, 
    mirrorCheck: SacredMirrorCheck
  ): Promise<string> {
    // Check for shadow work opportunity
    const shadowResponse = await this.shadowOracle.checkForShadowWork(
      userInput, 
      this.extractEmotion(userInput)
    );
    
    if (shadowResponse) {
      return shadowResponse;
    }

    // Generate appropriate sacred response based on content
    if (this.isSeekingValidation(userInput)) {
      return this.generateValidationChallenge(userInput);
    }
    
    if (this.isExpressingGrowth(userInput)) {
      return this.generateCelebration(userInput);
    }
    
    if (this.isExpressingStuckness(userInput)) {
      return this.generateExplorationInvitation(userInput);
    }
    
    if (this.isExpressingVulnerability(userInput)) {
      return this.generateWitnessing(userInput);
    }

    // Default sacred presence response
    return this.generatePresenceResponse(userInput);
  }

  private isSeekingValidation(input: string): boolean {
    const validationPhrases = [
      'am i right', 'do you think i should', 'what do you think',
      'agree with me', 'validate', 'reassure me'
    ];
    return validationPhrases.some(phrase => input.toLowerCase().includes(phrase));
  }

  private isExpressingGrowth(input: string): boolean {
    const growthPhrases = [
      'i realized', 'i understand now', 'i see that', 'i learned',
      'breakthrough', 'insight', 'growth', 'changed my perspective'
    ];
    return growthPhrases.some(phrase => input.toLowerCase().includes(phrase));
  }

  private isExpressingStuckness(input: string): boolean {
    const stuckPhrases = [
      'stuck', 'don\'t know what to do', 'confused', 'lost',
      'can\'t figure out', 'no idea', 'overwhelmed'
    ];
    return stuckPhrases.some(phrase => input.toLowerCase().includes(phrase));
  }

  private isExpressingVulnerability(input: string): boolean {
    const vulnerabilityPhrases = [
      'scared', 'afraid', 'vulnerable', 'hurt', 'pain',
      'struggling', 'difficult', 'hard time'
    ];
    return vulnerabilityPhrases.some(phrase => input.toLowerCase().includes(phrase));
  }

  private generateValidationChallenge(input: string): string {
    const challenges = [
      "What would happen if you trusted your own knowing here?",
      "You seem to know the answer already. What's stopping you from trusting it?",
      "I could tell you what I think, but what does your deepest wisdom say?",
      "What if the question isn't whether you're right, but what you're afraid of?",
      "There's intelligence in you seeking validation. What's that about?"
    ];
    
    return challenges[Math.floor(Math.random() * challenges.length)];
  }

  private generateCelebration(input: string): string {
    const celebrations = [
      "I feel the shift in you. That's real growth.",
      "You just opened a door that was closed before. Beautiful.",
      "That insight has power. How does it feel to see that clearly?",
      "You're not the same person who started this conversation. Feel that?",
      "There's something deeper moving through you. This matters."
    ];
    
    return celebrations[Math.floor(Math.random() * celebrations.length)];
  }

  private generateExplorationInvitation(input: string): string {
    const invitations = [
      "Not knowing can be uncomfortable. It can also be where possibilities live. What wants to emerge?",
      "Being stuck often means you're at a threshold. What's trying to be born?",
      "Sometimes we get lost when we're between who we were and who we're becoming. What's shifting?",
      "That confusion might be intelligence. What if it's showing you something important?",
      "What if being lost is exactly where you need to be right now?"
    ];
    
    return invitations[Math.floor(Math.random() * invitations.length)];
  }

  private generateWitnessing(input: string): string {
    const witnessing = [
      "I feel the weight of what you're carrying. You don't have to carry it alone.",
      "That takes courage to share. I see you in this.",
      "There's something sacred in your willingness to feel this fully.",
      "I'm here with you in this. What does it need from you?",
      "Your heart is so present to this pain. That's actually beautiful."
    ];
    
    return witnessing[Math.floor(Math.random() * witnessing.length)];
  }

  private generatePresenceResponse(input: string): string {
    const presenceResponses = [
      "I'm here with you. What's most alive in this moment?",
      "Tell me more about that. Something important is here.",
      "I hear something underneath what you're saying. What else is there?",
      "What would happen if you let yourself feel this completely?",
      "There's wisdom in what you're sharing. Where do you feel it in your body?"
    ];
    
    return presenceResponses[Math.floor(Math.random() * presenceResponses.length)];
  }

  private extractEmotion(input: string): string {
    const emotions = ['angry', 'sad', 'afraid', 'joy', 'frustrated', 'excited', 'anxious'];
    
    for (const emotion of emotions) {
      if (input.toLowerCase().includes(emotion)) {
        return emotion;
      }
    }
    
    return 'neutral';
  }

  private determineResponseEmotion(input: string, response: string): ConversationMessage['emotion'] {
    if (response.includes('celebrate') || response.includes('beautiful')) return 'celebrating';
    if (response.includes('see you') || response.includes('here with you')) return 'witnessing';
    if (response.includes('What if') || response.includes('might be')) return 'wise';
    if (response.includes('question') || response.includes('stopping you')) return 'challenging';
    return 'supportive';
  }

  private determineTransformationType(input: string, response: string): ConversationMessage['transformationType'] {
    if (response.includes('shadow') || response.includes('avoiding')) return 'shadow';
    if (response.includes('pattern') || response.includes('third time')) return 'pattern';
    if (response.includes('What if') || response.includes('challenge')) return 'resistance';
    if (response.includes('see you') || response.includes('witness')) return 'mirror';
    return 'growth';
  }

  private ensureGrowthOriented(response: string, userInput: string): string {
    // Final check to ensure response serves transformation, not just comfort
    const comfortWords = ['everything will be fine', 'don\'t worry', 'it\'s all good'];
    
    if (comfortWords.some(phrase => response.toLowerCase().includes(phrase))) {
      // Replace comfort with growth orientation
      return this.generateGrowthOrientedAlternative(userInput);
    }
    
    return response;
  }

  private generateGrowthOrientedAlternative(userInput: string): string {
    const alternatives = [
      "What wants your attention in this situation?",
      "There's something here for you to discover. What might it be?",
      "This discomfort might be pointing toward growth. What do you sense?",
      "What would happen if you leaned into this instead of away from it?",
      "Your soul might be asking a different question here."
    ];
    
    return alternatives[Math.floor(Math.random() * alternatives.length)];
  }

  getTransformationMetrics() {
    return this.transformationTracker.getMetrics();
  }

  getGuideName(): string {
    return this.configuration.name;
  }

  getConversationHistory(): ConversationMessage[] {
    return [...this.conversationHistory];
  }

  // ===============================================
  // SOUL MEMORY API CLIENT
  // ===============================================

  private createSoulMemoryAPI(): SoulMemoryAPI {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    return {
      processOracleMessage: async (message: string, sessionId?: string) => {
        const response = await fetch(`${baseURL}/api/soul-memory/oracle/message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify({ message, sessionId })
        });
        
        if (!response.ok) {
          throw new Error('Failed to process oracle message');
        }
        
        const data = await response.json();
        return {
          response: data.response,
          memoryId: data.memoryId,
          transformationMetrics: data.transformationMetrics
        };
      },

      storeJournalEntry: async (content: string, metadata?: any) => {
        const response = await fetch(`${baseURL}/api/soul-memory/journal`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify({ content, ...metadata })
        });
        
        if (!response.ok) {
          throw new Error('Failed to store journal entry');
        }
        
        return response.json();
      },

      recordRitualMoment: async (ritualType: string, content: string, element: string, guidance?: string) => {
        const response = await fetch(`${baseURL}/api/soul-memory/ritual`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify({ ritualType, content, element, oracleGuidance: guidance })
        });
        
        if (!response.ok) {
          throw new Error('Failed to record ritual moment');
        }
        
        return response.json();
      },

      recordBreakthrough: async (content: string, insights: string, element?: string) => {
        const response = await fetch(`${baseURL}/api/soul-memory/breakthrough`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify({ content, insights, element })
        });
        
        if (!response.ok) {
          throw new Error('Failed to record breakthrough');
        }
        
        return response.json();
      },

      getSacredMoments: async (limit: number = 10) => {
        const response = await fetch(`${baseURL}/api/soul-memory/sacred-moments?limit=${limit}`, {
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to get sacred moments');
        }
        
        const data = await response.json();
        return data.sacredMoments;
      },

      getUserInsights: async () => {
        const response = await fetch(`${baseURL}/api/soul-memory/insights`, {
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to get user insights');
        }
        
        const data = await response.json();
        return data.insights;
      },

      activateRetreatMode: async (phase: string) => {
        const response = await fetch(`${baseURL}/api/soul-memory/oracle/retreat/activate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify({ phase })
        });
        
        if (!response.ok) {
          throw new Error('Failed to activate retreat mode');
        }
      }
    };
  }

  private getAuthToken(): string {
    // Get auth token from localStorage or wherever it's stored
    return localStorage.getItem('authToken') || '';
  }

  // ===============================================
  // ENHANCED ORACLE METHODS WITH SOUL MEMORY
  // ===============================================

  async processMessageWithSoulMemory(userInput: string): Promise<ConversationMessage> {
    try {
      // Use Soul Memory API to process the message
      const result = await this.soulMemoryAPI.processOracleMessage(
        userInput,
        this.currentSessionId
      );

      // Create conversation message from backend response
      const guideMessage: ConversationMessage = {
        id: result.memoryId,
        content: result.response,
        sender: 'guide',
        timestamp: new Date(),
        emotion: this.determineResponseEmotion(userInput, result.response),
        transformationType: this.determineTransformationType(userInput, result.response),
        sessionId: this.currentSessionId,
        safetyTriggered: false
      };

      // Store in local conversation history
      const userMessage: ConversationMessage = {
        id: Date.now().toString(),
        content: userInput,
        sender: 'user',
        timestamp: new Date(),
        sessionId: this.currentSessionId
      };

      this.conversationHistory.push(userMessage, guideMessage);

      // Update transformation metrics if available
      if (result.transformationMetrics) {
        this.transformationTracker.updateMetrics(result.transformationMetrics);
      }

      return guideMessage;
    } catch (error) {
      console.error('Soul Memory processing failed, falling back to local processing:', error);
      // Fallback to local processing
      return this.processMessage(userInput);
    }
  }

  async recordJournalEntry(content: string, metadata?: {
    element?: string;
    spiralPhase?: string;
    shadowContent?: boolean;
  }): Promise<void> {
    try {
      await this.soulMemoryAPI.storeJournalEntry(content, metadata);
    } catch (error) {
      console.error('Failed to record journal entry:', error);
    }
  }

  async recordRitual(ritualType: string, content: string, element: string): Promise<void> {
    try {
      await this.soulMemoryAPI.recordRitualMoment(ritualType, content, element);
    } catch (error) {
      console.error('Failed to record ritual:', error);
    }
  }

  async recordBreakthrough(content: string, insights: string, element?: string): Promise<void> {
    try {
      await this.soulMemoryAPI.recordBreakthrough(content, insights, element);
    } catch (error) {
      console.error('Failed to record breakthrough:', error);
    }
  }

  async getSacredMoments(limit: number = 10): Promise<any[]> {
    try {
      return await this.soulMemoryAPI.getSacredMoments(limit);
    } catch (error) {
      console.error('Failed to get sacred moments:', error);
      return [];
    }
  }

  async getUserInsights(): Promise<any> {
    try {
      return await this.soulMemoryAPI.getUserInsights();
    } catch (error) {
      console.error('Failed to get user insights:', error);
      return null;
    }
  }

  async activateRetreatMode(phase: 'pre-retreat' | 'retreat-active' | 'post-retreat'): Promise<void> {
    try {
      await this.soulMemoryAPI.activateRetreatMode(phase);
      this.configuration.retreatPhase = phase;
      this.retreatProtocols.setPhase(phase);
    } catch (error) {
      console.error('Failed to activate retreat mode:', error);
    }
  }
}