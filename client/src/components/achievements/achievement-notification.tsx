import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useNotifications } from '@/components/notifications/notification-provider';
import { Award, Trophy, Star, Target, Zap, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  earnedAt: Date;
}

export function AchievementNotificationManager() {
  const { addNotification } = useNotifications();
  
  // Poll for new achievements
  const { data: newAchievements } = useQuery({
    queryKey: ['/api/user/achievements/new'],
    refetchInterval: 30000, // Check every 30 seconds
    enabled: true
  });

  useEffect(() => {
    if (newAchievements && newAchievements.length > 0) {
      newAchievements.forEach((achievement: Achievement, index: number) => {
        setTimeout(() => {
          showAchievementNotification(achievement);
          markAchievementAsDisplayed(achievement.id);
        }, index * 1000); // Stagger notifications by 1 second
      });
    }
  }, [newAchievements]);

  const markAchievementAsDisplayed = async (achievementId: number) => {
    try {
      await fetch(`/api/user/achievements/${achievementId}/displayed`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Failed to mark achievement as displayed:', error);
    }
  };

  const showAchievementNotification = (achievement: Achievement) => {
    // Trigger confetti for gold and platinum achievements
    if (achievement.tier === 'gold' || achievement.tier === 'platinum') {
      confetti({
        particleCount: achievement.tier === 'platinum' ? 200 : 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: achievement.tier === 'platinum' 
          ? ['#8B5CF6', '#7C3AED', '#6D28D9'] 
          : ['#FCD34D', '#F59E0B', '#D97706']
      });
    }

    const tierIcons = {
      bronze: <Award className="h-5 w-5 text-orange-600" />,
      silver: <Award className="h-5 w-5 text-gray-400" />,
      gold: <Trophy className="h-5 w-5 text-yellow-500" />,
      platinum: <Star className="h-5 w-5 text-purple-500" />
    };

    const tierColors = {
      bronze: 'from-orange-500 to-orange-600',
      silver: 'from-gray-400 to-gray-500',
      gold: 'from-yellow-400 to-yellow-600',
      platinum: 'from-purple-500 to-purple-700'
    };

    addNotification({
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: (
        <div className="space-y-2">
          <p className="font-semibold">{achievement.name}</p>
          <p className="text-sm opacity-90">{achievement.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${tierColors[achievement.tier]} text-white`}>
              {achievement.tier.toUpperCase()}
            </span>
            <span className="text-sm font-medium">+{achievement.points} points</span>
          </div>
        </div>
      ),
      icon: tierIcons[achievement.tier],
      duration: 8000,
      persistent: achievement.tier === 'gold' || achievement.tier === 'platinum',
      action: {
        label: 'View All',
        onClick: () => window.location.href = '/achievements'
      }
    });
  };

  return null; // This is a manager component, no visual output
}

// Achievement display component for the achievements page
export function AchievementCard({ achievement }: { achievement: Achievement }) {
  const categoryIcons = {
    'Performance': <TrendingUp className="h-5 w-5" />,
    'Consistency': <Target className="h-5 w-5" />,
    'Mastery': <Zap className="h-5 w-5" />,
    'Special': <Star className="h-5 w-5" />
  };

  const tierColors = {
    bronze: 'border-orange-500 bg-orange-50',
    silver: 'border-gray-400 bg-gray-50',
    gold: 'border-yellow-500 bg-yellow-50',
    platinum: 'border-purple-500 bg-purple-50'
  };

  const tierTextColors = {
    bronze: 'text-orange-700',
    silver: 'text-gray-700',
    gold: 'text-yellow-700',
    platinum: 'text-purple-700'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`
        relative p-4 rounded-lg border-2 transition-all
        ${tierColors[achievement.tier]}
      `}
    >
      {/* Shine effect for gold and platinum */}
      {(achievement.tier === 'gold' || achievement.tier === 'platinum') && (
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shine" />
        </div>
      )}
      
      <div className="relative flex items-start gap-3">
        <div className={`p-2 rounded-full ${tierTextColors[achievement.tier]} bg-white/50`}>
          {categoryIcons[achievement.category as keyof typeof categoryIcons] || <Award className="h-5 w-5" />}
        </div>
        
        <div className="flex-1">
          <h3 className={`font-semibold ${tierTextColors[achievement.tier]}`}>
            {achievement.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {achievement.description}
          </p>
          
          <div className="flex items-center gap-3 mt-3">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${tierTextColors[achievement.tier]} bg-white/70`}>
              {achievement.tier.toUpperCase()}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              +{achievement.points} points
            </span>
            {achievement.earnedAt && (
              <span className="text-xs text-muted-foreground">
                {new Date(achievement.earnedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Achievement progress tracker
export function AchievementProgress({ userId }: { userId: number }) {
  const { data: achievements } = useQuery({
    queryKey: [`/api/user/${userId}/achievements`],
  });

  const { data: allAchievements } = useQuery({
    queryKey: ['/api/achievements'],
  });

  if (!achievements || !allAchievements) return null;

  const earnedCount = achievements.length;
  const totalCount = allAchievements.length;
  const completionPercentage = (earnedCount / totalCount) * 100;

  const tierCounts = achievements.reduce((acc: Record<string, number>, achievement: Achievement) => {
    acc[achievement.tier] = (acc[achievement.tier] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Overall Progress</h3>
          <span className="text-sm text-muted-foreground">
            {earnedCount}/{totalCount} achievements
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="bg-gradient-to-r from-primary to-primary/60 h-full rounded-full"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {(['bronze', 'silver', 'gold', 'platinum'] as const).map((tier) => (
          <div key={tier} className="text-center">
            <div className={`text-2xl font-bold ${
              tier === 'bronze' ? 'text-orange-600' :
              tier === 'silver' ? 'text-gray-500' :
              tier === 'gold' ? 'text-yellow-500' :
              'text-purple-600'
            }`}>
              {tierCounts[tier] || 0}
            </div>
            <div className="text-xs text-muted-foreground capitalize">{tier}</div>
          </div>
        ))}
      </div>
    </div>
  );
}