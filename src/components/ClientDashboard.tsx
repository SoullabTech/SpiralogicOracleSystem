import React, { useEffect, useState } from 'react';
import { Brain, Edit2, Save, X, MessageCircle } from 'lucide-react';
import { OracleChat } from './OracleChat';
import { memoryBlockStore } from '../lib/memory-block-store';
import type { MemoryBlock } from '../types';

interface ClientDashboardProps {
  clientId: string;
  clientName: string;
}

export default function ClientDashboard({ clientId, clientName }: ClientDashboardProps) {
  const [memories, setMemories] = useState<MemoryBlock[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [activeTab, setActiveTab] = useState<'memories' | 'chat'>('memories');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMemories();
  }, [clientId]);

  const loadMemories = async () => {
    try {
      const blocks = await memoryBlockStore.getMemoryBlocks(clientId, {
        minImportance: 5
      });
      setMemories(blocks);
    } catch (error) {
      console.error('Failed to load memories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await memoryBlockStore.updateMemoryBlock(id, {
        value: editValue
      });
      setEditing(null);
      loadMemories();
    } catch (error) {
      console.error('Failed to update memory:', error);
    }
  };

  const startEditing = (memory: MemoryBlock) => {
    setEditing(memory.id);
    setEditValue(memory.value);
  };

  const cancelEditing = () => {
    setEditing(null);
    setEditValue('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Oracle Dashboard</h1>
            <p className="text-gray-600">Client: {clientName}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('memories')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeTab === 'memories'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Brain size={18} />
              Memories
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeTab === 'chat'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MessageCircle size={18} />
              Oracle Chat
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {activeTab === 'memories' ? (
            <div className="divide-y">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mx-auto mb-4" />
                  <p className="text-gray-600">Loading memories...</p>
                </div>
              ) : memories.length === 0 ? (
                <div className="p-8 text-center">
                  <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">No memories found</p>
                </div>
              ) : (
                memories.map(memory => (
                  <div key={memory.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {memory.label}
                          </span>
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                            Importance: {memory.importance}
                          </span>
                          {memory.type && (
                            <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-600">
                              {memory.type}
                            </span>
                          )}
                        </div>
                        
                        {editing === memory.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdate(memory.id)}
                                className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1"
                              >
                                <Save size={14} />
                                Save
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 flex items-center gap-1"
                              >
                                <X size={14} />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="group relative">
                            <p className="text-gray-600 whitespace-pre-wrap">
                              {memory.value}
                            </p>
                            <button
                              onClick={() => startEditing(memory)}
                              className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Edit2 size={14} className="text-gray-400 hover:text-gray-600" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="h-[600px]">
              <OracleChat
                clientId={clientId}
                clientName={clientName}
                context={{
                  memories
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}