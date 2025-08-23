"use client";
import { useState, useEffect } from "react";
import { useContextWhispers } from "@/hooks/useContextWhispers";
import QuickCapture from "@/components/micro/QuickCapture";
import type { Element } from "@/lib/recap/types";

// Predefined test scenarios for different contexts
const testScenarios = {
  highEnergy: {
    name: "High Energy Creative",
    buckets: [
      { element: "fire" as Element, titles: ["Creative breakthrough", "New project"], keywords: ["innovation", "design", "create"] },
      { element: "air" as Element, titles: ["Ideas flowing"], keywords: ["inspiration", "vision"] },
    ]
  },
  anxious: {
    name: "Anxiety Processing",
    buckets: [
      { element: "water" as Element, titles: ["Processing fears", "Emotional release"], keywords: ["anxiety", "worry", "fear"] },
      { element: "earth" as Element, titles: ["Finding ground"], keywords: ["stability", "safety"] },
    ]
  },
  planning: {
    name: "Strategic Planning",
    buckets: [
      { element: "earth" as Element, titles: ["Action items", "Next steps"], keywords: ["todo", "plan", "organize"] },
      { element: "air" as Element, titles: ["Strategy"], keywords: ["approach", "system"] },
    ]
  },
  balanced: {
    name: "Balanced Mix",
    buckets: [
      { element: "fire" as Element, keywords: ["energy"] },
      { element: "water" as Element, keywords: ["feeling"] },
      { element: "earth" as Element, keywords: ["practical"] },
      { element: "air" as Element, keywords: ["thought"] },
      { element: "aether" as Element, keywords: ["spiritual"] },
    ]
  }
};

