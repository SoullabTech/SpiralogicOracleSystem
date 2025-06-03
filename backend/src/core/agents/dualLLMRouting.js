"use strict";
// src/core/dualLLMRouting.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectLLM = selectLLM;
exports.callLLM = callLLM;
/**
 * Selects an LLM provider based on simple keyword heuristics.
 * For example, if the query contains words related to feelings or spirituality, it selects 'claude';
 * otherwise, it defaults to 'gpt'.
 *
 * @param query The user query.
 * @returns 'claude' if the query appears emotional or spiritual, otherwise 'gpt'.
 */
function selectLLM(query) {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('feel') ||
        lowerQuery.includes('emotion') ||
        lowerQuery.includes('spiritual') ||
        lowerQuery.includes('soul') ||
        lowerQuery.includes('heart')) {
        return 'claude';
    }
    return 'gpt';
}
/**
 * Simulates calling an LLM provider.
 * In a full implementation, this function would call external APIs (e.g., OpenAI or Anthropic).
 *
 * @param provider The selected LLM provider.
 * @param query The query to process.
 * @returns A simulated response string.
 */
async function callLLM(provider, query) {
    // Simulated API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    if (provider === 'claude') {
        return `Claude Response to "${query}": Embracing your emotional depth and intuitive insight.`;
    }
    else {
        return `GPT Response to "${query}": Here is a structured analysis and strategic advice.`;
    }
}
