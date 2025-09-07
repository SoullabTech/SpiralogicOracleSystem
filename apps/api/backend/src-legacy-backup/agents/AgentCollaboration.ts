// /src/agents/AgentCollaboration.ts

import { SpiralogicAgent } from "./SpiralogicAgent";

class AgentCollaboration {
  private agents: SpiralogicAgent[];

  constructor(agents: SpiralogicAgent[]) {
    this.agents = agents;
  }

  // This method allows agents to collaborate on a query
  public async collaborateOnQuery(query: string): Promise<string> {
    const responses = await Promise.all(
      this.agents.map((agent) => agent.engage(query)),
    );
    const collectiveResponse = responses.join("\n");
    return collectiveResponse;
  }
}
