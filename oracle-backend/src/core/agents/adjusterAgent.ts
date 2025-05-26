import { OracleAgent } from "./oracleAgent";
import { getRelevantMemories, storeMemoryItem } from "../../services/memoryService";
import { logOracleInsight } from "../../utils/oracleLogger";
import { detectFacetFromInput } from "../../utils/facetUtil";
import { runShadowWork } from "../../modules/shadowWorkModule";
import { AdjusterAgent } from "./adjusterAgent";
import { FireAgent } from "./fireAgent";
import { WaterAgent } from "./waterAgent";
import { EarthAgent } from "./earthAgent";
import { AirAgent } from "./airAgent";
import { AetherAgent } from "./aetherAgent";
import { GuideAgent } from "./guideAgent";
import { MentorAgent } from "./mentorAgent";
import { DreamAgent } from "./dreamAgent";
import { RelationshipAgent } from "./relationshipAgent";
import { feedbackPrompts } from "../../constants/feedbackPrompts";
import logger from "../../utils/logger";
import type { AIResponse } from "../../types/ai";

export class PersonalOracleAgent extends OracleAgent {
  private adjuster = new AdjusterAgent();
  private fire = new FireAgent();
  private water = new WaterAgent();
  private earth = new EarthAgent();
  private air = new AirAgent();
  private aether = new AetherAgent();
  private guide = new GuideAgent();
  private mentor = new MentorAgent();
  private dream = new DreamAgent();
  private relationship = new RelationshipAgent();

  constructor() {
    super({ debug: false });
  }

  public async processQuery(query: { input: string; userId: string }): Promise<AIResponse> {
    const { input, userId } = query;

    logger.info("🔮 PersonalOracleAgent activated", { userId });

    const memories = await getRelevantMemories(userId, 5);
    const lower = input.toLowerCase();

    // 1️⃣ Symbolic cue routing
    if (lower.includes("dream")) {
      return await this.wrapAgent(this.dream, query, memories);
    }

    if (["coach", "mentor", "goal", "plan"].some(k => lower.includes(k))) {
      return await this.wrapAgent(this.mentor, query, memories);
    }

    if (["relationship", "partner", "conflict"].some(k => lower.includes(k))) {
      return await this.wrapAgent(this.relationship, query, memories);
    }

    if (["guidance", "support", "direction"].some(k => lower.includes(k))) {
      return await this.wrapAgent(this.guide, query, memories);
    }

    if (["rupture", "disruption", "realign", "fracture"].some(k => lower.includes(k))) {
      return await this.wrapAgent(this.adjuster, query, memories);
    }

    // 2️⃣ Shadow work
    const shadow = await runShadowWork(input, userId);
    if (shadow) return { ...shadow, feedbackPrompt: feedbackPrompts.shadow };

    // 3️⃣ Elemental routing fallback
    const scores = scoreQuery(input);
    let best = "aether";
    for (const [k, v] of Object.entries(scores)) {
      if (v > scores[best]) best = k;
    }

    const agent = {
      fire: this.fire,
      water: this.water,
      earth: this.earth,
      air: this.air,
      aether: this.aether,
    }[best];

    return await this.wrapAgent(agent, query, memories);
  }

  private async wrapAgent(agent: OracleAgent, query: { input: string; userId: string }, context: any[]): Promise<AIResponse> {
    const response = await agent.processQuery(query);
    const facet = await detectFacetFromInput(query.input);

    response.metadata = {
      ...response.metadata,
      facet,
      provider: agent.constructor.name,
    };

    response.feedbackPrompt ??= feedbackPrompts.elemental;

    await storeMemoryItem({
      clientId: query.userId,
      content: response.content,
      element: response.metadata?.element || "aether",
      sourceAgent: response.provider,
      confidence: response.confidence ?? 0.9,
      metadata: { role: "oracle", ...response.metadata },
    });

    await logOracleInsight({
      anon_id: query.userId,
      archetype: response.metadata?.archetype || "Oracle",
      element: response.metadata?.element || "aether",
      insight: {
        message: response.content,
        raw_input: query.input,
      },
      emotion: response.confidence ?? 0.9,
      phase: response.metadata?.phase || "guidance",
      context,
    });

    return response;
  }
}

export const personalOracle = new PersonalOracleAgent();
