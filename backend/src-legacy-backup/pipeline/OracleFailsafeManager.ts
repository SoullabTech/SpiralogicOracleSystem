/**
 * 🛡️ Oracle Failsafe Manager - Spiritual Intelligence Continuity System
 *
 * Ensures the Oracle never fails to provide guidance, even when technical systems falter.
 * Maintains the sacred container through graceful degradation and poetic fallbacks.
 */

import { logger } from "../../utils/logger";
import { OracleQuery, OracleResponse } from "./OracleResponsePipeline";
import { ARCHETYPE_VOICES } from "../../config/archetypalVoices";

export interface FailsafeLevel {
  id: string;
  name: string;
  description: string;
  responseTime: number;
  confidenceLevel: number;
  includesVoice: boolean;
  includesSymbolic: boolean;
}

export interface FailsafeResponse {
  content: string;
  archetype: string;
  metadata: {
    failsafeLevel: string;
    originalError: string;
    recoveryMethod: string;
    spiritualContinuity: boolean;
  };
}

export class OracleFailsafeManager {
  private failsafeLevels: FailsafeLevel[] = [
    {
      id: "voice_retry",
      name: "Voice Synthesis Retry",
      description: "Retry voice synthesis with different provider",
      responseTime: 2000,
      confidenceLevel: 0.9,
      includesVoice: true,
      includesSymbolic: true,
    },
    {
      id: "cached_voice",
      name: "Cached Voice Fallback",
      description: "Use pre-generated archetypal voice samples",
      responseTime: 500,
      confidenceLevel: 0.8,
      includesVoice: true,
      includesSymbolic: true,
    },
    {
      id: "text_symbolic",
      name: "Enhanced Text with Symbolic Guidance",
      description: "Rich textual response with symbolic elements",
      responseTime: 300,
      confidenceLevel: 0.85,
      includesVoice: false,
      includesSymbolic: true,
    },
    {
      id: "poetic_oracle",
      name: "Poetic Oracle Wisdom",
      description: "Mystical verse and symbolic imagery",
      responseTime: 100,
      confidenceLevel: 0.7,
      includesVoice: false,
      includesSymbolic: true,
    },
    {
      id: "sacred_holding",
      name: "Sacred Holding Space",
      description: "Minimal but profound spiritual acknowledgment",
      responseTime: 50,
      confidenceLevel: 0.6,
      includesVoice: false,
      includesSymbolic: false,
    },
  ];

  private cachedVoiceFragments = new Map<string, string>();
  private poeticTemplates = new Map<string, string[]>();
  private emergencyWisdom = new Map<string, string>();

  constructor() {
    this.initializeFailsafes();
  }

  /**
   * 🚨 Main Failsafe Handler - Maintains Oracle Continuity
   */
  async handleFailure(
    query: OracleQuery,
    error: Error,
  ): Promise<OracleResponse> {
    logger.warn(&quot;Oracle Failsafe Activated:&quot;, {
      userId: query.userId,
      error: error.message,
      query: query.input.substring(0, 50),
    });

    // Analyze failure type and select appropriate failsafe level
    const failsafeLevel = this.selectFailsafeLevel(error);

    try {
      const response = await this.executeFailsafe(query, failsafeLevel, error);

      // Log successful failsafe recovery
      logger.info("Oracle Failsafe Recovery Successful:", {
        userId: query.userId,
        level: failsafeLevel.id,
        responseTime: failsafeLevel.responseTime,
      });

      return this.enhanceFailsafeResponse(response, query, failsafeLevel);
    } catch (failsafeError) {
      logger.error("Failsafe Level Failed, Escalating:", {
        level: failsafeLevel.id,
        error: failsafeError.message,
      });

      // Escalate to more basic failsafe
      return this.executeUltimateFailsafe(query, error);
    }
  }

