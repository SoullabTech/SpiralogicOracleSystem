/**
 * System Reset Utility
 * Comprehensive reset functions for voice system and conversation state
 */

export interface ResetOptions {
  clearVoiceState?: boolean;
  clearConversation?: boolean;
  clearCache?: boolean;
  clearPreferences?: boolean;
  clearAnalytics?: boolean;
}

/**
 * Complete system reset
 */
export function resetSystem(options: ResetOptions = {}) {
  const {
    clearVoiceState = true,
    clearConversation = true,
    clearCache = true,
    clearPreferences = false,
    clearAnalytics = false
  } = options;

  console.log('🔄 System Reset Initiated', options);

  // 1. Clear voice-related state
  if (clearVoiceState) {
    resetVoiceSystem();
  }

  // 2. Clear conversation history
  if (clearConversation) {
    resetConversation();
  }

  // 3. Clear cache
  if (clearCache) {
    clearAllCaches();
  }

  // 4. Clear user preferences (optional)
  if (clearPreferences) {
    clearUserPreferences();
  }

  // 5. Clear analytics (optional)
  if (clearAnalytics) {
    clearAnalyticsData();
  }

  console.log('✅ System Reset Complete');

  // Reload page for clean state
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }
}

/**
 * Reset voice system state
 */
export function resetVoiceSystem() {
  console.log('🎤 Resetting voice system...');

  // Stop all speech synthesis
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    console.log('✓ Speech synthesis cancelled');
  }

  // Clear voice-related localStorage
  if (typeof localStorage !== 'undefined') {
    const voiceKeys = [
      'selected_voice',
      'voice_enabled',
      'voice_mode',
      'voice_settings',
      'voice_telemetry'
    ];

    voiceKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('✓ Voice preferences cleared');
  }

  // Clear session storage
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem('voice_session');
    sessionStorage.removeItem('voice_state');
  }
}

/**
 * Reset conversation state
 */
export function resetConversation() {
  console.log('💬 Resetting conversation...');

  if (typeof localStorage !== 'undefined') {
    const conversationKeys = [
      'conversation_history',
      'conversation_context',
      'maya_session',
      'oracle_state'
    ];

    conversationKeys.forEach(key => {
      localStorage.removeItem(key);
    });
  }

  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem('current_conversation');
    sessionStorage.removeItem('message_queue');
  }

  console.log('✓ Conversation history cleared');
}

/**
 * Clear all caches
 */
export function clearAllCaches() {
  console.log('🗑️ Clearing caches...');

  // Clear localStorage caches
  if (typeof localStorage !== 'undefined') {
    const cacheKeys = Object.keys(localStorage).filter(key =>
      key.includes('cache') ||
      key.includes('temp') ||
      key.includes('_tmp')
    );

    cacheKeys.forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // Clear sessionStorage
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.clear();
  }

  // Clear IndexedDB if used
  if (typeof indexedDB !== 'undefined') {
    indexedDB.databases().then(databases => {
      databases.forEach(db => {
        if (db.name?.includes('cache')) {
          indexedDB.deleteDatabase(db.name);
        }
      });
    }).catch(console.error);
  }

  console.log('✓ Caches cleared');
}

/**
 * Clear user preferences (careful - this removes all settings)
 */
export function clearUserPreferences() {
  console.log('⚙️ Clearing user preferences...');

  if (typeof localStorage !== 'undefined') {
    const preferenceKeys = [
      'user_preferences',
      'theme',
      'archetype',
      'onboarding_complete'
    ];

    preferenceKeys.forEach(key => {
      localStorage.removeItem(key);
    });
  }

  console.log('✓ User preferences cleared');
}

/**
 * Clear analytics data
 */
export function clearAnalyticsData() {
  console.log('📊 Clearing analytics...');

  if (typeof localStorage !== 'undefined') {
    const analyticsKeys = Object.keys(localStorage).filter(key =>
      key.includes('analytics') ||
      key.includes('telemetry') ||
      key.includes('tracking')
    );

    analyticsKeys.forEach(key => {
      localStorage.removeItem(key);
    });
  }

  console.log('✓ Analytics data cleared');
}

/**
 * Emergency reset - clears everything
 */
export function emergencyReset() {
  console.warn('🚨 EMERGENCY RESET - Clearing all data...');

  // Clear everything in localStorage
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }

  // Clear everything in sessionStorage
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.clear();
  }

  // Stop all audio
  if (typeof window !== 'undefined') {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Stop all audio elements
    document.querySelectorAll('audio').forEach(audio => {
      (audio as HTMLAudioElement).pause();
      (audio as HTMLAudioElement).src = '';
    });
  }

  console.log('✅ Emergency reset complete - reloading...');

  // Force reload
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
}

/**
 * Diagnostic function to check system state
 */
export function getSystemState() {
  const state = {
    voice: {
      enabled: localStorage.getItem('voice_enabled') === 'true',
      selectedVoice: localStorage.getItem('selected_voice'),
      synthesisActive: window.speechSynthesis?.speaking || false,
      synthesisVoices: window.speechSynthesis?.getVoices()?.length || 0
    },
    conversation: {
      hasHistory: !!localStorage.getItem('conversation_history'),
      sessionActive: !!sessionStorage.getItem('current_conversation')
    },
    storage: {
      localStorageKeys: Object.keys(localStorage).length,
      sessionStorageKeys: Object.keys(sessionStorage).length,
      totalSize: new Blob(Object.values(localStorage)).size +
                 new Blob(Object.values(sessionStorage)).size
    }
  };

  return state;
}

// Export for use in components
export default {
  resetSystem,
  resetVoiceSystem,
  resetConversation,
  clearAllCaches,
  clearUserPreferences,
  clearAnalyticsData,
  emergencyReset,
  getSystemState
};