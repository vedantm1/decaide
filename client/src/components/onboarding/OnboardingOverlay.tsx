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
  "Business Management & Administration": [
    { name: "Human Resources Management", abbrev: "HRM" },
    { name: "Business Services Marketing", abbrev: "BSM" }
  ],
  "Finance": [
    { name: "Accounting Applications", abbrev: "ACT" },
    { name: "Business Finance", abbrev: "BFS" },
    { name: "Financial Consulting", abbrev: "FCN" },
    { name: "Personal Financial Literacy", abbrev: "PFL" }
  ],
  "Hospitality & Tourism": [
    { name: "Hotel & Lodging Management", abbrev: "HLM" },
    { name: "Quick Serve Restaurant Management", abbrev: "QSR" },
    { name: "Restaurant & Food Service Management", abbrev: "RMS" },
    { name: "Travel & Tourism", abbrev: "TTM" }
  ],
  "Marketing": [
    { name: "Automotive Services Marketing", abbrev: "ASM" },
    { name: "Fashion Merchandising & Marketing", abbrev: "FMM" },
    { name: "Marketing", abbrev: "MKT" },
    { name: "Professional Selling", abbrev: "PSE" },
    { name: "Retail Merchandising", abbrev: "RMA" },
    { name: "Sports & Entertainment Marketing", abbrev: "SEM" }
  ],
  "Entrepreneurship": [
    { name: "Entrepreneurship Innovation Plan", abbrev: "EIP" },
    { name: "Entrepreneurship Growth Plan", abbrev: "EGP" },
    { name: "Independent Business Plan", abbrev: "IBP" }
  ],
  "Personal Financial Literacy": [
    { name: "Personal Financial Literacy", abbrev: "PFL" }
  ],
  "Business Administration Core": [
    { name: "Principles of Business Administration", abbrev: "PBA" },
    { name: "Principles of Finance", abbrev: "PFN" },
    { name: "Principles of Hospitality & Tourism", abbrev: "PHT" },
    { name: "Principles of Marketing", abbrev: "PMK" }
  ]
};

const TUTORIAL_STEPS = [
  {
    title: "Dashboard",
    description: "Your Dashboard displays your practice stats—role-plays completed, practice tests taken, PIs mastered, and current streak.",
    selector: "[data-tutorial='dashboard']",
    position: { x: 300, y: 100 }
  },
  {
    title: "Practice Tests", 
    description: "Tap 'Practice Tests' to jump into written exam simulations and track your scores.",
    selector: "[data-tutorial='practice-tests']",
    position: { x: 300, y: 150 }
  },
  {
    title: "Roleplay",
    description: "Select 'Roleplay' to practice scenario conversations with AI and review transcripts.",
    selector: "[data-tutorial='roleplay']", 
    position: { x: 300, y: 200 }
  },
  {
    title: "Written Events",
    description: "Under 'Written Events,' find prompts for written performance events.",
    selector: "[data-tutorial='written-events']",
    position: { x: 300, y: 250 }
  },
  {
    title: "Performance Indicators",
    description: "Browse all PIs here—tap any to see definitions, examples, and practice questions.",
    selector: "[data-tutorial='performance-indicators']",
    position: { x: 300, y: 300 }
  },
  {
    title: "My Progress", 
    description: "Check your mastery timeline, badges, and goals on 'My Progress.'",
    selector: "[data-tutorial='my-progress']",
    position: { x: 300, y: 350 }
  },
  {
    title: "Settings",
    description: "Open 'Settings' to customize your experience, adjust notifications, or log out.",
    selector: "[data-tutorial='settings']",
    position: { x: 300, y: 400 }
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

  const handleDone = () => {
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
    localStorage.setItem('selectedDecaEvent', selectedEvent);
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
      // Add blur to all elements except the highlighted one
      const currentSelector = TUTORIAL_STEPS[tutorialStep].selector;
      const allElements = document.querySelectorAll('*:not(.onboarding-overlay)');
      const targetElement = document.querySelector(currentSelector);
      
      allElements.forEach(el => {
        if (el !== targetElement && !targetElement?.contains(el)) {
          (el as HTMLElement).style.filter = 'blur(2px)';
          (el as HTMLElement).style.transition = 'filter 0.3s ease-in-out';
        }
      });
      
      if (targetElement) {
        (targetElement as HTMLElement).style.filter = 'none';
        (targetElement as HTMLElement).style.position = 'relative';
        (targetElement as HTMLElement).style.zIndex = '60';
      }
      
      return () => {
        allElements.forEach(el => {
          (el as HTMLElement).style.filter = '';
          (el as HTMLElement).style.transition = '';
          (el as HTMLElement).style.zIndex = '';
        });
      };
    }
  }, [currentStep, tutorialStep]);

  console.log('OnboardingOverlay - isOpen:', isOpen, 'currentStep:', currentStep);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 onboarding-overlay"
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
                  🎉 Congrats, {userName}! Welcome to Decaide!
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
              x: TUTORIAL_STEPS[tutorialStep].position.x,
              y: TUTORIAL_STEPS[tutorialStep].position.y
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="max-w-sm w-full fixed z-[70]"
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