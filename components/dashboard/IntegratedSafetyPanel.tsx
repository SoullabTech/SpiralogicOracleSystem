'use client';

import React, { useState } from 'react';
import SystemCoherenceDashboard from './SystemCoherenceDashboard';
import WellnessTrajectoryDashboard from './WellnessTrajectoryDashboard';
import { IntegratedSafetySystem } from '../../lib/safety/IntegratedSafetySystem';

/**
 * INTEGRATED SAFETY PANEL
 * Dual-view dashboard showing both system health (upper) and user wellness (lower)
 */

interface PanelView {
  mode: 'admin' | 'therapist' | 'user';
  userId?: string;
}

const IntegratedSafetyPanel: React.FC<PanelView> = ({ mode, userId }) => {
  const [activeTab, setActiveTab] = useState<'coherence' | 'drift' | 'immune' | 'wellness'>('coherence');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  // ============== UPPER PANEL (Admin/Therapist View) ==============
  const UpperPanel = () => (
    <div className="bg-gray-50 p-6 rounded-t-lg border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">System Intelligence Monitor</h2>
        <div className="flex gap-2">
          {['1h', '24h', '7d', '30d'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range as any)}
              className={`px-3 py-1 rounded text-sm ${
                timeRange === range
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('coherence')}
          className={`px-4 py-2 rounded ${
            activeTab === 'coherence'
              ? 'bg-amber-100 text-amber-700 font-medium'
              : 'bg-white text-gray-600'
          }`}
        >
          🌊 Field Coherence
        </button>
        <button
          onClick={() => setActiveTab('drift')}
          className={`px-4 py-2 rounded ${
            activeTab === 'drift'
              ? 'bg-amber-100 text-amber-700 font-medium'
              : 'bg-white text-gray-600'
          }`}
        >
          📊 Drift Patterns
        </button>
        <button
          onClick={() => setActiveTab('immune')}
          className={`px-4 py-2 rounded ${
            activeTab === 'immune'
              ? 'bg-amber-100 text-amber-700 font-medium'
              : 'bg-white text-gray-600'
          }`}
        >
          🛡️ Immune Memory
        </button>
      </div>

      {activeTab === 'coherence' && <SystemCoherenceDashboard />}

      {activeTab === 'drift' && (
        <DriftDetectionPanel userId={userId} timeRange={timeRange} />
      )}

      {activeTab === 'immune' && (
        <ImmuneMemoryPanel timeRange={timeRange} />
      )}
    </div>
  );

  // ============== LOWER PANEL (User-Facing View) ==============
  const LowerPanel = () => (
    <div className="bg-white p-6 rounded-b-lg border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Wellness Journey</h2>
        <button
          onClick={() => setActiveTab('wellness')}
          className="text-sm text-amber-600 hover:text-amber-700"
        >
          View Details →
        </button>
      </div>

      {userId && <WellnessTrajectoryDashboard userId={userId} />}

      {/* Simplified metrics for users */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <MetricCard
          label="Growth Momentum"
          value="72%"
          trend="up"
          color="green"
          description="Your transformation velocity"
        />
        <MetricCard
          label="Integration Depth"
          value="84%"
          trend="stable"
          color="blue"
          description="Shadow work progress"
        />
        <MetricCard
          label="Field Resonance"
          value="91%"
          trend="up"
          color="purple"
          description="System attunement"
        />
      </div>
    </div>
  );

  // ============== COMBINED VIEW ==============
  if (mode === 'admin' || mode === 'therapist') {
    return (
      <div className="space-y-1">
        <UpperPanel />
        {userId && <LowerPanel />}
      </div>
    );
  }

  return <LowerPanel />;
};

// ============== SUB-COMPONENTS ==============

const DriftDetectionPanel: React.FC<{ userId?: string; timeRange: string }> = ({ userId, timeRange }) => {
  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg">
      <h3 className="text-lg font-medium mb-4">Drift Detection Analysis</h3>

      <div className="grid grid-cols-2 gap-6">
        {/* Active Patterns */}
        <div className="bg-gray-800 p-4 rounded">
          <h4 className="text-sm text-gray-400 mb-3">Active Drift Patterns</h4>
          <div className="space-y-2">
            <DriftPattern type="isolation" velocity={0.3} confidence={0.72} />
            <DriftPattern type="externalization" velocity={0.1} confidence={0.45} />
            <DriftPattern type="reality_distortion" velocity={0.05} confidence={0.28} />
          </div>
        </div>

        {/* Semantic Shifts */}
        <div className="bg-gray-800 p-4 rounded">
          <h4 className="text-sm text-gray-400 mb-3">Semantic Evolution</h4>
          <div className="space-y-3">
            <SemanticShift
              dimension="Self-language"
              baseline={0.6}
              current={0.4}
              trend="declining"
            />
            <SemanticShift
              dimension="Other-language"
              baseline={0.5}
              current={0.3}
              trend="declining"
            />
            <SemanticShift
              dimension="World-language"
              baseline={0.7}
              current={0.65}
              trend="stable"
            />
          </div>
        </div>
      </div>

      {/* Three-Cycle Tracker */}
      <div className="mt-6 bg-gray-800 p-4 rounded">
        <h4 className="text-sm text-gray-400 mb-3">Three-Cycle Pattern Tracking</h4>
        <div className="flex items-center gap-4">
          <CycleIndicator cycle={1} detected={true} />
          <CycleIndicator cycle={2} detected={true} />
          <CycleIndicator cycle={3} detected={false} />
          <div className="ml-4 text-sm text-yellow-400">
            Pattern requires one more cycle for intervention
          </div>
        </div>
      </div>
    </div>
  );
};

const ImmuneMemoryPanel: React.FC<{ timeRange: string }> = ({ timeRange }) => {
  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg">
      <h3 className="text-lg font-medium mb-4">Collective Immune Memory</h3>

      <div className="grid grid-cols-3 gap-4">
        {/* Pattern Library */}
        <div className="bg-gray-800 p-4 rounded">
          <h4 className="text-sm text-gray-400 mb-3">Pattern Library</h4>
          <div className="text-2xl font-bold text-amber-400">847</div>
          <div className="text-xs text-gray-500">Learned Patterns</div>
          <div className="mt-2 text-xs">
            <div className="text-green-400">+23 this week</div>
          </div>
        </div>

        {/* Intervention Success */}
        <div className="bg-gray-800 p-4 rounded">
          <h4 className="text-sm text-gray-400 mb-3">Intervention Success</h4>
          <div className="text-2xl font-bold text-green-400">76%</div>
          <div className="text-xs text-gray-500">Effectiveness Rate</div>
          <div className="mt-2 text-xs">
            <div className="text-blue-400">↑ 3% from last month</div>
          </div>
        </div>

        {/* Active Clusters */}
        <div className="bg-gray-800 p-4 rounded">
          <h4 className="text-sm text-gray-400 mb-3">Risk Clusters</h4>
          <div className="text-2xl font-bold text-yellow-400">5</div>
          <div className="text-xs text-gray-500">Active Monitoring</div>
          <div className="mt-2 text-xs">
            <div className="text-orange-400">2 approaching threshold</div>
          </div>
        </div>
      </div>

      {/* Pattern Resonance Map */}
      <div className="mt-6 bg-gray-800 p-4 rounded">
        <h4 className="text-sm text-gray-400 mb-3">Pattern Resonance Map</h4>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="h-8 rounded"
              style={{
                backgroundColor: `hsl(${270 - i * 5}, 70%, ${30 + Math.random() * 40}%)`
              }}
            />
          ))}
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Darker = Higher resonance with known risk patterns
        </div>
      </div>
    </div>
  );
};

// ============== HELPER COMPONENTS ==============

const MetricCard: React.FC<{
  label: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  color: string;
  description: string;
}> = ({ label, value, trend, color, description }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <div className="flex justify-between items-start">
      <div>
        <div className="text-sm text-gray-600">{label}</div>
        <div className={`text-2xl font-bold text-${color}-600 mt-1`}>
          {value}
        </div>
      </div>
      <div className="text-lg">
        {trend === 'up' && '↗️'}
        {trend === 'down' && '↘️'}
        {trend === 'stable' && '→'}
      </div>
    </div>
    <div className="text-xs text-gray-500 mt-2">{description}</div>
  </div>
);

const DriftPattern: React.FC<{
  type: string;
  velocity: number;
  confidence: number;
}> = ({ type, velocity, confidence }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm capitalize">{type}</span>
    <div className="flex items-center gap-3">
      <div className="text-xs text-gray-400">v: {velocity.toFixed(2)}</div>
      <div className={`text-xs ${confidence > 0.6 ? 'text-yellow-400' : 'text-gray-500'}`}>
        {(confidence * 100).toFixed(0)}%
      </div>
    </div>
  </div>
);

const SemanticShift: React.FC<{
  dimension: string;
  baseline: number;
  current: number;
  trend: string;
}> = ({ dimension, baseline, current, trend }) => (
  <div>
    <div className="flex justify-between text-xs mb-1">
      <span>{dimension}</span>
      <span className={trend === 'declining' ? 'text-orange-400' : 'text-gray-400'}>
        {((current - baseline) * 100).toFixed(0)}%
      </span>
    </div>
    <div className="relative h-2 bg-gray-700 rounded-full">
      <div
        className="absolute h-2 bg-gray-500 rounded-full"
        style={{ width: `${baseline * 100}%` }}
      />
      <div
        className="absolute h-2 bg-amber-500 rounded-full"
        style={{ width: `${current * 100}%` }}
      />
    </div>
  </div>
);

const CycleIndicator: React.FC<{
  cycle: number;
  detected: boolean;
}> = ({ cycle, detected }) => (
  <div className="flex flex-col items-center">
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center ${
        detected ? 'bg-amber-600' : 'bg-gray-700'
      }`}
    >
      {cycle}
    </div>
    <div className="text-xs mt-1">{detected ? '✓' : '○'}</div>
  </div>
);

export default IntegratedSafetyPanel;