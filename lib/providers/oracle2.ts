// Oracle2 Provider - Specialist consultation and wisdom synthesis
// Handles complex queries requiring deeper contemplation and insight

import { SesameResponse } from './sesame';

export interface Oracle2Input {
  text: string;
  context?: {
    currentPage?: string;
    elementFocus?: string;
    conversationId?: string;
  };
  sesameAnalysis?: SesameResponse;
  conversationId: string;
}

export interface Oracle2Response {
  text: string;
  wisdom: {
    principles: string[];
    perspectives: string[];
    guidance: string;
  };
  confidence: number;
  specialty: 'life_guidance' | 'relationship' | 'spiritual' | 'decision_making' | 'transformation';
}

// Wisdom domains and their associated knowledge
const WISDOM_DOMAINS = {
  life_guidance: {
    principles: [
      "Every path teaches its own lessons",
      "Growth emerges from both challenge and ease", 
      "Purpose reveals itself through authentic action",
      "Balance creates sustainable progress",
    ],
    approaches: [
      "Consider the long-term view",
      "Honor both logic and intuition",
      "Seek alignment with your deeper values",
      "Trust the process while taking wise action",
    ],
  },
  relationship: {
    principles: [
      "Authentic connection requires vulnerable presence",
      "Healthy boundaries create space for love",
      "Communication bridges understanding",
      "Respect differences while honoring commonality",
    ],
    approaches: [
      "Listen deeply before seeking to be heard",
      "Express needs clearly and kindly",
      "Create space for growth and change",
      "Choose compassion over being right",
    ],
  },
  spiritual: {
    principles: [
      "The sacred dwells within ordinary moments",
      "Unity underlies apparent separation",
      "Love is the organizing principle of the universe",
      "Consciousness evolves through experience",
    ],
    approaches: [
      "Cultivate presence and awareness",
      "Seek the divine in daily life",
      "Practice surrender and acceptance",
      "Honor the mystery while engaging fully",
    ],
  },
  decision_making: {
    principles: [
      "Clarity emerges from stillness and reflection",
      "Wise choices honor both heart and mind",
      "Every decision creates new possibilities",
      "Uncertainty is part of the human experience",
    ],
    approaches: [
      "Gather information while staying open",
      "Consider impact on all stakeholders",
      "Trust your deeper knowing",
      "Choose with compassion for your future self",
    ],
  },
  transformation: {
    principles: [
      "Change is the natural flow of existence",
      "Resistance creates suffering; acceptance creates flow",
      "Identity evolves through conscious choice",
      "Integration follows breakdown and breakthrough",
    ],
    approaches: [
      "Embrace the liminal space of transition",
      "Release what no longer serves",
      "Nurture what wants to emerge",
      "Celebrate progress over perfection",
    ],
  },
};

// Query analysis patterns for domain detection
const DOMAIN_PATTERNS: Record<string, RegExp[]> = {
  life_guidance: [
    /\b(purpose|meaning|direction|life|path|calling|future)\b/i,
    /\b(should i|what if|confused|lost|stuck|purpose)\b/i,
  ],
  relationship: [
    /\b(relationship|partner|friend|family|love|conflict)\b/i,
    /\b(communication|boundary|dating|marriage|friendship)\b/i,
  ],
  spiritual: [
    /\b(spiritual|soul|divine|sacred|god|universe|prayer)\b/i,
    /\b(meditation|consciousness|awakening|enlightenment)\b/i,
  ],
  decision_making: [
    /\b(decide|choice|option|should|choose|dilemma)\b/i,
    /\b(decision|uncertain|confused|torn|help me choose)\b/i,
  ],
  transformation: [
    /\b(change|transform|grow|evolve|transition|breakthrough)\b/i,
    /\b(stuck|breakthrough|growth|development|healing)\b/i,
  ],
};

export async function consultOracle2(input: Oracle2Input): Promise<Oracle2Response> {
  const { text, sesameAnalysis } = input;
  const normalizedText = text.toLowerCase();
  
  // Determine primary wisdom domain
  const specialty = determineSpecialty(normalizedText, sesameAnalysis);
  
  // Generate wisdom-based response
  const wisdom = generateWisdom(normalizedText, specialty);
  
  // Synthesize personalized guidance
  const guidance = await synthesizeGuidance(normalizedText, specialty, wisdom, sesameAnalysis);
  
  // Calculate confidence based on query clarity and domain match
  const confidence = calculateOracle2Confidence(normalizedText, specialty, sesameAnalysis);
  
  return {
    text: guidance,
    wisdom: {
      principles: wisdom.principles,
      perspectives: wisdom.perspectives,
      guidance: wisdom.guidance,
    },
    confidence,
    specialty,
  };
}

