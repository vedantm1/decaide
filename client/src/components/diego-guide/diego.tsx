import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { useMicroInteractions } from "@/hooks/use-micro-interactions";
import { TutorialStep } from "@/hooks/use-diego-guide";
import DiegoAvatar from "./diego-avatar";

// Fun facts that Diego can share
const funFacts = [
  "DECA was founded in 1946 and was originally called the Distributive Education Clubs of America.",
  "Over 225,000 high school students participate in DECA programs each year!",
  "DECA's Diamond logo represents the four points of a student's development: Vocational Understanding, Civic Consciousness, Social Intelligence, and Leadership.",
  "The DECA Glass Trophy is one of the most coveted awards in business education competitions.",
  "DECA operates in all 50 U.S. states, Canada, and several other countries worldwide.",
  "Many successful entrepreneurs and business leaders started their journey in DECA!",
  "DECA's competitive events are designed to simulate real-world business scenarios.",
  "Each year, DECA awards over $300,000 in scholarships to members.",
  "The International Career Development Conference (ICDC) brings together over 20,000 members annually.",
  "DECA's guiding principles include competence, innovation, integrity, and teamwork."
];

interface DiegoProps {
  isNewUser?: boolean;
  currentStep?: TutorialStep;
  onComplete?: () => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 100 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0, 
    y: 100,
    transition: { 
      duration: 0.3,
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 }
};

export default function Diego({ isNewUser = false, currentStep, onComplete }: DiegoProps) {
  const isMobile = useIsMobile();
  const [factIndex, setFactIndex] = useState(Math.floor(Math.random() * funFacts.length));
  const { triggerAnimation } = useMicroInteractions();
  const [tutorialProgress, setTutorialProgress] = useState(0);
  const [showBubble, setShowBubble] = useState(true);
  
  // Randomize fun facts every 20 seconds if Diego is visible
  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex(prev => {
        let newIndex;
        do {
          newIndex = Math.floor(Math.random() * funFacts.length);
        } while (newIndex === prev);
        return newIndex;
      });
    }, 20000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Get current tutorial message based on step
  const getTutorialMessage = useCallback(() => {
    if (!currentStep) return "Hello! I'm Diego, your DECA training assistant!";
    
    switch(currentStep) {
      case 'welcome':
        return "Welcome to DecA(I)de! I'm Diego, your personal DECA training assistant. Let me guide you through our platform!";
      case 'dashboard':
        return "This is your dashboard. Here you can see your progress, upcoming challenges, and recommendations for practice.";
      case 'navigation':
        return "Use the navigation menu to access different features. Let's explore what each section offers!";
      case 'roleplay':
        return "In the Roleplay section, you can practice role-playing scenarios specific to your DECA event category.";
      case 'performance_indicators':
        return "Performance Indicators are key concepts you need to master. Track your progress and get explanations for each one.";
      case 'practice_tests':
        return "Take practice tests to prepare for your DECA exam. Our AI generates questions based on your event.";
      case 'written_events':
        return "Written Events require detailed business plans. Get feedback and guidance on your submissions here.";
      case 'progress':
        return "Monitor your learning progress over time. See which areas need more focus and celebrate your improvements!";
      case 'settings':
        return "Customize your experience in Settings. Choose themes, notification preferences, and update your profile.";
      case 'complete':
        return "Great job! You've completed the tour. I'll always be here if you need help. Just click my icon in the corner!";
      default:
        return "I'm here to help you prepare for your DECA competition. What would you like to practice today?";
    }
  }, [currentStep]);
  
  // Handle next tutorial step
  const handleNextStep = useCallback(() => {
    if (tutorialProgress < getTutorialSteps().length - 1) {
      // Play animation for moving to next step
      triggerAnimation('popIn');
      setTutorialProgress(prev => prev + 1);
    } else {
      // Completed tutorial
      triggerAnimation('confetti');
      if (onComplete) onComplete();
    }
  }, [tutorialProgress, triggerAnimation, onComplete]);
  
  // Get tutorial steps based on current step
  const getTutorialSteps = useCallback(() => {
    switch(currentStep) {
      case 'welcome':
        return [
          "Hi there! 👋 I'm Diego, your personal DECA training assistant!",
          "I'm here to help you prepare for your DECA competitions and achieve your business career goals.",
          "Let me show you around DecA(I)de and explain how I can assist you throughout your journey."
        ];
      case 'dashboard':
        return [
          "This is your dashboard - your command center for DECA preparation!",
          "You can see your progress, upcoming challenges, and personalized recommendations.",
          "The dashboard adapts to your learning style and competition focus."
        ];
      case 'navigation':
        return [
          "The sidebar navigation gives you access to all our training features.",
          "Each section is designed to help with different aspects of DECA preparation.",
          "Let's explore the main training modules together!"
        ];
      case 'complete':
        return [
          "Fantastic! You've completed the tour of DecA(I)de!",
          "I'll always be available if you need help - just click my icon in the corner.",
          "Ready to start your DECA preparation journey?"
        ];
      default:
        return [getTutorialMessage()];
    }
  }, [currentStep, getTutorialMessage]);
  
  // Current message based on tutorial progress
  const currentMessage = getTutorialSteps()[tutorialProgress] || funFacts[factIndex];
  
  // Decide if next button should show "finish" text
  const isLastStep = tutorialProgress === getTutorialSteps().length - 1;
  
  // Position based on device
  const position = isMobile ? "bottom-0 left-0 right-0 mb-4 mx-auto w-full max-w-md" 
                           : "bottom-24 right-6 w-80";
  
  return (
    <AnimatePresence>
      {showBubble && (
        <motion.div
          className={`fixed z-50 ${position}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="relative bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-2xl p-4 shadow-lg overflow-hidden border border-blue-300 dark:border-blue-700">
            {/* Top right close button */}
            <button 
              onClick={() => setShowBubble(false)}
              className="absolute top-2 right-2 text-white/80 hover:text-white"
              aria-label="Close Diego guide"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <div className="flex items-start gap-3">
              {/* Diego Avatar */}
              <div className="flex-shrink-0">
                <DiegoAvatar emotion={currentStep === 'complete' ? 'excited' : 'happy'} />
              </div>
              
              {/* Message content */}
              <div className="flex-1">
                <motion.p 
                  className="text-white font-medium mb-3"
                  key={currentMessage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentMessage}
                </motion.p>
                
                {/* Tutorial navigation buttons */}
                {currentStep && (
                  <motion.div 
                    className="flex justify-between items-center"
                    variants={itemVariants}
                  >
                    {/* Progress indicator */}
                    <div className="flex space-x-1">
                      {getTutorialSteps().map((_, idx) => (
                        <div 
                          key={idx} 
                          className={`w-2 h-2 rounded-full ${idx <= tutorialProgress ? 'bg-white' : 'bg-white/30'}`}
                        />
                      ))}
                    </div>
                    
                    {/* Next/Finish button */}
                    <Button
                      onClick={handleNextStep}
                      variant="ghost"
                      className="text-white hover:bg-white/20 px-3 py-1 h-8"
                    >
                      {isLastStep ? "Finish" : "Next"}
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
            
            {/* Decorative elements for Memphis style */}
            <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-yellow-300 rounded-full opacity-20"></div>
            <div className="absolute -left-2 -top-2 w-8 h-8 bg-pink-500 rounded-full opacity-20"></div>
            <div className="absolute right-1/4 top-0 w-4 h-12 bg-green-400 opacity-20 rotate-45"></div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}