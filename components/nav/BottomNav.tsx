// BottomNav - Apple-minimal 5-tab navigation with elemental theming
// Voice-accessible navigation with thin-line icons and accent colors
"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useElementTheme } from '@/hooks/useElementTheme';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  voiceCommands: string[];
}

const navItems: NavItem[] = [
  {
    id: 'now',
    label: 'Now',
    href: '/now',
    voiceCommands: ['go to now', 'show now', 'current'],
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth="1.5"/>
        <path d="M12 6v6l4 2" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    id: 'oracle',
    label: 'Oracle',
    href: '/oracle',
    voiceCommands: ['open oracle', 'ask oracle', 'oracle'],
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    id: 'journal',
    label: 'Journal',
    href: '/journal',
    voiceCommands: ['open journal', 'write journal', 'journal'],
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    id: 'mirror',
    label: 'Soul Mirror',
    href: '/mirror',
    voiceCommands: ['soul mirror', 'open mirror', 'holoflower'],
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9l-5 4.74L18.18 22 12 18.77 5.82 22 7 13.74 2 9l6.91-.74L12 2z" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    id: 'spirals',
    label: 'Spirals',
    href: '/spirals',
    voiceCommands: ['show spirals', 'spirals', 'development'],
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="1.5"/>
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const { textClass, borderClass } = useElementTheme();
  
  // Extract the first segment to determine active tab
  const activeTab = pathname?.split('/')[1] || 'now';

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-app-surface/95 backdrop-blur-lg border-t border-app-border pb-safe-bottom"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around px-4 py-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`
                flex flex-col items-center justify-center min-w-0 py-2 px-3 rounded-apple-sm
                transition-all duration-apple hover:bg-app-surface
                focus:outline-none focus:ring-2 focus:ring-white/20
                ${isActive ? `${textClass} ${borderClass} border-b-2` : 'text-app-muted'}
              `}
              aria-label={`${item.label} tab${isActive ? ' (current)' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="mb-1">
                {item.icon}
              </div>
              <span className="text-caption font-medium truncate">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}