// src/core/agents/oracleAgent.ts

import type { AgentResponse, Metadata } from "../../types/ai";

/**
 * Base class for all Oracle agents.
 * Provides default behavior and utility methods for subclassed elemental agents.
 */
export class OracleAgent {
  protected debug: boolean;

  constructor(options: { debug?: boolean } = {}) {
    this.debug = options.debug ?? false;
  }

  /**
   * Main query processor for the agent.
   * Should be overridden by subclasses to implement specialized responses.
   */
  async processQuery(query: string): Promise<AgentResponse> {
    if (this.debug) {
      console.log("[OracleAgent] Processing query:", query);
    }

    const detectedElement = this.detectElement(query);

    const simulatedResponse = `Processed query: ${query}`;
    const metadata: Metadata = {
      timestamp: new Date().toISOString(),
      element: detectedElement,
      processedAt: new Date().toISOString(),
      prefect: {
        task: "simulate",
        status: "success",
      },
    };

    return {
      response: simulatedResponse,
      confidence: 0.9,
      metadata,
      routingPath: [detectedElement.toLowerCase(), "oracle-agent"],
    };
  }

  /**
   * Determines which elemental archetype the text relates to.
   * Can be overridden by subclasses with more advanced heuristics.
   */
  protected detectElement(text: string): string {
    const lower = text.toLowerCase();

    if (lower.includes("fire")) return "Fire";
    if (lower.includes("water")) return "Water";
    if (lower.includes("earth")) return "Earth";
    if (lower.includes("air")) return "Air";

    return "Aether"; // Default to Aether if no element is detected
  }
}
