'use client';

import React, { useEffect, useState } from 'react';
import { debugEvents, getSessionSummary } from '../../utils/voiceAnalytics';

// Only show in development - privacy and security consideration
const isDevelopment = process.env.NODE_ENV === 'development';

export default function VoiceDebugOverlay() {
  const [stats, setStats] = useState(null);
  const [visible, setVisible] = useState(() => {
    // Remember toggle state between reloads
    if (typeof window !== 'undefined') {
      return localStorage.getItem('voiceDebugOverlay') === 'true';
    }
    return false;
  });

  useEffect(() => {
    // Don't render in production for privacy/security
    if (!isDevelopment) return;

    // Enable with keyboard shortcut
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.key === '`') {
        setVisible(prev => {
          const newState = !prev;
          localStorage.setItem('voiceDebugOverlay', newState.toString());
          return newState;
        });
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    const interval = setInterval(() => {
      if (visible) {
        const events = debugEvents();
        const summary = getSessionSummary();

        if (events.length > 0) {
          // Calculate recent latency trends
          const attempts = events.filter(e => e.event === 'voice_attempt_started');
          const transcripts = events.filter(e => e.event === 'voice_transcript_received');

          const recentAttempts = attempts.slice(-5).map(attempt => {
            const matchingTranscript = transcripts.find(t =>
              new Date(t.timestamp) > new Date(attempt.timestamp) &&
              new Date(t.timestamp) - new Date(attempt.timestamp) < 10000
            );

            if (matchingTranscript) {
              const latency = new Date(matchingTranscript.timestamp) - new Date(attempt.timestamp);
              return {
                id: attempts.indexOf(attempt) + 1,
                latency,
                words: matchingTranscript.wordCount || 0,
                ok: latency < 3000,
                timestamp: attempt.timestamp
              };
            }
            return { id: attempts.indexOf(attempt) + 1, ok: false, latency: 'timeout' };
          });

          setStats({
            ...summary,
            recentAttempts,
            avgLatency: recentAttempts.length > 0
              ? Math.round(recentAttempts
                  .filter(a => typeof a.latency === 'number')
                  .reduce((sum, a) => sum + a.latency, 0) / recentAttempts.filter(a => typeof a.latency === 'number').length)
              : 0
          });
        }
      }
    }, 2000);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      clearInterval(interval);
    };
  }, [visible]);

  // Don't render anything in production
  if (!isDevelopment) return null;

  // Show mini collapsed mode when hidden but has stats
  if (!visible && stats) {
    return (
      <div
        onClick={() => {
          setVisible(true);
          localStorage.setItem('voiceDebugOverlay', 'true');
        }}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: '#51cf66',
          padding: '8px',
          borderRadius: '50%',
          cursor: 'pointer',
          zIndex: 9999,
          fontSize: '16px',
          border: '1px solid #333',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(0, 0, 0, 0.9)';
          e.target.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(0, 0, 0, 0.7)';
          e.target.style.transform = 'scale(1)';
        }}
        title="Click to show Voice Debug Overlay (or Ctrl+`)"
      >
        🔍
      </div>
    );
  }

  // Don't render full overlay if no stats yet
  if (!stats) return null;

  const getLatencyColor = (latency) => {
    if (typeof latency !== 'number') return '#ff6b6b';
    if (latency < 1500) return '#51cf66';
    if (latency < 3000) return '#ffd43b';
    return '#ff6b6b';
  };

  const getLatencyStatus = (latency) => {
    if (typeof latency !== 'number') return '❌';
    if (latency < 1500) return '✅';
    if (latency < 3000) return '⚠️';
    return '❌';
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.9)',
        color: '#51cf66',
        padding: '12px',
        borderRadius: '8px',
        fontFamily: 'Monaco, Consolas, monospace',
        fontSize: '11px',
        zIndex: 9999,
        maxWidth: '300px',
        border: '1px solid #333',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span>🔍 VOICE DEBUG</span>
        <button
          onClick={() => {
            setVisible(false);
            localStorage.setItem('voiceDebugOverlay', 'false');
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#666',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ×
        </button>
      </div>

      <div style={{ borderBottom: '1px solid #333', marginBottom: '8px', paddingBottom: '4px' }}>
        <div>Attempts: {stats.voiceAttempts}</div>
        <div>Success: {stats.successfulTranscripts} ({(stats.transcriptionSuccessRate * 100).toFixed(1)}%)</div>
        <div>Responses: {stats.responsesPlayed}</div>
        <div>Fallbacks: {stats.fallbacks}</div>
      </div>

      <div style={{ borderBottom: '1px solid #333', marginBottom: '8px', paddingBottom: '4px' }}>
        <div style={{ color: getLatencyColor(stats.avgLatency) }}>
          Avg Latency: {stats.avgLatency}ms
        </div>
        <div>
          Session: {stats.sessionId.slice(-8)}
        </div>
      </div>

      <div>
        <div style={{ marginBottom: '4px', fontSize: '10px', color: '#888' }}>Recent Attempts:</div>
        {stats.recentAttempts.slice(-3).map((attempt, i) => (
          <div key={i} style={{
            fontSize: '10px',
            color: getLatencyColor(attempt.latency)
          }}>
            {getLatencyStatus(attempt.latency)} #{attempt.id}: {
              typeof attempt.latency === 'number'
                ? `${attempt.latency}ms → ${attempt.words} words`
                : 'timeout'
            }
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '8px',
        paddingTop: '4px',
        borderTop: '1px solid #333',
        fontSize: '9px',
        color: '#666'
      }}>
        Press Ctrl+` to toggle
      </div>
    </div>
  );
}