/**
 * Maya Response Configuration
 * Standards for conversational AI response patterns
 */

export interface ResponseConfig {
  maxTokens: number;
  temperature: number;
  style: ResponseStyle;
}

export interface ResponseStyle {
  brevity: 'minimal' | 'concise' | 'balanced' | 'detailed';
  tone: 'playful' | 'serious' | 'empathic' | 'direct' | 'adaptive';
  engagement: 'questioning' | 'reflective' | 'supportive' | 'challenging';
}

/**
 * Industry standards and best practices for conversational AI
 * Based on research from:
 * - Therapeutic conversation models
 * - Voice assistant UX patterns
 * - Counseling communication frameworks
 */
export const RESPONSE_STANDARDS = {
  // Token limits by context (1 token ≈ 0.75 words)
  greeting: 20,        // ~15 words, 1 sentence
  acknowledgment: 30,  // ~22 words, 1-2 sentences  
  question: 25,        // ~19 words, 1 sentence
  emotional: 50,       // ~37 words, 2-3 sentences
  exploration: 60,     // ~45 words, 2-3 sentences
  complex: 80,         // ~60 words, 3-4 sentences
  
  // Default for most interactions
  default: 40          // ~30 words, 1-2 sentences
};

/**
 * Analyze user input to determine appropriate response length
 */
export function analyzeInputContext(input: string): {
  suggestedTokens: number;
  contextType: string;
  adaptations: string[];
} {
  const adaptations: string[] = [];
  let contextType = 'default';
  let suggestedTokens = RESPONSE_STANDARDS.default;
  
  // Analyze input characteristics
  const wordCount = input.split(' ').length;
  const hasQuestion = input.includes('?');
  const isGreeting = /^(hi|hey|hello|good morning|good evening)/i.test(input);
  const isEmotional = /feel|hurt|sad|angry|happy|excited|worried|anxious|scared|lonely|afraid/i.test(input);
  const isCrisis = /suicide|kill myself|end it|die|hopeless|can't go on/i.test(input);
  const isPhilosophical = /meaning|purpose|why|existence|reality|consciousness/i.test(input);
  const isShort = wordCount < 5;
  const isLong = wordCount > 30;
  
  // Determine context and response length
  if (isCrisis) {
    contextType = 'crisis';
    suggestedTokens = RESPONSE_STANDARDS.emotional;
    adaptations.push('immediate_support', 'validate_feelings', 'offer_resources');
  } else if (isGreeting) {
    contextType = 'greeting';
    suggestedTokens = RESPONSE_STANDARDS.greeting;
    adaptations.push('warm', 'brief', 'inviting');
  } else if (isEmotional) {
    contextType = 'emotional';
    suggestedTokens = RESPONSE_STANDARDS.emotional;
    adaptations.push('empathic', 'validating', 'gentle');
  } else if (isPhilosophical) {
    contextType = 'philosophical';
    suggestedTokens = RESPONSE_STANDARDS.complex;
    adaptations.push('thoughtful', 'open-ended', 'exploratory');
  } else if (hasQuestion && isShort) {
    contextType = 'brief_question';
    suggestedTokens = RESPONSE_STANDARDS.question;
    adaptations.push('direct', 'clear', 'concise');
  } else if (isLong) {
    contextType = 'detailed_share';
    suggestedTokens = RESPONSE_STANDARDS.exploration;
    adaptations.push('reflective', 'acknowledging', 'curious');
  } else if (isShort) {
    contextType = 'brief_input';
    suggestedTokens = RESPONSE_STANDARDS.acknowledgment;
    adaptations.push('matching_brevity', 'open');
  }
  
  // Conversation flow adaptations
  if (hasQuestion) {
    adaptations.push('answer_first_then_explore');
  }
  
  return {
    suggestedTokens,
    contextType,
    adaptations
  };
}

/**
 * Response tone calibration based on emotional indicators
 */
export function calibrateTone(input: string): ResponseStyle['tone'] {
  const lowerInput = input.toLowerCase();
  
  if (/\b(fun|funny|lol|haha|joke)\b/.test(lowerInput)) {
    return 'playful';
  }
  if (/\b(hurt|pain|sad|depressed|anxious|scared)\b/.test(lowerInput)) {
    return 'empathic';
  }
  if (/\b(explain|how|why|what|understand)\b/.test(lowerInput)) {
    return 'direct';
  }
  if (/\b(serious|important|urgent|need)\b/.test(lowerInput)) {
    return 'serious';
  }
  
  return 'adaptive';
}

/**
 * Best practices for therapeutic conversational AI
 */
export const CONVERSATION_PRINCIPLES = {
  // Core principles from counseling psychology
  unconditionalPositiveRegard: true,
  activeListening: true,
  nonJudgmental: true,
  clientCentered: true,
  
  // Response patterns
  mirrorEnergyLevel: true,        // Match user's energy
  validateBeforeExploring: true,   // Acknowledge feelings first
  oneThoughtPerResponse: true,     // Focus on single ideas
  inviteElaboration: true,          // Use open-ended questions
  
  // Avoid patterns
  avoidAdviceGiving: true,         // Unless directly asked
  avoidAssumptions: true,          // Stay curious
  avoidOverExplaining: true,       // Keep it simple
  avoidRapidFireQuestions: true,   // One question at a time
};