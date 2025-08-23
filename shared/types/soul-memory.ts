// Shared types for Soul Memory - used by both frontend and backend
export interface SoulMemorySearchResult {
  id: string;
  text: string;
  ts: number;
  meta?: any;
}

export interface SoulMemorySearchParams {
  userId: string;
  query: string;
  limit?: number;
}

// Abstract interface for Soul Memory operations
export interface ISoulMemoryService {
  search(userId: string, query: string, limit?: number): Promise<SoulMemorySearchResult[]>;
}