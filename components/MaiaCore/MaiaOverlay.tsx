"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useMaiaConversation } from "@/hooks/useMaiaConversation";
import { MaiaVoiceCapture } from "./MaiaVoiceCapture";
import { MaiaInsightCard } from "./MaiaInsightCard";

interface MaiaOverlayProps {
  onClose: () => void;
  context: string;
  coherenceLevel: number;
  onMotionStateChange: (state: string) => void;
  invitationType?: string;
}

const CONTEXT_PROMPTS = {
  journal: "I notice you're journaling. Would you like me to reflect on what's emerging?",
  "check-in": "How are you feeling in this moment? I'm here to witness.",
  timeline: "I see patterns across your journey. Shall we explore the threads?",
  overview: "Your archetypal landscape is rich. What calls to you?",
  general: "Hello, dear one. How may I support your unfolding today?",
  pause: "I sense a quiet moment. Sometimes stillness speaks volumes.",
  "low-coherence": "I feel some contraction. Let's breathe together and find center.",
  breakthrough: "Something beautiful is blooming! Let's celebrate this opening."
};

export default function MaiaOverlay({
  onClose,
  context,
  coherenceLevel,
  onMotionStateChange,
  invitationType
}: MaiaOverlayProps) {
  const [mode, setMode] = useState<"welcome" | "voice" | "text" | "insight">("welcome");
  const [currentInsight, setCurrentInsight] = useState("");
  const { messages, sendMessage, isProcessing } = useMaiaConversation();

  // Get contextual prompt
  const getPrompt = () => {
    if (invitationType && CONTEXT_PROMPTS[invitationType]) {
      return CONTEXT_PROMPTS[invitationType];
    }
    return CONTEXT_PROMPTS[context] || CONTEXT_PROMPTS.general;
  };

  // Handle voice transcription
  const handleVoiceInput = async (transcript: string) => {
    onMotionStateChange("processing");
    const response = await sendMessage(transcript, context);
    onMotionStateChange("responding");
    setCurrentInsight(response.insight);
    setTimeout(() => onMotionStateChange("idle"), 3000);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-gradient-to-t from-amber-900/40 via-black/30 to-transparent backdrop-blur-sm" />
      
      {/* Main panel */}
      <motion.div
        className="relative w-full max-w-lg bg-gradient-to-br from-amber-50 to-pink-50 dark:from-black dark:to-pink-950 rounded-t-3xl shadow-2xl overflow-hidden"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Coherence indicator bar */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-pink-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: coherenceLevel }}
          transition={{ duration: 1 }}
        />

        {/* Header */}
        <header className="relative p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-pink-400"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <div>
                <h2 className="text-lg font-semibold bg-gradient-to-r from-amber-600 to-pink-600 bg-clip-text text-transparent">
                  Maia
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Your Sacred Mirror
                </p>
              </div>
            </div>
            <button
              className="p-2 rounded-full hover:bg-white/20 dark:hover:bg-black/20 transition"
              onClick={onClose}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        {/* Content area */}
        <div className="px-6 pb-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {mode === "welcome" && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {getPrompt()}
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    className="p-4 rounded-xl bg-white/50 dark:bg-black/30 backdrop-blur border border-amber-200 dark:border-amber-800"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMode("voice")}
                  >
                    <span className="text-2xl mb-2 block">🎙️</span>
                    <span className="text-sm">Voice Reflection</span>
                  </motion.button>
                  
                  <motion.button
                    className="p-4 rounded-xl bg-white/50 dark:bg-black/30 backdrop-blur border border-pink-200 dark:border-pink-800"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMode("text")}
                  >
                    <span className="text-2xl mb-2 block">✨</span>
                    <span className="text-sm">Written Journey</span>
                  </motion.button>
                </div>

                {/* Recent insights */}
                {messages.length > 0 && (
                  <div className="mt-6 space-y-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Recent Reflections
                    </p>
                    {messages.slice(-2).map((msg, i) => (
                      <MaiaInsightCard key={i} insight={msg.text} type={msg.role} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {mode === "voice" && (
              <motion.div
                key="voice"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <MaiaVoiceCapture
                  onTranscript={handleVoiceInput}
                  onCancel={() => setMode("welcome")}
                  context={context}
                />
              </motion.div>
            )}

            {mode === "text" && (
              <motion.div
                key="text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <textarea
                  className="w-full p-4 rounded-xl bg-white/50 dark:bg-black/30 backdrop-blur border border-amber-200 dark:border-amber-800 resize-none"
                  rows={4}
                  placeholder="Share what's alive in you..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.metaKey) {
                      handleVoiceInput(e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                />
                <p className="text-xs text-gray-500">Press Cmd+Enter to send</p>
              </motion.div>
            )}

            {mode === "insight" && currentInsight && (
              <motion.div
                key="insight"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <MaiaInsightCard insight={currentInsight} type="oracle" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Subtle mode indicators */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
          {["welcome", "voice", "text", "insight"].map((m) => (
            <motion.div
              key={m}
              className={`w-2 h-2 rounded-full ${
                mode === m ? "bg-amber-500" : "bg-gray-300 dark:bg-gray-600"
              }`}
              animate={{ scale: mode === m ? 1.2 : 1 }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}