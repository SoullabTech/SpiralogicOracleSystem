// /oracle-backend/memory/semanticIndex.ts
import { VectorStoreIndex, Document } from 'llamaindex';
let index = null;
export async function syncWithLlamaIndex(journalEntries) {
    const docs = journalEntries.map((entry) => new Document({ text: entry.content }));
    index = await VectorStoreIndex.fromDocuments(docs);
}
export async function searchSemanticMemory(query) {
    if (!index)
        return [];
    const results = await index.search(query);
    return results;
}
