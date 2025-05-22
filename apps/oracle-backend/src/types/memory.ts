import type { Metadata } from './metadata';

/**
 * Represents a stored memory item, either user query or agent response.
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
