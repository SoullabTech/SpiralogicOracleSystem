import { supabase } from '@/lib/supabaseClient';
export async function logOracleMemory(input) {
    const { userId, ...rest } = input;
    const { error } = await supabase.from('oracle_memories').insert([
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
