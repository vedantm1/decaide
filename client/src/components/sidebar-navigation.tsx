import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { SUBSCRIPTION_LIMITS } from "@shared/schema";
import { useMemo } from "react";

export default function SidebarNavigation() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const subscriptionTier = user?.subscriptionTier || "standard";
  const stars = SUBSCRIPTION_LIMITS[subscriptionTier as keyof typeof SUBSCRIPTION_LIMITS]?.stars || 2;
  
  // Determine theme color based on user's selected cluster
  const themeColor = useMemo(() => {
    const colorScheme = user?.uiTheme || 'aquaBlue';
    
    // Map color schemes to corresponding color classes
    switch(colorScheme) {
      case 'business':
        return 'text-yellow-500';
      case 'finance':
        return 'text-green-500';
      case 'hospitality':
        return 'text-blue-500';
      case 'marketing':
        return 'text-red-500';
      case 'entrepreneurship':
        return 'text-gray-500';
      case 'admin':
        return 'text-indigo-600';
      case 'mintGreen':
        return 'text-emerald-500';
      case 'coralPink':
        return 'text-pink-500';
      case 'royalPurple':
        return 'text-purple-500';
      default:
        return 'text-primary'; // aquaBlue or default
    }
  }, [user?.uiTheme]);
  
  // Function to determine the number of visible stars based on mode
  const getVisibleStars = () => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    // In dark mode, show filled stars only (2 for standard, 3 for plus, 5 for pro)
    if (isDarkMode) {
      return stars;
    }
    // In light mode, show all 5 stars with some filled based on tier
    return 5;
  };

  // Check if the current path matches the link path
  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-slate-200">
      {/* Logo Area */}
      <div className="flex items-center justify-center p-5 border-b border-slate-200">
        <div className="flex items-center gap-2">
            <div className="relative w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-heading font-bold text-xl">D</span>
              <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                AI
              </span>
            </div>
            <span className="font-heading font-bold text-xl text-slate-800">DecA<span className="text-primary">(I)</span>de</span>
          </div>
      </div>

      {/* User Profile Summary */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
            {user?.username ? user.username.substring(0, 2).toUpperCase() : "??"}
          </div>
          <div>
            <p className="font-medium text-sm text-slate-800">{user?.username || "Guest User"}</p>
            <p className="text-xs text-slate-500">{user?.eventType || "No event selected"}</p>
          </div>
        </div>

        {/* Subscription Badge */}
        <div className="mt-3 flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-1 w-fit">
          <div className="flex">
            {Array.from({ length: getVisibleStars() }).map((_, i) => (
              <span key={i} className="text-accent">★</span>
            ))}
            {!document.documentElement.classList.contains('dark') && 
              Array.from({ length: 5 - stars }).map((_, i) => (
                <span key={i + stars} className="text-slate-300 dark:text-slate-700">★</span>
              ))
            }
          </div>
          <span className="font-medium text-slate-600 dark:text-slate-300 capitalize">{subscriptionTier} Plan</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          <div
            onClick={() => window.location.href = '/'}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm cursor-pointer ${
              isActive("/") 
                ? "text-slate-800 bg-slate-100" 
                : "text-slate-600 hover:bg-slate-100"
            }`}>
            <i className={`fas fa-chart-line w-5 text-center ${themeColor}`}></i>
            <span>Dashboard</span>
          </div>

          <div className="pt-2">
            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Practice</p>
            <div
              onClick={() => window.location.href = '/roleplay'}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm cursor-pointer ${
                isActive("/roleplay") 
                  ? "text-slate-800 bg-slate-100" 
                  : "text-slate-600 hover:bg-slate-100"
              }`}>
                <i className={`fas fa-people-arrows w-5 text-center ${
                  isActive("/roleplay") ? "text-primary" : "text-slate-400"
                }`}></i>
                <span>Roleplay Scenarios</span>
              </div>
            <div
              onClick={() => window.location.href = '/performance-indicators'}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm cursor-pointer ${
                isActive("/performance-indicators") 
                  ? "text-slate-800 bg-slate-100" 
                  : "text-slate-600 hover:bg-slate-100"
              }`}>
                <i className={`fas fa-bullseye w-5 text-center ${
                  isActive("/performance-indicators") ? "text-primary" : "text-slate-400"
                }`}></i>
                <span>Performance Indicators</span>
              </div>
            <div
              onClick={() => window.location.href = '/tests'}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm cursor-pointer ${
                isActive("/tests") 
                  ? "text-slate-800 bg-slate-100" 
                  : "text-slate-600 hover:bg-slate-100"
              }`}>
                <i className={`fas fa-clipboard-check w-5 text-center ${
                  isActive("/tests") ? "text-primary" : "text-slate-400"
                }`}></i>
                <span>Practice Tests</span>
              </div>
            <div
              onClick={() => window.location.href = '/written-events'}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm cursor-pointer ${
                isActive("/written-events") 
                  ? "text-slate-800 bg-slate-100" 
                  : "text-slate-600 hover:bg-slate-100"
              }`}>
                <i className={`fas fa-file-alt w-5 text-center ${
                  isActive("/written-events") ? "text-primary" : "text-slate-400"
                }`}></i>
                <span>Written Events</span>
              </div>
          </div>

          <div className="pt-2">
            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Account</p>
            <div
              onClick={() => window.location.href = '/progress'}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm cursor-pointer ${
                isActive("/progress") 
                  ? "text-slate-800 bg-slate-100" 
                  : "text-slate-600 hover:bg-slate-100"
              }`}>
                <i className={`fas fa-trophy w-5 text-center ${
                  isActive("/progress") ? "text-primary" : "text-slate-400"
                }`}></i>
                <span>My Progress</span>
                <span className="ml-auto bg-primary text-white text-xs px-1.5 py-0.5 rounded-md">New</span>
              </div>
            <div
              onClick={() => window.location.href = '/why-decade'}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm cursor-pointer ${
                isActive("/why-decade") 
                  ? "text-slate-800 bg-slate-100" 
                  : "text-slate-600 hover:bg-slate-100"
              }`}>
                <i className={`fas fa-info-circle w-5 text-center ${
                  isActive("/why-decade") ? "text-primary" : "text-slate-400"
                }`}></i>
                <span>Why DecA(I)de</span>
              </div>
            <div
              onClick={() => window.location.href = '/pricing'}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm cursor-pointer ${
                isActive("/pricing") 
                  ? "text-slate-800 bg-slate-100" 
                  : "text-slate-600 hover:bg-slate-100"
              }`}>
                <i className={`fas fa-credit-card w-5 text-center ${
                  isActive("/pricing") ? "text-primary" : "text-slate-400"
                }`}></i>
                <span>Subscription Plans</span>
                {subscriptionTier === "standard" && (
                  <span className="ml-auto bg-accent text-white text-xs px-1.5 py-0.5 rounded-md">Upgrade</span>
                )}
              </div>
            <div
              onClick={() => window.location.href = '/settings'}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm cursor-pointer ${
                isActive("/settings") 
                  ? "text-slate-800 bg-slate-100" 
                  : "text-slate-600 hover:bg-slate-100"
              }`}>
                <i className={`fas fa-cog w-5 text-center ${
                  isActive("/settings") ? "text-primary" : "text-slate-400"
                }`}></i>
                <span>Settings</span>
              </div>
            <button 
              onClick={() => logoutMutation.mutate()} 
              className="w-full flex items-center gap-3 text-slate-600 hover:bg-slate-100 px-4 py-2.5 rounded-lg font-medium text-sm text-left"
            >
              <i className="fas fa-sign-out-alt w-5 text-center text-slate-400"></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Daily Practice Reminder */}
      <div className="p-4 mx-3 mb-4 bg-primary-50 rounded-lg border border-primary-100">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-sm text-primary-700">Daily Streak</h4>
          <span className="text-xs font-bold bg-primary text-white px-2 py-0.5 rounded">{user?.streak || 0} days</span>
        </div>
        <div className="w-full bg-primary-200 rounded-full h-2">
          <div className="bg-primary h-2 rounded-full" style={{ width: '70%' }}></div>
        </div>
        <p className="mt-2 text-xs text-primary-700">2 more activities to continue your streak!</p>
      </div>
    </aside>
  );
}