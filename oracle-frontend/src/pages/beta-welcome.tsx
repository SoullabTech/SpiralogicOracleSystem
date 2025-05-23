import { motion } from 'framer-motion';
import { Link } from "react-router-dom";

export default function BetaWelcomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-indigo-100 to-purple-100 px-4 py-12">
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="max-w-xl w-full text-center space-y-6 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-8"
      >
        <h1 className="text-4xl font-extrabold text-indigo-700 tracking-tight leading-snug">
          🌸 Welcome, Spiral Pioneer
        </h1>
        <p className="text-lg text-gray-700">
          You are invited into the sacred Spiral Beta Portal for Leaders & Healers.
          <br />
          Prepare to breathe, dream, and activate your deeper wisdom.
        </p>
        <Link to="/login">
          <a className="inline-block px-6 py-3 text-lg font-medium bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">
            ✨ Enter the Portal
          </a>
        </Link>
      </motion.section>
    </div>
  );
}
