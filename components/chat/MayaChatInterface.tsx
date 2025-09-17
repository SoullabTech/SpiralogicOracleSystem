'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, X, Volume2, VolumeX } from 'lucide-react';
import { SimpleVoiceMic } from '../ui/SimpleVoiceMic';
import { toast } from 'react-hot-toast';
import { logVoiceAttemptStarted, logVoiceTranscriptReceived, logTextFallbackUsed } from '../../utils/voiceAnalytics';
import { logProductionVoiceAttempt, logProductionTranscriptReceived } from '../../utils/voiceTelemetry';

interface ChatMessage {
  id: string;
  role: 'user' | 'maya';
  text: string;
  timestamp: Date;
  attachments?: {
    id: string;
    name: string;
    type: string;
    size: number;
    url?: string;
  }[];
  isPlaying?: boolean; // Track if this message is being spoken
}

interface MayaChatInterfaceProps {
  onSendMessage: (text: string, attachments?: File[]) => void;
  onVoiceTranscript?: (text: string) => void;
  onSpeakMessage?: (text: string, messageId: string) => Promise<void>;
  onStopSpeaking?: () => void;
  messages?: ChatMessage[];
  agentName?: string;
  isProcessing?: boolean;
  disabled?: boolean;
  className?: string;
  currentlySpeakingId?: string; // Track which message is being spoken
  useArchetypalRouting?: boolean; // Enable sophisticated multi-agent routing
  userId?: string; // For personalized archetypal experiences
}

