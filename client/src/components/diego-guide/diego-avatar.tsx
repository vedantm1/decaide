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
        {/* Simplified background for the button */}
        <circle cx="0" cy="0" r="20" fill="#1AB7EA" />
        
        {/* Dolphin body - Exact match to reference image */}
        <motion.g 
          animate={animations?.body || {}}
        >
          {/* Main body - simplified oval with straight bottom */}
          <path
            d="M-16,10 C-16,-10 -10,-16 0,-16 C10,-16 16,-10 16,10 L-16,10 Z"
            fill="#1AB7EA"
            stroke="#000000"
            strokeWidth="2"
          />
          
          {/* Spikes on the back/head - simplified */}
          <path
            d="M-14,-14 L-13,-15 L-11,-14 L-10,-15 L-8,-14 L-7,-15 L-5,-14 L-4,-15 L-2,-14 L-1,-15 L1,-14"
            fill="none"
            stroke="#000000"
            strokeWidth="1.5"
          />
          
          {/* Left side fin */}
          <path
            d="M-15,0 L-22,-5 L-15,-8 L-15,0"
            fill="#1AB7EA"
            stroke="#000000"
            strokeWidth="2"
          />
          
          {/* Right side fin */}
          <path
            d="M15,0 L22,-5 L15,-8 L15,0"
            fill="#1AB7EA"
            stroke="#000000"
            strokeWidth="2"
          />
          
          {/* Bottom fins */}
          <path
            d="M-10,10 L-15,17 L-8,15 L-10,10"
            fill="#1AB7EA"
            stroke="#000000"
            strokeWidth="2"
          />
          
          <path
            d="M10,10 L15,17 L8,15 L10,10"
            fill="#1AB7EA"
            stroke="#000000"
            strokeWidth="2"
          />
          
          {/* Large mouth/beak - the distinctive feature */}
          <path
            d="M0,0 C8,-2 15,-2 18,0 C20,3 18,8 15,10 C10,12 5,10 0,5 Z"
            fill="#000000"
            strokeWidth="1"
          />
          
          {/* Inner mouth detail (white) */}
          <path
            d="M2,2 C8,0 12,1 15,3 C18,5 15,8 10,9 C6,9 2,7 2,2 Z"
            fill="#FFFFFF"
            strokeWidth="0"
          />
          
          {/* Sound wave indicators - curved lines */}
          <path
            d="M20,-2 C22,-2 22,-4 20,-4"
            fill="none"
            stroke="#000000"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M20,-6 C24,-6 24,-8 20,-8"
            fill="none"
            stroke="#000000"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M20,-10 C26,-10 26,-12 20,-12"
            fill="none"
            stroke="#000000"
            strokeWidth="2"
            strokeLinecap="round"
          />
          
          {/* Eyes - curved lines in exact match to reference */}
          <motion.g 
            animate={animations?.eyes || {}}
          >
            {/* Left column of eye arcs */}
            <path
              d="M-10,-2 C-8,0 -6,0 -4,-2"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M-10,-6 C-8,-4 -6,-4 -4,-6"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M-10,-10 C-8,-8 -6,-8 -4,-10"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
            />
            
            {/* Right column of eye arcs */}
            <path
              d="M3,-2 C5,0 7,0 9,-2"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M3,-6 C5,-4 7,-4 9,-6"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M3,-10 C5,-8 7,-8 9,-10"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </motion.g>
        </motion.g>
      </motion.svg>
    </div>
  );
}