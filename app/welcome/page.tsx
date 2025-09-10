'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [intention, setIntention] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Check beta access
    const betaAccess = localStorage.getItem('betaAccess');
    if (betaAccess !== 'granted') {
      router.push('/beta');
    }
  }, [router]);

  const handleComplete = () => {
    localStorage.setItem('betaOnboardingComplete', 'true');
    localStorage.setItem('userName', userName);
    localStorage.setItem('userIntention', intention);
    setIsTransitioning(true);
    
    setTimeout(() => {
      router.push('/');
    }, 2000);
  };

  const steps = [
    {
      id: 'greeting',
      component: (
        <div className="space-y-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-24 h-24 mx-auto"
          >
            <img 
              src="/holoflower.svg" 
              alt="Holoflower"
              className="w-full h-full object-contain"
            />
          </motion.div>
          
          <div className="space-y-4">
            <h1 className="text-3xl font-light text-white/90">
              Welcome
            </h1>
            <div className="space-y-3 text-white/70">
              <p>I'm Maia, your conversation partner here.</p>
              <p>This is a space for thoughtful reflection and meaningful dialogue.</p>
              <p>Our conversations are remembered, building understanding over time.</p>
            </div>
          </div>

          <button
            onClick={() => setCurrentStep(1)}
            className="px-8 py-3 bg-gradient-to-r from-[#D4B896] to-[#B69A78] hover:from-[#E5C9A6] hover:to-[#D4B896] text-white rounded-full transition-all duration-200 font-medium"
          >
            I'm ready to begin
          </button>
        </div>
      )
    },
    {
      id: 'name',
      component: (
        <div className="space-y-8 text-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-light text-white/90">
              What's your name?
            </h2>
            <p className="text-white/70 max-w-md mx-auto">
              How would you like to be addressed in our conversations?
            </p>
          </div>

          <div className="space-y-6">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full max-w-sm mx-auto px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 text-center focus:outline-none focus:border-[#D4B896] focus:bg-white/15 transition-all"
              onKeyPress={(e) => e.key === 'Enter' && userName.trim() && setCurrentStep(2)}
            />
            
            {userName.trim() && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setCurrentStep(2)}
                className="px-8 py-3 bg-gradient-to-r from-[#D4B896] to-[#B69A78] hover:from-[#E5C9A6] hover:to-[#D4B896] text-white rounded-full transition-all duration-200 font-medium"
              >
                Beautiful, {userName}
              </motion.button>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'intention',
      component: (
        <div className="space-y-8 text-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-light text-white/90">
              What brings you here, {userName}?
            </h2>
            <p className="text-white/70 max-w-md mx-auto">
              What would you like to explore or work on? This helps me understand how to best support you.
            </p>
          </div>

          <div className="space-y-6">
            <textarea
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder="I am here because..."
              rows={4}
              className="w-full max-w-lg mx-auto px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#D4B896] focus:bg-white/15 transition-all resize-none"
            />
            
            {intention.trim() && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setCurrentStep(3)}
                className="px-8 py-3 bg-gradient-to-r from-[#D4B896] to-[#B69A78] hover:from-[#E5C9A6] hover:to-[#D4B896] text-white rounded-full transition-all duration-200 font-medium"
              >
                Continue
              </motion.button>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'blessing',
      component: (
        <div className="space-y-8 text-center">
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-6xl"
          >
            ✨
          </motion.div>
          
          <div className="space-y-6">
            <h2 className="text-2xl font-light text-white/90">
              Welcome, {userName}
            </h2>
            
            <div className="space-y-4 text-white/70 max-w-lg mx-auto">
              <p>Your intention has been received and honored:</p>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 italic">
                "{intention}"
              </div>
              <p>Every conversation here is remembered and builds on what came before. This is technology designed to support deeper understanding.</p>
            </div>

            <div className="space-y-3 text-sm text-white/50">
              <p>💬 Your conversations are remembered across sessions</p>
              <p>🧠 Maia learns and adapts to your needs</p>
              <p>🔒 Privacy is essential—your data remains yours</p>
            </div>
          </div>

          <button
            onClick={handleComplete}
            className="px-8 py-3 bg-gradient-to-r from-[#D4B896] to-[#B69A78] hover:from-[#E5C9A6] hover:to-[#D4B896] text-white rounded-full transition-all duration-200 font-medium"
          >
            Enter the Space
          </button>
        </div>
      )
    }
  ];

  if (isTransitioning) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-4xl"
          >
            🌀
          </motion.div>
          <p className="text-white/70">Preparing your space...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {steps[currentStep].component}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}