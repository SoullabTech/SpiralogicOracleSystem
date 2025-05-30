// src/core/agents/elementalAgent.ts
import { FireAgent } from './fireAgent';
import { WaterAgent } from './waterAgent';
import { EarthAgent } from './earthAgent';
import { AirAgent } from './airAgent';
import { AetherAgent } from './aetherAgent';
import { detectFacetFromInput } from '@utils/facetUtil';
import MemoryModule from '@utils/memoryModule';
export class ElementalAgent {
    constructor() {
        this.agents = {
            fire: new FireAgent(),
            water: new WaterAgent(),
            earth: new EarthAgent(),
            air: new AirAgent(),
            aether: new AetherAgent(),
        };
    }
    async process(query) {
        const { input, userId } = query;
        const facet = detectFacetFromInput(input);
        const element = this.mapFacetToElement(facet);
        const selectedAgent = this.agents[element];
        const response = await selectedAgent.processQuery(query);
        // Attach metadata + log
        response.metadata = {
            ...response.metadata,
            element,
            facet,
        };
        MemoryModule.addEntry({ userId, input, response }); // dynamic memory log
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
export const elementalAgent = new ElementalAgent();
