// ===============================================
// BREAKTHROUGH DETECTION TEST COMPONENT
// Test sacred moments and transformation tracking
// ===============================================

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface TestResult {
  message: string;
  oracleResponse: string;
  memoryType: string;
  isBreakthrough: boolean;
  isSacred: boolean;
  transformationMarker: boolean;
}

export const BreakthroughTest: React.FC = () => {
  const { user, token } = useAuth();
  const [results, setResults] = useState<TestResult[]>([]);
  const [sacredMoments, setSacredMoments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testMessages = [
    {
      text: "I just realized the pattern I've been stuck in for years!",
      expectBreakthrough: true
    },
    {
      text: "Aha! I see now why I keep avoiding intimacy",
      expectBreakthrough: true
    },
    {
      text: "This feels sacred... I'm touching something deep in my soul",
      expectBreakthrough: false
    }
  ];

  const runBreakthroughTest = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      for (const testCase of testMessages) {
        // Send breakthrough message
        const oracleResponse = await fetch('/api/oracle/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userId: user?.id,
            message: testCase.text
          })
        });
        
        const { response } = await oracleResponse.json();
        
        // Wait for storage
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check latest memory
        const memoriesResponse = await fetch(
          `/api/soul-memory/memories/${user?.id}?limit=1`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        const memories = await memoriesResponse.json();
        const latestMemory = memories[0];
        
        if (latestMemory) {
          setResults(prev => [...prev, {
            message: testCase.text,
            oracleResponse: response,
            memoryType: latestMemory.type,
            isBreakthrough: latestMemory.type === 'breakthrough' || latestMemory.transformationMarker,
            isSacred: latestMemory.sacredMoment,
            transformationMarker: latestMemory.transformationMarker
          }]);
        }
      }
      
      // Fetch sacred moments
      const sacredResponse = await fetch(`/api/soul-memory/sacred-moments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const sacredData = await sacredResponse.json();
      setSacredMoments(sacredData.sacredMoments || []);
      
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const testSingleBreakthrough = async () => {
    setLoading(true);
    
    try {
      const breakthroughMessage = "I just realized the pattern I've been stuck in for years!";
      
      // Send message
      const response = await fetch('/api/oracle/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user?.id,
          message: breakthroughMessage
        })
      });
      
      const data = await response.json();
      console.log('Oracle response:', data.response);
      
      // Wait and check sacred moments
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const sacredResponse = await fetch('/api/soul-memory/sacred-moments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const sacredData = await sacredResponse.json();
      console.log('Sacred moments:', sacredData);
      
      alert('Check console for results!');
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Breakthrough Detection Test</h2>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={runBreakthroughTest}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Run Full Test'}
        </button>
        
        <button
          onClick={testSingleBreakthrough}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Single Breakthrough
        </button>
      </div>

      {/* Test Results */}
      {results.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Test Results</h3>
          {results.map((result, i) => (
            <div key={i} className="mb-4 p-4 bg-gray-100 rounded">
              <p className="font-semibold">{result.message}</p>
              <div className="mt-2 text-sm">
                <p>Type: <span className="font-mono">{result.memoryType}</span></p>
                <p>Breakthrough: {result.isBreakthrough ? '✅' : '❌'}</p>
                <p>Sacred: {result.isSacred ? '✅' : '❌'}</p>
                <p>Transformation Marker: {result.transformationMarker ? '✅' : '❌'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sacred Moments */}
      {sacredMoments.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">
            Sacred Moments ({sacredMoments.length})
          </h3>
          <div className="space-y-2">
            {sacredMoments.map((moment, i) => (
              <div key={i} className="p-3 bg-purple-50 rounded">
                <p className="text-sm text-gray-600">{moment.timestamp}</p>
                <p className="font-medium">{moment.content}</p>
                <p className="text-sm text-purple-600">Type: {moment.type}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Code Example */}
      <div className="mt-8 p-4 bg-gray-900 text-white rounded">
        <h4 className="font-semibold mb-2">Test in Console:</h4>
        <pre className="text-sm overflow-auto">
{`// Send a breakthrough message
const breakthroughMessage = "I just realized the pattern I've been stuck in for years!";
await oracle.respondToPrompt(breakthroughMessage);

// Check sacred moments
const sacredMoments = await fetch('/api/soul-memory/sacred-moments');
console.log('Sacred moments:', await sacredMoments.json());
// Should flag this as transformation_marker = true`}
        </pre>
      </div>
    </div>
  );
};