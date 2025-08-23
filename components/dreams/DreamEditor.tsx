"use client";

import * as React from "react";
import { z } from "zod";
import { dreamsCreateSchema, dreamsUpdateSchema } from "@/app/api/dreams/schema";
import NightTimeline from "@/components/dreams/NightTimeline";
import { useFeature } from "@/hooks/useFeature";
import { handleMayaVoiceCue } from "@/lib/voice/maya-cues";

type DreamCreate = z.infer<typeof dreamsCreateSchema>;
type DreamUpdate = z.infer<typeof dreamsUpdateSchema>;

type Props = {
  /** If provided, editor loads & updates this dream; otherwise creates a new one */
  dreamId?: string;
  /** Optional initial value to pre-fill editor on first mount (e.g., fragment capture) */
  initial?: Partial<DreamCreate>;
  /** Called after a successful save */
  onSaved?: (dreamId: string) => void;
  /** Called after a successful weave (buckets received) */
  onWoven?: (dreamId: string, recapBuckets: any) => void;
};

const EMPTY_SEGMENT = () => ({
  start: "",
  end: "",
  title: "",
  notes: "",
  symbols: [] as string[],
  lucidity: null as number | null,
  emotion: null as string | null,
  technique: null as string | null,
});

const DEFAULT_FORM: DreamCreate = {
  date: new Date().toISOString().slice(0, 10), // yyyy-mm-dd
  title: "",
  overall_mood: "neutral",
  lucidity_level: 0,
  techniques: [],
  techniques_notes: "",
  segments: [EMPTY_SEGMENT()],
  notes: "",
};

