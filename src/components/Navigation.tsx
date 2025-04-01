import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, Settings, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';

export function Navigation() {
  const location = useLocation();

  const links = [
    { href: '/mirror', label: 'Mirror', icon: Home },
    { href: '/profile', label: 'Profile', icon: User },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="container mx-auto px-4" role="navigation">
      <div className="flex h-16 items-center justify-between">
        <Link
          to="/"
          className="flex items-center space-x-2"
          aria-label="Spiralogic Oracle Home"
        >
          <span className="text-xl font-bold">🌀 Spiralogic Oracle</span>
        </Link>

        <div className="flex items-center space-x-6">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              className={cn(
                'flex items-center space-x-2 text-sm font-medium transition-colors hover:text-foreground/80',
                location.pathname === href
                  ? 'text-foreground'
                  : 'text-foreground/60'
              )}
              aria-current={location.pathname === href ? 'page' : undefined}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          ))}

          <button
            className="flex items-center space-x-2 text-sm font-medium text-foreground/60 transition-colors hover:text-foreground/80"
            onClick={() => {/* Add logout logic */}}
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}