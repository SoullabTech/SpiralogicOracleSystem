"use strict";
// src/schemas/memory.schema.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMemorySchema = void 0;
const zod_1 = require("zod");
exports.createMemorySchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Content is required'),
});
