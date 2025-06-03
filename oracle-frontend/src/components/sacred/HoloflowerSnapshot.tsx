// 📁 oracle-frontend/src/components/sacred/HoloflowerSnapshot.tsx

import React from 'react';

type PetalSnapshot = Record<string, number>;

interface HoloflowerSnapshotProps {
  /** 
   * An object mapping each petal name (string) to a numeric value (0–10).
   * E.g. { fire: 7, water: 4, earth: 5, air: 6, aether: 3 }
   */
  petals: PetalSnapshot;
}

/**
 * HoloflowerSnapshot
 *
 * Renders a simple radial “flower” where each petal name (key) and its numeric value (0–10)
 * are represented by a small circle placed at an angle around the center. The distance from
 * center corresponds to (value / 10). Petal labels are rendered just outside each circle.
 */
export const HoloflowerSnapshot: React.FC<HoloflowerSnapshotProps> = ({ petals }) => {
  // Convert the petals object into an array [name, value], sorted alphabetically by name
  const entries = Object.entries(petals).sort(([a], [b]) => a.localeCompare(b));
  const count = entries.length;

  // SVG dimensions
  const size = 200;
  const center = size / 2;

  // The “base radius” is where petals at value=0 will sit; max radius for value=10 is < size/2
  const baseRadius = 40;
  const maxExtra = 60; // so that baseRadius + maxExtra = 100 (nearly to edge)

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto"
      aria-label="Holoflower Snapshot"
    >
      {/* Optional: a faint circle at baseRadius */}
      <circle
        cx={center}
        cy={center}
        r={baseRadius}
        fill="none"
        stroke="#E5E7EB" /* tailwind-gray-200 */
        strokeWidth={1}
      />

      {entries.map(([petalName, petalValue], index) => {
        // Clamp to 0–10
        const clamped = Math.max(0, Math.min(petalValue, 10));
        // distance = baseRadius + (value/10)*maxExtra
        const r = baseRadius + (clamped / 10) * maxExtra;
        // angle in radians: start at -90° (straight up) then go clockwise
        const angleRad = ((index * 360) / count - 90) * (Math.PI / 180);
        // coordinates for the petal circle
        const x = center + r * Math.cos(angleRad);
        const y = center + r * Math.sin(angleRad);

        // Coordinates for the label: slightly further out from the circle
        const labelR = baseRadius + maxExtra + 12; // 12px outside
        const labelX = center + labelR * Math.cos(angleRad);
        const labelY = center + labelR * Math.sin(angleRad);

        return (
          <g key={petalName}>
            {/* The petal’s circle */}
            <circle
              cx={x}
              cy={y}
              r={8} // fixed circle radius
              fill="#F87171" /* tailwind-red-400 (you can choose any color) */
              opacity={0.8}
            />
            {/* Petal label */}
            <text
              x={labelX}
              y={labelY}
              fontSize="10"
              fill="#6B7280" /* tailwind-gray-500 */
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {petalName}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
