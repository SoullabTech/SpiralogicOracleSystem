import { dreamService, Dream } from '@/services/dreamService';
import { v4 as uuidv4 } from 'uuid';

interface DreamInput {
  userId: string;
  dreamDescription: string;
  context?: Record<string, any>;
}

export const dreamOracle = {
  async process({ userId, dreamDescription, context }: DreamInput) {
    if (!userId || !dreamDescription) {
      throw new Error('Missing required fields: userId or dreamDescription');
    }

    const dream: Dream = {
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
