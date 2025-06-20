import React, { useEffect, useRef, ReactNode } from 'react';
import { motion } from 'framer-motion';

// Animation utility functions
export const initializeAnimations = () => {
  // Initialize AOS when component mounts
  if (typeof window !== 'undefined' && (window as any).AOS) {
    (window as any).AOS.refresh();
  }
};

// Scroll-triggered card with multiple effects
export const EnhancedCard: React.FC<{
  children: ReactNode;
  className?: string;
  tiltEffect?: boolean;
  aosTrigger?: string;
}> = ({ children, className = '', tiltEffect = false, aosTrigger = 'fade-up' }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || !tiltEffect) return;

    // Add tilt effect using CSS and JavaScript
    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    };

    const handleMouseLeave = () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [tiltEffect]);

  return (
    <motion.div
      ref={cardRef}
      className={`${className} transition-all duration-300 ease-out hover:shadow-xl`}
      data-aos={aosTrigger}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </motion.div>
  );
};

// Animated text with scroll reveal
export const AnimatedHeading: React.FC<{
  text: string;
  className?: string;
  level?: 'h1' | 'h2' | 'h3' | 'h4';
}> = ({ text, className = '', level = 'h2' }) => {
  const Component = level;

  return (
    <motion.div
      data-aos="fade-up"
      data-aos-duration="800"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <Component className={`${className} animate__animated animate__fadeInUp`}>
        {text}
      </Component>
    </motion.div>
  );
};

// Parallax wrapper
export const ParallaxWrapper: React.FC<{
  children: ReactNode;
  speed?: number;
  className?: string;
}> = ({ children, speed = -3, className = '' }) => {
  return (
    <div
      className={className}
      data-rellax-speed={speed}
      data-aos="fade-in"
    >
      {children}
    </div>
  );
};

// Loading spinner with CSS animations
export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  type?: 'bounce' | 'pulse' | 'spin';
}> = ({ size = 'md', type = 'spin' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const animationClasses = {
    bounce: 'animate-bounce',
    pulse: 'animate-pulse',
    spin: 'animate-spin'
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`${sizeClasses[size]} ${animationClasses[type]} border-2 border-primary border-t-transparent rounded-full`} />
    </div>
  );
};

// Interactive button with enhanced animations
export const MotionButton: React.FC<{
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
}> = ({ children, onClick, variant = 'primary', className = '' }) => {
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
  };

  return (
    <motion.button
      className={`
        px-6 py-3 rounded-lg font-medium transition-all duration-300
        ${variantClasses[variant]}
        ${className}
        hover:shadow-lg
      `}
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      data-aos="zoom-in"
    >
      {children}
    </motion.button>
  );
};

// Staggered reveal container
export const StaggerContainer: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const childrenArray = React.Children.toArray(children);

  return (
    <div className={className}>
      {childrenArray.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.6, 
            delay: index * 0.1,
            ease: "easeOut"
          }}
          viewport={{ once: true }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
};

// Floating elements
export const FloatingIcon: React.FC<{
  children: ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = '' }) => {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-10, 10, -10],
        rotate: [-2, 2, -2]
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};

// Animation utilities
export const animationHelpers = {
  scrollToTop: () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  
  addPulseEffect: (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.add('animate__animated', 'animate__pulse');
      setTimeout(() => {
        element.classList.remove('animate__animated', 'animate__pulse');
      }, 1000);
    }
  },

  triggerSuccess: () => {
    // Add success animation classes to body
    document.body.classList.add('animate__animated', 'animate__headShake');
    setTimeout(() => {
      document.body.classList.remove('animate__animated', 'animate__headShake');
    }, 1000);
  }
};