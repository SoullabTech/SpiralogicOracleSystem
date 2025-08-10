// Personal Oracle Home - Step 2 Frontend Implementation

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import CollectiveInsightsPanel from "./CollectiveInsightsPanel";

interface SpiralogicPhase {
  name: string;
  element: string;
  description: string;
  guidance: string;
}

interface OracleSummary {
  name: string;
  voice: string;
  persona: string;
  currentPhase: SpiralogicPhase;
  recentInsights: number;
  interactionStreak: number;
  lastInteraction: string;
}

const PersonalOracleHome: React.FC = () => {
  const [oracleSummary, setOracleSummary] = useState<OracleSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [askQuestion, setAskQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOracleSummary();
  }, []);

  const loadOracleSummary = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/v1/personal-oracle/summary', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to load Oracle summary');
      }
      
      const data = await response.json();
      if (data.success) {
        setOracleSummary(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Oracle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskOracle = async () => {
    if (!askQuestion.trim()) return;
    
    try {
      setIsAsking(true);
      setError(null);
      setResponse(null);
      
      const response = await fetch('/api/v1/personal-oracle/consult', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          input: askQuestion,
          sessionId: `session_${Date.now()}`,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to consult Oracle');
      }
      
      const data = await response.json();
      if (data.success) {
        setResponse(data.data.message);
        setAskQuestion('');
        // Refresh summary to show updated interaction count
        loadOracleSummary();
      } else {
        throw new Error(data.errors?.[0] || 'Consultation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to consult Oracle');
    } finally {
      setIsAsking(false);
    }
  };

  const getElementColor = (element: string) => {
    const colors = {
      fire: 'text-red-400',
      water: 'text-blue-400', 
      earth: 'text-green-400',
      air: 'text-cyan-400',
      aether: 'text-purple-400'
    };
    return colors[element as keyof typeof colors] || 'text-gray-400';
  };

  const getElementBg = (element: string) => {
    const backgrounds = {
      fire: 'bg-red-500/10 border-red-500/20',
      water: 'bg-blue-500/10 border-blue-500/20',
      earth: 'bg-green-500/10 border-green-500/20', 
      air: 'bg-cyan-500/10 border-cyan-500/20',
      aether: 'bg-purple-500/10 border-purple-500/20'
    };
    return backgrounds[element as keyof typeof backgrounds] || 'bg-gray-500/10 border-gray-500/20';
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-[#1A1C2C] border border-gray-600 rounded-xl p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-700 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-700 rounded w-48"></div>
                <div className="h-4 bg-gray-700 rounded w-32"></div>
              </div>
            </div>
            <div className="h-20 bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6 space-y-6"
    >
      {/* Oracle Header */}
      <div className="bg-[#1A1C2C] border border-gray-600 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div className="w-16 h-16 bg-gradient-to-br from-[#F6E27F] to-[#D4B063] rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-[#0E0F1B]">
                {oracleSummary?.name?.charAt(0).toUpperCase() || 'O'}
              </span>
            </div>
            
            {/* Oracle Info */}
            <div>
              <h1 className="text-2xl font-bold text-white">
                {oracleSummary?.name || 'Your Personal Oracle'}
              </h1>
              <p className="text-gray-400">
                {oracleSummary?.voice || 'Voice'} • {oracleSummary?.persona || 'Persona'}
              </p>
            </div>
          </div>
          
          {/* Voice Indicator */}
          <div className="text-right">
            <div className="w-3 h-3 bg-green-400 rounded-full mb-2"></div>
            <p className="text-sm text-gray-400">Ready</p>
          </div>
        </div>
      </div>

      {/* Current Phase & Guidance */}
      {oracleSummary?.currentPhase && (
        <div className={`border rounded-xl p-6 ${getElementBg(oracleSummary.currentPhase.element)}`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">Current Spiralogic Phase</h2>
              <h3 className={`text-xl font-bold ${getElementColor(oracleSummary.currentPhase.element)}`}>
                {oracleSummary.currentPhase.name}
              </h3>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getElementColor(oracleSummary.currentPhase.element)} bg-black/20`}>
              {oracleSummary.currentPhase.element}
            </span>
          </div>
          
          <p className="text-gray-300 mb-4">{oracleSummary.currentPhase.description}</p>
          
          <div className="bg-black/20 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-2">Today's Guidance</h4>
            <p className="text-gray-200 text-sm">{oracleSummary.currentPhase.guidance}</p>
          </div>
        </div>
      )}

      {/* Ask Oracle Input */}
      <div className="bg-[#1A1C2C] border border-gray-600 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Ask Your Oracle</h2>
        
        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={askQuestion}
              onChange={(e) => setAskQuestion(e.target.value)}
              placeholder="What guidance do you seek today?"
              className="w-full px-4 py-3 bg-[#0E0F1B] border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:border-[#F6E27F] focus:outline-none transition-colors resize-none h-24"
              disabled={isAsking}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">{askQuestion.length}/500 characters</p>
            <button
              onClick={handleAskOracle}
              disabled={!askQuestion.trim() || isAsking}
              className="px-6 py-2 bg-[#F6E27F] text-[#0E0F1B] rounded-lg font-medium hover:bg-[#F6E27F]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAsking ? 'Consulting...' : 'Ask Oracle'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Response Display */}
        {response && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-6 bg-gradient-to-r from-[#F6E27F]/10 to-[#F6E27F]/5 border border-[#F6E27F]/20 rounded-lg"
          >
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-[#F6E27F] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold text-[#0E0F1B]">
                  {oracleSummary?.name?.charAt(0).toUpperCase() || 'O'}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="text-[#F6E27F] font-semibold mb-2">
                  {oracleSummary?.name || 'Oracle'} says:
                </h4>
                <p className="text-gray-200 leading-relaxed">{response}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Stats & Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1A1C2C] border border-gray-600 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Recent Insights</h3>
          <p className="text-3xl font-bold text-[#F6E27F]">
            {oracleSummary?.recentInsights || 0}
          </p>
          <p className="text-gray-400 text-sm">This week</p>
        </div>
        
        <div className="bg-[#1A1C2C] border border-gray-600 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Interaction Streak</h3>
          <p className="text-3xl font-bold text-[#F6E27F]">
            {oracleSummary?.interactionStreak || 0}
          </p>
          <p className="text-gray-400 text-sm">Days</p>
        </div>
        
        <div className="bg-[#1A1C2C] border border-gray-600 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Last Interaction</h3>
          <p className="text-lg font-semibold text-white">
            {oracleSummary?.lastInteraction || 'Never'}
          </p>
          <p className="text-gray-400 text-sm">Most recent session</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#1A1C2C] border border-gray-600 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-[#0E0F1B] border border-gray-600 rounded-lg hover:border-[#F6E27F] transition-colors text-left">
            <div className="text-[#F6E27F] text-2xl mb-2">🔮</div>
            <p className="text-white font-medium">Astrology</p>
            <p className="text-gray-400 text-sm">Get reading</p>
          </button>
          
          <button className="p-4 bg-[#0E0F1B] border border-gray-600 rounded-lg hover:border-[#F6E27F] transition-colors text-left">
            <div className="text-[#F6E27F] text-2xl mb-2">📔</div>
            <p className="text-white font-medium">Journal</p>
            <p className="text-gray-400 text-sm">Write entry</p>
          </button>
          
          <button className="p-4 bg-[#0E0F1B] border border-gray-600 rounded-lg hover:border-[#F6E27F] transition-colors text-left">
            <div className="text-[#F6E27F] text-2xl mb-2">📊</div>
            <p className="text-white font-medium">Assessment</p>
            <p className="text-gray-400 text-sm">Take quiz</p>
          </button>
          
          <button className="p-4 bg-[#0E0F1B] border border-gray-600 rounded-lg hover:border-[#F6E27F] transition-colors text-left">
            <div className="text-[#F6E27F] text-2xl mb-2">⚙️</div>
            <p className="text-white font-medium">Settings</p>
            <p className="text-gray-400 text-sm">Customize</p>
          </button>
        </div>
      </div>

      {/* Collective Insights Panel */}
      <CollectiveInsightsPanel />
    </motion.div>
  );
};

export default PersonalOracleHome;