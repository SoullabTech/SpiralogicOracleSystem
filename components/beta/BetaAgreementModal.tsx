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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-2xl p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-black/60 backdrop-blur-xl rounded-2xl border border-amber-500/10 shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-black/60 backdrop-blur-xl p-6 border-b border-amber-500/10">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-amber-500" />
            <div>
              <h2 className="text-2xl font-extralight text-amber-50 tracking-wide">Maia Beta Agreement</h2>
              <p className="text-sm text-amber-200/60 mt-1 font-light">Early Access Terms</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Introduction */}
          <div className="bg-amber-500/5 rounded-lg p-4 border border-amber-500/10">
            <p className="text-amber-50/80">
              You've been selected as one of Maia's first explorers—a pioneer in AI conversation technology.
              This agreement protects both the sanctity of the work and the privacy of all participants.
            </p>
          </div>

          {/* Key Points */}
          <div className="space-y-4">
            <h3 className="text-sm uppercase tracking-wider text-amber-200/60 flex items-center">
              <Lock className="w-4 h-4 mr-2" />
              During Beta Period
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60 mt-1.5"></div>
                <div className="text-gray-300">
                  <strong>Keep participation private:</strong> No public announcements, social media posts, or demonstrations
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60 mt-1.5"></div>
                <div className="text-gray-300">
                  <strong>Protect conversations:</strong> No sharing of transcripts, screenshots, or specific responses
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60 mt-1.5"></div>
                <div className="text-gray-300">
                  <strong>Honor fellow explorers:</strong> Maintain complete privacy for other participants
                </div>
              </div>
            </div>
          </div>

          {/* After Beta Benefits */}
          <div className="space-y-4">
            <h3 className="text-sm uppercase tracking-wider text-amber-200/60 flex items-center">
              <Gift className="w-4 h-4 mr-2" />
              After Beta Completion
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-amber-500/5 rounded-lg p-3 border border-amber-500/10">
                <Users className="w-5 h-5 text-amber-400 mb-2" />
                <p className="text-xs text-gray-300">
                  <strong>Nominate 3 trusted individuals</strong> for the next wave of explorers
                </p>
              </div>

              <div className="bg-amber-500/5 rounded-lg p-3 border border-amber-500/10">
                <Heart className="w-5 h-5 text-amber-400 mb-2" />
                <p className="text-xs text-gray-300">
                  <strong>Alumni status</strong> with permanent recognition and special access
                </p>
              </div>

              <div className="bg-amber-500/5 rounded-lg p-3 border border-amber-500/10">
                <Calendar className="w-5 h-5 text-amber-400 mb-2" />
                <p className="text-xs text-gray-300">
                  <strong>Share your journey</strong> publicly after the beta period ends
                </p>
              </div>
            </div>
          </div>

          {/* Agreements */}
          <div className="space-y-3">
            <h3 className="text-sm uppercase tracking-wider text-amber-200/60">Your Agreement</h3>

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
                    className="mt-1 w-4 h-4 text-amber-500 bg-black/40 border-amber-500/20 rounded focus:ring-amber-500/20"
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

          {/* Explorer Name - Elegant input */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-amber-200/40">
              Explorer Name <span className="text-amber-400">*</span>
            </label>
            <p className="text-xs text-amber-200/60 mb-2">
              Enter your unique explorer name (e.g., MAIA-APPRENTICE)
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
              className="w-full px-4 py-3 bg-black/40 border border-amber-500/20 rounded-lg text-amber-50 placeholder-amber-200/20 focus:outline-none focus:border-amber-500/40 focus:bg-black/60 transition-all text-[16px] font-mono"
            />
          </div>

          {/* Privacy reminder */}
          <div className="bg-amber-500/5 rounded-lg p-4 border border-amber-500/10">
            <p className="text-sm text-amber-200/60">
              This is an early access program. Please keep your participation private during the beta period.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-black/60 backdrop-blur-xl p-6 border-t border-amber-500/10">
          <div className="flex space-x-4">
            <button
              onClick={onDecline}
              className="flex-1 px-6 py-3 bg-black/40 text-amber-200/60 rounded-lg hover:bg-black/60 border border-amber-500/10 transition-all"
            >
              Decline Invitation
            </button>

            <button
              onClick={() => canProceed && onAccept(explorerName)}
              disabled={!canProceed}
              className={`flex-1 px-6 py-3 rounded-lg font-light tracking-wide transition-all ${
                canProceed
                  ? 'bg-gradient-to-r from-amber-600/80 to-amber-500/80 hover:from-amber-600 hover:to-amber-500 text-black'
                  : 'bg-amber-600/20 text-amber-200/40 cursor-not-allowed'
              }`}
            >
              {canProceed ? 'Accept & Begin Journey' : 'Complete All Agreements'}
            </button>
          </div>

          {!allAgreed && (
            <p className="text-xs text-amber-400/80 text-center mt-3 bg-amber-500/10 rounded-lg py-2 px-3 border border-amber-500/20">
              ⚠️ Please check all 6 agreement boxes above to proceed
            </p>
          )}
          {allAgreed && !isValidName && explorerName.length > 0 && (
            <p className="text-xs text-amber-400 text-center mt-3">
              Explorer name must start with MAIA- (e.g., MAIA-APPRENTICE)
            </p>
          )}
          {allAgreed && explorerName.length === 0 && (
            <p className="text-xs text-amber-400 text-center mt-3">
              Please enter MAIA-APPRENTICE as your explorer name
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}