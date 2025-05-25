// src/lib/soulProfile.ts
import { supabase } from './supabaseClient';

export interface SoulProfile {
  userId: string;
  soulName: string;
  auraColor: string;
  totem: string;
  element: string;
  archetype: string;
  spiralPhase?: string;
  birthChartData?: any;
  guideAgentId?: string;
  createdAt?: string;
  onboardingCompletedAt?: string;
}

export async function saveSoulProfile(profile: SoulProfile): Promise<void> {
  const { error } = await supabase
    .from('soul_profiles')
    .upsert([
      {
        user_id: profile.userId,
        soul_name: profile.soulName,
        aura_color: profile.auraColor,
        totem: profile.totem,
        element: profile.element,
        archetype: profile.archetype,
        spiral_phase: profile.spiralPhase || null,
        birth_chart_data: profile.birthChartData || null,
        guide_agent_id: profile.guideAgentId || null,
        created_at: profile.createdAt || new Date().toISOString(),
        onboarding_completed_at: profile.onboardingCompletedAt || new Date().toISOString(),
      },
    ], {
      onConflict: ['user_id'],
    });

  if (error) {
    console.error('Error saving soul profile:', error);
    throw error;
  }
}

export async function getSoulProfile(userId: string): Promise<SoulProfile | null> {
  const { data, error } = await supabase
    .from('soul_profiles')
    .selec