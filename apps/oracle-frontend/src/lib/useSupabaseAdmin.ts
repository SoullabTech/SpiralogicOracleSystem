// src/lib/useSupabaseAdmin.ts
import { supabase } from './supabaseClient';

/**
 * ⚡ Admin Helper: Update a record inside any table
 */
export const updateRecord = async (table: string, id: string, updates: any) => {
  const { error } = await supabase.from(table).update(updates).eq('id', id);

  if (error) {
    console.error(`❌ Failed to update ${table} with id=${id}`, error.message);
    throw new Error(error.message);
  }

  console.log(`✅ Updated ${table} id=${id}`);
};
