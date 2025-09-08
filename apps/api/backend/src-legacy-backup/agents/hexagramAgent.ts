import { getHexagramByPillars } from "../../services/fourPillarsService";
import {
  generateIChingAstroProfile,
  getTrigramArchetype,
} from "../../services/ichingService";

/**
 * Hexagram Agent - I Ching Integration for Spiralogic Oracle System
 * Connects Four Pillars Ba Zi calculations with I Ching hexagram wisdom
 */

export interface HexagramReading {
  hexagram: string;
  number: number;
  name: string;
  keyword: string;
  trigrams: {
    upper: string;
    lower: string;
  };
  interpretation: string;
  guidance: string;
  changingLines?: number[];
}

// 64 Hexagrams with basic interpretations
const HEXAGRAM_DATABASE: Record<string, HexagramReading> = {
  "䷀": {
    hexagram: "䷀",
    number: 1,
    name: "Qian",
    keyword: "Creative",
    trigrams: { upper: "Heaven", lower: "Heaven" },
    interpretation:
      "The Creative principle represents pure yang energy, leadership, and creative force.",
    guidance:
      "Take initiative. Lead with confidence. Trust your creative power.",
  },
  "䷁": {
    hexagram: "䷁",
    number: 2,
    name: "Kun",
    keyword: "Receptive",
    trigrams: { upper: "Earth", lower: "Earth" },
    interpretation:
      "The Receptive represents pure yin energy, receptivity, and nurturing support.",
    guidance:
      "Practice patience. Support others. Allow things to unfold naturally.",
  },
  "䷂": {
    hexagram: "䷂",
    number: 3,
    name: "Zhun",
    keyword: "Difficulty at Beginning",
    trigrams: { upper: "Water", lower: "Thunder" },
    interpretation:
      "Initial difficulties that require patience and perseverance to overcome.",
    guidance:
      "Persist through challenges. Seek help when needed. Growth comes from struggle.",
  },
  "䷃": {
    hexagram: "䷃",
    number: 4,
    name: "Meng",
    keyword: "Youthful Folly",
    trigrams: { upper: "Mountain", lower: "Water" },
    interpretation:
      "The need for learning, teaching, and guidance. Inexperience seeking wisdom.",
    guidance:
<<<<<<< HEAD
      "Embrace beginner's mind. Seek mentorship. Learn from mistakes with humility.",
=======
      "Embrace beginner&apos;s mind. Seek mentorship. Learn from mistakes with humility.",
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
  },
  "䷄": {
    hexagram: "䷄",
    number: 5,
    name: "Xu",
    keyword: "Waiting",
    trigrams: { upper: "Water", lower: "Heaven" },
    interpretation:
      "Patient waiting for the right moment. Trust in divine timing.",
    guidance:
      "Practice patience. Prepare while waiting. Trust the natural flow of events.",
  },
  "䷅": {
    hexagram: "䷅",
    number: 6,
    name: "Song",
    keyword: "Conflict",
    trigrams: { upper: "Heaven", lower: "Water" },
    interpretation:
      "Inner or outer conflict requiring careful resolution and compromise.",
    guidance:
      "Seek peaceful resolution. Avoid unnecessary battles. Find middle ground.",
  },
};

/**
 * Generate hexagram reading from Ba Zi pillars
 */
export function hexagramFromBaZi(
  yearBranch: string,
  monthBranch: string,
): HexagramReading {
  const hexagramSymbol = getHexagramByPillars(yearBranch, monthBranch);

  // Extract just the symbol from the string
  const symbol = hexagramSymbol.split(" ")[0];

  return HEXAGRAM_DATABASE[symbol] || HEXAGRAM_DATABASE["䷀"];
}

/**
 * Generate I Ching reading with multiple hexagrams
 */
export function generateIChingReading(
  yearBranch: string,
  monthBranch: string,
  dayBranch: string,
  hourBranch: string,
): {
  primary: HexagramReading;
  secondary?: HexagramReading;
  synthesis: string;
} {
  const primary = hexagramFromBaZi(yearBranch, monthBranch);
  const secondary = hexagramFromBaZi(dayBranch, hourBranch);

  const synthesis = synthesizeHexagrams(primary, secondary);

  return {
    primary,
    secondary: secondary.hexagram !== primary.hexagram ? secondary : undefined,
    synthesis,
  };
}

/**
 * Synthesize wisdom from multiple hexagrams
 */
function synthesizeHexagrams(
  hex1: HexagramReading,
  hex2: HexagramReading,
): string {
  if (hex1.hexagram === hex2.hexagram) {
    return `Strong emphasis on ${hex1.keyword.toLowerCase()}. This is a time to fully embrace ${hex1.name} energy.`;
  }

  return (
    `Balance between ${hex1.keyword.toLowerCase()} and ${hex2.keyword.toLowerCase()}. ` +
    `Integrate the wisdom of ${hex1.name} with the energy of ${hex2.name}.`
  );
}

