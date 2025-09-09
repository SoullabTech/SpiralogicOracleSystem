'use client';

import React from 'react';
import { ConversationFlow } from '@/components/oracle/ConversationFlow';
import { BetaFeedbackSystem } from '@/components/feedback/BetaFeedbackSystem';

/**
 * Enhanced Maia Page - Sacred Conversation Gateway
 * Integrates with the full sacred architecture:
 * - ConversationFlow with voice integration
 * - Memory system with wisdom extraction
 * - Authentication-aware experience
 * - Beta feedback collection
 */
export default function MaiaPage() {
  return (
    <>
      {/* Main conversation experience */}
      <ConversationFlow initialMode="welcome" />
      
      {/* Beta feedback system - floating trigger */}
      <BetaFeedbackSystem 
        trigger="floating"
        sessionContext="maia_conversation"
      />
    </>
  );
}