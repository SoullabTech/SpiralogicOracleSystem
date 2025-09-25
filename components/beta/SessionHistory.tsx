// Session History Timeline - Shows past oracle sessions as mini holoflowers
import React from 'react';
import { HoloflowerViz } from './HoloflowerViz';

interface Session {
  sessionId: string;
  timestamp: string;
  elementalBalance: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
  spiralStage: {
    element: 'fire' | 'water' | 'earth' | 'air';
    stage: 1 | 2 | 3;
  };
}

interface SessionHistoryProps {
  sessions: Session[];
  onSessionClick?: (session: Session) => void;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({
  sessions,
  onSessionClick
}) => {
  if (sessions.length === 0) return null;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const mins = Math.floor(diff / (1000 * 60));
      return `${mins}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
          Journey Timeline
        </h3>
        
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-thin">
          {sessions.map((session, index) => (
            <div
              key={session.sessionId}
              className="flex-shrink-0 cursor-pointer group"
              onClick={() => onSessionClick?.(session)}
            >
              <div className="relative">
                {/* Mini Holoflower */}
                <div className="bg-gray-50 rounded-lg p-2 group-hover:bg-gray-100 transition-colors">
                  <HoloflowerViz
                    balance={session.elementalBalance}
                    current={session.spiralStage}
                    size={64}
                    minimal={true}
                  />
                </div>
                
                {/* Session number badge */}
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 
                              text-white text-xs rounded-full flex items-center 
                              justify-center font-medium">
                  {sessions.length - index}
                </div>
              </div>
              
              {/* Timestamp */}
              <p className="text-xs text-gray-400 text-center mt-1">
                {formatTime(session.timestamp)}
              </p>
            </div>
          ))}
        </div>

        {/* Journey Arc Summary */}
        {sessions.length >= 3 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">Journey Arc:</span>
                <div className="flex items-center space-x-1">
                  {/* Show element progression */}
                  {sessions.slice(0, 3).reverse().map((s, i) => (
                    <React.Fragment key={i}>
                      <span className={`px-2 py-1 rounded-full text-white text-xs
                        ${s.spiralStage.element === 'fire' ? 'bg-red-400' :
                          s.spiralStage.element === 'water' ? 'bg-blue-400' :
                          s.spiralStage.element === 'earth' ? 'bg-green-400' :
                          'bg-yellow-400'}`}>
                        {s.spiralStage.element[0].toUpperCase()}{s.spiralStage.stage}
                      </span>
                      {i < 2 && <span className="text-gray-400">→</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Session Modal (optional) */}
      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          height: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 2px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 2px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default SessionHistory;