"use client";

import React from "react";
import { ALL_ELEMENTS, ALL_TAGS, Element, Tag } from "@/lib/whispers/weights";
import { DEFAULT_WEIGHTS, WhisperWeights } from "@/app/api/whispers/weights/schema";
import { rankWhispersClient, RankedWhisper, Whisper } from "@/lib/whispers/rankClient";
import { useWhisperWeights } from "@/hooks/useWhisperWeights";

type Props = {
  initialWhispers: Whisper[];
};

export default function TunePanel({ initialWhispers }: Props) {
  const { status, weights: serverWeights, save } = useWhisperWeights();
  const [weights, setWeights] = React.useState<WhisperWeights>(DEFAULT_WEIGHTS);
  const [elements, setElements] = React.useState<Element[]>(["fire", "water"]);
  const [keyphrases, setKeyphrases] = React.useState<string>("focus clarity momentum anxiety");
  const [limit, setLimit] = React.useState<number>(12);

  // sync from server once ready
  React.useEffect(() => {
    if (status === "ready" || status === "error") {
      setWeights(serverWeights);
      localStorage.setItem("whisperWeights", JSON.stringify(serverWeights));
    }
  }, [status, serverWeights]);

  const ranked: RankedWhisper[] = React.useMemo(() => {
    return rankWhispersClient(
      initialWhispers,
      { elements, keyphrases: keyphrases.split(/\s+/).filter(Boolean) },
      weights
    ).slice(0, limit);
  }, [initialWhispers, elements, keyphrases, weights, limit]);

  function tweak<K extends keyof WhisperWeights>(key: K, val: WhisperWeights[K]) {
    setWeights(w => ({ ...w, [key]: val }));
  }

  function setTag(tag: Tag, val: number) {
    setWeights(w => ({ ...w, tagWeights: { ...w.tagWeights, [tag]: val } }));
  }

  function toggleElement(el: Element) {
    setElements(e => (e.includes(el) ? e.filter(x => x !== el) : [...e, el]));
  }

  async function saveToServer() {
    await save(weights);
  }

  function resetDefaults() {
    setWeights(DEFAULT_WEIGHTS);
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      {/* Controls */}
      <section className="xl:col-span-2 space-y-6">
        <div className="p-4 rounded-2xl border border-edge-700 bg-bg-900">
          <h2 className="font-semibold mb-3 text-ink-100">Context</h2>
          <div className="mb-3">
            <label className="block text-sm mb-1 text-ink-200">Elements in recap</label>
            <div className="flex flex-wrap gap-2">
              {ALL_ELEMENTS.map(el => (
                <button
                  key={el}
                  onClick={() => toggleElement(el)}
                  className={`px-3 py-1 rounded-full border text-sm transition-all ${
                    elements.includes(el) 
                      ? "bg-gold-400/20 border-gold-400/50 text-gold-400" 
                      : "border-edge-600 text-ink-300 opacity-60 hover:opacity-100"
                  }`}
                >
                  {el}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1 text-ink-200">Keyphrases</label>
            <input
              className="w-full rounded-lg border border-edge-600 px-3 py-2 bg-bg-800 text-ink-100"
              value={keyphrases}
              onChange={e => setKeyphrases(e.target.value)}
              placeholder="e.g. focus momentum anxiety clarity"
            />
          </div>
        </div>

        {/* Server Status */}
        <div className="p-4 rounded-2xl border border-edge-700 bg-bg-900 flex items-center justify-between">
          <div className="text-sm text-ink-300">
            Server weights: <span className={`font-medium ${
              status === "ready" ? "text-green-400" :
              status === "loading" ? "text-yellow-400" :
              status === "error" ? "text-red-400" : "text-ink-400"
            }`}>{status}</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={resetDefaults} 
              className="text-sm underline opacity-80 hover:opacity-100 text-ink-300"
            >
              Reset
            </button>
            <button
              onClick={saveToServer}
              className="px-3 py-1 rounded-lg border border-gold-400 text-gold-400 text-sm hover:bg-gold-400 hover:text-bg-900 transition-colors disabled:opacity-50"
              disabled={status === "loading"}
              title="Persist for this user across devices"
            >
              {status === "loading" ? "Saving..." : "Save to server"}
            </button>
          </div>
        </div>
        
        <div className="p-4 rounded-2xl border border-edge-700 bg-bg-900 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink-100">Weights</h2>
          </div>

          <Slider
            label={`Element boost (${weights.elementBoost.toFixed(2)})`}
            min={0} max={0.5} step={0.01}
            value={weights.elementBoost}
            onChange={v => tweak("elementBoost", v)}
          />

          <Slider
            label={`Keyphrase weight (${weights.keyphraseWeight.toFixed(2)})`}
            min={0} max={2} step={0.05}
            value={weights.keyphraseWeight}
            onChange={v => tweak("keyphraseWeight", v)}
          />

          <Slider
            label={`Recency half-life (days: ${weights.recencyHalfLifeDays.toFixed(1)})`}
            min={0.5} max={14} step={0.5}
            value={weights.recencyHalfLifeDays}
            onChange={v => tweak("recencyHalfLifeDays", v)}
          />

          <Slider
            label={`Recall due boost (${weights.recallBoost.toFixed(2)})`}
            min={0} max={0.6} step={0.02}
            value={weights.recallBoost}
            onChange={v => tweak("recallBoost", v)}
          />

          <div className="mt-3 space-y-2">
            <h3 className="text-sm font-medium text-ink-200">Tag weights</h3>
            {ALL_TAGS.map(tag => (
              <Slider
                key={tag}
                label={`${tag} (${weights.tagWeights[tag].toFixed(2)})`}
                min={0} max={1.5} step={0.05}
                value={weights.tagWeights[tag]}
                onChange={v => setTag(tag, v)}
              />
            ))}
          </div>

          <div className="mt-4">
            <Slider
              label={`Show top (${limit})`}
              min={3} max={30} step={1}
              value={limit}
              onChange={v => setLimit(v)}
            />
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="xl:col-span-3 p-4 rounded-2xl border border-edge-700 bg-bg-900">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-ink-100">Ranked Whispers</h2>
          <div className="text-sm opacity-75 text-ink-300">showing {ranked.length}</div>
        </div>

        <div className="space-y-3 max-h-[800px] overflow-y-auto">
          {ranked.map(w => (
            <div key={w.id} className="rounded-xl border border-edge-600 bg-bg-800 p-3">
              <div className="flex items-center gap-2 text-sm opacity-80 mb-1">
                <span className="inline-block w-2 h-2 rounded-full" style={{ background: colorFor(w.element) }} />
                <code className="opacity-70 text-ink-400">#{w.id.slice(0,8)}</code>
                <span className="text-ink-400">•</span>
                <span className="text-ink-300">{new Date(w.created_at).toLocaleString()}</span>
                {w.tags?.length ? (<><span className="text-ink-400">•</span><span className="text-ink-300">{w.tags.join(", ")}</span></>) : null}
              </div>
              <div className="whitespace-pre-wrap leading-relaxed text-ink-200">{w.content}</div>
              <div className="mt-2 text-xs opacity-70 text-ink-400">
                score <b className="text-gold-400">{w.score.toFixed(3)}</b> — {w.reasons.join(" · ")}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Slider(props: { label: string; min: number; max: number; step: number; value: number; onChange: (v:number)=>void }) {
  return (
    <label className="block">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-ink-200">{props.label}</span>
        <span className="opacity-60 text-ink-300">{props.value}</span>
      </div>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={e => props.onChange(Number(e.target.value))}
        className="w-full accent-gold-400"
      />
    </label>
  );
}

function colorFor(el?: Element | null) {
  switch (el) {
    case "fire": return "#F97316";
    case "water": return "#38BDF8";
    case "earth": return "#10B981";
    case "air": return "#A78BFA";
    case "aether": return "#F472B6";
    default: return "#94A3B8";
  }
}