export default function DreamEditor({
  dreamId,
  initial,
  onSaved,
  onWoven,
}: Props) {
  const feature = useFeature();
  const [loading, setLoading] = React.useState(false);
  const [weaving, setWeaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<DreamCreate>({ ...DEFAULT_FORM, ...initial });

  // Load existing dream (edit mode)
  React.useEffect(() => {
    let active = true;
    (async () => {
      if (!dreamId) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/dreams?id=${encodeURIComponent(dreamId)}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load dream (${res.status})`);
        const data = await res.json();
        if (active && data?.dream) {
          // Trust server shape to match zod; fallback to DEFAULT_FORM keys
          setForm((prev) => ({ ...prev, ...data.dream }));
        }
      } catch (e: any) {
        if (active) setError(e.message || "Could not load dream.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [dreamId]);

  // Local draft autosave (lightweight)
  const draftKey = React.useMemo(() => `dream-editor-draft:${dreamId ?? "new"}`, [dreamId]);
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw && !dreamId) {
        const parsed = JSON.parse(raw);
        setForm((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    const t = setInterval(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify(form));
      } catch {}
    }, 8000);
    return () => clearInterval(t);
  }, [draftKey, form]);

  // Helpers
  const update = <K extends keyof DreamCreate>(key: K, val: DreamCreate[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const updateSegment = (idx: number, patch: Partial<DreamCreate["segments"][number]>) =>
    setForm((f) => {
      const next = f.segments.slice();
      next[idx] = { ...next[idx], ...patch };
      return { ...f, segments: next };
    });

  const addSegment = () => setForm((f) => ({ ...f, segments: [...f.segments, EMPTY_SEGMENT()] }));
  const removeSegment = (idx: number) =>
    setForm((f) => ({ ...f, segments: f.segments.filter((_, i) => i !== idx) }));

  // Save (create or update)
  const onSave = async () => {
    setError(null);
    try {
      setLoading(true);
      const payload = dreamId
        ? (await dreamsUpdateSchema.parseAsync({ id: dreamId, ...form })) as DreamUpdate
        : (await dreamsCreateSchema.parseAsync(form)) as DreamCreate;

      const res = await fetch(dreamId ? `/api/dreams/${dreamId}` : `/api/dreams`, {
        method: dreamId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      const data = await res.json();
      const id = dreamId ?? data?.id;
      if (!id) throw new Error("Missing dream id after save.");
      localStorage.removeItem(draftKey);
      onSaved?.(id);

      // Soft voice cue ("saved") if voice is enabled
      if (feature.oracle?.voiceEnabled && feature.oracle?.mayaVoice) {
        handleMayaVoiceCue({
          context: "post-save-dream",
          text: "I'm holding this night for you. When you're ready, I can weave the meaning.",
          speak: true,
        }).catch(() => {});
      }
    } catch (e: any) {
      setError(e.message || "Could not save.");
    } finally {
      setLoading(false);
    }
  };

  // Weave
  const onWeave = async () => {
    setError(null);
    try {
      setWeaving(true);
      // Ensure we have an ID (save first if needed)
      let id = dreamId;
      if (!id) {
        const valid = await dreamsCreateSchema.parseAsync(form);
        const res = await fetch(`/api/dreams`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(valid),
        });
        if (!res.ok) throw new Error(`Save before weave failed (${res.status})`);
        const data = await res.json();
        id = data?.id;
        if (!id) throw new Error("Missing dream id after save.");
        localStorage.removeItem(draftKey);
        onSaved?.(id);
      }

      const res = await fetch(`/api/dreams/${id}/weave`, { method: "POST" });
      if (!res.ok) throw new Error(`Weave failed (${res.status})`);
      const data = await res.json(); // expect { recapBuckets, maya_voice_cue? }
      onWoven?.(id!, data?.recapBuckets);

      // Maya recap cue
      if (data?.maya_voice_cue) {
        await handleMayaVoiceCue(data.maya_voice_cue);
      } else if (feature.oracle?.voiceEnabled && feature.oracle?.mayaVoice) {
        await handleMayaVoiceCue({
          context: "post-weave-dream",
          text: "I've woven your night's patterns. Would you like these insights in today's reflection?",
          speak: true,
        });
      }
    } catch (e: any) {
      setError(e.message || "Could not weave.");
    } finally {
      setWeaving(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Dream Journal</h2>
        <div className="flex gap-2">
          <button
            onClick={onSave}
            disabled={loading}
            className="px-4 py-2 rounded-2xl shadow bg-black text-white disabled:opacity-50"
          >
            {loading ? "Saving…" : "Save"}
          </button>
          <button
            onClick={onWeave}
            disabled={weaving}
            className="px-4 py-2 rounded-2xl shadow bg-white border disabled:opacity-50"
          >
            {weaving ? "Weaving…" : "Weave This Night"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 text-red-800 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Basics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1">
          <label className="block text-xs text-gray-600 mb-1">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
            className="w-full rounded-xl border px-3 py-2"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs text-gray-600 mb-1">Title</label>
          <input
            type="text"
            value={form.title}
            placeholder="A thread of night…"
            onChange={(e) => update("title", e.target.value)}
            className="w-full rounded-xl border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Overall mood</label>
          <select
            value={form.overall_mood}
            onChange={(e) => update("overall_mood", e.target.value as any)}
            className="w-full rounded-xl border px-3 py-2"
          >
            <option value="very_negative">Very negative</option>
            <option value="negative">Negative</option>
            <option value="neutral">Neutral</option>
            <option value="positive">Positive</option>
            <option value="very_positive">Very positive</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Lucidity level</label>
          <input
            type="range"
            min={0}
            max={10}
            value={form.lucidity_level}
            onChange={(e) => update("lucidity_level", Number(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-500 mt-1">Level: {form.lucidity_level}</div>
        </div>
      </div>

      {/* Techniques */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Techniques</label>
        <div className="flex flex-wrap gap-2">
          {["galantamine", "wbtb", "reality_checks", "meditation"].map((t) => {
            const selected = form.techniques.includes(t);
            return (
              <button
                type="button"
                key={t}
                onClick={() =>
                  update(
                    "techniques",
                    selected
                      ? form.techniques.filter((x) => x !== t)
                      : [...form.techniques, t]
                  )
                }
                className={`px-3 py-1 rounded-2xl border ${
                  selected ? "bg-black text-white" : "bg-white"
                }`}
              >
                {labelForTechnique(t)}
              </button>
            );
          })}
        </div>
        <textarea
          placeholder="Dose/time notes (optional)…"
          value={form.techniques_notes ?? ""}
          onChange={(e) => update("techniques_notes", e.target.value)}
          className="w-full rounded-xl border px-3 py-2"
          rows={2}
        />
      </div>

      {/* Segments */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Segments</h3>
          <button onClick={addSegment} className="text-sm px-3 py-1 rounded-2xl border">
            + Add segment
          </button>
        </div>

        {form.segments.map((s, idx) => (
          <div key={idx} className="rounded-2xl border p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Start</label>
                <input
                  type="time"
                  value={s.start ?? ""}
                  onChange={(e) => updateSegment(idx, { start: e.target.value })}
                  className="w-full rounded-xl border px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">End</label>
                <input
                  type="time"
                  value={s.end ?? ""}
                  onChange={(e) => updateSegment(idx, { end: e.target.value })}
                  className="w-full rounded-xl border px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Title</label>
                <input
                  type="text"
                  value={s.title ?? ""}
                  onChange={(e) => updateSegment(idx, { title: e.target.value })}
                  className="w-full rounded-xl border px-3 py-2"
                  placeholder="Scene or moment"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Notes</label>
              <textarea
                rows={3}
                value={s.notes ?? ""}
                onChange={(e) => updateSegment(idx, { notes: e.target.value })}
                className="w-full rounded-xl border px-3 py-2"
                placeholder="What happened? Dialogue, sensations, symbols…"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {["calm","awe","fear","grief","joy","longing"].map((e) => (
                <Chip
                  key={e}
                  label={e}
                  active={s.emotion === e}
                  onClick={() => updateSegment(idx, { emotion: s.emotion === e ? null : e })}
                />
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {Array.isArray(s.symbols) && s.symbols.length > 0
                  ? `Symbols: ${s.symbols.join(", ")}`
                  : "Add symbols in notes with #tags (e.g., #bridge #ocean) — we'll pick them up."}
              </div>
              <button
                type="button"
                onClick={() => removeSegment(idx)}
                className="text-xs text-gray-600 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Freeform notes */}
      <div>
        <label className="block text-sm font-medium mb-1">Additional notes</label>
        <textarea
          rows={4}
          value={form.notes ?? ""}
          onChange={(e) => update("notes", e.target.value)}
          className="w-full rounded-2xl border px-3 py-2"
          placeholder="Anything else from the night or morning recall?"
        />
      </div>

      {/* Timeline preview */}
      {form.segments.length > 0 && (
        <div className="rounded-2xl border p-4">
          <NightTimeline
            date={form.date}
            segments={form.segments.map((s) => ({
              start: s.start || "",
              end: s.end || "",
              title: s.title || "",
              lucidity: s.lucidity ?? null,
              emotion: s.emotion ?? null,
            }))}
          />
        </div>
      )}
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded-2xl border text-sm ${
        active ? "bg-black text-white" : "bg-white"
      }`}
    >
      {label}
    </button>
  );
}

function labelForTechnique(key: string) {
  switch (key) {
    case "galantamine": return "Galantamine";
    case "wbtb": return "WBTB";
    case "reality_checks": return "Reality checks";
    case "meditation": return "Meditation";
    default: return key;
  }
}