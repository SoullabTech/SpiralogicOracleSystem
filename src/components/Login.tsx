import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Bot } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  
  const handleLogin = () => {
    navigate('/mirror');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="text-purple-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Spiralogic Oracle</h1>
          <p className="text-gray-500 mt-2">Your archetypal journey begins here</p>
        </div>
        
        <button
          onClick={handleLogin}
          className="w-full bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-3"
        >
          <LogIn size={20} />
          Enter the Oracle
        </button>
        
        <p className="text-center text-sm text-gray-500 mt-6">
          A journey of self-discovery through archetypal wisdom
        </p>
      </div>
    </div>
  );
};