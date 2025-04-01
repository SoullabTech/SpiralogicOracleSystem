import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const processAuth = async () => {
      try {
        // For MVP, simulate auth processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        navigate('/dashboard');
      } catch (err) {
        setError('Authentication failed. Please try again.');
      }
    };
    
    processAuth();
  }, [navigate]);
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="text-purple-600 hover:text-purple-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <Loader2 className="animate-spin text-purple-600 mx-auto mb-4" size={32} />
        <p className="text-gray-600">Processing authentication...</p>
      </div>
    </div>
  );
};