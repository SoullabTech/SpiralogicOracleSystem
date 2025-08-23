export interface IOracleService {
  getOracleResponse(query: any): Promise<any>;
  processOracleQuery(params: any): Promise<any>;
  processQuery(query: OracleQuery): Promise<OracleResponse>;
  getOracleIdentity(userId: string): Promise<OracleServiceIdentity>;
  updateOracleSettings(userId: string, settings: OracleSettings): Promise<void>;
  getAvailableOracles(): Promise<string[]>;
}

export interface OracleQuery {
  input: string;
  userId: string;
  context?: Record<string, unknown>;
  preferredElement?: string;
  requestShadowWork?: boolean;
  collectiveInsight?: boolean;
}

export interface OracleResponse {
  response: string;
  confidence: number;
  element?: string;
  voice?: string;
  metadata?: Record<string, unknown>;
}

export interface OracleServiceIdentity {
  name: string;
  role: string;
  essence: string;
  description: string;
  icon?: string;
  teleos?: string;
}

export interface OracleSettings {
  preferredVoice?: string;
  elementalPreferences?: Record<string, number>;
  shadowWorkEnabled?: boolean;
  collectiveInsightEnabled?: boolean;
  personality?: Record<string, number>;
}