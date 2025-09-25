"use client";

import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useMaiaContext } from "@/hooks/useMaiaContext";
import { useMaiaPresence } from "@/hooks/useMaiaPresence";
import MaiaOverlay from "./MaiaOverlay";

// Motion states for the living mandala
const MOTION_STATES = {
  idle: {
    scale: [1, 1.02, 1],
    rotate: [0, 5, 0],
    opacity: [0.7, 0.85, 0.7],
  },
  listening: {
    scale: [1, 1.15, 1.1],
    opacity: 1,
    transition: { duration: 0.8, repeat: Infinity, repeatType: "reverse" }
  },
  processing: {
    rotate: 360,
    scale: [1, 0.95, 1.05, 1],
    transition: { duration: 2, repeat: Infinity }
  },
  responding: {
    scale: [1, 1.2, 1],
    opacity: [0.8, 1, 0.8],
    boxShadow: [
      "0 0 20px rgba(147, 51, 234, 0.3)",
      "0 0 40px rgba(147, 51, 234, 0.6)",
      "0 0 20px rgba(147, 51, 234, 0.3)"
    ]
  },
  breakthrough: {
    scale: [1, 1.5, 1.2],
    rotate: [0, 180, 360],
    opacity: [1, 0.3, 1],
    transition: { duration: 1.5 }
  }
};

// Coherence-based color gradients
const getCoherenceGradient = (level: number) => {
  if (level < 0.3) return "from-red-500 to-orange-500";
  if (level < 0.5) return "from-orange-500 to-yellow-500";
  if (level < 0.7) return "from-yellow-500 to-green-500";
  if (level < 0.9) return "from-green-500 to-blue-500";
  return "from-blue-500 to-amber-500";
};

export default function HoloflowerNode() {
  const [isOpen, setIsOpen] = useState(false);
  const [motionState, setMotionState] = useState<keyof typeof MOTION_STATES>("idle");
  const [coherenceLevel, setCoherenceLevel] = useState(0.7);
  const [touchStart, setTouchStart] = useState(0);
  const controls = useAnimation();
  const nodeRef = useRef<HTMLDivElement>(null);
  
  const { context, activity } = useMaiaContext();
  const { shouldInvite, invitationType } = useMaiaPresence();

  // Subtle glow when invitation is available
  useEffect(() => {
    if (shouldInvite && !isOpen) {
      controls.start({
        boxShadow: [
          "0 0 20px rgba(236, 72, 153, 0.3)",
          "0 0 40px rgba(236, 72, 153, 0.6)",
          "0 0 20px rgba(236, 72, 153, 0.3)"
        ],
        transition: { duration: 2, repeat: 3 }
      });
    }
  }, [shouldInvite, isOpen, controls]);

  // Handle long press for voice mode
  const handleTouchStart = () => {
    setTouchStart(Date.now());
  };

  const handleTouchEnd = () => {
    const duration = Date.now() - touchStart;
    if (duration > 500) {
      // Long press - activate voice mode
      setMotionState("listening");
      // TODO: Initialize voice capture
    } else {
      // Short tap - open overlay
      setIsOpen(true);
    }
  };

  // Keyboard shortcut (Cmd+Space or Ctrl+Space)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === " ") {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isOpen]);

  return (
    <>
      <motion.div
        ref={nodeRef}
        className={`fixed bottom-6 right-6 z-40 rounded-full p-1 cursor-pointer select-none ${
          getCoherenceGradient(coherenceLevel)
        } bg-gradient-to-r shadow-xl`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          ...MOTION_STATES[motionState]
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => setIsOpen(true)}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Inner petals */}
        <motion.div className="relative w-14 h-14 rounded-full overflow-hidden">
          {/* Breathing center */}
          <motion.div
            className="absolute inset-2 rounded-full bg-white/30 backdrop-blur-md"
            animate={{
              scale: motionState === "listening" ? [1, 1.2, 1] : 1,
              opacity: motionState === "processing" ? [0.3, 1, 0.3] : 0.8
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Sacred geometry overlay */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <motion.circle
              cx="50"
              cy="50"
              r="20"
              fill="none"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1"
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            />
            <motion.circle
              cx="50"
              cy="50"
              r="30"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
              animate={{ rotate: -360 }}
              transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
            />
          </svg>
        </motion.div>

        {/* Notification pulse */}
        {shouldInvite && !isOpen && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-pink-400 rounded-full"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <MaiaOverlay
            onClose={() => setIsOpen(false)}
            context={context}
            coherenceLevel={coherenceLevel}
            onMotionStateChange={setMotionState}
            invitationType={invitationType}
          />
        )}
      </AnimatePresence>
    </>
  );
}