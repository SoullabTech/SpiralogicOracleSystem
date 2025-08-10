import { OracleAgent } from "./oracleAgent";
import { getRelevantMemories, storeMemoryItem } from "../../services/memoryService";
import { logOracleInsight } from "../utils/oracleLogger";
import { detectFacetFromInput } from "../../utils/facetUtil";
import { FireAgent } from "./elemental/fireAgent";
import { WaterAgent } from "./elemental/waterAgent";
import { EarthAgent } from "./elemental/earthAgent";
import { AirAgent } from "./elemental/airAgent";
import { AetherAgent } from "./elemental/aetherAgent";
import { GuideAgent } from "./guideAgent";
import { MentorAgent } from "./mentorAgent";
import { DreamAgent } from "./DreamAgent";
import { feedbackPrompts } from "../../constants/feedbackPrompts";
import { logger } from "../../utils/logger";
import { runShadowWork } from "../../modules/shadowWorkModule";
import type { AIResponse } from "../../types/ai";

type AgentResponse = AIResponse; // Use AIResponse as AgentResponse

// Simple query scoring function
function scoreQuery(input: string): Record<string, number> {
  const lower = input.toLowerCase();
  return {
    fire: lower.includes("passion") || lower.includes("energy") || lower.includes("action") ? 1 : 0,
    water: lower.includes("emotion") || lower.includes("feeling") || lower.includes("flow") ? 1 : 0,
    earth: lower.includes("ground") || lower.includes("practical") || lower.includes("stable") ? 1 : 0,
    air: lower.includes("think") || lower.includes("idea") || lower.includes("communicate") ? 1 : 0,
    aether: 0.5 // default baseline
  };
}

export class PersonalOracleAgent extends OracleAgent {
  private fire = new FireAgent();
  private water = new WaterAgent();
  private earth = new EarthAgent();
  private air = new AirAgent();
  private aether = new AetherAgent();
  private guide = new GuideAgent();
  private mentor = new MentorAgent();
  private dream = new DreamAgent();

  constructor() {
    super({ debug: false });
  }

  // Add missing methods referenced in services
  public async process(query: any): Promise<any> {
    return this.processQuery(query);
  }

  public async processMessage(message: string, userId: string): Promise<any> {
    return this.processQuery({ input: message, userId });
  }

  public async getTransformationMetrics(userId: string): Promise<any> {
    return {
      metricsAvailable: false,
      message: "Transformation metrics not yet implemented"
    };
  }

  public async activateRetreatMode(userId: string, options?: any): Promise<any> {
    return {
      retreatModeActive: false,
      message: "Retreat mode not yet implemented"
    };
  }

  public async offerWeeklyReflection(userId: string, weekData?: any): Promise<any> {
    return {
      reflectionOffered: false,
      message: "Weekly reflection not yet implemented"
    };
  }

  public override async processQuery(query: string | { input: string; userId: string }): Promise<AgentResponse> {
    const input = typeof query === 'string' ? query : query.input;
    const userId = typeof query === 'string' ? 'anonymous' : query.userId;

    logger.info("🔮 PersonalOracleAgent activated", { userId });

    const memories = await getRelevantMemories(userId, input, 5);
    const lower = input.toLowerCase();

    // 1️⃣ Symbolic cue routing
    if (lower.includes("dream")) {
      return await this.wrapSpecialAgent(this.dream, { input, userId }, memories);
    }

    if (["coach", "mentor", "goal", "plan"].some(k => lower.includes(k))) {
      return await this.wrapSpecialAgent(this.mentor, { input, userId }, memories);
    }

    // Relationship agent not implemented yet
    // if (["relationship", "partner", "conflict"].some(k => lower.includes(k))) {
    //   return await this.wrapAgent(this.relationship, query, memories);
    // }

    if (["guidance", "support", "direction"].some(k => lower.includes(k))) {
      return await this.wrapSpecialAgent(this.guide, { input, userId }, memories);
    }

    // Adjuster agent not implemented yet
    // if (["rupture", "disruption", "realign", "fracture"].some(k => lower.includes(k))) {
    //   return await this.wrapAgent(this.adjuster, query, memories);
    // }

    // 2️⃣ Shadow work
    const shadow = await runShadowWork(input, userId);
    if (shadow) {
      return {
        content: shadow.content || 'Shadow work insight provided',
        provider: 'shadow-agent' as any,
        model: 'shadow-work-v1',
        confidence: 0.8,
        metadata: { 
          ...shadow.metadata, 
          feedbackPrompt: feedbackPrompts.shadow 
        }
      };
    }

    // 3️⃣ Elemental routing fallback
    const scores = scoreQuery(input);
    let best = "aether";
    for (const [k, v] of Object.entries(scores)) {
      if (v > scores[best]!) best = k;
    }

    const agent = {
      fire: this.fire,
      water: this.water,
      earth: this.earth,
      air: this.air,
      aether: this.aether,
    }[best];

    if (!agent) {
      throw new Error(`No agent found for element: ${best}`);
    }

    return await this.wrapAgent(agent, query, memories);
  }

