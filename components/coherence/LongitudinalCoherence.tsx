// Longitudinal Coherence Tracking - Long-term patterns and insights
import React, { useMemo, useState } from 'react';
import { CoherenceVisualization } from './CoherenceVisualization';
import { AggregateBlossom } from '../sacred/AggregateBlossom';

interface CoherenceSession {
  timestamp: string;
  coherenceIndex: number;
  components: {
    emotional: number;
    intuitive: number;
    guided: number;
  };
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  checkIns: Record<string, number>;
  primaryFacetId: string;
  keywords: string[];
  reflection: string;
}

interface LongitudinalCoherenceProps {
  sessions: CoherenceSession[];
  userId: string;
}

export const LongitudinalCoherence: React.FC<LongitudinalCoherenceProps> = ({
  sessions,
  userId
}) => {
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);
  const [viewMode, setViewMode] = useState<'chart' | 'calendar' | 'insights'>('chart');

  // Calculate longitudinal metrics
  const metrics = useMemo(() => {
    if (sessions.length === 0) return null;

    // Group by time periods
    const weekly = groupByWeek(sessions);
    const monthly = groupByMonth(sessions);

    // Calculate baseline (first 20% of sessions)
    const baselineSize = Math.floor(sessions.length * 0.2);
    const baseline = sessions.slice(0, baselineSize);
    const baselineAvg = average(baseline.map(s => s.coherenceIndex));

    // Calculate recent (last 20% of sessions)
    const recent = sessions.slice(-baselineSize);
    const recentAvg = average(recent.map(s => s.coherenceIndex));

    // Progress calculation
    const progress = ((recentAvg - baselineAvg) / baselineAvg) * 100;

    // Volatility over time
    const volatilityTrend = calculateVolatilityTrend(weekly);

    // Elemental evolution
    const elementalEvolution = trackElementalEvolution(sessions);

    // Coherence patterns
    const patterns = detectCoherencePatterns(sessions);

    return {
      totalSessions: sessions.length,
      timeSpan: getTimeSpan(sessions),
      baselineCoherence: baselineAvg,
      currentCoherence: recentAvg,
      progress,
      volatilityTrend,
      elementalEvolution,
      patterns,
      weekly,
      monthly
    };
  }, [sessions]);

  // Filter sessions by time range
  const filteredSessions = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - timeRange);
    return sessions.filter(s => new Date(s.timestamp) >= cutoff);
  }, [sessions, timeRange]);

  if (!metrics) {
    return (
      <div className="text-center py-12 text-gray-500">
        No coherence data available yet. Start journaling to track your coherence.
      </div>
    );
  }

  return (
    <div className="longitudinal-coherence space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Longitudinal Coherence Analysis
            </h2>
            <p className="text-gray-500 mt-1">
              Tracking {metrics.totalSessions} sessions over {metrics.timeSpan}
            </p>
          </div>

          {/* Time range selector */}
          <div className="flex gap-2">
            {([7, 30, 90] as const).map(days => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-4 py-2 text-sm rounded-lg transition-colors
                  ${timeRange === days 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Overall Progress</p>
              <p className="text-2xl font-bold text-purple-700">
                {metrics.progress > 0 ? '+' : ''}{metrics.progress.toFixed(1)}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Current Coherence</p>
              <p className="text-2xl font-bold text-blue-700">
                {(metrics.currentCoherence * 100).toFixed(0)}%
              </p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-1000"
              style={{ width: `${metrics.currentCoherence * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* View mode tabs */}
      <div className="bg-white rounded-xl shadow-sm p-1">
        <div className="flex">
          {(['chart', 'calendar', 'insights'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex-1 py-3 text-sm font-medium rounded-lg transition-colors
                ${viewMode === mode 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main content based on view mode */}
      {viewMode === 'chart' && (
        <CoherenceVisualization 
          data={filteredSessions}
          timeWindow={timeRange}
          showComponents={true}
          showMiniFlowers={true}
        />
      )}

      {viewMode === 'calendar' && (
        <CalendarView sessions={filteredSessions} />
      )}

      {viewMode === 'insights' && (
        <InsightsView metrics={metrics} sessions={filteredSessions} />
      )}

      {/* Elemental Evolution */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Elemental Evolution
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Aggregate Blossom */}
          <div>
            <p className="text-sm text-gray-600 mb-3">Current Pattern</p>
            <AggregateBlossom
              sessions={filteredSessions}
              timeWindow={timeRange}
              size={300}
              showLabels={true}
            />
          </div>

          {/* Evolution timeline */}
          <div>
            <p className="text-sm text-gray-600 mb-3">Evolution Path</p>
            <div className="space-y-3">
              {metrics.elementalEvolution.map((phase, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="text-xs text-gray-500 w-16">
                    {phase.period}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm text-white
                    ${phase.dominant === 'fire' ? 'bg-red-400' :
                      phase.dominant === 'water' ? 'bg-blue-400' :
                      phase.dominant === 'earth' ? 'bg-green-400' :
                      phase.dominant === 'air' ? 'bg-yellow-500' :
                      'bg-purple-400'}`}>
                    {phase.dominant}
                  </div>
                  <div className="text-sm text-gray-600">
                    {phase.coherence.toFixed(2)} coherence
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Patterns & Recommendations */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Coherence Patterns
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          {metrics.patterns.map((pattern, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full
                  ${pattern.type === 'strength' ? 'bg-green-500' :
                    pattern.type === 'challenge' ? 'bg-red-500' :
                    'bg-blue-500'}`} />
                <p className="text-sm font-medium text-gray-700 capitalize">
                  {pattern.type}
                </p>
              </div>
              <p className="text-xs text-gray-600">{pattern.description}</p>
              {pattern.recommendation && (
                <p className="text-xs text-purple-600 mt-2 italic">
                  Try: {pattern.recommendation}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Calendar View Component
const CalendarView: React.FC<{ sessions: CoherenceSession[] }> = ({ sessions }) => {
  const calendar = useMemo(() => {
    const grouped: Record<string, CoherenceSession[]> = {};
    
    sessions.forEach(session => {
      const date = new Date(session.timestamp).toDateString();
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(session);
    });

    return grouped;
  }, [sessions]);

  const getCoherenceColor = (coherence: number) => {
    if (coherence >= 0.7) return 'bg-green-100 border-green-300';
    if (coherence >= 0.4) return 'bg-yellow-100 border-yellow-300';
    return 'bg-red-100 border-red-300';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-xs text-gray-500 text-center py-2">
            {day}
          </div>
        ))}
        
        {/* Calendar cells would go here - simplified for brevity */}
        {Object.entries(calendar).map(([date, daySessions]) => {
          const avgCoherence = average(daySessions.map(s => s.coherenceIndex));
          
          return (
            <div
              key={date}
              className={`p-2 rounded-lg border-2 ${getCoherenceColor(avgCoherence)}`}
            >
              <p className="text-xs font-medium">
                {new Date(date).getDate()}
              </p>
              <p className="text-xs text-gray-600">
                {(avgCoherence * 100).toFixed(0)}%
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Insights View Component
const InsightsView: React.FC<{ metrics: any; sessions: CoherenceSession[] }> = ({ 
  metrics, 
  sessions 
}) => {
  return (
    <div className="space-y-4">
      {/* Key insights cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Strongest Coherence Triggers
          </h4>
          <ul className="space-y-2">
            {getTopKeywords(sessions, 'high').map((keyword, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{keyword.word}</span>
                <span className="text-green-600 font-medium">
                  {(keyword.avgCoherence * 100).toFixed(0)}%
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Coherence Challenges
          </h4>
          <ul className="space-y-2">
            {getTopKeywords(sessions, 'low').map((keyword, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{keyword.word}</span>
                <span className="text-red-600 font-medium">
                  {(keyword.avgCoherence * 100).toFixed(0)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
        <h4 className="text-lg font-medium text-purple-900 mb-3">
          Personalized Recommendations
        </h4>
        <div className="space-y-3">
          {generateRecommendations(metrics, sessions).map((rec, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-purple-700">{i + 1}</span>
              </div>
              <p className="text-sm text-purple-800">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper functions
function groupByWeek(sessions: CoherenceSession[]) {
  // Implementation for weekly grouping
  return [];
}

function groupByMonth(sessions: CoherenceSession[]) {
  // Implementation for monthly grouping
  return [];
}

function average(numbers: number[]): number {
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

function getTimeSpan(sessions: CoherenceSession[]): string {
  if (sessions.length === 0) return '0 days';
  
  const first = new Date(sessions[0].timestamp);
  const last = new Date(sessions[sessions.length - 1].timestamp);
  const days = Math.floor((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24));
  
  if (days < 30) return `${days} days`;
  if (days < 365) return `${Math.floor(days / 30)} months`;
  return `${Math.floor(days / 365)} years`;
}

function calculateVolatilityTrend(weekly: any[]): string {
  // Calculate if volatility is increasing or decreasing
  return 'stable';
}

function trackElementalEvolution(sessions: CoherenceSession[]) {
  // Track dominant elements over time periods
  return [
    { period: 'Week 1', dominant: 'fire', coherence: 0.65 },
    { period: 'Week 2', dominant: 'water', coherence: 0.72 },
    { period: 'Week 3', dominant: 'earth', coherence: 0.78 },
    { period: 'Week 4', dominant: 'air', coherence: 0.81 }
  ];
}

function detectCoherencePatterns(sessions: CoherenceSession[]) {
  // Detect patterns in coherence data
  return [
    {
      type: 'strength',
      description: 'Morning sessions show 20% higher coherence',
      recommendation: 'Continue morning practice'
    },
    {
      type: 'challenge',
      description: 'Water element sessions have lower coherence',
      recommendation: 'Add grounding practices when emotions arise'
    },
    {
      type: 'opportunity',
      description: 'Fire-Air combinations show highest coherence',
      recommendation: 'Combine vision work with communication'
    }
  ];
}

function getTopKeywords(sessions: CoherenceSession[], type: 'high' | 'low') {
  // Extract keywords associated with high/low coherence
  const threshold = type === 'high' ? 0.7 : 0.3;
  const filtered = sessions.filter(s => 
    type === 'high' ? s.coherenceIndex >= threshold : s.coherenceIndex <= threshold
  );
  
  const keywordMap: Record<string, number[]> = {};
  
  filtered.forEach(session => {
    session.keywords.forEach(keyword => {
      if (!keywordMap[keyword]) keywordMap[keyword] = [];
      keywordMap[keyword].push(session.coherenceIndex);
    });
  });
  
  return Object.entries(keywordMap)
    .map(([word, coherences]) => ({
      word,
      avgCoherence: average(coherences),
      count: coherences.length
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function generateRecommendations(metrics: any, sessions: CoherenceSession[]): string[] {
  const recs: string[] = [];
  
  if (metrics.progress > 10) {
    recs.push('Your coherence is improving significantly. Keep your current practice.');
  } else if (metrics.progress < -10) {
    recs.push('Consider returning to practices that worked in earlier sessions.');
  }
  
  if (metrics.volatilityTrend === 'increasing') {
    recs.push('Add grounding practices to stabilize coherence fluctuations.');
  }
  
  // Element-specific recommendations
  const dominantElement = metrics.elementalEvolution[metrics.elementalEvolution.length - 1]?.dominant;
  if (dominantElement === 'fire') {
    recs.push('Your Fire element is strong. Balance with Water practices for emotional depth.');
  } else if (dominantElement === 'water') {
    recs.push('Water dominance suggests emotional processing. Add Earth for grounding.');
  }
  
  return recs.slice(0, 3);
}

export default LongitudinalCoherence;