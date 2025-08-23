"use client";

import { useState, useEffect } from "react";
import { Brain, Users, BarChart3, Settings, AlertTriangle, TrendingUp, Database, Zap } from "lucide-react";

type WhispersMetric = {
  name: string;
  value: string | number;
  change: string;
  trend: "up" | "down" | "stable";
  status: "good" | "warning" | "critical";
};

type UserWeightDistribution = {
  elementBoost: { avg: number; min: number; max: number };
  recencyDays: { avg: number; min: number; max: number };
  recallBoost: { avg: number; min: number; max: number };
  customizations: number;
  totalUsers: number;
};

export default function WhispersAdminPanel() {
  const [metrics, setMetrics] = useState<WhispersMetric[]>([]);
  const [weightDistribution, setWeightDistribution] = useState<UserWeightDistribution | null>(null);
  const [rolloutPercentage, setRolloutPercentage] = useState(0);
  const [systemHealth, setSystemHealth] = useState<"healthy" | "degraded" | "critical">("healthy");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWhispersData();
    const interval = setInterval(fetchWhispersData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchWhispersData = async () => {
    // Simulate API calls - replace with real endpoints
    const mockMetrics: WhispersMetric[] = [
      {
        name: "Active Whispers Users",
        value: "127",
        change: "+23%",
        trend: "up",
        status: "good"
      },
      {
        name: "Avg Ranking Time",
        value: "98ms",
        change: "-12ms",
        trend: "down",
        status: "good"
      },
      {
        name: "Click-through Rate",
        value: "18.5%",
        change: "+2.1%", 
        trend: "up",
        status: "good"
      },
      {
        name: "Weight Fallback Rate",
        value: "1.2%",
        change: "-0.3%",
        trend: "down",
        status: "good"
      },
      {
        name: "Memory Surfacing",
        value: "2,847",
        change: "+456",
        trend: "up",
        status: "good"
      },
      {
        name: "Ranking Timeouts",
        value: "0.05%",
        change: "0%",
        trend: "stable",
        status: "good"
      }
    ];

    const mockDistribution: UserWeightDistribution = {
      elementBoost: { avg: 0.15, min: 0.05, max: 0.35 },
      recencyDays: { avg: 3.2, min: 1.0, max: 10.5 },
      recallBoost: { avg: 0.25, min: 0.10, max: 0.50 },
      customizations: 43,
      totalUsers: 127
    };

    setMetrics(mockMetrics);
    setWeightDistribution(mockDistribution);
    setSystemHealth("healthy");
    setLoading(false);
  };

  const handleRolloutChange = async (newPercentage: number) => {
    setRolloutPercentage(newPercentage);
    // Here you would call an API to update the rollout percentage
    console.log(`Updating rollout to ${newPercentage}%`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good": return "text-green-400 bg-green-500/10";
      case "warning": return "text-yellow-400 bg-yellow-500/10";
      case "critical": return "text-red-400 bg-red-500/10";
      default: return "text-gray-400 bg-gray-500/10";
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp className="w-3 h-3 text-green-400" />;
    if (trend === "down") return <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />;
    return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header & Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-ink-100 flex items-center gap-2">
            <Brain className="w-6 h-6" />
            Whispers System Control
          </h2>
          <p className="text-ink-400 mt-1">Manage contextual memory surfacing and ranking</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(systemHealth === "healthy" ? "good" : systemHealth)}`}>
            System {systemHealth}
          </div>
          <button className="px-4 py-2 bg-gold-400 text-bg-900 rounded-lg font-medium hover:bg-gold-300 transition-colors">
            Export Analytics
          </button>
        </div>
      </div>

      {/* Rollout Control */}
      <div className="p-6 rounded-2xl border border-edge-700 bg-bg-900">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-ink-100 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Feature Rollout Control
          </h3>
          <span className="text-2xl font-bold text-gold-400">{rolloutPercentage}%</span>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-ink-300 w-20">Rollout:</span>
            <input
              type="range"
              min={0} max={100} step={5}
              value={rolloutPercentage}
              onChange={(e) => handleRolloutChange(parseInt(e.target.value))}
              className="flex-1 accent-gold-400"
            />
            <span className="text-sm text-ink-300 w-12">{rolloutPercentage}%</span>
          </div>
          
          <div className="bg-edge-800 rounded-full h-2">
            <div 
              className="bg-gold-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${rolloutPercentage}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-ink-400">
            <span>0% - Disabled</span>
            <span>50% - Canary</span> 
            <span>100% - Full Rollout</span>
          </div>
          
          <div className="flex gap-2 pt-2">
            <button 
              onClick={() => handleRolloutChange(0)}
              className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
            >
              Emergency Stop
            </button>
            <button 
              onClick={() => handleRolloutChange(10)}
              className="px-3 py-1 text-xs bg-edge-700 text-ink-300 rounded hover:bg-edge-600 transition-colors"
            >
              10% Canary
            </button>
            <button 
              onClick={() => handleRolloutChange(100)}
              className="px-3 py-1 text-xs bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
            >
              Full Rollout
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-ink-100 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Performance Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map(metric => (
            <div key={metric.name} className="p-4 rounded-xl border border-edge-700 bg-bg-900">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-ink-100">{metric.name}</h4>
                <div className="flex items-center gap-1">
                  {getTrendIcon(metric.trend)}
                  <span className="text-xs text-ink-400">{metric.change}</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-ink-100 mb-1">
                {metric.value}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                {metric.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Weight Distribution Analysis */}
      {weightDistribution && (
        <div>
          <h3 className="text-lg font-semibold text-ink-100 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            User Weight Distribution
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-edge-700 bg-bg-900">
              <h4 className="font-medium text-ink-100 mb-3">Weight Statistics</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-ink-300">Element Boost</span>
                  <div className="text-sm text-ink-100">
                    {weightDistribution.elementBoost.avg.toFixed(2)} 
                    <span className="text-ink-400 ml-1">
                      ({weightDistribution.elementBoost.min.toFixed(2)} - {weightDistribution.elementBoost.max.toFixed(2)})
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-ink-300">Recency Days</span>
                  <div className="text-sm text-ink-100">
                    {weightDistribution.recencyDays.avg.toFixed(1)}
                    <span className="text-ink-400 ml-1">
                      ({weightDistribution.recencyDays.min.toFixed(1)} - {weightDistribution.recencyDays.max.toFixed(1)})
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-ink-300">Recall Boost</span>
                  <div className="text-sm text-ink-100">
                    {weightDistribution.recallBoost.avg.toFixed(2)}
                    <span className="text-ink-400 ml-1">
                      ({weightDistribution.recallBoost.min.toFixed(2)} - {weightDistribution.recallBoost.max.toFixed(2)})
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-xl border border-edge-700 bg-bg-900">
              <h4 className="font-medium text-ink-100 mb-3">Customization Rate</h4>
              <div className="text-center">
                <div className="text-3xl font-bold text-gold-400 mb-2">
                  {Math.round((weightDistribution.customizations / weightDistribution.totalUsers) * 100)}%
                </div>
                <div className="text-sm text-ink-300">
                  {weightDistribution.customizations} of {weightDistribution.totalUsers} users
                </div>
                <div className="mt-4 bg-edge-800 rounded-full h-2">
                  <div 
                    className="bg-gold-400 h-2 rounded-full transition-all"
                    style={{ width: `${(weightDistribution.customizations / weightDistribution.totalUsers) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Configuration */}
      <div>
        <h3 className="text-lg font-semibold text-ink-100 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          System Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-edge-700 bg-bg-900">
            <h4 className="font-medium text-ink-100 mb-3">Performance Limits</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-300">Max Items per Request</span>
                <span className="text-ink-100">10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-300">Ranking Timeout</span>
                <span className="text-ink-100">200ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-300">Cache Duration</span>
                <span className="text-ink-100">30s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-300">Memory Window</span>
                <span className="text-ink-100">30 days</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-xl border border-edge-700 bg-bg-900">
            <h4 className="font-medium text-ink-100 mb-3">Feature Flags</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-300">Context Ranking</span>
                <div className="w-10 h-5 bg-green-500 rounded-full relative">
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-300">Maya Voice Cues</span>
                <div className="w-10 h-5 bg-green-500 rounded-full relative">
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-300">Telemetry Collection</span>
                <div className="w-10 h-5 bg-green-500 rounded-full relative">
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-ink-100 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="p-3 rounded-lg bg-edge-800 hover:bg-edge-700 text-ink-300 text-sm transition-colors">
            Clear All Caches
          </button>
          <button className="p-3 rounded-lg bg-edge-800 hover:bg-edge-700 text-ink-300 text-sm transition-colors">
            Reset User Weights
          </button>
          <button className="p-3 rounded-lg bg-edge-800 hover:bg-edge-700 text-ink-300 text-sm transition-colors">
            Run Diagnostics
          </button>
          <button className="p-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm transition-colors">
            Emergency Disable
          </button>
        </div>
      </div>
    </div>
  );
}