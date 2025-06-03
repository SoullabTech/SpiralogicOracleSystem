"use strict";
// src/controllers/memory.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeMemory = storeMemory;
exports.getMemories = getMemories;
exports.createSharedSpace = createSharedSpace;
exports.listSharedSpaces = listSharedSpaces;
const memoryService_1 = require("../services/memoryService");
const memory_1 = require("../schemas/memory");
const service = new memoryService_1.MemoryService();
async function storeMemory(req, res) {
    try {
        const parse = memory_1.memoryCreateSchema.safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'Invalid memory data', details: parse.error.format() });
        }
        const userId = req.user?.id || 'anonymous';
        const memory = await service.storeMemory({ ...parse.data, userId });
        return res.status(200).json(memory);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to store memory', details: error });
    }
}
async function getMemories(req, res) {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        const memories = await service.retrieveMemories(userId);
        return res.status(200).json(memories);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to retrieve memories', details: error });
    }
}
async function createSharedSpace(req, res) {
    try {
        const parse = memory_1.sharedSpaceSchema.safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'Invalid shared space data', details: parse.error.format() });
        }
        const userId = req.user?.id || 'anonymous';
        const space = await service.createSharedSpace(userId, parse.data.name, parse.data.participants);
        return res.status(200).json(space);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to create shared space', details: error });
    }
}
async function listSharedSpaces(req, res) {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        const spaces = await service.listSharedSpaces(userId);
        return res.status(200).json(spaces);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to list shared spaces', details: error });
    }
}
