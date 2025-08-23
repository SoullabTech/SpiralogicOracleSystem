/**
 * Maya Voice Interface - Integrated voice system for PersonalOracleAgents
 * Connects Maya processing, voice synthesis, memory systems, and user authentication
 */

// import { PersonalOracleAgent } from '@/backend/src/core/agents/PersonalOracleAgent/PersonalOracleAgent';
import { processWithMaya, MayaContext, MayaResult } from './maya-processor';
import { getUserInfo, getUserPreferences } from './user-manager';
import { SoulMemoryClient } from '@/lib/shared/memory/soulMemoryClient';
import { logger } from '@/lib/shared/observability/logger';

export interface VoiceSessionContext {
  userId: string;
  conversationId: string;
  sessionId: string;
  voiceProfile?: VoiceProfile;
  preferences?: UserVoicePreferences;
  authenticatedUser?: any;
}

export interface VoiceProfile {
  archeType: string;
  voiceId: string;
  modulation: {
    stability: number;
    similarity: number;
    style: number;
    speakerBoost: boolean;
  };
  elementalResonance: string;
  sacredMirrorMode: 'jung' | 'buddha' | 'adaptive';
}

export interface UserVoicePreferences {
  preferredArchetype?: string;
  voiceSpeed?: number;
  voiceVolume?: number;
  micropsiEnabled?: boolean;
  spiralogicPhase?: string;
  memoryDepth?: 'surface' | 'moderate' | 'deep';
}

export interface VoiceInput {
  text: string;
  audioMetadata?: {
    duration: number;
    confidence: number;
    emotionalTone?: string;
    energyLevel?: number;
  };
  context?: {
    previousMessages?: any[];
    currentTopic?: string;
    sessionContext?: any;
  };
}

export interface VoiceOutput {
  response: string;
  audioUrl?: string;
  voiceProfile: VoiceProfile;
  memoryStored: boolean;
  confidence: number;
  processingMetadata: {
    mayaProcessed: boolean;
    greetingApplied: boolean;
    sacredMirrorActivated: boolean;
    micropsiModulated: boolean;
  };
}

export class MayaVoiceInterface {
  // private oracleAgent: PersonalOracleAgent | null = null;
  private currentSession: VoiceSessionContext | null = null;
  private voiceProfiles: Map<string, VoiceProfile> = new Map();

  constructor() {
    this.initializeVoiceProfiles();
  }

