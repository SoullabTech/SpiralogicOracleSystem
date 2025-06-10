// 🔮 Symbol Parser for Dream → Oracle Flow
// Analyzes dreams and maps symbols to archetypal triggers and ritual suggestions

interface DreamSymbol {
  symbol: string;
  confidence: number;
  context: string;
  archetypal_resonance: string[];
}

interface SymbolMeaning {
  universal: string;
  elemental_meanings: {
    fire: string;
    water: string;
    earth: string;
    air: string;
    aether: string;
  };
  shadow_aspect: string;
  protocol_triggers: string[];
  emotional_indicators: string[];
}

interface ParsedDream {
  symbols: DreamSymbol[];
  dominant_elements: string[];
  emotional_tone: string;
  lucidity_indicators: string[];
  suggested_protocols: string[];
  archetypal_themes: string[];
  oracle_prompts: string[];
}

// Comprehensive symbol dictionary
const SYMBOL_MEANINGS: Record<string, SymbolMeaning> = {
  snake: {
    universal: "Transformation, healing, ancient wisdom, cycles of death and rebirth",
    elemental_meanings: {
      fire: "Kundalini awakening, passionate transformation, sexual energy",
      water: "Emotional healing, cleansing tears, flow of consciousness",
      earth: "Grounding wisdom, connection to earth mysteries, ancestral knowing",
      air: "Mental transformation, communication from higher realms",
      aether: "Spiritual awakening, transcendence of ego, divine wisdom"
    },
    shadow_aspect: "Fear of change, toxic patterns, repressed sexuality",
    protocol_triggers: ["breathwork", "chakra_clearing", "shadow_work", "earth_connection"],
    emotional_indicators: ["transformation", "fear", "power", "wisdom"]
  },
  
  water: {
    universal: "Emotions, intuition, the unconscious, flow and adaptability",
    elemental_meanings: {
      fire: "Steam transformation, passion meeting intuition",
      water: "Pure emotional expression, psychic abilities, tears of release",
      earth: "Nourishing rains, fertility, life-giving force",
      air: "Clouds of inspiration, emotional thoughts, mental clarity",
      aether: "Universal consciousness, cosmic tears, divine compassion"
    },
    shadow_aspect: "Emotional overwhelm, drowning in feelings, stagnant emotions",
    protocol_triggers: ["water_ceremony", "emotional_release", "moon_ritual", "cleansing_bath"],
    emotional_indicators: ["flow", "emotion", "intuition", "cleansing"]
  },
  
  fire: {
    universal: "Passion, transformation, destruction and creation, divine spark",
    elemental_meanings: {
      fire: "Pure creative force, sexual passion, spiritual awakening",
      water: "Steam wisdom, emotional passion, healing through intensity",
      earth: "Forging strength, volcanic creation, grounded passion",
      air: "Lightning insight, mental fire, inspired action",
      aether: "Divine flame, spiritual illumination, cosmic fire"
    },
    shadow_aspect: "Destructive anger, burnout, consuming desires",
    protocol_triggers: ["fire_ceremony", "candle_meditation", "sun_ritual", "creative_expression"],
    emotional_indicators: ["passion", "anger", "creativity", "transformation"]
  },
  
  mountain: {
    universal: "Stability, spiritual ascension, challenges to overcome, higher perspective",
    elemental_meanings: {
      fire: "Volcanic power, inner strength, passionate ascension",
      water: "Sacred springs, emotional heights, tears of joy",
      earth: "Solid foundation, ancient wisdom, connection to ancestors",
      air: "Higher perspective, mental clarity, breathwork at altitude",
      aether: "Sacred peaks, divine connection, spiritual summit"
    },
    shadow_aspect: "Overwhelming obstacles, isolation, spiritual bypassing",
    protocol_triggers: ["mountain_meditation", "grounding", "perspective_ritual", "strength_building"],
    emotional_indicators: ["strength", "challenge", "perspective", "grounding"]
  },
  
  ocean: {
    universal: "Vast unconscious, collective wisdom, infinite possibility, emotional depths",
    elemental_meanings: {
      fire: "Passionate depths, steam rising from deep waters",
      water: "Infinite emotion, collective unconscious, psychic vastness",
      earth: "Primordial source, womb of creation, tidal rhythms",
      air: "Ocean breeze wisdom, surface thoughts on deep knowing",
      aether: "Cosmic ocean, universal consciousness, infinite space"
    },
    shadow_aspect: "Overwhelming emotions, fear of the unknown, drowning in vastness",
    protocol_triggers: ["ocean_meditation", "depth_work", "emotional_diving", "vastness_ritual"],
    emotional_indicators: ["vastness", "depth", "unknown", "collective"]
  },
  
  bird: {
    universal: "Freedom, higher perspective, messages from spirit, transcendence",
    elemental_meanings: {
      fire: "Phoenix rebirth, passionate flight, creative soaring",
      water: "Emotional freedom, tears of joy, flowing movement",
      earth: "Earthbound connection with sky wisdom, messenger between realms",
      air: "Pure freedom, mental flight, divine messages",
      aether: "Soul flight, spiritual messenger, cosmic communication"
    },
    shadow_aspect: "Escapism, fear of grounding, spiritual bypassing",
    protocol_triggers: ["flight_meditation", "freedom_ritual", "sky_gazing", "message_receiving"],
    emotional_indicators: ["freedom", "transcendence", "message", "perspective"]
  },
  
  tree: {
    universal: "Growth, connection between earth and sky, life cycles, wisdom",
    elemental_meanings: {
      fire: "Burning bush revelation, passionate growth, creative branching",
      water: "Nourishing roots, flowing sap, emotional stability",
      earth: "Deep roots, seasonal cycles, ancestral wisdom",
      air: "Swaying wisdom, breath of leaves, mental flexibility",
      aether: "World tree, cosmic axis, spiritual connection"
    },
    shadow_aspect: "Feeling stuck, rigid thinking, disconnection from nature",
    protocol_triggers: ["tree_meditation", "grounding", "seasonal_ritual", "growth_ceremony"],
    emotional_indicators: ["growth", "stability", "connection", "wisdom"]
  },
  
  moon: {
    universal: "Cycles, feminine wisdom, intuition, hidden knowledge, reflection",
    elemental_meanings: {
      fire: "Lunar passion, cyclic transformation, hidden fire",
      water: "Tidal wisdom, emotional cycles, psychic illumination",
      earth: "Seasonal rhythms, fertility cycles, grounded intuition",
      air: "Lunar thoughts, cyclic breathing, night wisdom",
      aether: "Cosmic cycles, divine feminine, spiritual reflection"
    },
    shadow_aspect: "Mood swings, hidden fears, resistance to cycles",
    protocol_triggers: ["moon_ceremony", "cycle_honoring", "feminine_wisdom", "reflection_ritual"],
    emotional_indicators: ["cycles", "intuition", "feminine", "reflection"]
  },
  
  sun: {
    universal: "Consciousness, masculine energy, vitality, illumination, clarity",
    elemental_meanings: {
      fire: "Pure solar fire, divine masculine, creative power",
      water: "Illuminated emotion, conscious feeling, solar tears",
      earth: "Life-giving warmth, seasonal light, growth energy",
      air: "Mental illumination, conscious thought, clarity",
      aether: "Divine light, cosmic consciousness, spiritual sun"
    },
    shadow_aspect: "Ego inflation, burnout, harsh judgment",
    protocol_triggers: ["sun_ceremony", "vitality_ritual", "clarity_meditation", "masculine_work"],
    emotional_indicators: ["vitality", "clarity", "consciousness", "power"]
  }
};

