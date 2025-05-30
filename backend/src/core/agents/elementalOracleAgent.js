// 📁 File: src/agents/elementalOracleAgent.ts
import { fetchElementalInsights } from '@/services/elementalOracleService';
export const elementalOracle = {
    async process({ userId, input, element, context }) {
        if (!userId || !input || !element) {
            throw new Error('Missing required fields: userId, input, or element');
        }
        const response = await fetchElementalInsights({ userId, input, element, context });
        return {
            oracle: element,
            insight: response?.message ?? 'No insight available at this time.',
        };
    },
};
// 📁 File: src/agents/dreamOracleAgent.ts
import { interpretDreamInput } from '@/services/dreamService';
export const dreamOracle = {
    async process({ userId, dreamDescription, context }) {
        if (!userId || !dreamDescription) {
            throw new Error('Missing required fields: userId or dreamDescription');
        }
        const response = await interpretDreamInput({ userId, dreamDescription, context });
        return {
            oracle: 'Dream Oracle',
            interpretation: response?.message ?? 'No interpretation available at this time.',
        };
    },
};
// ✅ Placement confirmation
// Yes, placing memorymanager.ts under src/agents is correct if it's implementing agent-like logic such as memory coordination, prioritization, or interfacing with other agents/services.
