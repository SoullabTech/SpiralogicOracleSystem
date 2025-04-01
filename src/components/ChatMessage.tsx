import React, { useState } from 'react';
import { Message } from '../types';
import { User, Bot, ThumbsUp, ThumbsDown, MessageSquare, Lightbulb } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  onFollowUp?: (question: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onFollowUp }) => {
  const [showActions, setShowActions] = useState(false);
  const [feedback, setFeedback] = useState<'helpful' | 'unhelpful' | null>(null);
  
  const messageStyle = message.role === 'user' 
    ? 'bg-blue-50 ml-auto' 
    : 'bg-gray-50 mr-auto';
  
  const elementStyle = message.element ? `border-l-4 border-${getElementColor(message.element)}` : '';
  
  // Generate follow-up questions based on message content and context
  const followUpQuestions = generateFollowUpQuestions(message);
  
  return (
    <div 
      className={`p-4 rounded-lg shadow-sm max-w-[80%] ${messageStyle} ${elementStyle}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="font-medium mb-1 flex items-center gap-2">
        {message.role === 'user' ? (
          <>
            <User size={16} className="text-blue-600" />
            <span>You</span>
          </>
        ) : (
          <>
            <Bot size={16} className="text-purple-600" />
            <span>Oracle 3.0</span>
          </>
        )}
        
        {message.element && (
          <span className="ml-2 text-xs bg-white px-2 py-1 rounded border">
            {message.element}
          </span>
        )}
        
        {message.insight_type && (
          <span className="ml-2 text-xs bg-white px-2 py-1 rounded border text-gray-600">
            {message.insight_type}
          </span>
        )}
      </div>
      
      <div className="whitespace-pre-wrap text-gray-700">{message.content}</div>
      
      {message.role === 'assistant' && followUpQuestions.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <MessageSquare size={14} />
            <span>Follow-up Questions</span>
          </div>
          <div className="space-y-1">
            {followUpQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => onFollowUp?.(question)}
                className="block w-full text-left text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded px-2 py-1 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {message.role === 'assistant' && showActions && (
        <div className="mt-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFeedback('helpful')}
              className={`p-1 rounded ${feedback === 'helpful' ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-green-600'}`}
            >
              <ThumbsUp size={14} />
            </button>
            <button
              onClick={() => setFeedback('unhelpful')}
              className={`p-1 rounded ${feedback === 'unhelpful' ? 'text-red-600 bg-red-50' : 'text-gray-400 hover:text-red-600'}`}
            >
              <ThumbsDown size={14} />
            </button>
          </div>
          
          {message.insight_type === 'reflection' && (
            <div className="flex items-center gap-1 text-amber-600">
              <Lightbulb size={14} />
              <span className="text-xs">Key Insight</span>
            </div>
          )}
        </div>
      )}
      
      <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
        <span>{message.timestamp.toLocaleTimeString()}</span>
        {message.model && (
          <span className="text-purple-600">{message.model}</span>
        )}
      </div>
    </div>
  );
};

function getElementColor(element: string): string {
  switch (element) {
    case 'fire': return 'red-500';
    case 'water': return 'blue-500';
    case 'earth': return 'green-500';
    case 'air': return 'yellow-500';
    case 'aether': return 'purple-500';
    default: return 'gray-500';
  }
}

function generateFollowUpQuestions(message: Message): string[] {
  if (message.role !== 'assistant') return [];

  const questions: string[] = [];
  
  // Add element-specific questions
  if (message.element) {
    switch (message.element) {
      case 'fire':
        questions.push('How can I channel this energy into concrete actions?');
        questions.push('What resistance might I encounter in this transformation?');
        break;
      case 'water':
        questions.push('How can I deepen my emotional understanding here?');
        questions.push('What patterns do you notice in my emotional responses?');
        break;
      case 'earth':
        questions.push('What practical steps should I take next?');
        questions.push('How can I ground this insight in daily practice?');
        break;
      case 'air':
        questions.push('How does this connect to my broader understanding?');
        questions.push('What new perspectives should I explore?');
        break;
      case 'aether':
        questions.push('How does this insight integrate with my spiritual path?');
        questions.push('What higher meaning can I derive from this?');
        break;
    }
  }

  // Add insight-type specific questions
  if (message.insight_type) {
    switch (message.insight_type) {
      case 'reflection':
        questions.push('What patterns or themes do you notice in this reflection?');
        break;
      case 'challenge':
        questions.push('How can I best prepare for this challenge?');
        break;
      case 'guidance':
        questions.push('What support do I need to implement this guidance?');
        break;
      case 'integration':
        questions.push('How can I fully embody this understanding?');
        break;
    }
  }

  // Limit to 3 most relevant questions
  return questions.slice(0, 3);
}