"use client";

import { useState } from "react";
import { DEFAULT_WEIGHTS, WhisperWeights } from "@/app/api/whispers/weights/schema";

// Demo showing the server-persisted weights system
export default function WeightsDemoPage() {
  const [weights, setWeights] = useState<WhisperWeights>(DEFAULT_WEIGHTS);
  const [status, setStatus] = useState<"idle" | "loading" | "saved" | "error">("idle");

  const simulateServerSave = async () => {
    setStatus("loading");
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 2000);
  };

  const handleWeightChange = (key: keyof WhisperWeights, value: any) => {
    setWeights(prev => ({ ...prev, [key]: value }));
  };

  const handleTagWeightChange = (tag: string, value: number) => {
    setWeights(prev => ({
      ...prev,
      tagWeights: { ...prev.tagWeights, [tag]: value }
    }));
  };

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-ink-100">Server-Persisted Weights Demo</h1>
        <p className="text-ink-300">
          This demonstrates the whisper weights system with server persistence, feature flags, and cross-device sync.
        </p>
      </header>

      {/* Status Banner */}
      <div className={`p-4 rounded-xl border ${
        status === "saved" ? "bg-green-500/10 border-green-500/30" :
        status === "loading" ? "bg-yellow-500/10 border-yellow-500/30" :
        status === "error" ? "bg-red-500/10 border-red-500/30" :
        "bg-bg-900 border-edge-700"
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-ink-100">Server Persistence Status</h3>
            <p className="text-sm text-ink-300 mt-1">
              {status === "saved" && "✅ Weights saved and synced across all devices"}
              {status === "loading" && "⏳ Saving weights to server..."}
              {status === "error" && "❌ Failed to save weights"}
              {status === "idle" && "💾 Ready to save custom weights"}
            </p>
          </div>
          <button
            onClick={simulateServerSave}
            disabled={status === "loading"}
            className="px-4 py-2 rounded-lg bg-gold-400 text-bg-900 font-medium hover:bg-gold-300 disabled:opacity-50 transition-colors"
          >
            {status === "loading" ? "Saving..." : "Save to Server"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Controls */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-ink-100">Tunable Weights</h2>
          
          <div className="space-y-3">
            <WeightSlider
              label="Element Boost"
              description="Bonus for memories matching recap elements"
              value={weights.elementBoost}
              min={0} max={0.5} step={0.01}
              onChange={(v) => handleWeightChange("elementBoost", v)}
            />
            
            <WeightSlider
              label="Keyphrase Weight"
              description="Multiplier for text content overlap"
              value={weights.keyphraseWeight}
              min={0} max={2} step={0.05}
              onChange={(v) => handleWeightChange("keyphraseWeight", v)}
            />
            
            <WeightSlider
              label="Recency Half-life (days)"
              description="How quickly older memories fade"
              value={weights.recencyHalfLifeDays}
              min={0.5} max={14} step={0.5}
              onChange={(v) => handleWeightChange("recencyHalfLifeDays", v)}
            />
            
            <WeightSlider
              label="Recall Boost"
              description="Bonus for memories due for review"
              value={weights.recallBoost}
              min={0} max={0.6} step={0.02}
              onChange={(v) => handleWeightChange("recallBoost", v)}
            />
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-ink-100">Tag Weights</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(weights.tagWeights).map(([tag, weight]) => (
                <div key={tag}>
                  <label className="block text-sm text-ink-200 mb-1 capitalize">{tag}</label>
                  <input
                    type="range"
                    min={0} max={1.5} step={0.05}
                    value={weight}
                    onChange={(e) => handleTagWeightChange(tag, Number(e.target.value))}
                    className="w-full accent-gold-400"
                  />
                  <div className="text-xs text-ink-400">{weight.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Implementation Features */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-ink-100">System Features</h2>
          
          <div className="space-y-3">
            <FeatureCard
              title="Feature Flags"
              description="Global enable/disable with per-user overrides"
              status="✅ Active"
              details={[
                "whispers.enabled - Master toggle",
                "whispers.contextRanking - Algorithm on/off", 
                "whispers.maxItems - Default limits"
              ]}
            />
            
            <FeatureCard
              title="Row Level Security (RLS)"
              description="User-isolated weight storage"
              status="🔒 Secured"
              details={[
                "Users can only access their own weights",
                "Full CRUD operations protected",
                "Automatic user_id enforcement"
              ]}
            />
            
            <FeatureCard
              title="Graceful Fallbacks"
              description="Multi-layer fallback system"
              status="🛡️ Resilient"
              details={[
                "Server weights → localStorage → defaults",
                "Validation on all weight data",
                "Non-blocking telemetry"
              ]}
            />
            
            <FeatureCard
              title="Production Ready"
              description="Performance and caching optimized"
              status="🚀 Optimized"
              details={[
                "CDN caching with stale-while-revalidate",
                "Indexed database queries",
                "Optimistic updates"
              ]}
            />
          </div>
        </section>
      </div>

      {/* Schema Preview */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-ink-100">Current Configuration</h2>
        <div className="bg-bg-800 rounded-xl p-4 overflow-x-auto">
          <pre className="text-sm text-ink-300">
{JSON.stringify(weights, null, 2)}
          </pre>
        </div>
      </section>
    </main>
  );
}

function WeightSlider({ label, description, value, min, max, step, onChange }: {
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="p-3 rounded-lg bg-bg-800 border border-edge-700">
      <div className="flex justify-between items-start mb-2">
        <div>
          <label className="text-sm font-medium text-ink-100">{label}</label>
          <p className="text-xs text-ink-400">{description}</p>
        </div>
        <span className="text-sm text-gold-400 font-mono">{value}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-gold-400"
      />
    </div>
  );
}

function FeatureCard({ title, description, status, details }: {
  title: string;
  description: string;
  status: string;
  details: string[];
}) {
  return (
    <div className="p-4 rounded-lg bg-bg-800 border border-edge-700">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium text-ink-100">{title}</h3>
          <p className="text-sm text-ink-300">{description}</p>
        </div>
        <span className="text-xs px-2 py-1 rounded bg-edge-700 text-ink-200">{status}</span>
      </div>
      <ul className="text-xs text-ink-400 space-y-1 mt-2">
        {details.map((detail, i) => (
          <li key={i}>• {detail}</li>
        ))}
      </ul>
    </div>
  );
}