'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
  X,
  RefreshCw,
  Trash2,
  Volume2,
  Mic,
  MessageSquare,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import {
  resetSystem,
  resetVoiceSystem,
  resetConversation,
  clearAllCaches,
  emergencyReset,
  getSystemState
} from '@/utils/systemReset';

interface SystemDebugProps {
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  defaultOpen?: boolean;
}

export const SystemDebug: React.FC<SystemDebugProps> = ({
  position = 'bottom-right',
  defaultOpen = false
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [systemState, setSystemState] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'state' | 'logs' | 'actions'>('state');

  // Capture console logs
  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      originalLog(...args);
      setLogs(prev => [...prev.slice(-50), `[LOG] ${args.join(' ')}`]);
    };

    console.error = (...args) => {
      originalError(...args);
      setLogs(prev => [...prev.slice(-50), `[ERROR] ${args.join(' ')}`]);
    };

    console.warn = (...args) => {
      originalWarn(...args);
      setLogs(prev => [...prev.slice(-50), `[WARN] ${args.join(' ')}`]);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  // Update system state
  useEffect(() => {
    const updateState = () => {
      if (typeof window !== 'undefined') {
        setSystemState(getSystemState());
      }
    };

    updateState();
    const interval = setInterval(updateState, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleReset = (type: string) => {
    const confirmReset = window.confirm(`Are you sure you want to ${type}?`);
    if (!confirmReset) return;

    switch (type) {
      case 'voice':
        resetVoiceSystem();
        break;
      case 'conversation':
        resetConversation();
        break;
      case 'cache':
        clearAllCaches();
        break;
      case 'full':
        resetSystem();
        break;
      case 'emergency':
        const doubleConfirm = window.confirm('This will clear ALL data. Are you absolutely sure?');
        if (doubleConfirm) {
          emergencyReset();
        }
        break;
    }

    // Update state after reset
    setSystemState(getSystemState());
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-left': 'bottom-4 left-4'
  };

  return (
    <>
      {/* Debug Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed ${positionClasses[position]} z-[9999] p-3 rounded-full
                   bg-black/80 backdrop-blur-sm border border-white/10
                   hover:border-white/20 transition-all duration-200`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-white/80" />
        ) : (
          <Terminal className="w-5 h-5 text-white/80" />
        )}
      </motion.button>

      {/* Debug Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed ${positionClasses[position]} z-[9998]
                       w-96 max-h-[600px] overflow-hidden
                       bg-black/90 backdrop-blur-md rounded-2xl
                       border border-white/10 shadow-2xl`}
            style={{ marginRight: '60px' }}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                System Debug Panel
              </h3>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10">
              {(['state', 'logs', 'actions'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors
                            ${activeTab === tab
                              ? 'text-white bg-white/10'
                              : 'text-white/60 hover:text-white/80'}`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-4 max-h-[400px] overflow-y-auto">
              {/* System State Tab */}
              {activeTab === 'state' && systemState && (
                <div className="space-y-4">
                  {/* Voice State */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                      <Volume2 className="w-4 h-4" />
                      Voice System
                    </div>
                    <div className="pl-6 space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        {systemState.voice.enabled ? (
                          <CheckCircle className="w-3 h-3 text-green-400" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-400" />
                        )}
                        <span className="text-white/60">
                          Enabled: {systemState.voice.enabled ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Info className="w-3 h-3 text-blue-400" />
                        <span className="text-white/60">
                          Voice: {systemState.voice.selectedVoice || 'None'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {systemState.voice.synthesisActive ? (
                          <CheckCircle className="w-3 h-3 text-green-400" />
                        ) : (
                          <XCircle className="w-3 h-3 text-gray-400" />
                        )}
                        <span className="text-white/60">
                          Speaking: {systemState.voice.synthesisActive ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Info className="w-3 h-3 text-blue-400" />
                        <span className="text-white/60">
                          Voices Available: {systemState.voice.synthesisVoices}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Conversation State */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                      <MessageSquare className="w-4 h-4" />
                      Conversation
                    </div>
                    <div className="pl-6 space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        {systemState.conversation.hasHistory ? (
                          <CheckCircle className="w-3 h-3 text-green-400" />
                        ) : (
                          <XCircle className="w-3 h-3 text-gray-400" />
                        )}
                        <span className="text-white/60">
                          Has History: {systemState.conversation.hasHistory ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {systemState.conversation.sessionActive ? (
                          <CheckCircle className="w-3 h-3 text-green-400" />
                        ) : (
                          <XCircle className="w-3 h-3 text-gray-400" />
                        )}
                        <span className="text-white/60">
                          Session Active: {systemState.conversation.sessionActive ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Storage State */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                      <Settings className="w-4 h-4" />
                      Storage
                    </div>
                    <div className="pl-6 space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <Info className="w-3 h-3 text-blue-400" />
                        <span className="text-white/60">
                          LocalStorage Keys: {systemState.storage.localStorageKeys}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Info className="w-3 h-3 text-blue-400" />
                        <span className="text-white/60">
                          SessionStorage Keys: {systemState.storage.sessionStorageKeys}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Info className="w-3 h-3 text-blue-400" />
                        <span className="text-white/60">
                          Total Size: {(systemState.storage.totalSize / 1024).toFixed(2)} KB
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Logs Tab */}
              {activeTab === 'logs' && (
                <div className="space-y-1">
                  {logs.length === 0 ? (
                    <p className="text-white/40 text-xs">No logs yet...</p>
                  ) : (
                    logs.map((log, index) => (
                      <div
                        key={index}
                        className={`text-xs font-mono p-1 rounded
                                  ${log.startsWith('[ERROR]') ? 'text-red-400 bg-red-900/20' :
                                    log.startsWith('[WARN]') ? 'text-yellow-400 bg-yellow-900/20' :
                                    'text-white/60 bg-white/5'}`}
                      >
                        {log}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Actions Tab */}
              {activeTab === 'actions' && (
                <div className="space-y-2">
                  <button
                    onClick={() => handleReset('voice')}
                    className="w-full px-4 py-2 text-left text-sm text-white/80
                             bg-white/5 hover:bg-white/10 rounded-lg
                             transition-colors flex items-center gap-2"
                  >
                    <Volume2 className="w-4 h-4" />
                    Reset Voice System
                  </button>

                  <button
                    onClick={() => handleReset('conversation')}
                    className="w-full px-4 py-2 text-left text-sm text-white/80
                             bg-white/5 hover:bg-white/10 rounded-lg
                             transition-colors flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Clear Conversation
                  </button>

                  <button
                    onClick={() => handleReset('cache')}
                    className="w-full px-4 py-2 text-left text-sm text-white/80
                             bg-white/5 hover:bg-white/10 rounded-lg
                             transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Caches
                  </button>

                  <button
                    onClick={() => handleReset('full')}
                    className="w-full px-4 py-2 text-left text-sm text-white/80
                             bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg
                             transition-colors flex items-center gap-2
                             border border-yellow-500/20"
                  >
                    <RefreshCw className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400">Full System Reset</span>
                  </button>

                  <button
                    onClick={() => handleReset('emergency')}
                    className="w-full px-4 py-2 text-left text-sm
                             bg-red-500/10 hover:bg-red-500/20 rounded-lg
                             transition-colors flex items-center gap-2
                             border border-red-500/20"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400">Emergency Reset (Clear All)</span>
                  </button>

                  <div className="mt-4 p-3 bg-white/5 rounded-lg">
                    <p className="text-xs text-white/40">
                      <strong>Note:</strong> Reset actions will clear stored data.
                      Emergency reset removes ALL data and reloads the page.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SystemDebug;