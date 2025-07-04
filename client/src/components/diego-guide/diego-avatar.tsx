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
    body: {
      y: [0, -5, 0],
      transition: {
        y: {
          repeat: Infinity,
          duration: 3,
          ease: "easeInOut"
        }
      }
    },
    fins: {
      rotate: [0, 5, 0],
      transition: {
        rotate: {
          repeat: Infinity,
          duration: 3.5,
          ease: "easeInOut"
        }
      }
    },
    bottomFins: {
      rotate: [0, -3, 0],
      transition: {
        rotate: {
          repeat: Infinity,
          duration: 2.5,
          ease: "easeInOut"
        }
      }
    },
    beak: {
      scale: [1, 1.03, 1],
      transition: {
        scale: {
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut"
        }
      }
    },
    soundWaves: {
      opacity: [0, 1, 0],
      transition: {
        opacity: {
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut",
          repeatDelay: 1
        }
      }
    }
  },
  happy: {
    body: {
      y: [0, -8, 0],
      rotate: [0, 2, 0],
      transition: {
        y: {
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut"
        },
        rotate: {
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut"
        }
      }
    },
    fins: {
      rotate: [0, 10, 0],
      transition: {
        rotate: {
          repeat: Infinity,
          duration: 1.5,
          ease: "easeInOut"
        }
      }
    },
    bottomFins: {
      rotate: [0, -5, 0],
      transition: {
        rotate: {
          repeat: Infinity,
          duration: 1.5,
          ease: "easeInOut"
        }
      }
    },
    beak: {
      scale: [1, 1.08, 1],
      transition: {
        scale: {
          repeat: Infinity,
          duration: 1.5,
          ease: "easeInOut"
        }
      }
    },
    soundWaves: {
      opacity: [0, 1, 0],
      scale: [0.9, 1.1, 0.9],
      transition: {
        opacity: {
          repeat: Infinity,
          duration: 1,
          ease: "easeInOut",
        },
        scale: {
          repeat: Infinity,
          duration: 1,
          ease: "easeInOut"
        }
      }
    }
  },
  thinking: {
    body: {
      rotate: [-2, 2, -2],
      transition: {
        rotate: {
          repeat: Infinity,
          duration: 4,
          ease: "easeInOut"
        }
      }
    },
    fins: {
      rotate: [0, 3, 0],
      transition: {
        rotate: {
          repeat: Infinity,
          duration: 3,
          ease: "easeInOut"
        }
      }
    },
    bottomFins: {
      rotate: [0, -2, 0],
      transition: {
        rotate: {
          repeat: Infinity,
          duration: 4,
          ease: "easeInOut"
        }
      }
    },
    beak: {
      scale: [1, 1.02, 1],
      rotate: [0, -1, 0],
      transition: {
        scale: {
          repeat: Infinity,
          duration: 3,
          ease: "easeInOut"
        },
        rotate: {
          repeat: Infinity,
          duration: 3,
          ease: "easeInOut"
        }
      }
    },
    soundWaves: {
      opacity: 0
    }
  },
  excited: {
    body: {
      y: [0, -10, 0],
      rotate: [-5, 5, -5],
      transition: {
        y: {
          repeat: Infinity,
          duration: 0.7,
          ease: "easeInOut"
        },
        rotate: {
          repeat: Infinity,
          duration: 0.7,
          ease: "easeInOut"
        }
      }
    },
    fins: {
      rotate: [0, 15, 0, -15, 0],
      transition: {
        rotate: {
          repeat: Infinity,
          duration: 0.8,
          ease: "easeInOut"
        }
      }
    },
    bottomFins: {
      rotate: [0, -10, 0, 10, 0],
      transition: {
        rotate: {
          repeat: Infinity,
          duration: 0.8,
          ease: "easeInOut"
        }
      }
    },
    beak: {
      scale: [1, 1.1, 1],
      rotate: [0, 2, 0, -2, 0],
      transition: {
        scale: {
          repeat: Infinity,
          duration: 0.7,
          ease: "easeInOut"
        },
        rotate: {
          repeat: Infinity,
          duration: 0.7,
          ease: "easeInOut"
        }
      }
    },
    soundWaves: {
      opacity: [0, 1, 0],
      scale: [0.8, 1.2, 0.8],
      transition: {
        opacity: {
          repeat: Infinity,
          duration: 0.5,
          ease: "easeInOut"
        },
        scale: {
          repeat: Infinity,
          duration: 0.5,
          ease: "easeInOut"
        }
      }
    }
  },
  confused: {
    body: {
      rotate: [0, -3, 3, 0],
      y: [0, -2, 0],
      transition: {
        rotate: {
          repeat: Infinity,
          duration: 3,
          ease: "easeInOut"
        },
        y: {
          repeat: Infinity,
          duration: 2.5,
          ease: "easeInOut"
        }
      }
    },
    fins: {
      rotate: [0, 3, -3, 0],
      transition: {
        rotate: {
          repeat: Infinity,
          duration: 2.5,
          ease: "easeInOut"
        }
      }
    },
    bottomFins: {
      rotate: [0, -2, 2, 0],
      transition: {
        rotate: {
          repeat: Infinity,
          duration: 2.5,
          ease: "easeInOut"
        }
      }
    },
    beak: {
      rotate: [0, -2, 0],
      transition: {
        rotate: {
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut",
          repeatDelay: 1
        }
      }
    },
    soundWaves: {
      opacity: [0, 0.5, 0],
      transition: {
        opacity: {
          repeat: Infinity,
          duration: 3,
          ease: "easeInOut",
          repeatDelay: 2
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
        {/* Main body - three-quarter view of Diego as a ghost-shape */}
        <motion.g 
          animate={animations?.body || {}}
        >
          {/* Base body shape - slightly angled for 3D effect */}
          <path
            d="M-18,12 C-18,-8 -12,-18 0,-18 C12,-18 18,-8 18,12 L-18,12 Z"
            fill="#1AB7EA"
            stroke="#000000"
            strokeWidth="2"
          />
          
          {/* Ridges/spikes along the back */}
          <path
            d="M-16,-14 L-15,-16 L-14,-14 L-13,-16 L-12,-14 L-11,-16 L-10,-14 L-9,-16 L-8,-14 L-7,-16 L-6,-14 L-5,-16 L-4,-14 L-3,-16 L-2,-14 L-1,-16 L0,-14 L1,-16 L2,-14"
            fill="none"
            stroke="#000000"
            strokeWidth="1.5"
          />
          
          {/* Left side fin with origin point for animation */}
          <motion.g animate={animations?.fins || {}}>
            <path
              d="M-15,0 L-25,-6 L-15,-10 L-15,0"
              fill="#1AB7EA"
              stroke="#000000"
              strokeWidth="2"
              style={{ transformOrigin: "-15px 0px" }}
            />
          </motion.g>
          
          {/* Right side fin with origin point for animation */}
          <motion.g animate={animations?.fins || {}}>
            <path
              d="M15,0 L25,-6 L15,-10 L15,0"
              fill="#1AB7EA"
              stroke="#000000"
              strokeWidth="2"
              style={{ transformOrigin: "15px 0px" }}
            />
          </motion.g>
          
          {/* Bottom left fin with animation */}
          <motion.g animate={animations?.bottomFins || {}}>
            <path
              d="M-10,12 L-18,18 L-8,16 L-10,12"
              fill="#1AB7EA"
              stroke="#000000"
              strokeWidth="2"
              style={{ transformOrigin: "-10px 12px" }}
            />
          </motion.g>
          
          {/* Bottom right fin with animation */}
          <motion.g animate={animations?.bottomFins || {}}>
            <path
              d="M10,12 L18,18 L8,16 L10,12"
              fill="#1AB7EA"
              stroke="#000000"
              strokeWidth="2"
              style={{ transformOrigin: "10px 12px" }}
            />
          </motion.g>
          
          {/* Animated beak/snout - angled for 3D effect */}
          <motion.g animate={animations?.beak || {}}>
            <path
              d="M2,0 C10,-3 18,-3 22,0 C26,4 22,10 18,12 C10,14 0,12 2,0 Z"
              fill="#000000"
              stroke="#000000"
              strokeWidth="0.5"
              style={{ transformOrigin: "12px 4px" }}
            />
            
            {/* Inner mouth detail - white part */}
            <path
              d="M6,2 C12,0 16,0 19,3 C22,6 20,10 16,11 C10,12 4,9 6,2 Z"
              fill="#FFFFFF"
              strokeWidth="0"
            />
          </motion.g>
          
          {/* Sound wave indicators - curved lines with animations */}
          <motion.g animate={animations?.soundWaves || {}}>
            <path
              d="M22,-1 C24,-1 24,-3 22,-3"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M23,-5 C26,-5 26,-7 23,-7"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M24,-9 C28,-9 28,-11 24,-11"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </motion.g>
          
          {/* Left eye arcs - exactly as in reference */}
          <path
            d="M-12,-3 C-10,-1 -8,-1 -6,-3"
            fill="none"
            stroke="#000000"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M-12,-7 C-10,-5 -8,-5 -6,-7"
            fill="none"
            stroke="#000000"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M-12,-11 C-10,-9 -8,-9 -6,-11"
            fill="none"
            stroke="#000000"
            strokeWidth="2"
            strokeLinecap="round"
          />
          
          {/* Right eye arcs - exactly as in reference */}
          <path
            d="M2,-3 C4,-1 6,-1 8,-3"
            fill="none"
            stroke="#000000"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M2,-7 C4,-5 6,-5 8,-7"
            fill="none"
            stroke="#000000"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M2,-11 C4,-9 6,-9 8,-11"
            fill="none"
            stroke="#000000"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </motion.g>
      </motion.svg>
    </div>
  );
}