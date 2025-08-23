"use client";
import { useState } from "react";

export default function CostSimulator() {
  const [input, setInput] = useState({
    users: 100,
    sessionsPerDay: 2,
    minutesPerSession: 10,
    gpuCostPerHour: 3.0,
    coldStartSeconds: 45,
    warmSecondsPerMinuteAudio: 0.2,
  });
  const [out, setOut] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    const res = await fetch("/api/cost/simulator", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    setOut(await res.json());
    setLoading(false);
  }

  const f = (k: string, v: string) =>
    setInput((s) => ({ ...s, [k]: Number(v) }));

  return (
    <div className="max-w-xl mx-auto p-6 rounded-2xl shadow bg-white">
      <h2 className="text-xl font-semibold mb-4">Maya TTS Cost Simulator</h2>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col text-sm">
          Users
          <input className="border rounded p-2"
            type="number" value={input.users}
            onChange={(e) => f("users", e.target.value)} />
        </label>
        <label className="flex flex-col text-sm">
          Sessions / day
          <input className="border rounded p-2"
            type="number" value={input.sessionsPerDay}
            onChange={(e) => f("sessionsPerDay", e.target.value)} />
        </label>
        <label className="flex flex-col text-sm">
          Minutes / session
          <input className="border rounded p-2"
            type="number" value={input.minutesPerSession}
            onChange={(e) => f("minutesPerSession", e.target.value)} />
        </label>
        <label className="flex flex-col text-sm">
          GPU $/hour
          <input className="border rounded p-2"
            type="number" step="0.01" value={input.gpuCostPerHour}
            onChange={(e) => f("gpuCostPerHour", e.target.value)} />
        </label>
        <label className="flex flex-col text-sm">
          Cold start (sec)
          <input className="border rounded p-2"
            type="number" value={input.coldStartSeconds}
            onChange={(e) => f("coldStartSeconds", e.target.value)} />
        </label>
        <label className="flex flex-col text-sm">
          GPU sec / audio min
          <input className="border rounded p-2"
            type="number" step="0.01" value={input.warmSecondsPerMinuteAudio}
            onChange={(e) => f("warmSecondsPerMinuteAudio", e.target.value)} />
        </label>
      </div>

      <button
        className="mt-4 px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        onClick={run}
        disabled={loading}
      >
        {loading ? "Calculating…" : "Calculate"}
      </button>

      {out && (
        <div className="mt-4 text-sm">
          <div>Per user / month: <b>${out.perUserMonthly}</b></div>
          <div>Total / month: <b>${out.totalMonthly}</b></div>
          <div className="mt-2 opacity-70">
            GPU hours: {out.details.gpuHours}h · Warm: {out.details.warmSeconds}s · Cold: {out.details.coldSeconds}s
          </div>
        </div>
      )}
    </div>
  );
}