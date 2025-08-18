// PSI Provider - User tendencies and elemental balance analysis
// Analyzes patterns and recommends elemental focus for optimal experience

export interface PSIInput {
  text: string;
  context?: {
    currentPage?: string;
    elementFocus?: string;
    conversationId?: string;
  };
  conversationId: string;
}

export interface PSIResponse {
  elementRecommendation: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  confidence: number;
  analysis: {
    detectedElements: Array<{
      element: string;
      strength: number;
      indicators: string[];
    }>;
    energyPattern: 'balanced' | 'focused' | 'seeking' | 'scattered';
    recommendation: string;
  };
  userTendencies: {
    preferredElements: string[];
    communicationStyle: 'direct' | 'reflective' | 'exploratory' | 'decisive';
    engagementLevel: 'high' | 'medium' | 'low';
  };
}

// Elemental indicators in language patterns
const ELEMENTAL_INDICATORS = {
  fire: {
    keywords: [
      'passion', 'energy', 'action', 'power', 'drive', 'intensity', 'motivation',
      'goal', 'achieve', 'success', 'competition', 'leadership', 'courage',
      'excitement', 'enthusiasm', 'ambitious', 'dynamic', 'fast', 'quick'
    ],
    patterns: [
      /\b(need to|want to|going to|will|must|should)\s+\w+/gi,
      /\b(now|immediately|urgent|asap|quickly)\b/gi,
      /[!]{1,}/g, // Exclamation marks
    ],
    emotional_indicators: ['excited', 'motivated', 'driven', 'passionate', 'ambitious'],
  },
  water: {
    keywords: [
      'feel', 'emotion', 'intuition', 'flow', 'adapt', 'change', 'fluid',
      'empathy', 'compassion', 'sensitivity', 'understanding', 'deep',
      'reflection', 'meditation', 'healing', 'nurture', 'care', 'love'
    ],
    patterns: [
      /\bi feel\b/gi,
      /\bhow does\b/gi,
      /\bsense that\b/gi,
      /\.\.\./g, // Ellipses indicating reflection
    ],
    emotional_indicators: ['emotional', 'sensitive', 'caring', 'empathetic', 'intuitive'],
  },
  earth: {
    keywords: [
      'practical', 'stable', 'grounded', 'solid', 'reliable', 'consistent',
      'step', 'process', 'method', 'plan', 'structure', 'foundation',
      'build', 'create', 'manifest', 'tangible', 'real', 'concrete'
    ],
    patterns: [
      /\bstep by step\b/gi,
      /\bfirst.*then.*finally\b/gi,
      /\bhow to\b/gi,
      /\bplan\b/gi,
    ],
    emotional_indicators: ['steady', 'reliable', 'patient', 'practical', 'grounded'],
  },
  air: {
    keywords: [
      'think', 'idea', 'concept', 'understand', 'clarity', 'communicate',
      'speak', 'express', 'share', 'discuss', 'explore', 'question',
      'wonder', 'curious', 'learn', 'study', 'research', 'analyze'
    ],
    patterns: [
      /\bi think\b/gi,
      /\bwhat if\b/gi,
      /\bwhy\b/gi,
      /\bhow\b/gi,
      /\?\s/g, // Questions
    ],
    emotional_indicators: ['curious', 'thoughtful', 'analytical', 'communicative', 'open'],
  },
  aether: {
    keywords: [
      'spiritual', 'soul', 'divine', 'sacred', 'transcendent', 'mystical',
      'universe', 'cosmic', 'infinite', 'eternal', 'consciousness',
      'awareness', 'enlightenment', 'wisdom', 'meaning', 'purpose'
    ],
    patterns: [
      /\bsoul\b/gi,
      /\buniverse\b/gi,
      /\bdivine\b/gi,
      /\bmeaning of\b/gi,
    ],
    emotional_indicators: ['spiritual', 'wise', 'transcendent', 'mystical', 'enlightened'],
  },
};

// Communication style patterns
const COMMUNICATION_PATTERNS = {
  direct: [
    /\b(yes|no)\b/gi,
    /\b(want|need|must|will)\b/gi,
    /\b(now|immediately|quickly)\b/gi,
  ],
  reflective: [
    /\b(feel|sense|wonder|perhaps|maybe)\b/gi,
    /\?\s/g,
    /\.\.\./g,
  ],
  exploratory: [
    /\b(what if|why|how|could|might)\b/gi,
    /\b(explore|discover|learn|understand)\b/gi,
  ],
  decisive: [
    /\b(will|going to|plan to|decided)\b/gi,
    /\b(definitely|certainly|absolutely)\b/gi,
  ],
};

