import React from 'react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useUIState } from '@/hooks/use-ui-state';

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href: string }[];
  decorative?: boolean;
  className?: string;
  id?: string;
  centered?: boolean;
}

/**
 * Modern, professional page header component with animations
 * and perfect typography scaling
 */
export function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumbs,
  decorative = false,
  className,
  id,
  centered = false
}: PageHeaderProps) {
  const { animationMode } = useUIState();
  const isReducedMotion = animationMode === 'reduced';

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: 'beforeChildren'
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <motion.header
      id={id}
      className={cn(
        'mb-8 pb-4 relative',
        decorative && 'border-b',
        className
      )}
      initial={isReducedMotion ? undefined : "hidden"}
      animate={isReducedMotion ? undefined : "visible"}
      variants={containerVariants}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <motion.div 
          className="mb-3 flex flex-wrap items-center text-sm text-muted-foreground"
          variants={itemVariants}
        >
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.href}>
              {index > 0 && <span className="mx-2 text-muted-foreground/50">/</span>}
              <Link
                href={crumb.href}
                className={cn(
                  "transition-colors hover:text-primary",
                  index === breadcrumbs.length - 1 
                    ? "text-foreground font-medium" 
                    : "text-muted-foreground hover-underline-animation"
                )}
              >
                {crumb.label}
              </Link>
            </React.Fragment>
          ))}
        </motion.div>
      )}

      <div className={cn(
        "flex flex-col gap-4",
        centered ? "items-center text-center" : "sm:flex-row sm:items-center sm:justify-between"
      )}>
        <motion.div 
          variants={itemVariants}
          className={cn(
            centered && "flex flex-col items-center"
          )}
        >
          <h1 className={cn(
            "text-2xl sm:text-3xl md:text-3xl font-bold tracking-tight text-foreground leading-tight",
            centered && "text-center"
          )}>
            {title}
          </h1>
          {subtitle && (
            <p className={cn(
              "mt-2 text-lg text-muted-foreground",
              centered ? "max-w-2xl text-center mx-auto" : "max-w-3xl"
            )}>
              {subtitle}
            </p>
          )}
        </motion.div>

        {actions && (
          <motion.div 
            className={cn(
              "flex items-center gap-3 mt-2",
              !centered && "sm:mt-0"
            )}
            variants={itemVariants}
          >
            {actions}
          </motion.div>
        )}
      </div>

      {decorative && (
        <motion.div
          className="absolute bottom-0 left-0 w-24 h-1 bg-primary rounded-full"
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        />
      )}
    </motion.header>
  );
}

export default PageHeader;