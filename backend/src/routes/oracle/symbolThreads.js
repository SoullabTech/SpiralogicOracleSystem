"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymbolThreadResponseSchema = exports.SymbolThreadRequestSchema = void 0;
// 📁 BACKEND: /routes/oracle/symbolThreads.ts Zod validation
const zod_1 = require("zod");
exports.SymbolThreadRequestSchema = zod_1.z.object({
    symbol: zod_1.z.string().min(1)
});
exports.SymbolThreadResponseSchema = zod_1.z.object({
    dreams: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        title: zod_1.z.string(),
        description: zod_1.z.string(),
        symbols: zod_1.z.array(zod_1.z.string()),
        phase: zod_1.z.string(),
        archetype: zod_1.z.string()
    }))
});
