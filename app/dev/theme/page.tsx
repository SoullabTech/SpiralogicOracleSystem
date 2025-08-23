'use client'

import { useState } from 'react'
import { btn } from '../../../lib/ui/btn'

export default function TokenPreviewPage() {
  const [showValues, setShowValues] = useState(false)

  return (
    <div className="min-h-screen bg-bg-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Dev Navigation */}
        <div className="flex justify-between items-center bg-bg-800 border border-edge-700 rounded-lg p-4">
          <div className="flex gap-4">
            <a href="/dev/theme" className="text-gold-400 font-medium">🎨 Theme Tokens</a>
            <a href="/dev/architecture" className="text-ink-300 hover:text-ink-100 transition-colors">🏗️ Architecture</a>
          </div>
          <div className="flex gap-3 text-sm">
            <a href="https://github.com/spiralogic/oracle-system/blob/main/docs/THEME.md" target="_blank" className="text-ink-300 hover:text-gold-400 transition-colors">📚 Docs</a>
            <a href="/storybook" target="_blank" className="text-ink-300 hover:text-gold-400 transition-colors">📖 Storybook</a>
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-ink-100 font-serif">
            Spiralogic Design System
          </h1>
          <p className="text-ink-300 text-lg">
            Live token preview dashboard with runtime theme switching
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowValues(!showValues)}
              className={btn({ intent: 'secondary', size: 'md' })}
            >
              {showValues ? 'Hide' : 'Show'} CSS Values
            </button>
          </div>
        </div>

        {/* Color Tokens */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-ink-100 border-b border-edge-700 pb-2">
            Color System
          </h2>
          
          {/* Background Colors */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-ink-100">Background Layers</h3>
            <div className="grid grid-cols-2 gap-4">
              <TokenCard
                name="bg-900"
                className="bg-bg-900 border-2 border-edge-700"
                showValue={showValues}
                value="Primary background - deepest layer"
              />
              <TokenCard
                name="bg-800"
                className="bg-bg-800 border-2 border-edge-700"
                showValue={showValues}
                value="Secondary background - elevated surfaces"
              />
            </div>
          </div>

          {/* Text & Border Colors */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-ink-100">Text & Borders</h3>
            <div className="grid grid-cols-4 gap-4">
              <TokenCard
                name="ink-100"
                className="bg-bg-800 text-ink-100 border border-edge-700"
                showValue={showValues}
                value="Primary text - highest contrast"
              />
              <TokenCard
                name="ink-300"
                className="bg-bg-800 text-ink-300 border border-edge-700"
                showValue={showValues}
                value="Secondary text - reduced emphasis"
              />
              <TokenCard
                name="edge-600"
                className="bg-bg-800 border-2 border-edge-600"
                showValue={showValues}
                value="Subtle borders - light emphasis"
              />
              <TokenCard
                name="edge-700"
                className="bg-bg-800 border-2 border-edge-700"
                showValue={showValues}
                value="Standard borders - default emphasis"
              />
            </div>
          </div>

          {/* Gold Accents */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-ink-100">Gold Accent System</h3>
            <div className="grid grid-cols-2 gap-4">
              <TokenCard
                name="gold-400"
                className="bg-gold-400 text-bg-900 border border-gold-400"
                showValue={showValues}
                value="Primary gold - buttons, highlights"
              />
              <TokenCard
                name="gold-500"
                className="bg-gold-500 text-bg-900 border border-gold-500"
                showValue={showValues}
                value="Gold hover state - interactive emphasis"
              />
            </div>
          </div>

          {/* State Colors */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-ink-100">State Indicators</h3>
            <div className="grid grid-cols-3 gap-4">
              <TokenCard
                name="state-green"
                className="bg-state-green text-white"
                showValue={showValues}
                value="Success states - confirmations"
              />
              <TokenCard
                name="state-amber"
                className="bg-state-amber text-bg-900"
                showValue={showValues}
                value="Warning states - caution needed"
              />
              <TokenCard
                name="state-red"
                className="bg-state-red text-white"
                showValue={showValues}
                value="Error states - immediate attention"
              />
            </div>
          </div>
        </section>

        {/* Shadow System */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-ink-100 border-b border-edge-700 pb-2">
            Shadow System
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-bg-800 rounded-xl border border-edge-700 shadow-soft">
              <h3 className="text-lg font-semibold text-ink-100 mb-2">Soft Shadow</h3>
              <p className="text-ink-300 text-sm mb-4">shadow-soft</p>
              <p className="text-ink-300 text-xs">
                Subtle depth for cards and containers
              </p>
              {showValues && (
                <code className="block mt-2 text-xs text-gold-400 bg-bg-900 p-2 rounded">
                  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)
                </code>
              )}
            </div>
            
            <div className="p-6 bg-bg-800 rounded-xl border border-edge-600 shadow-lift">
              <h3 className="text-lg font-semibold text-ink-100 mb-2">Lift Shadow</h3>
              <p className="text-ink-300 text-sm mb-4">shadow-lift</p>
              <p className="text-ink-300 text-xs">
                Elevated elements, buttons, modals
              </p>
              {showValues && (
                <code className="block mt-2 text-xs text-gold-400 bg-bg-900 p-2 rounded">
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07), 0 10px 15px rgba(0, 0, 0, 0.1)
                </code>
              )}
            </div>
          </div>
        </section>

        {/* Interactive Components */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-ink-100 border-b border-edge-700 pb-2">
            Component Examples
          </h2>
          
          {/* Button Variants */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-ink-100">Button System</h3>
            <div className="flex flex-wrap gap-4">
              <button className={btn({ intent: 'primary', size: 'sm' })}>
                Primary Small
              </button>
              <button className={btn({ intent: 'primary', size: 'md' })}>
                Primary Medium
              </button>
              <button className={btn({ intent: 'primary', size: 'lg' })}>
                Primary Large
              </button>
              <button className={btn({ intent: 'secondary', size: 'md' })}>
                Secondary
              </button>
              <button className={btn({ intent: 'outline', size: 'md' })}>
                Outline
              </button>
              <button className={btn({ intent: 'ghost', size: 'md' })}>
                Ghost
              </button>
            </div>
          </div>

          {/* Card Examples */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-ink-100">Card Components</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Basic Card */}
              <div className="p-6 bg-bg-800 border border-edge-700 rounded-xl shadow-soft">
                <h4 className="text-lg font-semibold text-ink-100 mb-2">Basic Card</h4>
                <p className="text-ink-300 text-sm mb-4">
                  Standard card with soft shadow and border
                </p>
                <button className={btn({ intent: 'outline', size: 'sm' })}>
                  Action
                </button>
              </div>

              {/* Elevated Card */}
              <div className="p-6 bg-bg-800 border border-edge-600 rounded-xl shadow-lift">
                <h4 className="text-lg font-semibold text-ink-100 mb-2">Elevated Card</h4>
                <p className="text-ink-300 text-sm mb-4">
                  Elevated card with lift shadow for importance
                </p>
                <button className={btn({ intent: 'primary', size: 'sm' })}>
                  Primary Action
                </button>
              </div>

              {/* Featured Card */}
              <div className="p-6 bg-gradient-to-br from-gold-400/10 to-gold-500/5 border border-gold-400/30 rounded-xl shadow-lift">
                <h4 className="text-lg font-semibold text-gold-400 mb-2">Featured Card</h4>
                <p className="text-ink-300 text-sm mb-4">
                  Special card with gold accent treatment
                </p>
                <button className={btn({ intent: 'primary', size: 'sm' })}>
                  Featured Action
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-ink-100 border-b border-edge-700 pb-2">
            Typography System
          </h2>
          <div className="space-y-4">
            <div className="p-6 bg-bg-800 border border-edge-700 rounded-xl">
              <h1 className="text-4xl font-bold text-ink-100 font-serif mb-2">
                Display Heading
              </h1>
              <h2 className="text-2xl font-semibold text-ink-100 mb-2">
                Section Heading
              </h2>
              <h3 className="text-lg font-medium text-ink-100 mb-4">
                Subsection Heading
              </h3>
              <p className="text-base text-ink-100 mb-2">
                Primary body text with high contrast for readability
              </p>
              <p className="text-sm text-ink-300 mb-2">
                Secondary body text with reduced emphasis
              </p>
              <p className="text-xs text-ink-300">
                Caption text for metadata and helper information
              </p>
            </div>
          </div>
        </section>

        {/* Form Elements */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-ink-100 border-b border-edge-700 pb-2">
            Form Components
          </h2>
          <div className="max-w-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-100 mb-2">
                Text Input
              </label>
              <input
                type="text"
                placeholder="Enter text here..."
                className="w-full px-3 py-2 bg-bg-800 border border-edge-700 rounded-md text-ink-100 placeholder-ink-300 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-ink-100 mb-2">
                Select Dropdown
              </label>
              <select className="w-full px-3 py-2 bg-bg-800 border border-edge-700 rounded-md text-ink-100 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent">
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-100 mb-2">
                Textarea
              </label>
              <textarea
                rows={3}
                placeholder="Enter longer text here..."
                className="w-full px-3 py-2 bg-bg-800 border border-edge-700 rounded-md text-ink-100 placeholder-ink-300 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </section>

        {/* Status Indicators */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-ink-100 border-b border-edge-700 pb-2">
            Status Indicators
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-state-green/10 border border-state-green/30 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-state-green rounded-full"></div>
                <span className="text-state-green font-medium">Success</span>
              </div>
              <p className="text-ink-300 text-sm mt-2">
                Operation completed successfully
              </p>
            </div>

            <div className="p-4 bg-state-amber/10 border border-state-amber/30 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-state-amber rounded-full"></div>
                <span className="text-state-amber font-medium">Warning</span>
              </div>
              <p className="text-ink-300 text-sm mt-2">
                Please review before proceeding
              </p>
            </div>

            <div className="p-4 bg-state-red/10 border border-state-red/30 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-state-red rounded-full"></div>
                <span className="text-state-red font-medium">Error</span>
              </div>
              <p className="text-ink-300 text-sm mt-2">
                Something went wrong
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

// Helper component for token display
function TokenCard({ 
  name, 
  className, 
  showValue, 
  value 
}: { 
  name: string
  className: string
  showValue: boolean
  value: string
}) {
  return (
    <div className={`p-4 rounded-lg ${className}`}>
      <div className="font-mono text-sm font-medium mb-1">{name}</div>
      {showValue && (
        <div className="text-xs opacity-75 mt-2">{value}</div>
      )}
    </div>
  )
}