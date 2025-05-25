import { Suspense, useEffect, useState } from 'react';
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
      <Routes location={location}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        {[...publicRoutes, ...protectedRoutes, fallbackRoute].map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Routes>
    </PageTransition>
  );
}

export default function App() {
  const authReady = useAuthInit();
  useOracleCheck();

  const { swe, loading: ephLoading, error: ephError } = useSwissEph();
  const { date, setDate } = useDate();
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  // Early return if not ready
  if (!authReady) {
    return <div className="text-center p-6 text-gray-500">🔐 Initializing authentication…</div>;
  }

  useEffect(() => {
    if (swe && !ephLoading && !ephError) {
      setIsDatePickerVisible(true);
    }
  }, [swe, ephLoading, ephError]);

  return (
    <ErrorBoundary>
      <ThemeInjector />
      <FaviconSetter />
      <Layout>
        <div className="p-6 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* 1. Date Picker */}
          {isDatePickerVisible && (
            <div className="bg-white rounded-2xl shadow-lg p-4 md:col-span-2 lg:col-span-1">
              <label className="block mb-2 font-medium">📅 Select date/time (UTC):</label>
              <DatePicker
                selected={date}
                onChange={(d: Date) => d && setDate(d)}
                showTimeSelect
                timeFormat="HH:mm"
                dateFormat="yyyy-MM-dd HH:mm"
                className="border p-2 rounded w-full"
              />
            </div>
          )}

          {/* 2–5: Ephemeris */}
          <div className="bg-white rounded-2xl shadow-lg p-4">
            {ephLoading
              ? '☀️ Loading ephemeris…'
              : ephError
              ? '❌ Error loading ephemeris'
              : <SunPosition date={date} />}
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4">
            {ephLoading
              ? '📘 Loading…'
              : ephError
              ? '❌ Error'
              : <JulianDayDisplay />}
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4 lg:col-span-2 overflow-auto">
            {ephLoading
              ? '🪐 Loading…'
              : ephError
              ? '❌ Error'
              : <PlanetPositions date={date} />}
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4 lg:col-span-3">
            {ephLoading
              ? '📡 Loading chart…'
              : ephError
              ? '❌ Chart error'
              : <PlanetChart date={date} />}
          </div>

          {/* 6. Routes */}
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
