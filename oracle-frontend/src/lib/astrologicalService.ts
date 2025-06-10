// 🌟 Astrological Service for Oracle Agent Assignment
// Maps birth data to elemental archetypes and oracle agents

interface BirthData {
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM
  birthLocation: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

interface AstrologicalProfile {
  sunSign: string;
  moonSign: string;
  ascendantSign: string;
  dominantElement: 'fire' | 'water' | 'earth' | 'air';
  elementalPercentages: {
    fire: number;
    water: number;
    earth: number;
    air: number;
  };
  dominantModality: 'cardinal' | 'fixed' | 'mutable';
  soulPurposeIndicator: string;
}

interface ElementalArchetype {
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  archetype: string;
  traits: string[];
  agentDescription: string;
  specialties: string[];
  protocolPreferences: string[];
}

// Zodiac sign to element mapping
const SIGN_ELEMENTS: Record<string, 'fire' | 'water' | 'earth' | 'air'> = {
  // Fire signs
  'aries': 'fire',
  'leo': 'fire',
  'sagittarius': 'fire',
  
  // Water signs
  'cancer': 'water',
  'scorpio': 'water',
  'pisces': 'water',
  
  // Earth signs
  'taurus': 'earth',
  'virgo': 'earth',
  'capricorn': 'earth',
  
  // Air signs
  'gemini': 'air',
  'libra': 'air',
  'aquarius': 'air'
};

// Zodiac sign to modality mapping
const SIGN_MODALITIES: Record<string, 'cardinal' | 'fixed' | 'mutable'> = {
  'aries': 'cardinal', 'cancer': 'cardinal', 'libra': 'cardinal', 'capricorn': 'cardinal',
  'taurus': 'fixed', 'leo': 'fixed', 'scorpio': 'fixed', 'aquarius': 'fixed',
  'gemini': 'mutable', 'virgo': 'mutable', 'sagittarius': 'mutable', 'pisces': 'mutable'
};

// Symbolic Intelligence Agent definitions
const ELEMENTAL_ARCHETYPES: Record<string, ElementalArchetype> = {
  catalyst_agent: {
    element: 'fire',
    archetype: 'Catalyst Agent',
    traits: ['catalytic', 'clarifying', 'action-oriented', 'decisive', 'momentum-building'],
    agentDescription: 'Helps spark action, clarity of will, and personal agency',
    specialties: ['action planning', 'decision clarity', 'momentum building', 'will development', 'breakthrough facilitation'],
    protocolPreferences: ['focused intention setting', 'movement practices', 'energy work', 'action planning', 'breakthrough protocols']
  },
  depth_agent: {
    element: 'water',
    archetype: 'Depth Agent',
    traits: ['perceptive', 'reflective', 'emotionally intelligent', 'pattern-aware', 'integrative'],
    agentDescription: 'Assists with emotional insight, dream reflection, and subconscious patterning',
    specialties: ['emotional intelligence', 'pattern recognition', 'dream analysis', 'subconscious exploration', 'integration work'],
    protocolPreferences: ['reflective practices', 'depth journaling', 'pattern mapping', 'emotional processing', 'integration protocols']
  },
  structuring_agent: {
    element: 'earth',
    archetype: 'Structuring Agent',
    traits: ['methodical', 'grounding', 'systematic', 'stabilizing', 'embodiment-focused'],
    agentDescription: 'Grounds vision into embodied action, stability, and form',
    specialties: ['implementation planning', 'systems design', 'habit formation', 'resource management', 'sustainable practices'],
    protocolPreferences: ['embodied practices', 'routine building', 'grounding techniques', 'environmental design', 'stability protocols']
  },
  pattern_agent: {
    element: 'air',
    archetype: 'Pattern Agent',
    traits: ['analytical', 'pattern-recognizing', 'clarifying', 'systematic', 'perspective-shifting'],
    agentDescription: 'Facilitates clarity, signal mapping, and mental organization',
    specialties: ['pattern recognition', 'systems thinking', 'information organization', 'clarity facilitation', 'perspective development'],
    protocolPreferences: ['mindfulness practices', 'cognitive mapping', 'analytical reflection', 'clarity protocols', 'perspective work']
  },
  integrative_agent: {
    element: 'aether',
    archetype: 'Integrative Agent',
    traits: ['synthesizing', 'holistic', 'balancing', 'coherence-building', 'integrative'],
    agentDescription: 'Oversees symbolic synthesis, coherence, and growth tracking',
    specialties: ['symbolic synthesis', 'coherence building', 'growth tracking', 'elemental balance', 'integration facilitation'],
    protocolPreferences: ['synthesis practices', 'balance work', 'integration protocols', 'coherence mapping', 'holistic reflection']
  }
};

/**
 * Calculate birth chart basics from birth data
 * This is a simplified implementation - in production you'd use a proper ephemeris
 */
export function calculateBasicChart(birthData: BirthData): AstrologicalProfile {
  const birthDate = new Date(birthData.birthDate + 'T' + birthData.birthTime);
  const dayOfYear = Math.floor((birthDate.getTime() - new Date(birthDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  
  // Simplified sun sign calculation (approximate)
  const sunSign = getSunSign(dayOfYear);
  
  // For now, use simplified calculations
  // In production, you'd integrate with a proper astronomical library
  const moonSign = getMoonSign(birthDate, sunSign);
  const ascendantSign = getAscendantSign(birthData.birthTime, sunSign);
  
  // Calculate elemental distribution
  const elementalPercentages = calculateElementalDistribution(sunSign, moonSign, ascendantSign);
  
  // Determine dominant element
  const dominantElement = Object.entries(elementalPercentages)
    .reduce((a, b) => elementalPercentages[a[0] as keyof typeof elementalPercentages] > elementalPercentages[b[0] as keyof typeof elementalPercentages] ? a : b)[0] as 'fire' | 'water' | 'earth' | 'air';
  
  return {
    sunSign,
    moonSign,
    ascendantSign,
    dominantElement,
    elementalPercentages,
    dominantModality: SIGN_MODALITIES[sunSign] || 'cardinal',
    soulPurposeIndicator: generateSoulPurpose(sunSign, moonSign, ascendantSign)
  };
}

function getSunSign(dayOfYear: number): string {
  // Simplified sun sign calculation
  if (dayOfYear >= 80 && dayOfYear < 111) return 'aries';
  if (dayOfYear >= 111 && dayOfYear < 142) return 'taurus';
  if (dayOfYear >= 142 && dayOfYear < 173) return 'gemini';
  if (dayOfYear >= 173 && dayOfYear < 204) return 'cancer';
  if (dayOfYear >= 204 && dayOfYear < 235) return 'leo';
  if (dayOfYear >= 235 && dayOfYear < 266) return 'virgo';
  if (dayOfYear >= 266 && dayOfYear < 297) return 'libra';
  if (dayOfYear >= 297 && dayOfYear < 328) return 'scorpio';
  if (dayOfYear >= 328 && dayOfYear < 359) return 'sagittarius';
  if (dayOfYear >= 359 || dayOfYear < 19) return 'capricorn';
  if (dayOfYear >= 19 && dayOfYear < 50) return 'aquarius';
  return 'pisces';
}

function getMoonSign(birthDate: Date, sunSign: string): string {
  // Simplified moon sign calculation (rotates through signs every ~2.5 days)
  const moonCycle = Math.floor(birthDate.getTime() / (1000 * 60 * 60 * 24 * 2.5)) % 12;
  const signs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 
                 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
  return signs[moonCycle];
}

function getAscendantSign(birthTime: string, sunSign: string): string {
  // Simplified ascendant calculation (changes every 2 hours)
  const [hours] = birthTime.split(':').map(Number);
  const ascendantIndex = Math.floor(hours / 2) % 12;
  const signs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 
                 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
  return signs[ascendantIndex];
}

function calculateElementalDistribution(sun: string, moon: string, ascendant: string) {
  const elements = { fire: 0, water: 0, earth: 0, air: 0 };
  
  // Weight: Sun 40%, Moon 35%, Ascendant 25%
  elements[SIGN_ELEMENTS[sun]] += 40;
  elements[SIGN_ELEMENTS[moon]] += 35;
  elements[SIGN_ELEMENTS[ascendant]] += 25;
  
  return elements;
}

function generateSoulPurpose(sun: string, moon: string, ascendant: string): string {
  const sunElement = SIGN_ELEMENTS[sun];
  const moonElement = SIGN_ELEMENTS[moon];
  
  if (sunElement === 'fire' && moonElement === 'water') {
    return 'Passionate Healer - Transform through emotional alchemy';
  } else if (sunElement === 'earth' && moonElement === 'air') {
    return 'Grounded Visionary - Manifest ideas through practical wisdom';
  } else if (sunElement === 'air' && moonElement === 'fire') {
    return 'Inspired Communicator - Ignite others through your words';
  } else if (sunElement === 'water' && moonElement === 'earth') {
    return 'Intuitive Builder - Create from deep knowing';
  }
  
  return `${sunElement.charAt(0).toUpperCase() + sunElement.slice(1)} Soul - Path of ${sunElement} wisdom`;
}

/**
 * Assign oracle agent based on astrological profile
 */
export function assignOracleAgent(profile: AstrologicalProfile): ElementalArchetype {
  const { dominantElement, dominantModality, elementalPercentages } = profile;
  
  // Special case: if elements are very balanced, assign Integrative Agent
  const maxPercentage = Math.max(...Object.values(elementalPercentages));
  if (maxPercentage < 45) {
    return ELEMENTAL_ARCHETYPES.integrative_agent;
  }
  
  // Assign based on dominant element (simplified to one agent per element for clarity)
  if (dominantElement === 'fire') {
    return ELEMENTAL_ARCHETYPES.catalyst_agent;
  } else if (dominantElement === 'water') {
    return ELEMENTAL_ARCHETYPES.depth_agent;
  } else if (dominantElement === 'earth') {
    return ELEMENTAL_ARCHETYPES.structuring_agent;
  } else {
    return ELEMENTAL_ARCHETYPES.pattern_agent;
  }
}

/**
 * Generate agent name based on archetype
 */
export function generateAgentName(archetype: ElementalArchetype): string {
  // Return the functional archetype name
  return archetype.archetype;
}

/**
 * Get location coordinates (simplified implementation)
 * In production, you'd use a geocoding service
 */
export async function getLocationCoordinates(location: string): Promise<{ latitude: number; longitude: number; timezone: string }> {
  // Simplified mapping of common locations
  const locations: Record<string, { latitude: number; longitude: number; timezone: string }> = {
    'new york': { latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
    'los angeles': { latitude: 34.0522, longitude: -118.2437, timezone: 'America/Los_Angeles' },
    'london': { latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
    'paris': { latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
    'maui': { latitude: 20.7984, longitude: -156.3319, timezone: 'Pacific/Honolulu' },
    'san francisco': { latitude: 37.7749, longitude: -122.4194, timezone: 'America/Los_Angeles' }
  };
  
  const normalized = location.toLowerCase().trim();
  
  if (locations[normalized]) {
    return locations[normalized];
  }
  
  // Default to GMT if location not found
  return { latitude: 0, longitude: 0, timezone: 'GMT' };
}