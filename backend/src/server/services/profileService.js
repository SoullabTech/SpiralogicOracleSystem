import { supabase } from "../lib/supabaseClient";
/**
 * Get the full user profile, including elemental, voice, and guide info.
 */
export async function getUserProfile(userId) {
    const { data, error } = await supabase
        .from("profiles")
        .select("user_id, fire, water, earth, air, aether, crystal_focus, voice_profile, guide_voice, guide_name, updated_at")
        .eq("user_id", userId)
        .single();
    if (error) {
        console.error("Error fetching profile:", error.message);
        throw new Error("Failed to retrieve profile");
    }
    return data;
}
/**
 * Update or insert a user profile.
 */
export async function updateUserProfile(userId, profile) {
    const payload = { ...profile, user_id: userId };
    const { data, error } = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "user_id" })
        .select()
        .single();
    if (error) {
        console.error("Error updating profile:", error.message);
        throw new Error("Failed to update profile");
    }
    return data;
}
/**
 * Get elemental profile stats for visualization.
 */
export async function getProfileStats(userId) {
    const { data, error } = await supabase
        .from("profiles")
        .select("fire, water, earth, air, aether")
        .eq("user_id", userId)
        .single();
    if (error) {
        console.error("Error fetching profile stats:", error.message);
        throw new Error("Failed to fetch stats");
    }
    return {
        fire: data.fire,
        water: data.water,
        earth: data.earth,
        air: data.air,
        aether: data.aether,
    };
}
