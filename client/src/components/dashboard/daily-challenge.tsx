import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface DailyChallengeProps {
  challenge: {
    id: string;
    title: string;
    description: string;
    points: number;
    category: string;
    completed: boolean;
  };
}

export default function DailyChallenge({ challenge }: DailyChallengeProps) {
  return (
    <div className="mt-6 bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-5 text-white shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-medium bg-white rounded-full px-2.5 py-1 text-primary-700">DAILY CHALLENGE</span>
          <h3 className="text-lg font-bold mt-3 font-heading text-black">{challenge.title}</h3>
          <p className="text-black mt-1 text-sm">{challenge.description}</p>
          
          <div className="mt-4 flex gap-3">
            <Button 
              className="bg-white text-primary-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/90 transition duration-200 transform hover:scale-[1.03]"
            >
              Start Now
            </Button>
            <Button 
              variant="ghost"
              className="bg-primary-700/30 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700/50 transition duration-200 transform hover:scale-[1.03]"
            >
              Details
            </Button>
          </div>
        </div>
        
        <motion.div 
          className="flex items-center justify-center bg-white/10 p-4 rounded-xl"
          animate={{ y: [0, -10, 0] }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut"
          }}
        >
          <svg width="80" height="80" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="20" fill="#FFFFFF" fillOpacity="0.9"/>
            <path d="M16,16 Q24,10 32,16 L32,30 Q24,36 16,30 Z" fill="#3B82F6"/>
            <circle cx="21" cy="22" r="2" fill="white"/>
            <circle cx="27" cy="22" r="2" fill="white"/>
            <path d="M20,27 Q24,30 28,27" stroke="white" strokeWidth="1.5" fill="none"/>
          </svg>
        </motion.div>
      </div>
    </div>
  );
}
