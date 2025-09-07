// Simplified Holoflower Visualization for Beta UI
import React, { useMemo } from 'react';

interface HoloflowerVizProps {
  balance: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
  current: {
    element: 'fire' | 'water' | 'earth' | 'air';
    stage: 1 | 2 | 3;
  };
  size?: number;
  minimal?: boolean;
}

export const HoloflowerViz: React.FC<HoloflowerVizProps> = ({
  balance,
  current,
  size = 320,
  minimal = false
}) => {
  const { wedgePath, centerGradientId, glowFilterId } = useMemo(() => {
    const centerX = size / 2;
    const centerY = size / 2;
    const outerRadius = size / 2 - 10;
    const innerRadius = outerRadius * 0.2;

    // Calculate wedge position (12 wedges total)
    const wedgeMap = {
      'air-3': 0,   'air-2': 1,   'air-1': 2,    // 9-12 o'clock
      'fire-1': 3,  'fire-2': 4,  'fire-3': 5,   // 12-3 o'clock
      'water-1': 6, 'water-2': 7, 'water-3': 8,  // 3-6 o'clock
      'earth-3': 9, 'earth-2': 10, 'earth-1': 11  // 6-9 o'clock
    };

    const wedgeIndex = wedgeMap[`${current.element}-${current.stage}` as keyof typeof wedgeMap];
    const anglePerWedge = (Math.PI * 2) / 12;
    const startAngle = wedgeIndex * anglePerWedge - Math.PI / 2;
    const endAngle = startAngle + anglePerWedge;

    // Create wedge path
    const x1 = centerX + Math.cos(startAngle) * innerRadius;
    const y1 = centerY + Math.sin(startAngle) * innerRadius;
    const x2 = centerX + Math.cos(startAngle) * outerRadius;
    const y2 = centerY + Math.sin(startAngle) * outerRadius;
    const x3 = centerX + Math.cos(endAngle) * outerRadius;
    const y3 = centerY + Math.sin(endAngle) * outerRadius;
    const x4 = centerX + Math.cos(endAngle) * innerRadius;
    const y4 = centerY + Math.sin(endAngle) * innerRadius;

    const largeArcFlag = anglePerWedge > Math.PI ? 1 : 0;

    const path = `
      M ${x1} ${y1}
      L ${x2} ${y2}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3}
      L ${x4} ${y4}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}
      Z
    `;

    return {
      wedgePath: path,
      centerGradientId: `center-gradient-${Date.now()}`,
      glowFilterId: `glow-filter-${Date.now()}`
    };
  }, [current, size]);

  const elementColors = {
    fire: '#E74C3C',
    water: '#3498DB',
    earth: '#27AE60',
    air: '#F39C12'
  };

  const wedgeColors = {
    fire: ['#FFB3A7', '#FF8C7A', '#FF6B4D'],
    water: ['#A7D8FF', '#7AC3FF', '#4DA8FF'],
    earth: ['#A8E6A8', '#7DD87D', '#52C752'],
    air: ['#FFE5B3', '#FFD68A', '#FFC561']
  };

  return (
    <div className="holoflower-viz" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          {/* Center gradient */}
          <radialGradient id={centerGradientId}>
            <stop offset="0%" stopColor="#FFF" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#E8D5F2" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#9B59B6" stopOpacity="0.3" />
          </radialGradient>

          {/* Glow filter */}
          <filter id={glowFilterId}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
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
          r={size / 2 - 10}
          fill="#F8F9FA"
          stroke="#E5E7EB"
          strokeWidth="1"
        />

        {/* All wedges (subtle) */}
        {!minimal && Array.from({ length: 12 }).map((_, i) => {
          const anglePerWedge = (Math.PI * 2) / 12;
          const startAngle = i * anglePerWedge - Math.PI / 2;
          const endAngle = startAngle + anglePerWedge;
          const centerX = size / 2;
          const centerY = size / 2;
          const outerRadius = size / 2 - 10;
          const innerRadius = outerRadius * 0.2;

          const x1 = centerX + Math.cos(startAngle) * innerRadius;
          const y1 = centerY + Math.sin(startAngle) * innerRadius;
          const x2 = centerX + Math.cos(startAngle) * outerRadius;
          const y2 = centerY + Math.sin(startAngle) * outerRadius;

          // Determine element for this wedge
          const elementForWedge = 
            i <= 2 ? 'air' :
            i <= 5 ? 'fire' :
            i <= 8 ? 'water' : 'earth';

          return (
            <g key={i}>
              <line
                x1={centerX}
                y1={centerY}
                x2={x2}
                y2={y2}
                stroke="#E5E7EB"
                strokeWidth="1"
                opacity="0.3"
              />
              <path
                d={`
                  M ${x1} ${y1}
                  L ${x2} ${y2}
                  A ${outerRadius} ${outerRadius} 0 0 1 
                    ${centerX + Math.cos(endAngle) * outerRadius} 
                    ${centerY + Math.sin(endAngle) * outerRadius}
                  L ${centerX + Math.cos(endAngle) * innerRadius} 
                    ${centerY + Math.sin(endAngle) * innerRadius}
                  A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1}
                  Z
                `}
                fill={elementColors[elementForWedge]}
                opacity="0.05"
              />
            </g>
          );
        })}

        {/* Active wedge highlight */}
        <path
          d={wedgePath}
          fill={wedgeColors[current.element][current.stage - 1]}
          stroke="#FFF"
          strokeWidth="2"
          opacity={0.9}
          filter={`url(#${glowFilterId})`}
          className="transition-all duration-500"
        />

        {/* Center aether circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size / 2 - 10) * 0.2 * (0.5 + balance.aether * 0.5)}
          fill={`url(#${centerGradientId})`}
          opacity={0.8}
        />

        {/* Element indicators */}
        {!minimal && (
          <g className="element-indicators">
            {['fire', 'water', 'earth', 'air'].map((element, i) => {
              const angle = (i * Math.PI / 2) + Math.PI / 4;
              const indicatorRadius = size / 2 - 35;
              const x = size / 2 + Math.cos(angle) * indicatorRadius;
              const y = size / 2 + Math.sin(angle) * indicatorRadius;
              const isActive = element === current.element;

              return (
                <g key={element}>
                  <circle
                    cx={x}
                    cy={y}
                    r={12}
                    fill={elementColors[element as keyof typeof elementColors]}
                    opacity={isActive ? 1 : 0.3}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={8 * balance[element as keyof typeof balance]}
                    fill="#FFF"
                    opacity={0.7}
                  />
                </g>
              );
            })}
          </g>
        )}

        {/* Center text */}
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-purple-700 text-xs font-semibold"
        >
          {current.element.toUpperCase()} {current.stage}
        </text>
      </svg>
    </div>
  );
};

export default HoloflowerViz;