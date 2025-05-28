'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SacredCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'premium' | 'glass' | 'sacred' | 'minimal';
  hover?: boolean;
  glow?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const SacredCard: React.FC<SacredCardProps> = ({
  children,
  variant = 'default',
  hover = true,
  glow = false,
  interactive = false,
  onClick,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getVariantClasses = () => {
    switch (variant) {
      case 'premium':
        return `
          bg-gradient-to-br from-sacred-navy/40 via-sacred-mystic-blue/20 to-sacred-navy/40
          backdrop-blur-xl border border-sacred-divine-gold/20
          shadow-sacred-deep
        `;
      case 'glass':
        return `
          bg-sacred-mystic-blue/10 backdrop-blur-2xl
          border border-sacred-silver/10
          shadow-lg
        `;
      case 'sacred':
        return `
          bg-gradient-to-br from-sacred-cosmic-depth via-sacred-navy/50 to-sacred-cosmic-depth
          border border-sacred-divine-gold/30
          shadow-sacred-gold
        `;
      case 'minimal':
        return `
          bg-sacred-navy/20 backdrop-blur-sm
          border border-sacred-mystic-blue/10
        `;
      default:
        return `
          bg-sacred-navy/30 backdrop-blur-xl
          border border-sacred-mystic-blue/20
          shadow-sacred-deep
        `;
    }
  };

  return (
    <motion.div
      className={`
        relative rounded-sacred-lg p-sacred-lg
        ${getVariantClasses()}
        ${hover && 'transition-all duration-300'}
        ${hover && !interactive && 'hover:shadow-sacred-gold hover:border-sacred-divine-gold/30'}
        ${interactive && 'cursor-pointer'}
        ${glow && 'sacred-glow'}
        overflow-hidden
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={interactive ? onClick : undefined}
      whileHover={hover ? { y: -4, scale: 1.02 } : {}}
      whileTap={interactive ? { scale: 0.98 } : {}}
    >
      {/* Sacred pattern overlay */}
      {(variant === 'premium' || variant === 'sacred') && (
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 50%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(183, 148, 246, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 20%, rgba(99, 179, 237, 0.1) 0%, transparent 50%)
              `
            }}
          />
        </div>
      )}

      {/* Hover glow effect */}
      <AnimatePresence>
        {isHovered && glow && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-sacred-divine-gold/10 to-sacred-amber/10 blur-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Interactive ripple effect */}
      {interactive && (
        <motion.div
          className="absolute inset-0 bg-sacred-divine-gold/5 rounded-sacred-lg pointer-events-none"
          initial={{ scale: 0, opacity: 0 }}
          animate={isHovered ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
};

// Sacred Card Header
interface SacredCardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const SacredCardHeader: React.FC<SacredCardHeaderProps> = ({
  title,
  subtitle,
  icon,
  action,
  className = ''
}) => {
  return (
    <div className={`flex items-start justify-between mb-sacred-md ${className}`}>
      <div className="flex items-start gap-sacred-sm">
        {icon && (
          <div className="text-sacred-divine-gold">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-sacred-xl font-semibold text-sacred-pure-light">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sacred-base text-sacred-silver mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && (
        <div className="ml-auto">
          {action}
        </div>
      )}
    </div>
  );
};

// Sacred Card Content
interface SacredCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const SacredCardContent: React.FC<SacredCardContentProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`text-sacred-silver ${className}`}>
      {children}
    </div>
  );
};

// Sacred Card Footer
interface SacredCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const SacredCardFooter: React.FC<SacredCardFooterProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`mt-sacred-md pt-sacred-md border-t border-sacred-mystic-blue/20 ${className}`}>
      {children}
    </div>
  );
};

// Sacred Stat Card
interface SacredStatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'gradient';
  className?: string;
}

export const SacredStatCard: React.FC<SacredStatCardProps> = ({
  title,
  value,
  change,
  icon,
  variant = 'default',
  className = ''
}) => {
  return (
    <SacredCard 
      variant={variant === 'gradient' ? 'sacred' : 'default'}
      className={className}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sacred-sm text-sacred-mystic-gray uppercase tracking-wider">
            {title}
          </p>
          <p className="text-sacred-2xl font-bold text-sacred-pure-light mt-2">
            {value}
          </p>
          {change && (
            <div className={`flex items-center gap-1 mt-2 text-sacred-sm ${
              change.type === 'increase' ? 'text-element-sacred-earth' : 'text-element-sacred-flame'
            }`}>
              <span>{change.type === 'increase' ? '↑' : '↓'}</span>
              <span>{Math.abs(change.value)}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-sacred-divine-gold/50">
            {icon}
          </div>
        )}
      </div>
    </SacredCard>
  );
};

// Sacred Feature Card
interface SacredFeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  features?: string[];
  action?: React.ReactNode;
  highlighted?: boolean;
  className?: string;
}

export const SacredFeatureCard: React.FC<SacredFeatureCardProps> = ({
  title,
  description,
  icon,
  features,
  action,
  highlighted = false,
  className = ''
}) => {
  return (
    <SacredCard
      variant={highlighted ? 'premium' : 'default'}
      hover={true}
      glow={highlighted}
      className={className}
    >
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-sacred bg-sacred-divine-gold/10 text-sacred-divine-gold mb-sacred-md">
          {icon}
        </div>
        <h3 className="text-sacred-xl font-semibold text-sacred-pure-light mb-sacred-sm">
          {title}
        </h3>
        <p className="text-sacred-silver mb-sacred-md">
          {description}
        </p>
        {features && features.length > 0 && (
          <ul className="space-y-2 mb-sacred-md">
            {features.map((feature, index) => (
              <li key={index} className="text-sacred-sm text-sacred-mystic-gray flex items-center justify-center gap-2">
                <span className="w-1 h-1 bg-sacred-divine-gold rounded-full" />
                {feature}
              </li>
            ))}
          </ul>
        )}
        {action && (
          <div className="mt-sacred-md">
            {action}
          </div>
        )}
      </div>
    </SacredCard>
  );
};