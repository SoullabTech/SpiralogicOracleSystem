import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Sparkles, FileAudio, FileVideo, FileImage, FileText } from 'lucide-react';

interface SessionAsset {
  id: string;
  type: 'audio' | 'video' | 'image' | 'doc';
  preview: string;
  path: string;
  timestamp: Date;
}

interface TimelineSession {
  id: string;
  timestamp: Date;
  coherence: number;
  resonance: string[];
  assets: SessionAsset[];
  notes?: string;
  intention?: string;
}

interface MiniHoloflowerProps {
  session: TimelineSession;
  onClick: () => void;
  isExpanded: boolean;
}

const MiniHoloflower: React.FC<MiniHoloflowerProps> = ({ session, onClick, isExpanded }) => {
  const petalColors = {
    fire: '#ff6b6b',
    water: '#4dabf7',
    earth: '#51cf66',
    air: '#cc5de8',
    aether: '#ffd43b'
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'audio': return <FileAudio className="w-3 h-3" />;
      case 'video': return <FileVideo className="w-3 h-3" />;
      case 'image': return <FileImage className="w-3 h-3" />;
      case 'doc': return <FileText className="w-3 h-3" />;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative cursor-pointer"
    >
      {/* Mini Holoflower */}
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Petals based on resonance */}
          {session.resonance.map((element, index) => {
            const angle = (index * 360) / session.resonance.length;
            const color = petalColors[element.toLowerCase() as keyof typeof petalColors];
            return (
              <motion.circle
                key={element}
                cx={50 + 20 * Math.cos((angle * Math.PI) / 180)}
                cy={50 + 20 * Math.sin((angle * Math.PI) / 180)}
                r="15"
                fill={color}
                opacity={0.6}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 0.8, 0.6]
                }}
                transition={{
                  duration: 3,
                  delay: index * 0.2,
                  repeat: Infinity
                }}
              />
            );
          })}
          
          {/* Center coherence indicator */}
          <circle
            cx="50"
            cy="50"
            r="10"
            fill={session.coherence > 0.8 ? '#ffd43b' : '#9775fa'}
            opacity={session.coherence}
          />
        </svg>

        {/* Asset indicators */}
        {session.assets.length > 0 && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-black/60 rounded-full px-2 py-1">
            {session.assets.slice(0, 3).map((asset, i) => (
              <div key={i} className="text-white/80">
                {getAssetIcon(asset.type)}
              </div>
            ))}
            {session.assets.length > 3 && (
              <span className="text-xs text-white/60">+{session.assets.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Timestamp */}
      <div className="text-center mt-2 text-xs text-gray-400">
        {session.timestamp.toLocaleDateString()}
      </div>

      {/* Expanded Preview Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-50 w-80 bg-black/90 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/30 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-white">
                  {session.timestamp.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-yellow-400">
                  {(session.coherence * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Intention */}
            {session.intention && (
              <div className="mb-3 p-2 bg-purple-900/30 rounded-lg">
                <p className="text-xs text-purple-300 mb-1">Intention:</p>
                <p className="text-sm text-white">{session.intention}</p>
              </div>
            )}

            {/* Assets Grid */}
            {session.assets.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-2">Session Assets:</p>
                <div className="grid grid-cols-3 gap-2">
                  {session.assets.map((asset) => (
                    <motion.a
                      key={asset.id}
                      href={asset.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      className="relative group"
                    >
                      {/* Asset Preview */}
                      {asset.type === 'image' || asset.type === 'video' ? (
                        <img
                          src={asset.preview}
                          alt={asset.id}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                      ) : asset.type === 'audio' ? (
                        <div className="w-full h-20 bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg flex items-center justify-center">
                          <img
                            src={asset.preview}
                            alt={asset.id}
                            className="w-full h-12 object-contain opacity-60"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-20 bg-gradient-to-br from-blue-900/50 to-green-900/50 rounded-lg flex items-center justify-center">
                          <FileText className="w-8 h-8 text-white/60" />
                        </div>
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <span className="text-xs text-white text-center px-1">
                          {asset.id.substring(0, 15)}...
                        </span>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {session.notes && (
              <div className="p-2 bg-white/5 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Notes:</p>
                <p className="text-sm text-white/80">{session.notes}</p>
              </div>
            )}

            {/* Resonance Tags */}
            <div className="flex gap-2 mt-3">
              {session.resonance.map((element) => (
                <span
                  key={element}
                  className="px-2 py-1 text-xs bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded text-purple-300"
                >
                  {element}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface TimelineWithAssetsProps {
  sessions: TimelineSession[];
  onSessionClick?: (session: TimelineSession) => void;
}

export default function TimelineWithAssets({ sessions, onSessionClick }: TimelineWithAssetsProps) {
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'all'>('week');

  const filterSessionsByRange = (sessions: TimelineSession[]) => {
    const now = new Date();
    const ranges = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      all: Infinity
    };

    const cutoff = now.getTime() - ranges[timeRange];
    return sessions.filter(s => s.timestamp.getTime() > cutoff);
  };

  const filteredSessions = filterSessionsByRange(sessions);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900/20 via-black to-purple-900/20 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          Sacred Timeline
        </h1>
        <p className="text-gray-400 text-sm">
          Your journey through resonance & coherence
        </p>
      </motion.div>

      {/* Time Range Selector */}
      <div className="flex justify-center gap-2 mb-8">
        {(['day', 'week', 'month', 'all'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg capitalize transition-all ${
              timeRange === range
                ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            }`}
          >
            {range === 'all' ? 'All Time' : `Past ${range}`}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative max-w-4xl mx-auto">
        {/* Timeline Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/50 via-pink-500/50 to-purple-500/50" />

        {/* Sessions */}
        <div className="space-y-12">
          {filteredSessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center ${
                index % 2 === 0 ? 'justify-start' : 'justify-end'
              }`}
            >
              <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                <MiniHoloflower
                  session={session}
                  onClick={() => {
                    setExpandedSession(expandedSession === session.id ? null : session.id);
                    onSessionClick?.(session);
                  }}
                  isExpanded={expandedSession === session.id}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Current Moment Indicator */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 -bottom-8"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-4 h-4 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50" />
          <div className="text-xs text-yellow-400 mt-2 -ml-2">Now</div>
        </motion.div>
      </div>

      {/* Empty State */}
      {filteredSessions.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="text-6xl mb-4">🌸</div>
          <p className="text-gray-400">
            No sessions in this time range. Begin your sacred journey.
          </p>
        </motion.div>
      )}
    </div>
  );
}