// src/utils/modelService.ts

import { openai } from "../lib/openaiClient"; // adjust if using other clients
import logger from "./logger";
import type { AgentResponse } from "../core/agents/types";

class ModelService {
  /**
   * Get a response from the configured LLM model.
   * @param query - An object containing the user's input and optional context.
   */
  async getResponse(query: {
    input: string;
    userId?: string;
    context?: Record<string, any>;
  }): Promise<AgentResponse> {
    const { input, userId, context = {} } = query;

    try {
      logger.info("🔮 Sending query to model", { userId, input });

      const completion = await openai.chat.completions.create({
        model: "gpt-4", // or 'gpt-3.5-turbo' / 'claude' depending on your setup
        messages: [
          {
            role: "system",
            content: "You are an insightful Oracle. Offer reflective and transformative guidance.",
          },
          {
            role: "user",
            content: input,
          },
        ],
        temperature: 0.8,
        max_tokens: 800,
      });

      const responseText =
        completion.choices[0]?.message?.content?.trim() ?? "";

      const response: AgentResponse = {
        response: responseText,
        model: "gpt-4",
        confidence: 0.9,
        metadata: {
          timestamp: new Date().toISOString(),
          context,
        } as any,
      };

      logger.info("✅ Model response received", {
        userId,
        model: "gpt-4",
      });

      return response;
    } catch (error) {
      logger.error("❌ ModelService failed to get a response", {
        error,
        userId,
        input,
      });
      throw error;
    }
  }
}

export default new ModelService();
