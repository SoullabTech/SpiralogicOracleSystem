"use client";
import React, { useState } from "react";

export default function QuickCapture() {
  const [text, setText] = useState("");
  const [energy, setEnergy] = useState<"low"|"medium"|"high">("medium");
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggleTag = (t: string) =>
    setTags((prev) => prev.includes(t) ? prev.filter(x=>x!==t) : [...prev, t]);

  async function save() {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/micro-memories", {
        method:"POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ content: text, tags, energy }),
      });
      if (res.ok) {
        setText(""); setTags([]);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border p-4 space-y-3">
      <textarea
        className="w-full rounded-xl border p-2"
        placeholder="Quick capture — idea, spark, fear..."
        value={text}
        onChange={(e)=>setText(e.target.value)}
        rows={2}
      />
      <div className="flex gap-2 flex-wrap text-sm">
        {["inspiration","fear","todo","reflection"].map((t)=>(
          <button key={t} onClick={()=>toggleTag(t)}
            className={`px-2 py-1 rounded-full border ${tags.includes(t)?"bg-gray-100":""}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span>Energy:</span>
        {["low","medium","high"].map((e)=>(
          <button key={e} onClick={()=>setEnergy(e as any)}
            className={`px-2 py-1 rounded-full border ${energy===e?"bg-gray-200":""}`}>
            {e}
          </button>
        ))}
      </div>
      <button onClick={save} disabled={saving}
        className="mt-2 px-3 py-2 rounded-xl border bg-white">
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}