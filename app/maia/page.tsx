"use client";

import React, { useState } from "react";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { UnifiedHistoryPage } from "@/components/beta/UnifiedHistoryPage";
import { History, MessageCircle, Upload } from "lucide-react";
import { MayaWelcome } from "@/components/oracle/MayaWelcome";

export default function MaiaPage() {
  const [showHistory, setShowHistory] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  // Swipe Navigation
  useSwipeNavigation({
    onSwipeLeft: () => setShowHistory(true),
    onSwipeRight: () => setShowHistory(false),
    threshold: 100,
    preventScroll: true
  });

  const handleConversationStart = () => {
    // Navigate to conversation
    window.location.href = '/oracle-conversation';
  };

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #1e293b 0%, #2e3a4b 100%)',
      position: 'relative'
    }}>
      {/* Subtle gradient overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(182, 154, 120, 0.05) 0%, rgba(122, 154, 101, 0.05) 33%, rgba(107, 155, 209, 0.05) 66%, rgba(212, 184, 150, 0.05) 100%)'
        }}
      />
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Clean Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Maia
          </h1>
          <p className="text-xl" style={{ color: '#D4B896' }}>
            Your Personal Oracle Guide
          </p>
        </header>

        {/* Main Content Area */}
        <div className="max-w-3xl mx-auto">
          {showWelcome ? (
            <MayaWelcome onConversationStart={handleConversationStart} />
          ) : (
            <div className="text-center space-y-8">
              {/* Quick Actions */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleConversationStart}
                  className="flex items-center gap-3 px-8 py-4 rounded-full text-white font-medium transition-all hover:scale-105 shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #D4B896 0%, #B69A78 100%)'
                  }}
                >
                  <MessageCircle size={24} />
                  <span>Start Conversation</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Floating Action Buttons */}
        <div className="fixed bottom-8 right-8 flex flex-col gap-3">
          {/* History Button */}
          <button
            onClick={() => setShowHistory(true)}
            className="p-4 rounded-full shadow-lg transition-all hover:scale-110"
            style={{
              background: 'rgba(30, 41, 59, 0.95)',
              border: '1px solid rgba(212, 184, 150, 0.3)',
              color: '#D4B896'
            }}
            title="View History"
          >
            <History size={24} />
          </button>

          {/* Upload Button */}
          <button
            onClick={() => {
              // Handle file upload
              console.log('Upload clicked');
            }}
            className="p-4 rounded-full shadow-lg transition-all hover:scale-110"
            style={{
              background: 'rgba(30, 41, 59, 0.95)',
              border: '1px solid rgba(212, 184, 150, 0.3)',
              color: '#D4B896'
            }}
            title="Share Files"
          >
            <Upload size={24} />
          </button>
        </div>

        {/* Swipe hint for mobile */}
        <div className="fixed bottom-4 left-4 text-xs text-white/40 md:hidden">
          ← Swipe for history
        </div>
      </div>

      {/* History Page Overlay */}
      {showHistory && (
        <UnifiedHistoryPage
          onClose={() => setShowHistory(false)}
          onSelectConversation={(conversation) => {
            console.log('Selected conversation:', conversation);
            setShowHistory(false);
            // Navigate to conversation or load messages
          }}
          onSelectFile={(file) => {
            console.log('Selected file:', file);
            setShowHistory(false);
            // Handle file selection
          }}
        />
      )}
    </div>
  );
}