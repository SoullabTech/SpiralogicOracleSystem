"use client";
import { useEffect, useState } from "react";
import { 
  getServicesBySection, 
  getVisibleServicesForUser, 
  SERVICES,
  ServiceEntry,
  SECTION_INFO 
} from "@/lib/config/services.catalog";
import { loadFeatureFlagsSync } from "@/lib/config/flags.runtime";

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
  const [servicesBySection, setServicesBySection] = useState<Record<string, ServiceEntry[]>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string|undefined>();
  const [showHistory, setShowHistory] = useState<string | null>(null);

  useEffect(() => { 
    setServicesBySection(getServicesBySection()); 
  }, []);

  async function onToggle(p: TogglePayload) {
    setSaving(true); setError(undefined);
    try {
      const res = await fetch("/api/admin/features/toggle", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(p),
      });
      if (!res.ok) throw new Error(await res.text());
      // simple optimistic refresh
      setServicesBySection(getServicesBySection());
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
      {Object.entries(servicesBySection).map(([section, services]) => {
        const sectionInfo = SECTION_INFO[section as keyof typeof SECTION_INFO];
        const flags = loadFeatureFlagsSync();
        
        return (
          <section key={section} className="space-y-3">
            <h2 className="text-lg font-medium">{sectionInfo?.name || section}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {services.map(service => {
                // Get the actual flag data for this service
                const mainFlag = service.flags?.[0] ? flags[service.flags[0]] : null;
                const isEnabled = mainFlag?.rollout.enabled || false;
                const percentage = mainFlag?.rollout.percentage || 0;
                
                return (
                  <article key={service.key} className="rounded-xl border border-white/10 p-4 bg-black/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{service.name}</div>
                    <label className="flex items-center gap-2 text-sm">
                      <span className={isEnabled ? "text-emerald-400" : "text-zinc-400"}>
                        {isEnabled ? "On" : "Off"}
                      </span>
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={e => service.flags?.[0] && onToggle({ 
                          key: service.flags[0], 
                          enabled: e.target.checked 
                        })}
                        disabled={!service.flags?.[0]}
                      />
                    </label>
                  </div>
                  
                  {service.description && <p className="text-sm opacity-80">{service.description}</p>}
                  
                  {service.dependsOn && service.dependsOn.length > 0 && (
                    <p className="text-xs opacity-60">
                      Depends on: {service.dependsOn.map(depKey => {
                        const depService = SERVICES.find(s => s.key === depKey);
                        return depService?.name || depKey;
                      }).join(", ")}
                    </p>
                  )}
                  
                  {service.flags?.[0] && (
                    <div className="flex items-center gap-3 text-xs">
                      <span className="opacity-70">Rollout:</span>
                      <input
                        type="range" min={0} max={100} defaultValue={percentage}
                        className="flex-1"
                        onMouseUp={(e:any) => service.flags?.[0] && onToggle({ 
                          key: service.flags[0], 
                          enabled: true, 
                          percentage: Number(e.target.value) 
                        })}
                      />
                      <span className="tabular-nums w-8">{percentage}%</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs opacity-70">
                    <div>
                      {service.perfCost && `Perf: ${service.perfCost.toUpperCase()}`}
                      {service.audience === 'admin' && (
                        <span className="ml-2 px-2 py-1 rounded bg-purple-500/20 text-purple-400">
                          ADMIN
                        </span>
                      )}
                    </div>
                    {service.flags?.[0] && (
                      <button 
                        className="text-blue-400 hover:text-blue-300 underline"
                        onClick={() => service.flags?.[0] && setShowHistory(service.flags[0] === showHistory ? null : service.flags[0])}
                      >
                        History
                      </button>
                    )}
                  </div>
                  
                  {service.flags?.[0] && showHistory === service.flags[0] && (
                    <div className="border-t border-white/10 pt-3">
                      <FeatureFlagHistory flagKey={service.flags[0]} />
                    </div>
                  )}
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}