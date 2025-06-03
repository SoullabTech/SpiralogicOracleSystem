"use strict";
// src/agents/innerGuideAgent.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.journalEntrySchema = void 0;
exports.processJournalEntry = processJournalEntry;
const zod_1 = require("zod");
const divinationService_1 = require("../services/divinationService");
const dreamService_1 = require("../services/dreamService");
const symbolParser_1 = require("../utils/symbolParser");
exports.journalEntrySchema = zod_1.z.object({
    userId: zod_1.z.string(),
    entry: zod_1.z.string().min(10),
    timestamp: zod_1.z.string().optional(),
});
async function processJournalEntry(input) {
    const { userId, entry } = input;
    // Step 1: Extract symbols from journal
    const symbols = (0, symbolParser_1.extractSymbolsFromJournal)(entry);
    // Step 2: Check for dream themes
    const dreamThemes = await (0, dreamService_1.interpretDreamSymbols)(entry);
    // Step 3: Generate divinatory insight
    const divination = await (0, divinationService_1.generateDivinatoryInsight)({ userId, entry });
    // Step 4: Integration suggestion
    const integrationPrompt = `Reflect on the symbol(s): ${symbols.length > 0 ? symbols.join(', ') : 'none'}${dreamThemes && dreamThemes.length > 0 ? ` and dream theme(s): ${dreamThemes.join(', ')}` : ''}. What do they reveal about your inner process?`;
    return {
        symbols,
        dreamThemes,
        divination,
        integrationPrompt,
    };
}
