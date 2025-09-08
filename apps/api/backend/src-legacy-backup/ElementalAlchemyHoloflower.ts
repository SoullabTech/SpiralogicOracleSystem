/**
 * Kelly's Elemental Alchemy Holoflower Model
 * The Sacred Technology Rosetta Stone of Consciousness Development
 */

export type ConsciousnessLevel =
  | "meta-conscious"
  | "conscious"
  | "subconscious"
  | "unconscious";
export type ElementType = "fire" | "earth" | "air" | "water";
export type AlchemicalProcess =
  | "sublimatio"
  | "calcinatio"
  | "coagulatio"
  | "solutio";
export type PhaseType = "cardinal" | "fixed" | "mutable";

export interface HoloflowerHouse {
  number: number; // 1-12
  element: ElementType;
  phase: PhaseType;
  consciousnessLevel: ConsciousnessLevel;
  alchemicalProcess: AlchemicalProcess;
  sacredSymbol: string;
  angle: number; // Position in circle (radians)
  description: string;
  keywords: string[];
  shadowAspect: string;
  giftAspect: string;
  currentIntensity: number; // 0-1
  transformationPotential: number; // 0-1
}

export interface ElementalQuadrant {
  element: ElementType;
  houses: number[]; // House numbers in this quadrant
  alchemicalProcess: AlchemicalProcess;
  consciousnessRange: ConsciousnessLevel[];
  sacredSymbol: string;
  color: string;
  resonance: number; // 0-1
}

export interface HoloflowerState {
  houses: HoloflowerHouse[];
  quadrants: ElementalQuadrant[];
  centerSpiral: {
    integration: number; // 0-1
    phiRatio: number; // Golden ratio constant
    rotationAngle: number; // Current rotation
  };
  overallBalance: number;
  activeTransformations: string[];
  consciousnessDistribution: Map<ConsciousnessLevel, number>;
  alchemicalBalance: Map<AlchemicalProcess, number>;
}

