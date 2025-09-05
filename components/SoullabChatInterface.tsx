"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Upload, BookOpen, MoreHorizontal, Heart, Brain, Zap } from 'lucide-react';
import { useSoullabOracle } from '../hooks/useSoullabOracle';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    oracleStage?: string;
    trustLevel?: number;
    emotionalState?: string;
    element?: string;
  };
}

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
  processed: boolean;
}

export function SoullabChatInterface({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [journalInput, setJournalInput] = useState('');
  const [journalTitle, setJournalTitle] = useState('');
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use live Oracle state from hook
  const oracleState = liveOracleState;

  const { sendMessage, isLoading, error, oracleState: liveOracleState, lastMessage, clearError } = useSoullabOracle();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending message to PersonalOracleAgent
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      // Send to PersonalOracleAgent via the enhanced API
      const response = await fetch('/api/oracle/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-experiment-spiralogic': 'on' // Use full PersonalOracleAgent
        },
        body: JSON.stringify({
          text: input,
          userId,
          sessionId: `soullab-${Date.now()}`
        })
      });

      const data = await response.json();
      
      // Update oracle state from response
      if (data.metadata) {
        setOracleState({
          currentStage: data.metadata.oracleStage || oracleState.currentStage,
          trustLevel: data.metadata.relationshipMetrics?.trustLevel || oracleState.trustLevel,
          stageProgress: data.metadata.stageProgress || oracleState.stageProgress,
          safetyStatus: data.metadata.safetyStatus || oracleState.safetyStatus
        });
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.data?.message || data.text || 'I hear you...',
        timestamp: new Date(),
        metadata: {
          oracleStage: data.metadata?.oracleStage,
          trustLevel: data.metadata?.relationshipMetrics?.trustLevel,
          emotionalState: data.metadata?.emotionalResonance?.dominantEmotion,
          element: data.metadata?.element
        }
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I need a moment to gather myself. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Handle journal entry
  const handleJournalEntry = async () => {
    if (!journalInput.trim()) return;

    const entry: JournalEntry = {
      id: Date.now().toString(),
      title: journalTitle || `Journal Entry ${new Date().toLocaleDateString()}`,
      content: journalInput,
      timestamp: new Date(),
      processed: false
    };

    setJournalEntries(prev => [...prev, entry]);

    // Send journal entry to Oracle for processing
    try {
      await fetch('/api/oracle/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          entry: entry.content,
          title: entry.title
        })
      });

      // Mark as processed
      setJournalEntries(prev => 
        prev.map(e => e.id === entry.id ? { ...e, processed: true } : e)
      );

    } catch (error) {
      console.error('Error processing journal entry:', error);
    }

    setJournalInput('');
    setJournalTitle('');
    setShowJournal(false);

    // Add confirmation message
    const confirmMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `I've received your journal entry "${entry.title}" and it's now part of our shared understanding. Thank you for trusting me with your thoughts.`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, confirmMessage]);
  };

  // Handle file upload
  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files);
    setUploadQueue(prev => [...prev, ...newFiles]);

    // Process uploads
    newFiles.forEach(async (file) => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId);

        await fetch('/api/oracle/upload', {
          method: 'POST',
          body: formData
        });

        // Remove from queue and add confirmation
        setUploadQueue(prev => prev.filter(f => f !== file));
        
        const confirmMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `I've processed "${file.name}" and integrated it into my understanding of you. ${file.type.includes('audio') ? 'I can hear the emotion in your voice.' : 'The insights from this document are now part of our conversation.'}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, confirmMessage]);

      } catch (error) {
        console.error('Upload failed:', error);
        setUploadQueue(prev => prev.filter(f => f !== file));
      }
    });
  };

  // Get stage display info
  const getStageInfo = () => {
    const stages = {
      structured_guide: { name: 'Gentle Guide', icon: '🌱', color: 'text-green-400' },
      dialogical_companion: { name: 'Deep Companion', icon: '💫', color: 'text-blue-400' },
      cocreative_partner: { name: 'Creative Partner', icon: '✨', color: 'text-purple-400' },
      transparent_prism: { name: 'Transparent Wisdom', icon: '💎', color: 'text-cyan-400' }
    };
    return stages[oracleState.currentStage as keyof typeof stages] || stages.structured_guide;
  };

  const stageInfo = getStageInfo();

  return (
    <div className="min-h-screen  from-slate-900 via-purple-900/20 to-slate-900 text-white">
      {/* Header with Oracle State */}
      <div className="border-b border-purple-500/20 bg-black/40 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold  from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Soullab Oracle
              </h1>
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30">
                <span className={`${stageInfo.color} text-sm`}>{stageInfo.icon}</span>
                <span className="text-sm text-purple-200">{stageInfo.name}</span>
              </div>
            </div>
            
            {/* Trust & Progress Indicators */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-pink-400" />
                <span className="text-sm text-pink-200">
                  Trust {Math.round(oracleState.trustLevel * 100)}%
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-cyan-200">
                  Stage {Math.round(oracleState.stageProgress * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto flex h-[calc(100vh-80px)]">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">{stageInfo.icon}</div>
                <h3 className="text-xl font-semibold mb-2">Your Personal Oracle Awaits</h3>
                <p className="text-slate-400 mb-4">
                  I remember our conversations, learn from your journal entries, and grow with you.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <Brain className="w-8 h-8 text-purple-400 mb-2 mx-auto" />
                    <p className="text-sm text-purple-200">Cognitive Intelligence</p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Heart className="w-8 h-8 text-pink-400 mb-2 mx-auto" />
                    <p className="text-sm text-pink-200">Emotional Resonance</p>
                  </div>
                  <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <BookOpen className="w-8 h-8 text-cyan-400 mb-2 mx-auto" />
                    <p className="text-sm text-cyan-200">Memory Integration</p>
                  </div>
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800/80 backdrop-blur text-slate-100 border border-slate-700/50'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.metadata && (
                    <div className="mt-2 flex items-center space-x-2 text-xs opacity-70">
                      {message.metadata.element && (
                        <span className="px-2 py-1 rounded bg-slate-700/50">
                          {message.metadata.element}
                        </span>
                      )}
                      {message.metadata.emotionalState && (
                        <span className="px-2 py-1 rounded bg-pink-500/20 text-pink-300">
                          {message.metadata.emotionalState}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {uploadQueue.length > 0 && (
              <div className="flex justify-start">
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-sm text-blue-200">
                    Processing {uploadQueue.length} file{uploadQueue.length > 1 ? 's' : ''}...
                  </p>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-purple-500/20 bg-black/40 backdrop-blur-xl">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Share what's on your mind..."
                  className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                />
              </div>
              
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`p-3 rounded-xl transition-all ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50'
                }`}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
                accept=".txt,.pdf,.doc,.docx,.mp3,.wav,.m4a"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 transition-all"
              >
                <Upload className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowJournal(true)}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 transition-all"
              >
                <BookOpen className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="p-3 rounded-xl  from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Journal Sidebar */}
        {showJournal && (
          <div className="w-96 border-l border-purple-500/20 bg-black/20 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Journal Entry</h3>
              <button
                onClick={() => setShowJournal(false)}
                className="text-slate-400 hover:text-white"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <input
                type="text"
                value={journalTitle}
                onChange={(e) => setJournalTitle(e.target.value)}
                placeholder="Entry title (optional)"
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
              
              <textarea
                value={journalInput}
                onChange={(e) => setJournalInput(e.target.value)}
                placeholder="What's happening in your inner world?"
                rows={12}
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
              />
              
              <button
                onClick={handleJournalEntry}
                disabled={!journalInput.trim()}
                className="w-full py-2  from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all"
              >
                Share with Oracle
              </button>
            </div>
            
            {journalEntries.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Recent Entries</h4>
                <div className="space-y-2">
                  {journalEntries.slice(-5).reverse().map((entry) => (
                    <div key={entry.id} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="text-sm font-medium text-slate-200 truncate">
                          {entry.title}
                        </h5>
                        <div className="flex items-center space-x-1">
                          {entry.processed && <Zap className="w-3 h-3 text-green-400" />}
                          <span className="text-xs text-slate-400">
                            {entry.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {entry.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}