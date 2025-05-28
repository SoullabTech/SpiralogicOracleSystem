import fs from 'fs';
import path from 'path';

const baseDir = path.resolve('./src');

function updateImportsInFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Replace .js only in import/export paths
  content = content.replace(
    /((?:import|export)[^'"]+['"](?:[^'"]+))\.js(['"])/g,
    '$1$2'
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
  }
}

function walkDir(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (
      entry.isFile() &&
      fullPath.endsWith('.ts') &&
      !fullPath.endsWith('.d.ts')
    ) {
      updateImportsInFile(fullPath);
    }
  }
}

walkDir(baseDir);
console.log('🎉 Finished cleaning .js extensions from import paths.');
