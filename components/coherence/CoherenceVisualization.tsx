// Coherence Visualization - HeartMath-inspired coherence tracking
import React, { useMemo } from 'react';
import { Line } from 'recharts';
import { MiniHoloflower } from '../sacred/MiniHoloflower';

interface CoherenceData {
  timestamp: string;
  coherenceIndex: number;
  components: {
    emotional: number;
    intuitive: number;
    guided: number;
  };
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  checkIns?: Record<string, number>;
  primaryFacetId?: string;
}

interface CoherenceVisualizationProps {
  data: CoherenceData[];
  timeWindow?: 7 | 30 | 90;
  showComponents?: boolean;
  showMiniFlowers?: boolean;
}

export const CoherenceVisualization: React.FC<CoherenceVisualizationProps> = ({
  data,
  timeWindow = 30,
  showComponents = true,
  showMiniFlowers = true
}) => {
  // Process data for visualization
  const processedData = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now.getTime() - timeWindow * 24 * 60 * 60 * 1000);
    
    return data
      .filter(d => new Date(d.timestamp) >= cutoff)
      .map(d => ({
        ...d,
        date: new Date(d.timestamp).toLocaleDateString(),
        time: new Date(d.timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        coherencePercent: Math.round(d.coherenceIndex * 100)
      }));
  }, [data, timeWindow]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (processedData.length === 0) {
      return { average: 0, current: 0, trend: 'stable', peak: 0, low: 0 };
    }

    const indices = processedData.map(d => d.coherenceIndex);
    const average = indices.reduce((sum, val) => sum + val, 0) / indices.length;
    const current = indices[indices.length - 1];
    const peak = Math.max(...indices);
    const low = Math.min(...indices);

    // Trend calculation
    const recentAvg = indices.slice(-5).reduce((sum, val) => sum + val, 0) / 
                      Math.min(5, indices.slice(-5).length);
    const trend = recentAvg > average + 0.1 ? 'rising' : 
                  recentAvg < average - 0.1 ? 'falling' : 'stable';

    return { average, current, trend, peak, low };
  }, [processedData]);

  // Get coherence color
  const getCoherenceColor = (value: number) => {
    if (value >= 0.7) return '#10B981'; // Green
    if (value >= 0.4) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  // Get sentiment color
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '#10B981';
      case 'negative': return '#EF4444';
      case 'mixed': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  return (
    <div className="coherence-visualization bg-white rounded-xl shadow-sm p-6">
      {/* Header with current coherence */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-800">Coherence Tracking</h3>
          <p className="text-sm text-gray-500 mt-1">
            Alignment between journal, intuition, and guidance
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-3xl font-bold" 
               style={{ color: getCoherenceColor(stats.current) }}>
            {Math.round(stats.current * 100)}%
          </div>
          <div className="text-xs text-gray-500">Current</div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500">Average</div>
          <div className="text-xl font-semibold text-gray-800">
            {Math.round(stats.average * 100)}%
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-xs text-green-600">Peak</div>
          <div className="text-xl font-semibold text-green-700">
            {Math.round(stats.peak * 100)}%
          </div>
        </div>
        
        <div className="bg-red-50 rounded-lg p-3">
          <div className="text-xs text-red-600">Low</div>
          <div className="text-xl font-semibold text-red-700">
            {Math.round(stats.low * 100)}%
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="text-xs text-purple-600">Trend</div>
          <div className="text-xl font-semibold text-purple-700 capitalize">
            {stats.trend}
            {stats.trend === 'rising' && ' ↑'}
            {stats.trend === 'falling' && ' ↓'}
            {stats.trend === 'stable' && ' →'}
          </div>
        </div>
      </div>

      {/* Line chart */}
      <div className="relative h-48 mb-6">
        <svg width="100%" height="100%" viewBox="0 0 800 200">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(val => (
            <line
              key={val}
              x1="40"
              y1={180 - val * 160}
              x2="760"
              y2={180 - val * 160}
              stroke="#E5E7EB"
              strokeWidth="1"
              strokeDasharray={val === 0.5 ? "none" : "2,2"}
            />
          ))}
          
          {/* Coherence zones */}
          <rect x="40" y="20" width="720" height="48" fill="#10B981" opacity="0.1" />
          <rect x="40" y="68" width="720" height="48" fill="#F59E0B" opacity="0.1" />
          <rect x="40" y="116" width="720" height="64" fill="#EF4444" opacity="0.1" />
          
          {/* Zone labels */}
          <text x="45" y="35" fill="#10B981" fontSize="10">High</text>
          <text x="45" y="85" fill="#F59E0B" fontSize="10">Med</text>
          <text x="45" y="150" fill="#EF4444" fontSize="10">Low</text>
          
          {/* Main coherence line */}
          <polyline
            points={processedData.map((d, i) => {
              const x = 40 + (i / (processedData.length - 1)) * 720;
              const y = 180 - d.coherenceIndex * 160;
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#8B5CF6"
            strokeWidth="2"
          />
          
          {/* Data points */}
          {processedData.map((d, i) => {
            const x = 40 + (i / (processedData.length - 1)) * 720;
            const y = 180 - d.coherenceIndex * 160;
            
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill={getCoherenceColor(d.coherenceIndex)}
                  stroke="white"
                  strokeWidth="2"
                />
                
                {/* Sentiment indicator */}
                <circle
                  cx={x}
                  cy="190"
                  r="2"
                  fill={getSentimentColor(d.sentiment)}
                />
              </g>
            );
          })}
          
          {/* Component lines (if enabled) */}
          {showComponents && (
            <>
              {/* Emotional coherence */}
              <polyline
                points={processedData.map((d, i) => {
                  const x = 40 + (i / (processedData.length - 1)) * 720;
                  const y = 180 - d.components.emotional * 160;
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="#EF4444"
                strokeWidth="1"
                opacity="0.5"
                strokeDasharray="2,2"
              />
              
              {/* Intuitive coherence */}
              <polyline
                points={processedData.map((d, i) => {
                  const x = 40 + (i / (processedData.length - 1)) * 720;
                  const y = 180 - d.components.intuitive * 160;
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="#3B82F6"
                strokeWidth="1"
                opacity="0.5"
                strokeDasharray="2,2"
              />
              
              {/* Guided coherence */}
              <polyline
                points={processedData.map((d, i) => {
                  const x = 40 + (i / (processedData.length - 1)) * 720;
                  const y = 180 - d.components.guided * 160;
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="#10B981"
                strokeWidth="1"
                opacity="0.5"
                strokeDasharray="2,2"
              />
            </>
          )}
        </svg>
      </div>

      {/* Legend */}
      {showComponents && (
        <div className="flex justify-center gap-6 mb-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full" />
            <span>Overall Coherence</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-red-500 opacity-50" />
            <span>Emotional</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-blue-500 opacity-50" />
            <span>Intuitive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-green-500 opacity-50" />
            <span>Guided</span>
          </div>
        </div>
      )}

      {/* Mini Holoflowers timeline */}
      {showMiniFlowers && processedData.length > 0 && (
        <div className="border-t pt-4">
          <p className="text-xs text-gray-500 mb-3">Session Timeline</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {processedData.slice(-10).map((d, i) => (
              <div key={i} className="flex-shrink-0">
                <div className={`rounded-lg p-1 border-2 transition-colors
                  ${d.coherenceIndex >= 0.7 ? 'border-green-400' :
                    d.coherenceIndex >= 0.4 ? 'border-yellow-400' :
                    'border-red-400'}`}>
                  <MiniHoloflower
                    activeFacetId={d.primaryFacetId}
                    checkIns={d.checkIns}
                    size={48}
                  />
                </div>
                <p className="text-xs text-center mt-1 text-gray-500">
                  {d.coherencePercent}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="mt-6 p-4 bg-purple-50 rounded-lg">
        <p className="text-sm text-purple-900 font-medium mb-2">
          Coherence Insight
        </p>
        <p className="text-sm text-purple-700">
          {stats.trend === 'rising' && 
            'Your coherence is improving. Journal themes are aligning well with your intuitive check-ins and oracle guidance.'}
          {stats.trend === 'falling' && 
            'Coherence is decreasing. Consider grounding practices to realign inner and outer wisdom.'}
          {stats.trend === 'stable' && 
            `Maintaining steady coherence around ${Math.round(stats.average * 100)}%. Continue your practice.`}
        </p>
      </div>
    </div>
  );
};

export default CoherenceVisualization;