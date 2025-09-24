'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface HoloflowerSnapshotProps {
  facets: Array<{
    code: string;
    name: string;
    element: string;
    value: number;
    angle: number;
    color: string;
  }>;
  coherence: number;
  timestamp: string;
  size?: 'small' | 'medium' | 'large';
  showLabels?: boolean;
}

export function HoloflowerSnapshot({
  facets,
  coherence,
  timestamp,
  size = 'medium',
  showLabels = false
}: HoloflowerSnapshotProps) {

  const dimensions = {
    small: { width: 150, height: 150, radius: 50 },
    medium: { width: 250, height: 250, radius: 80 },
    large: { width: 400, height: 400, radius: 140 }
  };

  const { width, height, radius } = dimensions[size];
  const centerX = width / 2;
  const centerY = height / 2;

  // Calculate petal position
  const getPetalPosition = (angle: number, value: number) => {
    const adjustedRadius = radius * (0.3 + (value / 10) * 0.7);
    const radians = (angle - 90) * Math.PI / 180;
    return {
      x: centerX + adjustedRadius * Math.cos(radians),
      y: centerY + adjustedRadius * Math.sin(radians)
    };
  };

  // Generate SVG path for petal shape
  const createPetalPath = (facet: any) => {
    const pos = getPetalPosition(facet.angle, facet.value);
    const petalSize = (facet.value / 10) * (radius * 0.3);

    // Create a teardrop/petal shape
    return `
      M ${centerX} ${centerY}
      Q ${pos.x - petalSize/2} ${pos.y - petalSize/2} ${pos.x} ${pos.y}
      Q ${pos.x + petalSize/2} ${pos.y + petalSize/2} ${centerX} ${centerY}
    `;
  };

  // Element colors
  const elementColors = {
    air: '#87CEEB',
    fire: '#FF6B6B',
    water: '#4A90E2',
    earth: '#8B7355',
    aether: '#9B59B6'
  };

  return (
    <div className="holoflower-snapshot" style={{ width, height }}>
      <svg
        width={width}
        height={height}
        className="rounded-lg"
        style={{ background: 'radial-gradient(circle, rgba(139,69,255,0.05) 0%, rgba(0,0,0,0.2) 100%)' }}
      >
        {/* Outer ring */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />

        {/* Inner rings for visual guidance */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius * 0.66}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={radius * 0.33}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />

        {/* Center core */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius * 0.15}
          fill="url(#centerGradient)"
          opacity="0.6"
        />

        {/* Petals */}
        {facets.map((facet, index) => {
          const position = getPetalPosition(facet.angle, facet.value);
          const petalRadius = (facet.value / 10) * (radius * 0.25) + 8;

          return (
            <g key={facet.code}>
              {/* Connection line from center to petal */}
              <line
                x1={centerX}
                y1={centerY}
                x2={position.x}
                y2={position.y}
                stroke={facet.color || elementColors[facet.element as keyof typeof elementColors]}
                strokeWidth="1"
                opacity="0.3"
              />

              {/* Petal circle */}
              <circle
                cx={position.x}
                cy={position.y}
                r={petalRadius}
                fill={facet.color || elementColors[facet.element as keyof typeof elementColors]}
                opacity={0.4 + (facet.value / 10) * 0.4}
              />

              {/* Value indicator */}
              {size !== 'small' && (
                <text
                  x={position.x}
                  y={position.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize={size === 'large' ? '12' : '10'}
                  fontWeight="500"
                >
                  {facet.value.toFixed(1)}
                </text>
              )}

              {/* Facet label */}
              {showLabels && size === 'large' && (
                <text
                  x={position.x}
                  y={position.y + petalRadius + 12}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.6)"
                  fontSize="10"
                >
                  {facet.code}
                </text>
              )}
            </g>
          );
        })}

        {/* Gradient definitions */}
        <defs>
          <radialGradient id="centerGradient">
            <stop offset="0%" stopColor="#9B59B6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#6B46C1" stopOpacity="0.3" />
          </radialGradient>
        </defs>
      </svg>

      {/* Metadata overlay */}
      {size !== 'small' && (
        <div className="mt-2 text-center">
          <div className="text-xs text-white/60">
            {new Date(timestamp).toLocaleDateString()} • Coherence: {Math.round(coherence * 100)}%
          </div>
        </div>
      )}
    </div>
  );
}

// Component to render snapshot as data URL for saving
export function generateSnapshotDataURL(facets: any[], coherence: number): string {
  const width = 250;
  const height = 250;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 80;

  const elementColors: Record<string, string> = {
    air: '#87CEEB',
    fire: '#FF6B6B',
    water: '#4A90E2',
    earth: '#8B7355',
    aether: '#9B59B6'
  };

  let svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#0a0a0a"/>
      <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
      <circle cx="${centerX}" cy="${centerY}" r="${radius * 0.15}" fill="rgba(155,89,182,0.6)"/>
  `;

  facets.forEach((facet) => {
    const adjustedRadius = radius * (0.3 + (facet.value / 10) * 0.7);
    const radians = (facet.angle - 90) * Math.PI / 180;
    const x = centerX + adjustedRadius * Math.cos(radians);
    const y = centerY + adjustedRadius * Math.sin(radians);
    const petalRadius = (facet.value / 10) * (radius * 0.25) + 8;
    const color = elementColors[facet.element] || '#999';

    svg += `
      <line x1="${centerX}" y1="${centerY}" x2="${x}" y2="${y}" stroke="${color}" stroke-width="1" opacity="0.3"/>
      <circle cx="${x}" cy="${y}" r="${petalRadius}" fill="${color}" opacity="${0.4 + (facet.value / 10) * 0.4}"/>
      <text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="10" font-weight="500">
        ${facet.value.toFixed(1)}
      </text>
    `;
  });

  svg += '</svg>';

  // Convert SVG to data URL
  const encoded = encodeURIComponent(svg);
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}