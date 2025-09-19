'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Home, BookOpen, Shuffle, Moon, Mic } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

const navItems: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: <Home className="w-4 h-4 sm:w-5 sm:h-5" />,
    path: '/',
    color: '#D4B896',
  },
  {
    id: 'journal',
    label: 'Journal',
    icon: <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />,
    path: '/journal',
    color: '#4A90E2',
  },
  {
    id: 'wild-petal',
    label: 'Wild Petal',
    icon: <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />,
    path: '/wild-petal',
    color: '#FF6B6B',
  },
  {
    id: 'dream',
    label: 'Dream',
    icon: <Moon className="w-4 h-4 sm:w-5 sm:h-5" />,
    path: '/dream',
    color: '#E5C9A6',
  },
  {
    id: 'voice',
    label: 'Voice',
    icon: <Mic className="w-4 h-4 sm:w-5 sm:h-5" />,
    path: '/voice-settings',
    color: '#68D391',
  },
];

export function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavClick = (path: string) => {
    if (path === '/wild-petal') {
      // Trigger wild petal draw instead of navigation
      window.dispatchEvent(new CustomEvent('drawWildPetal'));
    } else {
      router.push(path);
    }
  };

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-30 bg-black/80 backdrop-blur-xl border-t border-white/10 pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="flex items-center justify-around px-2 sm:px-4 py-1 sm:py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => handleNavClick(item.path)}
              className="relative flex flex-col items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 min-w-[50px] sm:min-w-[60px]"
              whileTap={{ scale: 0.95 }}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 rounded-xl"
                  style={{ backgroundColor: `${item.color}20` }}
                />
              )}

              {/* Icon container */}
              <motion.div
                animate={{
                  color: isActive ? item.color : '#ffffff60',
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                {item.icon}
              </motion.div>

              {/* Label */}
              <motion.span
                animate={{
                  color: isActive ? item.color : '#ffffff60',
                }}
                className="text-[10px] sm:text-xs font-light"
              >
                {item.label}
              </motion.span>

              {/* Special pulse for Wild Petal */}
              {item.id === 'wild-petal' && (
                <motion.div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(255, 107, 107, 0)',
                      '0 0 0 10px rgba(255, 107, 107, 0.1)',
                      '0 0 0 0 rgba(255, 107, 107, 0)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}