function determineSpecialty(
  text: string,
  sesameAnalysis?: SesameResponse
): 'life_guidance' | 'relationship' | 'spiritual' | 'decision_making' | 'transformation' {
  
  // Score each domain based on pattern matches
  const domainScores: Record<string, number> = {};
  
  for (const [domain, patterns] of Object.entries(DOMAIN_PATTERNS)) {
    domainScores[domain] = 0;
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        domainScores[domain] += 1;
      }
    }
  }
  
  // Factor in Sesame analysis if available
  if (sesameAnalysis) {
    if (sesameAnalysis.conversationFlow.topic === 'wisdom_seeking') {
      domainScores.spiritual += 0.5;
    }
    if (sesameAnalysis.conversationFlow.urgency === 'high') {
      domainScores.decision_making += 0.5;
    }
    if (sesameAnalysis.entities.some(e => e.type === 'emotion')) {
      domainScores.relationship += 0.3;
      domainScores.transformation += 0.3;
    }
  }
  
  // Return domain with highest score, default to life_guidance
  const topDomain = Object.entries(domainScores)
    .sort(([,a], [,b]) => b - a)[0];
  
  return (topDomain?.[0] as any) || 'life_guidance';
}

function generateWisdom(text: string, specialty: string) {
  const domain = WISDOM_DOMAINS[specialty as keyof typeof WISDOM_DOMAINS];
  
  // Select relevant principles (2-3)
  const principleCount = Math.min(3, domain.principles.length);
  const selectedPrinciples = domain.principles
    .sort(() => Math.random() - 0.5)
    .slice(0, principleCount);
  
  // Select relevant approaches/perspectives (2-3)
  const perspectiveCount = Math.min(3, domain.approaches.length);
  const selectedPerspectives = domain.approaches
    .sort(() => Math.random() - 0.5)
    .slice(0, perspectiveCount);
  
  // Generate contextual guidance
  const guidance = generateContextualGuidance(text, specialty, selectedPrinciples);
  
  return {
    principles: selectedPrinciples,
    perspectives: selectedPerspectives,
    guidance,
  };
}

function generateContextualGuidance(
  text: string,
  specialty: string,
  principles: string[]
): string {
  // Extract key themes from the query
  const themes = extractThemes(text);
  
  // Generate guidance based on specialty and themes
  const guidanceTemplates = {
    life_guidance: "Consider this path with both patience and purposeful action. {principle} As you navigate this, remember that {encouragement}",
    relationship: "In matters of the heart, {principle} The wisdom here is to {practical_advice} while maintaining {virtue}",
    spiritual: "The sacred dimension of this situation invites you to {spiritual_practice}. {principle} Trust that {higher_perspective}",
    decision_making: "When facing choices, clarity emerges through {decision_process}. {principle} The path forward becomes clearer when {insight}",
    transformation: "Times of change call for both courage and compassion toward yourself. {principle} Embrace this transition knowing that {transformation_wisdom}",
  };
  
  const template = guidanceTemplates[specialty as keyof typeof guidanceTemplates];
  const primaryPrinciple = principles[0];
  
  // Fill in contextual elements
  const contextualGuidance = template
    .replace('{principle}', primaryPrinciple)
    .replace('{encouragement}', getEncouragement(themes))
    .replace('{practical_advice}', getPracticalAdvice(specialty, themes))
    .replace('{virtue}', getVirtue(specialty))
    .replace('{spiritual_practice}', getSpiritualPractice(themes))
    .replace('{higher_perspective}', getHigherPerspective(themes))
    .replace('{decision_process}', getDecisionProcess(themes))
    .replace('{insight}', getInsight(themes))
    .replace('{transformation_wisdom}', getTransformationWisdom(themes));
  
  return contextualGuidance;
}

