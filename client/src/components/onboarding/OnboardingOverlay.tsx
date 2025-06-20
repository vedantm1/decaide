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
    { name: "Entrepreneurship Innovation Plan", abbrev: "EIP" },
    { name: "Entrepreneurship Participating", abbrev: "ENT" },
    { name: "Innovation Plan Project", abbrev: "PMIP" },
    { name: "Start-up Business Plan", abbrev: "PMSU" }
  ],
  "Finance": [
    { name: "Accounting Applications Series", abbrev: "ACT" },
    { name: "Business Finance Series", abbrev: "BFS" },
    { name: "Financial Consulting", abbrev: "FTDM" },
    { name: "Personal Financial Literacy", abbrev: "PFL" },
    { name: "Financial Literacy Project", abbrev: "PMFL" },
    { name: "Stock Market Game Project", abbrev: "PMSM" }
  ],
  "Hospitality & Tourism": [
    { name: "Hotel and Lodging Management Series", abbrev: "HLM" },
    { name: "Quick Serve Restaurant Management", abbrev: "QSR" },
    { name: "Restaurant and Food Service Management", abbrev: "RFSM" },
    { name: "Tourism Professional Selling", abbrev: "TSE" },
    { name: "Travel and Tourism Marketing Series", abbrev: "TTM" },
    { name: "Hospitality and Tourism Project", abbrev: "PMHT" }
  ],
  "Marketing": [
    { name: "Apparel and Accessories Marketing Series", abbrev: "AAM" },
    { name: "Automotive Services Marketing Series", abbrev: "ASM" },
    { name: "Business to Business Marketing Series", abbrev: "BTB" },
    { name: "Fashion Merchandising Series", abbrev: "FMS" },
    { name: "Marketing Management Series", abbrev: "MMS" },
    { name: "Professional Selling", abbrev: "PSE" },
    { name: "Retail Merchandising Series", abbrev: "RMS" },
    { name: "Sports and Entertainment Marketing Series", abbrev: "SEM" },
    { name: "Marketing Project", abbrev: "PMMK" }
  ]
};

