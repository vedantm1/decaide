import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useUIState } from "@/hooks/use-ui-state";

interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: {
    text: string;
    variant: "primary" | "secondary" | "success" | "error" | "warning";
  };
  children?: NavigationItem[];
}

interface NavigationMenuProps {
  items: NavigationItem[];
  className?: string;
  variant?: "horizontal" | "vertical";
  appearance?: "solid" | "ghost";
  size?: "sm" | "md" | "lg";
}

/**
 * Modern navigation menu component
 * 
 * Features:
 * - Horizontal or vertical layout
 * - Multiple appearance styles
 * - Size variations
 * - Support for nested navigation
 * - Active item highlighting
 * - Badge support
 * - Responsive behavior
 */
export function NavigationMenu({
  items,
  className,
  variant = "horizontal",
  appearance = "solid",
  size = "md"
}: NavigationMenuProps) {
  const [location] = useLocation();
  const { isDarkMode } = useUIState();
  
  const isActive = (href: string) => location === href;

  const containerClasses = cn(
    "flex gap-1 transition-all",
    variant === "horizontal" ? "flex-row items-center" : "flex-col",
    appearance === "solid" 
      ? "bg-card shadow-sm rounded-lg p-1 border" 
      : "px-2",
    className
  );

  const itemClasses = (active: boolean) => cn(
    "flex items-center gap-2 relative rounded-md transition-all",
    "text-foreground/70 hover:text-foreground",
    size === "sm" ? "text-xs px-2 py-1.5" : 
      size === "md" ? "text-sm px-3 py-2" : "text-base px-4 py-2.5",
    active 
      ? "text-primary bg-primary/10 font-medium hover:bg-primary/15"
      : "hover:bg-muted/80",
    variant === "vertical" && "w-full"
  );

  return (
    <nav className={containerClasses}>
      {items.map((item) => (
        <NavigationItem 
          key={item.href}
          item={item}
          isActive={isActive(item.href)}
          itemClasses={itemClasses}
          variant={variant}
          size={size}
        />
      ))}
    </nav>
  );
}

