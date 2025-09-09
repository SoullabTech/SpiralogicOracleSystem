'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMessageSquare, FiStar, FiHeart, FiActivity } from 'react-icons/fi';

export default function BetaAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-stone-600">Loading sacred analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-light text-stone-800">
            Beta <span className="bg-gradient-to-r from-amber-600 to-emerald-600 bg-clip-text text-transparent font-medium">Analytics</span>
          </h1>
          <p className="text-stone-600">Sacred insights from the Anamnesis Field beta</p>
        </div>

        {/* Coming Soon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur rounded-xl p-12 shadow-lg text-center"
        >
          <div className="w-24 h-24 bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiActivity className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-2xl font-medium text-stone-800 mb-4">
            Analytics Portal Initializing...
          </h2>
          
          <p className="text-stone-600 max-w-md mx-auto mb-8">
            Your feedback is being collected and will be visualized here soon. 
            Thank you for being part of our sacred beta experience.
          </p>
          
          <div className="flex justify-center space-x-4 text-sm text-stone-500">
            <span>• Feedback Collection Active</span>
            <span>• Memory System Online</span>
            <span>• Portal Coming Soon</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
