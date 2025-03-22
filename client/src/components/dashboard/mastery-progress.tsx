import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMicroInteractions } from '@/hooks/use-micro-interactions';
import { DECA_CATEGORIES, PI_CATEGORIES } from '@shared/schema';
import { ProgressRing } from '@/components/ui/progress-ring';

interface CategoryProgress {
  category: string;
  completed: number;
  total: number;
}

interface MasteryProgressProps {
  data: CategoryProgress[];
  className?: string;
}

export default function MasteryProgress({
  data,
  className,
}: MasteryProgressProps) {
  const isMobile = useIsMobile();
  const { triggerAnimation } = useMicroInteractions();
  
  // Fallback if no data or empty data
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Mastery Progress</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[200px]">
          <p className="text-muted-foreground">No mastery data available yet</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate total mastery percentage
  const totalCompleted = data.reduce((sum, item) => sum + item.completed, 0);
  const totalItems = data.reduce((sum, item) => sum + item.total, 0);
  const overallPercentage = totalItems > 0 
    ? Math.round((totalCompleted / totalItems) * 100) 
    : 0;

  // Sort data by completion percentage (highest to lowest)
  const sortedData = [...data].sort((a, b) => {
    const percentA = a.total > 0 ? (a.completed / a.total) : 0;
    const percentB = b.total > 0 ? (b.completed / b.total) : 0;
    return percentB - percentA;
  });

  // Handle animation completion
  const handleProgressComplete = (category: string, percentage: number) => {
    // If category is 100% complete and triggerAnimation exists, trigger celebration
    if (percentage === 100) {
      triggerAnimation('stars', `${category} Mastery Complete!`);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Mastery Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Overall progress */}
          <div className="col-span-1 md:col-span-4 flex flex-col items-center justify-center mb-4">
            <ProgressRing
              progress={overallPercentage}
              radius={isMobile ? 60 : 80}
              stroke={8}
              className="mb-2"
            >
              <text 
                x="50%" 
                y="50%" 
                textAnchor="middle" 
                dominantBaseline="middle"
                className="text-xl font-bold"
              >
                {overallPercentage}%
              </text>
            </ProgressRing>
            <p className="text-center text-muted-foreground mt-2">
              Overall Mastery
            </p>
          </div>

          {/* Category progress bars */}
          <div className="col-span-1 md:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedData.map((item, index) => {
              const percentage = item.total > 0 
                ? Math.round((item.completed / item.total) * 100) 
                : 0;
              
              return (
                <div key={item.category} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{item.category}</span>
                    <span>{item.completed}/{item.total}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ 
                        duration: 0.8, 
                        delay: index * 0.1,
                        ease: "easeOut" 
                      }}
                      onAnimationComplete={() => handleProgressComplete(item.category, percentage)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}