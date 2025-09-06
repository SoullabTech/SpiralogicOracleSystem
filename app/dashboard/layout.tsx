import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { BarChart3, MessageSquare, Volume2, Settings, Home } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Soullab Analytics Dashboard',
  description: 'Beta testing analytics for Maia voice interface',
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: Home },
    { href: '/dashboard/audio', label: 'Audio Unlocks', icon: Volume2 },
    { href: '/dashboard/reflections', label: 'Reflections', icon: MessageSquare },
    { href: '/dashboard/metrics', label: 'Metrics', icon: BarChart3 },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-[calc(100vh-73px)] bg-white dark:bg-neutral-900 transition-colors duration-200">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-neutral-800">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
            Analytics
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Beta Dashboard v1.0
          </p>
        </div>

        <nav className="px-4 pb-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                         text-neutral-700 dark:text-neutral-300
                         hover:bg-white dark:hover:bg-neutral-700
                         hover:text-neutral-900 dark:hover:text-neutral-100
                         transition-all duration-150 mb-1"
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Beta Status */}
        <div className="mx-4 p-3 rounded-lg bg-gradient-to-r from-yellow-100/50 to-amber-100/50 
                      dark:from-yellow-900/20 dark:to-amber-900/20 
                      border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
              Beta Active
            </span>
          </div>
          <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
            Collecting feedback
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Dashboard Header (no theme toggle - it&apos;s in root layout) */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                Dashboard
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            {/* Live indicator */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full 
                          bg-green-100 dark:bg-green-900/30 
                          border border-green-200 dark:border-green-800">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-green-700 dark:text-green-400">
                Live Data
              </span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-neutral-950">
          <div className="p-6">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 
                         bg-white dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              © 2024 Soullab. All data is anonymized and secure.
            </p>
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard/export" 
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Export Data
              </Link>
              <Link 
                href="/dashboard/help" 
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Help
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}