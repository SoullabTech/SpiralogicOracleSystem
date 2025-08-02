import type { AgentResponse } from '../../types';

export class BaseAgent {
  async processQuery(query: string): Promise<AgentResponse> {
    console.log("[BaseAgent] Processing query:", query);

    return {
      response: "Base agent response",
      metadata: {
        timestamp: new Date().toISOString()
      },
      routingPath: ['baseAgent']
    };
  }
}