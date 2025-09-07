// Shared types and utilities for SpiralogicOracleSystem
export * from './types';

// Oracle types
export interface OracleResponse {
  message: string;
  mayaResponse?: string;
  sessionId?: string;
  uiState?: any;
  metadata?: any;
}

export interface OracleSession {
  id: string;
  userId: string;
  startTime: Date;
  messages: OracleMessage[];
  stage?: string;
}

export interface OracleMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: any;
}

// SHIFt types
export interface SHIFtProfile {
  userId: string;
  elements: ElementalProfile;
  facets: FacetScore[];
  phase: string;
  confidence: number;
  narrative?: string;
}

export interface ElementalProfile {
  fire: number;
  water: number;
  earth: number;
  air: number;
  aether: number;
}

export interface FacetScore {
  code: string;
  score: number;
  confidence: number;
  delta7d?: number;
}

// File types
export interface UploadedFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  userId: string;
  content?: string;
  summary?: string;
  embedding?: number[];
  createdAt: Date;
  updatedAt: Date;
}

// Collective types
export interface CollectivePattern {
  id: string;
  type: string;
  strength: number;
  participants: number;
  elementalSignature: ElementalProfile;
  timestamp: Date;
}

// Constants
export const API_ENDPOINTS = {
  ORACLE: '/api/oracle',
  SHIFT: '/api/shift',
  COLLECTIVE: '/api/collective',
  VOICE: '/api/voice',
  UPLOAD: '/api/upload'
} as const;

export const ELEMENTS = ['fire', 'water', 'earth', 'air', 'aether'] as const;
export type Element = typeof ELEMENTS[number];