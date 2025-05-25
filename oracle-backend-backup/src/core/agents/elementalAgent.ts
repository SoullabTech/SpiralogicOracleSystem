// src/core/agents/elementalAgent.ts
import { FireAgent } from './fireAgent';
import { WaterAgent } from './waterAgent';
import { EarthAgent } from './earthAgent';
import { AirAgent } from './airAgent';
import { AetherAgent } from './aetherAgent';
import { detectFacetFromInput } from '@utils/facetUtil';
import MemoryModule from '@utils/memoryModule';
import type { AIResponse } from '@/core/types/ai';

interface QueryInput {
  input: string;
  userId: string;
  context?: Record<string, unknown>;
}

export class ElementalAgent {
  private agents = {
    fire: new FireAgent(),
    water: new WaterAgent(),
    earth: new EarthAgent(),
    air: new AirAgent(),
    aether: new AetherAgent(),
  };

  async process(query: QueryInput): Promise<AIResponse> {
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

  private mapFacetToElement(facet: string): keyof ElementalAgent['agents'] {
    const facetMap: Record<string, keyof ElementalAgent['agents']> = {
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
