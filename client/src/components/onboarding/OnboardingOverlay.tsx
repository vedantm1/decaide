import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, ArrowLeft, ArrowRight, Play, SkipForward, ChevronDown } from "lucide-react";

interface OnboardingOverlayProps {
  isOpen: boolean;
  onComplete: () => void;
  userName?: string;
}

const DECA_CAREER_CLUSTERS = {
  "Business Administration Core": [
    { name: "Principles of Business Management and Administration", abbrev: "PBM" },
    { name: "Principles of Entrepreneurship", abbrev: "PEN" },
    { name: "Principles of Finance", abbrev: "PFN" },
    { name: "Principles of Hospitality and Tourism", abbrev: "PHT" },
    { name: "Principles of Marketing", abbrev: "PMK" }
  ],
  "Business Management & Administration": [
    { name: "Business Law and Ethics Team Decision Making", abbrev: "BLTDM" },
    { name: "Human Resources Management Series", abbrev: "HRM" },
    { name: "Business Services Operations Research", abbrev: "BOR" },
    { name: "Business Solutions Project", abbrev: "PMBS" },
    { name: "Career Development Project", abbrev: "PMCD" },
    { name: "Community Awareness Project", abbrev: "PMCA" },
    { name: "Community Giving Project", abbrev: "PMCG" }
  ],
  "Entrepreneurship": [
    { name: "Entrepreneurship Team Decision Making", abbrev: "ETDM" },
    { name: "Entrepreneurship Series", abbrev: "ENT" },
    { name: "Business Growth Plan", abbrev: "EBG" },
    { name: "Franchise Business Plan", abbrev: "EFB" },
    { name: "Independent Business Plan", abbrev: "EIB" },
    { name: "Innovation Plan", abbrev: "EIP" },
    { name: "International Business Plan", abbrev: "IBP" },
    { name: "Start-Up Business Plan", abbrev: "ESB" }
  ],
  "Finance": [
    { name: "Financial Services Team Decision Making", abbrev: "FTDM" },
    { name: "Accounting Applications Series", abbrev: "ACT" },
    { name: "Business Finance Series", abbrev: "BFS" },
    { name: "Finance Operations Research", abbrev: "FOR" },
    { name: "Financial Consulting", abbrev: "FCE" },
    { name: "Financial Literacy Project", abbrev: "PMFL" }
  ],
  "Hospitality & Tourism": [
    { name: "Hospitality Services Team Decision Making", abbrev: "HTDM" },
    { name: "Travel and Tourism Team Decision Making", abbrev: "TTDM" },
    { name: "Hotel and Lodging Management Series", abbrev: "HLM" },
    { name: "Quick Serve Restaurant Management Series", abbrev: "QSRM" },
    { name: "Restaurant and Food Service Management Series", abbrev: "RFSM" },
    { name: "Hospitality and Tourism Operations Research", abbrev: "HTOR" },
    { name: "Hospitality and Tourism Professional Selling", abbrev: "HTPS" }
  ],
  "Marketing": [
    { name: "Buying and Merchandising Team Decision Making", abbrev: "BTDM" },
    { name: "Marketing Management Team Decision Making", abbrev: "MTDM" },
    { name: "Sports and Entertainment Marketing Team Decision Making", abbrev: "STDM" },
    { name: "Apparel and Accessories Marketing Series", abbrev: "AAM" },
    { name: "Automotive Services Marketing Series", abbrev: "ASM" },
    { name: "Business Services Marketing Series", abbrev: "BSM" },
    { name: "Food Marketing Series", abbrev: "FMS" },
    { name: "Buying and Merchandising Operations Research", abbrev: "BMOR" },
    { name: "Sports and Entertainment Marketing Operations Research", abbrev: "SEOR" },
    { name: "Marketing Communications Series", abbrev: "MCS" },
    { name: "Retail Merchandising Series", abbrev: "RMS" },
    { name: "Sports and Entertainment Marketing Series", abbrev: "SEM" },
    { name: "Integrated Marketing Campaign-Event", abbrev: "IMCE" },
    { name: "Integrated Marketing Campaign-Product", abbrev: "IMCP" },
    { name: "Integrated Marketing Campaign-Service", abbrev: "IMCS" },
    { name: "Sales Project", abbrev: "PMSP" },
    { name: "Professional Selling", abbrev: "PSE" }
  ],
  "Personal Financial Literacy": [
    { name: "Personal Financial Literacy", abbrev: "PFL" }
  ]
};

