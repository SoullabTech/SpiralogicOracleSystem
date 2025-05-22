// components/OracleResponseCard.tsx
import { motion } from 'framer-motion'

interface OracleResponseCardProps {
  interpretation: string
  element?: string
  symbols?: string[]
}

export function OracleResponseCard({ interpretation, element, symbols }: OracleResponseCardProps) {
  return (
    <motion.div
      className="bg-white/10 p-6 rounded-2xl shadow-xl max-w-xl mx-auto mt-6 border border-white/20 backdrop-blur"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <h2 className="text-lg font-semibold text-white mb-2">✨ Oracle Insight</h2>
      <p className="text-white text-base whitespace-pre-wrap">{interpretation}</p>

      {element && (
        <div className="mt-4 text-sm text-indigo-200 italic">Element: {element}</div>
      )}

      {symbols && symbols.length > 0 && (
        <div className="mt-4 text-sm text-indigo-200">
          Symbols: {symbols.join(', ')}
        </div>
      )}
    </motion.div>
  )
}
