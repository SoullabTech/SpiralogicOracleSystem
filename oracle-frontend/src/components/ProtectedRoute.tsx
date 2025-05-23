// src/components/ProtectedRoute.tsx
import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { PageTransition } from '@/components/PageTransition';
import { supabase } from '@/lib/supabaseClient';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.user) {
        setAuthenticated(false);
      } else {
        setAuthenticated(true);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-pink-50 to-yellow-50">
        <p className="text-xl text-indigo-600 animate-pulse">Checking your path...</p>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <PageTransition>{children}</PageTransition>;
}