#!/usr/bin/env node

/**
 * 🧪 SOULLAB E2E TEST SUITE
 * Complete diagnostic for Spiralogic Oracle System
 * Tests: Environment → API → Database → UI → Deployment
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

// Test results collector
const testResults = {
  passed: [],
  failed: [],
  warnings: []
};

// Load environment variables
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
  }
}

// Helper function for HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'https:' ? https : http;
    const req = protocol.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, body: jsonBody });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test 01: Environment & Supabase Connection Check
async function test01_EnvironmentCheck() {
  console.log(`\n${colors.blue}🔧 TEST 01: Environment & Supabase Connection${colors.reset}`);
  
  loadEnv();
  
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  let allPresent = true;
  for (const key of required) {
    if (process.env[key]) {
      console.log(`  ✅ ${key}: ${process.env[key].substring(0, 20)}...`);
    } else {
      console.log(`  ❌ ${key}: MISSING`);
      allPresent = false;
    }
  }
  
  // Check if in mock mode
  const mockMode = process.env.NEXT_PUBLIC_MOCK_SUPABASE === 'true';
  if (mockMode) {
    console.log(`  ${colors.yellow}⚠️  MOCK MODE ENABLED - No real database${colors.reset}`);
    testResults.warnings.push('Supabase in mock mode');
  }
  
  if (allPresent && !mockMode) {
    testResults.passed.push('Environment configured');
    
    // Test Supabase connection
    try {
      const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
      const response = await makeRequest({
        hostname: supabaseUrl.hostname,
        port: 443,
        path: '/rest/v1/',
        method: 'GET',
        protocol: 'https:',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        }
      });
      
      if (response.status === 200) {
        console.log(`  ✅ Supabase connection successful`);
        testResults.passed.push('Supabase connected');
      } else {
        console.log(`  ❌ Supabase returned ${response.status}`);
        testResults.failed.push(`Supabase connection (${response.status})`);
      }
    } catch (error) {
      console.log(`  ❌ Supabase connection failed: ${error.message}`);
      testResults.failed.push('Supabase connection');
    }
  } else {
    testResults.failed.push('Environment configuration');
  }
}

// Test 02: API Contract Test - Soulprint POST
async function test02_SoulprintAPI() {
  console.log(`\n${colors.blue}🔗 TEST 02: Soulprint API Contract${colors.reset}`);
  
  const testData = {
    userId: "test-user-" + Date.now(),
    scores: {
      earth: 0.8,
      water: 0.6,
      fire: 0.9,
      air: 0.7,
      aether: 0.75
    },
    milestone: "first_bloom",
    coherence: 0.75,
    elementalBalance: {
      earth: 0.8,
      water: 0.6,
      fire: 0.9,
      air: 0.7
    }
  };
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/soulprint',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, testData);
    
    if (response.status === 200) {
      console.log(`  ✅ Soulprint saved successfully`);
      console.log(`     ID: ${response.body.soulprint?.id || 'N/A'}`);
      console.log(`     Message: ${response.body.message}`);
      testResults.passed.push('Soulprint API');
    } else {
      console.log(`  ❌ Status ${response.status}: ${response.body.error || 'Unknown error'}`);
      testResults.failed.push(`Soulprint API (${response.status})`);
    }
  } catch (error) {
    console.log(`  ❌ Request failed: ${error.message}`);
    testResults.failed.push('Soulprint API');
  }
}

// Test 03: Journal Entry Test
async function test03_JournalAPI() {
  console.log(`\n${colors.blue}📓 TEST 03: Journal API${colors.reset}`);
  
  const testData = {
    userId: "test-user-" + Date.now(),
    prompt: "What emerged today?",
    response: "I felt deeply grounded and connected to earth energy.",
    milestone: "first_bloom",
    soulprintId: "test-soulprint-" + Date.now()
  };
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/journal',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, testData);
    
    if (response.status === 200) {
      console.log(`  ✅ Journal entry saved`);
      console.log(`     Message: ${response.body.message}`);
      testResults.passed.push('Journal API');
    } else {
      console.log(`  ❌ Status ${response.status}: ${response.body.error || 'Unknown error'}`);
      testResults.failed.push(`Journal API (${response.status})`);
    }
  } catch (error) {
    console.log(`  ❌ Request failed: ${error.message}`);
    testResults.failed.push('Journal API');
  }
}

// Test 04: Sacred Timeline Retrieval
async function test04_TimelineAPI() {
  console.log(`\n${colors.blue}📜 TEST 04: Sacred Timeline API${colors.reset}`);
  
  const userId = "test-user-" + Date.now();
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/api/sacred-timeline?userId=${userId}`,
      method: 'GET'
    });
    
    if (response.status === 200) {
      const sessions = response.body.sessions || [];
      console.log(`  ✅ Timeline retrieved`);
      console.log(`     Sessions found: ${sessions.length}`);
      if (sessions.length > 0) {
        console.log(`     Latest: ${sessions[0].created_at}`);
      }
      testResults.passed.push('Timeline API');
    } else {
      console.log(`  ❌ Status ${response.status}: ${response.body.error || 'Unknown error'}`);
      testResults.failed.push(`Timeline API (${response.status})`);
    }
  } catch (error) {
    console.log(`  ❌ Request failed: ${error.message}`);
    testResults.failed.push('Timeline API');
  }
}

// Test 05: Health Check
async function test05_HealthCheck() {
  console.log(`\n${colors.blue}🏥 TEST 05: Health Check${colors.reset}`);
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/health',
      method: 'GET'
    });
    
    if (response.status === 200) {
      console.log(`  ✅ Health check passed`);
      console.log(`     Status: ${response.body.status}`);
      console.log(`     Database: ${response.body.database || 'N/A'}`);
      testResults.passed.push('Health check');
    } else {
      console.log(`  ❌ Health check failed (${response.status})`);
      testResults.failed.push('Health check');
    }
  } catch (error) {
    console.log(`  ❌ Request failed: ${error.message}`);
    testResults.failed.push('Health check');
  }
}

// Test 06: Production Deployment Check
async function test06_VercelDeployment() {
  console.log(`\n${colors.blue}🌐 TEST 06: Vercel Deployment${colors.reset}`);
  
  const urls = [
    'https://spiralogic-oracle-system.vercel.app',
    'https://spiralogic-oracle-system-git-main-spiralogic-oracle-system.vercel.app'
  ];
  
  for (const url of urls) {
    try {
      const urlObj = new URL(url);
      const response = await makeRequest({
        hostname: urlObj.hostname,
        port: 443,
        path: '/',
        method: 'GET',
        protocol: 'https:',
        headers: {
          'User-Agent': 'Soullab-Test-Suite/1.0'
        }
      });
      
      if (response.status === 200) {
        console.log(`  ✅ ${url} is live`);
        testResults.passed.push('Vercel deployment');
        break;
      } else {
        console.log(`  ⚠️  ${url} returned ${response.status}`);
      }
    } catch (error) {
      console.log(`  ⚠️  ${url} - ${error.message}`);
    }
  }
}

// Main test runner
async function runAllTests() {
  console.log(`${colors.magenta}╔════════════════════════════════════════╗`);
  console.log(`║     SOULLAB E2E TEST SUITE 🧪          ║`);
  console.log(`╚════════════════════════════════════════╝${colors.reset}`);
  
  // Check if dev server is running
  try {
    await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET'
    });
  } catch (error) {
    console.log(`${colors.red}❌ Dev server not running on port 3000${colors.reset}`);
    console.log(`   Run: npm run dev`);
    process.exit(1);
  }
  
  // Run all tests
  await test01_EnvironmentCheck();
  await test02_SoulprintAPI();
  await test03_JournalAPI();
  await test04_TimelineAPI();
  await test05_HealthCheck();
  await test06_VercelDeployment();
  
  // Summary
  console.log(`\n${colors.magenta}═══════════════════════════════════════`);
  console.log(`                SUMMARY                `);
  console.log(`═══════════════════════════════════════${colors.reset}`);
  
  console.log(`${colors.green}✅ PASSED: ${testResults.passed.length}${colors.reset}`);
  testResults.passed.forEach(test => console.log(`   • ${test}`));
  
  if (testResults.warnings.length > 0) {
    console.log(`\n${colors.yellow}⚠️  WARNINGS: ${testResults.warnings.length}${colors.reset}`);
    testResults.warnings.forEach(warning => console.log(`   • ${warning}`));
  }
  
  if (testResults.failed.length > 0) {
    console.log(`\n${colors.red}❌ FAILED: ${testResults.failed.length}${colors.reset}`);
    testResults.failed.forEach(test => console.log(`   • ${test}`));
  }
  
  // Exit code
  process.exit(testResults.failed.length > 0 ? 1 : 0);
}

// Run the tests
runAllTests().catch(console.error);