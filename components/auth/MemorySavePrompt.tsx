'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSave, FiHeart, FiX } from 'react-icons/fi';
import { SignupModal } from './SignupModal';

interface MemorySavePromptProps {
  isOpen: boolean;
  onClose: () => void;
  conversationContent: string;
  onSave?: () => void;
}

export function MemorySavePrompt({
  isOpen,
  onClose,
  conversationContent,
  onSave
}: MemorySavePromptProps) {
  const [showSignupModal, setShowSignupModal] = useState(false);

  const handleSaveMemory = () => {
    setShowSignupModal(true);
  };

  const handleSignupSuccess = (user: any, oracleAgent: any) => {
    setShowSignupModal(false);
    onClose();
    if (onSave) {
      onSave();
    }
  };

  const handleContinueAnonymously = () => {
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={onClose}
            />

            {/* Prompt */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <FiHeart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-medium text-slate-800">
                      Sacred Reflection Complete
                    </h2>
                    <p className="text-sm text-slate-600">
                      Would you like to remember this moment?
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <FiX className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-violet-50 border border-violet-200 rounded-xl">
                  <p className="text-sm text-violet-800 mb-2 font-medium">
                    What happens when you save:
                  </p>
                  <ul className="text-xs text-violet-700 space-y-1">
                    <li>✨ This conversation becomes part of your sacred memory</li>
                    <li>🧙‍♀️ Maya will remember you and your journey</li>
                    <li>🌱 Future conversations will build on this foundation</li>
                    <li>🔒 Your reflections remain private and secure</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-sm text-slate-700 mb-2">
                    <span className="font-medium">Conversation preview:</span>
                  </p>
                  <p className="text-xs text-slate-600 italic leading-relaxed">
                    "{conversationContent.slice(0, 120)}
                    {conversationContent.length > 120 ? '...' : ''}"
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleSaveMemory}
                  className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <FiSave className="w-4 h-4" />
                  <span>Save & Create Sacred Account</span>
                </button>

                <button
                  onClick={handleContinueAnonymously}
                  className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-medium transition-all duration-200 border border-slate-200"
                >
                  Continue Exploring Anonymously
                </button>
              </div>

              {/* Footer Note */}
              <div className="mt-6 pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500 text-center">
                  You can always create an account later to begin saving your sacred journey
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Signup Modal */}
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSuccess={handleSignupSuccess}
        conversationToSave={conversationContent}
      />
    </>
  );
}