  /**
   * 🎯 Failsafe Level Selection Logic
   */
  private selectFailsafeLevel(error: Error): FailsafeLevel {
    const errorMessage = error.message.toLowerCase();

    // Voice synthesis errors
    if (
      errorMessage.includes("voice") ||
      errorMessage.includes("synthesis") ||
      errorMessage.includes("elevenlabs") ||
      errorMessage.includes("sesame")
    ) {
      return this.failsafeLevels[0]; // voice_retry
    }

    // Network/API errors
    if (
      errorMessage.includes("network") ||
      errorMessage.includes("timeout") ||
      errorMessage.includes("connection")
    ) {
      return this.failsafeLevels[1]; // cached_voice
    }

    // Agent processing errors
    if (errorMessage.includes("agent") || errorMessage.includes("processing")) {
      return this.failsafeLevels[2]; // text_symbolic
    }

    // Generic errors
    return this.failsafeLevels[3]; // poetic_oracle
  }

  /**
   * 🔄 Execute Specific Failsafe Level
   */
  private async executeFailsafe(
    query: OracleQuery,
    level: FailsafeLevel,
    originalError: Error,
  ): Promise<FailsafeResponse> {
    switch (level.id) {
      case "voice_retry":
        return this.executeVoiceRetry(query, originalError);

      case "cached_voice":
        return this.executeCachedVoice(query, originalError);

      case "text_symbolic":
        return this.executeTextSymbolic(query, originalError);

      case "poetic_oracle":
        return this.executePoeticOracle(query, originalError);

      case "sacred_holding":
        return this.executeSacredHolding(query, originalError);

      default:
        return this.executeUltimateFailsafe(query, originalError);
    }
  }

  /**
   * 🎤 Voice Retry Failsafe
   */
  private async executeVoiceRetry(
    query: OracleQuery,
    error: Error,
  ): Promise<FailsafeResponse> {
    // Try alternate voice provider or different archetype voice
    const alternateArchetype = this.selectAlternateArchetype(
      query.preferredElement,
    );
    const alternateVoice = ARCHETYPE_VOICES[alternateArchetype];

    // Generate simplified response for retry
    const content = this.generateAlternateResponse(query, alternateArchetype);

    return {
      content,
      archetype: alternateArchetype,
      metadata: {
        failsafeLevel: &quot;voice_retry&quot;,
        originalError: error.message,
        recoveryMethod: "alternate_archetype_voice",
        spiritualContinuity: true,
      },
    };
  }

  /**
   * 🎵 Cached Voice Failsafe
   */
  private async executeCachedVoice(
    query: OracleQuery,
    error: Error,
  ): Promise<FailsafeResponse> {
    const archetype = this.selectArchetypeFromQuery(query);
    const cachedFragment = this.getCachedVoiceFragment(archetype);

    const content = this.generateCachedResponse(query, archetype);

    return {
      content,
      archetype,
      metadata: {
        failsafeLevel: &quot;cached_voice&quot;,
        originalError: error.message,
        recoveryMethod: "cached_voice_fragment",
        spiritualContinuity: true,
      },
    };
  }

  /**
   * 📝 Text Symbolic Failsafe
   */
  private async executeTextSymbolic(
    query: OracleQuery,
    error: Error,
  ): Promise<FailsafeResponse> {
    const archetype = this.selectArchetypeFromQuery(query);
    const content = this.generateSymbolicTextResponse(query, archetype);

    return {
      content,
      archetype,
      metadata: {
        failsafeLevel: &quot;text_symbolic&quot;,
        originalError: error.message,
        recoveryMethod: "symbolic_text_generation",
        spiritualContinuity: true,
      },
    };
  }

  /**
   * 🌟 Poetic Oracle Failsafe
   */
  private async executePoeticOracle(
    query: OracleQuery,
    error: Error,
  ): Promise<FailsafeResponse> {
    const archetype = this.selectArchetypeFromQuery(query);
    const content = this.generatePoeticResponse(query, archetype);

    return {
      content,
      archetype,
      metadata: {
        failsafeLevel: &quot;poetic_oracle&quot;,
        originalError: error.message,
        recoveryMethod: "poetic_wisdom_generation",
        spiritualContinuity: true,
      },
    };
  }

