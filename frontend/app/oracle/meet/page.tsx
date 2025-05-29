'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Shield, Eye, Hexagon, ArrowRight } from 'lucide-react'
import { SacredOracleInterface } from '@/components/oracle/SacredOracleInterface'

export default function MeetOraclePage() {
  const [userName, setUserName] = useState('')
  const [hasEnteredName, setHasEnteredName] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (userName.trim()) {
      setHasEnteredName(true)
    }
  }

  return (
    <div className="min-h-screen bg-cosmic-depth">
      <AnimatePresence mode="wait">
        {!hasEnteredName ? (
          <motion.div
            key="sacred-entry"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }}
            className="min-h-screen flex items-center justify-center relative overflow-hidden"
          >
            {/* Sacred Geometry Background */}
            <div className="sacred-geometry-bg" />
            
            {/* Floating Sacred Elements */}
            <motion.div
              className="absolute top-20 left-20"
              animate={{ 
                y: [0, -20, 0], 
                rotate: [0, 360] 
              }}
              transition={{ 
                duration: 12, 
                repeat: Infinity, 
                ease: "linear" 
              }}
            >
              <Hexagon className="w-8 h-8 text-divine-gold/20" />
            </motion.div>
            
            <motion.div
              className="absolute bottom-20 right-20"
              animate={{ 
                y: [0, 20, 0], 
                rotate: [360, 0] 
              }}
              transition={{ 
                duration: 15, 
                repeat: Infinity, 
                ease: "linear" 
              }}
            >
              <Eye className="w-8 h-8 text-unity-field/20" />
            </motion.div>

            <div className="sacred-container max-w-md relative z-10">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  delay: 0.3, 
                  type: 'spring', 
                  stiffness: 200 
                }}
                className="text-center mb-sacred-xl"
              >
                {/* Oracle Avatar */}
                <motion.div 
                  className="relative w-24 h-24 mx-auto mb-sacred-lg"
                  animate={{ rotate: 360 }}
                  transition={{ 
                    duration: 30, 
                    repeat: Infinity, 
                    ease: 'linear' 
                  }}
                >
                  <div className="absolute inset-0 rounded-sacred bg-gradient-to-br from-divine-gold to-sacred-amber flex items-center justify-center shadow-sacred-gold">
                    <Sparkles className="w-12 h-12 text-cosmic-depth" />
                  </div>
                  <div className="absolute inset-0 rounded-sacred bg-divine-gold/20 blur-xl animate-sacred-glow" />
                </motion.div>
                
                <h1 className="sacred-heading-1 mb-sacred-sm">
                  Sacred Oracle Interface
                </h1>
                <p className="text-sacred-xl text-sacred-silver">
                  Consciousness-aware AI for executive evolution
                </p>
              </motion.div>

              <motion.form
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                onSubmit={handleSubmit}
                className="space-y-sacred-md"
              >
                <div>
                  <label className="block sacred-text-small font-medium text-mystic-gray mb-2 uppercase tracking-wider">
                    Executive Identity
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="sacred-input"
                    placeholder="How shall the Oracle address you?"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={!userName.trim()}
                  className="sacred-button w-full group"
                >
                  <span>Enter Sacred Interface</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>

                {/* Trust Indicators */}
                <div className="flex items-center justify-center gap-sacred-md text-mystic-gray pt-sacred-sm">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-divine-gold" />
                    <span className="sacred-text-small">Encrypted</span>
                  </div>
                  <div className="w-px h-3 bg-mystic-blue/40" />
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-divine-gold" />
                    <span className="sacred-text-small">Private</span>
                  </div>
                  <div className="w-px h-3 bg-mystic-blue/40" />
                  <div className="flex items-center gap-1">
                    <Hexagon className="w-3 h-3 text-divine-gold" />
                    <span className="sacred-text-small">Sacred</span>
                  </div>
                </div>
              </motion.form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="sacred-oracle"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }}
            className="h-screen flex flex-col"
          >
            <SacredOracleInterface userName={userName} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}