// Interface for Archetype Agent to break circular dependencies
export interface IArchetypeAgent {
  id: string;
  name: string;
  processQuery(input: string, context?: any): Promise<any>;
  getArchetypeGuidance(archetype: string, context: any): Promise<string>;
}

export interface IArchetypeAgentFactory {
  createAgent(type: string, config?: any): IArchetypeAgent;
  getAvailableArchetypes(): string[];
  getAgentForUser(userId: string): Promise<IArchetypeAgent>;
}

export interface OracleIdentity {
  name: string;
  role: string;
  essence: string;
  description: string;
}

export interface ArchetypeConfig {
  userId: string;
  archetypeType: string;
  personalityWeights?: Record<string, number>;
  preferences?: Record<string, any>;
}