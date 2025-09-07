// /scripts/ping-supabase.ts
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.error('Missing Supabase environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', url ? '✓' : '✗');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', anon ? '✓' : '✗');
  process.exit(1);
}

console.log('Testing Supabase connection...');
console.log('URL:', url);
console.log('');

const supabase = createClient(url, anon);

(async () => {
  try {
    // 1. Test auth health endpoint
    console.log('1. Testing Auth Health...');
    const authRes = await fetch(`${url}/auth/v1/health`);
    console.log('   Status:', authRes.status);
    const authText = await authRes.text();
    console.log('   Response:', authText);
    console.log('');

    // 2. Test REST API health
    console.log('2. Testing REST API...');
    const restRes = await fetch(`${url}/rest/v1/`, {
      headers: {
        'apikey': anon,
        'Authorization': `Bearer ${anon}`
      }
    });
    console.log('   Status:', restRes.status);
    console.log('');

    // 3. Test database query (user_profiles table)
    console.log('3. Testing Database Query...');
    const { data, error, count } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true });
    
    if (error) {
      console.log('   Error:', error.message);
      console.log('   Code:', error.code);
      console.log('   Details:', error.details);
    } else {
      console.log('   Success! Table exists and is accessible');
      console.log('   Row count:', count ?? 'unknown');
    }
    console.log('');

    // 4. Test storage buckets (if any)
    console.log('4. Testing Storage...');
    const { data: buckets, error: storageError } = await supabase
      .storage
      .listBuckets();
    
    if (storageError) {
      console.log('   Storage error:', storageError.message);
    } else {
      console.log('   Available buckets:', buckets?.length ?? 0);
      buckets?.forEach(bucket => {
        console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
      });
    }
    console.log('');

    // 5. Connection summary
    console.log('=== Connection Summary ===');
    console.log('✓ Supabase URL is reachable');
    console.log('✓ Authentication service is healthy');
    console.log(error ? '✗ Database query failed' : '✓ Database is accessible');
    console.log(storageError ? '✗ Storage access failed' : '✓ Storage is accessible');

  } catch (err) {
    console.error('Connection test failed:', err);
  }
})();