// Common dream patterns and their meanings
const DREAM_PATTERNS = {
  flying: {
    themes: ["freedom", "transcendence", "escape", "spiritual_elevation"],
    elements: ["air", "aether"],
    protocols: ["breathwork", "meditation", "freedom_ceremony"]
  },
  
  falling: {
    themes: ["lack_of_control", "fear", "surrender", "grounding_needed"],
    elements: ["earth", "water"],
    protocols: ["grounding", "trust_building", "fear_work"]
  },
  
  being_chased: {
    themes: ["avoidance", "shadow_work", "fear", "running_from_truth"],
    elements: ["fire", "earth"],
    protocols: ["shadow_work", "courage_building", "facing_fears"]
  },
  
  death: {
    themes: ["transformation", "endings", "rebirth", "fear_of_change"],
    elements: ["water", "aether"],
    protocols: ["death_meditation", "transformation_ritual", "letting_go"]
  },
  
  lost: {
    themes: ["confusion", "seeking_direction", "inner_guidance", "trust"],
    elements: ["air", "water"],
    protocols: ["compass_meditation", "intuition_building", "pathfinding"]
  }
};

/**
 * Parse dream content and extract symbolic meanings
 */
export function parseDreamSymbols(dreamContent: string): ParsedDream {
  const content = dreamContent.toLowerCase();
  const foundSymbols: DreamSymbol[] = [];
  const elementalPresence = { fire: 0, water: 0, earth: 0, air: 0, aether: 0 };
  const suggestedProtocols = new Set<string>();
  const archetypalThemes = new Set<string>();
  const emotionalIndicators = new Set<string>();
  
  // Check for explicit symbols
  Object.entries(SYMBOL_MEANINGS).forEach(([symbol, meaning]) => {
    if (content.includes(symbol)) {
      foundSymbols.push({
        symbol,
        confidence: calculateSymbolConfidence(content, symbol),
        context: extractSymbolContext(content, symbol),
        archetypal_resonance: Object.keys(meaning.elemental_meanings)
      });
      
      // Add to elemental presence
      Object.keys(meaning.elemental_meanings).forEach(element => {
        elementalPresence[element as keyof typeof elementalPresence] += 1;
      });
      
      // Add protocol suggestions
      meaning.protocol_triggers.forEach(protocol => suggestedProtocols.add(protocol));
      
      // Add emotional indicators
      meaning.emotional_indicators.forEach(indicator => emotionalIndicators.add(indicator));
    }
  });
  
  // Check for dream patterns
  Object.entries(DREAM_PATTERNS).forEach(([pattern, data]) => {
    if (content.includes(pattern.replace('_', ' ')) || content.includes(pattern)) {
      data.themes.forEach(theme => archetypalThemes.add(theme));
      data.protocols.forEach(protocol => suggestedProtocols.add(protocol));
      data.elements.forEach(element => {
        elementalPresence[element as keyof typeof elementalPresence] += 0.5;
      });
    }
  });
  
  // Determine dominant elements
  const dominantElements = Object.entries(elementalPresence)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([element]) => element);
  
  // Determine emotional tone
  const emotionalTone = determineEmotionalTone(content, Array.from(emotionalIndicators));
  
  // Check for lucidity indicators
  const lucidityIndicators = checkLucidityIndicators(content);
  
  // Generate oracle prompts based on symbols
  const oraclePrompts = generateOraclePrompts(foundSymbols, dominantElements, emotionalTone);
  
  return {
    symbols: foundSymbols,
    dominant_elements: dominantElements,
    emotional_tone: emotionalTone,
    lucidity_indicators: lucidityIndicators,
    suggested_protocols: Array.from(suggestedProtocols),
    archetypal_themes: Array.from(archetypalThemes),
    oracle_prompts: oraclePrompts
  };
}

