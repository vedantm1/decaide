import { motion, Variants } from "framer-motion";

// Define props for our composite component
interface SideProfileDolphinProps {
  dimensions: { width: number; height: number };
  targetPosition?: { x: number; y: number };
  swimming?: boolean;
  pointDirection?: 'left' | 'right';
  onArrival?: () => void;
  showTextBox?: boolean;
  message?: string;
}

// Define animation variants for the dolphin container
const dolphinVariants: Variants = {
  idle: {
    x: 0,
    y: 0,
    transition: { type: "spring", stiffness: 50, damping: 10 }
  },
  swimming: (target: { x: number; y: number } | undefined) => ({
    x: target ? target.x : 0,
    y: target ? target.y : 0,
    transition: { type: "tween", duration: 5, ease: "easeInOut" }
  })
};

// Variants for individual dolphin parts (customize these as needed)
const bodyVariants: Variants = {
  idle: { y: 0 },
  swimming: { y: [0, -2, 0, 2, 0], transition: { repeat: Infinity, duration: 2, ease: "easeInOut" } }
};

const tailVariants: Variants = {
  idle: { rotate: 0 },
  swimming: { rotate: [0, 8, 0, -5, 0], transition: { repeat: Infinity, duration: 1.2, ease: "easeInOut" } }
};

const finVariants: Variants = {
  idle: { rotate: 0 },
  swimming: { rotate: [0, 10, 0, -10, 0], transition: { repeat: Infinity, duration: 1.8, ease: "easeInOut" } }
};

// The main composite component
export default function SideProfileDolphin({
  dimensions,
  targetPosition,
  swimming = false,
  pointDirection = 'right',
  onArrival,
  showTextBox = false,
  message = "I'm swimming over!"
}: SideProfileDolphinProps) {
  return (
    <motion.div
      initial="idle"
      animate={swimming ? "swimming" : "idle"}
      custom={targetPosition}
      variants={dolphinVariants}
      onAnimationComplete={() => { if (onArrival) onArrival(); }}
      style={{ 
        width: dimensions.width, 
        height: dimensions.height, 
        position: "relative",
        transform: pointDirection === 'left' ? 'scaleX(-1)' : 'none'
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 120 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="sideBodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4FD1C5" />
            <stop offset="50%" stopColor="#35A0DE" />
            <stop offset="100%" stopColor="#3182CE" />
          </linearGradient>
          <linearGradient id="sideBellyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#79C3F1" />
            <stop offset="100%" stopColor="#A7D8FF" />
          </linearGradient>
          <linearGradient id="sideFinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2D8BC7" />
            <stop offset="100%" stopColor="#1A5F9E" />
          </linearGradient>
          <filter id="sideGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="shineEffect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.5" result="blur" />
            <feSpecularLighting in="blur" specularConstant="1" specularExponent="20" lightingColor="white">
              <fePointLight x="50" y="10" z="40" />
            </feSpecularLighting>
            <feComposite in="SourceGraphic" in2="blur" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
          </filter>
        </defs>
        
        {/* Enhanced dolphin body with fluid curvature and undulating motion */}
        <motion.path
          d="M95 35C95 46 85 60 70 65C55 70 40 65 30 60C20 55 10 45 5 40C0 35 0 30 5 25C10 20 20 15 30 10C40 5 55 5 70 10C85 15 95 24 95 35Z"
          fill="url(#sideBodyGradient)"
          stroke="#2D8BC7"
          strokeWidth="0.3"
          variants={bodyVariants}
        />
        
        {/* Enhanced belly with gradient and subtle shine */}
        <path
          d="M60 40C45 45 30 45 20 40C10 35 15 30 25 25C35 20 50 20 65 25C80 30 75 35 60 40Z"
          fill="url(#sideBellyGradient)"
          filter="url(#shineEffect)"
        />
        
        {/* Enhanced dorsal fin with better shape and subtle steering motion */}
        <motion.path
          d="M60 10C63 6 68 5 70 11C70 15 65 17 60 14C58 12 58 10 60 10Z"
          fill="url(#sideFinGradient)"
          stroke="#2D8BC7"
          strokeWidth="0.3"
          animate={{
            rotate: [0, 3, 0, -3, 0],
            originX: 0.5,
            originY: 1,
            transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
          }}
        />
        
        {/* Enhanced tail with fluid side-to-side propulsion */}
        <motion.path
          d="M10 35C5 32 0 36 0 40C0 44 5 47 10 45C15 43 15 37 10 35Z"
          fill="url(#sideFinGradient)"
          stroke="#2D8BC7"
          strokeWidth="0.3"
          variants={tailVariants}
        />
        
        {/* Enhanced pectoral flipper with steering adjustments */}
        <motion.path
          d="M45 45C40 48 35 53 40 55C45 57 50 50 45 45Z"
          fill="url(#sideFinGradient)"
          stroke="#2D8BC7"
          strokeWidth="0.3"
          variants={finVariants}
        />
        
        {/* Enhanced eye with depth and shine */}
        <circle cx="85" cy="30" r="4" fill="white" />
        <circle cx="85" cy="30" r="2" fill="black" />
        <circle cx="84" cy="29" r="0.8" fill="white" filter="url(#sideGlow)" />
        
        {/* Enhanced smile with glow effect */}
        <path
          d="M85 40C85 40 80 43 75 40"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          filter="url(#sideGlow)"
        />
      </svg>
      {showTextBox && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-white rounded shadow text-sm">
          {message || "I'm swimming over!"}
        </div>
      )}
      <WaveTransition targetPosition={targetPosition} />
    </motion.div>
  );
}

// WaveTransition Component
interface WaveTransitionProps {
  targetPosition?: { x: number; y: number };
}

function WaveTransition({ targetPosition }: WaveTransitionProps) {
  // Variants for entrance/exit wave animation
  const waveVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: "easeOut" }
    },
    exit: { opacity: 0, y: -20, transition: { duration: 1, ease: "easeIn" } }
  };

  return (
    <motion.svg
      viewBox="0 0 120 20"
      className="absolute bottom-0 left-0 w-full"
      variants={waveVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <defs>
        <linearGradient id="waveGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4FD1C5" />
          <stop offset="50%" stopColor="#35A0DE" />
          <stop offset="100%" stopColor="#3182CE" />
        </linearGradient>
      </defs>
      {/* A curved wave path */}
      <motion.path
        d="M0,10 C30,0 90,20 120,10 L120,20 L0,20 Z"
        fill="url(#waveGradient)"
        animate={{
          x: [0, -10, 0, 10, 0],
          transition: { repeat: Infinity, duration: 6, ease: "easeInOut" }
        }}
      />
      {/* Optional bubbles/splashes */}
      <motion.circle
        cx="30"
        cy="5"
        r="1.5"
        fill="white"
        opacity="0.8"
        animate={{
          y: [0, -5, 0],
          opacity: [0.8, 0.2, 0.8],
          transition: { repeat: Infinity, duration: 3, ease: "easeInOut" }
        }}
      />
      <motion.circle
        cx="80"
        cy="8"
        r="1"
        fill="white"
        opacity="0.7"
        animate={{
          y: [0, -3, 0],
          opacity: [0.7, 0.3, 0.7],
          transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
        }}
      />
    </motion.svg>
  );
}