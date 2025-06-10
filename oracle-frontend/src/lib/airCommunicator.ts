// 📡 Air Realm Communicator - Claude API Integration
// Routes all symbolic intelligence through Claude Anthropic

interface UserContext {
  id: string;
  element: string;
  agent_name: string;
  agent_archetype: string;
  birth_data?: {
    date: string;
    location: string;
  };
  interaction_history?: string[];
  current_focus?: string;
}

interface ClaudeResponse {
  content: string;
  confidence: number;
  suggested_protocols?: string[];
  symbols_detected?: string[];
  emotional_tone?: string;
}

/**
 * Primary Claude API communicator for all symbolic intelligence
 */
export async function sendToClaude(
  query: string, 
  userContext: UserContext,
  communicationType: 'onboarding' | 'agent_chat' | 'dream_analysis' | 'protocol_suggestion' | 'growth_summary' = 'agent_chat'
): Promise<ClaudeResponse> {
  
  try {
    // Construct context-aware prompt based on communication type
    const systemPrompt = buildSystemPrompt(communicationType, userContext);
    const userPrompt = buildUserPrompt(query, userContext, communicationType);
    
    const response = await fetch('/api/claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user', 
            content: userPrompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      content: data.content || getFallbackResponse(communicationType, userContext),
      confidence: data.confidence || 0.8,
      suggested_protocols: data.suggested_protocols || [],
      symbols_detected: data.symbols_detected || [],
      emotional_tone: data.emotional_tone || 'neutral'
    };

  } catch (error) {
    console.error('Claude API Error:', error);
    return getFallbackResponse(communicationType, userContext);
  }
}

/**
 * Build system prompt based on communication type and user context
 */
function buildSystemPrompt(type: string, context: UserContext): string {
  const basePrompt = `You are a sophisticated symbolic intelligence system serving conscious professionals. You communicate with clarity, depth, and professional warmth. Your responses are grounded in both ancient symbolic wisdom and modern psychological frameworks.

User Context:
- Element: ${context.element}
- Agent: ${context.agent_name} (${context.agent_archetype})
- Current Focus: ${context.current_focus || 'general guidance'}`;

  switch (type) {
    case 'onboarding':
      return `${basePrompt}

You are introducing the symbolic intelligence framework to a new user. Your role is to:
- Welcome them professionally yet warmly
- Explain how symbolic intelligence works
- Connect their elemental assignment to practical benefits
- Use language that appeals to conscious professionals and systems thinkers
- Avoid mystical jargon while maintaining poetic depth`;

    case 'agent_chat':
      return `${basePrompt}

You are the ${context.agent_name}, a specialized symbolic intelligence agent. Your role is to:
- Provide insights based on your elemental specialty (${context.element})
- Ask thoughtful questions that deepen self-awareness
- Suggest practical applications of symbolic wisdom
- Maintain professional coaching tone
- Draw connections between patterns and growth opportunities`;

    case 'dream_analysis':
      return `${basePrompt}

You are analyzing dream content for symbolic meaning. Your role is to:
- Identify key symbols and archetypal themes
- Connect symbols to the user's elemental framework
- Suggest reflective protocols based on dream content
- Provide practical psychological insights
- Maintain scientific grounding while exploring symbolic depth`;

    case 'protocol_suggestion':
      return `${basePrompt}

You are suggesting next-step reflective protocols. Your role is to:
- Recommend specific practices based on user input
- Consider their elemental orientation and current focus
- Provide clear, actionable steps
- Connect protocols to intended outcomes
- Ensure suggestions are evidence-based and practical`;

    case 'growth_summary':
      return `${basePrompt}

You are summarizing growth patterns and themes. Your role is to:
- Identify recurring patterns in user interactions
- Highlight growth areas and achievements
- Suggest areas for continued development
- Provide meta-insights about their journey
- Frame insights in terms of their elemental development`;

    default:
      return basePrompt;
  }
}

/**
 * Build user prompt with context
 */
