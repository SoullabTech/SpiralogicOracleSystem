'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { offeringService } from '@/lib/services/offering-session-service';
import { OfferingTimelineItem, OfferingStats } from '@/lib/types/offering-sessions';

interface OfferingTimelineProps {
  userId: string;
  showStats?: boolean;
  limit?: number;
  className?: string;
}

export function OfferingTimeline({ 
  userId, 
  showStats = true, 
  limit = 30, 
  className = '' 
}: OfferingTimelineProps) {
  const [timeline, setTimeline] = useState<OfferingTimelineItem[]>([]);
  const [stats, setStats] = useState<OfferingStats | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<OfferingTimelineItem | null>(null);

  useEffect(() => {
    if (!userId) return;
    
    loadTimelineData();
  }, [userId, limit]);

  const loadTimelineData = async () => {
    try {
      setIsLoading(true);
      
      const [timelineData, statsData, streakData] = await Promise.all([
        offeringService.getUserTimeline(userId, limit),
        showStats ? offeringService.getUserStats(userId) : null,
        offeringService.getOfferingStreak(userId)
      ]);

      setTimeline(timelineData);
      setStats(statsData);
      setStreak(streakData);
    } catch (error) {
      console.error('Error loading timeline data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getStatusMessage = (item: OfferingTimelineItem) => {
    switch (item.status) {
      case 'rest':
        return 'The flower rested in your presence';
      case 'offering':
        return 'You offered your petals';
      case 'bloom':
        return 'Your offering blossomed beautifully';
      case 'transcendent':
        return 'A transcendent moment was shared';
      default:
        return 'Sacred moment captured';
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <motion.div
          className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500/40 to-pink-500/40"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Overview */}
      {showStats && stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10"
        >
          <h3 className="text-white text-lg font-semibold mb-4">Sacred Journey</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-purple-400">{streak}</div>
              <div className="text-white/60 text-sm">Current Streak</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl font-bold text-pink-400">{stats.offering_days}</div>
              <div className="text-white/60 text-sm">Offerings Made</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-400">{stats.rest_days}</div>
              <div className="text-white/60 text-sm">Days of Rest</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-400">{stats.offering_percentage}%</div>
              <div className="text-white/60 text-sm">Offering Rate</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Timeline */}
      <div className="space-y-3">
        <h4 className="text-white/80 text-sm font-medium">Recent Offerings</h4>
        
        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
          <AnimatePresence>
            {timeline.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center space-x-4 p-4 rounded-xl bg-black/10 backdrop-blur-sm
                           border border-white/5 hover:border-white/20 transition-all duration-300
                           cursor-pointer group"
                onClick={() => setSelectedItem(item)}
              >
                {/* Icon */}
                <motion.div
                  className="w-12 h-12 rounded-full flex items-center justify-center
                           bg-gradient-to-br from-white/5 to-white/10 border border-white/10"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-2xl">{item.icon}</span>
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-medium">
                      {formatDate(item.session_date)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize
                      ${item.status === 'rest' ? 'bg-green-500/20 text-green-400' :
                        item.status === 'transcendent' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-purple-500/20 text-purple-400'}`}>
                      {item.status}
                    </span>
                  </div>
                  
                  <p className="text-white/60 text-xs">
                    {getStatusMessage(item)}
                  </p>

                  {/* Petal indicators for offerings */}
                  {item.petal_scores && item.petal_scores.length > 0 && (
                    <div className="flex items-center space-x-1 mt-2">
                      {item.petal_scores.map((score, petalIndex) => (
                        <div
                          key={petalIndex}
                          className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{ opacity: score > 0 ? 0.8 : 0.2 }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Hover arrow */}
                <motion.div
                  className="w-6 h-6 text-white/40 group-hover:text-white/80 transition-colors"
                  animate={{ x: selectedItem?.id === item.id ? 4 : 0 }}
                >
                  →
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>

          {timeline.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌸</div>
              <p className="text-white/60 text-sm">
                Your offering journey begins here
              </p>
              <p className="text-white/40 text-xs mt-2">
                Each offering becomes part of your sacred timeline
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Selected Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="max-w-md mx-4 p-6 rounded-2xl bg-black/90 backdrop-blur-lg border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center space-y-4">
                <div className="text-4xl">{selectedItem.icon}</div>
                
                <div>
                  <h3 className="text-white text-lg font-semibold">
                    {formatDate(selectedItem.session_date)}
                  </h3>
                  <p className="text-white/70 text-sm capitalize">
                    {selectedItem.status} Session
                  </p>
                </div>

                {selectedItem.oracle_reflection && (
                  <div className="text-left space-y-2">
                    <h4 className="text-white/80 text-sm font-medium">Oracle Reflection</h4>
                    <p className="text-white/60 text-sm italic">
                      {selectedItem.oracle_reflection}
                    </p>
                  </div>
                )}

                {selectedItem.journal_prompt && (
                  <div className="text-left space-y-2">
                    <h4 className="text-white/80 text-sm font-medium">Journal Prompt</h4>
                    <p className="text-white/60 text-sm">
                      {selectedItem.journal_prompt}
                    </p>
                  </div>
                )}

                <motion.button
                  onClick={() => setSelectedItem(null)}
                  className="px-6 py-2 rounded-full bg-white/10 border border-white/20 
                           text-white/80 text-sm hover:bg-white/20 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}