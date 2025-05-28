export interface MemoryItem {
  id: string;
  content: string;
  timestamp: number;
  clientId?: string;
  metadata?: Record<string, any>;
}

export interface AgentResponse {
  response: string;
  metadata?: Metadata;
  routingPath?: string[];
  memoryEnhanced?: boolean;
}

export interface Metadata {
  timestamp?: string;
  mentor?: boolean;
  [key: string]: any;
}