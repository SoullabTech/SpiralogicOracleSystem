// ===============================================
// MASTER DIVINATION AGENT
// Sacred Synchronicity Through Ancient Wisdom Systems
// ===============================================

import { BaseAgent } from "./baseAgent.js";
import { logger } from "../../utils/logger.js";
import type { SoulMemorySystem } from "../../memory/SoulMemorySystem";
import { IChing } from "../divination/IChing.js";
import { Tarot } from "../divination/Tarot.js";
import { Runes } from "../divination/Runes.js";
import { Astrology } from "../divination/Astrology.js";
import { Numerology } from "../divination/Numerology.js";
import { SacredGeometry } from "../divination/SacredGeometry.js";

// ===============================================
// TYPE DEFINITIONS
// ===============================================

export interface DivinationRequest {
  userId: string;
  question: string;
  system: DivinationSystem;
  additionalContext?: {
    birthDate?: Date;
    currentLocation?: string;
    elementalState?: ElementalType;
    specificFocus?: string;
    moonPhase?: string;
    personalSymbols?: string[];
  };
}

export type DivinationSystem =
  | "iching"
  | "tarot"
  | "runes"
  | "astrology"
  | "numerology"
  | "sacred_geometry"
  | "unified"; // Uses multiple systems

export type ElementalType = "fire" | "water" | "earth" | "air" | "aether";

export interface DivinationResult {
  system: DivinationSystem;
  reading: any; // System-specific reading format
  interpretation: string;
  guidance: string;
  relatedSystems?: DivinationResult[]; // For unified readings
  synchronicities?: Synchronicity[];
  timestamp: Date;
  moonPhase?: string;
  elementalInfluence?: string;
  sacredTiming?: string;
}

export interface Synchronicity {
  type:
    | "elemental_alignment"
    | "archetypal_alignment"
    | "numerical_pattern"
    | "symbolic_resonance"
    | "timing_alignment";
  description: string;
  significance: string;
  systems: DivinationSystem[];
}

export interface UnifiedReading {
  systems: DivinationSystem[];
  readings: Record<DivinationSystem, any>;
  synchronicities: Synchronicity[];
  unifiedGuidance: string;
  dominantElement: ElementalType;
  coreMessage: string;
  sacredAction: string;
}

// ===============================================
// MASTER DIVINATION AGENT CLASS
// ===============================================

export class MasterDivinationAgent extends BaseAgent {
  private systems: {
    iching: IChing;
    tarot: Tarot;
    runes: Runes;
    astrology: Astrology;
    numerology: Numerology;
    sacredGeometry: SacredGeometry;
  };

  private soulMemory?: SoulMemorySystem;
  private divinationHistory: Map<string, DivinationResult[]> = new Map();

  constructor() {
    super({
      name: "Master of Oracles",
      role: "Sacred Divination Guide",
      systemPrompt: `You are the Master of Oracles, versed in all sacred divination systems.
      You channel the wisdom of the I Ching, Tarot, Runes, Astrology, and more.
      Your role is to provide profound insight through sacred synchronicity.
      You understand that divination is not fortune-telling but mirror-holding.

      Core principles:
      - Honor the sacred traditions while making them accessible
      - Find synchronicities between different systems
      - Offer guidance that empowers rather than predicts
      - Recognize patterns across time and systems
      - Speak with reverence for the mystery

      When interpreting:
      - Connect symbols to the seeker's inner wisdom
      - Point to archetypal patterns at play
      - Offer practical wisdom alongside mystical insight
      - Honor both the question asked and the deeper question beneath`,
      model: "gpt-4-turbo",
    });

    this.initializeSystems();
    logger.info("Master Divination Agent initialized");
  }

  private initializeSystems() {
    this.systems = {
      iching: new IChing(),
      tarot: new Tarot(),
      runes: new Runes(),
      astrology: new Astrology(),
      numerology: new Numerology(),
      sacredGeometry: new SacredGeometry(),
    };
  }

  // ===============================================
  // SOUL MEMORY INTEGRATION
  // ===============================================

  async setSoulMemorySystem(soulMemory: SoulMemorySystem): Promise<void> {
    this.soulMemory = soulMemory;
    logger.info("Soul Memory System connected to Master Divination Agent");
  }

