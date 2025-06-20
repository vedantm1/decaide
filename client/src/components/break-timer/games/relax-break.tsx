import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

// Calming breathing pattern animation
const breathAnimation = {
  inhale: {
    scale: 1.3,
    transition: { 
      duration: 4,
      ease: "easeInOut"
    }
  },
  hold1: {
    scale: 1.3,
    transition: { 
      duration: 2,
      ease: "easeInOut" 
    }
  },
  exhale: {
    scale: 1,
    transition: { 
      duration: 6,
      ease: "easeInOut" 
    }
  },
  hold2: {
    scale: 1,
    transition: { 
      duration: 2,
      ease: "easeInOut" 
    }
  }
};

// Relaxing quotes to display
const quotes = [
  "Breathe in peace, breathe out stress.",
  "Your mind will answer most questions if you learn to relax and wait for the answer.",
  "Taking time to do nothing often brings everything into perspective.",
  "The time to relax is when you don't have time for it.",
  "Rest is not idleness, it is ease of activity.",
  "Your calm mind is the ultimate weapon against your challenges.",
  "Learning to ignore things is one of the great paths to inner peace.",
  "Life isn't as serious as the mind makes it out to be.",
  "Almost everything will work again if you unplug it for a few minutes, including you.",
  "Relaxation is the stepping stone to clarity."
];

export default function RelaxBreak() {
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [phaseText, setPhaseText] = useState('Breathe In');
  const [quote, setQuote] = useState('');
  const [count, setCount] = useState(0);
  
  // Cycle through breathing phases
  useEffect(() => {
    const breathingCycle = async () => {
      // Inhale phase
      setBreathPhase('inhale');
      setPhaseText('Breathe In');
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // Hold after inhale
      setBreathPhase('hold1');
      setPhaseText('Hold');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Exhale phase
      setBreathPhase('exhale');
      setPhaseText('Breathe Out');
      await new Promise(resolve => setTimeout(resolve, 6000));
      
      // Hold after exhale
      setBreathPhase('hold2');
      setPhaseText('Hold');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update count to trigger next cycle
      setCount(prev => prev + 1);
    };
    
    breathingCycle();
  }, [count]);
  
  // Set a random quote
  useEffect(() => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
    
    // Change quote every 30 seconds
    const interval = setInterval(() => {
      const newQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setQuote(newQuote);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/10">
      <Card className="max-w-md w-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-none shadow-lg">
        <CardContent className="p-6 flex flex-col items-center justify-center">
          <h3 className="text-xl font-medium text-center mb-8">Simple Breathing Exercise</h3>
          
          <div className="relative w-full flex flex-col items-center justify-center py-8">
            {/* Breathing circle animation */}
            <motion.div
              animate={breathPhase}
              variants={breathAnimation}
              className="w-40 h-40 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center"
            >
              <motion.div
                animate={breathPhase}
                variants={breathAnimation}
                className="w-32 h-32 bg-blue-200 dark:bg-blue-800/30 rounded-full flex items-center justify-center"
              >
                <motion.div
                  animate={breathPhase}
                  variants={breathAnimation}
                  className="w-24 h-24 bg-blue-300 dark:bg-blue-700/30 rounded-full flex items-center justify-center"
                >
                  <motion.div
                    className="text-lg font-medium"
                    animate={{ 
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 3,
                    }}
                  >
                    {phaseText}
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
            
            {/* Instructions */}
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Focus on your breathing. <br />
              Breathe in for 4 seconds, hold for 2, <br />
              exhale for 6 seconds, and hold for 2.
            </p>
          </div>
          
          {/* Relaxing quote */}
          <motion.div
            className="mt-6 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <p className="text-sm italic">"{quote}"</p>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}