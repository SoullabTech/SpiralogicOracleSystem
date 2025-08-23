'use client'

import { useState } from 'react'
import { flags, features, capabilities, getPlatform, getBrowser, getConnectionType, isDarkMode, isReducedMotion } from '@/lib/config/features'
import { useDevice } from '@/hooks/useFeature'

export default function FeaturesPage() {
  const [showRaw, setShowRaw] = useState(false)
  const device = useDevice()
  
  // Check all capabilities
  const capabilityChecks = Object.entries(capabilities).map(([name, check]) => ({
    name,
    enabled: typeof window !== 'undefined' ? check() : false
  }))
  
  return (
    <div className="min-h-screen bg-bg-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Dev Navigation */}
        <div className="flex justify-between items-center bg-bg-800 border border-edge-700 rounded-lg p-4">
          <div className="flex gap-4">
            <a href="/dev/theme" className="text-ink-300 hover:text-ink-100 transition-colors">🎨 Theme Tokens</a>
            <a href="/dev/architecture" className="text-ink-300 hover:text-ink-100 transition-colors">🏗️ Architecture</a>
            <a href="/dev/features" className="text-gold-400 font-medium">🚀 Features</a>
          </div>
          <div className="flex gap-3 text-sm">
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="text-ink-300 hover:text-gold-400 transition-colors"
            >
              {showRaw ? 'Hide' : 'Show'} Raw Values
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-ink-100 font-serif">
            Feature Flags & Capabilities
          </h1>
          <p className="text-ink-300 text-lg">
            Runtime feature detection and configuration
          </p>
        </div>

        {/* Environment Info */}
        <div className="bg-bg-800 border border-edge-700 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-ink-100 mb-4">Environment</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <InfoCard label="Platform" value={getPlatform()} />
            <InfoCard label="Browser" value={getBrowser()} />
            <InfoCard label="Connection" value={getConnectionType()} />
            <InfoCard label="Color Scheme" value={isDarkMode() ? 'dark' : 'light'} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
            <InfoCard label="Desktop" value={device.isDesktop} boolean />
            <InfoCard label="Tablet" value={device.isTablet} boolean />
            <InfoCard label="Mobile" value={device.isMobile} boolean />
            <InfoCard label="Touch" value={device.isTouch} boolean />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm mt-4">
            <InfoCard label="Reduced Motion" value={isReducedMotion()} boolean />
            <InfoCard label="Node Env" value={process.env.NODE_ENV || 'production'} />
          </div>
        </div>

        {/* Feature Flags */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-ink-100 border-b border-edge-700 pb-2">
            Feature Flags
          </h2>

          {/* Library Features */}
          <FeatureSection
            title="Library"
            icon="📚"
            features={[
              { name: 'Library Enabled', value: features.library.enabled },
              { name: 'Timeline View', value: features.library.timeline },
              { name: 'Reprocessing', value: features.library.reprocess },
              { name: 'Offline Capture', value: features.library.offlineCapture },
            ]}
            showRaw={showRaw}
            rawFlags={{
              LIBRARY_ENABLED: flags.LIBRARY_ENABLED,
              LIBRARY_TIMELINE_ENABLED: flags.LIBRARY_TIMELINE_ENABLED,
              LIBRARY_REPROCESS_ENABLED: flags.LIBRARY_REPROCESS_ENABLED,
              LIBRARY_OFFLINE_CAPTURE: flags.LIBRARY_OFFLINE_CAPTURE,
            }}
          />

          {/* Oracle Features */}
          <FeatureSection
            title="Oracle"
            icon="🔮"
            features={[
              { name: 'Thread Weaving', value: features.oracle.weaveEnabled },
              { name: 'Voice Auto-Send', value: features.oracle.voiceAutoSend },
              { name: 'Multi-Modal', value: features.oracle.multiModal },
            ]}
            showRaw={showRaw}
            rawFlags={{
              ORACLE_WEAVE_ENABLED: flags.ORACLE_WEAVE_ENABLED,
              ORACLE_VOICE_AUTO_SEND: flags.ORACLE_VOICE_AUTO_SEND,
              ORACLE_MULTI_MODAL: flags.ORACLE_MULTI_MODAL,
            }}
          />

          {/* Theme Features */}
          <FeatureSection
            title="Theme"
            icon="🎨"
            features={[
              { name: 'Theme Switching', value: features.theme.switchingEnabled },
              { name: 'Theme Persistence', value: features.theme.persistEnabled },
            ]}
            showRaw={showRaw}
            rawFlags={{
              THEME_SWITCHING_ENABLED: flags.THEME_SWITCHING_ENABLED,
              THEME_PERSIST_ENABLED: flags.THEME_PERSIST_ENABLED,
            }}
          />

          {/* Beta Features */}
          <FeatureSection
            title="Beta"
            icon="🧪"
            features={[
              { name: 'Constellation View', value: features.beta.constellationView },
              { name: 'Advanced Memory', value: features.beta.advancedMemory },
              { name: 'Soul Analytics', value: features.beta.soulAnalytics },
            ]}
            showRaw={showRaw}
            rawFlags={{
              BETA_CONSTELLATION_VIEW: flags.BETA_CONSTELLATION_VIEW,
              BETA_ADVANCED_MEMORY: flags.BETA_ADVANCED_MEMORY,
              BETA_SOUL_ANALYTICS: flags.BETA_SOUL_ANALYTICS,
            }}
          />

          {/* Developer Features */}
          <FeatureSection
            title="Developer"
            icon="🔧"
            features={[
              { name: 'Dev Tools', value: features.dev.enabled },
              { name: 'Performance Monitor', value: features.dev.performanceMonitor },
              { name: 'Memory Inspector', value: features.dev.memoryInspector },
            ]}
            showRaw={showRaw}
            rawFlags={{
              DEV_TOOLS_ENABLED: flags.DEV_TOOLS_ENABLED,
              DEV_PERFORMANCE_MONITOR: flags.DEV_PERFORMANCE_MONITOR,
              DEV_MEMORY_INSPECTOR: flags.DEV_MEMORY_INSPECTOR,
            }}
          />
        </div>

        {/* Browser Capabilities */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-ink-100 border-b border-edge-700 pb-2">
            Browser Capabilities
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {capabilityChecks.map(({ name, enabled }) => (
              <CapabilityCard key={name} name={name} enabled={enabled} />
            ))}
          </div>
        </div>

        {/* Usage Examples */}
        <div className="bg-bg-800 border border-edge-700 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-ink-100">Usage Examples</h3>
          <pre className="text-xs text-ink-300 bg-bg-900 p-4 rounded overflow-x-auto">
{`// Import features
import { features } from '@/lib/config/features'
import { useFeature } from '@/hooks/useFeature'

// Direct check
if (features.oracle.weaveEnabled) {
  // Show weave button
}

// Hook with capabilities
const voice = useFeature('oracle.voiceAutoSend', {
  requireCapabilities: ['hasSpeechRecognition']
})

if (voice.isEnabled) {
  // Enable voice features
}

// Responsive features
const showTimeline = useResponsiveFeature('library.timeline', {
  desktop: true,
  tablet: true,
  mobile: false
})`}</pre>
        </div>
      </div>
    </div>
  )
}

// Helper Components
function InfoCard({ label, value, boolean = false }: { label: string; value: any; boolean?: boolean }) {
  return (
    <div className="bg-bg-900 p-3 rounded border border-edge-700">
      <div className="text-xs text-ink-300 mb-1">{label}</div>
      <div className={`text-sm font-medium ${boolean ? (value ? 'text-state-green' : 'text-state-red') : 'text-ink-100'}`}>
        {boolean ? (value ? '✓ Yes' : '✗ No') : value}
      </div>
    </div>
  )
}

function FeatureSection({ 
  title, 
  icon, 
  features, 
  showRaw, 
  rawFlags 
}: { 
  title: string
  icon: string
  features: Array<{ name: string; value: boolean }>
  showRaw: boolean
  rawFlags: Record<string, boolean>
}) {
  return (
    <div className="bg-bg-800 border border-edge-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-ink-100 mb-4 flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map(({ name, value }) => (
          <div key={name} className="flex items-center justify-between p-3 bg-bg-900 rounded">
            <span className="text-sm text-ink-100">{name}</span>
            <span className={`text-sm font-medium ${value ? 'text-state-green' : 'text-ink-300'}`}>
              {value ? '✓ Enabled' : '✗ Disabled'}
            </span>
          </div>
        ))}
      </div>
      {showRaw && (
        <div className="mt-4 p-3 bg-bg-900 rounded text-xs font-mono text-ink-300">
          {Object.entries(rawFlags).map(([key, value]) => (
            <div key={key}>
              {key}: <span className={value ? 'text-state-green' : 'text-state-red'}>{String(value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CapabilityCard({ name, enabled }: { name: string; enabled: boolean }) {
  const displayName = name.replace(/^has/, '').replace(/([A-Z])/g, ' $1').trim()
  
  return (
    <div className={`p-4 rounded-lg border ${enabled ? 'bg-bg-800 border-edge-600' : 'bg-bg-900 border-edge-700'}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink-100">{displayName}</span>
        <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-state-green' : 'bg-edge-700'}`} />
      </div>
    </div>
  )
}