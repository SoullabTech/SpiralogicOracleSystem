// Unified Oracle API client - used by both text and voice input paths
// Ensures consistent routing to /api/oracle/turn with proper error handling

export type TurnPayload = {
  text: string;
  conversationId?: string;
  meta?: Record<string, any>;
  providers?: {
    sesame?: boolean;
    claude?: boolean;
    oracle2?: boolean;
    psi?: boolean;
    ain?: boolean;
  };
  context?: {
    currentPage?: string;
    elementFocus?: string;
    conversationId?: string;
  };
};

export interface OracleResponse {
  response: {
    text: string;
    audioUrl?: string;
    audioPending?: boolean;
    turnId?: string | null;
    actions?: Array<{
      type: 'navigate' | 'element_focus' | 'journal_entry' | 'spiral_update';
      payload: any;
    }>;
  };
  metadata: {
    providers: string[];
    confidence: number;
    processingTime: number;
    conversationId: string;
    elementRecommendation?: string;
    pipeline?: any;
  };
  turnMeta?: {
    sacredDetected: boolean;
    shadowScore: number;
    archetypeHint?: string;
    facetHints: string[];
    soulMemoryId?: string | null;
    soulPhase?: string;
    confidence?: number;
  };
  debug?: any;
}

/**
 * Send text (from typing or voice) to Oracle for conversational response
 * Unified function used by both input methods
 */
export async function sendToOracle({
  text,
  conversationId,
  meta = {},
  providers,
  context,
}: TurnPayload): Promise<OracleResponse> {
  const request = {
    input: {
      text: text.trim(),
      context: {
        currentPage: context?.currentPage || '/oracle',
        conversationId,
        ...context,
      },
    },
    providers: providers || {
      sesame: true,
      claude: true,
      oracle2: false, // Only enable for deep Oracle questions
      psi: true,
      ain: true,
    },
    meta,
  };

  // Log voice→turn routing in development
  if (process.env.NODE_ENV === 'development' && meta.source === 'voice') {
    console.info('[voice→turn] sending', { 
      length: text.length, 
      conversationId,
      meta 
    });
  }

  const response = await fetch('/api/oracle/turn', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`Oracle turn failed: ${response.status} ${errorText}`);
  }

  const result: OracleResponse = await response.json();

  // Log successful voice→turn completion in development
  if (process.env.NODE_ENV === 'development' && meta.source === 'voice') {
    console.info('[voice→turn] success', {
      responseLength: result.response.text.length,
      providers: result.metadata.providers,
      processingTime: result.metadata.processingTime,
    });
  }

  return result;
}

/**
 * Convenience function for Oracle page deep consultations
 */
export async function sendOracleQuestion(
  question: string,
  conversationId?: string
): Promise<OracleResponse> {
  return sendToOracle({
    text: question,
    conversationId,
    providers: {
      sesame: true,
      claude: true,
      oracle2: true, // Enable Oracle2 for deep questions
      psi: true,
      ain: true,
    },
    context: {
      currentPage: '/oracle',
    },
  });
}

/**
 * Convenience function for general chat/guidance
 */
export async function sendGeneralInput(
  text: string,
  conversationId?: string,
  source: 'text' | 'voice' = 'text'
): Promise<OracleResponse> {
  return sendToOracle({
    text,
    conversationId,
    meta: { source },
    providers: {
      sesame: true,
      claude: true,
      oracle2: false, // Keep Oracle2 for deep questions only
      psi: true,
      ain: true,
    },
  });
}