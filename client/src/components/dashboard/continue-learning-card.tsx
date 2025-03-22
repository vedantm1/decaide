import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ContinueLearningCardProps {
  item: {
    id: string;
    type: "roleplay" | "written" | "pi" | string;
    title: string;
    description: string;
    progress?: number;
    category: string;
  };
}

export default function ContinueLearningCard({ item }: ContinueLearningCardProps) {
  // Get icon and colors based on item type
  const getItemStyles = (type: string) => {
    switch (type) {
      case "roleplay":
        return {
          bgColor: "bg-primary-100",
          textColor: "text-primary-600",
          buttonColor: "bg-primary hover:bg-primary/90",
          icon: "fa-users",
          badge: "bg-primary-100 text-primary-700"
        };
      case "written":
        return {
          bgColor: "bg-secondary-100",
          textColor: "text-secondary-600",
          buttonColor: "bg-secondary hover:bg-secondary/90",
          icon: "fa-file-alt",
          badge: "bg-secondary-100 text-secondary-700"
        };
      case "pi":
        return {
          bgColor: "bg-accent-100",
          textColor: "text-accent-600",
          buttonColor: "bg-accent hover:bg-accent/90",
          icon: "fa-bullseye",
          badge: "bg-accent-100 text-accent-700"
        };
      default:
        return {
          bgColor: "bg-slate-100",
          textColor: "text-slate-600",
          buttonColor: "bg-slate-500 hover:bg-slate-600",
          icon: "fa-graduation-cap",
          badge: "bg-slate-100 text-slate-700"
        };
    }
  };
  
  const styles = getItemStyles(item.type);
  
  // Determine badge text
  const getBadgeText = () => {
    if (item.progress && item.progress > 0) {
      return "In Progress";
    }
    if (item.type === "pi") {
      return "Recommended";
    }
    return "New";
  };

  return (
    <motion.div 
      className="bg-white p-4 rounded-xl border border-slate-200"
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 ${styles.bgColor} rounded-lg flex items-center justify-center`}>
          <i className={`fas ${styles.icon} ${styles.textColor}`}></i>
        </div>
        <span className={`text-xs ${styles.badge} px-2 py-0.5 rounded-full font-medium`}>
          {getBadgeText()}
        </span>
      </div>
      <h3 className="font-medium text-slate-800 mt-3">{item.title}</h3>
      <p className="text-sm text-slate-500 mt-1">{item.description}</p>
      
      {item.progress !== undefined && (
        <>
          <div className="w-full bg-slate-100 h-2 mt-3 rounded-full">
            <motion.div 
              className="bg-primary h-2 rounded-full" 
              initial={{ width: 0 }}
              animate={{ width: `${item.progress * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            ></motion.div>
          </div>
          <div className="mt-3 flex justify-between items-center">
            <span className="text-xs text-slate-500">{Math.round(item.progress * 100)}% complete</span>
            <Button 
              size="sm"
              className={`text-xs ${styles.buttonColor} text-white px-3 py-1.5 rounded-lg font-medium`}
            >
              Continue
            </Button>
          </div>
        </>
      )}
      
      {item.progress === undefined && (
        <div className="mt-3 flex justify-between items-center">
          <span className="text-xs text-slate-500">
            {item.type === "pi" ? `${item.category}` : "New content"}
          </span>
          <Button 
            size="sm"
            className={`text-xs ${styles.buttonColor} text-white px-3 py-1.5 rounded-lg font-medium`}
          >
            Start
          </Button>
        </div>
      )}
    </motion.div>
  );
}
