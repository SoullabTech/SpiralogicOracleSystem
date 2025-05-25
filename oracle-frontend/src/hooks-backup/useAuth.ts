import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; // Ensure supabase is correctly configured
import type { User, Session } from '@supabase/supabase-js'; // Type for the user object

export function useAuth() {
  const [user, setUser] = useState<User | null>(null); // Store user data
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState<string | null>(null); // For error handling

  useEffect(() => {
    // Function to fetch the initial session and set user
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null); // Set user session or null
      } catch (err) {
        setError('Failed to retrieve session'); // Handle session fetch error
        console.error('Session fetch error:', err);
      } finally {
        setLoading(false); // Mark loading complete
      }
    };

    fetchSession(); // Fetch session on component mount

    // Subscribe to auth state changes and update user state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      setUser(session?.user ?? null); // Update user when auth state changes
    });

    // Cleanup subscription when component unmounts
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null); // Reset any previous error
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error; // Throw error if exists
    } catch (err: any) {
      setError(err.message); // Set error state if sign-in fails
      console.error('Sign-in error: ', err);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setError(null); // Reset any previous error
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error; // Throw error if exists
    } catch (err: any) {
      setError(err.message); // Set error state if sign-up fails
      console.error('Sign-up error: ', err);
    }
  };

  const signOut = async () => {
    try {
      setError(null); // Reset any previous error
      const { error } = await supabase.auth.signOut();
      if (error) throw error; // Throw error if exists
    } catch (err: any) {
      setError(err.message); // Set error state if sign-out fails
      console.error('Sign-out error: ', err);
    }
  };

  return {
    user,
    loading,
    error, // Expose the error for UI handling
    signIn,
    signUp,
    signOut,
  };
}
