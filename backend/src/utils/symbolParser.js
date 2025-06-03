"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractSymbolsFromJournal = extractSymbolsFromJournal;
function extractSymbolsFromJournal(entry) {
    const lowerEntry = entry.toLowerCase();
    const symbolKeywords = {
        transformation: ['fire', 'phoenix', 'rebirth', 'change', 'ignite'],
        water: ['ocean', 'tears', 'rain', 'flow', 'river'],
        grounding: ['tree', 'earth', 'roots', 'stone', 'mountain'],
        air: ['wind', 'voice', 'feather', 'breath', 'sky'],
        shadow: ['dark', 'mirror', 'hidden', 'ghost', 'void'],
        archetypes: ['mother', 'warrior', 'child', 'sage', 'lover'],
    };
    const matches = [];
    for (const [category, words] of Object.entries(symbolKeywords)) {
        let weight = 0;
        for (const word of words) {
            if (lowerEntry.includes(word)) {
                weight += 1;
            }
        }
        if (weight > 0) {
            matches.push({ category, weight });
        }
    }
    return matches;
}