const TUTORIAL_STEPS = [
  {
    title: "Dashboard",
    description: "Your Dashboard displays your practice stats—role-plays completed, practice tests taken, PIs mastered, and current streak.",
    selector: "[data-tutorial='dashboard']",
    position: { x: 350, y: 100 }
  },
  {
    title: "Practice Tests", 
    description: "Tap 'Practice Tests' to jump into written exam simulations and track your scores.",
    selector: "[data-tutorial='practice-tests']",
    position: { x: 350, y: 150 }
  },
  {
    title: "Roleplay",
    description: "Select 'Roleplay' to practice scenario conversations with AI and review transcripts.",
    selector: "[data-tutorial='roleplay']", 
    position: { x: 350, y: 200 }
  },
  {
    title: "Written Events",
    description: "Under 'Written Events,' find prompts for written performance events.",
    selector: "[data-tutorial='written-events']",
    position: { x: 350, y: 250 }
  },
  {
    title: "Performance Indicators",
    description: "Browse all PIs here—tap any to see definitions, examples, and practice questions.",
    selector: "[data-tutorial='performance-indicators']",
    position: { x: 350, y: 300 }
  },
  {
    title: "My Progress", 
    description: "Check your mastery timeline, badges, and goals on 'My Progress.'",
    selector: "[data-tutorial='my-progress']",
    position: { x: 350, y: 350 }
  },
  {
    title: "Settings",
    description: "Open 'Settings' to customize your experience, adjust notifications, or log out.",
    selector: "[data-tutorial='settings']",
    position: { x: 350, y: 400 }
  }
];

