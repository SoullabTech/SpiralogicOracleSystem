// Interface for Founder Agent to break circular dependencies
export interface IFounderAgent {
  processFounderQuery(input: string, context?: any): Promise<any>;
  getFounderWisdom(topic: string, context?: any): Promise<string>;
  getKnowledgeBase(): Promise<any[]>;
  searchKnowledge(query: string, limit?: number): Promise<any[]>;
}

export interface FounderKnowledgeItem {
  id: string;
  topic: string;
  content: string;
  category: string;
  tags: string[];
  created_at: string;
  relevance_score?: number;
}

export interface FounderContext {
  userId: string;
  sessionId?: string;
  retreatPhase?: string;
  previousInteractions?: any[];
  userProfile?: any;
}