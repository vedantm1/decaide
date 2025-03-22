import { motion } from "framer-motion";

interface DiegoAvatarProps {
  emotion?: 'happy' | 'excited' | 'thinking' | 'neutral' | 'pointing';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  pointDirection?: 'left' | 'right' | 'up' | 'down';
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

export default function DiegoAvatar({ 
  emotion = 'happy', 
  size = 'md',
  className = '',
  pointDirection
}: DiegoAvatarProps) {
  const dimensions = SIZE_VARIANTS[size];
  
  // Choose the animation based on pointing direction
  const animationVariant = pointDirection ? 
    `pointing${pointDirection.charAt(0).toUpperCase() + pointDirection.slice(1)}` : 
    "idle";
  
  // For side profile (pointing emotion)
  if (emotion === 'pointing') {
    return (
      <motion.div
        className={`relative ${className}`}
        variants={avatarVariants}
        animate={animationVariant}
        whileHover="hover"
      >
        <svg 
          width={dimensions.width} 
          height={dimensions.height} 
          viewBox="0 0 120 80" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Dolphin body - side profile */}
          <path 
            d="M100 40C100 51 95 60 80 65C65 70 50 65 40 60C30 55 15 45 10 40C5 35 5 30 10 25C15 20 30 10 40 5C50 0 65 5 80 10C95 15 100 29 100 40Z" 
            fill="#6CB4EE"
          />
          
          {/* Dolphin fin on top */}
          <path 
            d="M60 5C65 0 75 5 70 15C65 25 55 20 60 5Z" 
            fill="#4B9FE1"
          />
          
          {/* Dolphin tail */}
          <path 
            d="M10 40C5 35 0 45 5 50C10 55 15 50 20 45C15 50 10 45 10 40Z" 
            fill="#4B9FE1"
          />
          
          {/* Eye */}
          <circle cx="85" cy="35" r="5" fill="white"/>
          <circle cx="85" cy="35" r="2" fill="#333"/>
          
          {/* Smile */}
          <path 
            d="M90 45C90 45 85 50 80 45" 
            stroke="white" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          
          {/* Dolphin blowhole */}
          <circle cx="70" cy="15" r="2" fill="#333"/>
          
          {/* Pointing flipper/fin */}
          <motion.path 
            d={pointDirection === 'up' ? 
              "M40 40C35 35 25 25 30 20C35 15 45 25 50 30" : 
              pointDirection === 'down' ? 
              "M40 40C35 45 25 55 30 60C35 65 45 55 50 50" :
              pointDirection === 'left' ? 
              "M40 40C35 40 20 40 20 35C20 30 30 35 40 35" : 
              "M60 40C65 40 80 40 80 35C80 30 70 35 60 35"
            }
            fill="#4B9FE1"
            animate={{
              scale: [1, 1.1, 1],
              transition: { repeat: Infinity, duration: 2 }
            }}
          />
        </svg>
      </motion.div>
    );
  }
  
  // Original front-facing dolphin for other emotions
  const EMOTIONS = {
    happy: {
      eyes: 'M7 9C7 10.1046 7.44772 11 8 11C8.55228 11 9 10.1046 9 9C9 7.89543 8.55228 7 8 7C7.44772 7 7 7.89543 7 9ZM15 9C15 10.1046 15.4477 11 16 11C16.5523 11 17 10.1046 17 9C17 7.89543 16.5523 7 16 7C15.4477 7 15 7.89543 15 9Z',
      mouth: 'M8.5 15C8.5 15 10 17.5 12 17.5C14 17.5 15.5 15 15.5 15',
    },
    excited: {
      eyes: 'M7 9C7 10.1046 7.44772 11 8 11C8.55228 11 9 10.1046 9 9C9 7.89543 8.55228 7 8 7C7.44772 7 7 7.89543 7 9ZM15 9C15 10.1046 15.4477 11 16 11C16.5523 11 17 10.1046 17 9C17 7.89543 16.5523 7 16 7C15.4477 7 15 7.89543 15 9Z',
      mouth: 'M7.5 15.5C7.5 15.5 10 19 12 19C14 19 16.5 15.5 16.5 15.5',
    },
    thinking: {
      eyes: 'M7 9C7 10.1046 7.44772 11 8 11C8.55228 11 9 10.1046 9 9C9 7.89543 8.55228 7 8 7C7.44772 7 7 7.89543 7 9ZM15 9C15 10.1046 15.4477 11 16 11C16.5523 11 17 10.1046 17 9C17 7.89543 16.5523 7 16 7C15.4477 7 15 7.89543 15 9Z',
      mouth: 'M9 15.5H15',
    },
    neutral: {
      eyes: 'M7 9C7 10.1046 7.44772 11 8 11C8.55228 11 9 10.1046 9 9C9 7.89543 8.55228 7 8 7C7.44772 7 7 7.89543 7 9ZM15 9C15 10.1046 15.4477 11 16 11C16.5523 11 17 10.1046 17 9C17 7.89543 16.5523 7 16 7C15.4477 7 15 7.89543 15 9Z',
      mouth: 'M9 16H15',
    },
  };
  
  const emotionPaths = EMOTIONS[emotion];
  
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
        {/* Improved dolphin body (light blue) with more dolphin-like shape */}
        <path 
          d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z" 
          fill="#6CB4EE"
        />
        
        {/* More prominent dolphin fin on top */}
        <path 
          d="M12 3C10 3 9 5 8.5 6C9 4 11 3 12 2C13 2 15 3 15.5 6C15 5 14 3 12 3Z" 
          fill="#4B9FE1"
        />
        
        {/* Side fins */}
        <path
          d="M4 13C3 13 2 14 3 15C4 16 5 15 6 14.5C5 14.75 4.5 14 4 13Z"
          fill="#4B9FE1"
        />
        <path
          d="M20 13C21 13 22 14 21 15C20 16 19 15 18 14.5C19 14.75 19.5 14 20 13Z"
          fill="#4B9FE1"
        />
        
        {/* Eyes */}
        <path d={emotionPaths.eyes} fill="white"/>
        <circle cx="8" cy="9" r="1" fill="#333"/>
        <circle cx="16" cy="9" r="1" fill="#333"/>
        
        {/* Mouth */}
        <path 
          d={emotionPaths.mouth} 
          stroke="white" 
          strokeWidth="1.5" 
          strokeLinecap="round"
        />
        
        {/* Dolphin blowhole */}
        <circle cx="12" cy="4.5" r="0.5" fill="#333"/>
      </svg>
    </motion.div>
  );
}