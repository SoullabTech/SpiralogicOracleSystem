'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { DateTime } from 'luxon';

interface WellnessData {
  week: string;
  depression_score: number;
  anxiety_score: number;
  overall_wellness: number;
  breakthrough_moments: number;
  crisis_flags: number;
  session_count: number;
  mindfulness_minutes: number;
  trajectory: 'improving' | 'stable' | 'declining' | 'crisis';
}

interface MilestoneData {
  type: string;
  achievement: string;
  date: string;
  improvement: number;
  celebration: boolean;
}

interface SafetyMetrics {
  current_risk: 'low' | 'moderate' | 'elevated' | 'high';
  days_since_crisis: number;
  protective_factors: string[];
  recent_assessments: any[];
}

const WellnessTrajectoryDashboard: React.FC<{ userId: string }> = ({ userId }) => {
  const [trajectoryData, setTrajectoryData] = useState<WellnessData[]>([]);
  const [milestones, setMilestones] = useState<MilestoneData[]>([]);
  const [safetyMetrics, setSafetyMetrics] = useState<SafetyMetrics | null>(null);
  const [timeRange, setTimeRange] = useState<'4weeks' | '12weeks' | '6months'>('12weeks');

  useEffect(() => {
    loadDashboardData();
  }, [userId, timeRange]);

  const loadDashboardData = async () => {
    // This would connect to your Supabase database
    const mockTrajectoryData: WellnessData[] = [
      {
        week: '2025-01-01',
        depression_score: 4.2,
        anxiety_score: 3.8,
        overall_wellness: 6.1,
        breakthrough_moments: 1,
        crisis_flags: 2,
        session_count: 3,
        mindfulness_minutes: 45,
        trajectory: 'stable'
      },
      {
        week: '2025-01-08',
        depression_score: 3.8,
        anxiety_score: 3.5,
        overall_wellness: 6.8,
        breakthrough_moments: 2,
        crisis_flags: 1,
        session_count: 4,
        mindfulness_minutes: 62,
        trajectory: 'improving'
      },
      {
        week: '2025-01-15',
        depression_score: 3.2,
        anxiety_score: 3.1,
        overall_wellness: 7.5,
        breakthrough_moments: 3,
        crisis_flags: 0,
        session_count: 5,
        mindfulness_minutes: 78,
        trajectory: 'improving'
      }
    ];

    const mockMilestones: MilestoneData[] = [
      {
        type: 'depression_improvement',
        achievement: '25% reduction in PHQ-2 score',
        date: '2025-01-15',
        improvement: 25,
        celebration: false
      },
      {
        type: 'breakthrough_streak',
        achievement: '3 consecutive weeks with breakthroughs',
        date: '2025-01-15',
        improvement: 100,
        celebration: true
      }
    ];

    const mockSafety: SafetyMetrics = {
      current_risk: 'low',
      days_since_crisis: 28,
      protective_factors: ['Strong therapeutic alliance', 'Regular mindfulness practice', 'Consistent sleep schedule'],
      recent_assessments: []
    };

    setTrajectoryData(mockTrajectoryData);
    setMilestones(mockMilestones);
    setSafetyMetrics(mockSafety);
  };

  const getTrajectoryColor = (trajectory: string) => {
    switch (trajectory) {
      case 'improving': return '#22c55e';
      case 'stable': return '#3b82f6';
      case 'declining': return '#f59e0b';
      case 'crisis': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const WellnessOverviewCard = () => {
    const latest = trajectoryData[trajectoryData.length - 1];
    if (!latest) return null;

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-4">Wellness Overview</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{latest.overall_wellness.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Overall Wellness Score</div>
          </div>
          <div className="text-center">
            <div
              className={`text-2xl font-bold`}
              style={{ color: getTrajectoryColor(latest.trajectory) }}
            >
              {latest.trajectory.charAt(0).toUpperCase() + latest.trajectory.slice(1)}
            </div>
            <div className="text-sm text-gray-600">Current Trajectory</div>
          </div>
        </div>
      </div>
    );
  };

  const TrajectoryChart = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Wellness Trajectory</h3>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="text-sm border rounded px-2 py-1"
        >
          <option value="4weeks">4 Weeks</option>
          <option value="12weeks">12 Weeks</option>
          <option value="6months">6 Months</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trajectoryData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="week"
            tickFormatter={(value) => DateTime.fromISO(value).toFormat('MMM dd')}
          />
          <YAxis domain={[0, 10]} />
          <Tooltip
            labelFormatter={(value) => DateTime.fromISO(value as string).toFormat('MMM dd, yyyy')}
            formatter={(value: number, name: string) => [
              value.toFixed(1),
              name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
            ]}
          />
          <Line
            type="monotone"
            dataKey="overall_wellness"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            name="Overall Wellness"
          />
          <Line
            type="monotone"
            dataKey="depression_score"
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Depression Score"
          />
          <Line
            type="monotone"
            dataKey="anxiety_score"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Anxiety Score"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const BreakthroughsChart = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-medium mb-4">Growth Insights</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={trajectoryData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="week"
            tickFormatter={(value) => DateTime.fromISO(value).toFormat('MMM dd')}
          />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="breakthrough_moments"
            stackId="1"
            stroke="#22c55e"
            fill="#22c55e"
            fillOpacity={0.6}
            name="Breakthrough Moments"
          />
          <Area
            type="monotone"
            dataKey="mindfulness_minutes"
            stackId="2"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.4}
            name="Mindfulness Minutes"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  const SafetyStatusCard = () => {
    if (!safetyMetrics) return null;

    const riskColors = {
      low: '#22c55e',
      moderate: '#f59e0b',
      elevated: '#f97316',
      high: '#ef4444'
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-4">Safety & Wellness</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Risk Level</span>
            <span
              className="px-3 py-1 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: riskColors[safetyMetrics.current_risk] }}
            >
              {safetyMetrics.current_risk.charAt(0).toUpperCase() + safetyMetrics.current_risk.slice(1)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Days Since Crisis</span>
            <span className="text-lg font-bold text-green-600">
              {safetyMetrics.days_since_crisis}
            </span>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Protective Factors</div>
            <div className="space-y-1">
              {safetyMetrics.protective_factors.map((factor, index) => (
                <div key={index} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                  ✓ {factor}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const MilestonesCard = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-medium mb-4">Recent Milestones</h3>
      <div className="space-y-3">
        {milestones.map((milestone, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="text-2xl">
              {milestone.celebration ? '🎉' : '📈'}
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">{milestone.achievement}</div>
              <div className="text-xs text-gray-600">
                {DateTime.fromISO(milestone.date).toFormat('MMM dd')} • {milestone.improvement}% improvement
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const AssessmentProgress = () => {
    const assessmentData = [
      { name: 'PHQ-2', score: 2.1, max: 6, improvement: '+15%' },
      { name: 'GAD-2', score: 1.8, max: 6, improvement: '+22%' },
      { name: 'Session Mood', score: 7.2, max: 10, improvement: '+8%' }
    ];

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-4">Assessment Progress</h3>
        <div className="space-y-4">
          {assessmentData.map((assessment, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{assessment.name}</span>
                <span className="text-xs text-green-600">{assessment.improvement}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(assessment.score / assessment.max) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>{assessment.score}</span>
                <span>{assessment.max}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Wellness Journey Dashboard</h1>
        <p className="text-gray-600">Track your growth, insights, and wellbeing over time</p>
      </div>

      {/* Top Row - Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <WellnessOverviewCard />
        <SafetyStatusCard />
        <MilestonesCard />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <TrajectoryChart />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BreakthroughsChart />
        <AssessmentProgress />
      </div>
    </div>
  );
};

export default WellnessTrajectoryDashboard;