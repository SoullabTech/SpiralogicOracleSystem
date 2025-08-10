// frontend/src/components/auth/AuthPage.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm, SignupForm } from '.';

interface AuthPageProps {
  onAuthSuccess?: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  const slideVariants = {
    enter: {
      x: isLogin ? -100 : 100,
      opacity: 0,
    },
    center: {
      x: 0,
      opacity: 1,
    },
    exit: {
      x: isLogin ? 100 : -100,
      opacity: 0,
    },
  };

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={isLogin ? 'login' : 'signup'}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            duration: 0.5,
            ease: "easeInOut",
          }}
        >
          {isLogin ? (
            <LoginForm
              onSwitchToSignup={() => setIsLogin(false)}
              onSuccess={onAuthSuccess}
            />
          ) : (
            <SignupForm
              onSwitchToLogin={() => setIsLogin(true)}
              onSuccess={onAuthSuccess}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export { AuthPage };