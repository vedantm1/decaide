import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, ArrowLeft, ArrowRight, Play, SkipForward } from "lucide-react";

interface OnboardingOverlayProps {
  isOpen: boolean;
  onComplete: () => void;
  userName?: string;
}

const DECA_EVENTS = [
  "Business Management & Administration",
  "Business Administration Core", 
  "Entrepreneurship",
  "Finance",
  "Hospitality & Tourism",
  "Marketing",
  "Personal Financial Literacy"
];

const TUTORIAL_STEPS = [
  {
    title: "Dashboard",
    description: "Your Dashboard displays your practice stats—role-plays completed, practice tests taken, PIs mastered, and current streak.",
    selector: "[data-tutorial='dashboard']",
    position: "right"
  },
  {
    title: "Practice Tests", 
    description: "Tap 'Practice Tests' to jump into written exam simulations and track your scores.",
    selector: "[data-tutorial='practice-tests']",
    position: "right"
  },
  {
    title: "Roleplay",
    description: "Select 'Roleplay' to practice scenario conversations with AI and review transcripts.",
    selector: "[data-tutorial='roleplay']", 
    position: "right"
  },
  {
    title: "Written Events",
    description: "Under 'Written Events,' find prompts for written performance events.",
    selector: "[data-tutorial='written-events']",
    position: "right"
  },
  {
    title: "Performance Indicators",
    description: "Browse all PIs here—tap any to see definitions, examples, and practice questions.",
    selector: "[data-tutorial='performance-indicators']",
    position: "right"
  },
  {
    title: "My Progress", 
    description: "Check your mastery timeline, badges, and goals on 'My Progress.'",
    selector: "[data-tutorial='my-progress']",
    position: "right"
  },
  {
    title: "Settings",
    description: "Open 'Settings' to customize your experience, adjust notifications, or log out.",
    selector: "[data-tutorial='settings']",
    position: "right"
  }
];

export function OnboardingOverlay({ isOpen, onComplete, userName = "User" }: OnboardingOverlayProps) {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'tutorial' | 'event-selection'>('welcome');
  const [tutorialStep, setTutorialStep] = useState(0);

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

  const handleEventSelect = (event: string) => {
    // Store selected event and complete onboarding
    localStorage.setItem('selectedDecaEvent', event);
    onComplete();
  };

  const handleQuizStart = () => {
    // TODO: Implement quiz logic
    console.log("Quiz logic to be implemented");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
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
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-sm w-full fixed bottom-8 right-8"
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
            className="max-w-2xl w-full"
          >
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                  Welcome! What's your DECA event?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {DECA_EVENTS.map((event) => (
                    <Button
                      key={event}
                      onClick={() => handleEventSelect(event)}
                      variant="outline"
                      className="h-auto p-4 text-left justify-start"
                    >
                      {event}
                    </Button>
                  ))}
                </div>
                
                <div className="text-center">
                  <Button
                    onClick={handleQuizStart}
                    variant="secondary"
                    className="gap-2"
                  >
                    Not sure?
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Take our 2-minute quiz to find your perfect event.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}