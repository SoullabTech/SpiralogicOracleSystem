// frontend/src/hooks/useOracleConfig.ts

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

interface OracleConfig {
  oracleName: string;
  oracleVoice: string;
}

interface UseOracleConfigReturn {
  config: OracleConfig;
  isLoading: boolean;
  saveConfig: (config: OracleConfig) => Promise<void>;
  clearConfig: () => void;
  isConfigured: boolean;
}

export const useOracleConfig = (): UseOracleConfigReturn => {
  const { user } = useAuth();
  const [config, setConfig] = useState<OracleConfig>({
    oracleName: "",
    oracleVoice: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load config on mount
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setIsLoading(true);

    try {
      if (user) {
        // Try to load from Supabase
        const { data: userConfig } = await supabase
          .from("user_onboarding")
          .select("oracle_name, oracle_voice")
          .eq("user_id", user.id)
          .eq("completed", true)
          .single();

        if (userConfig?.oracle_name && userConfig?.oracle_voice) {
          const loadedConfig = {
            oracleName: userConfig.oracle_name,
            oracleVoice: userConfig.oracle_voice,
          };
          setConfig(loadedConfig);
          // Sync to localStorage
          localStorage.setItem("oracleName", loadedConfig.oracleName);
          localStorage.setItem("oracleVoice", loadedConfig.oracleVoice);
          setIsLoading(false);
          return;
        }
      }
    } catch (error) {
      console.warn("Failed to load config from Supabase:", error);
    }

    // Fallback to localStorage
    const savedName = localStorage.getItem("oracleName");
    const savedVoice = localStorage.getItem("oracleVoice");

    if (savedName && savedVoice) {
      setConfig({
        oracleName: savedName,
        oracleVoice: savedVoice,
      });
    }

    setIsLoading(false);
  };

  const saveConfig = async (newConfig: OracleConfig) => {
    setConfig(newConfig);

    // Always save to localStorage first
    localStorage.setItem("oracleName", newConfig.oracleName);
    localStorage.setItem("oracleVoice", newConfig.oracleVoice);

    // Try to save to Supabase if user is authenticated
    try {
      if (user) {
        await supabase.from("user_onboarding").upsert({
          user_id: user.id,
          oracle_name: newConfig.oracleName,
          oracle_voice: newConfig.oracleVoice,
          step: 3,
          completed: true,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Failed to save config to Supabase:", error);
      // Don't throw - localStorage save succeeded
    }
  };

  const clearConfig = () => {
    setConfig({ oracleName: "", oracleVoice: "" });
    localStorage.removeItem("oracleName");
    localStorage.removeItem("oracleVoice");

    // Note: We don't automatically clear Supabase data
    // That should be done through a separate "delete account" flow
  };

  const isConfigured = Boolean(config.oracleName && config.oracleVoice);

  return {
    config,
    isLoading,
    saveConfig,
    clearConfig,
    isConfigured,
  };
};
