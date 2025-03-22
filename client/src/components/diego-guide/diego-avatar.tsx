import { motion } from "framer-motion";

interface DiegoAvatarProps {
  emotion?: 'happy' | 'excited' | 'thinking' | 'neutral' | 'pointing';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  pointDirection?: 'left' | 'right' | 'up' | 'down';
  swimming?: boolean;
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

// Water wave animation for swimming
const waveVariants = {
  animate: {
    y: [0, -2, 0, 2, 0],
    transition: {
      repeat: Infinity,
      duration: 2,
      ease: "easeInOut"
    }
  }
};

export default function DiegoAvatar({ 
  emotion = 'happy', 
  size = 'md',
  className = '',
  pointDirection,
  swimming = false
}: DiegoAvatarProps) {
  const dimensions = SIZE_VARIANTS[size];
  
  // Choose the animation based on pointing direction or swimming
  const animationVariant = swimming ? "swimming" : 
    pointDirection ? `pointing${pointDirection.charAt(0).toUpperCase() + pointDirection.slice(1)}` : "idle";
  
  // Dolphin emoji-like side profile (pointing or swimming)
  if (emotion === 'pointing' || swimming) {
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
          {/* Dolphin body - curved back like the emoji */}
          <motion.path 
            d="M95 35C95 46 85 60 70 65C55 70 40 65 30 60C20 55 10 45 5 40C0 35 0 30 5 25C10 20 20 15 30 10C40 5 55 5 70 10C85 15 95 24 95 35Z" 
            fill="#35A0DE"
            animate={{
              y: [0, -2, 0, 2, 0],
              transition: { repeat: Infinity, duration: 2, ease: "easeInOut" }
            }}
          />
          
          {/* Lighter belly color */}
          <path 
            d="M60 40C45 45 30 45 20 40C10 35 15 30 25 25C35 20 50 20 65 25C80 30 75 35 60 40Z" 
            fill="#79C3F1"
          />
          
          {/* Dolphin fin on top - more triangular like emoji */}
          <motion.path 
            d="M60 10C65 5 70 5 70 15C65 20 55 15 60 10Z" 
            fill="#2D8BC7"
            animate={{
              rotate: [0, 3, 0, -3, 0],
              transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
            }}
          />
          
          {/* Dolphin tail - more horizontal like emoji */}
          <motion.path 
            d="M10 35C5 33 0 38 0 40C0 42 5 45 10 45C15 45 15 37 10 35Z" 
            fill="#2D8BC7"
            animate={{
              rotate: [0, 5, 0, -5, 0],
              originX: 1,
              originY: 0.5,
              transition: { repeat: Infinity, duration: 1.2, ease: "easeInOut" }
            }}
          />
          
          {/* Eye - white with black pupil */}
          <circle cx="85" cy="30" r="4" fill="white"/>
          <circle cx="85" cy="30" r="2" fill="black"/>
          
          {/* Smile - subtle curve */}
          <path 
            d="M85 40C85 40 80 43 75 40" 
            stroke="white" 
            strokeWidth="1.5" 
            strokeLinecap="round"
          />
          
          {/* Small pectoral flipper */}
          <motion.path 
            d="M45 45C40 48 35 53 40 55C45 57 50 50 45 45Z" 
            fill="#2D8BC7"
            animate={{
              rotate: [0, 10, 0, -10, 0],
              transition: { repeat: Infinity, duration: 1.8, ease: "easeInOut" }
            }}
          />
          
          {/* Water splashes for swimming effect */}
          {swimming && (
            <>
              <motion.path
                d="M100 40C105 40 110 43 108 40C106 37 104 39 100 40Z"
                fill="#79C3F1"
                variants={waveVariants}
                animate="animate"
                style={{ opacity: 0.7 }}
              />
              <motion.path
                d="M105 45C110 45 115 48 113 45C111 42 109 44 105 45Z"
                fill="#79C3F1"
                variants={waveVariants}
                animate="animate"
                style={{ opacity: 0.5, animationDelay: "0.2s" }}
              />
              <motion.path
                d="M102 50C107 50 112 53 110 50C108 47 106 49 102 50Z"
                fill="#79C3F1"
                variants={waveVariants}
                animate="animate"
                style={{ opacity: 0.3, animationDelay: "0.4s" }}
              />
            </>
          )}
        </svg>
      </motion.div>
    );
  }
  
  // Front-facing dolphin with emoji-like appearance for other emotions
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
        {/* Rounded dolphin body - more like the emoji */}
        <path 
          d="M12 3C7 3 4 6 3 9C2 12 2 15 4 18C6 21 9 22 12 22C15 22 18 21 20 18C22 15 22 12 21 9C20 6 17 3 12 3Z" 
          fill="#35A0DE"
        />
        
        {/* Lighter belly */}
        <path 
          d="M12 11C9 11 7 12 6 14C5 16 5 18 7 19C9 20 15 20 17 19C19 18 19 16 18 14C17 12 15 11 12 11Z" 
          fill="#79C3F1"
        />
        
        {/* More prominent triangular dolphin fin on top - like emoji */}
        <motion.path 
          d="M12 2C10 2.5 9 3.5 9 4C9.5 3 11 2 12 1.5C13 1.5 14.5 2 15 4C15 3 14 1.5 12 2Z" 
          fill="#2D8BC7"
          animate={{
            rotate: [0, 5, 0, -5, 0],
            originX: 0.5,
            originY: 1,
            transition: { repeat: Infinity, duration: 2, ease: "easeInOut" }
          }}
        />
        
        {/* Dolphin snout/beak - shorter and more curved */}
        <path 
          d="M12 8C10 8 9 9 8 11C9 10 10.5 9.5 12 9.5C13.5 9.5 15 10 16 11C15 9 14 8 12 8Z" 
          fill="#79C3F1"
        />
        
        {/* Tail fin - more horizontal like emoji */}
        <motion.path
          d="M12 19C10 19 7 18 6 17C8 18.5 13 19 16 17.5C14 19 13 19 12 19Z"
          fill="#2D8BC7"
          animate={{
            rotate: [0, 5, 0, -5, 0],
            originX: 0.5,
            originY: 0,
            transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
          }}
        />
        
        {/* Side flippers - more curved like emoji */}
        <motion.path
          d="M5 13C4 13 3 14 4 15C5 16 6 15 7 14.5C6 14.75 5.5 14 5 13Z"
          fill="#2D8BC7"
          animate={{
            rotate: [0, 15, 0, -15, 0],
            originX: 1,
            originY: 0.5,
            transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
          }}
        />
        <motion.path
          d="M19 13C20 13 21 14 20 15C19 16 18 15 17 14.5C18 14.75 18.5 14 19 13Z"
          fill="#2D8BC7"
          animate={{
            rotate: [0, -15, 0, 15, 0],
            originX: 0,
            originY: 0.5,
            transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
          }}
        />
        
        {/* Eyes - black with white highlight */}
        <circle cx="8" cy="8" r="1.2" fill="black"/>
        <circle cx="16" cy="8" r="1.2" fill="black"/>
        <circle cx="7.7" cy="7.7" r="0.4" fill="white"/>
        <circle cx="15.7" cy="7.7" r="0.4" fill="white"/>
        
        {/* Mouth - slightly curved */}
        <path 
          d={emotionPaths.mouth} 
          stroke="white" 
          strokeWidth="1.5" 
          strokeLinecap="round"
        />
        
        {/* Dolphin blowhole */}
        <circle cx="12" cy="4" r="0.5" fill="#0A4D81"/>
      </svg>
    </motion.div>
  );
}