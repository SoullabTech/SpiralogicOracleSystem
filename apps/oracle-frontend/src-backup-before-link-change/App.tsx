// src/App.tsx
import { Suspense } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { useSwissEph } from '@/contexts/SwissEphContext';
import { useAuthInit } from '@/hooks/useAuthInit';
import { useDate } from '@/hooks/useDate';
import { useOracleCheck } from '@/hooks/useOracleCheck';

import JulianDayDisplay from '@/components/JulianDayDisplay';
import PlanetChart from '@/components/PlanetChart';
import PlanetPositions from '@/components/PlanetPositions';
import SunPosition from '@/components/SunPosition';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import FaviconSetter from '@/components/FaviconSetter';
import Layout from '@/components/Layout';
import { PageTransition } from '@/components/PageTransition';
import ThemeInjector from '@/components/ThemeInjector';

import { fallbackRoute, protectedRoutes, publicRoutes } from '@/routes';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <PageTransition key={location.pathname}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        {[...publicRoutes, ...protectedRoutes, fallbackRoute].map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Routes>
    </PageTransition>
  );
}

export default function App() {
  const authReady = useAuthInit(); // ✅ Wait for Supabase to check session
  useOracleCheck(); // Optional Oracle init

  const { swe, loading: ephLoading, error: ephError } = useSwissEph(); // Ephemeris loading
  const { date, setDate } = useDate(); // Global date state

  if (!authReady) {
    return <div className="text-center p-6 text-gray-500">🔐 Initializing authentication…</div>;
  }

  return (
    <ErrorBoundary>
      <ThemeInjector />
      <FaviconSetter />
      <Layout>
        <div className="p-6 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

          {/* 1. Date Selector */}
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

          {/* 2. Sun Position */}
          <div className="bg-white rounded-2xl shadow-lg p-4">
            {ephLoading ? (
              <div>☀️ Loading ephemeris…</div>
            ) : ephError ? (
              <div className="text-red-500">❌ Error loading ephemeris</div>
            ) : (
              <SunPosition date={date} />
            )}
          </div>

          {/* 3. Julian Day Display */}
          <div className="bg-white rounded-2xl shadow-lg p-4">
            {ephLoading ? (
              <div>📘 Loading ephemeris…</div>
            ) : ephError ? (
              <div className="text-red-500">❌ Error loading ephemeris</div>
            ) : (
              <JulianDayDisplay />
            )}
          </div>

          {/* 4. Planet Positions Table */}
          <div className="bg-white rounded-2xl shadow-lg p-4 lg:col-span-2 overflow-auto">
            {ephLoading ? (
              <div>🪐 Loading ephemeris…</div>
            ) : ephError ? (
              <div className="text-red-500">❌ Error loading ephemeris</div>
            ) : (
              <PlanetPositions date={date} />
            )}
          </div>

          {/* 5. Planetary Radar Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-4 lg:col-span-3">
            {ephLoading ? (
              <div>📡 Loading chart…</div>
            ) : ephError ? (
              <div className="text-red-500">❌ Chart error</div>
            ) : (
              <PlanetChart date={date} />
            )}
          </div>

          {/* 6. Router Container */}
          <div className="bg-white rounded-2xl shadow-lg p-4 lg:col-span-3">
            <Suspense fallback={<div className="text-center p-6">🧭 Loading routes…</div>}>
              <AnimatedRoutes />
            </Suspense>
          </div>

        </div>
      </Layout>
    </ErrorBoundary>
  );
}
