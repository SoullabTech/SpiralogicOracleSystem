"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
// src/lib/config.ts
const zod_1 = require("zod");
// 🧠 Define all env vars you use anywhere in your stack
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    // backend Supabase (no VITE_ prefix)
    SUPABASE_URL: zod_1.z.string().url(),
    SUPABASE_ANON_KEY: zod_1.z.string(),
    SUPABASE_SERVICE_ROLE_KEY: zod_1.z.string().optional(),
    // frontend‐only (Vite will expose these to client code)
    VITE_SUPABASE_URL: zod_1.z.string().url(),
    VITE_SUPABASE_ANON_KEY: zod_1.z.string(),
    // your ChatGPT Oracle endpoints (only needed server-side)
    VITE_CHATGPT_ORACLE_URL: zod_1.z.string().url().optional(),
    VITE_CHATGPT_ORACLE_API_KEY: zod_1.z.string().optional(),
});
function validateEnv() {
    const raw = {
        NODE_ENV: process.env.NODE_ENV,
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
        VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
        VITE_CHATGPT_ORACLE_URL: process.env.VITE_CHATGPT_ORACLE_URL,
        VITE_CHATGPT_ORACLE_API_KEY: process.env.VITE_CHATGPT_ORACLE_API_KEY,
    };
    const parsed = envSchema.safeParse(raw);
    if (!parsed.success) {
        console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
        throw new Error('Invalid environment variables');
    }
    return parsed.data;
}
exports.env = validateEnv();
