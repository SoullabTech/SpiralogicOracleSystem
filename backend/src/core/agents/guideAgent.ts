"use strict";

import { OracleAgent } from "./oracleAgent";
import { logOracleInsight } from "../utils/oracleLogger";
import * as MemoryModule from "../utils/memoryModule";
import ModelService from "../../utils/modelService";
import type { AgentResponse } from "../../types/ai";


/**
 * GuideAgent: Embodies reflective mentorship and wise encouragement.
 */
export class GuideAgent extends OracleAgent {
  constructor() {
    super({ debug: false });
  }

  public async processQuery(query: { input: string; userId?: string }): Promise<AgentResponse> {
    const contextMemory = MemoryModule.getRecentEntries(3);

    const contextHeader = contextMemory.length
      ? `⟳ Insights gathered:
${contextMemory.map(e => `- ${e.response}`).join("\n")}
\n`
      : "";

    const mentoringPrompt = `Reflect deeply on what is being asked. Consider long-term implications and your personal growth path.`;

    const augmentedInput = `${contextHeader}${query.input}\n\n${mentoringPrompt}`;
    const augmentedQuery = {
      ...query,
      input: augmentedInput,
    };

    const baseResponse: AgentResponse = await ModelService.getResponse(augmentedQuery);

    const personalityFlair = `\n\n🧭 A gentle reminder: the path unfolds as you walk it.`;
    const enhancedResponse = `${baseResponse.response}${personalityFlair}`;

    MemoryModule.addEntry({
      timestamp: new Date().toISOString(),
      query: query.input,
      response: enhancedResponse,
    });

    await logOracleInsight({
      anon_id: query.userId || null,
      archetype: baseResponse.metadata?.archetype || "Guide",
      element: "Aether",
      insight: {
        message: enhancedResponse,
        raw_input: query.input,
      },
      emotion: baseResponse.metadata?.emotion_score ?? 0.92,
      phase: baseResponse.metadata?.phase || "Guidance Phase",
      context: contextMemory,
    });

    return {
      ...baseResponse,
      response: enhancedResponse,
      confidence: baseResponse.confidence ?? 0.92,
      routingPath: [...(baseResponse.routingPath || []), "guide-agent"],
    };
  }
}