const TUTORIAL_STEPS = [
  {
    title: "Welcome to Your Dashboard",
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
    description: "Master Performance Indicators (PIs) through targeted practice and quizzes.",
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
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleStartTutorial = () => {
    setCurrentStep('tutorial');
    setTutorialStep(0);
  };

  const handleSkipTutorial = () => {
    setCurrentStep('event-selection');
  };

  const handleTutorialNext = () => {
    if (tutorialStep < TUTORIAL_STEPS.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setCurrentStep('event-selection');
    }
  };

  const handleTutorialPrev = () => {
    if (tutorialStep > 0) {
      setTutorialStep(tutorialStep - 1);
    }
  };

  const handleEventSelection = (cluster: string, event: string) => {
    const newSelections = { ...selectedEvents };
    
    if (newSelections[cluster] === event) {
      delete newSelections[cluster];
    } else {
      Object.keys(newSelections).forEach(key => delete newSelections[key]);
      newSelections[cluster] = event;
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
    
    const selectedEvent = Object.values(selectedEvents)[0];
    
    // Parse event data to extract format, code, type, and instructional area
    const eventParts = selectedEvent.split(' - ');
    const eventAbbrev = eventParts[1]?.replace(/[()]/g, '');
    
    // Determine event format and type based on the event
    let eventFormat = 'roleplay';
    let eventType = 'Individual Series';
    let instructionalArea = Object.keys(selectedEvents)[0];
    
    // Save event selection to backend
    try {
      await fetch('/api/user/event-selection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          eventFormat,
          eventCode: eventAbbrev,
          eventType,
          instructionalArea
        }),
      });
    } catch (error) {
      console.error('Failed to save event selection:', error);
    }
    
    localStorage.setItem('selectedDecaEvent', selectedEvent);
    
    // Comprehensive cleanup of all tutorial effects
    cleanupAllTutorialEffects();
    
    onComplete();
  };

  // Enhanced cleanup function
  const cleanupAllTutorialEffects = () => {
    try {
      // Remove all tutorial data attributes and styles
      document.querySelectorAll('*').forEach(el => {
        const element = el as HTMLElement;
        if (element.dataset.tutorialHighlighted || element.dataset.tutorialBlurred) {
          // Reset all possible CSS properties
          element.style.filter = '';
          element.style.backdropFilter = '';
          (element.style as any).webkitBackdropFilter = '';
          element.style.transform = '';
          element.style.opacity = '';
          element.style.zIndex = '';
          element.style.boxShadow = '';
          element.style.background = '';
          element.style.position = '';
          element.style.borderRadius = '';
          element.style.transition = '';
          
          // Remove data attributes
          delete element.dataset.tutorialHighlighted;
          delete element.dataset.tutorialBlurred;
          
          // Remove any CSS custom properties we might have added
          element.style.removeProperty('--tw-blur');
          element.style.removeProperty('--tw-backdrop-blur');
        }
      });

      // Clean up overlay styling
      const overlayElement = document.querySelector('.onboarding-overlay');
      if (overlayElement) {
        (overlayElement as HTMLElement).style.backdropFilter = 'none';
        (overlayElement as HTMLElement).style.backgroundColor = 'transparent';
      }

      // Remove any dynamically added style tags
      const tutorialStyles = document.querySelectorAll('style[data-tutorial-style]');
      tutorialStyles.forEach(style => style.remove());

      // Force repaint
      document.body.style.display = 'none';
      document.body.offsetHeight;
      document.body.style.display = '';
      
    } catch (error) {
      console.error('Error during tutorial cleanup:', error);
    }
  };

  const handleQuizStart = () => {
    console.log("Quiz logic to be implemented");
  };

  // Get selected event count and check if done button should be active
  const selectedCount = Object.keys(selectedEvents).length;
  const isDoneActive = selectedCount === 1;

  // Create blur overlay effect for tutorial
  useEffect(() => {
    if (currentStep !== 'tutorial') return;
    
    const currentSelector = TUTORIAL_STEPS[tutorialStep]?.selector;
    if (!currentSelector) return;
    
    const targetElement = document.querySelector(currentSelector);
    
    // Clear all previous tutorial styling first
    try {
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
    } catch (error) {
      console.warn('Error clearing tutorial styling:', error);
    }

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
        // skip the exact element we're highlighting
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
      (targetElement as HTMLElement).style.setProperty('--tw-blur', 'none', 'important');
      (targetElement as HTMLElement).style.setProperty('--tw-backdrop-blur', 'none', 'important');

      // override any backdrop‐filter as well
      (targetElement as HTMLElement).style.setProperty('backdrop-filter', 'none', 'important');
      (targetElement as HTMLElement).style.setProperty('-webkit-backdrop-filter', 'none', 'important');

      // Force clear styling and apply unblur with high priority
      (targetElement as HTMLElement).setAttribute('style', '');
      (targetElement as HTMLElement).style.setProperty('filter', 'none', 'important');
      (targetElement as HTMLElement).style.setProperty('z-index', '100', 'important');
      (targetElement as HTMLElement).style.setProperty('position', 'relative', 'important');
      (targetElement as HTMLElement).style.setProperty('background', 'rgba(255, 255, 255, 0.1)', 'important');
      (targetElement as HTMLElement).style.setProperty('box-shadow', '0 0 10px rgba(0, 255, 255, 0.7)', 'important');
      (targetElement as HTMLElement).style.setProperty('border-radius', '4px', 'important');

      if (!document.querySelector('style[data-tutorial-style]')) {
        // Add a scoped style tag to prevent Tailwind from interfering
        const styleTag = document.createElement('style');
        styleTag.setAttribute('data-tutorial-style', 'true');
        styleTag.innerHTML = `
          [data-tutorial-highlighted] {
            filter: none !important;
            -webkit-filter: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
          }
        `;
        document.head.appendChild(styleTag);
      }
      
      // Also clear blur from all parent elements up the tree
      let parent = targetElement.parentElement;
      while (parent && parent !== document.body) {
        try {
          (parent as HTMLElement).style.setProperty('filter', 'none', 'important');
          (parent as HTMLElement).style.setProperty('--tw-blur', 'none', 'important');
          delete (parent as HTMLElement).dataset.tutorialBlurred;
          parent = parent.parentElement;
        } catch (error) {
          console.warn('Error clearing parent blur:', error);
          break;
        }
      }
      
      // Specifically handle sidebar container if target is inside it
      const sidebar = targetElement.closest('aside');
      if (sidebar) {
        (sidebar as HTMLElement).style.setProperty('filter', 'none', 'important');
        delete (sidebar as HTMLElement).dataset.tutorialBlurred;
      }
    }

    return () => {
      cleanupAllTutorialEffects();
    };
  }, [currentStep, tutorialStep]);

  // Clean up all effects when overlay closes or component unmounts
  useEffect(() => {
    if (!isOpen) {
      cleanupAllTutorialEffects();
    }
    
    return () => {
      cleanupAllTutorialEffects();
    };
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
                    <Play className="w-4 h-4" />
                    Take a Tour
                  </Button>
                  <Button 
                    onClick={handleSkipTutorial}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <SkipForward className="w-4 h-4" />
                    Skip Tour
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tutorial Screen */}
        {currentStep === 'tutorial' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-20 right-6 max-w-sm w-full z-60"
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    {TUTORIAL_STEPS[tutorialStep].title}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep('event-selection')}
                    className="p-1 h-auto"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {TUTORIAL_STEPS[tutorialStep].description}
                </p>
                
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTutorialPrev}
                    disabled={tutorialStep === 0}
                    className="gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  
                  <span className="text-xs text-muted-foreground">
                    {tutorialStep + 1} of {TUTORIAL_STEPS.length}
                  </span>
                  
                  <Button
                    size="sm"
                    onClick={handleTutorialNext}
                    className="gap-2"
                  >
                    {tutorialStep === TUTORIAL_STEPS.length - 1 ? 'Finish' : 'Next'}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Event Selection Screen */}
        {currentStep === 'event-selection' && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-2xl w-full max-h-[80vh] overflow-hidden"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Choose Your DECA Event</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select one event to focus your training on. You can change this later in settings.
                </p>
              </CardHeader>
              <CardContent className="max-h-[60vh] overflow-y-auto">
                <div className="space-y-6">
                  {Object.entries(DECA_CAREER_CLUSTERS).map(([cluster, events]) => (
                    <div key={cluster} className="space-y-3">
                      <h3 className="font-semibold text-sm">{cluster}</h3>
                      <div className="grid gap-2">
                        {events.map((event) => {
                          const eventKey = `${event.name} - (${event.abbrev})`;
                          const isSelected = selectedEvents[cluster] === eventKey;
                          
                          return (
                            <button
                              key={event.abbrev}
                              onClick={() => handleEventSelection(cluster, eventKey)}
                              className={`text-left p-3 rounded-lg border transition-colors ${
                                isSelected
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium text-sm">{event.name}</div>
                                  <div className="text-xs text-muted-foreground">({event.abbrev})</div>
                                </div>
                                {isSelected && (
                                  <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full" />
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                
                {errorMessage && (
                  <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">{errorMessage}</p>
                  </div>
                )}
                
                <div className="mt-6 flex gap-3">
                  <Button
                    onClick={handleDone}
                    disabled={!isDoneActive}
                    className="flex-1"
                  >
                    Get Started
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}