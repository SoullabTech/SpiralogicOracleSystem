"use client";

import { useState, useEffect, useRef } from "react";
import { useMaiaState } from "@/lib/hooks/useMaiaState";

type ChatMessage = {
  id: string;
  role: "user" | "maia";
  content: string;
  timestamp: string;
  coherenceLevel?: number;
  elements?: Record<string, number>;
  motionState?: string;
  sessionId?: string;
};

interface MaiaChatState {
  messages: ChatMessage[];
  loading: boolean;
  coherenceLevel: number;
  sessionId: string;
}

export function useMaiaChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [coherenceLevel, setCoherenceLevel] = useState(0.7);
  const [sessionId, setSessionId] = useState("");
  const { setState } = useMaiaState();
  const wsRef = useRef<WebSocket | null>(null);

  // Initialize session and load recent messages
  useEffect(() => {
    async function initializeSession() {
      try {
        // Get or create session
        const res = await fetch("/api/maia/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            action: "init",
            timestamp: new Date().toISOString()
          })
        });
        
        if (res.ok) {
          const data = await res.json();
          setSessionId(data.sessionId);
          setMessages(data.recentMessages || []);
          setCoherenceLevel(data.coherenceLevel || 0.7);
        }
      } catch (err) {
        console.error("Error initializing Maia session:", err);
        // Fallback to local session
        setSessionId(`local-${Date.now()}`);
      }
    }
    
    initializeSession();
  }, []);

  // WebSocket for real-time updates (optional but powerful)
  useEffect(() => {
    if (!sessionId) return;

    // Connect to WebSocket for live updates
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/maia/${sessionId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case "motion":
          setState(data.state);
          break;
        case "coherence":
          setCoherenceLevel(data.level);
          break;
        case "message":
          setMessages(prev => [...prev, data.message]);
          break;
      }
    };
    
    wsRef.current = ws;
    
    return () => {
      ws.close();
    };
  }, [sessionId, setState]);

  // Send message to Maia
  async function sendMessage(content: string, context?: string) {
    // Optimistic update
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date().toISOString(),
      sessionId
    };
    setMessages(prev => [...prev, userMessage]);
    
    setLoading(true);
    setState("processing");
    
    try {
      const res = await fetch("/api/maia/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content,
          context,
          sessionId,
          coherenceLevel,
          timestamp: new Date().toISOString()
        })
      });

      if (res.ok) {
        const data = await res.json();
        
        // Add Maia's response
        const maiaMessage: ChatMessage = {
          id: data.messageId,
          role: "maia",
          content: data.response,
          timestamp: data.timestamp,
          coherenceLevel: data.coherenceLevel,
          elements: data.elements,
          motionState: data.motionState,
          sessionId
        };
        
        setMessages(prev => [...prev, maiaMessage]);
        setCoherenceLevel(data.coherenceLevel);
        setState(data.motionState || "responding");
        
        // Transition back to idle after response
        setTimeout(() => setState("idle"), 3000);
        
        return data;
      }
    } catch (err) {
      console.error("Error sending message to Maia:", err);
      setState("idle");
      
      // Fallback response
      const fallbackMessage: ChatMessage = {
        id: `msg-${Date.now()}-fallback`,
        role: "maia",
        content: "I'm here with you, though the connection feels distant. Let's breathe together.",
        timestamp: new Date().toISOString(),
        sessionId
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setLoading(false);
    }
  }

  // Clear session (for logout or reset)
  async function clearSession() {
    try {
      await fetch("/api/maia/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "clear",
          sessionId
        })
      });
      
      setMessages([]);
      setSessionId("");
      setCoherenceLevel(0.7);
      setState("idle");
    } catch (err) {
      console.error("Error clearing session:", err);
    }
  }

  // Get conversation summary
  async function getSummary() {
    try {
      const res = await fetch(`/api/maia/summary?sessionId=${sessionId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error("Error getting summary:", err);
    }
    return null;
  }

  return {
    messages,
    sendMessage,
    loading,
    coherenceLevel,
    sessionId,
    clearSession,
    getSummary
  };
}