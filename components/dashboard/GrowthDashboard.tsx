"use client";

import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, TrendingUp, TrendingDown, Minus, Brain, Heart, Zap, Mountain } from "lucide-react";

interface GrowthDashboardProps {
  userId: string;
  timeRange?: string;
}

interface DashboardData {
  mood: Array<{ date: string; score: number }>;
  coherenceScore: number;
  breakthroughs: Array<{
    date: string;
    description: string;
    intensity: number;
    context?: string;
  }>;
  escalations: Array<{
    date: string;
    reason: string;
    status: string;
    resolved: boolean;
  }>;
  assessmentTrends: Array<{
    assessmentType: string;
    scores: Array<{ date: string; score: number; interpretation: string }>;
    currentScore: number;
    trend: 'improving' | 'stable' | 'declining';
  }>;
  emotionalWeather: Array<{
    date: string;
    fire: number;
    water: number;
    earth: number;
    air: number;
    balance: number;
  }>;
  metadata: {
    timeRange: number;
    lastUpdated: string;
    dataPoints: {
      moodEntries: number;
      breakthroughCount: number;
      escalationCount: number;
    };
  };
}

export default function GrowthDashboard({ userId, timeRange = "30" }: GrowthDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [userId, timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard/growth?userId=${userId}&timeRange=${timeRange}`);

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const dashboardData = await response.json();
      setData(dashboardData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-64 bg-gray-200 rounded"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4">
        <Card className="border-red-200">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Dashboard</h3>
            <p className="text-red-600 mb-4">{error || 'Unknown error occurred'}</p>
            <button
              onClick={fetchDashboardData}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen">

      {/* Header Stats */}
      <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <StatsCard
          title="Coherence Score"
          value={data.coherenceScore}
          icon={<Brain className="w-6 h-6" />}
          suffix="%"
          color="bg-gradient-to-r from-purple-500 to-pink-500"
        />
        <StatsCard
          title="Breakthrough Moments"
          value={data.breakthroughs.length}
          icon={<Zap className="w-6 h-6" />}
          color="bg-gradient-to-r from-yellow-500 to-orange-500"
        />
        <StatsCard
          title="Emotional Balance"
          value={Math.round((data.emotionalWeather[0]?.balance || 0) * 100)}
          icon={<Heart className="w-6 h-6" />}
          suffix="%"
          color="bg-gradient-to-r from-green-500 to-blue-500"
        />
        <StatsCard
          title="Active Days"
          value={data.metadata.dataPoints.moodEntries}
          icon={<Mountain className="w-6 h-6" />}
          color="bg-gradient-to-r from-blue-500 to-indigo-500"
        />
      </div>

      {/* Emotional Weather Pattern */}
      <Card className="lg:col-span-8 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            Emotional Weather
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmotionalWeatherChart data={data.emotionalWeather} />
          <div className="mt-4 text-sm text-gray-600">
            Your emotional balance reflects the harmony between different elemental energies
          </div>
        </CardContent>
      </Card>

      {/* Coherence Score */}
      <Card className="lg:col-span-4 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            Coherence Level
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
          <CircularProgress value={data.coherenceScore} />
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span>Growth Velocity:</span>
              <TrendIcon trend="improving" />
            </div>
            <div className="flex justify-between items-center">
              <span>Emotional Stability:</span>
              <span className="text-green-600 font-medium">Stable</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mood Timeline */}
      <Card className="lg:col-span-8 shadow-lg">
        <CardHeader>
          <CardTitle>Mood Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <MoodTimelineChart data={data.mood} />
        </CardContent>
      </Card>

      {/* Assessment Trends */}
      <Card className="lg:col-span-4 shadow-lg">
        <CardHeader>
          <CardTitle>Assessment Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <AssessmentTrends trends={data.assessmentTrends} />
        </CardContent>
      </Card>

      {/* Breakthrough Timeline */}
      <Card className="lg:col-span-12 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Breakthrough Moments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BreakthroughTimeline breakthroughs={data.breakthroughs} />
        </CardContent>
      </Card>

      {/* Elemental Radar Chart */}
      <Card className="lg:col-span-6 shadow-lg">
        <CardHeader>
          <CardTitle>Elemental Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <ElementalRadar data={data.emotionalWeather} />
        </CardContent>
      </Card>

      {/* Safety Status */}
      {data.escalations.length > 0 && (
        <Card className="lg:col-span-6 shadow-lg border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <AlertCircle className="w-5 h-5" />
              Safety & Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SafetyStatus escalations={data.escalations} />
          </CardContent>
        </Card>
      )}

    </div>
  );
}

// Supporting Components

function StatsCard({ title, value, icon, suffix = "", color }: {
  title: string;
  value: number;
  icon: React.ReactNode;
  suffix?: string;
  color: string;
}) {
  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">
              {value}{suffix}
            </p>
          </div>
          <div className={`p-3 rounded-full ${color} text-white`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmotionalWeatherChart({ data }: { data: DashboardData['emotionalWeather'] }) {
  const colors = {
    fire: '#ef4444',   // red
    water: '#3b82f6',  // blue
    earth: '#84cc16',  // green
    air: '#fbbf24'     // yellow
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="fire" stackId="1" fill={colors.fire} fillOpacity={0.6} />
        <Area type="monotone" dataKey="water" stackId="1" fill={colors.water} fillOpacity={0.6} />
        <Area type="monotone" dataKey="earth" stackId="1" fill={colors.earth} fillOpacity={0.6} />
        <Area type="monotone" dataKey="air" stackId="1" fill={colors.air} fillOpacity={0.6} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function MoodTimelineChart({ data }: { data: DashboardData['mood'] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis domain={[-1, 1]} />
        <Tooltip />
        <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function CircularProgress({ value }: { value: number }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(value / 100) * circumference} ${circumference}`;

  return (
    <div className="relative w-32 h-32">
      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          className="text-purple-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-purple-600">{value}%</span>
      </div>
    </div>
  );
}

function TrendIcon({ trend }: { trend: 'improving' | 'stable' | 'declining' }) {
  switch (trend) {
    case 'improving':
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    case 'declining':
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    default:
      return <Minus className="w-4 h-4 text-gray-500" />;
  }
}

function AssessmentTrends({ trends }: { trends: DashboardData['assessmentTrends'] }) {
  if (trends.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>No assessment data available</p>
        <p className="text-sm mt-2">Assessments will appear as you engage with MAIA</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {trends.map((trend, index) => (
        <div key={index} className="border-b pb-3 last:border-b-0">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-sm">{trend.assessmentType}</span>
            <TrendIcon trend={trend.trend} />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Current Score:</span>
            <span className="font-bold">{trend.currentScore}</span>
          </div>
          {trend.scores.length > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              {trend.scores[trend.scores.length - 1].interpretation}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function BreakthroughTimeline({ breakthroughs }: { breakthroughs: DashboardData['breakthroughs'] }) {
  if (breakthroughs.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <Zap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No breakthrough moments recorded yet</p>
        <p className="text-sm mt-2">Breakthrough moments will be automatically detected during your conversations</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-pink-500"></div>

      {breakthroughs.map((breakthrough, idx) => (
        <div key={idx} className="flex items-start mb-8 relative">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold z-10">
            ✨
          </div>
          <div className="ml-6 flex-1">
            <div className="text-sm text-gray-500">{breakthrough.date}</div>
            <div className="mt-1 p-3 bg-purple-50 rounded-lg">
              <p className="font-medium text-purple-800">{breakthrough.description}</p>
              {breakthrough.context && (
                <p className="text-sm text-purple-600 mt-2">{breakthrough.context}</p>
              )}
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-purple-600">Intensity:</span>
                  <div className="w-20 h-2 bg-purple-200 rounded-full">
                    <div
                      className="h-2 bg-purple-500 rounded-full"
                      style={{ width: `${breakthrough.intensity * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ElementalRadar({ data }: { data: DashboardData['emotionalWeather'] }) {
  if (data.length === 0) return <div className="text-center text-gray-500">No elemental data available</div>;

  const latestData = data[0];
  const radarData = [
    { element: 'Fire', value: latestData.fire * 100, fullMark: 100 },
    { element: 'Water', value: latestData.water * 100, fullMark: 100 },
    { element: 'Earth', value: latestData.earth * 100, fullMark: 100 },
    { element: 'Air', value: latestData.air * 100, fullMark: 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <RadarChart data={radarData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="element" />
        <PolarRadiusAxis angle={90} domain={[0, 100]} />
        <Radar
          name="Balance"
          dataKey="value"
          stroke="#8b5cf6"
          fill="#8b5cf6"
          fillOpacity={0.3}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function SafetyStatus({ escalations }: { escalations: DashboardData['escalations'] }) {
  return (
    <div className="space-y-3">
      {escalations.map((escalation, idx) => (
        <div key={idx} className="flex items-start gap-3">
          {escalation.resolved ? (
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{escalation.date}</p>
            <p className="text-sm text-gray-600">{escalation.reason}</p>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
              escalation.resolved
                ? 'bg-green-100 text-green-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {escalation.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}