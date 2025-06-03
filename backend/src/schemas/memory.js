"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memorySchema = exports.sharedSpaceSchema = exports.memoryQuerySchema = exports.memoryCreateSchema = void 0;
const zod_1 = require("zod");
exports.memoryCreateSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, "Content is required"),
    type: zod_1.z.enum(['dream', 'insight', 'ritual', 'journal']),
    symbols: zod_1.z.array(zod_1.z.string()).optional().default([]),
    metadata: zod_1.z.record(zod_1.z.any()).optional()
});
exports.memoryQuerySchema = zod_1.z.object({
    query: zod_1.z.string().min(1, "Query is required"),
    limit: zod_1.z.number().int().positive().optional().default(10),
    type: zod_1.z.enum(['dream', 'insight', 'ritual', 'journal']).optional()
});
exports.sharedSpaceSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    description: zod_1.z.string().optional(),
    participants: zod_1.z.array(zod_1.z.string()).optional().default([])
});
// Export as memorySchema for backwards compatibility
exports.memorySchema = {
    create: exports.memoryCreateSchema,
    query: exports.memoryQuerySchema,
    sharedSpace: exports.sharedSpaceSchema
};
