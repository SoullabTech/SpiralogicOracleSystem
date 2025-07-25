import { getRitualForPhase } from "../../lib/ritualEngine";
import { getElementalPhase } from "../../lib/spiralLogic";
import type { AgentResponse } from "../../types/agent";
import type { Metadata } from "../../types/metadata";

export class OracleAgent {
  protected debug: boolean;

  constructor(options: { debug?: boolean } = {}) {
    this.debug = options.debug ?? false;
  }

  async processQuery(query: string): Promise<AgentResponse> {
    if (this.debug) {
      console.log("[OracleAgent] Processing query:", query);
    }

    const detectedElement = this.detectElement(query);
    const ritual = getRitualForPhase(detectedElement);

    const simulatedResponse = `Processed query: ${query}`;
    const metadata: Metadata = {
      timestamp: new Date().toISOString(),
      element: detectedElement,
      processedAt: new Date().toISOString(),
      prefect: {
        task: "simulate",
        status: "success",
      },
      ritual, // 👈 New metadata field
    };

    return {
      response: simulatedResponse,
      confidence: 0.9,
      metadata,
      routingPath: [detectedElement.toLowerCase(), "oracle-agent"],
    };
  }

  protected detectElement(text: string): string {
    return getElementalPhase(text); // using spiralLogic.ts
  }
}
