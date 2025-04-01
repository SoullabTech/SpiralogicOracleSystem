import React, { useState, useEffect } from 'react';
import { Library, Search, Filter, Plus, Star, ThumbsUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Practice {
  id: string;
  name: string;
  description: string;
  element: string;
  archetype: string;
  phase: string;
  type: string;
  author: {
    name: string;
    id: string;
  };
  likes: number;
  tags: string[];
  content: string;
  created_at: string;
}

export function CustomPracticeLibrary() {
  const [practices, setPractices] = useState<Practice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    element: 'all',
    type: 'all',
    phase: 'all'
  });
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

  useEffect(() => {
    loadPractices();
  }, []);

  const loadPractices = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('community_practices')
        .select(`
          *,
          author:user_profiles(name, id)
        `)
        .order(sortBy === 'recent' ? 'created_at' : 'likes', { ascending: false });

      if (error) throw error;
      setPractices(data || []);
    } catch (error) {
      console.error('Error loading practices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (practiceId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('practice_likes')
        .upsert({
          practice_id: practiceId,
          user_id: user.id
        });

      // Update likes count in UI
      setPractices(prev => prev.map(practice =>
        practice.id === practiceId
          ? { ...practice, likes: practice.likes + 1 }
          : practice
      ));
    } catch (error) {
      console.error('Error liking practice:', error);
    }
  };

  const filteredPractices = practices.filter(practice => {
    if (filters.element !== 'all' && practice.element !== filters.element) return false;
    if (filters.type !== 'all' && practice.type !== filters.type) return false;
    if (filters.phase !== 'all' && practice.phase !== filters.phase) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        practice.name.toLowerCase().includes(query) ||
        practice.description.toLowerCase().includes(query) ||
        practice.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    return true;
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <Library className="text-amber-600" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Practice Library</h2>
            <p className="text-sm text-gray-500">Community-contributed practices and rituals</p>
          </div>
        </div>
        <button
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Share Practice
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search practices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-4">
          <select
            value={filters.element}
            onChange={(e) => setFilters({ ...filters, element: e.target.value })}
            className="p-2 border rounded-lg flex-1"
          >
            <option value="all">All Elements</option>
            <option value="fire">Fire</option>
            <option value="water">Water</option>
            <option value="earth">Earth</option>
            <option value="air">Air</option>
            <option value="aether">Aether</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="p-2 border rounded-lg flex-1"
          >
            <option value="all">All Types</option>
            <option value="ritual">Ritual</option>
            <option value="meditation">Meditation</option>
            <option value="journaling">Journaling</option>
            <option value="breathwork">Breathwork</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular')}
            className="p-2 border rounded-lg flex-1"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Practices Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading practices...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPractices.map(practice => (
            <div
              key={practice.id}
              className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">{practice.name}</h3>
                  <button
                    onClick={() => handleLike(practice.id)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Star size={16} className="text-amber-500" />
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-3">{practice.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    practice.element === 'fire' ? 'bg-orange-100 text-orange-800' :
                    practice.element === 'water' ? 'bg-blue-100 text-blue-800' :
                    practice.element === 'earth' ? 'bg-green-100 text-green-800' :
                    practice.element === 'air' ? 'bg-purple-100 text-purple-800' :
                    'bg-indigo-100 text-indigo-800'
                  }`}>
                    {practice.element}
                  </span>
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                    {practice.type}
                  </span>
                  {practice.tags.slice(0, 2).map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <ThumbsUp size={14} />
                    <span>{practice.likes}</span>
                  </div>
                  <span>By {practice.author.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}