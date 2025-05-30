// oracle-backend/src/services/symbolService.ts
import { detectFacetFromInput } from './facetService';
export function extractSymbolicTags(input, sourceAgent = 'system') {
    const cleaned = input.trim().toLowerCase();
    if (!cleaned)
        return [];
    const element = detectFacetFromInput(cleaned);
    const symbolTag = {
        symbol: cleaned.slice(0, 25), // crude default
        agent: sourceAgent,
        element,
        facet: undefined,
        phase: undefined,
        timestamp: new Date().toISOString(),
        confidence: 0.8,
    };
    return [symbolTag];
}
