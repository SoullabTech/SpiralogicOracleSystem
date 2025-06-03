"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SacredHoloflower = void 0;
class SacredHoloflower {
    constructor(initialState) {
        this.geometricRatios = {
            phi: 1.618033988749895,
            sqrt2: 1.41421356237,
            sqrt3: 1.73205080757,
            octaveRatio: 2
        };
        this.elementalMapping = this.initializeElementalMapping();
        this.state = this.initializeHoloflower(initialState);
    }
    initializeElementalMapping() {
        return {
            fire: {
                cardinal: { function: 'T', axis: 'T-N', color: '#FF6B6B' },
                fixed: { function: 'T', axis: 'T-N', color: '#FF5252' },
                mutable: { function: 'N', axis: 'T-N', color: '#FF8787' }
            },
            earth: {
                cardinal: { function: 'S', axis: 'S', color: '#8B6B47' },
                fixed: { function: 'S', axis: 'S', color: '#6B4E31' },
                mutable: { function: 'S', axis: 'S', color: '#A0826D' }
            },
            air: {
                cardinal: { function: 'T', axis: 'T-S', color: '#87CEEB' },
                fixed: { function: 'T', axis: 'T-S', color: '#6BBFEB' },
                mutable: { function: 'S', axis: 'T-S', color: '#ADD8E6' }
            },
            water: {
                cardinal: { function: 'F', axis: 'F-N', color: '#6B8DD6' },
                fixed: { function: 'F', axis: 'F-N', color: '#5577CC' },
                mutable: { function: 'N', axis: 'F-N', color: '#7B9DE8' }
            }
        };
    }
    initializeHoloflower(initialState) {
        const houses = [];
        const elements = ['fire', 'earth', 'air', 'water'];
        const phases = ['cardinal', 'fixed', 'mutable'];
        let houseIndex = 0;
        elements.forEach((element) => {
            phases.forEach((phase) => {
                const mapping = this.elementalMapping[element][phase];
                const angle = (houseIndex * 30) * (Math.PI / 180); // 12 houses = 30 degrees each
                const baseRadius = 100;
                const phaseRadius = this.calculatePhaseRadius(phase, baseRadius);
                houses.push({
                    id: `${element}-${phase}`,
                    element,
                    phase,
                    jungianMapping: mapping.function,
                    angle,
                    radius: phaseRadius,
                    color: mapping.color,
                    intensity: 0.5,
                    shadowAspect: this.getShadowAspect(element, phase)
                });
                houseIndex++;
            });
        });
        return {
            houses,
            centerIntegration: initialState?.centerIntegration || 0.5,
            overallBalance: initialState?.overallBalance || 0.5,
            activeTransformations: initialState?.activeTransformations || [],
            shadowIntegrations: initialState?.shadowIntegrations || new Map(),
            lunarPhase: initialState?.lunarPhase,
            seasonalInfluence: initialState?.seasonalInfluence
        };
    }
    calculatePhaseRadius(phase, baseRadius) {
        switch (phase) {
            case 'cardinal':
                return baseRadius * this.geometricRatios.phi;
            case 'fixed':
                return baseRadius;
            case 'mutable':
                return baseRadius * this.geometricRatios.sqrt3;
            default:
                return baseRadius;
        }
    }
    getShadowAspect(element, phase) {
        const shadowMap = {
            'fire-cardinal': 'Suppressed Initiative',
            'fire-fixed': 'Rigid Will',
            'fire-mutable': 'Scattered Vision',
            'earth-cardinal': 'Material Fixation',
            'earth-fixed': 'Stagnant Security',
            'earth-mutable': 'Adaptive Avoidance',
            'air-cardinal': 'Intellectual Detachment',
            'air-fixed': 'Mental Rigidity',
            'air-mutable': 'Conceptual Chaos',
            'water-cardinal': 'Emotional Overwhelm',
            'water-fixed': 'Emotional Stagnation',
            'water-mutable': 'Emotional Dissolution'
        };
        return shadowMap[`${element}-${phase}`] || 'Unknown Shadow';
    }
    updateHouseIntensity(houseId, intensity) {
        const house = this.state.houses.find(h => h.id === houseId);
        if (house) {
            house.intensity = Math.max(0, Math.min(1, intensity));
            this.recalculateBalance();
        }
    }
    activateTransformation(fromHouseId, toHouseId) {
        const transformationId = `${fromHouseId}->${toHouseId}`;
        if (!this.state.activeTransformations.includes(transformationId)) {
            this.state.activeTransformations.push(transformationId);
            this.calculateTransformationVectors();
        }
    }
    calculateTransformationVectors() {
        this.state.activeTransformations.forEach(transformation => {
            const [fromId, toId] = transformation.split('->');
            const fromHouse = this.state.houses.find(h => h.id === fromId);
            const toHouse = this.state.houses.find(h => h.id === toId);
            if (fromHouse && toHouse) {
                const dx = Math.cos(toHouse.angle) * toHouse.radius - Math.cos(fromHouse.angle) * fromHouse.radius;
                const dy = Math.sin(toHouse.angle) * toHouse.radius - Math.sin(fromHouse.angle) * fromHouse.radius;
                fromHouse.transformationVector = { x: dx * 0.1, y: dy * 0.1 };
            }
        });
    }
    recalculateBalance() {
        const elementBalance = new Map();
        const phaseBalance = new Map();
        this.state.houses.forEach(house => {
            const currentElement = elementBalance.get(house.element) || 0;
            const currentPhase = phaseBalance.get(house.phase) || 0;
            elementBalance.set(house.element, currentElement + house.intensity);
            phaseBalance.set(house.phase, currentPhase + house.intensity);
        });
        const totalIntensity = Array.from(elementBalance.values()).reduce((sum, val) => sum + val, 0);
        const avgIntensity = totalIntensity / this.state.houses.length;
        const elementVariance = Array.from(elementBalance.values())
            .map(val => Math.pow(val - avgIntensity * 3, 2))
            .reduce((sum, val) => sum + val, 0) / 4;
        this.state.overallBalance = 1 - Math.sqrt(elementVariance) / (avgIntensity * 3 || 1);
        this.state.centerIntegration = Math.min(...Array.from(elementBalance.values())) / (avgIntensity * 3 || 1);
    }
    integrateAether() {
        const aetherInfluence = this.state.centerIntegration * this.geometricRatios.phi;
        this.state.houses.forEach(house => {
            const distanceFromBalance = Math.abs(house.intensity - 0.5);
            const aetherCorrection = distanceFromBalance * aetherInfluence * 0.1;
            if (house.intensity < 0.5) {
                house.intensity += aetherCorrection;
            }
            else {
                house.intensity -= aetherCorrection;
            }
        });
        this.recalculateBalance();
    }
    getState() {
        return { ...this.state };
    }
    getHouseByPosition(x, y, centerX, centerY) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        return this.state.houses.find(house => {
            const angleDiff = Math.abs(angle - house.angle);
            const normalizedDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff);
            return normalizedDiff < Math.PI / 12 &&
                Math.abs(distance - house.radius) < 20;
        }) || null;
    }
    applyLunarInfluence(lunarPhase) {
        this.state.lunarPhase = lunarPhase;
        const waterHouses = this.state.houses.filter(h => h.element === 'water');
        const lunarMultiplier = 0.5 + 0.5 * Math.sin(lunarPhase * 2 * Math.PI);
        waterHouses.forEach(house => {
            house.intensity = house.intensity * 0.7 + lunarMultiplier * 0.3;
        });
        this.recalculateBalance();
    }
    exportVisualizationData() {
        return {
            houses: this.state.houses.map(house => ({
                ...house,
                x: Math.cos(house.angle) * house.radius,
                y: Math.sin(house.angle) * house.radius,
                size: house.intensity * 30 + 10
            })),
            connections: this.state.activeTransformations.map(t => {
                const [fromId, toId] = t.split('->');
                return { fromId, toId, strength: 0.5 };
            }),
            aetherCenter: {
                intensity: this.state.centerIntegration,
                balance: this.state.overallBalance
            }
        };
    }
}
exports.SacredHoloflower = SacredHoloflower;
