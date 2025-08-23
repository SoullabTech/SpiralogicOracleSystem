"use client";
import { useState } from "react";
import { RecapView } from "@/components/recap/RecapView";
import { useWhispers } from "@/hooks/useWhispers";
import Whispers from "@/components/recap/Whispers";
import QuickCapture from "@/components/micro/QuickCapture";
import type { Element } from "@/lib/recap/types";

// Mock recap buckets for testing contextual ranking
const mockScenarios = {
  creative: [
    { element: "fire" as const, titles: ["New project inspiration", "Creative breakthrough"], keywords: ["design", "innovation", "art"] },
    { element: "air" as const, titles: ["Ideas flowing"], keywords: ["concept", "vision", "possibility"] },
  ],
  worries: [
    { element: "water" as const, titles: ["Processing concerns", "Emotional release"], keywords: ["anxiety", "fear", "uncertainty"] },
    { element: "earth" as const, titles: ["Ground and center"], keywords: ["stability", "foundation", "secure"] },
  ],
  planning: [
    { element: "earth" as const, titles: ["Next steps clear", "Action items"], keywords: ["todo", "plan", "organize"] },
    { element: "air" as const, titles: ["Strategy forming"], keywords: ["approach", "method", "system"] },
  ],
  mixed: [
    { element: "fire" as const, titles: ["Energy rising"], keywords: ["motivation", "drive"] },
    { element: "water" as const, titles: ["Emotions flowing"], keywords: ["feeling", "intuition"] },
    { element: "earth" as const, titles: ["Grounding practice"], keywords: ["practical", "concrete"] },
    { element: "air" as const, titles: ["Mental clarity"], keywords: ["thought", "insight"] },
  ]
} as const;

export default function ContextualWhispersDemo() {
  const [selectedScenario, setSelectedScenario] = useState<keyof typeof mockScenarios>("mixed");
  const currentBuckets = mockScenarios[selectedScenario];
  const { whispers, loading } = useWhispers(currentBuckets, { limit: 8 });

  const mockRecapSource = {
    mode: "props" as const,
    buckets: {
      themes: currentBuckets.flatMap(b => b.titles ?? []),
      emotions: currentBuckets.filter(b => b.element === "Water").flatMap(b => b.keywords ?? []),
      steps: currentBuckets.filter(b => b.element === "Earth").flatMap(b => b.keywords ?? []),
      ideas: currentBuckets.filter(b => b.element === "Air").flatMap(b => b.keywords ?? []),
      energy: currentBuckets.filter(b => b.element === "Fire").flatMap(b => b.keywords ?? [])
    },
    userQuote: "These contextual whispers feel perfectly timed."
  };

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-ink-100">Contextual Whispers Demo</h1>
        <p className="text-ink-300">
          This demonstrates how micro-memories are intelligently ranked based on recap context.
          Change scenarios to see how different bucket themes surface different whispers.
        </p>
      </div>

      {/* Quick Capture */}
      <div className="space-y-2">
        <h2 className="text-lg font-medium text-ink-100">Capture Some Thoughts First</h2>
        <p className="text-sm text-ink-400">
          Try capturing thoughts with different tags: "inspiration", "fear", "todo", "reflection"
        </p>
        <QuickCapture />
      </div>

      {/* Scenario Selector */}
      <div className="space-y-3">
        <h2 className="text-lg font-medium text-ink-100">Test Different Recap Contexts</h2>
        <div className="flex gap-2 flex-wrap">
          {Object.keys(mockScenarios).map((scenario) => (
            <button
              key={scenario}
              onClick={() => setSelectedScenario(scenario as keyof typeof mockScenarios)}
              className={`px-3 py-2 rounded-lg border text-sm ${
                selectedScenario === scenario 
                  ? "bg-gold-400 text-bg-900 border-gold-400" 
                  : "bg-edge-700 text-ink-200 border-edge-600 hover:bg-edge-600"
              }`}
            >
              {scenario.charAt(0).toUpperCase() + scenario.slice(1)}
            </button>
          ))}
        </div>
        <div className="text-xs text-ink-400">
          <strong>Current context:</strong> {currentBuckets.map(b => `${b.element} (${b.keywords?.join(", ")})`).join(" • ")}
        </div>
      </div>

      {/* Contextual Whispers */}
      <div className="space-y-2">
        <h2 className="text-lg font-medium text-ink-100">Contextual Whispers</h2>
        {loading ? (
          <div className="text-ink-300">Ranking whispers for current context...</div>
        ) : (
          <Whispers 
            whispers={whispers} 
            onUse={(w) => {
              console.log("Selected whisper:", w.id, "Score:", w.score, "Reason:", w.reason);
              // You could trigger Maya cue here
            }} 
          />
        )}
      </div>

      {/* Full Recap with Whispers */}
      <div className="space-y-2">
        <h2 className="text-lg font-medium text-ink-100">Complete Recap View</h2>
        <RecapView source={mockRecapSource} whispers={whispers?.map(w => ({
          id: w.id,
          content: w.text,
          tags: w.tags as string[],
          energy: w.energy_level,
          created_at: w.created_at,
          element: w.element || "air"
        })) ?? []} />
      </div>

      <div className="rounded-2xl border border-edge-700 bg-bg-900 p-4">
        <h3 className="font-medium text-ink-100 mb-2">Contextual Intelligence Features:</h3>
        <ul className="text-sm space-y-1 text-ink-300">
          <li>• <strong>Element matching:</strong> Whispers with elements that appear in current recap get boosted</li>
          <li>• <strong>Keyphrase overlap:</strong> Memories containing recap keywords score higher</li>
          <li>• <strong>Tag weighting:</strong> Fear (1.0) > inspiration (0.9) > todo (0.85) > reflection (0.8)</li>
          <li>• <strong>Recency decay:</strong> Newer memories score higher, with gentle 3-day decay</li>
          <li>• <strong>Recall timing:</strong> Due recalls get 25% boost</li>
          <li>• <strong>Transparency:</strong> Each whisper shows its score and reasoning</li>
        </ul>
      </div>
    </main>
  );
}