import type { MemoryItem } from "../../types";

let memoryStore: MemoryItem[] = [];

/**
 * Stores a memory item.
 */
export async function storeMemory(item: MemoryItem): Promise<void> {
  memoryStore.push({
    ...item,
    timestamp: item.timestamp || Date.now(),
  });
  console.log(`✅ Memory stored: ${item.id}`);
}

/**
 * Retrieves all memory items.
 */
export async function retrieveMemory(): Promise<MemoryItem[]> {
  return memoryStore;
}

/**
 * Updates a memory item by ID.
 */
export async function updateMemory(
  id: string,
  newContent: string,
): Promise<boolean> {
  const index = memoryStore.findIndex((item) => item.id === id);
  if (index !== -1) {
    memoryStore[index]!.content = newContent;
    console.log(`✏️ Memory updated: ${id}`);
    return true;
  }
  return false;
}

/**
 * Deletes a memory item by ID.
 */
export async function deleteMemory(id: string): Promise<boolean> {
  const initialLength = memoryStore.length;
  memoryStore = memoryStore.filter((item) => item.id !== id);
  if (memoryStore.length < initialLength) {
    console.log(`🗑️ Memory deleted: ${id}`);
    return true;
  }
  return false;
}

/**
 * Enhances a response by appending related memory (naively for now).
 */
export async function enhanceResponseWithMemory(
  response: string,
): Promise<string> {
  const memories = await retrieveMemory();
  const recentMemory = memories[memories.length - 1];
  if (recentMemory) {
    return `${response}\n\n🧠 Related memory: "${recentMemory.content}"`;
  }
  return response;
}

/**
 * Retrieves memories for a specific client.
 */
export async function getClientMemories(
  clientId: string,
): Promise<MemoryItem[]> {
  return memoryStore.filter((item) => item.clientId === clientId);
}

/**
 * Cleans up old memories (older than 30 days).
 */
export async function cleanupOldMemories(): Promise<void> {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const initialLength = memoryStore.length;
  memoryStore = memoryStore.filter((item) => {
    const timestamp =
      typeof item.timestamp === "number"
        ? item.timestamp
        : Date.parse(item.timestamp);
    return timestamp >= thirtyDaysAgo;
  });
  const removedCount = initialLength - memoryStore.length;
  if (removedCount > 0) {
    console.log(`🧹 Cleaned up ${removedCount} old memories`);
  }
}
