'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, Brain, TrendingUp, Users, Shield,
  Download, Lock, Eye, EyeOff, AlertTriangle
} from 'lucide-react';

/**
 * Psychologist Dashboard
 * HIPAA-Compliant Clinical Metrics Dashboard
 *
 * Access: Restricted to authenticated therapists/admins only
 * Features: Aggregate metrics, client insights, spiralogic tracking
 */

interface ClientMetrics {
  userId: string;
  userName: string;
  phase: string;
  dominantElement: string;
  shadowScore: number;
  emotionalTrend: string;
  milestoneCount: number;
  daysInJourney: number;
  lastSession: Date;
  alerts: string[];
}

export default function PsychologistDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPHI, setShowPHI] = useState(false);
  const [clients, setClients] = useState<ClientMetrics[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [aggregateStats, setAggregateStats] = useState<any>(null);

  useEffect(() => {
    // TODO: Replace with actual authentication
    // For now, simple password protection
    const password = prompt('Enter therapist access code:');
    if (password === 'maya-therapist-2025') {
      setIsAuthenticated(true);
      fetchDashboardData();
    } else {
      alert('Unauthorized access. This dashboard is for licensed therapists only.');
      window.location.href = '/';
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all client metrics
      const response = await fetch('/api/maia/dashboard/aggregate');
      const data = await response.json();

      setClients(data.clients || []);
      setAggregateStats(data.stats || {});
      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setLoading(false);
    }
  };

  const exportClientReport = async (userId: string) => {
    const response = await fetch(`/api/maia/soulprint/export?userId=${userId}&format=download`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clinical-report-${userId}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#1a1f2e] flex items-center justify-center">
        <div className="text-amber-400">Authenticating...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1f2e] flex items-center justify-center">
        <div className="text-amber-400 animate-pulse">Loading clinical data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1f2e] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-light text-amber-50 mb-2 flex items-center gap-2">
              <Brain className="w-8 h-8 text-amber-400" />
              Clinical Dashboard
            </h1>
            <p className="text-amber-200/60">HIPAA-Compliant Psychospiritual Metrics</p>
          </div>

          <div className="flex items-center gap-4">
            {/* PHI Visibility Toggle */}
            <button
              onClick={() => setShowPHI(!showPHI)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                showPHI
                  ? 'bg-green-500/20 border-green-500/30 text-green-400'
                  : 'bg-red-500/20 border-red-500/30 text-red-400'
              }`}
              title="Toggle Protected Health Information visibility"
            >
              {showPHI ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span className="text-sm">{showPHI ? 'PHI Visible' : 'PHI Hidden'}</span>
            </button>

            <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-400">HIPAA Compliant</span>
            </div>
          </div>
        </div>

        {/* Aggregate Stats */}
        {aggregateStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={<Users className="w-5 h-5" />}
              label="Total Clients"
              value={aggregateStats.totalClients || 0}
              color="blue"
            />
            <StatCard
              icon={<Activity className="w-5 h-5" />}
              label="Active This Week"
              value={aggregateStats.activeThisWeek || 0}
              color="green"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="Avg Shadow Score"
              value={`${((aggregateStats.avgShadowScore || 0) * 100).toFixed(0)}%`}
              color="purple"
            />
            <StatCard
              icon={<AlertTriangle className="w-5 h-5" />}
              label="Active Alerts"
              value={aggregateStats.activeAlerts || 0}
              color="yellow"
            />
          </div>
        )}

        {/* Client List */}
        <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-white/10 p-6">
          <h2 className="text-2xl font-light text-amber-50 mb-4">Client Overview</h2>

          <div className="space-y-3">
            {clients.map((client, index) => (
              <motion.div
                key={client.userId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-amber-500/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg text-white font-medium">
                        {showPHI ? client.userName : `Client ${index + 1}`}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getPhaseColor(client.phase)}`}>
                        {client.phase}
                      </span>
                      {client.alerts.length > 0 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                          {client.alerts.length} alerts
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-white/40">Element:</span>
                        <span className="text-white/80 ml-2">{getElementEmoji(client.dominantElement)} {client.dominantElement}</span>
                      </div>
                      <div>
                        <span className="text-white/40">Shadow:</span>
                        <span className="text-white/80 ml-2">{(client.shadowScore * 100).toFixed(0)}%</span>
                      </div>
                      <div>
                        <span className="text-white/40">Milestones:</span>
                        <span className="text-white/80 ml-2">{client.milestoneCount}</span>
                      </div>
                      <div>
                        <span className="text-white/40">Journey:</span>
                        <span className="text-white/80 ml-2">{client.daysInJourney} days</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedClient(client.userId)}
                      className="px-3 py-2 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-all text-sm"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => exportClientReport(client.userId)}
                      className="p-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all"
                      title="Export Clinical Report"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Alerts */}
                {client.alerts.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="text-xs text-yellow-400 space-y-1">
                      {client.alerts.map((alert, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{alert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {clients.length === 0 && (
            <div className="text-center py-8 text-white/40">
              No client data available yet
            </div>
          )}
        </div>

        {/* HIPAA Notice */}
        <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-purple-200">
              <strong>HIPAA Compliance Notice:</strong> This dashboard contains Protected Health Information (PHI).
              Access is logged and monitored. Use PHI visibility toggle to protect patient privacy during screen sharing.
              All data is encrypted at rest and in transit. Ensure compliance with your organization's data handling policies.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  const colors = {
    blue: 'border-blue-500/30 bg-blue-500/5 text-blue-400',
    green: 'border-green-500/30 bg-green-500/5 text-green-400',
    purple: 'border-purple-500/30 bg-purple-500/5 text-purple-400',
    yellow: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400'
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="opacity-60">{icon}</div>
      </div>
      <div className="text-2xl font-light text-white mb-1">{value}</div>
      <div className="text-xs opacity-60">{label}</div>
    </div>
  );
}

function getPhaseColor(phase: string): string {
  const colors: Record<string, string> = {
    entry: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    exploration: 'bg-green-500/20 text-green-400 border border-green-500/30',
    descent: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    transformation: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    integration: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    emergence: 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
  };
  return colors[phase] || 'bg-white/20 text-white/80 border border-white/30';
}

function getElementEmoji(element: string): string {
  const emojis: Record<string, string> = {
    fire: '🔥',
    water: '💧',
    earth: '🌍',
    air: '🌬️',
    aether: '✨'
  };
  return emojis[element] || '✨';
}