export interface IPersonalOracleAgent {
  generateResponse(input: {
    text: string;
    userId: string;
    conversationId: string;
    context?: any;
  }): Promise<{
    response: string;
    confidence: number;
    shouldRemember: boolean;
  }>;
}

export interface ISoullabFounderAgent {
  generateFounderInsight(input: {
    text: string;
    userId: string;
    context?: any;
  }): Promise<{
    insight: string;
    confidence: number;
  }>;
}

export interface IArchetypeAgentFactory {
  createAgent(archetype: string, config?: any): Promise<any>;
  getAvailableArchetypes(): string[];
}

export interface IAgentContainer {
  getPersonalOracleAgent(): IPersonalOracleAgent;
  getSoullabFounderAgent(): ISoullabFounderAgent;
  getArchetypeAgentFactory(): IArchetypeAgentFactory;
}