export class ElementalAlchemyHoloflower {
  private state: HoloflowerState;
  private readonly PHI = 1.618033988749895; // Golden ratio

<<<<<<< HEAD
  // Kelly's Elemental Alchemy Model Structure
=======
  // Kelly&apos;s Elemental Alchemy Model Structure
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
  private readonly houseDefinitions = [
    // FIRE QUADRANT (Houses 1-3)
    {
      number: 1,
      element: "fire" as ElementType,
      phase: "cardinal" as PhaseType,
      consciousnessLevel: "conscious" as ConsciousnessLevel,
      alchemicalProcess: "calcinatio" as AlchemicalProcess,
      sacredSymbol: "🔥",
      description: "Initiation of Will",
      keywords: ["initiative", "courage", "identity", "new beginnings"],
      shadowAspect: "Impulsiveness and aggression",
      giftAspect: "Leadership and pioneering spirit",
    },
    {
      number: 2,
      element: "fire" as ElementType,
      phase: "fixed" as PhaseType,
      consciousnessLevel: "subconscious" as ConsciousnessLevel,
      alchemicalProcess: "calcinatio" as AlchemicalProcess,
      sacredSymbol: "🔥",
      description: "Sustained Passion",
      keywords: ["determination", "creativity", "self-expression", "loyalty"],
      shadowAspect: "Stubbornness and ego inflation",
      giftAspect: "Creative mastery and authenticity",
    },
    {
      number: 3,
      element: "fire" as ElementType,
      phase: "mutable" as PhaseType,
      consciousnessLevel: "meta-conscious" as ConsciousnessLevel,
      alchemicalProcess: "sublimatio" as AlchemicalProcess,
      sacredSymbol: "🔥",
      description: "Transcendent Vision",
      keywords: ["wisdom", "philosophy", "expansion", "teaching"],
      shadowAspect: "Dogmatism and restlessness",
      giftAspect: "Inspired wisdom and truth-seeking",
    },

    // EARTH QUADRANT (Houses 4-6)
    {
      number: 4,
      element: "earth" as ElementType,
      phase: "cardinal" as PhaseType,
      consciousnessLevel: "unconscious" as ConsciousnessLevel,
      alchemicalProcess: "coagulatio" as AlchemicalProcess,
      sacredSymbol: "🌍",
      description: "Foundation Building",
      keywords: ["security", "roots", "home", "emotional foundation"],
      shadowAspect: "Over-attachment and fear",
      giftAspect: "Nurturing and protective care",
    },
    {
      number: 5,
      element: "earth" as ElementType,
      phase: "fixed" as PhaseType,
      consciousnessLevel: "subconscious" as ConsciousnessLevel,
      alchemicalProcess: "coagulatio" as AlchemicalProcess,
      sacredSymbol: "🌍",
      description: "Material Mastery",
      keywords: ["resources", "values", "sensuality", "persistence"],
      shadowAspect: "Materialism and possessiveness",
      giftAspect: "Abundance and grounded presence",
    },
    {
      number: 6,
      element: "earth" as ElementType,
      phase: "mutable" as PhaseType,
      consciousnessLevel: "conscious" as ConsciousnessLevel,
      alchemicalProcess: "coagulatio" as AlchemicalProcess,
      sacredSymbol: "🌍",
      description: "Sacred Service",
      keywords: ["service", "health", "improvement", "devotion"],
      shadowAspect: "Criticism and perfectionism",
      giftAspect: "Healing and practical wisdom",
    },

    // AIR QUADRANT (Houses 7-9)
    {
      number: 7,
      element: "air" as ElementType,
      phase: "cardinal" as PhaseType,
      consciousnessLevel: "conscious" as ConsciousnessLevel,
      alchemicalProcess: "sublimatio" as AlchemicalProcess,
      sacredSymbol: "💨",
      description: "Sacred Partnership",
      keywords: ["relationship", "balance", "harmony", "mirror"],
      shadowAspect: "Codependency and projection",
      giftAspect: "Sacred union and collaboration",
    },
    {
      number: 8,
      element: "air" as ElementType,
      phase: "fixed" as PhaseType,
      consciousnessLevel: "unconscious" as ConsciousnessLevel,
      alchemicalProcess: "solutio" as AlchemicalProcess,
      sacredSymbol: "💨",
      description: "Transformation Gateway",
      keywords: ["transformation", "power", "death/rebirth", "mystery"],
      shadowAspect: "Manipulation and obsession",
      giftAspect: "Alchemical transformation power",
    },
    {
      number: 9,
      element: "air" as ElementType,
      phase: "mutable" as PhaseType,
      consciousnessLevel: "meta-conscious" as ConsciousnessLevel,
      alchemicalProcess: "sublimatio" as AlchemicalProcess,
      sacredSymbol: "💨",
      description: "Higher Understanding",
      keywords: ["truth", "meaning", "exploration", "teaching"],
      shadowAspect: "Self-righteousness and escapism",
      giftAspect: "Wisdom transmission and expansion",
    },

    // WATER QUADRANT (Houses 10-12)
    {
      number: 10,
      element: "water" as ElementType,
      phase: "cardinal" as PhaseType,
      consciousnessLevel: "conscious" as ConsciousnessLevel,
      alchemicalProcess: "calcinatio" as AlchemicalProcess,
      sacredSymbol: "💧",
      description: "Sacred Calling",
      keywords: ["purpose", "achievement", "responsibility", "legacy"],
      shadowAspect: "Ruthlessness and isolation",
      giftAspect: "Mastery and contribution",
    },
    {
      number: 11,
      element: "water" as ElementType,
      phase: "fixed" as PhaseType,
      consciousnessLevel: "meta-conscious" as ConsciousnessLevel,
      alchemicalProcess: "solutio" as AlchemicalProcess,
      sacredSymbol: "💧",
      description: "Collective Vision",
      keywords: ["community", "innovation", "humanitarian", "future"],
      shadowAspect: "Detachment and rebellion",
      giftAspect: "Visionary innovation and unity",
    },
    {
      number: 12,
      element: "water" as ElementType,
      phase: "mutable" as PhaseType,
      consciousnessLevel: "unconscious" as ConsciousnessLevel,
      alchemicalProcess: "solutio" as AlchemicalProcess,
      sacredSymbol: "💧",
      description: "Divine Dissolution",
      keywords: ["transcendence", "compassion", "unity", "surrender"],
      shadowAspect: "Escapism and victimhood",
      giftAspect: "Divine compassion and oneness",
    },
  ];

  constructor(initialState?: Partial<HoloflowerState>) {
    this.state = this.initializeHoloflower(initialState);
  }

