import { IAgentFactory } from './IAgentFactory';
import { BaseAgent } from '../agents/baseAgent';

// Import existing elemental agents from new location
import { FireAgent } from '../agents/elemental/fireAgent';
import { WaterAgent } from '../agents/elemental/waterAgent';
import { EarthAgent } from '../agents/elemental/earthAgent';
import { AirAgent } from '../agents/elemental/airAgent';
import { AetherAgent } from '../agents/elemental/aetherAgent';

export class AgentRegistry implements IAgentFactory {
  createAgent(type: string): BaseAgent {
    switch (type.toLowerCase()) {
      case 'fire': return new FireAgent();
      case 'water': return new WaterAgent();
      case 'earth': return new EarthAgent();
      case 'air': return new AirAgent();
      case 'aether': return new AetherAgent();
      default: throw new Error(`Unknown agent type: ${type}`);
    }
  }
}