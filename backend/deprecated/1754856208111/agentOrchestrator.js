import { fireAgent } from "./fireAgent.js";
import { waterAgent } from "./waterAgent.js";

export class AgentOrchestrator {
  async routeToAgent(input) {
    const waterKeywords = ["feel", "emotion", "heart", "hurt", "scared"];
    const isWater = waterKeywords.some((word) =>
      input.toLowerCase().includes(word),
    );

    const agent = isWater ? waterAgent : fireAgent;
    const response = await agent.getOracleResponse(input);

    return {
      ...response,
      primaryAgent: isWater ? "water" : "fire",
      orchestrated: true,
    };
  }
}
export const agentOrchestrator = new AgentOrchestrator();
