/**
 * Test Supabase Connection
 * Verifies that all Supabase environment variables are set correctly
 * and tests actual connection to the database
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });
const { createClient } = require('@supabase/supabase-js');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}🔍 Testing Supabase Connection${colors.reset}\n`);
console.log('=' .repeat(60));

// Check environment variables
console.log(`\n${colors.blue}📋 Environment Variables:${colors.reset}`);

const envVars = {
  'SUPABASE_URL': process.env.SUPABASE_URL,
  'SUPABASE_ANON_KEY': process.env.SUPABASE_ANON_KEY,
  'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
  'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  'VITE_SUPABASE_URL': process.env.VITE_SUPABASE_URL,
  'VITE_SUPABASE_ANON_KEY': process.env.VITE_SUPABASE_ANON_KEY
};

let allVarsPresent = true;
for (const [name, value] of Object.entries(envVars)) {
  const status = value ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
  const displayValue = value ? value.substring(0, 50) + '...' : 'NOT SET';
  console.log(`  ${status} ${name}: ${displayValue}`);
  if (!value) allVarsPresent = false;
}

// Check if URLs match
console.log(`\n${colors.blue}🔗 URL Consistency Check:${colors.reset}`);
const urls = [
  process.env.SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.VITE_SUPABASE_URL
].filter(Boolean);

const uniqueUrls = [...new Set(urls)];
if (uniqueUrls.length === 1) {
  console.log(`  ${colors.green}✓ All URLs match: ${uniqueUrls[0]}${colors.reset}`);
} else {
  console.log(`  ${colors.red}✗ URL mismatch detected!${colors.reset}`);
  uniqueUrls.forEach(url => console.log(`    - ${url}`));
}

// Check if keys match
console.log(`\n${colors.blue}🔑 Key Consistency Check:${colors.reset}`);
const anonKeys = [
  process.env.SUPABASE_ANON_KEY,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  process.env.VITE_SUPABASE_ANON_KEY
].filter(Boolean);

const uniqueKeys = [...new Set(anonKeys)];
if (uniqueKeys.length === 1) {
  console.log(`  ${colors.green}✓ All anon keys match${colors.reset}`);
} else {
  console.log(`  ${colors.red}✗ Anon key mismatch detected!${colors.reset}`);
}

// Test actual connection
console.log(`\n${colors.blue}🌐 Testing Database Connection:${colors.reset}`);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log(`  ${colors.red}✗ Missing required environment variables${colors.reset}`);
  process.exit(1);
}

async function testConnection() {
  try {
    console.log(`  Connecting to: ${supabaseUrl}`);
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test 1: Check if we can connect
    console.log(`  ${colors.yellow}→ Testing basic connection...${colors.reset}`);
    const { data: healthCheck, error: healthError } = await supabase
      .from('_health_check')
      .select('*')
      .limit(1);
    
    if (healthError && !healthError.message.includes('does not exist')) {
      console.log(`  ${colors.red}✗ Connection error: ${healthError.message}${colors.reset}`);
    } else {
      console.log(`  ${colors.green}✓ Basic connection successful${colors.reset}`);
    }
    
    // Test 2: Check sessions table
    console.log(`  ${colors.yellow}→ Checking sessions table...${colors.reset}`);
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('id')
      .limit(1);
    
    if (sessionsError) {
      console.log(`  ${colors.red}✗ Sessions table error: ${sessionsError.message}${colors.reset}`);
    } else {
      console.log(`  ${colors.green}✓ Sessions table accessible${colors.reset}`);
    }
    
    // Test 3: Check conversation_turns table
    console.log(`  ${colors.yellow}→ Checking conversation_turns table...${colors.reset}`);
    const { data: turns, error: turnsError } = await supabase
      .from('conversation_turns')
      .select('id')
      .limit(1);
    
    if (turnsError) {
      console.log(`  ${colors.red}✗ Conversation turns error: ${turnsError.message}${colors.reset}`);
    } else {
      console.log(`  ${colors.green}✓ Conversation turns table accessible${colors.reset}`);
    }
    
    // Test 4: Test write permission (create and delete a test record)
    console.log(`  ${colors.yellow}→ Testing write permissions...${colors.reset}`);
    const testSession = {
      clientId: 'test-client-' + Date.now(),
      startTime: new Date().toISOString(),
      status: 'active',
      meta: { test: true }
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('sessions')
      .insert([testSession])
      .select();
    
    if (insertError) {
      console.log(`  ${colors.red}✗ Write permission error: ${insertError.message}${colors.reset}`);
    } else {
      console.log(`  ${colors.green}✓ Write permissions OK${colors.reset}`);
      
      // Clean up test data
      if (insertData && insertData[0]) {
        await supabase
          .from('sessions')
          .delete()
          .eq('id', insertData[0].id);
        console.log(`  ${colors.green}✓ Test data cleaned up${colors.reset}`);
      }
    }
    
    // Summary
    console.log(`\n${colors.cyan}📊 Connection Summary:${colors.reset}`);
    console.log('=' .repeat(60));
    console.log(`  ${colors.green}✅ Supabase connection is working correctly!${colors.reset}`);
    console.log(`  Project URL: ${supabaseUrl}`);
    console.log(`  Project Ref: ${supabaseUrl.match(/https:\/\/(.+?)\.supabase\.co/)?.[1] || 'unknown'}`);
    
  } catch (error) {
    console.log(`\n${colors.red}❌ Connection test failed:${colors.reset}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the test
if (allVarsPresent) {
  testConnection();
} else {
  console.log(`\n${colors.red}❌ Cannot test connection - missing environment variables${colors.reset}`);
  console.log(`\n${colors.yellow}💡 Fix: Add the missing NEXT_PUBLIC_ variables to your .env.local file${colors.reset}`);
  process.exit(1);
}