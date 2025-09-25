import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Flame, Droplets, Leaf, Wind } from "lucide-react";

interface WeeklySummary {
  id: string;
  start_date: string;
  end_date: string;
  dominant_elements: string[];
  arc_transitions: string[];
  regression_events: number;
  breakthroughs: number;
  avg_trust_level: number;
  weekly_theme: string;
  key_reflections: string[];
  archetypal_journey: string;
}

const elementIcons: Record<string, JSX.Element> = {
  fire: <Flame className="h-4 w-4 text-red-500" />,
  water: <Droplets className="h-4 w-4 text-blue-500" />,
  earth: <Leaf className="h-4 w-4 text-green-600" />,
  air: <Wind className="h-4 w-4 text-gray-400" />,
  aether: <Sparkles className="h-4 w-4 text-amber-500" />,
};

export default function WeeklySpiralSummary() {
  const [summaries, setSummaries] = useState<WeeklySummary[]>([]);

  useEffect(() => {
    async function fetchSummaries() {
      const res = await fetch("/api/user/weekly-summaries");
      const data = await res.json();
      setSummaries(data);
    }
    fetchSummaries();
  }, []);

  return (
    <div className="space-y-6">
      {summaries.map((summary) => (
        <Card
          key={summary.id}
          className="bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 shadow-lg rounded-2xl border border-slate-700"
        >
          <CardContent className="p-6 space-y-4">
            <header className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                Week of {summary.start_date} → {summary.end_date}
              </h2>
              <div className="flex gap-2">
                {summary.dominant_elements.map((el) => (
                  <Badge
                    key={el}
                    variant="outline"
                    className="flex items-center gap-1 bg-slate-700/40 border-slate-600"
                  >
                    {elementIcons[el] || null}
                    {el}
                  </Badge>
                ))}
              </div>
            </header>

            <p className="text-xl italic text-sky-300">
              "{summary.weekly_theme}"
            </p>

            <div>
              <h3 className="text-sm uppercase text-slate-400">
                Key Reflections
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-slate-200">
                {summary.key_reflections.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm uppercase text-slate-400">
                Archetypal Journey
              </h3>
              <p className="text-slate-100 leading-relaxed">
                {summary.archetypal_journey}
              </p>
            </div>

            <footer className="flex justify-between text-xs text-slate-400">
              <span>
                Arcs: {summary.arc_transitions.join(" → ")}
              </span>
              <span>
                🌑 {summary.regression_events} regressions | ✨{" "}
                {summary.breakthroughs} breakthroughs
              </span>
              <span>
                Trust: {(summary.avg_trust_level * 100).toFixed(0)}%
              </span>
            </footer>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}