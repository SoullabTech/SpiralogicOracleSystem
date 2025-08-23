#!/usr/bin/env node

// Check if package-lock.json is in sync with package.json
import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';

console.log('🔒 Checking lockfile discipline...\n');

// Check if package-lock.json exists
if (!existsSync('package-lock.json')) {
  console.log('❌ package-lock.json missing');
  console.log('   Run: npm install');
  process.exit(1);
}

try {
  // Check if lockfile is outdated
  const result = execSync('npm ls --depth=0 2>/dev/null', { encoding: 'utf8' });
  
  if (result.includes('WARN') || result.includes('ERR')) {
    console.log('⚠️  Lockfile may be out of sync');
    console.log('   Run: npm install && git add package-lock.json');
  } else {
    console.log('✅ Lockfile in sync');
    console.log('   Docker can use: npm ci');
  }
} catch (error) {
  console.log('⚠️  Could not verify lockfile sync');
  console.log('   Run: npm install to be safe');
}

// Check Docker usage
const dockerfileContent = existsSync('Dockerfile') ? readFileSync('Dockerfile', 'utf8') : '';
const dockerComposeContent = existsSync('docker-compose.yml') ? readFileSync('docker-compose.yml', 'utf8') : '';

if (dockerfileContent.includes('npm ci') || dockerComposeContent.includes('npm ci')) {
  console.log('✅ Docker uses npm ci (good)');
} else if (dockerfileContent.includes('npm install')) {
  console.log('⚠️  Docker uses npm install (consider npm ci for reproducible builds)');
}

console.log('\n📋 Best Practice:');
console.log('   Local: npm install (when adding packages)');
console.log('   Docker/CI: npm ci (reproducible builds)');
console.log('   Always commit package-lock.json changes');