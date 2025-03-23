import { motion } from 'framer-motion';

interface DiegoAvatarProps {
  emotion?: 'default' | 'happy' | 'excited' | 'thinking' | 'explaining' | 'confused';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * DiegoAvatar - The visual representation of Diego, the dolphin assistant
 * Supports different emotions and sizes for various contexts
 */
export default function DiegoAvatar({ 
  emotion = 'default', 
  size = 'medium',
  className = '' 
}: DiegoAvatarProps) {
  // Size dimensions
  const dimensions = {
    small: { width: 40, height: 40 },
    medium: { width: 60, height: 60 },
    large: { width: 80, height: 80 }
  };
  
  // Colors
  const primaryColor = '#1E88E5'; // Dolphin body color
  const secondaryColor = '#64B5F6'; // Lighter blue for details
  const eyeColor = '#FFFFFF';
  const highlightColor = '#BBDEFB'; // Very light blue for highlights
  
  // Expression variants based on emotion
  const getEmotionStyles = () => {
    switch(emotion) {
      case 'happy':
        return {
          mouth: "M40,65 Q50,75 60,65", // Curved up smile
          eye: { rx: 2, ry: 4 }, // Slightly squinted eyes
          blushVisible: true,
          eyebrowRotation: -10 // Raised eyebrows
        };
      case 'excited':
        return {
          mouth: "M40,65 Q50,80 60,65", // Big smile
          eye: { rx: 3, ry: 3 }, // Wide open eyes
          blushVisible: true,
          eyebrowRotation: -15, // Very raised eyebrows
          sparkles: true // Add sparkle effects
        };
      case 'thinking':
        return {
          mouth: "M42,65 Q50,63 58,65", // Straight, slightly curved mouth
          eye: { rx: 3, ry: 2 }, // Narrow eyes
          eyebrowRotation: 20, // Furrowed brows
          bubbleVisible: true // Thought bubble
        };
      case 'explaining':
        return {
          mouth: "M40,65 Q50,70 60,65", // Speaking mouth
          eye: { rx: 3, ry: 3 }, // Normal eyes
          eyebrowRotation: 0,
          handVisible: true // Show a pointing fin
        };
      case 'confused':
        return {
          mouth: "M42,67 Q50,65 58,67", // Slightly frowning
          eye: { rx: 2, ry: 4 }, // Questioning eyes
          eyebrowRotation: 15, // One brow up
          questionMarkVisible: true // Shows a question mark
        };
      default: // Default friendly expression
        return {
          mouth: "M42,65 Q50,70 58,65", // Slight smile
          eye: { rx: 3, ry: 3 }, // Normal round eyes
          eyebrowRotation: 0,
          blushVisible: false
        };
    }
  };
  
  const emotionStyles = getEmotionStyles();
  const { width, height } = dimensions[size];

  return (
    <div className={`relative inline-block ${className}`} style={{ width, height }}>
      <motion.svg
        viewBox="0 0 100 100"
        width={width}
        height={height}
        initial={{ scale: 0.9 }}
        animate={{ 
          scale: [0.95, 1.05, 0.95],
          rotate: [-2, 2, -2]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 4, 
          ease: "easeInOut" 
        }}
      >
        {/* Base dolphin shape */}
        <g>
          {/* Body */}
          <motion.path
            d="M30,30 C10,50 15,80 40,85 C65,90 85,70 85,50 C85,30 70,20 50,20 C40,20 35,25 30,30 Z"
            fill={primaryColor}
            strokeWidth="2"
            stroke={secondaryColor}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ 
              yoyo: Infinity, 
              duration: 2, 
              ease: "easeInOut" 
            }}
          />
          
          {/* Belly */}
          <ellipse cx="55" cy="60" rx="22" ry="20" fill={highlightColor} opacity="0.5" />
          
