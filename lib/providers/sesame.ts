// Sesame Provider - Core conversation processing and intent analysis
// Handles natural language understanding and conversation flow
// Integrates with Spiralogic archetype and soul phase detection

import { inferArchetypeHints } from '../spiralogic/heuristics';

export interface SesameInput {
  text: string;
  context?: {
    currentPage?: string;
    elementFocus?: string;
    conversationId?: string;
  };
  conversationId: string;
}

export interface SesameResponse {
  intent: string;
  entities: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
  needsSpecialist: boolean;
  suggestedPage?: string;
  conversationFlow: {
    topic: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    urgency: 'low' | 'medium' | 'high';
  };
  confidence: number;
  spiralogic?: {
    archetypeHints: Array<{ name: string; bias: string[] }>;
  };
}

// Intent patterns for conversation routing
const INTENT_PATTERNS: Record<string, RegExp[]> = {
  navigation: [
    /(?:go to|open|show|navigate to)\s+(now|oracle|journal|mirror|spirals)/i,
    /(?:take me to|switch to)\s+(\w+)/i,
  ],
  oracle_query: [
    /(?:ask|consult|what does|oracle)/i,
    /(?:wisdom|insight|guidance|advice)/i,
    /(?:should i|what if|help me decide)/i,
  ],
  journal_entry: [
    /(?:write|add|record|note|journal)/i,
    /(?:today i|feeling|experienced|learned)/i,
  ],
  soul_mirror: [
    /(?:soul|mirror|element|balance|focus)/i,
    /(?:fire|water|earth|air|aether)/i,
    /(?:how am i|what element|my balance)/i,
  ],
  spirals_development: [
    /(?:spiral|development|growth|progress)/i,
    /(?:working on|practicing|developing)/i,
  ],
  general: [/.*/], // Fallback
};

// Specialist consultation triggers
const SPECIALIST_TRIGGERS = [
  /(?:oracle|wisdom|insight|guidance|advice)/i,
  /(?:should i|what if|help me decide)/i,
  /(?:complex|difficult|important|serious)/i,
  /(?:life|relationship|career|spiritual)/i,
];

// Page mapping for navigation
const PAGE_MAPPING: Record<string, string> = {
  now: '/now',
  oracle: '/oracle',
  journal: '/journal',
  mirror: '/mirror',
  'soul mirror': '/mirror',
  spirals: '/spirals',
  development: '/spirals',
};

export async function processSesameInput(input: SesameInput): Promise<SesameResponse> {
  const { text, context } = input;
  const normalizedText = text.toLowerCase().trim();
  
  // Spiralogic archetype analysis (runs in parallel with intent detection)
  const spiralogicPromise = Promise.resolve().then(() => {
    try {
      return inferArchetypeHints(text);
    } catch (error) {
      console.warn('Spiralogic analysis failed:', error);
      return [];
    }
  });
  
  // Intent detection
  let detectedIntent = 'general';
  let confidence = 0.5;
  
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(normalizedText)) {
        detectedIntent = intent;
        confidence = intent === 'general' ? 0.3 : 0.8;
        break;
      }
    }
    if (detectedIntent !== 'general') break;
  }
  
  // Entity extraction
  const entities: Array<{ type: string; value: string; confidence: number }> = [];
  
  // Extract page names
  const pageMatch = normalizedText.match(/(?:go to|open|show)\s+(\w+)/i);
  if (pageMatch) {
    entities.push({
      type: 'page',
      value: pageMatch[1],
      confidence: 0.9,
    });
  }
  
  // Extract element names
  const elementMatch = normalizedText.match(/\b(fire|water|earth|air|aether)\b/i);
  if (elementMatch) {
    entities.push({
      type: 'element',
      value: elementMatch[1].toLowerCase(),
      confidence: 0.9,
    });
  }
  
  // Extract emotions/feelings
  const emotionMatch = normalizedText.match(/\b(happy|sad|angry|calm|excited|worried|peaceful|stressed)\b/i);
  if (emotionMatch) {
    entities.push({
      type: 'emotion',
      value: emotionMatch[1].toLowerCase(),
      confidence: 0.7,
    });
  }
  
  // Determine if specialist consultation needed
  const needsSpecialist = SPECIALIST_TRIGGERS.some(trigger => trigger.test(normalizedText)) ||
    detectedIntent === 'oracle_query';
  
  // Suggest page navigation
  let suggestedPage: string | undefined;
  const pageEntity = entities.find(e => e.type === 'page');
  if (pageEntity && PAGE_MAPPING[pageEntity.value]) {
    suggestedPage = PAGE_MAPPING[pageEntity.value];
  } else if (detectedIntent === 'oracle_query') {
    suggestedPage = '/oracle';
  } else if (detectedIntent === 'journal_entry') {
    suggestedPage = '/journal';
  } else if (detectedIntent === 'soul_mirror') {
    suggestedPage = '/mirror';
  } else if (detectedIntent === 'spirals_development') {
    suggestedPage = '/spirals';
  }
  
  // Analyze conversation flow
  const sentiment = analyzeSentiment(normalizedText);
  const urgency = analyzeUrgency(normalizedText);
  const topic = extractTopic(normalizedText, detectedIntent);
  
  // Wait for Spiralogic analysis
  const archetypeHints = await spiralogicPromise;
  
  return {
    intent: detectedIntent,
    entities,
    needsSpecialist,
    suggestedPage,
    conversationFlow: {
      topic,
      sentiment,
      urgency,
    },
    confidence,
    spiralogic: archetypeHints.length > 0 ? {
      archetypeHints,
    } : undefined,
  };
}

function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const positiveWords = /\b(good|great|happy|excited|love|amazing|wonderful|perfect|excellent)\b/i;
  const negativeWords = /\b(bad|terrible|hate|angry|sad|worried|awful|horrible|stressed)\b/i;
  
  if (positiveWords.test(text)) return 'positive';
  if (negativeWords.test(text)) return 'negative';
  return 'neutral';
}

function analyzeUrgency(text: string): 'low' | 'medium' | 'high' {
  const highUrgency = /\b(urgent|emergency|immediately|asap|help|crisis|important)\b/i;
  const mediumUrgency = /\b(soon|quickly|need|should|must|problem)\b/i;
  
  if (highUrgency.test(text)) return 'high';
  if (mediumUrgency.test(text)) return 'medium';
  return 'low';
}

function extractTopic(text: string, intent: string): string {
  // Topic extraction based on intent and keywords
  const topicPatterns: Record<string, string> = {
    oracle_query: 'wisdom_seeking',
    journal_entry: 'reflection',
    soul_mirror: 'self_discovery',
    spirals_development: 'personal_growth',
    navigation: 'interface_interaction',
  };
  
  return topicPatterns[intent] || 'general_conversation';
}