// scripts/seedRituals.mts
#!/usr/bin/env ts-node-esm

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('❌ Missing env vars: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

console.log("🔧 Supabase URL:", SUPABASE_URL);
console.log("🔧 Supabase Key (first 6):", SUPABASE_KEY.slice(0, 6) + "...");

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const elements = ['fire', 'water', 'earth', 'air', 'aether'] as const;
const archetypes = ['Sage', 'Mystic', 'Healer', 'Explorer', 'Oracle'] as const;
const phases = ['Initiation', 'Grounding', 'Transformation', 'Completion'] as const;

type Element = (typeof elements)[number];
type Archetype = (typeof archetypes)[number];
type Phase = (typeof phases)[number];

interface RitualRecommendation {
  user_id: string;
  phase: Phase;
  element: Element;
  archetype: Archetype;
  recommendation: {
    elementalPractice: string;
    archetypalAction: string;
    shadowPrompt: string;
    integrationRitual: string;
  };
}

async function seed() {
  console.log('🌱 Seeding ritual_recommendations...\n');

  for (let i = 0; i < 10; i++) {
    const ritual: RitualRecommendation = {
      user_id: faker.string.uuid(),
      phase: faker.helpers.arrayElement(phases),
      element: faker.helpers.arrayElement(elements),
      archetype: faker.helpers.arrayElement(archetypes),
      recommendation: {
        elementalPractice: faker.lorem.sentence(),
        archetypalAction: faker.lorem.sentence(),
        shadowPrompt: faker.lorem.sentence(),
        integrationRitual: faker.lorem.sentence()
      }
    };

    const { data, error } = await supabase
      .from('ritual_recommendations')
      .insert([ritual])
      .select();

    if (error) {
      console.error(`❌ Ritual ${i + 1} failed:\n`, error);
    } else {
      console.log(`✅ Ritual ${i + 1} inserted:\n`, JSON.stringify(data, null, 2));
    }
  }

  console.log('\n🌿 Seeding complete.');
}

seed().catch((err) => {
  console.error('🔥 Unhandled error during seeding:', err);
  process.exit(1);
});

export {};
