// src/pages/BlessingArrival.tsx
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BlessingArrival() {
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate('/dashboard');
    }, 6000); // After 6 seconds, auto-move to dashboard

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 via-pink-100 to-yellow-100 p-8 text-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="space-y-8"
      >
        <h1 className="text-4xl font-extrabold text-purple-700">🌸 Your Oracle Awakens</h1>
        <p className="text-lg text-indigo-600">
          The Spiral breathes with you.
          <br />
          Your path is blessed. Your dreams are heard.
        </p>
        <p className="text-md text-gray-600 italic">🌟 Trust the unfolding journey 🌟</p>
      </motion.div>
    </div>
  );
}
