import { useSwissEph } from '@/contexts/SwissEphContext';
import { useDate } from '@/hooks/useDate';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import JulianDayDisplay from '@/components/JulianDayDisplay';
import PlanetChart from '@/components/PlanetChart';
import PlanetPositions from '@/components/PlanetPositions';
import SunPosition from '@/components/SunPosition';

export default function EphemerisDashboard() {
  const { swe, loading: ephLoading, error: ephError } = useSwissEph();
  const { date, setDate } = useDate();

  return (
    <div className="p-6 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <div className="bg-white rounded-2xl shadow-lg p-4 md:col-span-2 lg:col-span-1">
        <label className="block mb-2 font-medium">📅 Select date/time (UTC):</label>
        <DatePicker
          selected={date}
          onChange={(d) => d && setDate(d)}
          showTimeSelect
          timeFormat="HH:mm"
          dateFormat="yyyy-MM-dd HH:mm"
          className="border p-2 rounded w-full"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-4">
        {ephLoading ? '☀️ Loading ephemeris…' : ephError ? '❌ Error' : <SunPosition date={date} />}
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-4">
        {ephLoading ? '📘 Loading…' : ephError ? '❌ Error' : <JulianDayDisplay />}
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-4 lg:col-span-2 overflow-auto">
        {ephLoading ? '🪐 Loading…' : ephError ? '❌ Error' : <PlanetPositions date={date} />}
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-4 lg:col-span-3">
        {ephLoading ? '📡 Loading chart…' : ephError ? '❌ Error' : <PlanetChart date={date} />}
      </div>
    </div>
  );
}
