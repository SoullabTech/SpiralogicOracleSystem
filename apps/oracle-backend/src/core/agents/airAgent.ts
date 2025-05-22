// src/core/agents/airAgent.ts

"use strict";

import { OracleAgent } from "./oracleAgent";
import { logOracleInsight } from "../../utils/oracleLogger";
import { getRelevantMemories, storeMemoryItem } from "../../services/memoryService";
import ModelService from "../../utils/modelService";
import type { AIResponse } from "../../types/ai";

/**
 * AirAgent: Embodies intellectual clarity, higher perspective, and swift understanding.
 */
export class AirAgent extends OracleAgent {
  constructor() {
    super({ debug: false });
  }

  public async processQuery(query: { input: string; userId: string }): Promise<AIResponse> {
    const { input, userId } = query;

    // 1️⃣ Gather context memories
    const contextMemory = await getRelevantMemories(userId, 3);
    const contextHeader = contextMemory.length
      ? `⟳ Whispers on the wind:\n${contextMemory.map(e => `- ${e.response || e.content}`).join("\n")}\n\n`
      : "";

    // 2️⃣ Build augmented prompt
    const augmentedInput = `${contextHeader}${input}`;
    const baseResponse = await ModelService.getResponse({ ...query, input: augmentedInput });

    const content = `${baseResponse.response}\n\n🌬️ Let ideas soar—your thoughts shape the horizon.`;

    // 3️⃣ Store memory
    await storeMemoryItem({
      clientId: userId,
      content,
      element: "air",
      sourceAgent: "air-agent",
      confidence: baseResponse.confidence ?? 0.86,
      metadata: {
        role: "oracle",
        phase: "air",
        archetype: "Air",
      },
    });

    // 4️⃣ Log symbolic insight
    await logOracleInsight({
      anon_id: userId,
      archetype: "Air",
      element: "air",
      insight: {
        message: content,
        raw_input: input,
      },
      emotion: baseResponse.metadata?.emotion_score ?? 0.86,
      phase: baseResponse.metadata?.phase || "air",
      context: contextMemory,
    });

    // 5️⃣ Return standard AIResponse
    return {
      content,
      provider: "air-agent",
      model: baseResponse.model || "gpt-4",
      confidence: baseResponse.confidence ?? 0.86,
      metadata: {
        element: "air",
        phase: "air",
        archetype: "Air",
        reflections: [],
        symbols: [],
      },
    };
  }
}
