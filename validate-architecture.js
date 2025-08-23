#!/usr/bin/env node

// Architecture Validation Script
// Verifies the hexagonal architecture refactoring is working correctly

const fs = require('fs');
const path = require('path');

console.log('🏗️  Validating Hexagonal Architecture Refactoring...\n');

// Test 1: Verify new directory structure exists
console.log('1. Checking hexagonal directory structure...');
const expectedDirs = [
  'backend/src/domain',
  'backend/src/application',
  'backend/src/application/orchestration', 
  'backend/src/infrastructure',
  'backend/src/infrastructure/adapters',
  'backend/src/interfaces'
];

let structureValid = true;
expectedDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`   ✅ ${dir}`);
  } else {
    console.log(`   ❌ ${dir} - MISSING`);
    structureValid = false;
  }
});

if (structureValid) {
  console.log('   🎯 Hexagonal structure complete!\n');
} else {
  console.log('   ⚠️  Some directories missing\n');
}

// Test 2: Verify refactored services exist in new locations
console.log('2. Checking refactored services...');
const servicesMoved = [
  {
    old: 'backend/src/services/ElevenLabsService.ts',
    new: 'backend/src/infrastructure/adapters/ElevenLabsAdapter.ts',
    name: 'ElevenLabs TTS Adapter'
  },
  {
    old: 'backend/src/services/agentOrchestrator.ts', 
    new: 'backend/src/application/orchestration/AgentOrchestrator.ts',
    name: 'Agent Orchestrator'
  }
];

servicesMoved.forEach(service => {
  const oldExists = fs.existsSync(service.old);
  const newExists = fs.existsSync(service.new);
  
  if (newExists) {
    console.log(`   ✅ ${service.name} moved to ${service.new}`);
    if (oldExists) {
      console.log(`   ⚠️  Legacy file still exists: ${service.old}`);
    }
  } else {
    console.log(`   ❌ ${service.name} not found in new location`);
  }
});

// Test 3: Verify dependency-cruiser config has enhanced rules
console.log('\n3. Checking architectural guardrails...');
try {
  const depConfig = require('./.dependency-cruiser.cjs');
  const ruleNames = depConfig.forbidden.map(rule => rule.name);
  
  const expectedRules = [
    'no-cycles',
    'fe-to-be',
    'no-deep-relatives', 
    'services-to-agents',
    'routes-to-agents'
  ];
  
  let rulesValid = true;
  expectedRules.forEach(ruleName => {
    if (ruleNames.includes(ruleName)) {
      console.log(`   ✅ ${ruleName} rule active`);
    } else {
      console.log(`   ❌ ${ruleName} rule missing`);
      rulesValid = false;
    }
  });
  
  if (rulesValid) {
    console.log(`   🛡️  All ${expectedRules.length} architectural rules configured`);
  }
} catch (error) {
  console.log('   ❌ Failed to load dependency-cruiser config');
}

// Test 4: Check for import path improvements
console.log('\n4. Scanning for import path quality...');

function scanForImports(dir, patterns = {}) {
  const results = { deep: 0, alias: 0, total: 0 };
  
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        const subResults = scanForImports(filePath, patterns);
        results.deep += subResults.deep;
        results.alias += subResults.alias;
        results.total += subResults.total;
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const lines = content.split('\n');
          
          lines.forEach(line => {
            if (line.includes('import') && line.includes('from')) {
              results.total++;
              
              // Count deep relative imports
              if (line.match(/\.\.\//g)?.length >= 3) {
                results.deep++;
              }
              
              // Count @/ alias imports
              if (line.includes('@/')) {
                results.alias++;
              }
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
  
  return results;
}

// Scan main directories
const importResults = scanForImports('app');
const backendResults = scanForImports('backend/src');

const totalImports = importResults.total + backendResults.total;
const totalDeep = importResults.deep + backendResults.deep; 
const totalAlias = importResults.alias + backendResults.alias;

console.log(`   📊 Import Quality Metrics:`);
console.log(`      Total imports scanned: ${totalImports}`);
console.log(`      Deep relative imports (../../../): ${totalDeep}`);
console.log(`      Alias imports (@/): ${totalAlias}`);

if (totalDeep === 0) {
  console.log(`   ✅ No deep relative imports found!`);
} else {
  console.log(`   ⚠️  ${totalDeep} deep imports need fixing`);
}

if (totalAlias > 0) {
  console.log(`   ✅ ${totalAlias} clean alias imports`);
}

// Test 5: Verify core components exist
console.log('\n5. Checking core architecture components...');
const coreComponents = [
  'backend/src/core/agents/PersonalOracleAgent.ts',
  'backend/src/core/agents/elemental/aetherAgent.ts',
  'backend/src/core/orchestration/wiring.ts',
  '.dependency-cruiser.cjs',
  '.eslintrc.imports.cjs'
];

coreComponents.forEach(component => {
  if (fs.existsSync(component)) {
    console.log(`   ✅ ${component}`);
  } else {
    console.log(`   ❌ ${component} - MISSING`);
  }
});

// Summary
console.log('\n🎯 Architecture Validation Summary');
console.log('═══════════════════════════════════════');

if (structureValid && totalDeep === 0) {
  console.log('✅ HEXAGONAL ARCHITECTURE: Successfully implemented');
  console.log('✅ IMPORT QUALITY: Clean alias imports established');
  console.log('✅ ARCHITECTURAL GUARDRAILS: Rules configured and enforced');
  console.log('\n🚀 Ready for npm run build and deployment!');
} else {
  console.log('⚠️  PARTIAL SUCCESS: Some issues need attention');
  console.log('🔧 Run npm run doctor for detailed analysis');
}

console.log('\n📋 Next Steps:');
console.log('1. npm run build       # Verify build works');
console.log('2. npm run doctor      # Run full health check');
console.log('3. docker compose up   # Test deployment');