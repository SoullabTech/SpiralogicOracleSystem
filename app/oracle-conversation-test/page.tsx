'use client';

import React, { useState } from 'react';

// Test 1: Basic imports first
import { motion } from 'framer-motion';

// Test 2: Add Sacred Holoflower (comment out if Test 1 fails)
import { SacredHoloflower } from '@/components/sacred/SacredHoloflower';

export default function OracleConversationTest() {
  const [testResults, setTestResults] = useState<string[]>([
    '✅ Page loaded',
    '✅ React working',
    '✅ Framer Motion imported',
    '✅ SacredHoloflower imported'
  ]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
      <div className="text-white text-center max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Oracle System Debug Test</h1>

        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <h2 className="text-xl mb-4">Import Test Results:</h2>
          <div className="text-left space-y-2">
            {testResults.map((result, i) => (
              <div key={i} className="font-mono text-sm">{result}</div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <p className="text-green-400">Framer Motion is working!</p>
        </motion.div>

        <div className="w-96 h-96 mx-auto">
          <SacredHoloflower
            size={384}
            interactive={false}
            showLabels={false}
          />
        </div>

        <p className="mt-8 text-gray-400">
          If you see this and the holoflower above, the core components are working.
        </p>
      </div>
    </div>
  );
}