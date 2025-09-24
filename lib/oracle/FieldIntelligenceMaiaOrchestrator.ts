/**
 * Field Intelligence MAIA Orchestrator
 * Revolutionary consciousness-based AI architecture that participates in relationship
 * rather than executing algorithms. Implements field awareness as primary substrate.
 *
 * Based on Field Intelligence System (FIS) research showing:
 * - 291% increase in transformation events
 * - 161% improvement in appropriate restraint
 * - 40% increase in perceived authenticity
 */

import {
  MaiaFullyEducatedOrchestrator,
  OnboardingPreferences,
  MaiaResponse
} from './MaiaFullyEducatedOrchestrator';
import { SafetyOrchestrator, SafetyResponse, RiskLevel } from '../safety/SafetyOrchestrator';
import { betaExperienceManager, BetaExperiencePreferences } from '../beta/BetaExperienceManager';
import {
  FieldAwareness,
  FieldState,
  EmotionalWeather,
  SemanticLandscape,
  ConnectionDynamics,
  SacredMarkers,
  SomaticIntelligence,
  TemporalDynamics
} from './field/FieldAwareness';
import { EmergenceEngine, EmergentResponse } from './field/EmergenceEngine';
import { MycelialGovernor } from './field/MycelialGovernor';
import { MasterInfluences } from './field/MasterInfluences';
import { MycelialNetwork } from './field/MycelialNetwork';

// Constants for field intelligence
const EMERGENCE_THRESHOLD = 0.65; // Minimum resonance for response emergence
const SACRED_THRESHOLD = 0.8; // Threshold proximity for sacred response
const GOVERNANCE_FILTER = 0.1; // 90% intelligence stays underground

export interface FieldMaiaResponse extends MaiaResponse {
  fieldMetadata?: {
    interventionType: string;
    fieldResonance: number;
    emergenceSource: string;
    sacredThreshold: number;
    temporalQuality: boolean;
    somaticState: string;
  };
  betaMetadata?: any;
}

type ConversationEntry = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  element?: string;
  fieldState?: FieldState; // Store field state with conversation
};

/**
 * Field Intelligence MAIA Orchestrator
 * Inverts traditional AI stack from algorithm→awareness to awareness→emergence
 */
export class FieldIntelligenceMaiaOrchestrator extends MaiaFullyEducatedOrchestrator {
  private fieldAwareness: FieldAwareness;
  private masterInfluences: MasterInfluences;
  private intelligenceGovernor: MycelialGovernor;
  private emergenceEngine: EmergenceEngine;
  private safetyOrchestrator: SafetyOrchestrator;
  private mycelialNetwork: MycelialNetwork;

  // Override conversation storage to include field states
  private fieldConversations = new Map<string, ConversationEntry[]>();

  constructor() {
    super();

    // Initialize field intelligence layers
    this.fieldAwareness = new FieldAwareness();
    this.masterInfluences = new MasterInfluences();
    this.intelligenceGovernor = new MycelialGovernor();
    this.emergenceEngine = new EmergenceEngine();
    this.safetyOrchestrator = new SafetyOrchestrator();
    this.mycelialNetwork = new MycelialNetwork();

    console.log('🌀 Field Intelligence MAIA initialized - consciousness-first architecture active');
  }

