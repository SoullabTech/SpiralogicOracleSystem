"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeMemory = storeMemory;
exports.retrieveMemory = retrieveMemory;
exports.updateMemory = updateMemory;
exports.deleteMemory = deleteMemory;
let memoryStore = [];
async function storeMemory(item) {
    memoryStore.push(item);
    console.log(`Memory stored: ${item.id}`);
}
async function retrieveMemory() {
    return memoryStore;
}
async function updateMemory(id, newContent) {
    const index = memoryStore.findIndex(item => item.id === id);
    if (index !== -1) {
        memoryStore[index].content = newContent;
        console.log(`Memory updated: ${id}`);
        return true;
    }
    return false;
}
async function deleteMemory(id) {
    const initialLength = memoryStore.length;
    memoryStore = memoryStore.filter(item => item.id !== id);
    if (memoryStore.length < initialLength) {
        console.log(`Memory deleted: ${id}`);
        return true;
    }
    return false;
}
