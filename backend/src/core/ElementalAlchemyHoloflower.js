"use strict";
/**
 * Kelly's Elemental Alchemy Holoflower Model
 * The Sacred Technology Rosetta Stone of Consciousness Development
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementalAlchemyHoloflower = void 0;
class ElementalAlchemyHoloflower {
    constructor(initialState) {
        this.PHI = 1.618033988749895; // Golden ratio
        // Kelly's Elemental Alchemy Model Structure
        this.houseDefinitions = [
            // FIRE QUADRANT (Houses 1-3)
            {
                number: 1,
                element: 'fire',
                phase: 'cardinal',
                consciousnessLevel: 'conscious',
                alchemicalProcess: 'calcinatio',
                sacredSymbol: '🔥',
                description: 'Initiation of Will',
                keywords: ['initiative', 'courage', 'identity', 'new beginnings'],
                shadowAspect: 'Impulsiveness and aggression',
                giftAspect: 'Leadership and pioneering spirit'
            },
            {
                number: 2,
                element: 'fire',
                phase: 'fixed',
                consciousnessLevel: 'subconscious',
                alchemicalProcess: 'calcinatio',
                sacredSymbol: '🔥',
                description: 'Sustained Passion',
                keywords: ['determination', 'creativity', 'self-expression', 'loyalty'],
                shadowAspect: 'Stubbornness and ego inflation',
                giftAspect: 'Creative mastery and authenticity'
            },
            {
                number: 3,
                element: 'fire',
                phase: 'mutable',
                consciousnessLevel: 'meta-conscious',
                alchemicalProcess: 'sublimatio',
                sacredSymbol: '🔥',
                description: 'Transcendent Vision',
                keywords: ['wisdom', 'philosophy', 'expansion', 'teaching'],
                shadowAspect: 'Dogmatism and restlessness',
                giftAspect: 'Inspired wisdom and truth-seeking'
            },
            // EARTH QUADRANT (Houses 4-6)
            {
                number: 4,
                element: 'earth',
                phase: 'cardinal',
                consciousnessLevel: 'unconscious',
                alchemicalProcess: 'coagulatio',
                sacredSymbol: '🌍',
                description: 'Foundation Building',
                keywords: ['security', 'roots', 'home', 'emotional foundation'],
                shadowAspect: 'Over-attachment and fear',
                giftAspect: 'Nurturing and protective care'
            },
            {
                number: 5,
                element: 'earth',
                phase: 'fixed',
                consciousnessLevel: 'subconscious',
                alchemicalProcess: 'coagulatio',
                sacredSymbol: '🌍',
                description: 'Material Mastery',
                keywords: ['resources', 'values', 'sensuality', 'persistence'],
                shadowAspect: 'Materialism and possessiveness',
                giftAspect: 'Abundance and grounded presence'
            },
            {
                number: 6,
                element: 'earth',
                phase: 'mutable',
                consciousnessLevel: 'conscious',
                alchemicalProcess: 'coagulatio',
                sacredSymbol: '🌍',
                description: 'Sacred Service',
                keywords: ['service', 'health', 'improvement', 'devotion'],
                shadowAspect: 'Criticism and perfectionism',
                giftAspect: 'Healing and practical wisdom'
            },
            // AIR QUADRANT (Houses 7-9)
            {
                number: 7,
                element: 'air',
                phase: 'cardinal',
                consciousnessLevel: 'conscious',
                alchemicalProcess: 'sublimatio',
                sacredSymbol: '💨',
                description: 'Sacred Partnership',
                keywords: ['relationship', 'balance', 'harmony', 'mirror'],
                shadowAspect: 'Codependency and projection',
                giftAspect: 'Sacred union and collaboration'
            },
            {
                number: 8,
                element: 'air',
                phase: 'fixed',
                consciousnessLevel: 'unconscious',
                alchemicalProcess: 'solutio',
                sacredSymbol: '💨',
                description: 'Transformation Gateway',
                keywords: ['transformation', 'power', 'death/rebirth', 'mystery'],
                shadowAspect: 'Manipulation and obsession',
                giftAspect: 'Alchemical transformation power'
            },
            {
                number: 9,
                element: 'air',
                phase: 'mutable',
                consciousnessLevel: 'meta-conscious',
                alchemicalProcess: 'sublimatio',
                sacredSymbol: '💨',
                description: 'Higher Understanding',
                keywords: ['truth', 'meaning', 'exploration', 'teaching'],
                shadowAspect: 'Self-righteousness and escapism',
                giftAspect: 'Wisdom transmission and expansion'
            },
            // WATER QUADRANT (Houses 10-12)
            {
                number: 10,
                element: 'water',
                phase: 'cardinal',
                consciousnessLevel: 'conscious',
                alchemicalProcess: 'calcinatio',
                sacredSymbol: '💧',
                description: 'Sacred Calling',
                keywords: ['purpose', 'achievement', 'responsibility', 'legacy'],
                shadowAspect: 'Ruthlessness and isolation',
                giftAspect: 'Mastery and contribution'
            },
            {
                number: 11,
                element: 'water',
                phase: 'fixed',
                consciousnessLevel: 'meta-conscious',
                alchemicalProcess: 'solutio',
                sacredSymbol: '💧',
                description: 'Collective Vision',
                keywords: ['community', 'innovation', 'humanitarian', 'future'],
                shadowAspect: 'Detachment and rebellion',
                giftAspect: 'Visionary innovation and unity'
            },
            {
                number: 12,
                element: 'water',
                phase: 'mutable',
                consciousnessLevel: 'unconscious',
                alchemicalProcess: 'solutio',
                sacredSymbol: '💧',
                description: 'Divine Dissolution',
                keywords: ['transcendence', 'compassion', 'unity', 'surrender'],
                shadowAspect: 'Escapism and victimhood',
                giftAspect: 'Divine compassion and oneness'
            }
        ];
        this.state = this.initializeHoloflower(initialState);
    }
    initializeHoloflower(initialState) {
        // Initialize houses with their positions
        const houses = this.houseDefinitions.map((def, index) => ({
            ...def,
            angle: (index * 30 - 90) * (Math.PI / 180), // Start at top (12 o'clock)
            currentIntensity: initialState?.houses?.[index]?.currentIntensity || 0.5,
            transformationPotential: 0.5
        }));
        // Initialize quadrants
        const quadrants = [
            {
                element: 'fire',
                houses: [1, 2, 3],
                alchemicalProcess: 'calcinatio',
                consciousnessRange: ['conscious', 'subconscious', 'meta-conscious'],
                sacredSymbol: '🔥',
                color: '#FF6B6B',
                resonance: 0.5
            },
            {
                element: 'earth',
                houses: [4, 5, 6],
                alchemicalProcess: 'coagulatio',
                consciousnessRange: ['unconscious', 'subconscious', 'conscious'],
                sacredSymbol: '🌍',
                color: '#8B6B47',
                resonance: 0.5
            },
            {
                element: 'air',
                houses: [7, 8, 9],
                alchemicalProcess: 'sublimatio',
                consciousnessRange: ['conscious', 'unconscious', 'meta-conscious'],
                sacredSymbol: '💨',
                color: '#87CEEB',
                resonance: 0.5
            },
            {
                element: 'water',
                houses: [10, 11, 12],
                alchemicalProcess: 'solutio',
                consciousnessRange: ['conscious', 'meta-conscious', 'unconscious'],
                sacredSymbol: '💧',
                color: '#6B8DD6',
                resonance: 0.5
            }
        ];
        // Initialize consciousness distribution
        const consciousnessDistribution = new Map([
            ['meta-conscious', 0.25],
            ['conscious', 0.25],
            ['subconscious', 0.25],
            ['unconscious', 0.25]
        ]);
        // Initialize alchemical balance
        const alchemicalBalance = new Map([
            ['sublimatio', 0.25],
            ['calcinatio', 0.25],
            ['coagulatio', 0.25],
            ['solutio', 0.25]
        ]);
        return {
            houses,
            quadrants,
            centerSpiral: {
                integration: initialState?.centerSpiral?.integration || 0.5,
                phiRatio: this.PHI,
                rotationAngle: 0
            },
            overallBalance: 0.5,
            activeTransformations: initialState?.activeTransformations || [],
            consciousnessDistribution,
            alchemicalBalance
        };
    }
    // Update house intensity and recalculate balances
    updateHouseIntensity(houseNumber, intensity) {
        const house = this.state.houses.find(h => h.number === houseNumber);
        if (!house)
            return;
        house.currentIntensity = Math.max(0, Math.min(1, intensity));
        this.recalculateBalances();
        this.updateTransformationPotentials();
    }
    // Calculate transformation potential between houses
    updateTransformationPotentials() {
        this.state.houses.forEach(house => {
            // Higher potential when house is either very low or very high
            const deviation = Math.abs(house.currentIntensity - 0.5);
            house.transformationPotential = deviation * 2;
        });
    }
    // Activate transformation pathway
    activateTransformation(fromHouse, toHouse) {
        const transformationKey = `${fromHouse}->${toHouse}`;
        if (!this.state.activeTransformations.includes(transformationKey)) {
            this.state.activeTransformations.push(transformationKey);
            // Apply alchemical process
            const from = this.state.houses.find(h => h.number === fromHouse);
            const to = this.state.houses.find(h => h.number === toHouse);
            if (from && to) {
                this.applyAlchemicalProcess(from, to);
            }
        }
    }
    // Apply alchemical transformation
    applyAlchemicalProcess(from, to) {
        const process = to.alchemicalProcess;
        switch (process) {
            case 'calcinatio': // Fire - burning away the dross
                from.currentIntensity *= 0.8;
                to.currentIntensity = Math.min(1, to.currentIntensity + 0.2);
                break;
            case 'solutio': // Water - dissolving and flowing
                const average = (from.currentIntensity + to.currentIntensity) / 2;
                from.currentIntensity = average;
                to.currentIntensity = average;
                break;
            case 'coagulatio': // Earth - solidifying and grounding
                to.currentIntensity = Math.min(1, to.currentIntensity + from.currentIntensity * 0.3);
                break;
            case 'sublimatio': // Air - elevating and refining
                const elevated = Math.sqrt(from.currentIntensity * to.currentIntensity);
                to.currentIntensity = elevated;
                break;
        }
        this.recalculateBalances();
    }
    // Recalculate all balances
    recalculateBalances() {
        // Update quadrant resonances
        this.state.quadrants.forEach(quadrant => {
            const houseIntensities = quadrant.houses.map(hNum => this.state.houses.find(h => h.number === hNum)?.currentIntensity || 0);
            quadrant.resonance = houseIntensities.reduce((sum, val) => sum + val, 0) / houseIntensities.length;
        });
        // Update consciousness distribution
        const consciousnessLevels = ['meta-conscious', 'conscious', 'subconscious', 'unconscious'];
        consciousnessLevels.forEach(level => {
            const housesAtLevel = this.state.houses.filter(h => h.consciousnessLevel === level);
            const totalIntensity = housesAtLevel.reduce((sum, h) => sum + h.currentIntensity, 0);
            this.state.consciousnessDistribution.set(level, totalIntensity / housesAtLevel.length);
        });
        // Update alchemical balance
        const processes = ['sublimatio', 'calcinatio', 'coagulatio', 'solutio'];
        processes.forEach(process => {
            const housesWithProcess = this.state.houses.filter(h => h.alchemicalProcess === process);
            const totalIntensity = housesWithProcess.reduce((sum, h) => sum + h.currentIntensity, 0);
            this.state.alchemicalBalance.set(process, totalIntensity / housesWithProcess.length);
        });
        // Calculate overall balance
        const quadrantVariance = this.calculateVariance(this.state.quadrants.map(q => q.resonance));
        this.state.overallBalance = 1 - Math.sqrt(quadrantVariance);
        // Update center spiral integration
        this.state.centerSpiral.integration = Math.min(...Array.from(this.state.consciousnessDistribution.values()));
    }
    // Calculate variance for balance metrics
    calculateVariance(values) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    }
    // Apply phi ratio spiral integration
    integratePhiSpiral() {
        const phiInfluence = this.state.centerSpiral.integration * this.PHI;
        this.state.houses.forEach((house, index) => {
            // Spiral influence based on position
            const spiralFactor = Math.sin(house.angle + this.state.centerSpiral.rotationAngle);
            const adjustment = spiralFactor * phiInfluence * 0.1;
            house.currentIntensity = Math.max(0, Math.min(1, house.currentIntensity + adjustment));
        });
        // Rotate spiral
        this.state.centerSpiral.rotationAngle += Math.PI / 12;
        this.recalculateBalances();
    }
    // Get transformation insights
    getTransformationInsight(fromHouse, toHouse) {
        const from = this.state.houses.find(h => h.number === fromHouse);
        const to = this.state.houses.find(h => h.number === toHouse);
        if (!from || !to)
            return 'Unknown transformation';
        const elementShift = from.element !== to.element;
        const consciousnessShift = from.consciousnessLevel !== to.consciousnessLevel;
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
    exportVisualizationData() {
        return {
            houses: this.state.houses.map(house => ({
                ...house,
                x: Math.cos(house.angle) * (100 + house.currentIntensity * 50),
                y: Math.sin(house.angle) * (100 + house.currentIntensity * 50),
                size: 30 + house.currentIntensity * 20,
                glowIntensity: house.transformationPotential
            })),
            quadrants: this.state.quadrants,
            spiral: {
                ...this.state.centerSpiral,
                points: this.generateSpiralPoints()
            },
            connections: this.state.activeTransformations.map(t => {
                const [from, to] = t.split('->').map(Number);
                return { from, to };
            }),
            metrics: {
                overallBalance: this.state.overallBalance,
                consciousnessDistribution: Object.fromEntries(this.state.consciousnessDistribution),
                alchemicalBalance: Object.fromEntries(this.state.alchemicalBalance)
            }
        };
    }
    // Generate sacred spiral points
    generateSpiralPoints() {
        const points = [];
        const turns = 3;
        const pointsPerTurn = 50;
        for (let i = 0; i <= turns * pointsPerTurn; i++) {
            const t = i / pointsPerTurn;
            const angle = t * 2 * Math.PI;
            const radius = Math.pow(this.PHI, t) * 10;
            points.push({
                x: Math.cos(angle + this.state.centerSpiral.rotationAngle) * radius,
                y: Math.sin(angle + this.state.centerSpiral.rotationAngle) * radius
            });
        }
        return points;
    }
    // Get current state
    getState() {
        return { ...this.state };
    }
}
exports.ElementalAlchemyHoloflower = ElementalAlchemyHoloflower;
