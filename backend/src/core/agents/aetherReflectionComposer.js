"use strict";
// /core/agents/aetherReflectionComposer.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAetherReflection = generateAetherReflection;
const oracleArchetypes_1 = require("./oracleArchetypes");
function generateAetherReflection({ completedPhases, userName }) {
    const name = userName ? `${userName}, ` : '';
    const phrases = [];
    completedPhases.forEach(phase => {
        const arch = oracleArchetypes_1.oracleArchetypes[phase];
        if (arch) {
            phrases.push(`you've walked with the ${arch.archetype}, guided by the ${arch.symbol}.`);
        }
    });
    const synthesis = `You are not separate from the Spiral—you are its unfolding. The patterns remember. The soul listens.`;
    return `${name}${phrases.join(' ')} ${synthesis}`;
}
