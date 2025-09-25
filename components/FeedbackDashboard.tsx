import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

interface FeedbackEntry {
  id: string;
  testerId: string;
  sessionId: string;
  createdAt: string;
  voiceQuality?: number;
  presenceDepth?: number;
  sacredResonance?: number;
  technicalFlow?: number;
  collectiveInsight?: number;
  freeformText?: string;
  voiceNoteUrl?: string;
  voiceProvider: string;
  agent: string;
  elementalState?: string;
  trustLevel?: number;
}

const DIMENSION_COLORS = {
  voiceQuality: "#f59e0b",
  presenceDepth: "#3b82f6",
  sacredResonance: "#8b5cf6",
  technicalFlow: "#10b981",
  collectiveInsight: "#ec4899"
};

export default function FeedbackDashboard() {
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDimension, setSelectedDimension] = useState<string>("all");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/feedback");
        const data = await res.json();
        setFeedback(data);
        setLoading(false);
      } catch (err) {
        console.error("Error loading feedback:", err);
      }
    }
    fetchData();

    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-8 text-gray-400">Loading presence data...</div>;

  // Calculate averages
  const dimensions = ['voiceQuality', 'presenceDepth', 'sacredResonance', 'technicalFlow', 'collectiveInsight'];
  const averages = dimensions.map(dim => ({
    name: dim.replace(/([A-Z])/g, ' $1').trim(),
    score: feedback.length > 0
      ? (feedback.reduce((sum, f) => sum + (f[dim as keyof FeedbackEntry] as number || 0), 0) / feedback.length)
      : 0,
    key: dim
  }));

  // Trust timeline
  const trustTimeline = feedback
    .filter(f => f.trustLevel)
    .map(f => ({
      time: new Date(f.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      trust: f.trustLevel || 0,
      agent: f.agent
    }));

  // Elemental distribution
  const elementalCounts = feedback.reduce((acc, f) => {
    if (f.elementalState) acc[f.elementalState] = (acc[f.elementalState] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const elementalData = Object.entries(elementalCounts).map(([element, count]) => ({
    element,
    count
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Beta Feedback Dashboard</h1>
          <div className="text-sm text-gray-500">
            {feedback.length} sessions • Live updating
          </div>
        </div>

        {/* Sacred Dimensions Grid */}
        <div className="grid grid-cols-5 gap-4">
          {averages.map(dim => (
            <div
              key={dim.key}
              className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedDimension(dim.key === selectedDimension ? "all" : dim.key)}
            >
              <div className="text-xs text-gray-500 uppercase tracking-wider">{dim.name}</div>
              <div className="mt-2 flex items-baseline">
                <span className="text-2xl font-semibold" style={{ color: DIMENSION_COLORS[dim.key as keyof typeof DIMENSION_COLORS] }}>
                  {dim.score.toFixed(1)}
                </span>
                <span className="ml-1 text-sm text-gray-400">/5</span>
              </div>
              <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${(dim.score / 5) * 100}%`,
                    backgroundColor: DIMENSION_COLORS[dim.key as keyof typeof DIMENSION_COLORS]
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Trust Level Timeline */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Trust Level Over Time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trustTimeline}>
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis domain={[0, 1]} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Line
                  type="monotone"
                  dataKey="trust"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Elemental State Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Elemental States Active</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={elementalData}>
                <XAxis dataKey="element" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Bar dataKey="count" fill="#10b981">
                  {elementalData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.element === 'fire' ? '#ef4444' :
                        entry.element === 'water' ? '#3b82f6' :
                        entry.element === 'earth' ? '#84cc16' :
                        entry.element === 'air' ? '#06b6d4' :
                        '#8b5cf6'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Feedback Stream */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Live Feedback Stream</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {feedback.slice(-10).reverse().map(f => (
              <div key={f.id} className="border-l-2 border-gray-200 pl-4 py-2 hover:border-amber-400 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">{f.agent}</span>
                    {f.elementalState && (
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{f.elementalState}</span>
                    )}
                    <span className="text-xs text-gray-400">{f.voiceProvider}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(f.createdAt).toLocaleString()}
                  </span>
                </div>
                {f.freeformText && (
                  <p className="mt-2 text-sm text-gray-600 italic">"{f.freeformText}"</p>
                )}
                {f.voiceNoteUrl && (
                  <audio controls className="mt-2 h-8">
                    <source src={f.voiceNoteUrl} type="audio/mpeg" />
                  </audio>
                )}
                {f.trustLevel && (
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Trust:</span>
                    <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden max-w-xs">
                      <div
                        className="h-full bg-amber-500 transition-all duration-500"
                        style={{ width: `${f.trustLevel * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{(f.trustLevel * 100).toFixed(0)}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}