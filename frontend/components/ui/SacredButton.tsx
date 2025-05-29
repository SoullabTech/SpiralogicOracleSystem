'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SacredButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'sacred';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  glowEffect?: boolean;
  sacredAnimation?: boolean;
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
  glowEffect = true,
  sacredAnimation = true,
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

    // Create ripple effect
    if (buttonRef.current && sacredAnimation) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();
      
      setRipples(prev => [...prev, { x, y, id }]);
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== id));
      }, 1000);
    }

    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);

    if (onClick) onClick(e);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-sacred-sm py-1 text-sm';
      case 'md':
        return 'px-sacred-md py-sacred-sm text-base';
      case 'lg':
        return 'px-sacred-lg py-sacred-md text-lg';
      case 'xl':
        return 'px-sacred-xl py-sacred-md text-xl';
      default:
        return 'px-sacred-md py-sacred-sm text-base';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-sacred-divine-gold to-sacred-amber text-sacred-cosmic-depth hover:from-sacred-amber hover:to-sacred-ethereal-gold';
      case 'secondary':
        return 'bg-transparent border-2 border-sacred-divine-gold text-sacred-divine-gold hover:bg-sacred-divine-gold/10';
      case 'ghost':
        return 'bg-transparent text-sacred-silver hover:text-sacred-divine-gold hover:bg-sacred-divine-gold/5';
      case 'sacred':
        return 'bg-gradient-to-r from-element-unity-field via-sacred-divine-gold to-element-unity-field text-sacred-cosmic-depth';
      default:
        return '';
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
        font-semibold rounded-sacred
        transition-all duration-300
        ${!isDisabled && 'hover:scale-[1.03] active:scale-[0.98]'}
        ${isDisabled && 'opacity-50 cursor-not-allowed'}
        ${glowEffect && !isDisabled && 'hover:shadow-sacred-gold'}
        overflow-hidden
        ${className}
      `}
      onClick={handleClick}
      disabled={isDisabled}
      type={type}
      whileHover={!isDisabled ? { y: -2 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
    >
      {/* Sacred glow background effect */}
      {glowEffect && !isDisabled && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-sacred-divine-gold/20 to-sacred-amber/20 blur-xl"
          animate={{
            opacity: isClicked ? [0, 1, 0] : 0
          }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* Ripple effects */}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full bg-sacred-divine-gold/30"
            style={{
              left: ripple.x,
              top: ripple.y,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ width: 0, height: 0, opacity: 1 }}
            animate={{ width: 200, height: 200, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit">
          <div className="sacred-spinner w-5 h-5" />
        </div>
      )}

      {/* Button content */}
      <span className={`relative z-10 flex items-center gap-2 ${loading && 'invisible'}`}>
        {icon && iconPosition === 'left' && (
          <motion.span
            animate={isClicked ? { rotate: 360 } : {}}
            transition={{ duration: 0.5 }}
          >
            {icon}
          </motion.span>
        )}
        {children}
        {icon && iconPosition === 'right' && (
          <motion.span
            animate={isClicked ? { rotate: 360 } : {}}
            transition={{ duration: 0.5 }}
          >
            {icon}
          </motion.span>
        )}
      </span>

      {/* Sacred shimmer effect */}
      {sacredAnimation && !isDisabled && (
        <motion.div
          className="absolute inset-0 -top-2 h-[200%] w-[200%] rotate-45 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: '-200%' }}
          animate={isClicked ? { x: '200%' } : {}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      )}
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