export const MayaChatInterface: React.FC<MayaChatInterfaceProps> = ({
  onSendMessage,
  onVoiceTranscript,
  onSpeakMessage,
  onStopSpeaking,
  messages = [],
  agentName = 'Maya',
  isProcessing = false,
  disabled = false,
  className = '',
  currentlySpeakingId,
  useArchetypalRouting = false,
  userId
}) => {
  // Input states
  const [inputText, setInputText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Voice states
  const [showVoiceMic, setShowVoiceMic] = useState(false);
  const [enableVAD, setEnableVAD] = useState(true); // Enable voice activation by default
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text'); // Track input mode

  // Archetypal routing states
  const [currentAgent, setCurrentAgent] = useState<string>('maya');
  const [archetypalInsights, setArchetypalInsights] = useState<any>(null);
  
  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  // Handle voice transcript from SimpleVoiceMic
  const handleVoiceTranscript = useCallback((transcript: string) => {
    if (transcript.trim()) {
      console.log('📤 Received voice transcript:', transcript);

      // Analytics
      logVoiceTranscriptReceived(transcript);
      logProductionTranscriptReceived(Date.now() - performance.now(), transcript.length);

      // Set input mode to voice
      setInputMode('voice');

      // Send message
      onSendMessage(transcript.trim());

      // Hide voice mic after sending
      setShowVoiceMic(false);

      // Reset input mode to text after sending
      setTimeout(() => setInputMode('text'), 100);
    }
  }, [onSendMessage]);

  const toggleVoiceMic = useCallback(() => {
    setShowVoiceMic(prev => !prev);
    logVoiceAttemptStarted({ mode: 'chat' });
    logProductionVoiceAttempt({ mode: 'chat' });
  }, []);

  const handleSend = useCallback(async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText && attachedFiles.length === 0) return;

    // Enhanced archetypal routing if enabled
    if (useArchetypalRouting && userId) {
      try {
        // Call the Master Oracle Orchestrator API endpoint
        const response = await fetch('/api/oracle/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: messageText,
            userId: userId,
            options: {
              voiceInput: inputMode === 'voice',
              attachments: attachedFiles.length > 0 ? attachedFiles : undefined
            }
          })
        });

        if (response.ok) {
          const oracleResponse = await response.json();

          // Update current agent and insights
          setCurrentAgent(oracleResponse.agentUsed);
          setArchetypalInsights(oracleResponse.archetypalEnergies);

          // Send the oracle response through the normal message flow
          onSendMessage(messageText, attachedFiles.length > 0 ? attachedFiles : undefined);
        } else {
          // Fallback to normal message sending
          onSendMessage(messageText, attachedFiles.length > 0 ? attachedFiles : undefined);
        }
      } catch (error) {
        console.error('Archetypal routing failed, using fallback:', error);
        // Fallback to normal message sending
        onSendMessage(messageText, attachedFiles.length > 0 ? attachedFiles : undefined);
      }
    } else {
      // Standard message sending
      onSendMessage(messageText, attachedFiles.length > 0 ? attachedFiles : undefined);
    }

    setInputText('');
    setAttachedFiles([]);
  }, [inputText, attachedFiles, onSendMessage, useArchetypalRouting, userId, inputMode]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFileAdd(files);
  };

  const handleFileAdd = (files: File[]) => {
    const validFiles = files.filter(file => {
      // File size limit: 10MB
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 10MB.`);
        return false;
      }
      
      // Supported types
      const supportedTypes = [
        'text/plain', 'text/markdown', 'text/csv',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'image/jpeg', 'image/png', 'image/webp', 'image/gif'
      ];
      
      if (!supportedTypes.includes(file.type)) {
        toast.error(`${file.name} file type not supported.`);
        return false;
      }
      
      return true;
    });

    if (attachedFiles.length + validFiles.length > 5) {
      toast.error('Maximum 5 files allowed');
      return;
    }

    setAttachedFiles(prev => [...prev, ...validFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileAdd(files);
  };

  const canSend = (inputText.trim() || attachedFiles.length > 0) && !disabled && !isProcessing;

  return (
    <div className={`maya-chat-interface bg-slate-900/50 backdrop-blur-sm rounded-xl border border-white/10 ${className}`}>
      {/* Archetypal Agent Indicator */}
      {useArchetypalRouting && (
        <div className="px-4 py-2 bg-gradient-to-r from-[#D4B896]/20 to-[#D4B896]/10 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#D4B896] animate-pulse"></div>
              <span className="text-xs text-white/80">
                {currentAgent === 'maya' && '🔮 Maya - Divine Wisdom'}
                {currentAgent === 'fire' && '🔥 Fire - Transformative Power'}
                {currentAgent === 'water' && '💧 Water - Emotional Healing'}
                {currentAgent === 'earth' && '🌱 Earth - Grounding Manifestation'}
                {currentAgent === 'air' && '🌬️ Air - Clarity & Truth'}
              </span>
            </div>
            {archetypalInsights && (
              <div className="text-xs text-[#D4B896]">
                {archetypalInsights.essence}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages Display */}
      {messages.length > 0 && (
        <div className="p-4 max-h-60 overflow-y-auto space-y-3">
          {messages.slice(-3).map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`relative max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-[#D4B896]/80 text-white'
                  : 'bg-white/10 text-white'
              }`}>
                <p className="text-sm">{message.text}</p>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.attachments.map(file => (
                      <div key={file.id} className="text-xs opacity-75">{file.name}</div>
                    ))}
                  </div>
                )}
                {/* Voice Synthesis Button for Maya's messages */}
                {message.role === 'maya' && onSpeakMessage && (
                  <button
                    onClick={() => {
                      if (currentlySpeakingId === message.id) {
                        onStopSpeaking?.();
                      } else {
                        onSpeakMessage(message.text, message.id);
                      }
                    }}
                    className="absolute -right-2 -top-2 p-1.5 bg-[#D4B896]/80 hover:bg-[#D4B896] rounded-full transition-colors"
                    title={currentlySpeakingId === message.id ? "Stop speaking" : "Speak message"}
                  >
                    {currentlySpeakingId === message.id ? (
                      <VolumeX size={14} className="text-white" />
                    ) : (
                      <Volume2 size={14} className="text-white" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div
        className={`p-4 border-t border-white/10 ${isDragOver ? 'bg-[#D4B896]/10' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Attached Files */}
        {attachedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1">
                <span className="text-xs text-white">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-white/60 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Row */}
        <div className="flex items-end gap-3">
          {/* File Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || attachedFiles.length >= 5}
            className="flex-shrink-0 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
            title="Attach file"
          >
            <Paperclip size={16} className="text-white" />
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={attachedFiles.length > 0 ? `Ask ${agentName} about your files...` : "Type your message..."}
              disabled={disabled || showVoiceMic}
              className="w-full min-h-[44px] max-h-[120px] p-3 pr-12 bg-white/5 border border-white/20 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#D4B896]/50 focus:border-[#D4B896]/50 text-white placeholder-white/40 disabled:opacity-50"
            />
          </div>

          {/* Send Button */}
          {inputText.trim() || attachedFiles.length > 0 ? (
            <motion.button
              onClick={() => handleSend()}
              disabled={!canSend}
              whileTap={{ scale: 0.95 }}
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                canSend
                  ? 'bg-[#D4B896] hover:bg-[#D4B896]/80 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
              title="Send message"
            >
              <Send size={16} />
            </motion.button>
          ) : null}
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="mt-3 flex items-center justify-center gap-2 text-white/60">
            <div className="w-2 h-2 bg-[#D4B896] rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-[#D4B896] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-[#D4B896] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <span className="text-sm">{agentName} is thinking...</span>
          </div>
        )}

        {/* Toggle Voice Mode Button */}
        <div className="mt-3 flex justify-center">
          <button
            onClick={toggleVoiceMic}
            className="px-4 py-2 bg-gradient-to-r from-[#D4B896]/20 to-[#8B7B6B]/20 hover:from-[#D4B896]/30 hover:to-[#8B7B6B]/30 rounded-full text-xs text-white/70 hover:text-white transition-all flex items-center gap-2 border border-white/10"
          >
            {showVoiceMic ? (
              <>
                <X size={14} />
                Hide Voice Mode
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z" />
                  <path d="M19 12C19 15.53 16.39 18.44 13 18.93V22H11V18.93C7.61 18.44 5 15.53 5 12H7C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12H19Z" />
                </svg>
                {enableVAD ? 'Voice Activated Mode' : 'Voice Chat Mode'}
              </>
            )}
          </button>
        </div>

        {/* VAD Settings Toggle */}
        {showVoiceMic && (
          <div className="mt-2 flex justify-center">
            <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
              <input
                type="checkbox"
                checked={enableVAD}
                onChange={(e) => setEnableVAD(e.target.checked)}
                className="w-3 h-3 rounded bg-white/10 border-white/20 text-[#D4B896] focus:ring-[#D4B896]/50"
              />
              <span>Auto-detect voice (hands-free)</span>
            </label>
          </div>
        )}

        {/* Hints */}
        <div className="mt-2 text-xs text-white/40 text-center">
          {showVoiceMic
            ? enableVAD
              ? 'Just start speaking - I\'ll listen automatically'
              : 'Click the mic button to start/stop recording'
            : 'Press Enter to send • Shift+Enter for new line'
          }
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        accept=".txt,.md,.csv,.pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.gif"
        className="hidden"
      />

      {/* Voice Mic Overlay */}
      {showVoiceMic && (
        <SimpleVoiceMic
          onTranscript={handleVoiceTranscript}
          pauseListening={isProcessing || disabled}
          enableVAD={enableVAD}
          className="z-50"
        />
      )}
    </div>
  );
};

export default MayaChatInterface;