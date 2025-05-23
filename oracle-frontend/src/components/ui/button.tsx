// src/components/ui/Button.tsx

import { cn } from '@/lib/utils'; // Make sure this exists or replace with `clsx`
import React from 'react';
import { FaSpinner } from 'react-icons/fa';

export interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ReactNode;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  className = '',
  type = 'button',
  isLoading = false,
  variant = 'primary',
  icon,
  disabled = false,
}) => {
  const baseClasses = 'inline-flex items-center px-4 py-2 rounded-md shadow-md focus:outline-none transition-all duration-300';
  const colorVariants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  const spinner = <FaSpinner className="animate-spin text-white w-4 h-4" />;

  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(baseClasses, colorVariants[variant], className)}
      disabled={isLoading || disabled}
      aria-label={typeof children === 'string' ? children : 'Button'}
    >
      {isLoading ? (
        spinner
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};
