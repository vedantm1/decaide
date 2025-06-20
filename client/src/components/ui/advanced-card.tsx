import React from "react";
import { cn } from "@/lib/utils";

interface AdvancedCardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  loading?: boolean;
  startLoading?: boolean;
  borderColor?: "primary" | "success" | "error" | "warning" | "muted" | "none";
  elevation?: "flat" | "low" | "medium" | "high";
  children: React.ReactNode;
  hoverable?: boolean;
  interactive?: boolean;
  layout?: "default" | "horizontal" | "centered";
  contentClassName?: string;
  className?: string;
  onClick?: () => void;
}

/**
 * Advanced Card Component with multiple display options and built-in loading state
 */
export function AdvancedCard({
  title,
  subtitle,
  icon,
  actions,
  footer,
  loading = false,
  startLoading = false,
  borderColor = "none",
  elevation = "low",
  children,
  hoverable = false,
  interactive = false,
  layout = "default",
  className,
  contentClassName,
  onClick,
  ...props
}: AdvancedCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden bg-card text-card-foreground",
        
        // Border styling
        borderColor === "none" ? "border" : `border-l-4`,
        borderColor === "primary" && "border-l-primary",
        borderColor === "success" && "border-l-success",
        borderColor === "error" && "border-l-destructive",
        borderColor === "warning" && "border-l-amber-500",
        borderColor === "muted" && "border-l-muted",
        
        // Elevation/shadow styling
        elevation === "flat" && "shadow-none",
        elevation === "low" && "shadow-sm",
        elevation === "medium" && "shadow-md",
        elevation === "high" && "shadow-lg",
        
        // Hover effect
        hoverable && !loading && "hover-lift",
        interactive && !loading && "cursor-pointer hover:border-primary transition-colors",
        
        // Layout variations
        layout === "horizontal" && "flex items-stretch",
        
        loading && "opacity-80",
        startLoading && "animate-pulse",
        className
      )}
      onClick={interactive && !loading ? onClick : undefined}
      {...props}
    >
      {/* Card Header */}
      {(title || subtitle || icon || actions) && (
        <div className={cn(
          "flex items-center justify-between p-6 border-b",
          layout === "centered" && "text-center flex-col space-y-2"
        )}>
          <div className={cn(
            "flex items-center",
            layout === "centered" && "flex-col space-y-1"
          )}>
            {icon && (
              <div className={cn(
                "mr-3 text-primary text-xl",
                layout === "centered" && "mb-2 mr-0"
              )}>
                {icon}
              </div>
            )}
            {(title || subtitle) && (
              <div>
                {title && (
                  <h3 className={cn(
                    "text-lg font-medium leading-none tracking-tight",
                    startLoading && "skeleton w-32 h-6"
                  )}>
                    {startLoading ? '' : title}
                  </h3>
                )}
                {subtitle && (
                  <p className={cn(
                    "text-sm text-muted-foreground mt-1",
                    startLoading && "skeleton w-48 h-4 mt-2"
                  )}>
                    {startLoading ? '' : subtitle}
                  </p>
                )}
              </div>
            )}
          </div>
          {actions && !startLoading && (
            <div className="flex-shrink-0 flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      
      {/* Card Content */}
      <div className={cn(
        "p-6", 
        layout === "centered" && "text-center",
        contentClassName
      )}>
        {loading ? (
          <div className="space-y-3">
            <div className="skeleton h-5 w-3/4 rounded"></div>
            <div className="skeleton h-4 w-full rounded"></div>
            <div className="skeleton h-4 w-full rounded"></div>
            <div className="skeleton h-4 w-2/3 rounded"></div>
          </div>
        ) : (
          children
        )}
      </div>
      
      {/* Card Footer */}
      {footer && !loading && (
        <div className={cn(
          "px-6 py-4 bg-muted/50 border-t",
          layout === "centered" && "text-center"
        )}>
          {footer}
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
    label?: string;
  };
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * StatCard - A special card design for displaying stats and metrics
 */
export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  loading = false,
  className,
  onClick,
}: StatCardProps) {
  return (
    <div 
      className={cn(
        "rounded-xl border bg-card p-6 transition-all",
        onClick && !loading && "cursor-pointer hover-lift",
        className
      )}
      onClick={!loading ? onClick : undefined}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          {loading ? (
            <div className="skeleton h-9 w-24 rounded"></div>
          ) : (
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {value}
            </h3>
          )}
          
          {trend && !loading && (
            <div className="mt-2 flex items-center gap-1">
              <span className={cn(
                "text-xs font-medium",
                trend.direction === "up" && "text-success",
                trend.direction === "down" && "text-destructive",
                trend.direction === "neutral" && "text-muted-foreground"
              )}>
                {trend.direction === "up" && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline mr-1">
                    <path d="M3 5L6 2L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 10L6 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {trend.direction === "down" && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline mr-1">
                    <path d="M3 7L6 10L9 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 2L6 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {trend.direction === "neutral" && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline mr-1">
                    <path d="M2 6H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {trend.value}% {trend.label}
              </span>
            </div>
          )}
          
          {description && !loading && (
            <p className="mt-2 text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        
        {icon && !loading && (
          <div className="rounded-full p-2 bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

interface CardListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  divider?: boolean;
  spacing?: "none" | "tight" | "normal" | "loose";
}

/**
 * CardList - Container for displaying lists within cards
 */
export function CardList({
  children,
  divider = true,
  spacing = "normal",
  className,
  ...props
}: CardListProps) {
  return (
    <div
      className={cn(
        spacing === "none" && "space-y-0",
        spacing === "tight" && "space-y-1",
        spacing === "normal" && "space-y-2",
        spacing === "loose" && "space-y-4",
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <div key={index}>
          {child}
          {divider && index < React.Children.count(children) - 1 && (
            <div className="border-b my-2 last:border-0 last:my-0" />
          )}
        </div>
      ))}
    </div>
  );
}

interface CardListItemProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
  avatar?: React.ReactNode;
  action?: React.ReactNode;
  loading?: boolean;
  selected?: boolean;
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * CardListItem - Individual list item for CardList
 */
export function CardListItem({
  title,
  description,
  icon,
  extra,
  avatar,
  action,
  loading = false,
  selected = false,
  interactive = false,
  className,
  onClick,
  ...props
}: CardListItemProps) {
  return (
    <div
      className={cn(
        "flex items-center py-2",
        interactive && "cursor-pointer hover:bg-muted/50 rounded-md transition-colors",
        selected && "bg-muted/60 rounded-md",
        className
      )}
      onClick={interactive ? onClick : undefined}
      {...props}
    >
      {avatar && (
        <div className="mr-3 flex-shrink-0">
          {loading ? (
            <div className="skeleton w-10 h-10 rounded-full"></div>
          ) : (
            avatar
          )}
        </div>
      )}
      
      {icon && !avatar && (
        <div className="mr-3 flex-shrink-0 text-muted-foreground">
          {loading ? (
            <div className="skeleton w-5 h-5 rounded"></div>
          ) : (
            icon
          )}
        </div>
      )}
      
      <div className="flex-grow min-w-0">
        {loading ? (
          <div className="space-y-2">
            <div className="skeleton h-4 w-1/3 rounded"></div>
            <div className="skeleton h-3 w-2/3 rounded"></div>
          </div>
        ) : (
          <>
            {title && (
              <div className="font-medium truncate">{title}</div>
            )}
            {description && (
              <div className="text-sm text-muted-foreground truncate">
                {description}
              </div>
            )}
            {extra && (
              <div className="text-xs text-muted-foreground mt-1">
                {extra}
              </div>
            )}
          </>
        )}
      </div>
      
      {action && !loading && (
        <div className="ml-3 flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}