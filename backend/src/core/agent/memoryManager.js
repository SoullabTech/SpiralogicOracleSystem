"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeMemory = storeMemory;
exports.retrieveMemory = retrieveMemory;
exports.updateMemory = updateMemory;
exports.deleteMemory = deleteMemory;
exports.enhanceResponseWithMemory = enhanceResponseWithMemory;
exports.getClientMemories = getClientMemories;
exports.cleanupOldMemories = cleanupOldMemories;
let memoryStore = [];
/**
 * Stores a memory item.
 */
async function storeMemory(item) {
    memoryStore.push({
        ...item,
        timestamp: item.timestamp || Date.now()
    });
    console.log(`✅ Memory stored: ${item.id}`);
}
/**
 * Retrieves all memory items.
 */
async function retrieveMemory() {
    return memoryStore;
}
/**
 * Updates a memory item by ID.
 */
async function updateMemory(id, newContent) {
    const index = memoryStore.findIndex(item => item.id === id);
    if (index !== -1) {
        memoryStore[index].content = newContent;
        console.log(`✏️ Memory updated: ${id}`);
        return true;
    }
    return false;
}
/**
 * Deletes a memory item by ID.
 */
async function deleteMemory(id) {
    const initialLength = memoryStore.length;
    memoryStore = memoryStore.filter(item => item.id !== id);
    if (memoryStore.length < initialLength) {
        console.log(`🗑️ Memory deleted: ${id}`);
        return true;
    }
    return false;
}
/**
 * Enhances a response by appending related memory (naively for now).
 */
async function enhanceResponseWithMemory(response) {
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
async function getClientMemories(clientId) {
    return memoryStore.filter(item => item.clientId === clientId);
}
/**
 * Cleans up old memories (older than 30 days).
 */
async function cleanupOldMemories() {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const initialLength = memoryStore.length;
    memoryStore = memoryStore.filter(item => {
        const timestamp = typeof item.timestamp === 'number' ? item.timestamp : Date.parse(item.timestamp);
        return timestamp >= thirtyDaysAgo;
    });
    const removedCount = initialLength - memoryStore.length;
    if (removedCount > 0) {
        console.log(`🧹 Cleaned up ${removedCount} old memories`);
    }
}
