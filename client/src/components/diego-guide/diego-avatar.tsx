import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import SideProfileDolphin from "./side-profile-dolphin";

interface DiegoAvatarProps {
  emotion?: 'happy' | 'excited' | 'thinking' | 'neutral' | 'pointing';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  pointDirection?: 'left' | 'right' | 'up' | 'down';
  swimming?: boolean;
  targetPosition?: { x: number, y: number };
  onArrival?: () => void;
  message?: string;
  showTextBox?: boolean;
}

// Size variants
const SIZE_VARIANTS = {
  sm: { width: 32, height: 32 },
  md: { width: 48, height: 48 },
  lg: { width: 64, height: 64 },
  xl: { width: 120, height: 80 }, // Side profile is wider than tall
};

// Animation variants
const avatarVariants = {
  idle: {
    y: [0, -3, 0],
    transition: { 
      repeat: Infinity, 
      duration: 2,
      ease: "easeInOut"
    }
  },
  hover: {
    scale: 1.1,
    transition: { 
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  swimming: {
    x: [0, 15, 30, 45, 60],
    transition: {
      duration: 2,
      ease: "linear",
    }
  },
  pointingLeft: {
    x: [-5, 0, -5],
    transition: { 
      repeat: Infinity, 
      duration: 1.5,
      ease: "easeInOut"
    }
  },
  pointingRight: {
    x: [0, 5, 0],
    transition: { 
      repeat: Infinity, 
      duration: 1.5,
      ease: "easeInOut"
    }
  },
  pointingUp: {
    y: [-5, 0, -5],
    transition: { 
      repeat: Infinity, 
      duration: 1.5,
      ease: "easeInOut"
    }
  },
  pointingDown: {
    y: [0, 5, 0],
    transition: { 
      repeat: Infinity, 
      duration: 1.5,
      ease: "easeInOut"
    }
  }
};

// Emotions for the front-facing dolphin
const EMOTIONS = {
  happy: {
    eyes: 'M7 8C7 9.1046 7.44772 10 8 10C8.55228 10 9 9.1046 9 8C9 6.89543 8.55228 6 8 6C7.44772 6 7 6.89543 7 8ZM15 8C15 9.1046 15.4477 10 16 10C16.5523 10 17 9.1046 17 8C17 6.89543 16.5523 6 16 6C15.4477 6 15 6.89543 15 8Z',
    mouth: 'M8.5 14C8.5 14 10 16 12 16C14 16 15.5 14 15.5 14',
  },
  excited: {
    eyes: 'M7 8C7 9.1046 7.44772 10 8 10C8.55228 10 9 9.1046 9 8C9 6.89543 8.55228 6 8 6C7.44772 6 7 6.89543 7 8ZM15 8C15 9.1046 15.4477 10 16 10C16.5523 10 17 9.1046 17 8C17 6.89543 16.5523 6 16 6C15.4477 6 15 6.89543 15 8Z',
    mouth: 'M7.5 14C7.5 14 10 17 12 17C14 17 16.5 14 16.5 14',
  },
  thinking: {
    eyes: 'M7 8C7 9.1046 7.44772 10 8 10C8.55228 10 9 9.1046 9 8C9 6.89543 8.55228 6 8 6C7.44772 6 7 6.89543 7 8ZM15 8C15 9.1046 15.4477 10 16 10C16.5523 10 17 9.1046 17 8C17 6.89543 16.5523 6 16 6C15.4477 6 15 6.89543 15 8Z',
    mouth: 'M9 14H15',
  },
  neutral: {
    eyes: 'M7 8C7 9.1046 7.44772 10 8 10C8.55228 10 9 9.1046 9 8C9 6.89543 8.55228 6 8 6C7.44772 6 7 6.89543 7 8ZM15 8C15 9.1046 15.4477 10 16 10C16.5523 10 17 9.1046 17 8C17 6.89543 16.5523 6 16 6C15.4477 6 15 6.89543 15 8Z',
    mouth: 'M9 14H15',
  },
};

export default function DiegoAvatar({ 
  emotion = 'happy', 
  size = 'md',
  className = '',
  pointDirection = 'right',
  swimming = false,
  targetPosition,
  onArrival,
  message = "I'm here to help with your DECA preparation!",
  showTextBox = true
}: DiegoAvatarProps) {
  const dimensions = SIZE_VARIANTS[size];
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Handle animation completion
  const handleArrival = () => {
    if (onArrival) {
      onArrival();
    }
  };
  
  // Use enhanced side profile dolphin component when pointing or swimming
  if (emotion === 'pointing' || swimming) {
    return (
      <AnimatePresence>
        <SideProfileDolphin 
          dimensions={dimensions}
          swimming={swimming}
          pointDirection={pointDirection as 'left' | 'right'}
          targetPosition={targetPosition}
          onArrival={handleArrival}
          showTextBox={showTextBox}
          message={message}
        />
      </AnimatePresence>
    );
  }
  
  // For the front-facing dolphin, use the appropriate emotion
  const currentEmotion = emotion as keyof typeof EMOTIONS;
  const emotionPaths = EMOTIONS[currentEmotion];
  
  return (
    <motion.div
      className={`relative ${className}`}
      variants={avatarVariants}
      animate="idle"
      whileHover="hover"
    >
      <svg 
        width={dimensions.width} 
        height={dimensions.height} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Dolphin head with gradient fill */}
        <defs>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4FD1C5" />
            <stop offset="100%" stopColor="#3182CE" />
          </linearGradient>
          <linearGradient id="bellyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#79C3F1" />
            <stop offset="100%" stopColor="#A7D8FF" />
          </linearGradient>
          <linearGradient id="finGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2D8BC7" />
            <stop offset="100%" stopColor="#1A5F9E" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Enhanced rounded dolphin body with more defined shape */}
        <path 
          d="M12 3C7 3 4 6 3 9C2 12 2 15 4 18C6 21 9 22 12 22C15 22 18 21 20 18C22 15 22 12 21 9C20 6 17 3 12 3Z" 
          fill="url(#bodyGradient)"
          stroke="#2D8BC7"
          strokeWidth="0.2"
        />
        
        {/* Enhanced belly with gradient */}
        <path 
          d="M12 11C9 11 7 12 6 14C5 16 5 18 7 19C9 20 15 20 17 19C19 18 19 16 18 14C17 12 15 11 12 11Z" 
          fill="url(#bellyGradient)"
        />
        
        {/* More prominent and detailed dorsal fin */}
        <motion.path 
          d="M12 2C10 2.5 9 3.5 9 4C9.5 3 11 2 12 1.5C13 1.5 14.5 2 15 4C15 3 14 1.5 12 2Z" 
          fill="url(#finGradient)"
          stroke="#2D8BC7"
          strokeWidth="0.2"
          animate={{
            rotate: [0, 5, 0, -5, 0],
            originX: 0.5,
            originY: 1,
            transition: { repeat: Infinity, duration: 2, ease: "easeInOut" }
          }}
        />
        
        {/* Enhanced snout with more defined shape */}
        <path 
          d="M12 8C10 8 9 9 8 11C9 10 10.5 9.5 12 9.5C13.5 9.5 15 10 16 11C15 9 14 8 12 8Z" 
          fill="#79C3F1"
          stroke="#2D8BC7"
          strokeWidth="0.1"
        />
        
        {/* Enhanced tail fin with better shape */}
        <motion.path
          d="M12 19C10 19 7 18 6 17C8 18.5 13 19 16 17.5C14 19 13 19 12 19Z"
          fill="url(#finGradient)"
          stroke="#2D8BC7"
          strokeWidth="0.2"
          animate={{
            rotate: [0, 5, 0, -5, 0],
            originX: 0.5,
            originY: 0,
            transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
          }}
        />
        
        {/* Enhanced side flippers with better shape and animation */}
        <motion.path
          d="M5 13C4 13 3 14 4 15C5 16 6 15 7 14.5C6 14.75 5.5 14 5 13Z"
          fill="url(#finGradient)"
          stroke="#2D8BC7"
          strokeWidth="0.2"
          animate={{
            rotate: [0, 15, 0, -15, 0],
            originX: 1,
            originY: 0.5,
            transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
          }}
        />
        <motion.path
          d="M19 13C20 13 21 14 20 15C19 16 18 15 17 14.5C18 14.75 18.5 14 19 13Z"
          fill="url(#finGradient)"
          stroke="#2D8BC7"
          strokeWidth="0.2"
          animate={{
            rotate: [0, -15, 0, 15, 0],
            originX: 0,
            originY: 0.5,
            transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
          }}
        />
        
        {/* Enhanced eyes with glow effect */}
        <circle cx="8" cy="8" r="1.2" fill="black"/>
        <circle cx="16" cy="8" r="1.2" fill="black"/>
        <circle cx="7.7" cy="7.7" r="0.5" fill="white" filter="url(#glow)"/>
        <circle cx="15.7" cy="7.7" r="0.5" fill="white" filter="url(#glow)"/>
        
        {/* Enhanced mouth with better animation based on emotion */}
        <path 
          d={emotionPaths.mouth} 
          stroke="white" 
          strokeWidth="1.5" 
          strokeLinecap="round"
          filter="url(#glow)"
        />
        
        {/* Enhanced blowhole */}
        <circle cx="12" cy="4" r="0.5" fill="#0A4D81"/>
        
        {/* Subtle water sparkles around the dolphin */}
        <circle cx="10" cy="6" r="0.2" fill="white" opacity="0.6"/>
        <circle cx="18" cy="12" r="0.15" fill="white" opacity="0.5"/>
        <circle cx="5" cy="10" r="0.1" fill="white" opacity="0.4"/>
      </svg>
    </motion.div>
  );
}