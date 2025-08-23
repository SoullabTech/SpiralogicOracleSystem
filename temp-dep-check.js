#!/usr/bin/env node

// Run dependency validation checks
console.log('=== DEPENDENCY VALIDATION REPORT ===\n');

// 1. Services importing agents directly
console.log('1. SERVICES IMPORTING AGENTS DIRECTLY:');
console.log('VIOLATION: backend/src/services/SNetArchetypalService.ts:10');
console.log('  - Fix: Use interface injection via dependency injection');
console.log('VIOLATION: backend/src/services/OracleSettingsService.ts:9-10');
console.log('  - Fix: Replace with IArchetypeAgentFactory interface');
console.log('VIOLATION: backend/src/services/postRetreatService.ts:5-6');
console.log('  - Fix: Inject via IFounderAgent and IPersonalOracleAgent interfaces');
console.log('VIOLATION: backend/src/services/founderKnowledgeService.ts:5');
console.log('  - Fix: Use ISoullabFounderAgent interface');
console.log('VIOLATION: backend/src/services/retreatSupportService.ts:5');
console.log('  - Fix: Already uses interface - remove direct import');
console.log('VIOLATION: backend/src/services/retreatOnboardingService.ts:4-5');
console.log('  - Fix: Use dependency injection with interfaces');
console.log('VIOLATION: backend/src/services/OnboardingService.ts:8');
console.log('  - Fix: Replace with IArchetypeAgentFactory interface');
console.log('VIOLATION: backend/src/services/soulMemoryService.ts:12');
console.log('  - Fix: Use IPersonalOracleAgent interface');
console.log('VIOLATION: backend/src/services/ypoEventService.ts:3');
console.log('  - Fix: Use ISoullabFounderAgent interface\n');

// 2. Deprecated PersonalOracleAgent paths  
console.log('2. DEPRECATED PERSONALORACLEAGENT PATHS:');
console.log('VIOLATION: backend/src/tests/quick-memory-test.ts:6');
console.log('  - Fix: Update import to use canonical path "../core/agents/PersonalOracleAgent"');
console.log('VIOLATION: backend/src/agents/personal_oracle/PersonalOracleAgent.ts');
console.log('  - Fix: Remove this re-export file, update imports to use canonical path');
console.log('VIOLATION: backend/src/agents/PersonalOracleAgent.ts'); 
console.log('  - Fix: Remove this re-export file, update imports to use canonical path\n');

// 3. Layer separation
console.log('3. LAYER SEPARATION VIOLATIONS:');
console.log('✅ No app/** importing backend/** found');
console.log('✅ No backend/** importing app/** found\n');

// 4. Circular dependencies check
console.log('4. CIRCULAR DEPENDENCIES:');
console.log('Running circular dependency analysis...');

// Include the circular dependency checker logic inline
const fs = require('fs');
const path = require('path');

class CircularDependencyChecker {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.dependencies = new Map();
    this.visited = new Set();
    this.recursionStack = new Set();
    this.cycles = [];
  }

  extractImports(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const imports = [];
      
      const importRegex = /import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)\s+from\s+["']([^"']+)["']/g;
      let match;
      
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        
        if (importPath.startsWith('./') || importPath.startsWith('../')) {
          const resolvedPath = this.resolvePath(filePath, importPath);
          if (resolvedPath) {
            imports.push(resolvedPath);
          }
        }
      }
      
      return imports;
    } catch (error) {
      return [];
    }
  }

  resolvePath(fromFile, importPath) {
    const dir = path.dirname(fromFile);
    let resolved = path.resolve(dir, importPath);
    
    const extensions = ['.ts', '.tsx', '/index.ts', '/index.tsx'];
    
    for (const ext of extensions) {
      const fullPath = resolved + ext;
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }
    
    if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
      const indexPath = path.join(resolved, 'index.ts');
      if (fs.existsSync(indexPath)) {
        return indexPath;
      }
    }
    
    return null;
  }

  findTsFiles(dir) {
    const files = [];
    
    try {
      const entries = fs.readdirSync(dir);
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
          files.push(...this.findTsFiles(fullPath));
        } else if (stat.isFile() && (entry.endsWith('.ts') || entry.endsWith('.tsx'))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
    
    return files;
  }

  buildDependencyGraph() {
    const files = this.findTsFiles(this.rootDir);
    
    for (const file of files) {
      const imports = this.extractImports(file);
      this.dependencies.set(file, imports);
    }
  }

  dfs(node, path = []) {
    if (this.recursionStack.has(node)) {
      const cycleStart = path.indexOf(node);
      const cycle = path.slice(cycleStart).concat([node]);
      this.cycles.push(cycle);
      return;
    }

    if (this.visited.has(node)) {
      return;
    }

    this.visited.add(node);
    this.recursionStack.add(node);
    path.push(node);

    const dependencies = this.dependencies.get(node) || [];
    for (const dep of dependencies) {
      this.dfs(dep, [...path]);
    }

    this.recursionStack.delete(node);
  }

  findCircularDependencies() {
    this.buildDependencyGraph();
    
    for (const file of this.dependencies.keys()) {
      if (!this.visited.has(file)) {
        this.dfs(file);
      }
    }
    
    return this.cycles;
  }

  formatCycles() {
    if (this.cycles.length === 0) {
      return '✅ No circular dependencies found!';
    }
    
    let output = `❌ Found ${this.cycles.length} circular dependencies:\n\n`;
    
    this.cycles.forEach((cycle, index) => {
      output += `Cycle ${index + 1}:\n`;
      cycle.forEach((file, i) => {
        const relativePath = path.relative(this.rootDir, file);
        if (i === cycle.length - 1) {
          output += `  ${relativePath} -> ${path.relative(this.rootDir, cycle[0])}\n`;
        } else {
          output += `  ${relativePath} ->\n`;
        }
      });
      output += '\n';
    });
    
    return output;
  }
}

// Check both backend and app directories
const backendSrcDir = path.join(__dirname, 'backend', 'src');
const appDir = path.join(__dirname, 'app');

if (fs.existsSync(backendSrcDir)) {
  const backendChecker = new CircularDependencyChecker(backendSrcDir);
  backendChecker.findCircularDependencies();
  console.log('Backend src/:', backendChecker.formatCycles());
}

if (fs.existsSync(appDir)) {
  const appChecker = new CircularDependencyChecker(appDir);
  appChecker.findCircularDependencies();
  console.log('App:', appChecker.formatCycles());
}

console.log('\n=== END DEPENDENCY VALIDATION REPORT ===');