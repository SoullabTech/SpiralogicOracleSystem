// backend/src/lib/seedTestOracle.ts

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.test (Playwright sets NODE_ENV=test by default)
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const ANON_KEY    = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('❌ Missing Supabase URL in .env.test');
  process.exit(1);
}

// Choose the right key
const KEY = process.env.NODE_ENV === 'test' && SERVICE_ROLE_KEY
  ? SERVICE_ROLE_KEY
  : ANON_KEY;

if (!KEY) {
  console.error(`❌ Missing ${process.env.NODE_ENV === 'test' ? 'SERVICE_ROLE_KEY' : 'ANON_KEY'} in .env.test`);
  process.exit(1);
}

// Create a client with explicit headers so fetch() will succeed in Node
const supabase = createClient(SUPABASE_URL, KEY, {
  global: {
    headers: { apikey: KEY }
  }
});

async function seed() {
  try {
    const { data, error } = await supabase
      .from('oracles')
      .insert([{ name: 'Test Oracle', created_at: new Date().toISOString() }]);

    if (error) throw error;
    console.log('✅ Seeded Oracle:', data);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
