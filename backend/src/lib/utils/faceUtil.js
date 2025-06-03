"use strict";
// src/utils/facetUtil.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectFacetFromInput = detectFacetFromInput;
const elementalFacetMap_1 = require("./elementalFacetMap");
const facetKeywords = {
    Experience: ['vision', 'ignite', 'drive', 'initiate', 'desire'],
    Expression: ['speak', 'perform', 'articulate', 'display', 'share'],
    Expansion: ['grow', 'expand', 'scale', 'reach', 'broadcast'],
    Heart: ['emotion', 'love', 'pain', 'grief', 'compassion'],
    Healing: ['recover', 'trauma', 'wound', 'repair', 'release'],
    Holiness: ['soul', 'ritual', 'mystic', 'sacred', 'devotion'],
    Mission: ['build', 'create', 'project', 'structure', 'task'],
    Means: ['tool', 'method', 'plan', 'strategy', 'resource'],
    Medicine: ['remedy', 'balance', 'nurture', 'practice', 'sustain'],
    Connection: ['relate', 'talk', 'bond', 'connect', 'listen'],
    Community: ['group', 'team', 'network', 'collaborate', 'tribe'],
    Consciousness: ['thought', 'clarity', 'perception', 'awareness', 'mind'],
};
function detectFacetFromInput(input) {
    const lowerInput = input.toLowerCase();
    for (const [facet, keywords] of Object.entries(facetKeywords)) {
        if (keywords.some(word => lowerInput.includes(word))) {
            return elementalFacetMap_1.elementalFacetMap[facet];
        }
    }
    return undefined;
}
