import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { IconTrendingUp } from './icons';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  icon?: React.ReactNode;
  accent?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'muted';
  className?: string;
  onClick?: () => void;
  loading?: boolean;
}

/**
 * StatCard - A modern, professionally designed component for displaying statistics
 * with subtle animations and hover effects
 */
export function StatCard({
  title,
  value,
  change,
  icon,
  accent = 'primary',
  className,
  onClick,
  loading = false,
}: StatCardProps) {
  // Determine accent color classes
  const accentClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-amber-500/10 text-amber-600',
    error: 'bg-destructive/10 text-destructive',
    info: 'bg-blue-500/10 text-blue-600',
    muted: 'bg-muted text-muted-foreground',
  };

  // Determine trend color classes
  const trendClasses = {
    up: 'text-success',
    down: 'text-destructive',
    neutral: 'text-muted-foreground',
  };

  // Animation variants
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    hover: { 
      y: -5,
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      transition: { 
        duration: 0.2,
        ease: 'easeOut'
      }
    }
  };

  return (
    <motion.div
      className={cn(
        'rounded-xl bg-card border p-6 transition-all',
        'relative overflow-hidden',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      initial="initial"
      animate="animate"
      whileHover={onClick ? "hover" : undefined}
      variants={cardVariants}
    >
      {/* Decorative accent bar */}
      <div className={cn('absolute top-0 left-0 w-full h-1', 
        accent === 'primary' && 'bg-primary',
        accent === 'success' && 'bg-success',
        accent === 'warning' && 'bg-amber-500',
        accent === 'error' && 'bg-destructive',
        accent === 'info' && 'bg-blue-500',
        accent === 'muted' && 'bg-muted-foreground',
      )} />
      
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
          
          {loading ? (
            <div className="skeleton h-9 w-24 rounded"></div>
          ) : (
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
              {value}
            </h3>
          )}
          
          {change && !loading && (
            <div className="mt-2 flex items-center">
              <span className={cn('flex items-center text-xs font-medium', trendClasses[change.direction])}>
                {change.direction === 'up' && (
                  <IconTrendingUp className="h-3 w-3 mr-1 rotate-0" />
                )}
                {change.direction === 'down' && (
                  <IconTrendingUp className="h-3 w-3 mr-1 rotate-180" />
                )}
                {change.value}%
                {change.label && <span className="ml-1 text-muted-foreground">{change.label}</span>}
              </span>
            </div>
          )}
        </div>
        
        {icon && !loading && (
          <div className={cn('p-2 rounded-full', accentClasses[accent])}>
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}