function calculateSymbolConfidence(content: string, symbol: string): number {
  // Simple confidence calculation based on frequency and context
  const occurrences = (content.match(new RegExp(symbol, 'g')) || []).length;
  const contextWords = ['vivid', 'clear', 'important', 'significant', 'powerful'];
  const hasContext = contextWords.some(word => content.includes(word));
  
  let confidence = Math.min(occurrences * 0.3, 1.0);
  if (hasContext) confidence += 0.2;
  
  return Math.min(confidence, 1.0);
}

function extractSymbolContext(content: string, symbol: string): string {
  const symbolIndex = content.indexOf(symbol);
  if (symbolIndex === -1) return '';
  
  const start = Math.max(0, symbolIndex - 50);
  const end = Math.min(content.length, symbolIndex + symbol.length + 50);
  
  return content.slice(start, end).trim();
}

function determineEmotionalTone(content: string, indicators: string[]): string {
  const positiveWords = ['joy', 'happy', 'peaceful', 'beautiful', 'love', 'light', 'wonderful'];
  const negativeWords = ['fear', 'scary', 'dark', 'sad', 'angry', 'frightening', 'worried'];
  const neutralWords = ['strange', 'unusual', 'different', 'confusing', 'mysterious'];
  
  let positiveScore = 0;
  let negativeScore = 0;
  let neutralScore = 0;
  
  positiveWords.forEach(word => {
    if (content.includes(word)) positiveScore++;
  });
  
  negativeWords.forEach(word => {
    if (content.includes(word)) negativeScore++;
  });
  
  neutralWords.forEach(word => {
    if (content.includes(word)) neutralScore++;
  });
  
  if (positiveScore > negativeScore && positiveScore > neutralScore) return 'positive';
  if (negativeScore > positiveScore && negativeScore > neutralScore) return 'negative';
  if (neutralScore > 0) return 'mysterious';
  
  return 'neutral';
}

