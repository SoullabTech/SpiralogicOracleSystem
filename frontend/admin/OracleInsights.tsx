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
import { getTopPatterns } from '../../services/oraclePatternService';
import { getAggregatedWisdom } from '../../services/memoryService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function OracleInsights() {
  const { data: patterns, isLoading: patternsLoading } = useQuery({
    queryKey: ['topPatterns'],
    queryFn: () => getTopPatterns(5),
  });

  const { data: wisdom, isLoading: wisdomLoading } = useQuery({
    queryKey: ['aggregatedWisdom'],
    queryFn: () => getAggregatedWisdom(['fire', 'water', 'earth', 'air', 'aether'], ['all'], 0.8),
  });

  if (patternsLoading || wisdomLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const chartData = {
    labels: patterns?.map(p => p.patternType) || [],
    datasets: [
      {
        label: 'Pattern Frequency',
        data: patterns?.map(p => p.frequency) || [],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
      },
      {
        label: 'Confidence',
        data: patterns?.map(p => p.confidence * 100) || [],
        borderColor: 'rgb(52, 211, 153)',
        backgroundColor: 'rgba(52, 211, 153, 0.5)',
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
        text: 'Top Patterns Analysis',
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
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Oracle Insights</h1>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="h-80">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Wisdom</h2>
        <div className="space-y-4">
          {wisdom?.slice(0, 5).map(item => (
            <div
              key={item.id}
              className="border-l-4 border-indigo-500 pl-4 py-2"
            >
              <p className="text-gray-700">{item.content}</p>
              <div className="mt-2 flex gap-2">
                {item.elements.map(element => (
                  <span
                    key={element}
                    className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                  >
                    {element}
                  </span>
                ))}
                {item.facets.map(facet => (
                  <span
                    key={facet}
                    className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {facet}
                  </span>
                ))}
              </div>
              <div className="mt-1 text-sm text-gray-500">
                Confidence: {Math.round(item.confidence * 100)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Pattern Details</h2>
        <div className="space-y-4">
          {patterns?.map(pattern => (
            <div
              key={pattern.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <h3 className="font-medium text-gray-900">{pattern.patternType}</h3>
              <p className="mt-1 text-gray-600">{pattern.patternData.description}</p>
              <div className="mt-2 flex justify-between items-center">
                <div className="flex gap-2">
                  <span className="text-sm text-gray-500">
                    Frequency: {pattern.frequency}
                  </span>
                  <span className="text-sm text-gray-500">
                    Confidence: {Math.round(pattern.confidence * 100)}%
                  </span>
                </div>
                {pattern.metadata?.lastMatched && (
                  <span className="text-sm text-gray-500">
                    Last matched: {new Date(pattern.metadata.lastMatched).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}