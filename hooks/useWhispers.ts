"use client";
import { useEffect, useState } from "react";
import type { Element } from "@/lib/recap/types";

type RecapBucket = {
  element: Element;
  titles?: string[];
  keywords?: string[];
};
import type { Whisper } from "@/lib/whispers/rankWhispers";
import type { Whisper as SimpleWhisper } from "@/lib/micro/whispers";

export function useWhispers(buckets: RecapBucket[] | null, opts?: {limit?: number}) {
  const [data, setData] = useState<Whisper[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!buckets || buckets.length === 0) { setData([]); return; }
      setLoading(true);
      try {
        const res = await fetch("/api/whispers/context", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ recapBuckets: buckets, limit: opts?.limit ?? 6 })
        });
        const json = await res.json();
        if (!cancelled) setData(json.whispers ?? []);
      } catch {
        if (!cancelled) setData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [JSON.stringify(buckets), opts?.limit]);

  return { whispers: data, loading };
}

// Keep the simple version for backward compatibility
export function useSimpleWhispers(params?: { since?: string; limit?: number; tags?: string[] }) {
  const [whispers, setWhispers] = useState<SimpleWhisper[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qp = new URLSearchParams();
    if (params?.since) qp.set("since", params.since);
    if (params?.limit) qp.set("limit", String(params.limit));
    params?.tags?.forEach(t => qp.append("tag", t));
    fetch(`/api/whispers?${qp.toString()}`)
      .then(r => r.json())
      .then(j => setWhispers(j.whispers ?? []))
      .finally(() => setLoading(false));
  }, [params?.since, params?.limit, JSON.stringify(params?.tags)]);

  return { whispers, loading };
}