/**
 * Recap system types for elemental wisdom categorization
 * 
 * The recap system organizes conversation insights into five elemental buckets,
 * each representing different aspects of human experience and growth:
 * 
 * - Aether (Themes): Overarching patterns and spiritual insights
 * - Water (Emotions): Feelings, intuition, and emotional processing
 * - Earth (Steps): Practical actions, grounding, and manifestation
 * - Air (Ideas): Mental concepts, communication, and clarity
 * - Fire (Energy): Passion, transformation, and dynamic forces
 */

// ── Core Recap Types ─────────────────────────────────────────────────────
export type RecapBuckets = {
  themes: string[]        // Aether (implicit) - Spiritual insights, patterns, wisdom
  emotions: string[]      // Water - Feelings, intuition, emotional processing
  steps: string[]         // Earth - Practical actions, grounding, next steps
  ideas: string[]         // Air - Mental concepts, clarity, communication
  energy: string[]        // Fire - Passion, transformation, dynamic forces
  timestamp?: string      // When this recap was created
  quote?: string         // Meaningful quote extracted from the source
}

export type RecapSource =
  | { mode: 'props'; recap: RecapBuckets }
  | { mode: 'weave'; conversationId: string; userId?: string; turnCount?: number }

// ── Elemental Mapping Types ──────────────────────────────────────────────
export type Element = 'aether' | 'water' | 'earth' | 'air' | 'fire'

export type ElementalCategory = {
  element: Element
  bucket: keyof Omit<RecapBuckets, 'timestamp' | 'quote'>
  name: string
  description: string
  icon: string
  color: string
  keywords: string[]
  examples: string[]
}

export type ElementalMapping = Record<Element, ElementalCategory>

// ── Conversation Memory Types ────────────────────────────────────────────
export interface ConversationMemory {
  id?: string
  content: string
  element?: Element
  timestamp: string
  userId?: string
  conversationId?: string
  memoryType?: string
  confidence?: number
  metadata?: Record<string, any>
}

export interface WeaveRequest {
  conversationId: string
  userId?: string
  turnCount?: number
}

export interface WeaveResponse {
  text: string
  saved: boolean
  soulMemoryId?: string | null
  weavedFromCount: number
  userQuote?: string
  buckets?: RecapBuckets
}

// ── Processing Types ──────────────────────────────────────────────────────
export interface ElementalClassification {
  element: Element
  confidence: number
  reasoning?: string
}

export interface RecapProcessingOptions {
  includeQuote?: boolean
  maxItemsPerBucket?: number
  minConfidence?: number
  filterSensitive?: boolean
  includeMetadata?: boolean
}

export interface RecapAnalysis {
  buckets: RecapBuckets
  analysis: {
    dominantElements: Element[]
    emotionalTone: 'positive' | 'neutral' | 'challenging'
    actionability: 'high' | 'medium' | 'low'
    depth: 'surface' | 'moderate' | 'profound'
    completeness: number // 0-1 score
  }
  suggestions?: {
    missingElements?: Element[]
    nextSteps?: string[]
    deepeningQuestions?: string[]
  }
}

// ── UI Component Types ───────────────────────────────────────────────────
export interface RecapDisplayProps {
  source: RecapSource
  className?: string
  onElementClick?: (element: Element, items: string[]) => void
  onQuoteSelect?: (quote: string) => void
  showTimestamp?: boolean
  showAnalysis?: boolean
  interactive?: boolean
}

export interface ElementBucketProps {
  element: Element
  items: string[]
  isActive?: boolean
  onClick?: (element: Element, items: string[]) => void
  showCount?: boolean
  maxItems?: number
}

export interface RecapModalProps {
  isOpen: boolean
  onClose: () => void
  source: RecapSource
  title?: string
  subtitle?: string
}

// ── Error Types ───────────────────────────────────────────────────────────
export class RecapError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'RecapError'
  }
}

export type RecapErrorCode = 
  | 'INVALID_SOURCE'
  | 'WEAVE_FAILED'
  | 'CLASSIFICATION_FAILED'
  | 'INSUFFICIENT_DATA'
  | 'NETWORK_ERROR'
  | 'PERMISSION_DENIED'

// ── Utility Types ────────────────────────────────────────────────────────
export type RecapBucketKey = keyof Omit<RecapBuckets, 'timestamp' | 'quote'>

export interface ElementalStats {
  totalItems: number
  itemsByElement: Record<Element, number>
  dominantElement: Element
  balance: number // 0-1 score of how balanced across elements
}

export interface RecapExportOptions {
  format: 'json' | 'markdown' | 'text'
  includeTimestamp?: boolean
  includeQuote?: boolean
  includeAnalysis?: boolean
  groupByElement?: boolean
}

// ── Constants ─────────────────────────────────────────────────────────────
export const ELEMENT_ORDER: Element[] = ['aether', 'water', 'earth', 'air', 'fire']

export const BUCKET_TO_ELEMENT_MAP: Record<RecapBucketKey, Element> = {
  themes: 'aether',
  emotions: 'water', 
  steps: 'earth',
  ideas: 'air',
  energy: 'fire'
} as const

export const ELEMENT_TO_BUCKET_MAP: Record<Element, RecapBucketKey> = {
  aether: 'themes',
  water: 'emotions',
  earth: 'steps', 
  air: 'ideas',
  fire: 'energy'
} as const

// ── Type Guards ──────────────────────────────────────────────────────────
export function isRecapBuckets(obj: any): obj is RecapBuckets {
  return (
    obj &&
    typeof obj === 'object' &&
    Array.isArray(obj.themes) &&
    Array.isArray(obj.emotions) &&
    Array.isArray(obj.steps) &&
    Array.isArray(obj.ideas) &&
    Array.isArray(obj.energy)
  )
}

export function isWeaveSource(source: RecapSource): source is Extract<RecapSource, { mode: 'weave' }> {
  return source.mode === 'weave'
}

export function isPropsSource(source: RecapSource): source is Extract<RecapSource, { mode: 'props' }> {
  return source.mode === 'props'
}

export function isValidElement(element: string): element is Element {
  return ['aether', 'water', 'earth', 'air', 'fire'].includes(element)
}

// ── Default Values ───────────────────────────────────────────────────────
export const EMPTY_RECAP_BUCKETS: RecapBuckets = {
  themes: [],
  emotions: [],
  steps: [],
  ideas: [],
  energy: [],
  timestamp: new Date().toISOString()
}

export const DEFAULT_PROCESSING_OPTIONS: Required<RecapProcessingOptions> = {
  includeQuote: true,
  maxItemsPerBucket: 5,
  minConfidence: 0.6,
  filterSensitive: true,
  includeMetadata: false
}