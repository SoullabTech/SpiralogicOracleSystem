"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logMemory = logMemory;
exports.getMemorySpiral = getMemorySpiral;
const memorySpiral = [];
function logMemory(entry) {
    memorySpiral.push(entry);
}
function getMemorySpiral() {
    return memorySpiral;
}
