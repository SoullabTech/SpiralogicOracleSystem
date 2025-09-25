'use client';

import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import { IntegratedSafetySystem } from '../../lib/safety/IntegratedSafetySystem';
import { DriftDetectionEngine } from '../../lib/safety/DriftDetectionEngine';

/**
 * LEFT ANALYTICS PANEL
 * Data-driven, metrics-focused view of system safety and user patterns
 * Left-brain analytical approach
 */

interface AnalyticsData {
  driftMetrics: {
    isolation_index: number;
    externalization_rate: number;
    semantic_coherence: number;
    trajectory_angle: number; // Degrees of drift from baseline
  };
  safetyMetrics: {
    crisis_detections_24h: number;
    interventions_triggered: number;
    false_positive_rate: number;
    mean_response_time: number; // ms
  };
  immuneMetrics: {
    patterns_recognized: number;
    learning_velocity: number;
    cluster_formations: number;
    prediction_accuracy: number;
  };
  longitudinalMetrics: {
    week_over_week_change: number;
    transformation_velocity: number;
    coherence_trend: number[];
    milestone_achievements: number;
  };
}

const LeftAnalyticsPanel: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    driftMetrics: {
      isolation_index: 0.32,
      externalization_rate: 0.18,
      semantic_coherence: 0.76,
      trajectory_angle: 12.5
    },
    safetyMetrics: {
      crisis_detections_24h: 3,
      interventions_triggered: 7,
      false_positive_rate: 0.08,
      mean_response_time: 127
    },
    immuneMetrics: {
      patterns_recognized: 1247,
      learning_velocity: 4.2,
      cluster_formations: 23,
      prediction_accuracy: 0.84
    },
    longitudinalMetrics: {
      week_over_week_change: 0.23,
      transformation_velocity: 0.67,
      coherence_trend: [0.65, 0.68, 0.71, 0.73, 0.76, 0.78, 0.81],
      milestone_achievements: 14
    }
  });

  const [selectedMetric, setSelectedMetric] = useState<'drift' | 'safety' | 'immune' | 'longitudinal'>('drift');
  const [timeWindow, setTimeWindow] = useState<'1h' | '6h' | '24h' | '7d' | '30d'>('24h');
  const [showDetails, setShowDetails] = useState(false);

  // Update metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalyticsData(prev => ({
        ...prev,
        driftMetrics: {
          ...prev.driftMetrics,
          isolation_index: Math.max(0, Math.min(1, prev.driftMetrics.isolation_index + (Math.random() - 0.5) * 0.02)),
          semantic_coherence: Math.max(0, Math.min(1, prev.driftMetrics.semantic_coherence + (Math.random() - 0.5) * 0.01))
        },
        immuneMetrics: {
          ...prev.immuneMetrics,
          patterns_recognized: prev.immuneMetrics.patterns_recognized + Math.floor(Math.random() * 3),
          learning_velocity: Math.max(0, prev.immuneMetrics.learning_velocity + (Math.random() - 0.5) * 0.3)
        }
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatTimeWindow = (window: string): string => {
    switch(window) {
      case '1h': return 'Last Hour';
      case '6h': return 'Last 6 Hours';
      case '24h': return 'Last 24 Hours';
      case '7d': return 'Last Week';
      case '30d': return 'Last Month';
      default: return window;
    }
  };

  const getRiskLevel = (value: number): { label: string; color: string } => {
    if (value < 0.3) return { label: 'LOW', color: 'text-green-500' };
    if (value < 0.6) return { label: 'MODERATE', color: 'text-yellow-500' };
    if (value < 0.8) return { label: 'HIGH', color: 'text-orange-500' };
    return { label: 'CRITICAL', color: 'text-red-500' };
  };

  return (
    <div className="h-full bg-gray-900 text-gray-100 p-4 overflow-y-auto">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">System Analytics</h2>
        <div className="flex gap-2">
          {(['1h', '6h', '24h', '7d', '30d'] as const).map(window => (
            <button
              key={window}
              onClick={() => setTimeWindow(window)}
              className={`px-2 py-1 text-xs rounded ${
                timeWindow === window
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {window}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Selector */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {(['drift', 'safety', 'immune', 'longitudinal'] as const).map(metric => (
          <button
            key={metric}
            onClick={() => setSelectedMetric(metric)}
            className={`p-2 text-xs rounded capitalize ${
              selectedMetric === metric
                ? 'bg-amber-700 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {metric}
          </button>
        ))}
      </div>

      {/* Drift Metrics */}
      {selectedMetric === 'drift' && (
        <div className="space-y-4">
          <div className="bg-gray-800 p-3 rounded">
            <h3 className="text-sm font-medium mb-3">Drift Detection Analysis</h3>

            <div className="space-y-2">
              <MetricRow
                label="Isolation Index"
                value={analyticsData.driftMetrics.isolation_index}
                format="percentage"
                threshold={0.5}
                inverse={false}
              />
              <MetricRow
                label="Externalization Rate"
                value={analyticsData.driftMetrics.externalization_rate}
                format="percentage"
                threshold={0.3}
                inverse={false}
              />
              <MetricRow
                label="Semantic Coherence"
                value={analyticsData.driftMetrics.semantic_coherence}
                format="percentage"
                threshold={0.6}
                inverse={true}
              />
              <MetricRow
                label="Trajectory Angle"
                value={analyticsData.driftMetrics.trajectory_angle}
                format="degrees"
                threshold={20}
                inverse={false}
              />
            </div>

            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="text-xs text-gray-400">
                Composite Risk: {' '}
                <span className={getRiskLevel(analyticsData.driftMetrics.isolation_index).color}>
                  {getRiskLevel(analyticsData.driftMetrics.isolation_index).label}
                </span>
              </div>
            </div>
          </div>

          {/* Semantic Shift Matrix */}
          <div className="bg-gray-800 p-3 rounded">
            <h3 className="text-sm font-medium mb-3">Semantic Shift Matrix</h3>
            <div className="grid grid-cols-3 gap-1">
              {['self', 'other', 'world'].map(dimension => (
                <div key={dimension} className="text-center">
                  <div className="text-xs text-gray-400 mb-1 capitalize">{dimension}</div>
                  {['past', 'present', 'future'].map(temporal => (
                    <div
                      key={temporal}
                      className="h-8 bg-gray-700 mb-1 flex items-center justify-center text-xs"
                      style={{
                        backgroundColor: `rgba(147, 51, 234, ${Math.random() * 0.8})`,
                      }}
                    >
                      {(Math.random() * 100).toFixed(0)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Safety Metrics */}
      {selectedMetric === 'safety' && (
        <div className="space-y-4">
          <div className="bg-gray-800 p-3 rounded">
            <h3 className="text-sm font-medium mb-3">Safety Pipeline Performance</h3>

            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Crisis Detections"
                value={analyticsData.safetyMetrics.crisis_detections_24h}
                unit=""
                trend="stable"
              />
              <StatCard
                label="Interventions"
                value={analyticsData.safetyMetrics.interventions_triggered}
                unit=""
                trend="up"
              />
              <StatCard
                label="False Positive Rate"
                value={(analyticsData.safetyMetrics.false_positive_rate * 100).toFixed(1)}
                unit="%"
                trend="down"
              />
              <StatCard
                label="Response Time"
                value={analyticsData.safetyMetrics.mean_response_time}
                unit="ms"
                trend="stable"
              />
            </div>
          </div>

          {/* Response Distribution */}
          <div className="bg-gray-800 p-3 rounded">
            <h3 className="text-sm font-medium mb-3">Response Distribution</h3>
            <div className="space-y-1">
              <ResponseBar label="Continue" percentage={65} color="bg-green-600" />
              <ResponseBar label="Gentle Check-in" percentage={20} color="bg-yellow-600" />
              <ResponseBar label="Grounding" percentage={10} color="bg-orange-600" />
              <ResponseBar label="Escalate" percentage={4} color="bg-red-600" />
              <ResponseBar label="Lock Session" percentage={1} color="bg-red-800" />
            </div>
          </div>
        </div>
      )}

      {/* Immune Metrics */}
      {selectedMetric === 'immune' && (
        <div className="space-y-4">
          <div className="bg-gray-800 p-3 rounded">
            <h3 className="text-sm font-medium mb-3">Collective Immune Memory</h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Pattern Library</span>
                  <span className="text-amber-400">{analyticsData.immuneMetrics.patterns_recognized}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Learning velocity: {analyticsData.immuneMetrics.learning_velocity.toFixed(1)} patterns/hour
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Active Clusters</span>
                  <span className="text-blue-400">{analyticsData.immuneMetrics.cluster_formations}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Prediction Accuracy</span>
                  <span className="text-green-400">
                    {(analyticsData.immuneMetrics.prediction_accuracy * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pattern Type Distribution */}
          <div className="bg-gray-800 p-3 rounded">
            <h3 className="text-sm font-medium mb-3">Pattern Type Distribution</h3>
            <div className="space-y-2">
              {[
                { type: 'Isolation', count: 342, color: 'bg-amber-600' },
                { type: 'Manipulation', count: 287, color: 'bg-red-600' },
                { type: 'Reality Distortion', count: 198, color: 'bg-orange-600' },
                { type: 'Externalization', count: 267, color: 'bg-yellow-600' },
                { type: 'Splitting', count: 153, color: 'bg-blue-600' }
              ].map(pattern => (
                <div key={pattern.type} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${pattern.color}`} />
                  <div className="text-xs flex-1">{pattern.type}</div>
                  <div className="text-xs text-gray-400">{pattern.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Longitudinal Metrics */}
      {selectedMetric === 'longitudinal' && (
        <div className="space-y-4">
          <div className="bg-gray-800 p-3 rounded">
            <h3 className="text-sm font-medium mb-3">Transformation Tracking</h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Week-over-Week Change</span>
                  <span className="text-green-400">
                    +{(analyticsData.longitudinalMetrics.week_over_week_change * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Transformation Velocity</span>
                  <span className="text-amber-400">
                    {analyticsData.longitudinalMetrics.transformation_velocity.toFixed(2)}x
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Milestones Achieved</span>
                  <span className="text-blue-400">{analyticsData.longitudinalMetrics.milestone_achievements}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Coherence Trend Chart */}
          <div className="bg-gray-800 p-3 rounded">
            <h3 className="text-sm font-medium mb-3">Coherence Trend</h3>
            <div className="h-24 flex items-end gap-1">
              {analyticsData.longitudinalMetrics.coherence_trend.map((value, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-amber-600 to-amber-400 rounded-t"
                  style={{ height: `${value * 100}%` }}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>7 days ago</span>
              <span>Today</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer Stats */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="text-gray-500">Uptime</div>
            <div className="text-green-400">99.97%</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">Latency</div>
            <div className="text-blue-400">42ms</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">Sessions</div>
            <div className="text-amber-400">2,847</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const MetricRow: React.FC<{
  label: string;
  value: number;
  format: 'percentage' | 'number' | 'degrees';
  threshold: number;
  inverse: boolean; // If true, lower is better
}> = ({ label, value, format, threshold, inverse }) => {
  const isGood = inverse ? value > threshold : value < threshold;
  const displayValue = format === 'percentage'
    ? `${(value * 100).toFixed(1)}%`
    : format === 'degrees'
    ? `${value.toFixed(1)}°`
    : value.toFixed(2);

  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={`text-sm font-mono ${isGood ? 'text-green-400' : 'text-orange-400'}`}>
        {displayValue}
      </span>
    </div>
  );
};

const StatCard: React.FC<{
  label: string;
  value: number | string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}> = ({ label, value, unit, trend }) => (
  <div className="bg-gray-700 p-2 rounded">
    <div className="text-xs text-gray-400">{label}</div>
    <div className="flex items-baseline gap-1 mt-1">
      <span className="text-lg font-bold">{value}</span>
      <span className="text-xs text-gray-500">{unit}</span>
      <span className="text-xs ml-auto">
        {trend === 'up' && '↑'}
        {trend === 'down' && '↓'}
        {trend === 'stable' && '→'}
      </span>
    </div>
  </div>
);

const ResponseBar: React.FC<{
  label: string;
  percentage: number;
  color: string;
}> = ({ label, percentage, color }) => (
  <div className="flex items-center gap-2">
    <div className="text-xs text-gray-400 w-24">{label}</div>
    <div className="flex-1 bg-gray-700 h-3 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} transition-all duration-500`}
        style={{ width: `${percentage}%` }}
      />
    </div>
    <div className="text-xs text-gray-500 w-10 text-right">{percentage}%</div>
  </div>
);

export default LeftAnalyticsPanel;