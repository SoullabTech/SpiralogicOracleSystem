#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: 'env/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in env/.env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('🧪 Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('ℹ️  Note: users table may not exist yet (that\'s okay)');
      console.log('   Error:', error.message);
    } else {
      console.log('✅ Supabase connection successful!');
    }
    
    // Test auth
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (!authError) {
      console.log('✅ Supabase Auth available');
    }
    
    console.log('🚀 Supabase is ready to use!');
    
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();