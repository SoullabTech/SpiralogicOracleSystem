// scroll-area.tsx
import React from 'react';

export function ScrollArea({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`overflow-y-auto max-h-60 ${className}`}>
      {children}
    </div>
  );
}
