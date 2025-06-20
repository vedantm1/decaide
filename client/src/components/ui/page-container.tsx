import React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  withPadding?: boolean;
  withAnimation?: boolean;
  animate?: "fadeIn" | "slideUp" | "slideRight";
  staggered?: boolean;
}

/**
 * PageContainer - A consistent container for page content
 * 
 * This component provides consistent spacing, width constraints, and animations
 * for page content throughout the application.
 */
export function PageContainer({
  children,
  className,
  fullWidth = false,
  withPadding = true,
  withAnimation = true,
  animate = "fadeIn",
  staggered = false,
}: PageContainerProps) {
  const animationClass = withAnimation
    ? animate === "fadeIn"
      ? "fade-in"
      : animate === "slideUp"
      ? "slide-up"
      : "slide-in-right"
    : "";

  return (
    <div
      className={cn(
        "w-full",
        !fullWidth && "max-w-7xl mx-auto",
        withPadding && "px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-10",
        animationClass,
        className
      )}
    >
      {staggered
        ? React.Children.map(children, (child, index) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as React.ReactElement<any>, {
                className: cn(child.props.className, "staggered-item"),
                style: {
                  animationDelay: `${index * 0.1}s`,
                },
              });
            }
            return child;
          })
        : children}
    </div>
  );
}

interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  id?: string;
  withBorder?: boolean;
  withBackground?: boolean;
  withAnimation?: boolean;
  animate?: "fadeIn" | "slideUp" | "slideRight";
}

/**
 * PageSection - A consistent section container for page content
 * 
 * This component provides consistent spacing, borders, backgrounds, and animations
 * for page sections throughout the application.
 */
export function PageSection({
  children,
  className,
  title,
  subtitle,
  id,
  withBorder = false,
  withBackground = false,
  withAnimation = true,
  animate = "fadeIn",
}: PageSectionProps) {
  const animationClass = withAnimation
    ? animate === "fadeIn"
      ? "fade-in"
      : animate === "slideUp"
      ? "slide-up"
      : "slide-in-right"
    : "";

  return (
    <section
      id={id}
      className={cn(
        "my-8",
        withBorder && "border border-border rounded-lg",
        withBackground && "bg-card p-6 shadow-sm",
        animationClass,
        className
      )}
    >
      {title && (
        <div className="mb-6">
          <h2 className="heading-2 text-2xl font-bold text-foreground mb-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-muted-foreground text-lg">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href: string }[];
  className?: string;
  centerAlign?: boolean;
}

/**
 * PageHeader - A consistent header for pages
 * 
 * This component provides a consistent header with title, subtitle, actions, and
 * optional breadcrumbs for pages throughout the application.
 */
export function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumbs,
  className,
  centerAlign = false,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-8 fade-in",
        centerAlign && "text-center",
        className
      )}
    >
      {breadcrumbs && (
        <div className="mb-4 flex items-center text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.href}>
              {index > 0 && <span className="mx-2">/</span>}
              <a
                href={crumb.href}
                className="hover:text-primary transition-colors"
              >
                {crumb.label}
              </a>
            </React.Fragment>
          ))}
        </div>
      )}
      <div
        className={cn(
          "flex flex-col sm:flex-row gap-4",
          centerAlign ? "items-center justify-center" : "items-start sm:items-center sm:justify-between"
        )}
      >
        <div>
          <h1 className="heading-1 text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-lg text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}

interface DashboardCardProps {
  children: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  withHoverEffect?: boolean;
  onClick?: () => void;
  loading?: boolean;
}

/**
 * DashboardCard - A consistent card for dashboard content
 * 
 * This component provides a consistent card with title, icon, actions, and
 * hover effects for dashboard content throughout the application.
 */
export function DashboardCard({
  children,
  title,
  icon,
  actions,
  className,
  withHoverEffect = true,
  onClick,
  loading = false,
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow-sm",
        withHoverEffect && "hover-lift transition-all",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {(title || icon || actions) && (
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            {icon && <div className="text-primary">{icon}</div>}
            {title && <h3 className="font-semibold">{title}</h3>}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className="p-6">
        {loading ? (
          <div className="space-y-3">
            <div className="skeleton h-4 w-3/4 rounded"></div>
            <div className="skeleton h-4 w-1/2 rounded"></div>
            <div className="skeleton h-4 w-5/6 rounded"></div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

/**
 * EmptyState - A consistent empty state for content
 * 
 * This component provides a consistent empty state with title, description,
 * icon, and action for content throughout the application.
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/50 p-8 text-center fade-in",
        className
      )}
    >
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="mb-2 text-lg font-medium">{title}</h3>
      <p className="mb-6 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}