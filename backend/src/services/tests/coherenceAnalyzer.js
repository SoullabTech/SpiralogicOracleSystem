"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeCoherence = analyzeCoherence;
// 📁 BACKEND/src/services/coherenceAnalyzer.ts
function analyzeCoherence(input) {
    if (input.includes('death') || input.includes('collapse')) {
        return { score: 40, suggestedPhase: 'Water 2' };
    }
    if (input.includes('rage') || input.includes('burn')) {
        return { score: 35, suggestedPhase: 'Fire 3' };
    }
    return { score: 80, suggestedPhase: 'Earth 1' };
}
