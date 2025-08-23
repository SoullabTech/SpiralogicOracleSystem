#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple circular dependency detection
class CircularDependencyChecker {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.dependencies = new Map();
    this.visited = new Set();
    this.recursionStack = new Set();
    this.cycles = [];
  }

  // Extract imports from a TypeScript file
  extractImports(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const imports = [];
      
      // Match import statements
      const importRegex = /import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)\s+from\s+["']([^"']+)["']/g;
      let match;
      
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        
        // Only track relative imports that could create cycles
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

  // Resolve relative import paths
  resolvePath(fromFile, importPath) {
    const dir = path.dirname(fromFile);
    let resolved = path.resolve(dir, importPath);
    
    // Try common TypeScript extensions
    const extensions = ['.ts', '.tsx', '/index.ts', '/index.tsx'];
    
    for (const ext of extensions) {
      const fullPath = resolved + ext;
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }
    
    // Check if it's a directory with index file
    if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
      const indexPath = path.join(resolved, 'index.ts');
      if (fs.existsSync(indexPath)) {
        return indexPath;
      }
    }
    
    return null;
  }

  // Recursively find all TypeScript files
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

  // Build dependency graph
  buildDependencyGraph() {
    const files = this.findTsFiles(this.rootDir);
    
    for (const file of files) {
      const imports = this.extractImports(file);
      this.dependencies.set(file, imports);
    }
  }

  // DFS to detect cycles
  dfs(node, path = []) {
    if (this.recursionStack.has(node)) {
      // Found a cycle
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

  // Check for circular dependencies
  findCircularDependencies() {
    this.buildDependencyGraph();
    
    for (const file of this.dependencies.keys()) {
      if (!this.visited.has(file)) {
        this.dfs(file);
      }
    }
    
    return this.cycles;
  }

  // Format output
  formatCycles() {
    if (this.cycles.length === 0) {
      return 'No circular dependencies found!';
    }
    
    let output = `Found ${this.cycles.length} circular dependencies:\n\n`;
    
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

// Run the checker
const backendSrcDir = path.join(__dirname, 'backend', 'src');

if (!fs.existsSync(backendSrcDir)) {
  console.error('backend/src directory not found');
  process.exit(1);
}

console.log('Checking for circular dependencies in backend/src...\n');

const checker = new CircularDependencyChecker(backendSrcDir);
const cycles = checker.findCircularDependencies();
console.log(checker.formatCycles());

if (cycles.length > 0) {
  process.exit(1);
}