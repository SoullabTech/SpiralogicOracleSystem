#!/usr/bin/env node

// Simple test to validate architectural guardrails are working
// Run with: node test-guardrails.js

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Architectural Guardrails...\n');

// Test 1: Check dependency-cruiser config exists and has rules
console.log('1. Checking dependency-cruiser configuration...');
try {
  const config = require('./.dependency-cruiser.cjs');
  const ruleNames = config.forbidden.map(rule => rule.name);
  
  const expectedRules = [
    'no-cycles',
    'fe-to-be', 
    'be-to-fe',
    'no-deep-relatives',
    'services-to-agents',
    'agents-to-services',
    'routes-to-agents'
  ];
  
  const missingRules = expectedRules.filter(rule => !ruleNames.includes(rule));
  
  if (missingRules.length === 0) {
    console.log('   ✅ All expected rules present');
    console.log(`   📋 Found ${config.forbidden.length} total rules`);
  } else {
    console.log(`   ❌ Missing rules: ${missingRules.join(', ')}`);
  }
} catch (error) {
  console.log('   ❌ Failed to load dependency-cruiser config:', error.message);
}

// Test 2: Check ESLint import config exists
console.log('\n2. Checking ESLint import configuration...');
try {
  const importConfig = require('./.eslintrc.imports.cjs');
  
  if (importConfig.rules && importConfig.rules['no-restricted-imports']) {
    console.log('   ✅ Import restriction rules configured');
  } else {
    console.log('   ❌ Missing import restriction rules');
  }
  
  if (importConfig.rules && importConfig.rules['import/order']) {
    console.log('   ✅ Import order rules configured');
  } else {
    console.log('   ❌ Missing import order rules');
  }
} catch (error) {
  console.log('   ❌ Failed to load ESLint import config:', error.message);
}

// Test 3: Check package.json doctor scripts
console.log('\n3. Checking package.json doctor scripts...');
try {
  const pkg = require('./package.json');
  
  const expectedScripts = [
    'doctor:deps',
    'doctor:arch', 
    'doctor:imports',
    'doctor',
    'doctor:typecheck'
  ];
  
  const missingScripts = expectedScripts.filter(script => !pkg.scripts[script]);
  
  if (missingScripts.length === 0) {
    console.log('   ✅ All doctor scripts present');
  } else {
    console.log(`   ❌ Missing scripts: ${missingScripts.join(', ')}`);
  }
  
  // Check lint-staged config
  if (pkg['lint-staged']) {
    console.log('   ✅ Pre-commit hooks configured');
  } else {
    console.log('   ❌ Missing pre-commit hook configuration');
  }
} catch (error) {
  console.log('   ❌ Failed to load package.json:', error.message);
}

// Test 4: Check CI workflow has architectural checks
console.log('\n4. Checking CI workflow...');
try {
  const ciWorkflow = fs.readFileSync('./.github/workflows/ci.yml', 'utf8');
  
  if (ciWorkflow.includes('doctor:deps') && ciWorkflow.includes('doctor:arch')) {
    console.log('   ✅ CI includes architectural checks');
  } else {
    console.log('   ❌ CI missing architectural checks');
  }
} catch (error) {
  console.log('   ❌ Failed to check CI workflow:', error.message);
}

// Test 5: Scan for potential violations (sample check)
console.log('\n5. Scanning for potential violations...');

function scanForDeepImports(dir, violations = []) {
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        scanForDeepImports(filePath, violations);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const lines = content.split('\n');
          
          lines.forEach((line, index) => {
            if (line.includes('import') && line.match(/\.\.\//g)?.length >= 3) {
              violations.push({
                file: filePath,
                line: index + 1,
                content: line.trim()
              });
            }
          });
        } catch (readError) {
          // Skip files we can't read
        }
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
  
  return violations;
}

// Check only main directories
const violations = [];
['app', 'components', 'lib'].forEach(dir => {
  if (fs.existsSync(dir)) {
    scanForDeepImports(dir, violations);
  }
});

if (violations.length === 0) {
  console.log('   ✅ No deep relative imports found in main directories');
} else {
  console.log(`   ⚠️  Found ${violations.length} potential deep import violations:`);
  violations.slice(0, 5).forEach(v => {
    console.log(`      ${path.relative('.', v.file)}:${v.line}`);
  });
  if (violations.length > 5) {
    console.log(`      ... and ${violations.length - 5} more`);
  }
}

console.log('\n🎯 Architectural Guardrails Test Summary');
console.log('═══════════════════════════════════════');
console.log('Configuration files created and rules configured.');
console.log('Run `npm run doctor` to execute all checks.');
console.log('All checks will run automatically on commit and in CI.');
console.log('\n✨ Ready to prevent architectural regressions!');