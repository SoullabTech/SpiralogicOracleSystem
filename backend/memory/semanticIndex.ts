// /oracle-backend/memory/semanticIndex.ts
import { VectorStoreIndex, Document } from 'llamaindex';

let index: VectorStoreIndex | null = null;

export async function syncWithLlamaIndex(journalEntries: { content: string }[]) {
  const docs = journalEntries.map((entry) => new Document({ text: entry.content }));
  index = await VectorStoreIndex.fromDocuments(docs);
}

export async function searchSemanticMemory(query: string) {
  if (!index) return [];
  const results = await index.search(query);
  return results;
}
