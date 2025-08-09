export interface IAgentFactory {
  createAgent(type: string): BaseAgent;
}