export async function analyzePSI(input: PSIInput): Promise<PSIResponse> {
  const { text, context } = input;
  const normalizedText = text.toLowerCase();
  
  // Analyze elemental presence in the text
  const elementalAnalysis = analyzeElementalPresence(normalizedText);
  
  // Determine primary element recommendation
  const elementRecommendation = determineElementRecommendation(
    elementalAnalysis,
    context?.elementFocus as any
  );
  
  // Analyze communication style
  const communicationStyle = analyzeCommunicationStyle(normalizedText);
  
  // Determine engagement level
  const engagementLevel = analyzeEngagementLevel(text);
  
  // Generate energy pattern assessment
  const energyPattern = analyzeEnergyPattern(elementalAnalysis);
  
  // Calculate confidence based on signal strength
  const confidence = calculatePSIConfidence(elementalAnalysis, text);
  
  return {
    elementRecommendation,
    confidence,
    analysis: {
      detectedElements: elementalAnalysis,
      energyPattern,
      recommendation: generateElementRecommendation(elementRecommendation, energyPattern),
    },
    userTendencies: {
      preferredElements: getTopElements(elementalAnalysis, 2),
      communicationStyle,
      engagementLevel,
    },
  };
}

function analyzeElementalPresence(text: string) {
  const results: Array<{
    element: string;
    strength: number;
    indicators: string[];
  }> = [];
  
  for (const [element, data] of Object.entries(ELEMENTAL_INDICATORS)) {
    let strength = 0;
    const indicators: string[] = [];
    
    // Keyword analysis
    for (const keyword of data.keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text.match(regex) || [];
      if (matches.length > 0) {
        strength += matches.length * 0.5;
        indicators.push(`${keyword} (${matches.length}x)`);
      }
    }
    
    // Pattern analysis
    for (const pattern of data.patterns) {
      const matches = text.match(pattern) || [];
      if (matches.length > 0) {
        strength += matches.length * 0.3;
        indicators.push(`${pattern.source} pattern (${matches.length}x)`);
      }
    }
    
    // Emotional indicator analysis
    for (const emotion of data.emotional_indicators) {
      const regex = new RegExp(`\\b${emotion}\\b`, 'gi');
      if (regex.test(text)) {
        strength += 0.7;
        indicators.push(`emotional: ${emotion}`);
      }
    }
    
    results.push({
      element,
      strength: Math.round(strength * 100) / 100,
      indicators,
    });
  }
  
  return results.sort((a, b) => b.strength - a.strength);
}

function determineElementRecommendation(
  analysis: Array<{ element: string; strength: number }>,
  currentFocus?: 'fire' | 'water' | 'earth' | 'air' | 'aether'
): 'fire' | 'water' | 'earth' | 'air' | 'aether' {
  
  // If there's a clear winner (strength > 2.0), recommend it
  const topElement = analysis[0];
  if (topElement.strength > 2.0) {
    return topElement.element as any;
  }
  
  // If energies are balanced, check current focus and recommend complementary
  const secondElement = analysis[1];
  if (topElement.strength - secondElement.strength < 0.5) {
    // Balanced energy - recommend complementary element
    if (currentFocus) {
      const complementary = getComplementaryElement(currentFocus);
      return complementary;
    }
  }
  
  // Default recommendation based on top element or Air if unclear
  return (topElement.element as any) || 'air';
}

function getComplementaryElement(element: string): 'fire' | 'water' | 'earth' | 'air' | 'aether' {
  const complements = {
    fire: 'water',    // Cool the intensity
    water: 'earth',   // Ground the emotion
    earth: 'air',     // Lift the heaviness
    air: 'fire',      // Add passion to ideas
    aether: 'earth',  // Manifest the mystical
  };
  
  return (complements[element as keyof typeof complements] as any) || 'air';
}

function analyzeCommunicationStyle(text: string): 'direct' | 'reflective' | 'exploratory' | 'decisive' {
  const scores = {
    direct: 0,
    reflective: 0,
    exploratory: 0,
    decisive: 0,
  };
  
  for (const [style, patterns] of Object.entries(COMMUNICATION_PATTERNS)) {
    for (const pattern of patterns) {
      const matches = text.match(pattern) || [];
      scores[style as keyof typeof scores] += matches.length;
    }
  }
  
  // Return style with highest score, default to reflective
  const topStyle = Object.entries(scores)
    .sort(([,a], [,b]) => b - a)[0];
  
  return (topStyle?.[0] as any) || 'reflective';
}