  private async wrapAgent(agent: OracleAgent, query: string | { input: string; userId: string }, context: any[]): Promise<AgentResponse> {
    const input = typeof query === 'string' ? query : query.input;
    const userId = typeof query === 'string' ? 'anonymous' : query.userId;

    // Handle different agent query signatures
    let response: AgentResponse;
    if ('processExtendedQuery' in agent && typeof (agent as any).processExtendedQuery === 'function') {
      // For ArchetypeAgent-based agents that expect extended queries
      const aiResponse = await (agent as any).processExtendedQuery({ input, userId });
      response = {
        content: aiResponse.content,
        response: aiResponse.content,
        confidence: aiResponse.confidence,
        metadata: aiResponse.metadata,
        provider: aiResponse.provider,
        model: aiResponse.model
      };
    } else if (agent.processQuery.length > 1 || 
               (agent as any).constructor.name === 'GuideAgent' || 
               (agent as any).constructor.name === 'MentorAgent' || 
               (agent as any).constructor.name === 'DreamAgent') {
      // For agents that expect object-style queries
      response = await (agent as any).processQuery({ input, userId });
    } else {
      // For base OracleAgent that expects string queries
      response = await agent.processQuery(input);
    }
    const facet = await detectFacetFromInput(input);

    response.metadata = {
      ...response.metadata,
      facet,
      provider: agent.constructor.name,
    };

    response.metadata = {
      ...response.metadata,
      feedbackPrompt: feedbackPrompts.elemental
    };

    await storeMemoryItem({
      userId,
      content: response.content,
      element: response.metadata?.element,
      sourceAgent: response.metadata?.provider,
      confidence: response.confidence,
      metadata: response.metadata
    });

    await logOracleInsight({
      anon_id: userId,
      archetype: response.metadata?.archetype || "Oracle",
      element: response.metadata?.element || "aether",
      insight: {
        message: response.content,
        raw_input: input,
      },
      emotion: response.confidence ?? 0.9,
      phase: response.metadata?.phase || "guidance",
      context,
    });

    return response;
  }

  // Special wrapper for agents that don't fit the OracleAgent signature
  private async wrapSpecialAgent(agent: any, query: { input: string; userId: string }, context: any[]): Promise<AgentResponse> {
    const { input, userId } = query;

    const response = await agent.processQuery(query);
    const facet = await detectFacetFromInput(input);

    // Ensure response has required fields
    const normalizedResponse: AgentResponse = {
      content: response.content || response.response || 'No response provided',
      response: response.content || response.response || 'No response provided', // Legacy compatibility
      confidence: response.confidence || 0.8,
      metadata: {
        ...response.metadata,
        facet,
        provider: agent.constructor.name,
        feedbackPrompt: feedbackPrompts.elemental
      }
    };

    await storeMemoryItem({
      userId,
      content: normalizedResponse.content,
      element: normalizedResponse.metadata?.element,
      sourceAgent: normalizedResponse.metadata?.provider,
      confidence: normalizedResponse.confidence,
      metadata: normalizedResponse.metadata
    });

    await logOracleInsight({
      anon_id: userId,
      archetype: normalizedResponse.metadata?.archetype || "Oracle",
      element: normalizedResponse.metadata?.element || "aether",
      insight: {
        message: normalizedResponse.content,
        raw_input: input,
      },
      emotion: normalizedResponse.confidence ?? 0.9,
      phase: normalizedResponse.metadata?.phase || "guidance",
      context,
    });

    return normalizedResponse;
  }
}

export const personalOracle = new PersonalOracleAgent();