/**
 * Get hexagram by number (1-64)
 */
export function getHexagramByNumber(number: number): HexagramReading | null {
  const hexagram = Object.values(HEXAGRAM_DATABASE).find(
    (h) => h.number === number,
  );
  return hexagram || null;
}

/**
 * Generate daily I Ching guidance
 */
export function getDailyIChingGuidance(): {
  hexagram: HexagramReading;
  dailyMessage: string;
  action: string;
} {
  // Simple day-based selection (in production, could use more sophisticated method)
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86400000,
  );
  const hexagramNumber = (dayOfYear % 64) + 1;

  const hexagram =
    getHexagramByNumber(hexagramNumber) || HEXAGRAM_DATABASE["䷀"];

<<<<<<< HEAD
  const dailyMessage = `Today's energy reflects ${hexagram.name} (${hexagram.keyword}). ${hexagram.interpretation}`;
=======
  const dailyMessage = `Today&apos;s energy reflects ${hexagram.name} (${hexagram.keyword}). ${hexagram.interpretation}`;
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
  const action = getActionFromHexagram(hexagram);

  return {
    hexagram,
    dailyMessage,
    action,
  };
}

/**
 * Convert hexagram wisdom into actionable guidance
 */
function getActionFromHexagram(hexagram: HexagramReading): string {
  const actionMap: Record<string, string> = {
<<<<<<< HEAD
    Creative: "Take bold initiative on a project you've been considering.",
=======
    Creative: "Take bold initiative on a project you&apos;ve been considering.",
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
    Receptive: "Practice active listening and support someone in need.",
    "Difficulty at Beginning": "Start something new despite initial obstacles.",
    "Youthful Folly": "Ask questions and seek guidance from a mentor.",
    Waiting: "Practice patience meditation for 10 minutes.",
    Conflict: "Have a difficult conversation with compassion.",
  };

  return (
    actionMap[hexagram.keyword] ||
    "Reflect on the hexagram's wisdom and journal your insights."
  );
}

/**
 * Generate hexagram divination question response
 */
export function divinationResponse(
  question: string,
  yearBranch: string,
  monthBranch: string,
): {
  hexagram: HexagramReading;
  response: string;
  guidance: string;
} {
  const hexagram = hexagramFromBaZi(yearBranch, monthBranch);

  const response =
    `Regarding "${question}", the I Ching offers ${hexagram.name} (${hexagram.keyword}). ` +
    `${hexagram.interpretation}`;

  const guidance = `Guidance: ${hexagram.guidance} Consider how this applies to your question.`;

  return {
    hexagram,
    response,
    guidance,
  };
}

/**
 * I Ching Astrology Integration Functions
 * Connects traditional hexagram wisdom with personal astrology profiles
 */

export interface IChingOracleInsight {
  trigram: string;
  element: string;
  archetype: string;
  yearlyTheme: string;
  dailyGuidance: string;
  hexagramWisdom: string;
  ritualSuggestion: string;
}

/**
 * Generate comprehensive I Ching insight for oracle responses
 */
export function generateIChingOracleInsight(
  birthDate: Date,
  question?: string,
): IChingOracleInsight {
  const profile = generateIChingAstroProfile(birthDate);
  const birthArchetype = getTrigramArchetype(profile.birthTrigram);
  const currentArchetype = getTrigramArchetype(profile.currentTrigramCycle);

  if (!birthArchetype || !currentArchetype) {
    throw new Error("Unable to generate I Ching profile");
  }

  // Get hexagram for current energy
  const hexagram =
    getHexagramByNumber(profile.currentYearNumber) || HEXAGRAM_DATABASE["䷀"];

  const insight: IChingOracleInsight = {
    trigram: profile.birthTrigram,
    element: profile.birthElement,
    archetype: birthArchetype.archetype,
    yearlyTheme: profile.fractalPhase,
    dailyGuidance: generateTrigramDailyGuidance(
      currentArchetype,
      birthArchetype,
    ),
    hexagramWisdom: adaptHexagramToQuestion(hexagram, question),
    ritualSuggestion: generateTrigramRitual(currentArchetype),
  };

  return insight;
}

/**
 * Generate daily guidance based on current trigram energy
 */
