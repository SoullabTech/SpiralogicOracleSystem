// src/services/elementalOracleService.ts
export const elementalOracleService = {
    generateStory: ({ theme, prompt }) => {
        const intro = `Invoking the wisdom of the ${theme} element...`;
        const message = `${intro} You asked: "${prompt}". Here is a symbolic response.`;
        const symbols = {
            Fire: ['Phoenix', 'Candle', 'Volcano'],
            Water: ['Moon', 'Cup', 'Ocean'],
            Earth: ['Mountain', 'Tree', 'Stone'],
            Air: ['Feather', 'Cloud', 'Spiral'],
            Aether: ['Star', 'Circle', 'Portal'],
        }[theme];
        return {
            message,
            symbols,
            insight: `The ${theme} element invites reflection on your current journey. What is being revealed through this symbol?`,
        };
    },
};