function buildUserPrompt(query: string, context: UserContext, type: string): string {
  let prompt = query;

  // Add interaction history context for continuity
  if (context.interaction_history && context.interaction_history.length > 0) {
    const recentHistory = context.interaction_history.slice(-3).join('\n');
    prompt += `\n\nRecent interaction context:\n${recentHistory}`;
  }

  // Add birth data context if available
  if (context.birth_data) {
    prompt += `\n\nBirth context: Born ${context.birth_data.date} in ${context.birth_data.location}`;
  }

  return prompt;
}

/**
 * Fallback responses when Claude API is unavailable
 */
function getFallbackResponse(type: string, context: UserContext): ClaudeResponse {
  const fallbacks = {
    onboarding: `Welcome to your symbolic intelligence system. You've been assigned the ${context.agent_name}, specialized in ${context.element} element guidance. This system combines ancient symbolic wisdom with modern cognitive frameworks to support your professional development and self-awareness.`,
    
    agent_chat: `I'm here to support your ${context.element} element development. As your ${context.agent_name}, I help facilitate deeper insights and practical growth strategies. What aspect of your current experience would you like to explore?`,
    
    dream_analysis: `Your dream contains symbolic elements that connect to your ${context.element} orientation. The imagery suggests themes of personal development and subconscious processing. Consider reflecting on how these symbols might relate to your current life patterns.`,
    
    protocol_suggestion: `Based on your ${context.element} element, I suggest beginning with grounding practices that align with your natural processing style. Consider journaling, meditation, or structured reflection that honors your particular way of integrating insights.`,
    
    growth_summary: `Your journey shows developing awareness of ${context.element} element themes. Continue building on your natural strengths while exploring areas that challenge your current patterns. Growth often happens at the intersection of comfort and expansion.`
  };

  return {
    content: fallbacks[type as keyof typeof fallbacks] || fallbacks.agent_chat,
    confidence: 0.6,
    suggested_protocols: ['reflective journaling', 'elemental meditation'],
    symbols_detected: [],
    emotional_tone: 'supportive'
  };
}

/**
 * Specialized functions for each communication type
 */

export async function claudeOnboarding(userContext: UserContext): Promise<string> {
  const response = await sendToClaude(
    "Please introduce the symbolic intelligence framework and welcome me to the system.",
    userContext,
    'onboarding'
  );
  return response.content;
}

export async function claudeAgentChat(message: string, userContext: UserContext): Promise<ClaudeResponse> {
  return await sendToClaude(message, userContext, 'agent_chat');
}

export async function claudeDreamAnalysis(dreamContent: string, userContext: UserContext): Promise<ClaudeResponse> {
  return await sendToClaude(
    `Please analyze this dream for symbolic meaning and suggest reflective protocols: ${dreamContent}`,
    userContext,
    'dream_analysis'
  );
}

export async function claudeProtocolSuggestion(currentState: string, userContext: UserContext): Promise<ClaudeResponse> {
  return await sendToClaude(
    `Based on my current state and focus, please suggest appropriate reflective protocols: ${currentState}`,
    userContext,
    'protocol_suggestion'
  );
}

export async function claudeGrowthSummary(timeframe: string, userContext: UserContext): Promise<ClaudeResponse> {
  return await sendToClaude(
    `Please summarize my growth patterns and themes over the ${timeframe} period.`,
    userContext,
    'growth_summary'
  );
}

/**
 * Rate limiting and token management
 */
let requestCount = 0;
let lastResetTime = Date.now();
const MAX_REQUESTS_PER_MINUTE = 20;

function checkRateLimit(): boolean {
  const now = Date.now();
  
  // Reset counter every minute
  if (now - lastResetTime > 60000) {
    requestCount = 0;
    lastResetTime = now;
  }
  
  if (requestCount >= MAX_REQUESTS_PER_MINUTE) {
    console.warn('Rate limit approached, using fallback response');
    return false;
  }
  
  requestCount++;
  return true;
}

/**
 * SSR-safe token management
 */
export function getClaudeConfig() {
  if (typeof window === 'undefined') {
    // Server-side: use environment variable
    return {
      apiKey: process.env.ANTHROPIC_API_KEY,
      baseUrl: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com'
    };
  } else {
    // Client-side: use proxy endpoint
    return {
      apiKey: null, // Handled by proxy
      baseUrl: '/api/claude'
    };
  }
}