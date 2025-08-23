'use client'

import { useState } from 'react'
import { btn } from '@/lib/ui/btn'

interface WovenThreadProps {
  text: string
  userQuote?: string
  savedId?: string | null
  timestamp?: string
  className?: string
}

export function WovenThread({ 
  text, 
  userQuote,
  savedId,
  timestamp = new Date().toISOString(),
  className = ''
}: WovenThreadProps) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
  
  const handleShare = () => {
    // Could open a share modal or use navigator.share
    if (navigator.share) {
      navigator.share({
        title: 'Oracle Wisdom Thread',
        text: text,
      }).catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err)
        }
      })
    }
  }
  
  return (
    <div className={`bg-bg-800/60 backdrop-blur-sm rounded-xl border border-edge-700/50 shadow-lift overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-edge-700/50 bg-gradient-to-r from-gold-400/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold-400/10 border border-gold-400/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink-100">Woven Thread</h3>
              <p className="text-xs text-ink-300">
                {new Date(timestamp).toLocaleString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-2 rounded-md hover:bg-bg-700/50 transition-colors"
              title="Copy to clipboard"
            >
              {copied ? (
                <svg className="w-4 h-4 text-state-green" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.2l-3.5-3.5c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l4.19 4.19c.39.39 1.02.39 1.41 0L20.3 7.7c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0L9 16.2z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4 text-ink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              )}
            </button>
            
            {navigator.share && (
              <button
                onClick={handleShare}
                className="p-2 rounded-md hover:bg-bg-700/50 transition-colors"
                title="Share"
              >
                <svg className="w-4 h-4 text-ink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a3 3 0 10-2.684 0m2.684 0a3 3 0 01-2.684 0M6.316 10.658a3 3 0 100 2.684" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* User Quote (if available) */}
      {userQuote && (
        <div className="px-6 py-3 bg-bg-900/30 border-b border-edge-700/30">
          <p className="text-xs text-ink-300">
            <span className="opacity-60">From your words: </span>
            <span className="italic">"{userQuote}"</span>
          </p>
        </div>
      )}
      
      {/* Woven Content */}
      <div className="px-6 py-6">
        <div className="prose prose-sm max-w-none">
          <p className="text-ink-100 leading-relaxed whitespace-pre-wrap text-[15px]">
            {text}
          </p>
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-6 py-3 bg-bg-900/20 border-t border-edge-700/30">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4 text-ink-300">
            {savedId && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 text-gold-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                </svg>
                Saved to Soul Memory
              </span>
            )}
            <span className="flex items-center gap-1 opacity-60">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Thread woven from conversation
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}