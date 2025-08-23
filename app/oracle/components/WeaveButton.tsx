'use client'

import { useState } from 'react'
import { btn } from '@/lib/ui/btn'

interface WeaveButtonProps {
  conversationId: string
  userId?: string
  turnCount?: number
  onWeaveComplete?: (weavedText: string) => void
  className?: string
}

export function WeaveButton({ 
  conversationId, 
  userId = 'anonymous',
  turnCount = 3,
  onWeaveComplete,
  className = ''
}: WeaveButtonProps) {
  const [isWeaving, setIsWeaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleWeave = async () => {
    if (isWeaving) return
    
    setIsWeaving(true)
    setError(null)
    
    try {
      const res = await fetch('/api/oracle/weave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          userId,
          turnCount,
        }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to weave thread')
      }
      
      if (data.text && onWeaveComplete) {
        onWeaveComplete(data.text)
      }
      
    } catch (err: any) {
      console.error('Weave error:', err)
      setError(err.message || 'Unable to weave thread at this time')
    } finally {
      setIsWeaving(false)
    }
  }
  
  return (
    <div className={`space-y-2 ${className}`}>
      <button
        onClick={handleWeave}
        disabled={isWeaving}
        className={btn({
          intent: 'outline',
          size: 'md',
          className: `
            relative overflow-hidden group
            ${isWeaving ? 'cursor-wait' : ''}
          `
        })}
      >
        {/* Background gradient animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
        
        {/* Button content */}
        <span className="relative flex items-center gap-2">
          {isWeaving ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="animate-pulse">Weaving your wisdom...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Weave a thread from this conversation
            </>
          )}
        </span>
      </button>
      
      {error && (
        <p className="text-sm text-state-red text-center animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  )
}