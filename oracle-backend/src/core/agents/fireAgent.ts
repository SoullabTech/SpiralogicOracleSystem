// oracle-backend/src/core/agents/fireAgent.ts

"use strict";

import { OracleAgent } from "./oracleAgent";
import { logOracleInsight } from "../../utils/oracleLogger";
import { getRelevantMemories, storeMemoryItem } from "../../services/memoryService";
import ModelService from "../../utils/modelService";
import type { AIResponse } from "../../types/ai";

export class FireAgent extends OracleAgent {
  public async processQuery(query: {
    input: string;
    userId: string;
  }): Promise<AIResponse> {
    const { input, userId } = query;
    const contextMemory = await getRelevantMemories(userId, 3);

    const contextHeader = contextMemory.length
      ? `⟳ Sparks of recent fire:\n${contextMemory
          .map((e) => `- ${e.response || e.content || ''}`)
          .join("\n")}\n\n`
      : "";

    const augmentedInput = `${contextHeader}${input}`;
    const rawResponse = await ModelService.getResponse({ ...query, input: augmentedInput });

    const content = `${rawResponse.response}\n\n🔥 Like a blazing comet, let your vision ignite.`;

    await storeMemoryItem({
      clientId: userId,
      content,
      element: "fire",
      sourceAgent: "fire-agent",
      confidence: 0.95,
      metadata: { role: "oracle", phase: "ignition", archetype: "Fire" },
    });

    await logOracleInsight({
      anon_id: userId,
      archetype: "Fire",
      element: "fire",
      insight: { message: content, raw_input: input },
      emotion: 0.9,
      phase: "ignition",
      context: contextMemory,
    });

    const response: AIResponse = {
      content,
      provider: "fire-agent",
      model: rawResponse.model || "gpt-4",
      confidence: 0.95,
      metadata: {
        element: "fire",
        archetype: "Fire",
        phase: "ignition",
        symbols: [],
        reflections: [],
      },
    };

    return response;
  }
}
