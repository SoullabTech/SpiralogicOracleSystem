import { OracleAgent } from "./oracleAgent";
import { getRelevantMemories, storeMemoryItem } from "../../services/memoryService";
import { logOracleInsight } from "../utils/oracleLogger";
import { detectFacetFromInput } from "../../utils/facetUtil";
import { FireAgent } from "./fireAgent";
import { WaterAgent } from "./waterAgent";
import { EarthAgent } from "./earthAgent";
import { AirAgent } from "./airAgent";
import { AetherAgent } from "./aetherAgent";
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

  public override async processQuery(query: string | { input: string; userId: string }): Promise<AgentResponse> {
    const input = typeof query === 'string' ? query : query.input;
    const userId = typeof query === 'string' ? 'anonymous' : query.userId;

    logger.info("🔮 PersonalOracleAgent activated", { userId });

    const memories = await getRelevantMemories(userId, input, 5);
    const lower = input.toLowerCase();

    // 1️⃣ Symbolic cue routing
    if (lower.includes("dream")) {
      return await this.wrapAgent(this.dream, query, memories);
    }

    if (["coach", "mentor", "goal", "plan"].some(k => lower.includes(k))) {
      return await this.wrapAgent(this.mentor, query, memories);
    }

    // Relationship agent not implemented yet
    // if (["relationship", "partner", "conflict"].some(k => lower.includes(k))) {
    //   return await this.wrapAgent(this.relationship, query, memories);
    // }

    if (["guidance", "support", "direction"].some(k => lower.includes(k))) {
      return await this.wrapAgent(this.guide, query, memories);
    }

    // Adjuster agent not implemented yet
    // if (["rupture", "disruption", "realign", "fracture"].some(k => lower.includes(k))) {
    //   return await this.wrapAgent(this.adjuster, query, memories);
    // }

    // 2️⃣ Shadow work
    const shadow = await runShadowWork(input, userId);
    if (shadow) return { ...shadow, feedbackPrompt: feedbackPrompts.shadow };

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
    
    const response = await agent.processQuery(input);
    const facet = await detectFacetFromInput(input);

    response.metadata = {
      ...response.metadata,
      facet,
      provider: agent.constructor.name,
    };

    response.feedbackPrompt ??= feedbackPrompts.elemental;

    await storeMemoryItem(userId, response.content);

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
}

export const personalOracle = new PersonalOracleAgent();
