// --- File: frontend/src/components/dashboard/SummaryStats.tsx ---

import React from "react";

interface SummaryStatsProps {
  totalEntries: number;
  avgIntensity: number;
  topKeywords: string[];
}

const SummaryStats: React.FC<SummaryStatsProps> = ({ totalEntries, avgIntensity, topKeywords }) => {
  return (
    <div className="bg-white shadow rounded-2xl p-4 mb-6">
      <h2 className="text-xl font-bold mb-2">Summary Stats</h2>
      <p>Total Journal Entries: <span className="font-medium">{totalEntries}</span></p>
      <p>Avg. Emotional Intensity: <span className="font-medium">{avgIntensity.toFixed(2)}</span></p>
      <p>Top Keywords: <span className="font-medium">{topKeywords.join(", ")}</span></p>
    </div>
  );
};

export default SummaryStats;


// --- File: frontend/src/components/dashboard/ElementalTag.tsx ---

import React from "react";

interface ElementalTagProps {
  element: string;
}

const colorMap: Record<string, string> = {
  fire: "bg-red-100 text-red-800",
  water: "bg-blue-100 text-blue-800",
  earth: "bg-green-100 text-green-800",
  air: "bg-yellow-100 text-yellow-800",
  aether: "bg-purple-100 text-purple-800",
};

const ElementalTag: React.FC<ElementalTagProps> = ({ element }) => {
  const style = colorMap[element.toLowerCase()] || "bg-gray-100 text-gray-700";
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${style}`}>{element}</span>
  );
};

export default ElementalTag;


// --- File: frontend/src/components/dashboard/PhaseTimeline.tsx ---

import React from "react";
import ElementalTag from "./ElementalTag";

interface PhaseEntry {
  date: string;
  phase: string;
  keywords: string[];
  element?: string;
}

interface PhaseTimelineProps {
  entries: PhaseEntry[];
}

const PhaseTimeline: React.FC<PhaseTimelineProps> = ({ entries }) => {
  return (
    <div className="bg-white shadow rounded-2xl p-4 mb-6">
      <h2 className="text-xl font-bold mb-4">Journal Phase Timeline</h2>
      <ul className="space-y-4">
        {entries.map((entry, index) => (
          <li key={index} className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-2">
            <div>
              <p className="text-sm text-gray-500">{new Date(entry.date).toLocaleDateString()}</p>
              <p className="font-medium text-gray-900">{entry.phase}</p>
              <p className="text-xs text-gray-600 mt-1">Keywords: {entry.keywords.join(", ")}</p>
            </div>
            {entry.element && (
              <div className="mt-2 md:mt-0">
                <ElementalTag element={entry.element} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PhaseTimeline;
