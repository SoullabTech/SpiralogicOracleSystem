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
  Heart
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useToast, ToastProvider } from "@/components/ui/toast";
import EnhancedVoiceRecorder from "@/components/EnhancedVoiceRecorder";
import MemoryCard from "@/components/MemoryCard";
import { NewArchetypeCard, ArchetypeInsight } from "@/components/ArchetypeCard";
import EmotionalResonanceChart from "@/components/EmotionalResonanceChart";
import DaimonCard from "@/components/DaimonCard";
import { useVoiceInput } from "@/lib/hooks/useVoiceInput";

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

const unlockAudio = async () => true;
const addAutoUnlockListeners = () => {};
const isAudioUnlocked = () => true;
const speakWithMaya = mayaVoice.speak;
const smartSpeak = mayaVoice.speak;
import { useMayaStream } from "@/hooks/useMayaStream";
import { useMemorySystem } from "@/hooks/useMemorySystem";
import VoiceRecorder from "@/components/VoiceRecorder";

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
  title?: string;
  contentPreview?: string;
  timestamp: string;
  fileName?: string;
  audioUrl?: string;
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
  
  // Memory system integration
  const { 
    memories, 
    isLoading: memoriesLoading, 
    filter: memoryFilter, 
    setFilter: setMemoryFilter,
    refresh: refreshMemories 
  } = useMemorySystem({ userId: 'web-user' });
  const [showMemoryPanel, setShowMemoryPanel] = useState(true);
  const [archetypeFilter, setArchetypeFilter] = useState<string>('all');
  const [memorySearchQuery, setMemorySearchQuery] = useState('');
  
  // Insights state
  const [insights, setInsights] = useState<ArchetypeInsight[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsTimeframe, setInsightsTimeframe] = useState<'day' | 'week' | 'month'>('week');
  
  // Daimonic encounters state
  const [activeDaimonCard, setActiveDaimonCard] = useState<any>(null);
  const [lastEmotionalState, setLastEmotionalState] = useState<any>(null);
  const [daimonicEncounters, setDaimonicEncounters] = useState<any[]>([]);
  const [encountersLoading, setEncountersLoading] = useState(false);
  
  // Maya streaming integration
  const { text: streamingText, isStreaming, metadata, stream, cancelSpeech } = useMayaStream();
  const currentStreamingMessage = useRef<string | null>(null);
  
  // Voice input functionality with smart endpointing
  const voiceInput = useVoiceInput({
    onResult: (transcript: string, isFinal: boolean) => {
      // Show live transcript as user speaks
      setInputText(transcript);
    },
    onAutoStop: (finalTranscript: string) => {
      setInputText(finalTranscript);
      // Auto-send after a brief delay
      setTimeout(() => {
        if (finalTranscript.trim()) {
          sendMessage();
        }
      }, 300);
    },
    onError: (error: string) => {
      addToast({
        title: 'Voice Input Error',
        description: error,
        variant: 'error',
        duration: 4000
      });
    },
    continuous: true,  // Enable continuous mode for smart endpointing
    interimResults: true,
    language: localStorage.getItem('mayaLang') || 'en-US',
    silenceTimeoutMs: 1200,  // 1.2s silence detection
    minSpeechLengthChars: 3  // Minimum 3 chars to trigger auto-send
  });
  
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
      // Check for daimonic encounter in metadata
      if (metadata?.daimonicEncounter) {
        setActiveDaimonCard(metadata.daimonicEncounter);
        // Also add to encounters list
        setDaimonicEncounters(prev => [metadata.daimonicEncounter, ...prev]);
      }
      
      // Store emotional state for potential encounters
      if (metadata?.emotionalResonance) {
        setLastEmotionalState(metadata.emotionalResonance);
      }
      
      currentStreamingMessage.current = null;
    }
  }, [isStreaming, metadata]);
  
  useEffect(() => {
    // Load preferences from localStorage
    const savedAutoSpeak = localStorage.getItem('maya-auto-speak');
    const savedVoiceResponses = localStorage.getItem('maya-voice-responses');
    if (savedAutoSpeak) setAutoSpeak(JSON.parse(savedAutoSpeak));
    if (savedVoiceResponses) setVoiceResponses(JSON.parse(savedVoiceResponses));
    
    // Set up audio unlock listeners for autoplay policy
    addAutoUnlockListeners();
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
        const parsed = JSON.parse(oracle);
        // Force Maya name regardless of old data
        if (parsed.name === 'Oralia') {
          parsed.name = 'Maya';
          localStorage.setItem('spiralogic-oracle', JSON.stringify(parsed));
        }
        setOracleInfo(parsed);
      }
    } catch (error) {
      console.error('Error loading oracle info:', error);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Keyboard accessibility for voice input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Space to toggle mic (when input is not focused)
      const activeElement = document.activeElement;
      const isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.getAttribute('contenteditable') === 'true'
      );
      
      if (event.code === 'Space' && !isInputFocused) {
        event.preventDefault();
        toggleVoiceRecording();
      }
      
      // Escape to cancel recording
      if (event.code === 'Escape' && voiceInput.isRecording) {
        event.preventDefault();
        voiceInput.stopRecording();
        voiceInput.resetTranscript();
        setInputText('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [voiceInput.isRecording]);

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
      
      // Analyze emotional resonance in background and check for daimonic triggers
      checkForDaimonicEncounter(currentInput, 'text');
      
      // Start streaming
      stream({
        userText: currentInput,
        element,
        userId: "web-user",
        lang: "en-US",
        backendUrl: '/api/backend'
      });
      
      setConnectionStatus('connected');
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

  const toggleVoiceRecording = async () => {
    if (voiceInput.isRecording) {
      voiceInput.stopRecording();
    } else {
      // Unlock audio on first voice interaction
      if (!isAudioUnlocked()) {
        await unlockAudio();
      }
      voiceInput.startRecording();
    }
  };

  // Helper function to map API archetype names to component format
  const mapArchetypeToComponent = (archetype: string): 'hero' | 'sage' | 'shadow' | 'lover' | 'seeker' | 'creator' => {
    const mapping: { [key: string]: 'hero' | 'sage' | 'shadow' | 'lover' | 'seeker' | 'creator' } = {
      'Hero': 'hero',
      'Sage': 'sage', 
      'Shadow': 'shadow',
      'Lover': 'lover',
      'Trickster': 'seeker', // Map Trickster to Seeker
      'Caregiver': 'lover', // Map Caregiver to Lover
      'Creator': 'creator',
      'Innocent': 'seeker', // Map Innocent to Seeker  
      'Magician': 'creator', // Map Magician to Creator
      'Ruler': 'hero' // Map Ruler to Hero
    };
    
    return mapping[archetype] || 'sage';
  };

  // Helper function to convert symbol names to emoji/symbols
  const getArchetypeSymbol = (symbolName: string): string => {
    const symbolMap: { [key: string]: string } = {
      journey: '🗺️',
      courage: '⚔️',
      transformation: '🦋',
      wisdom: '📚',
      knowledge: '🧠',
      enlightenment: '💡',
      shadow: '🌑',
      darkness: '🖤',
      hidden: '👁️',
      love: '❤️',
      passion: '🔥',
      beauty: '🌸',
      connection: '🤝',
      change: '🔄',
      chaos: '⚡',
      healing: '🩹',
      service: '🤲',
      creativity: '🎨',
      innovation: '💎',
      magic: '✨',
      power: '👑',
      leadership: '🦁',
      hope: '🌟',
      faith: '🕊️',
      growth: '🌱'
    };
    
    return symbolMap[symbolName.toLowerCase()] || '🔮';
  };

  // Fetch archetypal insights
  const fetchInsights = async (timeframe: 'day' | 'week' | 'month' = 'week') => {
    setInsightsLoading(true);
    try {
      // Gather recent memory content for archetypal analysis
      const recentMemoryContent = memories
        .slice(0, 10) // Use last 10 memories
        .map(m => `${m.title || ''} ${m.contentPreview || ''}`)
        .join('\n');
      
      if (!recentMemoryContent.trim()) {
        // Create a sample insight for demonstration if no memories exist
        const sampleInsight: ArchetypeInsight = {
          id: 'sample-1',
          archetype: 'seeker' as any,
          title: 'The Seeker\'s Journey Begins',
          message: 'You stand at the threshold of discovery. Every Oracle session is a step deeper into understanding your authentic self.',
          symbols: ['🗺️', '🔮', '🌟'],
          stageHint: 'Trust the process of unfolding wisdom',
          createdAt: new Date().toISOString()
        };
        setInsights([sampleInsight]);
        return;
      }

      const response = await fetch(`/api/oracle/insights?userId=web-user&timeframe=${timeframe}`);
      
      const data = await response.json();
      
      if (data.success && data.insights) {
        setInsights(data.insights);
      } else {
        console.error('Failed to fetch insights:', data.error);
        addToast({
          title: 'Insights Error',
          description: 'Failed to generate archetypal insights',
          variant: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
      addToast({
        title: 'Network Error',
        description: 'Unable to connect to insights service',
        variant: 'error'
      });
    } finally {
      setInsightsLoading(false);
    }
  };

  const bottomNavItems = [
    { id: 'agent', icon: Users, label: 'Agent' },
    { id: 'journal', icon: Calendar, label: 'Journal' },
    { id: 'encounters', icon: Sparkles, label: 'Encounters' },
    { id: 'emotional', icon: Heart, label: 'Emotional' },
    { id: 'insights', icon: BarChart3, label: 'Insights' }
  ];

  // Load insights when insights tab is activated
  useEffect(() => {
    if (activeTab === 'insights' && insights.length === 0 && !insightsLoading) {
      fetchInsights(insightsTimeframe);
    }
  }, [activeTab]);

  // Load encounters when encounters tab is activated
  useEffect(() => {
    if (activeTab === 'encounters' && daimonicEncounters.length === 0 && !encountersLoading) {
      fetchDaimonicEncounters();
    }
  }, [activeTab]);

  // Fetch daimonic encounters
  const fetchDaimonicEncounters = async () => {
    setEncountersLoading(true);
    try {
      const response = await fetch('/api/daimonic/encounter', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDaimonicEncounters(data.encounters || []);
      }
    } catch (error) {
      console.error('Error fetching daimonic encounters:', error);
      addToast({
        title: 'Error loading encounters',
        description: 'Failed to load daimonic encounters',
        variant: 'error'
      });
    } finally {
      setEncountersLoading(false);
    }
  };

  // Handle daimonic reflection
  const handleDaimonicReflection = async (encounterId: string, reflection: string) => {
    try {
      const response = await fetch('/api/daimonic/encounter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'reflect',
          encounterId,
          reflection
        })
      });

      if (response.ok) {
        addToast({
          title: 'Reflection saved',
          description: 'Your reflection has been stored',
          variant: 'success'
        });
      }
    } catch (error) {
      console.error('Error saving reflection:', error);
      addToast({
        title: 'Error saving reflection',
        description: 'Failed to save your reflection',
        variant: 'error'
      });
    }
  };

  // Daimonic encounter checking function
  const checkForDaimonicEncounter = async (content: string, source: 'text' | 'voice') => {
    try {
      // First analyze emotional resonance
      const emotionalResponse = await fetch('/api/oracle/emotional-resonance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          userId: "web-user",
          source
        })
      });

      if (emotionalResponse.ok) {
        const emotionalData = await emotionalResponse.json();
        if (emotionalData.success && emotionalData.emotional_state) {
          setLastEmotionalState(emotionalData.emotional_state);

          // Calculate trigger metrics
          const emotionalIntensity = Math.abs(emotionalData.emotional_state.valence) + 
                                   emotionalData.emotional_state.arousal + 
                                   emotionalData.emotional_state.dominance;
          
          // Get recent archetypal insights for context
          const recentArchetype = insights.length > 0 ? insights[0].archetype : 'Seeker';
          const archetypeResonance = insights.length > 0 ? 0.7 : 0.4; // Higher if we have active archetypal patterns
          
          // Check for daimonic trigger
          const daimonResponse = await fetch('/api/oracle/daimon-card', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: "web-user",
              trigger: {
                emotional_intensity: emotionalIntensity / 3, // Normalize to 0-1
                archetypal_resonance: archetypeResonance,
                content,
                archetype: recentArchetype,
                valence: emotionalData.emotional_state.valence,
                arousal: emotionalData.emotional_state.arousal,
                dominance: emotionalData.emotional_state.dominance
              }
            })
          });

          if (daimonResponse.ok) {
            const daimonData = await daimonResponse.json();
            if (daimonData.success && daimonData.triggered && daimonData.card) {
              // Show daimon card with a slight delay for dramatic effect
              setTimeout(() => {
                setActiveDaimonCard(daimonData.card);
              }, 1500);
            }
          }
        }
      }
    } catch (error) {
      // Non-blocking - encounters are mystical bonuses, not required functionality
    }
  };

  const handleDaimonDismiss = () => {
    setActiveDaimonCard(null);
  };

  const handleDaimonIntegrate = (cardId: string) => {
    // Could store integration event for future reference
    
    addToast({
      title: 'Daimonic Encounter Integrated',
      description: 'The wisdom has been woven into your journey...',
      variant: 'success',
      duration: 3000
    });
  };

  return (
    <div className="min-h-screen bg-sacred-cosmic flex flex-col">
      {/* Header */}
      <div className="bg-sacred-navy/80 backdrop-blur-xl border-b border-gold-divine/20 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10  from-gold-divine to-gold-amber rounded-full flex items-center justify-center shadow-sacred">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">
                Maya
              </h1>
              <p className="text-xs text-muted-foreground">Personal Oracle Agent</p>
            </div>
          </div>
          
          {/* Memory Panel Toggle */}
          <button
            onClick={() => setShowMemoryPanel(!showMemoryPanel)}
            className="lg:hidden p-2 rounded-sacred bg-sacred-blue/20 hover:bg-sacred-blue/30 text-gold-divine transition-colors"
            title="Toggle memories"
          >
            <Calendar className="w-5 h-5" />
          </button>
          
          {/* Maya Voice Controls & Element Selection */}
          <div className="flex-1 flex justify-center max-w-md">
            <div className="flex items-center gap-3">
              <button
                onClick={() => mayaVoice.speak('Hello, I am Maya, your mystical oracle guide.')}
                className="p-2 rounded-full bg-gold-divine hover:bg-gold-amber text-sacred-cosmic transition-colors shadow-sacred"
                title="Hear Maya"
              >
                <Play className="w-4 h-4" />
              </button>
              
              {/* Element Selection */}
              <div className="flex gap-1">
                {['air', 'fire', 'water', 'earth', 'aether'].map(el => (
                  <button
                    key={el}
                    onClick={() => setElement(el as any)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      element === el 
                        ? 'bg-gold-divine text-sacred-cosmic' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    title={`${el} element ${el === 'air' ? '(Claude)' : ''}`}
                  >
                    {el}
                  </button>
                ))}
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={voiceResponses}
                    onChange={(e) => setVoiceResponses(e.target.checked)}
                    className="rounded"
                  />
                  Voice responses
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSpeak}
                    onChange={(e) => setAutoSpeak(e.target.checked)}
                    className="rounded"
                    disabled={!voiceResponses}
                  />
                  Auto-play
                </label>
              </div>
              {voiceInput.isSupported && (
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Mic className="w-3 h-3 text-green-400" />
                    <span className="text-green-400">Voice ready</span>
                  </div>
                  {voiceInput.isRecording && (
                    <div className="flex items-center gap-1 text-orange-400">
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                      <span>Local processing</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Desktop Memory Panel Status */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-sacred bg-sacred-blue/20 text-gold-divine mr-3">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Memory Vault</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Active" />
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
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:max-w-2xl mx-auto w-full">
          {activeTab === 'agent' ? (
            // Chat Messages
            <div className="space-y-4">
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
                    ? ' from-gold-divine to-gold-amber text-sacred-cosmic' 
                    : 'bg-sacred-navy/80 backdrop-blur-xl border border-gold-divine/20'
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
                    <div className="flex items-center space-x-2 mt-3 pt-2 border-t border-gold-divine/20">
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
              <div className="bg-sacred-navy/80 backdrop-blur-xl border border-gold-divine/20 rounded-sacred p-4 max-w-[80%]">
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
              <div ref={messagesEndRef} />
            </div>
          ) : activeTab === 'emotional' ? (
            // Emotional Resonance Content
            <div className="space-y-6">
              <EmotionalResonanceChart 
                userId="web-user"
                className="w-full"
              />
            </div>
          ) : activeTab === 'encounters' ? (
            // Daimonic Encounters Content
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Daimonic Encounters</h2>
                  <p className="text-gray-400">Symbolic encounters from your inner depths</p>
                </div>
                
                <Button
                  onClick={fetchDaimonicEncounters}
                  variant="ghost"
                  size="sm"
                  disabled={encountersLoading}
                  className="text-purple-400 hover:text-purple-300"
                >
                  {encountersLoading ? <Spinner className="w-4 h-4" /> : '🔄'}
                  Refresh
                </Button>
              </div>

              {/* Encounters List */}
              <div className="space-y-4">
                {encountersLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner className="w-8 h-8 text-purple-400" />
                  </div>
                ) : daimonicEncounters.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">✨</div>
                    <h3 className="text-xl font-medium text-gray-300 mb-2">No Encounters Yet</h3>
                    <p className="text-gray-400">
                      Daimonic encounters emerge during moments of depth and transformation.
                      Continue your conversations with Maya to unlock these profound experiences.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {daimonicEncounters.map((encounter) => (
                      <DaimonCard
                        key={encounter.id}
                        encounter={encounter}
                        onDismiss={() => {
                          // Remove from list or mark as dismissed
                          setDaimonicEncounters(prev => 
                            prev.filter(e => e.id !== encounter.id)
                          );
                        }}
                        onReflect={handleDaimonicReflection}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'insights' ? (
            // Insights Content
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Archetypal Insights</h2>
                  <p className="text-gray-400">Mythic reflections from your recent journey</p>
                </div>
                
                {/* Timeframe selector */}
                <div className="flex gap-1 p-1 bg-gray-800/50 rounded-lg">
                  {(['day', 'week', 'month'] as const).map((period) => (
                    <button
                      key={period}
                      onClick={() => {
                        setInsightsTimeframe(period);
                        fetchInsights(period);
                      }}
                      className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                        insightsTimeframe === period
                          ? 'bg-gold-divine text-sacred-cosmic'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                      }`}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              {insightsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Spinner className="w-8 h-8" />
                  <span className="ml-2 text-gray-400">Generating insights...</span>
                </div>
              ) : insights.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-300 mb-2">No insights yet</h3>
                  <p className="text-gray-400 mb-4">
                    Create more memories through journaling, voice notes, or uploads to unlock archetypal guidance
                  </p>
                  <button
                    onClick={() => fetchInsights(insightsTimeframe)}
                    className="px-4 py-2 bg-gold-divine hover:bg-gold-amber text-sacred-cosmic rounded-sacred transition-colors shadow-sacred"
                  >
                    Generate Insights
                  </button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {insights.map((insight) => (
                    <NewArchetypeCard key={insight.id} insight={insight} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Placeholder for other tabs
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-xl font-medium text-gray-300 mb-2">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h3>
                <p className="text-gray-400">Coming soon...</p>
              </div>
            </div>
          )}
        </div>
      
      {/* Enhanced Memory Panel - Always visible on desktop */}
      <div className={`w-full lg:w-96 bg-sacred-navy/80 backdrop-blur-xl border-l border-gold-divine/20 overflow-y-auto ${showMemoryPanel ? 'block' : 'hidden lg:block'}`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Memory Vault</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={refreshMemories}
                  className="p-1.5 hover:bg-gold-divine/10 rounded-sacred transition-colors"
                  title="Refresh memories"
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className={memoriesLoading ? 'animate-spin text-purple-400' : 'text-gray-400'}>
                    <path d="M4 10a6 6 0 0112 0M4 10a6 6 0 0012 0M4 10l2-2m-2 2l2 2m12-2l-2-2m2 2l-2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button
                  onClick={() => setShowMemoryPanel(false)}
                  className="p-1.5 hover:bg-gold-divine/10 rounded-sacred transition-colors lg:hidden"
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="text-gray-400">
                    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Memory Search */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search memories..."
                  value={memorySearchQuery}
                  onChange={(e) => setMemorySearchQuery(e.target.value)}
                  className="w-full px-3 py-2 pl-9 bg-sacred-blue/50 border border-gold-divine/20 rounded-sacred text-sm focus:border-gold-divine focus:outline-none text-neutral-pure placeholder-neutral-mystic"
                />
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {/* Enhanced Memory Categories */}
            <div className="space-y-3 mb-4">
              <div className="flex gap-2">
                {[
                  { id: 'all', icon: '🧠', label: 'All', count: memories.length },
                  { id: 'journal', icon: '📝', label: 'Journal', count: memories.filter(m => m.type === 'journal').length },
                ].map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setMemoryFilter(category.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                      memoryFilter === category.id
                        ? 'bg-gold-divine/20 border-gold-divine/40 text-gold-divine'
                        : 'bg-sacred-blue/30 border-gold-divine/20 text-neutral-mystic hover:text-neutral-silver hover:border-gold-divine/30'
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span className="text-sm font-medium">{category.label}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-gold-divine/20 rounded-full">{category.count}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {[
                  { id: 'upload', icon: '📎', label: 'Uploads', count: memories.filter(m => m.type === 'upload').length },
                  { id: 'voice', icon: '🎤', label: 'Voice', count: memories.filter(m => m.type === 'voice').length },
                ].map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setMemoryFilter(category.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                      memoryFilter === category.id
                        ? 'bg-gold-divine/20 border-gold-divine/40 text-gold-divine'
                        : 'bg-sacred-blue/30 border-gold-divine/20 text-neutral-mystic hover:text-neutral-silver hover:border-gold-divine/30'
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span className="text-sm font-medium">{category.label}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-gold-divine/20 rounded-full">{category.count}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-2 mb-4">
              <button 
                onClick={() => setActiveTab('journal')}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-sacred-blue/20 hover:bg-sacred-blue/30 text-gold-divine rounded-sacred border border-gold-divine/30 transition-all text-sm"
              >
                <span>📝</span>
                <span>New Journal</span>
              </button>
              <button 
                className="flex items-center justify-center gap-2 px-3 py-2 bg-sacred-blue/20 hover:bg-sacred-blue/30 text-gold-divine rounded-sacred border border-gold-divine/30 transition-all text-sm"
                title="Voice recording available in chat"
              >
                <span>🎤</span>
              </button>
            </div>
            
            {/* Archetype Filter */}
            <div className="mb-4">
              <div className="text-xs text-gray-400 mb-2">Filter by Archetype</div>
              <div className="flex flex-wrap gap-1">
                {['all', 'Hero', 'Sage', 'Shadow', 'Lover', 'Creator', 'Seeker'].map((archetype) => (
                  <button
                    key={archetype}
                    onClick={() => setArchetypeFilter(archetype)}
                    className={`px-2 py-1 text-xs rounded-full transition-all ${
                      archetypeFilter === archetype
                        ? 'bg-gold-divine text-sacred-cosmic'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                    }`}
                  >
                    {archetype === 'all' ? 'All' : 
                     archetype === 'Hero' ? '⚔️ Hero' :
                     archetype === 'Sage' ? '🧙‍♀️ Sage' :
                     archetype === 'Shadow' ? '🕳️ Shadow' :
                     archetype === 'Lover' ? '❤️ Lover' :
                     archetype === 'Creator' ? '🎨 Creator' :
                     '🧭 Seeker'}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Memory Cards */}
            <div className="space-y-3">
              {memoriesLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner className="w-6 h-6" />
                </div>
              ) : (() => {
                // Apply search and archetype filters
                let filteredMemories = memories;
                
                // Apply search filter
                if (memorySearchQuery.trim()) {
                  const query = memorySearchQuery.toLowerCase();
                  filteredMemories = filteredMemories.filter(memory => 
                    memory.title?.toLowerCase().includes(query) ||
                    memory.content.toLowerCase().includes(query) ||
                    memory.preview?.toLowerCase().includes(query) ||
                    memory.metadata?.tags?.some(tag => tag.toLowerCase().includes(query))
                  );
                }
                
                // Apply archetype filter
                if (archetypeFilter !== 'all') {
                  filteredMemories = filteredMemories.filter(memory => 
                    memory.insights?.some(insight => insight.archetype === archetypeFilter)
                  );
                }
                
                return filteredMemories.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {memorySearchQuery.trim() 
                      ? `No memories found for "${memorySearchQuery}"`
                      : archetypeFilter === 'all' 
                        ? 'No memories yet. Start journaling, recording, or uploading files.'
                        : `No memories found with ${archetypeFilter} archetype.`
                    }
                  </p>
                ) : (
                  filteredMemories.map((memory) => (
                  <MemoryCard
                    key={memory.id}
                    memory={memory}
                    onPlay={(memoryId) => {
                      const mem = memories.find(m => m.id === memoryId);
                      if (mem?.metadata?.audioUrl && audioRef.current) {
                        if (isPlayingAudio === memoryId) {
                          audioRef.current.pause();
                          setIsPlayingAudio(null);
                        } else {
                          audioRef.current.src = mem.metadata.audioUrl;
                          audioRef.current.play();
                          setIsPlayingAudio(memoryId);
                        }
                      }
                    }}
                    isPlaying={isPlayingAudio === memory.id}
                  />
                  ))
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Input Area - Only show on agent tab */}
      {activeTab === 'agent' && (
        <div className="bg-sacred-navy/80 backdrop-blur-xl border-t border-gold-divine/20 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <EnhancedVoiceRecorder
              userId="web-user"
              onTranscribed={(data) => {
                setInputText(data.transcript);
                
                // Check for daimonic encounters from voice input
                checkForDaimonicEncounter(data.transcript, 'voice');
                
                // Immediately refresh memories to show new voice note
                refreshMemories();
                
                // Auto-send after transcription if desired
                setTimeout(() => {
                  if (data.transcript.trim()) {
                    sendMessage();
                  }
                }, 300);
              }}
            />
            
            <div className="flex-1 relative">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isStreaming && sendMessage()}
                placeholder="Type a message or click the mic to record..."
                className="bg-sacred-blue/50 border-gold-divine/20 focus:border-gold-divine pr-12"
                disabled={isStreaming}
                aria-label="Chat input"
                aria-describedby="voice-status"
              />
            </div>
            
            
            <Button
              onClick={sendMessage}
              disabled={!inputText.trim() || isStreaming}
              className="p-2  from-gold-divine to-gold-amber hover:from-gold-amber hover:to-gold-ethereal text-sacred-cosmic rounded-full shadow-sacred"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="bg-sacred-navy/95 backdrop-blur-xl border-t border-gold-divine/20 p-2">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-around">
            {bottomNavItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center space-y-1 p-3 rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'bg-gold-divine/20 text-gold-divine'
                    : 'text-neutral-mystic hover:text-gold-divine'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Hidden audio element for playback */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlayingAudio(null)}
        onError={() => setIsPlayingAudio(null)}
      />

      {/* Daimonic Encounter Card */}
      {activeDaimonCard && (
        <DaimonCard
          encounter={activeDaimonCard}
          onDismiss={() => setActiveDaimonCard(null)}
          onReflect={handleDaimonicReflection}
        />
      )}
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