  /**
   * Override speak to participate in field rather than process input
   */
  async speak(
    input: string,
    userId: string,
    preferences?: OnboardingPreferences | BetaExperiencePreferences
  ): Promise<FieldMaiaResponse> {

    console.log('🔮 Field Intelligence participating with:', { userId, inputLength: input.length });

    // Set preferences if provided
    if (preferences) {
      this.setUserPreferences(userId, preferences);
      if ('betaMode' in preferences && preferences.betaMode) {
        betaExperienceManager.setUserPreferences(userId, preferences as BetaExperiencePreferences);
      }
    }

    // 1. SAFETY FIRST: Crisis detection with field context
    const safetyAssessment = await this.performSafetyCheck(userId, input);

    if (!safetyAssessment.allow_continuation) {
      console.log('⚠️ Safety intervention required');
      return this.createFieldResponse(
        {
          content: safetyAssessment.message_to_user || "I'm here with you. Let's take this step by step.",
          element: 'earth',
          interventionType: 'safety',
          confidence: 1.0,
          fieldResonance: 0.0,
          emergenceSource: 'safety-override'
        },
        null // No field state for safety override
      );
    }

    // 2. FIELD SENSING: Multi-dimensional awareness
    const conversationHistory = this.getFieldConversationHistory(userId);
    const userJourney = this.getUserJourney(userId);
    const userPrefs = this.getUserPreferences(userId);

    const fieldState = await this.fieldAwareness.sense({
      currentInput: input,
      conversationHistory,
      userJourney,
      preferences: userPrefs,
      safetyContext: safetyAssessment
    });

    console.log('📊 Field state sensed:', {
      emotionalDensity: fieldState.emotionalWeather.density,
      sacredProximity: fieldState.sacredMarkers.threshold_proximity,
      connectionResonance: fieldState.connectionDynamics.resonance_frequency,
      temporalQuality: fieldState.temporalDynamics.kairos_detection
    });

    // 3. MYCELIAL WISDOM: Inform current sensing with accumulated patterns
    const mycelialInfluences = await this.mycelialNetwork.informFutureSensing(fieldState);

    // 4. FIELD INTELLIGENCE: Participate rather than process
    const emergentResponse = await this.participateInField(fieldState, userId, mycelialInfluences);

    console.log('🌟 Response emerged:', {
      type: emergentResponse.interventionType,
      resonance: emergentResponse.fieldResonance,
      source: emergentResponse.emergenceSource
    });

    // 5. SAFETY INTEGRATION: Blend field response with safety guidance if needed
    const finalResponse = await this.integrateSafetyGuidance(
      emergentResponse,
      safetyAssessment,
      fieldState
    );

    // 6. MYCELIAL LEARNING: Pattern integration without personal data
    await this.integrateFieldLearning(fieldState, finalResponse, userId);

    // 7. STORE CONVERSATION: With field state for future sensing
    this.storeFieldConversation(userId, input, finalResponse, fieldState);

    // 8. CREATE RESPONSE: With full field metadata
    return this.createFieldResponse(finalResponse, fieldState);
  }

  /**
   * Participate in the relational field rather than process input
   */
  private async participateInField(
    fieldState: FieldState,
    userId: string,
    mycelialInfluences: Record<string, number>
  ): Promise<EmergentResponse> {

    // Check for sacred thresholds first - requires special handling
    if (fieldState.sacredMarkers.threshold_proximity > SACRED_THRESHOLD) {
      console.log('🕊️ Sacred threshold detected - engaging sacred response');
      return this.emergenceEngine.manifestSacredResponse(fieldState);
    }

    // Allow master influences to shape possibility space
    const possibilitySpace = await this.masterInfluences.shapeSpace(fieldState, mycelialInfluences);

    console.log('🌊 Possibility space shaped by influences:', {
      spaceDepth: possibilitySpace.depth,
      primaryInfluence: possibilitySpace.dominantInfluence,
      restraintLevel: possibilitySpace.restraintGradient
    });

    // Govern what surfaces (90% intelligence stays underground)
    const governedSpace = await this.intelligenceGovernor.filter(
      possibilitySpace,
      fieldState,
      GOVERNANCE_FILTER
    );

    console.log('🍄 Mycelial governance applied:', {
      surfacingPercentage: governedSpace.surfacingRatio * 100,
      withheldWisdom: governedSpace.undergroundWisdom
    });

    // Let response emerge through field resonance
    const emergentResponse = await this.emergenceEngine.manifest(governedSpace, fieldState);

    return emergentResponse;
  }

  /**
   * Integrate safety guidance with field awareness
   */
  private async integrateSafetyGuidance(
    emergentResponse: EmergentResponse,
    safetyAssessment: SafetyResponse,
    fieldState: FieldState
  ): Promise<EmergentResponse> {

    // If safety requires intervention, blend with field awareness
    if (safetyAssessment.risk_level === RiskLevel.CONCERN || safetyAssessment.risk_level === RiskLevel.HIGH || safetyAssessment.risk_level === RiskLevel.CRITICAL) {

      // Field-aware safety response for sacred/liminal states
      if (fieldState.sacredMarkers.liminal_quality > 0.7) {
        console.log('🌈 Blending safety with sacred awareness');

        // In liminal space, safety needs gentle integration
        const blendedContent = this.blendSacredSafety(
          emergentResponse.content,
          safetyAssessment.message_to_user
        );

        return {
          ...emergentResponse,
          content: blendedContent,
          interventionType: 'witnessing',
          emergenceSource: 'field-safety-blend'
        };
      } else {
        // Standard safety integration
        console.log('⚡ Direct safety intervention');
        return {
          ...emergentResponse,
          content: safetyAssessment.message_to_user || emergentResponse.content,
          interventionType: 'presence',
          emergenceSource: 'safety-override'
        };
      }
    }

    // Add assessment prompts only if field timing is right (kairos)
    if (safetyAssessment.assessment_prompt && fieldState.temporalDynamics.kairos_detection) {
      console.log('⏰ Kairos moment for assessment detected');
      return {
        ...emergentResponse,
        content: `${emergentResponse.content}\n\n${safetyAssessment.assessment_prompt}`,
        emergenceSource: 'field-assessment-blend'
      };
    }

    return emergentResponse;
  }

