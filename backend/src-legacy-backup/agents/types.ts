export interface AgentResponse {
  response: string;
  metadata?: Metadata;
  routingPath?: string[];
  confidence?: number;
}

export interface MemoryItem {
  id: string;
  content: string;
  timestamp: number;
  clientId?: string;
  type?: "text" | "audio";
}

export interface UserSettings {
  theme: "dark" | "light";
  language: string;
  notificationsEnabled: boolean;
}

export interface Metadata {
  timestamp: string;
  element?: string;
  processedAt?: string;
  prefect?: any;
  guide?: boolean;
  mentor?: boolean;
  clientId?: string;
  category?: string;
  adviceType?: string;
}

export interface SystemData {
  version: string;
  uptime: number;
  environment: "development" | "production" | "staging";
}
