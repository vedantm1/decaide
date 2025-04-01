import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DiegoAvatarProps {
  emotion?: 'neutral' | 'happy' | 'thinking' | 'excited' | 'confused';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Animation properties for each emotion, using direct animation objects instead of variants
const emotionAnimations = {
  neutral: {
    eyes: {},
    smile: {},
    body: {
      y: [0, -3, 0],
      transition: {
        y: {
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut"
        }
      }
    }
  },
  happy: {
    eyes: {
      scaleY: [1, 0.8, 1],
      transition: {
        scaleY: {
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut",
          repeatDelay: 3
        }
      }
    },
    smile: {
      d: [
        "M-6,3 C-3,6 3,6 6,3",
        "M-6,3 C-3,8 3,8 6,3",
        "M-6,3 C-3,6 3,6 6,3"
      ],
      transition: {
        d: {
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut",
          repeatDelay: 3
        }
      }
    },
    body: {
      y: [0, -5, 0],
      transition: {
        y: {
          repeat: Infinity,
          duration: 1.5,
          ease: "easeInOut"
        }
      }
    }
  },
  thinking: {
    eyes: {
      x: [0, 3, 0, -3, 0],
      transition: {
        x: {
          repeat: Infinity,
          duration: 3,
          ease: "easeInOut"
        }
      }
    },
    smile: {
      d: "M-8,3 C-5,2 5,2 8,3",
    },
    body: {
      rotate: [0, -3, 0, 3, 0],
      transition: {
        rotate: {
          repeat: Infinity,
          duration: 4,
          ease: "easeInOut"
        }
      }
    }
  },
  excited: {
    eyes: {
      scaleY: [1, 0.7, 1],
      transition: {
        scaleY: {
          repeat: Infinity,
          duration: 0.5,
          ease: "easeInOut",
        }
      }
    },
    smile: {
      d: [
        "M-6,3 C-3,7 3,7 6,3",
        "M-6,3 C-3,9 3,9 6,3",
        "M-6,3 C-3,7 3,7 6,3"
      ],
      transition: {
        d: {
          repeat: Infinity,
          duration: 0.5,
          ease: "easeInOut",
        }
      }
    },
    body: {
      y: [0, -8, 0],
      rotate: [0, -5, 5, -5, 0],
      transition: {
        y: {
          repeat: Infinity,
          duration: 0.7,
          ease: "easeInOut",
        },
        rotate: {
          repeat: Infinity,
          duration: 0.7,
          ease: "easeInOut",
        }
      }
    }
  },
  confused: {
    eyes: {
      x: [0, 4, 0],
      scaleX: [1, 1.2, 1],
      transition: {
        x: {
          repeat: Infinity,
          duration: 2.5,
          ease: "easeInOut",
        },
        scaleX: {
          repeat: Infinity,
          duration: 2.5,
          ease: "easeInOut",
        }
      }
    },
    smile: {
      d: [
        "M-6,3 C-2,0 2,0 6,3",
        "M-6,3 C-2,-1 2,-1 6,3",
        "M-6,3 C-2,0 2,0 6,3"
      ],
      transition: {
        d: {
          repeat: Infinity,
          duration: 2.5,
          ease: "easeInOut",
        }
      }
    },
    body: {
      rotate: [0, -3, 3, 0],
      transition: {
        rotate: {
          repeat: Infinity,
          duration: 3,
          ease: "easeInOut",
        }
      }
    }
  }
};

// Size mappings for the SVG viewBox and dimensions
const sizeMappings = {
  sm: { viewBox: "-25 -25 50 50", height: 40, width: 40 },
  md: { viewBox: "-30 -30 60 60", height: 50, width: 50 },
  lg: { viewBox: "-40 -40 80 80", height: 60, width: 60 },
  xl: { viewBox: "-50 -50 100 100", height: 80, width: 80 }
};

export default function DiegoAvatar({ emotion = 'neutral', size = 'md', className }: DiegoAvatarProps) {
  const { viewBox, height, width } = sizeMappings[size];

  // Get the appropriate animations for the current emotion
  const animations = emotionAnimations[emotion as keyof typeof emotionAnimations];

  return (
    <div className={cn("relative", className)}>
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={viewBox}
        height={height}
        width={width}
        className="overflow-visible"
      >
        {/* Background circle for button */}
        <circle cx="0" cy="0" r="20" fill="#3B82F6" />
        
        {/* Dolphin body */}
        <motion.g 
          animate={animations.body}
        >
          {/* Main body */}
          <path
            d="M-10,10 Q-15,-5 -5,-15 Q5,-22 15,-10 Q18,0 10,15 Q0,20 -10,10 Z"
            fill="#0EA5E9"
            stroke="#0284C7"
            strokeWidth="1"
          />
          
          {/* Fin */}
          <path
            d="M10,-5 Q15,-10 20,-5 Q17,0 10,5 Z"
            fill="#0EA5E9"
            stroke="#0284C7"
            strokeWidth="1"
          />
          
          {/* Tail */}
          <path
            d="M-12,8 Q-25,0 -20,-5 Q-18,-8 -15,-5 Q-13,-2 -10,0 Z"
            fill="#0EA5E9"
            stroke="#0284C7"
            strokeWidth="1"
          />
          
          {/* Eyes */}
          <motion.g 
            animate={animations.eyes}
          >
            <circle cx="-5" cy="-8" r="2.5" fill="white" />
            <circle cx="5" cy="-10" r="2.5" fill="white" />
            <circle cx="-5" cy="-8" r="1.25" fill="black" />
            <circle cx="5" cy="-10" r="1.25" fill="black" />
          </motion.g>
          
          {/* Smile */}
          <motion.path
            d="M-6,3 C-3,6 3,6 6,3"
            fill="none"
            stroke="#0284C7"
            strokeWidth="1.5"
            strokeLinecap="round"
            animate={animations.smile}
          />
          
          {/* Water splash effect */}
          <path 
            d="M-15,15 C-10,12 -5,18 0,15 C5,18 10,12 15,15" 
            fill="none" 
            stroke="#BAE6FD" 
            strokeWidth="1.5" 
            strokeDasharray="2,2" 
            opacity="0.8" 
          />
        </motion.g>
      </motion.svg>
    </div>
  );
}