// pages/beta/success.tsx
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function ApplicationSuccess() {
  return (
    <>
      <Head>
        <title>Application Received | ARIA Beta</title>
      </Head>

      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="text-6xl mb-6"
          >
            ✨
          </motion.div>

          <h1 className="text-4xl font-bold mb-4">
            Application Received!
          </h1>

          <p className="text-xl text-gray-300 mb-8">
            Thank you for applying to become an Oracle Pioneer. We'll review your application within 24 hours.
          </p>

          <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 mb-8">
            <h2 className="text-2xl font-semibold mb-4">What Happens Next?</h2>
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <span className="text-purple-400">1.</span>
                <span>We review your application within 24 hours</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-400">2.</span>
                <span>You'll receive an email with your decision</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-400">3.</span>
                <span>If accepted, you'll get immediate beta access</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-400">4.</span>
                <span>Begin testing and training ARIA</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link href="/beta">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold"
              >
                Back to Beta Home
              </motion.button>
            </Link>
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 border-2 border-purple-400 rounded-lg font-semibold hover:bg-purple-400/10"
              >
                Explore Soullab
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}