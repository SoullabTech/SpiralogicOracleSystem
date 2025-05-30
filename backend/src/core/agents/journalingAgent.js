// journalingAgent.ts
import { getUserProfile } from "./profileService";
import { detectFacetFromInput } from "./utils/facetUtil";
import { storeMemoryItem } from "./memoryService";
import logger from "./utils/logger";
export class JournalingAgent {
    async submitEntry(entry) {
        try {
            const profile = await getUserProfile(entry.userId);
            const facet = detectFacetFromInput(entry.input);
            const summary = this.summarizeEntry(entry.input);
            await storeMemoryItem({
                content: entry.input,
                element: facet, // fallback logic can be refined
                sourceAgent: 'journaling-agent',
                clientId: entry.userId,
                confidence: 0.85,
                metadata: {
                    type: 'journal',
                    summary,
                    facet,
                },
            });
            return { summary, facet };
        }
        catch (err) {
            logger.error('JournalingAgent failed to process entry:', err);
            throw err;
        }
    }
    summarizeEntry(text) {
        const sentences = text.split('. ');
        return sentences.length > 1 ? sentences.slice(0, 2).join('. ') + '.' : text;
    }
}
export const journalingAgent = new JournalingAgent();