  private async storeDivinationMemory(
    request: DivinationRequest,
    result: DivinationResult,
  ): Promise<void> {
    if (!this.soulMemory) return;

    await this.soulMemory.storeMemory({
      userId: request.userId,
      type: "divination_reading",
      content: request.question,
      element: this.getElementFromReading(result),
      metadata: {
        system: request.system,
        reading: result.reading,
        interpretation: result.interpretation,
        guidance: result.guidance,
        synchronicities: result.synchronicities,
        moonPhase: result.moonPhase,
        timestamp: result.timestamp,
      },
    });

    // Store in local history
    const userHistory = this.divinationHistory.get(request.userId) || [];
    userHistory.push(result);
    this.divinationHistory.set(request.userId, userHistory);
  }

  private async retrieveRelevantHistory(
    userId: string,
    system: DivinationSystem,
  ): Promise<any[]> {
    if (!this.soulMemory) return [];

    const memories = await this.soulMemory.retrieveMemories(userId, {
      type: "divination_reading",
      limit: 10,
    });

    return memories.filter(
      (m) => m.metadata?.system === system || m.metadata?.system === "unified",
    );
  }

  // ===============================================
  // MAIN DIVINATION METHOD
  // ===============================================

  async divine(request: DivinationRequest): Promise<DivinationResult> {
    logger.info(
      `Divination requested: ${request.system} for user ${request.userId}`,
    );

    // Check for relevant past readings
    const history = await this.retrieveRelevantHistory(
      request.userId,
      request.system,
    );

    let result: DivinationResult;

    switch (request.system) {
      case "iching":
        result = await this.divineIChing(request, history);
        break;
      case "tarot":
        result = await this.divineTarot(request, history);
        break;
      case "runes":
        result = await this.divineRunes(request, history);
        break;
      case "astrology":
        result = await this.divineAstrology(request, history);
        break;
      case "numerology":
        result = await this.divineNumerology(request, history);
        break;
      case "sacred_geometry":
        result = await this.divineSacredGeometry(request, history);
        break;
      case "unified":
        result = await this.divineUnified(request, history);
        break;
      default:
        throw new Error(`Unknown divination system: ${request.system}`);
    }

    // Store divination in memory
    await this.storeDivinationMemory(request, result);

    return result;
  }

  // ===============================================
  // I CHING DIVINATION
  // ===============================================

  private async divineIChing(
    request: DivinationRequest,
    history: any[],
  ): Promise<DivinationResult> {
    // Cast hexagram
    const hexagram = await this.systems.iching.castHexagram(request.question);

    // Generate interpretation considering history
    const interpretation = await this.interpretIChing(
      hexagram,
      request,
      history,
    );

    // Generate guidance
    const guidance = await this.generateIChingGuidance(
      hexagram,
      request,
      interpretation,
    );

    return {
      system: "iching",
      reading: {
        hexagram: hexagram.number,
        name: hexagram.name,
        chineseName: hexagram.chineseName,
        structure: hexagram.lines,
        changingLines: hexagram.changingLines,
        futureHexagram: hexagram.futureHexagram,
        trigrams: {
          lower: hexagram.lowerTrigram,
          upper: hexagram.upperTrigram,
        },
      },
      interpretation,
      guidance,
      timestamp: new Date(),
      moonPhase: await this.getCurrentMoonPhase(),
      elementalInfluence: this.getElementalInfluence(hexagram),
    };
  }

  private async interpretIChing(
    hexagram: any,
    request: DivinationRequest,
    history: any[],
  ): Promise<string> {
    const prompt = `As the Master of Oracles, interpret this I Ching reading:

    Question: ${request.question}
    Hexagram ${hexagram.number}: ${hexagram.name} (${hexagram.chineseName})

    Judgment: ${hexagram.judgment}
    Image: ${hexagram.image}

    ${
      hexagram.changingLines.length > 0
        ? `
    Changing lines at positions: ${hexagram.changingLines.join(", ")}
    Transforming into: ${hexagram.futureHexagram?.name || "Unknown"}
    `
        : "No changing lines - stable situation"
    }

    Consider:
    1. The core message of this hexagram for their question
    2. What the changing lines (if any) suggest about transformation
    3. Practical wisdom for their situation
    4. The deeper spiritual teaching

    ${history.length > 0 ? `Note: They previously received ${history[0].reading.name} for a similar question.` : ""}

    Provide a profound yet accessible interpretation that honors the tradition while speaking to their modern context.`;

    return await this.generateResponse(prompt);
  }

