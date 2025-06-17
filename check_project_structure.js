// check_project_structure.js
// A simple Node.js script to verify directory structure and .env presence & contents
// Usage: node check_project_structure.js

const fs = require('fs');
const path = require('path');

// Configuration: expected folders and env files
const expected = {
  rootFiles: ['vercel.json', 'structure.txt', '.env.example'],
  folders: [
    'oracle-backend',
    'oracle-frontend'
  ],
  envFiles: [
    { dir: '.', file: '.env.example' },
    { dir: '.', file: '.env.local' },
    { dir: 'oracle-backend', file: '.env.example' },
    { dir: 'oracle-backend', file: '.env.local' },
    { dir: 'oracle-frontend', file: '.env.example' },
    { dir: 'oracle-frontend', file: '.env.local' }
  ],
  requiredKeys: [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_API_BASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'DATABASE_URL'
  ]
};

function exists(p) {
  try { return fs.existsSync(p); } catch { return false; }
}

function checkRootFiles() {
  console.log('Checking root files...');
  expected.rootFiles.forEach(f => {
    const p = path.join(process.cwd(), f);
    console.log(`  ${f}: ${exists(p) ? 'FOUND' : 'MISSING'}`);
  });
}

function checkFolders() {
  console.log('\nChecking expected folders...');
  expected.folders.forEach(d => {
    const p = path.join(process.cwd(), d);
    console.log(`  ${d}: ${exists(p) ? 'FOUND' : 'MISSING'}`);
  });
}

function parseEnv(filePath) {
  if (!exists(filePath)) return {};
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  const vars = {};
  lines.forEach(line => {
    const m = line.match(/^\s*([A-Za-z0-9_]+)=(.*)$/);
    if (m) vars[m[1]] = m[2];
  });
  return vars;
}

function checkEnvFiles() {
  console.log('\nChecking env files and required keys...');
  expected.envFiles.forEach(({ dir, file }) => {
    const filePath = path.join(process.cwd(), dir, file);
    const present = exists(filePath);
    console.log(`  [${dir || 'root'}/${file}]: ${present ? 'FOUND' : 'MISSING'}`);
    if (present) {
      const vars = parseEnv(filePath);
      expected.requiredKeys.forEach(key => {
        const ok = vars[key] && vars[key].length > 0;
        console.log(`    ${key}: ${ok ? 'OK' : 'MISSING in ' + file}`);
      });
    }
  });
}

function main() {
  console.log('🛠️  Project Structure & Env Validation');
  console.log('======================================\n');
  checkRootFiles();
  checkFolders();
  checkEnvFiles();
  console.log('\n✅ Validation complete.');
}

if (require.main === module) {
  main();
}