"use client";

import { useState, useEffect, useRef } from "react";
import EnhancedVoiceRecorder from "./EnhancedVoiceRecorder";
import FileUpload from "./FileUpload";
import JournalModal from "./JournalModal";
import { useMayaStream } from "@/hooks/useMayaStream";

export default function OracleInterface() {
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string>("aether");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{id?: string, role: string, content: string}>>([
    { role: "assistant", content: "Welcome, seeker. I am Maya, your guide through the sacred mirror of consciousness. What reflections shall we explore today?" }
  ]);
  
  const { text: streamingText, isStreaming, stream } = useMayaStream();
  const [currentStreamId, setCurrentStreamId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    
    // Add user message
    const userMessage = { 
      id: Date.now().toString(), 
      role: "user", 
      content: input 
    };
    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    
    // Create placeholder for streaming message
    const streamId = (Date.now() + 1).toString();
    setCurrentStreamId(streamId);
    const placeholderMessage = {
      id: streamId,
      role: "assistant",
      content: ""
    };
    setMessages(prev => [...prev, placeholderMessage]);
    
    // Stream response
    stream({
      userText: userInput,
      element: selectedElement,
      userId: "web-user",
      lang: "en-US"
    });
  };
  
  // Update streaming message
  useEffect(() => {
    if (currentStreamId && streamingText) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === currentStreamId 
            ? { ...msg, content: streamingText }
            : msg
        )
      );
    }
  }, [streamingText, currentStreamId]);
  
  // Clear stream ID when done
  useEffect(() => {
    if (!isStreaming && currentStreamId) {
      setCurrentStreamId(null);
    }
  }, [isStreaming, currentStreamId]);
  
  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="space-y-md">
      <div className="flex items-center justify-between">
        <h1 className="font-sacred text-gold-divine text-2xl">Maya • Sacred Mirror</h1>
        <div className="flex items-center gap-md">
          <button
            onClick={() => setShowJournalModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-sacred-blue/20 hover:bg-sacred-blue/30 text-gold-divine rounded-sacred transition-colors text-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
            </svg>
            <span>Journal</span>
          </button>
          <div className="flex gap-sm text-neutral-mystic text-sm">
            <span className="animate-pulse">✨</span>
            <span>Beta</span>
          </div>
        </div>
      </div>
      
      {/* Elemental Selection */}
      <div className="flex items-center justify-center gap-2 py-2">
        {[
          { id: 'air', label: 'Air', color: 'text-elemental-air hover:bg-elemental-air/20' },
          { id: 'fire', label: 'Fire', color: 'text-elemental-fire hover:bg-elemental-fire/20' },
          { id: 'water', label: 'Water', color: 'text-elemental-water hover:bg-elemental-water/20' },
          { id: 'earth', label: 'Earth', color: 'text-elemental-earth hover:bg-elemental-earth/20' },
          { id: 'aether', label: 'Aether', color: 'text-elemental-aether hover:bg-elemental-aether/20' },
        ].map((element) => (
          <button
            key={element.id}
            onClick={() => setSelectedElement(element.id)}
            className={`px-3 py-1.5 rounded-sacred transition-all text-sm font-medium ${
              selectedElement === element.id
                ? `${element.color.split(' ')[0]} bg-gold-divine/20 border border-gold-divine/40 shadow-sacred`
                : `${element.color} border border-transparent`
            }`}
          >
            {element.label}
          </button>
        ))}
      </div>
      
      <div className="rounded-sacred bg-sacred-navy/50 backdrop-blur-sm p-lg shadow-sacred space-y-md min-h-[400px] max-h-[600px] overflow-y-auto">
        {messages.map((message) => (
          <div 
            key={message.id || Math.random()} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] p-md rounded-sacred ${
                message.role === 'user' 
                  ? 'bg-sacred-blue text-neutral-pure' 
                  : 'bg-sacred-ethereal/20 text-neutral-silver border border-gold-divine/20'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="text-gold-amber text-xs mb-sm font-sacred">Maya</div>
              )}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content || (
                  <span className="flex items-center gap-sm text-gold-divine">
                    <span className="animate-pulse">✨</span>
                    <span className="text-xs">Maya is reflecting...</span>
                  </span>
                )}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-sm bg-sacred-navy/30 backdrop-blur-sm rounded-sacred p-sm border border-gold-divine/10 shadow-subtle">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
            placeholder="Share your reflection..."
          />
          <div className="flex items-center gap-xs">
            <EnhancedVoiceRecorder
              userId="web-user"
              onTranscribed={(data) => {
                // Directly send the message without updating input
                if (data.transcript.trim() && !isStreaming) {
                  const userMessage = { 
                    id: Date.now().toString(), 
                    role: "user", 
                    content: data.transcript 
                  };
                  setMessages(prev => [...prev, userMessage]);
                  
                  // Create placeholder for streaming
                  const streamId = (Date.now() + 1).toString();
                  setCurrentStreamId(streamId);
                  const placeholderMessage = {
                    id: streamId,
                    role: "assistant",
                    content: ""
                  };
                  setMessages(prev => [...prev, placeholderMessage]);
                  
                  // Stream response
                  stream({
                    userText: data.transcript,
                    element: selectedElement,
                    userId: "web-user",
                    lang: "en-US"
                  });
                }
              }}
            />
            <FileUpload />
            <button 
              type="submit"
              className="text-gold-divine hover:text-gold-amber transition-colors px-sm"
              disabled={isStreaming}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </form>
      
      <JournalModal
        isOpen={showJournalModal}
        onClose={() => setShowJournalModal(false)}
        onSuccess={() => {
          // Optionally refresh memory view or show success message
          console.log('Journal entry created');
        }}
      />
    </div>
  );
}