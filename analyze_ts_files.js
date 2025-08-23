#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function countNonEmptyLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    return nonEmptyLines.length;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return 0;
  }
}

function findTsFiles(dir, files = []) {
  try {
    const entries = fs.readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other build directories
        if (!['node_modules', '.npm-cache', 'dist', 'build', '.git'].includes(entry)) {
          findTsFiles(fullPath, files);
        }
      } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dir}`);
  }
  
  return files;
}

const rootDir = '/Volumes/T7 Shield/Projects/SpiralogicOracleSystem';
const tsFiles = findTsFiles(rootDir);

console.log(`Found ${tsFiles.length} TypeScript files`);
console.log('');

const results = tsFiles.map(file => ({
  path: file,
  lines: countNonEmptyLines(file)
})).sort((a, b) => b.lines - a.lines);

console.log('=== FILES EXCEEDING 600 LINES ===');
let offendersFound = false;

results.forEach(result => {
  if (result.lines > 600) {
    offendersFound = true;
    const relativePath = result.path.replace(rootDir, '');
    console.log(`${relativePath}: ${result.lines} lines`);
  }
});

if (!offendersFound) {
  console.log('No files found exceeding 600 lines');
}

console.log('\n=== TOP 20 LARGEST FILES ===');
results.slice(0, 20).forEach((result, index) => {
  const relativePath = result.path.replace(rootDir, '');
  console.log(`${index + 1}. ${relativePath}: ${result.lines} lines`);
});

console.log(`\n=== SUMMARY ===`);
console.log(`Total TypeScript files: ${results.length}`);
console.log(`Files > 600 lines: ${results.filter(r => r.lines > 600).length}`);
console.log(`Files > 400 lines: ${results.filter(r => r.lines > 400).length}`);
console.log(`Files > 200 lines: ${results.filter(r => r.lines > 200).length}`);