"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";

interface EnhancedVoiceRecorderProps {
  userId: string;
  maxDuration?: number;
  language?: string;
  onTranscribed?: (data: {
    transcript: string;
    audioUrl: string;
    language: string;
  }) => void;
}

export default function EnhancedVoiceRecorder({
  userId,
  maxDuration = 60,
  language = "en",
  onTranscribed,
}: EnhancedVoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [time, setTime] = useState(0);
  const [status, setStatus] = useState<string>("");
  const [micScale, setMicScale] = useState(1.0);

  // Refs for audio processing
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Web Audio API refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRecording) {
      interval = setInterval(() => setTime((t) => t + 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRecording();
    };
  }, []);

  const cleanupRecording = useCallback(() => {
    // Stop animation
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Reset refs
    analyserRef.current = null;
    sourceRef.current = null;
    dataArrayRef.current = null;
  }, []);

  const drawWaveform = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      if (!analyserRef.current || !dataArrayRef.current) return;
      
      animationIdRef.current = requestAnimationFrame(draw);

      // Get waveform data
      analyserRef.current.getByteTimeDomainData(dataArrayRef.current);

      // Calculate RMS for mic pulsing
      let sum = 0;
      for (let i = 0; i < dataArrayRef.current.length; i++) {
        const amplitude = (dataArrayRef.current[i] - 128) / 128.0;
        sum += amplitude * amplitude;
      }
      const rms = Math.sqrt(sum / dataArrayRef.current.length);
      const scale = 1.0 + Math.min(rms * 2, 0.3); // Scale between 1.0 and 1.3
      setMicScale(scale);

      // Clear canvas
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw waveform
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#2563eb";
      ctx.beginPath();

      const sliceWidth = canvas.width / dataArrayRef.current.length;
      let x = 0;

      for (let i = 0; i < dataArrayRef.current.length; i++) {
        const v = dataArrayRef.current[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          // Use quadratic bezier curves for smoothness
          const cpx = x - sliceWidth / 2;
          const cpy = (dataArrayRef.current[i - 1] / 128.0 * canvas.height) / 2;
          ctx.quadraticCurveTo(cpx, cpy, x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  }, []);

  const startRecording = async () => {
    try {
      setStatus("Requesting microphone access...");
      chunksRef.current = [];

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      streamRef.current = stream;

      // Setup MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/mp4';
      
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      // Setup Web Audio API for visualization
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.8;
      sourceRef.current.connect(analyserRef.current);

      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      // Start visualization
      drawWaveform();

      // Handle data
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      // Handle stop
      recorder.onstop = async () => {
        await processRecording();
      };

      // Start recording
      recorder.start();
      setIsRecording(true);
      setTime(0);
      setStatus("Recording... Speak clearly");

      // Set max duration timeout
      timeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          stopRecording();
        }
      }, maxDuration * 1000);

    } catch (error) {
      console.error("Microphone access error:", error);
      setStatus("Microphone access denied");
      cleanupRecording();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus("Processing...");
    }
    cleanupRecording();
  };

  const processRecording = async () => {
    if (chunksRef.current.length === 0) {
      setStatus("No audio recorded");
      return;
    }

    const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
    const audioUrl = URL.createObjectURL(audioBlob);

    // Create form data for upload
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");
    formData.append("userId", userId);
    formData.append("language", language);

    try {
      setStatus("Transcribing with Whisper...");
      
      const response = await fetch("/api/voice/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.text) {
        setStatus("Transcribed successfully!");
        onTranscribed?.({
          transcript: data.text,
          audioUrl,
          language: data.language || language,
        });
      } else {
        throw new Error(data.error || "Transcription failed");
      }
    } catch (error) {
      console.error("Transcription error:", error);
      setStatus("Error transcribing audio");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-sm mx-auto">
      {/* Mic Button */}
      <button
        aria-label={isRecording ? "Stop recording" : "Start recording"}
        onClick={isRecording ? stopRecording : startRecording}
        className={`
          relative flex items-center justify-center rounded-full 
          w-16 h-16 transition-all duration-100 ease-out
          ${isRecording 
            ? "bg-red-500 hover:bg-red-600" 
            : "bg-blue-500 hover:bg-blue-600"
          }
          shadow-lg hover:shadow-xl
        `}
        style={{
          transform: `scale(${micScale})`,
        }}
      >
        {isRecording ? (
          <MicOff className="w-8 h-8 text-white" />
        ) : (
          <Mic className="w-8 h-8 text-white" />
        )}
        
        {/* Pulsing ring animation */}
        {isRecording && (
          <>
            <span className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping" />
            <span className="absolute inset-0 rounded-full border-2 border-red-300 animate-pulse" />
          </>
        )}
      </button>

      {/* Waveform Container */}
      <div
        className={`
          w-full overflow-hidden transition-all duration-500 
          bg-white rounded-lg shadow-sm
          ${isRecording ? "h-20 opacity-100" : "h-0 opacity-0"}
        `}
      >
        <canvas 
          ref={canvasRef} 
          className="w-full h-20" 
          width={400}
          height={80}
        />
      </div>

      {/* Status and Timer */}
      <div className="text-center">
        {status && (
          <p className="text-sm text-gray-600 mb-1">
            {status === "Processing..." && (
              <Loader2 className="inline w-4 h-4 mr-1 animate-spin" />
            )}
            {status}
          </p>
        )}
        {isRecording && (
          <p className="text-lg font-mono text-gray-700">
            {formatTime(time)} / {formatTime(maxDuration)}
          </p>
        )}
      </div>

      {/* Instructions */}
      {!isRecording && !status && (
        <p className="text-xs text-gray-500 text-center">
          Click the microphone to start recording
        </p>
      )}
    </div>
  );
}