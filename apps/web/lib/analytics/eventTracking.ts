'use client';

import { createClient } from '@/lib/supabase/client';
import Bowser from 'bowser';

export interface EventPayload {
  timestamp?: number;
  source?: string;
  sessionId?: string;
  error?: string;
  [key: string]: any;
}

export interface BrowserInfo {
  userAgent: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  platform: string;
  platformType: string;
  language: string;
  vendor?: string;
  cookieEnabled: boolean;
  onLine: boolean;
  screenWidth: number;
  screenHeight: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

function getBrowserInfo(): BrowserInfo {
  if (typeof window === 'undefined') {
    return {
      userAgent: 'server',
      browser: 'server',
      browserVersion: '0',
      os: 'server',
      osVersion: '0',
      platform: 'server',
      platformType: 'server',
      language: 'en',
      cookieEnabled: false,
      onLine: true,
      screenWidth: 0,
      screenHeight: 0,
      isMobile: false,
      isTablet: false,
      isDesktop: false
    };
  }

  const parser = Bowser.getParser(window.navigator.userAgent);
  const browserInfo = parser.getBrowser();
  const osInfo = parser.getOS();
  const platformInfo = parser.getPlatform();

  return {
    userAgent: navigator.userAgent,
    browser: browserInfo.name || detectBrowserType(),
    browserVersion: browserInfo.version || 'unknown',
    os: osInfo.name || 'unknown',
    osVersion: osInfo.version || 'unknown',
    platform: navigator.platform,
    platformType: platformInfo.type || 'unknown',
    language: navigator.language,
    vendor: navigator.vendor,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    isMobile: parser.getPlatformType() === 'mobile',
    isTablet: parser.getPlatformType() === 'tablet',
    isDesktop: parser.getPlatformType() === 'desktop'
  };
}

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  
  let sessionId = localStorage.getItem('soullab_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('soullab_session_id', sessionId);
  }
  return sessionId;
}

export async function trackEvent(
  eventName: string, 
  payload: EventPayload = {}
): Promise<void> {
  try {
    const supabase = createClient();
    
    // Get current user if authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    // Prepare event data
    const eventData = {
      event_name: eventName,
      user_id: user?.id || null,
      session_id: payload.sessionId || getSessionId(),
      payload: {
        ...payload,
        timestamp: payload.timestamp || Date.now()
      },
      browser_info: getBrowserInfo(),
      created_at: new Date().toISOString()
    };

    // Insert event
    const { error } = await supabase
      .from('event_logs')
      .insert([eventData]);

    if (error) {
      console.error('❌ [Analytics] Failed to track event:', error);
    } else {
      console.log(`📊 [Analytics] Event logged: ${eventName}`, payload);
    }
  } catch (err) {
    console.error('❌ [Analytics] Error tracking event:', eventName, err);
  }
}

// Specialized function for audio unlock tracking
export async function trackAudioUnlock(success: boolean, details?: any): Promise<void> {
  const eventName = success ? 'audio_unlocked' : 'audio_unlock_failed';
  
  await trackEvent(eventName, {
    source: 'voice_recorder',
    details,
    browserType: detectBrowserType()
  });
}

// Helper to detect browser type for correlation analysis
function detectBrowserType(): string {
  const ua = navigator.userAgent;
  
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  
  return 'Other';
}