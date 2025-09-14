'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Paperclip, X, Keyboard, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
  currentlySpeakingId
}) => {
  // Input states
  const [inputText, setInputText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Voice states
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  
  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript + ' ';
          } else {
            interim += transcript;
          }
        }
        
        if (final) {
          setVoiceTranscript(prev => prev + final);
          // Reset silence timer
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }
          silenceTimerRef.current = setTimeout(() => {
            stopListening();
          }, 3000); // 3 seconds of silence
        }
        
        setInterimTranscript(interim);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast.error('Voice recognition error. Please try again.');
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      toast.error('Voice recognition not supported in this browser');
      return;
    }

    setInputMode('voice');
    setVoiceTranscript('');
    setInterimTranscript('');
    recognitionRef.current.start();
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    
    // Send voice transcript if we have it
    if (voiceTranscript.trim()) {
      // Only call onVoiceTranscript if provided, otherwise use handleSend
      if (onVoiceTranscript) {
        onVoiceTranscript(voiceTranscript.trim());
      } else {
        handleSend(voiceTranscript.trim());
      }
    }
    
    setInputMode('text');
    setVoiceTranscript('');
    setInterimTranscript('');
  }, [voiceTranscript, onVoiceTranscript]);

  const handleSend = useCallback((text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText && attachedFiles.length === 0) return;

    onSendMessage(messageText, attachedFiles.length > 0 ? attachedFiles : undefined);
    setInputText('');
    setAttachedFiles([]);
  }, [inputText, attachedFiles, onSendMessage]);

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
        {/* Voice Mode */}
        {inputMode === 'voice' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-4 bg-[#D4B896]/20 rounded-xl border border-[#D4B896]/30"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-400 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-white text-sm">
                  {isListening ? 'Listening...' : 'Voice input ready'}
                </span>
              </div>
              <button
                onClick={stopListening}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="text-white min-h-[40px] p-2 bg-black/20 rounded border">
              {voiceTranscript && <span>{voiceTranscript}</span>}
              {interimTranscript && <span className="text-white/60">{interimTranscript}</span>}
              {!voiceTranscript && !interimTranscript && (
                <span className="text-white/40">Start speaking...</span>
              )}
            </div>
          </motion.div>
        )}

        {/* Text Input Mode */}
        {inputMode === 'text' && (
          <>
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
                  disabled={disabled}
                  className="w-full min-h-[44px] max-h-[120px] p-3 pr-12 bg-white/5 border border-white/20 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#D4B896]/50 focus:border-[#D4B896]/50 text-white placeholder-white/40"
                />
              </div>

              {/* Voice/Send Button */}
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
              ) : (
                <button
                  onClick={startListening}
                  disabled={disabled}
                  className="flex-shrink-0 w-10 h-10 bg-[#D4B896] hover:bg-[#D4B896]/80 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                  title="Voice message"
                >
                  <Mic size={16} className="text-white" />
                </button>
              )}
            </div>
          </>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="mt-3 flex items-center justify-center gap-2 text-white/60">
            <div className="w-2 h-2 bg-[#D4B896] rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-[#D4B896] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-[#D4B896] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <span className="text-sm">{agentName} is thinking...</span>
          </div>
        )}

        {/* Hints */}
        <div className="mt-2 text-xs text-white/40 text-center">
          {inputMode === 'text' ? (
            'Press Enter to send • Shift+Enter for new line • Drop files to attach'
          ) : (
            'Speak clearly • 3 seconds of silence will send your message'
          )}
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
    </div>
  );
};

export default MayaChatInterface;