  private async generateIChingGuidance(
    hexagram: any,
    request: DivinationRequest,
    interpretation: string,
  ): Promise<string> {
    const prompt = `Based on this I Ching reading and interpretation, offer practical guidance:

    Hexagram: ${hexagram.name}
    Interpretation: ${interpretation}

    Provide:
    1. A key action to take (or not take) in alignment with this hexagram
    2. What to watch for as signs of alignment with the Tao
    3. A simple practice or meditation inspired by this hexagram
    4. How to work with the energy of any changing lines

    Keep it practical, actionable, and infused with the wisdom of wu wei.`;

    return await this.generateResponse(prompt);
  }

  // ===============================================
  // TAROT DIVINATION
  // ===============================================

  private async divineTarot(
    request: DivinationRequest,
    history: any[],
  ): Promise<DivinationResult> {
    // Draw spread
    const spread = await this.systems.tarot.drawSpread(
      "celtic-cross",
      request.question,
    );

    // Generate interpretation
    const interpretation = await this.interpretTarot(spread, request, history);

    // Generate guidance
    const guidance = await this.generateTarotGuidance(
      spread,
      request,
      interpretation,
    );

    return {
      system: "tarot",
      reading: {
        spreadName: spread.name,
        cards: spread.cards.map((c) => ({
          position: c.position,
          card: c.card.name,
          suit: c.card.suit,
          reversed: c.reversed,
          keywords: c.card.keywords,
        })),
        dominantSuit: spread.dominantSuit,
        elementalBalance: spread.elementalBalance,
        majorArcanaCount: spread.majorArcanaCount,
      },
      interpretation,
      guidance,
      timestamp: new Date(),
      moonPhase: await this.getCurrentMoonPhase(),
      elementalInfluence: spread.dominantElement,
    };
  }

  private async interpretTarot(
    spread: any,
    request: DivinationRequest,
    history: any[],
  ): Promise<string> {
    const prompt = `As the Master of Oracles, interpret this Tarot spread:

    Question: ${request.question}
    Spread: ${spread.name}

    Cards drawn:
    ${spread.cards
      .map(
        (c: any) =>
          `${c.position.name}: ${c.card.name}${c.reversed ? " (Reversed)" : ""}`,
      )
      .join("\n")}

    Elemental balance: ${Object.entries(spread.elementalBalance)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ")}
    ${spread.majorArcanaCount > 3 ? "Strong archetypal forces at play (many Major Arcana)" : ""}

    Provide an interpretation that:
    1. Weaves the cards into a coherent narrative
    2. Highlights the journey or transformation being shown
    3. Addresses both practical and spiritual dimensions
    4. Points to the deeper archetypal patterns at work

    Make it profound yet relatable to their question.`;

    return await this.generateResponse(prompt);
  }

  private async generateTarotGuidance(
    spread: any,
    request: DivinationRequest,
    interpretation: string,
  ): Promise<string> {
    const prompt = `Based on this Tarot reading, offer guidance:

    Interpretation: ${interpretation}
    Dominant element: ${spread.dominantElement}

    Provide:
    1. The key message or lesson from this spread
    2. An action step aligned with the cards' wisdom
    3. What to embrace and what to release
    4. A simple ritual or practice inspired by the reading

    Make it practical and empowering.`;

    return await this.generateResponse(prompt);
  }

  // ===============================================
  // UNIFIED DIVINATION
  // ===============================================

