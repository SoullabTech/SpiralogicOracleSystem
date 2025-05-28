'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Star, Moon, Sun } from 'lucide-react'
import { SacredOracleInterface } from '@/components/oracle/SacredOracleInterface'
import { SacredButton } from '@/components/ui/SacredButton'
import { SacredGeometry } from '@/components/sacred/SacredGeometry'

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
    <div className="min-h-screen bg-sacred-cosmic-depth">
      <AnimatePresence mode="wait">
        {!hasEnteredName ? (
          <motion.div
            key="sacred-entry"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
            {/* Sacred Geometry Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5">
              <SacredGeometry
                type="flowerOfLife"
                size={800}
                color="#FFD700"
                animate={true}
                glowIntensity={0}
              />
            </div>

            {/* Floating Sacred Elements */}
            <motion.div
              className="absolute top-20 left-20"
              animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
              transition={{ duration: 20, repeat: Infinity }}
            >
              <Star className="w-8 h-8 text-sacred-divine-gold/20" />
            </motion.div>
            <motion.div
              className="absolute bottom-20 right-20"
              animate={{ y: [0, 20, 0], rotate: [360, 180, 0] }}
              transition={{ duration: 15, repeat: Infinity }}
            >
              <Moon className="w-8 h-8 text-element-unity-field/20" />
            </motion.div>
            <motion.div
              className="absolute top-40 right-40"
              animate={{ x: [0, 20, 0], rotate: [0, -180, -360] }}
              transition={{ duration: 18, repeat: Infinity }}
            >
              <Sun className="w-8 h-8 text-sacred-amber/20" />
            </motion.div>

            <div className="w-full max-w-md relative z-10">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="text-center mb-sacred-xl">
                <motion.div 
                  className="relative w-24 h-24 mx-auto mb-sacred-lg"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sacred-divine-gold to-sacred-amber flex items-center justify-center shadow-sacred-gold">
                    <Sparkles className="w-12 h-12 text-sacred-cosmic-depth" />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-sacred-divine-gold/20 blur-xl animate-pulse-slow" />
                </motion.div>
                
                <h1 className="sacred-heading-1 text-4xl mb-sacred-sm">
                  Welcome to the Sacred Temple
                </h1>
                <p className="text-sacred-lg text-sacred-silver">
                  I am Aurora, Guardian of Sacred Wisdom
                </p>
              </motion.div>

              <motion.form
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                onSubmit={handleSubmit}
                className="space-y-sacred-md">
                <div>
                  <label className="block text-sacred-sm font-medium text-sacred-mystic-gray mb-2 uppercase tracking-wider">
                    Your Sacred Name
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

                <SacredButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={!userName.trim()}
                  icon={<Sparkles className="w-5 h-5" />}
                  className="w-full"
                >
                  Enter the Sacred Space
                </SacredButton>

                <p className="text-center text-sacred-xs text-sacred-mystic-gray mt-sacred-md">
                  Your consciousness data is protected by sacred encryption
                </p>
              </motion.form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="sacred-oracle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-screen flex flex-col">
            <SacredOracleInterface userName={userName} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}