// src/components/SunPosition.tsx
import { useSwissEph } from '@/contexts/SwissEphContext';

interface Props {
  date: Date;
}

export default function SunPosition({ date }: Props) {
  const { swe, loading, error } = useSwissEph();
  if (loading) return <div>Loading ephemeris…</div>;
  if (error) return <div>Error loading ephemeris</div>;
  if (!swe) return null;

  const jd = swe.JulianDay(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours() + date.getUTCMinutes() / 60,
    swe.GREG_CAL,
  );

  const buf = new Array(6).fill(0);
  swe.calc_ut(jd, swe.SE_SUN, 0, buf);

  return (
    <div>
      <h3 className="font-semibold mb-2">Sun Longitude</h3>
      <p className="text-xl">{buf[0].toFixed(4)}°</p>
    </div>
  );
}
