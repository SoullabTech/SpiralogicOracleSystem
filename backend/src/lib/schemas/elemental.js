"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.elementalProfileSchema = exports.crystalFocusSchema = void 0;
const zod_1 = require("zod");
// Optional crystal focus schema
exports.crystalFocusSchema = zod_1.z.object({
    type: zod_1.z.enum(['career', 'spiritual', 'relational', 'health', 'creative', 'other']),
    customDescription: zod_1.z.string().optional(),
    challenges: zod_1.z.string(),
    aspirations: zod_1.z.string(),
});
// Elemental profile schema
exports.elementalProfileSchema = zod_1.z.object({
    user_id: zod_1.z.string(),
    fire: zod_1.z.number().min(0).max(100),
    water: zod_1.z.number().min(0).max(100),
    earth: zod_1.z.number().min(0).max(100),
    air: zod_1.z.number().min(0).max(100),
    aether: zod_1.z.number().min(0).max(100),
    crystal_focus: exports.crystalFocusSchema.optional(),
    updated_at: zod_1.z.string().optional(), // ISO timestamp
});