// Helper function to render a navigation item
function NavigationItem({ 
  item, 
  isActive, 
  itemClasses,
  variant,
  size
}: { 
  item: NavigationItem;
  isActive: boolean;
  itemClasses: (active: boolean) => string;
  variant: "horizontal" | "vertical";
  size: "sm" | "md" | "lg";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [location, navigate] = useLocation();

  useEffect(() => {
    // Close dropdown when location changes
    setIsOpen(false);
  }, [location]);

  const hasChildren = item.children && item.children.length > 0;

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else {
      navigate(item.href);
    }
  };

  return (
    <div className={cn("relative", variant === "vertical" && "w-full")}>
      <a 
        href={item.href}
        onClick={handleClick}
        className={cn(
          itemClasses(isActive),
          "hover-scale"
        )}
      >
        {item.icon && <span className="text-lg">{item.icon}</span>}
        <span>{item.label}</span>
        
        {item.badge && (
          <span className={cn(
            "ml-1.5 px-1.5 py-0.5 text-xs rounded-full font-medium",
            "bg-muted text-muted-foreground",
            item.badge.variant === "primary" && "bg-primary/20 text-primary",
            item.badge.variant === "success" && "bg-success/20 text-success",
            item.badge.variant === "error" && "bg-destructive/20 text-destructive",
            item.badge.variant === "warning" && "bg-amber-500/20 text-amber-600",
          )}>
            {item.badge.text}
          </span>
        )}
        
        {hasChildren && (
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 12 12" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={cn(
              "ml-auto transition-transform",
              isOpen && "transform rotate-180"
            )}
          >
            <path 
              d="M6 8.5L2 4.5H10L6 8.5Z" 
              fill="currentColor" 
            />
          </svg>
        )}
      </a>
      
      {hasChildren && isOpen && (
        <div className={cn(
          "absolute mt-1 p-1 rounded-md shadow-md border bg-card",
          "min-w-[180px] z-50",
          variant === "horizontal" ? "left-0" : "right-0",
          "fade-in"
        )}>
          {item.children!.map((child) => (
            <a
              key={child.href}
              href={child.href}
              onClick={() => navigate(child.href)}
              className={cn(
                "block px-3 py-2 text-sm rounded-md",
                "text-foreground/70 hover:text-foreground",
                "hover:bg-muted/80 transition-colors",
                location === child.href && "text-primary bg-primary/10 font-medium"
              )}
            >
              <div className="flex items-center gap-2">
                {child.icon && <span>{child.icon}</span>}
                <span>{child.label}</span>
                
                {child.badge && (
                  <span className={cn(
                    "ml-auto px-1.5 py-0.5 text-xs rounded-full font-medium",
                    "bg-muted text-muted-foreground",
                    child.badge.variant === "primary" && "bg-primary/20 text-primary",
                    child.badge.variant === "success" && "bg-success/20 text-success",
                    child.badge.variant === "error" && "bg-destructive/20 text-destructive",
                    child.badge.variant === "warning" && "bg-amber-500/20 text-amber-600",
                  )}>
                    {child.badge.text}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

interface BreadcrumbsProps {
  items: {
    label: string;
    href: string;
  }[];
  className?: string;
}

/**
 * Breadcrumbs navigation component
 */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const [, navigate] = useLocation();
  
  return (
    <nav className={cn("flex items-center space-x-1 text-sm", className)}>
      {items.map((item, index) => (
        <React.Fragment key={item.href}>
          {index > 0 && <span className="text-muted-foreground mx-1">/</span>}
          <a
            href={item.href}
            onClick={(e) => {
              e.preventDefault();
              navigate(item.href);
            }}
            className={cn(
              "hover:text-primary transition-colors",
              index === items.length - 1 
                ? "text-foreground font-medium" 
                : "text-muted-foreground"
            )}
          >
            {item.label}
          </a>
        </React.Fragment>
      ))}
    </nav>
  );
}

interface TabNavProps {
  tabs: {
    label: string;
    value: string;
    icon?: React.ReactNode;
    disabled?: boolean;
  }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  variant?: "pills" | "underlined" | "contained";
}

/**
 * Tab-based navigation component
 */
export function TabNav({
  tabs,
  value,
  onChange,
  className,
  variant = "pills"
}: TabNavProps) {
  return (
    <div className={cn(
      "flex items-center",
      variant === "contained" && "bg-muted p-1 rounded-lg",
      variant === "underlined" && "border-b",
      className
    )}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => !tab.disabled && onChange(tab.value)}
          disabled={tab.disabled}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all relative",
            variant === "pills" && "rounded-md",
            variant === "contained" && "rounded-md",
            variant === "underlined" && "border-b-2 border-transparent -mb-px",
            tab.disabled && "opacity-50 cursor-not-allowed",
            tab.value === value
              ? cn(
                  variant === "pills" && "bg-primary text-primary-foreground",
                  variant === "contained" && "bg-background shadow-sm",
                  variant === "underlined" && "border-primary text-primary"
                )
              : cn(
                  "text-muted-foreground hover:text-foreground",
                  variant === "pills" && "hover:bg-muted",
                  variant === "contained" && "hover:text-foreground",
                  variant === "underlined" && "hover:border-muted-foreground"
                )
          )}
        >
          {tab.icon && <span>{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

interface SidebarNavProps {
  items: {
    title?: string;
    links: NavigationItem[];
  }[];
  className?: string;
  collapsed?: boolean;
}

/**
 * Sidebar navigation component
 */
export function SidebarNav({ items, className, collapsed = false }: SidebarNavProps) {
  const [location] = useLocation();
  
  const isActive = (href: string) => location === href;

  return (
    <nav className={cn("space-y-6", className)}>
      {items.map((item, i) => (
        <div key={i} className="space-y-2">
          {item.title && !collapsed && (
            <h4 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {item.title}
            </h4>
          )}
          <div className="space-y-1">
            {item.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center py-2 px-3 text-sm font-medium rounded-md transition-colors hover-scale",
                  isActive(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80",
                  collapsed ? "justify-center" : "justify-start",
                )}
              >
                {link.icon && (
                  <span className={cn("text-lg", collapsed ? "mx-0" : "mr-3")}>
                    {link.icon}
                  </span>
                )}
                {!collapsed && <span>{link.label}</span>}
                {!collapsed && link.badge && (
                  <span className={cn(
                    "ml-auto px-1.5 py-0.5 text-xs rounded-full font-medium",
                    link.badge.variant === "primary" && "bg-primary/20 text-primary",
                    link.badge.variant === "success" && "bg-success/20 text-success",
                    link.badge.variant === "error" && "bg-destructive/20 text-destructive",
                    link.badge.variant === "warning" && "bg-amber-500/20 text-amber-600",
                  )}>
                    {link.badge.text}
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}