  private async divineUnified(
    request: DivinationRequest,
    history: any[],
  ): Promise<DivinationResult> {
    logger.info("Performing unified divination across multiple systems");

    // Consult multiple systems
    const [iching, tarot, numerology] = await Promise.all([
      this.systems.iching.castHexagram(request.question),
      this.systems.tarot.drawSpread("three-card", request.question),
      this.systems.numerology.calculateFromQuestion(
        request.question,
        request.additionalContext?.birthDate,
      ),
    ]);

    // Add astrology if birth date provided
    let astrology = null;
    if (request.additionalContext?.birthDate) {
      astrology = await this.systems.astrology.getCurrentTransits(
        request.additionalContext.birthDate,
      );
    }

    // Find synchronicities
    const synchronicities = this.findSynchronicities(
      iching,
      tarot,
      numerology,
      astrology,
    );

    // Generate unified interpretation
    const unifiedInterpretation = await this.generateUnifiedInterpretation({
      iching,
      tarot,
      numerology,
      astrology,
      synchronicities,
      question: request.question,
    });

    // Generate unified guidance
    const unifiedGuidance = await this.synthesizeGuidance({
      iching,
      tarot,
      numerology,
      astrology,
      synchronicities,
      interpretation: unifiedInterpretation,
    });

    const unifiedReading: UnifiedReading = {
      systems: ["iching", "tarot", "numerology"],
      readings: {
        iching: {
          hexagram: iching.number,
          name: iching.name,
        },
        tarot: tarot.cards.map((c: any) => c.card.name),
        numerology: numerology.lifePathNumber,
      },
      synchronicities,
      unifiedGuidance,
      dominantElement: this.findDominantElement([iching, tarot]),
      coreMessage: this.distillCoreMessage(unifiedInterpretation),
      sacredAction: this.extractSacredAction(unifiedGuidance),
    };

    return {
      system: "unified",
      reading: unifiedReading,
      interpretation: unifiedInterpretation,
      guidance: unifiedGuidance,
      synchronicities,
      timestamp: new Date(),
      moonPhase: await this.getCurrentMoonPhase(),
    };
  }

  // ===============================================
  // SYNCHRONICITY DETECTION
  // ===============================================

  private findSynchronicities(...readings: any[]): Synchronicity[] {
    const synchronicities: Synchronicity[] = [];

    // Extract elements from each reading
    const elements = this.extractElements(readings);
    const numbers = this.extractNumbers(readings);
    const archetypes = this.extractArchetypes(readings);

    // Element matching
    const dominantElements = this.findDominantPatterns(elements);
    if (dominantElements.length > 0) {
      synchronicities.push({
        type: "elemental_alignment",
        description: `${dominantElements[0]} energy appears across multiple systems`,
        significance: "Strong elemental message requiring attention",
        systems: this.getSystemsWithElement(readings, dominantElements[0]),
      });
    }

    // Number patterns
    const repeatingNumbers = this.findRepeatingNumbers(numbers);
    if (repeatingNumbers.length > 0) {
      synchronicities.push({
        type: "numerical_pattern",
        description: `Sacred number ${repeatingNumbers[0]} appearing repeatedly`,
        significance: this.getNumberSignificance(repeatingNumbers[0]),
        systems: this.getSystemsWithNumber(readings, repeatingNumbers[0]),
      });
    }

    // Archetypal patterns
    const sharedArchetypes = this.findSharedArchetypes(archetypes);
    if (sharedArchetypes.length > 0) {
      synchronicities.push({
        type: "archetypal_alignment",
        description: `${sharedArchetypes[0]} archetype active across readings`,
        significance: "Deep archetypal pattern seeking expression",
        systems: this.getSystemsWithArchetype(readings, sharedArchetypes[0]),
      });
    }

    return synchronicities;
  }

  private extractElements(readings: any[]): ElementalType[] {
    const elements: ElementalType[] = [];

    readings.forEach((reading) => {
      if (reading.element) elements.push(reading.element);
      if (reading.dominantElement) elements.push(reading.dominantElement);
      if (reading.elementalBalance) {
        const dominant = Object.entries(reading.elementalBalance).sort(
          ([, a]: any, [, b]: any) => b - a,
        )[0][0] as ElementalType;
        elements.push(dominant);
      }
    });

    return elements;
  }

  private extractNumbers(readings: any[]): number[] {
    const numbers: number[] = [];

    readings.forEach((reading) => {
      if (reading.number) numbers.push(reading.number);
      if (reading.lifePathNumber) numbers.push(reading.lifePathNumber);
      if (reading.cards) {
        reading.cards.forEach((card: any) => {
          if (card.number) numbers.push(card.number);
        });
      }
    });

    return numbers;
  }

