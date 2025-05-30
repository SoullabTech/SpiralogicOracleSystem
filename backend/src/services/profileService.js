import { supabase } from '../lib/supabaseClient';
export async function getUserProfile(userId) {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('personal_guide_name, guide_gender, voice_id, guide_language')
        .eq('user_id', userId)
        .single();
    if (error) {
        throw new Error(`Failed to get user profile: ${error.message}`);
    }
    return data || {
        personal_guide_name: 'Oracle',
        guide_gender: 'neutral',
        voice_id: 'default',
        guide_language: 'en'
    };
}
export async function updateUserProfile(userId, updates) {
    const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId)
        .single();
    if (error) {
        throw new Error(`Failed to update user profile: ${error.message}`);
    }
    return data;
}
