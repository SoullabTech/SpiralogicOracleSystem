import React from 'react';
import { MeditationSession } from '../lib/meditation';
import { ChevronRight, Star, RefreshCw } from 'lucide-react';

interface JourneyContainerProps {
  session: MeditationSession;
  onUpdateSession: (updatedSession: MeditationSession) => void;
}

export const JourneyContainer: React.FC<JourneyContainerProps> = ({ 
  session, 
  onUpdateSession 
}) => {
  const advanceProgress = () => {
    const updatedSession = {
      ...session,
      progress: Math.min(100, session.progress + 10),
      lastUpdated: new Date()
    };
    onUpdateSession(updatedSession);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Star className="text-yellow-500" size={24} />
        Journey Progress
      </h2>
      
      <div className="mb-6 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Client</span>
          <span className="font-medium">{session.client_name}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Phase</span>
          <span className="font-medium capitalize">{session.phase}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Element</span>
          <span className="font-medium capitalize">{session.element || 'Not determined'}</span>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-gray-600">{session.progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-500" 
            style={{ width: `${session.progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={advanceProgress}
          disabled={session.progress >= 100}
          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <ChevronRight size={18} />
          Advance Journey
        </button>
        
        <button 
          onClick={() => onUpdateSession({...session, progress: 0})}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw size={18} />
        </button>
      </div>
      
      {session.insights.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Recent Insights</h3>
          <ul className="space-y-2">
            {session.insights.slice(-3).map((insight, index) => (
              <li key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        Last updated: {session.lastUpdated.toLocaleString()}
      </div>
    </div>
  );
}