const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.error('Missing Supabase environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', url ? '✓' : '✗');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', anon ? '✓' : '✗');
  process.exit(1);
}

console.log('🔍 Testing Supabase connection...\n');
console.log('URL:', url);
console.log('');

const supabase = createClient(url, anon);

(async () => {
  // 1. Auth health check
  console.log('1. Auth Health Check:');
  try {
    const res = await fetch(`${url}/auth/v1/health`);
    console.log(`   Status: ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.log(`   Response: ${text}\n`);
  } catch (error) {
    console.log(`   Error: ${error}\n`);
  }

  // 2. Database ping
  console.log('2. Database Query (user_profiles):');
  try {
    const { data, error } = await supabase.from('user_profiles').select('id').limit(1);
    if (error) {
      console.log(`   Error: ${error.message}`);
      console.log(`   Code: ${error.code}`);
      if (error.details) console.log(`   Details: ${JSON.stringify(error.details)}`);
    } else {
      console.log(`   Success! Found ${data?.length || 0} records`);
    }
  } catch (error) {
    console.log(`   Error: ${error}`);
  }

  console.log('\n✅ Connection test complete');
})();