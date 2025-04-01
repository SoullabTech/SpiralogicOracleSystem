import React from 'react';
import { Memory } from '../lib/memory';
import { Brain, Target, Sparkles, ArrowUpRight } from 'lucide-react';

interface MentorContextProps {
  stage: string;
  insights: Memory[];
  patterns: Memory[];
  onInsightClick: (insight: Memory) => void;
}

export const MentorContext: React.FC<MentorContextProps> = ({
  stage,
  insights,
  patterns,
  onInsightClick
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 border-b pb-4 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
          <Brain className="text-purple-600" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold">Mentor Context</h2>
          <p className="text-sm text-gray-500">Relationship Stage: {stage}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Recent Insights */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-amber-500" />
            <h3 className="text-sm font-medium text-gray-700">Key Insights</h3>
          </div>
          <div className="space-y-2">
            {insights.slice(0, 3).map((insight) => (
              <div
                key={insight.id}
                onClick={() => onInsightClick(insight)}
                className="p-3 rounded-lg border border-gray-100 hover:border-amber-200 hover:bg-amber-50 cursor-pointer transition-colors"
              >
                <p className="text-sm text-gray-600">{insight.content}</p>
                {insight.metadata.element && (
                  <span className="inline-block mt-2 text-xs bg-white px-2 py-1 rounded border">
                    {insight.metadata.element}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Development Focus */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target size={16} className="text-blue-500" />
            <h3 className="text-sm font-medium text-gray-700">Development Focus</h3>
          </div>
          <div className="space-y-2">
            {patterns.slice(0, 2).map((pattern) => (
              <div
                key={pattern.id}
                className="p-3 rounded-lg bg-blue-50 border border-blue-100"
              >
                <div className="flex items-center gap-2 mb-1">
                  <ArrowUpRight size={14} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Emerging Pattern
                  </span>
                </div>
                <p className="text-sm text-blue-800">{pattern.content}</p>
              </div>
            ))}
          </div>
        </div>

        {stage === 'deep' && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={16} className="text-purple-600" />
              <span className="text-sm font-medium text-purple-900">
                Deep Relationship Status
              </span>
            </div>
            <p className="text-sm text-purple-800">
              Our connection has deepened, allowing for more profound insights and transformative work.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};