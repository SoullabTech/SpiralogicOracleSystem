import { useQuery } from '@tanstack/react-query';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  TooltipItem,
} from 'chart';
import { Radar } from 'react-chartjs-2';
import { getProfileStats } from '../services/profileService';
import { getPersonalityWeights } from '../services/monitoringService';
import { useAuth } from '../hooks/useAuth';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

type Weight = {
  element: string;
  weight: number;
  confidence: number;
};

export function ProfileDashboard() {
  const { user } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profileStats', user?.id],
    queryFn: () => getProfileStats(user?.id || ''),
    enabled: !!user,
  });

  const { data: weights, isLoading: weightsLoading } = useQuery<Weight[]>({
    queryKey: ['personalityWeights'],
    queryFn: getPersonalityWeights,
    enabled: !!user,
  });

  if (profileLoading || weightsLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!profile || !weights) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Complete the survey to see your elemental profile.</p>
      </div>
    );
  }

  const chartData = {
    labels: ['Fire', 'Water', 'Earth', 'Air', 'Aether'],
    datasets: [
      {
        label: 'Current Profile',
        data: [profile.fire, profile.water, profile.earth, profile.air, profile.aether],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
      },
      {
        label: 'Personality Weights',
        data: weights.map(w => w.weight * 100),
        backgroundColor: 'rgba(52, 211, 153, 0.2)',
        borderColor: 'rgba(52, 211, 153, 1)',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    scales: {
      r: {
        angleLines: {
          display: true,
        },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'r'>) => {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: ${value.toFixed(1)}%`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Your Elemental Profile</h2>
      <div className="aspect-square max-w-md mx-auto">
        <Radar data={chartData} options={chartOptions} />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4">
        {weights.map(weight => (
          <div
            key={weight.element}
            className="p-4 bg-gray-50 rounded-lg"
          >
            <h3 className="font-semibold capitalize">{weight.element}</h3>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Weight:</span>
                <span>{(weight.weight * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Confidence:</span>
                <span>{(weight.confidence * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
