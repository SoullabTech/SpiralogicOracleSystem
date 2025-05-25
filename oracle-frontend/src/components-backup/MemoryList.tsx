// src/components/MemoryList.tsx

import React, { useEffect, useState } from 'react';
import {
  MemoryItem,
  getMemories,
  addMemory,
  deleteMemory,
} from '@/services/memoryService';

export default function MemoryList() {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [newContent, setNewContent] = useState('');

  useEffect(() => {
    fetchMemories();
  }, []);

  async function fetchMemories() {
    try {
      const mems = await getMemories();
      setMemories(mems);
    } catch (error) {
      console.error('Failed to load memories', error);
    }
  }

  async function handleAdd() {
    if (!newContent.trim()) return;
    try {
      const mem = await addMemory(newContent);
      setMemories([mem, ...memories]);
      setNewContent('');
    } catch (error) {
      console.error('Failed to add memory', error);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteMemory(id);
      setMemories(memories.filter((m) => m.id !== id));
    } catch (error) {
      console.error('Failed to delete memory', error);
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Your Memories</h2>
      <textarea
        className="border p-2 w-full mb-2"
        placeholder="Add a new memory..."
        value={newContent}
        onChange={(e) => setNewContent(e.target.value)}
      />
      <button
        onClick={handleAdd}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Add Memory
      </button>

      <ul className="mt-6 space-y-4">
        {memories.map((mem) => (
          <li key={mem.id} className="border p-4 rounded shadow">
            <p>{mem.content}</p>
            <button
              onClick={() => handleDelete(mem.id)}
              className="text-red-600 mt-2 hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
