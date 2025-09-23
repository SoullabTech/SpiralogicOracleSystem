'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DateTime } from 'luxon';

/**
 * SYSTEM COHERENCE DASHBOARD
 * Living visualization of the entire safety/transformation ecosystem
 * "Showing the system its own song"
 */

interface FieldCoherence {
  emotional: number; // 0-1
  semantic: number;
  connection: number;
  sacred: number;
  somatic: number;
  temporal: number;
  overall: number; // Harmonic mean of all dimensions
}

interface SystemPulse {
  timestamp: DateTime;
  throughput: number; // ms, Safety→Field→Loop→Response
  restraint_level: number; // 0-10
  accuracy: number; // Pattern recognition confidence
  learning_rate: number; // New patterns/hour
}

interface BiomeHealth {
  resilience_score: number; // 0-1, can handle component failures
  pattern_diversity: number; // Shannon entropy of response patterns
  recovery_time: number; // ms after crisis intervention
  module_coherence: number; // Cross-talk quality between components
}

interface TransformationMetrics {
  agency_restoration: number; // Shift from victim to ownership language
  relational_repair: number; // "Us vs them" → nuanced perspective
  shadow_integration: number; // Three-touch patterns → insights
  coherence_trajectory: 'ascending' | 'stable' | 'descending' | 'oscillating';
}

interface CymaticWave {
  frequency: number;
  amplitude: number;
  phase: number;
  interference: 'constructive' | 'destructive' | 'neutral';
}

const SystemCoherenceDashboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fieldCoherence, setFieldCoherence] = useState<FieldCoherence>({
    emotional: 0.75,
    semantic: 0.82,
    connection: 0.68,
    sacred: 0.45,
    somatic: 0.71,
    temporal: 0.89,
    overall: 0.72
  });

  const [systemPulse, setSystemPulse] = useState<SystemPulse[]>([]);
  const [biomeHealth, setBiomeHealth] = useState<BiomeHealth>({
    resilience_score: 0.85,
    pattern_diversity: 0.73,
    recovery_time: 1200,
    module_coherence: 0.91
  });

  const [transformationMetrics, setTransformationMetrics] = useState<TransformationMetrics>({
    agency_restoration: 0.34,
    relational_repair: 0.56,
    shadow_integration: 0.42,
    coherence_trajectory: 'ascending'
  });

  const [cymaticPattern, setCymaticPattern] = useState<CymaticWave[]>([]);
  const [isLive, setIsLive] = useState(true);

  // Simulate live data updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // Update field coherence with subtle oscillations
      setFieldCoherence(prev => ({
        emotional: oscillate(prev.emotional, 0.02),
        semantic: oscillate(prev.semantic, 0.01),
        connection: oscillate(prev.connection, 0.03),
        sacred: oscillate(prev.sacred, 0.04),
        somatic: oscillate(prev.somatic, 0.02),
        temporal: oscillate(prev.temporal, 0.01),
        overall: 0 // Will calculate
      }));

      // Add new pulse reading
      setSystemPulse(prev => {
        const newPulse: SystemPulse = {
          timestamp: DateTime.now(),
          throughput: 120 + Math.random() * 40,
          restraint_level: 5 + Math.sin(Date.now() / 10000) * 2,
          accuracy: 0.85 + Math.random() * 0.1,
          learning_rate: Math.random() * 5
        };

        const updated = [...prev, newPulse];
        return updated.slice(-50); // Keep last 50 readings
      });

      // Update cymatic pattern
      setCymaticPattern(prev => {
        const waves: CymaticWave[] = [];
        for (let i = 0; i < 6; i++) {
          waves.push({
            frequency: 0.5 + i * 0.2 + Math.sin(Date.now() / (1000 * (i + 1))) * 0.1,
            amplitude: 0.3 + Math.cos(Date.now() / (2000 * (i + 1))) * 0.2,
            phase: (Date.now() / 1000 + i * Math.PI / 3) % (2 * Math.PI),
            interference: Math.random() > 0.7 ? 'constructive' : Math.random() > 0.3 ? 'neutral' : 'destructive'
          });
        }
        return waves;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive]);

  // Calculate overall coherence
  useEffect(() => {
    const dimensions = [
      fieldCoherence.emotional,
      fieldCoherence.semantic,
      fieldCoherence.connection,
      fieldCoherence.sacred,
      fieldCoherence.somatic,
      fieldCoherence.temporal
    ];

    // Harmonic mean emphasizes weakest dimension
    const harmonicMean = dimensions.length / dimensions.reduce((sum, d) => sum + 1 / d, 0);

    setFieldCoherence(prev => ({ ...prev, overall: harmonicMean }));
  }, [fieldCoherence.emotional, fieldCoherence.semantic, fieldCoherence.connection,
      fieldCoherence.sacred, fieldCoherence.somatic, fieldCoherence.temporal]);

  // Draw cymatic visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, width, height);

    // Draw cymatic interference pattern
    cymaticPattern.forEach((wave, index) => {
      ctx.strokeStyle = wave.interference === 'constructive'
        ? 'rgba(34, 197, 94, 0.6)'  // Green
        : wave.interference === 'destructive'
        ? 'rgba(239, 68, 68, 0.6)'  // Red
        : 'rgba(59, 130, 246, 0.4)'; // Blue

      ctx.lineWidth = 1 + wave.amplitude * 2;
      ctx.beginPath();

      for (let x = 0; x < width; x++) {
        const y = height / 2 +
          Math.sin(x * wave.frequency / 10 + wave.phase) *
          wave.amplitude * height / 4;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
    });

    // Draw coherence nodes
    const nodePositions = [
      { x: width * 0.2, y: height * 0.3, dim: 'emotional' },
      { x: width * 0.8, y: height * 0.3, dim: 'semantic' },
      { x: width * 0.15, y: height * 0.7, dim: 'connection' },
      { x: width * 0.85, y: height * 0.7, dim: 'sacred' },
      { x: width * 0.35, y: height * 0.5, dim: 'somatic' },
      { x: width * 0.65, y: height * 0.5, dim: 'temporal' }
    ];

    nodePositions.forEach(node => {
      const coherence = fieldCoherence[node.dim as keyof FieldCoherence] as number;
      const radius = 10 + coherence * 20;

      // Node glow
      const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 2);
      gradient.addColorStop(0, `rgba(147, 51, 234, ${coherence})`);
      gradient.addColorStop(1, 'rgba(147, 51, 234, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(node.x - radius * 2, node.y - radius * 2, radius * 4, radius * 4);

      // Node core
      ctx.fillStyle = `rgba(147, 51, 234, ${0.5 + coherence * 0.5})`;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw connections between nodes
    nodePositions.forEach((node1, i) => {
      nodePositions.slice(i + 1).forEach(node2 => {
        const coherence1 = fieldCoherence[node1.dim as keyof FieldCoherence] as number;
        const coherence2 = fieldCoherence[node2.dim as keyof FieldCoherence] as number;
        const connectionStrength = (coherence1 + coherence2) / 2;

        ctx.strokeStyle = `rgba(147, 51, 234, ${connectionStrength * 0.3})`;
        ctx.lineWidth = connectionStrength * 2;
        ctx.beginPath();
        ctx.moveTo(node1.x, node1.y);
        ctx.lineTo(node2.x, node2.y);
        ctx.stroke();
      });
    });
  }, [cymaticPattern, fieldCoherence]);

  const oscillate = (value: number, amplitude: number): number => {
    const newValue = value + (Math.random() - 0.5) * amplitude;
    return Math.max(0, Math.min(1, newValue));
  };

  const getHealthColor = (value: number): string => {
    if (value > 0.8) return 'text-green-600';
    if (value > 0.6) return 'text-blue-600';
    if (value > 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrajectoryIcon = (trajectory: string): string => {
    switch(trajectory) {
      case 'ascending': return '↗️';
      case 'descending': return '↘️';
      case 'oscillating': return '〰️';
      default: return '→';
    }
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">System Coherence Monitor</h2>
        <button
          onClick={() => setIsLive(!isLive)}
          className={`px-4 py-2 rounded ${isLive ? 'bg-green-600' : 'bg-gray-600'}`}
        >
          {isLive ? '● LIVE' : '○ PAUSED'}
        </button>
      </div>

      {/* Cymatic Visualization */}
      <div className="mb-6 bg-black rounded-lg p-4">
        <h3 className="text-sm text-gray-400 mb-2">Field Interference Pattern</h3>
        <canvas
          ref={canvasRef}
          width={800}
          height={200}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Field Coherence */}
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="text-lg font-medium mb-3">Field Coherence</h3>
          <div className="space-y-2">
            {Object.entries(fieldCoherence).map(([dim, value]) => (
              <div key={dim} className="flex justify-between items-center">
                <span className="text-sm capitalize">{dim}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${value * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs font-mono ${getHealthColor(value)}`}>
                    {(value * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Biome Health */}
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="text-lg font-medium mb-3">Biome Health</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm">
                <span>Resilience</span>
                <span className={getHealthColor(biomeHealth.resilience_score)}>
                  {(biomeHealth.resilience_score * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Pattern Diversity</span>
                <span className={getHealthColor(biomeHealth.pattern_diversity)}>
                  {(biomeHealth.pattern_diversity * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Recovery Time</span>
                <span className="text-gray-400">{biomeHealth.recovery_time}ms</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Module Coherence</span>
                <span className={getHealthColor(biomeHealth.module_coherence)}>
                  {(biomeHealth.module_coherence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Transformation Metrics */}
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="text-lg font-medium mb-3">Transformation Pulse</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm">
                <span>Agency Restoration</span>
                <span className="text-green-400">
                  +{(transformationMetrics.agency_restoration * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Relational Repair</span>
                <span className="text-blue-400">
                  +{(transformationMetrics.relational_repair * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Shadow Integration</span>
                <span className="text-purple-400">
                  {(transformationMetrics.shadow_integration * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-700">
              <div className="flex justify-between text-sm">
                <span>Trajectory</span>
                <span className="text-lg">
                  {getTrajectoryIcon(transformationMetrics.coherence_trajectory)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Pulse Timeline */}
      <div className="mt-6 bg-gray-800 p-4 rounded">
        <h3 className="text-lg font-medium mb-3">System Pulse</h3>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div>Throughput: {systemPulse[systemPulse.length - 1]?.throughput.toFixed(0)}ms</div>
          <div>Restraint: {systemPulse[systemPulse.length - 1]?.restraint_level.toFixed(1)}</div>
          <div>Accuracy: {((systemPulse[systemPulse.length - 1]?.accuracy || 0) * 100).toFixed(0)}%</div>
          <div>Learning: {systemPulse[systemPulse.length - 1]?.learning_rate.toFixed(1)} patterns/hr</div>
        </div>

        <div className="mt-3 flex h-12 items-end gap-1">
          {systemPulse.map((pulse, i) => (
            <div
              key={i}
              className="flex-1 bg-purple-600 opacity-60"
              style={{
                height: `${pulse.accuracy * 100}%`,
                backgroundColor: `hsl(${270 - pulse.restraint_level * 10}, 70%, 50%)`
              }}
            />
          ))}
        </div>
      </div>

      {/* Alert Conditions */}
      {fieldCoherence.overall < 0.5 && (
        <div className="mt-4 p-3 bg-yellow-900 border border-yellow-600 rounded">
          <p className="text-sm">⚠️ Field coherence below threshold. Consider increasing restraint.</p>
        </div>
      )}

      {biomeHealth.resilience_score < 0.6 && (
        <div className="mt-4 p-3 bg-red-900 border border-red-600 rounded">
          <p className="text-sm">⚠️ System resilience compromised. Check component health.</p>
        </div>
      )}
    </div>
  );
};

export default SystemCoherenceDashboard;