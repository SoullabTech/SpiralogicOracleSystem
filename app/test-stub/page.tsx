'use client';

import { useState, useEffect } from 'react';
import { oracleService, getAPIMode, testBackendConnection } from '@/lib/api/client';

export default function TestStubPage() {
  const [apiMode, setApiMode] = useState<string>('');
  const [testResult, setTestResult] = useState<any>(null);
  const [backendStatus, setBackendStatus] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check API mode
    setApiMode(getAPIMode());
    
    // Test backend connection
    testBackendConnection().then(setBackendStatus);
  }, []);

  const testStubChat = async () => {
    setLoading(true);
    try {
      const result = await oracleService.chat('Test message', 'test-user');
      setTestResult(result);
    } catch (error) {
      setTestResult({ error: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Stub Mode Test Page</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>API Mode:</span>
              <span className={`font-mono ${apiMode === 'stub' ? 'text-yellow-400' : 'text-green-400'}`}>
                {apiMode || 'loading...'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Backend Connection:</span>
              <span className={`font-mono ${backendStatus === false ? 'text-red-400' : backendStatus === true ? 'text-green-400' : 'text-gray-400'}`}>
                {backendStatus === null ? 'checking...' : backendStatus ? 'connected' : 'not connected (using stub)'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Stub Functions</h2>
          <button
            onClick={testStubChat}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Chat Function'}
          </button>
        </div>

        {testResult && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test Result</h2>
            <pre className="bg-gray-900 p-4 rounded overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 text-sm text-gray-400">
          <p>✅ Stub mode is working if you see yellow "stub" status above</p>
          <p>✅ Click "Test Chat Function" to verify stub responses</p>
          <p>📝 To switch to real API, set NEXT_PUBLIC_API_MODE=real</p>
        </div>
      </div>
    </div>
  );
}