function analyzeEngagementLevel(text: string): 'high' | 'medium' | 'low' {
  const length = text.length;
  const exclamationCount = (text.match(/!/g) || []).length;
  const questionCount = (text.match(/\?/g) || []).length;
  const emotionalWords = text.match(/\b(amazing|terrible|love|hate|excited|worried|passionate)\b/gi) || [];
  
  let score = 0;
  
  // Length indicates engagement
  if (length > 100) score += 2;
  else if (length > 50) score += 1;
  
  // Punctuation indicates engagement
  score += exclamationCount * 0.5;
  score += questionCount * 0.3;
  
  // Emotional language indicates engagement
  score += emotionalWords.length * 0.4;
  
  if (score > 3) return 'high';
  if (score > 1.5) return 'medium';
  return 'low';
}

function analyzeEnergyPattern(analysis: Array<{ element: string; strength: number }>): 'balanced' | 'focused' | 'seeking' | 'scattered' {
  const topStrength = analysis[0]?.strength || 0;
  const secondStrength = analysis[1]?.strength || 0;
  const totalElements = analysis.filter(e => e.strength > 0.5).length;
  
  // Focused: One element clearly dominant
  if (topStrength > 3 && topStrength - secondStrength > 1.5) {
    return 'focused';
  }
  
  // Balanced: Top elements are close in strength
  if (topStrength > 0 && secondStrength > 0 && topStrength - secondStrength < 1) {
    return 'balanced';
  }
  
  // Scattered: Many elements present but none dominant
  if (totalElements > 3 && topStrength < 2) {
    return 'scattered';
  }
  
  // Seeking: Low overall elemental presence
  return 'seeking';
}

function generateElementRecommendation(
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether',
  pattern: string
): string {
  const recommendations = {
    fire: {
      focused: "Your fire energy is strong. Channel this passion into purposeful action.",
      balanced: "Fire energy harmonizes well with your other elements. Use this drive wisely.",
      seeking: "Fire energy could energize your current state. Consider igniting your passion.",
      scattered: "Fire energy might help focus your scattered energies into clear action.",
    },
    water: {
      focused: "Your water energy flows deeply. Trust your intuition and emotional wisdom.",
      balanced: "Water energy creates beautiful flow with your other elements. Stay fluid.",
      seeking: "Water energy could bring the emotional depth you're seeking. Feel into it.",
      scattered: "Water energy might help you flow more naturally between your various interests.",
    },
    earth: {
      focused: "Your earth energy is solid. Ground your ideas in practical, tangible steps.",
      balanced: "Earth energy provides stability for your other elemental qualities. Build steadily.",
      seeking: "Earth energy could provide the grounding you need. Focus on practical steps.",
      scattered: "Earth energy might help consolidate your various interests into concrete action.",
    },
    air: {
      focused: "Your air energy is clear. Use this mental clarity to communicate and connect.",
      balanced: "Air energy lifts and connects your other elements beautifully. Think and share.",
      seeking: "Air energy could bring the clarity and perspective you're seeking. Open your mind.",
      scattered: "Air energy might help you see connections between your scattered interests.",
    },
    aether: {
      focused: "Your aether energy is transcendent. Connect with the sacred dimension of experience.",
      balanced: "Aether energy weaves through your other elements mystically. Trust the deeper pattern.",
      seeking: "Aether energy could reveal the spiritual dimension you're seeking. Look beyond the surface.",
      scattered: "Aether energy might help you see the sacred thread connecting all your interests.",
    },
  };
  
  return recommendations[element][pattern as keyof typeof recommendations[typeof element]] ||
    "This elemental energy offers guidance for your current journey.";
}

function getTopElements(analysis: Array<{ element: string; strength: number }>, count: number): string[] {
  return analysis
    .filter(e => e.strength > 0.3)
    .slice(0, count)
    .map(e => e.element);
}

function calculatePSIConfidence(
  analysis: Array<{ element: string; strength: number; indicators: string[] }>,
  text: string
): number {
  const topStrength = analysis[0]?.strength || 0;
  const textLength = text.length;
  
  let confidence = 0.4; // Base confidence
  
  // Higher strength = higher confidence
  confidence += Math.min(topStrength * 0.1, 0.3);
  
  // Longer text = more data = higher confidence
  if (textLength > 50) confidence += 0.1;
  if (textLength > 100) confidence += 0.1;
  
  // Multiple indicators = higher confidence
  const totalIndicators = analysis.reduce((sum, e) => sum + (e.indicators?.length || 0), 0);
  confidence += Math.min(totalIndicators * 0.02, 0.2);
  
  return Math.min(confidence, 0.85); // Cap at 85%
}