// src/components/PlanetPositions.tsx
import { useSwissEph } from '@/contexts/SwissEphContext';
import { useEffect, useState } from 'react';

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

export default function PlanetPositions({ date }: Props) {
  const { swe, loading, error } = useSwissEph();
  const [positions, setPositions] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!swe) return;

    // Compute Julian Day in UTC
    const jd = swe.JulianDay(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate(),
      date.getUTCHours() + date.getUTCMinutes() / 60,
      swe.GREG_CAL,
    );

    // Temporary buffer for Epehemeris results
    const buf = new Array(6).fill(0);
    const pos: Record<string, number> = {};

    // Loop through each planet, calculate longitude
    for (let { id, name } of PLANETS) {
      // dynamically read the constant (e.g. swe.SE_SUN)
      const ipl = (swe as any)[id] as number;
      swe.calc_ut(jd, ipl, 0, buf);
      pos[name] = buf[0];
    }

    setPositions(pos);
  }, [swe, date]);

  if (loading) return <div className="p-4 text-center">Loading ephemeris…</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error loading ephemeris</div>;

  return (
    <div className="overflow-auto">
      <table className="w-full bg-white rounded shadow table-auto">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Body</th>
            <th className="px-4 py-2 text-right">Longitude (°)</th>
          </tr>
        </thead>
        <tbody>
          {PLANETS.map(({ name }) => (
            <tr key={name} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{name}</td>
              <td className="border px-4 py-2 text-right">
                {positions[name]?.toFixed(4) ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
