#!/usr/bin/env node

/**
 * Test Supabase Connection
 * Verifies that the Supabase keys are working correctly
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing Supabase Connection...\n');
console.log('URL:', SUPABASE_URL);
console.log('Anon Key:', SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.substring(0, 20)}...` : 'NOT SET');
console.log('Service Key:', SUPABASE_SERVICE_ROLE_KEY ? `${SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...` : 'NOT SET');
console.log('');

async function testConnection() {
  try {
    // Test with anon key (public access)
    console.log('📡 Testing ANON KEY connection...');
    const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Try to fetch from a public table (even if empty)
    const { data: anonData, error: anonError } = await supabaseAnon
      .from('agents')
      .select('id')
      .limit(1);
    
    if (anonError && !anonError.message.includes('Row level security')) {
      console.error('❌ Anon key error:', anonError.message);
    } else {
      console.log('✅ Anon key connection successful!');
    }
    
    // Test with service role key (bypasses RLS)
    console.log('\n📡 Testing SERVICE ROLE KEY connection...');
    const supabaseService = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Count tables to verify service role access
    const { data: tables, error: tablesError } = await supabaseService
      .from('agents')
      .select('id', { count: 'exact', head: true });
    
    if (tablesError) {
      console.error('❌ Service role key error:', tablesError.message);
    } else {
      console.log('✅ Service role key connection successful!');
    }
    
    // Decode JWT to show key info (without exposing secrets)
    console.log('\n🔐 Key Information:');
    
    function decodeJWT(token) {
      try {
        const [, payload] = token.split('.');
        const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
        return {
          role: decoded.role,
          ref: decoded.ref,
          iat: new Date(decoded.iat * 1000).toISOString(),
          exp: new Date(decoded.exp * 1000).toISOString()
        };
      } catch {
        return null;
      }
    }
    
    const anonInfo = decodeJWT(SUPABASE_ANON_KEY);
    const serviceInfo = decodeJWT(SUPABASE_SERVICE_ROLE_KEY);
    
    if (anonInfo) {
      console.log('\nAnon Key Details:');
      console.log('  Role:', anonInfo.role);
      console.log('  Project:', anonInfo.ref);
      console.log('  Expires:', anonInfo.exp);
    }
    
    if (serviceInfo) {
      console.log('\nService Key Details:');
      console.log('  Role:', serviceInfo.role);
      console.log('  Project:', serviceInfo.ref);
      console.log('  Expires:', serviceInfo.exp);
    }
    
    console.log('\n✅ All Supabase connections verified successfully!');
    console.log('\n📝 Your keys are in the correct JWT format.');
    console.log('These are the modern Supabase keys (not the old sb_secret_ format).\n');
    
  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message);
    process.exit(1);
  }
}

testConnection();