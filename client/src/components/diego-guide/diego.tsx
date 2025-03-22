import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { useMicroInteractions } from "@/hooks/use-micro-interactions";
import { TutorialStep, useDiegoGuide } from "@/hooks/use-diego-guide";
import DiegoAvatar from "./diego-avatar";
import DiegoChat from "./diego-chat";

// Fun facts that Diego can share
const DIEGO_FUN_FACTS = [
  "Did you know I'm from the San Diego Zoo?",
  "Fun fact: Dolphins can recognize themselves in mirrors - we're self-aware just like humans!",
  "Did you know I can swim at speeds of up to 20 miles per hour? That's how I get to all your DECA competitions on time!",
  "I can hold my breath for up to 10 minutes, which is perfect for those long DECA presentations!",
  "Dolphins sleep with one eye open - just like DECA competitors the night before a big event!",
  "My echolocation is so precise I could find a DECA pin in an Olympic-sized pool!",
  "I've memorized all 1,000+ DECA performance indicators, but sometimes I still forget where I left my lunch.",
  "I have more neurons in my brain than a Harvard Business School graduate... don't fact-check that.",
  "The 'A' in DECA stands for 'Association,' but I like to think it stands for 'Aquatic' in my honor.",
  "I've never lost a DECA roleplay... mostly because I've never competed, but that's beside the point!",
  "Standard tier: 3 roleplays and 2 practice tests per month - use them wisely!",
  "Plus tier: 10 roleplays and 8 practice tests per month - that's serious preparation!",
  "Pro tier gives you unlimited everything - champions are made with unlimited practice!",
  "Standard tier includes 2 written event feedback sessions per month.",
  "Plus tier includes 7 written event feedback sessions per month - enough for a solid paper!",
];

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
    avatarType: "normal",
    emotion: "excited"
  },
  [TUTORIAL_STEPS.DASHBOARD]: {
    title: "Your Dashboard",
    message: "This is your personalized dashboard where you can see your progress, daily challenges, and recommended practice activities. Check in daily to maintain your streak!",
    buttonText: "Next",
    avatarType: "pointing",
    pointDirection: "down",
    position: { top: "20%", left: "35%" }
  },
  [TUTORIAL_STEPS.NAVIGATION]: {
    title: "Navigating DecA(I)de",
    message: "Use the sidebar to access different sections of the platform. You can practice roleplays, learn performance indicators, take tests, and work on written events!",
    buttonText: "Show Me More",
    avatarType: "pointing",
    pointDirection: "left",
    position: { top: "30%", left: "15%" }
  },
  [TUTORIAL_STEPS.ROLEPLAY]: {
    title: "Roleplay Practice",
    message: "In the Roleplay section, you can generate custom roleplay scenarios based on your event and practice your presentation skills. You'll get AI-powered feedback too!",
    buttonText: "Next",
    avatarType: "normal",
    emotion: "happy"
  },
  [TUTORIAL_STEPS.PERFORMANCE_INDICATORS]: {
    title: "Performance Indicators",
    message: "Performance Indicators are key concepts you need to master for your event. Track your progress and get detailed explanations for each one!",
    buttonText: "Next",
    avatarType: "pointing",
    pointDirection: "up",
    position: { top: "50%", left: "60%" }
  },
  [TUTORIAL_STEPS.PRACTICE_TESTS]: {
    title: "Practice Tests",
    message: "Test your knowledge with custom practice tests tailored to your event. Each test includes multiple-choice questions and explanations for the answers.",
    buttonText: "Next",
    avatarType: "normal",
    emotion: "thinking"
  },
  [TUTORIAL_STEPS.WRITTEN_EVENTS]: {
    title: "Written Events",
    message: "If your event includes a written component, you can get guidance and feedback on your written event here. Upload drafts for AI-powered suggestions!",
    buttonText: "Next",
    avatarType: "pointing",
    pointDirection: "right",
    position: { top: "40%", right: "15%" }
  },
  [TUTORIAL_STEPS.PROGRESS]: {
    title: "Track Your Progress",
    message: "The Progress section shows your improvement over time. Set goals, track completion, and identify areas where you need more practice.",
    buttonText: "Next",
    avatarType: "normal",
    emotion: "happy"
  },
  [TUTORIAL_STEPS.SETTINGS]: {
    title: "Personalize Your Experience",
    message: "In Settings, you can customize your profile, change your event type, adjust notification preferences, and manage your subscription.",
    buttonText: "Next",
    avatarType: "pointing",
    pointDirection: "left",
    position: { bottom: "20%", left: "20%" }
  },
  [TUTORIAL_STEPS.COMPLETE]: {
    title: "You're All Set!",
    message: "Great job completing the tour! Remember, I'm always here if you need help. Just click on the Diego icon in the corner. Good luck with your DECA journey!",
    buttonText: "Start Training!",
    avatarType: "normal",
    emotion: "excited"
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
  const [isWandering, setIsWandering] = useState(false);
  const [wanderPosition, setWanderPosition] = useState({ x: 0, y: 0 });
  const [showFunFact, setShowFunFact] = useState(false);
  const [currentFunFact, setCurrentFunFact] = useState("");
  const wanderTimerRef = useRef<number | null>(null);
  const funFactTimerRef = useRef<number | null>(null);
  const isMobile = useIsMobile();
  const { triggerAnimation } = useMicroInteractions();
  const { openChat } = useDiegoGuide();

  // Auto-show Diego for new users
  useEffect(() => {
    if (isNewUser) {
      setIsVisible(true);
      setActiveStep(TUTORIAL_STEPS.WELCOME);
    }
  }, [isNewUser]);

  // Initialize wandering behavior when not in tutorial mode
  useEffect(() => {
    if (!isNewUser && !activeStep) {
      startWandering();
      startFunFactTimer();
    }

    return () => {
      // Clean up timers on unmount
      if (wanderTimerRef.current) window.clearTimeout(wanderTimerRef.current);
      if (funFactTimerRef.current) window.clearTimeout(funFactTimerRef.current);
    };
  }, [isNewUser, activeStep]);

  // Start the wandering behavior
  const startWandering = useCallback(() => {
    if (isDiegoMinimized || isVisible || isMobile) return;
    
    setIsWandering(true);
    
    // Generate a random position within the viewport
    const maxX = window.innerWidth - 80; // Account for Diego's width
    const maxY = window.innerHeight - 80; // Account for Diego's height
    
    // Don't wander too close to the edges
    const x = Math.max(20, Math.min(maxX - 20, Math.random() * maxX));
    const y = Math.max(20, Math.min(maxY - 20, Math.random() * maxY));
    
    setWanderPosition({ x, y });
    
    // Schedule next wander
    wanderTimerRef.current = window.setTimeout(() => {
      setIsWandering(false);
      wanderTimerRef.current = window.setTimeout(startWandering, Math.random() * 20000 + 10000); // Random time between 10-30 seconds
    }, 5000); // Visible for 5 seconds
  }, [isDiegoMinimized, isVisible, isMobile]);

  // Start the fun fact timer
  const startFunFactTimer = useCallback(() => {
    if (isDiegoMinimized || isVisible || isMobile) return;
    
    // Pick a random fun fact
    const randomIndex = Math.floor(Math.random() * DIEGO_FUN_FACTS.length);
    setCurrentFunFact(DIEGO_FUN_FACTS[randomIndex]);
    
    // Show the fun fact
    setShowFunFact(true);
    
    // Hide it after a few seconds
    funFactTimerRef.current = window.setTimeout(() => {
      setShowFunFact(false);
      // Schedule next fun fact
      funFactTimerRef.current = window.setTimeout(startFunFactTimer, Math.random() * 60000 + 30000); // Random time between 30-90 seconds
    }, 6000);
  }, [isDiegoMinimized, isVisible, isMobile]);

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
    // Stop wandering when Diego is visible
    if (!isVisible) {
      setIsWandering(false);
      if (wanderTimerRef.current) window.clearTimeout(wanderTimerRef.current);
      if (funFactTimerRef.current) window.clearTimeout(funFactTimerRef.current);
    } else {
      // Resume wandering when Diego is hidden
      wanderTimerRef.current = window.setTimeout(startWandering, 5000);
      funFactTimerRef.current = window.setTimeout(startFunFactTimer, 15000);
    }
    
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

  // Define content types
  type NormalAvatarContent = {
    title: string;
    message: string;
    buttonText: string;
    avatarType: "normal";
    emotion: "happy" | "excited" | "thinking" | "neutral";
  };

  type PointingAvatarContent = {
    title: string;
    message: string;
    buttonText: string;
    avatarType: "pointing";
    pointDirection: "left" | "right" | "up" | "down";
    position: Record<string, string>;
  };

  type StepContent = NormalAvatarContent | PointingAvatarContent;

  // Get content for current step
  const content = TUTORIAL_CONTENT[activeStep as keyof typeof TUTORIAL_CONTENT] as StepContent;

  // Animation for the welcome banner
  const welcomeBannerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { delay: 0.3, duration: 0.5 }
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
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
  
  // Animation for tutorial pointers
  const pointerVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 500,
        damping: 15,
        delay: 0.6
      }
    },
    exit: { opacity: 0, scale: 0, transition: { duration: 0.2 } }
  };

  // Animation for wandering Diego
  const wanderingDiegoVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0,
      transition: { 
        duration: 0.3
      }
    }
  };

  const funFactBubbleVariants = {
    hidden: { opacity: 0, scale: 0, y: 10 },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 500,
        damping: 30,
        delay: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0,
      transition: { 
        duration: 0.2
      }
    }
  };

  return (
    <>
      {/* Wandering Diego that appears randomly with fun facts */}
      <AnimatePresence>
        {isWandering && !isVisible && !isMobile && (
          <motion.div
            className="fixed z-50 cursor-pointer"
            style={{ 
              left: `${wanderPosition.x}px`, 
              top: `${wanderPosition.y}px` 
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={wanderingDiegoVariants}
            onClick={toggleDiego}
          >
            <div className="relative">
              {/* Fun fact speech bubble */}
              {showFunFact && (
                <motion.div
                  className="absolute bottom-full mb-2 bg-white rounded-lg p-3 shadow-lg border border-primary-100 w-48 right-0"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={funFactBubbleVariants}
                >
                  <div className="text-xs font-medium text-slate-800">{currentFunFact}</div>
                  {/* Triangle pointer on speech bubble */}
                  <div className="absolute bottom-[-8px] right-4 w-0 h-0 border-l-[8px] border-l-transparent border-t-[8px] border-t-white border-r-[8px] border-r-transparent"></div>
                </motion.div>
              )}
              
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, 0, -5, 0],
                  transition: { 
                    y: { repeat: Infinity, duration: 2 },
                    rotate: { repeat: Infinity, duration: 3 }
                  }
                }}
              >
                <DiegoAvatar emotion="happy" size="lg" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Diego UI for tutorial and interaction */}
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
                {/* Standard floating avatar for normal mode */}
                {content.avatarType === "normal" && (
                  <motion.div 
                    className="absolute"
                    style={{ 
                      left: '50%', 
                      top: 0, 
                      transform: 'translate(-50%, -50%)' 
                    }}
                    variants={avatarVariants}
                  >
                    <DiegoAvatar emotion={content.emotion || "excited"} size="md" />
                  </motion.div>
                )}
                
                {/* Show welcome banner only for the first step */}
                {activeStep === "welcome" && isNewUser && (
                  <motion.div 
                    className="fixed inset-x-0 top-0 z-50"
                    variants={welcomeBannerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 shadow-lg">
                      <div className="container mx-auto flex items-center justify-center gap-2 text-center">
                        <span className="animate-pulse text-yellow-200">🏝️</span>
                        <span className="font-medium">Welcome to DecA(I)de! 3-day trial activated - enjoy our tropical dolphin assistant!</span>
                        <span className="animate-pulse text-yellow-200">🏝️</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Pointing dolphin avatar for interactive tutorial steps */}
                {content.avatarType === "pointing" && (
                  <motion.div
                    className="fixed z-50"
                    style={content.position as any}
                    variants={pointerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <DiegoAvatar 
                      emotion="pointing" 
                      size="xl" 
                      pointDirection={content.pointDirection as any}
                      message={content.message}
                      showTextBox={true}
                    />
                  </motion.div>
                )}

                <div className="flex items-center justify-between bg-primary text-white rounded-t-lg p-3">
                  <h3 className="font-medium text-sm">{content.title}</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={openChat} className="text-white/80 hover:text-white" title="Chat with Diego">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button onClick={minimizeDiego} className="text-white/80 hover:text-white" title="Minimize">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 13H5V11H19V13Z" fill="currentColor"/>
                      </svg>
                    </button>
                    <button onClick={toggleDiego} className="text-white/80 hover:text-white" title="Close">
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
                  {/* Calculate step number by finding which step we're on */}
                  Step {activeStep ? Object.keys(TUTORIAL_CONTENT).indexOf(activeStep) + 1 : 1} of {Object.keys(TUTORIAL_CONTENT).length}
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

      {/* Persistent floating Diego buttons when not visible */}
      {!isVisible && !isNewUser && !isWandering && (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
          {/* Chat button */}
          <motion.div
            className="cursor-pointer"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            whileHover={{ scale: 1.1 }}
            onClick={openChat}
          >
            <div className="bg-primary/90 text-white p-2 rounded-full shadow-lg flex items-center gap-2">
              <span className="text-xs font-medium whitespace-nowrap px-2">Chat with Diego</span>
              <div className="bg-white/20 p-1 rounded-full">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </motion.div>
          
          {/* Diego avatar button */}
          <motion.div
            className="cursor-pointer"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            onClick={toggleDiego}
          >
            <div className="bg-primary text-white p-3 rounded-full shadow-lg">
              <DiegoAvatar emotion="happy" size="sm" />
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}