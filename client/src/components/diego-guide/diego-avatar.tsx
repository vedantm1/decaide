import { motion } from "framer-motion";

interface DiegoAvatarProps {
  emotion?: 'happy' | 'excited' | 'thinking' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Different emotions for Diego
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

// Size variants
const SIZE_VARIANTS = {
  sm: { width: 32, height: 32 },
  md: { width: 48, height: 48 },
  lg: { width: 64, height: 64 },
};

// Animation variants
const avatarVariants = {
  idle: {
    rotate: [0, 2, 0, -2, 0],
    transition: { 
      repeat: Infinity, 
      duration: 4,
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
  }
};

export default function DiegoAvatar({ 
  emotion = 'happy', 
  size = 'md',
  className = '',
}: DiegoAvatarProps) {
  const dimensions = SIZE_VARIANTS[size];
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
        {/* Dolphin body (light blue) */}
        <path 
          d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" 
          fill="#6CB4EE"
        />
        
        {/* Dolphin fin on top */}
        <path 
          d="M12 2C9.5 2 8 3 7.5 3.5C11 2.5 12 5 12 6C12 5 13 2.5 16.5 3.5C16 3 14.5 2 12 2Z" 
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