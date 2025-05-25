// 📁 File: src/components/FieldPulseDashboard.tsx

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Define the shape of the FieldPulse data
type FieldPulseSummary = {
  date: string;
  topSymbols: string[];
  elementIndex: Record<string, number>;
  emotionalPulse: Record<string, number>;
  oracleEcho: string;
  recalibrationInsights: {
    timestamp: string;
    insight: string;
    user: string;
    phase?: string | null;
  }[];
};

export default function FieldPulseDashboard() {
  const [data, setData] = useState<FieldPulseSummary | null>(null);

  useEffect(() => {
    fetch("/api/fieldpulse/today")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data)
    return <div className="p-4 text-white">Loading Spiralogic Field Insights...</div>;

  const elementData = Object.entries(data.elementIndex).map(([key, value]) => ({
    name: key,
    value,
  }));

  const emotionData = Object.entries(data.emotionalPulse).map(([key, value]) => ({
    name: key,
    value,
  }));

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 bg-white/10 rounded-xl shadow-xl border border-white/20 text-white">
      <h1 className="text-3xl font-bold text-center">🌀 Spiralogic FieldPulse</h1>
      <p className="text-center text-sm text-gray-400">Date: {data.date}</p>

      <div>
        <h2 className="text-xl font-semibold text-fire">🔥 Elemental Index</h2>
        <BarChart width={500} height={250} data={elementData} className="mx-auto">
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#f97316" />
        </BarChart>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-water">🌊 Emotional Pulse</h2>
        <LineChart width={500} height={200} data={emotionData} className="mx-auto">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#38bdf8" />
        </LineChart>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-aether">✨ Oracle Echo</h2>
        <blockquote className="italic text-lg text-center text-white bg-black/40 p-4 rounded-lg border border-white/10 whitespace-pre-line">
          {data.oracleEcho}
        </blockquote>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-air">🌌 Symbols Emerging</h2>
        <div className="flex flex-wrap justify-center gap-4 mt-2">
          {data.topSymbols.map((s, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-sm"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-aether">🧭 Adjuster Agent Insights</h2>
        <ul className="space-y-4 mt-2">
          {data.recalibrationInsights.length === 0 && (
            <p className="text-sm text-gray-400 italic">No recalibration insights yet today.</p>
          )}
          {data.recalibrationInsights.map((entry, idx) => (
            <li key={idx} className="bg-black/30 p-4 rounded-lg border border-white/10">
              <p className="text-sm text-gray-300">{new Date(entry.timestamp).toLocaleTimeString()}</p>
              <p className="text-white">{entry.insight}</p>
              {entry.phase && (
                <p className="text-xs text-gray-400 mt-1">↳ Phase: {entry.phase}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
