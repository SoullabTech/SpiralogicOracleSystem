// Oracle Page - Deep wisdom consultation and guidance
// Voice-first interface for asking profound questions
"use client";

import { useState, useRef, useEffect } from 'react';
import { useElementTheme } from '../../hooks/useElementTheme';
import { VoicePlayer } from '../../components/voice/VoicePlayer';
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
  
  const { textClass, bgClass, borderClass } = useElementTheme();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [consultation.currentQuestion]);

  const handleSubmitQuestion = async () => {
    if (!consultation.currentQuestion.trim() || consultation.isProcessing) return;

    setConsultation(prev => ({
      ...prev,
      isProcessing: true,
      error: null,
      response: null,
    }));

    try {
      const request: TurnRequest = {
        input: {
          text: consultation.currentQuestion,
          context: {
            currentPage: '/oracle',
          },
        },
        providers: {
          sesame: true,
          claude: true,
          oracle2: true, // Always consult Oracle2 for this page
          psi: true,
          ain: true,
        },
      };

      const response = await fetch('/api/oracle/turn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Oracle consultation failed: ${response.statusText}`);
      }

      const oracleResponse: TurnResponse = await response.json();
      
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
            <p className="text-app-muted text-body leading-relaxed max-w-md mx-auto">
              Ask your deepest questions and receive wisdom from the sacred depths of knowing.
            </p>
          </div>
        </div>

        {/* Question Input */}
        <div className="space-y-4">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={consultation.currentQuestion}
              onChange={(e) => setConsultation(prev => ({ 
                ...prev, 
                currentQuestion: e.target.value 
              }))}
              onKeyDown={handleKeyDown}
              placeholder="What question weighs on your heart and mind?"
              className="
                w-full p-6 rounded-apple bg-app-surface border border-app-border
                text-app-text placeholder-app-muted resize-none
                focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20
                transition-all duration-apple min-h-[120px]
              "
              disabled={consultation.isProcessing}
            />
            
            {consultation.currentQuestion.trim() && (
              <button
                onClick={handleSubmitQuestion}
                disabled={consultation.isProcessing}
                className={`
                  absolute bottom-4 right-4 p-3 rounded-apple-sm ${bgClass}
                  ${textClass} transition-all duration-apple
                  hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-white/20
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                aria-label="Submit question"
              >
                {consultation.isProcessing ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeWidth="1.5"/>
                  </svg>
                )}
              </button>
            )}
          </div>
          
          <p className="text-app-muted text-caption text-center">
            Cmd+Enter to submit • Speak your question to the mic for voice input
          </p>
        </div>

        {/* Error Display */}
        {consultation.error && (
          <div className="p-4 rounded-apple bg-red-500/10 border border-red-500/20 text-red-400">
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
    </div>
  );
}
