import React, { useState } from "react";
import { EdgePanel } from "./EdgePanel";
import { WeeklySpiralPlaceholder } from "./placeholders/WeeklySpiralPlaceholder";
import { DailyPracticePlaceholder } from "./placeholders/DailyPracticePlaceholder";
import { DivinationPlaceholder } from "./placeholders/DivinationPlaceholder";
import { PatternVisualizerPlaceholder } from "./placeholders/PatternVisualizerPlaceholder";
import { useFeatureFlag } from "@/lib/hooks/useFeatureFlag";

type Edge = "top" | "bottom" | "left" | "right";

interface EdgePanelSystemProps {
  className?: string;
}

export const EdgePanelSystem: React.FC<EdgePanelSystemProps> = ({ className }) => {
  const [activePanel, setActivePanel] = useState<Edge | null>(null);
  const edgePanelsEnabled = useFeatureFlag("EDGE_PANELS");

  // Return null if feature is disabled
  if (!edgePanelsEnabled) {
    return null;
  }

  const handlePanelToggle = (edge: Edge) => (isOpen: boolean) => {
    if (isOpen) {
      // Close other panels when opening a new one
      setActivePanel(edge);
    } else if (activePanel === edge) {
      setActivePanel(null);
    }
  };

  return (
    <div className={className}>
      {/* Top Panel: History & Journey */}
      <EdgePanel
        edge="top"
        title="Your Journey"
        isOpen={activePanel === "top"}
        onToggle={handlePanelToggle("top")}
      >
        <div className="space-y-6">
          <div className="text-center text-gray-600 dark:text-gray-400 mb-4">
            <p className="text-sm">Track your transformation across time</p>
          </div>
          <WeeklySpiralPlaceholder />
        </div>
      </EdgePanel>

      {/* Bottom Panel: Daily Practice & Check-ins */}
      <EdgePanel
        edge="bottom"
        title="Daily Practice"
        isOpen={activePanel === "bottom"}
        onToggle={handlePanelToggle("bottom")}
      >
        <div className="space-y-6">
          <div className="text-center text-gray-600 dark:text-gray-400 mb-4">
            <p className="text-sm">Elemental check-ins and integration practices</p>
          </div>
          <DailyPracticePlaceholder />
        </div>
      </EdgePanel>

      {/* Left Panel: Divination & Oracle Tools */}
      <EdgePanel
        edge="left"
        title="Oracle Tools"
        isOpen={activePanel === "left"}
        onToggle={handlePanelToggle("left")}
      >
        <div className="space-y-6">
          <div className="text-center text-gray-600 dark:text-gray-400 mb-4">
            <p className="text-sm">Tarot, I Ching, and ritual guidance</p>
          </div>
          <DivinationPlaceholder />
        </div>
      </EdgePanel>

      {/* Right Panel: Patterns & Statistics */}
      <EdgePanel
        edge="right"
        title="Your Patterns"
        isOpen={activePanel === "right"}
        onToggle={handlePanelToggle("right")}
      >
        <div className="space-y-6">
          <div className="text-center text-gray-600 dark:text-gray-400 mb-4">
            <p className="text-sm">Elemental balance and growth tracking</p>
          </div>
          <PatternVisualizerPlaceholder />
        </div>
      </EdgePanel>
    </div>
  );
};