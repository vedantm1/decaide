import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useUIState } from '@/hooks/use-ui-state';
import { IconHome, IconBarChart, IconUsers, IconSettings, IconBook, IconActivity, IconClipboard, IconMenu, IconX, IconSun, IconMoon } from '@/components/ui/icons';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * AppLayout component provides a professional, clean layout structure
 * with responsive sidebar navigation and perfectly centered content.
 */
export function AppLayout({ children, className }: AppLayoutProps) {
  const [currentLocation] = useLocation();
  const { sidebarState, setSidebarState, themeMode, setThemeMode, isMobile } = useUIState();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // Define navigation items
  const navItems = [
    { icon: <IconHome className="w-5 h-5" />, label: 'Dashboard', href: '/' },
    { icon: <IconBarChart className="w-5 h-5" />, label: 'Practice Tests', href: '/tests' },
    { icon: <IconUsers className="w-5 h-5" />, label: 'Roleplay', href: '/roleplay' },
    { icon: <IconClipboard className="w-5 h-5" />, label: 'Written Events', href: '/written-events' },
    { icon: <IconActivity className="w-5 h-5" />, label: 'Performance Indicators', href: '/performance-indicators' },
    { icon: <IconBook className="w-5 h-5" />, label: 'My Progress', href: '/progress' },
    { icon: <IconSettings className="w-5 h-5" />, label: 'Settings', href: '/settings' },
  ];

  const toggleSidebar = () => {
    if (sidebarState === 'expanded') {
      setSidebarState('collapsed');
    } else {
      setSidebarState('expanded');
    }
  };

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleTheme = () => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  };

  // Animation variants
  const sidebarVariants = {
    expanded: { width: 250 },
    collapsed: { width: 80 },
  };

  const navItemVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -20 },
  };

  const contentVariants = {
    expanded: { marginLeft: isMobile ? 0 : 250 },
    collapsed: { marginLeft: isMobile ? 0 : 80 },
  };

  // Mobile menu animation
  const mobileMenuVariants = {
    closed: { 
      x: '-100%', 
      opacity: 0,
      transition: { 
        type: 'tween',
        duration: 0.25,
        ease: 'easeInOut'
      } 
    },
    open: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: 'tween',
        duration: 0.25,
        ease: 'easeOut'
      } 
    }
  };

  return (
    <div className={cn('min-h-screen flex flex-col', className)}>
      {/* Header */}
      <header className="h-16 border-b bg-card shadow-sm flex items-center justify-between px-4 z-40">
        <div className="flex items-center">
          {isMobile ? (
            <button 
              onClick={toggleMobileMenu}
              className="p-2 rounded-full hover:bg-primary/10 text-foreground transition-colors"
              aria-label="Toggle Menu"
            >
              <IconMenu className="w-6 h-6" />
            </button>
          ) : (
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-full hover:bg-primary/10 text-foreground transition-colors"
              aria-label="Toggle Sidebar"
            >
              <IconMenu className="w-6 h-6" />
            </button>
          )}
          
          <div className="flex items-center ml-3">
            <span className="text-xl font-semibold text-primary">DecA(I)de</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-primary/10 text-foreground transition-colors"
            aria-label="Toggle Theme"
          >
            {themeMode === 'dark' ? (
              <IconSun className="w-5 h-5" />
            ) : (
              <IconMoon className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>
      
      <div className="flex flex-1 relative">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <motion.aside
            className="h-[calc(100vh-4rem)] fixed top-16 left-0 bg-card border-r shadow-sm z-30 overflow-y-auto overflow-x-hidden"
            initial={false}
            animate={sidebarState}
            variants={sidebarVariants}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <nav className="py-4 flex flex-col h-full">
              <ul className="space-y-2 px-3">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <a className={cn(
                        "flex items-center h-10 px-3 rounded-md transition-colors relative hover-scale",
                        currentLocation === item.href 
                          ? "bg-primary/10 text-primary font-medium" 
                          : "text-muted-foreground hover:bg-muted/80",
                      )}>
                        {item.icon}
                        <motion.span 
                          className="ml-3 whitespace-nowrap"
                          initial={false}
                          animate={sidebarState}
                          variants={navItemVariants}
                          transition={{ duration: 0.2 }}
                        >
                          {item.label}
                        </motion.span>
                        {currentLocation === item.href && (
                          <motion.div 
                            className="absolute inset-y-0 right-0 w-1 bg-primary rounded-l-md"
                            layoutId="activeIndicator"
                            transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        )}
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.aside>
        )}
        
        {/* Mobile Menu Overlay */}
        {isMobile && (
          <motion.div 
            className={cn(
              "fixed inset-0 bg-black/50 z-40",
              isMenuOpen ? "block" : "hidden"
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: isMenuOpen ? 1 : 0 }}
            onClick={() => setIsMenuOpen(false)}
          />
        )}
        
        {/* Mobile Menu */}
        {isMobile && (
          <motion.aside
            className="h-screen fixed top-0 left-0 w-[280px] bg-card shadow-lg z-50 overflow-y-auto"
            initial="closed"
            animate={isMenuOpen ? "open" : "closed"}
            variants={mobileMenuVariants}
          >
            <div className="h-16 border-b flex items-center justify-between px-4">
              <span className="text-xl font-semibold text-primary">DecA(I)de</span>
              <button 
                onClick={toggleMobileMenu}
                className="p-2 rounded-full hover:bg-primary/10 text-foreground transition-colors"
                aria-label="Close Menu"
              >
                <IconX className="w-6 h-6" />
              </button>
            </div>
            <nav className="py-4">
              <ul className="space-y-2 px-3">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <a 
                        className={cn(
                          "flex items-center h-12 px-3 rounded-md transition-colors",
                          currentLocation === item.href 
                            ? "bg-primary/10 text-primary font-medium" 
                            : "text-muted-foreground hover:bg-muted/80",
                        )}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.icon}
                        <span className="ml-3">{item.label}</span>
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.aside>
        )}
        
        {/* Main Content */}
        <motion.main 
          className="flex-1 pt-6 px-4 md:px-8 pb-16"
          initial={false}
          animate={sidebarState}
          variants={contentVariants}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  );
}

export default AppLayout;