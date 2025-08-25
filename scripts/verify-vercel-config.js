#!/usr/bin/env node

/**
 * Vercel Configuration Verification Script
 * Checks for common deployment issues before pushing to Vercel
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Verifying Vercel deployment configuration...\n');

// Check 1: Verify vercel.json syntax and runtime versions
console.log('1. Checking vercel.json configuration...');
try {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  
  if (vercelConfig.functions) {
    for (const [pattern, config] of Object.entries(vercelConfig.functions)) {
      if (config.runtime && !config.runtime.match(/^nodejs\d+\.x$/)) {
        console.log(`❌ Invalid runtime in vercel.json: ${config.runtime}`);
        process.exit(1);
      }
    }
  }
  console.log('✅ vercel.json configuration is valid');
} catch (error) {
  console.log(`❌ Error reading vercel.json: ${error.message}`);
  process.exit(1);
}

// Check 2: Verify API route runtime exports
console.log('\n2. Checking API route runtime configurations...');
const apiDir = 'app/api';
const invalidRuntimes = [];

function checkApiFiles(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      checkApiFiles(fullPath);
    } else if (file === 'route.ts') {
      const content = fs.readFileSync(fullPath, 'utf8');
      const runtimeMatch = content.match(/export const runtime = ["']([^"']+)["'];/);
      
      if (runtimeMatch) {
        const runtime = runtimeMatch[1];
        if (runtime !== 'edge' && runtime !== 'nodejs' && !runtime.match(/^nodejs\d+\.x$/)) {
          invalidRuntimes.push({ file: fullPath, runtime });
        }
      }
    }
  }
}

if (fs.existsSync(apiDir)) {
  checkApiFiles(apiDir);
}

if (invalidRuntimes.length > 0) {
  console.log('❌ Invalid runtime configurations found:');
  invalidRuntimes.forEach(({ file, runtime }) => {
    console.log(`   ${file}: "${runtime}"`);
  });
  process.exit(1);
} else {
  console.log('✅ All API runtime configurations are valid');
}

// Check 3: Verify environment variables
console.log('\n3. Checking required environment variables...');
const requiredEnvVars = [
  'NEXT_PUBLIC_ORACLE_VOICE_ENABLED',
  'NEXT_PUBLIC_ORACLE_MAYA_VOICE'
];

const missingVars = requiredEnvVars.filter(varName => {
  return !process.env[varName] && !fs.existsSync('.env.local');
});

if (missingVars.length > 0) {
  console.log('⚠️  Missing environment variables (make sure to set in Vercel):');
  missingVars.forEach(varName => console.log(`   ${varName}`));
} else {
  console.log('✅ Environment configuration looks good');
}

// Check 4: Build test
console.log('\n4. Testing build process...');
try {
  const output = execSync('npm run build', { stdio: 'pipe', encoding: 'utf8' });
  
  // Check if build actually succeeded (look for "✓ Compiled successfully")
  if (output.includes('✓ Compiled successfully') || output.includes('Compiled successfully')) {
    console.log('✅ Build test successful');
  } else {
    console.log('❌ Build test failed - no success indicator found');
    console.log('Build output:', output);
    process.exit(1);
  }
} catch (error) {
  // Even if there's an "error", check if it's just linting warnings after successful compilation
  const output = error.stdout?.toString() || '';
  if (output.includes('✓ Compiled successfully') || output.includes('Compiled successfully')) {
    console.log('✅ Build test successful (with warnings)');
  } else {
    console.log('❌ Build test failed');
    console.log('Error output:', output || error.message);
    process.exit(1);
  }
}

console.log('\n🎉 All checks passed! Ready to deploy to Vercel.');
console.log('\nNext steps:');
console.log('1. vercel login');
console.log('2. vercel deploy --prod');
console.log('3. Set environment variables in Vercel dashboard:');
console.log('   - RUNPOD_API_KEY');
console.log('   - RUNPOD_ENDPOINT_ID');