import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '../services/profileService';
import { computePersonalityAdjustment } from '../utils/personalityMapping';
import { useAuth } from '../hooks/useAuth';

export function ElementalProfileDisplay() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: () => getUserProfile(user?.id || ''),
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-2 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-600">No profile data available. Complete the survey to see your elemental balance.</p>
      </div>
    );
  }

  const personalityAdjustment = computePersonalityAdjustment(profile);
  const crystalFocus = profile.crystal_focus;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Your Elemental Profile</h2>
        {crystalFocus && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Crystal Focus: {crystalFocus.type}</h3>
            {crystalFocus.type === 'other' && crystalFocus.customDescription && (
              <p className="text-gray-600 mb-2">{crystalFocus.customDescription}</p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {Object.entries(profile)
          .filter(([key]) => ['fire', 'water', 'earth', 'air', 'aether'].includes(key))
          .map(([element, score]) => (
            <div key={element} className="relative pt-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-semibold inline-block uppercase">
                    {element}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block">
                    {score}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                <div
                  style={{ width: `${score}%` }}
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r ${
                    {
                      fire: 'from-red-500 to-red-600',
                      water: 'from-blue-500 to-blue-600',
                      earth: 'from-green-500 to-green-600',
                      air: 'from-yellow-500 to-yellow-600',
                      aether: 'from-purple-500 to-purple-600',
                    }[element]
                  }`}
                />
              </div>
            </div>
          ))}
      </div>

      {crystalFocus && (
        <div className="mt-6 space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Current Challenges</h4>
            <p className="text-gray-600">{crystalFocus.challenges}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Aspirations</h4>
            <p className="text-gray-600">{crystalFocus.aspirations}</p>
          </div>
        </div>
      )}

      <div className="mt-6 border-t pt-4">
        <h4 className="font-semibold mb-2">Personality Adjustment</h4>
        <div className="space-y-2">
          <p className="text-gray-600">
            <span className="font-medium">Tone:</span> {personalityAdjustment.tone}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Style:</span> {personalityAdjustment.style}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Emphasis:</span>{' '}
            {personalityAdjustment.emphasis.join(', ')}
          </p>
        </div>
      </div>
    </div>
  );
}