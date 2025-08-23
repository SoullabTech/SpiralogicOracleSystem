/**
 * Feature flag configuration for the Spiralogic Oracle System
 * 
 * Usage:
 * - Import { features } from '@/lib/config/features'
 * - Check with: if (features.oracle.weaveEnabled) { ... }
 * - Use hooks: const { isEnabled } = useFeature('oracle.weave')
 */

// ── Core Feature Flags ──────────────────────────────────────────────────────
export const flags = {
  // Library Features
  LIBRARY_ENABLED: process.env.NEXT_PUBLIC_LIBRARY_ENABLED === 'true',
  LIBRARY_TIMELINE_ENABLED: process.env.NEXT_PUBLIC_LIBRARY_TIMELINE_ENABLED === 'true',
  LIBRARY_REPROCESS_ENABLED: process.env.NEXT_PUBLIC_LIBRARY_REPROCESS_ENABLED === 'true',
  LIBRARY_OFFLINE_CAPTURE: process.env.NEXT_PUBLIC_LIBRARY_OFFLINE_CAPTURE === 'true',
  
  // Oracle Features
  ORACLE_WEAVE_ENABLED: process.env.NEXT_PUBLIC_ORACLE_WEAVE_ENABLED !== 'false', // Default true
  ORACLE_VOICE_AUTO_SEND: process.env.NEXT_PUBLIC_ORACLE_VOICE_AUTO_SEND === 'true',
  ORACLE_MULTI_MODAL: process.env.NEXT_PUBLIC_ORACLE_MULTI_MODAL === 'true',
  ORACLE_VOICE_ENABLED: process.env.NEXT_PUBLIC_ORACLE_VOICE_ENABLED !== 'false', // Default true
  ORACLE_MAYA_VOICE: process.env.NEXT_PUBLIC_ORACLE_MAYA_VOICE !== 'false', // Default true
  ORACLE_MICROPSI_ENABLED: process.env.NEXT_PUBLIC_ORACLE_MICROPSI_ENABLED === 'true',
  ORACLE_SPIRALOGIC_ENABLED: process.env.NEXT_PUBLIC_ORACLE_SPIRALOGIC_ENABLED !== 'false', // Default true
  
  // Design System
  THEME_SWITCHING_ENABLED: process.env.NEXT_PUBLIC_THEME_SWITCHING !== 'false', // Default true
  THEME_PERSIST_ENABLED: process.env.NEXT_PUBLIC_THEME_PERSIST !== 'false', // Default true
  
  // Beta Features
  BETA_CONSTELLATION_VIEW: process.env.NEXT_PUBLIC_BETA_CONSTELLATION === 'true',
  BETA_ADVANCED_MEMORY: process.env.NEXT_PUBLIC_BETA_MEMORY === 'true',
  BETA_SOUL_ANALYTICS: process.env.NEXT_PUBLIC_BETA_ANALYTICS === 'true',
  
  // Neurodivergent / ADHD Features
  ND_ENABLED: process.env.NEXT_PUBLIC_ND_ENABLED === 'true',
  ND_ADHD_DEFAULT: process.env.NEXT_PUBLIC_ND_ADHD_DEFAULT === 'true',
  ND_ENERGY: process.env.NEXT_PUBLIC_ND_ENERGY === 'true',
  ND_RECALL: process.env.NEXT_PUBLIC_ND_RECALL === 'true',
  ND_DIGESTS: process.env.NEXT_PUBLIC_ND_DIGESTS === 'true',
  
  // Developer Tools
  DEV_TOOLS_ENABLED: process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEV_TOOLS === 'true',
  DEV_PERFORMANCE_MONITOR: process.env.NEXT_PUBLIC_DEV_PERF === 'true',
  DEV_MEMORY_INSPECTOR: process.env.NEXT_PUBLIC_DEV_MEMORY === 'true',
} as const

