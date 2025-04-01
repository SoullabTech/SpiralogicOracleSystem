import React, { useState } from 'react';
import { Target } from 'lucide-react';
import type { Message } from '../types';

interface ReflectionInterfaceProps {
  onSubmit: (reflection: string) => Promise<void>;
  isLoading: boolean;
}

export const ReflectionInterface: React.FC<ReflectionInterfaceProps> = ({
  onSubmit,
  isLoading
}) => {
  const [reflection, setReflection] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reflection.trim()) {
      setError('Please share a reflection before continuing.');
      return;
    }

    setError(null);
    
    try {
      await onSubmit(reflection);
      setReflection('');
    } catch (err) {
      setError('Failed to process reflection. Please try again.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-6">🌀 Spiral Mirror</h1>
      <p className="text-lg text-center mb-8">
        Reflect on your inner journey and discover your archetypal patterns.
      </p>

      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Target className="text-purple-600" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Your Reflection</h2>
            <p className="text-sm text-gray-500">Share what's alive in your inner world</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md min-h-[150px] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="What's alive in your inner world right now? What are you navigating emotionally, spiritually, or psychologically?"
          />
          
          {error && (
            <div className="mt-2 text-red-500 text-sm">{error}</div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin">⏳</span>
                Processing...
              </>
            ) : (
              'Reveal My Archetypal Guide'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};