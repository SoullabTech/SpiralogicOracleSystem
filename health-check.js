#!/usr/bin/env node

/**
 * Comprehensive Health Check for Spiralogic Oracle System
 * Validates architecture, dependencies, and build readiness
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 Spiralogic Oracle System Health Check');
console.log('==========================================\n');

const results = {
  architecture: { status: 'pending', details: [] },
  dependencies: { status: 'pending', details: [] },
  build: { status: 'pending', details: [] },
  docker: { status: 'pending', details: [] }
};

// Helper function to run commands
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { 
      stdio: 'pipe',
      cwd: process.cwd(),
      ...options 
    });
    
    let stdout = '';
    let stderr = '';
    
    proc.stdout?.on('data', (data) => {
      stdout += data.toString();
    });
    
    proc.stderr?.on('data', (data) => {
      stderr += data.toString();
    });
    
    proc.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });
    
    proc.on('error', (error) => {
      reject(error);
    });
  });
}

// 1. Architecture Validation
async function checkArchitecture() {
  console.log('1️⃣ Checking Architecture...');
  
  try {
    // Check hexagonal structure
    const hexDirs = [
      'backend/src/domain',
      'backend/src/application',
      'backend/src/infrastructure',
      'backend/src/interfaces'
    ];
    
    let structureValid = true;
    hexDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        console.log(`   ✅ ${dir}`);
      } else {
        console.log(`   ❌ ${dir} - Missing`);
        structureValid = false;
      }
    });
    
    // Check dependency-cruiser rules
    const depCruiserExists = fs.existsSync('.dependency-cruiser.cjs');
    console.log(`   ${depCruiserExists ? '✅' : '❌'} Dependency cruiser config`);
    
    // Check ESLint import rules
    const eslintImportExists = fs.existsSync('.eslintrc.imports.cjs');
    console.log(`   ${eslintImportExists ? '✅' : '❌'} ESLint import rules`);
    
    results.architecture.status = structureValid && depCruiserExists && eslintImportExists ? 'pass' : 'fail';
    results.architecture.details = [
      `Hexagonal structure: ${structureValid ? 'Complete' : 'Incomplete'}`,
      `Architectural guards: ${depCruiserExists && eslintImportExists ? 'Configured' : 'Missing'}`
    ];
    
  } catch (error) {
    results.architecture.status = 'error';
    results.architecture.details = [`Error: ${error.message}`];
  }
  
  console.log('');
}

// 2. Dependencies Check
async function checkDependencies() {
  console.log('2️⃣ Checking Dependencies...');
  
  try {
    // Run dependency cruiser
    console.log('   Running dependency analysis...');
    const depResult = await runCommand('npx', ['depcruise', '--config', '.dependency-cruiser.cjs', '--output-type', 'text', '.']);
    
    if (depResult.code === 0) {
      console.log('   ✅ No dependency violations');
      results.dependencies.status = 'pass';
      results.dependencies.details = ['All dependency rules satisfied'];
    } else {
      console.log('   ⚠️ Dependency violations found');
      results.dependencies.status = 'warn';
      results.dependencies.details = [depResult.stderr.substring(0, 500) + '...'];
    }
    
  } catch (error) {
    console.log('   ❌ Dependency check failed');
    results.dependencies.status = 'error';
    results.dependencies.details = [`Error: ${error.message}`];
  }
  
  console.log('');
}

// 3. Build Check
async function checkBuild() {
  console.log('3️⃣ Checking Build Process...');
  
  try {
    // TypeScript check
    console.log('   Running TypeScript compilation check...');
    const tscResult = await runCommand('npx', ['tsc', '--noEmit']);
    
    if (tscResult.code === 0) {
      console.log('   ✅ TypeScript compilation successful');
    } else {
      console.log('   ❌ TypeScript errors found');
      console.log(`   ${tscResult.stderr.split('\n').slice(0, 5).join('\n   ')}`);
    }
    
    // ESLint check
    console.log('   Running ESLint checks...');
    const lintResult = await runCommand('npx', ['eslint', '.', '--ext', '.ts,.tsx', '--no-eslintrc', '--config', '.eslintrc.imports.cjs']);
    
    if (lintResult.code === 0) {
      console.log('   ✅ ESLint import rules satisfied');
    } else {
      console.log('   ⚠️ ESLint violations found');
    }
    
    results.build.status = (tscResult.code === 0 && lintResult.code === 0) ? 'pass' : 'fail';
    results.build.details = [
      `TypeScript: ${tscResult.code === 0 ? 'Pass' : 'Fail'}`,
      `ESLint: ${lintResult.code === 0 ? 'Pass' : 'Fail'}`
    ];
    
  } catch (error) {
    console.log('   ❌ Build check failed');
    results.build.status = 'error';
    results.build.details = [`Error: ${error.message}`];
  }
  
  console.log('');
}

// 4. Docker Check
async function checkDocker() {
  console.log('4️⃣ Checking Docker Configuration...');
  
  try {
    // Check Docker files exist
    const dockerFiles = ['Dockerfile', 'docker-compose.yml'];
    let dockerConfigValid = true;
    
    dockerFiles.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`   ✅ ${file}`);
      } else {
        console.log(`   ❌ ${file} - Missing`);
        dockerConfigValid = false;
      }
    });
    
    // Check Docker daemon
    try {
      const dockerResult = await runCommand('docker', ['--version']);
      if (dockerResult.code === 0) {
        console.log('   ✅ Docker available');
      } else {
        console.log('   ❌ Docker not available');
        dockerConfigValid = false;
      }
    } catch {
      console.log('   ❌ Docker not installed');
      dockerConfigValid = false;
    }
    
    results.docker.status = dockerConfigValid ? 'pass' : 'fail';
    results.docker.details = [
      `Configuration files: ${dockerFiles.every(f => fs.existsSync(f)) ? 'Present' : 'Missing'}`,
      `Docker runtime: ${dockerConfigValid ? 'Available' : 'Unavailable'}`
    ];
    
  } catch (error) {
    results.docker.status = 'error';
    results.docker.details = [`Error: ${error.message}`];
  }
  
  console.log('');
}

// Generate Summary Report
function generateSummary() {
  console.log('📊 Health Check Summary');
  console.log('======================');
  
  const categories = ['architecture', 'dependencies', 'build', 'docker'];
  let overall = 'pass';
  
  categories.forEach(category => {
    const result = results[category];
    const icon = result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️' : '❌';
    console.log(`${icon} ${category.toUpperCase()}: ${result.status.toUpperCase()}`);
    
    result.details.forEach(detail => {
      console.log(`   ${detail}`);
    });
    
    if (result.status === 'fail' || result.status === 'error') {
      overall = 'fail';
    } else if (result.status === 'warn' && overall === 'pass') {
      overall = 'warn';
    }
    
    console.log('');
  });
  
  console.log('🏁 Overall Status:', overall.toUpperCase());
  
  if (overall === 'pass') {
    console.log('\n🚀 System is ready for deployment!');
    console.log('\nNext steps:');
    console.log('1. npm run build           # Production build');
    console.log('2. docker compose up -d    # Start services');
    console.log('3. docker compose logs -f  # Monitor logs');
  } else {
    console.log('\n🔧 Issues found - please address before deployment');
  }
  
  return overall === 'pass' ? 0 : 1;
}

// Main execution
async function main() {
  try {
    await checkArchitecture();
    await checkDependencies();
    await checkBuild();
    await checkDocker();
    
    const exitCode = generateSummary();
    process.exit(exitCode);
    
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    process.exit(1);
  }
}

main();