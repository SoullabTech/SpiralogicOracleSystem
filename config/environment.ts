/**
 * Centralized environment configuration
 * Replaces all hardcoded localhost URLs and provides type-safe access to env variables
 */

const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

export const config = {
  // API Endpoints
  api: {
    base: process.env.NEXT_PUBLIC_API_URL || (isDevelopment ? 'http://localhost:3000' : ''),
    backend: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3002',
    maya: process.env.NEXT_PUBLIC_MAYA_URL || 'http://localhost:3002/api/maya',
    sesame: process.env.NEXT_PUBLIC_SESAME_URL || 'http://localhost:3003',
    runpod: process.env.NEXT_PUBLIC_RUNPOD_URL || 'https://api.runpod.ai/v2',
  },

  // Supabase
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // External Services
  services: {
    elevenlabs: {
      apiKey: process.env.ELEVENLABS_API_KEY,
      voiceId: process.env.ELEVENLABS_VOICE_ID || 'vWlhP1h0TsOekU0PdWni',
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
    },
    runpod: {
      apiKey: process.env.RUNPOD_API_KEY,
      endpointId: process.env.RUNPOD_ENDPOINT_ID,
    },
    huggingface: {
      apiKey: process.env.HUGGINGFACE_API_KEY,
    },
  },

  // Feature Flags
  features: {
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    voiceEnabled: process.env.NEXT_PUBLIC_VOICE_ENABLED !== 'false',
    betaMode: process.env.NEXT_PUBLIC_BETA_MODE === 'true',
    debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
    reflectionDebug: process.env.REFLECTION_DEBUG === 'true',
    sesameCI: process.env.SESAME_CI_ENABLED === 'true',
  },

  // Performance
  performance: {
    apiTimeout: parseInt(process.env.API_TIMEOUT || '30000'),
    voiceTimeout: parseInt(process.env.VOICE_TIMEOUT || '60000'),
    maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
    chunkSize: parseInt(process.env.CHUNK_SIZE || '1024'),
  },

  // Deployment
  deployment: {
    environment: process.env.NODE_ENV || 'development',
    isDevelopment,
    isProduction,
    vercelUrl: process.env.VERCEL_URL,
    publicUrl: process.env.NEXT_PUBLIC_URL || (isDevelopment ? 'http://localhost:3000' : ''),
  },
}

// Type-safe config getter with fallback
export function getConfig<T extends keyof typeof config>(
  section: T
): typeof config[T] {
  return config[section]
}

// Validate required environment variables
export function validateEnvironment(): { valid: boolean; missing: string[] } {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    console.warn('[Config] Missing required environment variables:', missing)
  }

  return {
    valid: missing.length === 0,
    missing,
  }
}

// Helper to get API URL with proper base
export function getApiUrl(path: string): string {
  const base = config.api.base.replace(/\/$/, '')
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${cleanPath}`
}

// Helper to get backend URL
export function getBackendUrl(path: string): string {
  const base = config.api.backend.replace(/\/$/, '')
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${cleanPath}`
}

export default config