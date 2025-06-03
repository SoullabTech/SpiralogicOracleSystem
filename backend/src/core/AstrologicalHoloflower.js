"use strict";
/**
 * Enhanced Sacred Holoflower integrating:
 * - Astrological house meanings
 * - Spiralogic developmental stages
 * - Planetary transits
 * - Natal chart positions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AstrologicalHoloflower = void 0;
const ElementalAlchemyHoloflower_1 = require("./ElementalAlchemyHoloflower");
class AstrologicalHoloflower extends ElementalAlchemyHoloflower_1.ElementalAlchemyHoloflower {
    constructor(initialState) {
        super(initialState);
        // Enhanced house definitions with astrological meanings
        this.astrologicalHouseDefinitions = [
            {
                number: 1,
                astrologicalMeaning: 'Self, Identity, Appearance',
                lifeArea: 'Personal identity and self-expression',
                traditionalRuler: 'mars',
                spiralogicStage: 1,
                developmentalTheme: 'Emergence of Individual Consciousness',
                evolutionaryGoal: 'Authentic self-expression and pioneering spirit'
            },
            {
                number: 2,
                astrologicalMeaning: 'Resources, Values, Self-Worth',
                lifeArea: 'Material resources and personal values',
                traditionalRuler: 'venus',
                spiralogicStage: 2,
                developmentalTheme: 'Grounding Spirit in Matter',
                evolutionaryGoal: 'Sustainable abundance and self-worth'
            },
            {
                number: 3,
                astrologicalMeaning: 'Communication, Siblings, Short Journeys',
                lifeArea: 'Mental expression and immediate environment',
                traditionalRuler: 'mercury',
                spiralogicStage: 3,
                developmentalTheme: 'Connecting and Communicating',
                evolutionaryGoal: 'Clear expression of truth and understanding'
            },
            {
                number: 4,
                astrologicalMeaning: 'Home, Family, Roots, Inner Foundation',
                lifeArea: 'Emotional security and ancestral patterns',
                traditionalRuler: 'moon',
                spiralogicStage: 4,
                developmentalTheme: 'Creating Sacred Foundation',
                evolutionaryGoal: 'Emotional sovereignty and nurturing wisdom'
            },
            {
                number: 5,
                astrologicalMeaning: 'Creativity, Romance, Children, Joy',
                lifeArea: 'Creative self-expression and pleasure',
                traditionalRuler: 'sun',
                spiralogicStage: 5,
                developmentalTheme: 'Radiant Self-Expression',
                evolutionaryGoal: 'Joyful creation and heart-centered leadership'
            },
            {
                number: 6,
                astrologicalMeaning: 'Health, Service, Daily Work',
                lifeArea: 'Physical wellbeing and sacred service',
                traditionalRuler: 'mercury',
                spiralogicStage: 6,
                developmentalTheme: 'Sacred Service and Refinement',
                evolutionaryGoal: 'Embodied wisdom and healing mastery'
            },
            {
                number: 7,
                astrologicalMeaning: 'Partnerships, Marriage, Open Enemies',
                lifeArea: 'One-on-one relationships and projection',
                traditionalRuler: 'venus',
                spiralogicStage: 7,
                developmentalTheme: 'Sacred Mirror and Union',
                evolutionaryGoal: 'Conscious relationship and integration of other'
            },
            {
                number: 8,
                astrologicalMeaning: 'Transformation, Shared Resources, Death/Rebirth',
                lifeArea: 'Deep transformation and power dynamics',
                traditionalRuler: 'mars',
                modernRuler: 'pluto',
                spiralogicStage: 8,
                developmentalTheme: 'Alchemical Transformation',
                evolutionaryGoal: 'Empowered transformation and regeneration'
            },
            {
                number: 9,
                astrologicalMeaning: 'Philosophy, Higher Learning, Long Journeys',
                lifeArea: 'Wisdom seeking and expansion of consciousness',
                traditionalRuler: 'jupiter',
                spiralogicStage: 9,
                developmentalTheme: 'Wisdom Integration',
                evolutionaryGoal: 'Living truth and teaching through being'
            },
            {
                number: 10,
                astrologicalMeaning: 'Career, Public Life, Reputation',
                lifeArea: 'Life purpose and contribution to collective',
                traditionalRuler: 'saturn',
                spiralogicStage: 10,
                developmentalTheme: 'Sacred Contribution',
                evolutionaryGoal: 'Mastery in service to the whole'
            },
            {
                number: 11,
                astrologicalMeaning: 'Friends, Groups, Hopes and Dreams',
                lifeArea: 'Collective consciousness and future vision',
                traditionalRuler: 'saturn',
                modernRuler: 'uranus',
                spiralogicStage: 11,
                developmentalTheme: 'Collective Evolution',
                evolutionaryGoal: 'Innovative service to humanity\'s awakening'
            },
            {
                number: 12,
                astrologicalMeaning: 'Spirituality, Hidden Things, Self-Undoing',
                lifeArea: 'Transcendence and connection to source',
                traditionalRuler: 'jupiter',
                modernRuler: 'neptune',
                spiralogicStage: 12,
                developmentalTheme: 'Divine Union',
                evolutionaryGoal: 'Surrender to divine will and cosmic consciousness'
            }
        ];
        this.astroState = this.initializeAstrologicalState(initialState);
    }
    initializeAstrologicalState(initialState) {
        const baseState = this.getState();
        // Enhance each house with astrological properties
        const astroHouses = baseState.houses.map((house, index) => {
            const astroDef = this.astrologicalHouseDefinitions[index];
            return {
                ...house,
                ...astroDef,
                currentTransits: [],
                natalPlanets: [],
                aspectInfluences: [],
                transitActivation: 0,
                natalStrength: 0
            };
        });
        // Initialize current planetary positions (would be calculated from ephemeris)
        const currentPlanetaryPositions = new Map();
        return {
            ...baseState,
            houses: astroHouses,
            currentPlanetaryPositions,
            natalChart: initialState?.natalChart,
            currentAspects: [],
            dominantInfluences: []
        };
    }
    // Set user's natal chart
    setNatalChart(birthData) {
        // In reality, this would calculate actual positions
        // For now, we'll use placeholder data
        this.astroState.natalChart = {
            ascendant: 'aries',
            midheaven: 'capricorn',
            planets: new Map([
                ['sun', { planet: 'sun', sign: 'leo', degree: 15, retrograde: false, strength: 0.9, interpretation: 'Creative leadership' }],
                ['moon', { planet: 'moon', sign: 'cancer', degree: 22, retrograde: false, strength: 0.95, interpretation: 'Emotional depth' }],
                // ... other planets
            ])
        };
        this.updateNatalInfluences();
    }
    // Update current planetary transits
    updateCurrentTransits(transitData) {
        this.astroState.currentPlanetaryPositions = transitData;
        // Calculate which houses are being transited
        this.astroState.houses.forEach(house => {
            house.currentTransits = [];
            // Check each planet's position
            transitData.forEach((position, planet) => {
                if (this.isPlanetInHouse(position, house.number)) {
                    house.currentTransits.push({
                        planet,
                        sign: position.sign,
                        degree: position.degree,
                        retrograde: position.retrograde,
                        orb: 0, // Would calculate actual orb
                        influence: this.getTransitInfluence(planet, house),
                        startDate: new Date(), // Would calculate actual dates
                        exactDate: new Date(),
                        endDate: new Date()
                    });
                }
            });
            // Update transit activation level
            house.transitActivation = this.calculateTransitActivation(house.currentTransits);
        });
        this.recalculateInfluences();
    }
    // Check if planet is in a house (simplified)
    isPlanetInHouse(position, houseNumber) {
        // Simplified calculation - in reality would use house cusps
        const houseStart = (houseNumber - 1) * 30;
        const houseEnd = houseNumber * 30;
        const planetDegree = this.getAbsoluteDegree(position.sign, position.degree);
        return planetDegree >= houseStart && planetDegree < houseEnd;
    }
    // Convert sign + degree to absolute degree (0-360)
    getAbsoluteDegree(sign, degree) {
        const signs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
            'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
        const signIndex = signs.indexOf(sign);
        return signIndex * 30 + degree;
    }
    // Get transit influence description
    getTransitInfluence(planet, house) {
        const influences = {
            jupiter: {
                1: 'Expansion of self-awareness and new beginnings',
                2: 'Growth in resources and self-worth',
                3: 'Expanding communication and learning',
                4: 'Blessings in home and family',
                5: 'Creative expansion and joy',
                6: 'Improvement in health and service',
                7: 'Growth through relationships',
                8: 'Transformation brings gifts',
                9: 'Wisdom and spiritual expansion',
                10: 'Career success and recognition',
                11: 'Expanding social connections',
                12: 'Spiritual awakening and compassion'
            },
            saturn: {
                1: 'Maturation of identity and responsibility',
                2: 'Building lasting value and resources',
                3: 'Disciplined communication and study',
                4: 'Restructuring foundations',
                5: 'Creative discipline and commitment',
                6: 'Health consciousness and service mastery',
                7: 'Relationship commitments and boundaries',
                8: 'Deep transformation work',
                9: 'Wisdom through experience',
                10: 'Career achievements through effort',
                11: 'Restructuring social connections',
                12: 'Spiritual discipline and release'
            },
            // ... other planets
        };
        return influences[planet]?.[house.number] || `${planet} activating ${house.lifeArea}`;
    }
    // Calculate transit activation level
    calculateTransitActivation(transits) {
        if (transits.length === 0)
            return 0;
        const weights = {
            sun: 0.9,
            moon: 0.8,
            jupiter: 0.85,
            saturn: 0.85,
            uranus: 0.8,
            neptune: 0.7,
            pluto: 0.9,
            mars: 0.7,
            venus: 0.6,
            mercury: 0.5
        };
        const totalWeight = transits.reduce((sum, transit) => sum + (weights[transit.planet] || 0.5), 0);
        return Math.min(1, totalWeight / 2); // Normalize
    }
    // Update natal influences on houses
    updateNatalInfluences() {
        if (!this.astroState.natalChart)
            return;
        this.astroState.houses.forEach(house => {
            house.natalPlanets = [];
            // Check which natal planets are in this house
            this.astroState.natalChart.planets.forEach((placement, planet) => {
                if (this.isNatalPlanetInHouse(placement, house.number)) {
                    house.natalPlanets.push(placement);
                }
            });
            // Calculate natal strength
            house.natalStrength = this.calculateNatalStrength(house);
        });
    }
    // Check if natal planet is in house (simplified)
    isNatalPlanetInHouse(placement, houseNumber) {
        // Simplified - would use actual house cusps from natal chart
        return this.isPlanetInHouse({ sign: placement.sign, degree: placement.degree }, houseNumber);
    }
    // Calculate natal strength for a house
    calculateNatalStrength(house) {
        let strength = 0.3; // Base strength
        // Add strength for natal planets
        house.natalPlanets.forEach(planet => {
            strength += planet.strength * 0.3;
        });
        // Add strength if house ruler is well-placed
        if (this.isRulerWellPlaced(house)) {
            strength += 0.2;
        }
        return Math.min(1, strength);
    }
    // Check if house ruler is well-placed
    isRulerWellPlaced(house) {
        if (!this.astroState.natalChart)
            return false;
        const ruler = house.traditionalRuler;
        const rulerPlacement = this.astroState.natalChart.planets.get(ruler);
        return rulerPlacement ? rulerPlacement.strength > 0.7 : false;
    }
    // Recalculate all influences
    recalculateInfluences() {
        // Update aspect influences
        this.calculateCurrentAspects();
        // Determine dominant influences
        this.astroState.dominantInfluences = this.determineDominantInfluences();
        // Update overall intensities based on all factors
        this.astroState.houses.forEach(house => {
            const baseIntensity = house.currentIntensity;
            const astroInfluence = (house.transitActivation + house.natalStrength) / 2;
            // Blend base intensity with astrological influences
            house.currentIntensity = baseIntensity * 0.6 + astroInfluence * 0.4;
        });
        // Recalculate base balances
        this.recalculateBalances();
    }
    // Calculate current planetary aspects
    calculateCurrentAspects() {
        this.astroState.currentAspects = [];
        const planets = Array.from(this.astroState.currentPlanetaryPositions.keys());
        for (let i = 0; i < planets.length; i++) {
            for (let j = i + 1; j < planets.length; j++) {
                const aspect = this.calculateAspect(planets[i], planets[j]);
                if (aspect) {
                    this.astroState.currentAspects.push(aspect);
                }
            }
        }
    }
    // Calculate aspect between two planets
    calculateAspect(planet1, planet2) {
        const pos1 = this.astroState.currentPlanetaryPositions.get(planet1);
        const pos2 = this.astroState.currentPlanetaryPositions.get(planet2);
        if (!pos1 || !pos2)
            return null;
        const deg1 = this.getAbsoluteDegree(pos1.sign, pos1.degree);
        const deg2 = this.getAbsoluteDegree(pos2.sign, pos2.degree);
        const angle = Math.abs(deg1 - deg2);
        const orb = 8; // Simplified orb
        // Check for major aspects
        const aspects = [
            { angle: 0, type: 'conjunction', influence: 'Fusion of energies' },
            { angle: 60, type: 'sextile', influence: 'Harmonious opportunity' },
            { angle: 90, type: 'square', influence: 'Dynamic tension' },
            { angle: 120, type: 'trine', influence: 'Flowing harmony' },
            { angle: 180, type: 'opposition', influence: 'Awareness through polarity' }
        ];
        for (const aspect of aspects) {
            if (Math.abs(angle - aspect.angle) <= orb || Math.abs(360 - angle - aspect.angle) <= orb) {
                return {
                    fromPlanet: planet1,
                    toPlanet: planet2,
                    aspectType: aspect.type,
                    orb: Math.min(Math.abs(angle - aspect.angle), Math.abs(360 - angle - aspect.angle)),
                    applying: deg1 < deg2, // Simplified
                    influence: `${planet1} ${aspect.type} ${planet2}: ${aspect.influence}`
                };
            }
        }
        return null;
    }
    // Determine dominant influences
    determineDominantInfluences() {
        const influences = [];
        // Find most activated houses
        const activatedHouses = this.astroState.houses
            .filter(h => h.transitActivation > 0.7)
            .sort((a, b) => b.transitActivation - a.transitActivation)
            .slice(0, 3);
        activatedHouses.forEach(house => {
            influences.push(`House ${house.number} (${house.lifeArea}) highly activated`);
        });
        // Add major current aspects
        const majorAspects = this.astroState.currentAspects
            .filter(a => a.orb < 3)
            .slice(0, 3);
        majorAspects.forEach(aspect => {
            influences.push(aspect.influence);
        });
        return influences;
    }
    // Get enhanced visualization data
    exportAstrologicalData() {
        const baseData = this.exportVisualizationData();
        return {
            ...baseData,
            houses: this.astroState.houses.map((house, index) => ({
                ...baseData.houses[index],
                astrologicalMeaning: house.astrologicalMeaning,
                lifeArea: house.lifeArea,
                spiralogicStage: house.spiralogicStage,
                developmentalTheme: house.developmentalTheme,
                currentTransits: house.currentTransits,
                natalPlanets: house.natalPlanets,
                transitActivation: house.transitActivation,
                natalStrength: house.natalStrength,
                isActivated: house.transitActivation > 0.5 || house.natalStrength > 0.7
            })),
            currentPlanetaryPositions: Object.fromEntries(this.astroState.currentPlanetaryPositions),
            currentAspects: this.astroState.currentAspects,
            dominantInfluences: this.astroState.dominantInfluences,
            natalChart: this.astroState.natalChart
        };
    }
    // Get current state
    getAstrologicalState() {
        return { ...this.astroState };
    }
}
exports.AstrologicalHoloflower = AstrologicalHoloflower;
