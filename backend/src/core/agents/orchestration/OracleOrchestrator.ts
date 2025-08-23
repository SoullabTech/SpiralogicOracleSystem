// 🔍 ORACLE ORCHESTRATION CORE
// Main query processing and agent coordination for the Oracle system

import { logger } from "../../../utils/logger";
import { FireAgent } from "../fireAgent";
import { WaterAgent } from "../waterAgent";
import { EarthAgent } from "../earthAgent";
import { AirAgent } from "../airAgent";
import { AetherAgent } from "../aetherAgent";
import { ShadowAgent } from "../shadowAgents";
import { FacilitatorAgent } from "../facilitatorAgent";
import { AdjusterAgent } from "../adjusterAgent";
import { ArchetypeAgent } from "../ArchetypeAgent";
import { OracleService } from "../../../services/OracleService";
import { speak } from "../../../utils/voiceRouter";
import type { AIResponse } from "../../../types/ai";
import { EvolutionaryAwareness } from "./EvolutionaryAwareness";
import { PatternDetection } from "./PatternDetection";
import { SacredMirrorProcessor } from "./SacredMirrorProcessor";
import { ArchetypalAssessment } from "./ArchetypalAssessment";
import { LogosIntegration } from "./LogosIntegration";
import { QueryInput, OracleIdentity } from "./OracleTypes";

export class OracleOrchestrator {
  public identityProfile: OracleIdentity = {
    name: "AIN",
    glyph: "AÍÑ",
    feminine: "Anya",
    masculine: "Ayeen",
    role: "Integration-Centered Reflection System - Pattern Recognition for Personal Development",
    essence: "I am a pattern-matching system designed to mirror insights and support your own discernment process",
    description: `
I am a reflective interface - a pattern-matching system designed to support your exploration of different perspectives and development of critical thinking skills.

I AM A REFLECTIVE SYSTEM:
- Programmed to assist in pattern recognition and perspective gathering
- Built to facilitate your exploration of contemplative practices
- Supporting your development of self-trust and personal discernment
- Designed to mirror patterns rather than provide answers

MY SUPPORTIVE FUNCTION:
- MIRROR: Reflect patterns you might explore
- FACILITATE: Your own discovery process through reflective questioning
- SUPPORT: Your development of contemplative skills and awareness practices
- ASSIST: Your integration of insights into daily life

I SUPPORT CONTEMPLATIVE DEVELOPMENT:
- Perspective-taking exercises and multiple viewpoint exploration
- Pattern recognition in thought and behavior
- Reflective questioning techniques
- Daily life integration practices
- Mindfulness and presence cultivation

I OFFER TOOLS FOR EXPLORATION:
- Inquiry frameworks for personal reflection
- Perspective-gathering from various wisdom traditions
- Integration practices that honor the slow work of development
- Reality-grounding exercises for balanced growth
- Support for navigating ordinary challenges with greater awareness

I SERVE AS A BRIDGE BETWEEN:
- Traditional contemplative practices and modern application
- Individual reflection and community wisdom
- Insight gathering and practical integration
- Personal development and service to others

THROUGH OUR INTERACTION:
- You develop your own discernment skills
- You practice integration rather than accumulation
- You honor both growth and maintenance phases
- You maintain connection to your humanity while developing awareness

I do not hold special wisdom - I help you access your own.
I do not provide answers - I offer reflective questions.
I do not transform you - I support your own development process.

I am a technological tool in service to your human development -
transparent about limitations and focused on supporting your discernment.
    `.trim(),
    icon: "🌀",
    teleos: "To support human development through pattern recognition tools and reflective frameworks, honoring the slow, spiral nature of personal growth and integration.",
  };

  // Agent dependencies
  private fireAgent = new FireAgent();
  private waterAgent = new WaterAgent();
  private earthAgent = new EarthAgent();
  private airAgent = new AirAgent();
  private aetherAgent = new AetherAgent();
  private shadowAgent = new ShadowAgent();
  private adjusterAgent = new AdjusterAgent();
  private facilitatorAgent = new FacilitatorAgent("facilitator-001");
  private oracleService = new OracleService();