          {/* Dorsal fin */}
          <path
            d="M50,30 C60,10 70,10 60,35"
            fill={primaryColor}
            stroke={secondaryColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
          
          {/* Tail */}
          <motion.path
            d="M30,55 C20,50 15,60 25,65 C15,70 20,80 30,75"
            fill="none"
            stroke={primaryColor}
            strokeWidth="8"
            strokeLinecap="round"
            animate={{ 
              rotate: [-5, 5, -5],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 2, 
              ease: "easeInOut" 
            }}
          />
          
          {/* Face features */}
          {/* Left eye */}
          <ellipse 
            cx="40" 
            cy="45" 
            rx={emotionStyles.eye.rx} 
            ry={emotionStyles.eye.ry} 
            fill={eyeColor} 
          />
          <circle cx="40" cy="45" r="1.5" fill="#000" />
          
          {/* Right eye */}
          <ellipse 
            cx="60" 
            cy="45" 
            rx={emotionStyles.eye.rx} 
            ry={emotionStyles.eye.ry} 
            fill={eyeColor} 
          />
          <circle cx="60" cy="45" r="1.5" fill="#000" />
          
          {/* Eyebrows */}
          <motion.path
            d="M35,39 C38,37 42,37 45,39"
            fill="none"
            stroke={secondaryColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ rotate: 0 }}
            animate={{ rotate: emotionStyles.eyebrowRotation }}
            style={{ transformOrigin: '40px 45px' }}
          />
          <motion.path
            d="M55,39 C58,37 62,37 65,39"
            fill="none"
            stroke={secondaryColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ rotate: 0 }}
            animate={{ rotate: -emotionStyles.eyebrowRotation }}
            style={{ transformOrigin: '60px 45px' }}
          />
          
          {/* Mouth */}
          <path
            d={emotionStyles.mouth}
            fill="none"
            stroke={secondaryColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
          
          {/* Blowhole */}
          <circle cx="50" cy="25" r="2" fill={secondaryColor} />
          
          {/* Blush (conditional) */}
          {emotionStyles.blushVisible && (
            <>
              <circle cx="35" cy="50" r="5" fill="#FF9E80" opacity="0.3" />
              <circle cx="65" cy="50" r="5" fill="#FF9E80" opacity="0.3" />
            </>
          )}
          
          {/* Side fins */}
          <path
            d="M70,55 C85,45 90,55 80,65"
            fill={primaryColor}
            stroke={secondaryColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
        
        {/* Sparkles for excited emotion */}
        {emotionStyles.sparkles && (
          <g>
            <motion.circle 
              cx="25" 
              cy="25" 
              r="2" 
              fill="#FFD54F" 
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0.5, 1.5, 0.5]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2, 
                ease: "easeInOut",
                delay: 0.2
              }}
            />
            <motion.circle 
              cx="75" 
              cy="25" 
              r="2" 
              fill="#FFD54F" 
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0.5, 1.5, 0.5]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2, 
                ease: "easeInOut",
                delay: 0.5
              }}
            />
            <motion.circle 
              cx="60" 
              cy="20" 
              r="2" 
              fill="#FFD54F" 
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0.5, 1.5, 0.5]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2, 
                ease: "easeInOut",
                delay: 0.8
              }}
            />
          </g>
        )}
        
        {/* Thought bubble (conditional) */}
        {emotionStyles.bubbleVisible && (
          <g>
            <circle cx="70" cy="25" r="3" fill="white" />
            <circle cx="75" cy="20" r="4" fill="white" />
            <circle cx="82" cy="15" r="5" fill="white" />
          </g>
        )}
        
        {/* Question mark (conditional) */}
        {emotionStyles.questionMarkVisible && (
          <g>
            <motion.text
              x="75" 
              y="30" 
              fontSize="15" 
              fontWeight="bold" 
              fill="#FFD54F"
              animate={{ 
                y: [30, 25, 30],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2, 
                ease: "easeInOut" 
              }}
            >
              ?
            </motion.text>
          </g>
        )}
      </motion.svg>
    </div>
  );
}