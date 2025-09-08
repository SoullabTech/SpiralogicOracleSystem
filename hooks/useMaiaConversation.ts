"use client";

import { useState, useCallback, useRef } from "react";

interface Message {
  id: string;
  role: "user" | "oracle";
  text: string;
  timestamp: Date;
  context?: string;
  coherenceLevel?: number;
  insight?: string;
}

interface MaiaResponse {
  text: string;
  insight: string;
  coherenceShift: number;
  practices?: string[];
  elements?: {
    fire?: number;
    water?: number;
    earth?: number;
    air?: number;
  };
}

export function useMaiaConversation() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const conversationRef = useRef<string>("");

  const sendMessage = useCallback(async (
    text: string, 
    context: string = "general"
  ): Promise<MaiaResponse> => {
    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date(),
      context
    };
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      // Call Maia API (PersonalOracleAgent)
      const response = await fetch("/api/oracle-unified", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: text,
          context,
          mode: "maia", // Specific mode for Maia
          conversationHistory: conversationRef.current,
          timestamp: new Date().toISOString()
        })
      });

      const data = await response.json();
      
      // Add oracle response
      const oracleMessage: Message = {
        id: `msg-${Date.now()}-oracle`,
        role: "oracle",
        text: data.text,
        timestamp: new Date(),
        context,
        coherenceLevel: data.coherenceLevel,
        insight: data.insight
      };
      setMessages(prev => [...prev, oracleMessage]);
      
      // Update conversation context
      conversationRef.current += `\nUser: ${text}\nMaia: ${data.text}`;
      
      return data;
    } catch (error) {
      console.error("Maia conversation error:", error);
      return {
        text: "I'm here, though words seem to be finding their way slowly. Let's breathe together.",
        insight: "Connection ripples even in silence",
        coherenceShift: 0,
      };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const clearConversation = useCallback(() => {
    setMessages([]);
    conversationRef.current = "";
  }, []);

  return {
    messages,
    sendMessage,
    clearConversation,
    isProcessing
  };
}