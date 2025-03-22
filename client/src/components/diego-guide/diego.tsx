import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { useMicroInteractions } from "@/hooks/use-micro-interactions";

interface DiegoProps {
  isNewUser?: boolean;
  currentStep?: string;
  onComplete?: () => void;
}

// Define all possible tutorial steps
const TUTORIAL_STEPS = {
  WELCOME: "welcome",
  DASHBOARD: "dashboard",
  NAVIGATION: "navigation",
  ROLEPLAY: "roleplay",
  PERFORMANCE_INDICATORS: "performance_indicators",
  PRACTICE_TESTS: "practice_tests",
  WRITTEN_EVENTS: "written_events",
  PROGRESS: "progress",
  SETTINGS: "settings",
  COMPLETE: "complete",
};

// Diego's message content for each tutorial step
const TUTORIAL_CONTENT = {
  [TUTORIAL_STEPS.WELCOME]: {
    title: "Welcome to DecA(I)de!",
    message: "I'm Diego, your DECA training assistant! I'll help you navigate this platform and prepare for your DECA competitions. Let's start with a quick tour!",
    buttonText: "Let's Go!",
  },
  [TUTORIAL_STEPS.DASHBOARD]: {
    title: "Your Dashboard",
    message: "This is your personalized dashboard where you can see your progress, daily challenges, and recommended practice activities. Check in daily to maintain your streak!",
    buttonText: "Next",
  },
  [TUTORIAL_STEPS.NAVIGATION]: {
    title: "Navigating DecA(I)de",
    message: "Use the sidebar to access different sections of the platform. You can practice roleplays, learn performance indicators, take tests, and work on written events!",
    buttonText: "Show Me More",
  },
  [TUTORIAL_STEPS.ROLEPLAY]: {
    title: "Roleplay Practice",
    message: "In the Roleplay section, you can generate custom roleplay scenarios based on your event and practice your presentation skills. You'll get AI-powered feedback too!",
    buttonText: "Next",
  },
  [TUTORIAL_STEPS.PERFORMANCE_INDICATORS]: {
    title: "Performance Indicators",
    message: "Performance Indicators are key concepts you need to master for your event. Track your progress and get detailed explanations for each one!",
    buttonText: "Next",
  },
  [TUTORIAL_STEPS.PRACTICE_TESTS]: {
    title: "Practice Tests",
    message: "Test your knowledge with custom practice tests tailored to your event. Each test includes multiple-choice questions and explanations for the answers.",
    buttonText: "Next",
  },
  [TUTORIAL_STEPS.WRITTEN_EVENTS]: {
    title: "Written Events",
    message: "If your event includes a written component, you can get guidance and feedback on your written event here. Upload drafts for AI-powered suggestions!",
    buttonText: "Next",
  },
  [TUTORIAL_STEPS.PROGRESS]: {
    title: "Track Your Progress",
    message: "The Progress section shows your improvement over time. Set goals, track completion, and identify areas where you need more practice.",
    buttonText: "Next",
  },
  [TUTORIAL_STEPS.SETTINGS]: {
    title: "Personalize Your Experience",
    message: "In Settings, you can customize your profile, change your event type, adjust notification preferences, and manage your subscription.",
    buttonText: "Next",
  },
  [TUTORIAL_STEPS.COMPLETE]: {
    title: "You're All Set!",
    message: "Great job completing the tour! Remember, I'm always here if you need help. Just click on the Diego icon in the corner. Good luck with your DECA journey!",
    buttonText: "Start Training!",
  },
};

// Diego animation variants
const diegoVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.8 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  },
  exit: { 
    opacity: 0, 
    y: 20, 
    scale: 0.8,
    transition: { 
      duration: 0.3
    }
  },
  bounce: {
    y: [0, -15, 0],
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatType: "loop"
    }
  }
};

// Bubble animation variants
const bubbleVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 500,
      damping: 30,
      delay: 0.2
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9,
    transition: { 
      duration: 0.2
    }
  }
};

