// ===============================================
// SOUL MEMORY TEST COMPONENT
// Test the Oracle + Soul Memory integration from the frontend
// ===============================================

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const SoulMemoryTest: React.FC = () => {
  const { user, token } = useAuth();
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testOracleMemory = async () => {
    setLoading(true);
    try {
      // Test Oracle exchange memory
      const testMessage = "I'm feeling overwhelmed by all these changes in my life";
      
      // 1. Send message to Oracle
      const oracleResponse = await fetch('/api/oracle/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user?.id,
          message: testMessage
        })
      });
      
      const { response } = await oracleResponse.json();
      
      // 2. Wait a moment for async storage
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 3. Check if memory was stored
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
      
      // 4. Test semantic search
      const searchResponse = await fetch('/api/soul-memory/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user?.id,
          query: 'overwhelmed changes'
        })
      });
      
      const searchResults = await searchResponse.json();
      
      setTestResult({
        success: true,
        testMessage,
        oracleResponse: response,
        memoryStored: !!latestMemory,
        latestMemory,
        searchResultsCount: searchResults.length
      });
      
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Soul Memory Integration Test</h2>
      
      <button
        onClick={testOracleMemory}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Run Test'}
      </button>

      {testResult && (
        <div className="bg-gray-100 rounded p-4">
          <h3 className="font-bold mb-2">Test Results:</h3>
          
          {testResult.success ? (
            <>
              <div className="mb-4">
                <p className="font-semibold">✅ Test Successful!</p>
              </div>
              
              <div className="mb-4">
                <p className="font-semibold">Test Message:</p>
                <p className="text-gray-600">{testResult.testMessage}</p>
              </div>
              
              <div className="mb-4">
                <p className="font-semibold">Oracle Response:</p>
                <p className="text-gray-600">{testResult.oracleResponse}</p>
              </div>
              
              <div className="mb-4">
                <p className="font-semibold">Memory Stored: {testResult.memoryStored ? '✅' : '❌'}</p>
                {testResult.latestMemory && (
                  <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto">
                    {JSON.stringify({
                      id: testResult.latestMemory.id,
                      type: testResult.latestMemory.type,
                      content: testResult.latestMemory.content?.substring(0, 50) + '...',
                      element: testResult.latestMemory.element,
                      emotionalTone: testResult.latestMemory.emotionalTone,
                      timestamp: testResult.latestMemory.timestamp
                    }, null, 2)}
                  </pre>
                )}
              </div>
              
              <div>
                <p className="font-semibold">Semantic Search Results: {testResult.searchResultsCount}</p>
              </div>
            </>
          ) : (
            <div>
              <p className="font-semibold text-red-600">❌ Test Failed</p>
              <p className="text-red-500">{testResult.error}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 text-sm text-gray-600">
        <h4 className="font-semibold mb-2">What this test does:</h4>
        <ol className="list-decimal list-inside space-y-1">
          <li>Sends a test message to the Oracle</li>
          <li>Waits for the Oracle to respond and store the memory</li>
          <li>Retrieves the latest memory to verify storage</li>
          <li>Tests semantic search functionality</li>
        </ol>
      </div>
    </div>
  );
};

// Usage in a page:
// import { SoulMemoryTest } from '@/components/test/SoulMemoryTest';
// 
// export default function TestPage() {
//   return <SoulMemoryTest />;
// }