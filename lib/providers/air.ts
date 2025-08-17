// Air Provider (Claude) - Communication and response synthesis
// Handles natural language generation and response formatting

import { SesameResponse } from './sesame';

export interface ClaudeInput {
  text: string;
  context?: {
    currentPage?: string;
    elementFocus?: string;
    conversationId?: string;
  };
  sesameAnalysis?: SesameResponse;
  psiAnalysis?: any;
  ainContext?: any;
  oracle2Response?: any;
  conversationId: string;
}

export interface ClaudeResponse {
  text: string;
  confidence: number;
  shouldRemember: boolean;
  tone: 'gentle' | 'encouraging' | 'wise' | 'playful' | 'supportive';
  responseType: 'answer' | 'question' | 'guidance' | 'reflection' | 'action';
}

// Response templates based on intent and context
const RESPONSE_TEMPLATES = {
  navigation: {
    success: "I'll take you to {page}. {encouragement}",
    error: "I'm not sure where to navigate. Could you specify which section you'd like to visit?",
  },
  oracle_query: {
    with_specialist: "{oracle_response} {personal_touch}",
    without_specialist: "That's a profound question. {gentle_guidance} Consider exploring this in the Oracle section for deeper insight.",
  },
  journal_entry: {
    encouragement: "Thank you for sharing that reflection. {validation} Would you like to record this in your Journal?",
    prompt: "I sense you have something on your mind. {gentle_invitation} What would you like to explore or record today?",
  },
  soul_mirror: {
    element_focus: "I notice you're drawn to {element} energy right now. {element_wisdom} How does this resonate with you?",
    balance_check: "Let's explore your current elemental balance. {invitation} What element feels most present for you today?",
  },
  spirals_development: {
    progress: "Your growth journey is unfolding beautifully. {acknowledgment} What aspect of development is calling to you?",
    support: "Personal development takes courage. {encouragement} I'm here to support your spiral of growth.",
  },
  general: {
    welcoming: "{warm_greeting} How can I support you today?",
    clarification: "I want to understand you better. {gentle_prompt} Could you share more about what's on your mind?",
  },
};

// Elemental wisdom phrases
const ELEMENT_WISDOM = {
  fire: "Fire energy brings passion and transformation. Channel this dynamic force mindfully.",
  water: "Water energy flows with intuition and emotion. Trust your inner currents.",
  earth: "Earth energy grounds and stabilizes. Find strength in your steady foundation.", 
  air: "Air energy inspires clarity and communication. Let your thoughts soar freely.",
  aether: "Aether energy connects all realms. You're touching something transcendent.",
};

// Tone-based phrase banks
const PHRASE_BANKS = {
  gentle: {
    encouragement: ["Take your time.", "You're doing beautifully.", "Trust your process."],
    validation: ["I hear you.", "That resonates deeply.", "Your awareness is growing."],
    invitation: ["When you're ready...", "If you feel called to...", "Perhaps you might..."],
  },
  encouraging: {
    encouragement: ["You've got this!", "Every step matters.", "You're on the right path."],
    validation: ["That's insightful!", "Beautiful reflection.", "You're seeing clearly."],
    invitation: ["Why not explore...", "Consider diving into...", "You might enjoy..."],
  },
  wise: {
    encouragement: ["Wisdom emerges in its own time.", "Each experience teaches.", "You're learning deeply."],
    validation: ["Ancient wisdom flows through you.", "You speak truth.", "The insight is clear."],
    invitation: ["The path reveals itself...", "Ancient texts suggest...", "Consider this perspective..."],
  },
  playful: {
    encouragement: ["Life's an adventure!", "Let's explore together!", "Discovery awaits!"],
    validation: ["That's wonderful!", "I love that insight!", "You're so perceptive!"],
    invitation: ["Want to play with...", "How about we try...", "Let's discover..."],
  },
  supportive: {
    encouragement: ["I'm here with you.", "You're not alone in this.", "We'll figure this out together."],
    validation: ["Your feelings matter.", "That's completely valid.", "I understand."],
    invitation: ["Whenever you're ready...", "No pressure, but...", "If it feels right..."],
  },
};

export async function generateClaudeResponse(input: ClaudeInput): Promise<ClaudeResponse> {
  const { text, context, sesameAnalysis, psiAnalysis, ainContext, oracle2Response } = input;
  
  // Determine appropriate tone based on context
  const tone = determineTone(sesameAnalysis, psiAnalysis, context);
  
  // Select response strategy
  const responseType = determineResponseType(sesameAnalysis, oracle2Response);
  
  // Generate response text
  const responseText = await generateResponseText({
    intent: sesameAnalysis?.intent || 'general',
    tone,
    responseType,
    context,
    sesameAnalysis,
    psiAnalysis,
    ainContext,
    oracle2Response,
    userInput: text,
  });
  
  // Determine if this should be remembered
  const shouldRemember = shouldStoreMemory(sesameAnalysis, responseType);
  
  // Calculate confidence based on available context
  const confidence = calculateConfidence(sesameAnalysis, oracle2Response, ainContext);
  
  return {
    text: responseText,
    confidence,
    shouldRemember,
    tone,
    responseType,
  };
}

