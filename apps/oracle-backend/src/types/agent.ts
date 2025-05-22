import type { Metadata } from './metadata';

export interface AgentResponse {
  response: string;
  metadata?: Metadata;
  routingPath?: string[];
  memoryEnhanced?: boolean;
}