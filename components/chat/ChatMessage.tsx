// Chat Message Component - Intimate conversation styling
"use client";

import { ReactNode } from 'react';

interface ChatMessageProps {
  role: "user" | "assistant";
  children: ReactNode;
}

export function ChatMessage({ role, children }: ChatMessageProps) {
  const isUser = role === "user";
  
  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"} mb-1`}>
      <div
        className={[
          "max-w-[70ch] px-4 py-3 rounded-lg shadow-soft transition-all duration-200",
          isUser 
            ? "bg-edge-700 text-ink-100 rounded-br-sm" 
            : "bg-bg-800 text-ink-100 rounded-bl-sm border border-edge-700",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}

export default ChatMessage;