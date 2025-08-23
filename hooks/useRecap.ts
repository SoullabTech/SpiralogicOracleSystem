'use client';
import { useEffect, useState } from 'react';
import type { RecapBuckets, RecapSource } from '@/lib/recap/types';
import { bucketize } from '@/lib/recap/map';

export function useRecap(source: RecapSource) {
  const [loading, setLoading] = useState(source.mode === 'weave');
  const [error, setError] = useState<string | null>(null);
  const [recap, setRecap] = useState<RecapBuckets | null>(
    source.mode === 'props' ? source.recap : null
  );

  useEffect(() => {
    if (source.mode !== 'weave') return;
    const ctrl = new AbortController();

    (async () => {
      try {
        setLoading(true); setError(null);
        const res = await fetch('/api/oracle/weave', {
          method: 'POST',
          signal: ctrl.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: source.conversationId,
            userId: source.userId,
            turnCount: source.turnCount ?? 3,
          }),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json(); // expected: { text, userQuote?, buckets? }
        const b = data.buckets || bucketize(String(data.text ?? ''));
        setRecap({
          themes: b.themes || [],
          emotions: b.emotions || [],
          steps: b.steps || [],
          ideas: b.ideas || [],
          energy: b.energy || [],
          timestamp: new Date().toISOString(),
          quote: data.userQuote ?? undefined,
        });
      } catch (e: any) {
        if (e?.name !== 'AbortError') setError(e?.message || 'Failed to load recap');
      } finally {
        setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [source]);

  return { recap, loading, error };
}