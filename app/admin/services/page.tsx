"use client";
import { useEffect, useState } from "react";
import { getServicesByGroup, getFlag } from "@/lib/config/services.registry";

type TogglePayload = { key: string; enabled: boolean; percentage?: number; };

export default function AdminServicesPage() {
  const [groups, setGroups] = useState(getServicesByGroup());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string|undefined>();

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
              <article key={s.key} className="rounded-xl border border-white/10 p-4 bg-black/20">
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
                {s.description && <p className="text-sm opacity-80 mt-2">{s.description}</p>}
                {s.dependsOn.length > 0 && (
                  <p className="text-xs opacity-60 mt-2">
                    Depends on: {s.dependsOn.map(d => getFlag(d)?.label ?? d).join(", ")}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-3 text-xs">
                  <span className="opacity-70">Rollout:</span>
                  <input
                    type="range" min={0} max={100} defaultValue={s.rollout.percentage}
                    onMouseUp={(e:any) => onToggle({ key:s.key, enabled:true, percentage: Number(e.target.value) })}
                  />
                  <span className="tabular-nums">{s.rollout.percentage}%</span>
                </div>
                <div className="mt-2 text-xs opacity-70">
                  Perf: CPU {s.perfCost.cpu} · MEM {s.perfCost.memory} · ~{s.perfCost.latencyHintMs}ms
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}