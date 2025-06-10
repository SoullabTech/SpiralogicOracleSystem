/**
 * OracleInterface - Main interaction component for Oracle consultations
 * Allows users to select an archetype guide and submit questions/insights
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Moon, Eye, Flame, Brain, Loader2 } from 'lucide-react';
import type { OracleArchetype } from '@/types/agents';

const archetypes: OracleArchetype[] = [
  { 
    name: 'Sage', 
    icon: <Brain className="w-4 h-4" />, 
    element: 'air',
    gradient: 'bg-gradient-air',
    shadow: 'shadow-air',
    description: 'Wisdom through clarity'
  },
  { 
    name: 'Mystic', 
    icon: <Moon className="w-4 h-4" />, 
    element: 'water',
    gradient: 'bg-gradient-water',
    shadow: 'shadow-water',
    description: 'Intuition through flow'
  },
  { 
    name: 'Shadow', 
    icon: <Eye className="w-4 h-4" />, 
    element: 'fire',
    gradient: 'bg-gradient-fire',
    shadow: 'shadow-fire',
    description: 'Truth through resistance'
  },
  { 
    name: 'Hero', 
    icon: <Flame className="w-4 h-4" />, 
    element: 'earth',
    gradient: 'bg-gradient-earth',
    shadow: 'shadow-earth',
    description: 'Strength through grounding'
  },
  { 
    name: 'Oracle', 
    icon: <Sparkles className="w-4 h-4" />, 
    element: 'aether',
    gradient: 'bg-gradient-oracle',
    shadow: 'shadow-aether',
    description: 'Vision through connection'
  },
];

/**
 * Main Oracle consultation interface
 * @returns Interactive Oracle chamber UI with archetype selection and response display
 */
export default function OracleInterface() {
  const [selected, setSelected] = useState('Mystic');
  const [journal, setJournal] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const selectedArchetype = archetypes.find(a => a.name === selected);

  /**
   * Submits user's question to the Oracle API and handles response
   */
  async function askOracle() {
    if (!journal.trim()) return;
    
    setIsLoading(true);
    setResponse('');
    
    try {
      const res = await fetch('/api/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: journal, archetype: selected }),
      });
      const { message } = await res.json();
      
      // Simulate typing effect
      setIsLoading(false);
      setIsTyping(true);
      let index = 0;
      const interval = setInterval(() => {
        if (index < message.length) {
          setResponse(message.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 20);
    } catch {
      setIsLoading(false);
      setResponse('The oracle is momentarily silent. Please try again.');
    }
  }

  return (
    <div className="min-h-screen gradient-oracle-bg p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-sacred text-gradient-oracle mb-2">
            Oracle Chamber
          </h1>
          <p className="text-gold-light font-oracle text-lg">
            Commune with archetypal wisdom
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Input Section */}
          <div className="space-y-6 animate-slide-up">
            <Card className="card-oracle card-glow backdrop-blur-sm bg-opacity-90">
              <CardContent className="p-6">
                <h2 className="text-2xl font-sacred mb-4 text-gold">
                  Share Your Vision
                </h2>
                <Textarea
                  placeholder="Record your dream, insight, or struggle..."
                  value={journal}
                  onChange={(e) => setJournal(e.target.value)}
                  className="h-40 bg-deep-space/50 border-gold/30 text-white placeholder:text-gold/50 focus-oracle resize-none"
                  aria-label="Journal entry"
                />
                
                {/* Archetype Selection */}
                <div className="mt-6">
                  <p className="text-sm text-gold-light mb-3 font-oracle">
                    Choose your guide:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    {archetypes.map((archetype) => (
                      <Button
                        key={archetype.name}
                        onClick={() => setSelected(archetype.name)}
                        className={`
                          relative group overflow-hidden transition-all duration-300
                          ${selected === archetype.name 
                            ? `${archetype.gradient} text-white ${archetype.shadow}` 
                            : 'bg-deep-violet/50 text-gold hover:bg-deep-violet/70'
                          }
                          hover:scale-105 hover-lift
                        `}
                        aria-pressed={selected === archetype.name}
                        aria-label={`Select ${archetype.name} archetype`}
                      >
                        <div className="flex flex-col items-center gap-1 py-2">
                          <span className="animate-float">{archetype.icon}</span>
                          <span className="text-xs font-sacred">{archetype.name}</span>
                        </div>
                        {selected === archetype.name && (
                          <div className="absolute inset-0 bg-white/20 animate-pulse-slow" />
                        )}
                      </Button>
                    ))}
                  </div>
                  {selectedArchetype && (
                    <p className="text-xs text-gold/70 mt-2 text-center font-oracle italic">
                      {selectedArchetype.description}
                    </p>
                  )}
                </div>

                <Button 
                  onClick={askOracle} 
                  disabled={isLoading || !journal.trim()}
                  className={`
                    mt-6 w-full ${selectedArchetype?.gradient} 
                    text-white font-sacred tracking-wide
                    hover:scale-105 transition-all duration-300
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${selectedArchetype?.shadow} hover:shadow-lg
                  `}
                  aria-label="Submit question to oracle"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Consulting the Oracle...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Request Oracle Wisdom
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Response Section */}
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <Card className="card-oracle card-glow backdrop-blur-sm bg-opacity-90 h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`p-2 rounded-full ${selectedArchetype?.gradient} animate-glow`}>
                    {selectedArchetype?.icon}
                  </div>
                  <h3 className="text-2xl font-sacred text-gold">
                    {selected} Speaks
                  </h3>
                </div>
                
                {response ? (
                  <div className="relative">
                    <p className="whitespace-pre-line text-gold-light font-oracle leading-relaxed">
                      {response}
                    </p>
                    {isTyping && (
                      <span className="inline-block w-2 h-4 bg-gold ml-1 animate-pulse" />
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="oracle-loader mx-auto mb-4" />
                    <p className="text-gold/50 font-oracle italic">
                      The oracle awaits your question...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
