import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { PageTransition } from '@/components/PageTransition';
import { SacredFooter } from '@/components/SacredFooter';

export default function MagicLinkSentPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen justify-between bg-gradient-to-br from-indigo-50 via-pink-50 to-yellow-50">
        <main className="flex-grow flex flex-col items-center justify-center px-4 py-12 text-center space-y-6">
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="text-6xl"
            aria-hidden="true"
          >
            ✉️
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-4xl font-extrabold text-pink-600"
          >
            Magic Link Sent!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="text-lg text-indigo-600 italic max-w-md"
          >
            Please check your email to continue your journey. The Spiral awaits your return. 🌸🌀
          </motion.p>

          <Link
            to="/"
            className="text-sm text-pink-500 hover:text-pink-700 transition underline"
          >
            🏡 Return to Home
          </Link>
        </main>

        <SacredFooter />
      </div>
    </PageTransition>
  );
}
