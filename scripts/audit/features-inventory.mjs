#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const files = [];
function walk(dir) {
  try {
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      try {
        const s = fs.statSync(p);
        if (s.isDirectory()) {
          if (['node_modules', '.next', '.git', 'dist', 'build'].includes(f)) continue;
          walk(p);
        } else if (/\.(ts|tsx|js|mjs)$/.test(f) || /\.sql$/.test(f)) {
          files.push(p);
        }
      } catch (e) {
        // Skip files we can't stat
      }
    }
  } catch (e) {
    // Skip directories we can't read
  }
}
walk(ROOT);

const featureKeys = new Set();
const usages = {};
const envs = new Set();
const tables = new Set();
const apis = new Set();

for (const f of files) {
  const txt = fs.readFileSync(f, 'utf8');

  // feature keys (registry or useFeature)
  const reg = txt.matchAll(/key:\s*['"]([a-z0-9\.\-_]+)['"]/gi);
  for (const m of reg) featureKeys.add(m[1]);

  const useF = txt.matchAll(/useFeature\(['"]([a-z0-9\.\-_]+)['"]\)/gi);
  for (const m of useF) {
    usages[m[1]] ??= [];
    usages[m[1]].push(path.relative(ROOT, f));
  }

  // env flags
  const envM = txt.matchAll(/process\.env\.([A-Z0-9_]+)/g);
  for (const m of envM) envs.add(m[1]);

  // DB tables (loose match)
  const tblM = txt.matchAll(/\bfrom\s+public\.([a-z_]+)\b/gi);
  for (const m of tblM) tables.add(m[1]);
  const sqlTblM = txt.matchAll(/\bcreate table(?: if not exists)?\s+public\.([a-z_]+)/gi);
  for (const m of sqlTblM) tables.add(m[1]);

  // API routes
  if (f.includes('/app/api/') && /route\.(ts|js)$/.test(f)) {
    apis.add(path.relative(ROOT, f).replace(/\\/g, '/'));
  }
}

const outDir = path.join(ROOT, 'docs/admin/review', new Date().toISOString().slice(0,10));
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, 'FEATURE_SCAN.json'), JSON.stringify({
  featureKeys: [...featureKeys].sort(),
  usages,
  envs: [...envs].sort(),
  tables: [...tables].sort(),
  apis: [...apis].sort()
}, null, 2));

console.log('Wrote FEATURE_SCAN.json to', outDir);