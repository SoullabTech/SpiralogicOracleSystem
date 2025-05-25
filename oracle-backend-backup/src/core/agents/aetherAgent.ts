// src/core/agents/aetherAgent.ts

"use strict";

import { OracleAgent } from "./oracleAgent";
import { logOracleInsight } from "../../utils/oracleLogger";
import { getRelevantMemories, storeMemoryItem } from "../../services/memoryService";
import ModelService from "../../utils/modelService";
import type { AIResponse } from "../../types/ai";

/**
 * AetherAgent: Embodies integration of all elements and subtle synthesis.
 */
export class AetherAgent extends OracleAgent {
  public async processQuery(query: { input: string; userId: string }): Promise<AIResponse> {
    const { input, userId } = query;

    // 1️⃣ Fetch integrative context memories
    const contextMemory = await getRelevantMemories(userId, 3);
    const contextHeader = contextMemory.length
      ? `✨ Weaving threads of past insights:\n${contextMemory.map(e => `- ${e.response || e.content}`).join("\n")}\n\n`
      : "";

    // 2️⃣ Prepare the query
    const augmentedInput = `${contextHeader}${input}`;
    const baseResponse = await ModelService.getResponse({ ...query, input: augmentedInput });
    const content = `${baseResponse.response}\n\n🌟 Let the harmonies of the elements guide your path.`;

    // 3️⃣ Persist the exchange in memory
    await storeMemoryItem({
      clientId: userId,
      content,
      element: "aether",
      sourceAgent: "aether-agent",
      confidence: baseResponse.confidence ?? 0.93,
      metadata: {
        role: "oracle",
        phase: "integration",
        archetype: "Aether",
      },
    });

    // 4️⃣ Log insight to history
    await logOracleInsight({
      anon_id: userId,
      archetype: "Aether",
      element: "aether",
      insight: {
        message: content,
        raw_input: input,
      },
      emotion: baseResponse.metadata?.emotion_score ?? 0.93,
      phase: baseResponse.metadata?.phase || "integration",
      context: contextMemory,
    });

    // 5️⃣ Return standardized AIResponse
    return {
      content,
      provider: "aether-agent",
      model: baseResponse.model || "gpt-4",
      confidence: baseResponse.confidence ?? 0.93,
      metadata: {
        element: "aether",
        phase: "integration",
        archetype: "Aether",
        reflections: [],
        symbols: [],
      },
    };
  }
}
