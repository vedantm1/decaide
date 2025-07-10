import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Award, Target, BookOpen, Users, Zap, Medal } from "lucide-react";
import { cn } from "@/lib/utils";

interface AchievementCardProps {
  achievement: {
    id: number;
    name: string;
    description: string;
    type: string;
    threshold: number;
    points: number;
    tier: number;
    iconName?: string;
    earnedAt?: string;
    progress?: number;
  };
  isEarned?: boolean;
  showProgress?: boolean;
}

// Achievement icon mapping
const iconMap: Record<string, any> = {
  trophy: Trophy,
  star: Star,
  award: Award,
  target: Target,
  book: BookOpen,
  users: Users,
  zap: Zap,
  medal: Medal,
};

// Tier colors
const tierColors = {
  1: { bg: "bg-amber-100", text: "text-amber-700", name: "Bronze" },
  2: { bg: "bg-gray-100", text: "text-gray-700", name: "Silver" },
  3: { bg: "bg-yellow-100", text: "text-yellow-700", name: "Gold" },
};

export function AchievementCard({ achievement, isEarned = false, showProgress = true }: AchievementCardProps) {
  const Icon = iconMap[achievement.iconName || "trophy"] || Trophy;
  const tierColor = tierColors[achievement.tier as keyof typeof tierColors] || tierColors[1];
  const progress = achievement.progress || 0;
  const progressPercentage = Math.min((progress / achievement.threshold) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className={cn(
        "relative",
        !isEarned && "opacity-75"
      )}
    >
      <Card className={cn(
        "overflow-hidden transition-all duration-300",
        isEarned ? "border-primary shadow-lg" : "border-muted"
      )}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Icon Container */}
            <div className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full",
              isEarned ? tierColor.bg : "bg-muted",
              "relative"
            )}>
              <Icon className={cn(
                "h-8 w-8",
                isEarned ? tierColor.text : "text-muted-foreground"
              )} />
              {isEarned && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="absolute -top-1 -right-1"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                    <Star className="h-3 w-3 text-primary-foreground fill-current" />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className={cn(
                  "font-semibold text-lg",
                  !isEarned && "text-muted-foreground"
                )}>
                  {achievement.name}
                </h3>
                <Badge variant={isEarned ? "default" : "secondary"} className="ml-2">
                  {achievement.points} pts
                </Badge>
              </div>

              <p className={cn(
                "text-sm",
                !isEarned ? "text-muted-foreground" : "text-foreground/80"
              )}>
                {achievement.description}
              </p>

              {/* Progress Bar */}
              {showProgress && !isEarned && progress > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{progress} / {achievement.threshold}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              )}

              {/* Earned Date */}
              {isEarned && achievement.earnedAt && (
                <p className="text-xs text-muted-foreground">
                  Earned on {new Date(achievement.earnedAt).toLocaleDateString()}
                </p>
              )}

              {/* Tier Badge */}
              <Badge variant="outline" className={cn(
                "w-fit",
                isEarned && tierColor.text
              )}>
                {tierColor.name} Tier
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}