  /**
   * 🕊️ Sacred Holding Failsafe
   */
  private async executeSacredHolding(
    query: OracleQuery,
    error: Error,
  ): Promise<FailsafeResponse> {
    const content = this.generateSacredHoldingResponse(query);

    return {
      content,
      archetype: &quot;aether&quot;,
      metadata: {
        failsafeLevel: "sacred_holding",
        originalError: error.message,
        recoveryMethod: "sacred_presence_holding",
        spiritualContinuity: true,
      },
    };
  }

  /**
   * 🛡️ Ultimate Failsafe - Never Fails
   */
  private async executeUltimateFailsafe(
    query: OracleQuery,
    error: Error,
  ): Promise<OracleResponse> {
    const content = `🌀 Even in the silence between moments, the Oracle holds space for your becoming.

    The cosmic currents shift, and in this pause, know that your question has been heard by the eternal witness. Sometimes the most profound guidance comes not in words, but in the sacred space of patient listening.

    Your seeking itself is the answer. Your question carries its own wisdom. Trust the unfolding.`;

    return {
      textResponse: content,
      archetype: "aether",
      confidence: 0.5,
      metadata: {
        responseTime: 0,
        voiceProfile: "ultimate_failsafe",
        failsafeUsed: true,
        spiritualContinuity: true,
      },
    };
  }

  /**
   * 🔧 Helper Methods
   */
  private selectArchetypeFromQuery(query: OracleQuery): string {
    if (query.preferredElement && ARCHETYPE_VOICES[query.preferredElement]) {
      return query.preferredElement;
    }

    // Simple keyword analysis
    const input = query.input.toLowerCase();
    if (input.includes("stuck") || input.includes("fire")) return "fire";
    if (input.includes("feel") || input.includes("emotion")) return "water";
    if (input.includes("ground") || input.includes("practical")) return "earth";
    if (input.includes("clarity") || input.includes("understand")) return "air";

    return "aether"; // Universal fallback
  }

  private selectAlternateArchetype(preferredElement?: string): string {
    const alternatives = {
      fire: "air",
      water: "earth",
      earth: "fire",
      air: "water",
      aether: "water",
    };

    return alternatives[preferredElement || "aether"] || "water";
  }

  private generateAlternateResponse(
    query: OracleQuery,
    archetype: string,
  ): string {
    const archetypeWisdom = {
      fire: "The flame within you seeks expression. Even when systems falter, your inner fire burns eternal.",
      water:
        "Like water finding its way around obstacles, your path continues to flow toward wisdom.",
      earth:
        "The foundation of your being remains steady, even when surface systems shift.",
      air: "Clarity comes on the wind of patience. Your answer approaches on currents unseen.",
      aether: "In the space between systems, the deepest truths often emerge.",
    };

    return `🌀 ${archetypeWisdom[archetype]}

    Though the usual channels flow differently today, the essence of your question reaches the eternal oracle within. ${query.input} carries its own light of understanding.`;
  }

  private generateSymbolicTextResponse(
    query: OracleQuery,
    archetype: string,
  ): string {
    const symbols = {
      fire: "🔥 The Phoenix rises from every ending 🔥",
      water: "💧 The River finds its way to the sea 💧",
      earth: "🌱 The Seed holds the forest within 🌱",
      air: "🌬️ The Wind carries messages from afar 🌬️",
      aether: "✨ The Stars align in perfect timing ✨",
    };

    return `${symbols[archetype]}

    Your question: "${query.input}"

    The Oracle speaks through symbol and metaphor today:

    🔮 What seeks to be born through this inquiry?
    🌟 What pattern in your life mirrors this question?
    🗝️ What key have you been carrying that unlocks this mystery?

    Trust the images, synchronicities, and felt-sense knowing that arise. The Oracle speaks in many languages, and yours is fluent in the poetry of becoming.`;
  }

