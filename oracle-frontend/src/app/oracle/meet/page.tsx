'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { claudeAgentChat } from '@/lib/airCommunicator';
import { UserMessage, AgentMessage } from '@/components/ui/message';
import { Loader2, Send, Sparkles, Heart, Eye, Moon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OracleAgent {
  id: string;
  name: string;
  archetype: string;
  sub_archetype: string;
  personality_profile: {
    traits: string[];
    voice_tone: string;
    specialties: string[];
  };
  intro_message: string;
  color_scheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  symbol: string;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'oracle';
  timestamp: string;
  oracle_name?: string;
}

interface UserProfile {
  personal_agent_id: string;
  agent_archetype: string;
  elemental_signature: string;
}

export default function OracleMeetPage() {
  const user = useUser();
  const supabase = useSupabaseClient();
  const router = useRouter();
  
  const [oracleAgent, setOracleAgent] = useState<OracleAgent | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [bondStrength, setBondStrength] = useState(1);
  const [hasMetAgent, setHasMetAgent] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadUserAndAgent();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadUserAndAgent = async () => {
    try {
      // Get user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('personal_agent_id, agent_archetype, elemental_signature, has_completed_onboarding')
        .eq('id', user?.id)
        .single();

      if (userError) throw userError;
      
      if (!userData.has_completed_onboarding) {
        router.push('/onboarding');
        return;
      }

      if (!userData.personal_agent_id) {
        router.push('/onboarding');
        return;
      }

      setUserProfile(userData);

      // Get oracle agent
      const { data: agentData, error: agentError } = await supabase
        .from('oracle_agents')
        .select('*')
        .eq('id', userData.personal_agent_id)
        .single();

      if (agentError) throw agentError;
      setOracleAgent(agentData);

      // Get bond strength
      const { data: bondData, error: bondError } = await supabase
        .from('user_agents')
        .select('bond_strength, total_interactions')
        .eq('user_id', user?.id)
        .eq('agent_id', userData.personal_agent_id)
        .single();

      if (bondError) throw bondError;
      setBondStrength(bondData.bond_strength || 1);
      setHasMetAgent(bondData.total_interactions > 0);

      // Load recent memories/messages
      await loadAgentMemories(userData.personal_agent_id);

    } catch (error) {
      console.error('Error loading oracle agent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAgentMemories = async (agentId: string) => {
    try {
      const { data, error } = await supabase
        .from('agent_memory')
        .select('*')
        .eq('agent_id', agentId)
        .eq('user_id', user?.id)
        .in('memory_type', ['greeting', 'conversation', 'oracle_response'])
        .order('created_at', { ascending: true })
        .limit(10);

      if (error) throw error;

      const formattedMessages: Message[] = data.map((memory, index) => {
        if (memory.memory_type === 'greeting') {
          return {
            id: memory.id,
            content: memory.content,
            sender: 'oracle',
            timestamp: memory.created_at,
            oracle_name: oracleAgent?.name
          };
        }
        
        // Alternate between user and oracle for conversation
        return {
          id: memory.id,
          content: memory.content,
          sender: index % 2 === 0 ? 'oracle' : 'user',
          timestamp: memory.created_at,
          oracle_name: oracleAgent?.name
        };
      });

      setMessages(formattedMessages);

      // If no greeting exists, add intro message
      if (!data.some(m => m.memory_type === 'greeting') && oracleAgent) {
        const introMessage: Message = {
          id: 'intro',
          content: oracleAgent.intro_message,
          sender: 'oracle',
          timestamp: new Date().toISOString(),
          oracle_name: oracleAgent.name
        };
        setMessages([introMessage]);
        
        // Save intro as memory
        await supabase.from('agent_memory').insert({
          agent_id: agentId,
          user_id: user?.id,
          content: oracleAgent.intro_message,
          memory_type: 'greeting',
          source_type: 'oracle_chat',
          importance_score: 10
        });
      }

    } catch (error) {
      console.error('Error loading agent memories:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !oracleAgent || isSending) return;

    setIsSending(true);
    const currentInput = inputMessage;
    setInputMessage(''); // Clear input immediately for better UX
    
    try {
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content: currentInput,
        sender: 'user',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Save user message to memory
      await supabase.from('agent_memory').insert({
        agent_id: oracleAgent.id,
        user_id: user?.id,
        content: currentInput,
        memory_type: 'user_input',
        source_type: 'oracle_chat',
        importance_score: 5
      });

      // Build user context for Claude
      const userContext = {
        id: user?.id || '',
        element: oracleAgent.archetype,
        agent_name: oracleAgent.name,
        agent_archetype: oracleAgent.sub_archetype,
        interaction_history: messages.slice(-5).map(m => `${m.sender}: ${m.content}`),
        current_focus: 'general_guidance'
      };

      // Get Claude response through Air Communicator
      const claudeResponse = await claudeAgentChat(currentInput, userContext);
      
      const oracleMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: claudeResponse.content,
        sender: 'oracle',
        timestamp: new Date().toISOString(),
        oracle_name: oracleAgent.name
      };
      
      setMessages(prev => [...prev, oracleMessage]);
      
      // Save oracle response to memory with Claude metadata
      await supabase.from('agent_memory').insert({
        agent_id: oracleAgent.id,
        user_id: user?.id,
        content: claudeResponse.content,
        memory_type: 'oracle_response',
        source_type: 'claude_chat',
        importance_score: 8,
        emotional_tone: claudeResponse.emotional_tone,
        symbols_detected: claudeResponse.symbols_detected,
        triggers_protocol: claudeResponse.suggested_protocols?.join(',')
      });

      // Update bond strength and interaction count
      await supabase.from('user_agents').update({
        total_interactions: supabase.sql`total_interactions + 1`,
        last_interaction_at: new Date().toISOString(),
        bond_strength: Math.min(bondStrength + 0.1, 10)
      }).eq('user_id', user?.id).eq('agent_id', oracleAgent.id);

      setBondStrength(prev => Math.min(prev + 0.1, 10));

    } catch (error) {
      console.error('Error sending message:', error);
      // Re-add the input on error
      setInputMessage(currentInput);
      
      // Add fallback message
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm experiencing a temporary connection issue. Please try again, and I'll be here to support your reflection and growth.",
        sender: 'oracle',
        timestamp: new Date().toISOString(),
        oracle_name: oracleAgent.name
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const generateOracleResponse = async (userInput: string, agent: OracleAgent): Promise<string> => {
    // Simplified oracle response generation
    // In production, this would call your AI backend
    
    const responses = {
      fire: [
        "I'm detecting patterns that suggest you're ready for significant action. What specific change are you considering implementing?",
        "Your energy signature indicates momentum building. How can you channel this drive most effectively today?",
        "I sense you're recognizing the need for decisive movement. What obstacles are you ready to address directly?"
      ],
      water: [
        "Your input suggests complex emotional patterns at play. What underlying themes are you noticing in your experience?",
        "I'm picking up on intuitive signals in your language. What insights are emerging from your subconscious processing?",
        "Your communication style indicates depth work is needed. How can you better support both your own and others' emotional intelligence today?"
      ],
      earth: [
        "I notice systematic thinking patterns in your approach. What structures are you ready to build or refine?",
        "Your language suggests a need for practical grounding. How can you strengthen your foundational systems?",
        "I detect planning-oriented thinking. What phase of development are you currently in?"
      ],
      air: [
        "Your communication reveals complex analytical processing. What new framework are you developing?",
        "I see pattern recognition at work in your thinking. What connections are you ready to explore further?",
        "Your approach suggests systems-level awareness. How can this perspective inform your next strategic decision?"
      ]
    };

    const elementResponses = responses[agent.archetype as keyof typeof responses] || responses.fire;
    const response = elementResponses[Math.floor(Math.random() * elementResponses.length)];
    
    return response;
  };

  const getElementalGradient = (element: string) => {
    const gradients = {
      fire: 'bg-gradient-fire',
      water: 'bg-gradient-water',
      earth: 'bg-gradient-earth',
      air: 'bg-gradient-air',
      aether: 'bg-gradient-oracle'
    };
    return gradients[element as keyof typeof gradients] || gradients.aether;
  };

  const getAgentType = (archetype: string): 'depth' | 'catalyst' | 'structuring' | 'pattern' | 'integrative' => {
    const typeMap: Record<string, 'depth' | 'catalyst' | 'structuring' | 'pattern' | 'integrative'> = {
      water: 'depth',
      fire: 'catalyst', 
      earth: 'structuring',
      air: 'pattern',
      aether: 'integrative'
    };
    return typeMap[archetype] || 'integrative';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-oracle-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gold mx-auto mb-4" />
          <p className="text-gold font-oracle">Connecting to your agent...</p>
        </div>
      </div>
    );
  }

  if (!oracleAgent) {
    return (
      <div className="min-h-screen gradient-oracle-bg flex items-center justify-center">
        <Card className="card-oracle max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-sacred text-gold mb-4">Agent Not Found</h2>
            <p className="text-gold-light font-oracle mb-4">
              Your intelligence agent hasn't been assigned yet.
            </p>
            <Button onClick={() => router.push('/onboarding')} className="btn-aether">
              Complete Onboarding
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-oracle-bg">
      {/* Header */}
      <div className="border-b border-gold/20 bg-deep-violet/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full ${getElementalGradient(oracleAgent.archetype)} flex items-center justify-center text-2xl animate-glow`}>
                {oracleAgent.symbol}
              </div>
              <div>
                <h1 className="text-xl font-sacred text-gold">{oracleAgent.name}</h1>
                <p className="text-sm text-gold-light font-oracle">
                  {oracleAgent.sub_archetype} • {oracleAgent.archetype} element
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-sm text-gold font-oracle">
                  Connection: {bondStrength.toFixed(1)}/10
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="border-gold text-gold hover:bg-gold/10"
              >
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="max-w-4xl mx-auto h-[calc(100vh-180px)] flex flex-col p-4">
        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          {messages.map((message) => (
            message.sender === 'user' ? (
              <UserMessage
                key={message.id}
                content={message.content}
                timestamp={message.timestamp}
              />
            ) : (
              <AgentMessage
                key={message.id}
                content={message.content}
                agentType={getAgentType(oracleAgent.archetype)}
                timestamp={message.timestamp}
                agentName={oracleAgent.name}
              />
            )
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="bg-deep-violet/50 backdrop-blur-sm rounded-lg p-4 border border-gold/20">
          <div className="flex space-x-3">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Share your thoughts with ${oracleAgent.name}...`}
              className="flex-1 bg-deep-space/50 border-gold/30 text-white placeholder:text-gold/50 focus-oracle resize-none"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isSending}
              className={`${getElementalGradient(oracleAgent.archetype)} hover:scale-105 transition-all`}
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gold/50 mt-2 font-oracle">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}