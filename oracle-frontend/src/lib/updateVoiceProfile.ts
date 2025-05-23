// 📁 File: src/lib/updateVoiceProfile.ts

import { supabase } from '@/lib/supabaseClient';

export async function updateVoiceProfile(userId: string, profileKey: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ voice_profile: profileKey })
    .eq('id', userId);

  if (error) {
    console.error('Failed to update voice profile:', error);
  }
}
