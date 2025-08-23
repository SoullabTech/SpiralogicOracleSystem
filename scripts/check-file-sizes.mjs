// scripts/check-file-sizes.mjs
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const IGNORE = ['node_modules', '.next', 'dist', 'build', '.vercel', '.git'];
const EXTS = new Set(['.ts', '.tsx']);

function walk(dir, out=[]) {
  for (const name of readdirSync(dir)) {
    if (IGNORE.includes(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (EXTS.has(p.slice(p.lastIndexOf('.')))) out.push(p);
  }
  return out;
}

const offenders = [];
for (const f of walk(ROOT)) {
  const lines = readFileSync(f, 'utf8').split('\n').filter(l => l.trim().length).length;
  if (lines > 600) offenders.push({ f, lines });
}

if (offenders.length) {
  console.error('Files exceeding 600 LOC:\n' + offenders.map(o => ` - ${o.f} (${o.lines})`).join('\n'));
  process.exit(1);
} else {
  console.log('✅ No files exceed 600 LOC.');
}