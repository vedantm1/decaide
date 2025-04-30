import React from 'react';
import { motion } from 'framer-motion';

export interface UnderwaterBackgroundProps {
  className?: string;
}

const UnderwaterBackground: React.FC<UnderwaterBackgroundProps> = ({ className }) => {
  return (
    <div className={`fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-[-1] ${className || ''}`}>
      <motion.div 
        className="w-full h-full relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-400 to-blue-700" />
        
        {/* Animated bubbles using CSS */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-white/30 animate-float"
              style={{
                width: `${Math.random() * 20 + 5}px`,
                height: `${Math.random() * 20 + 5}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100 + 100}%`,
                animationDuration: `${Math.random() * 10 + 5}s`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
        
        {/* Diego the dolphin simplified representation */}
        <div className="absolute flex items-center justify-center w-full h-full pointer-events-none">
          <motion.div 
            className="relative"
            animate={{
              y: [0, 20, 0],
              x: [0, 30, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-32 h-16 bg-[#1AB7EA] rounded-full relative">
              {/* Diego's head */}
              <div className="absolute w-12 h-12 bg-[#1AB7EA] rounded-full -right-4 top-0" />
              
              {/* Diego's snout */}
              <div className="absolute w-6 h-8 bg-[#7BE3F4] rounded-full -right-8 top-2 transform rotate-45" />
              
              {/* Diego's eye */}
              <div className="absolute w-3 h-3 bg-white rounded-full -right-2 top-2">
                <div className="absolute w-1.5 h-1.5 bg-black rounded-full top-0.5 right-0.5" />
              </div>
              
              {/* Diego's fin */}
              <motion.div 
                className="absolute w-8 h-10 bg-[#7BE3F4] rounded-full top-0 left-10 -rotate-45 origin-bottom"
                animate={{ rotate: [-45, -55, -45] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              
              {/* Diego's tail */}
              <motion.div 
                className="absolute w-8 h-12 bg-[#1AB7EA] rounded-b-full -left-6 top-2 origin-top"
                animate={{ rotate: [-10, 10, -10] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              
              {/* Diego's belly */}
              <div className="absolute w-24 h-10 bg-[#7BE3F4] rounded-full top-3 left-3 -z-10" />
            </div>
          </motion.div>
        </div>
        
        {/* Swimming fish */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 10 }).map((_, i) => {
            const size = Math.random() * 20 + 10;
            const isRightToLeft = i % 2 === 0;
            const topPosition = Math.random() * 70 + 10;
            
            return (
              <motion.div 
                key={i}
                className="absolute"
                style={{
                  top: `${topPosition}%`,
                  left: isRightToLeft ? '100%' : '-5%',
                  width: `${size}px`,
                  height: `${size / 2}px`,
                }}
                animate={{
                  x: isRightToLeft ? [0, -2000] : [0, 2000],
                  y: [0, Math.random() > 0.5 ? 20 : -20, 0],
                }}
                transition={{
                  x: { 
                    duration: 15 + (Math.random() * 20), 
                    repeat: Infinity, 
                    ease: "linear",
                  },
                  y: {
                    duration: 2 + Math.random() * 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }
                }}
              >
                <div 
                  className={`w-full h-full rounded-r-full flex items-center ${
                    isRightToLeft ? 'flex-row-reverse scale-x-[-1]' : 'flex-row'
                  }`}
                  style={{
                    backgroundColor: [
                      '#FFD700', '#FF6347', '#1E90FF', '#FF69B4', '#9370DB',
                      '#20B2AA', '#FF8C00', '#7CFC00', '#FF4500', '#9932CC'
                    ][i % 10]
                  }}
                >
                  <div className="h-full w-1/4 bg-transparent" />
                  <motion.div 
                    className="h-full w-1/4"
                    style={{
                      backgroundColor: [
                        '#FFD700', '#FF6347', '#1E90FF', '#FF69B4', '#9370DB',
                        '#20B2AA', '#FF8C00', '#7CFC00', '#FF4500', '#9932CC'
                      ][i % 10],
                      transformOrigin: isRightToLeft ? 'left center' : 'right center'
                    }}
                    animate={{ rotate: [0, 15, 0, -15, 0] }}
                    transition={{ 
                      duration: 0.5 + Math.random() * 0.5, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <div className="h-1/2 w-1/8 rounded-full bg-white absolute" 
                    style={{
                      left: isRightToLeft ? '75%' : '25%',
                      top: '25%',
                      width: `${size / 6}px`,
                      height: `${size / 6}px`,
                    }}
                  >
                    <div 
                      className="h-1/2 w-1/2 rounded-full bg-black absolute"
                      style={{
                        left: isRightToLeft ? '25%' : '25%',
                        top: '25%',
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Seaweed */}
        <div className="absolute bottom-0 left-0 w-full h-1/4 flex items-end justify-around">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div 
              key={i}
              className="w-4 bg-green-500 rounded-t-full origin-bottom"
              style={{ height: `${Math.random() * 100 + 50}px` }}
              animate={{ rotate: [i % 2 === 0 ? -5 : 5, i % 2 === 0 ? 5 : -5] }}
              transition={{ duration: 2 + Math.random(), repeat: Infinity, repeatType: "reverse" }}
            />
          ))}
        </div>
        
        {/* Coral formations */}
        <div className="absolute bottom-8 left-0 w-full flex items-end justify-around">
          {Array.from({ length: 5 }).map((_, i) => (
            <div 
              key={i}
              className="relative"
              style={{ 
                height: `${Math.random() * 40 + 30}px`,
                width: `${Math.random() * 60 + 40}px`,
                marginLeft: i % 2 === 0 ? '-20px' : '20px'
              }}
            >
              <div 
                className="absolute bottom-0 w-full h-full rounded-t-3xl"
                style={{ 
                  backgroundColor: [
                    '#FF6B6B', '#48CFAD', '#FFCE54', '#FC8EAC', '#AC92EC'
                  ][i % 5],
                  clipPath: "polygon(0% 100%, 33% 40%, 66% 60%, 100% 20%, 100% 100%)"
                }}
              />
            </div>
          ))}
        </div>
        
        {/* Ocean floor */}
        <div className="absolute bottom-0 w-full h-8 bg-amber-200" />
      </motion.div>
    </div>
  );
};

export default UnderwaterBackground;