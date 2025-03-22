import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  count: number;
  total?: number;
  icon: string;
  color: "primary" | "secondary" | "accent";
  percentage: number;
  isLoading?: boolean;
}

export default function StatsCard({ 
  title, 
  count, 
  total, 
  icon, 
  color, 
  percentage, 
  isLoading = false 
}: StatsCardProps) {
  // Map color to Tailwind classes
  const colorMap = {
    primary: {
      bg: "bg-primary-100",
      text: "text-primary-600",
      bar: "bg-primary"
    },
    secondary: {
      bg: "bg-secondary-100",
      text: "text-secondary-600",
      bar: "bg-secondary"
    },
    accent: {
      bg: "bg-accent-100",
      text: "text-accent-600",
      bar: "bg-accent"
    }
  };
  
  const classes = colorMap[color];
  
  return (
    <motion.div 
      className="bg-white p-5 rounded-xl border border-slate-200"
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${classes.bg} rounded-lg flex items-center justify-center`}>
          <i className={`fas ${icon} ${classes.text} text-xl`}></i>
        </div>
        <div>
          <h3 className="text-slate-800 font-medium">{title}</h3>
          {isLoading ? (
            <div className="h-8 w-32 bg-slate-100 animate-pulse rounded mt-1"></div>
          ) : (
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {count} {total ? <span className="text-sm text-slate-500 font-normal">of {total}</span> : <span className="text-sm text-slate-500 font-normal">completed</span>}
            </p>
          )}
        </div>
      </div>
      <div className="mt-3 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        {isLoading ? (
          <div className="h-full bg-slate-200 animate-pulse"></div>
        ) : (
          <motion.div 
            className={`h-full ${classes.bar} rounded-full`} 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          ></motion.div>
        )}
      </div>
    </motion.div>
  );
}
