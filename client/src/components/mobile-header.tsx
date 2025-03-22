import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SUBSCRIPTION_LIMITS } from "@shared/schema";

export default function MobileHeader() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  const subscriptionTier = user?.subscriptionTier || "standard";
  const stars = SUBSCRIPTION_LIMITS[subscriptionTier as keyof typeof SUBSCRIPTION_LIMITS]?.stars || 2;
  
  // Check if the current path matches the link path
  const isActive = (path: string) => {
    return location === path;
  };
  
  // Get current page title based on location
  const getPageTitle = () => {
    switch (location) {
      case "/":
        return "Dashboard";
      case "/roleplay":
        return "Roleplay Scenarios";
      case "/performance-indicators":
        return "Performance Indicators";
      case "/tests":
        return "Practice Tests";
      case "/written-events":
        return "Written Events";
      case "/progress":
        return "My Progress";
      case "/settings":
        return "Settings";
      case "/why-decade":
        return "Why DecA(I)de";
      case "/pricing":
        return "Subscription Plans";
      default:
        return "DecA(I)de";
    }
  };

  return (
    <div className="md:hidden fixed inset-x-0 top-0 z-50 bg-white border-b border-slate-200 flex items-center justify-between p-4">
      <div className="flex items-center gap-2">
        <div className="relative w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-white font-heading font-bold text-base">D</span>
          <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
            AI
          </span>
        </div>
        <span className="font-heading font-bold text-lg text-slate-800">{getPageTitle()}</span>
      </div>
      
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <i className="fas fa-bars text-xl text-slate-500"></i>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
          <div className="flex flex-col h-full">
            {/* Logo Area */}
            <div className="flex items-center justify-center p-5 border-b border-slate-200">
              <Link href="/" onClick={() => setIsOpen(false)}>
                <a className="flex items-center gap-2">
                  <div className="relative w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-white font-heading font-bold text-xl">D</span>
                    <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      AI
                    </span>
                  </div>
                  <span className="font-heading font-bold text-xl text-slate-800">DecA<span className="text-primary">(I)</span>de</span>
                </a>
              </Link>
            </div>
            
            {/* User Profile */}
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
              <div className="mt-3 flex items-center gap-1.5 text-xs bg-slate-100 rounded-full px-3 py-1 w-fit">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < stars ? "text-accent" : "text-slate-300"}>★</span>
                  ))}
                </div>
                <span className="font-medium text-slate-600 capitalize">{subscriptionTier} Plan</span>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
              <div className="space-y-1">
                <Link href="/">
                  <a 
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm ${
                      isActive("/") 
                        ? "text-slate-800 bg-slate-100" 
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <i className="fas fa-chart-line w-5 text-center text-primary"></i>
                    <span>Dashboard</span>
                  </a>
                </Link>
                
                <div className="pt-2">
                  <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Practice</p>
                  <Link href="/roleplay">
                    <a 
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm ${
                        isActive("/roleplay") 
                          ? "text-slate-800 bg-slate-100" 
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <i className={`fas fa-people-arrows w-5 text-center ${
                        isActive("/roleplay") ? "text-primary" : "text-slate-400"
                      }`}></i>
                      <span>Roleplay Scenarios</span>
                    </a>
                  </Link>
                  <Link href="/performance-indicators">
                    <a 
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm ${
                        isActive("/performance-indicators") 
                          ? "text-slate-800 bg-slate-100" 
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <i className={`fas fa-bullseye w-5 text-center ${
                        isActive("/performance-indicators") ? "text-primary" : "text-slate-400"
                      }`}></i>
                      <span>Performance Indicators</span>
                    </a>
                  </Link>
                  <Link href="/tests">
                    <a 
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm ${
                        isActive("/tests") 
                          ? "text-slate-800 bg-slate-100" 
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <i className={`fas fa-clipboard-check w-5 text-center ${
                        isActive("/tests") ? "text-primary" : "text-slate-400"
                      }`}></i>
                      <span>Practice Tests</span>
                    </a>
                  </Link>
                  <Link href="/written-events">
                    <a 
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm ${
                        isActive("/written-events") 
                          ? "text-slate-800 bg-slate-100" 
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <i className={`fas fa-file-alt w-5 text-center ${
                        isActive("/written-events") ? "text-primary" : "text-slate-400"
                      }`}></i>
                      <span>Written Events</span>
                    </a>
                  </Link>
                </div>
                
                <div className="pt-2">
                  <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Account</p>
                  <Link href="/progress">
                    <a 
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm ${
                        isActive("/progress") 
                          ? "text-slate-800 bg-slate-100" 
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <i className={`fas fa-trophy w-5 text-center ${
                        isActive("/progress") ? "text-primary" : "text-slate-400"
                      }`}></i>
                      <span>My Progress</span>
                      <span className="ml-auto bg-primary text-white text-xs px-1.5 py-0.5 rounded-md">New</span>
                    </a>
                  </Link>
                  <Link href="/why-decade">
                    <a 
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm ${
                        isActive("/why-decade") 
                          ? "text-slate-800 bg-slate-100" 
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <i className={`fas fa-info-circle w-5 text-center ${
                        isActive("/why-decade") ? "text-primary" : "text-slate-400"
                      }`}></i>
                      <span>Why DecA(I)de</span>
                    </a>
                  </Link>
                  <Link href="/pricing">
                    <a 
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm ${
                        isActive("/pricing") 
                          ? "text-slate-800 bg-slate-100" 
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <i className={`fas fa-credit-card w-5 text-center ${
                        isActive("/pricing") ? "text-primary" : "text-slate-400"
                      }`}></i>
                      <span>Subscription Plans</span>
                      {subscriptionTier === "standard" && (
                        <span className="ml-auto bg-accent text-white text-xs px-1.5 py-0.5 rounded-md">Upgrade</span>
                      )}
                    </a>
                  </Link>
                  <Link href="/settings">
                    <a 
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm ${
                        isActive("/settings") 
                          ? "text-slate-800 bg-slate-100" 
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <i className={`fas fa-cog w-5 text-center ${
                        isActive("/settings") ? "text-primary" : "text-slate-400"
                      }`}></i>
                      <span>Settings</span>
                    </a>
                  </Link>
                  <button 
                    onClick={() => {
                      logoutMutation.mutate();
                      setIsOpen(false);
                    }} 
                    className="w-full flex items-center gap-3 text-slate-600 hover:bg-slate-100 px-4 py-2.5 rounded-lg font-medium text-sm text-left"
                  >
                    <i className="fas fa-sign-out-alt w-5 text-center text-slate-400"></i>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </nav>
            
            {/* Daily Streak */}
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
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
