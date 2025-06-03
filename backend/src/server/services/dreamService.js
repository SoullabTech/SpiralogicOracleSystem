"use strict";
// 📁 src/services/dreamService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.dreamService = void 0;
const dreams = [];
exports.dreamService = {
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
