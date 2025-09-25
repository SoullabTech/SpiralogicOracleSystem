// MiniHoloflower - Compact visualization for journey timeline
import React, { useMemo } from 'react';
import { SPIRALOGIC_FACETS_COMPLETE, AETHER_DYNAMICS } from '@/data/spiralogic-facets-complete';

interface MiniHoloflowerProps {
  activeFacetId?: string;
  aetherState?: 'synthesis' | 'void' | 'transcendence' | null;
  checkIns?: Record<string, number>;
  size?: number;
  showLabel?: boolean;
  timestamp?: string;
  onClick?: () => void;
  isHighlighted?: boolean;
}

export const MiniHoloflower: React.FC<MiniHoloflowerProps> = ({
  activeFacetId,
  aetherState,
  checkIns = {},
  size = 64,
  showLabel = false,
  timestamp,
  onClick,
  isHighlighted = false
}) => {
  // Calculate dominant elements from check-ins
  const dominantElements = useMemo(() => {
    const elementStrengths: Record<string, number> = {
      fire: 0, water: 0, earth: 0, air: 0
    };

    Object.entries(checkIns).forEach(([facetId, intensity]) => {
      const facet = SPIRALOGIC_FACETS_COMPLETE.find(f => f.id === facetId);
      if (facet && facet.element !== 'aether') {
        elementStrengths[facet.element] += intensity;
      }
    });

    return Object.entries(elementStrengths)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([element]) => element);
  }, [checkIns]);

  // Get colors for active facet
  const activeFacet = SPIRALOGIC_FACETS_COMPLETE.find(f => f.id === activeFacetId);
  const primaryColor = activeFacet?.color.base || '#999';
  const glowColor = activeFacet?.color.glow || '#ccc';

  // Aether colors
  const aetherColor = aetherState 
    ? AETHER_DYNAMICS[aetherState].color.base 
    : 'transparent';

  const centerRadius = size * 0.15;
  const innerRadius = size * 0.25;
  const outerRadius = size * 0.45;

  return (
    <div 
      className={`mini-holoflower-container relative cursor-pointer transition-all duration-300
        ${isHighlighted ? 'scale-110 z-10' : 'hover:scale-105'}
        ${onClick ? 'clickable' : ''}`}
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          {/* Gradient for center aether */}
          <radialGradient id={`mini-aether-${timestamp}`}>
            <stop offset="0%" stopColor={aetherColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor={aetherColor} stopOpacity="0.1" />
          </radialGradient>

          {/* Glow filter */}
          <filter id={`mini-glow-${timestamp}`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={outerRadius}
          fill="#f9f9f9"
          stroke="#e0e0e0"
          strokeWidth="0.5"
        />

        {/* Simplified 12 wedges */}
        {SPIRALOGIC_FACETS_COMPLETE.map((facet, i) => {
          const angleStart = (i * Math.PI * 2) / 12 - Math.PI / 2;
          const angleEnd = ((i + 1) * Math.PI * 2) / 12 - Math.PI / 2;
          
          const x1 = size / 2 + Math.cos(angleStart) * innerRadius;
          const y1 = size / 2 + Math.sin(angleStart) * innerRadius;
          const x2 = size / 2 + Math.cos(angleStart) * outerRadius;
          const y2 = size / 2 + Math.sin(angleStart) * outerRadius;
          const x3 = size / 2 + Math.cos(angleEnd) * outerRadius;
          const y3 = size / 2 + Math.sin(angleEnd) * outerRadius;
          const x4 = size / 2 + Math.cos(angleEnd) * innerRadius;
          const y4 = size / 2 + Math.sin(angleEnd) * innerRadius;

          const isActive = facet.id === activeFacetId;
          const hasCheckIn = (checkIns[facet.id] || 0) > 0;
          const intensity = checkIns[facet.id] || 0;

          return (
            <g key={facet.id}>
              {/* Base wedge */}
              <path
                d={`M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1} Z`}
                fill={facet.color.base}
                opacity={isActive ? 0.8 : hasCheckIn ? 0.3 + intensity * 0.4 : 0.1}
                stroke="white"
                strokeWidth="0.5"
              />

              {/* Active highlight */}
              {isActive && (
                <path
                  d={`M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1} Z`}
                  fill={facet.color.glow}
                  opacity="0.5"
                  filter={`url(#mini-glow-${timestamp})`}
                />
              )}
            </g>
          );
        })}

        {/* Center circle for Aether */}
        {aetherState && (
          <>
            {/* Pulsing rings */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={centerRadius * 1.5}
              fill="none"
              stroke={aetherColor}
              strokeWidth="0.5"
              opacity="0.4"
              className="animate-pulse"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={centerRadius * 2}
              fill="none"
              stroke={aetherColor}
              strokeWidth="0.3"
              opacity="0.2"
              className="animate-pulse"
              style={{ animationDelay: '0.5s' }}
            />
          </>
        )}

        {/* Center dot */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={centerRadius}
          fill={aetherState ? `url(#mini-aether-${timestamp})` : '#fff'}
          stroke={aetherState ? aetherColor : '#ddd'}
          strokeWidth="0.5"
        />

        {/* Element indicators (simplified) */}
        {dominantElements.length > 0 && size >= 64 && (
          <g>
            {dominantElements.map((element, i) => {
              const elementColor = element === 'fire' ? '#E74C3C' :
                                  element === 'water' ? '#3498DB' :
                                  element === 'earth' ? '#27AE60' :
                                  '#F39C12';
              return (
                <circle
                  key={element}
                  cx={size / 2 + (i - 0.5) * 8}
                  cy={size - 8}
                  r="3"
                  fill={elementColor}
                  opacity="0.8"
                />
              );
            })}
          </g>
        )}
      </svg>

      {/* Label */}
      {showLabel && timestamp && (
        <div className="absolute -bottom-5 left-0 right-0 text-center">
          <span className="text-xs text-gray-500">
            {formatTimestamp(timestamp)}
          </span>
        </div>
      )}

      {/* Aether badge */}
      {aetherState && size >= 64 && (
        <div className="absolute -top-1 -right-1">
          <div className="w-4 h-4 bg-white rounded-full border border-amber-300 
                        flex items-center justify-center">
            <span className="text-xs">✦</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to format timestamp
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (hours < 1) {
    const mins = Math.floor(diff / (1000 * 60));
    return `${mins}m`;
  } else if (hours < 24) {
    return `${hours}h`;
  } else {
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }
}

export default MiniHoloflower;