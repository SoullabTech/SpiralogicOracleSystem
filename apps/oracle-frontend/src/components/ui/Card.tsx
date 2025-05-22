// src/components/ui/Card.tsx
import { cn } from '@/lib/utils';
import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ className, children }) => (
  <div className={cn('rounded-2xl border bg-white shadow-md', className)}>
    {children}
  </div>
);

const CardHeader: React.FC<CardProps> = ({ className, children }) => (
  <div className={cn('border-b px-6 py-4', className)}>
    {children}
  </div>
);

const CardTitle: React.FC<CardProps> = ({ className, children }) => (
  <h3 className={cn('text-lg font-semibold leading-none tracking-tight', className)}>
    {children}
  </h3>
);

const CardContent: React.FC<CardProps> = ({ className, children }) => (
  <div className={cn('px-6 py-4', className)}>
    {children}
  </div>
);

const CardFooter: React.FC<CardProps> = ({ className, children }) => (
  <div className={cn('border-t px-6 py-4', className)}>
    {children}
  </div>
);

// ✅ Export correctly
export { Card, CardContent, CardFooter, CardHeader, CardTitle };