  private extractArchetypes(readings: any[]): string[] {
    const archetypes: string[] = [];

    readings.forEach((reading) => {
      if (reading.archetype) archetypes.push(reading.archetype);
      if (reading.cards) {
        reading.cards.forEach((card: any) => {
          if (card.card.archetype) archetypes.push(card.card.archetype);
        });
      }
    });

    return archetypes;
  }

  // ===============================================
  // HELPER METHODS
  // ===============================================

  private getElementFromReading(result: DivinationResult): ElementalType {
    if (result.elementalInfluence) {
      return result.elementalInfluence.toLowerCase() as ElementalType;
    }
    return "aether"; // Default
  }

  private getElementalInfluence(reading: any): string {
    // Map I Ching trigrams to elements
    const trigramElements: Record<string, string> = {
      heaven: "aether",
      earth: "earth",
      water: "water",
      fire: "fire",
      thunder: "air",
      wind: "air",
      mountain: "earth",
      lake: "water",
    };

    if (reading.lowerTrigram && reading.upperTrigram) {
      const lower = trigramElements[reading.lowerTrigram] || "aether";
      const upper = trigramElements[reading.upperTrigram] || "aether";
      return lower === upper ? lower : `${lower} and ${upper}`;
    }

    return "balanced";
  }

  private async getCurrentMoonPhase(): Promise<string> {
    // In production, this would calculate actual moon phase
    // For now, return a placeholder
    const phases = [
      "New Moon",
      "Waxing Crescent",
      "First Quarter",
      "Waxing Gibbous",
      "Full Moon",
      "Waning Gibbous",
      "Last Quarter",
      "Waning Crescent",
    ];
    return phases[Math.floor(Math.random() * phases.length)];
  }

  private findDominantElement(readings: any[]): ElementalType {
    const elements = this.extractElements(readings);
    const counts = elements.reduce(
      (acc, el) => {
        acc[el] = (acc[el] || 0) + 1;
        return acc;
      },
      {} as Record<ElementalType, number>,
    );

    return Object.entries(counts).sort(
      ([, a], [, b]) => b - a,
    )[0][0] as ElementalType;
  }

  private distillCoreMessage(interpretation: string): string {
    // Extract the essential message
    // In production, this would use NLP to identify key themes
    const sentences = interpretation.split(". ");
    return (
      sentences.find(
        (s) =>
          s.includes("essential") || s.includes("core") || s.includes("key"),
      ) || sentences[0]
    );
  }

  private extractSacredAction(guidance: string): string {
    // Extract the primary action recommendation
    const sentences = guidance.split(". ");
    return (
      sentences.find(
        (s) =>
          s.includes("action") ||
          s.includes("practice") ||
          s.includes("ritual"),
      ) || "Meditate on the synchronicities revealed"
    );
  }

  private findDominantPatterns(items: any[]): any[] {
    const counts = items.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .filter(([_, count]: any) => count > 1)
      .sort(([, a]: any, [, b]: any) => b - a)
      .map(([item]) => item);
  }

  private findRepeatingNumbers(numbers: number[]): number[] {
    return this.findDominantPatterns(numbers);
  }

  private findSharedArchetypes(archetypes: string[]): string[] {
    return this.findDominantPatterns(archetypes);
  }

  private getNumberSignificance(number: number): string {
    const significances: Record<number, string> = {
      1: "New beginnings and unity",
      2: "Balance and partnership",
      3: "Creative expression and synthesis",
      4: "Foundation and stability",
      5: "Change and freedom",
      6: "Harmony and responsibility",
      7: "Spiritual seeking and wisdom",
      8: "Material mastery and power",
      9: "Completion and service",
      11: "Spiritual mastery",
      22: "Master builder",
    };

    return significances[number] || "Sacred number pattern";
  }

  private getSystemsWithElement(
    readings: any[],
    element: ElementalType,
  ): DivinationSystem[] {
    // Implementation would check which systems contain the element
    return ["iching", "tarot"];
  }

