"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oracleMemoryRouter = oracleMemoryRouter;
// /oracle-backend/memory/memoryRouter.ts
const journalMemory_1 = require("./journalMemory");
const semanticIndex_1 = require("./semanticIndex");
async function oracleMemoryRouter(input, userId) {
    if (input.includes('dream') || input.includes('vision')) {
        const entries = await (0, journalMemory_1.retrieveJournalEntries)(userId);
        await (0, semanticIndex_1.syncWithLlamaIndex)(entries);
        return await (0, semanticIndex_1.searchSemanticMemory)(input);
    }
    return [{ type: 'default', content: 'Memory query not recognized symbolically yet.' }];
}
