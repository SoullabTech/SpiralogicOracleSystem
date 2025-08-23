import { IPersonalOracleAgent, ISoullabFounderAgent, IArchetypeAgentFactory, IAgentContainer } from '../../../../../lib/shared/interfaces/IAgents';
import { PersonalOracleAgent } from '../agents/PersonalOracleAgent';
import { SoullabFounderAgent } from '../agents/soullabFounderAgent';
import { ArchetypeAgentFactory } from '../agents/ArchetypeAgentFactory';

class AgentContainer implements IAgentContainer {
  private personalOracleAgent?: IPersonalOracleAgent;
  private soullabFounderAgent?: ISoullabFounderAgent;
  private archetypeAgentFactory?: IArchetypeAgentFactory;

  getPersonalOracleAgent(): IPersonalOracleAgent {
    if (!this.personalOracleAgent) {
      this.personalOracleAgent = new PersonalOracleAgent({
        userId: 'default',
        oracleName: 'Personal Oracle'
      });
    }
    return this.personalOracleAgent;
  }

  getSoullabFounderAgent(): ISoullabFounderAgent {
    if (!this.soullabFounderAgent) {
      this.soullabFounderAgent = new SoullabFounderAgent();
    }
    return this.soullabFounderAgent;
  }

  getArchetypeAgentFactory(): IArchetypeAgentFactory {
    if (!this.archetypeAgentFactory) {
      this.archetypeAgentFactory = new ArchetypeAgentFactory();
    }
    return this.archetypeAgentFactory;
  }
}

export const agentContainer = new AgentContainer();