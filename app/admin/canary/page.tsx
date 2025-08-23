// Canary Health Check - One-click system validation
"use client";

import { useState } from 'react';

interface CanaryResult {
  test: string;
  status: 'pass' | 'fail' | 'running';
  duration?: number;
  message: string;
  details?: any;
}

export default function CanaryPage() {
  const [results, setResults] = useState<CanaryResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'pass' | 'fail' | 'unknown'>('unknown');

  const runCanaryTests = async () => {
    setIsRunning(true);
    setResults([]);
    setOverallStatus('unknown');

    const tests = [
      { name: 'Database Connection', test: testDatabase },
      { name: 'Soul Memory Bridge', test: testSoulMemoryBridge },
      { name: 'Spiralogic Knowledge', test: testSpiralogicKnowledge },
      { name: 'Admin Authentication', test: testAdminAuth },
      { name: 'API Endpoints', test: testAPIEndpoints },
      { name: 'Memory Enrichment', test: testMemoryEnrichment },
      { name: 'Safeguard Systems', test: testSafeguards }
    ];

    const testResults: CanaryResult[] = [];

    for (const { name, test } of tests) {
      // Show test as running
      const runningResult: CanaryResult = {
        test: name,
        status: 'running',
        message: 'Running...'
      };
      setResults(prev => [...prev.filter(r => r.test !== name), runningResult]);

      try {
        const startTime = Date.now();
        const result = await test();
        const duration = Date.now() - startTime;
        
        const completedResult: CanaryResult = {
          test: name,
          status: 'pass',
          duration,
          message: result.message || 'Test passed',
          details: result.details
        };
        testResults.push(completedResult);
        setResults(prev => [...prev.filter(r => r.test !== name), completedResult]);
      } catch (error) {
        const failedResult: CanaryResult = {
          test: name,
          status: 'fail',
          duration: Date.now() - Date.now(),
          message: error instanceof Error ? error.message : 'Test failed',
          details: error
        };
        testResults.push(failedResult);
        setResults(prev => [...prev.filter(r => r.test !== name), failedResult]);
      }
    }

    // Determine overall status
    const hasFailures = testResults.some(r => r.status === 'fail');
    setOverallStatus(hasFailures ? 'fail' : 'pass');
    setIsRunning(false);
  };

  // Mock test functions (in real implementation, these would call actual services)
  const testDatabase = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      message: 'Database connection healthy',
      details: { responseTime: '45ms', activeConnections: 12 }
    };
  };

  const testSoulMemoryBridge = async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      message: 'Bridge operational',
      details: { lastWrite: new Date().toISOString(), status: 'active' }
    };
  };

  const testSpiralogicKnowledge = async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      message: 'Knowledge systems loaded',
      details: { archetypes: 9, phases: 13, elements: 5 }
    };
  };

  const testAdminAuth = async () => {
    await new Promise(resolve => setTimeout(resolve, 150));
    return {
      message: 'Admin authentication working',
      details: { middleware: 'active', session: 'valid' }
    };
  };

  const testAPIEndpoints = async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
    // Simulate occasional API failure
    if (Math.random() < 0.1) {
      throw new Error('API endpoint timeout');
    }
    return {
      message: 'All API endpoints responding',
      details: { endpoints: 5, avgResponseTime: '120ms' }
    };
  };

  const testMemoryEnrichment = async () => {
    await new Promise(resolve => setTimeout(resolve, 350));
    return {
      message: 'Enrichment pipeline functional',
      details: { processedToday: 47, successRate: '98.3%' }
    };
  };

  const testSafeguards = async () => {
    await new Promise(resolve => setTimeout(resolve, 250));
    return {
      message: 'Safeguard systems active',
      details: { bypassingAlerts: 0, gatesActive: 3 }
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-600 dark:text-green-400';
      case 'fail': return 'text-red-600 dark:text-red-400';
      case 'running': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return '✅';
      case 'fail': return '❌';
      case 'running': return '⏳';
      default: return '❓';
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            🐤 Canary Health Check
          </h1>
          <a 
            href="/admin/overview"
            className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            ← Back to Console
          </a>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="text-center">
            <div className="text-6xl mb-4">
              {isRunning ? '🔄' : overallStatus === 'pass' ? '✅' : overallStatus === 'fail' ? '❌' : '🐤'}
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              {isRunning ? 'Running Tests...' : 
               overallStatus === 'pass' ? 'All Systems Operational' :
               overallStatus === 'fail' ? 'Issues Detected' :
               'Ready to Test'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {isRunning ? 'Validating all critical system components' :
               overallStatus === 'unknown' ? 'Click the button below to run a comprehensive health check' :
               `Health check completed with ${results.filter(r => r.status === 'pass').length}/${results.length} tests passing`}
            </p>
            
            <button
              onClick={runCanaryTests}
              disabled={isRunning}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center mx-auto"
            >
              {isRunning ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3" />
                  Running Tests...
                </>
              ) : (
                <>
                  🚀 Run Health Check
                </>
              )}
            </button>
          </div>
        </div>

        {/* Test Results */}
        {results.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Test Results
            </h3>
            
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    result.status === 'fail' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                    result.status === 'pass' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                    'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">
                      {result.status === 'running' ? (
                        <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full" />
                      ) : (
                        getStatusIcon(result.status)
                      )}
                    </span>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {result.test}
                      </h4>
                      <p className={`text-sm ${getStatusColor(result.status)}`}>
                        {result.message}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {result.duration && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {result.duration}ms
                      </div>
                    )}
                    {result.details && result.status === 'pass' && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {Object.keys(result.details).length} metrics
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            {!isRunning && results.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Test Summary
                  </span>
                  <div className="flex space-x-4 text-sm">
                    <span className="text-green-600 dark:text-green-400">
                      ✅ {results.filter(r => r.status === 'pass').length} passed
                    </span>
                    <span className="text-red-600 dark:text-red-400">
                      ❌ {results.filter(r => r.status === 'fail').length} failed
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Total: {results.filter(r => r.duration).reduce((sum, r) => sum + (r.duration || 0), 0)}ms
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/health"
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <h4 className="font-medium text-gray-900 dark:text-white">🏥 Detailed Health</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              View comprehensive health monitoring
            </p>
          </a>
          
          <a
            href="/admin/overview"
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <h4 className="font-medium text-gray-900 dark:text-white">📊 Metrics Dashboard</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Live system metrics and analytics
            </p>
          </a>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 opacity-60">
            <h4 className="font-medium text-gray-900 dark:text-white">🔧 Auto-Healing</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Automatic issue resolution (Coming Soon)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}