'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LinearNavigationProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
  className?: string;
}

export const LinearNavigation: React.FC<LinearNavigationProps> = ({
  currentStep,
  totalSteps,
  stepLabels = [],
  className = ""
}) => {
  return (
    <div className={`linear-navigation ${className}`}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        
        return (
          <motion.div
            key={stepNumber}
            className={`nav-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: isActive ? 1.2 : 1, 
              opacity: 1 
            }}
            transition={{ 
              duration: 0.3,
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
            title={stepLabels[index] || `Step ${stepNumber}`}
          />
        );
      })}
    </div>
  );
};

export default LinearNavigation;