import React, { useEffect, useRef } from "react";
import { WeeklyInsight, ElementalDistribution } from "@/lib/spiralogic/types/LongitudinalTypes";

interface WeeklySpiralProps {
  insight: WeeklyInsight;
  interactive?: boolean;
  className?: string;
}

// Elemental color mapping
const elementColors: Record<string, string> = {
  fire: "rgba(255, 87, 34, 0.8)",
  water: "rgba(33, 150, 243, 0.8)",
  earth: "rgba(139, 195, 74, 0.8)",
  air: "rgba(255, 235, 59, 0.8)",
  aether: "rgba(156, 39, 176, 0.8)",
};

const elementGradients: Record<string, string> = {
  fire: "from-red-500 to-orange-500",
  water: "from-blue-500 to-cyan-500",
  earth: "from-green-500 to-emerald-500",
  air: "from-yellow-400 to-amber-400",
  aether: "from-amber-500 to-indigo-500",
};

export const WeeklySpiral: React.FC<WeeklySpiralProps> = ({
  insight,
  interactive = false,
  className = ""
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, 400, 400);

    const centerX = 200, centerY = 200;

    // Draw spiral segments
    drawSpiralSegments(ctx, {
      center: { x: centerX, y: centerY },
      distribution: insight.elementalBalance,
      transitions: insight.facetProgression
    });

    // Draw growth arc path
    if (insight.spiralJourney?.points?.length > 0) {
      drawGrowthPath(ctx, insight.spiralJourney.points);
    }

    // Draw shadow markers
    if (insight.shadowWork?.length > 0) {
      drawShadowMarkers(ctx, insight.shadowWork, centerX, centerY);
    }

  }, [insight]);

  return (
    <div className={`weekly-spiral-container ${className}`}>
      <div className="bg-gradient-to-br from-amber-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6 shadow-xl">

        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-indigo-600 bg-clip-text text-transparent">
            {insight.theme || "Weekly Journey"}
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {new Date(insight.period.start).toLocaleDateString()} - {new Date(insight.period.end).toLocaleDateString()}
          </div>
        </div>

        {/* Spiral Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="mx-auto rounded-xl"
            style={{ maxWidth: "100%", height: "auto" }}
          />

          {/* Interactive overlay (Phase 2) */}
          {interactive && (
            <div className="absolute inset-0 cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
              <div className="flex items-center justify-center h-full">
                <span className="bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
                  Click to explore
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Elemental Balance */}
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Elemental Balance
          </h4>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(insight.elementalBalance).map(([element, weight]) => (
              <ElementBar key={element} element={element} weight={weight} />
            ))}
          </div>
        </div>

        {/* Growth Arc */}
        {insight.growthArc && (
          <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-xl">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Journey Arc
            </h4>
            <p className="text-gray-600 dark:text-gray-400 italic">
              {insight.growthArc.narrative}
            </p>
          </div>
        )}

        {/* Shadow Work */}
        {insight.shadowWork && insight.shadowWork.length > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 rounded-xl">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Shadow Themes
            </h4>
            <div className="flex flex-wrap gap-2">
              {insight.shadowWork.map((shadow, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                >
                  {shadow.theme} ({shadow.frequency}x)
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Integration Practice */}
        {insight.integrationPractice && (
          <div className={`mt-6 p-4 rounded-xl bg-gradient-to-r ${elementGradients[insight.integrationPractice.element] || elementGradients.aether} bg-opacity-10`}>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              This Week's Practice
            </h4>
            <div className="space-y-2">
              <p className="font-medium text-gray-800 dark:text-gray-200">
                {insight.integrationPractice.title}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {insight.integrationPractice.description}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Duration: {insight.integrationPractice.duration}
              </p>
            </div>
          </div>
        )}

        {/* Collective Resonance (Phase 2) */}
        {insight.collectiveResonance && (
          <div className="mt-6 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-center">
            <p className="text-sm text-amber-700 dark:text-amber-400">
              🌍 {insight.collectiveResonance.pattern} ({insight.collectiveResonance.prevalence}% of community)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Component for individual element bars
const ElementBar: React.FC<{ element: string; weight: number }> = ({ element, weight }) => {
  const icons: Record<string, string> = {
    fire: "🔥",
    water: "💧",
    earth: "🌍",
    air: "🌬️",
    aether: "✨"
  };

  return (
    <div className="flex flex-col items-center space-y-1">
      <span className="text-2xl" role="img" aria-label={element}>
        {icons[element] || "◆"}
      </span>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className="h-full transition-all duration-700 ease-out rounded-full"
          style={{
            width: `${weight}%`,
            backgroundColor: elementColors[element] || "#999"
          }}
        />
      </div>
      <span className="text-xs text-gray-600 dark:text-gray-400">
        {weight}%
      </span>
    </div>
  );
};

// Canvas drawing functions
function drawSpiralSegments(
  ctx: CanvasRenderingContext2D,
  config: {
    center: { x: number; y: number };
    distribution: ElementalDistribution;
    transitions?: any[];
  }
) {
  const { center, distribution } = config;

  let currentAngle = 0;
  const spiralGrowth = 8;
  const baseRadius = 30;

  // Draw each element as a spiral segment
  Object.entries(distribution).forEach(([element, percentage]) => {
    if (percentage === 0) return;

    const segmentAngle = (percentage / 100) * Math.PI * 4; // Two full rotations

    ctx.beginPath();
    ctx.strokeStyle = elementColors[element] || "#666";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";

    // Create spiral path
    for (let t = 0; t < segmentAngle; t += 0.02) {
      const actualAngle = currentAngle + t;
      const r = baseRadius + actualAngle * spiralGrowth;
      const x = center.x + r * Math.cos(actualAngle);
      const y = center.y + r * Math.sin(actualAngle);

      if (t === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
    currentAngle += segmentAngle;
  });
}

function drawGrowthPath(ctx: CanvasRenderingContext2D, points: any[]) {
  if (points.length < 2) return;

  ctx.beginPath();
  ctx.strokeStyle = "rgba(255, 215, 0, 0.6)"; // Golden path
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);

  points.forEach((point, i) => {
    const x = 200 + point.x;
    const y = 200 + point.y;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    // Draw point marker
    ctx.fillStyle = elementColors[point.element] || "#666";
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.stroke();
  ctx.setLineDash([]);
}

function drawShadowMarkers(ctx: CanvasRenderingContext2D, shadows: any[], centerX: number, centerY: number) {
  shadows.forEach((shadow, index) => {
    const angle = (index / shadows.length) * Math.PI * 2;
    const radius = 150;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    // Draw shadow marker
    ctx.fillStyle = "rgba(75, 0, 130, 0.4)";
    ctx.beginPath();
    ctx.arc(x, y, 5 + shadow.frequency * 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw connection to center
    ctx.strokeStyle = "rgba(75, 0, 130, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.stroke();
  });
}