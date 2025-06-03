"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logOracleMemory = logOracleMemory;
const supabaseClient_1 = require("@/lib/supabaseClient");
async function logOracleMemory(input) {
    const { userId, ...rest } = input;
    const { error } = await supabaseClient_1.supabase.from('oracle_memories').insert([
        {
            user_id: userId,
            ...rest,
        },
    ]);
    if (error) {
        console.error('🛑 Failed to log Oracle memory:', error);
    }
    else {
        console.log('✅ Oracle memory logged successfully');
    }
}
