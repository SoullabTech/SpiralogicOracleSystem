// src/routes/index.ts
import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

import ProtectedRoute from '@/components/ProtectedRoute';

// Direct imports for frequently used or critical routes
import HomePage from '@/pages/HomePage'; // Ensure this file exists and exports a component
import ChatPage from '@/pages/ChatPage';
import DebugJwt from '@/pages/DebugJwt';
import FacilitatorPage from '@/pages/FacilitatorPage';
import GetTokenDebug from '@/pages/GetTokenDebug';
import OraclePage from '@/pages/OraclePage';
import JournalTimeline from '@/pages/JournalTimeline';
import EphemerisDashboard from '@/pages/EphemerisDashboard';

// Lazy-loaded for optimization
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const publicRoutes = [
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <div>Login Page</div> }, // Replace with LoginPage if available
  { path: '/about', element: <div>About Page</div> }, // Replace with AboutPage if needed
  { path: '/chat', element: <ChatPage /> },
  { path: '/debug-jwt', element: <DebugJwt /> },
  { path: '/get-token', element: <GetTokenDebug /> },
  { path: '/facilitator', element: <FacilitatorPage /> },
  { path: '/oracle/:guideId', element: <OraclePage /> },
];

const protectedRoutes = [
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <EphemerisDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/journal-timeline',
    element: (
      <ProtectedRoute>
        <JournalTimeline />
      </ProtectedRoute>
    ),
  },
];

const fallbackRoute = {
  path: '*',
  element: <NotFoundPage />,
};

export { publicRoutes, protectedRoutes, fallbackRoute };
