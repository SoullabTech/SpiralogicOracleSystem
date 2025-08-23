// Interface for Agent Orchestrator to break circular dependencies
export interface IAgentOrchestrator {
  routeToAgent(agentType: string, query: any): Promise<any>;
  getAvailableAgents(): string[];
  processElementalQuery(element: string, query: any): Promise<any>;
}

export interface AgentResponse {
  response: string;
  agentType: string;
  element?: string;
  confidence: number;
  metadata?: Record<string, unknown>;
}

export interface AgentQuery {
  input: string;
  userId: string;
  context?: Record<string, unknown>;
  targetAgent?: string;
  preferredElement?: string;
}