import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIState } from '@/hooks/use-ui-state';
import { 
  IconHome, 
  IconBarChart, 
  IconUsers, 
  IconSettings, 
  IconBook, 
  IconActivity, 
  IconClipboard, 
  IconMenu, 
  IconX 
} from '@/components/ui/icons';
import * as THREE from 'three';

// Declare Vanta.js global types
declare global {
  interface Window {
    THREE: typeof THREE;
    VANTA: {
      WAVES: (config: any) => any;
    };
  }
}

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();
  const { isDarkMode, isMobile } = useUIState();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(!isMobile);
  const bgRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<any>(null);

  // Define navigation items
  const navigationItems = [
    { icon: <IconHome className="w-5 h-5" />, label: 'Dashboard', href: '/' },
    { icon: <IconBarChart className="w-5 h-5" />, label: 'Practice Tests', href: '/tests' },
    { icon: <IconUsers className="w-5 h-5" />, label: 'Roleplay', href: '/roleplay' },
    { icon: <IconClipboard className="w-5 h-5" />, label: 'Written Events', href: '/written-events' },
    { icon: <IconActivity className="w-5 h-5" />, label: 'Performance Indicators', href: '/performance-indicators' },
    { icon: <IconBook className="w-5 h-5" />, label: 'My Progress', href: '/progress' },
    { icon: <IconSettings className="w-5 h-5" />, label: 'Settings', href: '/settings' },
  ];

  // Initialize Vanta.js background
  useEffect(() => {
    // Load necessary scripts dynamically
    const loadScripts = async () => {
      // Check if Three.js is already loaded
      if (!window.THREE) {
        window.THREE = THREE;
      }
      
      // Check if Vanta.js is already loaded
      if (!window.VANTA) {
        const vantaScript = document.createElement('script');
        vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js';
        vantaScript.async = true;
        document.head.appendChild(vantaScript);
        
        // Wait for script to load
        await new Promise<void>((resolve) => {
          vantaScript.onload = () => resolve();
        });
      }
      
      // Initialize Vanta effect
      if (bgRef.current && window.VANTA) {
        if (vantaEffect.current) {
          vantaEffect.current.destroy();
        }
        
        vantaEffect.current = window.VANTA.WAVES({
          el: bgRef.current,
          THREE: window.THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: isDarkMode ? 0x292929 : 0xa2a2a7,
          shininess: 0.00,
          waveHeight: 28.00,
          waveSpeed: 1.50,
          zoom: 0.65
        });
      }
    };
    
    loadScripts();
    
    // Cleanup function
    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
      }
    };
  }, [isDarkMode]); // Re-initialize when theme changes

  // Track window size changes
  React.useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 768;
      if (isMobileView) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Initial setup
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animation variants
  const sidebarVariants = {
    open: { 
      x: 0,
      width: isMobile ? '85vw' : '280px',
      transition: { 
        type: 'spring', 
        stiffness: 400, 
        damping: 40,
        when: 'beforeChildren'
      }
    },
    closed: { 
      x: isMobile ? '-100%' : '-280px',
      width: isMobile ? '85vw' : '280px',
      transition: { 
        type: 'spring', 
        stiffness: 400, 
        damping: 40,
        when: 'afterChildren'
      }
    }
  };

  const contentVariants = {
    expanded: { 
      marginLeft: isMobile ? 0 : '280px',
      transition: { 
        type: 'spring', 
        stiffness: 400, 
        damping: 40 
      }
    },
    collapsed: { 
      marginLeft: 0,
      transition: { 
        type: 'spring', 
        stiffness: 400, 
        damping: 40 
      }
    }
  };

  const navItemVariants = {
    open: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }),
    closed: {
      opacity: 0,
      x: -20,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };

  const activeIndicatorVariants = {
    initial: { scaleX: 0, originX: 0 },
    animate: { 
      scaleX: 1, 
      originX: 0,
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 30 
      }
    }
  };

  // Overlay for mobile sidebar
  const handleOverlayClick = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Vanta Background Container - covers the entire app */}
      <div ref={bgRef} className="fixed inset-0 z-[-1]"></div>
      
      {/* Header */}
      <header className="h-16 border-b bg-card/80 backdrop-blur-sm shadow-sm z-40 sticky top-0 left-0 right-0">
        <div className="px-4 h-full flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-10 h-10 mr-2 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
              aria-label="Toggle sidebar"
            >
              <IconMenu className="w-5 h-5" />
            </button>
            
            <Link href="/">
              <a className="text-xl font-bold text-primary tracking-tight hover:opacity-80 transition-opacity">
                DecA(I)de
              </a>
            </Link>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Add profile or other header actions here */}
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 relative">
        {/* Mobile overlay when sidebar is shown */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30"
            onClick={handleOverlayClick}
          />
        )}
        
        {/* Sidebar */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.aside
              className={cn(
                "fixed top-16 bottom-0 z-30 border-r bg-card/95 backdrop-blur-sm shadow-md",
                isMobile ? "left-0" : "left-0"
              )}
              initial="closed"
              animate="open"
              exit="closed"
              variants={sidebarVariants}
            >
              <div className="h-full overflow-y-auto py-4 px-3 flex flex-col">
                <nav className="space-y-1 flex-1">
                  {navigationItems.map((item, index) => (
                    <motion.div 
                      key={item.href}
                      custom={index}
                      variants={navItemVariants}
                    >
                      <Link href={item.href}>
                        <a className={cn(
                          "flex items-center px-3 py-2.5 text-base rounded-lg relative group",
                          location === item.href 
                            ? "text-primary font-medium" 
                            : "text-foreground/70 hover:text-foreground",
                          "transition-all hover:bg-primary/5"
                        )}>
                          <span className="mr-3 text-current opacity-70 group-hover:opacity-100">
                            {item.icon}
                          </span>
                          <span className="font-medium">{item.label}</span>
                          
                          {location === item.href && (
                            <motion.div 
                              className="absolute bottom-0 left-0 h-full w-1 bg-primary rounded-r"
                              initial="initial"
                              animate="animate"
                              variants={activeIndicatorVariants}
                              layoutId="activeNavIndicator"
                            />
                          )}
                        </a>
                      </Link>
                    </motion.div>
                  ))}
                </nav>
                
                <div className="pt-4 mt-4 border-t">
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    <div>DecA(I)de</div>
                    <div>© 2025 All rights reserved</div>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
        
        {/* Main content */}
        <motion.main
          className="flex-1 min-w-0 relative"
          initial="collapsed"
          animate={isSidebarOpen && !isMobile ? "expanded" : "collapsed"}
          variants={contentVariants}
        >
          <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="pb-12"
              >
                {/* Content card with glass effect */}
                <div className="bg-card/70 backdrop-blur-md rounded-xl shadow-lg p-6 border">
                  {children}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.main>
      </div>
    </div>
  );
}

export default MainLayout;