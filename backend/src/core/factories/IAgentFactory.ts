import { OracleAgent } from '../agents/oracleAgent';

export interface IAgentFactory {
  createAgent(type: string): OracleAgent;
}