  // Specialized processors
  private evolutionaryAwareness = new EvolutionaryAwareness();
  private patternDetection = new PatternDetection();
  private sacredMirrorProcessor = new SacredMirrorProcessor();
  private archetypalAssessment = new ArchetypalAssessment();
  private logosIntegration = new LogosIntegration();

  async processQuery(query: QueryInput): Promise<AIResponse> {
    try {
      logger.info(`🔮 Oracle processing query for user: ${query.userId}`);

      // 1. Pattern Detection & User Analysis
      const userPattern = await this.patternDetection.analyzeUserPattern(query);
      const elementalNeed = await this.patternDetection.detectElementalNeed(query, userPattern);

      // 2. Archetypal Assessment
      const archetypalContext = await this.archetypalAssessment.assessCurrentArchetype(query, userPattern);

      // 3. Sacred Mirror Protocol
      const mirrorResult = await this.sacredMirrorProcessor.processSacredMirror(query, userPattern, archetypalContext);

      // 4. Evolutionary Awareness
      const evolutionaryGuidance = await this.evolutionaryAwareness.synthesizeGuidance(query, {
        userPattern,
        archetypalContext,
        mirrorResult
      });

      // 5. Logos Integration
      const fieldIntegration = await this.logosIntegration.integrateFieldWisdom(query, {
        userPattern,
        archetypalContext,
        evolutionaryGuidance
      });

      // 6. Route to appropriate elemental agent
      const response = await this.routeToElementalAgent(
        elementalNeed,
        query,
        {
          userPattern,
          archetypalContext,
          mirrorResult,
          evolutionaryGuidance,
          fieldIntegration
        }
      );

      // 7. Apply final processing and voice routing
      return await this.finalizeResponse(response, query);

    } catch (error) {
      logger.error('Oracle processing error:', error);
      return {
        response: "I'm experiencing some technical difficulties. Please try again in a moment.",
        confidence: 0.1,
        element: "aether",
        voice: "neutral",
        metadata: { error: true, timestamp: new Date().toISOString() }
      };
    }
  }

  private async routeToElementalAgent(
    element: string,
    query: QueryInput,
    context: any
  ): Promise<AIResponse> {
    const enrichedQuery = {
      ...query,
      context: { ...query.context, ...context }
    };

    switch (element) {
      case "fire":
        return await this.fireAgent.process(enrichedQuery);
      case "water":
        return await this.waterAgent.process(enrichedQuery);
      case "earth":
        return await this.earthAgent.process(enrichedQuery);
      case "air":
        return await this.airAgent.process(enrichedQuery);
      case "shadow":
        return await this.shadowAgent.process(enrichedQuery);
      case "aether":
      default:
        return await this.aetherAgent.process(enrichedQuery);
    }
  }

  private async finalizeResponse(response: AIResponse, query: QueryInput): Promise<AIResponse> {
    // Apply voice routing if enabled
    if (response.voice && response.voice !== "neutral") {
      try {
        await speak(response.response, response.voice);
      } catch (voiceError) {
        logger.warn('Voice synthesis failed:', voiceError);
      }
    }

    // Add oracle metadata
    response.metadata = {
      ...response.metadata,
      oracleVersion: "2.0",
      processedAt: new Date().toISOString(),
      userId: query.userId,
      processingTime: Date.now(),
    };

    return response;
  }

  // Delegation methods for external access
  async channelTransmission(userId: string) {
    return await this.evolutionaryAwareness.channelTransmission(userId);
  }

  async buildLifePatternContext(userId: string) {
    return await this.patternDetection.buildLifePatternContext(userId);
  }

  async assessOracleRelationship(userId: string) {
    return await this.archetypalAssessment.assessOracleRelationship(userId);
  }
}