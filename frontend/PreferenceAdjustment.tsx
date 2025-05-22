import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserProfile } from '../services/profileService';
import { useAuth } from '../hooks/useAuth';
import type { ElementalProfile } from '../types/survey';

export function PreferenceAdjustment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const currentProfile = queryClient.getQueryData<ElementalProfile>(['profileStats', user?.id]);
  
  const [adjustments, setAdjustments] = useState({
    fire: currentProfile?.fire || 50,
    water: currentProfile?.water || 50,
    earth: currentProfile?.earth || 50,
    air: currentProfile?.air || 50,
    aether: currentProfile?.aether || 50,
  });

  const updateMutation = useMutation({
    mutationFn: (newProfile: Partial<ElementalProfile>) =>
      updateUserProfile(user?.id || '', newProfile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profileStats'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(adjustments);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Adjust Your Preferences</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {Object.entries(adjustments).map(([element, value]) => (
          <div key={element}>
            <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
              {element}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={value}
              onChange={(e) =>
                setAdjustments((prev) => ({
                  ...prev,
                  [element]: parseInt(e.target.value),
                }))
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>{value}</span>
              <span>100</span>
            </div>
          </div>
        ))}
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {updateMutation.isPending ? 'Updating...' : 'Save Preferences'}
        </button>
      </form>
    </div>
  );
}