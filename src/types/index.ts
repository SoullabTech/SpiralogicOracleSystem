export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  model?: string;
  element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  insight_type?: 'reflection' | 'challenge' | 'guidance' | 'integration';
  context?: {
    client?: string;
    archetype?: string;
    phase?: string;
    element?: string;
    focus_areas?: string[];
  };
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  currentClient: ClientData | null;
  bypassMode: boolean;
}

export interface ClientData {
  client_name: string;
  email?: string;
  journey?: {
    current_phase?: 'exploration' | 'growth' | 'integration' | 'mastery';
    dominant_element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
    archetype?: string;
    progress?: number;
  };
  preferences?: {
    communication_style?: 'direct' | 'nurturing' | 'analytical' | 'motivational';
    focus_areas?: string[];
    session_frequency?: 'daily' | 'weekly' | 'monthly';
  };
}

export interface OracleResponse {
  result: string;
  analysis: {
    element: string | null;
    insightType: string | null;
  };
}