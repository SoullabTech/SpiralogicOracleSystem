// frontend/src/App.tsx

import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import AuthCallback from "./components/auth/AuthCallback";

// Simple router component for handling different routes
const AppRouter: React.FC = () => {
  const currentPath = window.location.pathname;

  // Handle auth callback route
  if (currentPath === "/auth/callback") {
    return (
      <AuthCallback
        onSuccess={() => {
          // Redirect to main app after successful auth
          window.location.href = "/";
        }}
        onError={(error) => {
          console.error("Auth callback error:", error);
          // Redirect to auth page on error
          setTimeout(() => {
            window.location.href = "/auth";
          }, 3000);
        }}
      />
    );
  }

  // Handle auth page route
  if (currentPath === "/auth") {
    return (
      <ProtectedRoute requireAuth={false}>
        {/* This will show auth forms when user is not logged in */}
      </ProtectedRoute>
    );
  }

  // Default: Main app (protected)
  return (
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="App">
        <AppRouter />
      </div>
    </AuthProvider>
  );
};

export default App;
