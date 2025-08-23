import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { marked } from 'marked';

const ROOT = process.cwd();
const LATEST = path.join(ROOT, 'docs/admin/review/latest');

const allow = new Set(['INVENTORY.md','FLAGS_MATRIX.md','UX_PLAN.md','WIRING.md','GAPLIST.md','ROLLOUT_PLAYBOOK.md']);

export async function GET() {
  try {
    const entries = await fs.readdir(LATEST);
    const mdFiles = entries.filter(f => allow.has(f));
    const items = await Promise.all(mdFiles.map(async f => {
      const p = path.join(LATEST, f);
      const raw = await fs.readFile(p, 'utf8');
      const html = marked.parse(raw);
      return { name: f, path: p.replace(ROOT,'').replace(/^\/+/,'/'), html };
    }));
    return NextResponse.json({ items });
  } catch (e:any) {
    return NextResponse.json({ items: [], error: e?.message || 'missing' }, { status: 200 });
  }
}