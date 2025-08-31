// src/utils/memoryModule.ts

import { supabase } from "../lib/supabaseClient";
import type { AIResponse } from "../types/ai";

export interface SymbolicMemoryTag {
  userId: string;
  symbol: string;
  agent: string;
  timestamp?: string; // ISO string
  metadata?: Record<string, any>;
  aiResponse?: AIResponse;
}

class MemoryModule {
  /**
   * Stores a symbolic tag in Supabase.
   */
  async storeTag(tag: SymbolicMemoryTag): Promise<void> {
    const { error } = await supabase.from("symbolic_tags").insert({
      user_id: tag.userId,
      symbol: tag.symbol,
      agent: tag.agent,
      timestamp: tag.timestamp ?? new Date().toISOString(),
      metadata: tag.metadata ?? {},
      ai_response: tag.aiResponse ?? null,
    });

    if (error) {
      console.error("❌ Failed to store symbolic tag:", error);
      throw error;
    }
  }

  /**
   * Retrieves all symbolic tags for a user.
   */
  async getAllSymbolicTags(userId: string): Promise<SymbolicMemoryTag[]> {
    const { data, error } = await supabase
      .from("symbolic_tags")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("❌ Failed to fetch all symbolic tags:", error);
      throw error;
    }

    return (data ?? []) as SymbolicMemoryTag[];
  }

  /**
   * Filters tags by symbol name.
   */
  async getEntriesBySymbol(
    userId: string,
    symbol: string,
  ): Promise<SymbolicMemoryTag[]> {
    const { data, error } = await supabase
      .from("symbolic_tags")
      .select("*")
      .eq("user_id", userId)
      .ilike("symbol", symbol);

    if (error) {
      console.error("❌ Error fetching entries by symbol:", error);
      throw error;
    }

    return data as SymbolicMemoryTag[];
  }

  /**
   * Filters tags by agent name.
   */
  async getEntriesByAgent(
    userId: string,
    agent: string,
  ): Promise<SymbolicMemoryTag[]> {
    const { data, error } = await supabase
      .from("symbolic_tags")
      .select("*")
      .eq("user_id", userId)
      .ilike("agent", agent);

    if (error) {
      console.error("❌ Error fetching entries by agent:", error);
      throw error;
    }

    return data as SymbolicMemoryTag[];
  }

  /**
   * Filters tags after a specific timestamp.
   */
  async getEntriesSince(
    userId: string,
    dateISO: string,
  ): Promise<SymbolicMemoryTag[]> {
    const { data, error } = await supabase
      .from("symbolic_tags")
      .select("*")
      .eq("user_id", userId)
      .gte("timestamp", dateISO);

    if (error) {
      console.error("❌ Error fetching entries since:", error);
      throw error;
    }

    return data as SymbolicMemoryTag[];
  }
}

const memoryModule = new MemoryModule();
export default memoryModule;
