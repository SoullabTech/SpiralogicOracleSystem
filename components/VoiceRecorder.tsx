'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceRecorderProps {
  userId: string;
  onTranscribed?: (data: { transcript: string; audioUrl?: string }) => void;
  maxDuration?: number; // in seconds, default 60
  autoSend?: boolean; // Auto-send after silence vs manual confirm
  silenceTimeout?: number; // Base silence detection (ms) - only used in strict mode
  minSpeechLength?: number; // Minimum speech duration before auto-send (ms)
  strictMode?: boolean; // If true, use fixed timeout; if false, use adaptive timeout
}

export default function VoiceRecorder({ 
  userId, 
  onTranscribed,
  maxDuration = 60,
  autoSend = true,
  silenceTimeout = 5000,
  minSpeechLength = 2000,
  strictMode = false // Default to adaptive mode for better UX
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [micScale, setMicScale] = useState(1);
  const [pendingTranscript, setPendingTranscript] = useState<string | null>(null);
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [autoStopReason, setAutoStopReason] = useState<string | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState<string>(''); // Track interim transcript for adaptive timeout
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeechTimeRef = useRef<number>(0);

  // Silence detection constants (Adaptive + ChatGPT-style)
  const SILENCE_THRESHOLD = 0.025; // Raised for background noise tolerance
  const MIN_RECORDING_TIME = minSpeechLength; // Configurable minimum speech length
  const MAX_RECORDING_DURATION = 60000; // 60s safety cutoff
  
  // 🧠 Adaptive Silence Timeout (Smart UX for Beta)
  const getAdaptiveTimeout = (transcriptLength: number) => {
    if (strictMode) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔧 [VoiceRecorder] Using strict mode: ${silenceTimeout}ms`);
      }
      return silenceTimeout; // Use fixed timeout in strict mode
    }
    
    // Estimate word count (rough: 5 chars per word)
    const estimatedWords = Math.max(1, Math.floor(transcriptLength / 5));
    
    let timeout;
    if (estimatedWords < 4) timeout = 2500;  // Short phrases: 2.5s (snappy)
    else if (estimatedWords < 12) timeout = 4000; // Medium: 4s (balanced)  
    else timeout = 6000; // Long thoughts: 6s (breathing room)
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🧠 [VoiceRecorder] Adaptive timeout: ${timeout}ms (${estimatedWords} words, ${transcriptLength} chars)`);
    }
    
    return timeout;
  };
  
  const ADAPTIVE_TIMEOUT = getAdaptiveTimeout(currentTranscript.length);

  // 🔥 Bulletproof silence detection (ChatGPT-style logic)
  const checkSilence = (volume: number) => {
    const now = Date.now();
    const totalRecordingTime = now - recordingStartTime;
    const timeSinceLastSpeech = now - lastSpeechTimeRef.current;
    
    if (volume > SILENCE_THRESHOLD) {
      // ✅ Speech detected - reset silence timer and update last speech time
      lastSpeechTimeRef.current = now;
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`🎤 [VoiceRecorder] Speech detected (${(volume * 100).toFixed(1)}%) - silence timer cleared`);
        }
      }
    } else if (
      isRecording && 
      !silenceTimerRef.current && 
      autoSend && 
      totalRecordingTime > MIN_RECORDING_TIME // Use total recording time, not time since speech
    ) {
      // ⏰ Start silence countdown - we have enough content and are now silent
      const timeoutToUse = ADAPTIVE_TIMEOUT;
      
      if (process.env.NODE_ENV === 'development') {
        const modeLabel = strictMode ? 'Strict' : 'Adaptive';
        const estimatedWords = Math.max(1, Math.floor(currentTranscript.length / 5));
        console.log(`🔇 [VoiceRecorder] Silence detected - starting ${timeoutToUse/1000}s countdown`);
        console.log(`   Mode: ${modeLabel} | Volume: ${(volume * 100).toFixed(1)}% | Threshold: ${(SILENCE_THRESHOLD * 100).toFixed(1)}%`);
        console.log(`   Recording: ${(totalRecordingTime/1000).toFixed(1)}s | Words: ~${estimatedWords} | Min required: ${MIN_RECORDING_TIME/1000}s`);
      }
      
      silenceTimerRef.current = setTimeout(() => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`⏹️ [VoiceRecorder] Auto-stopping after ${timeoutToUse/1000}s silence - triggering stop sequence`);
        }
        
        // 🎯 Hybrid Toast Behavior
        const isDev = process.env.NODE_ENV === 'development';
        const modeLabel = strictMode ? 'strict' : 'adaptive';
        
        setAutoStopReason(
          isDev 
            ? `Stopped after ${(timeoutToUse/1000).toFixed(1)}s ${modeLabel} silence`
            : 'Stopped after silence'
        );
        stopRecording();
      }, timeoutToUse);
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Continuous audio analysis loop (runs even when silent)
  const startAudioAnalysis = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const analyse = () => {
      if (!isRecording) {
        // Stop analysis when not recording
        return;
      }

      animationRef.current = requestAnimationFrame(analyse);
      
      // Get audio data
      analyser.getByteTimeDomainData(dataArray);

      // Calculate RMS volume (always runs - this was the bug!)
      let rms = 0;
      for (let i = 0; i < bufferLength; i++) {
        const normalized = (dataArray[i] - 128) / 128;
        rms += normalized * normalized;
      }
      rms = Math.sqrt(rms / bufferLength);
      
      // Update mic button scale based on RMS
      const scale = 1 + (rms * 0.5);
      setMicScale(Math.min(scale, 1.3));
      
      // CRITICAL: Always check silence even when volume is low
      checkSilence(rms);

      // Update debug info with enhanced diagnostics
      const now = Date.now();
      const totalRecordingTime = now - recordingStartTime;
      const timeSinceLastSpeech = now - lastSpeechTimeRef.current;
      
      setDebugInfo({
        volume: rms,
        volumePercent: (rms * 100).toFixed(1),
        threshold: SILENCE_THRESHOLD,
        thresholdPercent: (SILENCE_THRESHOLD * 100).toFixed(1),
        silenceTimerActive: !!silenceTimerRef.current,
        timeSinceLastSpeech,
        recordingDuration: totalRecordingTime,
        minRecordingMet: totalRecordingTime > MIN_RECORDING_TIME,
        autoStopCountdown: silenceTimerRef.current ? Math.max(0, ADAPTIVE_TIMEOUT - timeSinceLastSpeech) : 0,
        isSpeaking: rms > SILENCE_THRESHOLD,
        adaptiveTimeout: ADAPTIVE_TIMEOUT,
        adaptiveMode: !strictMode,
        estimatedWords: Math.max(1, Math.floor(currentTranscript.length / 5)),
        transcriptLength: currentTranscript.length
      });
    };

    analyse();
  };

  // Draw organic amoebic blob (ChatGPT-style voice visualization)
  const drawOrganicBlob = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let time = 0; // Time for organic animation

    const draw = () => {
      if (!isRecording) {
        // Draw subtle breathing animation when idle
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const baseRadius = 20;
        const breathingScale = 1 + Math.sin(time * 0.02) * 0.1;
        
        // Draw idle breathing blob
        ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * breathingScale, 0, Math.PI * 2);
        ctx.fill();
        
        time++;
        if (isRecording) requestAnimationFrame(draw);
        return;
      }

      requestAnimationFrame(draw);
      time++;
      
      analyser.getByteTimeDomainData(dataArray);

      // Calculate RMS for overall energy
      let rms = 0;
      for (let i = 0; i < bufferLength; i++) {
        const normalized = (dataArray[i] - 128) / 128;
        rms += normalized * normalized;
      }
      rms = Math.sqrt(rms / bufferLength);

      // Clear canvas with subtle background
      ctx.fillStyle = 'rgba(248, 250, 252, 0.98)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const baseRadius = 25;
      const energyRadius = baseRadius + (rms * 40);

      // Create organic blob points
      const numPoints = 12;
      const points = [];
      
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        
        // Use frequency data for organic variation
        const freqIndex = Math.floor((i / numPoints) * bufferLength);
        const freqValue = (dataArray[freqIndex] - 128) / 128;
        
        // Create organic variation with multiple sine waves
        const organicVariation = 
          Math.sin(time * 0.03 + i * 0.5) * 0.3 +
          Math.sin(time * 0.05 + i * 0.8) * 0.2 +
          Math.cos(time * 0.04 + i * 1.2) * 0.15;
        
        const radius = energyRadius * (1 + organicVariation + freqValue * 0.4);
        
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        points.push({ x, y });
      }

      // Draw smooth organic blob using cardinal splines
      ctx.fillStyle = `rgba(59, 130, 246, ${0.15 + rms * 0.3})`;
      ctx.strokeStyle = `rgba(37, 99, 235, ${0.4 + rms * 0.4})`;
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      
      // Move to first point
      ctx.moveTo(points[0].x, points[0].y);
      
      // Create smooth curves between all points
      for (let i = 0; i < points.length; i++) {
        const current = points[i];
        const next = points[(i + 1) % points.length];
        const afterNext = points[(i + 2) % points.length];
        
        // Calculate control points for smooth curves
        const cp1x = current.x + (next.x - points[(i - 1 + points.length) % points.length].x) / 6;
        const cp1y = current.y + (next.y - points[(i - 1 + points.length) % points.length].y) / 6;
        const cp2x = next.x - (afterNext.x - current.x) / 6;
        const cp2y = next.y - (afterNext.y - current.y) / 6;
        
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
      }
      
      ctx.closePath();
      ctx.fill();
      
      // Add subtle glow effect
      ctx.shadowColor = 'rgba(59, 130, 246, 0.2)';
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset shadow
      
      // Add inner sparkle effect when speaking
      if (rms > 0.05) {
        ctx.fillStyle = `rgba(255, 255, 255, ${rms * 2})`;
        ctx.beginPath();
        ctx.arc(centerX, centerY, rms * 15, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    draw();
  };

  // Start recording
  const startRecording = async () => {
    try {
      setError(null);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      
      // Setup Web Audio API for visualization
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      
      source.connect(analyser);
      analyserRef.current = analyser;
      
      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/mp4';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      // Handle data chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Handle recording stop
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await processAudio(audioBlob);
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Initialize speech detection and recording start time
      const now = Date.now();
      lastSpeechTimeRef.current = now;
      setRecordingStartTime(now);
      
      if (process.env.NODE_ENV === 'development') {
        const modeLabel = strictMode ? 'Strict' : 'Adaptive';
        console.log(`🎤 [VoiceRecorder] Started recording in ${modeLabel} mode`);
        console.log(`   Auto-send: ${autoSend} | Min speech: ${MIN_RECORDING_TIME/1000}s | Max duration: ${MAX_RECORDING_DURATION/1000}s`);
      }
      
      // Start both organic blob animation AND audio analysis
      drawOrganicBlob();
      startAudioAnalysis();
      
      // Safety fallback: auto-stop after 60s max
      safetyTimerRef.current = setTimeout(() => {
        console.warn("Safety fallback triggered — stopping recording after 60s");
        // 🎯 Hybrid Toast Behavior for Safety Timer
        const isDev = process.env.NODE_ENV === 'development';
        setAutoStopReason(
          isDev 
            ? "Stopped after 60s for safety" 
            : "Stopped after silence"
        );
        stopRecording();
      }, MAX_RECORDING_DURATION);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration - 1) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  // Stop recording (bulletproof state reset to prevent black screen bug)
  const stopRecording = async () => {
    if (process.env.NODE_ENV === 'development') {
      const recordingDuration = Date.now() - recordingStartTime;
      const estimatedWords = Math.max(1, Math.floor(currentTranscript.length / 5));
      console.log(`🛑 [VoiceRecorder] Stopping recording cleanly after ${(recordingDuration/1000).toFixed(1)}s`);
      console.log(`   Transcript length: ${currentTranscript.length} chars (~${estimatedWords} words)`);
      console.log(`   Stop reason: ${autoStopReason || 'Manual stop'}`);
    }
    
    // ✅ Always clear timers first
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // ✅ Always reset recording state (prevents black button bug)
    setIsRecording(false);
    setMicScale(1);

    // ✅ Stop audio tracks cleanly
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log('🎤 Stopped track:', track.kind);
      });
      streamRef.current = null;
    }

    // ✅ Reset audio context so next recording starts clean
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        await audioContextRef.current.close();
      } catch (err) {
        console.warn('Audio context close warning:', err);
      }
      audioContextRef.current = null;
    }
    analyserRef.current = null;

    // Clear recording timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }

    // Clear debug info
    setDebugInfo({});
    
    console.log('✅ Recording stopped cleanly with full state reset');
  };

  // Process and upload audio
  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('file', audioBlob, 'voice-note.webm');
      
      // Upload to transcription API
      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to transcribe audio');
      }
      
      const data = await response.json();
      
      if (data.success) {
        const transcript = data.transcription;
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Check if we recorded long enough
        const recordingDuration = Date.now() - recordingStartTime;
        
        if (autoSend && recordingDuration >= MIN_RECORDING_TIME) {
          // Auto-send mode: send immediately
          onTranscribed?.({
            transcript,
            audioUrl
          });
        } else if (!autoSend) {
          // Manual mode: store for manual confirmation
          setPendingTranscript(transcript);
          console.log('Transcript ready for manual send:', transcript);
        } else {
          // Recording too short, ignore
          console.log('Recording too short, ignoring:', recordingDuration, 'ms');
        }
      }
      
    } catch (err) {
      console.error('Error processing audio:', err);
      setError('Failed to transcribe audio. Please try again.');
    } finally {
      setIsProcessing(false);
      setRecordingTime(0);
    }
  };

  // Manual send function for manual mode
  const handleManualSend = () => {
    if (pendingTranscript && onTranscribed) {
      onTranscribed({
        transcript: pendingTranscript,
        audioUrl: undefined // Audio URL not needed for manual sends
      });
      setPendingTranscript(null);
    }
  };

  // Cancel pending transcript
  const handleCancelPending = () => {
    setPendingTranscript(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up timers
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (safetyTimerRef.current) {
        clearTimeout(safetyTimerRef.current);
      }
      
      // Stop media tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Stop animations
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Only close AudioContext on unmount (not on stop recording)
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Auto-clear auto-stop notification after 3 seconds
  useEffect(() => {
    if (autoStopReason) {
      const timer = setTimeout(() => {
        setAutoStopReason(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [autoStopReason]);

  // Set canvas size
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = 80;
      }
    }
  }, []);

  return (
    <div className="relative flex flex-col items-center gap-3">
      {/* Recording button with pulsing effect */}
      <div className="relative">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`
            relative flex items-center justify-center
            w-12 h-12 rounded-full transition-all duration-200
            ${isRecording 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-blue-500 hover:bg-blue-600'
            }
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
            text-white shadow-lg hover:shadow-xl
            focus:outline-none focus:ring-2 focus:ring-offset-2 
            ${isRecording ? 'focus:ring-red-500' : 'focus:ring-blue-500'}
          `}
          style={{
            transform: `scale(${micScale})`,
            transition: 'transform 100ms ease-out'
          }}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isRecording ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>
        
        {/* Pulsing ring when recording */}
        {isRecording && (
          <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20"></div>
        )}
      </div>

      {/* Waveform canvas */}
      <div className={`
        w-full max-w-xs transition-all duration-300
        ${isRecording ? 'opacity-100 h-20' : 'opacity-0 h-0'}
        overflow-hidden
      `}>
        <canvas
          ref={canvasRef}
          className="w-full h-20 bg-white rounded-lg shadow-sm"
          aria-label="Recording waveform visualization"
        />
      </div>

      {/* Recording time and status */}
      <div className="flex items-center gap-3">
        {isRecording && (
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="flex gap-1">
              <span className="w-1 h-4 bg-red-500 rounded-full animate-wave-1"></span>
              <span className="w-1 h-4 bg-red-500 rounded-full animate-wave-2"></span>
              <span className="w-1 h-4 bg-red-500 rounded-full animate-wave-3"></span>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {formatTime(recordingTime)}
            </span>
          </div>
        )}

        {isProcessing && (
          <span className="text-sm text-gray-600 animate-fade-in">
            Transcribing...
          </span>
        )}
      </div>

      {/* Manual send controls (only in manual mode with pending transcript) */}
      {!autoSend && pendingTranscript && (
        <div className="flex items-center gap-2 animate-fade-in">
          <button
            onClick={handleManualSend}
            className="px-3 py-2 bg-[#FFD700] text-black rounded-lg hover:bg-[#FFD700]/90 transition-colors font-medium text-sm"
            title="Send transcript"
          >
            ✅ Send
          </button>
          <button
            onClick={handleCancelPending}
            className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm"
            title="Cancel transcript"
          >
            ✖ Cancel
          </button>
        </div>
      )}

      {/* Status indicator */}
      {!autoSend && pendingTranscript && (
        <div className="text-sm text-[#FFD700] animate-pulse">
          Transcript ready - tap ✅ to send
        </div>
      )}

      {/* Auto-stop notification (golden toast) */}
      {autoStopReason && (
        <div className="animate-fade-in bg-[#FFD700]/90 text-black px-3 py-2 rounded-lg text-sm font-medium shadow-lg">
          ✋ {autoStopReason}
        </div>
      )}

      {/* Mode indicator */}
      <div className="text-xs text-gray-500">
        {autoSend 
          ? (strictMode 
              ? `Auto-send after ${silenceTimeout/1000}s silence (Strict)` 
              : 'Smart auto-send (Adaptive 2.5-6s)')
          : 'Manual send mode - tap ✅ to confirm'
        }
      </div>

      {/* 🔍 Enhanced Debug Overlay - Live Diagnostics */}
      {process.env.NODE_ENV === 'development' && isRecording && debugInfo.volume !== undefined && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-black/90 text-white rounded-lg text-xs font-mono shadow-lg border border-gray-600 min-w-80">
          {/* Volume Meter */}
          <div className="mb-2">
            <div className="flex justify-between text-yellow-300 font-semibold mb-1">
              <span>Volume: {debugInfo.volumePercent}%</span>
              <span>Threshold: {debugInfo.thresholdPercent}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  debugInfo.isSpeaking ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, debugInfo.volumePercent)}%` }}
              />
            </div>
          </div>

          {/* Status Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-300">Status:</span>
              <span className={debugInfo.isSpeaking ? 'text-green-400' : 'text-red-400'}>
                {debugInfo.isSpeaking ? '🎤 SPEAKING' : '🔇 SILENT'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-300">Timer:</span>
              <span className={debugInfo.silenceTimerActive ? 'text-red-400' : 'text-gray-400'}>
                {debugInfo.silenceTimerActive ? '🔴 ARMED' : '⚪ OFF'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-300">Duration:</span>
              <span className="text-blue-400">{Math.round(debugInfo.recordingDuration / 1000)}s</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-300">Min Met:</span>
              <span className={debugInfo.minRecordingMet ? 'text-green-400' : 'text-yellow-400'}>
                {debugInfo.minRecordingMet ? '✅ YES' : '⏳ NO'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-300">Last Speech:</span>
              <span className="text-purple-400">{Math.round(debugInfo.timeSinceLastSpeech / 1000)}s ago</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-300">Auto-Stop:</span>
              <span className={debugInfo.silenceTimerActive ? 'text-red-400 font-bold' : 'text-gray-400'}>
                {debugInfo.silenceTimerActive ? 
                  `${Math.max(0, Math.round(debugInfo.autoStopCountdown / 1000))}s` : 
                  '—'
                }
              </span>
            </div>
          </div>

          {/* 🚨 Live Countdown Alert */}
          {debugInfo.silenceTimerActive && (
            <div className="mt-2 p-2 bg-red-900/50 border border-red-600 rounded text-center">
              <div className="text-red-300 font-bold animate-pulse">
                ⏰ AUTO-STOP IN {Math.max(0, Math.round(debugInfo.autoStopCountdown / 1000))} SECONDS
              </div>
            </div>
          )}
          
          {/* Adaptive Mode Status */}
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div className="flex justify-between text-xs text-cyan-300 font-semibold mb-1">
              <span>Mode: {debugInfo.adaptiveMode ? '🧠 Adaptive' : '⏱️ Strict'}</span>
              <span>Timeout: {(debugInfo.adaptiveTimeout / 1000).toFixed(1)}s</span>
            </div>
            {debugInfo.adaptiveMode && (
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                <span>Est. Words: {debugInfo.estimatedWords}</span>
                <span>Chars: {debugInfo.transcriptLength}</span>
              </div>
            )}
          </div>
          
          {/* Logic Status */}
          <div className="pt-2 text-xs text-gray-400">
            Logic: {debugInfo.isSpeaking ? 'Speech clearing timer' : 
                    debugInfo.minRecordingMet ? 'Ready for silence detection' : 'Waiting for minimum duration'}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <style jsx>{`
        @keyframes wave-1 {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.5); }
        }
        
        @keyframes wave-2 {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.5); }
        }
        
        @keyframes wave-3 {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.5); }
        }
        
        .animate-wave-1 {
          animation: wave-1 1s ease-in-out infinite;
        }
        
        .animate-wave-2 {
          animation: wave-2 1s ease-in-out infinite;
          animation-delay: 0.1s;
        }
        
        .animate-wave-3 {
          animation: wave-3 1s ease-in-out infinite;
          animation-delay: 0.2s;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}