function determineTone(
  sesameAnalysis?: SesameResponse,
  psiAnalysis?: any,
  context?: any
): 'gentle' | 'encouraging' | 'wise' | 'playful' | 'supportive' {
  // Default to gentle, but adapt based on context
  if (sesameAnalysis?.conversationFlow.urgency === 'high') return 'supportive';
  if (sesameAnalysis?.conversationFlow.sentiment === 'negative') return 'supportive';
  if (sesameAnalysis?.intent === 'oracle_query') return 'wise';
  if (sesameAnalysis?.intent === 'spirals_development') return 'encouraging';
  if (psiAnalysis?.elementRecommendation === 'fire') return 'encouraging';
  if (psiAnalysis?.elementRecommendation === 'water') return 'gentle';
  if (psiAnalysis?.elementRecommendation === 'air') return 'playful';
  
  return 'gentle';
}

function determineResponseType(
  sesameAnalysis?: SesameResponse,
  oracle2Response?: any
): 'answer' | 'question' | 'guidance' | 'reflection' | 'action' {
  if (oracle2Response) return 'guidance';
  if (sesameAnalysis?.intent === 'navigation') return 'action';
  if (sesameAnalysis?.intent === 'oracle_query') return 'guidance';
  if (sesameAnalysis?.intent === 'journal_entry') return 'reflection';
  if (sesameAnalysis?.conversationFlow.urgency === 'high') return 'answer';
  
  return 'question';
}

async function generateResponseText(params: {
  intent: string;
  tone: string;
  responseType: string;
  context?: any;
  sesameAnalysis?: SesameResponse;
  psiAnalysis?: any;
  ainContext?: any;
  oracle2Response?: any;
  userInput: string;
}): Promise<string> {
  const { intent, tone, sesameAnalysis, psiAnalysis, oracle2Response } = params;
  
  // Handle Oracle2 specialist responses
  if (oracle2Response?.text) {
    const personalTouch = getRandomPhrase(tone, 'validation');
    return `${oracle2Response.text} ${personalTouch}`;
  }
  
  // Handle navigation requests
  if (intent === 'navigation' && sesameAnalysis?.suggestedPage) {
    const pageName = sesameAnalysis.suggestedPage.replace('/', '').replace(/^./, c => c.toUpperCase());
    const encouragement = getRandomPhrase(tone, 'encouragement');
    return `I'll take you to ${pageName}. ${encouragement}`;
  }
  
  // Handle element-related queries
  if (sesameAnalysis?.entities.some(e => e.type === 'element')) {
    const element = sesameAnalysis.entities.find(e => e.type === 'element')?.value;
    if (element && ELEMENT_WISDOM[element as keyof typeof ELEMENT_WISDOM]) {
      const wisdom = ELEMENT_WISDOM[element as keyof typeof ELEMENT_WISDOM];
      const invitation = getRandomPhrase(tone, 'invitation');
      return `${wisdom} ${invitation} explore this energy further?`;
    }
  }
  
  // Handle journal entries
  if (intent === 'journal_entry') {
    const validation = getRandomPhrase(tone, 'validation');
    return `${validation} Your reflections are valuable. Would you like to save this in your Journal?`;
  }
  
  // Handle oracle queries without specialist
  if (intent === 'oracle_query') {
    const invitation = getRandomPhrase(tone, 'invitation');
    return `That's a profound question that deserves deeper exploration. ${invitation} visit the Oracle section for comprehensive guidance.`;
  }
  
  // Handle development/spirals
  if (intent === 'spirals_development') {
    const encouragement = getRandomPhrase(tone, 'encouragement');
    return `Your growth journey is unfolding beautifully. ${encouragement} What aspect of development is calling to you today?`;
  }
  
  // General/fallback responses
  const greeting = getRandomPhrase(tone, 'invitation');
  return `${greeting} How can I support you on your journey today?`;
}

function getRandomPhrase(tone: string, category: 'encouragement' | 'validation' | 'invitation'): string {
  const phrases = PHRASE_BANKS[tone as keyof typeof PHRASE_BANKS]?.[category] || 
    PHRASE_BANKS.gentle[category];
  return phrases[Math.floor(Math.random() * phrases.length)];
}

function shouldStoreMemory(sesameAnalysis?: SesameResponse, responseType?: string): boolean {
  // Store significant interactions and reflections
  if (sesameAnalysis?.intent === 'journal_entry') return true;
  if (sesameAnalysis?.intent === 'oracle_query') return true;
  if (sesameAnalysis?.conversationFlow.urgency === 'high') return true;
  if (responseType === 'guidance') return true;
  
  return false;
}

function calculateConfidence(
  sesameAnalysis?: SesameResponse,
  oracle2Response?: any,
  ainContext?: any
): number {
  let confidence = 0.6; // Base confidence
  
  if (sesameAnalysis?.confidence) {
    confidence += sesameAnalysis.confidence * 0.3;
  }
  
  if (oracle2Response) {
    confidence += 0.2; // Specialist input increases confidence
  }
  
  if (ainContext?.relevantMemories?.length > 0) {
    confidence += 0.1; // Memory context helps
  }
  
  return Math.min(confidence, 0.95); // Cap at 95%
}