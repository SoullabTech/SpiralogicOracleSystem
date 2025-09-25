'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Mic, Heart, BookOpen, Eye } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  action?: () => void;
  color: string;
}

export function HoloflowerBottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      id: 'chat',
      label: 'Chat',
      icon: <MessageSquare className="w-5 h-5" />,
      path: '/maya',
      color: '#F6AD55', // AIN Amber
    },
    {
      id: 'voice',
      label: 'Voice',
      icon: <Mic className="w-5 h-5" />,
      path: '/maya-voice',
      color: '#D4AF37', // Sacred gold
    },
    {
      id: 'journal',
      label: 'Journal',
      icon: <BookOpen className="w-5 h-5" />,
      path: '/journal',
      color: '#D4B896', // Light amber
    },
    {
      id: 'about',
      label: 'About',
      icon: <Heart className="w-5 h-5" />,
      path: '/about',
      color: '#FFD700', // Gold
    },
    {
      id: 'monitor',
      label: 'Monitor',
      icon: <Eye className="w-5 h-5" />,
      path: '/beta/monitor',
      color: '#F6AD55', // Amber
    },
  ];

  const handleNavClick = (item: NavItem) => {
    if (item.path) {
      router.push(item.path);
    } else if (item.action) {
      item.action();
    }
  };

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-xl border-t border-white/10"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const isActive = item.path && pathname === item.path;

          return (
            <motion.button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className="relative flex flex-col items-center gap-1 p-2 min-w-[60px] touch-manipulation"
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

              {/* Icon with glow effect */}
              <motion.div
                className="relative"
                animate={{
                  color: isActive ? item.color : '#ffffff60',
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                {item.icon}

                {/* Subtle glow for journal */}
                {item.id === 'journal' && (
                  <motion.div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, ${item.color}30 0%, transparent 70%)`,
                    }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 0.2, 0.5],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </motion.div>

              {/* Label */}
              <motion.span
                animate={{
                  color: isActive ? item.color : '#ffffff40',
                  opacity: isActive ? 1 : 0.6,
                }}
                className="text-[11px] font-light mt-0.5"
              >
                {item.label}
              </motion.span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}