export function OnboardingOverlay({ isOpen, onComplete, userName = "User" }: OnboardingOverlayProps) {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'tutorial' | 'event-selection'>('welcome');
  const [tutorialStep, setTutorialStep] = useState(0);
  const [selectedEvents, setSelectedEvents] = useState<{[cluster: string]: string}>({});
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleStartTutorial = () => {
    setCurrentStep('tutorial');
    setTutorialStep(0);
  };

  const handleSkipTutorial = () => {
    setCurrentStep('event-selection');
  };

  const handleNextStep = () => {
    if (tutorialStep < TUTORIAL_STEPS.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setCurrentStep('event-selection');
    }
  };

  const handlePrevStep = () => {
    if (tutorialStep > 0) {
      setTutorialStep(tutorialStep - 1);
    }
  };

  const handleEventSelect = (cluster: string, eventValue: string) => {
    setErrorMessage("");
    const newSelections = { ...selectedEvents };
    
    // Clear other selections if this is a new selection
    if (eventValue) {
      Object.keys(newSelections).forEach(key => {
        if (key !== cluster) {
          delete newSelections[key];
        }
      });
      newSelections[cluster] = eventValue;
    } else {
      delete newSelections[cluster];
    }
    
    setSelectedEvents(newSelections);
  };

  const handleDone = async () => {
    const selectedCount = Object.keys(selectedEvents).length;
    
    if (selectedCount === 0) {
      setErrorMessage("Please select an event to continue");
      return;
    }
    
    if (selectedCount > 1) {
      setErrorMessage("You can only choose one event");
      return;
    }
    
    const selectedEventFull = Object.values(selectedEvents)[0];
    // Extract event code from the selection (format: "Event Name (CODE)")
    const eventCodeMatch = selectedEventFull.match(/\(([^)]+)\)$/);
    const eventCode = eventCodeMatch ? eventCodeMatch[1] : selectedEventFull;
    
    localStorage.setItem('selectedDecaEvent', eventCode);
    
    try {
      // Save event selection to database
      await fetch('/api/user/event', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ eventCode }),
      });
    } catch (error) {
      console.error('Failed to save event selection:', error);
    }
    
    // Immediately remove background blur and sidebar blur before closing overlay
    const overlayElement = document.querySelector('.onboarding-overlay');
    if (overlayElement) {
      (overlayElement as HTMLElement).style.backdropFilter = 'none';
      (overlayElement as HTMLElement).style.backgroundColor = 'transparent';
    }
    
    // Specifically clean up sidebar elements
    const sidebarElements = document.querySelectorAll('.translucent-sidebar, [data-tutorial], aside, nav');
    sidebarElements.forEach(el => {
      const element = el as HTMLElement;
      element.style.filter = '';
      element.style.backdropFilter = '';
      element.style.transform = '';
      element.style.opacity = '';
      if (element.dataset.tutorialHighlighted || element.dataset.tutorialBlurred) {
        delete element.dataset.tutorialHighlighted;
        delete element.dataset.tutorialBlurred;
      }
    });
    
    onComplete();
  };

  const handleQuizStart = () => {
    // TODO: Implement quiz logic
    console.log("Quiz logic to be implemented");
  };

  // Get selected event count and check if done button should be active
  const selectedCount = Object.keys(selectedEvents).length;
  const isDoneActive = selectedCount === 1;

  // Create blur overlay effect for tutorial
  useEffect(() => {
    if (currentStep === 'tutorial') {
      const currentSelector = TUTORIAL_STEPS[tutorialStep].selector;
      const targetElement = document.querySelector(currentSelector);
      
      // Clear all previous tutorial styling first
      document.querySelectorAll('*').forEach(el => {
        const element = el as HTMLElement;
        if (element.dataset.tutorialBlurred) {
          element.style.filter = '';
          element.style.transition = '';
          delete element.dataset.tutorialBlurred;
        }
        if (element.dataset.tutorialHighlighted) {
          element.setAttribute('style', '');
          delete element.dataset.tutorialHighlighted;
        }
      });
      
      // Keep main content completely clear
      const mainContent = document.querySelector('main');
      if (mainContent) {
        (mainContent as HTMLElement).style.filter = 'blur(3px)';
        (mainContent as HTMLElement).style.transition = 'filter 0.3s ease-in-out';
      }
      
      // Blur every node under <aside> except the target and its ancestors
      const aside = document.querySelector('aside');
      if (aside) {
        // only grab the actual sidebar entries marked for tutorial
        const navItems = aside.querySelectorAll<HTMLElement>('[data-tutorial]');
        navItems.forEach(item => {
          // skip the exact element we’re highlighting
          if (item === targetElement) return;

          item.style.filter = 'blur(2px)';
          item.style.transition = 'filter 0.3s ease-in-out';
        });
      }


      
      // Now unblur and highlight ONLY the target element
      if (targetElement) {
        // Clear any blur on target element first
        (targetElement as HTMLElement).dataset.tutorialHighlighted = 'true';
        delete (targetElement as HTMLElement).dataset.tutorialBlurred;

        // zero out Tailwind blur vars
        targetElement.style.setProperty('--tw-blur', 'none', 'important');
        targetElement.style.setProperty('--tw-backdrop-blur', 'none', 'important');

        // override any backdrop‐filter as well
        targetElement.style.setProperty('backdrop-filter', 'none', 'important');
        targetElement.style.setProperty('-webkit-backdrop-filter', 'none', 'important');

        // Force clear styling and apply unblur with high priority
        (targetElement as HTMLElement).setAttribute('style', '');
        (targetElement as HTMLElement).style.setProperty('filter', 'none', 'important');
        (targetElement as HTMLElement).style.setProperty('backdrop-filter', 'none', 'important');
        (targetElement as HTMLElement).style.setProperty('-webkit-backdrop-filter', 'none', 'important');
        (targetElement as HTMLElement).style.setProperty('position', 'relative', 'important');
        (targetElement as HTMLElement).style.setProperty('z-index', '9999', 'important');
        (targetElement as HTMLElement).style.setProperty('border-radius', '8px', 'important');
        (targetElement as HTMLElement).style.setProperty('box-shadow', '0 0 0 3px rgba(59, 130, 246, 0.5)', 'important');
        (targetElement as HTMLElement).style.setProperty('background', 'rgba(59, 130, 246, 0.1)', 'important');
        (targetElement as HTMLElement).style.setProperty('transition', 'all 0.3s ease-in-out', 'important');

        // inject to kill any blur on ::before/::after if an ID exists
        if (targetElement.id) {
          const styleTag = document.createElement('style');
          styleTag.innerHTML = `
            #${targetElement.id}::before,
            #${targetElement.id}::after {
              filter: none !important;
              backdrop-filter: none !important;
              -webkit-backdrop-filter: none !important;
            }
          `;
          document.head.appendChild(styleTag);
        }
        // Also clear blur from all parent elements up the tree
        let parent = targetElement.parentElement;
        while (parent && parent !== document.body) {
          (parent as HTMLElement).style.setProperty('filter', 'none', 'important');
           parent.style.setProperty('--tw-blur', 'none', 'important');
          delete (parent as HTMLElement).dataset.tutorialBlurred;
          parent = parent.parentElement;
        }
        
        // Specifically handle sidebar container if target is inside it
        const sidebar = targetElement.closest('aside');
        if (sidebar) {
          (sidebar as HTMLElement).style.setProperty('filter', 'none', 'important');
          delete (sidebar as HTMLElement).dataset.tutorialBlurred;
        }
      }
      
      return () => {
        // Clean up all tutorial effects
        document.querySelectorAll('*').forEach(el => {
          const element = el as HTMLElement;
          if (element.dataset.tutorialBlurred || element.dataset.tutorialHighlighted) {
            element.style.filter = '';
            element.style.transition = '';
            element.style.zIndex = '';
            element.style.boxShadow = '';
            element.style.background = '';
            element.style.position = '';
            element.style.borderRadius = '';
            delete element.dataset.tutorialBlurred;
            delete element.dataset.tutorialHighlighted;
          }
        });
      };
    }
  }, [currentStep, tutorialStep]);

  // Clean up all effects when overlay closes
  useEffect(() => {
    if (!isOpen) {
      // Remove all tutorial effects when overlay is closed
      document.querySelectorAll('*').forEach(el => {
        const element = el as HTMLElement;
        if (element.dataset.tutorialHighlighted || element.dataset.tutorialBlurred) {
          element.style.filter = '';
          element.style.transition = '';
          element.style.zIndex = '';
          element.style.boxShadow = '';
          element.style.background = '';
          element.style.position = '';
          element.style.borderRadius = '';
          delete element.dataset.tutorialHighlighted;
          delete element.dataset.tutorialBlurred;
        }
      });
      
      // Also clean up any remaining blur effects on body, main elements, and sidebar
      document.body.style.filter = '';
      const mainElements = document.querySelectorAll('main, .main-content, #root > div, nav, aside, .sidebar, header, .translucent-sidebar, [data-tutorial]');
      mainElements.forEach(el => {
        (el as HTMLElement).style.filter = '';
        (el as HTMLElement).style.backdropFilter = '';
        (el as HTMLElement).style.transform = '';
        (el as HTMLElement).style.opacity = '';
      });
    }
  }, [isOpen]);

  console.log('OnboardingOverlay - isOpen:', isOpen, 'currentStep:', currentStep);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 onboarding-overlay ${
          currentStep === 'welcome' || currentStep === 'event-selection' ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/30'
        }`}
      >
        {/* Welcome Screen */}
        {currentStep === 'welcome' && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full"
          >
            <Card className="text-center">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold">
                  Welcome to DecA(I)de!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Button 
                    onClick={handleStartTutorial}
                    className="flex-1 gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Start Tutorial
                  </Button>
                  <Button 
                    onClick={handleSkipTutorial}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <SkipForward className="h-4 w-4" />
                    Skip Tutorial
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tutorial Steps */}
        {currentStep === 'tutorial' && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0, x: -20 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              x: 0,
              y: 0
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="max-w-sm w-full fixed z-[70] left-64 top-20"
            style={{
              left: `${TUTORIAL_STEPS[tutorialStep].position.x}px`,
              top: `${TUTORIAL_STEPS[tutorialStep].position.y}px`
            }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  {TUTORIAL_STEPS[tutorialStep].title}
                  <span className="text-sm text-muted-foreground">
                    {tutorialStep + 1} / {TUTORIAL_STEPS.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {TUTORIAL_STEPS[tutorialStep].description}
                </p>
                
                <div className="flex items-center justify-between">
                  <Button
                    onClick={handlePrevStep}
                    disabled={tutorialStep === 0}
                    variant="outline"
                    size="sm"
                    className="gap-1"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Back
                  </Button>
                  
                  <Button
                    onClick={handleNextStep}
                    size="sm"
                    className="gap-1"
                  >
                    {tutorialStep === TUTORIAL_STEPS.length - 1 ? 'Finish' : 'Next'}
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
                
                <button
                  onClick={handleSkipTutorial}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center"
                >
                  Skip Tutorial
                </button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Event Selection */}
        {currentStep === 'event-selection' && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-4xl w-full"
          >
            <Card className="backdrop-blur-md bg-white/95 shadow-2xl border-0">
              <CardHeader className="text-center pb-6">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Welcome! What's your DECA event?
                  </CardTitle>
                  <p className="text-muted-foreground mt-2">Choose your career cluster and specific event below</p>
                </motion.div>
              </CardHeader>
              <CardContent className="space-y-8">
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {Object.entries(DECA_CAREER_CLUSTERS).map(([cluster, events], index) => (
                    <motion.div
                      key={cluster}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 * index }}
                      className="space-y-2"
                    >
                      <label className="text-sm font-medium text-foreground/80">{cluster}</label>
                      <Select 
                        value={selectedEvents[cluster] || ""} 
                        onValueChange={(value) => handleEventSelect(cluster, value)}
                      >
                        <SelectTrigger className="w-full bg-background/80 border-muted hover:border-primary/50 transition-colors">
                          <SelectValue placeholder="Select an event..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {events.map((event) => (
                            <SelectItem 
                              key={event.abbrev} 
                              value={`${event.name} (${event.abbrev})`}
                              className="py-2"
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{event.name}</span>
                                <span className="text-xs text-muted-foreground">{event.abbrev}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  ))}
                </motion.div>
                
                <motion.div 
                  className="text-center space-y-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    onClick={handleQuizStart}
                    variant="secondary"
                    className="gap-2 hover:scale-105 transition-transform"
                  >
                    Not sure?
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Take our 2-minute quiz to find your perfect event.
                  </p>
                </motion.div>

                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <p className="text-red-500 text-sm font-medium">{errorMessage}</p>
                  </motion.div>
                )}

                <motion.div 
                  className="flex justify-center pt-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    onClick={handleDone}
                    className={`px-8 py-3 font-semibold transition-all duration-300 ${
                      isDoneActive 
                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transform hover:scale-105' 
                        : 'bg-muted/50 text-muted-foreground cursor-not-allowed hover:bg-muted/50'
                    }`}
                    disabled={!isDoneActive}
                  >
                    Done
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}