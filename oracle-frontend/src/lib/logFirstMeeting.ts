// src/lib/logFirstMeeting.ts
import { supabase } from '@/lib/supabaseClient';

export async function logFirstMeeting(userId: string, oracleName: string) {
  const { error } = await supabase.from('oracle_memories').insert([
    {
      client_id: userId,
      content: `The oracle ${oracleName} was named and awakened.`,
      element: 'aether',
      source_agent: oracleName,
      confidence: 1,
      metadata: {
        role: 'oracle',
        type: 'soul_signature',
        event: 'first_meeting',
      },
    },
  ]);

  if (error) {
    console.error('Error logging first meeting:', error);
  }
}
