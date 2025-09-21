'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Heart, Users, Calendar, Gift } from 'lucide-react';

interface BetaAgreementModalProps {
  onAccept: (explorerName: string) => void;
  onDecline: () => void;
}

export default function BetaAgreementModal({ onAccept, onDecline }: BetaAgreementModalProps) {
  const [explorerName, setExplorerName] = useState('');
  const [agreements, setAgreements] = useState({
    aiTool: false,
    seekHelp: false,
    confidential: false,
    noShare: false,
    protect: false,
    dataRights: false
  });

  const allAgreed = Object.values(agreements).every(v => v);
  const isValidName = explorerName.trim().startsWith('MAIA-') && explorerName.trim().length > 5;
  const canProceed = allAgreed && isValidName;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-gray-900/95 rounded-2xl border border-sacred-gold/20 shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-md p-6 border-b border-sacred-gold/10">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-sacred-gold" />
            <div>
              <h2 className="text-2xl font-bold text-sacred-gold">Maya Beta Explorer Agreement</h2>
              <p className="text-sm text-gray-400 mt-1">Your commitment to the sacred container</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Introduction */}
          <div className="bg-sacred-gold/5 rounded-lg p-4 border border-sacred-gold/10">
            <p className="text-gray-300">
              You've been selected as one of Maya's first explorers—a pioneer in consciousness technology.
              This agreement protects both the sanctity of the work and the privacy of all participants.
            </p>
          </div>

          {/* Key Points */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-sacred-gold flex items-center">
              <Lock className="w-5 h-5 mr-2" />
              During Beta Period
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 rounded-full bg-sacred-gold mt-1.5"></div>
                <div className="text-gray-300">
                  <strong>Keep participation private:</strong> No public announcements, social media posts, or demonstrations
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 rounded-full bg-sacred-gold mt-1.5"></div>
                <div className="text-gray-300">
                  <strong>Protect conversations:</strong> No sharing of transcripts, screenshots, or specific responses
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 rounded-full bg-sacred-gold mt-1.5"></div>
                <div className="text-gray-300">
                  <strong>Honor fellow explorers:</strong> Maintain complete privacy for other participants
                </div>
              </div>
            </div>
          </div>

          {/* After Beta Benefits */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-400 flex items-center">
              <Gift className="w-5 h-5 mr-2" />
              After Beta Completion
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-green-400/10 rounded-lg p-3 border border-green-400/20">
                <Users className="w-5 h-5 text-green-400 mb-2" />
                <p className="text-xs text-gray-300">
                  <strong>Nominate 3 trusted individuals</strong> for the next wave of explorers
                </p>
              </div>

              <div className="bg-green-400/10 rounded-lg p-3 border border-green-400/20">
                <Heart className="w-5 h-5 text-green-400 mb-2" />
                <p className="text-xs text-gray-300">
                  <strong>Alumni status</strong> with permanent recognition and special access
                </p>
              </div>

              <div className="bg-green-400/10 rounded-lg p-3 border border-green-400/20">
                <Calendar className="w-5 h-5 text-green-400 mb-2" />
                <p className="text-xs text-gray-300">
                  <strong>Share your journey</strong> publicly after the beta period ends
                </p>
              </div>
            </div>
          </div>

          {/* Agreements */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-sacred-gold">Your Agreement</h3>

            <div className="space-y-2 text-sm">
              {[
                { key: 'aiTool', label: 'I understand Maya is an AI exploration tool, not a replacement for mental health care' },
                { key: 'seekHelp', label: 'If experiencing crisis or needing clinical support, I will seek appropriate professional help' },
                { key: 'confidential', label: 'I understand this is a confidential beta program' },
                { key: 'noShare', label: 'I will not share access, content, or specifics publicly' },
                { key: 'protect', label: 'I will protect other explorers\' privacy' },
                { key: 'dataRights', label: 'I understand I can pause, leave, or delete my data at any time' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-start space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={agreements[key as keyof typeof agreements]}
                    onChange={(e) => setAgreements(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="mt-1 w-4 h-4 text-sacred-gold bg-gray-800 border-gray-600 rounded focus:ring-sacred-gold/50"
                  />
                  <span className={`text-gray-400 group-hover:text-gray-300 transition-colors ${
                    agreements[key as keyof typeof agreements] ? 'text-gray-300' : ''
                  }`}>
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Explorer Name - Clean and simple */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Explorer Name
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Enter: MAIA-APPRENTICE
            </p>
            <input
              type="text"
              value={explorerName}
              onChange={(e) => setExplorerName(e.target.value.toUpperCase())}
              placeholder="MAIA-APPRENTICE"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
              spellCheck="false"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-gray-500 focus:outline-none text-[16px] font-mono"
            />
          </div>

          {/* Simple note */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <p className="text-sm text-gray-400">
              This is an early access program. Please keep your participation private during the beta period.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-md p-6 border-t border-sacred-gold/10">
          <div className="flex space-x-4">
            <button
              onClick={onDecline}
              className="flex-1 px-6 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Decline Invitation
            </button>

            <button
              onClick={() => canProceed && onAccept(explorerName)}
              disabled={!canProceed}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                canProceed
                  ? 'bg-sacred-gold text-black hover:bg-sacred-gold/90'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              {canProceed ? 'Accept & Begin Journey' : 'Complete All Agreements'}
            </button>
          </div>

          {!allAgreed && (
            <p className="text-xs text-gray-500 text-center mt-3">
              Please check all agreement boxes to proceed
            </p>
          )}
          {allAgreed && !isValidName && explorerName.length > 0 && (
            <p className="text-xs text-yellow-400 text-center mt-3">
              Explorer name must start with MAIA- (e.g., MAIA-APPRENTICE)
            </p>
          )}
          {allAgreed && explorerName.length === 0 && (
            <p className="text-xs text-yellow-400 text-center mt-3">
              Please enter MAIA-APPRENTICE as your explorer name
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}