"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dreamOracle = void 0;
const dreamService_1 = require("@/services/dreamService");
const uuid_1 = require("uuid");
exports.dreamOracle = {
    async process({ userId, dreamDescription, context }) {
        if (!userId || !dreamDescription) {
            throw new Error('Missing required fields: userId or dreamDescription');
        }
        const dream = {
            id: (0, uuid_1.v4)(),
            userId,
            text: dreamDescription,
            symbols: context?.symbols ?? [], // Optional: provide from frontend
        };
        // Record the dream
        dreamService_1.dreamService.record(dream);
        // Interpret the dream
        const message = dreamService_1.dreamService.interpret(dream);
        return {
            oracle: 'Dream Oracle',
            interpretation: message,
        };
    },
};
