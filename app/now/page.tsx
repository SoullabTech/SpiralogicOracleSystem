// Now Page - Current moment awareness and ambient state
// Voice-activated quick actions and present-moment focus
"use client";

import { useState, useEffect } from 'react';
import { useElementTheme } from '../../hooks/useElementTheme';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  voiceCommands: string[];
  action: () => void;
}

interface AmbientState {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  greeting: string;
  suggestion: string;
}

export default function NowPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [ambientState, setAmbientState] = useState<AmbientState | null>(null);
  const { textClass, bgClass, borderClass } = useElementTheme();

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Calculate ambient state
  useEffect(() => {
    const hour = currentTime.getHours();
    let timeOfDay: AmbientState['timeOfDay'];
    let greeting: string;
    let suggestion: string;

    if (hour < 6) {
      timeOfDay = 'night';
      greeting = 'Deep Night';
      suggestion = 'Rest deeply, or if awake, consider gentle reflection';
    } else if (hour < 12) {
      timeOfDay = 'morning';
      greeting = 'Good Morning';
      suggestion = 'Set intentions for the day ahead';
    } else if (hour < 18) {
      timeOfDay = 'afternoon';
      greeting = 'Good Afternoon';
      suggestion = 'How are you feeling about your day so far?';
    } else if (hour < 22) {
      timeOfDay = 'evening';
      greeting = 'Good Evening';
      suggestion = 'Time to reflect and wind down';
    } else {
      timeOfDay = 'night';
      greeting = 'Late Evening';
      suggestion = 'Consider preparing for rest and restoration';
    }

    setAmbientState({ timeOfDay, greeting, suggestion });
  }, [currentTime]);

  const quickActions: QuickAction[] = [
    {
      id: 'journal_quick',
      label: 'Quick Journal',
      voiceCommands: ['quick journal', 'journal now', 'write something'],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="1.5"/>
        </svg>
      ),
      action: () => {
        // TODO: Open quick journal modal
        console.log('Opening quick journal');
      },
    },
    {
      id: 'oracle_ask',
      label: 'Ask Oracle',
      voiceCommands: ['ask oracle', 'oracle question', 'need guidance'],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeWidth="1.5"/>
        </svg>
      ),
      action: () => {
        window.location.href = '/oracle';
      },
    },
    {
      id: 'element_check',
      label: 'Element Check',
      voiceCommands: ['check element', 'soul mirror', 'how am i'],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9l-5 4.74L18.18 22 12 18.77 5.82 22 7 13.74 2 9l6.91-.74L12 2z" strokeWidth="1.5"/>
        </svg>
      ),
      action: () => {
        window.location.href = '/mirror';
      },
    },
    {
      id: 'spiral_moment',
      label: 'Spiral Moment',
      voiceCommands: ['spiral check', 'my progress', 'development'],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="1.5"/>
        </svg>
      ),
      action: () => {
        window.location.href = '/spirals';
      },
    },
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!ambientState) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-app-muted">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-md mx-auto space-y-8">
        {/* Current Time Display */}
        <div className="text-center space-y-2">
          <div className="text-6xl font-light text-app-text tabular-nums">
            {formatTime(currentTime)}
          </div>
          <div className="text-app-muted text-body">
            {formatDate(currentTime)}
          </div>
        </div>

        {/* Ambient Greeting */}
        <div className="text-center space-y-3">
          <h1 className={`text-headline-sm ${textClass}`}>
            {ambientState.greeting}
          </h1>
          <p className="text-app-muted text-body leading-relaxed">
            {ambientState.suggestion}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-app-text text-body font-medium">
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={action.action}
                className={`
                  p-4 rounded-apple bg-app-surface border border-app-border
                  flex flex-col items-center space-y-2
                  transition-all duration-apple hover:border-white/20 hover:bg-app-surface/80
                  focus:outline-none focus:ring-2 focus:ring-white/20
                  active:scale-95
                `}
                aria-label={action.label}
              >
                <div className={`${textClass}`}>
                  {action.icon}
                </div>
                <span className="text-app-text text-caption font-medium">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Present Moment Intention */}
        <div className="bg-app-surface/50 rounded-apple p-6 border border-app-border/50">
          <h3 className="text-app-text text-body font-medium mb-3">
            Present Moment
          </h3>
          <p className="text-app-muted text-body leading-relaxed mb-4">
            Take a breath. Notice what's here right now. What does this moment want to tell you?
          </p>
          <button
            className={`
              w-full p-3 rounded-apple-sm ${bgClass}/10 border ${borderClass}/30
              ${textClass} text-caption font-medium
              transition-all duration-apple hover:bg-opacity-20
              focus:outline-none focus:ring-2 focus:ring-white/20
            `}
            onClick={() => {
              // TODO: Open meditation/mindfulness timer
              console.log('Opening mindfulness moment');
            }}
          >
            Take a Mindful Moment
          </button>
        </div>

        {/* Voice Hint */}
        <div className="text-center">
          <p className="text-app-muted text-caption">
            Say "quick journal", "ask oracle", or "check element" to get started
          </p>
        </div>
      </div>
    </div>
  );
}