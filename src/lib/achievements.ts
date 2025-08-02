import { Trophy, Star, Zap, MessageCircle, Calendar, Target, Crown, Flame } from "lucide-react";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: 'engagement' | 'consistency' | 'milestone' | 'special';
  thresholds: {
    bronze: number;
    silver: number;
    gold: number;
  };
  unit: string;
  colorScheme: {
    bronze: string;
    silver: string;
    gold: string;
  };
}

export const achievements: Achievement[] = [
  {
    id: 'video_engager',
    title: 'Video Engager',
    description: 'Videos you\'ve engaged with',
    icon: Zap,
    category: 'engagement',
    thresholds: { bronze: 5, silver: 25, gold: 100 },
    unit: 'videos',
    colorScheme: {
      bronze: 'text-amber-600 bg-amber-50 border-amber-200',
      silver: 'text-gray-600 bg-gray-50 border-gray-200',
      gold: 'text-yellow-600 bg-yellow-50 border-yellow-200'
    }
  },
  {
    id: 'chat_master',
    title: 'Chat Master',
    description: 'Conversations you\'ve had',
    icon: MessageCircle,
    category: 'engagement',
    thresholds: { bronze: 10, silver: 50, gold: 200 },
    unit: 'messages',
    colorScheme: {
      bronze: 'text-amber-600 bg-amber-50 border-amber-200',
      silver: 'text-gray-600 bg-gray-50 border-gray-200',
      gold: 'text-yellow-600 bg-yellow-50 border-yellow-200'
    }
  },
  {
    id: 'consistent_user',
    title: 'Consistent User',
    description: 'Days you\'ve been active',
    icon: Calendar,
    category: 'consistency',
    thresholds: { bronze: 7, silver: 30, gold: 100 },
    unit: 'days',
    colorScheme: {
      bronze: 'text-amber-600 bg-amber-50 border-amber-200',
      silver: 'text-gray-600 bg-gray-50 border-gray-200',
      gold: 'text-yellow-600 bg-yellow-50 border-yellow-200'
    }
  },
  {
    id: 'streak_keeper',
    title: 'Streak Keeper',
    description: 'Active days this week',
    icon: Flame,
    category: 'consistency',
    thresholds: { bronze: 3, silver: 5, gold: 7 },
    unit: 'days',
    colorScheme: {
      bronze: 'text-amber-600 bg-amber-50 border-amber-200',
      silver: 'text-gray-600 bg-gray-50 border-gray-200',
      gold: 'text-yellow-600 bg-yellow-50 border-yellow-200'
    }
  },
  {
    id: 'early_adopter',
    title: 'Early Adopter',
    description: 'Days since joining',
    icon: Star,
    category: 'milestone',
    thresholds: { bronze: 7, silver: 30, gold: 90 },
    unit: 'days',
    colorScheme: {
      bronze: 'text-amber-600 bg-amber-50 border-amber-200',
      silver: 'text-gray-600 bg-gray-50 border-gray-200',
      gold: 'text-yellow-600 bg-yellow-50 border-yellow-200'
    }
  },
  {
    id: 'monthly_champion',
    title: 'Monthly Champion',
    description: 'Videos engaged this month',
    icon: Crown,
    category: 'special',
    thresholds: { bronze: 5, silver: 15, gold: 30 },
    unit: 'videos',
    colorScheme: {
      bronze: 'text-amber-600 bg-amber-50 border-amber-200',
      silver: 'text-gray-600 bg-gray-50 border-gray-200',
      gold: 'text-yellow-600 bg-yellow-50 border-yellow-200'
    }
  }
];

export type AchievementLevel = 'none' | 'bronze' | 'silver' | 'gold';

export interface UserAchievement {
  id: string;
  level: AchievementLevel;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  nextThreshold?: number;
}

export function calculateUserAchievements(stats: {
  videosProcessed: number;
  messagesSent: number;
  activeDays: number;
  accountAge: number;
  weeklyStreak: number;
  thisMonthVideos: number;
}): UserAchievement[] {
  return achievements.map(achievement => {
    let currentValue = 0;
    
    switch (achievement.id) {
      case 'video_engager':
        currentValue = stats.videosProcessed;
        break;
      case 'chat_master':
        currentValue = stats.messagesSent;
        break;
      case 'consistent_user':
        currentValue = stats.activeDays;
        break;
      case 'streak_keeper':
        currentValue = stats.weeklyStreak;
        break;
      case 'early_adopter':
        currentValue = stats.accountAge;
        break;
      case 'monthly_champion':
        currentValue = stats.thisMonthVideos;
        break;
    }

    let level: AchievementLevel = 'none';
    let nextThreshold: number | undefined = achievement.thresholds.bronze;

    if (currentValue >= achievement.thresholds.gold) {
      level = 'gold';
      nextThreshold = undefined;
    } else if (currentValue >= achievement.thresholds.silver) {
      level = 'silver';
      nextThreshold = achievement.thresholds.gold;
    } else if (currentValue >= achievement.thresholds.bronze) {
      level = 'bronze';
      nextThreshold = achievement.thresholds.silver;
    }

    const maxProgress = nextThreshold || achievement.thresholds.gold;
    const progress = Math.min(currentValue, maxProgress);

    return {
      id: achievement.id,
      level,
      progress,
      maxProgress,
      isCompleted: level === 'gold',
      nextThreshold
    };
  });
}

export function getAchievementById(id: string): Achievement | undefined {
  return achievements.find(achievement => achievement.id === id);
}

export function getAchievementStats(userAchievements: UserAchievement[]) {
  const total = achievements.length;
  const completed = userAchievements.filter(ua => ua.isCompleted).length;
  const bronze = userAchievements.filter(ua => ua.level === 'bronze').length;
  const silver = userAchievements.filter(ua => ua.level === 'silver').length;
  const gold = userAchievements.filter(ua => ua.level === 'gold').length;
  
  return {
    total,
    completed,
    bronze,
    silver,
    gold,
    completionRate: Math.round((completed / total) * 100)
  };
}