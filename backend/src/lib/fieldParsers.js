"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractElementIndex = extractElementIndex;
exports.extractEmotionalTone = extractEmotionalTone;
exports.extractSymbols = extractSymbols;
const ELEMENT_KEYWORDS = {
    fire: ["ignite", "burn", "action", "passion"],
    water: ["feel", "flow", "grief", "tears"],
    air: ["thought", "idea", "pattern", "speak"],
    earth: ["ground", "build", "stable", "slow"],
    aether: ["mystery", "spirit", "void", "soul"]
};
const EMOTION_KEYWORDS = {
    grief: ["loss", "mourning", "ache"],
    joy: ["gratitude", "light", "celebrate"],
    fear: ["worry", "anxiety", "panic"],
    awe: ["wonder", "cosmic", "transcend"],
    longing: ["desire", "yearning", "missing"]
};
const SYMBOLS = ["phoenix", "mirror", "labyrinth", "doorway", "seed", "flame", "ocean", "star"];
function extractElementIndex(text) {
    const index = {};
    for (const [element, words] of Object.entries(ELEMENT_KEYWORDS)) {
        index[element] = words.reduce((acc, word) => acc + countOccurrences(text, word), 0);
    }
    return index;
}
function extractEmotionalTone(text) {
    const tone = {};
    for (const [emotion, triggers] of Object.entries(EMOTION_KEYWORDS)) {
        tone[emotion] = triggers.reduce((acc, word) => acc + countOccurrences(text, word), 0);
    }
    return tone;
}
function extractSymbols(text) {
    return SYMBOLS.filter(sym => text.toLowerCase().includes(sym)).slice(0, 5);
}
function countOccurrences(text, word) {
    return (text.toLowerCase().match(new RegExp(`\\b${word}\\b`, "g")) || []).length;
}