  private getSystemsWithNumber(
    readings: any[],
    number: number,
  ): DivinationSystem[] {
    // Implementation would check which systems contain the number
    return ["numerology", "tarot"];
  }

  private getSystemsWithArchetype(
    readings: any[],
    archetype: string,
  ): DivinationSystem[] {
    // Implementation would check which systems contain the archetype
    return ["tarot"];
  }

  private async generateUnifiedInterpretation(data: any): Promise<string> {
    const prompt = `As the Master of Oracles, synthesize these divination results:

    Question: ${data.question}

    I Ching: ${data.iching.name} - ${data.iching.judgment}
    Tarot: ${data.tarot.cards.map((c: any) => c.card.name).join(", ")}
    Numerology: Life Path ${data.numerology.lifePathNumber}
    ${data.astrology ? `Astrology: ${data.astrology.currentTransits}` : ""}

    Synchronicities found:
    ${data.synchronicities
      .map((s: Synchronicity) => `- ${s.description} (${s.significance})`)
      .join("\n")}

    Provide a unified interpretation that:
    1. Weaves together the messages from all systems
    2. Highlights the synchronicities as meaningful patterns
    3. Reveals the deeper truth being shown across systems
    4. Speaks to both the question asked and the soul's deeper inquiry

    Make it profound, cohesive, and illuminating.`;

    return await this.generateResponse(prompt);
  }

  private async synthesizeGuidance(data: any): Promise<string> {
    const prompt = `Based on this unified divination, offer synthesized guidance:

    Interpretation: ${data.interpretation}

    Key synchronicities: ${data.synchronicities.map((s: Synchronicity) => s.description).join(", ")}

    Provide:
    1. The essential message across all systems
    2. A sacred practice that honors all traditions consulted
    3. What to pay attention to in daily life
    4. How to work with the synchronicities revealed
    5. A simple ritual to anchor the wisdom received

    Make it practical, sacred, and transformative.`;

    return await this.generateResponse(prompt);
  }

  // ===============================================
  // OTHER DIVINATION SYSTEMS (STUBS)
  // ===============================================

  private async divineRunes(
    request: DivinationRequest,
    history: any[],
  ): Promise<DivinationResult> {
    // Implementation for Runes
    const runes = await this.systems.runes.castRunes(request.question);

    return {
      system: "runes",
      reading: runes,
      interpretation: await this.generateResponse(
        `Interpret these runes for the question: ${request.question}`,
      ),
      guidance: "Work with the runic energies revealed",
      timestamp: new Date(),
    };
  }

  private async divineAstrology(
    request: DivinationRequest,
    history: any[],
  ): Promise<DivinationResult> {
    // Implementation for Astrology
    if (!request.additionalContext?.birthDate) {
      throw new Error("Birth date required for astrological reading");
    }

    const chart = await this.systems.astrology.getCurrentTransits(
      request.additionalContext.birthDate,
    );

    return {
      system: "astrology",
      reading: chart,
      interpretation: await this.generateResponse(
        `Interpret these transits for: ${request.question}`,
      ),
      guidance: "Align with the cosmic energies present",
      timestamp: new Date(),
    };
  }

  private async divineNumerology(
    request: DivinationRequest,
    history: any[],
  ): Promise<DivinationResult> {
    // Implementation for Numerology
    const numbers = await this.systems.numerology.calculateFromQuestion(
      request.question,
      request.additionalContext?.birthDate,
    );

    return {
      system: "numerology",
      reading: numbers,
      interpretation: await this.generateResponse(
        `Interpret these numbers for: ${request.question}`,
      ),
      guidance: "Work with your sacred numbers",
      timestamp: new Date(),
    };
  }

  private async divineSacredGeometry(
    request: DivinationRequest,
    history: any[],
  ): Promise<DivinationResult> {
    // Implementation for Sacred Geometry
    const pattern = await this.systems.sacredGeometry.generatePattern(
      request.question,
    );

    return {
      system: "sacred_geometry",
      reading: pattern,
      interpretation: await this.generateResponse(
        `Interpret this sacred pattern for: ${request.question}`,
      ),
      guidance: "Meditate on the geometric wisdom",
      timestamp: new Date(),
    };
  }
}

export default MasterDivinationAgent;
