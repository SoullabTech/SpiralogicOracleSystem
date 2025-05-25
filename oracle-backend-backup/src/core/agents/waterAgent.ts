// src/core/agents/waterAgent.ts

"use strict";

import { OracleAgent } from "./oracleAgent";
import { logOracleInsight } from "../../utils/oracleLogger";
import { getRelevantMemories, storeMemoryItem } from "../../services/memoryService";
import ModelService from "../../utils/modelService";
import type { AIResponse } from "../../types/ai";

/**
 * WaterAgent: Embodies flow, healing, and reflection.
 */
export class WaterAgent extends OracleAgent {
  public async processQuery(query: {
    input: string;
    userId: string;
  }): Promise<AIResponse> {
    const { input, userId } = query;

    // 1️⃣ Retrieve symbolic + session memory
    const contextMemory = await getRelevantMemories(userId, 3);

    // 2️⃣ Compose input with memory echo
    const contextHeader = contextMemory.length
      ? `🌊 Echoes of flow:\n${contextMemory.map((e) => `- ${e.response || e.content || ''}`).join("\n")}\n\n`
      : "";

    const augmentedInput = `${contextHeader}${input}`;

    // 3️⃣ Get model response
    const rawResponse = await ModelService.getResponse({
      ...query,
      input: augmentedInput,
    });

    const content = `${rawResponse.response}\n\n💧 Let your emotions ripple with clarity.`;

    // 4️⃣ Store to memory system
    await storeMemoryItem({
      clientId: userId,
      content,
      element: "water",
      sourceAgent: "water-agent",
      confidence: 0.9,
      metadata: {
        role: "oracle",
        phase: "flow",
        archetype: "Water",
      },
    });

    // 5️⃣ Log Oracle Insight
    await logOracleInsight({
      anon_id: userId,
      archetype: "Water",
      element: "water",
      insight: {
        message: content,
        raw_input: input,
      },
      emotion: 0.88,
      phase: "flow",
      context: contextMemory,
    });

    // 6️⃣ Return final response in standard format
    return {
      content,
      provider: "water-agent",
      model: rawResponse.model || "gpt-4",
      confidence: 0.9,
      metadata: {
        element: "water",
        phase: "flow",
        archetype: "Water",
        reflections: [],
        symbols: [],
      },
    };
  }
}
