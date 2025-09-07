'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Library, Sparkles, X } from 'lucide-react';
import { SacredHoloflowerWithOfferings } from '@/components/sacred/SacredHoloflowerWithOfferings';
import { SacredUpload } from '@/components/sacred/SacredUpload';
import { SacredLibrary } from '@/components/sacred/SacredLibrary';
import { MobileCapture } from '@/components/sacred/MobileCapture';
import { OracleConversation } from '@/components/OracleConversation';
import { SacredMicButton } from '@/components/sacred/SacredMicButton';
import { SacredAudioSystem } from '@/components/audio/SacredAudioSystem';
import { useSacredStore } from '@/lib/state/sacred-store';

export default function SacredPortal() {
  const [showUpload, setShowUpload] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showMobileCapture, setShowMobileCapture] = useState(false);
  const [offerings, setOfferings] = useState<any[]>([]);
  const holoflowerRef = useRef<any>(null);
  
  const { 
    voice,
    motion, 
    aether,
    session 
  } = useSacredStore();

  // Handle successful upload/capture
  const handleOfferingComplete = (document: any) => {
    console.log('New offering:', document);
    
    // Add to offerings state (triggers Holoflower update)
    setOfferings(prev => [...prev, {
      id: document.id || `temp_${Date.now()}`,
      title: document.file?.name || document.title || 'Sacred Offering',
      element: document.resonance?.element || 'Fire',
      aetherDetected: document.resonance?.hasAether || false,
      coherence: document.resonance?.coherence || 0.7
    }]);
    
    // Close upload interfaces
    setShowUpload(false);
    setShowMobileCapture(false);
    
    // Optional: Trigger celebration animation
    setTimeout(() => {
      // Could add celebration effects here
    }, 1000);
  };

  // Handle file capture from mobile
  const handleMobileCapture = (file: File, type: 'image' | 'audio' | 'video') => {
    console.log('Mobile capture:', file, type);
    
    // Process the file through the upload system
    // This would typically call the document analysis pipeline
    const mockAnalysis = {
      id: `capture_${Date.now()}`,
      title: file.name,
      element: type === 'image' ? 'Earth' : 'Air', // Simple mapping
      resonance: {
        element: type === 'image' ? 'Earth' : 'Air',
        coherence: 0.8,
        hasAether: false
      }
    };
    
    handleOfferingComplete(mockAnalysis);
  };

  return (
    <div className="h-screen bg-black overflow-hidden relative">
      {/* Sacred Holoflower with Offerings */}
      <SacredHoloflowerWithOfferings
        ref={holoflowerRef}
        offerings={offerings}
        onOfferingClick={(offering) => console.log('Clicked offering:', offering)}
        className="absolute inset-0"
      />
      
      {/* Oracle Conversation Overlay */}
      <div className="absolute bottom-20 left-0 right-0 z-10">
        <OracleConversation 
          layout="overlay"
          showHistory={false}
          maxMessages={3}
          className="mx-4"
        />
      </div>
      
      {/* Sacred Voice Button */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <SacredMicButton 
          position="center"
          size="lg"
          pulseWhenListening={true}
        />
      </div>
      
      {/* Top UI Controls */}
      <div className="absolute top-6 right-6 z-30 flex gap-3">
        {/* Upload Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowUpload(!showUpload)}
          className={`p-3 rounded-full border backdrop-blur-md transition-all ${
            showUpload 
              ? 'bg-sacred/20 border-sacred/40 text-sacred' 
              : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
          }`}
        >
          <Upload className="w-6 h-6" />
        </motion.button>
        
        {/* Library Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowLibrary(!showLibrary)}
          className={`p-3 rounded-full border backdrop-blur-md transition-all ${
            showLibrary 
              ? 'bg-sacred/20 border-sacred/40 text-sacred' 
              : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
          }`}
        >
          <Library className="w-6 h-6" />
        </motion.button>
      </div>
      
      {/* Session State Indicator */}
      {motion.coherence > 0.7 && (
        <div className="absolute top-6 left-6 z-30">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity 
            }}
            className="flex items-center gap-2 px-4 py-2 bg-sacred/20 border border-sacred/40 rounded-full backdrop-blur-md"
          >
            <Sparkles className="w-5 h-5 text-sacred" />
            <span className="text-sacred text-sm">
              {aether.active ? `Aether Stage ${aether.stage}` : 'High Coherence'}
            </span>
          </motion.div>
        </div>
      )}

      {/* Upload Panel */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-0 right-0 w-96 h-full bg-black/80 backdrop-blur-md border-l border-white/20 z-40 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-light text-white">Sacred Offerings</h2>
                <button
                  onClick={() => setShowUpload(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Mobile capture option */}
              <div className="mb-6">
                <button
                  onClick={() => setShowMobileCapture(!showMobileCapture)}
                  className="w-full p-4 bg-sacred/10 border border-sacred/30 rounded-xl text-white hover:bg-sacred/20 transition-colors"
                >
                  {showMobileCapture ? 'Hide Capture' : 'Capture with Device'}
                </button>
              </div>
              
              {/* Mobile Capture Interface */}
              <AnimatePresence>
                {showMobileCapture && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6"
                  >
                    <MobileCapture 
                      onCapture={handleMobileCapture}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Sacred Upload Component */}
              <SacredUpload 
                onOfferingComplete={handleOfferingComplete}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Library Panel */}
      <AnimatePresence>
        {showLibrary && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="absolute top-0 left-0 w-96 h-full bg-black/80 backdrop-blur-md border-r border-white/20 z-40 overflow-y-auto"
          >
            <div className="p-6">
              <SacredLibrary 
                onCardClick={(doc) => console.log('Library card clicked:', doc)}
                onClose={() => setShowLibrary(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio System */}
      <SacredAudioSystem />
      
      {/* Sacred Portal Blessing */}
      {aether.active && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: `radial-gradient(circle at 50% 50%, rgba(230, 213, 255, 0.1) 0%, transparent 50%)`
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}
    </div>
  );
}