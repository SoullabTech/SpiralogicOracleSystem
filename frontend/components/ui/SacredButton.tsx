'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SacredButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'fire' | 'earth' | 'water' | 'air';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
}

export const SacredButton: React.FC<SacredButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  children,
  className = '',
  onClick,
  type = 'button'
}) => {
  const [isClicked, setIsClicked] = useState(false);
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    // Create natural ripple effect
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();
      
      setRipples(prev => [...prev, { x, y, id }]);
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== id));
      }, 600);
    }

    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 200);

    if (onClick) onClick(e);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-soullab-sm py-soullab-xs text-sm';
      case 'md':
        return 'px-soullab-md py-soullab-sm text-base';
      case 'lg':
        return 'px-soullab-lg py-soullab-md text-lg';
      case 'xl':
        return 'px-soullab-xl py-soullab-md text-xl';
      default:
        return 'px-soullab-md py-soullab-sm text-base';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'soullab-button';
      case 'secondary':
        return 'soullab-button-secondary';
      case 'ghost':
        return 'bg-transparent text-soullab-gray hover:text-soullab-fire hover:bg-soullab-fire/5';
      case 'fire':
        return 'bg-soullab-fire text-soullab-white hover:bg-soullab-fire/90';
      case 'earth':
        return 'soullab-button-earth';
      case 'water':
        return 'soullab-button-water';
      case 'air':
        return 'soullab-button-air';
      default:
        return 'soullab-button';
    }
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      ref={buttonRef}
      className={`
        relative inline-flex items-center justify-center
        ${getSizeClasses()}
        ${getVariantClasses()}
        font-semibold
        transition-all duration-normal
        ${!isDisabled && 'hover:scale-[1.02] active:scale-[0.98]'}
        ${isDisabled && 'opacity-50 cursor-not-allowed'}
        overflow-hidden group
        ${className}
      `}
      onClick={handleClick}
      disabled={isDisabled}
      type={type}
      whileHover={!isDisabled ? { y: -1 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
    >
      {/* Natural ripple effects */}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full bg-white/20"
            style={{
              left: ripple.x,
              top: ripple.y,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ width: 0, height: 0, opacity: 1 }}
            animate={{ width: 120, height: 120, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit">
          <div className="soullab-spinner" />
        </div>
      )}

      {/* Button content */}
      <span className={`relative z-10 flex items-center gap-2 ${loading && 'invisible'}`}>
        {icon && iconPosition === 'left' && (
          <span className="transition-transform group-hover:scale-110">
            {icon}
          </span>
        )}
        {children}
        {icon && iconPosition === 'right' && (
          <span className="transition-transform group-hover:scale-110">
            {icon}
          </span>
        )}
      </span>
    </motion.button>
  );
};

// Sacred Icon Button
interface SacredIconButtonProps extends Omit<SacredButtonProps, 'children'> {
  icon: React.ReactNode;
  label?: string;
}

export const SacredIconButton: React.FC<SacredIconButtonProps> = ({
  icon,
  label,
  size = 'md',
  className = '',
  ...props
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8';
      case 'md':
        return 'w-10 h-10';
      case 'lg':
        return 'w-12 h-12';
      case 'xl':
        return 'w-14 h-14';
      default:
        return 'w-10 h-10';
    }
  };

  return (
    <SacredButton
      {...props}
      size={size}
      className={`${getSizeClasses()} !p-0 ${className}`}
      aria-label={label}
    >
      {icon}
    </SacredButton>
  );
};

// Sacred Button Group
interface SacredButtonGroupProps {
  children: React.ReactNode;
  variant?: 'separate' | 'connected';
  className?: string;
}

export const SacredButtonGroup: React.FC<SacredButtonGroupProps> = ({
  children,
  variant = 'separate',
  className = ''
}) => {
  return (
    <div 
      className={`
        inline-flex 
        ${variant === 'connected' ? 'divide-x divide-sacred-mystic-blue/40' : 'gap-2'}
        ${className}
      `}
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child) && variant === 'connected') {
          return React.cloneElement(child as React.ReactElement<any>, {
            className: `${child.props.className || ''} ${
              index === 0 ? 'rounded-r-none' : 
              index === React.Children.count(children) - 1 ? 'rounded-l-none' : 
              'rounded-none'
            }`
          });
        }
        return child;
      })}
    </div>
  );
};

// Sacred Floating Action Button
interface SacredFABProps extends SacredIconButtonProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const SacredFAB: React.FC<SacredFABProps> = ({
  position = 'bottom-right',
  className = '',
  ...props
}) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'bottom-sacred-lg right-sacred-lg';
      case 'bottom-left':
        return 'bottom-sacred-lg left-sacred-lg';
      case 'top-right':
        return 'top-sacred-lg right-sacred-lg';
      case 'top-left':
        return 'top-sacred-lg left-sacred-lg';
      default:
        return 'bottom-sacred-lg right-sacred-lg';
    }
  };

  return (
    <motion.div
      className={`fixed ${getPositionClasses()} z-50`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <SacredIconButton
        {...props}
        size="lg"
        className={`shadow-sacred-float ${className}`}
      />
    </motion.div>
  );
};