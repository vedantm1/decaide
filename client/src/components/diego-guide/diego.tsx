import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { useMicroInteractions } from "@/hooks/use-micro-interactions";
import { TutorialStep } from "@/hooks/use-diego-guide";
import DiegoAvatar from "./diego-avatar";

interface DiegoProps {
  isNewUser?: boolean;
  currentStep?: TutorialStep;
  onComplete?: () => void;
}

// Define all possible tutorial steps
const TUTORIAL_STEPS = {
  WELCOME: "welcome" as const,
  DASHBOARD: "dashboard" as const,
  NAVIGATION: "navigation" as const,
  ROLEPLAY: "roleplay" as const,
  PERFORMANCE_INDICATORS: "performance_indicators" as const,
  PRACTICE_TESTS: "practice_tests" as const,
  WRITTEN_EVENTS: "written_events" as const,
  PROGRESS: "progress" as const,
  SETTINGS: "settings" as const,
  COMPLETE: "complete" as const,
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
      repeatType: "loop" as const
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
    const steps = Object.values(TUTORIAL_STEPS) as TutorialStep[];
    const currentIndex = steps.indexOf(activeStep as TutorialStep);
    
    if (currentIndex < steps.length - 1) {
      setActiveStep(steps[currentIndex + 1] as TutorialStep);
      
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
          <DiegoAvatar emotion="happy" size="sm" />
        </div>
      </motion.div>
    );
  }

  // Get content for current step
  const content = TUTORIAL_CONTENT[activeStep as keyof typeof TUTORIAL_CONTENT];

  // Animation for the tropical banner
  const tropicalBannerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { delay: 0.5, duration: 0.3 }
    },
    exit: { opacity: 0, y: 10 }
  };

  // Animation for the dolphin avatar on top
  const avatarVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.5 },
    visible: { 
      opacity: 1, 
      y: -25, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 15,
        delay: 0.1
      }
    }
  };

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
              className={`bg-white rounded-lg shadow-xl border border-primary-100 max-w-sm ${isMobile ? 'w-full' : 'w-96'} relative`}
              variants={bubbleVariants}
            >
              {/* Animated dolphin avatar on top */}
              <motion.div 
                className="absolute"
                style={{ 
                  left: '50%', 
                  top: 0, 
                  transform: 'translate(-50%, -50%)' 
                }}
                variants={avatarVariants}
              >
                <DiegoAvatar emotion="excited" size="md" />
              </motion.div>

              {/* Trial banner */}
              <motion.div 
                className="bg-gradient-to-r from-teal-500 to-blue-500 text-white text-xs py-1 px-3 rounded-full absolute -top-2 right-2 shadow-md"
                variants={tropicalBannerVariants}
              >
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  Pro features - 3 day trial on us! 🏝️
                </span>
              </motion.div>

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
                Step {Object.values(TUTORIAL_STEPS).indexOf(activeStep as keyof typeof TUTORIAL_STEPS) + 1} of {Object.values(TUTORIAL_STEPS).length}
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
            <DiegoAvatar emotion={isDiegoMinimized ? "excited" : "happy"} size="sm" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}