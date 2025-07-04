import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Play, SkipForward } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DECA_EVENTS } from '@shared/schema';

interface OnboardingOverlayProps {
  isOpen: boolean;
  onComplete: () => void;
  userName?: string;
}

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

  const handleFinishOnboarding = async () => {
    if (Object.keys(selectedEvents).length === 0) {
      setErrorMessage("Please select at least one event to continue.");
      return;
    }

    const selectedEvent = Object.values(selectedEvents)[0];
    const eventDetails = DECA_EVENTS.find((event: any) => event.code === selectedEvent);
    
    if (!eventDetails) {
      setErrorMessage("Selected event not found. Please try again.");
      return;
    }

    try {
      const response = await fetch('/api/user/update-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          eventCode: eventDetails.code,
          eventType: eventDetails.type,
          eventFormat: 'roleplay',
          instructionalArea: eventDetails.cluster,
          cluster: eventDetails.cluster,
          needsOnboarding: false
        }),
      });

      if (response.ok) {
        // Clean up all tutorial effects
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

        // Clean up main content blur
        const mainContent = document.querySelector('main') || document.querySelector('#root > div');
        if (mainContent) {
          (mainContent as HTMLElement).style.filter = '';
          (mainContent as HTMLElement).style.transition = '';
        }

        onComplete();
      } else {
        setErrorMessage("Failed to save event selection. Please try again.");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  // Create blur overlay effect for tutorial
  useEffect(() => {
    if (currentStep === 'tutorial') {
      const currentSelector = TUTORIAL_STEPS[tutorialStep].selector;
      const targetElement = document.querySelector(currentSelector);
      
      // Apply blur to entire background
      const mainContent = document.querySelector('main') || document.querySelector('#root > div');
      if (mainContent) {
        (mainContent as HTMLElement).style.filter = 'blur(3px)';
        (mainContent as HTMLElement).style.transition = 'filter 0.3s ease-in-out';
      }
      
      // Clear all previous tutorial styling first
      document.querySelectorAll('*').forEach(el => {
        const element = el as HTMLElement;
        if (element.dataset.tutorialBlurred) {
          element.style.filter = '';
          element.style.transition = '';
          delete element.dataset.tutorialBlurred;
        }
        if (element.dataset.tutorialHighlighted) {
          element.style.filter = '';
          element.style.transition = '';
          element.style.zIndex = '';
          element.style.boxShadow = '';
          element.style.background = '';
          element.style.position = '';
          element.style.borderRadius = '';
          delete element.dataset.tutorialHighlighted;
        }
      });
      
      // Blur sidebar elements except target
      const aside = document.querySelector('aside');
      if (aside) {
        const navItems = aside.querySelectorAll<HTMLElement>('[data-tutorial]');
        navItems.forEach(item => {
          if (item === targetElement) return;
          item.style.filter = 'blur(2px)';
          item.style.transition = 'filter 0.3s ease-in-out';
          item.dataset.tutorialBlurred = 'true';
        });
      }

      // Highlight target element
      if (targetElement) {
        (targetElement as HTMLElement).style.filter = 'none';
        (targetElement as HTMLElement).style.position = 'relative';
        (targetElement as HTMLElement).style.zIndex = '60';
        (targetElement as HTMLElement).style.transition = 'all 0.3s ease-in-out';
        (targetElement as HTMLElement).style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.6), 0 0 60px rgba(59, 130, 246, 0.4)';
        (targetElement as HTMLElement).style.borderRadius = '12px';
        (targetElement as HTMLElement).style.background = 'rgba(255, 255, 255, 0.1)';
        (targetElement as HTMLElement).dataset.tutorialHighlighted = 'true';

        // Scroll to highlighted element
        setTimeout(() => {
          targetElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'center'
          });
        }, 100);
      }
      
      // Clean up function
      return () => {
        const mainContent = document.querySelector('main') || document.querySelector('#root > div');
        if (mainContent) {
          (mainContent as HTMLElement).style.filter = '';
          (mainContent as HTMLElement).style.transition = '';
        }
        
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
            delete element.dataset.tutorialBlurred;
            delete element.dataset.tutorialHighlighted;
          }
        });
      };
    } else {
      // Remove blur when not in tutorial
      const mainContent = document.querySelector('main') || document.querySelector('#root > div');
      if (mainContent) {
        (mainContent as HTMLElement).style.filter = '';
        (mainContent as HTMLElement).style.transition = '';
      }
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
      
      // Clean up main content blur
      const mainContent = document.querySelector('main') || document.querySelector('#root > div');
      if (mainContent) {
        (mainContent as HTMLElement).style.filter = '';
        (mainContent as HTMLElement).style.transition = '';
      }
    }
  }, [isOpen]);

  console.log('OnboardingOverlay - isOpen:', isOpen, 'currentStep:', currentStep);

  if (!isOpen) return null;

  // Group events by cluster for better organization
  const eventsByCluster = DECA_EVENTS.reduce((acc: any, event: any) => {
    if (!acc[event.cluster]) {
      acc[event.cluster] = [];
    }
    acc[event.cluster].push(event);
    return acc;
  }, {} as {[cluster: string]: typeof DECA_EVENTS});

  const selectedCount = Object.keys(selectedEvents).length;
  const isDoneActive = selectedCount === 1;

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
                  Welcome to DecA(I)de, {userName}!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Let's get you started with a quick tour of the platform.
                </p>
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
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <Button
                    onClick={handleNextStep}
                    size="sm"
                    className="gap-1"
                  >
                    {tutorialStep === TUTORIAL_STEPS.length - 1 ? 'Finish' : 'Next'}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Event Selection */}
        {currentStep === 'event-selection' && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-4xl w-full max-h-[80vh] overflow-y-auto"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Select Your DECA Event</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Choose the event you want to focus on. You can change this later in settings.
                </p>
                {errorMessage && (
                  <p className="text-sm text-red-500">{errorMessage}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(eventsByCluster).map(([cluster, events]) => (
                  <div key={cluster} className="space-y-3">
                    <h3 className="text-lg font-semibold text-primary">{cluster}</h3>
                    <div className="grid gap-2">
                      {events.map((event: any) => (
                        <div
                          key={event.code}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedEvents[cluster] === event.code
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border hover:border-muted-foreground hover:bg-muted/50'
                          }`}
                          onClick={() => handleEventSelect(cluster, event.code)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {event.code}
                                </Badge>
                                <span className="font-medium">{event.name}</span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {event.type}
                              </p>
                            </div>
                            {selectedEvents[cluster] === event.code && (
                              <div className="h-4 w-4 rounded-full bg-primary"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleFinishOnboarding}
                    disabled={!isDoneActive}
                    className="px-8"
                  >
                    Complete Setup
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