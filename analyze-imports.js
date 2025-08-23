const fs = require('fs');
const path = require('path');

function analyzeImports() {
  const backendSrc = path.join(__dirname, 'backend', 'src');
  const results = [];
  
  function scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(backendSrc, filePath);
      
      // Find import statements
      const importRegex = /import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)\s+from\s+["']([^"']+)["']/g;
      let match;
      const imports = [];
      
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        if (importPath.startsWith('./') || importPath.startsWith('../')) {
          imports.push(importPath);
        }
      }
      
      if (imports.length > 0) {
        results.push({ file: relativePath, imports });
      }
    } catch (err) {
      // Skip files we can't read
    }
  }
  
  function scanDirectory(dir) {
    try {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !entry.startsWith('.')) {
          scanDirectory(fullPath);
        } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
          scanFile(fullPath);
        }
      }
    } catch (err) {
      // Skip directories we can't read
    }
  }
  
  scanDirectory(backendSrc);
  return results;
}

// Run analysis
console.log('Analyzing imports in backend/src...\n');
const imports = analyzeImports();

// Look for potential cycles by examining key files
const keyFiles = [
  'core/agents/MainOracleAgent.ts',
  'services/memoryService.ts', 
  'services/symbolService.ts',
  'utils/facetUtil.ts',
  'core/agents/ArchetypeAgent.ts',
  'core/agents/oracleAgent.ts'
];

console.log('Key file import analysis:');
for (const result of imports) {
  if (keyFiles.some(key => result.file.includes(key.replace(/\//g, path.sep)))) {
    console.log(`\n${result.file}:`);
    result.imports.forEach(imp => console.log(`  -> ${imp}`));
  }
}

// Look for patterns that might indicate cycles
console.log('\n\nPotential circular dependency patterns:');
const agentFiles = imports.filter(r => r.file.includes('agents'));
const serviceFiles = imports.filter(r => r.file.includes('services'));

// Check if agents import services that import other agents
for (const agent of agentFiles) {
  const serviceImports = agent.imports.filter(imp => imp.includes('services'));
  if (serviceImports.length > 0) {
    console.log(`\n${agent.file} imports services:`);
    serviceImports.forEach(imp => console.log(`  -> ${imp}`));
  }
}

console.log('\nAnalysis complete. Review the imports above for potential circular dependencies.');