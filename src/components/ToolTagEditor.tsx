import React, { useState, useEffect } from 'react';
import { Tags, Plus, X, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Tag {
  id: string;
  name: string;
  category: string;
  color: string;
}

interface ToolTagEditorProps {
  toolId?: string;
  onSave?: (tags: Tag[]) => void;
}

export function ToolTagEditor({ toolId, onSave }: ToolTagEditorProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState({ name: '', category: '', color: '#6366f1' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTags();
  }, [toolId]);

  const loadTags = async () => {
    try {
      setIsLoading(true);
      
      // Load all available tags
      const { data: tagData, error: tagError } = await supabase
        .from('tool_tags')
        .select('*')
        .order('category', { ascending: true });

      if (tagError) throw tagError;
      setTags(tagData || []);

      // If toolId is provided, load selected tags
      if (toolId) {
        const { data: selectedData, error: selectedError } = await supabase
          .from('tool_tag_assignments')
          .select('tag_id')
          .eq('tool_id', toolId);

        if (selectedError) throw selectedError;
        setSelectedTags(selectedData?.map(d => d.tag_id) || []);
      }
    } catch (error) {
      console.error('Error loading tags:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createTag = async () => {
    try {
      const { data, error } = await supabase
        .from('tool_tags')
        .insert({
          name: newTag.name,
          category: newTag.category,
          color: newTag.color
        })
        .select()
        .single();

      if (error) throw error;
      setTags([...tags, data]);
      setNewTag({ name: '', category: '', color: '#6366f1' });
    } catch (error) {
      console.error('Error creating tag:', error);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const saveTags = async () => {
    if (!toolId) return;

    try {
      // Remove existing assignments
      await supabase
        .from('tool_tag_assignments')
        .delete()
        .eq('tool_id', toolId);

      // Add new assignments
      if (selectedTags.length > 0) {
        await supabase
          .from('tool_tag_assignments')
          .insert(
            selectedTags.map(tagId => ({
              tool_id: toolId,
              tag_id: tagId
            }))
          );
      }

      onSave?.(tags.filter(tag => selectedTags.includes(tag.id)));
    } catch (error) {
      console.error('Error saving tags:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <Tags className="text-indigo-600" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Tool Tags</h2>
            <p className="text-sm text-gray-500">Organize and categorize your tools</p>
          </div>
        </div>
        {toolId && (
          <button
            onClick={saveTags}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Save size={18} />
            Save Tags
          </button>
        )}
      </div>

      {/* Create New Tag */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium mb-3">Create New Tag</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={newTag.name}
            onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
            placeholder="Tag name"
            className="flex-1 p-2 border rounded-lg"
          />
          <select
            value={newTag.category}
            onChange={(e) => setNewTag({ ...newTag, category: e.target.value })}
            className="w-40 p-2 border rounded-lg"
          >
            <option value="">Category</option>
            <option value="element">Element</option>
            <option value="phase">Phase</option>
            <option value="type">Type</option>
            <option value="custom">Custom</option>
          </select>
          <input
            type="color"
            value={newTag.color}
            onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
            className="w-20 p-1 border rounded-lg"
          />
          <button
            onClick={createTag}
            disabled={!newTag.name || !newTag.category}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Add
          </button>
        </div>
      </div>

      {/* Tag Categories */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading tags...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(new Set(tags.map(t => t.category))).map(category => (
            <div key={category}>
              <h3 className="text-sm font-medium mb-3 capitalize">{category}</h3>
              <div className="flex flex-wrap gap-2">
                {tags
                  .filter(tag => tag.category === category)
                  .map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${
                        selectedTags.includes(tag.id)
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={{
                        backgroundColor: selectedTags.includes(tag.id) ? `${tag.color}20` : undefined,
                        color: selectedTags.includes(tag.id) ? tag.color : undefined
                      }}
                    >
                      <span>{tag.name}</span>
                      {selectedTags.includes(tag.id) && (
                        <X size={14} className="text-current" />
                      )}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}