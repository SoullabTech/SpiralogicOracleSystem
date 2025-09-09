'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Mic, Paperclip, Link, StopCircle, 
  Volume2, VolumeX, Brain, Sparkles, Upload,
  FileText, Globe, X, ChevronDown
} from 'lucide-react';
import { PersonalOracleAgent } from '@/lib/agents/PersonalOracleAgent';
import { PetalVoicePreview } from '@/components/voice/PetalVoicePreview';
import { MayaNavigationAwareness, type NavigationSuggestion } from '@/lib/maya/NavigationAwareness';
import { useRouter } from 'next/navigation';
// Dynamically import anamnesis to avoid build-time execution
// import { UnifiedConsciousness, type DreamMemory, type RitualMemory, type InsightMemory } from '@/lib/anamnesis';

interface Message {
  id: string;
  role: 'user' | 'maya';
  content: string;
  timestamp: Date;
  type: 'text' | 'voice' | 'file' | 'url';
  metadata?: {
    fileName?: string;
    fileType?: string;
    url?: string;
    duration?: number;
    voiceTranscript?: string;
  };
}

interface Attachment {
  type: 'file' | 'url';
  name: string;
  content?: string;
  url?: string;
}

export default function MayaChatInterface() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [maya, setMaya] = useState<PersonalOracleAgent | null>(null);
  const [navigator, setNavigator] = useState<MayaNavigationAwareness | null>(null);
  const [consciousness, setConsciousness] = useState<any | null>(null);
  const [showContext, setShowContext] = useState(false);
  const [navigationSuggestions, setNavigationSuggestions] = useState<NavigationSuggestion[]>([]);
  const [relevantMemories, setRelevantMemories] = useState<any[]>([]);
  const [showMemories, setShowMemories] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initializeMaya();
    loadConversationHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeMaya = async () => {
    const userId = localStorage.getItem('user_id') || 'demo-user';
    const agent = await PersonalOracleAgent.loadAgent(userId);
    setMaya(agent);
    
    // Initialize navigation awareness
    const nav = new MayaNavigationAwareness(agent);
    setNavigator(nav);
    
    // Initialize Anamnesis Field connection
    try {
      const { UnifiedConsciousness } = await import('@/lib/anamnesis');
      const unity = await UnifiedConsciousness.getInstance();
      setConsciousness(unity);
      
      // Load recent memories for context
      const recentInsights = await unity.recallInsights(userId, 'all');
      const recentRituals = await unity.recallRituals(userId);
      const recentDreams = await unity.recallDreams(userId, 5);
      
      console.log('✨ Anamnesis Field connected to Maya');
    } catch (error) {
      console.error('Failed to initialize Anamnesis Field:', error);
    }
    
    // Add greeting message with memory awareness
    const greeting = agent.getGreeting();
    setMessages([{
      id: 'greeting',
      role: 'maya',
      content: greeting,
      timestamp: new Date(),
      type: 'text'
    }]);
  };

  const loadConversationHistory = () => {
    const savedMessages = localStorage.getItem('maya_conversation');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  };

  const saveConversation = (msgs: Message[]) => {
    localStorage.setItem('maya_conversation', JSON.stringify(msgs.slice(-50))); // Keep last 50
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() && attachments.length === 0) return;
    if (!maya || !navigator) return;

    const userId = localStorage.getItem('user_id') || 'demo-user';
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
      type: attachments.length > 0 ? attachments[0].type : 'text',
      metadata: attachments.length > 0 ? {
        fileName: attachments[0].name,
        url: attachments[0].url
      } : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachments([]);
    setIsProcessing(true);

    // Query Anamnesis Field for relevant memories
    let memoryContext = '';
    let memories: any[] = [];
    
    if (consciousness) {
      try {
        // Search for relevant memories
        const memoryResponse = await consciousness.recall(input, userId, {
          limit: 5,
          includeCollective: false
        });
        
        if (memoryResponse.memories && memoryResponse.memories.length > 0) {
          memories = memoryResponse.memories;
          setRelevantMemories(memories);
          
          // Add memory context to input
          memoryContext = '\n\n[Memory Context:\n';
          memories.forEach(mem => {
            memoryContext += `- ${mem.content.slice(0, 100)}...\n`;
          });
          memoryContext += ']';
        }
        
        // Check for specific memory types mentioned
        if (input.toLowerCase().includes('dream')) {
          const dreams = await consciousness.recallDreams(userId, 3);
          if (dreams.memories?.length > 0) {
            memoryContext += '\n[Recent Dreams: ' + dreams.memories.map((d: any) => d.content.slice(0, 50)).join('; ') + ']';
          }
        }
        
        if (input.toLowerCase().includes('ritual')) {
          const rituals = await consciousness.recallRituals(userId);
          if (rituals.memories?.length > 0) {
            memoryContext += '\n[Recent Rituals: ' + rituals.memories.map((r: any) => r.content.slice(0, 50)).join('; ') + ']';
          }
        }
        
        if (input.toLowerCase().includes('insight') || input.toLowerCase().includes('breakthrough')) {
          const insights = await consciousness.recallInsights(userId);
          if (insights.memories?.length > 0) {
            memoryContext += '\n[Key Insights: ' + insights.memories.map((i: any) => i.content.slice(0, 50)).join('; ') + ']';
          }
        }
      } catch (error) {
        console.error('Error querying memories:', error);
      }
    }

    // Check for navigation suggestions
    const navSuggestions = await navigator.analyzeForNavigation(
      input,
      messages.map(m => ({ role: m.role, content: m.content }))
    );
    setNavigationSuggestions(navSuggestions);

    // Check for memory storage commands
    if (consciousness && input.startsWith('/remember')) {
      const memoryContent = input.replace('/remember', '').trim();
      let memoryType = 'conversation';
      
      if (memoryContent.includes('dream')) memoryType = 'dream';
      else if (memoryContent.includes('ritual')) memoryType = 'ritual';
      else if (memoryContent.includes('insight')) memoryType = 'insight';
      else if (memoryContent.includes('synchronicity')) memoryType = 'synchronicity';
      
      await consciousness.remember(userId, memoryContent, { type: memoryType });
      
      const confirmMessage: Message = {
        id: `maya-${Date.now()}`,
        role: 'maya',
        content: `✨ I've stored that ${memoryType} in your soul memory. It will never be forgotten.`,
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, confirmMessage]);
      setIsProcessing(false);
      return;
    }
    
    // Check for memory recall commands
    if (consciousness && input.startsWith('/recall')) {
      const query = input.replace('/recall', '').trim();
      const memories = await consciousness.recall(query || '*', userId, { limit: 10 });
      
      let recallResponse = '📜 Here are your memories:\n\n';
      memories.memories.forEach((mem: any, idx: number) => {
        recallResponse += `${idx + 1}. ${mem.content.slice(0, 200)}...\n`;
      });
      
      const recallMessage: Message = {
        id: `maya-${Date.now()}`,
        role: 'maya',
        content: recallResponse,
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, recallMessage]);
      setIsProcessing(false);
      return;
    }

    // Process with Maya, including memory context
    const enhancedInput = input + memoryContext;
    const response = await maya.processInteraction(enhancedInput, {
      currentMood: 'neutral',
      currentEnergy: 'emerging'
    });

    // Add navigation suggestions to response if any
    let finalResponse = response.response;
    if (navSuggestions.length > 0 && navSuggestions[0].confidence > 50) {
      finalResponse += '\n\n' + navigator.formatSuggestion(navSuggestions[0]);
    }
    
    // Add memory reference if memories were found
    if (memories.length > 0) {
      finalResponse += '\n\n💭 *Drawing from ' + memories.length + ' related memories*';
    }

    const mayaMessage: Message = {
      id: `maya-${Date.now()}`,
      role: 'maya',
      content: finalResponse,
      timestamp: new Date(),
      type: 'text'
    };

    // Store this conversation in Anamnesis Field
    if (consciousness) {
      try {
        await consciousness.remember(userId, `User: ${input}\nMaya: ${response.response}`, {
          sessionId: `chat_${Date.now()}`,
          type: 'conversation',
          mood: 'neutral',
          energy: 'emerging'
        });
        
        // Check if this is a significant moment to store as insight
        if (response.response.toLowerCase().includes('insight') || 
            response.response.toLowerCase().includes('realize') ||
            response.response.toLowerCase().includes('breakthrough')) {
          await consciousness.rememberInsight(userId, {
            trigger: input,
            realization: response.response,
            element: 'aether',
            breakthrough: true
          });
        }
      } catch (error) {
        console.error('Error storing memory:', error);
      }
    }

    setMessages(prev => {
      const updated = [...prev, mayaMessage];
      saveConversation(updated);
      return updated;
    });
    setIsProcessing(false);
  };

  const handleVoiceStart = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice input not supported in this browser');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setInput(transcript);
    };

    recognition.onend = () => setIsListening(false);
    
    recognition.start();

    // Store recognition instance to stop later
    (window as any).currentRecognition = recognition;
  };

  const handleVoiceStop = () => {
    if ((window as any).currentRecognition) {
      (window as any).currentRecognition.stop();
      setIsListening(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const attachment: Attachment = {
      type: 'file',
      name: file.name,
      content: 'File processing...' // In production, would process file content
    };

    setAttachments([attachment]);
  };

  const handleUrlAdd = () => {
    const url = prompt('Enter URL:');
    if (!url) return;

    const attachment: Attachment = {
      type: 'url',
      name: new URL(url).hostname,
      url
    };

    setAttachments([attachment]);
  };

  const getMayaState = () => {
    if (!maya) return null;
    const state = maya.getState();
    const profile = maya.getUserProfile();
    
    return {
      personality: state.personality.archetype,
      trustLevel: profile.trustLevel,
      currentPhase: profile.currentPhase,
      element: profile.element
    };
  };

  const mayaState = getMayaState();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-yellow-950 to-black flex flex-col">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-yellow-600 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-light">Maya</h1>
              <p className="text-white/60 text-xs">
                {mayaState?.currentPhase || 'Discovering'} • 
                {mayaState?.element ? ` ${mayaState.element} resonance` : ' Learning your patterns'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMemories(!showMemories)}
              className="text-white/60 hover:text-white transition-colors"
              title="View memories"
            >
              <Brain className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowContext(!showContext)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <ChevronDown className={`w-5 h-5 transition-transform ${showContext ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="text-white/60 hover:text-white transition-colors"
            >
              {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Context Panel */}
        <AnimatePresence>
          {showContext && mayaState && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="max-w-4xl mx-auto mt-3 pt-3 border-t border-white/10"
            >
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-white/60">Personality: </span>
                  <span className="text-white capitalize">{mayaState.personality}</span>
                </div>
                <div>
                  <span className="text-white/60">Trust: </span>
                  <span className="text-white">{mayaState.trustLevel}%</span>
                </div>
                <div>
                  <span className="text-white/60">Phase: </span>
                  <span className="text-white">{mayaState.currentPhase}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-2xl ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                {message.role === 'maya' && (
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-600 to-yellow-600 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white/60 text-xs">Maya</span>
                  </div>
                )}

                <div className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user' 
                    ? 'bg-amber-600/20 border border-amber-500/30' 
                    : 'bg-white/5 border border-white/10'
                }`}>
                  {/* Attachment indicator */}
                  {message.metadata && (
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                      {message.type === 'file' && <FileText className="w-4 h-4 text-blue-400" />}
                      {message.type === 'url' && <Globe className="w-4 h-4 text-green-400" />}
                      <span className="text-white/60 text-xs">
                        {message.metadata.fileName || message.metadata.url}
                      </span>
                    </div>
                  )}

                  <p className="text-white/90">{message.content}</p>

                  {/* Voice playback for Maya messages */}
                  {message.role === 'maya' && voiceEnabled && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <PetalVoicePreview
                        text={message.content}
                        context={`maya-response-${message.id}`}
                        element="aether"
                        autoPlay={false}
                      />
                    </div>
                  )}
                </div>

                <span className="text-white/40 text-xs mt-1 px-2">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </motion.div>
          ))}

          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white/5 rounded-2xl px-4 py-3 border border-white/10">
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-white/60">Maya is thinking...</span>
                </motion.div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Memory Panel */}
      {showMemories && relevantMemories.length > 0 && (
        <div className="bg-black/20 backdrop-blur-lg border-t border-white/10 px-4 py-3">
          <div className="max-w-4xl mx-auto">
            <p className="text-white/60 text-xs mb-2">Related Memories:</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {relevantMemories.slice(0, 5).map((memory, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white/80 text-xs">
                        {memory.content.slice(0, 150)}...
                      </p>
                      <p className="text-white/40 text-xs mt-1">
                        {memory.layer} • Relevance: {Math.round((memory.relevance || 0) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={async () => {
                if (consciousness) {
                  const userId = localStorage.getItem('user_id') || 'demo-user';
                  const allMemories = await consciousness.recall('*', userId, { limit: 50 });
                  console.log('All memories:', allMemories);
                }
              }}
              className="text-amber-400 text-xs mt-2 hover:text-amber-300"
            >
              View all memories →
            </button>
          </div>
        </div>
      )}

      {/* Navigation Suggestions */}
      {navigationSuggestions.length > 0 && (
        <div className="bg-black/20 backdrop-blur-lg border-t border-white/10 px-4 py-3">
          <div className="max-w-4xl mx-auto">
            <p className="text-white/60 text-xs mb-2">Quick Actions:</p>
            <div className="flex gap-2 flex-wrap">
              {navigationSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    router.push(suggestion.route);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    suggestion.urgent
                      ? 'bg-amber-600/30 border border-amber-500/50 text-amber-200 hover:bg-amber-600/40'
                      : suggestion.confidence > 70
                      ? 'bg-white/10 border border-white/20 text-white/90 hover:bg-white/20'
                      : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                  title={suggestion.reason}
                >
                  {suggestion.label}
                  {suggestion.confidence > 80 && (
                    <span className="ml-1 text-xs opacity-60">✨</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-black/20 backdrop-blur-lg border-t border-white/10 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="flex gap-2 mb-3">
              {attachments.map((attachment, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg"
                >
                  {attachment.type === 'file' ? (
                    <FileText className="w-4 h-4 text-blue-400" />
                  ) : (
                    <Globe className="w-4 h-4 text-green-400" />
                  )}
                  <span className="text-white/80 text-sm">{attachment.name}</span>
                  <button
                    onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                    className="text-white/60 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2">
            {/* Attachment buttons */}
            <div className="flex gap-1">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <button
                onClick={handleUrlAdd}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <Link className="w-5 h-5" />
              </button>
            </div>

            {/* Input field */}
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Share thoughts... (/remember to store, /recall to search)"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50 resize-none"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>

            {/* Voice/Send button */}
            {isListening ? (
              <button
                onClick={handleVoiceStop}
                className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
              >
                <StopCircle className="w-5 h-5" />
              </button>
            ) : input.trim() || attachments.length > 0 ? (
              <button
                onClick={handleSend}
                disabled={isProcessing}
                className="p-3 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-600/50 text-white rounded-xl transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleVoiceStart}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}