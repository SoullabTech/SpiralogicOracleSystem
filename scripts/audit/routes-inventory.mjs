#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
function walk(dir) {
  const res = [];
  try {
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      try {
        const s = fs.statSync(p);
        if (s.isDirectory()) res.push(...walk(p));
        else if (/route\.(ts|js)$/.test(f)) res.push(p);
      } catch (e) {
        // Skip files we can't stat
      }
    }
  } catch (e) {
    // Skip directories we can't read
  }
  return res;
}

const routes = walk(path.join(ROOT, 'app', 'api')).map(p => {
  const url = '/' + path.relative(path.join(ROOT, 'app', 'api'), p).replace(/route\.(ts|js)$/,'').replace(/\\/g,'/');
  const methodGuess = fs.readFileSync(p,'utf8').match(/\bexport\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\b/g) || [];
  return { route: `/api${url}`, methods: methodGuess.map(s=>s.replace(/.*\b(function|async)\s+/,'')).join(', ') || 'unknown', file: path.relative(ROOT, p) };
});

const outDir = path.join(ROOT, 'docs/admin/review', new Date().toISOString().slice(0,10));
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'ROUTES.json'), JSON.stringify(routes, null, 2));
console.log('Wrote ROUTES.json to', outDir);