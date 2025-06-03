"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
// src/lib/supabase.ts
const supabase_js_1 = require("@supabase/supabase-js");
// Initialize Supabase client using environment variables
exports.supabase = (0, supabase_js_1.createClient)(import.meta.env.VITE_SUPABASE_URL, // Fetch Supabase URL from environment variables
import.meta.env.VITE_SUPABASE_ANON_KEY // Fetch the public API key
);
