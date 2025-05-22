import { useQuery } from '@tanstack/react-query';
import { getElementalProfile } from '../services/surveyService';
import { CRYSTAL_FOCUS_OPTIONS } from '../types/survey';
import type { ElementalProfile as ElementalProfileType } from '../types/survey';

interface ElementalScoreProps {
  element: string;
  score: number;
}

function ElementalScore({ element, score }: ElementalScoreProps) {
  const getElementColor = (element: string) => {
    switch (element) {
      case 'fire': return 'from-red-500 to-red-600';
      case 'water': return 'from-blue-500 to-blue-600';
      case 'earth': return 'from-green-500 to-green-600';
      case 'air': return 'from-yellow-500 to-yellow-600';
      case 'aether': return 'from-purple-500 to-purple-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="relative pt-1">
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
          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r ${getElementColor(element)}`}
        />
      </div>
    </div>
  );
}

export function ElementalProfile() {
  const { data: profile, isLoading } = useQuery<ElementalProfileType>({
    queryKey: ['elementalProfile'],
    queryFn: () => getElementalProfile(),
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

  const crystalFocus = profile.crystal_focus;
  const focusOption = CRYSTAL_FOCUS_OPTIONS.find(opt => opt.type === crystalFocus?.type);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Your Elemental Profile</h2>
        {focusOption && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">{focusOption.title}</h3>
            <p className="text-gray-600">{crystalFocus?.customDescription || focusOption.description}</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <ElementalScore element="fire" score={profile.fire} />
        <ElementalScore element="water" score={profile.water} />
        <ElementalScore element="earth" score={profile.earth} />
        <ElementalScore element="air" score={profile.air} />
        <ElementalScore element="aether" score={profile.aether} />
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
    </div>
  );
}