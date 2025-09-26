'use client';

import { useEffect, useState } from 'react';

interface TestResults {
  withPrompts: {
    count: number;
    avgTimeToFirstMessage: string;
    avgFirstSessionLength: string;
    returnRate: string;
    stuckRate: string;
    promptUsageRate: string;
  };
  withoutPrompts: {
    count: number;
    avgTimeToFirstMessage: string;
    avgFirstSessionLength: string;
    returnRate: string;
    stuckRate: string;
  };
  insights: string[];
}

export default function PromptTestResults() {
  const [results, setResults] = useState<TestResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchResults, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/beta/prompt-test');
      const data = await response.json();
      if (data.success) {
        setResults(data.comparison);
      }
    } catch (error) {
      console.error('Failed to fetch results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-amber-400">Loading test results...</div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-400">Failed to load results</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-amber-400 mb-8">
          Starter Prompts Test Results
        </h1>

        {/* Insights */}
        {results.insights.length > 0 && (
          <div className="mb-8 p-6 bg-amber-900/20 border border-amber-500/30 rounded-lg">
            <h2 className="text-xl font-semibold text-amber-400 mb-4">
              Key Insights
            </h2>
            <ul className="space-y-2">
              {results.insights.map((insight, i) => (
                <li key={i} className="text-amber-100">
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Comparison Grid */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Without Prompts */}
          <div className="p-6 bg-gray-900 border border-gray-700 rounded-lg">
            <h2 className="text-2xl font-semibold text-white mb-4">
              WITHOUT Prompts
            </h2>
            <div className="space-y-3">
              <Metric label="Users" value={results.withoutPrompts.count} />
              <Metric
                label="Time to First Message"
                value={results.withoutPrompts.avgTimeToFirstMessage}
              />
              <Metric
                label="First Session Length"
                value={results.withoutPrompts.avgFirstSessionLength}
              />
              <Metric
                label="Return Rate"
                value={results.withoutPrompts.returnRate}
                highlight
              />
              <Metric
                label="Reported Stuck"
                value={results.withoutPrompts.stuckRate}
                warning
              />
            </div>
          </div>

          {/* With Prompts */}
          <div className="p-6 bg-gray-900 border border-amber-500/30 rounded-lg">
            <h2 className="text-2xl font-semibold text-amber-400 mb-4">
              WITH Prompts
            </h2>
            <div className="space-y-3">
              <Metric label="Users" value={results.withPrompts.count} />
              <Metric
                label="Time to First Message"
                value={results.withPrompts.avgTimeToFirstMessage}
              />
              <Metric
                label="First Session Length"
                value={results.withPrompts.avgFirstSessionLength}
              />
              <Metric
                label="Return Rate"
                value={results.withPrompts.returnRate}
                highlight
              />
              <Metric
                label="Reported Stuck"
                value={results.withPrompts.stuckRate}
                warning
              />
              <Metric
                label="Actually Used Prompt"
                value={results.withPrompts.promptUsageRate}
                highlight
              />
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="p-6 bg-purple-900/20 border border-purple-500/30 rounded-lg">
          <h2 className="text-xl font-semibold text-purple-400 mb-3">
            Recommendation
          </h2>
          <p className="text-gray-300">
            Based on the data above, {generateRecommendation(results)}
          </p>
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  highlight = false,
  warning = false
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
  warning?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-400">{label}:</span>
      <span className={`font-semibold ${
        warning ? 'text-red-400' :
        highlight ? 'text-green-400' :
        'text-white'
      }`}>
        {value}
      </span>
    </div>
  );
}

function generateRecommendation(results: TestResults): string {
  const withoutCount = results.withoutPrompts.count;
  const withCount = results.withPrompts.count;

  if (withoutCount < 3 || withCount < 3) {
    return 'keep testing - sample size is still too small for a confident decision.';
  }

  const returnDiff = parseFloat(results.withPrompts.returnRate) -
                     parseFloat(results.withoutPrompts.returnRate);
  const usageRate = parseFloat(results.withPrompts.promptUsageRate);

  if (returnDiff > 10 && usageRate > 30) {
    return 'ADD the prompts - they improve return rates and users are actually using them.';
  }

  if (returnDiff < -10) {
    return 'SKIP the prompts - they seem to hurt return rates.';
  }

  if (usageRate < 20) {
    return 'SKIP the prompts - users aren\'t using them, so they\'re just visual clutter.';
  }

  if (Math.abs(returnDiff) < 5) {
    return 'prompts don\'t significantly affect outcomes. Choose based on aesthetic preference.';
  }

  return 'results are mixed - ask testers directly what they prefer.';
}