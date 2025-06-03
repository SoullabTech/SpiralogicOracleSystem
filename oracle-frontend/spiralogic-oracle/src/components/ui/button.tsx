'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition',
          variant === 'outline' && 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50',
          variant === 'ghost' && 'bg-transparent text-indigo-600 hover:underline',
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
