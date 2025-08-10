// frontend/src/components/auth/ProtectedRoute.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import AuthPage from './AuthPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
  requireAuth = true
}) => {
  const { user, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E0F1B] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-2 border-[#F6E27F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Initializing Oracle System...</p>
        </motion.div>
      </div>
    );
  }

  // If auth is required but user is not authenticated
  if (requireAuth && !user) {
    return fallback || <AuthPage />;
  }

  // If auth is NOT required but user IS authenticated, could redirect
  // This is useful for login pages when user is already logged in
  if (!requireAuth && user) {
    // You could redirect to dashboard here if needed
    // For now, just render children
  }

  return <>{children}</>;
};

export { ProtectedRoute };