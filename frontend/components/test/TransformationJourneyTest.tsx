// ===============================================
// TRANSFORMATION JOURNEY TEST COMPONENT
// Visualize and test the transformation tracking system
// ===============================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface TransformationMilestone {
  date: string;
  type: string;
  content: string;
  element: string;
  insights?: string;
}

interface TransformationJourney {
  userId: string;
  milestones: TransformationMilestone[];
  currentPhase: string;
  nextSpiralSuggestion: string;
}

export const TransformationJourneyTest: React.FC = () => {
  const { user, token } = useAuth();
  const [journey, setJourney] = useState<TransformationJourney | null>(null);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  const phaseColors = {
    initiation: 'bg-green-100 text-green-800',
    exploration: 'bg-blue-100 text-blue-800',
    deepening: 'bg-purple-100 text-purple-800',
    integration: 'bg-yellow-100 text-yellow-800',
    mastery: 'bg-red-100 text-red-800'
  };

  const fetchJourney = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/soul-memory/transformation-journey', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setJourney(data.journey);
      }
    } catch (error) {
      console.error('Error fetching journey:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchJourney();
    }
  }, [token]);

  const sendTransformationMessage = async () => {
    if (!newMessage) return;
    
    setLoading(true);
    try {
      await fetch('/api/oracle/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user?.id,
          message: newMessage
        })
      });
      
      setNewMessage('');
      
      // Refresh journey after a moment
      setTimeout(() => fetchJourney(), 1500);
      
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const transformationPrompts = [
    "I just realized the pattern I've been stuck in!",
    "I'm ready to face my shadows",
    "Something profound is shifting within me",
    "I see why I've been avoiding this truth",
    "Integration is happening on all levels"
  ];

  const getPhaseIcon = (phase: string) => {
    const icons = {
      initiation: '🌱',
      exploration: '🔍',
      deepening: '🌊',
      integration: '🔄',
      mastery: '👑'
    };
    return icons[phase] || '🌟';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Transformation Journey Tracker</h2>
      
      {/* Current Phase Display */}
      {journey && (
        <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Current Phase</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-3xl">{getPhaseIcon(journey.currentPhase)}</span>
                <span className={`px-3 py-1 rounded-full font-medium ${phaseColors[journey.currentPhase] || 'bg-gray-100'}`}>
                  {journey.currentPhase.charAt(0).toUpperCase() + journey.currentPhase.slice(1)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Milestones</p>
              <p className="text-2xl font-bold">{journey.milestones.length}</p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded">
            <p className="text-sm font-medium text-blue-900">Next Spiral Suggestion:</p>
            <p className="text-blue-700 mt-1">{journey.nextSpiralSuggestion}</p>
          </div>
        </div>
      )}

      {/* Create New Milestone */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Create Transformation Milestone</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Quick Prompts:</label>
            <div className="flex flex-wrap gap-2">
              {transformationPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setNewMessage(prompt)}
                  className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Or type your transformation insight..."
              className="flex-1 px-3 py-2 border rounded"
            />
            <button
              onClick={sendTransformationMessage}
              disabled={loading || !newMessage}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Milestones Timeline */}
      {journey && journey.milestones.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Transformation Timeline</h3>
          
          <div className="space-y-4">
            {journey.milestones.slice(0, 10).map((milestone, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center">
                    {i + 1}
                  </div>
                </div>
                
                <div className="flex-1 bg-white p-4 rounded-lg shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 rounded">
                        {milestone.type}
                      </span>
                      <p className="mt-2 font-medium">{milestone.content}</p>
                      {milestone.insights && (
                        <p className="mt-1 text-sm text-gray-600 italic">
                          Insights: {milestone.insights}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{new Date(milestone.date).toLocaleDateString()}</p>
                      <p className="text-xs">{milestone.element}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* API Test */}
      <div className="p-4 bg-gray-100 rounded">
        <h4 className="font-semibold mb-2">API Test:</h4>
        <pre className="text-sm overflow-auto">
{`// Check transformation progress
const journey = await fetch('/api/soul-memory/transformation-journey');
console.log('Transformation journey:', await journey.json());
// Should show milestones, current phase, next suggestions`}
        </pre>
      </div>

      {/* Refresh Button */}
      <div className="mt-4 text-center">
        <button
          onClick={fetchJourney}
          disabled={loading}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Refresh Journey
        </button>
      </div>
    </div>
  );
};