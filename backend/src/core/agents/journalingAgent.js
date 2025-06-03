"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.journalingAgent = exports.JournalingAgent = void 0;
// journalingAgent.ts
const profileService_1 = require("./profileService");
const facetUtil_1 = require("./utils/facetUtil");
const memoryService_1 = require("./memoryService");
const logger_1 = __importDefault(require("./utils/logger"));
class JournalingAgent {
    async submitEntry(entry) {
        try {
            const profile = await (0, profileService_1.getUserProfile)(entry.userId);
            const facet = (0, facetUtil_1.detectFacetFromInput)(entry.input);
            const summary = this.summarizeEntry(entry.input);
            await (0, memoryService_1.storeMemoryItem)({
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
            logger_1.default.error('JournalingAgent failed to process entry:', err);
            throw err;
        }
    }
    summarizeEntry(text) {
        const sentences = text.split('. ');
        return sentences.length > 1 ? sentences.slice(0, 2).join('. ') + '.' : text;
    }
}
exports.JournalingAgent = JournalingAgent;
exports.journalingAgent = new JournalingAgent();