function generateTrigramDailyGuidance(current: any, birth: any): string {
  const guidanceMap: Record<string, string> = {
    Thunder: `Channel your ${birth.archetype} nature through bold action. Thunder energy calls for decisive movement.`,
    Wind: `Let your ${birth.archetype} essence flow gently today. Wind teaches patience and gradual influence.`,
    Fire: `Illuminate your ${birth.archetype} gifts brightly. Fire energy brings clarity and recognition.`,
    Earth: `Ground your ${birth.archetype} wisdom in service. Earth energy supports and nurtures.`,
    Lake: `Express your ${birth.archetype} truth with joy. Lake energy celebrates communication and pleasure.`,
    Heaven: `Lead with your ${birth.archetype} vision. Heaven energy calls forth creative authority.`,
    Water: `Dive deep into your ${birth.archetype} mysteries. Water energy reveals hidden wisdom.`,
    Mountain: `Contemplate your ${birth.archetype} path in stillness. Mountain energy brings inner knowing.`,
  };

  return (
    guidanceMap[current.name] ||
    `Align with your ${birth.archetype} nature and trust the flow.`
  );
}

/**
 * Adapt hexagram wisdom to specific questions
 */
function adaptHexagramToQuestion(
  hexagram: HexagramReading,
  question?: string,
): string {
  if (!question) {
    return `${hexagram.name} (${hexagram.keyword}): ${hexagram.interpretation}`;
  }

  return `Regarding "${question}", ${hexagram.name} suggests: ${hexagram.guidance} ${hexagram.interpretation}`;
}

/**
 * Generate ritual suggestions based on trigram energy
 */
function generateTrigramRitual(trigram: any): string {
  const ritualMap: Record<string, string> = {
    Thunder:
<<<<<<< HEAD
      "Practice energizing movement - yoga, qigong, or dance to channel Thunder's dynamic force.",
=======
      "Practice energizing movement - yoga, qigong, or dance to channel Thunder&apos;s dynamic force.",
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
    Wind: "Engage in breathwork or gentle flow meditation to align with Wind's subtle influence.",
    Fire: "Light a candle and practice visualization to amplify Fire's illuminating consciousness.",
    Earth:
      "Spend time in nature, gardening, or grounding practices to connect with Earth's stability.",
    Lake: "Journal, sing, or share your truth with others to honor Lake's communicative joy.",
    Heaven:
      "Create or lead something meaningful to express Heaven's creative authority.",
    Water:
      "Practice deep meditation, dream work, or water gazing to access Water's wisdom.",
    Mountain:
      "Sit in silent contemplation or practice mindfulness to embody Mountain's stillness.",
  };

  return (
    ritualMap[trigram.name] ||
    "Practice mindful awareness and trust your inner guidance."
  );
}

/**
 * Integration function for oracle agents to include I Ching wisdom
 */
export function enhanceOracleInsightWithIChingAstrology(
  baseInsight: string,
  birthDate: Date,
  currentFocus?: string,
): string {
  try {
    const ichingInsight = generateIChingOracleInsight(birthDate, currentFocus);

    const enhancement = `

🌀 **I Ching Astrology Overlay:**
Your birth trigram ${ichingInsight.trigram} (${ichingInsight.archetype}) guides this insight.
Current phase: ${ichingInsight.yearlyTheme}

${ichingInsight.dailyGuidance}

**Hexagram Wisdom:** ${ichingInsight.hexagramWisdom}

**Suggested Practice:** ${ichingInsight.ritualSuggestion}`;

    return baseInsight + enhancement;
  } catch (error) {
    console.error("I Ching enhancement error:", error);
    return baseInsight; // Return original insight if enhancement fails
  }
}

/**
 * Calculate changing lines based on time patterns
 */
export function calculateChangingLines(hour: number, minute: number): number[] {
  const changingLines: number[] = [];

  // Simple algorithm based on time - in traditional I Ching, this would use coin tosses or yarrow stalks
  const timeValue = hour * 60 + minute;

  for (let i = 1; i <= 6; i++) {
    if ((timeValue + i * 7) % 13 === 0) {
      changingLines.push(i);
    }
  }

  return changingLines.slice(0, 3); // Maximum 3 changing lines for clarity
}

/**
 * Integrate with Spiralogic elemental wisdom
 */
export function integrateElementalWisdom(
  hexagram: HexagramReading,
  dominantElement: string,
): string {
  const elementalWisdom: Record<string, string> = {
    Wood: "growth and expansion",
    Fire: "illumination and transformation",
    Earth: "stability and nourishment",
    Metal: "refinement and clarity",
    Water: "flow and adaptability",
  };

  const wisdom = elementalWisdom[dominantElement] || "balance";

  return (
    `The hexagram ${hexagram.name} resonates with your ${dominantElement} energy, ` +
    `emphasizing ${wisdom}. ${hexagram.guidance}`
  );
}
