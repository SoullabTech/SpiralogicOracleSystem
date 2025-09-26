'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Holoflower } from '@/components/ui/Holoflower'

export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-6">
          <Holoflower size="lg" glowIntensity="high" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <h2 className="text-xl font-light text-amber-50">
            Loading Soullab
          </h2>
          <p className="text-sm text-amber-200/60">
            Preparing your space...
          </p>
        </motion.div>

        <motion.div
          className="flex justify-center space-x-1 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -10, 0],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
              className="w-2 h-2 bg-gold-divine rounded-full"
            />
          ))}
        </motion.div>

        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="mt-8"
        >
          <Sparkles className="w-6 h-6 text-gold-divine mx-auto opacity-60" />
        </motion.div>
      </div>
    </div>
  )
}