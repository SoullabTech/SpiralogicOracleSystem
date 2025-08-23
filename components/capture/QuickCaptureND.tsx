"use client";
import React from "react";
import { features } from "@/lib/config/features";

const ENERGY = ["low","medium","high"] as const;
type Energy = typeof ENERGY[number];

export default function QuickCaptureND() {
  if (!features.neurodivergent.enabled) return null;

  const prefs = JSON.parse(globalThis?.localStorage?.getItem("nd.prefs") ?? "{}");
  if (!prefs.adhdMode) return null;

  const [text, setText] = React.useState("");
  const [energy, setEnergy] = React.useState<Energy>("medium");
  const [tags, setTags] = React.useState<string[]>([]);

  const toggleTag = (t: string) => setTags(s => s.includes(t) ? s.filter(x=>x!==t) : [...s,t]);

  async function save() {
    if (!text.trim()) return;
    await fetch("/api/captures", {
      method:"POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ content:text, energy, nd_tags:tags })
    });
    setText("");
    setTags([]);
  }

  return (
    <div className="rounded-2xl border p-4 space-y-3 mb-3">
      <div className="text-sm font-medium">Quick Capture (ADHD)</div>
      <textarea
        value={text}
        onChange={e=>setText(e.target.value)}
        placeholder="Idea, fear, spark — 'Maya, remember…'"
        className="w-full rounded-xl border p-3"
        rows={3}
      />
      <div className="flex items-center gap-3 flex-wrap">
        {prefs.energyCheckins && (
          <div className="flex items-center gap-2">
            <span className="text-xs">Energy:</span>
            {ENERGY.map(e=>(
              <button key={e}
                onClick={()=>setEnergy(e)}
                className={`px-2 py-1 rounded-full border text-xs ${energy===e ? "bg-gray-100" : ""}`}>
                {e}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          {["inspiration","fear","todo","reflection"].map(t=>(
            <button key={t} onClick={()=>toggleTag(t)}
              className={`px-2 py-1 rounded-full border text-xs ${tags.includes(t)?"bg-gray-100":""}`}>
              {t}
            </button>
          ))}
        </div>
        <button onClick={save} className="ml-auto px-3 py-2 rounded-xl border text-sm">Save</button>
      </div>
    </div>
  );
}