import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRelevantMemories } from '../../services/memoryService';

export function MemoryExplorer() {
  const [selectedElement, setSelectedElement] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: memories, isLoading } = useQuery({
    queryKey: ['memories', selectedElement, searchTerm],
    queryFn: () => getRelevantMemories(selectedElement === 'all' ? undefined : selectedElement),
  });

  const filteredMemories = memories?.filter(memory =>
    memory.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Memory Explorer</h2>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search memories..."
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <select
          value={selectedElement}
          onChange={(e) => setSelectedElement(e.target.value)}
          className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="all">All Elements</option>
          <option value="fire">Fire</option>
          <option value="water">Water</option>
          <option value="earth">Earth</option>
          <option value="air">Air</option>
          <option value="aether">Aether</option>
        </select>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMemories?.map(memory => (
            <div
              key={memory.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-700">{memory.content}</p>
                  <div className="mt-2 flex gap-2">
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                      {memory.element}
                    </span>
                    {memory.facet && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {memory.facet}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(memory.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Source: {memory.sourceAgent}
                {memory.confidence && (
                  <span className="ml-4">
                    Confidence: {Math.round(memory.confidence * 100)}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}