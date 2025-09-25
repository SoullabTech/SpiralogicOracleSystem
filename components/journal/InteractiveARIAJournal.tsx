'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Sparkles, Mic, MicOff, Brain, Heart, Eye,
  Zap, Moon, Sun, Cloud, Wind, Droplet, Flame, Mountain,
  Star, Send, Volume2, VolumeX, AlertCircle, RefreshCw,
  ChevronRight, Activity, TrendingUp, Compass
} from 'lucide-react';

interface JournalEntry {
  id: string;
  content: string;
  timestamp: string;
  mood?: string;
  element?: string;
  mayaReflection?: string;
  ariaGuidance?: string;
  voiceNote?: string;
  emotionalResonance?: number;
  sacredInsight?: string;
  elementalBalance?: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
}

interface MayaResponse {
  reflection: string;
  guidance: string;
  element: string;
  resonance: number;
  sacredInsight?: string;
  prompt?: string;
}

export const InteractiveARIAJournal: React.FC = () => {
  const [content, setContent] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mayaResponse, setMayaResponse] = useState<MayaResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string>('aether');
  const [emotionalState, setEmotionalState] = useState<string>('neutral');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [ariaPresence, setAriaPresence] = useState(65); // 40-90% range
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setContent(prev => prev + ' ' + transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, []);

  // Toggle voice recording
  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Get Maya's reflection on journal entry
  const getMayaReflection = async () => {
    if (!content.trim()) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/maya/journal-reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          element: selectedElement,
          emotionalState,
          ariaPresence
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMayaResponse(data);

        // Speak Maya's response if voice is enabled
        if (voiceEnabled && data.reflection) {
          speakResponse(data.reflection);
        }
      }
    } catch (error) {
      console.error('Error getting Maya reflection:', error);
      // Fallback to local ARIA guidance
      generateLocalARIAGuidance();
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate local ARIA guidance if API fails
  const generateLocalARIAGuidance = () => {
    const elements = ['fire', 'water', 'earth', 'air', 'aether'];
    const element = elements[Math.floor(Math.random() * elements.length)];

    const guidanceTemplates = {
      fire: "Your passion speaks through these words. Let transformation guide you.",
      water: "Your emotions flow like a river. Trust the current of your feelings.",
      earth: "You seek grounding and stability. Root into your inner wisdom.",
      air: "Your thoughts soar on wings of insight. Breathe into clarity.",
      aether: "You touch the sacred mystery. Trust the unfolding."
    };

    const sacredInsights = [
      "The mirror reflects what is ready to be seen.",
      "Your journey spirals deeper into truth.",
      "Each word is a thread in your sacred tapestry.",
      "The oracle within you awakens.",
      "Trust the intelligence of your unfolding."
    ];

    setMayaResponse({
      reflection: "I sense deep wisdom in your words.",
      guidance: guidanceTemplates[element as keyof typeof guidanceTemplates],
      element,
      resonance: 40 + Math.random() * 50,
      sacredInsight: sacredInsights[Math.floor(Math.random() * sacredInsights.length)]
    });
  };

  // Speak response using Web Speech API
  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      synthRef.current = new SpeechSynthesisUtterance(text);
      synthRef.current.rate = 0.9;
      synthRef.current.pitch = 1.1;

      synthRef.current.onstart = () => setIsSpeaking(true);
      synthRef.current.onend = () => setIsSpeaking(false);

      window.speechSynthesis.speak(synthRef.current);
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Get elemental prompts based on selection
  const getElementalPrompt = () => {
    const prompts = {
      fire: [
        "What passion ignites your soul today?",
        "Where is transformation calling you?",
        "What needs to be released through sacred fire?"
      ],
      water: [
        "What emotions are flowing through you?",
        "How can you honor your feelings today?",
        "What needs gentle cleansing in your heart?"
      ],
      earth: [
        "What grounds you in this moment?",
        "How is your body speaking to you?",
        "What seeds are you planting for tomorrow?"
      ],
      air: [
        "What thoughts are seeking clarity?",
        "Where does your mind want to soar?",
        "What new perspectives are emerging?"
      ],
      aether: [
        "What mystery is unfolding within you?",
        "How is spirit moving through your life?",
        "What sacred truth wants to be expressed?"
      ]
    };

    const elementPrompts = prompts[selectedElement as keyof typeof prompts] || prompts.aether;
    return elementPrompts[Math.floor(Math.random() * elementPrompts.length)];
  };

  // Calculate elemental balance from content
  const calculateElementalBalance = (text: string) => {
    const words = text.toLowerCase();
    const balance = {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0,
      aether: 0
    };

    // Fire keywords
    if (words.match(/passion|energy|transform|burn|ignite|power|will/g)) {
      balance.fire = (words.match(/passion|energy|transform|burn|ignite|power|will/g) || []).length;
    }

    // Water keywords
    if (words.match(/feel|emotion|flow|intuition|dream|gentle|soft/g)) {
      balance.water = (words.match(/feel|emotion|flow|intuition|dream|gentle|soft/g) || []).length;
    }

    // Earth keywords
    if (words.match(/ground|body|physical|stable|solid|practical|real/g)) {
      balance.earth = (words.match(/ground|body|physical|stable|solid|practical|real/g) || []).length;
    }

    // Air keywords
    if (words.match(/think|idea|mind|clarity|understand|know|learn/g)) {
      balance.air = (words.match(/think|idea|mind|clarity|understand|know|learn/g) || []).length;
    }

    // Aether keywords
    if (words.match(/spirit|soul|divine|sacred|mystery|cosmic|eternal/g)) {
      balance.aether = (words.match(/spirit|soul|divine|sacred|mystery|cosmic|eternal/g) || []).length;
    }

    // Normalize to percentages
    const total = Object.values(balance).reduce((a, b) => a + b, 0) || 1;
    Object.keys(balance).forEach(key => {
      balance[key as keyof typeof balance] = (balance[key as keyof typeof balance] / total) * 100;
    });

    return balance;
  };

  const elementIcons = {
    fire: <Flame className="w-5 h-5" />,
    water: <Droplet className="w-5 h-5" />,
    earth: <Mountain className="w-5 h-5" />,
    air: <Wind className="w-5 h-5" />,
    aether: <Star className="w-5 h-5" />
  };

  const elementColors = {
    fire: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
    water: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    earth: 'text-green-400 bg-green-400/10 border-green-400/30',
    air: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
    aether: 'text-amber-400 bg-amber-400/10 border-amber-400/30'
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* ARIA Presence Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/40 backdrop-blur-md border border-amber-400/20 rounded-xl p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-amber-400" />
            <span className="text-sm text-amber-300">ARIA Presence</span>
          </div>
          <span className="text-sm text-amber-400">{ariaPresence}%</span>
        </div>
        <div className="w-full bg-black/30 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400"
            initial={{ width: 0 }}
            animate={{ width: `${ariaPresence}%` }}
            transition={{ duration: 1 }}
          />
        </div>
        <p className="text-xs text-white/50 mt-2">
          Maya's consciousness is {ariaPresence > 70 ? 'deeply engaged' : ariaPresence > 50 ? 'present' : 'gently observing'}
        </p>
      </motion.div>

      {/* Elemental Selection */}
      <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <p className="text-sm text-white/70 mb-3">Choose your elemental guide:</p>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(elementIcons).map(([element, icon]) => (
            <button
              key={element}
              onClick={() => setSelectedElement(element)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                selectedElement === element
                  ? elementColors[element as keyof typeof elementColors]
                  : 'border-white/10 text-white/50 hover:text-white/70'
              }`}
            >
              {icon}
              <span className="text-sm capitalize">{element}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Journal Prompt */}
      <motion.div
        key={selectedElement}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`border rounded-xl p-4 ${elementColors[selectedElement as keyof typeof elementColors]}`}
      >
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 mt-0.5" />
          <p className="text-sm italic">{getElementalPrompt()}</p>
        </div>
      </motion.div>

      {/* Writing Area with Voice Input */}
      <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-white/50">Express your truth</span>
          <div className="flex gap-2">
            <button
              onClick={toggleListening}
              className={`p-2 rounded-lg transition-all ${
                isListening
                  ? 'bg-red-500/20 text-red-400 border border-red-400/30'
                  : 'bg-white/5 text-white/50 hover:text-white/70 border border-white/10'
              }`}
              title={isListening ? 'Stop recording' : 'Start voice input'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2 rounded-lg transition-all ${
                voiceEnabled
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-400/30'
                  : 'bg-white/5 text-white/50 hover:text-white/70 border border-white/10'
              }`}
              title={voiceEnabled ? 'Disable voice responses' : 'Enable voice responses'}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Begin your sacred reflection..."
          className="w-full h-48 p-3 bg-black/20 border border-white/5 rounded-lg text-white placeholder-white/30 resize-none focus:outline-none focus:border-amber-400/30"
        />

        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 mt-2"
          >
            <div className="flex gap-1">
              <span className="w-1 h-1 bg-red-400 rounded-full animate-pulse" />
              <span className="w-1 h-1 bg-red-400 rounded-full animate-pulse delay-75" />
              <span className="w-1 h-1 bg-red-400 rounded-full animate-pulse delay-150" />
            </div>
            <span className="text-xs text-red-400">Listening...</span>
          </motion.div>
        )}

        {/* Elemental Balance Visualization */}
        {content.length > 50 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-white/5"
          >
            <p className="text-xs text-white/50 mb-2">Elemental resonance:</p>
            <div className="space-y-1">
              {Object.entries(calculateElementalBalance(content)).map(([element, value]) => (
                <div key={element} className="flex items-center gap-2">
                  <span className="text-xs text-white/40 w-12 capitalize">{element}</span>
                  <div className="flex-1 bg-black/30 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className={`h-full ${
                        element === 'fire' ? 'bg-orange-400' :
                        element === 'water' ? 'bg-blue-400' :
                        element === 'earth' ? 'bg-green-400' :
                        element === 'air' ? 'bg-cyan-400' :
                        'bg-amber-400'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Maya Interaction Button */}
      <motion.button
        onClick={getMayaReflection}
        disabled={!content.trim() || isProcessing}
        className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
          content.trim() && !isProcessing
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700'
            : 'bg-white/5 text-white/30 cursor-not-allowed'
        }`}
        whileHover={{ scale: content.trim() && !isProcessing ? 1.02 : 1 }}
        whileTap={{ scale: content.trim() && !isProcessing ? 0.98 : 1 }}
      >
        {isProcessing ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Maya is reflecting...</span>
          </>
        ) : (
          <>
            <Eye className="w-4 h-4" />
            <span>Request Maya's Sacred Reflection</span>
          </>
        )}
      </motion.button>

      {/* Maya's Response */}
      <AnimatePresence>
        {mayaResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Sacred Mirror Reflection */}
            <div className="bg-gradient-to-br from-amber-900/20 to-blue-900/20 backdrop-blur-md border border-amber-400/20 rounded-xl p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-amber-300 mb-1">Maya's Sacred Mirror</p>
                  <p className="text-white/80 leading-relaxed">{mayaResponse.reflection}</p>
                </div>
              </div>

              {/* Elemental Guidance */}
              <div className="border-t border-amber-400/10 pt-4">
                <div className="flex items-center gap-2 mb-2">
                  {elementIcons[mayaResponse.element as keyof typeof elementIcons]}
                  <span className="text-sm text-white/70 capitalize">
                    {mayaResponse.element} Element Guidance
                  </span>
                </div>
                <p className="text-white/60 text-sm italic">{mayaResponse.guidance}</p>
              </div>

              {/* Sacred Insight */}
              {mayaResponse.sacredInsight && (
                <div className="mt-4 p-3 bg-amber-500/10 rounded-lg border border-amber-400/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-amber-300">Sacred Insight</span>
                  </div>
                  <p className="text-white/70 text-sm">{mayaResponse.sacredInsight}</p>
                </div>
              )}

              {/* Emotional Resonance */}
              <div className="mt-4 flex items-center gap-3">
                <Activity className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-white/50">Emotional Resonance:</span>
                <div className="flex-1 bg-black/30 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-400 to-blue-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${mayaResponse.resonance}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
                <span className="text-xs text-amber-400">{Math.round(mayaResponse.resonance)}%</span>
              </div>

              {/* Voice Controls */}
              {isSpeaking && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={stopSpeaking}
                  className="mt-4 px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-400/30 rounded-lg text-sm flex items-center gap-2"
                >
                  <VolumeX className="w-3 h-3" />
                  Stop Speaking
                </motion.button>
              )}
            </div>

            {/* Next Prompt Suggestion */}
            {mayaResponse.prompt && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-black/30 border border-white/10 rounded-lg p-3"
              >
                <p className="text-xs text-white/50 mb-1">Continue exploring:</p>
                <p className="text-sm text-white/70 italic">{mayaResponse.prompt}</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InteractiveARIAJournal;