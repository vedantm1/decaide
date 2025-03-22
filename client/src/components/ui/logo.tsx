import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'default' | 'minimal' | 'tropical' | 'full';
  mode?: 'dark' | 'light';
  className?: string;
  width?: number;
  height?: number;
  showText?: boolean;
  showTagline?: boolean;
}

/**
 * DecA(I)de Logo Component
 * 
 * This component renders the DecA(I)de logo in various styles and configurations.
 * 
 * @param variant - The logo variant to display ('default', 'minimal', 'tropical', 'full')
 * @param mode - The color mode ('dark' or 'light')
 * @param className - Additional CSS classes to apply
 * @param width - Width of the logo (defaults to 40)
 * @param height - Height of the logo (defaults to 40)
 * @param showText - Whether to display the "DecA(I)de" text (for non-full variants)
 * @param showTagline - Whether to display the tagline (only works with showText)
 */
export function Logo({ 
  variant = 'default', 
  mode = 'dark',
  className,
  width = 40,
  height = 40,
  showText = false,
  showTagline = false
}: LogoProps) {
  const getLogoSrc = () => {
    if (variant === 'full') {
      return mode === 'dark' 
        ? '/src/assets/decade-full-logo.svg'
        : '/src/assets/decade-full-logo-light.svg';
    }
    
    if (variant === 'minimal') {
      return '/src/assets/decade-logo-minimal.svg';
    }
    
    if (variant === 'tropical') {
      return '/src/assets/decade-logo-tropical.svg';
    }
    
    // Default logo
    return mode === 'dark'
      ? '/src/assets/decade-logo-main.svg'
      : '/src/assets/decade-logo-light.svg';
  };
  
  // Full logo already includes text and possibly tagline
  if (variant === 'full') {
    return (
      <img 
        src={getLogoSrc()} 
        alt="DecA(I)de Logo" 
        className={cn('object-contain', className)} 
        width={width} 
        height={height}
      />
    );
  }
  
  // Other variants may have text optionally added
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Modern logo using SVG directly instead of an image */}
      <div 
        className={cn(
          "rounded-lg flex items-center justify-center",
          mode === 'dark' ? 'bg-blue-600' : 'bg-blue-500'
        )}
        style={{ width: width, height: height }}
      >
        <svg viewBox="0 0 24 24" width={width * 0.6} height={height * 0.6} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z" 
            fill="white"
            fillOpacity="0.9"
          />
          <path 
            d="M8 8L16 8C17.1046 8 18 8.89543 18 10L18 14C18 15.1046 17.1046 16 16 16L8 16C6.89543 16 6 15.1046 6 14L6 10C6 8.89543 6.89543 8 8 8Z" 
            fill="#FFD700"
            fillOpacity="0.2"
          />
          <path 
            d="M10 12L14 14.5V9.5L10 12Z" 
            fill="#FFD700"
          />
        </svg>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={cn(
            'font-bold text-lg leading-tight', 
            mode === 'dark' ? 'text-white' : 'text-slate-900'
          )}>
            DecA<span className="text-primary">(I)</span>de
          </span>
          
          {showTagline && (
            <span className={cn(
              'text-xs', 
              mode === 'dark' ? 'text-slate-300' : 'text-slate-600'
            )}>
              Who says there's no I in team?
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default Logo;