  private initializeHoloflower(
    initialState?: Partial<HoloflowerState>,
  ): HoloflowerState {
    // Initialize houses with their positions
    const houses: HoloflowerHouse[] = this.houseDefinitions.map(
      (def, index) => ({
        ...def,
<<<<<<< HEAD
        angle: (index * 30 - 90) * (Math.PI / 180), // Start at top (12 o'clock)
=======
        angle: (index * 30 - 90) * (Math.PI / 180), // Start at top (12 o&apos;clock)
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
        currentIntensity:
          initialState?.houses?.[index]?.currentIntensity || 0.5,
        transformationPotential: 0.5,
      }),
    );

    // Initialize quadrants
    const quadrants: ElementalQuadrant[] = [
      {
        element: "fire",
        houses: [1, 2, 3],
        alchemicalProcess: "calcinatio",
        consciousnessRange: ["conscious", "subconscious", "meta-conscious"],
        sacredSymbol: "🔥",
        color: "#FF6B6B",
        resonance: 0.5,
      },
      {
        element: "earth",
        houses: [4, 5, 6],
        alchemicalProcess: "coagulatio",
        consciousnessRange: ["unconscious", "subconscious", "conscious"],
        sacredSymbol: "🌍",
        color: "#8B6B47",
        resonance: 0.5,
      },
      {
        element: "air",
        houses: [7, 8, 9],
        alchemicalProcess: "sublimatio",
        consciousnessRange: ["conscious", "unconscious", "meta-conscious"],
        sacredSymbol: "💨",
        color: "#87CEEB",
        resonance: 0.5,
      },
      {
        element: "water",
        houses: [10, 11, 12],
        alchemicalProcess: "solutio",
        consciousnessRange: ["conscious", "meta-conscious", "unconscious"],
        sacredSymbol: "💧",
        color: "#6B8DD6",
        resonance: 0.5,
      },
    ];

    // Initialize consciousness distribution
    const consciousnessDistribution = new Map<ConsciousnessLevel, number>([
      ["meta-conscious", 0.25],
      ["conscious", 0.25],
      ["subconscious", 0.25],
      ["unconscious", 0.25],
    ]);

    // Initialize alchemical balance
    const alchemicalBalance = new Map<AlchemicalProcess, number>([
      ["sublimatio", 0.25],
      ["calcinatio", 0.25],
      ["coagulatio", 0.25],
      ["solutio", 0.25],
    ]);

    return {
      houses,
      quadrants,
      centerSpiral: {
        integration: initialState?.centerSpiral?.integration || 0.5,
        phiRatio: this.PHI,
        rotationAngle: 0,
      },
      overallBalance: 0.5,
      activeTransformations: initialState?.activeTransformations || [],
      consciousnessDistribution,
      alchemicalBalance,
    };
  }

  // Update house intensity and recalculate balances
  public updateHouseIntensity(houseNumber: number, intensity: number): void {
    const house = this.state.houses.find((h) => h.number === houseNumber);
    if (!house) return;

    house.currentIntensity = Math.max(0, Math.min(1, intensity));
    this.recalculateBalances();
    this.updateTransformationPotentials();
  }

  // Calculate transformation potential between houses
  private updateTransformationPotentials(): void {
    this.state.houses.forEach((house) => {
      // Higher potential when house is either very low or very high
      const deviation = Math.abs(house.currentIntensity - 0.5);
      house.transformationPotential = deviation * 2;
    });
  }

  // Activate transformation pathway
  public activateTransformation(fromHouse: number, toHouse: number): void {
    const transformationKey = `${fromHouse}->${toHouse}`;
    if (!this.state.activeTransformations.includes(transformationKey)) {
      this.state.activeTransformations.push(transformationKey);

      // Apply alchemical process
      const from = this.state.houses.find((h) => h.number === fromHouse);
      const to = this.state.houses.find((h) => h.number === toHouse);

      if (from && to) {
        this.applyAlchemicalProcess(from, to);
      }
    }
  }

  // Apply alchemical transformation
  private applyAlchemicalProcess(
    from: HoloflowerHouse,
    to: HoloflowerHouse,
  ): void {
    const process = to.alchemicalProcess;

    switch (process) {
      case "calcinatio": // Fire - burning away the dross
        from.currentIntensity *= 0.8;
        to.currentIntensity = Math.min(1, to.currentIntensity + 0.2);
        break;

      case "solutio": // Water - dissolving and flowing
        const average = (from.currentIntensity + to.currentIntensity) / 2;
        from.currentIntensity = average;
        to.currentIntensity = average;
        break;

      case "coagulatio": // Earth - solidifying and grounding
        to.currentIntensity = Math.min(
          1,
          to.currentIntensity + from.currentIntensity * 0.3,
        );
        break;

      case "sublimatio": // Air - elevating and refining
        const elevated = Math.sqrt(from.currentIntensity * to.currentIntensity);
        to.currentIntensity = elevated;
        break;
    }

    this.recalculateBalances();
  }

