"use strict";

import { OracleAgent } from "./oracleAgent";
import { logOracleInsight } from "../../utils/oracleLogger";
import * as MemoryModule from "../../utils/memoryModule";import ModelService from "../../utils/modelService";
import type { AgentResponse } from "../../types/ai";


/**
 * ShadowAgent: Engages the unconscious terrain, confronting patterns, projections, and personal myths.
 */
export class ShadowAgent extends OracleAgent {
  constructor() {
    super({ debug: false });
  }

  public async processQuery(query: { input: string; userId?: string }): Promise<AgentResponse> {
    const contextMemory = MemoryModule.getRecentEntries(5);

    const contextHeader = contextMemory.length
      ? `⟳ Echoes from your shadow:
${contextMemory.map(e => `- ${e.response}`).join("\n")}
\n`
      : "";

    const augmentedInput = `${contextHeader}${query.input}\n\nWhat unresolved patterns or projections might this reveal?`;

    const augmentedQuery = {
      ...query,
      input: augmentedInput,
    };

    const baseResponse: AgentResponse = await ModelService.getResponse(augmentedQuery);

    const personalityFlair = `\n\n🜃 In the mirror of shadow, your hidden power waits to be reclaimed.`;
    const enhancedResponse = `${baseResponse.response}${personalityFlair}`;

    MemoryModule.addEntry({
      timestamp: new Date().toISOString(),
      query: query.input,
      response: enhancedResponse,
    });

    await logOracleInsight({
      anon_id: query.userId || null,
      archetype: baseResponse.metadata?.archetype || "Shadow Walker",
      element: "Aether",
      insight: {
        message: enhancedResponse,
        raw_input: query.input,
      },
      emotion: baseResponse.metadata?.emotion_score ?? 0.92,
      phase: baseResponse.metadata?.phase || "Shadow Phase",
      context: contextMemory,
    });

    return {
      ...baseResponse,
      response: enhancedResponse,
      confidence: baseResponse.confidence ?? 0.92,
      routingPath: [...(baseResponse.routingPath || []), "shadow-agent"],
    };
  }
}
