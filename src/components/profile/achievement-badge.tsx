"use client";

import { cn } from "@/lib/utils";
import { Achievement, UserAchievement, AchievementLevel } from "@/lib/achievements";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface AchievementBadgeProps {
  achievement: Achievement;
  userAchievement: UserAchievement;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function AchievementBadge({ 
  achievement, 
  userAchievement, 
  showProgress = true,
  size = 'md' 
}: AchievementBadgeProps) {
  const { level, progress, maxProgress, nextThreshold } = userAchievement;
  const Icon = achievement.icon;
  
  const getLevelStyle = (level: AchievementLevel) => {
    switch (level) {
      case 'gold':
        return achievement.colorScheme.gold;
      case 'silver':
        return achievement.colorScheme.silver;
      case 'bronze':
        return achievement.colorScheme.bronze;
      default:
        return 'text-gray-400 bg-gray-50 border-gray-200';
    }
  };

  const getLevelText = (level: AchievementLevel) => {
    switch (level) {
      case 'gold': return 'Gold';
      case 'silver': return 'Silver';
      case 'bronze': return 'Bronze';
      default: return 'Locked';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-3',
          icon: 'h-4 w-4',
          title: 'text-sm font-medium',
          description: 'text-xs text-gray-600 dark:text-gray-400',
          progress: 'text-xs'
        };
      case 'lg':
        return {
          container: 'p-6',
          icon: 'h-8 w-8',
          title: 'text-lg font-semibold',
          description: 'text-sm text-gray-600 dark:text-gray-400',
          progress: 'text-sm'
        };
      default:
        return {
          container: 'p-4',
          icon: 'h-6 w-6',
          title: 'text-base font-medium',
          description: 'text-sm text-gray-600 dark:text-gray-400',
          progress: 'text-sm'
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const progressPercentage = (progress / maxProgress) * 100;

  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-lg border transition-all duration-300 hover:shadow-lg hover:scale-105 group",
      getLevelStyle(level),
      sizeClasses.container,
      level !== 'none' && "ring-1 ring-opacity-25",
      level === 'gold' && "ring-yellow-300",
      level === 'silver' && "ring-gray-300", 
      level === 'bronze' && "ring-amber-300"
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "rounded-full p-2 flex items-center justify-center transition-transform duration-200 group-hover:rotate-12",
          level === 'none' ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white/50'
        )}>
          <Icon className={cn(
            sizeClasses.icon, 
            level === 'none' ? 'text-gray-400' : '',
            level === 'gold' && 'animate-pulse'
          )} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={cn(sizeClasses.title)}>{achievement.title}</h3>
            {level !== 'none' && (
              <Badge variant="secondary" className="text-xs">
                {getLevelText(level)}
              </Badge>
            )}
          </div>
          
          <p className={cn(sizeClasses.description, "mt-1")}>
            {achievement.description}
          </p>
          
          {showProgress && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className={cn(sizeClasses.progress, "text-gray-600 dark:text-gray-400")}>
                  {progress} / {maxProgress} {achievement.unit}
                </span>
                <span className={cn(sizeClasses.progress, "font-medium")}>
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              
              <Progress 
                value={progressPercentage} 
                className="h-2"
              />
              
              {nextThreshold && (
                <p className={cn(sizeClasses.progress, "text-gray-500 dark:text-gray-500")}>
                  {nextThreshold - progress} more to reach {getLevelText(level === 'bronze' ? 'silver' : 'gold')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}