// ── Grouped Feature Configuration ───────────────────────────────────────────
export const features = {
  library: {
    enabled: flags.LIBRARY_ENABLED,
    timeline: flags.LIBRARY_TIMELINE_ENABLED && flags.LIBRARY_ENABLED,
    reprocess: flags.LIBRARY_REPROCESS_ENABLED && flags.LIBRARY_ENABLED,
    offlineCapture: flags.LIBRARY_OFFLINE_CAPTURE && flags.LIBRARY_ENABLED,
  },
  
  oracle: {
    weaveEnabled: flags.ORACLE_WEAVE_ENABLED,
    voiceAutoSend: flags.ORACLE_VOICE_AUTO_SEND,
    multiModal: flags.ORACLE_MULTI_MODAL,
    voiceEnabled: flags.ORACLE_VOICE_ENABLED,
    mayaVoice: flags.ORACLE_MAYA_VOICE && flags.ORACLE_VOICE_ENABLED,
    micropsiEnabled: flags.ORACLE_MICROPSI_ENABLED,
    spiralogicEnabled: flags.ORACLE_SPIRALOGIC_ENABLED,
    voiceSelectionEnabled: process.env.NEXT_PUBLIC_VOICE_SELECTION_ENABLED === 'true',
  },

  voice: {
    provider: (process.env.VOICE_PROVIDER ?? 'sesame') as 'sesame' | 'elevenlabs',
    sesame: {
      voice: process.env.SESAME_VOICE ?? 'maya',
    },
    elevenlabs: {
      enabled: process.env.ELEVENLABS_ENABLED === 'true',
      voiceId: process.env.ELEVENLABS_VOICE_ID ?? '',
    },
  },
  
  theme: {
    switchingEnabled: flags.THEME_SWITCHING_ENABLED,
    persistEnabled: flags.THEME_PERSIST_ENABLED,
  },
  
  beta: {
    constellationView: flags.BETA_CONSTELLATION_VIEW,
    advancedMemory: flags.BETA_ADVANCED_MEMORY,
    soulAnalytics: flags.BETA_SOUL_ANALYTICS,
  },
  
  neurodivergent: {
    enabled: flags.ND_ENABLED,
    adhdModeDefault: flags.ND_ADHD_DEFAULT,
    energyCheckins: flags.ND_ENERGY,
    contextualRecall: flags.ND_RECALL,
    adhdDigests: flags.ND_DIGESTS,
  },
  
  whispers: {
    enabled: process.env.NEXT_PUBLIC_WHISPERS_ENABLED === "true",
    contextRanking: process.env.NEXT_PUBLIC_WHISPERS_CONTEXT_RANKING !== "false", // default on
    maxItems: Number(process.env.NEXT_PUBLIC_WHISPERS_MAX ?? 6),
    rankingTimeoutMs: Number(process.env.NEXT_PUBLIC_WHISPERS_RANKING_TIMEOUT_MS ?? 200),
  },
  
  dev: {
    enabled: flags.DEV_TOOLS_ENABLED,
    performanceMonitor: flags.DEV_PERFORMANCE_MONITOR && flags.DEV_TOOLS_ENABLED,
    memoryInspector: flags.DEV_MEMORY_INSPECTOR && flags.DEV_TOOLS_ENABLED,
  }
} as const

// ── Device & Environment Detection ──────────────────────────────────────────
export function isDesktop(): boolean {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(min-width: 1024px)').matches
}

export function isTablet(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(min-width: 768px) and (max-width: 1023px)').matches
}

export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 767px)').matches
}

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true
}

// ── Browser & Platform Detection ────────────────────────────────────────────
export function getBrowser(): 'chrome' | 'firefox' | 'safari' | 'edge' | 'other' {
  if (typeof window === 'undefined') return 'other'
  
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes('chrome') && !ua.includes('edge')) return 'chrome'
  if (ua.includes('firefox')) return 'firefox'
  if (ua.includes('safari') && !ua.includes('chrome')) return 'safari'
  if (ua.includes('edge')) return 'edge'
  return 'other'
}

