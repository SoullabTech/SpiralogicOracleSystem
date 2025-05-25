import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  value: string;
  setValue: (name: string) => void;
  onNext: () => void;
}

export default function NameStep({ value, setValue, onNext }: Props) {
  const [touched, setTouched] = useState(false);
  const isValid = value.trim().length >= 2;

  const handleNext = () => {
    if (isValid) onNext();
    else setTouched(true);
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-screen text-center bg-gradient-to-t from-black to-indigo-950 text-white px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <h2 className="text-3xl font-bold mb-4">🌟 Your Soul Name</h2>
      <p className="text-gray-400 mb-8 max-w-sm text-sm">
        Whisper your becoming. Your Soul Name is a vibration, a portal, a poetic signature for your spiral journey.
      </p>

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder="e.g. Liora, Cael, Solen"
        className="px-4 py-2 text-lg rounded bg-white text-black shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {touched && !isValid && (
        <p className="text-sm text-red-400 mt-2">Soul name must be at least 2 characters.</p>
      )}

      <button
        onClick={handleNext}
        disabled={!isValid}
        className={`mt-6 px-6 py-3 rounded-full font-bold transition ${
          isValid ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Next
      </button>
    </motion.div>
  );
}
