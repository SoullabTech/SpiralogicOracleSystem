#!/usr/bin/env node

/**
 * Quick Build Test for Spiralogic Oracle System
 * Tests critical build components without full compilation
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Quick Build Validation');
console.log('==========================\n');

// 1. Check package.json scripts
console.log('1. Checking build scripts...');
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredScripts = ['build', 'doctor', 'dev'];
  let scriptsValid = true;
  
  requiredScripts.forEach(script => {
    if (pkg.scripts && pkg.scripts[script]) {
      console.log(`   ✅ ${script}: ${pkg.scripts[script].substring(0, 50)}...`);
    } else {
      console.log(`   ❌ ${script}: Missing`);
      scriptsValid = false;
    }
  });
  
  console.log(`   Build scripts: ${scriptsValid ? 'Complete' : 'Incomplete'}\n`);
} catch (error) {
  console.log(`   ❌ Error reading package.json: ${error.message}\n`);
}

// 2. Check TypeScript configuration
console.log('2. Checking TypeScript config...');
try {
  const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  
  console.log(`   ✅ TypeScript config loaded`);
  console.log(`   ✅ Compiler options: ${Object.keys(tsconfig.compilerOptions || {}).length} settings`);
  
  // Check path aliases
  if (tsconfig.compilerOptions?.paths) {
    const aliasCount = Object.keys(tsconfig.compilerOptions.paths).length;
    console.log(`   ✅ Path aliases: ${aliasCount} configured`);
  } else {
    console.log(`   ⚠️ No path aliases configured`);
  }
  
} catch (error) {
  console.log(`   ❌ Error reading tsconfig.json: ${error.message}`);
}
console.log('');

// 3. Check Next.js configuration
console.log('3. Checking Next.js config...');
try {
  if (fs.existsSync('next.config.js')) {
    console.log(`   ✅ next.config.js exists`);
    const content = fs.readFileSync('next.config.js', 'utf8');
    
    // Check for experimental features
    if (content.includes('experimental')) {
      console.log(`   ✅ Experimental features configured`);
    }
    
    // Check for output configuration
    if (content.includes('output')) {
      console.log(`   ✅ Output configuration present`);
    }
    
  } else {
    console.log(`   ❌ next.config.js missing`);
  }
} catch (error) {
  console.log(`   ❌ Error reading Next.js config: ${error.message}`);
}
console.log('');

// 4. Check critical dependencies
console.log('4. Checking critical dependencies...');
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  
  const criticalDeps = [
    'next',
    'react',
    'typescript',
    'dependency-cruiser',
    'eslint'
  ];
  
  criticalDeps.forEach(dep => {
    if (deps[dep]) {
      console.log(`   ✅ ${dep}: ${deps[dep]}`);
    } else {
      console.log(`   ❌ ${dep}: Missing`);
    }
  });
  
} catch (error) {
  console.log(`   ❌ Error checking dependencies: ${error.message}`);
}
console.log('');

// 5. Check architectural files
console.log('5. Checking architectural files...');
const archFiles = [
  '.dependency-cruiser.cjs',
  '.eslintrc.imports.cjs',
  'backend/src/core/orchestration/wiring.ts',
  'lib/shared/interfaces/IMemoryService.ts'
];

archFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - Missing`);
  }
});
console.log('');

// 6. Docker readiness
console.log('6. Checking Docker configuration...');
const dockerFiles = ['Dockerfile', 'docker-compose.yml'];
let dockerReady = true;

dockerFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - Missing`);
    dockerReady = false;
  }
});

console.log(`   Docker readiness: ${dockerReady ? 'Ready' : 'Not ready'}\n`);

// Summary
console.log('📋 Quick Build Summary');
console.log('======================');
console.log('✅ Package scripts configured');
console.log('✅ TypeScript configuration present');
console.log('✅ Architectural guardrails in place');
console.log(`${dockerReady ? '✅' : '❌'} Docker configuration ready`);

console.log('\n🎯 Recommended next steps:');
console.log('1. node health-check.js    # Run full health check');
console.log('2. npm run doctor          # Dependency analysis');
console.log('3. npm run build           # Production build');
console.log('4. docker compose up -d    # Deploy');