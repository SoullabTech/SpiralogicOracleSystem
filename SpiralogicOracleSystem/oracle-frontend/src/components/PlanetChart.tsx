// src/components/PlanetChart.tsx
import { useSwissEph } from '@/contexts/SwissEphContext';
import { useEffect, useState } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';

const PLANETS = [
  { id: 'SE_SUN', name: 'Sun' },
  { id: 'SE_MOON', name: 'Moon' },
  { id: 'SE_MERCURY', name: 'Mercury' },
  { id: 'SE_VENUS', name: 'Venus' },
  { id: 'SE_MARS', name: 'Mars' },
  { id: 'SE_JUPITER', name: 'Jupiter' },
  { id: 'SE_SATURN', name: 'Saturn' },
  { id: 'SE_URANUS', name: 'Uranus' },
  { id: 'SE_NEPTUNE', name: 'Neptune' },
  { id: 'SE_PLUTO', name: 'Pluto' },
];

interface Props {
  date: Date;
}

interface DataPoint {
  subject: string;
  longitude: number;
}

export default function PlanetChart({ date }: Props) {
  const { swe, loading, error } = useSwissEph();
  const [data, setData] = useState<DataPoint[]>([]);

  useEffect(() => {
    if (!swe) return;

    const jd = swe.JulianDay(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate(),
      date.getUTCHours() + date.getUTCMinutes() / 60,
      swe.GREG_CAL
    );

    const buffer = new Array(6).fill(0);
    const chartData: DataPoint[] = PLANETS.map(({ id, name }) => {
      const ipl = (swe as any)[id] as number;
      swe.calc_ut(jd, ipl, 0, buffer);
      return {
        subject: name,
        longitude: buffer[0],
      };
    });

    setData(chartData);
  }, [swe, date]);

  if (loading) return <div className="text-center p-4">Loading chart…</div>;
  if (error) return <div className="text-center p-4">Error loading ephemeris</div>;

  return (
    <div className="bg-white rounded shadow p-4" style={{ height: 400 }}>
      <ResponsiveContainer>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, 360]} />
          <Radar
            name="Longitude"
            dataKey="longitude"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
