// RouteTransition.tsx - Sacred route transitions

'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RouteTransitionProps {
  children: React.ReactNode;
}

export default function RouteTransition({ children }: RouteTransitionProps) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 600);
    return () => clearTimeout(timer);
  }, [pathname]);

  const getElementalTheme = (path: string) => {
    if (path.includes('oracle')) return 'aether';
    if (path.includes('journal')) return 'water';
    if (path.includes('profile')) return 'earth';
    if (path.includes('dashboard')) return 'air';
    if (path.includes('dream')) return 'fire';
    return 'aether';
  };

  const element = getElementalTheme(pathname);
  const gradients = {
    fire: 'from-fire-900/20 via-transparent to-transparent',
    water: 'from-water-900/20 via-transparent to-transparent',
    earth: 'from-earth-900/20 via-transparent to-transparent',
    air: 'from-air-900/20 via-transparent to-transparent',
    aether: 'from-aether-900/20 via-transparent to-transparent',
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isTransitioning && (
          <motion.div
            key="transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 pointer-events-none"
          >
            {/* Elemental transition overlay */}
            <div className={`absolute inset-0 bg-gradient-radial ${gradients[element as keyof typeof gradients]}`} />
            
            {/* Sacred geometry animation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: 1, rotate: 180 }}
                exit={{ scale: 0, rotate: 360 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="w-32 h-32"
              >
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 rounded-full border-2 border-gold/30 animate-pulse" />
                  <div className="absolute inset-2 rounded-full border-2 border-gold/20 animate-pulse animation-delay-100" />
                  <div className="absolute inset-4 rounded-full border-2 border-gold/10 animate-pulse animation-delay-200" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {children}
      </motion.div>
    </>
  );
}