import { useEffect, useRef, useState } from 'react';
import { initializePremiumScrollbar, ScrollbarType } from '@/lib/scrollbar-utils';

interface UsePremiumScrollOptions {
  type?: ScrollbarType;
  withShadows?: boolean;
  trackProgress?: boolean;
  autoHide?: boolean;
}

export function usePremiumScroll(options: UsePremiumScrollOptions = {}) {
  const { 
    type = 'premium', 
    withShadows = false, 
    trackProgress = false,
    autoHide = false 
  } = options;
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    initializePremiumScrollbar(container, type, withShadows);

    if (trackProgress || autoHide) {
      let scrollTimeout: NodeJS.Timeout;

      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        
        if (trackProgress) {
          const progress = scrollHeight > clientHeight 
            ? (scrollTop / (scrollHeight - clientHeight)) * 100 
            : 0;
          setScrollProgress(Math.min(progress, 100));
        }

        setCanScrollUp(scrollTop > 0);
        setCanScrollDown(scrollTop < scrollHeight - clientHeight - 1);

        if (autoHide) {
          setIsScrolling(true);
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            setIsScrolling(false);
          }, 1000);
        }
      };

      container.addEventListener('scroll', handleScroll, { passive: true });
      
      // Initial calculation
      handleScroll();

      return () => {
        container.removeEventListener('scroll', handleScroll);
        clearTimeout(scrollTimeout);
      };
    }
  }, [type, withShadows, trackProgress, autoHide]);

  const scrollToTop = () => {
    containerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollToBottom = () => {
    const container = containerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const scrollToElement = (selector: string) => {
    const container = containerRef.current;
    if (container) {
      const element = container.querySelector(selector);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  };

  return {
    containerRef,
    scrollProgress,
    isScrolling,
    canScrollUp,
    canScrollDown,
    scrollToTop,
    scrollToBottom,
    scrollToElement
  };
}