import { IAgentFactory } from './IAgentFactory';
import { OracleAgent } from '../agents/oracleAgent';

export class AgentRegistry implements IAgentFactory {
  createAgent(type: string): OracleAgent {
    // For Step 2, all elemental agents return a base OracleAgent
    // This will be enhanced in Step 3 with proper elemental implementations
    switch (type.toLowerCase()) {
      case 'fire':
      case 'water': 
      case 'earth':
      case 'air':
      case 'aether':
        return new OracleAgent({ debug: process.env.NODE_ENV === 'development' });
      default: 
        throw new Error(`Unknown agent type: ${type}`);
    }
  }
}