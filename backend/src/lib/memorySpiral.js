const memorySpiral = [];
export function logMemory(entry) {
    memorySpiral.push(entry);
}
export function getMemorySpiral() {
    return memorySpiral;
}
