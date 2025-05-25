// src/lib/seedOracles.ts

import { supabase } from './supabaseClient';

/**
 * Bulk seed multiple Oracles (used in local/dev setup).
 */
export async function seedOracles(): Promise<void> {
  const oracles = [
    {
      name: 'dream-weaver',
      archetype: 'Shaman',
      element: 'Water',
      description: 'Helps guide dreams, intuition, and emotional clarity.',
    },
    {
      name: 'stone-keeper',
      archetype: 'Mentor',
      element: 'Earth',
      description: 'Grounded guide for deep wisdom and life structure.',
    },
    {
      name: 'phoenix-flame',
      archetype: 'Warrior',
      element: 'Fire',
      description: 'Ignites transformation through courage and fire.',
    },
    {
      name: 'sky-scribe',
      archetype: 'Sage',
      element: 'Air',
      description: 'Offers clarity, insight, and higher vision.',
    },
  ];

  try {
    const { data, error } = await supabase
      .from('oracles')
      .upsert(oracles, { onConflict: ['name'] });

    if (error) {
      console.error('❌ Bulk Oracle seeding failed:', error.message);
      throw error;
    }

    console.log('✅ Bulk Oracles seeded successfully:', data);
  } catch (err: any) {
    console.error('❌ Error during Oracle bulk seed:', err.message || err);
  }
}
