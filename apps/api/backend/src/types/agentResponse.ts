import { AgentResponse } from "./types/agentResponse";
export interface AgentResponse {
  content: string;              // primary field
  response?: string;            // backward compatibility alias
  confidence: number;
  metadata: any;
}
