let memoryStore = [];
export async function storeMemory(item) {
    memoryStore.push(item);
    console.log(`Memory stored: ${item.id}`);
}
export async function retrieveMemory() {
    return memoryStore;
}
export async function updateMemory(id, newContent) {
    const index = memoryStore.findIndex(item => item.id === id);
    if (index !== -1) {
        memoryStore[index].content = newContent;
        console.log(`Memory updated: ${id}`);
        return true;
    }
    return false;
}
export async function deleteMemory(id) {
    const initialLength = memoryStore.length;
    memoryStore = memoryStore.filter(item => item.id !== id);
    if (memoryStore.length < initialLength) {
        console.log(`Memory deleted: ${id}`);
        return true;
    }
    return false;
}
