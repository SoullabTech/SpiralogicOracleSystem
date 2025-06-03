"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.elementalAgent = exports.ElementalAgent = void 0;
// src/core/agents/elementalAgent.ts
const fireAgent_1 = require("./fireAgent");
const waterAgent_1 = require("./waterAgent");
const earthAgent_1 = require("./earthAgent");
const airAgent_1 = require("./airAgent");
const aetherAgent_1 = require("./aetherAgent");
const facetUtil_1 = require("@utils/facetUtil");
const memoryModule_1 = __importDefault(require("@utils/memoryModule"));
class ElementalAgent {
    constructor() {
        this.agents = {
            fire: new fireAgent_1.FireAgent(),
            water: new waterAgent_1.WaterAgent(),
            earth: new earthAgent_1.EarthAgent(),
            air: new airAgent_1.AirAgent(),
            aether: new aetherAgent_1.AetherAgent(),
        };
    }
    async process(query) {
        const { input, userId } = query;
        const facet = (0, facetUtil_1.detectFacetFromInput)(input);
        const element = this.mapFacetToElement(facet);
        const selectedAgent = this.agents[element];
        const response = await selectedAgent.processQuery(query);
        // Attach metadata + log
        response.metadata = {
            ...response.metadata,
            element,
            facet,
        };
        memoryModule_1.default.addEntry({ userId, input, response }); // dynamic memory log
        return response;
    }
    mapFacetToElement(facet) {
        const facetMap = {
            courage: 'fire',
            empathy: 'water',
            structure: 'earth',
            insight: 'air',
            mystery: 'aether',
            // Add more facet-to-element mappings here
        };
        return facetMap[facet.toLowerCase()] || 'aether';
    }
}
exports.ElementalAgent = ElementalAgent;
exports.elementalAgent = new ElementalAgent();
