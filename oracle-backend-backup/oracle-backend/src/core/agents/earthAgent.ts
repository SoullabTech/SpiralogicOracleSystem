// src/core/agents/earthAgent.ts

"use strict";

import { OracleAgent } from "./oracleAgent";
import { logOracleInsight } from "../../utils/oracleLogger";
import { getRelevantMemories, storeMemoryItem } from "../../services/memoryService";
import ModelService from "../../utils/modelService";
import type { AIResponse } from "../../types/ai";

/**
 * EarthAgent: Embodies grounded stability, practicality, and nurturing wisdom.
 */
export class EarthAgent extends OracleAgent {
  constructor() {
    super({ debug: false });
  }

  public async processQuery(query: { input: string; userId: string }): Promise<AIResponse> {
    const { input, userId } = query;

    // 1️⃣ Get context from memory
    const contextMemory = await getRelevantMemories(userId, 3);

    const contextHeader = contextMemory.length
      ? `⟳ Footprints of grounded thought:\n${contextMemory.map(e => `- ${e.response || e.content}`).join("\n")}\n\n`
      : "";

    // 2️⃣ Augment input with context
    const augmentedInput = `${contextHeader}${input}`;
    const baseResponse = await ModelService.getResponse({ ...query, input: augmentedInput });

    const content = `${baseResponse.response}\n\n🌱 Root your path in presence and let wisdom grow from the soil of experience.`;

    // 3️⃣ Store enhanced memory
    await storeMemoryItem({
      clientId: userId,
      content,
      element: "earth",
      sourceAgent: "earth-agent",
      confidence: 0.89,
      metadata: {
        role: "oracle",
        phase: "earth",
        archetype: "Earth",
      },
    });

    // 4️⃣ Log insight
    await logOracleInsight({
      anon_id: userId,
      archetype: "Earth",
      element: "earth",
      insight: {
        message: content,
        raw_input: input,
      },
      emotion: baseResponse.metadata?.emotion_score ?? 0.89,
      phase: baseResponse.metadata?.phase || "earth",
      context: contextMemory,
    });

    // 5️⃣ Return response in unified format
    return {
      content,
      provider: "earth-agent",
      model: baseResponse.model || "gpt-4",
      confidence: baseResponse.confidence ?? 0.89,
      metadata: {
        element: "earth",
        phase: "earth",
        archetype: "Earth",
        reflections: [],
        symbols: [],
      },
    };
  }
}
