#!/usr/bin/env node

// Get Vercel deployment URLs automatically
import { execSync } from 'child_process';

try {
  console.log('🔍 Finding Vercel deployments...\n');
  
  // Get deployments as JSON
  const result = execSync('vercel ls --format json spiralogic-oracle-system', { 
    encoding: 'utf8',
    timeout: 10000 
  });
  
  const deployments = JSON.parse(result);
  
  if (!deployments || deployments.length === 0) {
    console.log('❌ No deployments found. Make sure you\'re logged in:');
    console.log('   vercel login');
    process.exit(1);
  }
  
  // Find production and latest preview
  const production = deployments.find(d => d.target === 'production');
  const preview = deployments.find(d => d.target === 'preview' && d.source === 'git');
  
  console.log('📋 Available URLs:');
  console.log('');
  
  if (production) {
    console.log('🚀 Production:');
    console.log(`   https://${production.url}`);
    console.log('');
  }
  
  if (preview) {
    console.log('🔄 Latest Preview:');
    console.log(`   https://${preview.url}`);
    console.log('');
  }
  
  // Generate the command
  const localUrl = 'http://localhost:3000/api/health';
  const previewUrl = preview ? `https://${preview.url}/api/health` : 'https://spiralogic-oracle-system-git-main-<hash>.vercel.app/api/health';
  const prodUrl = production ? `https://${production.url}/api/health` : 'https://spiralogic-oracle-system.vercel.app/api/health';
  
  console.log('💻 Run this command:');
  console.log('');
  console.log(`LOCAL_API="${localUrl}" \\`);
  console.log(`PREVIEW_API="${previewUrl}" \\`);
  console.log(`PROD_API="${prodUrl}" \\`);
  console.log(`node scripts/test-all-health.mjs`);
  console.log('');
  
} catch (error) {
  console.error('❌ Error getting deployments:', error.message);
  console.log('\nTry manually:');
  console.log('1. vercel login');
  console.log('2. vercel ls spiralogic-oracle-system');
  console.log('3. Copy URLs from output');
}