import { motion } from "framer-motion";

interface ActivityItemProps {
  activity: {
    id: string;
    type: "roleplay" | "test" | "pi";
    title: string;
    description: string;
    score?: number;
    points?: number;
    date: string;
  };
}

export default function ActivityItem({ activity }: ActivityItemProps) {
  // Get icon and colors based on activity type
  const getActivityStyles = (type: string) => {
    switch (type) {
      case "roleplay":
        return {
          bgColor: "bg-green-100",
          textColor: "text-green-500",
          icon: "fa-check"
        };
      case "test":
        return {
          bgColor: "bg-blue-100",
          textColor: "text-blue-500",
          icon: "fa-clipboard-list"
        };
      case "pi":
        return {
          bgColor: "bg-accent-100",
          textColor: "text-accent-500",
          icon: "fa-star"
        };
      default:
        return {
          bgColor: "bg-slate-100",
          textColor: "text-slate-500",
          icon: "fa-clipboard-check"
        };
    }
  };
  
  const styles = getActivityStyles(activity.type);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // If yesterday, show "Yesterday"
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise show date
    return `${date.toLocaleDateString()}, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <motion.div 
      className="p-4 hover:bg-slate-50"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ backgroundColor: "rgb(248 250 252)" }}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 ${styles.bgColor} rounded-lg flex items-center justify-center flex-shrink-0 mt-1`}>
          <i className={`fas ${styles.icon} ${styles.textColor}`}></i>
        </div>
        <div className="flex-1">
          <h4 className="text-slate-800 font-medium">{activity.title}</h4>
          <p className="text-slate-500 text-sm mt-1">{activity.description}</p>
          <div className="flex items-center gap-2 mt-2">
            {activity.score !== undefined && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">
                Score: {activity.score}%
              </span>
            )}
            {activity.points !== undefined && (
              <span className="text-xs bg-accent-100 text-accent-700 px-2 py-0.5 rounded font-medium">
                +{activity.points} Points
              </span>
            )}
            <span className="text-xs text-slate-400">{formatDate(activity.date)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
