#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Starting comprehensive dependency audit...\n');

const REPORT_DIR = path.join(__dirname, '..', 'deprecated', Date.now().toString());
fs.mkdirSync(REPORT_DIR, { recursive: true });

let unusedDependencies = [];
let indirectDependencies = [];
let totalDependencies = 0;

// Read package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const backendPackageJsonPath = path.join(__dirname, '..', 'backend', 'package.json');

function analyzeDependencies(packagePath, context) {
  if (!fs.existsSync(packagePath)) return [];
  
  console.log(`📦 Analyzing ${context} dependencies...`);
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const deps = {
    ...packageJson.dependencies || {},
    ...packageJson.devDependencies || {}
  };
  
  totalDependencies += Object.keys(deps).length;
  const unused = [];
  const indirect = [];
  
  Object.keys(deps).forEach(dep => {
    try {
      // Search for import/require statements
      const searchPatterns = [
        `"${dep}"`,
        `'${dep}'`,
        `from "${dep}"`,
        `from '${dep}'`,
        `require("${dep}")`,
        `require('${dep}')`,
        `import("${dep}")`,
        `import('${dep}')`
      ];
      
      const searchCommand = `grep -r ${searchPatterns.map(p => `-e "${p}"`).join(' ')} . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=deprecated --exclude-dir=dev-archive --exclude-dir=.next || true`;
      const result = execSync(searchCommand, { encoding: 'utf8', cwd: path.dirname(packagePath) });
      
      if (!result.trim()) {
        // Check if it might be used indirectly (common dev tools, frameworks)
        const indirectTools = [
          'eslint', 'prettier', 'jest', 'vitest', 'typescript', 'husky',
          'react', 'next', 'webpack', 'babel', 'postcss', 'tailwind',
          '@types/', 'rollup', 'vite', 'nodemon'
        ];
        
        if (indirectTools.some(tool => dep.includes(tool))) {
          indirect.push(dep);
        } else {
          unused.push(dep);
        }
      }
    } catch (error) {
      console.log(`   ⚠️  Could not analyze ${dep}: ${error.message}`);
    }
  });
  
  console.log(`   Found ${unused.length} unused, ${indirect.length} indirect dependencies`);
  return { unused, indirect, context };
}

// Analyze root and backend dependencies
const rootAnalysis = analyzeDependencies(packageJsonPath, 'root');
const backendAnalysis = analyzeDependencies(backendPackageJsonPath, 'backend');

unusedDependencies = [...rootAnalysis.unused, ...backendAnalysis.unused];
indirectDependencies = [...rootAnalysis.indirect, ...backendAnalysis.indirect];

console.log('\n📊 Dependency Analysis Complete!');
console.log(`   Total dependencies analyzed: ${totalDependencies}`);
console.log(`   Unused dependencies: ${unusedDependencies.length}`);
console.log(`   Indirect dependencies: ${indirectDependencies.length}`);

// Generate report
const report = [
  '# Dependency Audit Report',
  `Generated: ${new Date().toISOString()}`,
  '',
  '## Summary',
  `- Total dependencies analyzed: ${totalDependencies}`,
  `- Unused dependencies: ${unusedDependencies.length}`,
  `- Indirect/tooling dependencies: ${indirectDependencies.length}`,
  '',
  '## Unused Dependencies (Safe to Remove)',
  '> These dependencies have no direct import/require statements',
  '',
  ...unusedDependencies.map(dep => `- ${dep}`),
  '',
  '## Indirect Dependencies (Review Before Removal)',
  '> These may be used by build tools, frameworks, or have indirect usage',
  '',
  ...indirectDependencies.map(dep => `- ${dep}`),
  '',
  '## Recommendations',
  '1. Test thoroughly after removing unused dependencies',
  '2. Review indirect dependencies - they may be needed by build tools',
  '3. Consider using `npm ls` to see dependency tree',
  '4. Run all tests and builds after dependency cleanup',
  '',
  '## Commands to Clean Up',
  '```bash',
  '# Remove unused dependencies (review list first!)',
  ...unusedDependencies.map(dep => `npm uninstall ${dep}`),
  '',
  '# Review indirect dependencies carefully before removing',
  ...indirectDependencies.slice(0, 5).map(dep => `# npm uninstall ${dep}  # Review first!`),
  '```'
].join('\n');

const reportPath = path.join(REPORT_DIR, 'dependency-audit-report.md');
fs.writeFileSync(reportPath, report);

console.log(`\n📋 Report saved to: ${reportPath}`);
console.log('\n⚠️  IMPORTANT: Review all dependencies before removal!');
console.log('   Some may be used by build tools or have indirect usage.');

module.exports = { unusedDependencies, indirectDependencies, reportPath };