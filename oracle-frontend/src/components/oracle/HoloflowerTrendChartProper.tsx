/**
 * HoloflowerTrendChart - Visualizes elemental balance trends over time
 * Shows how the user's elemental composition changes through Oracle interactions
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TrendDataPoint } from '@/types/chart';

interface HoloflowerTrendChartProps {
  userId?: string;
  period?: 'day' | 'week' | 'month';
  className?: string;
}

/**
 * Fetches and displays Holoflower elemental balance trends
 * @param props - Component props including userId and time period
 * @returns Trend chart visualization component
 */
export default function HoloflowerTrendChart({ 
  userId = 'demo-user-001',
  period = 'week',
  className = ''
}: HoloflowerTrendChartProps) {
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetches trend data from the API or local storage
   */
  const fetchTrendData = async (): Promise<TrendDataPoint[]> => {
    try {
      // In a real implementation, this would fetch from an API
      // For now, return mock data
      const mockData: TrendDataPoint[] = [
        { time: '2024-01-01', value: 75, label: 'Fire dominant' },
        { time: '2024-01-02', value: 82, label: 'Fire rising' },
        { time: '2024-01-03', value: 68, label: 'Water emerging' },
        { time: '2024-01-04', value: 71, label: 'Earth grounding' },
        { time: '2024-01-05', value: 85, label: 'Air expanding' },
        { time: '2024-01-06', value: 90, label: 'Aether awakening' },
        { time: '2024-01-07', value: 78, label: 'Balanced state' },
      ];
      return mockData;
    } catch (error) {
      console.error('Failed to fetch trend data:', error);
      return [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await fetchTrendData();
      setTrendData(data);
      setIsLoading(false);
    };
    loadData();
  }, [userId, period]);

  /**
   * Calculates the average value from trend data
   */
  const getAverageValue = (): number => {
    if (trendData.length === 0) return 0;
    const sum = trendData.reduce((acc, point) => acc + point.value, 0);
    return Math.round(sum / trendData.length);
  };

  /**
   * Gets the peak value and time
   */
  const getPeakValue = (): TrendDataPoint | null => {
    if (trendData.length === 0) return null;
    return trendData.reduce((max, point) => 
      point.value > max.value ? point : max
    );
  };

  if (isLoading) {
    return (
      <Card className={`${className} animate-pulse`}>
        <CardHeader>
          <CardTitle>Loading Holoflower Trends...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const average = getAverageValue();
  const peak = getPeakValue();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Holoflower Balance Trend</span>
          <span className="text-sm text-muted-foreground">{period}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Average Balance</p>
              <p className="text-2xl font-bold">{average}%</p>
            </div>
            {peak && (
              <div>
                <p className="text-sm text-muted-foreground">Peak Balance</p>
                <p className="text-2xl font-bold">{peak.value}%</p>
                <p className="text-xs text-muted-foreground">{peak.label}</p>
              </div>
            )}
          </div>

          {/* Simple visualization - in production, use a proper chart library */}
          <div className="h-64 relative border rounded p-4">
            <div className="flex items-end justify-between h-full gap-2">
              {trendData.map((point, index) => (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center"
                >
                  <div
                    className="w-full bg-gradient-oracle rounded-t transition-all duration-300 hover:opacity-80"
                    style={{ height: `${(point.value / 100) * 100}%` }}
                    title={`${point.label}: ${point.value}%`}
                  />
                  <span className="text-xs mt-2 rotate-45 origin-left">
                    {new Date(point.time).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="text-xs text-muted-foreground text-center">
            Elemental coherence over the past {period}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}