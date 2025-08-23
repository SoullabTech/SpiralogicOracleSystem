import { useEffect, useMemo, useState } from "react";
import type { Element } from "@/lib/recap/types";
import type { Whisper } from "@/lib/whispers/rankWhispers";
import { features } from "@/lib/config/features";

type RecapBucket = {
  element: Element;
  titles?: string[];
  keywords?: string[];
};

export function useContextWhispers(buckets: RecapBucket[] | null, opts?: { limit?: number; since?: string }) {
  const [data, setData] = useState<Whisper[] | null>(null);
  const [loading, setLoading] = useState(false);

  const payload = useMemo(() => {
    if (!buckets || buckets.length === 0) return null;
    return JSON.stringify({
      recapBuckets: buckets,
      limit: opts?.limit ?? features.whispers.maxItems,
      since: opts?.since,
    });
  }, [buckets, opts?.limit, opts?.since]);

  useEffect(() => {
    let cancelled = false;
    if (!payload) { setData([]); return; }
    setLoading(true);
    fetch("/api/whispers/context", { method: "POST", headers: { "content-type": "application/json" }, body: payload })
      .then(r => r.json())
      .then(j => { if (!cancelled) setData(j.whispers ?? []); })
      .catch(() => { if (!cancelled) setData([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [payload]);

  return { whispers: data, loading };
}