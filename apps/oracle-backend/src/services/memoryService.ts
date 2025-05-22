import { supabase } from './supabaseClient';  // Import the supabase client you configured
import { MemoryItem } from '../types';        // Assuming you have defined the MemoryItem type

export const memoryService = {
  /**
   * Store a memory for a specific user
   * @param userId - ID of the user storing the memory
   * @param content - The content of the memory
   * @returns The stored memory item or null in case of error
   */
  store: async (userId: string, content: string): Promise<MemoryItem | null> => {
    // Insert a new memory record in Supabase
    const { data, error } = await supabase
      .from('memories')
      .insert([
        { user_id: userId, content: content, timestamp: new Date().toISOString() }
      ])
      .single();  // To get the inserted record back

    // Log and return errors if any
    if (error) {
      console.error('Error storing memory:', error.message);
      return null;
    }

    // Return the inserted memory item
    return data as MemoryItem;
  },

  /**
   * Retrieve all memories of a specific user
   * @param userId - ID of the user whose memories are to be retrieved
   * @returns A list of memories or an empty array in case of error
   */
  recall: async (userId: string): Promise<MemoryItem[]> => {
    // Query Supabase for all memories of the user
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', userId);

    // Log and return errors if any
    if (error) {
      console.error('Error recalling memories:', error.message);
      return [];
    }

    // Return the list of memories
    return data as MemoryItem[];
  },

  /**
   * Update the content of an existing memory by its ID
   * @param id - ID of the memory to be updated
   * @param newContent - The new content for the memory
   * @returns True if memory was successfully updated, else false
   */
  update: async (id: string, newContent: string): Promise<boolean> => {
    // Update the memory content in Supabase
    const { error } = await supabase
      .from('memories')
      .update({ content: newContent })
      .eq('id', id);

    // Log and return errors if any
    if (error) {
      console.error('Error updating memory:', error.message);
      return false;
    }

    // Return success if the memory was updated
    return true;
  },

  /**
   * Delete a memory by its ID
   * @param id - ID of the memory to be deleted
   * @returns True if memory was successfully deleted, else false
   */
  delete: async (id: string): Promise<boolean> => {
    // Delete the memory from Supabase
    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('id', id);

    // Log and return errors if any
    if (error) {
      console.error('Error deleting memory:', error.message);
      return false;
    }

    // Return success if the memory was deleted
    return true;
  }
};
