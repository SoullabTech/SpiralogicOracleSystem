"use strict";

import { OracleAgent } from "./oracleAgent";
import { logOracleInsight } from "../utils/oracleLogger";
import * as MemoryModule from "../utils/memoryModule";
import ModelService from "../../utils/modelService";
import type { AgentResponse } from "../../types/ai";

/**
 * MentorAgent: Embodies wisdom, encouragement, and soulful direction.
 */
export class MentorAgent extends OracleAgent {
  constructor() {
    super({ debug: false });
  }

  public async processQuery(query: {
    input: string;
    userId?: string;
  }): Promise<AgentResponse> {
    const contextMemory = MemoryModule.getRecentEntries(2);

    const contextHeader = contextMemory.length
      ? `🧭 Prior insights to guide the path:\n${contextMemory.map((e) => `- ${e.response}`).join("\n")}\n\n`
      : "";

    const mentorPrompt = `You are a wise and kind mentor. Offer grounded, soulful advice that uplifts the seeker.`;
    const augmentedInput = `${mentorPrompt}\n\n${contextHeader}${query.input}`;

    const augmentedQuery = {
      ...query,
      input: augmentedInput,
    };

    const baseResponse: AgentResponse =
      await ModelService.getResponse(augmentedQuery);

    const personalityFlair = `\n\n🧙 May you walk gently with strength and heart.`;
    const enhancedResponse = `${baseResponse.response}${personalityFlair}`;

    MemoryModule.addEntry({
      timestamp: new Date().toISOString(),
      query: query.input,
      response: enhancedResponse,
    });

    await logOracleInsight({
      anon_id: query.userId || null,
      archetype: baseResponse.metadata?.archetype || "Mentor",
      element: "Air",
      insight: {
        message: enhancedResponse,
        raw_input: query.input,
      },
      emotion: baseResponse.metadata?.emotion_score ?? 0.85,
      phase: baseResponse.metadata?.phase || "Mentorship",
      context: contextMemory,
    });

    return {
      ...baseResponse,
      response: enhancedResponse,
      confidence: baseResponse.confidence ?? 0.9,
      routingPath: [...(baseResponse.routingPath || []), "mentor-agent"],
    };
  }
}
