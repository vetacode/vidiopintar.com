"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Achievement, AchievementLevel } from "@/lib/achievements";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface AchievementCelebrationProps {
  achievement: Achievement;
  level: AchievementLevel;
  onClose: () => void;
}

export function AchievementCelebration({ 
  achievement, 
  level, 
  onClose 
}: AchievementCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = achievement.icon;

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getLevelColor = () => {
    switch (level) {
      case 'gold': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'silver': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'bronze': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getLevelText = () => {
    switch (level) {
      case 'gold': return 'Gold';
      case 'silver': return 'Silver';
      case 'bronze': return 'Bronze';
      default: return '';
    }
  };

  return (
    <div className={cn(
      "fixed inset-0 flex items-center justify-center z-50 bg-black/50 transition-opacity duration-300",
      isVisible ? "opacity-100" : "opacity-0"
    )}>
      <div className={cn(
        "bg-white dark:bg-gray-800 rounded-lg p-8 shadow-2xl max-w-sm mx-4 text-center transition-all duration-500",
        isVisible ? "scale-100 rotate-0" : "scale-95 rotate-3"
      )}>
        {/* Celebration particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <Sparkles
              key={i}
              className={cn(
                "absolute w-4 h-4 text-yellow-400 animate-ping",
                i % 2 === 0 ? "animate-bounce" : "animate-pulse"
              )}
              style={{
                top: `${20 + (i * 10)}%`,
                left: `${10 + (i * 10)}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>

        <div className="relative">
          {/* Achievement icon */}
          <div className={cn(
            "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center animate-bounce",
            getLevelColor()
          )}>
            <Icon className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold mb-2">Achievement Unlocked!</h2>
          
          <div className="space-y-2">
            <Badge variant="secondary" className="text-lg px-4 py-1">
              {getLevelText()} {achievement.title}
            </Badge>
            
            <p className="text-gray-600 dark:text-gray-400">
              {achievement.description}
            </p>
          </div>

          <div className="mt-6 text-4xl animate-bounce">
            🎉
          </div>
        </div>
      </div>
    </div>
  );
}