export default function WhispersHarness() {
  const [scenario, setScenario] = useState<keyof typeof testScenarios>("balanced");
  const [limit, setLimit] = useState(6);
  const [showDebug, setShowDebug] = useState(true);
  
  const { whispers, loading } = useContextWhispers(
    testScenarios[scenario].buckets,
    { limit }
  );

  // Auto-refresh every 30s to see new captures
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setRefreshKey(k => k + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold text-ink-100">Whispers Dev Harness</h1>
        <p className="text-ink-300">
          Test the contextual ranking algorithm with different scenarios and see how scores are calculated.
        </p>
      </header>

      {/* Quick Capture */}
      <section className="rounded-2xl border border-edge-700 bg-bg-900 p-6">
        <h2 className="text-xl font-semibold text-ink-100 mb-4">1. Capture Test Memories</h2>
        <p className="text-sm text-ink-400 mb-4">
          Try different tags: <code className="text-gold-400">inspiration</code>, <code className="text-gold-400">fear</code>, 
          <code className="text-gold-400">todo</code>, <code className="text-gold-400">reflection</code>
        </p>
        <QuickCapture />
      </section>

      {/* Scenario Selector */}
      <section className="rounded-2xl border border-edge-700 bg-bg-900 p-6">
        <h2 className="text-xl font-semibold text-ink-100 mb-4">2. Test Context Scenarios</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {Object.entries(testScenarios).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setScenario(key as keyof typeof testScenarios)}
              className={`p-3 rounded-lg border text-sm transition-all ${
                scenario === key 
                  ? "bg-gold-400 text-bg-900 border-gold-400 shadow-lg" 
                  : "bg-edge-700 text-ink-200 border-edge-600 hover:bg-edge-600"
              }`}
            >
              {config.name}
            </button>
          ))}
        </div>

        <div className="rounded-lg bg-bg-800 p-4 space-y-2">
          <h3 className="text-sm font-medium text-ink-200">Current Context:</h3>
          <ul className="text-xs text-ink-400 space-y-1">
            {testScenarios[scenario].buckets.map((b, i) => (
              <li key={i}>
                <span className="text-gold-400">{b.element}</span>
                {b.titles && ` - Titles: ${b.titles.join(", ")}`}
                {b.keywords && ` - Keywords: ${b.keywords.join(", ")}`}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <label className="flex items-center gap-2 text-sm text-ink-200">
            Limit:
            <input 
              type="number" 
              value={limit} 
              onChange={(e) => setLimit(Number(e.target.value))}
              min={1} 
              max={24}
              className="w-16 px-2 py-1 rounded bg-edge-700 border border-edge-600 text-ink-100"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-200">
            <input 
              type="checkbox" 
              checked={showDebug} 
              onChange={(e) => setShowDebug(e.target.checked)}
              className="rounded"
            />
            Show debug info
          </label>
        </div>
      </section>

      {/* Results */}
      <section className="rounded-2xl border border-edge-700 bg-bg-900 p-6">
        <h2 className="text-xl font-semibold text-ink-100 mb-4">3. Ranked Whispers (refresh key: {refreshKey})</h2>
        
        {loading ? (
          <div className="text-ink-300">Ranking whispers...</div>
        ) : whispers?.length ? (
          <div className="space-y-3">
            {whispers.map((w, idx) => (
              <div key={w.id} className="rounded-lg border border-edge-600 bg-bg-800 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-ink-400">#{idx + 1}</span>
                      <span className="text-sm text-ink-200">{w.text}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {w.element && (
                        <span className={`px-2 py-0.5 rounded ${
                          w.element === "fire" ? "bg-red-500/20 text-red-300" :
                          w.element === "water" ? "bg-blue-500/20 text-blue-300" :
                          w.element === "earth" ? "bg-green-500/20 text-green-300" :
                          w.element === "air" ? "bg-purple-500/20 text-purple-300" :
                          "bg-amber-500/20 text-amber-300"
                        }`}>
                          {w.element}
                        </span>
                      )}
                      {w.tags?.map(t => (
                        <span key={t} className="px-2 py-0.5 rounded bg-edge-700 text-ink-300">{t}</span>
                      ))}
                      {w.energy_level && (
                        <span className="px-2 py-0.5 rounded bg-edge-700 text-ink-300">
                          {w.energy_level} energy
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-gold-400">{Math.round(w.score)}</div>
                    <div className="text-xs text-ink-400">score</div>
                  </div>
                </div>
                
                {showDebug && (
                  <div className="mt-3 pt-3 border-t border-edge-700 space-y-1 text-xs text-ink-400">
                    <div><strong>Reason:</strong> {w.reason}</div>
                    <div><strong>Created:</strong> {new Date(w.created_at).toLocaleString()}</div>
                    {w.recall_at && <div><strong>Recall:</strong> {new Date(w.recall_at).toLocaleString()}</div>}
                    <div className="font-mono text-[10px] opacity-60">ID: {w.id}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-ink-400">No whispers found. Try capturing some memories first!</div>
        )}
      </section>

      {/* Algorithm Explanation */}
      <section className="rounded-2xl border border-edge-700 bg-bg-900 p-6">
        <h2 className="text-xl font-semibold text-ink-100 mb-4">Ranking Algorithm</h2>
        <div className="prose prose-invert text-sm text-ink-300 space-y-3">
          <p>The contextual ranking algorithm scores each whisper based on multiple factors:</p>
          <ul className="space-y-2">
            <li><strong>Element Match (15% boost):</strong> Memories with elements that appear in the recap context</li>
            <li><strong>Tag Weights:</strong> fear (1.0) > inspiration (0.9) > todo (0.85) > reflection (0.8)</li>
            <li><strong>Keyphrase Overlap (12% boost):</strong> Text containing keywords from recap titles/keywords</li>
            <li><strong>Recency (60-100%):</strong> Newer memories score higher, with gentle decay over 3 days</li>
            <li><strong>Recall Due (25% boost):</strong> Memories due for spaced repetition review</li>
          </ul>
          <p>Final score = 100 × recency × element_boost × tag_weight × phrase_boost × recall_boost</p>
        </div>
      </section>
    </main>
  );
}