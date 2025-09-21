'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Download, Trash2, Heart, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface OptOutFlowProps {
  explorerId: string;
  explorerName: string;
  onClose: () => void;
  onComplete: () => void;
}

export default function OptOutFlow({ explorerId, explorerName, onClose, onComplete }: OptOutFlowProps) {
  const [step, setStep] = useState<'confirm' | 'options' | 'processing' | 'complete'>('confirm');
  const [dataChoice, setDataChoice] = useState<'download' | 'delete' | 'keep'>('keep');
  const [feedbackReason, setFeedbackReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePauseInstead = () => {
    // Set pause flag in session
    sessionStorage.setItem('betaPaused', 'true');
    sessionStorage.setItem('pausedUntil', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());
    alert('Your participation is paused for 7 days. Maya will be here when you return.');
    onClose();
  };

  const handleDataExport = async () => {
    const { data, error } = await supabase
      .from('explorer_data_export')
      .select('*')
      .eq('explorer_id', explorerId);

    if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `maya-journey-${explorerName}-${new Date().toISOString()}.json`;
      a.click();
    }
  };

  const handleDataDeletion = async () => {
    // Soft delete first (mark as deleted but keep for 30 days)
    await supabase
      .from('explorer_deletion_requests')
      .insert({
        explorer_id: explorerId,
        explorer_name: explorerName,
        reason: feedbackReason,
        data_choice: dataChoice,
        requested_at: new Date().toISOString(),
        scheduled_deletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });

    // Mark explorer as inactive
    await supabase
      .from('explorers')
      .update({ status: 'opted_out', opted_out_at: new Date().toISOString() })
      .eq('explorer_id', explorerId);
  };

  const handleProcessOptOut = async () => {
    setIsProcessing(true);
    setStep('processing');

    try {
      // Handle data based on choice
      if (dataChoice === 'download') {
        await handleDataExport();
      }

      if (dataChoice === 'delete') {
        await handleDataDeletion();
      }

      // Log opt-out for analytics (anonymized)
      await supabase.from('beta_metrics').insert({
        event_type: 'opt_out',
        week_number: Math.ceil((Date.now() - new Date(sessionStorage.getItem('signupDate') || '').getTime()) / (7 * 24 * 60 * 60 * 1000)),
        has_feedback: !!feedbackReason,
        data_choice: dataChoice,
        timestamp: new Date().toISOString()
      });

      // Clear session
      sessionStorage.clear();

      setStep('complete');
    } catch (error) {
      console.error('Opt-out processing failed:', error);
      alert('There was an issue processing your request. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-lg w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-xl font-bold">Leaving the Beta?</h2>
            </div>
            {step === 'confirm' && (
              <button onClick={onClose} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'confirm' && (
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                We understand that not every journey continues. Before you go, consider:
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Option: Take a break instead</strong><br />
                  You can pause for up to 30 days and return when ready. Your data and progress will be waiting.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handlePauseInstead}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Pause for 7 Days Instead
                </button>

                <button
                  onClick={() => setStep('options')}
                  className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  Continue with Opt-Out
                </button>

                <button
                  onClick={onClose}
                  className="w-full px-4 py-3 text-purple-600 hover:text-purple-700 transition-colors"
                >
                  Never Mind, I'll Stay
                </button>
              </div>
            </div>
          )}

          {step === 'options' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  What would you like to do with your data?
                </label>
                <div className="space-y-2">
                  <label className="flex items-start space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <input
                      type="radio"
                      name="dataChoice"
                      value="keep"
                      checked={dataChoice === 'keep'}
                      onChange={(e) => setDataChoice(e.target.value as any)}
                      className="mt-1"
                    />
                    <div>
                      <strong className="text-gray-700 dark:text-gray-300">Keep my data</strong>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Anonymized for research, helps improve Maya
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <input
                      type="radio"
                      name="dataChoice"
                      value="download"
                      checked={dataChoice === 'download'}
                      onChange={(e) => setDataChoice(e.target.value as any)}
                      className="mt-1"
                    />
                    <div>
                      <strong className="text-gray-700 dark:text-gray-300">Download my data</strong>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Get a copy of your journey before leaving
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <input
                      type="radio"
                      name="dataChoice"
                      value="delete"
                      checked={dataChoice === 'delete'}
                      onChange={(e) => setDataChoice(e.target.value as any)}
                      className="mt-1"
                    />
                    <div>
                      <strong className="text-gray-700 dark:text-gray-300">Delete everything</strong>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Permanent deletion after 30-day grace period
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Optional: Help us understand why (private, never shared)
                </label>
                <textarea
                  value={feedbackReason}
                  onChange={(e) => setFeedbackReason(e.target.value)}
                  placeholder="No pressure to answer..."
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                  rows={3}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep('confirm')}
                  className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleProcessOptOut}
                  className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                >
                  Complete Opt-Out
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-12 text-center">
              <div className="animate-pulse">
                <Trash2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Processing your request...</p>
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="space-y-4 text-center py-8">
              <Heart className="w-12 h-12 text-purple-600 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Thank you for exploring with Maya
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your contribution to this early journey matters, even if it ends here.
                </p>
              </div>

              {dataChoice === 'delete' && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 text-sm text-amber-700 dark:text-amber-300">
                  Your data will be permanently deleted in 30 days.
                  Contact support within this period to cancel deletion.
                </div>
              )}

              <button
                onClick={onComplete}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}