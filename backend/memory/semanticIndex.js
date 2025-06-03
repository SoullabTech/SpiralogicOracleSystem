"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncWithLlamaIndex = syncWithLlamaIndex;
exports.searchSemanticMemory = searchSemanticMemory;
// /oracle-backend/memory/semanticIndex.ts
const llamaindex_1 = require("llamaindex");
let index = null;
async function syncWithLlamaIndex(journalEntries) {
    const docs = journalEntries.map((entry) => new llamaindex_1.Document({ text: entry.content }));
    index = await llamaindex_1.VectorStoreIndex.fromDocuments(docs);
}
async function searchSemanticMemory(query) {
    if (!index)
        return [];
    const results = await index.search(query);
    return results;
}