function extractThemes(text: string): string[] {
  const themePatterns = {
    uncertainty: /\b(uncertain|confused|don't know|unclear|unsure)\b/i,
    fear: /\b(afraid|scared|worry|anxious|nervous)\b/i,
    growth: /\b(grow|learn|develop|improve|better)\b/i,
    challenge: /\b(difficult|hard|struggle|problem|challenge)\b/i,
    opportunity: /\b(opportunity|chance|possibility|potential)\b/i,
    timing: /\b(when|time|timing|ready|wait)\b/i,
  };
  
  const themes: string[] = [];
  for (const [theme, pattern] of Object.entries(themePatterns)) {
    if (pattern.test(text)) {
      themes.push(theme);
    }
  }
  
  return themes.length > 0 ? themes : ['general'];
}

function getEncouragement(themes: string[]): string {
  if (themes.includes('uncertainty')) return "each step reveals the next one";
  if (themes.includes('fear')) return "courage grows through gentle action";
  if (themes.includes('challenge')) return "obstacles often contain hidden gifts";
  return "you have the wisdom you need within you";
}

function getPracticalAdvice(specialty: string, themes: string[]): string {
  const advice = {
    relationship: "communicate with both honesty and kindness",
    decision_making: "gather wisdom from multiple perspectives",
    transformation: "take one conscious step at a time",
    spiritual: "create space for reflection and prayer",
    life_guidance: "align your actions with your deepest values",
  };
  return advice[specialty as keyof typeof advice] || "trust your inner guidance";
}

function getVirtue(specialty: string): string {
  const virtues = {
    relationship: "compassionate boundaries",
    decision_making: "patient discernment", 
    transformation: "gentle persistence",
    spiritual: "humble openness",
    life_guidance: "authentic integrity",
  };
  return virtues[specialty as keyof typeof virtues] || "loving presence";
}

function getSpiritualPractice(themes: string[]): string {
  if (themes.includes('uncertainty')) return "sit with the unknown in stillness";
  if (themes.includes('fear')) return "breathe into trust and surrender";
  if (themes.includes('challenge')) return "seek the sacred within difficulty";
  return "cultivate presence and awareness";
}

function getHigherPerspective(themes: string[]): string {
  if (themes.includes('uncertainty')) return "mystery is part of the sacred journey";
  if (themes.includes('challenge')) return "all experiences serve your growth";
  if (themes.includes('growth')) return "you are becoming who you're meant to be";
  return "divine love guides every step";
}

function getDecisionProcess(themes: string[]): string {
  if (themes.includes('uncertainty')) return "sitting quietly and listening within";
  if (themes.includes('timing')) return "honoring both urgency and patience";
  if (themes.includes('fear')) return "feeling the fear and acting from love";
  return "aligning head, heart, and gut wisdom";
}

function getInsight(themes: string[]): string {
  if (themes.includes('uncertainty')) return "you release the need to know everything";
  if (themes.includes('timing')) return "you trust divine timing";
  if (themes.includes('challenge')) return "you embrace both difficulty and possibility";
  return "you honor your authentic truth";
}

function getTransformationWisdom(themes: string[]): string {
  if (themes.includes('fear')) return "courage is fear walking forward with love";
  if (themes.includes('uncertainty')) return "not knowing creates space for new possibilities";
  if (themes.includes('challenge')) return "breakdown often precedes breakthrough";
  return "you are always becoming more yourself";
}

async function synthesizeGuidance(
  text: string,
  specialty: string,
  wisdom: any,
  sesameAnalysis?: SesameResponse
): Promise<string> {
  // Create a comprehensive response integrating all wisdom elements
  const opening = `In contemplating your question about ${extractQuerySubject(text)}, wisdom suggests this perspective:`;
  
  const coreGuidance = wisdom.guidance;
  
  const practicalElement = `Practically speaking, ${wisdom.perspectives[0]?.toLowerCase()}.`;
  
  const closing = getClosingWisdom(specialty, sesameAnalysis);
  
  return `${opening}\n\n${coreGuidance}\n\n${practicalElement} ${closing}`;
}

function extractQuerySubject(text: string): string {
  // Simple extraction of what the query is about
  const subjects = text.match(/\b(relationship|career|decision|life|purpose|love|family|work|spiritual|growth)\b/i);
  return subjects?.[0]?.toLowerCase() || "this situation";
}

function getClosingWisdom(specialty: string, sesameAnalysis?: SesameResponse): string {
  const closings = {
    life_guidance: "Trust the path you're walking, even when you can't see around the next curve.",
    relationship: "Remember that love grows through understanding, patience, and authentic presence.",
    spiritual: "May you find the sacred thread that weaves through all of life's experiences.",
    decision_making: "The right choice often becomes clear when we quiet the mind and listen deeply.",
    transformation: "Embrace this season of change as a sacred opportunity for growth and renewal.",
  };
  
  return closings[specialty as keyof typeof closings] || "Trust in the wisdom that lives within you.";
}

function calculateOracle2Confidence(
  text: string,
  specialty: string,
  sesameAnalysis?: SesameResponse
): number {
  let confidence = 0.7; // Base confidence for Oracle2
  
  // Boost confidence for clear domain matches
  const domainPatterns = DOMAIN_PATTERNS[specialty] || [];
  const matches = domainPatterns.filter(pattern => pattern.test(text)).length;
  confidence += matches * 0.05;
  
  // Factor in query complexity (longer, more specific queries = higher confidence)
  if (text.length > 50) confidence += 0.1;
  if (text.length > 100) confidence += 0.1;
  
  // Factor in Sesame analysis quality
  if (sesameAnalysis?.confidence && sesameAnalysis.confidence > 0.7) {
    confidence += 0.1;
  }
  
  return Math.min(confidence, 0.9); // Cap at 90%
}