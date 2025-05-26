import { User as SupabaseUser } from '@supabase/supabase-js'; // Avoid naming conflicts
import { Request } from 'express';
import type { Metadata } from './metadata';
import memoryRouter from './routes/memory.routes';
import { authenticate } from './middleware/authenticate';
import facetMapRouter from './routes/facetMap.routes';

app.use('/api/oracle/facet-map', facetMapRouter);
app.use('/api/oracle/memory', authenticate, memoryRouter);

/**
 * Represents the authentication request payload
 */
export interface AuthRequest {
  email: string;
  password: string;
}

/**
 * Represents the authentication response including tokens and user information
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
  };
}

/**
 * Represents a stored memory item, either user query or agent response
 */
export interface MemoryItem {
  /** Unique identifier for the memory entry */
  id: string;
  /** The main content of the memory (query or response) */
  content: string;
  /** Timestamp in milliseconds since epoch */
  timestamp: number;
  /** Optional client/user identifier */
  clientId?: string;
  /** Optional metadata for additional context */
  metadata?: Metadata;
}

/**
 * Represents a symbolic tag emitted during processing
 */
export interface SymbolicTag {
  /** The symbol or archetype tag */
  symbol: string;
  /** The agent that emitted the symbol */
  agent: string;
  /** Optional elemental context (e.g., 'fire', 'water') */
  element?: string;
  /** Optional facet context within an element */
  facet?: string;
  /** Optional phase or state context */
  phase?: string;
  /** ISO timestamp of when the tag was created */
  timestamp?: string;
  /** Confidence score (0-1) for the tagging */
  confidence?: number;
}

/**
 * Represents a session of a user interacting with the system
 */
export interface Session {
  id: string;
  clientId: string;
  startTime: string;
  meta: Metadata;
  status: 'active' | 'completed';
}

/**
 * Represents the statistics for user sessions
 */
export interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  lastSessionTime: string;
  clientId: string;
}

/**
 * User interface for interaction with authentication systems and memory tracking
 */
export interface User {
  id: string;
  email: string;
  created_at: string;
  last_login?: string;
}

/**
 * Represents the structure of the authenticated request
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

/**
 * Re-exporting from other modules, assuming you've defined these in their respective files
 */
export * from './auth';   // If you have an 'auth' module
export * from './memory';  // If you have a 'memory' module
export * from './session'; // If you have a 'session' module
