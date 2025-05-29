'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Compass, 
  Flower2, 
  Sparkles, 
  BookOpen, 
  Mic 
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  description: string;
}

const navItems: NavItem[] = [
  {
    id: 'guides',
    label: 'Guides',
    icon: <Compass className="w-5 h-5" />,
    href: '/dashboard/guides',
    description: 'Your personal AI guides'
  },
  {
    id: 'holoflower',
    label: 'Holoflower',
    icon: <Flower2 className="w-5 h-5" />,
    href: '/dashboard/holoflower',
    description: 'Sacred geometry visualization'
  },
  {
    id: 'astrology',
    label: 'Astrology',
    icon: <Sparkles className="w-5 h-5" />,
    href: '/dashboard/astrology',
    description: 'Cosmic timing insights'
  },
  {
    id: 'journal',
    label: 'Journal',
    icon: <BookOpen className="w-5 h-5" />,
    href: '/dashboard/journal',
    description: 'Sacred reflections'
  },
  {
    id: 'voice',
    label: 'Voice',
    icon: <Mic className="w-5 h-5" />,
    href: '/dashboard/voice',
    description: 'Voice conversations'
  }
];

export const BottomNavigation: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="soullab-bottom-nav">
      <div className="soullab-bottom-nav-grid">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`
                soullab-bottom-nav-item
                ${isActive ? 'active' : ''}
              `}
            >
              <motion.div
                className="relative"
                whileTap={{ scale: 0.95 }}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    className="absolute -top-1 left-1/2 w-1 h-1 bg-soullab-fire rounded-full"
                    style={{ transform: 'translateX(-50%)' }}
                    layoutId="activeIndicator"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                
                {/* Icon */}
                <motion.div
                  className={`
                    transition-colors duration-fast
                    ${isActive ? 'text-soullab-fire' : 'text-soullab-gray'}
                  `}
                  animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {item.icon}
                </motion.div>
              </motion.div>
              
              {/* Label */}
              <span className="soullab-bottom-nav-label">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

// Sacred Navigation for larger screens
export const SacredTopNavigation: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="soullab-nav">
      <div className="soullab-container flex items-center justify-between py-soullab-sm">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-soullab-elemental rounded-soullab-spiral flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-soullab-white" />
          </div>
          <span className="soullab-text-brand text-soullab-black">
            SOULLAB
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-soullab-lg">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`
                  soullab-nav-item group relative
                  ${isActive ? 'active' : ''}
                `}
              >
                <div className="flex items-center gap-2">
                  <span className="transition-transform group-hover:scale-110">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                
                {/* Active underline */}
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-soullab-fire"
                    layoutId="activeUnderline"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-soullab-sm">
          <button className="w-8 h-8 bg-soullab-fire/10 rounded-soullab-spiral flex items-center justify-center">
            <span className="text-soullab-fire text-sm font-semibold">M</span>
          </button>
        </div>
      </div>
    </nav>
  );
};