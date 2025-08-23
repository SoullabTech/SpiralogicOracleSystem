"use client";
import { useEffect, useState } from "react";
import { getServicesByGroup, getFlag } from "@/lib/config/services.registry";

type TogglePayload = { key: string; enabled: boolean; percentage?: number; };

function FeatureFlagHistory({ flagKey }: { flagKey: string }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/features/history?key=${flagKey}`)
      .then(res => res.json())
      .then(data => {
        setHistory(data.history || []);
        setLoading(false);
      })
      .catch(() => {
        setHistory([]);
        setLoading(false);
      });
  }, [flagKey]);

  if (loading) return <div className="text-xs opacity-60">Loading history...</div>;
  if (history.length === 0) return <div className="text-xs opacity-60">No changes recorded</div>;

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium opacity-80">Recent Changes</div>
      {history.slice(0, 3).map((entry, i) => (
        <div key={i} className="text-xs opacity-70 flex justify-between">
          <span>
            {entry.operation === 'UPDATE' ? 'Modified' : 'Created'} by {entry.user_email}
          </span>
          <span>{new Date(entry.created_at).toLocaleDateString()}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminServicesPage() {
  const [groups, setGroups] = useState(getServicesByGroup());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string|undefined>();
  const [showHistory, setShowHistory] = useState<string | null>(null);

  useEffect(() => { setGroups(getServicesByGroup()); }, []);

  async function onToggle(p: TogglePayload) {
    setSaving(true); setError(undefined);
    try {
      const res = await fetch("/api/admin/features/toggle", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(p),
      });
      if (!res.ok) throw new Error(await res.text());
      // simple optimistic refresh
      setGroups(getServicesByGroup());
    } catch(e:any) {
      setError(e?.message || "Toggle failed");
    } finally { setSaving(false); }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Services & Features</h1>
        {saving && <span className="text-sm opacity-70">Saving…</span>}
      </div>
      {error && <div className="text-sm text-red-400">{error}</div>}
      {Object.entries(groups).map(([group, services]) => (
        <section key={group} className="space-y-3">
          <h2 className="text-lg font-medium">{group}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {services.map(s => (
              <article key={s.key} className="rounded-xl border border-white/10 p-4 bg-black/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{s.label}</div>
                  <label className="flex items-center gap-2 text-sm">
                    <span className={s.rollout.enabled ? "text-emerald-400" : "text-zinc-400"}>
                      {s.rollout.enabled ? "On" : "Off"}
                    </span>
                    <input
                      type="checkbox"
                      checked={s.rollout.enabled}
                      onChange={e => onToggle({ key:s.key, enabled:e.target.checked })}
                    />
                  </label>
                </div>
                
                {s.description && <p className="text-sm opacity-80">{s.description}</p>}
                
                {s.dependsOn.length > 0 && (
                  <p className="text-xs opacity-60">
                    Depends on: {s.dependsOn.map(d => getFlag(d)?.label ?? d).join(", ")}
                  </p>
                )}
                
                <div className="flex items-center gap-3 text-xs">
                  <span className="opacity-70">Rollout:</span>
                  <input
                    type="range" min={0} max={100} defaultValue={s.rollout.percentage}
                    className="flex-1"
                    onMouseUp={(e:any) => onToggle({ key:s.key, enabled:true, percentage: Number(e.target.value) })}
                  />
                  <span className="tabular-nums w-8">{s.rollout.percentage}%</span>
                </div>
                
                <div className="flex items-center justify-between text-xs opacity-70">
                  <div>Perf: CPU {s.perfCost.cpu} · MEM {s.perfCost.memory} · ~{s.perfCost.latencyHintMs}ms</div>
                  <button 
                    className="text-blue-400 hover:text-blue-300 underline"
                    onClick={() => setShowHistory(s.key === showHistory ? null : s.key)}
                  >
                    History
                  </button>
                </div>
                
                {showHistory === s.key && (
                  <div className="border-t border-white/10 pt-3">
                    <FeatureFlagHistory flagKey={s.key} />
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}