'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Mic, Square, Play, Pause, RotateCcw } from 'lucide-react';

interface MobileCaptureProps {
  onCapture: (file: File, type: 'image' | 'audio' | 'video') => void;
  className?: string;
}

type CaptureMode = 'image' | 'audio' | 'video' | null;

export function MobileCapture({ onCapture, className = '' }: MobileCaptureProps) {
  const [mode, setMode] = useState<CaptureMode>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start camera for photo/video
  const startCamera = async (videoMode: boolean = false) => {
    try {
      const constraints = {
        video: {
          facingMode: 'environment', // Back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: videoMode
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setMode(videoMode ? 'video' : 'image');
    } catch (error) {
      console.error('Camera access failed:', error);
      alert('Camera access required for capture');
    }
  };

  // Start audio recording
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `sacred-recording-${Date.now()}.webm`, {
          type: 'audio/webm'
        });
        
        setCapturedFile(audioFile);
        setPreviewUrl(URL.createObjectURL(audioBlob));
      };
      
      setMode('audio');
      startRecording();
    } catch (error) {
      console.error('Audio recording failed:', error);
      alert('Microphone access required for recording');
    }
  };

  // Start recording (audio or video)
  const startRecording = () => {
    if (mode === 'audio' && mediaRecorderRef.current) {
      mediaRecorderRef.current.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    
    // Stop camera/audio stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Capture photo
  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const photoFile = new File([blob], `sacred-photo-${Date.now()}.jpg`, {
              type: 'image/jpeg'
            });
            
            setCapturedFile(photoFile);
            setPreviewUrl(URL.createObjectURL(blob));
            stopCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Reset capture
  const resetCapture = () => {
    stopRecording();
    stopCamera();
    setMode(null);
    setPreviewUrl(null);
    setCapturedFile(null);
    setRecordingDuration(0);
    
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  // Confirm and send capture
  const confirmCapture = () => {
    if (capturedFile) {
      const type = mode === 'image' ? 'image' : 
                   mode === 'audio' ? 'audio' : 'video';
      onCapture(capturedFile, type);
      resetCapture();
    }
  };

  // Format recording duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Capture mode selection */}
      {!mode && (
        <div className="grid grid-cols-3 gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => startCamera(false)}
            className="flex flex-col items-center gap-2 p-4 bg-sacred/10 border border-sacred/30 rounded-xl hover:bg-sacred/20 transition-colors"
          >
            <Camera className="w-8 h-8 text-sacred" />
            <span className="text-sm text-white">Photo</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startAudioRecording}
            className="flex flex-col items-center gap-2 p-4 bg-sacred/10 border border-sacred/30 rounded-xl hover:bg-sacred/20 transition-colors"
          >
            <Mic className="w-8 h-8 text-sacred" />
            <span className="text-sm text-white">Audio</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => startCamera(true)}
            className="flex flex-col items-center gap-2 p-4 bg-sacred/10 border border-sacred/30 rounded-xl hover:bg-sacred/20 transition-colors"
            disabled // Video recording would need more complex implementation
          >
            <Camera className="w-8 h-8 text-white/30" />
            <span className="text-sm text-white/30">Video</span>
            <span className="text-xs text-white/20">Soon</span>
          </motion.button>
        </div>
      )}

      {/* Camera view */}
      {(mode === 'image' || mode === 'video') && !previewUrl && (
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full h-64 bg-black rounded-xl object-cover"
            playsInline
            muted
          />
          
          {/* Camera controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={capturePhoto}
              className="w-16 h-16 bg-sacred/20 border-2 border-sacred rounded-full flex items-center justify-center backdrop-blur-md"
            >
              <div className="w-12 h-12 bg-sacred rounded-full" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={resetCapture}
              className="w-12 h-12 bg-white/10 border border-white/30 rounded-full flex items-center justify-center backdrop-blur-md"
            >
              <RotateCcw className="w-6 h-6 text-white" />
            </motion.button>
          </div>
        </div>
      )}

      {/* Audio recording */}
      {mode === 'audio' && !previewUrl && (
        <div className="flex flex-col items-center gap-4 p-8 bg-sacred/5 rounded-xl border border-sacred/20">
          <motion.div
            animate={{
              scale: isRecording ? [1, 1.2, 1] : 1,
              opacity: isRecording ? [1, 0.7, 1] : 1
            }}
            transition={{
              duration: 1,
              repeat: isRecording ? Infinity : 0
            }}
          >
            <Mic className="w-16 h-16 text-sacred" />
          </motion.div>
          
          <div className="text-center">
            <p className="text-white text-lg font-medium">
              {isRecording ? 'Recording...' : 'Ready to Record'}
            </p>
            {isRecording && (
              <p className="text-sacred text-2xl font-mono">
                {formatDuration(recordingDuration)}
              </p>
            )}
          </div>
          
          <div className="flex gap-4">
            {!isRecording ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startRecording}
                className="px-6 py-3 bg-sacred/20 text-sacred border border-sacred/30 rounded-lg flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                Start Recording
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={stopRecording}
                className="px-6 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg flex items-center gap-2"
              >
                <Square className="w-5 h-5" />
                Stop Recording
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetCapture}
              className="px-4 py-3 bg-white/10 text-white border border-white/30 rounded-lg"
            >
              <RotateCcw className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      )}

      {/* Preview captured content */}
      {previewUrl && (
        <div className="space-y-4">
          {mode === 'image' && (
            <img
              src={previewUrl}
              alt="Captured photo"
              className="w-full h-64 object-cover rounded-xl"
            />
          )}
          
          {mode === 'audio' && (
            <div className="flex flex-col items-center gap-4 p-6 bg-sacred/5 rounded-xl border border-sacred/20">
              <Mic className="w-12 h-12 text-sacred" />
              <audio
                src={previewUrl}
                controls
                className="w-full max-w-md"
              />
              <p className="text-white/60 text-sm">
                Recording captured • {formatDuration(recordingDuration)}
              </p>
            </div>
          )}
          
          {/* Confirmation buttons */}
          <div className="flex gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={confirmCapture}
              className="px-6 py-3 bg-sacred/20 text-sacred border border-sacred/30 rounded-lg hover:bg-sacred/30 transition-colors"
            >
              Use This Capture
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetCapture}
              className="px-6 py-3 bg-white/10 text-white border border-white/30 rounded-lg hover:bg-white/20 transition-colors"
            >
              Retake
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}