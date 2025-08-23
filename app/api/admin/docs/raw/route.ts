import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function GET(req: NextRequest) {
  const root = process.cwd();
  const latest = path.join(root, 'docs/admin/review/latest');
  const url = new URL(req.url);
  const p = url.searchParams.get('path');
  if (!p) return new NextResponse('Missing path', { status: 400 });
  // Constrain to latest dir
  const abs = path.resolve(root, '.' + p);
  if (!abs.startsWith(latest)) return new NextResponse('Forbidden', { status: 403 });
  const raw = await fs.readFile(abs, 'utf8');
  return new NextResponse(raw, {
    headers: { 'content-type': 'text/plain; charset=utf-8' }
  });
}