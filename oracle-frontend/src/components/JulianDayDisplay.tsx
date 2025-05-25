// src/components/JulianDayDisplay.tsx
import { useSwissEph } from '@/contexts/SwissEphContext'
import { useDate } from '@/hooks/useDate'

export default function JulianDayDisplay() {
  const { swe, loading, error } = useSwissEph()
  const { date } = useDate()

  if (loading) return <div>Loading ephemeris…</div>
  if (error || !swe) return <div>Error loading ephemeris</div>

  const jd = swe.JulianDay(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours() + date.getUTCMinutes() / 60,
    swe.GREG_CAL
  )

  return (
    <div className="text-center">
      <span className="font-medium">Julian Day:</span>{' '}
      <span>{jd.toFixed(5)}</span>
    </div>
  )
}
