// Oracle Page - Deep wisdom consultation and guidance
// Voice-first interface for asking profound questions
"use client";

import { useState, useRef, useEffect } from 'react';
import { useElementTheme } from '@/hooks/useElementTheme';
import { VoicePlayer } from '@/components/voice/VoicePlayer';
import { MicHUD, type VoiceResult } from '@/components/voice/MicHUD';
import { MicroReflection } from './components/MicroReflection';
import { RecapModal } from './components/RecapModal';
import { sendOracleQuestion, type OracleResponse } from '@/lib/oracle/sendToOracle';
import { speak, isSpeechSupported } from '@/lib/voice/speak';
import MessageComposer from '@/components/chat/MessageComposer';
import { MayaWelcome } from '@/components/voice/MayaWelcome';
import { handleMayaVoiceCue } from '@/lib/voice/maya-cues';
import type { TurnRequest, TurnResponse } from '../api/oracle/turn/route';

interface ConsultationState {
  isProcessing: boolean;
  currentQuestion: string;
  response: TurnResponse | null;
  error: string | null;
}

export default function OraclePage() {
  const [consultation, setConsultation] = useState<ConsultationState>({
    isProcessing: false,
    currentQuestion: '',
    response: null,
    error: null,
  });
  
  const [questionHistory, setQuestionHistory] = useState<Array<{
    question: string;
    response: string;
    timestamp: number;
  }>>([]);
  
  const [conversationId] = useState(() => 
    `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const [exchangeCount, setExchangeCount] = useState(0);
  const [showWeaveOption, setShowWeaveOption] = useState(false);
  const [isWeaving, setIsWeaving] = useState(false);
  const [weavedThread, setWeavedThread] = useState<string | null>(null);
  const [showRecapModal, setShowRecapModal] = useState(false);
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(false);
  
  const { textClass, bgClass, borderClass } = useElementTheme();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [consultation.currentQuestion]);

  const handleSubmitQuestion = async (questionText?: string, source: 'text' | 'voice' = 'text') => {
    const question = questionText || consultation.currentQuestion.trim();
    if (!question || consultation.isProcessing) return;

    setConsultation(prev => ({
      ...prev,
      isProcessing: true,
      error: null,
      response: null,
      currentQuestion: questionText || prev.currentQuestion,
    }));

    try {
      // Use unified Oracle sender
      const oracleResponse = await sendOracleQuestion(question, conversationId);
      
      setConsultation(prev => ({
        ...prev,
        response: oracleResponse,
        isProcessing: false,
      }));

      // Add to history
      setQuestionHistory(prev => [{
        question: consultation.currentQuestion,
        response: oracleResponse.response.text,
        timestamp: Date.now(),
      }, ...prev.slice(0, 4)]); // Keep last 5

      // Track exchange count and show weave option
      const newExchangeCount = exchangeCount + 1;
      setExchangeCount(newExchangeCount);
      
      if (newExchangeCount >= 3 && !weavedThread) {
        setShowWeaveOption(true);
      }

      // Speak response if voice mode is enabled
      if (voiceModeEnabled && oracleResponse.response.text) {
        speak(oracleResponse.response.text);
      }

      // Clear current question
      setConsultation(prev => ({
        ...prev,
        currentQuestion: '',
      }));

    } catch (error) {
      setConsultation(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        isProcessing: false,
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmitQuestion();
    }
  };

  // Voice input handler - unifies voice and text paths
  const handleVoiceResult = (voiceResult: VoiceResult) => {
    if (voiceResult.text.trim()) {
      // Same pipeline as text input
      handleSubmitQuestion(voiceResult.text, 'voice');
    }
  };

  const handleWeaveThread = async () => {
    if (isWeaving) return;
    
    setIsWeaving(true);
    try {
      const response = await fetch('/api/oracle/weave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          userId: 'anonymous', // TODO: get actual user ID
        }),
      });

      if (response.ok) {
        const weaveData = await response.json();
        setWeavedThread(weaveData.text);
        setShowWeaveOption(false);
        
        // Handle Maya's post-recap voice cue
        await handleMayaVoiceCue(weaveData.maya_voice_cue);
      }
    } catch (error) {
      console.error('Failed to weave thread:', error);
    } finally {
      setIsWeaving(false);
    }
  };

  const suggestedQuestions = [
    "What guidance do you have for my current path?",
    "How can I find more balance in my life?", 
    "What is asking for my attention right now?",
    "How can I better serve my highest purpose?",
    "What wisdom do I need for this decision?",
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Maya Welcome */}
        {!consultation.response && questionHistory.length === 0 && (
          <div className="mb-4">
            <MayaWelcome mode="auto" conversationId={conversationId} />
          </div>
        )}

        {/* Header */}
        <div className="text-center space-y-4">
          <div className={`w-16 h-16 mx-auto rounded-full ${bgClass}/20 border-2 ${borderClass} flex items-center justify-center`}>
            <svg className={`w-8 h-8 ${textClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeWidth="1.5"/>
            </svg>
          </div>
          
          <div>
            <h1 className={`text-headline ${textClass} mb-2`}>
              Oracle
            </h1>
            <p className="text-ink-300 text-body leading-relaxed max-w-md mx-auto">
              Ask your deepest questions and receive wisdom from the sacred depths of knowing.
            </p>
          </div>
        </div>

        {/* Message Composer with Upload Support */}
        <div className="space-y-4">
          <MessageComposer
            value={consultation.currentQuestion}
            onChange={(value) => setConsultation(prev => ({ 
              ...prev, 
              currentQuestion: value 
            }))}
            onSubmit={() => handleSubmitQuestion()}
            onKeyDown={handleKeyDown}
            placeholder="What question weighs on your heart and mind?"
            disabled={consultation.isProcessing}
            conversationId={conversationId}
            textareaRef={textareaRef}
            onVoiceFinal={(text) => {
              // Non-auto-send case: just populate the field for manual review
              setConsultation(prev => ({ ...prev, currentQuestion: text }));
            }}
          />

          {/* Voice Mode Controls */}
          {isSpeechSupported() && (
            <div className="flex justify-center">
              <label className="flex items-center space-x-2 text-ink-300 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={voiceModeEnabled}
                  onChange={(e) => setVoiceModeEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-edge-700 bg-bg-800 text-ink-100 focus:ring-2 focus:ring-gold-400/20"
                />
                <span>Speak responses aloud</span>
              </label>
            </div>
          )}
        </div>

        {/* Error Display */}
        {consultation.error && (
          <div className="p-4 rounded-lg bg-state-red/10 border border-state-red/20 text-state-red">
            <p className="text-body">{consultation.error}</p>
          </div>
        )}

        {/* Oracle Response */}
        {consultation.response && (
          <OracleResponse 
            response={consultation.response}
            textClass={textClass}
            bgClass={bgClass}
          />
        )}

        {/* Thread Weaving Option */}
        {showWeaveOption && (
          <div className="flex justify-center">
            <button
              onClick={handleWeaveThread}
              disabled={isWeaving}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium
                bg-bg-800/80 border border-edge-700/50
                text-ink-100 hover:bg-bg-800
                transition-all duration-200 ease-out-soft focus:outline-none focus:ring-2 focus:ring-gold-400/20
                disabled:opacity-50 disabled:cursor-not-allowed
                ${textClass}
              `}
            >
              {isWeaving ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Weaving...
                </span>
              ) : (
                'Weave a thread from what you\'ve shared?'
              )}
            </button>
          </div>
        )}

        {/* Weavred Thread Display */}
        {weavedThread && (
          <div className="bg-bg-800/80 rounded-lg p-6 border border-edge-700/50 shadow-soft">
            <div className="flex items-start space-x-4">
              <div className={`w-10 h-10 rounded-full ${bgClass}/30 flex items-center justify-center flex-shrink-0 mt-1`}>
                <svg className={`w-5 h-5 ${textClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="prose prose-invert prose-lg max-w-none">
                  <p className="text-ink-100 text-body leading-relaxed whitespace-pre-wrap">
                    {weavedThread}
                  </p>
                </div>
                
                <div className="text-xs text-ink-300">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                    </svg>
                    Saved to Soul Memory
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Session Recap Option */}
        {exchangeCount >= 2 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setShowRecapModal(true)}
              className="px-4 py-2 text-sm text-app-muted hover:text-app-text border border-app-border/30 rounded-apple-sm hover:bg-app-surface/30 transition-all duration-apple"
            >
              View Session Recap
            </button>
          </div>
        )}

        {/* Suggested Questions */}
        {!consultation.response && questionHistory.length === 0 && (
          <div className="space-y-4">
            <h3 className="text-app-text text-body font-medium">
              Contemplative Questions
            </h3>
            <div className="space-y-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setConsultation(prev => ({ 
                    ...prev, 
                    currentQuestion: question 
                  }))}
                  className="
                    w-full p-4 text-left rounded-apple-sm bg-app-surface/50 border border-app-border/30
                    text-app-muted hover:text-app-text hover:bg-app-surface
                    transition-all duration-apple focus:outline-none focus:ring-2 focus:ring-white/20
                  "
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Question History */}
        {questionHistory.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-app-text text-body font-medium">
              Recent Consultations
            </h3>
            <div className="space-y-3">
              {questionHistory.map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded-apple bg-app-surface/30 border border-app-border/20"
                >
                  <p className="text-app-muted text-caption mb-2 font-medium">
                    "{item.question}"
                  </p>
                  <p className="text-app-text text-caption leading-relaxed line-clamp-2">
                    {item.response}
                  </p>
                  <p className="text-app-muted text-xs mt-2">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Oracle Response Component with TTS support
interface OracleResponseProps {
  response: TurnResponse;
  textClass: string;
  bgClass: string;
}

function OracleResponse({ response, textClass, bgClass }: OracleResponseProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioStatus, setAudioStatus] = useState<'pending' | 'ready' | 'failed' | null>(null);

  // Poll for audio if pending
  useEffect(() => {
    if (!response.response.audioPending || !response.response.turnId) return;

    setAudioStatus('pending');
    let pollCount = 0;
    const maxPolls = 20; // Poll for up to 20 seconds (20 * 1000ms)

    const pollForAudio = async () => {
      try {
        const audioResponse = await fetch(`/api/oracle/turn/audio/${response.response.turnId}`);
        
        if (audioResponse.ok) {
          const audioData = await audioResponse.json();
          
          if (audioData.ready && audioData.audioUrl) {
            setAudioUrl(audioData.audioUrl);
            setAudioStatus('ready');
            return;
          } else if (audioData.status === 'failed') {
            setAudioStatus('failed');
            return;
          }
        }
        
        // Continue polling if still pending and under max polls
        pollCount++;
        if (pollCount < maxPolls) {
          setTimeout(pollForAudio, 1000);
        } else {
          setAudioStatus('failed');
        }
      } catch (error) {
        console.error('Audio polling error:', error);
        setAudioStatus('failed');
      }
    };

    // Start polling after a short delay
    setTimeout(pollForAudio, 500);
  }, [response.response.audioPending, response.response.turnId]);

  return (
    <div className="space-y-6">
      <div className="bg-app-surface/80 rounded-apple p-6 border border-app-border/50">
        <div className="flex items-start space-x-4">
          <div className={`w-10 h-10 rounded-full ${bgClass}/30 flex items-center justify-center flex-shrink-0 mt-1`}>
            <svg className={`w-5 h-5 ${textClass}`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9l-5 4.74L18.18 22 12 18.77 5.82 22 7 13.74 2 9l6.91-.74L12 2z"/>
            </svg>
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="prose prose-invert prose-lg max-w-none">
              <p className="text-app-text text-body leading-relaxed whitespace-pre-wrap">
                {response.response.text}
              </p>
            </div>

            {/* Micro-Reflection */}
            {response.turnMeta && (
              <MicroReflection 
                turnMeta={response.turnMeta}
                isVisible={true}
              />
            )}
            
            {/* Audio Status and Player */}
            {audioStatus === 'pending' && (
              <div className="flex items-center gap-2 text-caption text-app-muted">
                <svg className="w-3 h-3 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                </svg>
                <span>speaking...</span>
              </div>
            )}
            
            {audioStatus === 'ready' && audioUrl && (
              <VoicePlayer 
                src={audioUrl} 
                text={response.response.text}
                className="w-full"
              />
            )}
            
            {/* Metadata */}
            <div className="flex flex-wrap gap-2 text-caption text-app-muted">
              <span>Confidence: {Math.round(response.metadata.confidence * 100)}%</span>
              <span>•</span>
              <span>Providers: {response.metadata.providers.join(', ')}</span>
              {response.metadata.elementRecommendation && (
                <>
                  <span>•</span>
                  <span className={textClass}>
                    {response.metadata.elementRecommendation} energy
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Session Recap Modal */}
      <RecapModal
        isOpen={showRecapModal}
        onClose={() => setShowRecapModal(false)}
        conversationId={conversationId}
        userId="anonymous" // TODO: get actual user ID
      />
    </div>
  );
}
