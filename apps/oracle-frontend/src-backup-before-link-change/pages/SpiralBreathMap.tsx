import React from 'react';
import { SpiralJourney } from '../types/spiralJourney';

interface SpiralBreathMapProps {
  journey: SpiralJourney;
}

const SpiralBreathMap: React.FC<SpiralBreathMapProps> = ({ journey }) => {
  const radius = 250; // Radius of Spiral
  const centerX = 300; // Center X of Canvas
  const centerY = 300; // Center Y of Canvas

  return (
    <svg width="600" height="600">
      {/* Draw Spiral Path */}
      <path
        d={`M${centerX},${centerY} Q${centerX + radius},${centerY + radius} L${centerX + radius * 1.5},${centerY + radius * 1.5}`}
        fill="none"
        stroke="lightgray"
        strokeWidth="2"
      />

      {/* Draw Breath Stars */}
      {journey.breaths.map((breath, index) => {
        const angle = (index / journey.breaths.length) * 2 * Math.PI;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r="6"
            fill={getElementColor(breath.element)}
            title={`Breath: ${breath.element} - ${breath.timestamp}`} // Tooltip with summary
          />
        );
      })}

      {/* Optional: Add Threshold Nodes */}
      {journey.thresholds.map((threshold, index) => (
        <circle
          key={index}
          cx={centerX + threshold.x}
          cy={centerY + threshold.y}
          r="10"
          fill="gold"
          title={`Threshold Crossed: ${threshold.from} ➔ ${threshold.to}`}
        />
      ))}

      {/* Optional: Add Elemental Flow Ribbons */}
      {journey.elementalFlows.map((flow, index) => (
        <line
          key={index}
          x1={flow.startX}
          y1={flow.startY}
          x2={flow.endX}
          y2={flow.endY}
          stroke={getElementColor(flow.element)}
          strokeWidth="2"
          strokeDasharray="5,5"
        />
      ))}
    </svg>
  );
};

function getElementColor(element: string): string {
  switch (element) {
    case 'Fire':
      return 'red';
    case 'Water':
      return 'blue';
    case 'Earth':
      return 'green';
    case 'Air':
      return 'yellow';
    case 'Aether':
      return 'purple';
    default:
      return 'gray';
  }
}

export default SpiralBreathMap;
