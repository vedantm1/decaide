import React, { useEffect, useRef, ReactNode } from 'react';
import { motion } from 'framer-motion';

// Types for animation configurations
interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  tiltEffect?: boolean;
  parallaxSpeed?: number;
  aosTrigger?: string;
  gsapAnimation?: string;
}

interface AnimatedTextProps {
  text: string;
  className?: string;
  splitAnimation?: boolean;
  aosTrigger?: string;
}

interface LoaderProps {
  type?: 'ball-beat' | 'ball-pulse' | 'ball-grid-pulse' | 'ball-clip-rotate' | 'square-spin';
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

// Enhanced Animated Card with multiple animation options
const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  tiltEffect = false,
  parallaxSpeed,
  aosTrigger = 'fade-up',
  gsapAnimation
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // Apply Vanilla Tilt if enabled
    if (tiltEffect && window.VanillaTilt) {
      window.VanillaTilt.init(card, {
        max: 15,
        speed: 400,
        glare: true,
        'max-glare': 0.5,
      });
    }

    // Apply GSAP animation if specified
    if (gsapAnimation && window.gsap) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      
      switch (gsapAnimation) {
        case 'fadeIn':
          window.gsap.fromTo(card, 
            { opacity: 0, y: 50 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              scrollTrigger: {
                trigger: card,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
              }
            }
          );
          break;
        case 'scaleIn':
          window.gsap.fromTo(card,
            { scale: 0.8, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.8,
              ease: 'back.out(1.7)',
              scrollTrigger: {
                trigger: card,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
              }
            }
          );
          break;
      }
    }

    return () => {
      if (tiltEffect && card.vanillaTilt) {
        card.vanillaTilt.destroy();
      }
    };
  }, [tiltEffect, gsapAnimation]);

  const cardClasses = `
    ${className}
    ${tiltEffect ? 'tilt' : ''}
    transition-all duration-300 ease-out
    hover:shadow-xl hover:scale-105
  `.trim();

  const dataAttributes: Record<string, any> = {
    'data-aos': aosTrigger
  };

  if (parallaxSpeed !== undefined) {
    dataAttributes['data-rellax-speed'] = parallaxSpeed;
  }

  return (
    <motion.div
      ref={cardRef}
      className={cardClasses}
      {...dataAttributes}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -5 }}
    >
      {children}
    </motion.div>
  );
};

// Enhanced Animated Text with splitting and stagger effects
export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  className = '',
  splitAnimation = false,
  aosTrigger = 'fade-up'
}) => {
  const textRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const textElement = textRef.current;
    if (!textElement || !splitAnimation) return;

    // Apply text splitting animation
    if (window.Splitting) {
      window.Splitting({ target: textElement });
      
      if (window.gsap) {
        window.gsap.fromTo(
          textElement.querySelectorAll('.char'),
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.05,
            stagger: 0.02,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: textElement,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }
    }
  }, [splitAnimation]);

  if (splitAnimation) {
    return (
      <span
        ref={textRef}
        className={`${className} block`}
        data-splitting=""
        data-aos={aosTrigger}
      >
        {text}
      </span>
    );
  }

  return (
    <motion.span
      className={className}
      data-aos={aosTrigger}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {text}
    </motion.span>
  );
};

// Enhanced Loader with multiple styles
export const AnimatedLoader: React.FC<LoaderProps> = ({
  type = 'ball-beat',
  size = 'medium',
  color = 'currentColor'
}) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16'
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`loader-inner ${type} ${sizeClasses[size]}`}
        style={{ color }}
      />
    </div>
  );
};

// Parallax Section wrapper
export const ParallaxSection: React.FC<{
  children: ReactNode;
  speed?: number;
  className?: string;
}> = ({ children, speed = -3, className = '' }) => {
  return (
    <div
      className={className}
      data-rellax-speed={speed}
    >
      {children}
    </div>
  );
};

// Animate.css utility component
export const AnimateCSSWrapper: React.FC<{
  children: ReactNode;
  animation: string;
  infinite?: boolean;
  delay?: string;
  className?: string;
}> = ({ children, animation, infinite = false, delay, className = '' }) => {
  const animationClasses = `
    animate__animated 
    animate__${animation}
    ${infinite ? 'animate__infinite' : ''}
    ${delay ? `animate__delay-${delay}` : ''}
    ${className}
  `.trim();

  return (
    <div className={animationClasses}>
      {children}
    </div>
  );
};

// Interactive button with combined animations
export const AnimatedButton: React.FC<{
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success';
  className?: string;
}> = ({ children, onClick, variant = 'primary', className = '' }) => {
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    success: 'bg-green-500 text-white hover:bg-green-600'
  };

  return (
    <motion.button
      className={`
        px-6 py-3 rounded-lg font-medium transition-all duration-300
        ${variantClasses[variant]}
        ${className}
        animate__animated animate__pulse animate__infinite
        hover:shadow-lg hover:scale-105
        active:scale-95
      `}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      data-aos="zoom-in"
    >
      {children}
    </motion.button>
  );
};

// Floating action elements
export const FloatingElement: React.FC<{
  children: ReactNode;
  delay?: number;
  amplitude?: number;
  className?: string;
}> = ({ children, delay = 0, amplitude = 10, className = '' }) => {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-amplitude, amplitude, -amplitude],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};

// Progressive reveal container
export const RevealContainer: React.FC<{
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}> = ({ children, staggerDelay = 0.1, className = '' }) => {
  const childrenArray = React.Children.toArray(children);

  return (
    <div className={className}>
      {childrenArray.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.6, 
            delay: index * staggerDelay,
            ease: "easeOut"
          }}
          viewport={{ once: true, margin: "-100px" }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
};

// Global animation utilities
export const animationUtils = {
  // Trigger confetti effect
  triggerConfetti: () => {
    if (window.confetti) {
      window.confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  },

  // Smooth scroll to element
  scrollToElement: (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  },

  // Add pulse animation to element
  pulseElement: (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.add('animate__animated', 'animate__pulse');
      setTimeout(() => {
        element.classList.remove('animate__animated', 'animate__pulse');
      }, 1000);
    }
  },

  // Initialize AOS refresh (useful for dynamic content)
  refreshAOS: () => {
    if (window.AOS) {
      window.AOS.refresh();
    }
  }
};

// Export all components and utilities
export {
  AnimatedCard,
  AnimatedText,
  AnimatedLoader,
  ParallaxSection,
  AnimateCSSWrapper,
  AnimatedButton,
  FloatingElement,
  RevealContainer
};