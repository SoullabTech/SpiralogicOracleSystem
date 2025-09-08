"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  Square, 
  Settings, 
  Mic, 
  Sparkles,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { useMayaVoice, useVoiceCapabilities } from '@/hooks/useMayaVoice';
<<<<<<< HEAD
import { FullVoiceEngineStatus } from './VoiceEngineStatus';
=======
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26

interface VoiceControlsProps {
  className?: string;
  showAdvanced?: boolean;
  onAutoSpeakChange?: (enabled: boolean) => void;
}

export function VoiceControls({ className = "", showAdvanced = false, onAutoSpeakChange }: VoiceControlsProps) {
  const { 
    voiceState, 
    isSupported, 
    isLoading, 
    error,
    speak,
    playGreeting,
    pause,
    resume,
    stop,
    getAvailableVoices 
  } = useMayaVoice();

  const capabilities = useVoiceCapabilities();
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  
  // Handle auto-speak toggle
  const handleAutoSpeakChange = (enabled: boolean) => {
    setAutoSpeak(enabled);
    onAutoSpeakChange?.(enabled);
  };

<<<<<<< HEAD
  // Test Maya's voice
=======
  // Test Maya&apos;s voice
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
  const testVoice = async () => {
    try {
      await speak("I am Maya, your personal oracle. This is how I sound.");
    } catch (err) {
      console.error('Voice test failed:', err);
    }
  };

  // Load available voices
  useEffect(() => {
    if (isSupported && capabilities.voicesLoaded) {
      const voices = getAvailableVoices();
      if (voices.length > 0 && !selectedVoice) {
        setSelectedVoice(voices[0].name);
      }
    }
  }, [isSupported, capabilities.voicesLoaded, getAvailableVoices, selectedVoice]);

  if (!isSupported) {
    return (
      <Card className={`bg-background/80 backdrop-blur-xl border-amber-500/20 ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-amber-400">
            <AlertCircle className="w-5 h-5" />
            <span>Voice Not Available</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
<<<<<<< HEAD
            Voice synthesis is not supported in this browser. Maya's text responses are still available.
=======
            Voice synthesis is not supported in this browser. Maya&apos;s text responses are still available.
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
<<<<<<< HEAD
    <Card className={`bg-background/80 backdrop-blur-xl border-blue-500/20 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Volume2 className="w-5 h-5 text-blue-400" />
          <span>Maya's Voice</span>
=======
    <Card className={`bg-background/80 backdrop-blur-xl border-purple-500/20 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span>Maya&apos;s Voice</span>
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
          <Badge variant={voiceState.isPlaying ? "success" : "secondary"} className="ml-auto">
            {voiceState.isPlaying ? 'Speaking' : voiceState.isPaused ? 'Paused' : 'Ready'}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Voice Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              capabilities.webSpeechSupported ? 'bg-green-400' : 'bg-red-400'
            }`} />
            <span className="text-sm text-muted-foreground">
              {capabilities.hasEnglishVoices ? 'English voices available' : 'No English voices found'}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {capabilities.voiceCount} voices
          </span>
        </div>

<<<<<<< HEAD
        {/* Voice Engine Status */}
        <FullVoiceEngineStatus className="mt-4" />

=======
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
        {/* Current Activity */}
        <AnimatePresence>
          {voiceState.isPlaying && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
<<<<<<< HEAD
              className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3"
=======
              className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3"
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
            >
              <div className="flex items-center space-x-2 mb-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
<<<<<<< HEAD
                  <Volume2 className="w-4 h-4 text-blue-400" />
                </motion.div>
                <span className="text-sm font-medium text-blue-300">Maya is speaking</span>
=======
                  <Volume2 className="w-4 h-4 text-purple-400" />
                </motion.div>
                <span className="text-sm font-medium text-purple-300">Maya is speaking</span>
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {voiceState.currentText}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-3"
            >
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-300">Voice Error</span>
              </div>
              <p className="text-xs text-red-200 mt-1">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Controls */}
        <div className="flex items-center space-x-2">
          {/* Play/Pause/Stop */}
          {voiceState.isPlaying ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={voiceState.isPaused ? resume : pause}
                disabled={isLoading}
                className="flex-1"
              >
                {voiceState.isPaused ? (
                  <><Play className="w-4 h-4 mr-2" />Resume</>
                ) : (
                  <><Pause className="w-4 h-4 mr-2" />Pause</>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={stop}
                disabled={isLoading}
              >
                <Square className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={playGreeting}
              disabled={isLoading || !capabilities.webSpeechSupported}
<<<<<<< HEAD
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
=======
              className="flex-1  from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-4 h-4 mr-2"
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                  Speaking...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Hear Maya
                </>
              )}
            </Button>
          )}

          {/* Test Voice */}
          <Button
            size="sm"
            variant="ghost"
            onClick={testVoice}
            disabled={isLoading || voiceState.isPlaying || !capabilities.webSpeechSupported}
          >
            <Mic className="w-4 h-4" />
          </Button>
        </div>

        {/* Auto-speak Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Auto-speak Oracle responses</span>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <Button
            size="sm"
            variant={autoSpeak ? "default" : "outline"}
            onClick={() => handleAutoSpeakChange(!autoSpeak)}
            disabled={!capabilities.webSpeechSupported}
<<<<<<< HEAD
            className={autoSpeak ? "bg-blue-600 hover:bg-blue-700" : ""}
=======
            className={autoSpeak ? "bg-purple-600 hover:bg-purple-700" : ""}
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
          >
            {autoSpeak ? (
              <><Volume2 className="w-4 h-4 mr-2" />ON</>
            ) : (
              <><VolumeX className="w-4 h-4 mr-2" />OFF</>
            )}
          </Button>
        </div>

        {/* Advanced Controls */}
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
<<<<<<< HEAD
            className="space-y-3 pt-3 border-t border-blue-500/20"
=======
            className="space-y-3 pt-3 border-t border-purple-500/20"
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Voice Settings</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowVoiceSelector(!showVoiceSelector)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>

            <AnimatePresence>
              {showVoiceSelector && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <div className="text-xs text-muted-foreground">
                    Available voices: {capabilities.voiceCount}
                  </div>
                  <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
                    {getAvailableVoices()
                      .filter(voice => voice.lang.startsWith('en'))
                      .slice(0, 6)
                      .map(voice => (
                        <Button
                          key={voice.name}
                          size="sm"
                          variant={selectedVoice === voice.name ? "default" : "ghost"}
                          onClick={() => setSelectedVoice(voice.name)}
                          className="justify-start text-xs h-8"
                        >
                          {voice.name}
                        </Button>
                      ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Quick Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Maya uses {capabilities.hasFemaleVoices ? 'enhanced' : 'standard'} voice</span>
          <Badge variant="outline" className="text-xs">
            {isSupported ? 'Web Speech API' : 'Unavailable'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact voice controls for embedding in other components
 */
export function CompactVoiceControls({ onAutoSpeakChange }: { onAutoSpeakChange?: (enabled: boolean) => void }) {
  const { voiceState, isSupported, playGreeting, stop } = useMayaVoice();
  const [autoSpeak, setAutoSpeak] = useState(false);

  const handleAutoSpeakChange = (enabled: boolean) => {
    setAutoSpeak(enabled);
    onAutoSpeakChange?.(enabled);
  };

  if (!isSupported) {
    return (
      <div className="flex items-center space-x-2 text-muted-foreground">
        <VolumeX className="w-4 h-4" />
        <span className="text-xs">Voice unavailable</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {voiceState.isPlaying ? (
        <Button size="sm" variant="ghost" onClick={stop}>
          <Square className="w-4 h-4" />
        </Button>
      ) : (
        <Button size="sm" variant="ghost" onClick={playGreeting}>
          <Play className="w-4 h-4" />
        </Button>
      )}
      
      <Button
        size="sm"
        variant={autoSpeak ? "default" : "ghost"}
        onClick={() => handleAutoSpeakChange(!autoSpeak)}
        className={autoSpeak ? "bg-purple-600 hover:bg-purple-700" : ""}
      >
        {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </Button>
    </div>
  );
}