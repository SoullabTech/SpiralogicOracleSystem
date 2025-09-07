// Aggregate Blossom - Shows average petal intensities across time periods
import React, { useMemo } from 'react';
import { SPIRALOGIC_FACETS_COMPLETE, AETHER_DYNAMICS } from '@/data/spiralogic-facets-complete';

interface SessionData {
  timestamp: string;
  checkIns: Record<string, number>;
  primaryFacetId?: string;
  aetherState?: string;
}

interface AggregateBlossomProps {
  sessions: SessionData[];
  timeWindow?: 7 | 30 | 90; // days
  size?: number;
  showLabels?: boolean;
  animateGrowth?: boolean;
}

export const AggregateBlossom: React.FC<AggregateBlossomProps> = ({
  sessions,
  timeWindow = 30,
  size = 400,
  showLabels = true,
  animateGrowth = true
}) => {
  // Calculate aggregate intensities
  const aggregateData = useMemo(() => {
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - timeWindow * 24 * 60 * 60 * 1000);
    
    // Filter sessions within time window
    const recentSessions = sessions.filter(s => 
      new Date(s.timestamp) >= cutoffDate
    );

    if (recentSessions.length === 0) {
      return { 
        petalIntensities: {}, 
        aetherPresence: 0,
        sessionCount: 0,
        dominantElements: []
      };
    }

    // Aggregate petal intensities
    const petalSums: Record<string, number> = {};
    const petalCounts: Record<string, number> = {};
    let aetherCount = 0;

    recentSessions.forEach(session => {
      // Process check-ins
      Object.entries(session.checkIns || {}).forEach(([facetId, intensity]) => {
        petalSums[facetId] = (petalSums[facetId] || 0) + intensity;
        petalCounts[facetId] = (petalCounts[facetId] || 0) + 1;
      });

      // Process oracle reading
      if (session.primaryFacetId) {
        petalSums[session.primaryFacetId] = (petalSums[session.primaryFacetId] || 0) + 0.5;
        petalCounts[session.primaryFacetId] = (petalCounts[session.primaryFacetId] || 0) + 1;
      }

      // Count Aether presence
      if (session.aetherState) {
        aetherCount++;
      }
    });

    // Calculate averages
    const petalIntensities: Record<string, number> = {};
    Object.keys(petalSums).forEach(facetId => {
      petalIntensities[facetId] = petalSums[facetId] / petalCounts[facetId];
    });

    // Calculate elemental dominance
    const elementSums: Record<string, number> = { fire: 0, water: 0, earth: 0, air: 0 };
    Object.entries(petalIntensities).forEach(([facetId, intensity]) => {
      const facet = SPIRALOGIC_FACETS_COMPLETE.find(f => f.id === facetId);
      if (facet && facet.element !== 'aether') {
        elementSums[facet.element] += intensity;
      }
    });

    const dominantElements = Object.entries(elementSums)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([element, sum]) => ({ element, strength: sum }));

    return {
      petalIntensities,
      aetherPresence: aetherCount / recentSessions.length,
      sessionCount: recentSessions.length,
      dominantElements,
      elementSums
    };
  }, [sessions, timeWindow]);

  const centerX = size / 2;
  const centerY = size / 2;
  const maxRadius = size * 0.4;
  const innerRadius = size * 0.1;

  // Create petal paths
  const createPetalPath = (facet: typeof SPIRALOGIC_FACETS_COMPLETE[0], intensity: number) => {
    const startAngle = facet.angle.start;
    const endAngle = facet.angle.end;
    const outerRadius = innerRadius + (maxRadius - innerRadius) * intensity;

    const x1 = centerX + Math.cos(startAngle) * innerRadius;
    const y1 = centerY + Math.sin(startAngle) * innerRadius;
    const x2 = centerX + Math.cos(startAngle) * outerRadius;
    const y2 = centerY + Math.sin(startAngle) * outerRadius;
    
    // Create curved petal edge
    const midAngle = (startAngle + endAngle) / 2;
    const petalWidth = Math.abs(endAngle - startAngle);
    const controlRadius = outerRadius * (1 + intensity * 0.2); // Bulge based on intensity
    const cx = centerX + Math.cos(midAngle) * controlRadius;
    const cy = centerY + Math.sin(midAngle) * controlRadius;
    
    const x3 = centerX + Math.cos(endAngle) * outerRadius;
    const y3 = centerY + Math.sin(endAngle) * outerRadius;
    const x4 = centerX + Math.cos(endAngle) * innerRadius;
    const y4 = centerY + Math.sin(endAngle) * innerRadius;

    return `
      M ${x1} ${y1}
      L ${x2} ${y2}
      Q ${cx} ${cy} ${x3} ${y3}
      L ${x4} ${y4}
      A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1}
      Z
    `;
  };

  return (
    <div className="aggregate-blossom-container">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          {/* Radial gradient for center */}
          <radialGradient id="center-gradient">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#e8d5f2" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#9b59b6" stopOpacity="0.3" />
          </radialGradient>

          {/* Glow filter */}
          <filter id="blossom-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background circles */}
        <circle cx={centerX} cy={centerY} r={maxRadius} 
                fill="none" stroke="#e0e0e0" strokeWidth="1" opacity="0.3" />
        <circle cx={centerX} cy={centerY} r={maxRadius * 0.75} 
                fill="none" stroke="#e0e0e0" strokeWidth="0.5" opacity="0.2" />
        <circle cx={centerX} cy={centerY} r={maxRadius * 0.5} 
                fill="none" stroke="#e0e0e0" strokeWidth="0.5" opacity="0.2" />
        <circle cx={centerX} cy={centerY} r={maxRadius * 0.25} 
                fill="none" stroke="#e0e0e0" strokeWidth="0.5" opacity="0.2" />

        {/* Petals */}
        <g className="petals">
          {SPIRALOGIC_FACETS_COMPLETE.map((facet, index) => {
            const intensity = aggregateData.petalIntensities[facet.id] || 0;
            
            if (intensity === 0) return null;

            return (
              <g key={facet.id}>
                <path
                  d={createPetalPath(facet, intensity)}
                  fill={facet.color.base}
                  opacity={0.6 + intensity * 0.4}
                  stroke={facet.color.shadow}
                  strokeWidth="0.5"
                  filter="url(#blossom-glow)"
                  className={animateGrowth ? 'animate-blossom-grow' : ''}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    transformOrigin: `${centerX}px ${centerY}px`
                  }}
                />
              </g>
            );
          })}
        </g>

        {/* Aether presence (center) */}
        {aggregateData.aetherPresence > 0 && (
          <>
            <circle
              cx={centerX}
              cy={centerY}
              r={innerRadius * (1 + aggregateData.aetherPresence)}
              fill="url(#center-gradient)"
              opacity={0.8}
              className="animate-pulse"
            />
            {[1, 2, 3].map(i => (
              <circle
                key={i}
                cx={centerX}
                cy={centerY}
                r={innerRadius * (1 + i * 0.5)}
                fill="none"
                stroke="#9b59b6"
                strokeWidth="0.5"
                opacity={0.3 - i * 0.1}
                className="animate-pulse"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </>
        )}

        {/* Center dot */}
        <circle
          cx={centerX}
          cy={centerY}
          r={innerRadius}
          fill="white"
          stroke="#ddd"
          strokeWidth="1"
        />

        {/* Elemental indicators */}
        {showLabels && aggregateData.dominantElements.map((elem, i) => {
          const angle = (Math.PI / 4) + (i * Math.PI / 2);
          const labelRadius = maxRadius + 20;
          const x = centerX + Math.cos(angle) * labelRadius;
          const y = centerY + Math.sin(angle) * labelRadius;

          return (
            <g key={elem.element}>
              <circle
                cx={x}
                cy={y}
                r={12}
                fill={elem.element === 'fire' ? '#E74C3C' :
                      elem.element === 'water' ? '#3498DB' :
                      elem.element === 'earth' ? '#27AE60' :
                      '#F39C12'}
                opacity={0.2 + elem.strength * 0.3}
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-medium fill-gray-700"
              >
                {elem.element[0].toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Statistics */}
      {showLabels && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            {timeWindow}-day aggregate from {aggregateData.sessionCount} sessions
          </p>
          {aggregateData.aetherPresence > 0 && (
            <p className="text-xs text-purple-600 mt-1">
              {Math.round(aggregateData.aetherPresence * 100)}% Aetheric presence
            </p>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes blossom-grow {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-blossom-grow {
          animation: blossom-grow 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AggregateBlossom;