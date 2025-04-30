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
        <circle cx="0" cy="0" r="20" fill="#1AB7EA" />
        
        {/* Dolphin body - based on reference image */}
        <motion.g 
          animate={animations?.body || {}}
        >
          {/* Main body - simplified rounded shape */}
          <path
            d="M-12,12 C-18,5 -18,-5 -10,-13 C-5,-18 5,-18 10,-13 C18,-5 18,5 12,12 C5,18 -5,18 -12,12 Z"
            fill="#1AB7EA"
            stroke="#000000"
            strokeWidth="2"
          />
          
          {/* Left fin */}
          <path
            d="M-17,0 C-22,-5 -22,-10 -17,-10 C-12,-10 -10,-5 -15,0 Z"
            fill="#1AB7EA"
            stroke="#000000"
            strokeWidth="2"
          />
          
          {/* Right fin */}
          <path
            d="M17,0 C22,-5 22,-10 17,-10 C12,-10 10,-5 15,0 Z"
            fill="#1AB7EA"
            stroke="#000000"
            strokeWidth="2"
          />
          
          {/* Mouth/beak - elongated snout */}
          <path
            d="M0,0 C5,0 10,-3 15,-3 C20,-3 20,3 15,5 C10,7 0,7 0,0 Z"
            fill="#1AB7EA"
            stroke="#000000"
            strokeWidth="2"
          />
          
          {/* Sound wave indicators - small arcs */}
          <path
            d="M18,-5 C20,-5 20,-7 18,-7"
            fill="none"
            stroke="#000000"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M18,-9 C21,-9 21,-11 18,-11"
            fill="none"
            stroke="#000000"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M18,-13 C22,-13 22,-15 18,-15"
            fill="none"
            stroke="#000000"
            strokeWidth="2"
            strokeLinecap="round"
          />
          
          {/* Eyes - curved lines instead of circles for cartoonish look */}
          <motion.g 
            animate={animations?.eyes || {}}
          >
            {/* Left eye arcs */}
            <path
              d="M-10,-5 C-8,-3 -6,-3 -4,-5"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M-10,-8 C-8,-6 -6,-6 -4,-8"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M-10,-11 C-8,-9 -6,-9 -4,-11"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
            />
            
            {/* Right eye arcs */}
            <path
              d="M4,-5 C6,-3 8,-3 10,-5"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M4,-8 C6,-6 8,-6 10,-8"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M4,-11 C6,-9 8,-9 10,-11"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </motion.g>
          
          {/* Smile - curved for a happy expression */}
          <motion.path
            d="M0,3 C5,7 10,7 15,3"
            fill="none"
            stroke="#000000"
            strokeWidth="2"
            strokeLinecap="round"
            animate={animations?.smile || {}}
          />
        </motion.g>
      </motion.svg>
    </div>
  );
}