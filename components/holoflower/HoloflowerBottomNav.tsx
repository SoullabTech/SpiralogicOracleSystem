'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Mic, Heart, BookOpen, Eye, Flower2 } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { OrganicHoloflowerCheckIn } from './OrganicHoloflowerCheckIn';

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
  const [showHoloflower, setShowHoloflower] = useState(false);

  const navItems: NavItem[] = [
    {
      id: 'chat',
      label: 'Chat',
      icon: <MessageSquare className="w-5 h-5" />,
      action: () => window.dispatchEvent(new CustomEvent('toggleChat')),
      color: '#D4B896',
    },
    {
      id: 'voice',
      label: 'Voice',
      icon: <Mic className="w-5 h-5" />,
      action: () => window.dispatchEvent(new CustomEvent('toggleVoice')),
      color: '#68D391',
    },
    {
      id: 'heart',
      label: 'Heart',
      icon: <Heart className="w-5 h-5" />,
      action: () => window.dispatchEvent(new CustomEvent('toggleHeart')),
      color: '#FF6B6B',
    },
    {
      id: 'journal',
      label: 'Journal',
      icon: <BookOpen className="w-5 h-5" />,
      path: '/journal',
      color: '#4A90E2',
    },
    {
      id: 'vision',
      label: 'Vision',
      icon: <Eye className="w-5 h-5" />,
      action: () => window.dispatchEvent(new CustomEvent('toggleVision')),
      color: '#E5C9A6',
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
    <>
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-xl border-t border-white/10"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* Floating Holoflower Button */}
        <motion.button
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowHoloflower(true)}
          className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full shadow-2xl flex items-center justify-center group"
          style={{
            boxShadow: '0 8px 32px rgba(147,51,234,0.5), 0 0 80px rgba(147,51,234,0.3)',
            zIndex: 100
          }}
        >
          <Flower2 className="w-8 h-8 text-white drop-shadow-lg" />
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)'
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          <div className="absolute -top-10 bg-black/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none border border-white/20">
            🌸 Daily Check-In
          </div>
        </motion.button>

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

      {/* Organic Holoflower Check-in Modal */}
      <OrganicHoloflowerCheckIn
        isOpen={showHoloflower}
        onClose={() => setShowHoloflower(false)}
        onSubmit={(values, crystalFocus, insights) => {
          console.log('Holoflower check-in completed:', { values, crystalFocus, insights });
          // Trigger journal flow or other actions
          window.dispatchEvent(new CustomEvent('holoflowerCheckInComplete', { detail: insights }));
        }}
      />
    </>
  );
}