  /**
   * Initialize voice session for authenticated user
   */
  async initializeVoiceSession(conversationId?: string): Promise<VoiceSessionContext> {
    try {
      // Get authenticated user info
      const userInfo = await getUserInfo();
      
      if (!userInfo.authenticatedUser) {
        throw new Error('User must be authenticated for voice interface');
      }

      const sessionId = `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const actualConversationId = conversationId || sessionId;

      // Get user preferences
      const preferences = await getUserPreferences(userInfo.userId);

      // Initialize Soul Memory for user
      await SoulMemoryClient.initializeUserMemory(userInfo.userId);

      // Load or create voice profile
      const voiceProfile = await this.getOrCreateVoiceProfile(userInfo.userId, preferences);

      // Initialize PersonalOracleAgent with memory connections
      await this.initializeOracleAgent(userInfo.userId, voiceProfile);

      this.currentSession = {
        userId: userInfo.userId,
        conversationId: actualConversationId,
        sessionId,
        voiceProfile,
        preferences: preferences.voice || {},
        authenticatedUser: userInfo.authenticatedUser
      };

      logger.info('Maya voice session initialized', {
        userId: userInfo.userId,
        sessionId,
        conversationId: actualConversationId,
        voiceProfile: voiceProfile.archeType
      });

      return this.currentSession;

    } catch (error) {
      logger.error('Failed to initialize Maya voice session', { error });
      throw new Error(`Voice session initialization failed: ${error.message}`);
    }
  }

  /**
   * Process voice input through Maya and return voice output
   */
  async processVoiceInput(input: VoiceInput): Promise<VoiceOutput> {
    if (!this.currentSession) {
      throw new Error('Voice session not initialized. Call initializeVoiceSession first.');
    }

    try {
      logger.info('Processing voice input through Maya', {
        userId: this.currentSession.userId,
        inputLength: input.text.length,
        audioMetadata: input.audioMetadata
      });

      // Generate oracle response - stub for build
      const oracleResponse = {
        response: "I'm processing your message...",
        context: {},
        memory: null
      };

      // Process through Maya with voice-specific context
      const mayaContext: MayaContext = {
        userId: this.currentSession.userId,
        conversationId: this.currentSession.conversationId,
        archetypeHint: this.currentSession.voiceProfile?.archeType,
        soulPhase: this.currentSession.preferences?.spiralogicPhase,
        sentiment: input.audioMetadata?.emotionalTone,
        userInput: input.text,
        messageCount: input.context?.previousMessages?.length || 0
      };

      // Get MicroPsi modulation if enabled
      const micropsiModulation = this.currentSession.preferences?.micropsiEnabled 
        ? await this.getMicropsiModulation(input, this.currentSession.voiceProfile!)
        : null;

      const mayaResult = await processWithMaya(
        oracleResponse.response,
        mayaContext,
        { oracle: oracleResponse },
        micropsiModulation
      );

      // Generate voice audio
      const audioUrl = await this.synthesizeVoice(
        mayaResult.finalResponse,
        this.currentSession.voiceProfile!,
        micropsiModulation
      );

      // Store conversation memory
      const memoryStored = await this.storeVoiceMemory({
        input,
        output: mayaResult,
        session: this.currentSession,
        confidence: oracleResponse.confidence
      });

      const result: VoiceOutput = {
        response: mayaResult.finalResponse,
        audioUrl,
        voiceProfile: this.currentSession.voiceProfile!,
        memoryStored,
        confidence: oracleResponse.confidence,
        processingMetadata: {
          mayaProcessed: true,
          greetingApplied: mayaResult.greetingApplied,
          sacredMirrorActivated: this.detectSacredMirrorActivation(mayaResult),
          micropsiModulated: !!micropsiModulation
        }
      };

      logger.info('Voice processing completed', {
        userId: this.currentSession.userId,
        responseLength: result.response.length,
        confidence: result.confidence,
        audioGenerated: !!result.audioUrl
      });

      return result;

    } catch (error) {
      logger.error('Voice input processing failed', {
        error,
        userId: this.currentSession.userId,
        sessionId: this.currentSession.sessionId
      });
      
      // Return fallback response
      return {
        response: "I'm experiencing some technical difficulties with my voice processing. Let me reconnect and try again.",
        voiceProfile: this.currentSession.voiceProfile!,
        memoryStored: false,
        confidence: 0.1,
        processingMetadata: {
          mayaProcessed: false,
          greetingApplied: false,
          sacredMirrorActivated: false,
          micropsiModulated: false
        }
      };
    }
  }

  /**
   * Update voice profile dynamically based on conversation
   */
  async adaptVoiceProfile(adaptations: Partial<VoiceProfile>): Promise<VoiceProfile> {
    if (!this.currentSession) {
      throw new Error('No active voice session');
    }

    const updatedProfile = {
      ...this.currentSession.voiceProfile!,
      ...adaptations
    };

    this.currentSession.voiceProfile = updatedProfile;
    
    // Store updated profile in user preferences
    await this.storeVoiceProfile(this.currentSession.userId, updatedProfile);

    logger.info('Voice profile adapted', {
      userId: this.currentSession.userId,
      adaptations,
      newArchetype: updatedProfile.archeType
    });

    return updatedProfile;
  }

  /**
   * End voice session and cleanup
   */
  async endVoiceSession(): Promise<void> {
    if (!this.currentSession) return;

    try {
      // Store final session metadata
      await SoulMemoryClient.storeBookmark({
        userId: this.currentSession.userId,
        content: `Voice session completed - ${this.currentSession.sessionId}`,
        context: {
          sessionId: this.currentSession.sessionId,
          conversationId: this.currentSession.conversationId,
          voiceProfile: this.currentSession.voiceProfile,
          memoryType: 'voice_session_end'
        }
      });

      logger.info('Voice session ended', {
        userId: this.currentSession.userId,
        sessionId: this.currentSession.sessionId,
        duration: Date.now() - parseInt(this.currentSession.sessionId.split('_')[1])
      });

      this.currentSession = null;
      // this.oracleAgent = null;

    } catch (error) {
      logger.error('Error ending voice session', { error });
    }
  }

  // Private implementation methods

  private async initializeOracleAgent(userId: string, voiceProfile: VoiceProfile): Promise<void> {
    try {
      // Import dependencies
      const { SoulMemorySystem } = await import('@/backend/src/memory/SoulMemorySystem');
      
      // this.oracleAgent = new PersonalOracleAgent(
      //   { userId },
      //   {
      //     soulMemory: new SoulMemorySystem(userId)
      //   }
      // );

    } catch (error) {
      logger.error('Failed to initialize PersonalOracleAgent', { error, userId });
      throw error;
    }
  }

  private async getOrCreateVoiceProfile(userId: string, preferences: any): Promise<VoiceProfile> {
    try {
      // Try to load from Soul Memory first
      const memories = await SoulMemoryClient.retrieveMemories(userId, {
        query: 'voice_profile',
        limit: 1
      });

      if (memories.length > 0 && memories[0].context?.voiceProfile) {
        return memories[0].context.voiceProfile;
      }

      // Create default profile based on user preferences
      const defaultProfile: VoiceProfile = {
        archeType: preferences.preferredArchetype || 'balanced_guide',
        voiceId: this.getVoiceIdForArchetype(preferences.preferredArchetype || 'balanced_guide'),
        modulation: {
          stability: 0.8,
          similarity: 0.8,
          style: 0.2,
          speakerBoost: true
        },
        elementalResonance: preferences.elementalResonance || 'aether',
        sacredMirrorMode: 'adaptive'
      };

      // Store the new profile
      await this.storeVoiceProfile(userId, defaultProfile);
      return defaultProfile;

    } catch (error) {
      logger.error('Failed to get/create voice profile', { error, userId });
      // Return safe default
      return {
        archeType: 'balanced_guide',
        voiceId: 'default_voice',
        modulation: { stability: 0.8, similarity: 0.8, style: 0.2, speakerBoost: true },
        elementalResonance: 'aether',
        sacredMirrorMode: 'adaptive'
      };
    }
  }

  private async storeVoiceProfile(userId: string, profile: VoiceProfile): Promise<void> {
    try {
      await SoulMemoryClient.storeBookmark({
        userId,
        content: 'Voice profile configuration',
        context: {
          voiceProfile: profile,
          memoryType: 'voice_profile',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Failed to store voice profile', { error, userId });
    }
  }

  private async getMicropsiModulation(input: VoiceInput, profile: VoiceProfile): Promise<any> {
    try {
      // Import MicroPsi system
      const { micropsiBach } = await import('@/lib/psi/micropsiBach');
      
      return micropsiBach({
        emotionalTone: input.audioMetadata?.emotionalTone,
        energyLevel: input.audioMetadata?.energyLevel,
        archeType: profile.archeType,
        elementalResonance: profile.elementalResonance
      });
    } catch (error) {
      logger.warn('MicroPsi modulation failed', { error });
      return null;
    }
  }

  private async synthesizeVoice(text: string, profile: VoiceProfile, micropsiModulation?: any): Promise<string | undefined> {
    try {
      // Import voice service
      const { generateVoice } = await import('@/backend/src/utils/voiceService');
      
      const voiceParams = {
        voiceId: profile.voiceId,
        text,
        stability: profile.modulation.stability,
        similarity: profile.modulation.similarity,
        style: profile.modulation.style,
        speakerBoost: profile.modulation.speakerBoost,
        micropsiModulation
      };

      return await generateVoice(voiceParams);
    } catch (error) {
      logger.error('Voice synthesis failed', { error, profile: profile.archeType });
      return undefined;
    }
  }

  private async storeVoiceMemory(data: {
    input: VoiceInput;
    output: MayaResult;
    session: VoiceSessionContext;
    confidence: number;
  }): Promise<boolean> {
    try {
      await SoulMemoryClient.storeBookmark({
        userId: data.session.userId,
        content: data.output.finalResponse,
        context: {
          conversationId: data.session.conversationId,
          sessionId: data.session.sessionId,
          userInput: data.input.text,
          voiceProfile: data.session.voiceProfile,
          confidence: data.confidence,
          audioMetadata: data.input.audioMetadata,
          mayaProcessing: {
            greetingApplied: data.output.greetingApplied,
            validationResult: data.output.validationResult
          },
          memoryType: 'voice_conversation',
          timestamp: new Date().toISOString()
        }
      });
      return true;
    } catch (error) {
      logger.error('Failed to store voice memory', { error });
      return false;
    }
  }

  private initializeVoiceProfiles(): void {
    // Initialize archetypal voice profiles
    this.voiceProfiles.set('balanced_guide', {
      archeType: 'balanced_guide',
      voiceId: 'balanced_guide_voice',
      modulation: { stability: 0.8, similarity: 0.8, style: 0.2, speakerBoost: true },
      elementalResonance: 'aether',
      sacredMirrorMode: 'adaptive'
    });
    // Add more profiles as needed
  }

  private getVoiceIdForArchetype(archetype: string): string {
    const voiceMapping: Record<string, string> = {
      'balanced_guide': 'balanced_guide_voice',
      'wise_elder': 'wise_elder_voice',
      'compassionate_friend': 'compassionate_friend_voice',
      'mystic_teacher': 'mystic_teacher_voice'
    };
    return voiceMapping[archetype] || 'balanced_guide_voice';
  }

  private detectSacredMirrorActivation(mayaResult: MayaResult): boolean {
    return mayaResult.finalResponse.includes('Sacred Mirror') ||
           mayaResult.finalResponse.includes('shadow') ||
           mayaResult.finalResponse.includes('integration');
  }
}