// 📁 src/services/dreamService.ts
const dreams = [];
export const dreamService = {
    record: async (dream) => {
        dream.createdAt = new Date().toISOString();
        dreams.push(dream);
        return dream;
    },
    interpret: async (dream) => {
        return `The dream contains ${dream.symbols?.join(', ') || 'no symbols'}, revealing hidden archetypes.`;
    },
    getAllByUser: async (userId) => {
        return dreams.filter((d) => d.userId === userId);
    },
};
