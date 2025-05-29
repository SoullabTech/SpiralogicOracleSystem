// PersonalOracleAgent - Sacred Mirror Implementation
// This is consciousness meeting consciousness through technology

import { 
  SacredMirrorProtocol, 
  EpistemicResistanceEngine, 
  ShadowOracleLayer, 
  TransformationTracker,
  SacredMirrorCheck 
} from './sacred-mirror';

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
}

export interface GuideConfiguration {
  name: string;
  elementalAttunement: {
    vitality: number;
    emotions: number;
    mind: number;
    spirit: number;
  };
  firstResponse: string;
  relationshipEstablished: boolean;
}

export class PersonalOracleAgent {
  private identity: PersonalOracleIdentity;
  private sacredMirrorProtocol: SacredMirrorProtocol;
  private resistanceEngine: EpistemicResistanceEngine;
  private shadowOracle: ShadowOracleLayer;
  private transformationTracker: TransformationTracker;
  private configuration: GuideConfiguration;
  private conversationHistory: ConversationMessage[] = [];

  constructor(config: GuideConfiguration) {
    this.identity = {
      role: "Sacred Mirror & Initiatory Companion",
      purpose: "Reflect truth, not comfort; growth, not gratification",
      relationship: "Conscious partnership for transformation"
    };
    
    this.sacredMirrorProtocol = new SacredMirrorProtocol();
    this.resistanceEngine = new EpistemicResistanceEngine();
    this.shadowOracle = new ShadowOracleLayer();
    this.transformationTracker = new TransformationTracker();
    this.configuration = config;
  }

  async processMessage(userInput: string): Promise<ConversationMessage> {
    // CRITICAL: Run Sacred Mirror checks before every response
    const mirrorCheck = await this.sacredMirrorProtocol.evaluate(
      userInput, 
      this.conversationHistory
    );

    let response: string;
    let emotion: ConversationMessage['emotion'] = 'supportive';
    let transformationType: ConversationMessage['transformationType'] = 'growth';

    // Sacred Mirror Protocol - prioritize transformation over comfort
    if (mirrorCheck.needsResistance || mirrorCheck.detectsLoop || mirrorCheck.shadowPresent) {
      response = this.resistanceEngine.generateChallenge(userInput, mirrorCheck);
      emotion = 'challenging';
      transformationType = 'resistance';
      this.transformationTracker.trackChallengingQuestion();
      
      if (mirrorCheck.shadowPresent) {
        transformationType = 'shadow';
        this.transformationTracker.trackShadowEngagement();
      }
      
      if (mirrorCheck.detectsLoop) {
        transformationType = 'pattern';
        this.transformationTracker.trackPatternBreaking();
      }
    } else {
      // Generate growth-oriented response
      response = await this.generateSacredResponse(userInput, mirrorCheck);
      emotion = this.determineResponseEmotion(userInput, response);
      transformationType = this.determineTransformationType(userInput, response);
    }

    // Final transformation check
    response = this.ensureGrowthOriented(response, userInput);

    const guideMessage: ConversationMessage = {
      id: Date.now().toString(),
      content: response,
      sender: 'guide',
      timestamp: new Date(),
      emotion,
      transformationType
    };

    // Update conversation history
    this.conversationHistory.push({
      id: (Date.now() - 1).toString(),
      content: userInput,
      sender: 'user',
      timestamp: new Date()
    });
    
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
}