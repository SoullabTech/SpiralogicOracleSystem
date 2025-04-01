import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SpiralMirror } from './components/SpiralMirror';
import { Login } from './components/Login';
import { AuthCallback } from './components/AuthCallback';
import { Profile } from './components/Profile';
import { Settings } from './components/Settings';
import { ProtectedRoute } from './components/ProtectedRoute';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/mirror" element={<SpiralMirror />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}