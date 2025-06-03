"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PetalTransitions = exports.HarmonicConstants = void 0;
// 📁 BACKEND/src/lib/harmonicPetalMap.ts
exports.HarmonicConstants = {
    SQRT_10: 3.1623,
    PHI: 1.6180,
    PI: 3.1416,
    E: 2.7182,
};
exports.PetalTransitions = [
    { from: 'Aether', to: 'Fire', multiplier: exports.HarmonicConstants.SQRT_10 },
    { from: 'Fire', to: 'Earth', multiplier: exports.HarmonicConstants.PHI },
    { from: 'Earth', to: 'Water', multiplier: exports.HarmonicConstants.PHI },
    { from: 'Water', to: 'Air', multiplier: exports.HarmonicConstants.PI },
    { from: 'Air', to: 'Aether', multiplier: exports.HarmonicConstants.E },
];
