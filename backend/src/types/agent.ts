import type { Metadata } from "./metadata";

export interface AgentResponse {
  content: string; // Primary field for compatibility
  response?: string; // Legacy compatibility
  metadata?: Metadata;
  routingPath?: string[];
  memoryEnhanced?: boolean;
  confidence?: number;
  provider?: string;
  model?: string;
}
