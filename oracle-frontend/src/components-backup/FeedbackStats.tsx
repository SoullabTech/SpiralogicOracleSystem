import { useQuery } from '@tanstack/react-query';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart';
import { getFeedbackStats } from '../services/feedbackService';
import { useAuth } from '../hooks/useAuth';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function FeedbackStats() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['feedbackStats', user?.id],
    queryFn: () => getFeedbackStats(user?.id || ''),
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-2 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-600">No feedback data available yet.</p>
      </div>
    );
  }

  const chartData = {
    labels: Object.keys(stats.elementalDistribution),
    datasets: [
      {
        label: 'Elemental Distribution',
        data: Object.values(stats.elementalDistribution),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Feedback Distribution by Element',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Feedback Overview</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Total Feedback</p>
          <p className="text-2xl font-bold">{stats.totalFeedback}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Average Rating</p>
          <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Positive Feedback</p>
          <p className="text-2xl font-bold text-green-600">
            {stats.positiveFeedback}
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Needs Improvement</p>
          <p className="text-2xl font-bold text-red-600">
            {stats.negativeFeedback}
          </p>
        </div>
      </div>

      <div className="h-64">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}