function checkLucidityIndicators(content: string): string[] {
  const lucidityPhrases = [
    'realized i was dreaming',
    'became lucid',
    'knew it was a dream',
    'dream sign',
    'reality check',
    'controlled the dream',
    'decided to',
    'chose to'
  ];
  
  return lucidityPhrases.filter(phrase => content.includes(phrase));
}

function generateOraclePrompts(symbols: DreamSymbol[], elements: string[], tone: string): string[] {
  const prompts: string[] = [];
  
  if (symbols.length > 0) {
    const primarySymbol = symbols[0];
    prompts.push(`The ${primarySymbol.symbol} in your dream carries deep wisdom. What transformation is it calling you toward?`);
    
    if (symbols.length > 1) {
      prompts.push(`Your dream weaves together ${symbols.map(s => s.symbol).join(', ')}. How do these symbols dance together in your life?`);
    }
  }
  
  if (elements.length > 0) {
    const primaryElement = elements[0];
    prompts.push(`Your dream resonates with ${primaryElement} energy. How can you honor this element in your waking life?`);
  }
  
  if (tone === 'negative') {
    prompts.push('Your dream holds shadows that seek the light. What fears are ready to be transformed into wisdom?');
  } else if (tone === 'positive') {
    prompts.push('Your dream carries gifts of light and joy. How can you integrate this blessing into your daily reality?');
  }
  
  return prompts;
}

/**
 * Suggest protocols based on dream analysis
 */
export function suggestProtocolsFromDream(parsedDream: ParsedDream): string[] {
  const protocols = new Set(parsedDream.suggested_protocols);
  
  // Add element-specific protocols
  parsedDream.dominant_elements.forEach(element => {
    switch (element) {
      case 'fire':
        protocols.add('candle_meditation');
        protocols.add('sunrise_ceremony');
        break;
      case 'water':
        protocols.add('moon_water_blessing');
        protocols.add('emotional_release_bath');
        break;
      case 'earth':
        protocols.add('nature_walk');
        protocols.add('crystal_meditation');
        break;
      case 'air':
        protocols.add('breathwork');
        protocols.add('wind_ceremony');
        break;
      case 'aether':
        protocols.add('cosmic_meditation');
        protocols.add('stargazing_ritual');
        break;
    }
  });
  
  // Add tone-specific protocols
  if (parsedDream.emotional_tone === 'negative') {
    protocols.add('shadow_work');
    protocols.add('protection_ritual');
  } else if (parsedDream.emotional_tone === 'positive') {
    protocols.add('gratitude_ceremony');
    protocols.add('manifestation_ritual');
  }
  
  return Array.from(protocols);
}