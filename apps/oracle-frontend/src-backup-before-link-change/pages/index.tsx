// src/routes/index.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

import LoginPage from '@/pages/login';
import SignupPage from '@/pages/signup';
import ChatPage from '@/pages/chat';

// …other imports for your oracle pages…
import FireOracleChat from '@/pages/oracle/fire';
import WaterOracleChat from '@/pages/oracle/water';
// etc.

export const publicRoutes = [
  { path: '/login',  element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/chat',   element: <ChatPage /> },    // ← your new chat route
  // …any other public routes…
];

export const protectedRoutes = [
  { path: '/oracle/fire',  element: <FireOracleChat /> },
  { path: '/oracle/water', element: <WaterOracleChat /> },
  // …etc.
];

export const fallbackRoute = {
  path: '*',
  element: <Navigate to="/login" replace />,
};
