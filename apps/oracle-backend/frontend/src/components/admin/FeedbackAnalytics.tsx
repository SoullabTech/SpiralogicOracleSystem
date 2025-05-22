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
import { getFeedbackStats } from '../../services/feedbackService';
import { getMetricTrends } from '../../services/oracleMetricsService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function FeedbackAnalytics() {
  const timeframe = {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    end: new Date(),
  };

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['feedbackStats'],
    queryFn: () => getFeedbackStats('all'),
  });

  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ['feedbackTrends', timeframe],
    queryFn: () => getMetricTrends('user_satisfaction', timeframe),
  });

  if (statsLoading || trendsLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const chartData = {
    labels: trends?.map(t => new Date(t.timestamp).toLocaleDateString()) || [],
    datasets: [
      {
        label: 'User Satisfaction',
        data: trends?.map(t => t.value * 100) || [],
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
        text: 'User Satisfaction Trend',
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
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Feedback Analytics</h2>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-indigo-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-indigo-900">Total Feedback</h3>
          <p className="text-3xl font-bold text-indigo-600">
            {stats?.totalFeedback || 0}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900">Satisfaction Rate</h3>
          <p className="text-3xl font-bold text-green-600">
            {Math.round((stats?.positiveFeedback || 0) / (stats?.totalFeedback || 1) * 100)}%
          </p>
        </div>
      </div>

      <div className="h-64">
        <Line data={chartData} options={chartOptions} />
      </div>

      {stats?.elementalDistribution && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Elemental Distribution</h3>
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(stats.elementalDistribution).map(([element, count]) => (
              <div
                key={element}
                className="bg-gray-50 p-4 rounded-lg text-center"
              >
                <h4 className="font-medium capitalize">{element}</h4>
                <p className="text-2xl font-bold text-gray-700">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}