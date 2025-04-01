import React, { useState } from 'react';
import { PlayCircle, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

interface TestResult {
  test: string;
  status: 'Passed' | 'Failed';
  message?: string;
}

interface TestingInterfaceProps {
  onTestComplete: (results: TestResult[]) => void;
  isLoading?: boolean;
}

export const TestingInterface: React.FC<TestingInterfaceProps> = ({ 
  onTestComplete,
  isLoading = false
}) => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  
  const runTest = async () => {
    // For MVP, generate mock test results
    const newResults: TestResult[] = [
      { 
        test: 'Element Detection',
        status: 'Passed',
        message: 'Successfully detected all element types'
      },
      { 
        test: 'Insight Classification',
        status: 'Passed',
        message: 'Correctly classified all insight types'
      },
      { 
        test: 'Client Loading',
        status: 'Passed',
        message: 'Client data loaded and validated'
      },
    ];
    
    setTestResults(newResults);
    onTestComplete(newResults);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <PlayCircle className="text-blue-600" size={20} />
          </div>
          <h2 className="text-xl font-bold">Testing Interface</h2>
        </div>
        
        <button
          onClick={runTest}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <RefreshCw className="animate-spin" size={18} />
          ) : (
            <PlayCircle size={18} />
          )}
          {isLoading ? 'Running...' : 'Run Tests'}
        </button>
      </div>
      
      {testResults.length > 0 && (
        <div className="space-y-4">
          {testResults.map((result, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border ${
                result.status === 'Passed' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {result.status === 'Passed' ? (
                  <CheckCircle2 className="text-green-600" size={20} />
                ) : (
                  <XCircle className="text-red-600" size={20} />
                )}
                <div>
                  <h3 className="font-medium">{result.test}</h3>
                  {result.message && (
                    <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};