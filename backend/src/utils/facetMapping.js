"use strict";
// utils/facetMapping.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementalFacetMap = void 0;
exports.determineFacet = determineFacet;
exports.ElementalFacetMap = {
    Fire: ['Experience', 'Expression', 'Expansion'],
    Water: ['Heart', 'Healing', 'Holiness'],
    Earth: ['Mission', 'Means', 'Medicine'],
    Air: ['Connection', 'Community', 'Consciousness'],
};
function determineFacet(input) {
    const lower = input.toLowerCase();
    const keywordFacetMap = {
        Experience: ['begin', 'start', 'ignite', 'inspire'],
        Expression: ['speak', 'share', 'express', 'voice'],
        Expansion: ['grow', 'expand', 'transform', 'radiate'],
        Heart: ['feel', 'emotion', 'love', 'care'],
        Healing: ['heal', 'recover', 'pain', 'release'],
        Holiness: ['sacred', 'divine', 'spirit', 'devotion'],
        Mission: ['purpose', 'goal', 'vision', 'aim'],
        Means: ['tools', 'steps', 'plan', 'strategy'],
        Medicine: ['remedy', 'support', 'restore', 'sustain'],
        Connection: ['connect', 'relate', 'bond', 'exchange'],
        Community: ['group', 'team', 'tribe', 'support'],
        Consciousness: ['awareness', 'insight', 'clarity', 'thought'],
    };
    for (const [facet, keywords] of Object.entries(keywordFacetMap)) {
        if (keywords.some(k => lower.includes(k))) {
            return facet;
        }
    }
    return null;
}
