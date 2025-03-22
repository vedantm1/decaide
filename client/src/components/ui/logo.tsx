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
      <img 
        src={getLogoSrc()} 
        alt="DecA(I)de Logo" 
        className="object-contain" 
        width={width} 
        height={height}
      />
      
      {showText && (
        <div className="flex flex-col">
          <span className={cn(
            'font-bold text-lg leading-tight', 
            mode === 'dark' ? 'text-white' : 'text-slate-900'
          )}>
            DecA(I)de
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