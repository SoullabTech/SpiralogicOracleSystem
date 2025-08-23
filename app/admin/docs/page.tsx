'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type DocItem = { name: string; path: string; html: string };

export default function AdminDocs() {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/docs');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setDocs(data.items || []);
      } catch (e: any) { setErr(e?.message || 'Failed to load docs'); }
    })();
  }, []);

  if (err) return <div className="p-6 text-red-400">Error: {err}</div>;
  if (!docs.length) return <div className="p-6 opacity-70">No review bundle found yet.</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Admin • Docs</h1>
      <p className="opacity-70">Rendering from <code>/docs/admin/review/latest/</code></p>
      <div className="grid gap-6 md:grid-cols-2">
        {docs.map(d => (
          <article key={d.path} className="rounded-2xl border border-white/10 p-4">
            <header className="flex items-center justify-between mb-3">
              <h2 className="font-medium">{d.name}</h2>
              <Link href={`/api/admin/docs/raw?path=${encodeURIComponent(d.path)}`} className="text-sm underline opacity-70">Raw</Link>
            </header>
            <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: d.html }} />
          </article>
        ))}
      </div>
    </div>
  );
}