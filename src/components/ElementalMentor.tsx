import React, { useState, useEffect, useRef } from 'react';
import { Bot, Star, Flame, Droplet, Mountain, Wind, Plus, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ElementalMentorProps {
  clientId: string;
}

interface Message {
  id: string;
  client_id: string;
  content: string;
  sender: 'client' | 'oracle' | 'system';
  element: string | null;
  insight_type?: string;
  created_at: string;
}

interface ClientProfile {
  id: string;
  element: string | null;
  phase: string | null;
  archetype: string | null;
}

export default function ElementalMentor({ clientId }: ElementalMentorProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [currentElement, setCurrentElement] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const elements = [
    { value: 'Fire', icon: Flame, color: 'text-orange-500' },
    { value: 'Water', icon: Droplet, color: 'text-blue-500' },
    { value: 'Earth', icon: Mountain, color: 'text-green-500' },
    { value: 'Air', icon: Wind, color: 'text-purple-500' },
    { value: 'Aether', icon: Star, color: 'text-indigo-500' }
  ];
  
  useEffect(() => {
    loadData();
  }, [clientId]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const loadData = async () => {
    try {
      // Get client profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          current_spiralogic_phase,
          active_archetypes,
          fire_element,
          water_element,
          earth_element,
          air_element,
          aether_element
        `)
        .eq('id', clientId)
        .single();
        
      if (profileError) throw profileError;

      // Determine dominant element
      const elementValues = {
        Fire: profileData.fire_element,
        Water: profileData.water_element,
        Earth: profileData.earth_element,
        Air: profileData.air_element,
        Aether: profileData.aether_element
      };

      const dominantElement = Object.entries(elementValues)
        .reduce((a, b) => a[1] > b[1] ? a : b)[0];
      
      setProfile({
        id: profileData.id,
        element: dominantElement,
        phase: profileData.current_spiralogic_phase,
        archetype: profileData.active_archetypes?.[0] || null
      });
      setCurrentElement(dominantElement);
      
      // Get chat history
      const { data: chatData, error: chatError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: true });
        
      if (chatError) throw chatError;
      setMessages(chatData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    // Add user message to UI immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      client_id: clientId,
      content: input,
      sender: 'client',
      element: currentElement,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Save user message
      await supabase.from('chat_messages').insert(userMessage);
      
      // Prepare context for AI response
      const context = {
        clientProfile: profile,
        element: currentElement,
        conversationHistory: messages.slice(-10) // Last 10 messages for context
      };
      
      // Get Oracle response
      const response = await fetch('/api/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input, 
          context,
          clientId,
          clientName: profile?.archetype || 'Seeker'
        })
      });
      
      if (!response.ok) throw new Error('Failed to get response from Oracle');
      
      const data = await response.json();
      
      // Add Oracle response
      const oracleMessage: Message = {
        id: Date.now().toString(),
        client_id: clientId,
        content: data.result,
        sender: 'oracle',
        element: data.analysis.element || currentElement,
        insight_type: data.analysis.insightType,
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, oracleMessage]);
      await supabase.from('chat_messages').insert(oracleMessage);
      
      // Handle element shift suggestion
      if (data.analysis.element && data.analysis.element !== currentElement) {
        const suggestionMessage: Message = {
          id: Date.now().toString(),
          client_id: clientId,
          content: `Would you like to shift to ${data.analysis.element} element for our conversation?`,
          sender: 'system',
          element: data.analysis.element,
          created_at: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, suggestionMessage]);
        await supabase.from('chat_messages').insert(suggestionMessage);
      }
    } catch (error) {
      console.error('Error in Oracle communication:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        client_id: clientId,
        content: "I'm having trouble connecting with the Oracle. Please try again in a moment.",
        sender: 'system',
        element: currentElement,
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleElementChange = async (newElement: string) => {
    setCurrentElement(newElement);
    
    const changeMessage: Message = {
      id: Date.now().toString(),
      client_id: clientId,
      content: `Shifting to ${newElement} element guidance.`,
      sender: 'system',
      element: newElement,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, changeMessage]);
    await supabase.from('chat_messages').insert(changeMessage);
  };
  
  const getElementStyles = (element: string | null) => {
    const styles = {
      Fire: {
        bg: 'bg-orange-50',
        border: 'border-orange-500',
        text: 'text-orange-800',
        button: 'bg-orange-500 hover:bg-orange-600'
      },
      Water: {
        bg: 'bg-blue-50',
        border: 'border-blue-500',
        text: 'text-blue-800',
        button: 'bg-blue-500 hover:bg-blue-600'
      },
      Earth: {
        bg: 'bg-green-50',
        border: 'border-green-500',
        text: 'text-green-800',
        button: 'bg-green-500 hover:bg-green-600'
      },
      Air: {
        bg: 'bg-purple-50',
        border: 'border-purple-500',
        text: 'text-purple-800',
        button: 'bg-purple-500 hover:bg-purple-600'
      },
      Aether: {
        bg: 'bg-indigo-50',
        border: 'border-indigo-500',
        text: 'text-indigo-800',
        button: 'bg-indigo-500 hover:bg-indigo-600'
      }
    };
    
    return styles[element as keyof typeof styles] || styles.Aether;
  };
  
  const currentStyles = getElementStyles(currentElement);
  
  return (
    <div className="flex flex-col h-[70vh] bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className={`p-4 ${currentStyles.bg} border-b ${currentStyles.border}`}>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Bot className="text-purple-600" />
              Oracle Guidance
            </h2>
            {profile && (
              <div className="text-sm mt-1 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="font-medium">Phase:</span>
                  <span>{profile.phase || 'Not assigned'}</span>
                </div>
                {profile.archetype && (
                  <>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Archetype:</span>
                      <span>{profile.archetype}</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            {elements.map(({ value, icon: Icon, color }) => (
              <button
                key={value}
                onClick={() => handleElementChange(value)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  currentElement === value
                    ? getElementStyles(value).button + ' text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                title={value}
              >
                <Icon size={16} className={currentElement === value ? 'text-white' : color} />
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Messages Container */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-6 max-w-md">
              <Bot className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Begin Your Oracle Conversation</h3>
              <p className="text-gray-500">
                Ask a question or share a challenge to receive elemental guidance from your Oracle mentor.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(message => (
              <div key={message.id} className={`max-w-3xl ${message.sender !== 'client' ? 'ml-auto' : 'mr-auto'}`}>
                {message.sender === 'client' ? (
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-gray-800">{message.content}</p>
                    <div className="mt-2 text-xs text-gray-400">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                ) : message.sender === 'system' ? (
                  <div className={`${getElementStyles(message.element).bg} p-4 rounded-lg shadow-sm border ${getElementStyles(message.element).border}`}>
                    <p className="italic">{message.content}</p>
                    
                    {message.content.includes('shift to') && (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => handleElementChange(message.element!)}
                          className={`px-3 py-1 text-sm ${getElementStyles(message.element).button} text-white rounded-lg`}
                        >
                          Accept Shift
                        </button>
                        <button
                          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
                        >
                          Stay with {currentElement}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`${getElementStyles(message.element).bg} p-4 rounded-lg shadow-sm border-l-4 ${getElementStyles(message.element).border}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Bot size={16} className="text-purple-600" />
                      <span className="text-sm font-medium">Oracle</span>
                      {message.element && (
                        <span className={`px-2 py-0.5 text-xs rounded-full bg-white ${getElementStyles(message.element).text}`}>
                          {message.element}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-800">{message.content}</p>
                    
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-gray-400">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </span>
                      {message.insight_type && (
                        <span className={`px-2 py-0.5 rounded-full bg-white ${getElementStyles(message.element).text}`}>
                          {message.insight_type}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Input Area */}
      <div className={`p-4 border-t ${currentStyles.border} ${currentStyles.bg}`}>
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder={`Ask your ${currentElement} Oracle...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 transition-colors ${currentStyles.button} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>Sending</span>
              </>
            ) : (
              <>
                <MessageCircle size={18} />
                <span>Send</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}