export function getPlatform(): 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'other' {
  if (typeof window === 'undefined') return 'other'
  
  const ua = navigator.userAgent.toLowerCase()
  const platform = navigator.platform.toLowerCase()
  
  if (/iphone|ipad|ipod/.test(ua)) return 'ios'
  if (/android/.test(ua)) return 'android'
  if (/win/.test(platform)) return 'windows'
  if (/mac/.test(platform)) return 'macos'
  if (/linux/.test(platform)) return 'linux'
  return 'other'
}

// ── Feature Detection Utilities ─────────────────────────────────────────────
export const capabilities = {
  hasWebGL: (): boolean => {
    if (typeof window === 'undefined') return false
    try {
      const canvas = document.createElement('canvas')
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    } catch {
      return false
    }
  },
  
  hasWebRTC: (): boolean => {
    if (typeof window === 'undefined') return false
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  },
  
  hasNotifications: (): boolean => {
    if (typeof window === 'undefined') return false
    return 'Notification' in window
  },
  
  hasShare: (): boolean => {
    if (typeof window === 'undefined') return false
    return !!navigator.share
  },
  
  hasClipboard: (): boolean => {
    if (typeof window === 'undefined') return false
    return !!navigator.clipboard
  },
  
  hasSpeechRecognition: (): boolean => {
    if (typeof window === 'undefined') return false
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
  },
  
  hasSpeechSynthesis: (): boolean => {
    if (typeof window === 'undefined') return false
    return 'speechSynthesis' in window
  },
  
  hasVibration: (): boolean => {
    if (typeof window === 'undefined') return false
    return !!navigator.vibrate
  },
  
  hasGeolocation: (): boolean => {
    if (typeof window === 'undefined') return false
    return !!navigator.geolocation
  },
  
  hasLocalStorage: (): boolean => {
    if (typeof window === 'undefined') return false
    try {
      const test = '__storage_test__'
      window.localStorage.setItem(test, test)
      window.localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  },
  
  hasServiceWorker: (): boolean => {
    if (typeof window === 'undefined') return false
    return 'serviceWorker' in navigator
  },
  
  hasWebWorker: (): boolean => {
    if (typeof window === 'undefined') return false
    return typeof Worker !== 'undefined'
  }
}

// ── Performance & Network Detection ─────────────────────────────────────────
export function getConnectionType(): 'slow' | 'medium' | 'fast' | 'unknown' {
  if (typeof window === 'undefined') return 'unknown'
  
  const nav = navigator as any
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection
  
  if (!connection) return 'unknown'
  
  // Use effectiveType if available (4g, 3g, 2g, slow-2g)
  if (connection.effectiveType) {
    if (connection.effectiveType === '4g') return 'fast'
    if (connection.effectiveType === '3g') return 'medium'
    return 'slow'
  }
  
  // Fall back to downlink speed
  if (connection.downlink) {
    if (connection.downlink > 1.5) return 'fast'
    if (connection.downlink > 0.5) return 'medium'
    return 'slow'
  }
  
  return 'unknown'
}

export function isReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function isDarkMode(): boolean {
  if (typeof window === 'undefined') return true // Default dark for Spiralogic
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

// ── Feature Check Composer ──────────────────────────────────────────────────
export function checkFeatureSupport(requiredFeatures: Array<keyof typeof capabilities>): boolean {
  return requiredFeatures.every(feature => capabilities[feature]?.() ?? false)
}

// ── Environment Variables Helper ────────────────────────────────────────────
export function getEnvVar(key: string, defaultValue?: string): string | undefined {
  if (typeof window === 'undefined') {
    return process.env[key] || defaultValue
  }
  return (process.env[`NEXT_PUBLIC_${key}`] || defaultValue)
}

// ── Export all for convenience ──────────────────────────────────────────────
export default {
  flags,
  features,
  isDesktop,
  isTablet,
  isMobile,
  isTouchDevice,
  isStandalone,
  getBrowser,
  getPlatform,
  capabilities,
  getConnectionType,
  isReducedMotion,
  isDarkMode,
  checkFeatureSupport,
  getEnvVar
}