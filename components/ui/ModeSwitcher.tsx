/**
 * ModeSwitcher - Elegant Voice/Chat mode toggle
 * Responsive design for desktop and mobile
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MessageSquare } from 'lucide-react';

interface ModeSwitcherProps {
  mode: 'voice' | 'chat';
  onModeChange: (mode: 'voice' | 'chat') => void;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ mode, onModeChange }) => {
  return (
    <>
      {/* Desktop Version - Vertical tabs on left */}
      <div className="hidden md:block fixed left-0 top-1/2 -translate-y-1/2 z-40">
        <div className="flex flex-col">
          {/* Voice Tab */}
          <motion.button
            onClick={() => onModeChange('voice')}
            className="relative px-4 py-6 transition-all"
            style={{
              background: mode === 'voice'
                ? 'linear-gradient(90deg, rgba(212,184,150,0.2), transparent)'
                : 'transparent',
              borderLeft: mode === 'voice' ? '2px solid #d4b896' : '2px solid transparent',
              width: '120px',
              writingMode: 'horizontal-tb'
            }}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2">
              <Mic size={16} style={{ color: mode === 'voice' ? '#d4b896' : 'rgba(212,184,150,0.5)' }} />
              <span
                className="text-sm font-light tracking-wide"
                style={{ color: mode === 'voice' ? '#d4b896' : 'rgba(212,184,150,0.5)' }}
              >
                Voice
              </span>
            </div>
            {mode === 'voice' && (
              <motion.div
                className="absolute left-0 top-0 bottom-0 w-0.5"
                style={{ background: '#d4b896' }}
                layoutId="activeTab"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>

          {/* Chat Tab */}
          <motion.button
            onClick={() => onModeChange('chat')}
            className="relative px-4 py-6 transition-all"
            style={{
              background: mode === 'chat'
                ? 'linear-gradient(90deg, rgba(71,85,105,0.2), transparent)'
                : 'transparent',
              borderLeft: mode === 'chat' ? '2px solid #475569' : '2px solid transparent',
              width: '120px',
              writingMode: 'horizontal-tb'
            }}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2">
              <MessageSquare size={16} style={{ color: mode === 'chat' ? '#64748b' : 'rgba(71,85,105,0.5)' }} />
              <span
                className="text-sm font-light tracking-wide"
                style={{ color: mode === 'chat' ? '#64748b' : 'rgba(71,85,105,0.5)' }}
              >
                Chat
              </span>
            </div>
            {mode === 'chat' && (
              <motion.div
                className="absolute left-0 top-0 bottom-0 w-0.5"
                style={{ background: '#475569' }}
                layoutId="activeTab"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Version - Horizontal pills at bottom */}
      <div className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-40">
        <div className="flex bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/10">
          {/* Voice Button */}
          <motion.button
            onClick={() => onModeChange('voice')}
            className="relative px-4 py-2 rounded-full flex items-center gap-2 transition-all"
            style={{
              background: mode === 'voice'
                ? 'linear-gradient(135deg, rgba(212,184,150,0.3), rgba(212,184,150,0.2))'
                : 'transparent',
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Mic size={14} style={{ color: mode === 'voice' ? '#d4b896' : 'rgba(212,184,150,0.5)' }} />
            <span
              className="text-xs font-light"
              style={{ color: mode === 'voice' ? '#d4b896' : 'rgba(212,184,150,0.5)' }}
            >
              Voice
            </span>
          </motion.button>

          {/* Chat Button */}
          <motion.button
            onClick={() => onModeChange('chat')}
            className="relative px-4 py-2 rounded-full flex items-center gap-2 transition-all"
            style={{
              background: mode === 'chat'
                ? 'linear-gradient(135deg, rgba(71,85,105,0.3), rgba(71,85,105,0.2))'
                : 'transparent',
            }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageSquare size={14} style={{ color: mode === 'chat' ? '#64748b' : 'rgba(71,85,105,0.5)' }} />
            <span
              className="text-xs font-light"
              style={{ color: mode === 'chat' ? '#64748b' : 'rgba(71,85,105,0.5)' }}
            >
              Chat
            </span>
          </motion.button>
        </div>
      </div>
    </>
  );
};