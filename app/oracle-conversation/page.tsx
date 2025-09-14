'use client';

import { useState, useEffect } from 'react';
import { MayaChatInterface } from '@/components/chat/MayaChatInterface';

interface ChatMessage {
  id: string;
  role: 'user' | 'maya';
  text: string;
  timestamp: Date;
  isPlaying?: boolean;
}

export default function OracleConversationPage() {
  const [userId, setUserId] = useState<string>();
  const [sessionId, setSessionId] = useState<string>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string>();

  useEffect(() => {
    // Generate session ID
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    setSessionId(sessionId);

    // Get or generate user ID
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem('userId', userId);
    }
    setUserId(userId);

    // Add welcome message
    setMessages([{
      id: 'welcome',
      role: 'maya',
      text: "Hello. I'm Maya. What's alive for you today?",
      timestamp: new Date()
    }]);
  }, []);

  const handleSendMessage = async (text: string, attachments?: File[]) => {
    if (!userId || !sessionId || !text.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const response = await fetch('/api/oracle/personal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: text,
          userId,
          sessionId,
          agentName: 'Maya',
          agentVoice: 'maya'
        }),
      });

      const data = await response.json();

      // Add Maya's response
      const mayaMessage: ChatMessage = {
        id: `maya-${Date.now()}`,
        role: 'maya',
        text: data.data?.message || "I'm here with you.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, mayaMessage]);

      // Handle voice playback if available
      if (data.data?.audio && data.data.audio !== 'web-speech-fallback') {
        try {
          const audio = new Audio(data.data.audio);
          setCurrentlySpeakingId(mayaMessage.id);

          audio.onended = () => {
            setCurrentlySpeakingId(undefined);
          };

          audio.onerror = () => {
            setCurrentlySpeakingId(undefined);
            // Fallback to text-to-speech
            if ('speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance(mayaMessage.text);
              utterance.voice = speechSynthesis.getVoices().find(voice =>
                voice.name.includes('Female') || voice.name.includes('Samantha')
              ) || null;
              utterance.rate = 0.9;
              utterance.pitch = 1.1;
              speechSynthesis.speak(utterance);
            }
          };

          await audio.play();
        } catch (audioError) {
          console.warn('Audio playback failed, using text-to-speech fallback');
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(mayaMessage.text);
            speechSynthesis.speak(utterance);
          }
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);

      // Add error message
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'maya',
        text: "I'm having trouble connecting right now, but I'm still here with you.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSpeakMessage = async (text: string, messageId: string) => {
    if ('speechSynthesis' in window) {
      setCurrentlySpeakingId(messageId);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = speechSynthesis.getVoices().find(voice =>
        voice.name.includes('Female') || voice.name.includes('Samantha')
      ) || null;
      utterance.rate = 0.9;
      utterance.pitch = 1.1;

      utterance.onend = () => {
        setCurrentlySpeakingId(undefined);
      };

      speechSynthesis.speak(utterance);
    }
  };

  const handleStopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    setCurrentlySpeakingId(undefined);
  };

  if (!userId || !sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-purple-200 text-lg">Connecting to Maya...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800">
      <MayaChatInterface
        onSendMessage={handleSendMessage}
        onSpeakMessage={handleSpeakMessage}
        onStopSpeaking={handleStopSpeaking}
        messages={messages}
        agentName="Maya"
        isProcessing={isProcessing}
        currentlySpeakingId={currentlySpeakingId}
        className="h-screen"
      />
    </div>
  );
}