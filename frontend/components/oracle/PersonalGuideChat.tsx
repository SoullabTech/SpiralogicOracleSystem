'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Heart, Zap, Sparkles } from 'lucide-react';
import { SacredButton } from '@/components/ui/SacredButton';
import { SacredCard } from '@/components/ui/SacredCard';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'guide';
  timestamp: Date;
  emotion?: 'supportive' | 'wise' | 'encouraging' | 'thoughtful';
}

interface PersonalGuideChatProps {
  userId?: string;
  guideName?: string;
  className?: string;
}

export const PersonalGuideChat: React.FC<PersonalGuideChatProps> = ({
  userId,
  guideName = "Your Guide",
  className = ''
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hey there! How's your day going?",
      sender: 'guide',
      timestamp: new Date(),
      emotion: 'supportive'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      // Connect to live backend for real Sacred conversations
      const response = await fetch('https://oracle-backend-1.onrender.com/api/oracle/personal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || 'demo-user'}`
        },
        body: JSON.stringify({
          message: currentInput,
          userId: userId || 'demo-user',
          guideName: guideName,
          conversationStyle: 'sacred-realness' // Apply Sacred Voice Formula
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        const guideMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response || data.message,
          sender: 'guide',
          timestamp: new Date(),
          emotion: data.emotion || 'supportive'
        };

        setMessages(prev => [...prev, guideMessage]);
      } else {
        throw new Error('Backend unavailable');
      }
    } catch (error) {
      console.log('Using demo mode - backend not available');
      
      // Fallback to Sacred Realness demo responses
      const responses = [
        "That's interesting. Tell me more about what's behind that feeling.",
        "I hear you. What would it look like if that shifted?",
        "You know what's wild about that? Most people never even notice that pattern.",
        "Makes sense. How's that sitting with you right now?",
        "I've been thinking about what you said earlier... this connects to that.",
        "Real talk - what would your wisest self say about this?",
        "That reminds me of something. What if you looked at it this way..."
      ];

      const guideMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        sender: 'guide',
        timestamp: new Date(),
        emotion: ['supportive', 'wise', 'encouraging', 'thoughtful'][Math.floor(Math.random() * 4)] as any
      };

      setMessages(prev => [...prev, guideMessage]);
    }

    setIsTyping(false);
  };

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    // Voice recognition would be implemented here
  };

  const getEmotionColor = (emotion?: string) => {
    switch (emotion) {
      case 'supportive': return 'text-soullab-water';
      case 'wise': return 'text-soullab-earth';
      case 'encouraging': return 'text-soullab-fire';
      case 'thoughtful': return 'text-soullab-air';
      default: return 'text-soullab-gray';
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 p-soullab-md border-b border-soullab-gray/20">
        <div className="w-10 h-10 bg-soullab-fire/10 rounded-soullab-spiral flex items-center justify-center">
          <Heart className="w-5 h-5 text-soullab-fire" />
        </div>
        <div>
          <h2 className="soullab-heading-3">{guideName}</h2>
          <p className="soullab-text-small text-soullab-gray">
            Always here, always real
          </p>
        </div>
        <div className="ml-auto">
          <div className="w-2 h-2 bg-soullab-earth rounded-full animate-pulse" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-soullab-md space-y-soullab-md">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[80%] rounded-soullab-lg p-soullab-sm
                  ${message.sender === 'user' 
                    ? 'bg-soullab-fire text-soullab-white ml-soullab-lg' 
                    : 'bg-soullab-white border border-soullab-gray/20 mr-soullab-lg'
                  }
                `}
              >
                <p className="soullab-text leading-relaxed">
                  {message.content}
                </p>
                
                {message.sender === 'guide' && message.emotion && (
                  <div className="flex items-center gap-1 mt-2">
                    <div className={`w-1 h-1 rounded-full bg-current ${getEmotionColor(message.emotion)}`} />
                    <span className={`text-xs capitalize ${getEmotionColor(message.emotion)}`}>
                      {message.emotion}
                    </span>
                  </div>
                )}
                
                <div className="text-xs opacity-60 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-soullab-white border border-soullab-gray/20 rounded-soullab-lg p-soullab-sm mr-soullab-lg">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-soullab-gray rounded-full"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-soullab-md border-t border-soullab-gray/20">
        <div className="flex items-end gap-soullab-sm">
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="What's on your mind?"
              className="soullab-input"
              disabled={isTyping}
            />
          </div>
          
          <SacredButton
            variant="ghost"
            size="md"
            onClick={handleVoiceToggle}
            className={`
              !p-soullab-sm rounded-soullab-spiral
              ${isListening ? 'bg-soullab-fire/10 text-soullab-fire' : ''}
            `}
          >
            <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
          </SacredButton>
          
          <SacredButton
            variant="primary"
            size="md"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="!p-soullab-sm"
          >
            <Send className="w-5 h-5" />
          </SacredButton>
        </div>
        
        {/* Quick suggestions */}
        <div className="flex gap-2 mt-soullab-sm overflow-x-auto">
          {[
            "How am I doing?",
            "What should I focus on?",
            "I'm feeling stuck",
            "Need some perspective"
          ].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setInputValue(suggestion)}
              className="
                flex-shrink-0 px-soullab-sm py-1 
                bg-soullab-gray/10 hover:bg-soullab-fire/10
                border border-soullab-gray/20 hover:border-soullab-fire/30
                rounded-soullab-spiral
                text-soullab-gray hover:text-soullab-fire
                text-xs transition-colors duration-fast
              "
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};