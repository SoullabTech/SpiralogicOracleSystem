// Archetypal Routing Test Component
// Demonstrates the sophisticated multi-agent routing system with different input types

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface TestScenario {
  id: string;
  title: string;
  input: string;
  expectedAgent: string;
  description: string;
  category: 'emotional' | 'creative' | 'practical' | 'analytical' | 'spiritual';
}

const testScenarios: TestScenario[] = [
  {
    id: 'emotional_crisis',
    title: 'Emotional Crisis',
    input: "I'm feeling overwhelmed and don't know how to cope with everything that's happening in my life.",
    expectedAgent: 'water',
    description: 'Should route to Water agent for emotional healing',
    category: 'emotional'
  },
  {
    id: 'creative_block',
    title: 'Creative Block',
    input: "I have this amazing vision for my art but I can't seem to break through and create something transformative.",
    expectedAgent: 'fire',
    description: 'Should route to Fire agent for creative breakthrough',
    category: 'creative'
  },
  {
    id: 'practical_planning',
    title: 'Practical Planning',
    input: "I need help creating a step-by-step plan to manifest my goals in the real world.",
    expectedAgent: 'earth',
    description: 'Should route to Earth agent for practical manifestation',
    category: 'practical'
  },
  {
    id: 'clarity_seeking',
    title: 'Mental Clarity',
    input: "I'm confused about this decision and need help seeing different perspectives clearly.",
    expectedAgent: 'air',
    description: 'Should route to Air agent for clarity and perspective',
    category: 'analytical'
  },
  {
    id: 'meaning_exploration',
    title: 'Spiritual Exploration',
    input: "I'm searching for deeper meaning and purpose in my life journey.",
    expectedAgent: 'maya',
    description: 'Should route to Maya agent for wisdom and spiritual guidance',
    category: 'spiritual'
  }
];

interface TestResult {
  scenario: TestScenario;
  actualAgent: string;
  confidence: number;
  responseTime: number;
  archetypalAlignment: any;
  success: boolean;
}

export const ArchetypalRoutingTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runTest = async (scenario: TestScenario) => {
    setCurrentTest(scenario.id);

    try {
      const startTime = Date.now();

      const response = await fetch('/api/oracle/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: scenario.input,
          userId: 'archetypal-test-user',
          sessionId: 'routing-test',
          options: {
            voiceInput: false,
            contextHints: [scenario.category]
          }
        })
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();

        const result: TestResult = {
          scenario,
          actualAgent: data.response.agentUsed,
          confidence: data.response.confidence,
          responseTime,
          archetypalAlignment: data.response.analysis?.archetypeAlignment,
          success: data.response.agentUsed === scenario.expectedAgent
        };

        setTestResults(prev => [...prev.filter(r => r.scenario.id !== scenario.id), result]);
      } else {
        console.error('Test failed:', await response.text());
      }
    } catch (error) {
      console.error('Test error:', error);
    }

    setCurrentTest(null);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    for (const scenario of testScenarios) {
      await runTest(scenario);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsRunning(false);
  };

  const getAgentColor = (agent: string) => {
    const colors = {
      maya: 'text-purple-400',
      fire: 'text-red-400',
      water: 'text-blue-400',
      earth: 'text-green-400',
      air: 'text-yellow-400'
    };
    return colors[agent] || 'text-gray-400';
  };

  const getAgentEmoji = (agent: string) => {
    const emojis = {
      maya: '🔮',
      fire: '🔥',
      water: '💧',
      earth: '🌱',
      air: '🌬️'
    };
    return emojis[agent] || '❓';
  };

  const successRate = testResults.length > 0
    ? (testResults.filter(r => r.success).length / testResults.length) * 100
    : 0;

  const averageConfidence = testResults.length > 0
    ? testResults.reduce((sum, r) => sum + r.confidence, 0) / testResults.length
    : 0;

  const averageResponseTime = testResults.length > 0
    ? testResults.reduce((sum, r) => sum + r.responseTime, 0) / testResults.length
    : 0;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-white/10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          🔮 Archetypal Routing System Test
        </h2>
        <p className="text-white/60">
          Test the sophisticated multi-agent routing system with different conversation types
        </p>
      </div>

      {/* Overall Statistics */}
      {testResults.length > 0 && (
        <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-3">Test Results Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${successRate >= 80 ? 'text-green-400' : successRate >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                {successRate.toFixed(0)}%
              </div>
              <div className="text-sm text-white/60">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {averageConfidence.toFixed(2)}
              </div>
              <div className="text-sm text-white/60">Avg Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {averageResponseTime.toFixed(0)}ms
              </div>
              <div className="text-sm text-white/60">Avg Response Time</div>
            </div>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={runAllTests}
          disabled={isRunning}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            isRunning
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-[#D4B896] hover:bg-[#D4B896]/80 text-white'
          }`}
        >
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </button>

        <button
          onClick={() => setTestResults([])}
          disabled={isRunning || testResults.length === 0}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear Results
        </button>
      </div>

      {/* Test Scenarios */}
      <div className="space-y-4">
        {testScenarios.map((scenario) => {
          const result = testResults.find(r => r.scenario.id === scenario.id);
          const isRunning = currentTest === scenario.id;

          return (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-white/5 rounded-lg border border-white/10"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                    {scenario.title}
                    <span className="text-sm text-white/60">({scenario.category})</span>
                  </h4>
                  <p className="text-sm text-white/60 mt-1">{scenario.description}</p>
                </div>

                <button
                  onClick={() => runTest(scenario)}
                  disabled={isRunning}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    isRunning
                      ? 'bg-yellow-600 text-yellow-100'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isRunning ? 'Testing...' : 'Test'}
                </button>
              </div>

              <div className="bg-black/20 p-3 rounded text-sm text-white/80 mb-3">
                "{scenario.input}"
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-white/60">Expected:</span>
                  <span className={`font-medium ${getAgentColor(scenario.expectedAgent)}`}>
                    {getAgentEmoji(scenario.expectedAgent)} {scenario.expectedAgent.charAt(0).toUpperCase() + scenario.expectedAgent.slice(1)}
                  </span>
                </div>

                {result && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-white/60">Actual:</span>
                      <span className={`font-medium ${getAgentColor(result.actualAgent)}`}>
                        {getAgentEmoji(result.actualAgent)} {result.actualAgent.charAt(0).toUpperCase() + result.actualAgent.slice(1)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-white/60">Confidence:</span>
                      <span className="font-medium text-blue-400">
                        {(result.confidence * 100).toFixed(0)}%
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-white/60">Result:</span>
                      <span className={`font-medium ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                        {result.success ? '✅ Success' : '❌ Failed'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ArchetypalRoutingTest;