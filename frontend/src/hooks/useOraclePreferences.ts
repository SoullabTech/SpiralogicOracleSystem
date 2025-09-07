// frontend/src/hooks/useOraclePreferences.ts

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

export interface OraclePreferences {
  oracle_name: string;
  oracle_voice: string;
  updated_at?: string;
}

interface UseOraclePreferencesReturn {
  preferences: OraclePreferences | null;
  loading: boolean;
  error: string | null;
  hasPreferences: boolean;
  savePreferences: (
    prefs: Omit<OraclePreferences, "updated_at">,
  ) => Promise<void>;
  updatePreferences: (
    prefs: Omit<OraclePreferences, "updated_at">,
  ) => Promise<void>;
  deletePreferences: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useOraclePreferences = (): UseOraclePreferencesReturn => {
  const { user, loading: authLoading } = useAuth();
  const [preferences, setPreferences] = useState<OraclePreferences | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = async () => {
    if (!user) {
      setPreferences(null);
      setLoading(false);
      return;
    }

    try {
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("oracle_preferences")
        .select("oracle_name, oracle_voice, updated_at")
        .eq("user_id", user.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      setPreferences(data);
    } catch (err) {
      console.error("Failed to fetch Oracle preferences:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load preferences",
      );
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (
    prefs: Omit<OraclePreferences, "updated_at">,
  ) => {
    if (!user) throw new Error("User not authenticated");

    try {
      setError(null);

      const { data, error: saveError } = await supabase
        .from("oracle_preferences")
        .insert({
          user_id: user.id,
          oracle_name: prefs.oracle_name,
          oracle_voice: prefs.oracle_voice,
          updated_at: new Date().toISOString(),
        })
        .select("oracle_name, oracle_voice, updated_at")
        .single();

      if (saveError) throw saveError;

      setPreferences(data);
    } catch (err) {
      console.error("Failed to save Oracle preferences:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save preferences";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updatePreferences = async (
    prefs: Omit<OraclePreferences, "updated_at">,
  ) => {
    if (!user) throw new Error("User not authenticated");

    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from("oracle_preferences")
        .update({
          oracle_name: prefs.oracle_name,
          oracle_voice: prefs.oracle_voice,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select("oracle_name, oracle_voice, updated_at")
        .single();

      if (updateError) throw updateError;

      setPreferences(data);
    } catch (err) {
      console.error("Failed to update Oracle preferences:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update preferences";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deletePreferences = async () => {
    if (!user) throw new Error("User not authenticated");

    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from("oracle_preferences")
        .delete()
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;

      setPreferences(null);
    } catch (err) {
      console.error("Failed to delete Oracle preferences:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete preferences";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const refresh = async () => {
    setLoading(true);
    await fetchPreferences();
  };

  // Load preferences when user changes or component mounts
  useEffect(() => {
    if (!authLoading) {
      fetchPreferences();
    }
  }, [user, authLoading]);

  return {
    preferences,
    loading: loading || authLoading,
    error,
    hasPreferences: Boolean(preferences),
    savePreferences,
    updatePreferences,
    deletePreferences,
    refresh,
  };
};
