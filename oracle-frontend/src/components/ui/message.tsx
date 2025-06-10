'use client';

import { motion } from 'framer-motion';
import { Clock, Sparkles, Brain } from 'lucide-react';

interface MessageProps {
  content: string;
  from: 'user' | 'depth-agent' | 'air' | 'catalyst-agent' | 'structuring-agent' | 'pattern-agent' | 'integrative-agent';
  timestamp?: string;
  agentName?: string;
  showAgentName?: boolean;
  className?: string;
}

export default function Message({ 
  content, 
  from, 
  timestamp, 
  agentName,
  showAgentName = false, 
  className = '' 
}: MessageProps) {
  
  const isUser = from === 'user';
  const isAir = from === 'air';
  
  // Agent styling configurations
  const agentStyles = {
    'depth-agent': {
      gradient: 'bg-gradient-to-br from-blue-500/20 to-blue-600/30',
      border: 'border-blue-300/30',
      textColor: 'text-blue-50',
      icon: '◊'
    },
    'catalyst-agent': {
      gradient: 'bg-gradient-to-br from-red-500/20 to-red-600/30',
      border: 'border-red-300/30', 
      textColor: 'text-red-50',
      icon: '◆'
    },
    'structuring-agent': {
      gradient: 'bg-gradient-to-br from-amber-600/20 to-amber-700/30',
      border: 'border-amber-400/30',
      textColor: 'text-amber-50',
      icon: '◾'
    },
    'pattern-agent': {
      gradient: 'bg-gradient-to-br from-sky-500/20 to-sky-600/30',
      border: 'border-sky-300/30',
      textColor: 'text-sky-50',
      icon: '◈'
    },
    'integrative-agent': {
      gradient: 'bg-gradient-to-br from-purple-500/20 to-purple-600/30',
      border: 'border-purple-300/30',
      textColor: 'text-purple-50',
      icon: '◯'
    },
    'air': {
      gradient: 'bg-gradient-to-br from-gray-100/80 to-gray-200/90',
      border: 'border-gray-300/50',
      textColor: 'text-gray-800',
      icon: '◈'
    }
  };

  const currentStyle = agentStyles[from as keyof typeof agentStyles] || agentStyles.air;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 ${className}`}
    >
      <div
        className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl backdrop-blur-sm border ${
          isUser
            ? 'bg-gradient-to-br from-violet-500/80 to-purple-600/80 border-violet-300/30 text-white ml-auto'
            : `${currentStyle.gradient} ${currentStyle.border} ${currentStyle.textColor} mr-auto shadow-lg`
        }`}
      >
        {/* Agent Header */}
        {!isUser && (
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg font-bold opacity-90">
              {currentStyle.icon}
            </span>
            {showAgentName && agentName && (
              <span className="text-xs font-medium opacity-80">
                {agentName}
              </span>
            )}
            {!showAgentName && (
              <span className="text-xs font-medium opacity-80">
                {isAir ? 'Air Intelligence' : 'Your Agent'}
              </span>
            )}
            {from !== 'air' && (
              <Brain className="w-3 h-3 opacity-70" />
            )}
            {from === 'air' && (
              <Sparkles className="w-3 h-3 opacity-70" />
            )}
          </div>
        )}

        {/* Message Content */}
        <div className="text-sm leading-relaxed font-medium">
          {content.split('\n').map((line, index) => (
            <p key={index} className={index > 0 ? 'mt-2' : ''}>
              {line}
            </p>
          ))}
        </div>

        {/* Timestamp */}
        {timestamp && (
          <div className="flex items-center justify-end mt-2 opacity-60">
            <Clock className="w-3 h-3 mr-1" />
            <span className="text-xs">
              {new Date(timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Specialized message components for different contexts
export function DepthAgentMessage({ content, timestamp, agentName }: Omit<MessageProps, 'from'>) {
  return (
    <Message 
      content={content}
      from="depth-agent"
      timestamp={timestamp}
      agentName={agentName}
      showAgentName={false}
    />
  );
}

export function AirMessage({ content, timestamp }: Omit<MessageProps, 'from'>) {
  return (
    <Message 
      content={content}
      from="air"
      timestamp={timestamp}
      showAgentName={false}
    />
  );
}

export function UserMessage({ content, timestamp }: Omit<MessageProps, 'from'>) {
  return (
    <Message 
      content={content}
      from="user"
      timestamp={timestamp}
    />
  );
}

export function AgentMessage({ 
  content, 
  agentType, 
  timestamp, 
  agentName 
}: { 
  content: string;
  agentType: 'depth' | 'catalyst' | 'structuring' | 'pattern' | 'integrative';
  timestamp?: string;
  agentName?: string;
}) {
  const fromMap = {
    depth: 'depth-agent',
    catalyst: 'catalyst-agent', 
    structuring: 'structuring-agent',
    pattern: 'pattern-agent',
    integrative: 'integrative-agent'
  } as const;

  return (
    <Message 
      content={content}
      from={fromMap[agentType]}
      timestamp={timestamp}
      agentName={agentName}
      showAgentName={false}
    />
  );
}