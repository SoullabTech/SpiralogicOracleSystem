// useElementTheme - Returns current elemental accent from PSI state
// Provides dynamic theming based on user's active element
"use client";

import { useState, useEffect } from 'react';

export type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether';

export interface ElementTheme {
  element: Element;
  accent: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
}

const ELEMENT_THEMES: Record<Element, ElementTheme> = {
  fire: {
    element: 'fire',
    accent: '#FF5A3C',
    textClass: 'text-elemental-fire',
    bgClass: 'bg-elemental-fire',
    borderClass: 'border-elemental-fire',
  },
  water: {
    element: 'water', 
    accent: '#3CB9FF',
    textClass: 'text-elemental-water',
    bgClass: 'bg-elemental-water',
    borderClass: 'border-elemental-water',
  },
  earth: {
    element: 'earth',
    accent: '#30C384',
    textClass: 'text-elemental-earth',
    bgClass: 'bg-elemental-earth', 
    borderClass: 'border-elemental-earth',
  },
  air: {
    element: 'air',
    accent: '#C9D3E6',
    textClass: 'text-elemental-air',
    bgClass: 'bg-elemental-air',
    borderClass: 'border-elemental-air',
  },
  aether: {
    element: 'aether',
    accent: '#A88BFF',
    textClass: 'text-elemental-aether',
    bgClass: 'bg-elemental-aether',
    borderClass: 'border-elemental-aether',
  },
};

export function useElementTheme(): ElementTheme {
  const [currentElement, setCurrentElement] = useState<Element>('air'); // Default to Air

  useEffect(() => {
    // TODO: Connect to PSI state provider when available
    // For now, check localStorage for user's focus element from Soul Mirror
    const savedElement = localStorage.getItem('soul-mirror-focus');
    if (savedElement && savedElement in ELEMENT_THEMES) {
      setCurrentElement(savedElement as Element);
    }
  }, []);

  // Listen for element changes from Soul Mirror
  useEffect(() => {
    const handleElementChange = (event: CustomEvent<{ element: Element }>) => {
      setCurrentElement(event.detail.element);
      localStorage.setItem('soul-mirror-focus', event.detail.element);
    };

    window.addEventListener('element-focus-changed', handleElementChange as EventListener);
    return () => {
      window.removeEventListener('element-focus-changed', handleElementChange as EventListener);
    };
  }, []);

  return ELEMENT_THEMES[currentElement];
}

// Helper to dispatch element changes
export function setElementFocus(element: Element) {
  const event = new CustomEvent('element-focus-changed', { 
    detail: { element } 
  });
  window.dispatchEvent(event);
}