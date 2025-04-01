import React from 'react';
import { Memory } from '../lib/memory';
import { Brain, ArrowRight, Sparkles } from 'lucide-react';

interface InsightPanelProps {
  insights: Memory[];
  patterns: Memory[];
  onInsightClick: (insight: Memory) => void;
}

export const InsightPanel: React.FC<InsightPanelProps> = ({
  insights,
  patterns,
  onInsightClick
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 border-b pb-4 mb-6">
        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
          <Brain className="text-amber-600" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold">Insights & Patterns</h2>
          <p className="text-sm text-gray-500">Your evolving understanding</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Recent Insights */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Insights</h3>
          <div className="space-y-3">
            {insights.map((insight) => (
              <div
                key={insight.id}
                onClick={() => onInsightClick(insight)}
                className="p-3 rounded-lg border border-gray-100 hover:border-amber-200 hover:bg-amber-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={14} className="text-amber-500" />
                  <span className="text-sm font-medium">
                    {insight.metadata.element && (
                      <span className="text-xs bg-white px-2 py-1 rounded border mr-2">
                        {insight.metadata.element}
                      </span>
                    )}
                    {formatTimestamp(insight.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{insight.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Emerging Patterns */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Emerging Patterns</h3>
          <div className="space-y-3">
            {patterns.map((pattern) => (
              <div
                key={pattern.id}
                className="p-4 rounded-lg bg-purple-50 border border-purple-100"
              >
                <div className="flex items-center gap-2 mb-2">
                  <ArrowRight size={14} className="text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">
                    Pattern Recognition
                  </span>
                </div>
                <p className="text-sm text-purple-800">{pattern.content}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {pattern.metadata.element && (
                    <span className="text-xs bg-white px-2 py-1 rounded-full border border-purple-200">
                      Element: {pattern.metadata.element}
                    </span>
                  )}
                  {pattern.metadata.phase && (
                    <span className="text-xs bg-white px-2 py-1 rounded-full border border-purple-200">
                      Phase: {pattern.metadata.phase}
                    </span>
                  )}
                  <span className="text-xs bg-white px-2 py-1 rounded-full border border-purple-200">
                    Confidence: {Math.round((pattern.metadata.confidence || 0) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffMinutes < 1440) {
    return `${Math.floor(diffMinutes / 60)}h ago`;
  } else {
    return date.toLocaleDateString();
  }
}