  // Recalculate all balances
  private recalculateBalances(): void {
    // Update quadrant resonances
    this.state.quadrants.forEach((quadrant) => {
      const houseIntensities = quadrant.houses.map(
        (hNum) =>
          this.state.houses.find((h) => h.number === hNum)?.currentIntensity ||
          0,
      );
      quadrant.resonance =
        houseIntensities.reduce((sum, val) => sum + val, 0) /
        houseIntensities.length;
    });

    // Update consciousness distribution
    const consciousnessLevels: ConsciousnessLevel[] = [
      "meta-conscious",
      "conscious",
      "subconscious",
      "unconscious",
    ];
    consciousnessLevels.forEach((level) => {
      const housesAtLevel = this.state.houses.filter(
        (h) => h.consciousnessLevel === level,
      );
      const totalIntensity = housesAtLevel.reduce(
        (sum, h) => sum + h.currentIntensity,
        0,
      );
      this.state.consciousnessDistribution.set(
        level,
        totalIntensity / housesAtLevel.length,
      );
    });

    // Update alchemical balance
    const processes: AlchemicalProcess[] = [
      "sublimatio",
      "calcinatio",
      "coagulatio",
      "solutio",
    ];
    processes.forEach((process) => {
      const housesWithProcess = this.state.houses.filter(
        (h) => h.alchemicalProcess === process,
      );
      const totalIntensity = housesWithProcess.reduce(
        (sum, h) => sum + h.currentIntensity,
        0,
      );
      this.state.alchemicalBalance.set(
        process,
        totalIntensity / housesWithProcess.length,
      );
    });

    // Calculate overall balance
    const quadrantVariance = this.calculateVariance(
      this.state.quadrants.map((q) => q.resonance),
    );
    this.state.overallBalance = 1 - Math.sqrt(quadrantVariance);

    // Update center spiral integration
    this.state.centerSpiral.integration = Math.min(
      ...Array.from(this.state.consciousnessDistribution.values()),
    );
  }

  // Calculate variance for balance metrics
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }

  // Apply phi ratio spiral integration
  public integratePhiSpiral(): void {
    const phiInfluence = this.state.centerSpiral.integration * this.PHI;

    this.state.houses.forEach((house, index) => {
      // Spiral influence based on position
      const spiralFactor = Math.sin(
        house.angle + this.state.centerSpiral.rotationAngle,
      );
      const adjustment = spiralFactor * phiInfluence * 0.1;

      house.currentIntensity = Math.max(
        0,
        Math.min(1, house.currentIntensity + adjustment),
      );
    });

    // Rotate spiral
    this.state.centerSpiral.rotationAngle += Math.PI / 12;
    this.recalculateBalances();
  }

  // Get transformation insights
  public getTransformationInsight(fromHouse: number, toHouse: number): string {
    const from = this.state.houses.find((h) => h.number === fromHouse);
    const to = this.state.houses.find((h) => h.number === toHouse);

    if (!from || !to) return "Unknown transformation";

    const elementShift = from.element !== to.element;
    const consciousnessShift =
      from.consciousnessLevel !== to.consciousnessLevel;
    const alchemicalShift = from.alchemicalProcess !== to.alchemicalProcess;

    let insight = `Transforming from House ${fromHouse} (${from.description}) to House ${toHouse} (${to.description}). `;

    if (elementShift) {
      insight += `Elemental shift from ${from.element} to ${to.element}. `;
    }

    if (consciousnessShift) {
      insight += `Consciousness evolution from ${from.consciousnessLevel} to ${to.consciousnessLevel}. `;
    }

    if (alchemicalShift) {
      insight += `Alchemical process shifts from ${from.alchemicalProcess} to ${to.alchemicalProcess}. `;
    }

    return insight;
  }

  // Export visualization data
  public exportVisualizationData() {
    return {
      houses: this.state.houses.map((house) => ({
        ...house,
        x: Math.cos(house.angle) * (100 + house.currentIntensity * 50),
        y: Math.sin(house.angle) * (100 + house.currentIntensity * 50),
        size: 30 + house.currentIntensity * 20,
        glowIntensity: house.transformationPotential,
      })),
      quadrants: this.state.quadrants,
      spiral: {
        ...this.state.centerSpiral,
        points: this.generateSpiralPoints(),
      },
      connections: this.state.activeTransformations.map((t) => {
        const [from, to] = t.split("->").map(Number);
        return { from, to };
      }),
      metrics: {
        overallBalance: this.state.overallBalance,
        consciousnessDistribution: Object.fromEntries(
          this.state.consciousnessDistribution,
        ),
        alchemicalBalance: Object.fromEntries(this.state.alchemicalBalance),
      },
    };
  }

  // Generate sacred spiral points
  private generateSpiralPoints(): { x: number; y: number }[] {
    const points = [];
    const turns = 3;
    const pointsPerTurn = 50;

    for (let i = 0; i <= turns * pointsPerTurn; i++) {
      const t = i / pointsPerTurn;
      const angle = t * 2 * Math.PI;
      const radius = Math.pow(this.PHI, t) * 10;

      points.push({
        x: Math.cos(angle + this.state.centerSpiral.rotationAngle) * radius,
        y: Math.sin(angle + this.state.centerSpiral.rotationAngle) * radius,
      });
    }

    return points;
  }

  // Get current state
  public getState(): HoloflowerState {
    return { ...this.state };
  }
}
