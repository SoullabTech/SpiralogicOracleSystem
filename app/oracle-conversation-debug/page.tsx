'use client';

import React from 'react';

export default function OracleConversationDebug() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-center">
        <h1 className="text-2xl mb-4">Debug Mode</h1>
        <p>Testing without complex imports to isolate ReferenceError</p>
        <div className="mt-8 p-4 border border-gray-700 rounded">
          <p>If this page loads without ReferenceError, the issue is in the imports.</p>
          <p>If it still has ReferenceError, the issue is elsewhere.</p>
        </div>
      </div>
    </div>
  );
}