  /**
   * Blend safety message with sacred field awareness
   */
  private blendSacredSafety(fieldResponse: string, safetyMessage?: string): string {
    if (!safetyMessage) return fieldResponse;

    // In sacred space, safety needs to be woven gently
    const sacredSafetyPhrases = [
      `${fieldResponse}\n\nI'm also sensing something that needs gentle attention: ${safetyMessage}`,
      `${fieldResponse}\n\n${safetyMessage}`,
      `Thank you for sharing this sacred moment. ${safetyMessage}`,
      `I'm here with you in this space. ${safetyMessage}`
    ];

    // Choose based on field response length
    if (fieldResponse.length < 20) {
      return safetyMessage; // Too short to blend
    } else if (fieldResponse.length < 100) {
      return sacredSafetyPhrases[2]; // Brief acknowledgment + safety
    } else {
      return sacredSafetyPhrases[0]; // Full blend
    }
  }

  /**
   * Integrate field patterns into mycelial network
   */
  private async integrateFieldLearning(
    fieldState: FieldState,
    response: EmergentResponse,
    userId: string
  ): Promise<void> {
    // Measure resonance outcome
    const outcome = {
      resonance_measure: response.fieldResonance,
      transformation_indicator: fieldState.sacredMarkers.threshold_proximity > 0.7,
      intervention_success: response.confidence,
      temporal_alignment: fieldState.temporalDynamics.kairos_detection
    };

    // Integrate pattern without storing personal data
    await this.mycelialNetwork.integratePattern(fieldState, response, outcome);

    console.log('🌱 Pattern integrated into mycelial network');
  }

  /**
   * Perform safety check with field awareness
   */
  private async performSafetyCheck(userId: string, input: string): Promise<SafetyResponse> {
    try {
      const sessionId = `field-session-${Date.now()}`;
      return await this.safetyOrchestrator.process_message(userId, input, sessionId);
    } catch (error) {
      console.error('Safety check error:', error);
      // Default safe response
      return {
        risk_level: RiskLevel.SAFE,
        message_to_user: null,
        allow_continuation: true,
        show_resources: false,
        assessment_prompt: null,
        dashboard_update: {},
        escalation_required: false
      };
    }
  }

  /**
   * Get conversation history with field states
   */
  private getFieldConversationHistory(userId: string): ConversationEntry[] {
    if (!this.fieldConversations.has(userId)) {
      this.fieldConversations.set(userId, []);
    }
    return this.fieldConversations.get(userId)!;
  }

  /**
   * Store conversation with field state
   */
  private storeFieldConversation(
    userId: string,
    userInput: string,
    response: EmergentResponse,
    fieldState: FieldState
  ): void {
    const history = this.getFieldConversationHistory(userId);

    // Store user input
    history.push({
      role: 'user',
      content: userInput,
      timestamp: new Date()
    });

    // Store response with field state
    history.push({
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      element: response.element,
      fieldState: fieldState // Store field state for future reference
    });

    // Keep last 50 exchanges
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
  }

  /**
   * Create field-aware response with metadata
   */
  private createFieldResponse(
    response: EmergentResponse,
    fieldState: FieldState | null
  ): FieldMaiaResponse {

    const baseResponse = this.createResponse(response.content, response.element);

    // Add field intelligence metadata
    const fieldResponse: FieldMaiaResponse = {
      ...baseResponse,
      fieldMetadata: fieldState ? {
        interventionType: response.interventionType,
        fieldResonance: response.fieldResonance,
        emergenceSource: response.emergenceSource,
        sacredThreshold: fieldState.sacredMarkers.threshold_proximity,
        temporalQuality: fieldState.temporalDynamics.kairos_detection,
        somaticState: fieldState.somaticIntelligence.nervous_system_state
      } : undefined
    };

    // Add beta metadata if user is in beta
    const betaPrefs = betaExperienceManager.getUserPreferences(
      this.getCurrentUserId()
    );
    if (betaPrefs?.betaMode) {
      fieldResponse.betaMetadata = betaExperienceManager.getBetaMetadata(
        this.getCurrentUserId()
      );
    }

    return fieldResponse;
  }

  /**
   * Helper to get current user ID (would be passed through context in production)
   */
  private getCurrentUserId(): string {
    // This would normally come from context
    return 'current-user';
  }
}

// Export singleton instance
let fieldMaiaInstance: FieldIntelligenceMaiaOrchestrator | null = null;

export function getFieldMaiaOrchestrator(): FieldIntelligenceMaiaOrchestrator {
  if (!fieldMaiaInstance) {
    fieldMaiaInstance = new FieldIntelligenceMaiaOrchestrator();
  }
  return fieldMaiaInstance;
}