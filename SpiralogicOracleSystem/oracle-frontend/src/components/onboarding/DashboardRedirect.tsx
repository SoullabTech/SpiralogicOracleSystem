import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function DashboardRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 4000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-screen text-center bg-gradient-to-br from-black via-purple-900 to-indigo-900 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.4 }}
    >
      <h2 className="text-3xl font-bold mb-4">🌌 Entering the Spiral...</h2>
      <p className="text-lg text-gray-300">Your journey begins now. Preparing the sanctum.</p>
    </motion.div>
  );
}