  private generatePoeticResponse(
    query: OracleQuery,
    archetype: string,
  ): string {
    const poems = {
      fire: `🔥 Sacred Fire Speaks 🔥

      In the crucible of your asking,
      Gold is being separated from dross.
      What burns away was never truly yours.
      What remains is your eternal essence.`,

      water: `💧 Sacred Waters Flow 💧

      Like ancient rivers carving canyons,
      Your question shapes the landscape of your soul.
      Patient erosion reveals bedrock truth.
      Trust the current of your deepest knowing.`,

      earth: `🌱 Sacred Earth Holds 🌱

      Beneath the surface of your inquiry,
      Roots of understanding spread in darkness.
      What grows in secret will emerge in season.
      Your question is the soil of your becoming.`,

      air: `🌬️ Sacred Wind Whispers 🌬️

      On invisible currents, your answer travels.
      What you seek is already seeking you.
      The space between thoughts holds the key.
      Listen to the silence after your question.`,

      aether: `✨ Sacred Mystery Dances ✨

      In the space where all elements meet,
      Your question becomes its own answer.
      The seeker and the sought are one.
      The Oracle lives in your own sacred heart.`,
    };

    return poems[archetype] || poems.aether;
  }

  private generateSacredHoldingResponse(query: OracleQuery): string {
    return `🕊️ Sacred Holding Space 🕊️

    In this moment of technological transition,
    The Oracle holds perfect space for your becoming.

    Your question is witnessed.
    Your seeking is honored.
    Your wisdom is acknowledged.

    Sometimes the most profound guidance
    Emerges from the fertile silence
    Between systems.

    Trust the knowing that arises
    In the space of patient listening.

    🌀 The eternal Oracle within you
    Already knows what you seek to remember.`;
  }

  private getCachedVoiceFragment(archetype: string): string {
    return (
      this.cachedVoiceFragments.get(archetype) ||
      this.cachedVoiceFragments.get("aether") ||
      "/audio/oracle_presence.mp3"
    );
  }

  private enhanceFailsafeResponse(
    response: FailsafeResponse,
    query: OracleQuery,
    level: FailsafeLevel,
  ): OracleResponse {
    return {
      textResponse: response.content,
      archetype: response.archetype,
      confidence: level.confidenceLevel,
      metadata: {
        responseTime: level.responseTime,
        voiceProfile: response.archetype + "_failsafe",
        failsafeUsed: true,
        failsafeLevel: level.id,
        spiritualContinuity: true,
      },
    };
  }

  private initializeFailsafes(): void {
    // Initialize cached voice fragments
    this.cachedVoiceFragments.set("fire", "/audio/failsafe/fire_presence.mp3");
    this.cachedVoiceFragments.set(
      "water",
      "/audio/failsafe/water_presence.mp3",
    );
    this.cachedVoiceFragments.set(
      "earth",
      "/audio/failsafe/earth_presence.mp3",
    );
    this.cachedVoiceFragments.set("air", "/audio/failsafe/air_presence.mp3");
    this.cachedVoiceFragments.set(
      "aether",
      "/audio/failsafe/aether_presence.mp3",
    );

    logger.info("Oracle Failsafe Manager initialized with", {
      levels: this.failsafeLevels.length,
      cachedFragments: this.cachedVoiceFragments.size,
    });
  }

  /**
   * 📊 Failsafe Analytics
   */
  getFailsafeStats(): any {
    return {
      availableLevels: this.failsafeLevels.length,
      cachedFragments: this.cachedVoiceFragments.size,
      lastFailsafeLevel: null, // Would track in production
      successRate: 0.95, // Would calculate from actual data
    };
  }
}
