"use strict";
// 📁 File: src/agents/elementalOracleAgent.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.dreamOracle = exports.elementalOracle = void 0;
const elementalOracleService_1 = require("@/services/elementalOracleService");
exports.elementalOracle = {
    async process({ userId, input, element, context }) {
        if (!userId || !input || !element) {
            throw new Error('Missing required fields: userId, input, or element');
        }
        const response = await (0, elementalOracleService_1.fetchElementalInsights)({ userId, input, element, context });
        return {
            oracle: element,
            insight: response?.message ?? 'No insight available at this time.',
        };
    },
};
// 📁 File: src/agents/dreamOracleAgent.ts
const dreamService_1 = require("@/services/dreamService");
exports.dreamOracle = {
    async process({ userId, dreamDescription, context }) {
        if (!userId || !dreamDescription) {
            throw new Error('Missing required fields: userId or dreamDescription');
        }
        const response = await (0, dreamService_1.interpretDreamInput)({ userId, dreamDescription, context });
        return {
            oracle: 'Dream Oracle',
            interpretation: response?.message ?? 'No interpretation available at this time.',
        };
    },
};
// ✅ Placement confirmation
// Yes, placing memorymanager.ts under src/agents is correct if it's implementing agent-like logic such as memory coordination, prioritization, or interfacing with other agents/services.
