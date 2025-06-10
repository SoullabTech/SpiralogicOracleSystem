'use client';

// --- File: frontend/src/app/dashboard/page.tsx - Integrated View ---

import React, { useState, useEffect } from "react";
import { getInsights } from "@/lib/api";
import { downloadCSV } from "@/lib/utils";
import { CalendarDateRangePicker } from "@/components/ui/CalendarDateRangePicker";
import InsightTable from "@/components/dashboard/InsightTable";
import SummaryStats from "@/components/dashboard/SummaryStats";
import PhaseTimeline from "@/components/dashboard/PhaseTimeline";
import ThemeToggle from "@/components/ui/ThemeToggle";
import ElementalThemeSwitcher from "@/components/ui/ElementalThemeSwitcher";

export default function DashboardPage() {
  const [insights, setInsights] = useState([]);
  const [filteredInsights, setFilteredInsights] = useState([]);
  const [keywordFilter, setKeywordFilter] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);

  useEffect(() => {
    async function fetchInsights() {
      const data = await getInsights();
      setInsights(data);
      setFilteredInsights(data);
    }
    fetchInsights();
  }, []);

  useEffect(() => {
    let filtered = insights;
    if (keywordFilter)
      filtered = filtered.filter((i) =>
        i.keywords.some((k) => k.includes(keywordFilter))
      );
    if (phaseFilter)
      filtered = filtered.filter((i) => i.detected_phase === phaseFilter);
    if (dateRange[0] && dateRange[1]) {
      filtered = filtered.filter((i) => {
        const d = new Date(i.created_at);
        return d >= dateRange[0] && d <= dateRange[1];
      });
    }
    setFilteredInsights(filtered);
  }, [keywordFilter, phaseFilter, dateRange, insights]);

  const totalEntries = filteredInsights.length;
  const avgIntensity =
    filteredInsights.reduce((sum, i) => sum + i.emotional_intensity, 0) /
    (totalEntries || 1);
  const allKeywords = filteredInsights.flatMap(i => i.keywords);
  const keywordCounts = allKeywords.reduce((acc, k) => {
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const topKeywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k]) => k);

  try {
    return (
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Spiralogic Journal Insights</h1>
          <div className="flex gap-4">
            <ThemeToggle />
            <ElementalThemeSwitcher />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Filter by keyword..."
            value={keywordFilter}
            onChange={(e) => setKeywordFilter(e.target.value)}
            className="border px-2 py-1 rounded shadow"
          />
          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            className="border px-2 py-1 rounded shadow"
          >
            <option value="">All Phases</option>
            <option value="Initiation">Initiation</option>
            <option value="Grounding">Grounding</option>
            <option value="Collaboration">Collaboration</option>
            <option value="Transformation">Transformation</option>
            <option value="Completion">Completion</option>
          </select>
          <CalendarDateRangePicker value={dateRange} onChange={setDateRange} />
          <button
            onClick={() => downloadCSV(filteredInsights)}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow"
          >
            Export CSV
          </button>
        </div>

        <SummaryStats
          totalEntries={totalEntries}
          avgIntensity={avgIntensity}
          topKeywords={topKeywords}
        />

        <InsightTable insights={filteredInsights} />

        <PhaseTimeline entries={filteredInsights.map(i => ({
          date: i.created_at,
          phase: i.detected_phase,
          keywords: i.keywords,
          element: i.detected_phase // Optionally map to an elemental identity
        }))} />
      </div>
    );
  } catch (error) {
    console.error("Dashboard error:", error);
    throw error;
  }
}