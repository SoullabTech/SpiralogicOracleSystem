"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, 
  MicOff, 
  Send, 
  Users, 
  Calendar, 
  Sparkles, 
  BarChart3, 
  Settings, 
  Crown,
  Pause,
  Play,
  Volume2,
  FileText,
  Upload,
  Clock,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Menu
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useToast, ToastProvider } from "@/components/ui/toast";
import VoiceRecorder from "@/components/VoiceRecorder";
import { useMayaStream } from "@/hooks/useMayaStream";

// Temporary fallback implementations for deployment
const mayaVoice = {
  speak: (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.1;
      speechSynthesis.speak(utterance);
    }
  }
};

interface Message {
  id: string;
  type: 'user' | 'maya';
  content: string;
  timestamp: Date;
  audio?: string | null;
}

interface Memory {
  id: string;
  type: 'journal' | 'upload' | 'voice';
  title: string;
  content?: string;
  timestamp: Date;
  metadata?: any;
}

function OraclePageContent() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'maya',
      content: 'Welcome! I am Maya, your personal oracle agent. I learn and evolve with you. How may I guide you today?',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('agent');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { addToast } = useToast();
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [voiceResponses, setVoiceResponses] = useState(true);
  const [element, setElement] = useState<"air"|"fire"|"water"|"earth"|"aether">("earth");
  
  // Memory panel state
  const [showMemoryPanel, setShowMemoryPanel] = useState(true);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [memorySearch, setMemorySearch] = useState("");
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [journalContent, setJournalContent] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [trustLevel, setTrustLevel] = useState(0);
  const [stage, setStage] = useState("initial");
  const [isMobile, setIsMobile] = useState(false);
  
  // Maya streaming integration
  const { text: streamingText, isStreaming, metadata, stream, cancelSpeech } = useMayaStream();
  const currentStreamingMessage = useRef<string | null>(null);
  
  // Update streaming message as text arrives
  useEffect(() => {
    if (currentStreamingMessage.current && streamingText) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === currentStreamingMessage.current 
            ? { ...msg, content: streamingText }
            : msg
        )
      );
    }
  }, [streamingText]);
  
  // Handle streaming completion
  useEffect(() => {
    if (!isStreaming && currentStreamingMessage.current) {
      currentStreamingMessage.current = null;
    }
  }, [isStreaming]);
  
  useEffect(() => {
    // Load preferences from localStorage
    const savedAutoSpeak = localStorage.getItem('maya-auto-speak');
    const savedVoiceResponses = localStorage.getItem('maya-voice-responses');
    if (savedAutoSpeak) setAutoSpeak(JSON.parse(savedAutoSpeak));
    if (savedVoiceResponses) setVoiceResponses(JSON.parse(savedVoiceResponses));
  }, []);

  useEffect(() => {
    // Save auto-speak preference
    localStorage.setItem('maya-auto-speak', JSON.stringify(autoSpeak));
  }, [autoSpeak]);

  useEffect(() => {
    // Save voice responses preference
    localStorage.setItem('maya-voice-responses', JSON.stringify(voiceResponses));
  }, [voiceResponses]);

  // Get oracle info from localStorage
  const [oracleInfo, setOracleInfo] = useState<any>(null);
  
  useEffect(() => {
    try {
      const oracle = localStorage.getItem('spiralogic-oracle');
      if (oracle) {
        setOracleInfo(JSON.parse(oracle));
      }
    } catch (error) {
      console.error('Error loading oracle info:', error);
    }
  }, []);
  
  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Fetch memories on mount
  useEffect(() => {
    fetchMemories();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMemories = async () => {
    try {
      // Fetch journals
      const journalRes = await fetch('/api/journal?userId=web-user');
      const journals = await journalRes.json();
      
      // Fetch uploads  
      const uploadRes = await fetch('/api/upload?userId=web-user');
      const uploads = await uploadRes.json();
      
      // Combine and sort by timestamp
      const allMemories: Memory[] = [
        ...journals.map((j: any) => ({
          id: j.id,
          type: 'journal' as const,
          title: j.title || 'Journal Entry',
          content: j.content,
          timestamp: new Date(j.created_at),
          metadata: j
        })),
        ...uploads.map((u: any) => ({
          id: u.id,
          type: 'upload' as const,
          title: u.filename,
          content: u.summary,
          timestamp: new Date(u.created_at),
          metadata: u
        }))
      ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      setMemories(allMemories);
    } catch (error) {
      console.error('Error fetching memories:', error);
    }
  };
  
  const sendMessage = async () => {
    if (!inputText.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText("");
    
    try {
      setConnectionStatus('connecting');
      
      // Create placeholder message for streaming
      const streamingMessageId = (Date.now() + 1).toString();
      currentStreamingMessage.current = streamingMessageId;
      
      const placeholderMessage: Message = {
        id: streamingMessageId,
        type: 'maya',
        content: '',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, placeholderMessage]);
      
      // Start streaming
      stream({
        userText: currentInput,
        element,
        userId: "web-user",
        lang: "en-US"
      });
      
      setConnectionStatus('connected');
      
      // Update trust and stage (mock for now)
      setTrustLevel(prev => Math.min(prev + 0.1, 1));
    } catch (error) {
      console.error('Streaming error:', error);
      setConnectionStatus('disconnected');
      
      addToast({
        title: 'Network Error',
        description: 'Please check your connection and try again',
        variant: 'error'
      });
    }
  };
  
  const handleJournalSubmit = async () => {
    if (!journalContent.trim()) return;
    
    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'web-user',
          content: journalContent,
          title: `Journal - ${new Date().toLocaleDateString()}`
        })
      });
      
      if (response.ok) {
        setJournalContent('');
        setShowJournalModal(false);
        fetchMemories();
        addToast({
          title: 'Journal saved',
          description: 'Your thoughts have been captured',
          variant: 'success'
        });
      }
    } catch (error) {
      console.error('Error saving journal:', error);
    }
  };
  
  const handleUploadSubmit = async () => {
    if (!uploadFile) return;
    
    try {
      const formData = new FormData();
      formData.append('userId', 'web-user');
      formData.append('file', uploadFile);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        setUploadFile(null);
        setShowUploadModal(false);
        fetchMemories();
        addToast({
          title: 'File uploaded',
          description: 'Document added to your memory',
          variant: 'success'
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const playAudio = (messageId: string, audioUrl: string) => {
    if (audioRef.current) {
      if (isPlayingAudio === messageId) {
        audioRef.current.pause();
        setIsPlayingAudio(null);
      } else {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setIsPlayingAudio(messageId);
      }
    }
  };

  const filteredMemories = memories.filter(m => 
    m.title.toLowerCase().includes(memorySearch.toLowerCase()) ||
    (m.content && m.content.toLowerCase().includes(memorySearch.toLowerCase()))
  );
  
  return (
    <div className="min-h-screen  from-slate-900 via-purple-900/20 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-background/80 backdrop-blur-xl border-b border-purple-500/20 p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10  from-purple-500 to-orange-500 rounded-full flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">
                {oracleInfo?.name || 'Maya'}
              </h1>
              <p className="text-xs text-muted-foreground">Personal Oracle Agent</p>
            </div>
          </div>
          
          {/* Element Selection */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {['air', 'fire', 'water', 'earth', 'aether'].map(el => (
                <button
                  key={el}
                  onClick={() => setElement(el as any)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    element === el 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  title={`${el} element ${el === 'air' ? '(Claude)' : ''}`}
                >
                  {el}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
              connectionStatus === 'connecting' ? 'bg-orange-500 animate-pulse' :
              'bg-red-500'
            }`} />
            <span>
              {connectionStatus === 'connected' ? 'Connected' :
               connectionStatus === 'connecting' ? 'Connecting...' :
               'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Column */}
        <div className={`flex-1 flex flex-col ${!isMobile && showMemoryPanel ? 'pr-80' : ''}`}>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-3xl mx-auto space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${
                      message.type === 'user' 
                        ? ' from-purple-600 to-orange-500 text-white' 
                        : 'bg-background/80 backdrop-blur-xl border border-purple-500/20'
                    } rounded-2xl p-4`}>
                      {message.type === 'maya' && (
                        <div className="flex items-center space-x-2 mb-2">
                          <Crown className="w-4 h-4 text-purple-400" />
                          <span className="text-xs font-medium text-purple-400">
                            {oracleInfo?.name || 'Maya'}
                          </span>
                        </div>
                      )}
                      
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      
                      {message.audio && (
                        <div className="flex items-center space-x-2 mt-3 pt-2 border-t border-purple-500/20">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => playAudio(message.id, message.audio!)}
                            className="text-purple-400 hover:text-purple-300 p-1"
                          >
                            {isPlayingAudio === message.id ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Volume2 className="w-4 h-4" />
                            )}
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            {isPlayingAudio === message.id ? 'Speaking...' : 'Play audio'}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isStreaming && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-background/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-4 max-w-[80%]">
                    <div className="flex items-center space-x-2 mb-2">
                      <Crown className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-medium text-purple-400">
                        {oracleInfo?.name || 'Maya'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Spinner variant="oracle" size="sm" color="purple" />
                      <span className="text-xs text-muted-foreground">Maya is speaking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Status Bar */}
          <div className="bg-background/70 backdrop-blur-xl border-t border-purple-500/20 px-4 py-2">
            <div className="max-w-3xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>Stage: <Badge variant="outline" className="ml-1">{stage}</Badge></span>
                <span>Trust: <Badge variant="outline" className="ml-1">{(trustLevel * 100).toFixed(0)}%</Badge></span>
                <span>Memories: <Badge variant="outline" className="ml-1">{memories.length}</Badge></span>
              </div>
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMemoryPanel(!showMemoryPanel)}
                  className="text-xs"
                >
                  {showMemoryPanel ? <ChevronRight className="w-3 h-3 mr-1" /> : <ChevronLeft className="w-3 h-3 mr-1" />}
                  {showMemoryPanel ? 'Hide' : 'Show'} Memories
                </Button>
              )}
            </div>
          </div>
          
          {/* Input Area */}
          <div className="bg-background/80 backdrop-blur-xl border-t border-purple-500/20 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center space-x-3">
                <VoiceRecorder
                  userId="web-user"
                  onTranscribed={(data) => {
                    setInputText(data.transcript);
                    fetchMemories(); // Refresh memories after voice note
                    // Auto-send after transcription if desired
                    setTimeout(() => {
                      if (data.transcript.trim()) {
                        sendMessage();
                      }
                    }, 300);
                  }}
                />
                
                {/* Journal Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowJournalModal(true)}
                  className="p-2 text-muted-foreground hover:text-purple-400"
                  title="Write in journal"
                >
                  <FileText className="w-5 h-5" />
                </Button>
                
                {/* Upload Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUploadModal(true)}
                  className="p-2 text-muted-foreground hover:text-purple-400"
                  title="Upload document"
                >
                  <Upload className="w-5 h-5" />
                </Button>
                
                <div className="flex-1 relative">
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isStreaming && sendMessage()}
                    placeholder="Type a message or use the tools..."
                    className="bg-background/50 border-purple-500/20 focus:border-purple-400"
                    disabled={isStreaming}
                  />
                </div>
                
                <Button
                  onClick={sendMessage}
                  disabled={!inputText.trim() || isStreaming}
                  className="p-2  from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white rounded-full"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Memory Panel - Desktop */}
        {!isMobile && showMemoryPanel && (
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-background/95 backdrop-blur-xl border-l border-purple-500/20 flex flex-col">
            <div className="p-4 border-b border-purple-500/20">
              <h2 className="font-semibold text-lg mb-3">Memory Timeline</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search memories..."
                  value={memorySearch}
                  onChange={(e) => setMemorySearch(e.target.value)}
                  className="pl-10 bg-background/50 border-purple-500/20"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {filteredMemories.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-sm">No memories yet</p>
                  <p className="text-xs mt-2">Start journaling, uploading docs, or recording voice notes</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMemories.map((memory) => (
                    <Card 
                      key={memory.id} 
                      className="p-3 bg-background/50 border-purple-500/20 hover:border-purple-400/40 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${
                          memory.type === 'journal' ? 'bg-blue-500/20 text-blue-400' :
                          memory.type === 'upload' ? 'bg-green-500/20 text-green-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {memory.type === 'journal' ? <FileText className="w-4 h-4" /> :
                           memory.type === 'upload' ? <Upload className="w-4 h-4" /> :
                           <Mic className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{memory.title}</h3>
                          {memory.content && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {memory.content}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {memory.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation - Mobile Only */}
      {isMobile && (
        <div className="bg-background/95 backdrop-blur-xl border-t border-purple-500/20 p-2">
          <div className="flex justify-around">
            {[
              { id: 'chat', icon: Crown, label: 'Chat' },
              { id: 'memories', icon: Clock, label: 'Memories' },
              { id: 'settings', icon: Settings, label: 'Settings' }
            ].map((item) => (
              <motion.button
                key={item.id}
                onClick={() => {
                  if (item.id === 'memories') {
                    setShowMemoryPanel(!showMemoryPanel);
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center space-y-1 p-3 rounded-lg transition-all ${
                  (item.id === 'chat' && activeTab === 'agent') || 
                  (item.id === 'memories' && showMemoryPanel)
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-muted-foreground hover:text-purple-400'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}
      
      {/* Mobile Memory Panel */}
      {isMobile && showMemoryPanel && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl"
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-purple-500/20">
              <h2 className="font-semibold text-lg">Memory Timeline</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMemoryPanel(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search memories..."
                  value={memorySearch}
                  onChange={(e) => setMemorySearch(e.target.value)}
                  className="pl-10 bg-background/50 border-purple-500/20"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {filteredMemories.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-sm">No memories yet</p>
                  <p className="text-xs mt-2">Start journaling, uploading docs, or recording voice notes</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMemories.map((memory) => (
                    <Card 
                      key={memory.id} 
                      className="p-3 bg-background/50 border-purple-500/20"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${
                          memory.type === 'journal' ? 'bg-blue-500/20 text-blue-400' :
                          memory.type === 'upload' ? 'bg-green-500/20 text-green-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {memory.type === 'journal' ? <FileText className="w-4 h-4" /> :
                           memory.type === 'upload' ? <Upload className="w-4 h-4" /> :
                           <Mic className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{memory.title}</h3>
                          {memory.content && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {memory.content}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {memory.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Journal Modal */}
      <AnimatePresence>
        {showJournalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowJournalModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background/95 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Write in Journal</h3>
              <textarea
                value={journalContent}
                onChange={(e) => setJournalContent(e.target.value)}
                placeholder="Share your thoughts, feelings, or experiences..."
                className="w-full h-32 p-3 bg-background/50 border border-purple-500/20 rounded-lg resize-none focus:border-purple-400 focus:outline-none"
              />
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowJournalModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleJournalSubmit}
                  disabled={!journalContent.trim()}
                  className=" from-purple-600 to-orange-500"
                >
                  Save Entry
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background/95 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Upload Document</h3>
              <div className="border-2 border-dashed border-purple-500/30 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                <input
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.txt,.doc,.docx,.md"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-sm text-muted-foreground hover:text-purple-400"
                >
                  {uploadFile ? uploadFile.name : 'Click to select file'}
                </label>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUploadSubmit}
                  disabled={!uploadFile}
                  className=" from-purple-600 to-orange-500"
                >
                  Upload
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden audio element for playback */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlayingAudio(null)}
        onError={() => setIsPlayingAudio(null)}
      />
    </div>
  );
}

export default function OraclePage() {
  return (
    <ToastProvider>
      <OraclePageContent />
    </ToastProvider>
  );
}