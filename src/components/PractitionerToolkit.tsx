import React, { useState, useEffect } from 'react';
import { Settings, Library, Sparkles, Tags, Check, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Tool {
  id: string;
  name: string;
  type: string;
  description: string;
  element: string;
  archetype: string;
  phase: string;
  tags: string[];
  isEnabled: boolean;
}

interface PractitionerToolkitProps {
  clientId?: string;
  sessionId?: string;
}

export function PractitionerToolkit({ clientId, sessionId }: PractitionerToolkitProps) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [filter, setFilter] = useState({
    element: 'all',
    type: 'all',
    phase: 'all'
  });

  useEffect(() => {
    loadTools();
  }, [clientId]);

  const loadTools = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('practitioner_tools')
        .select('*')
        .eq('practitioner_id', await getCurrentPractitionerId());

      if (error) throw error;
      setTools(data || []);
    } catch (error) {
      console.error('Error loading tools:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentPractitionerId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
  };

  const toggleTool = async (toolId: string) => {
    try {
      const updatedTools = tools.map(tool => 
        tool.id === toolId ? { ...tool, isEnabled: !tool.isEnabled } : tool
      );
      setTools(updatedTools);

      await supabase
        .from('practitioner_tool_settings')
        .upsert({
          tool_id: toolId,
          client_id: clientId,
          session_id: sessionId,
          is_enabled: updatedTools.find(t => t.id === toolId)?.isEnabled
        });
    } catch (error) {
      console.error('Error toggling tool:', error);
    }
  };

  const filteredTools = tools.filter(tool => {
    if (filter.element !== 'all' && tool.element !== filter.element) return false;
    if (filter.type !== 'all' && tool.type !== filter.type) return false;
    if (filter.phase !== 'all' && tool.phase !== filter.phase) return false;
    return true;
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Settings className="text-purple-600" size={20} />
          </div>
          <h2 className="text-xl font-bold">Practitioner Toolkit</h2>
        </div>
        <button
          onClick={() => setSelectedTool(null)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Add Tool
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <select
          value={filter.element}
          onChange={(e) => setFilter({ ...filter, element: e.target.value })}
          className="p-2 border rounded-lg"
        >
          <option value="all">All Elements</option>
          <option value="fire">Fire</option>
          <option value="water">Water</option>
          <option value="earth">Earth</option>
          <option value="air">Air</option>
          <option value="aether">Aether</option>
        </select>

        <select
          value={filter.type}
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          className="p-2 border rounded-lg"
        >
          <option value="all">All Types</option>
          <option value="breathwork">Breathwork</option>
          <option value="journaling">Journaling</option>
          <option value="meditation">Meditation</option>
          <option value="ritual">Ritual</option>
          <option value="oracle">Oracle</option>
        </select>

        <select
          value={filter.phase}
          onChange={(e) => setFilter({ ...filter, phase: e.target.value })}
          className="p-2 border rounded-lg"
        >
          <option value="all">All Phases</option>
          <option value="exploration">Exploration</option>
          <option value="integration">Integration</option>
          <option value="mastery">Mastery</option>
        </select>
      </div>

      {/* Tools Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading toolkit...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map(tool => (
            <div
              key={tool.id}
              className={`p-4 rounded-lg border-2 transition-colors ${
                tool.isEnabled
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Library size={18} className="text-purple-600" />
                  <h3 className="font-medium">{tool.name}</h3>
                </div>
                <button
                  onClick={() => toggleTool(tool.id)}
                  className={`p-1 rounded-full transition-colors ${
                    tool.isEnabled
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  <Check size={16} />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-3">{tool.description}</p>

              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  tool.element === 'fire' ? 'bg-orange-100 text-orange-800' :
                  tool.element === 'water' ? 'bg-blue-100 text-blue-800' :
                  tool.element === 'earth' ? 'bg-green-100 text-green-800' :
                  tool.element === 'air' ? 'bg-purple-100 text-purple-800' :
                  'bg-indigo-100 text-indigo-800'
                }`}>
                  {tool.element}
                </span>
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                  {tool.type}
                </span>
                {tool.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}