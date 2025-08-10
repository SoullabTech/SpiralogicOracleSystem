// /src/agents/SpiralogicAgent.ts

import { Agent, AgentContext } from "@singularitynet/sdk";
import { SOUL } from "../core/SOUL";
import { HumanPacedLearning } from "../core/HumanPacedLearning";
import { ArchetypeFramework } from "../core/ArchetypeFramework";

export class SpiralogicAgent {
  private soul: SOUL;
  private hpp: HumanPacedLearning;
  private archetypes: ArchetypeFramework;
  private agent: Agent;

  constructor(agentContext: AgentContext, userProfile: UserProfile) {
    this.soul = new SOUL();
    this.hpp = new HumanPacedLearning();
    this.archetypes = new ArchetypeFramework(userProfile);
    this.agent = new Agent(agentContext);
  }

  async engage(query: string) {
    // Ensure the agent follows the HPP (Human-Paced Protocol)
    if (!this.hpp.isReadyToProgress()) {
      console.log("Please reflect and engage more before progressing.");
      return;
    }

    // Retrieve archetype and align AI's tone and content
    const archetype = this.archetypes.getArchetype();
    const tone = this.soul.adjustTone(archetype);
    const content = this.soul.adjustContent(archetype);

    console.log(`Agent Tone: ${tone}`);
    console.log(`AI Content: ${content}`);

    // Connect to SingularityNET and allow agents to collaborate
    const response = await this.agent.communicate(query);
    console.log(`Agent Response: ${response}`);

    return response;
  }

  // Allow multiple agents to communicate and collaborate
  async collaborateWithOtherAgents(
    otherAgents: SpiralogicAgent[],
    query: string,
  ) {
    const responses = await Promise.all(
      otherAgents.map((agent) => agent.engage(query)),
    );
    // Combine results and generate an emergent response
    const collectiveResponse = responses.join("\n");
    console.log(`Collective Agent Response: ${collectiveResponse}`);
    return collectiveResponse;
  }
}
