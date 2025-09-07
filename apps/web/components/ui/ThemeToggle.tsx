'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [previousTheme, setPreviousTheme] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    setPreviousTheme(theme || 'system');
  }, []);

  // Log theme changes to Supabase
  const logThemeChange = async (newTheme: string) => {
    try {
      // Get current user session if available
      const { data: { session } } = await supabase.auth.getSession();
      
      // Log to event_logs table
      await supabase.from('event_logs').insert({
        event_name: 'theme_changed',
        user_id: session?.user?.id || null,
        metadata: {
          theme: newTheme,
          previous: previousTheme,
          timestamp: new Date().toISOString(),
        },
        payload: {
          new: newTheme,
          previous: previousTheme,
          session_id: session?.access_token?.substring(0, 8) || null,
        }
      });

      // Update user profile if logged in
      if (session?.user?.id) {
        await supabase
          .from('profiles')
          .update({ theme_preference: newTheme })
          .eq('id', session.user.id);
      }
    } catch (error) {
      console.warn('Failed to log theme change:', error);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    logThemeChange(newTheme);
    setPreviousTheme(newTheme);
  };

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-1">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => handleThemeChange('light')}
        className={`p-2 rounded-full border transition-all duration-200
                   ${theme === 'light' 
                     ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
                     : 'border-gray-400 dark:border-gray-600 bg-white dark:bg-neutral-900'
                   } shadow-md hover:shadow-lg`}
        aria-label="Light mode"
      >
        <Sun className={`w-5 h-5 ${theme === 'light' ? 'text-yellow-600' : 'text-gray-500'}`} />
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => handleThemeChange('dark')}
        className={`p-2 rounded-full border transition-all duration-200
                   ${theme === 'dark' 
                     ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                     : 'border-gray-400 dark:border-gray-600 bg-white dark:bg-neutral-900'
                   } shadow-md hover:shadow-lg`}
        aria-label="Dark mode"
      >
        <Moon className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-600' : 'text-gray-500'}`} />
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => handleThemeChange('system')}
        className={`p-2 rounded-full border transition-all duration-200
                   ${theme === 'system' 
                     ? 'border-stone-500 bg-stone-50 dark:bg-stone-900/20' 
                     : 'border-gray-400 dark:border-gray-600 bg-white dark:bg-neutral-900'
                   } shadow-md hover:shadow-lg`}
        aria-label="System default"
      >
        <Monitor className={`w-5 h-5 ${theme === 'system' ? 'text-stone-600' : 'text-gray-500'}`} />
      </motion.button>
    </div>
  );
}