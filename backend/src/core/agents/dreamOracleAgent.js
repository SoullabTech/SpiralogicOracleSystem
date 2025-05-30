import { dreamService } from '@/services/dreamService';
import { v4 as uuidv4 } from 'uuid';
export const dreamOracle = {
    async process({ userId, dreamDescription, context }) {
        if (!userId || !dreamDescription) {
            throw new Error('Missing required fields: userId or dreamDescription');
        }
        const dream = {
            id: uuidv4(),
            userId,
            text: dreamDescription,
            symbols: context?.symbols ?? [], // Optional: provide from frontend
        };
        // Record the dream
        dreamService.record(dream);
        // Interpret the dream
        const message = dreamService.interpret(dream);
        return {
            oracle: 'Dream Oracle',
            interpretation: message,
        };
    },
};