export default function Diego({ isNewUser = false, currentStep = TUTORIAL_STEPS.WELCOME, onComplete }: DiegoProps) {
  const [isVisible, setIsVisible] = useState(isNewUser);
  const [activeStep, setActiveStep] = useState(currentStep);
  const [isDiegoMinimized, setIsDiegoMinimized] = useState(false);
  const isMobile = useIsMobile();
  const { triggerAnimation } = useMicroInteractions();

  // Auto-show Diego for new users
  useEffect(() => {
    if (isNewUser) {
      setIsVisible(true);
      setActiveStep(TUTORIAL_STEPS.WELCOME);
    }
  }, [isNewUser]);

  // Progress to the next tutorial step
  const handleNextStep = () => {
    const steps = Object.values(TUTORIAL_STEPS);
    const currentIndex = steps.indexOf(activeStep);
    
    if (currentIndex < steps.length - 1) {
      setActiveStep(steps[currentIndex + 1]);
      
      // Add some fun microinteractions when progressing through the tutorial
      if (currentIndex > 0 && currentIndex % 2 === 0) {
        triggerAnimation('confetti');
      }
    } else {
      // Tutorial complete
      setIsVisible(false);
      if (onComplete) onComplete();
    }
  };

  // Toggle Diego's visibility
  const toggleDiego = () => {
    setIsVisible(!isVisible);
    setIsDiegoMinimized(false);
  };

  // Minimize Diego to just the icon
  const minimizeDiego = () => {
    setIsDiegoMinimized(true);
  };

  if (!isVisible && !isNewUser) {
    // Floating Diego button when not in tutorial mode
    return (
      <motion.div
        className="fixed bottom-5 right-5 z-50 cursor-pointer"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={toggleDiego}
      >
        <div className="bg-primary text-white p-3 rounded-full shadow-lg">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" fill="#4F46E5"/>
            <circle cx="8" cy="9" r="1.5" fill="white"/>
            <circle cx="16" cy="9" r="1.5" fill="white"/>
            <path d="M8.5 15C8.5 15 10 17 12 17C14 17 15.5 15 15.5 15" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </motion.div>
    );
  }

  // Get content for current step
  const content = TUTORIAL_CONTENT[activeStep as keyof typeof TUTORIAL_CONTENT];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className={`fixed ${isMobile ? 'inset-x-2 bottom-2' : 'bottom-5 right-5'} z-50 flex items-end gap-3`}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={diegoVariants}
        >
          {!isDiegoMinimized && (
            <motion.div 
              className={`bg-white rounded-lg shadow-xl border border-primary-100 max-w-sm ${isMobile ? 'w-full' : 'w-96'}`}
              variants={bubbleVariants}
            >
              <div className="flex items-center justify-between bg-primary text-white rounded-t-lg p-3">
                <h3 className="font-medium text-sm">{content.title}</h3>
                <div className="flex items-center gap-2">
                  <button onClick={minimizeDiego} className="text-white/80 hover:text-white">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 13H5V11H19V13Z" fill="currentColor"/>
                    </svg>
                  </button>
                  <button onClick={toggleDiego} className="text-white/80 hover:text-white">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-slate-700 mb-4">{content.message}</p>
                <Button onClick={handleNextStep} className="w-full">
                  {content.buttonText}
                </Button>
              </div>
              <div className="text-xs text-center text-slate-400 pb-2">
                Step {Object.values(TUTORIAL_STEPS).indexOf(activeStep) + 1} of {Object.values(TUTORIAL_STEPS).length}
              </div>
            </motion.div>
          )}

          <motion.div 
            className="bg-primary text-white p-3 rounded-full shadow-lg cursor-pointer"
            variants={diegoVariants}
            animate={isDiegoMinimized ? "bounce" : "visible"}
            whileHover={{ scale: 1.1 }}
            onClick={() => setIsDiegoMinimized(false)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" fill="#4F46E5"/>
              <circle cx="8" cy="9" r="1.5" fill="white"/>
              <circle cx="16" cy="9" r="1.5" fill="white"/>
              <path d="M8.5 15C8.5 15 10 17 12 17C14 17 15.5 15 15.5 15" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}