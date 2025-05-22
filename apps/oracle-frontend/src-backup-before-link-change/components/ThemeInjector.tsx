// src/components/ThemeInjector.tsx
import { useEffect } from 'react';

export default function ThemeInjector() {
  useEffect(() => {
    document.documentElement.classList.add('theme-light');
  }, []);

  return null;
}
